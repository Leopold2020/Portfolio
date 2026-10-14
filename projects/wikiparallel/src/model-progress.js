/**
 * Fold `transformers.js` `progress_callback` events into a single 0–100 number
 * for the model-download bar.
 *
 * The library reports progress per file (the tokenizer, the config, the ONNX
 * weights). This tracks the latest percentage seen for each file and reports
 * their mean, clamped so the number never decreases — a new file registering
 * mid-download would otherwise drag the mean down and jerk the bar backwards.
 * It returns `null` until the first real `progress` event, so the caller can
 * show an indeterminate bar while the downloads are still starting.
 */
export function createModelProgress() {
  /** @type {Map<string, number>} */
  const perFile = new Map();
  let reported = 0;

  return {
    /**
     * @param {{ status?: string, file?: string, progress?: number }} event
     * @returns {number | null}  Overall percent (monotonic non-decreasing), or
     *                           `null` before any file has reported progress.
     */
    update(event) {
      if (event && event.status === "progress" && typeof event.file === "string") {
        perFile.set(event.file, clamp(event.progress));
      }
      if (perFile.size === 0) return null;
      const total = [...perFile.values()].reduce((sum, pct) => sum + pct, 0);
      reported = Math.max(reported, Math.round(total / perFile.size));
      return reported;
    },
  };
}

/**
 * @param {unknown} n
 * @returns {number}
 */
function clamp(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
