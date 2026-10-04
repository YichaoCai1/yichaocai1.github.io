document.querySelectorAll("[data-pdf-reader]").forEach((e) => {
  const t = new URLSearchParams(location.search),
    a = e.dataset.pdfFile || t.get("file"),
    r = e.querySelector("[data-pdf-status]");
  if (!a) return void (r.textContent = "Choose a PDF from the website to read it here.");
  let o;
  try {
    if (((o = new URL(a, location.href)), o.origin !== location.origin || !o.pathname.toLowerCase().endsWith(".pdf")))
      throw new Error("Invalid PDF URL");
  } catch {
    return void (r.textContent = "This reader opens PDF files hosted on this website.");
  }
  const d = e.dataset.pdfFile ? e.dataset.pdfTitle : t.get("title") || "PDF reader",
    n = document.querySelector("[data-pdf-heading]");
  n && (n.textContent = d);
  const i = e.querySelector("[data-pdf-download]");
  ((i.href = o.href), (i.hidden = !1));
  const s = e.querySelector("[data-pdf-frame]"),
    h = new URL(e.dataset.viewerUrl, location.href);
  (h.searchParams.set("file", o.href),
    (h.hash = "zoom=page-width"),
    (s.title = `${d} \u2014 PDF`),
    s.addEventListener("load", () => {
      r.hidden = !0;
    }),
    (s.src = h.href),
    (s.hidden = !1));
});
