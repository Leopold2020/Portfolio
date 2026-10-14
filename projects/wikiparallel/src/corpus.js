/**
 * `loadCorpus()` — the single documented place a remote Corpus source would be
 * swapped in (ADR-0001).
 *
 * It fetches `corpus.json` (written by `npm run build`, see issue #5) and adapts
 * each on-disk record — whose Lead Section is stored as `leadText` — into the
 * {@link import("./ranker.js").CorpusArticle} shape the ranker consumes, where
 * the same text is `leadSection`.
 */

/** Where the built Corpus sits, relative to `index.html`. */
export const CORPUS_URL = "./corpus.json";

/**
 * The slice of a `fetch` response this module needs. `fetch` itself satisfies
 * it; tests pass a stub (mirrors `build/cache.mjs`).
 *
 * @typedef {object} CorpusResponse
 * @property {boolean} ok
 * @property {number} status
 * @property {() => Promise<any>} json
 *
 * @typedef {(url: string) => Promise<CorpusResponse>} CorpusFetch
 */

/**
 * Thrown when `corpus.json` cannot be loaded at all — a 404, or the fetch
 * itself failing. The app turns this into a "run the build script" message
 * rather than failing silently.
 */
export class CorpusMissingError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = "CorpusMissingError";
  }
}

/**
 * Fetch and adapt the Corpus.
 *
 * @param {CorpusFetch} [fetchImpl]  Injected for tests; defaults to `fetch`.
 * @returns {Promise<import("./ranker.js").CorpusArticle[]>}
 */
export async function loadCorpus(fetchImpl = /** @type {CorpusFetch} */ (fetch)) {
  let response;
  try {
    response = await fetchImpl(CORPUS_URL);
  } catch (cause) {
    throw new CorpusMissingError(
      "Could not fetch corpus.json. Run `npm run build` to create it, then reload.",
    );
  }

  if (response.status === 404) {
    throw new CorpusMissingError(
      "corpus.json is missing. Run `npm run build` to create it, then reload.",
    );
  }
  if (!response.ok) {
    throw new Error(`Fetching corpus.json failed with HTTP ${response.status}.`);
  }

  let records;
  try {
    records = await response.json();
  } catch {
    throw new CorpusMissingError(
      "corpus.json is not valid JSON. Re-run `npm run build`, then reload.",
    );
  }
  if (!Array.isArray(records) || records.length === 0) {
    throw new CorpusMissingError(
      "corpus.json is empty or malformed. Re-run `npm run build`, then reload.",
    );
  }

  return records.map(toArticle);
}

/**
 * @param {any} record
 * @param {number} index
 * @returns {import("./ranker.js").CorpusArticle}
 */
function toArticle(record, index) {
  if (
    !record ||
    typeof record.title !== "string" ||
    typeof record.url !== "string" ||
    typeof record.field !== "string" ||
    typeof record.leadText !== "string" ||
    !Array.isArray(record.embedding) ||
    record.embedding.length === 0
  ) {
    throw new CorpusMissingError(
      `corpus.json record ${index} is malformed. Re-run \`npm run build\`, then reload.`,
    );
  }
  return {
    title: record.title,
    url: record.url,
    field: /** @type {import("./fields.js").Field} */ (record.field),
    leadSection: record.leadText,
    embedding: record.embedding,
  };
}
