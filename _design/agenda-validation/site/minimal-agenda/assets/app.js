function escapeHtml(e) {
  return String(e).replace(/[&<>"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[e]);
}
function paperCard(e, t) {
  const a = agenda.projects[e];
  return `<li class="evidence-card" data-paper-id="${escapeHtml(e)}">\n    <div class="evidence-meta"><span class="research-status status-${a.status}">${statusLabels[a.status]}</span><span>${escapeHtml(a.venue).replace("Spotlight", "<strong>Spotlight</strong>")}</span></div>\n    <h4><a href="${escapeHtml(a.url)}">${escapeHtml(a.title)} <span aria-hidden="true">\u2197</span></a></h4>\n    <p>${escapeHtml(t.evidence[e])}</p>\n  </li>`;
}
function directionCard(e) {
  const t = agenda.projects[e];
  return `<li class="direction-item" data-direction-id="${escapeHtml(e)}">\n    <span class="research-status status-${t.status}">${statusLabels[t.status]}</span>\n    <h4>${escapeHtml(t.title)}</h4><p>${escapeHtml(t.question)}</p>\n  </li>`;
}
function selectStrand(e, t = !1) {
  if (e === activeStrand) return;
  (activeStrand && scopeState.set(activeStrand, !!story.querySelector("details")?.open), (activeStrand = e));
  const a = agenda.strands[e],
    n = String(agenda.strandOrder.indexOf(e) + 1).padStart(2, "0");
  (navigation.querySelectorAll("[data-strand]").forEach((t) => {
    t.dataset.strand === e ? t.setAttribute("aria-current", "true") : t.removeAttribute("aria-current");
  }),
    (story.dataset.theme = a.theme),
    (story.innerHTML = `\n    <header class="strand-heading">\n      <p class="agenda-eyebrow"><span class="strand-dot" aria-hidden="true"></span>${n} / ${escapeHtml(a.label)}</p>\n      <h2 id="strandTitle">${escapeHtml(a.question)}</h2>\n      <p>${escapeHtml(a.summary)}</p>\n    </header>\n    <div class="reasoning-grid">\n      ${a.phases.map((e, t) => `<section class="reasoning-card phase-${e.id}" aria-labelledby="reasoning-${e.id}">\n        <p class="reasoning-label"><span class="phase-number" aria-hidden="true">${String(t + 1).padStart(2, "0")}</span>${e.id[0].toUpperCase() + e.id.slice(1)}</p>\n        <h3 id="reasoning-${e.id}">${escapeHtml(e.title)}</h3><p>${escapeHtml(e.text)}</p>\n      </section>`).join("")}\n    </div>\n    <details class="research-scope" ${scopeState.get(e) ? "open" : ""}>\n      <summary>Assumptions &amp; scope</summary><p>${escapeHtml(a.scope)}</p>\n    </details>\n    <div class="research-support ${1 === a.papers.length ? "single-evidence" : ""}">\n      <section class="research-evidence" aria-labelledby="evidenceHeading">\n        <div class="support-heading"><h3 id="evidenceHeading">Work behind this question</h3><span>${a.papers.length} ${1 === a.papers.length ? "paper" : "papers"}</span></div>\n        <ul class="evidence-list">${a.papers.map((e) => paperCard(e, a)).join("")}</ul>\n      </section>\n      <section class="research-next" aria-labelledby="nextHeading">\n        <p class="agenda-eyebrow">Where this leads</p><h3 id="nextHeading">${escapeHtml(a.next)}</h3>\n        ${a.directions.length ? `<ul class="direction-list">${a.directions.map(directionCard).join("")}</ul>` : '<p class="open-question-label">Open research question</p>'}\n      </section>\n    </div>`),
    (story.hidden = !1),
    t && (document.getElementById("strandAnnouncement").textContent = a.label + ": " + a.question));
}
function renderNavigation() {
  ((navigation.innerHTML = agenda.strandOrder
    .map((e, t) => {
      const a = agenda.strands[e];
      return `<a class="strand-card" data-strand="${escapeHtml(e)}" data-theme="${a.theme}" href="#${escapeHtml(e)}" aria-controls="strandStory">\n      <span class="strand-card-top"><span class="strand-index">${String(t + 1).padStart(2, "0")}</span><span class="strand-indicator" aria-hidden="true">\u2192</span></span>\n      <span class="strand-name">${escapeHtml(a.label)}</span><span class="strand-description">${escapeHtml(a.short)}</span>\n      <span class="strand-selection" aria-hidden="true">Selected question</span>\n    </a>`;
    })
    .join("")),
    navigation.addEventListener("click", (e) => {
      const t = e.target.closest("a[data-strand]");
      if (!t || 0 !== e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const a = t.dataset.strand;
      (location.hash !== "#" + a && history.pushState(null, "", "#" + a), selectStrand(a, !0));
    }));
}
function setupFramework() {
  const e = document.getElementById("frameworkMap"),
    t = document.getElementById("frameworkOrbit"),
    a = [...e.querySelectorAll(".framework-stage")],
    n = () => {
      const n = e.getBoundingClientRect(),
        s = a.map((e) => {
          const t = e.getBoundingClientRect();
          return { x: t.x - n.x + t.width / 2, y: t.y - n.y + t.height / 2 };
        }),
        [r, d, i, o] = s;
      let c;
      if (Math.abs(r.y - i.y) < 2) {
        const e = n.height - 10,
          t = Math.min(60, r.x - 8, n.width - o.x - 8);
        c = `M${r.x} ${r.y} L${o.x} ${o.y} C${o.x + t} ${o.y},${o.x + t} ${e},${o.x} ${e} L${r.x} ${e} C${r.x - t} ${e},${r.x - t} ${r.y},${r.x} ${r.y} Z`;
      } else
        c = `M${r.x} ${r.y} C${r.x} ${r.y - 28},${d.x} ${d.y - 28},${d.x} ${d.y} C${d.x + 30} ${d.y},${i.x + 30} ${i.y},${i.x} ${i.y} C${i.x} ${i.y + 28},${o.x} ${o.y + 28},${o.x} ${o.y} C${o.x - 30} ${o.y},${r.x - 30} ${r.y},${r.x} ${r.y} Z`;
      t.setAttribute("viewBox", `0 0 ${n.width} ${n.height}`);
      for (const e of t.querySelectorAll("path")) e.setAttribute("d", c);
    },
    s = new ResizeObserver(n);
  (s.observe(e), a.forEach((e) => s.observe(e)), document.fonts.ready.then(n), n());
  const r = document.getElementById("motionToggle"),
    d = matchMedia("(prefers-reduced-motion: reduce)"),
    i = () => {
      r.hidden = d.matches;
    };
  (d.addEventListener("change", i),
    i(),
    r.addEventListener("click", () => {
      const t = "true" !== r.getAttribute("aria-pressed");
      (r.setAttribute("aria-pressed", String(t)), (r.textContent = t ? "Resume motion" : "Pause motion"), e.classList.toggle("motion-paused", t));
    }));
}
async function init() {
  setupFramework();
  try {
    ((agenda = await loadAgenda()),
      (document.title = agenda.site.browserTitle),
      (document.getElementById("page-title").textContent = agenda.site.headline),
      (document.getElementById("agendaIntroduction").textContent = agenda.site.introduction),
      (document.getElementById("connectionText").textContent = agenda.site.connection),
      (document.getElementById("agendaConnection").hidden = !1),
      renderNavigation(),
      selectStrand(resolveStrandHash(location.hash, agenda.strandOrder)),
      (status.hidden = !0));
    const e = () => selectStrand(resolveStrandHash(location.hash, agenda.strandOrder), !0);
    (window.addEventListener("popstate", e),
      window.addEventListener("hashchange", e),
      agenda.strandOrder.some((e) => location.hash === "#" + e) && navigation.scrollIntoView({ block: "start", behavior: "instant" }),
      root.classList.add("agenda-ready"));
  } catch (e) {
    (status.setAttribute("role", "alert"), (status.textContent = "The research questions could not load. "));
    const t = document.createElement("button");
    ((t.className = "agenda-retry"),
      (t.type = "button"),
      (t.textContent = "Try again"),
      t.addEventListener("click", () => location.reload()),
      status.append(t),
      console.error(e));
  }
}
import { loadAgenda, resolveStrandHash, statusLabels } from "./content-loader.js";
const root = document.querySelector(".research-agenda"),
  navigation = document.getElementById("strandNavigation"),
  story = document.getElementById("strandStory"),
  status = document.getElementById("agendaStatus"),
  scopeState = new Map();
let agenda, activeStrand;
init();
