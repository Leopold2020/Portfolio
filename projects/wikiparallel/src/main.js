import { initApp } from "./app.js";
import { loadCorpus } from "./corpus.js";
import { createEmbedder } from "./embedder.js";

/**
 * Browser entry point: hand {@link initApp} the real Corpus loader and the real
 * in-browser embedder. Everything testable lives in `app.js` and its seams.
 */
const embedder = createEmbedder();

initApp({
  document,
  loadCorpus: () => loadCorpus(),
  embed: (text, options) => embedder.embed(text, options),
});
