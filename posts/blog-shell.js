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
  nav.className = "navbar navbar-expand-sm navbar-light bg-light fixed-top mb-5 shadow-sm";
  nav.innerHTML = `
    <div class="container-lg">
      <span class="nav-link terminal-text">YichaoCai<span style="color: #FFAAAA">@AIML</span><span style="color: black">:</span><span style="color: #6096B4">~</span><span style="color: black">$</span> Hi there!<span class="terminal-cursor"></span></span>
      <button class="navbar-toggler" style="font-size: 1em; padding: 0.5em;" type="button" data-toggle="collapse" data-target="#blogPostNav" aria-controls="blogPostNav" aria-expanded="false" aria-label="Toggle navigation">
        <i class="fas fa-map"></i> Menu
      </button>
      <div class="collapse navbar-collapse" id="blogPostNav">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item"><a class="nav-link" href="../">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="../publications.html">Publications</a></li>
          <li class="nav-item active"><a class="nav-link" href="../blogs.html">Blog</a></li>
        </ul>
      </div>
    </div>
  `;

  const main = document.createElement("main");
  main.className = "container-lg blog-post-page";

  const card = document.createElement("div");
  card.className = "blog-post-card";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body p-4 p-lg-5";

  const footer = document.createElement("footer");
  footer.className = "blog-footer";
  footer.innerHTML = `
    <div class="container-lg">
      <div class="row my-3">
        <div class="col-12 col-lg-9 ml-auto">
          <div class="d-flex justify-content-between text-muted">
            <div><a href="../blogs.html">Back to Blog</a></div>
            <div>based on <a href="https://github.com/oneThousand1000/oneThousand1000.github.io" target="_blank" rel="noopener noreferrer">oneThousand1000.github.io</a></div>
          </div>
        </div>
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
