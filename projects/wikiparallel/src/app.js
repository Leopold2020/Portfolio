import { normalizeChallenge, challengeReady } from "./challenge.js";
import { FIELDS, fieldsFromCorpus } from "./fields.js";
import { PAGE_SIZE, groupByField } from "./grouping.js";
import { search } from "./search.js";
import { CorpusMissingError } from "./corpus.js";
import { createModelProgress } from "./model-progress.js";
import { populateHomeFieldOptions, renderGroups } from "./render.js";

/** @typedef {import("./ranker.js").CorpusArticle} CorpusArticle */
/** @typedef {import("./search.js").Parallel} Parallel */

/**
 * @typedef {object} AppDeps
 * @property {Document} document
 * @property {() => Promise<CorpusArticle[]>} loadCorpus  Resolves to the Corpus,
 *   or rejects (a {@link CorpusMissingError} when `corpus.json` is absent).
 * @property {(text: string, options?: { onProgress?: (event: object) => void }) => Promise<number[]>} embed
 *   Embeds the Challenge in the browser.
 */

/**
 * @typedef {object} AppHandle
 * @property {Promise<void>} corpusLoaded  Settles when the initial Corpus load
 *   finishes, whether it succeeded or failed.
 * @property {() => Promise<unknown>} idle  Resolves when no search or "Show 6
 *   more" is in flight. Used by tests to await the async pipeline.
 */

/**
 * Wire the search UI to the real pipeline: load the Corpus once on start, then
 * on each search embed the Challenge in the browser and rank the Corpus against
 * it. "Show 6 more" re-ranks at the next offset, reusing the Challenge
 * Embedding, so it never re-embeds or re-downloads anything.
 *
 * @param {AppDeps} deps
 * @returns {AppHandle}
 */
