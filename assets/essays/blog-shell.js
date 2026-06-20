document.addEventListener("DOMContentLoaded", function () {
  if (document.body.dataset.blogShellApplied === "true") {
    return;
  }
  document.body.dataset.blogShellApplied = "true";

  const slugify = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const headingText = (heading) => {
    const clone = heading.cloneNode(true);
    clone.querySelectorAll(".anchor, a[aria-label*='heading']").forEach((anchor) => anchor.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  };

  const ensureHeadingId = (heading, usedIds) => {
    if (heading.id) {
      usedIds.add(heading.id);
      return heading.id;
    }

    const base = slugify(headingText(heading)) || "section";
    let id = base;
    let count = 2;

    while (usedIds.has(id) || document.getElementById(id)) {
      id = `${base}-${count}`;
      count += 1;
    }

    heading.id = id;
    usedIds.add(id);
    return id;
  };

  const buildSectionIndex = (root) => {
    const headings = Array.from(root.querySelectorAll("h2, h3"))
      .filter((heading) => !heading.closest("nav, .toc, .blog-section-sidebar"))
      .map((heading) => ({
        element: heading,
        text: headingText(heading),
        level: heading.tagName === "H3" ? 3 : 2,
      }))
      .filter((item) => item.text.length > 0);

    if (headings.length < 2) {
      return null;
    }

    const usedIds = new Set(Array.from(root.querySelectorAll("[id]")).map((element) => element.id));
    const aside = document.createElement("aside");
    aside.className = "blog-section-sidebar";
    aside.setAttribute("aria-label", "Section index");

    const title = document.createElement("div");
    title.className = "blog-section-sidebar-title";
    title.textContent = "On this page";

    const list = document.createElement("ol");
    list.className = "blog-section-sidebar-list";

    headings.forEach((item) => {
      const id = ensureHeadingId(item.element, usedIds);
      const entry = document.createElement("li");
      entry.className = `blog-section-sidebar-item depth-${item.level}`;

      const link = document.createElement("a");
      link.href = `#${id}`;
      link.textContent = item.text;
      link.dataset.targetId = id;

      entry.appendChild(link);
      list.appendChild(entry);
    });

    aside.appendChild(title);
    aside.appendChild(list);
    return aside;
  };

  const body = document.body;
  const originalNodes = Array.from(body.childNodes).filter((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.trim() !== "";
    }
    return node.tagName !== "SCRIPT";
  });

  const scriptNodes = Array.from(body.querySelectorAll(":scope > script"));

  const nav = document.createElement("nav");
  nav.className = "site-top-nav";
  nav.setAttribute("aria-label", "Site navigation");
  nav.innerHTML = `
    <div class="container-lg site-top-nav-inner">
      <a class="site-top-nav-brand" href="/">Yichao Cai</a>
      <div class="site-top-nav-links">
        <a href="/">Home</a>
        <a class="active" href="/blog/">Blog</a>
        <a href="/#research">Research</a> <a href="/teaching/">Teaching &amp; Service</a>
      </div>
    </div>
  `;

  const main = document.createElement("main");
  main.className = "container-lg blog-post-page";

  const layout = document.createElement("div");
  layout.className = "blog-post-layout";

  const card = document.createElement("div");
  card.className = "blog-post-card";

  const cardBody = document.createElement("div");
  cardBody.className = "blog-post-body";

  const footer = document.createElement("footer");
  footer.className = "blog-footer";
  footer.innerHTML = `
    <div class="container-lg">
      <div class="blog-footer-inner">
        <div><a href="/blog/">Back to Blog</a></div>
        
      </div>
    </div>
  `;

  originalNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "MAIN") {
      node.classList.add("blog-post-inner");
    }
    cardBody.appendChild(node);
  });

  const sectionIndex = buildSectionIndex(cardBody);

  card.appendChild(cardBody);
  if (sectionIndex) {
    layout.appendChild(sectionIndex);
  }
  layout.appendChild(card);
  main.appendChild(layout);

  body.innerHTML = "";
  body.appendChild(nav);
  body.appendChild(main);
  body.appendChild(footer);
  scriptNodes.forEach((script) => body.appendChild(script));

  if (sectionIndex) {
    const sidebarLinks = Array.from(sectionIndex.querySelectorAll("a[data-target-id]"));
    const observedHeadings = sidebarLinks.map((link) => document.getElementById(link.dataset.targetId)).filter(Boolean);

    const setActiveLink = (id) => {
      sidebarLinks.forEach((link) => {
        link.classList.toggle("active", link.dataset.targetId === id);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveLink(visible[0].target.id);
        }
      },
      {
        rootMargin: "-18% 0px -68% 0px",
        threshold: 0,
      }
    );

    observedHeadings.forEach((heading) => observer.observe(heading));

    if (observedHeadings[0]) {
      setActiveLink(observedHeadings[0].id);
    }
  }
});
