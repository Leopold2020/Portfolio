import { FIELDS } from "./fields.js";

/**
 * The longest Challenge the tool accepts. Stray paste or a wall of text is
 * truncated to this before it is embedded, so odd input cannot break search.
 */
export const MAX_CHALLENGE_LENGTH = 300;

/** The fewest words a Challenge needs before a search can run. */
export const MIN_CHALLENGE_WORDS = 3;

/**
 * Trim surrounding whitespace and cap the Challenge at {@link MAX_CHALLENGE_LENGTH}.
 * Non-string input becomes the empty string.
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeChallenge(raw) {
  if (typeof raw !== "string") return "";
  return raw.trim().slice(0, MAX_CHALLENGE_LENGTH);
}

/**
 * Count whitespace-separated words in `text`.
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

/**
 * Whether a search may run: the Challenge has at least
 * {@link MIN_CHALLENGE_WORDS} words and a real Home Field is chosen.
 *
 * The valid Home Fields come from the loaded Corpus (see
 * {@link import("./fields.js").fieldsFromCorpus}); `fields` defaults to
 * {@link FIELDS} for the shell's pre-load state and for unit tests.
 *
 * @param {{ challenge: string, homeField: string }} input
 * @param {readonly string[]} [fields]
 * @returns {boolean}
 */
export function challengeReady({ challenge, homeField }, fields = FIELDS) {
  return (
    countWords(normalizeChallenge(challenge)) >= MIN_CHALLENGE_WORDS &&
    fields.includes(homeField)
  );
}
