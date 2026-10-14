import { FIELDS, fieldSlug } from "./fields.js";

/** @typedef {import("./search.js").Parallel} Parallel */
/** @typedef {import("./grouping.js").FieldGroup} FieldGroup */

/**
 * Fill a `<select>` with the given Fields, keeping whatever placeholder
 * `<option value="">` it already has as the first entry. Re-runnable: any
 * previously added Field options are replaced, so the shell can render
 * {@link FIELDS} immediately and then swap in the Corpus's Fields once loaded.
 *
 * @param {HTMLSelectElement} select
 * @param {readonly string[]} [fields]
 */
export function populateHomeFieldOptions(select, fields = FIELDS) {
  for (const option of [...select.options]) {
    if (option.value !== "") option.remove();
  }
  const fragment = document.createDocumentFragment();
  for (const field of fields) {
    const option = document.createElement("option");
    option.value = field;
    option.textContent = field;
    fragment.append(option);
  }
  select.append(fragment);
}

/**
 * A Field-coloured tag, e.g. on a Parallel card.
 * @param {string} field
 * @returns {HTMLSpanElement}
 */
export function fieldTag(field) {
  const tag = document.createElement("span");
  tag.className = `field-tag field-tag--${fieldSlug(field)}`;
  tag.textContent = field;
  return tag;
}

/**
 * One Parallel: linked title, Field tag, Closeness, and Lead Section.
 * @param {Parallel} parallel
 * @returns {HTMLLIElement}
 */
export function parallelCard(parallel) {
  const item = document.createElement("li");
  item.className = "parallel";

  const heading = document.createElement("h4");
  heading.className = "parallel__title";
  const link = document.createElement("a");
  link.href = parallel.url;
  link.textContent = parallel.title;
  link.rel = "noopener";
  link.target = "_blank";
  heading.append(link);

  const meta = document.createElement("p");
  meta.className = "parallel__meta";
  meta.append(fieldTag(parallel.field));
  const closeness = document.createElement("span");
  closeness.className = "parallel__closeness";
  closeness.textContent = `Closeness ${parallel.closeness}`;
  meta.append(closeness);

  const lead = document.createElement("p");
  lead.className = "parallel__lead";
  lead.textContent = parallel.leadSection;

  item.append(heading, meta, lead);
  return item;
}

/**
 * Replace the contents of `container` with the grouped Parallels. An empty
 * `groups` list renders a short "nothing found" note.
 * @param {HTMLElement} container
 * @param {FieldGroup[]} groups
 */
export function renderGroups(container, groups) {
  container.replaceChildren();

  if (groups.length === 0) {
    const note = document.createElement("p");
    note.className = "parallels-empty";
    note.textContent = "No Parallels for that Challenge. Try rephrasing it.";
    container.append(note);
    return;
  }

  for (const group of groups) {
    const section = document.createElement("section");
    section.className = "field-group";

    const heading = document.createElement("h3");
    heading.className = `field-group__heading field-group__heading--${fieldSlug(group.field)}`;
    heading.textContent = group.field;

    const list = document.createElement("ul");
    list.className = "parallel-list";
    for (const parallel of group.parallels) list.append(parallelCard(parallel));

    section.append(heading, list);
    container.append(section);
  }
}
