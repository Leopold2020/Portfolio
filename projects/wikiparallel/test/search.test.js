import { test } from "node:test";
import assert from "node:assert/strict";

import { search } from "../src/search.js";
import { isField } from "../src/fields.js";
import { PAGE_SIZE } from "../src/grouping.js";
import { CHALLENGE, FIXTURE_CORPUS } from "./ranker.fixture.js";

/**
 * A fake in-browser embedder: records every call and returns a fixed Embedding.
 * @param {number[]} [embedding]
 */
function fakeEmbed(embedding = CHALLENGE) {
  /** @type {{ text: string, sawProgress: boolean }[]} */
  const calls = [];
  const impl = async (/** @type {string} */ text, /** @type {any} */ options = {}) => {
    options.onProgress?.({ status: "progress", file: "model.onnx", progress: 100 });
    calls.push({ text, sawProgress: typeof options.onProgress === "function" });
    return embedding;
  };
  return Object.assign(impl, { calls });
}

test("search embeds the Challenge text and ranks the Corpus against it", async () => {
  const embed = fakeEmbed();
  const result = await search("keeping a system stable under load", "Technology", {
    corpus: FIXTURE_CORPUS,
    embed,
  });

  assert.deepEqual(embed.calls.map((c) => c.text), ["keeping a system stable under load"]);
  assert.equal(result.parallels.length, PAGE_SIZE);
  assert.deepEqual(
    result.parallels.map((p) => p.title),
    ["Homeostasis", "Control theory", "Jazz improvisation", "Triage", "Immune system", "Berlin Blockade"],
  );
  assert.equal(result.hasMore, true);
});

test("every returned Parallel has the shape the UI renders", async () => {
  const { parallels } = await search("a hard problem to solve", "Mathematics", {
    corpus: FIXTURE_CORPUS,
    embed: fakeEmbed(),
  });
  for (const p of parallels) {
    assert.ok(p.title.length > 0);
    assert.match(p.url, /^https:\/\/en\.wikipedia\.org\/wiki\//);
    assert.equal(isField(p.field), true);
    assert.ok(p.leadSection.length > 0);
    assert.equal(Number.isInteger(p.closeness), true);
    assert.ok(p.closeness >= 0 && p.closeness <= 100);
  }
});

test("no returned Parallel sits in the Home Field", async () => {
  for (const homeField of ["Science", "History", "Arts"]) {
    const { parallels } = await search("some challenge text here", homeField, {
      corpus: FIXTURE_CORPUS,
      embed: fakeEmbed(),
    });
    assert.equal(parallels.some((p) => p.field === homeField), false);
  }
});

test("a given challengeEmbedding is reused instead of re-embedding", async () => {
  const embed = fakeEmbed();
  const first = await search("challenge text goes here", "Technology", {
    corpus: FIXTURE_CORPUS,
    embed,
  });

  const next = await search("challenge text goes here", "Technology", { corpus: FIXTURE_CORPUS, embed }, {
    offset: PAGE_SIZE,
    challengeEmbedding: first.challengeEmbedding,
  });

  assert.equal(embed.calls.length, 1, "embed was not called again for the next page");
  assert.deepEqual(next.challengeEmbedding, first.challengeEmbedding);
  assert.deepEqual(next.parallels.map((p) => p.title), [
    "Queueing theory",
    "Call and response",
    "Ecological resilience",
    "Percolation theory",
    "Chiaroscuro",
    "Roman dictator",
  ]);
});

test("onProgress is forwarded to the embedder", async () => {
  const embed = fakeEmbed();
  await search("challenge text goes here", "Technology", { corpus: FIXTURE_CORPUS, embed }, {
    onProgress: () => {},
  });
  assert.equal(embed.calls[0]?.sawProgress, true);
});

test("paging by offset eventually exhausts the Corpus", async () => {
  const embed = fakeEmbed();
  const seen = new Set();
  let offset = 0;
  let embedding;
  for (;;) {
    const result = await search("challenge text goes here", "Technology", { corpus: FIXTURE_CORPUS, embed }, {
      offset,
      challengeEmbedding: embedding,
    });
    embedding = result.challengeEmbedding;
    for (const p of result.parallels) seen.add(p.title);
    if (!result.hasMore) break;
    offset += PAGE_SIZE;
  }
  assert.equal(seen.size, 13, "every non-Home candidate returned exactly once");
});
