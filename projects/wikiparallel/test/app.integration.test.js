import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

import { FIELDS, fieldsFromCorpus } from "../src/fields.js";
import { PAGE_SIZE } from "../src/grouping.js";
import { initApp } from "../src/app.js";
import { CorpusMissingError } from "../src/corpus.js";
import { CHALLENGE, FIXTURE_CORPUS } from "./ranker.fixture.js";

const html = await readFile(fileURLToPath(new URL("../index.html", import.meta.url)), "utf8");

/**
 * Load index.html into jsdom and wire {@link initApp} against it with fakes for
 * the two seams that reach the network: the Corpus loader and the in-browser
 * embedder.
 *
 * @param {object} [opts]
 * @param {() => Promise<any[]>} [opts.loadCorpus]
 * @param {(text: string, options?: any) => Promise<number[]>} [opts.embed]
 */
async function bootApp(opts = {}) {
  const dom = new JSDOM(html, { url: "https://example.test/" });
  const { window } = dom;
  // render.js reaches for a global `document`; app.js takes one by injection.
  Object.assign(/** @type {any} */ (globalThis), {
    document: window.document,
    DocumentFragment: window.DocumentFragment,
  });

  /** @type {string[]} */
  const embedCalls = [];
  const embed =
    opts.embed ??
    (async (/** @type {string} */ text) => {
      embedCalls.push(text);
      return CHALLENGE;
    });

  const app = initApp({
    document: window.document,
    loadCorpus: opts.loadCorpus ?? (async () => FIXTURE_CORPUS.map((a) => ({ ...a }))),
    embed,
  });
  await app.corpusLoaded;

  return { window, app, embedCalls };
}

/** @type {import("jsdom").DOMWindow} */
let window;
/** @type {import("../src/app.js").AppHandle} */
let app;
/** @type {string[]} */
let embedCalls;

beforeEach(async () => {
  ({ window, app, embedCalls } = await bootApp());
});

const $ = (/** @type {string} */ sel) => {
  const el = window.document.querySelector(sel);
  assert.ok(el, `missing ${sel}`);
  return el;
};

const typeChallenge = (/** @type {string} */ text) => {
  const input = /** @type {HTMLTextAreaElement} */ ($("#challenge"));
  input.value = text;
  input.dispatchEvent(new window.Event("input"));
};

const pickHomeField = (/** @type {string} */ field) => {
  const select = /** @type {HTMLSelectElement} */ ($("#home-field"));
  select.value = field;
  select.dispatchEvent(new window.Event("change"));
};

const submit = () => $("#search-form").dispatchEvent(new window.Event("submit"));

/** Let queued microtasks and the embed promise executor run. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Run a search and wait for the async pipeline to settle. */
const runSearch = async (/** @type {string} */ challenge, /** @type {string} */ homeField) => {
  typeChallenge(challenge);
  pickHomeField(homeField);
  submit();
  await app.idle();
};

test("the Home Field dropdown lists the Corpus's Fields; the button starts disabled", () => {
  const options = [...$("#home-field").querySelectorAll("option")]
    .map((o) => o.value)
    .filter(Boolean);
  assert.deepEqual(options, fieldsFromCorpus(FIXTURE_CORPUS));
  assert.equal(/** @type {HTMLButtonElement} */ ($("#search-button")).disabled, true);
  assert.ok($("#challenge"));
});

test("before the Corpus loads, the dropdown shows the fallback Field list", () => {
  const dom = new JSDOM(html, { url: "https://example.test/" });
  Object.assign(/** @type {any} */ (globalThis), {
    document: dom.window.document,
    DocumentFragment: dom.window.DocumentFragment,
  });
  // A Corpus load that never settles: the shell must still be usable.
  initApp({ document: dom.window.document, loadCorpus: () => new Promise(() => {}), embed: async () => CHALLENGE });
  const options = [...dom.window.document.querySelectorAll("#home-field option")]
    .map((o) => /** @type {HTMLOptionElement} */ (o).value)
    .filter(Boolean);
  assert.deepEqual(options, [...FIELDS]);
});

