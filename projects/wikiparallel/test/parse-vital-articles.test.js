import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { parseVitalArticles, wikiUrl } from "../build/parse-vital-articles.mjs";

/**
 * A captured slice of the real Wikipedia:Vital articles/Level 3 page: the list
 * heading plus the complete People and History sections. Parsing is asserted
 * against this frozen sample so the tests do not depend on the live page.
 */
const SAMPLE = readFileSync(
  fileURLToPath(new URL("./fixtures/vital-articles-level-3.wikitext", import.meta.url)),
  "utf8",
);

const parsed = parseVitalArticles(SAMPLE);
const titlesIn = (/** @type {string} */ field) =>
  parsed.filter((a) => a.field === field).map((a) => a.title);

test("Field names and their order come from the page, not a hard-coded list", () => {
  const fields = [...new Set(parsed.map((a) => a.field))];
  assert.deepEqual(fields, ["People", "History"]);
});

test("every article under a sub-heading is flattened onto its top-level Field", () => {
  // "Human history" sits under "=== History: General ===" inside "== History =="
  // and is a nested (`**`) bullet, yet its Field is the top-level section.
  const humanHistory = parsed.find((a) => a.title === "Human history");
  assert.ok(humanHistory, "expected Human history to be parsed");
  assert.equal(humanHistory.field, "History");

  // No Field is ever a sub-heading name.
  for (const a of parsed) {
    assert.ok(["People", "History"].includes(a.field), `unexpected Field ${a.field}`);
  }
});

test("the section article counts match the captured page", () => {
  assert.equal(titlesIn("People").length, 99);
  assert.equal(titlesIn("History").length, 80);
  assert.equal(parsed.length, 179);
});

test("the first bullet's article wins; namespace back-links are skipped", () => {
  // `* {{Icon|FA}} '''[[History]]''' ([[Wikipedia:Vital articles/Level 2|Level 2]])`
  const history = parsed.find((a) => a.title === "History");
  assert.ok(history);
  assert.equal(history.field, "History");
  assert.ok(!parsed.some((a) => a.title.includes(":")), "a namespaced link leaked in");
});

test("ordering follows the page: People before History, list order within a Field", () => {
  const first = parsed.at(0);
  const last = parsed.at(-1);
  assert.deepEqual(
    { title: first?.title, field: first?.field },
    { title: "Hammurabi", field: "People" },
  );
  assert.deepEqual(
    { title: last?.title, field: last?.field },
    { title: "Globalization", field: "History" },
  );
});

test("each record carries a canonical Wikipedia URL", () => {
  for (const a of parsed) {
    assert.ok(
      a.url.startsWith("https://en.wikipedia.org/wiki/"),
      `${a.title} has a non-canonical URL: ${a.url}`,
    );
    assert.ok(!a.url.includes(" "), `${a.title} URL has a raw space`);
  }
  assert.equal(
    parsed.find((a) => a.title === "Ramesses II")?.url,
    "https://en.wikipedia.org/wiki/Ramesses_II",
  );
});

test("piped links resolve to the link target, not the display text", () => {
  // The fixture links `[[History of art]]` plainly, but a piped form must take
  // the target. Exercise wikiUrl / the target rule directly.
  const [article] = parseVitalArticles(
    ["=Level 3 vital articles=", "==Science==", "* [[Function (mathematics)|Function]]"].join("\n"),
  );
  assert.equal(article?.title, "Function (mathematics)");
  assert.equal(article?.url, "https://en.wikipedia.org/wiki/Function_(mathematics)");
});

test("the level option selects the matching top-level section", () => {
  const wikitext = [
    "==Current total==",
    "* {{Icon|B}} [[Ignored table link]]",
    "=Level 3 vital articles=",
    "==Science==",
    "* [[Physics]]",
  ].join("\n");

  assert.deepEqual(
    parseVitalArticles(wikitext, { level: 3 }).map((a) => a.title),
    ["Physics"],
  );
  // A level 4 build must not accept a level 3 page.
  assert.deepEqual(parseVitalArticles(wikitext, { level: 4 }), []);
  // Default level is 3.
  assert.deepEqual(
    parseVitalArticles(wikitext).map((a) => a.title),
    ["Physics"],
  );
});

test("wikiUrl encodes the characters MediaWiki escapes in a path", () => {
  assert.equal(wikiUrl("Rock 'n' roll"), "https://en.wikipedia.org/wiki/Rock_'n'_roll");
  assert.equal(wikiUrl("Who? (album)"), "https://en.wikipedia.org/wiki/Who%3F_(album)");
});
