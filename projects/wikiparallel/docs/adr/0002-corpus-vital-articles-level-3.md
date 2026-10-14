# Corpus is Vital Articles Level 3, embedded from lead plus headings

The searchable set is the roughly 1,000 hand-curated articles on Wikipedia's
Vital Articles Level 3 list. Each article is represented by its Lead Section
concatenated with the list of its section headings, embedded once at build time
into a single vector.

We chose this over embedding the full English Wikipedia (about 7 million
articles, infeasible to embed or ship to a browser) and over full-article or
passage-chunked embedding (many more vectors and index complexity for a
prototype). The curated list is also already grouped into 11 sections, which
gives every article a clean Field label for free. Adding the section headings to
the embedded text is a near-free way to pull in signal that a bare first
paragraph (taxonomy, dates) often misses. The accepted downside: a real parallel
that lives deep in an article's body, with no matching heading, can be missed.
