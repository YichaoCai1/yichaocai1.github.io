document.addEventListener("DOMContentLoaded", () => {
  function e(e = !0) {
    const i = c.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let d = 0;
    for (const e of o) {
      const t =
        (!r || e.year === r) && Object.keys(n).every((t) => !s[t].size || l(e, t).some((e) => s[t].has(e))) && i.every((t) => e.text.includes(t));
      if (((e.item.hidden = !t), t && d++, e.abstract)) {
        const a = t && i.length > 0 && !i.every((t) => e.main.includes(t));
        (a && !e.abstract.open
          ? ((e.abstract.open = !0), (e.abstract.dataset.searchOpened = "true"))
          : !a && e.abstract.dataset.searchOpened && ((e.abstract.open = !1), delete e.abstract.dataset.searchOpened),
          e.element.querySelector('[data-publication-panel="' + e.abstract.id + '"]').setAttribute("aria-expanded", String(e.abstract.open)));
      }
    }
    (t.querySelectorAll("h2.bibliography").forEach((e) => {
      const t = e.nextElementSibling;
      e.hidden = t?.matches("ol.bibliography") && ![...t.children].some((e) => !e.hidden);
    }),
      t
        .querySelectorAll("[data-facet]")
        .forEach((e) => e.setAttribute("aria-pressed", String(e.dataset.value ? s[e.dataset.facet].has(e.dataset.value) : !s[e.dataset.facet].size))),
      t.querySelectorAll(".publication-year").forEach((e) => e.setAttribute("aria-pressed", String(e.dataset.year === r))),
      (t.querySelector(".publication-count").textContent = a
        ? d + " / " + o.length + " \u7bc7\u8bba\u6587"
        : d + " of " + o.length + " publications"),
      (t.querySelector(".publication-empty").hidden = 0 !== d),
      e && b());
  }
  document.addEventListener("click", async (e) => {
    const t = e.target.closest("[data-publication-panel]");
    if (t) {
      const e = document.getElementById(t.dataset.publicationPanel);
      if (!e) return;
      ((e.open = !e.open), t.setAttribute("aria-expanded", String(e.open)), delete e.dataset.searchOpened);
    }
    const a = e.target.closest("[data-copy-bib]");
    if (a) {
      const e = document.getElementById(a.dataset.copyBib),
        t = a.parentElement.querySelector(".copy-status");
      try {
        (await navigator.clipboard.writeText(e.textContent.trim()), (t.textContent = " Copied"));
      } catch {
        t.textContent = " Select the citation below to copy.";
      }
    }
  });
  const t = document.querySelector("[data-publication-catalogue]");
  if (!t) return;
  const a = "zh" === document.documentElement.lang,
    n = {
      type: a ? "\u7c7b\u578b" : "Type",
      methods: a ? "\u65b9\u6cd5" : "Method",
      topics: a ? "\u4e3b\u9898" : "Topic",
      domains: a ? "\u9886\u57df" : "Domain",
    },
    o = [...t.querySelectorAll(".publication-entry")].map((e) => {
      const t = JSON.parse(e.dataset.facets || "{}"),
        a = [".publication-title", ".author", ".periodical", ".publication-tags"]
          .map((t) => e.querySelector(t)?.textContent || "")
          .join(" ")
          .toLowerCase(),
        n = e.querySelector(".abstract-panel");
      return {
        element: e,
        item: e.closest("li"),
        year: e.dataset.year,
        facets: t,
        main: a,
        abstract: n,
        text: a + " " + (n?.textContent || "").toLowerCase(),
      };
    }),
    c = t.querySelector(".publication-search"),
    s = Object.fromEntries(Object.keys(n).map((e) => [e, new Set()]));
  let r = "";
  const l = (e, t) => ("type" === t ? [e.facets.type] : e.facets[t] || []),
    i = (e, t) => {
      const a = document.createElement("button");
      return ((a.type = "button"), (a.className = t), (a.textContent = e), a);
    };
  for (const [e, c] of Object.entries(n)) {
    const n = document.createElement("div");
    ((n.className = "publication-filter-row"), n.setAttribute("role", "group"), n.setAttribute("aria-label", c));
    const s = document.createElement("span");
    ((s.className = "publication-filter-label"), (s.textContent = c), n.append(s));
    const r = [...new Set(o.flatMap((t) => l(t, e)))].filter(Boolean).sort();
    for (const t of ["", ...r]) {
      const o = i(t || (a ? "\u5168\u90e8" : "All"), "publication-filter");
      ((o.dataset.facet = e), (o.dataset.value = t), t && (o.dataset.tag = t), o.setAttribute("aria-pressed", String(!t)), n.append(o));
    }
    t.querySelector(".publication-facets").append(n);
  }
  const d = [...new Set(o.map((e) => e.year))].sort(),
    p = Math.max(...d.map((e) => o.filter((t) => t.year === e).length));
  for (const e of d) {
    const n = o.filter((t) => t.year === e).length,
      c = i("", "publication-year");
    ((c.dataset.year = e), c.setAttribute("aria-label", e + ": " + n + (a ? " \u7bc7\u8bba\u6587" : " publications")));
    const s = document.createElement("span");
    s.textContent = n;
    const r = document.createElement("span");
    r.className = "year-track";
    const l = document.createElement("span");
    ((l.className = "year-bar"), l.style.setProperty("--bar-height", (n / p) * 68 + "px"), r.append(l));
    const d = document.createElement("span");
    ((d.textContent = e), c.append(s, r, d), t.querySelector(".publication-chart").append(c));
  }
  const u = () => {
      const e = new URLSearchParams(location.search);
      ((c.value = e.get("q") || ""), (r = d.includes(e.get("year")) ? e.get("year") : ""));
      for (const t of Object.keys(n)) {
        s[t].clear();
        const a = new Set(o.flatMap((e) => l(e, t)));
        e.getAll(t)
          .filter((e) => a.has(e))
          .forEach((e) => s[t].add(e));
      }
    },
    b = () => {
      const e = new URL(location.href);
      for (const t of ["q", "year", ...Object.keys(n)]) e.searchParams.delete(t);
      (c.value.trim() && e.searchParams.set("q", c.value.trim()), r && e.searchParams.set("year", r));
      for (const t of Object.keys(n)) for (const a of s[t]) e.searchParams.append(t, a);
      history.replaceState(null, "", e);
    },
    m = () => {
      ((c.value = ""), (r = ""), Object.values(s).forEach((e) => e.clear()));
    };
  (t.addEventListener("click", (t) => {
    const a = t.target.closest("button");
    if (a)
      if (a.dataset.facet) {
        const t = s[a.dataset.facet],
          n = a.dataset.value;
        (n ? (t.has(n) ? t.delete(n) : t.add(n)) : t.clear(), e());
      } else
        a.classList.contains("publication-year")
          ? ((r = r === a.dataset.year ? "" : a.dataset.year), e())
          : a.classList.contains("publication-reset") && (m(), e());
  }),
    c.addEventListener("input", () => e()),
    window.addEventListener("popstate", () => {
      (u(), e(!1));
    }));
  const y = () => {
    let t;
    try {
      t = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const a = o.find((e) => e.element.id === t);
    a?.item.hidden && (m(), e(), a.element.scrollIntoView());
  };
  (window.addEventListener("hashchange", y), u(), e(!1), y(), (t.querySelector(".publication-tools").hidden = !1));
});
