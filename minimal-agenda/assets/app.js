import { loadAgenda, resolveStrandHash, statusLabels } from "./content-loader.js";

const root = document.querySelector(".research-agenda");
const navigation = document.getElementById("strandNavigation");
const story = document.getElementById("strandStory");
const status = document.getElementById("agendaStatus");
const scopeState = new Map();
let agenda;
let activeStrand;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function paperCard(id, strand) {
  const paper = agenda.projects[id];
  return `<li class="evidence-card" data-paper-id="${escapeHtml(id)}">
    <div class="evidence-meta"><span class="research-status status-${paper.status}">${statusLabels[paper.status]}</span><span>${escapeHtml(paper.venue).replace("Spotlight", "<strong>Spotlight</strong>")}</span></div>
    <h4><a href="${escapeHtml(paper.url)}">${escapeHtml(paper.title)} <span aria-hidden="true">↗</span></a></h4>
    <p>${escapeHtml(strand.evidence[id])}</p>
  </li>`;
}

function directionCard(id) {
  const direction = agenda.projects[id];
  return `<li class="direction-item" data-direction-id="${escapeHtml(id)}">
    <span class="research-status status-${direction.status}">${statusLabels[direction.status]}</span>
    <h4>${escapeHtml(direction.title)}</h4><p>${escapeHtml(direction.question)}</p>
  </li>`;
}

function selectStrand(id, announce = false) {
  if (id === activeStrand) return;
  if (activeStrand) scopeState.set(activeStrand, !!story.querySelector("details")?.open);
  activeStrand = id;
  const strand = agenda.strands[id];
  const number = String(agenda.strandOrder.indexOf(id) + 1).padStart(2, "0");
  navigation.querySelectorAll("[data-strand]").forEach((link) => {
    if (link.dataset.strand === id) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
  story.dataset.theme = strand.theme;
  story.innerHTML = `
    <header class="strand-heading">
      <p class="agenda-eyebrow"><span class="strand-dot" aria-hidden="true"></span>${number} / ${escapeHtml(strand.label)}</p>
      <h2 id="strandTitle">${escapeHtml(strand.question)}</h2>
      <p>${escapeHtml(strand.summary)}</p>
    </header>
    <div class="reasoning-grid">
      ${strand.phases
        .map(
          (phase, index) => `<section class="reasoning-card phase-${phase.id}" aria-labelledby="reasoning-${phase.id}">
        <p class="reasoning-label"><span class="phase-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>${phase.id[0].toUpperCase() + phase.id.slice(1)}</p>
        <h3 id="reasoning-${phase.id}">${escapeHtml(phase.title)}</h3><p>${escapeHtml(phase.text)}</p>
      </section>`
        )
        .join("")}
    </div>
    <details class="research-scope" ${scopeState.get(id) ? "open" : ""}>
      <summary>Assumptions &amp; scope</summary><p>${escapeHtml(strand.scope)}</p>
    </details>
    <div class="research-support ${strand.papers.length === 1 ? "single-evidence" : ""}">
      <section class="research-evidence" aria-labelledby="evidenceHeading">
        <div class="support-heading"><h3 id="evidenceHeading">Work behind this question</h3><span>${strand.papers.length} ${strand.papers.length === 1 ? "paper" : "papers"}</span></div>
        <ul class="evidence-list">${strand.papers.map((id) => paperCard(id, strand)).join("")}</ul>
      </section>
      <section class="research-next" aria-labelledby="nextHeading">
        <p class="agenda-eyebrow">Where this leads</p><h3 id="nextHeading">${escapeHtml(strand.next)}</h3>
        ${strand.directions.length ? `<ul class="direction-list">${strand.directions.map(directionCard).join("")}</ul>` : '<p class="open-question-label">Open research question</p>'}
      </section>
    </div>`;
  story.hidden = false;
  if (announce) document.getElementById("strandAnnouncement").textContent = strand.label + ": " + strand.question;
}

function renderNavigation() {
  navigation.innerHTML = agenda.strandOrder
    .map((id, index) => {
      const strand = agenda.strands[id];
      return `<a class="strand-card" data-strand="${escapeHtml(id)}" data-theme="${strand.theme}" href="#${escapeHtml(id)}" aria-controls="strandStory">
      <span class="strand-card-top"><span class="strand-index">${String(index + 1).padStart(2, "0")}</span><span class="strand-indicator" aria-hidden="true">→</span></span>
      <span class="strand-name">${escapeHtml(strand.label)}</span><span class="strand-description">${escapeHtml(strand.short)}</span>
      <span class="strand-selection" aria-hidden="true">Selected question</span>
    </a>`;
    })
    .join("");
  navigation.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-strand]");
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const id = link.dataset.strand;
    if (location.hash !== "#" + id) history.pushState(null, "", "#" + id);
    selectStrand(id, true);
  });
}

