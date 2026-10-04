// Applied before PDF.js starts; keep this customization outside the vendor bundle.
const hostDocument = window.parent.document;
const syncTheme = () => {
  document.documentElement.dataset.theme = hostDocument.documentElement.dataset.theme || "light";
};
syncTheme();
new MutationObserver(syncTheme).observe(hostDocument.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

hostDocument.addEventListener("webviewerloaded", (event) => {
  if (event.detail.source !== window) return;
  const options = window.PDFViewerApplicationOptions;
  options.set("defaultUrl", "");
  options.set("defaultZoomValue", "page-width");
  options.set("sidebarViewOnLoad", 0);
  options.set("viewOnLoad", 1);
  options.set("disablePreferences", true);
  options.set("disableHistory", true);
  options.set("enableScripting", false);
  options.set("annotationEditorMode", -1);
});
