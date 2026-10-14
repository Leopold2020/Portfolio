import { test } from "node:test";
import assert from "node:assert/strict";

import { loadCorpus, CorpusMissingError, CORPUS_URL } from "../src/corpus.js";

/**
 * A minimal `fetch` stand-in returning one JSON response.
 * @param {{ status?: number, ok?: boolean, body?: unknown, throws?: boolean, badJson?: boolean }} opts
 */
function fakeFetch(opts) {
  /** @type {string[]} */
  const calls = [];
  const impl = async (/** @type {string} */ url) => {
    calls.push(url);
    if (opts.throws) throw new TypeError("Failed to fetch");
    const status = opts.status ?? 200;
    return {
      status,
      ok: opts.ok ?? (status >= 200 && status < 300),
      json: async () => {
        if (opts.badJson) throw new SyntaxError("Unexpected token < in JSON");
        return opts.body;
      },
    };
  };
  return Object.assign(impl, { calls });
}

const RECORD = {
  title: "Homeostasis",
  url: "https://en.wikipedia.org/wiki/Homeostasis",
  field: "Science",
  leadText: "Homeostasis is the state of steady internal conditions.",
  embedding: [0.1, 0.2, 0.3],
};

test("loadCorpus fetches corpus.json and adapts leadText to leadSection", async () => {
  const fetchImpl = fakeFetch({ body: [RECORD] });
  const corpus = await loadCorpus(fetchImpl);

  assert.deepEqual(fetchImpl.calls, [CORPUS_URL]);
  assert.deepEqual(corpus, [
    {
      title: "Homeostasis",
      url: "https://en.wikipedia.org/wiki/Homeostasis",
      field: "Science",
      leadSection: "Homeostasis is the state of steady internal conditions.",
      embedding: [0.1, 0.2, 0.3],
    },
  ]);
});

test("a 404 becomes a CorpusMissingError", async () => {
  await assert.rejects(
    () => loadCorpus(fakeFetch({ status: 404 })),
    (error) => error instanceof CorpusMissingError && /npm run build/.test(error.message),
  );
});

test("a failed fetch becomes a CorpusMissingError", async () => {
  await assert.rejects(
    () => loadCorpus(fakeFetch({ throws: true })),
    (error) => error instanceof CorpusMissingError,
  );
});

test("an empty or non-array body becomes a CorpusMissingError", async () => {
  await assert.rejects(() => loadCorpus(fakeFetch({ body: [] })), CorpusMissingError);
  await assert.rejects(() => loadCorpus(fakeFetch({ body: {} })), CorpusMissingError);
});

test("a body that is not valid JSON becomes a CorpusMissingError", async () => {
  await assert.rejects(() => loadCorpus(fakeFetch({ badJson: true })), CorpusMissingError);
});

test("a record missing its embedding becomes a CorpusMissingError, naming the index", async () => {
  const body = [RECORD, { ...RECORD, embedding: undefined }];
  await assert.rejects(
    () => loadCorpus(fakeFetch({ body })),
    (error) => error instanceof CorpusMissingError && /record 1/.test(error.message),
  );
});

test("a non-404 HTTP error is surfaced as a plain error, not a missing Corpus", async () => {
  await assert.rejects(
    () => loadCorpus(fakeFetch({ status: 500 })),
    (error) => error instanceof Error && !(error instanceof CorpusMissingError),
  );
});
