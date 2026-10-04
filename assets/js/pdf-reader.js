// Use a self-hosted PDF.js reader on desktop and mobile, with an explicit download.
document.querySelectorAll("[data-pdf-reader]").forEach((reader) => {
  const params = new URLSearchParams(location.search);
  const file = reader.dataset.pdfFile || params.get("file");
  const status = reader.querySelector("[data-pdf-status]");
  if (!file) {
    status.textContent = "Choose a PDF from the website to read it here.";
    return;
  }

  let url;
  try {
    url = new URL(file, location.href);
    if (url.origin !== location.origin || !url.pathname.toLowerCase().endsWith(".pdf")) throw new Error("Invalid PDF URL");
  } catch {
    status.textContent = "This reader opens PDF files hosted on this website.";
    return;
  }

  const title = reader.dataset.pdfFile ? reader.dataset.pdfTitle : params.get("title") || "PDF reader";
  const heading = document.querySelector("[data-pdf-heading]");
  if (heading) heading.textContent = title;
  const download = reader.querySelector("[data-pdf-download]");
  download.href = url.href;
  download.hidden = false;

  const frame = reader.querySelector("[data-pdf-frame]");
  const viewer = new URL(reader.dataset.viewerUrl, location.href);
  viewer.searchParams.set("file", url.href);
  viewer.hash = "zoom=page-width";
  frame.title = `${title} — PDF`;
  frame.addEventListener("load", () => {
    status.hidden = true;
  });
  frame.src = viewer.href;
  frame.hidden = false;
});
