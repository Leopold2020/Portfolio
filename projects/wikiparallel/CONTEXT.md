# WikiParallel

A browser-only tool that takes a problem written in plain language and returns
Wikipedia articles from unrelated disciplines that describe the same underlying
problem, so a person can borrow ideas across fields.

## Language

**Challenge**:
The problem a person types in, phrased in plain language (for example,
"handling a sudden surge of users"). The single input to a search.
_Avoid_: query, prompt, question

**Parallel**:
A Wikipedia article that the tool returns for a Challenge because its lead
section is close to the Challenge in embedding space and it sits in a different
Field. The unit of output.
_Avoid_: match, result, hit, analogy

**Field**:
One of the 11 top-level sections of the Vital Articles Level 3 list: People,
History, Geography, Arts, Everyday life, Philosophy and religion, Society and
social sciences, Health, medicine and disease, Science, Technology, Mathematics.
Every Corpus article belongs to exactly one Field, taken from the section it
appears under. The exact names and their order are read from the live list at
build time and stored on every `corpus.json` record; the running app takes its
Field list from the loaded Corpus (`src/fields.js` holds only a fallback for the
moment before it loads).
_Avoid_: domain, discipline, category, topic

**Home Field**:
The Field the person marks as the one their Challenge already belongs to.
Articles in the Home Field are excluded from the Parallels, which is how the
tool "skips the obvious answers".
_Avoid_: source field, own field, excluded category

**Corpus**:
The fixed set of ~1,000 articles from Wikipedia's Vital Articles Level 3 list,
each reduced to its Lead Section plus its list of section headings and embedded
once at build time.
_Avoid_: dataset, index, database

**Lead Section**:
The text of a Wikipedia article before its first heading. The only part of an
article WikiParallel embeds and the text shown to the person as evidence of a
Parallel.
_Avoid_: summary, intro, abstract, extract

**Closeness**:
The similarity between a Challenge and a Parallel, shown to the person as a
whole number from 0 to 100 (cosine similarity of the two Embeddings, times 100).
A rough ordering cue, not a probability or a quality score.
_Avoid_: score, relevance, confidence, distance

**Bridge**:
A short account of the shared structure between a Challenge and one Parallel: a
sentence naming the underlying problem both describe, plus two or three
correspondences pairing an element of the Challenge with an element of the
article's subject. A Bridge is asked for one Parallel at a time and never exists
before the person asks. It is a quick check on whether an article is worth
reading, not an answer — it may be approximate, and when there is no real shared
structure no Bridge is produced and the person is told so instead.
_Avoid_: explanation, reason, insight, analogy (reserved — see Parallel)

**Embedding**:
The fixed-length vector produced from a piece of text by the one small model the
tool uses. The same model embeds Lead Sections at build time and Challenges in
the browser at search time.
_Avoid_: vector (when precision matters, prefer Embedding), encoding
