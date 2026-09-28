// Add a compact contents disclosure without moving or replacing article content.
document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector(".essay-content");
  if (!root || document.body.classList.contains("reading-list-page")) return;
  const existing = root.querySelector("nav.toc");
  const headings = [...root.querySelectorAll("h2, h3")].filter((heading) => !heading.closest("nav"));
  if (!existing && headings.length >= 2) {
    const toc = document.createElement("details");
    toc.className = "essay-toc";
    const summary = document.createElement("summary");
    summary.textContent = "On this page";
    const list = document.createElement("ol");
    headings.forEach((heading, index) => {
      // Prefer an existing section id, so previously shared anchors keep working.
      const target = heading.id ? heading : heading.closest("section[id]") || heading;
      if (!target.id) {
        let id = "essay-section-" + (index + 1);
        while (document.getElementById(id)) id += "-section";
        target.id = id;
      }
      const text = heading.cloneNode(true);
      text.querySelectorAll(".anchor").forEach((anchor) => anchor.remove());
      const item = document.createElement("li");
      item.className = heading.tagName === "H3" ? "depth-3" : "depth-2";
      const link = document.createElement("a");
      link.href = "#" + target.id;
      link.textContent = text.textContent.trim();
      item.append(link);
      list.append(item);
    });
    toc.append(summary, list);
    const title = root.querySelector("h1");
    const articleHeader = title?.closest("header");
    (articleHeader || title)?.after(toc);
  }
  const back = document.createElement("a");
  back.className = "essay-back-link";
  back.href = "/blog/";
  back.textContent = "← Back to Blog";
  root.append(back);
});
