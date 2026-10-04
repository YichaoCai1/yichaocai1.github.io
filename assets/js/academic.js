// Shared fixed navigation, including standalone essays.
document.addEventListener("DOMContentLoaded", () => {
  // Keep local PDFs in the site's reader; explicit download links remain downloads.
  const pdfReaderUrl = document.querySelector("script[data-pdf-reader-url]")?.dataset.pdfReaderUrl;
  if (pdfReaderUrl) {
    document.querySelectorAll("a[href]:not([download])").forEach((link) => {
      const file = new URL(link.href, location.href);
      if (file.origin !== location.origin || !file.pathname.toLowerCase().endsWith(".pdf")) return;
      const reader = new URL(pdfReaderUrl, location.href);
      reader.searchParams.set("file", file.href);
      const title = link.getAttribute("title") || link.getAttribute("aria-label") || link.textContent.trim();
      if (title) reader.searchParams.set("title", title);
      link.href = reader.href;
    });
  }

  const header = document.querySelector(".academic-header");
  const menu = document.querySelector(".nav-menu-toggle");
  const links = document.querySelector(".academic-nav-links");
  const closeMenu = () => {
    menu?.setAttribute("aria-expanded", "false");
    header?.classList.remove("menu-open");
  };
  menu?.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    header.classList.toggle("menu-open", open);
  });
  links?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu?.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menu.focus();
    }
  });
  window.matchMedia("(min-width: 916px)").addEventListener("change", closeMenu);

  // Size the scroll window to exactly the newest three entries, including wrapped text.
  document.querySelectorAll(".news-scroll").forEach((feed) => {
    const sizeNews = () => {
      const items = [...feed.querySelectorAll(".sidebar-news-item")];
      if (items.length <= 3) {
        feed.style.maxHeight = "none";
        return;
      }
      const height = items[2].getBoundingClientRect().bottom - items[0].getBoundingClientRect().top;
      const value = height + "px";
      if (feed.style.maxHeight !== value) feed.style.maxHeight = value;
    };
    sizeNews();
    document.fonts.ready.then(sizeNews);
    const observer = new ResizeObserver(sizeNews);
    feed.querySelectorAll(".sidebar-news-item").forEach((item) => observer.observe(item));
  });
  // Preserve section and paper anchors previously shared from the homepage.
  const followPaperAnchor = () => {
    if (!document.querySelector(".academic-home") || !location.hash) return;
    let id;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    if (document.getElementById(id)) return;
    if (id === "teaching" || id === "service") {
      const prefix = document.documentElement.lang.startsWith("zh") ? "/zh/" : "/";
      location.replace(prefix + id + "/");
      return;
    }
    const catalogue = document.querySelector("a[data-publication-keys]");
    if (catalogue?.dataset.publicationKeys.split("|").includes(id)) location.replace(catalogue.href + "#" + encodeURIComponent(id));
  };
  window.addEventListener("hashchange", followPaperAnchor);
  followPaperAnchor();
});
