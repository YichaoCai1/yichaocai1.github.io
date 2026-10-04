const hostDocument = window.parent.document,
  syncTheme = () => {
    document.documentElement.dataset.theme = hostDocument.documentElement.dataset.theme || "light";
  };
(syncTheme(),
  new MutationObserver(syncTheme).observe(hostDocument.documentElement, { attributes: !0, attributeFilter: ["data-theme"] }),
  hostDocument.addEventListener("webviewerloaded", (e) => {
    if (e.detail.source !== window) return;
    const t = window.PDFViewerApplicationOptions;
    (t.set("defaultUrl", ""),
      t.set("defaultZoomValue", "page-width"),
      t.set("sidebarViewOnLoad", 0),
      t.set("viewOnLoad", 1),
      t.set("disablePreferences", !0),
      t.set("disableHistory", !0),
      t.set("enableScripting", !1),
      t.set("annotationEditorMode", -1));
  }));