// The overview explains the framework; only the research strands navigate.
// Preserve the circulating dashed loop around responsive, non-clickable cards.
function setupFramework() {
  const map = document.getElementById("frameworkMap");
  const svg = document.getElementById("frameworkOrbit");
  const stages = [...map.querySelectorAll(".framework-stage")];
  const draw = () => {
    const box = map.getBoundingClientRect();
    const points = stages.map((stage) => {
      const rect = stage.getBoundingClientRect();
      return { x: rect.x - box.x + rect.width / 2, y: rect.y - box.y + rect.height / 2 };
    });
    const [a, b, c, d] = points;
    let curve;
    if (Math.abs(a.y - c.y) < 2) {
      const bottom = box.height - 10;
      const radius = Math.min(60, a.x - 8, box.width - d.x - 8);
      curve = `M${a.x} ${a.y} L${d.x} ${d.y} C${d.x + radius} ${d.y},${d.x + radius} ${bottom},${d.x} ${bottom} L${a.x} ${bottom} C${a.x - radius} ${bottom},${a.x - radius} ${a.y},${a.x} ${a.y} Z`;
    } else {
      curve = `M${a.x} ${a.y} C${a.x} ${a.y - 28},${b.x} ${b.y - 28},${b.x} ${b.y} C${b.x + 30} ${b.y},${c.x + 30} ${c.y},${c.x} ${c.y} C${c.x} ${c.y + 28},${d.x} ${d.y + 28},${d.x} ${d.y} C${d.x - 30} ${d.y},${a.x - 30} ${a.y},${a.x} ${a.y} Z`;
    }
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    for (const path of svg.querySelectorAll("path")) path.setAttribute("d", curve);
  };
  const observer = new ResizeObserver(draw);
  observer.observe(map);
  stages.forEach((stage) => observer.observe(stage));
  document.fonts.ready.then(draw);
  draw();
  const toggle = document.getElementById("motionToggle");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const updateMotionControl = () => {
    toggle.hidden = reducedMotion.matches;
  };
  reducedMotion.addEventListener("change", updateMotionControl);
  updateMotionControl();
  toggle.addEventListener("click", () => {
    const paused = toggle.getAttribute("aria-pressed") !== "true";
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.textContent = paused ? "Resume motion" : "Pause motion";
    map.classList.toggle("motion-paused", paused);
  });
}

async function init() {
  setupFramework();
  try {
    agenda = await loadAgenda();
    document.title = agenda.site.browserTitle;
    document.getElementById("page-title").textContent = agenda.site.headline;
    document.getElementById("agendaIntroduction").textContent = agenda.site.introduction;
    document.getElementById("connectionText").textContent = agenda.site.connection;
    document.getElementById("agendaConnection").hidden = false;
    renderNavigation();
    selectStrand(resolveStrandHash(location.hash, agenda.strandOrder));
    status.hidden = true;
    const restore = () => selectStrand(resolveStrandHash(location.hash, agenda.strandOrder), true);
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", restore);
    if (agenda.strandOrder.some((id) => location.hash === "#" + id)) navigation.scrollIntoView({ block: "start", behavior: "instant" });
    root.classList.add("agenda-ready");
  } catch (error) {
    status.setAttribute("role", "alert");
    status.textContent = "The research questions could not load. ";
    const retry = document.createElement("button");
    retry.className = "agenda-retry";
    retry.type = "button";
    retry.textContent = "Try again";
    retry.addEventListener("click", () => location.reload());
    status.append(retry);
    console.error(error);
  }
}

init();
