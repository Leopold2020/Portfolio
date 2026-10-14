import { test } from "node:test";
import assert from "node:assert/strict";

import {
  MAX_CHALLENGE_LENGTH,
  MIN_CHALLENGE_WORDS,
  normalizeChallenge,
  countWords,
  challengeReady,
} from "../src/challenge.js";

test("normalizeChallenge trims surrounding whitespace", () => {
  assert.equal(normalizeChallenge("  handling a surge of users \n"), "handling a surge of users");
});

test("normalizeChallenge caps the Challenge at MAX_CHALLENGE_LENGTH characters", () => {
  const long = "word ".repeat(200).trim(); // ~999 chars
  const out = normalizeChallenge(long);
  assert.equal(out.length, MAX_CHALLENGE_LENGTH);
});

test("normalizeChallenge tolerates non-string input", () => {
  assert.equal(normalizeChallenge(undefined), "");
  assert.equal(normalizeChallenge(null), "");
});

test("countWords counts whitespace-separated tokens", () => {
  assert.equal(countWords("one two three"), 3);
  assert.equal(countWords("  spaced   out  words "), 3);
  assert.equal(countWords(""), 0);
  assert.equal(countWords("   "), 0);
});

test("challengeReady requires at least MIN_CHALLENGE_WORDS words and a real Home Field", () => {
  assert.equal(MIN_CHALLENGE_WORDS, 3);

  assert.equal(challengeReady({ challenge: "a sudden surge", homeField: "Technology" }), true);
  // fewer than three words
  assert.equal(challengeReady({ challenge: "surge users", homeField: "Technology" }), false);
  // no Home Field
  assert.equal(challengeReady({ challenge: "a sudden surge of users", homeField: "" }), false);
  // bogus Home Field
  assert.equal(challengeReady({ challenge: "a sudden surge of users", homeField: "Nonsense" }), false);
  // whitespace-padded Challenge still counts as three words
  assert.equal(challengeReady({ challenge: "   a  sudden  surge  ", homeField: "Science" }), true);
});

test("challengeReady validates the Home Field against a supplied Field list", () => {
  const fields = ["Widgets", "Gadgets"];
  assert.equal(challengeReady({ challenge: "a sudden surge of x", homeField: "Widgets" }, fields), true);
  // "Science" is a fallback Field but not in this Corpus's Fields
  assert.equal(challengeReady({ challenge: "a sudden surge of x", homeField: "Science" }, fields), false);
});