export function initApp({ document, loadCorpus, embed }) {
  const form = /** @type {HTMLFormElement} */ (document.getElementById("search-form"));
  const challengeInput = /** @type {HTMLTextAreaElement} */ (document.getElementById("challenge"));
  const homeFieldSelect = /** @type {HTMLSelectElement} */ (document.getElementById("home-field"));
  const searchButton = /** @type {HTMLButtonElement} */ (document.getElementById("search-button"));
  const parallelsRegion = /** @type {HTMLElement} */ (document.getElementById("parallels"));
  const showMoreButton = /** @type {HTMLButtonElement} */ (document.getElementById("show-more"));
  const modelStatus = /** @type {HTMLElement} */ (document.getElementById("model-status"));
  const modelStatusText = /** @type {HTMLElement} */ (document.getElementById("model-status-text"));
  const modelStatusBar = /** @type {HTMLProgressElement} */ (document.getElementById("model-status-bar"));

  const state = {
    /** @type {CorpusArticle[] | null} */
    corpus: null,
    /** @type {Error | null} */
    corpusError: null,
    /** @type {readonly string[]} The valid Home Fields; from the Corpus once loaded. */
    fields: FIELDS,
    /** @type {number[] | null} */
    challengeEmbedding: null,
    /** @type {string} */
    challenge: "",
    /** @type {string} */
    homeField: "",
    /** @type {Parallel[]} */
    shown: [],
    /** @type {number} How many Parallels have been requested so far. */
    offset: 0,
    /** @type {boolean} */
    hasMore: false,
    /** @type {boolean} Set once the model has finished loading. */
    modelReady: false,
  };

  // The shell shows the fallback Fields at once; the Corpus's own Field list
  // replaces them as soon as it loads.
  populateHomeFieldOptions(homeFieldSelect, state.fields);

  // One promise chain serialises everything: the initial Corpus load, then each
  // search and "Show 6 more" in the order the person triggers them.
  /** @type {Promise<unknown>} */
  let pending = loadCorpus().then(
    (corpus) => {
      state.corpus = corpus;
      state.fields = fieldsFromCorpus(corpus);
      const chosen = homeFieldSelect.value;
      populateHomeFieldOptions(homeFieldSelect, state.fields);
      if (state.fields.includes(chosen)) homeFieldSelect.value = chosen;
      syncSearchButton();
    },
    (error) => {
      state.corpusError = error instanceof Error ? error : new Error(String(error));
      renderCorpusError(state.corpusError);
    },
  );

  function syncSearchButton() {
    const ready = challengeReady(
      { challenge: challengeInput.value, homeField: homeFieldSelect.value },
      state.fields,
    );
    searchButton.disabled = !ready || state.corpusError !== null;
  }

  /** @param {number | null} percent */
  function paintModelProgress(percent) {
    modelStatus.hidden = false;
    if (percent === null) {
      modelStatusBar.removeAttribute("value");
      modelStatusText.textContent = "Downloading the embedding model (first visit only)…";
    } else {
      modelStatusBar.value = percent;
      modelStatusText.textContent = `Downloading the embedding model… ${percent}%`;
    }
  }

  function paint() {
    renderGroups(parallelsRegion, groupByField(state.shown, state.fields));
    showMoreButton.hidden = !state.hasMore;
  }

  /** @param {string} message */
  function renderNotice(message) {
    const note = document.createElement("p");
    note.className = "parallels-empty";
    note.textContent = message;
    parallelsRegion.replaceChildren(note);
  }

  /** @param {Error} error */
  function renderCorpusError(error) {
    parallelsRegion.setAttribute("aria-busy", "false");
    modelStatus.hidden = true;
    showMoreButton.hidden = true;
    renderNotice(
      error instanceof CorpusMissingError
        ? "The Corpus isn’t built yet. Run `npm run build` to fetch and embed the Wikipedia articles into corpus.json, then reload this page."
        : `Couldn’t load the Corpus: ${error.message}`,
    );
    syncSearchButton();
  }

  async function performSearch() {
    const challenge = normalizeChallenge(challengeInput.value);
    challengeInput.value = challenge;
    if (!challengeReady({ challenge, homeField: homeFieldSelect.value }, state.fields)) return;
    if (state.corpusError) {
      renderCorpusError(state.corpusError);
      return;
    }
    if (!state.corpus) return;

    state.challenge = challenge;
    state.homeField = homeFieldSelect.value;
    state.challengeEmbedding = null;
    state.shown = [];
    state.offset = 0;

    parallelsRegion.setAttribute("aria-busy", "true");
    searchButton.disabled = true;
    const progress = createModelProgress();

    try {
      const result = await search(
        challenge,
        /** @type {any} */ (state.homeField),
        { corpus: state.corpus, embed },
        {
          offset: 0,
          onProgress: (event) => {
            if (state.modelReady) return;
            paintModelProgress(progress.update(event));
          },
        },
      );
      state.modelReady = true;
      modelStatus.hidden = true;
      state.challengeEmbedding = result.challengeEmbedding;
      state.shown = result.parallels;
      state.hasMore = result.hasMore;
      paint();
    } catch (error) {
      modelStatus.hidden = true;
      // The search failed, so the old Parallels (for a different Challenge) must
      // not stay on screen and "Show 6 more" must not linger.
      state.shown = [];
      state.hasMore = false;
      showMoreButton.hidden = true;
      renderNotice(
        `Something went wrong running the search: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    } finally {
      parallelsRegion.setAttribute("aria-busy", "false");
      syncSearchButton();
    }
  }

  async function performShowMore() {
    if (!state.corpus || !state.challengeEmbedding) return;

    const nextOffset = state.offset + PAGE_SIZE;
    showMoreButton.disabled = true;
    try {
      const result = await search(
        state.challenge,
        /** @type {any} */ (state.homeField),
        { corpus: state.corpus, embed },
        { offset: nextOffset, challengeEmbedding: state.challengeEmbedding },
      );
      state.offset = nextOffset;
      state.shown = [...state.shown, ...result.parallels];
      state.hasMore = result.hasMore;
      paint();
    } catch (error) {
      // The ranker is pure and the Embedding is already in hand, so this is
      // unexpected. Append the message rather than replacing the Parallels
      // already on screen, which are still valid.
      const note = document.createElement("p");
      note.className = "parallels-empty";
      note.textContent = `Couldn’t load more Parallels: ${
        error instanceof Error ? error.message : String(error)
      }`;
      parallelsRegion.append(note);
      showMoreButton.hidden = true;
    } finally {
      showMoreButton.disabled = false;
    }
  }

  /** Queue `task` after whatever is already running, and expose it via {@link idle}. */
  function enqueue(/** @type {() => Promise<unknown>} */ task) {
    pending = pending.then(task, task);
    return pending;
  }

  challengeInput.addEventListener("input", syncSearchButton);
  homeFieldSelect.addEventListener("change", syncSearchButton);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    enqueue(performSearch);
  });

  // Enter runs the search from either control. The textarea would otherwise
  // insert a newline (Shift+Enter still does); the select would otherwise do
  // nothing in some browsers.
  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    const target = event.target;
    if (target === challengeInput || target === homeFieldSelect) {
      event.preventDefault();
      enqueue(performSearch);
    }
  });

  showMoreButton.addEventListener("click", () => {
    enqueue(performShowMore);
  });

  syncSearchButton();

  return {
    corpusLoaded: pending.then(() => undefined),
    idle: () => pending,
  };
}
