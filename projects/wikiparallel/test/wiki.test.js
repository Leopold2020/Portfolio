import { test } from "node:test";
import assert from "node:assert/strict";

import { vitalArticlesUrl, fetchVitalArticlesWikitext } from "../build/wiki.mjs";
import { withTempDir } from "./helpers.js";

/** @typedef {import("../build/cache.mjs").JsonFetch} JsonFetch */

/**
 * A `fetch` stand-in returning one fixed JSON body.
 * @param {unknown} body
 * @returns {JsonFetch}
 */
const stubFetch = (body) => async () => ({
  ok: true,
  status: 200,
  statusText: "OK",
  json: async () => body,
});

test("vitalArticlesUrl targets the requested level's list page via the parse API", () => {
  const url = new URL(vitalArticlesUrl(3));
  assert.equal(url.origin + url.pathname, "https://en.wikipedia.org/w/api.php");
  assert.equal(url.searchParams.get("action"), "parse");
  assert.equal(url.searchParams.get("prop"), "wikitext");
  assert.equal(url.searchParams.get("page"), "Wikipedia:Vital articles/Level 3");
  assert.equal(url.searchParams.get("redirects"), "1");

  assert.equal(
    new URL(vitalArticlesUrl(4)).searchParams.get("page"),
    "Wikipedia:Vital articles/Level 4",
  );
});

test("fetchVitalArticlesWikitext unwraps the parse.wikitext field", async () => {
  await withTempDir(async (cacheDir) => {
    const wikitext = await fetchVitalArticlesWikitext(3, {
      cacheDir,
      fetchImpl: stubFetch({ parse: { wikitext: "=Level 3 vital articles=\n==People==" } }),
    });
    assert.match(wikitext, /Level 3 vital articles/);
  });
});

test("fetchVitalArticlesWikitext throws when the response carries no wikitext", async () => {
  await withTempDir(async (cacheDir) => {
    await assert.rejects(
      () =>
        fetchVitalArticlesWikitext(3, {
          cacheDir,
          fetchImpl: stubFetch({ error: { code: "missingtitle" } }),
        }),
      /no wikitext/,
    );
  });
});
