/** @typedef {import("../src/ranker.js").CorpusArticle} CorpusArticle */

/**
 * A Challenge Embedding pointing straight along the first axis. Paired with
 * {@link embeddingAt}, the cosine similarity of any fixture article with this
 * Challenge is exactly the number written in the fixture, which keeps the
 * expected orderings readable.
 * @type {number[]}
 */
export const CHALLENGE = [1, 0];

/**
 * A 2-D unit Embedding whose cosine similarity with {@link CHALLENGE} is `sim`.
 * @param {number} sim  Between 0 and 1.
 * @returns {number[]}
 */
const embeddingAt = (sim) => [sim, Math.sqrt(1 - sim * sim)];

/**
 * @param {string} title
 * @param {string} field
 * @param {number} sim  Similarity with {@link CHALLENGE}.
 * @returns {CorpusArticle}
 */
const article = (title, field, sim) => ({
  title,
  url: `https://en.wikipedia.org/wiki/${title.replace(/ /g, "_")}`,
  field,
  leadSection: `Lead Section of ${title}.`,
  embedding: embeddingAt(sim),
});

/**
 * Hand-built Corpus: 15 articles across 6 Fields, each with a chosen Embedding.
 * Two articles sit in Technology — the Home Field for most tests — leaving 13
 * candidates spread across 5 Fields.
 *
 * Similarities with {@link CHALLENGE}, non-Technology, descending:
 *
 *   0.95 Homeostasis            Science
 *   0.92 Control theory         Mathematics
 *   0.88 Jazz improvisation     Arts
 *   0.82 Triage                 Health, medicine and disease
 *   0.80 Immune system          Science
 *   0.75 Berlin Blockade        History
 *   0.70 Queueing theory        Mathematics
 *   0.60 Call and response      Arts
 *   0.55 Ecological resilience  Science
 *   0.50 Percolation theory     Mathematics
 *   0.45 Chiaroscuro            Arts
 *   0.40 Roman dictator         History
 *   0.35 Sepsis                 Health, medicine and disease
 *
 * @type {CorpusArticle[]}
 */
export const FIXTURE_CORPUS = [
  article("Load balancing", "Technology", 0.99),
  article("Circuit breaker design pattern", "Technology", 0.85),
  article("Homeostasis", "Science", 0.95),
  article("Immune system", "Science", 0.8),
  article("Ecological resilience", "Science", 0.55),
  article("Control theory", "Mathematics", 0.92),
  article("Queueing theory", "Mathematics", 0.7),
  article("Percolation theory", "Mathematics", 0.5),
  article("Jazz improvisation", "Arts", 0.88),
  article("Call and response", "Arts", 0.6),
  article("Chiaroscuro", "Arts", 0.45),
  article("Berlin Blockade", "History", 0.75),
  article("Roman dictator", "History", 0.4),
  article("Triage", "Health, medicine and disease", 0.82),
  article("Sepsis", "Health, medicine and disease", 0.35),
];

/**
 * A degenerate Corpus: once Science (the Home Field) is excluded, only two
 * Fields have any candidate, so the spread rule and the per-Field cap cannot
 * both hold.
 *
 *   0.90 Queueing theory     Mathematics
 *   0.85 Jazz improvisation  Arts
 *   0.80 Control theory      Mathematics
 *   0.75 Collage             Arts
 *   0.70 Graph theory        Mathematics
 *   0.60 Game theory         Mathematics
 *   0.50 Sfumato             Arts
 *
 * @type {CorpusArticle[]}
 */
export const NARROW_CORPUS = [
  article("Homeostasis", "Science", 0.99),
  article("Queueing theory", "Mathematics", 0.9),
  article("Control theory", "Mathematics", 0.8),
  article("Graph theory", "Mathematics", 0.7),
  article("Game theory", "Mathematics", 0.6),
  article("Jazz improvisation", "Arts", 0.85),
  article("Collage", "Arts", 0.75),
  article("Sfumato", "Arts", 0.5),
];

/**
 * A Corpus where the six closest non-Home candidates all sit in just two Fields,
 * so the spread rule has to reach past them for a distant third and fourth
 * Field. Exercises the deliberate trade-off in ADR 0003: a weaker but more
 * distant Parallel displaces a stronger same-Field one to the next page.
 *
 *   0.95 Thermodynamics   Science
 *   0.92 Linear algebra   Mathematics
 *   0.90 Fluid dynamics   Science
 *   0.88 Topology         Mathematics
 *   0.85 Optics           Science
 *   0.84 Number theory    Mathematics
 *   0.30 Cubism           Arts
 *   0.25 Bronze Age       History
 *
 * @type {CorpusArticle[]}
 */
export const CLUSTERED_CORPUS = [
  article("Distributed computing", "Technology", 0.99),
  article("Thermodynamics", "Science", 0.95),
  article("Fluid dynamics", "Science", 0.9),
  article("Optics", "Science", 0.85),
  article("Linear algebra", "Mathematics", 0.92),
  article("Topology", "Mathematics", 0.88),
  article("Number theory", "Mathematics", 0.84),
  article("Cubism", "Arts", 0.3),
  article("Bronze Age", "History", 0.25),
];
