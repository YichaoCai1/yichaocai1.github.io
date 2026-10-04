document.addEventListener("DOMContentLoaded", () => {
  const e = document.querySelector(".essay-content");
  if (!e || document.body.classList.contains("reading-list-page")) return;
  const t = e.querySelector("nav.toc"),
    n = [...e.querySelectorAll("h2, h3")].filter((e) => !e.closest("nav"));
  if (!t && n.length >= 2) {
    const t = document.createElement("details");
    t.className = "essay-toc";
    const o = document.createElement("summary");
    o.textContent = "On this page";
    const c = document.createElement("ol");
    (n.forEach((e, t) => {
      const n = e.id ? e : e.closest("section[id]") || e;
      if (!n.id) {
        let e = "essay-section-" + (t + 1);
        for (; document.getElementById(e);) e += "-section";
        n.id = e;
      }
      const o = e.cloneNode(!0);
      o.querySelectorAll(".anchor").forEach((e) => e.remove());
      const s = document.createElement("li");
      s.className = "H3" === e.tagName ? "depth-3" : "depth-2";
      const a = document.createElement("a");
      ((a.href = "#" + n.id), (a.textContent = o.textContent.trim()), s.append(a), c.append(s));
    }),
      t.append(o, c));
    const s = e.querySelector("h1"),
      a = s?.closest("header");
    (a || s)?.after(t);
  }
  const o = document.createElement("a");
  ((o.className = "essay-back-link"), (o.href = "/blog/"), (o.textContent = "\u2190 Back to Blog"), e.append(o));
});
