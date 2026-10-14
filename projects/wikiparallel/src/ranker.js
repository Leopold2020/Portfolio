import { PAGE_SIZE } from "./grouping.js";

/** @typedef {import("./fields.js").Field} Field */
/** @typedef {import("./search.js").Parallel} Parallel */

/**
 * One Corpus article as the ranker consumes it: the data a Parallel renders,
 * plus the Lead Section Embedding produced once at build time.
 *
 * @typedef {object} CorpusArticle
 * @property {string} title        The Wikipedia article title.
 * @property {string} url          Link to the article on English Wikipedia.
 * @property {Field} field         The Field the article sits in.
 * @property {string} leadSection  The article's Lead Section, shown as evidence.
 * @property {number[]} embedding  The Lead Section Embedding.
 */

/**
 * @typedef {object} RankOptions
 * @property {number} [pageSize]  Parallels per page, and the size of the "Show 6
 *                                more" step. Defaults to {@link PAGE_SIZE}.
 * @property {number} [offset]    How many already-shown Parallels to skip.
 *                                Expected to be a multiple of `pageSize`.
 */

/**
 * @typedef {object} RankResult
 * @property {Parallel[]} parallels  One page of Parallels, ordered by Closeness
 *                                   within the Field-spread constraints.
 * @property {boolean} hasMore       Whether another page remains. `false` means
 *                                   the Corpus is exhausted for this Challenge.
 */

/**
 * @typedef {object} Scored
 * @property {CorpusArticle} article
 * @property {number} similarity  Cosine similarity with the Challenge Embedding.
 */

/** At most this many Parallels from any one Field on a single page. */
const MAX_PER_FIELD = 2;

/**
 * Every page of Parallels aims to cover at least this many distinct Fields. The
 * aim is dropped when fewer Fields than this have any candidate at all.
 */
const MIN_FIELDS_PER_PAGE = 4;

/**
 * Rank a Corpus against a Challenge Embedding and return one page of Parallels.
 *
 * The function is pure: it performs no I/O and never loads or calls the
 * embedding model. The caller embeds the Challenge and passes the Embedding in.
 *
 * It:
 *   1. Computes cosine similarity between `challengeEmbedding` and every Corpus
 *      article Embedding.
 *   2. Drops every article whose Field is the Home Field.
 *   3. Sorts the rest by similarity, descending.
 *   4. Selects Parallels so that no Field appears more than {@link MAX_PER_FIELD}
 *      times on a page and each page covers at least {@link MIN_FIELDS_PER_PAGE}
 *      distinct Fields — relaxing both rules only when fewer than
 *      {@link MIN_FIELDS_PER_PAGE} Fields have any candidate.
 *   5. Returns the page selected by `options.offset` / `options.pageSize`, with
 *      `hasMore` telling the caller whether "Show 6 more" has anything to show.
 *
 * @param {number[]} challengeEmbedding  The embedded Challenge.
 * @param {Field} homeField              The Field to exclude entirely.
 * @param {CorpusArticle[]} corpus       The articles to rank.
 * @param {RankOptions} [options]
 * @returns {RankResult}
 */
export function rankParallels(challengeEmbedding, homeField, corpus, options = {}) {
  const pageSize = Math.max(1, Math.floor(options.pageSize ?? PAGE_SIZE));
  const offset = Math.max(0, Math.floor(options.offset ?? 0));

  /** @type {Scored[]} */
  const scored = corpus
    .filter((article) => article.field !== homeField)
    .map((article) => ({
      article,
      similarity: cosineSimilarity(challengeEmbedding, article.embedding),
    }));
  scored.sort(bySimilarityThenTitle);

  // With fewer than MIN_FIELDS_PER_PAGE Fields in play the spread rule cannot be
  // met, so both it and the per-Field cap are dropped and the Parallels come
  // back in plain similarity order rather than the selection failing.
  const distinctFields = new Set(scored.map((s) => s.article.field)).size;
  const pages =
    distinctFields < MIN_FIELDS_PER_PAGE
      ? chunk(scored, pageSize)
      : selectPages(scored, pageSize);

  const pageIndex = Math.floor(offset / pageSize);
  const page = pages[pageIndex] ?? [];

  return {
    parallels: page.map(toParallel),
    hasMore: pages.length > pageIndex + 1,
  };
}

