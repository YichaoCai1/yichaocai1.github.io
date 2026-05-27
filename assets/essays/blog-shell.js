document.addEventListener("DOMContentLoaded", function () {
  if (document.body.dataset.blogShellApplied === "true") {
    return;
  }
  document.body.dataset.blogShellApplied = "true";

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
        <a href="/publications/">Publications</a> <a href="/teaching/">Teaching &amp; Service</a>
      </div>
    </div>
  `;

  const main = document.createElement("main");
  main.className = "container-lg blog-post-page";

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

  card.appendChild(cardBody);
  main.appendChild(card);

  body.innerHTML = "";
  body.appendChild(nav);
  body.appendChild(main);
  body.appendChild(footer);
  scriptNodes.forEach((script) => body.appendChild(script));
});
