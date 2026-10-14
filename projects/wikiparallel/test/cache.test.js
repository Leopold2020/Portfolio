import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import path from "node:path";

import { fetchJsonCached, cacheFilename } from "../build/cache.mjs";
import { withTempDir } from "./helpers.js";

/** @typedef {import("../build/cache.mjs").JsonFetch} JsonFetch */

/**
 * A `fetch` stand-in that records its calls and returns a fixed JSON body.
 * @param {unknown} body
 * @returns {{ fetchImpl: JsonFetch, calls: string[] }}
 */
function stubFetch(body) {
  /** @type {string[]} */
  const calls = [];
  /** @type {JsonFetch} */
  const fetchImpl = async (url) => {
    calls.push(url);
    return { ok: true, status: 200, statusText: "OK", json: async () => body };
  };
  return { fetchImpl, calls };
}

test("a cold cache fetches once and returns the parsed body", async () => {
  await withTempDir(async (cacheDir) => {
    const { fetchImpl, calls } = stubFetch({ hello: "world" });
    const body = await fetchJsonCached("https://example.test/a", { cacheDir, fetchImpl });
    assert.deepEqual(body, { hello: "world" });
    assert.equal(calls.length, 1);
  });
});

test("a warm cache makes no network call", async () => {
  await withTempDir(async (cacheDir) => {
    const first = stubFetch({ n: 1 });
    await fetchJsonCached("https://example.test/warm", { cacheDir, fetchImpl: first.fetchImpl });

    const second = stubFetch({ n: 2 });
    const body = await fetchJsonCached("https://example.test/warm", {
      cacheDir,
      fetchImpl: second.fetchImpl,
    });

    assert.deepEqual(body, { n: 1 }, "served the cached body, not a re-fetch");
    assert.equal(second.calls.length, 0, "second run hit the network");
  });
});

test("different query strings are cached separately", async () => {
  await withTempDir(async (cacheDir) => {
    const { fetchImpl, calls } = stubFetch({ ok: true });
    await fetchJsonCached("https://example.test/api?page=3", { cacheDir, fetchImpl });
    await fetchJsonCached("https://example.test/api?page=4", { cacheDir, fetchImpl });
    assert.equal(calls.length, 2);
    assert.notEqual(
      cacheFilename("https://example.test/api?page=3"),
      cacheFilename("https://example.test/api?page=4"),
    );
  });
});

test("a non-ok response throws and is not cached", async () => {
  await withTempDir(async (cacheDir) => {
    /** @type {import("../build/cache.mjs").JsonFetch} */
    const fetchImpl = async () => ({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => ({}),
    });
    await assert.rejects(
      () => fetchJsonCached("https://example.test/missing", { cacheDir, fetchImpl }),
      /404 Not Found/,
    );
    const retry = stubFetch({ recovered: true });
    const body = await fetchJsonCached("https://example.test/missing", {
      cacheDir,
      fetchImpl: retry.fetchImpl,
    });
    assert.deepEqual(body, { recovered: true });
    assert.equal(retry.calls.length, 1);
  });
});

test("a corrupt cache entry is reported, not silently re-fetched", async () => {
  await withTempDir(async (cacheDir) => {
    await writeFile(path.join(cacheDir, cacheFilename("https://example.test/bad")), "{not json");
    await assert.rejects(
      () => fetchJsonCached("https://example.test/bad", { cacheDir, fetchImpl: stubFetch({}).fetchImpl }),
      /corrupt cache entry/,
    );
  });
});
