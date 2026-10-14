import { test } from "node:test";
import assert from "node:assert/strict";

import { rankParallels } from "../src/ranker.js";
import { PAGE_SIZE } from "../src/grouping.js";
import {
  CHALLENGE,
  FIXTURE_CORPUS,
  NARROW_CORPUS,
  CLUSTERED_CORPUS,
} from "./ranker.fixture.js";

/** @typedef {import("../src/ranker.js").CorpusArticle} CorpusArticle */
/** @typedef {import("../src/search.js").Parallel} Parallel */

/**
 * Page through a whole ranking the way the UI does — asking for the next
 * `pageSize` Parallels until `hasMore` is false — and return every page.
 * Throws rather than loops forever if `hasMore` never clears.
 * @param {number[]} embedding
 * @param {string} homeField
 * @param {CorpusArticle[]} corpus
 * @param {number} [pageSize]
 * @returns {Parallel[][]}
 */
function pageThrough(embedding, homeField, corpus, pageSize = PAGE_SIZE) {
  /** @type {Parallel[][]} */
  const pages = [];
  for (let offset = 0; offset <= corpus.length; offset += pageSize) {
    const { parallels, hasMore } = rankParallels(embedding, homeField, corpus, {
      pageSize,
      offset,
    });
    pages.push(parallels);
    if (!hasMore) return pages;
  }
  throw new Error("rankParallels never reported the Corpus exhausted");
}

/**
 * @param {Parallel[][]} pages
 * @param {number} i
 * @returns {Parallel[]}
 */
const nth = (pages, i) => {
  const page = pages[i];
  assert.ok(page, `expected a page at index ${i}`);
  return page;
};
const titles = (/** @type {Parallel[]} */ ps) => ps.map((p) => p.title);
const fieldCounts = (/** @type {Parallel[]} */ ps) => {
  /** @type {Map<string, number>} */
  const counts = new Map();
  for (const p of ps) counts.set(p.field, (counts.get(p.field) ?? 0) + 1);
  return counts;
};

test("the first page is the closest Parallels, spread across Fields", () => {
  const { parallels, hasMore } = rankParallels(CHALLENGE, "Technology", FIXTURE_CORPUS);

  assert.deepEqual(titles(parallels), [
    "Homeostasis",
    "Control theory",
    "Jazz improvisation",
    "Triage",
    "Immune system",
    "Berlin Blockade",
  ]);
  assert.equal(hasMore, true);
});

test("no returned Parallel is in the Home Field", () => {
  for (const homeField of ["Technology", "Science", "Arts"]) {
    const pages = pageThrough(CHALLENGE, homeField, FIXTURE_CORPUS);
    for (const p of pages.flat()) {
      assert.notEqual(p.field, homeField, `${p.title} is in the Home Field ${homeField}`);
    }
  }
});

test("no Field appears more than twice on a page", () => {
  const pages = pageThrough(CHALLENGE, "Technology", FIXTURE_CORPUS);
  for (const page of pages) {
    for (const [field, count] of fieldCounts(page)) {
      assert.ok(count <= 2, `${field} appears ${count} times on one page`);
    }
  }
});

test("a full page covers at least four Fields when the Corpus allows it", () => {
  const pages = pageThrough(CHALLENGE, "Technology", FIXTURE_CORPUS);
  for (const page of pages) {
    if (page.length < PAGE_SIZE) continue; // trailing partial page is exempt
    assert.ok(
      fieldCounts(page).size >= 4,
      `a page of ${page.length} covers only ${fieldCounts(page).size} Fields`,
    );
  }
});

test("the spread rule reaches past closer Parallels for a distant Field (ADR 0003)", () => {
  const page1 = rankParallels(CHALLENGE, "Technology", CLUSTERED_CORPUS, { offset: 0 });
  const page2 = rankParallels(CHALLENGE, "Technology", CLUSTERED_CORPUS, { offset: 6 });

  // The six closest candidates are all Science/Mathematics, but the page is
  // still forced to four Fields...
  assert.equal(fieldCounts(page1.parallels).size, 4);
  assert.deepEqual(titles(page1.parallels), [
    "Thermodynamics",
    "Linear algebra",
    "Fluid dynamics",
    "Topology",
    "Cubism",
    "Bronze Age",
  ]);
  // ...pushing the two next-closest same-Field Parallels onto the following page.
  assert.deepEqual(titles(page2.parallels), ["Optics", "Number theory"]);
  assert.equal(page2.hasMore, false);

  assert.deepEqual(
    page1.parallels.map((p) => p.closeness),
    [95, 92, 90, 88, 30, 25],
  );
});

