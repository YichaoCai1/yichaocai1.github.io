// Publication cards are server-rendered; filtering never replaces their content or links.
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", async (event) => {
    const toggle = event.target.closest("[data-publication-panel]");
    if (toggle) {
      const panel = document.getElementById(toggle.dataset.publicationPanel);
      if (!panel) return;
      panel.open = !panel.open;
      toggle.setAttribute("aria-expanded", String(panel.open));
      delete panel.dataset.searchOpened;
    }
    const copy = event.target.closest("[data-copy-bib]");
    if (copy) {
      const citation = document.getElementById(copy.dataset.copyBib);
      const status = copy.parentElement.querySelector(".copy-status");
      try {
        await navigator.clipboard.writeText(citation.textContent.trim());
        status.textContent = " Copied";
      } catch {
        status.textContent = " Select the citation below to copy.";
      }
    }
  });
  const root = document.querySelector("[data-publication-catalogue]");
  if (!root) return;
  const zh = document.documentElement.lang === "zh";
  const groups = { type: zh ? "类型" : "Type", methods: zh ? "方法" : "Method", topics: zh ? "主题" : "Topic", domains: zh ? "领域" : "Domain" };
  const records = [...root.querySelectorAll(".publication-entry")].map((element) => {
    const facets = JSON.parse(element.dataset.facets || "{}");
    const main = [".publication-title", ".author", ".periodical", ".publication-tags"]
      .map((selector) => element.querySelector(selector)?.textContent || "")
      .join(" ")
      .toLowerCase();
    const abstract = element.querySelector(".abstract-panel");
    return {
      element,
      item: element.closest("li"),
      year: element.dataset.year,
      facets,
      main,
      abstract,
      text: main + " " + (abstract?.textContent || "").toLowerCase(),
    };
  });
  const search = root.querySelector(".publication-search");
  const selection = Object.fromEntries(Object.keys(groups).map((key) => [key, new Set()]));
  let year = "";
  const valuesFor = (record, group) => (group === "type" ? [record.facets.type] : record.facets[group] || []);
  const makeButton = (text, className) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = text;
    return button;
  };
  for (const [group, label] of Object.entries(groups)) {
    const row = document.createElement("div");
    row.className = "publication-filter-row";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", label);
    const heading = document.createElement("span");
    heading.className = "publication-filter-label";
    heading.textContent = label;
    row.append(heading);
    const values = [...new Set(records.flatMap((record) => valuesFor(record, group)))].filter(Boolean).sort();
    for (const value of ["", ...values]) {
      const button = makeButton(value || (zh ? "全部" : "All"), "publication-filter");
      button.dataset.facet = group;
      button.dataset.value = value;
      if (value) button.dataset.tag = value;
      button.setAttribute("aria-pressed", String(!value));
      row.append(button);
    }
    root.querySelector(".publication-facets").append(row);
  }
  const years = [...new Set(records.map((record) => record.year))].sort();
  const maximum = Math.max(...years.map((value) => records.filter((record) => record.year === value).length));
  for (const value of years) {
    const count = records.filter((record) => record.year === value).length;
    const button = makeButton("", "publication-year");
    button.dataset.year = value;
    button.setAttribute("aria-label", value + ": " + count + (zh ? " 篇论文" : " publications"));
    const number = document.createElement("span");
    number.textContent = count;
    const track = document.createElement("span");
    track.className = "year-track";
    const bar = document.createElement("span");
    bar.className = "year-bar";
    bar.style.setProperty("--bar-height", (count / maximum) * 68 + "px");
    track.append(bar);
    const label = document.createElement("span");
    label.textContent = value;
    button.append(number, track, label);
    root.querySelector(".publication-chart").append(button);
  }
  const readURL = () => {
    const params = new URLSearchParams(location.search);
    search.value = params.get("q") || "";
    year = years.includes(params.get("year")) ? params.get("year") : "";
    for (const group of Object.keys(groups)) {
      selection[group].clear();
      const allowed = new Set(records.flatMap((record) => valuesFor(record, group)));
      params
        .getAll(group)
        .filter((value) => allowed.has(value))
        .forEach((value) => selection[group].add(value));
    }
  };
  const syncURL = () => {
    const url = new URL(location.href);
    for (const name of ["q", "year", ...Object.keys(groups)]) url.searchParams.delete(name);
    if (search.value.trim()) url.searchParams.set("q", search.value.trim());
    if (year) url.searchParams.set("year", year);
    for (const group of Object.keys(groups)) for (const value of selection[group]) url.searchParams.append(group, value);
    history.replaceState(null, "", url);
  };
  function render(updateURL = true) {
    const terms = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const record of records) {
      const visible =
        (!year || record.year === year) &&
        Object.keys(groups).every((group) => !selection[group].size || valuesFor(record, group).some((value) => selection[group].has(value))) &&
        terms.every((term) => record.text.includes(term));
      record.item.hidden = !visible;
      if (visible) count++;
      if (record.abstract) {
        const abstractMatch = visible && terms.length > 0 && !terms.every((term) => record.main.includes(term));
        if (abstractMatch && !record.abstract.open) {
          record.abstract.open = true;
          record.abstract.dataset.searchOpened = "true";
        } else if (!abstractMatch && record.abstract.dataset.searchOpened) {
          record.abstract.open = false;
          delete record.abstract.dataset.searchOpened;
        }
        record.element
          .querySelector('[data-publication-panel="' + record.abstract.id + '"]')
          .setAttribute("aria-expanded", String(record.abstract.open));
      }
    }
    root.querySelectorAll("h2.bibliography").forEach((heading) => {
      const list = heading.nextElementSibling;
      heading.hidden = list?.matches("ol.bibliography") && ![...list.children].some((item) => !item.hidden);
    });
    root
      .querySelectorAll("[data-facet]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.value ? selection[button.dataset.facet].has(button.dataset.value) : !selection[button.dataset.facet].size)
        )
      );
    root.querySelectorAll(".publication-year").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.year === year)));
    root.querySelector(".publication-count").textContent = zh
      ? count + " / " + records.length + " 篇论文"
      : count + " of " + records.length + " publications";
    root.querySelector(".publication-empty").hidden = count !== 0;
    if (updateURL) syncURL();
  }
  const reset = () => {
    search.value = "";
    year = "";
    Object.values(selection).forEach((values) => values.clear());
  };
  root.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.facet) {
      const values = selection[button.dataset.facet],
        value = button.dataset.value;
      if (!value) values.clear();
      else if (values.has(value)) values.delete(value);
      else values.add(value);
      render();
    } else if (button.classList.contains("publication-year")) {
      year = year === button.dataset.year ? "" : button.dataset.year;
      render();
    } else if (button.classList.contains("publication-reset")) {
      reset();
      render();
    }
  });
  search.addEventListener("input", () => render());
  window.addEventListener("popstate", () => {
    readURL();
    render(false);
  });
  const revealAnchor = () => {
    let id;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const record = records.find((item) => item.element.id === id);
    if (record?.item.hidden) {
      reset();
      render();
      record.element.scrollIntoView();
    }
  };
  window.addEventListener("hashchange", revealAnchor);
  readURL();
  render(false);
  revealAnchor();
  root.querySelector(".publication-tools").hidden = false;
});