test("the button enables only with >=3 words and a Home Field", () => {
  const button = /** @type {HTMLButtonElement} */ ($("#search-button"));

  typeChallenge("two words");
  assert.equal(button.disabled, true);

  typeChallenge("three whole words");
  assert.equal(button.disabled, true, "still no Home Field");

  pickHomeField("Technology");
  assert.equal(button.disabled, false);

  typeChallenge("   ");
  assert.equal(button.disabled, true);
});

test("a search renders a page of real Parallels grouped by Field, none in the Home Field", async () => {
  await runSearch("handling a sudden surge of users", "Technology");

  const groups = [...window.document.querySelectorAll(".field-group")];
  assert.ok(groups.length >= 2, "expected several Field groups");
  assert.equal(window.document.querySelectorAll(".parallel").length, PAGE_SIZE);

  const headings = groups.map((g) => g.querySelector(".field-group__heading")?.textContent);
  assert.equal(headings.includes("Technology"), false);

  const firstGroup = groups[0];
  assert.ok(firstGroup);
  const closeness = [...firstGroup.querySelectorAll(".parallel__closeness")].map((el) =>
    Number(el.textContent?.replace(/\D/g, "")),
  );
  assert.deepEqual(closeness, [...closeness].sort((a, b) => b - a));

  const firstCard = window.document.querySelector(".parallel");
  assert.ok(firstCard);
  assert.match(
    firstCard.querySelector(".parallel__title a")?.getAttribute("href") ?? "",
    /wikipedia\.org/,
  );
  assert.ok((firstCard.querySelector(".parallel__lead")?.textContent ?? "").length > 0);
});

test("the Challenge reaches the in-browser embedder and nothing else", async () => {
  // `fetch` is the only way text could leave the machine; the app must never
  // touch it. Make any call throw.
  const originalFetch = /** @type {any} */ (globalThis).fetch;
  /** @type {any} */ (globalThis).fetch = () => assert.fail("the app must not call fetch");
  try {
    await runSearch("handling a sudden surge of users", "Technology");
    assert.deepEqual(embedCalls, ["handling a sudden surge of users"]);
  } finally {
    /** @type {any} */ (globalThis).fetch = originalFetch;
  }
});

test("first search shows the model-download progress bar; a later search does not", async () => {
  /** @type {(() => void)[]} */
  const releases = [];
  const slowEmbed = (/** @type {string} */ text, /** @type {any} */ options = {}) =>
    new Promise((resolve) => {
      options.onProgress?.({ status: "progress", file: "model.onnx", progress: 55 });
      releases.push(() => resolve(CHALLENGE));
    });

  ({ window, app } = await bootApp({ embed: slowEmbed }));

  typeChallenge("handling a sudden surge of users");
  pickHomeField("Technology");
  submit();
  await tick(); // let the embed promise executor run

  const status = /** @type {HTMLElement} */ ($("#model-status"));
  const bar = /** @type {HTMLProgressElement} */ ($("#model-status-bar"));
  assert.equal(status.hidden, false, "progress bar is visible while the model downloads");
  assert.equal(bar.value, 55);

  releases.shift()?.();
  await app.idle();
  assert.equal(status.hidden, true, "progress bar is hidden once the model is ready");

  // Second search: the model is ready, so no progress bar this time.
  typeChallenge("a completely different problem statement");
  pickHomeField("Mathematics");
  submit();
  await tick();
  assert.equal(status.hidden, true);
  releases.shift()?.();
  await app.idle();
});

test("'Show 6 more' fetches further Parallels and stops when the Corpus is exhausted", async () => {
  await runSearch("keeping a system stable under load", "Technology");

  const showMore = /** @type {HTMLButtonElement} */ ($("#show-more"));
  // 13 non-Technology candidates in FIXTURE_CORPUS → pages of 6, 6, 1.
  const total = FIXTURE_CORPUS.filter((a) => a.field !== "Technology").length;

  let seen = PAGE_SIZE;
  assert.equal(showMore.hidden, false);

  while (!showMore.hidden) {
    showMore.dispatchEvent(new window.Event("click"));
    await app.idle();
    seen = Math.min(seen + PAGE_SIZE, total);
    assert.equal(window.document.querySelectorAll(".parallel").length, seen);
  }

  assert.equal(seen, total);
  assert.equal(window.document.querySelectorAll(".parallel").length, total);
});