test("Parallels on a page run from most to least close", () => {
  const pages = pageThrough(CHALLENGE, "Technology", FIXTURE_CORPUS);
  for (const page of pages) {
    const closeness = page.map((p) => p.closeness);
    assert.deepEqual(closeness, [...closeness].sort((a, b) => b - a));
  }
  assert.deepEqual(
    nth(pages, 0).map((p) => p.closeness),
    [95, 92, 88, 82, 80, 75],
  );
});

test("offset pagination walks distinct pages and then signals exhaustion", () => {
  const page1 = rankParallels(CHALLENGE, "Technology", FIXTURE_CORPUS, { offset: 0 });
  const page2 = rankParallels(CHALLENGE, "Technology", FIXTURE_CORPUS, { offset: 6 });
  const page3 = rankParallels(CHALLENGE, "Technology", FIXTURE_CORPUS, { offset: 12 });
  const page4 = rankParallels(CHALLENGE, "Technology", FIXTURE_CORPUS, { offset: 18 });

  assert.deepEqual(titles(page2.parallels), [
    "Queueing theory",
    "Call and response",
    "Ecological resilience",
    "Percolation theory",
    "Chiaroscuro",
    "Roman dictator",
  ]);
  assert.deepEqual(titles(page3.parallels), ["Sepsis"]);
  assert.deepEqual(page4.parallels, []);

  assert.equal(page1.hasMore, true);
  assert.equal(page2.hasMore, true);
  assert.equal(page3.hasMore, false);
  assert.equal(page4.hasMore, false);

  const seen = [page1, page2, page3].flatMap((r) => titles(r.parallels));
  assert.equal(seen.length, 13, "every non-Home candidate is returned exactly once");
  assert.equal(new Set(seen).size, 13, "no Parallel is returned on two pages");
});

test("a Corpus with only two non-Home Fields relaxes the spread rule", () => {
  const pages = pageThrough(CHALLENGE, "Science", NARROW_CORPUS);

  assert.deepEqual(titles(nth(pages, 0)), [
    "Queueing theory",
    "Jazz improvisation",
    "Control theory",
    "Collage",
    "Graph theory",
    "Game theory",
  ]);
  // The per-Field cap is relaxed: Mathematics is allowed past twice on a page.
  assert.equal(fieldCounts(nth(pages, 0)).get("Mathematics"), 4);
  assert.deepEqual(titles(nth(pages, 1)), ["Sfumato"]);

  const all = pages.flat();
  assert.equal(all.length, 7);
  assert.equal(new Set(titles(all)).size, 7);
});

test("ordering follows the Challenge Embedding, not the Corpus order", () => {
  // Orthogonal to CHALLENGE: an article's similarity is now sqrt(1 - sim^2),
  // which is largest for the articles that were least close before.
  const { parallels } = rankParallels([0, 1], "Technology", FIXTURE_CORPUS);
  assert.equal(parallels[0]?.title, "Sepsis");
  assert.equal(parallels[0]?.closeness, 94);
});

test("each returned Parallel carries the fields the UI renders", () => {
  const { parallels } = rankParallels(CHALLENGE, "Technology", FIXTURE_CORPUS);
  assert.deepEqual(parallels[0], {
    title: "Homeostasis",
    url: "https://en.wikipedia.org/wiki/Homeostasis",
    field: "Science",
    leadSection: "Lead Section of Homeostasis.",
    closeness: 95,
  });
});

test("options are optional: pageSize defaults and a bare call returns one page", () => {
  const { parallels } = rankParallels(CHALLENGE, "Technology", FIXTURE_CORPUS);
  assert.equal(parallels.length, PAGE_SIZE);
});

test("a custom pageSize changes how many Parallels a page holds", () => {
  const { parallels, hasMore } = rankParallels(CHALLENGE, "Technology", FIXTURE_CORPUS, {
    pageSize: 3,
  });
  assert.equal(parallels.length, 3);
  assert.equal(hasMore, true);
  assert.deepEqual(titles(parallels), ["Homeostasis", "Control theory", "Jazz improvisation"]);
});
