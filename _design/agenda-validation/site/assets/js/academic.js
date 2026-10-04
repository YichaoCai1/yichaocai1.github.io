document.addEventListener("DOMContentLoaded", () => {
  const e = document.querySelector("script[data-pdf-reader-url]")?.dataset.pdfReaderUrl;
  e &&
    document.querySelectorAll("a[href]:not([download])").forEach((t) => {
      const n = new URL(t.href, location.href);
      if (n.origin !== location.origin || !n.pathname.toLowerCase().endsWith(".pdf")) return;
      const o = new URL(e, location.href);
      o.searchParams.set("file", n.href);
      const r = t.getAttribute("title") || t.getAttribute("aria-label") || t.textContent.trim();
      (r && o.searchParams.set("title", r), (t.href = o.href));
    });
  const t = document.querySelector(".academic-header"),
    n = document.querySelector(".nav-menu-toggle"),
    o = document.querySelector(".academic-nav-links"),
    r = () => {
      (n?.setAttribute("aria-expanded", "false"), t?.classList.remove("menu-open"));
    };
  (n?.addEventListener("click", () => {
    const e = "true" !== n.getAttribute("aria-expanded");
    (n.setAttribute("aria-expanded", String(e)), t.classList.toggle("menu-open", e));
  }),
    o?.addEventListener("click", (e) => {
      e.target.closest("a") && r();
    }),
    document.addEventListener("keydown", (e) => {
      "Escape" === e.key && "true" === n?.getAttribute("aria-expanded") && (r(), n.focus());
    }),
    window.matchMedia("(min-width: 916px)").addEventListener("change", r),
    document.querySelectorAll(".news-scroll").forEach((e) => {
      const t = () => {
        const t = [...e.querySelectorAll(".sidebar-news-item")];
        if (t.length <= 3) return void (e.style.maxHeight = "none");
        const n = t[2].getBoundingClientRect().bottom - t[0].getBoundingClientRect().top + "px";
        e.style.maxHeight !== n && (e.style.maxHeight = n);
      };
      (t(), document.fonts.ready.then(t));
      const n = new ResizeObserver(t);
      e.querySelectorAll(".sidebar-news-item").forEach((e) => n.observe(e));
    }));
  const a = () => {
    if (!document.querySelector(".academic-home") || !location.hash) return;
    let e;
    try {
      e = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    if (document.getElementById(e)) return;
    if ("teaching" === e || "service" === e) {
      const t = document.documentElement.lang.startsWith("zh") ? "/zh/" : "/";
      return void location.replace(t + e + "/");
    }
    const t = document.querySelector("a[data-publication-keys]");
    t?.dataset.publicationKeys.split("|").includes(e) && location.replace(t.href + "#" + encodeURIComponent(e));
  };
  (window.addEventListener("hashchange", a), a());
});