test("'Show 6 more' does not re-embed the Challenge", async () => {
  await runSearch("keeping a system stable under load", "Technology");
  assert.equal(embedCalls.length, 1);

  $("#show-more").dispatchEvent(new window.Event("click"));
  await app.idle();
  assert.equal(embedCalls.length, 1, "the second page reuses the Challenge Embedding");
});

test("a failed second search clears the stale results and hides 'Show 6 more'", async () => {
  let calls = 0;
  const embed = async (/** @type {string} */ text) => {
    calls += 1;
    if (calls === 1) return CHALLENGE;
    throw new Error("embed blew up");
  };
  ({ window, app } = await bootApp({ embed }));

  await runSearch("handling a sudden surge of users", "Technology");
  assert.equal(/** @type {HTMLButtonElement} */ ($("#show-more")).hidden, false);

  await runSearch("a completely different problem statement", "Mathematics");
  assert.equal(window.document.querySelectorAll(".parallel").length, 0);
  assert.equal(/** @type {HTMLButtonElement} */ ($("#show-more")).hidden, true);
  assert.match(/** @type {HTMLElement} */ ($("#parallels")).textContent ?? "", /went wrong/);
});

test("a second Challenge replaces the first set without reload", async () => {
  await runSearch("handling a sudden surge of users", "Technology");
  const first = [...window.document.querySelectorAll(".parallel__title")].map((el) => el.textContent);

  await runSearch("a completely different problem statement", "Health, medicine and disease");
  const second = [...window.document.querySelectorAll(".parallel__title")].map((el) => el.textContent);

  assert.notDeepEqual(first, second);
  assert.equal(window.document.querySelectorAll(".parallel").length, PAGE_SIZE);
  const fields = [...window.document.querySelectorAll(".field-group__heading")].map((h) => h.textContent);
  assert.equal(fields.includes("Health, medicine and disease"), false);
});

const pressEnter = (/** @type {string} */ sel) =>
  $(sel).dispatchEvent(
    new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
  );

test("Enter runs the search from the Challenge box", async () => {
  typeChallenge("handling a sudden surge of users");
  pickHomeField("Technology");
  pressEnter("#challenge");
  await app.idle();
  assert.equal(window.document.querySelectorAll(".parallel").length, PAGE_SIZE);
});

test("Enter runs the search from the Home Field dropdown", async () => {
  typeChallenge("handling a sudden surge of users");
  pickHomeField("Technology");
  pressEnter("#home-field");
  await app.idle();
  assert.equal(window.document.querySelectorAll(".parallel").length, PAGE_SIZE);
});

test("the Challenge is trimmed and length-capped on search", async () => {
  const input = /** @type {HTMLTextAreaElement} */ ($("#challenge"));
  typeChallenge("   surge   of   users   " + "x".repeat(400));
  pickHomeField("Technology");
  submit();
  await app.idle();
  assert.equal(input.value.length <= 300, true);
  assert.equal(input.value.startsWith("surge"), true);
});

test("with corpus.json absent, the app shows an explicit build-the-Corpus message", async () => {
  ({ window, app } = await bootApp({
    loadCorpus: async () => {
      throw new CorpusMissingError("corpus.json is missing. Run `npm run build`.");
    },
  }));

  const region = /** @type {HTMLElement} */ ($("#parallels"));
  assert.match(region.textContent ?? "", /npm run build/);
  assert.equal(/** @type {HTMLButtonElement} */ ($("#search-button")).disabled, true);

  // Even if the person forces a search, it stays a message, not a crash.
  typeChallenge("handling a sudden surge of users");
  pickHomeField("Technology");
  submit();
  await app.idle();
  assert.match(region.textContent ?? "", /npm run build/);
  assert.equal(window.document.querySelectorAll(".parallel").length, 0);
});

test("the CC BY-SA attribution notice is on the page", () => {
  assert.match($(".colophon").textContent ?? "", /CC BY-SA/);
});
