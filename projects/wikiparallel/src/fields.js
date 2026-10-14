/**
 * The eleven Fields: the top-level sections of Wikipedia's Vital Articles
 * Level 3 list, in their list order. Every Corpus article — and so every
 * Parallel — belongs to exactly one of these.
 *
 * These names are read from the live list at build time (docs/adr/0002) and
 * stored on every record in `corpus.json`, so the running app takes its Field
 * list and order from the loaded Corpus via {@link fieldsFromCorpus}. This
 * constant is only the shell's fallback for the moment before the Corpus has
 * loaded; it is kept in step with the live list by hand.
 *
 * @type {readonly string[]}
 */
export const FIELDS = Object.freeze([
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

/**
 * The Fields present in a loaded Corpus, in first-appearance order. The build
 * preserves the live Vital Articles section order, so this is the canonical
 * Field order for the running app — the Home Field dropdown and the grouped
 * results both follow it.
 *
 * @param {readonly { field: string }[]} corpus
 * @returns {string[]}
 */
export function fieldsFromCorpus(corpus) {
  /** @type {string[]} */
  const ordered = [];
  for (const article of corpus) {
    if (!ordered.includes(article.field)) ordered.push(article.field);
  }
  return ordered;
}

/** One of the eleven Field names. @typedef {(typeof FIELDS)[number]} Field */

const FIELD_SET = new Set(FIELDS);

/**
 * True when `value` is exactly one of the eleven Field names (case-sensitive).
 * @param {unknown} value
 * @returns {value is Field}
 */
export function isField(value) {
  return typeof value === "string" && FIELD_SET.has(value);
}

/**
 * A stable kebab-case token for a Field, used as a CSS class suffix so each
 * Field can carry its own tag colour.
 * @param {string} field
 * @returns {string}
 */
export function fieldSlug(field) {
  return field.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
