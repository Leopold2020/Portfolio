# Browser-only, no backend, embeddings in the browser

WikiParallel runs entirely as a static site: `corpus.json` is fetched on load and
the `gte-small` embedding model runs client-side via `transformers.js`, so a
Challenge is embedded and compared against the Corpus without any server, API, or
database.

We chose this over a small Python/Flask backend that would hold the model and
vectors. The static approach makes the project trivial to present and hand in
(nothing to deploy or keep running) and keeps the "it is just cosine similarity"
claim honest. The costs we accept: a one-time model download of roughly 34 MB on
first visit, and a practical ceiling of about 10,000 articles before search would
need to move server-side. The `loadCorpus()` function is the single, documented
place to change if that move becomes necessary.