/**
 * Similarity, descending; title breaks ties so the order is deterministic
 * across runs.
 * @param {Scored} a
 * @param {Scored} b
 * @returns {number}
 */
function bySimilarityThenTitle(a, b) {
  return b.similarity - a.similarity || a.article.title.localeCompare(b.article.title);
}

/**
 * Split an already-sorted list into fixed-size pages, no Field constraints. Used
 * for a Corpus too narrow to spread across {@link MIN_FIELDS_PER_PAGE} Fields.
 * @param {Scored[]} scored
 * @param {number} pageSize
 * @returns {Scored[][]}
 */
function chunk(scored, pageSize) {
  /** @type {Scored[][]} */
  const pages = [];
  for (let i = 0; i < scored.length; i += pageSize) {
    pages.push(scored.slice(i, i + pageSize));
  }
  return pages;
}

/**
 * Walk the sorted candidates, carving off one constrained page at a time until
 * every candidate has been placed. A candidate is returned on exactly one page,
 * but a Field may reappear on later pages.
 * @param {Scored[]} scored
 * @param {number} pageSize
 * @returns {Scored[][]}
 */
function selectPages(scored, pageSize) {
  const remaining = scored.slice();
  /** @type {Scored[][]} */
  const pages = [];
  while (remaining.length > 0) {
    const page = buildPage(remaining, pageSize);
    if (page.length === 0) break; // buildPage always takes >= 1; guards against a loop that can't end
    pages.push(page);
  }
  return pages;
}

/**
 * Take the best page from `remaining` under the Field constraints and splice the
 * chosen candidates out of it.
 *
 * Two passes over the sorted pool: first one Parallel from each fresh Field
 * until the page is guaranteed {@link MIN_FIELDS_PER_PAGE} Fields, then the best
 * remaining Parallels up to {@link MAX_PER_FIELD} per Field until the page is
 * full. The page is finally re-sorted by similarity so its order still reads as
 * "closest first".
 *
 * @param {Scored[]} remaining  Sorted; mutated — chosen candidates are removed.
 * @param {number} pageSize
 * @returns {Scored[]}
 */
function buildPage(remaining, pageSize) {
  /** @type {Scored[]} */
  const page = [];
  /** @type {Map<string, number>} */
  const perField = new Map();
  /** @type {Set<Scored>} */
  const chosen = new Set();

  const add = (/** @type {Scored} */ s) => {
    page.push(s);
    chosen.add(s);
    perField.set(s.article.field, (perField.get(s.article.field) ?? 0) + 1);
  };

  // Pass 1 — spread across Fields.
  for (const s of remaining) {
    if (page.length >= pageSize || perField.size >= MIN_FIELDS_PER_PAGE) break;
    if (!perField.has(s.article.field)) add(s);
  }
  // Pass 2 — fill the page, honouring the per-Field cap.
  for (const s of remaining) {
    if (page.length >= pageSize) break;
    if (chosen.has(s)) continue;
    if ((perField.get(s.article.field) ?? 0) < MAX_PER_FIELD) add(s);
  }

  for (let i = remaining.length - 1; i >= 0; i--) {
    const s = remaining[i];
    if (s && chosen.has(s)) remaining.splice(i, 1);
  }

  page.sort(bySimilarityThenTitle);
  return page;
}

/**
 * @param {Scored} scored
 * @returns {Parallel}
 */
function toParallel({ article, similarity }) {
  return {
    title: article.title,
    url: article.url,
    field: article.field,
    leadSection: article.leadSection,
    closeness: Math.round(similarity * 100),
  };
}

/**
 * Cosine similarity of two Embeddings, which the one embedding model always
 * produces at the same length. Returns 0 when either has zero magnitude.
 * @param {number[]} challenge
 * @param {number[]} article
 * @returns {number}
 */
function cosineSimilarity(challenge, article) {
  let dot = 0;
  let magChallenge = 0;
  let magArticle = 0;
  for (let i = 0; i < challenge.length; i++) {
    const c = challenge[i] ?? 0;
    const a = article[i] ?? 0;
    dot += c * a;
    magChallenge += c * c;
    magArticle += a * a;
  }
  const magnitude = Math.sqrt(magChallenge) * Math.sqrt(magArticle);
  return magnitude === 0 ? 0 : dot / magnitude;
}
