/**
 * `createEmbedder()` — the browser-side counterpart of `build/embed.mjs`.
 *
 * It imports `@huggingface/transformers` from a CDN at the *same pinned version*
 * the build uses, so a Lead Section Embedding made at build time and a Challenge
 * Embedding made here are directly comparable and their Closeness is meaningful
 * (issue #1, ADR-0001). The Challenge text is embedded entirely in the browser
 * and never sent anywhere.
 *
 * The `gte-small` model (~34 MB) downloads from the Hugging Face hub on the
 * first visit and is served from the browser's Cache Storage on every visit
 * after that. `getExtractor`'s `progress_callback` drives the download bar.
 *
 * Not unit-tested — a passthrough to a third-party model loaded over the
 * network. `src/app.js` takes `embed` as an injected dependency so the app is
 * testable with a fake; the ranker (issue #3) is the tested retrieval seam.
 */

/** The transformers.js version pinned by `package.json` — must match the build. */
export const TRANSFORMERS_VERSION = "3.8.1";

/** ESM entry for that version on jsDelivr. */
export const TRANSFORMERS_URL = `https://cdn.jsdelivr.net/npm/@huggingface/transformers@${TRANSFORMERS_VERSION}`;

/** Hugging Face model id for gte-small with ONNX weights (as `build/embed.mjs`). */
export const MODEL_ID = "Supabase/gte-small";

/** gte-small's output dimensionality. */
export const EMBEDDING_DIM = 384;

/** @typedef {{ pipeline: Function, env: Record<string, unknown> }} Transformers */

/** Load the CDN module once. Split out so tests can inject a fake. */
const importTransformers = () => /** @type {Promise<Transformers>} */ (import(TRANSFORMERS_URL));

/**
 * Build an embedder: an object with a single `embed(text, { onProgress })`
 * method. The feature-extraction pipeline is created lazily on the first call
 * and reused for every call after.
 *
 * @param {object} [deps]
 * @param {() => Promise<Transformers>} [deps.loadTransformers]  Injected for tests.
 * @returns {{ embed: (text: string, options?: { onProgress?: (event: object) => void }) => Promise<number[]> }}
 */
export function createEmbedder({ loadTransformers = importTransformers } = {}) {
  /** @type {Promise<(text: string, options: object) => Promise<{ data: ArrayLike<number> }>> | undefined} */
  let extractorPromise;

  /** @param {(event: object) => void} [onProgress] */
  function getExtractor(onProgress) {
    extractorPromise ??= (async () => {
      const { pipeline, env } = await loadTransformers();
      // Always fetch from the hub; the library caches the files in the browser.
      env.allowLocalModels = false;
      return /** @type {any} */ (
        pipeline("feature-extraction", MODEL_ID, { progress_callback: onProgress })
      );
    })();
    return extractorPromise;
  }

  return {
    async embed(text, { onProgress } = {}) {
      const extractor = await getExtractor(onProgress);
      const output = await extractor(text, { pooling: "mean", normalize: true });
      const embedding = Array.from(/** @type {ArrayLike<number>} */ (output.data), Number);
      if (embedding.length !== EMBEDDING_DIM) {
        throw new Error(
          `expected a ${EMBEDDING_DIM}-number Embedding, got ${embedding.length}`,
        );
      }
      return embedding;
    },
  };
}
