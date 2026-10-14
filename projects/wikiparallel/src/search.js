import { rankParallels } from "./ranker.js";
import { PAGE_SIZE } from "./grouping.js";

/** @typedef {import("./fields.js").Field} Field */

/**
 * @typedef {object} Parallel
 * @property {string} title       The Wikipedia article title.
 * @property {string} url         Link to the article on English Wikipedia.
 * @property {Field} field        The Field the article sits in.
 * @property {string} leadSection The article's Lead Section, shown as evidence.
 * @property {number} closeness   Whole number 0–100: `round(cosine × 100)`.
 */

/**
 * @typedef {object} SearchDeps
 * @property {import("./ranker.js").CorpusArticle[]} corpus  The loaded Corpus.
 * @property {(text: string, options?: { onProgress?: (event: object) => void }) => Promise<number[]>} embed
 *   Embeds a string in the browser. The Challenge text is passed here and
 *   nowhere else, so it never leaves the machine (ADR-0001).
 */

/**
 * @typedef {object} SearchOptions
 * @property {number} [offset]  How many already-shown Parallels to skip; a
 *                              multiple of {@link PAGE_SIZE}. Defaults to 0.
 * @property {number[]} [challengeEmbedding]  A Challenge Embedding from an
 *   earlier page of the same search. When given, the Challenge is not
 *   re-embedded — "Show 6 more" reuses it.
 * @property {(event: object) => void} [onProgress]  Forwarded to `embed` so the
 *   caller can show the one-time model-download progress.
 */

/**
 * @typedef {object} SearchResult
 * @property {Parallel[]} parallels          One page of Parallels.
 * @property {boolean} hasMore               Whether another page remains.
 * @property {number[]} challengeEmbedding   The embedded Challenge, so the next
 *                                           page can skip re-embedding.
 */

/**
 * The real search pipeline that replaces the stubbed fixture search.
 *
 * It embeds the Challenge in the browser with the injected `embed` (issue #4,
 * ADR-0001) and ranks the loaded Corpus against that Embedding with
 * {@link rankParallels} (issue #3). The DOM wiring lives in {@link module:src/app};
 * this module is the pure orchestration seam so it can be tested with a fake
 * embedder and a small Corpus.
 *
 * @param {string} challengeText  The normalized Challenge.
 * @param {Field} homeField       The Field to exclude entirely.
 * @param {SearchDeps} deps
 * @param {SearchOptions} [options]
 * @returns {Promise<SearchResult>}
 */
export async function search(challengeText, homeField, deps, options = {}) {
  const challengeEmbedding =
    options.challengeEmbedding ??
    (await deps.embed(challengeText, { onProgress: options.onProgress }));

  const { parallels, hasMore } = rankParallels(challengeEmbedding, homeField, deps.corpus, {
    pageSize: PAGE_SIZE,
    offset: options.offset ?? 0,
  });

  return { parallels, hasMore, challengeEmbedding };
}
