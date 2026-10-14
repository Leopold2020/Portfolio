import { test } from "node:test";
import assert from "node:assert/strict";

import { FIELDS, fieldsFromCorpus, isField, fieldSlug } from "../src/fields.js";

test("there are exactly eleven fallback Fields, in Vital Articles list order", () => {
  assert.deepEqual(FIELDS, [
    "People",
    "History",
    "Geography",
    "Arts",
    "Everyday life",
    "Philosophy and religion",
    "Society and social sciences",
    "Health, medicine and disease",
    "Science",
    "Technology",
    "Mathematics",
  ]);
});

test("isField recognises a fallback Field and rejects anything else", () => {
  assert.equal(isField("Science"), true);
  assert.equal(isField("science"), false);
  assert.equal(isField(""), false);
  assert.equal(isField("Cooking"), false);
  assert.equal(isField(null), false);
});

test("fieldsFromCorpus lists the Corpus's Fields once each, in first-appearance order", () => {
  const corpus = [
    { field: "Science" },
    { field: "Arts" },
    { field: "Science" },
    { field: "History" },
    { field: "Arts" },
  ];
  assert.deepEqual(fieldsFromCorpus(corpus), ["Science", "Arts", "History"]);
});

test("fieldSlug is a stable kebab-case token usable as a CSS class", () => {
  assert.equal(fieldSlug("Philosophy and religion"), "philosophy-and-religion");
  assert.equal(fieldSlug("Society and social sciences"), "society-and-social-sciences");
  assert.equal(fieldSlug("Arts"), "arts");
});
