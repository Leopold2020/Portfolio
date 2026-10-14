import { FIELDS } from "./fields.js";

/** @typedef {import("./search.js").Parallel} Parallel */

/** How many Parallels a search shows at once, and how many "Show 6 more" adds. */
export const PAGE_SIZE = 6;


/**
 * A copy of `parallels` ordered by Closeness, highest first. Ties break by
 * title so the order is stable across runs.
 * @param {Parallel[]} parallels
 * @returns {Parallel[]}
 */
export function sortByCloseness(parallels) {
  return [...parallels].sort(
    (a, b) => b.closeness - a.closeness || a.title.localeCompare(b.title),
  );
}

/**
 * @typedef {object} FieldGroup
 * @property {string} field
 * @property {Parallel[]} parallels  Ordered by Closeness, highest first.
 */

/**
 * Bucket Parallels by Field for display. Each group's Parallels are ordered by
 * Closeness, highest first; the groups themselves follow `order`, so a group
 * keeps its place on the page as "Show 6 more" adds Parallels.
 *
 * `order` is the canonical Field order — {@link import("./fields.js").fieldsFromCorpus}
 * in the running app, defaulting to {@link FIELDS} for unit tests. A Field not
 * in `order` sorts after every listed Field, keeping it visible rather than
 * jumping to the top.
 *
 * @param {Parallel[]} parallels
 * @param {readonly string[]} [order]
 * @returns {FieldGroup[]}
 */
export function groupByField(parallels, order = FIELDS) {
  const rank = new Map(order.map((field, i) => [field, i]));
  const after = order.length;

  /** @type {Map<string, Parallel[]>} */
  const buckets = new Map();
  for (const p of parallels) {
    const bucket = buckets.get(p.field);
    if (bucket) bucket.push(p);
    else buckets.set(p.field, [p]);
  }

  return [...buckets.entries()]
    .map(([field, group]) => ({ field, parallels: sortByCloseness(group) }))
    .sort((a, b) => (rank.get(a.field) ?? after) - (rank.get(b.field) ?? after));
}
