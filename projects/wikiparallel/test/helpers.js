import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/** @typedef {import("../src/search.js").Parallel} Parallel */

/**
 * Build a Parallel for tests, filling any field left unspecified.
 * @param {Partial<Parallel>} [p]
 * @returns {Parallel}
 */
export const makeParallel = (p = {}) => ({
  title: p.title ?? "Untitled",
  url: p.url ?? "https://en.wikipedia.org/wiki/Untitled",
  field: p.field ?? "Science",
  leadSection: p.leadSection ?? "Lead.",
  closeness: p.closeness ?? 50,
});

/**
 * Run `body` with a fresh temp directory, removed afterwards whether it throws
 * or not. Used by tests that exercise the on-disk API cache.
 *
 * @template T
 * @param {(dir: string) => Promise<T>} body
 * @returns {Promise<T>}
 */
export async function withTempDir(body) {
  const dir = await mkdtemp(path.join(tmpdir(), "wikiparallel-"));
  try {
    return await body(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
