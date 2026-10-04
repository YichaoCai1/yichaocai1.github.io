function escapeHtml(e) {
  return String(e).replace(/[&<>"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[e]);
}
function formatText(e) {
  return escapeHtml(e)
    .replace(/\n{2,}/g, "<br><br>")
    .replace(/\n/g, "<br>");
}
function setLayerTheme(e, t) {
  (detailLayer.style.setProperty("--active", e), detailLayer.style.setProperty("--active-soft", t));
}
function setActiveDiagramNode(e) {
  document.querySelectorAll("[data-global-node]").forEach((t) => {
    t.classList.toggle("is-active", t.dataset.globalNode === e);
  });
}
function getGlobalNodeFromHash() {
  const e = window.location.hash.replace(/^#/, "");
  return globalNodes[e] ? e : null;
}
function setViewHash(e) {
  const t = e ? `#${e}` : `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", t);
}
function renderSite() {
  ((document.title = site.browserTitle),
    (pageTitle.textContent = "Research agenda"),
    (diagramCaption.innerHTML = `\n    <tspan>${escapeHtml(site.captionLeft)}</tspan>\n    <tspan class="caption-arrow" dx="9">&#8594;</tspan>\n    <tspan dx="9">${escapeHtml(site.captionRight)}</tspan>\n  `));
}
function renderGlobalDiagram() {
  const e = globalOrder.map((e, t) => {
    const n = globalNodes[e];
    return { ...n, ...getNodePosition(n, t, globalOrder.length) };
  });
  ((diagramDefs.innerHTML = e.map(renderGradientDefinition).join("")),
    diagramLoop.setAttribute("d", getLoopPath(e)),
    (diagramNodesLayer.innerHTML = e.map(renderGlobalNode).join("")),
    diagramNodesLayer.querySelectorAll("[data-global-node]").forEach((e) => {
      (e.addEventListener("click", () => openGlobalNode(e.dataset.globalNode)),
        e.addEventListener("keydown", (t) => {
          ("Enter" !== t.key && " " !== t.key) || (t.preventDefault(), openGlobalNode(e.dataset.globalNode));
        }));
    }));
}
function renderGradientDefinition(e) {
  return `\n    <radialGradient id="${getGradientId(e.id)}" cx="30%" cy="20%" r="72%">\n      ${getGradientStops(e)
    .map(([e, t, n]) => `<stop offset="${e}" stop-color="${t}" stop-opacity="${n}"></stop>`)
    .join("")}\n    </radialGradient>\n  `;
}
function getGradientStops(e) {
  return gradientPresets[e.theme]
    ? gradientPresets[e.theme]
    : [
        ["0%", mixColor(e.color, "#ffffff", 0.08), "0.98"],
        ["24%", mixColor(e.color, "#ffffff", 0.42), "0.9"],
        ["64%", mixColor(e.color, "#ffffff", 0.76), "0.86"],
        ["100%", mixColor(e.color, "#000000", 0.62), "0.98"],
      ];
}
function renderGlobalNode(e) {
  const t = getGradientId(e.id),
    n = { x: e.x - 20, y: e.y - 24 },
    a = e.subtitle ? e.y - 3 : e.y + 5;
  return `\n    <g\n      class="diagram-node node-${toSafeClassName(e.id)}"\n      role="button"\n      tabindex="0"\n      data-global-node="${escapeHtml(e.id)}"\n      aria-label="${escapeHtml(`${e.label} node`)}"\n      style="--node-color: ${e.color};"\n    >\n      <circle class="node-glow" cx="${e.x}" cy="${e.y}" r="55"></circle>\n      <circle class="node-occluder" cx="${e.x}" cy="${e.y}" r="48"></circle>\n      <circle class="node-globe" cx="${e.x}" cy="${e.y}" r="${sphereRadius}" fill="url(#${t})"></circle>\n      <circle class="node-shine" cx="${n.x}" cy="${n.y}" r="11"></circle>\n      <ellipse class="node-grid" cx="${e.x}" cy="${e.y}" rx="45" ry="16"></ellipse>\n      <ellipse class="node-grid" cx="${e.x}" cy="${e.y}" rx="17" ry="45"></ellipse>\n      <path class="node-grid" d="${getUpperGridPath(e.x, e.y)}"></path>\n      <path class="node-grid" d="${getLowerGridPath(e.x, e.y)}"></path>\n      <text class="node-title" x="${e.x}" y="${a}" text-anchor="middle">${escapeHtml(e.label)}</text>\n      ${e.subtitle ? `<text class="node-sub" x="${e.x}" y="${e.y + 16}" text-anchor="middle">${escapeHtml(e.subtitle)}</text>` : ""}\n    </g>\n  `;
}
function getNodePosition(e, t, n) {
  if (Number.isFinite(e.x) && Number.isFinite(e.y)) return { x: e.x, y: e.y };
  const a = [-Math.PI, -Math.PI / 2, 0, Math.PI / 2],
    o = 4 === n ? a[t] : -Math.PI / 2 + (2 * t * Math.PI) / n;
  return { x: Math.round(diagramCenter.x + diagramRadius.x * Math.cos(o)), y: Math.round(diagramCenter.y + diagramRadius.y * Math.sin(o)) };
}
function getLoopPath(e) {
  return isClassicFourNodeLayout(e) ? classicLoopPath : makeSmoothClosedPath(e);
}
function isClassicFourNodeLayout(e) {
  if (4 !== e.length) return !1;
  const t = [
    { x: 88, y: 150 },
    { x: 210, y: 84 },
    { x: 332, y: 150 },
    { x: 210, y: 216 },
  ];
  return e.every((e, n) => Math.abs(e.x - t[n].x) < 0.5 && Math.abs(e.y - t[n].y) < 0.5);
}
function makeSmoothClosedPath(e) {
  if (!e.length) return "";
  if (1 === e.length) {
    const t = e[0];
    return `M${t.x - sphereRadius} ${t.y} A${sphereRadius} ${sphereRadius} 0 1 0 ${t.x + sphereRadius} ${t.y} A${sphereRadius} ${sphereRadius} 0 1 0 ${t.x - sphereRadius} ${t.y}`;
  }
  if (2 === e.length) return `M${e[0].x} ${e[0].y} L${e[1].x} ${e[1].y}`;
  const t = 0.34,
    n = [`M${e[0].x} ${e[0].y}`];
  return (
    e.forEach((a, o) => {
      const r = e[(o - 1 + e.length) % e.length],
        l = e[(o + 1) % e.length],
        i = e[(o + 2) % e.length],
        c = { x: a.x + ((l.x - r.x) * t) / 2, y: a.y + ((l.y - r.y) * t) / 2 },
        d = { x: l.x - ((i.x - a.x) * t) / 2, y: l.y - ((i.y - a.y) * t) / 2 };
      n.push(`C${round(c.x)} ${round(c.y)}, ${round(d.x)} ${round(d.y)}, ${l.x} ${l.y}`);
    }),
    n.join(" ")
  );
}
function getUpperGridPath(e, t) {
  return `M${e - 36} ${t - 26} C${e - 15} ${t - 14}, ${e + 16} ${t - 14}, ${e + 36} ${t - 26}`;
}
function getLowerGridPath(e, t) {
  return `M${e - 36} ${t + 26} C${e - 15} ${t + 14}, ${e + 16} ${t + 14}, ${e + 36} ${t + 26}`;
}
function getGradientId(e) {
  return `globe-${toSafeClassName(e)}`;
}
function toSafeClassName(e) {
  return String(e).replace(/[^A-Za-z0-9_-]/g, "-");
}
function round(e) {
  return Math.round(10 * e) / 10;
}
function renderConceptNodes(e) {
  ((nodeLayer.innerHTML = e.children
    .map((t) => {
      const n = conceptNodes[t];
      return `\n      <button\n        class="layer-node"\n        type="button"\n        data-concept-node="${escapeHtml(t)}"\n        aria-current="${t === activeConcept}"\n        style="--node-color: ${e.color};"\n      >\n        <b>${escapeHtml(n.label)}</b>\n        <span>${escapeHtml(n.short)}</span>\n      </button>\n    `;
    })
    .join("")),
    nodeLayer.querySelectorAll("[data-concept-node]").forEach((e) => {
      e.addEventListener("click", () => {
        ((activeConcept = e.dataset.conceptNode),
          (activeProject = conceptNodes[activeConcept].projects[0]),
          (projectDetailOpen = !0),
          renderConceptDetail(),
          renderConceptNodes(globalNodes[activeGlobal]));
      });
    }));
}
function renderProjectNodes(e) {
  return e.projects
    .map((t) => {
      const n = projects[t],
        a = t === activeProject,
        o = a && projectDetailOpen ? renderProjectDetail(n, "inline-project-detail") : "",
        r = `<b>${escapeHtml(n.title)}</b><span>${escapeHtml(n.summary)}</span>`;
      return `\n      <article\n        class="project-node"\n        aria-current="${a}"\n        style="--project-accent: ${e.color};"\n      >\n        <span class="project-meta">${escapeHtml(n.venue).replace("Spotlight", "<strong>Spotlight</strong>")}</span>\n        ${n.url ? `<a class="project-paper-link" href="${escapeHtml(n.url)}">${r}</a>` : `<div class="project-main-text">${r}</div>`}\n        <button class="project-detail-toggle" type="button" data-project-node="${escapeHtml(t)}" aria-expanded="${a && projectDetailOpen}" aria-label="${a && projectDetailOpen ? "Hide" : "Show"} research details for ${escapeHtml(n.title)}">\n          ${a && projectDetailOpen ? "Hide details" : "Research details"} <span aria-hidden="true">${a && projectDetailOpen ? "\u2212" : "+"}</span>\n        </button>\n      </article>\n      ${o}\n    `;
    })
    .join("");
}
function renderProjectDetail(e, t = "") {
  return `\n    <div class="${["project-detail", t].filter(Boolean).join(" ")}">\n      <div>\n        <b>${escapeHtml(site.claimLabel)}</b>\n        <span>${formatText(e.claim)}</span>\n      </div>\n      <div>\n        <b>${escapeHtml(site.limitLabel)}</b>\n        <span>${formatText(e.limit)}</span>\n      </div>\n      <div>\n        <b>${escapeHtml(site.designMoveLabel)}</b>\n        <span>${formatText(e.design)}</span>\n      </div>\n    </div>\n  `;
}
function renderConceptDetail() {
  const e = conceptNodes[activeConcept],
    t = projects[activeProject];
  (setLayerTheme(e.color, e.soft),
    nodeDetail.classList.remove("is-empty"),
    (nodeDetail.innerHTML = `\n    <div class="detail-top">\n      <div>\n        <p class="eyebrow">${escapeHtml(e.eyebrow || site.lensEyebrow)}</p>\n        <h3>${escapeHtml(e.title)}</h3>\n        <p>${formatText(e.text)}</p>\n      </div>\n      <div class="memory-chip">\n        <b>${escapeHtml(e.memoryLabel || site.memoryLabel)}</b>\n        <span>${formatText(e.memory)}</span>\n      </div>\n    </div>\n    <div class="project-nodes">\n      ${renderProjectNodes(e)}\n    </div>\n    ${projectDetailOpen ? renderProjectDetail(t, "desktop-project-detail") : ""}\n  `),
    nodeDetail.querySelectorAll("[data-project-node]").forEach((e) => {
      e.addEventListener("click", () => {
        const t = e.dataset.projectNode;
        (t === activeProject ? (projectDetailOpen = !projectDetailOpen) : ((activeProject = t), (projectDetailOpen = !0)), renderConceptDetail());
      });
    }));
}
function openGlobalNode(e, t = !0) {
  const n = globalNodes[e];
  n &&
    ((activeGlobal = e),
    (activeConcept = n.children[0]),
    (activeProject = conceptNodes[activeConcept].projects[0]),
    (projectDetailOpen = !0),
    (globalStage.hidden = !0),
    (detailLayer.hidden = !1),
    setActiveDiagramNode(e),
    setLayerTheme(n.color, n.soft),
    (layerEyebrow.textContent = n.eyebrow),
    (layerTitle.textContent = n.title),
    (layerText.textContent = n.text),
    renderConceptNodes(n),
    renderConceptDetail(),
    t && setViewHash(e),
    window.scrollTo({ top: 0, behavior: "auto" }));
}
function returnToGlobalView(e = !0) {
  ((detailLayer.hidden = !0),
    (globalStage.hidden = !1),
    (activeGlobal = null),
    (activeConcept = null),
    (activeProject = null),
    (projectDetailOpen = !0),
    setActiveDiagramNode(null),
    e && setViewHash(null),
    window.scrollTo({ top: 0, behavior: "auto" }));
}
function showLoadError(e) {
  ((pageTitle.textContent = "Research agenda could not load."),
    (diagramDefs.innerHTML = ""),
    (diagramNodesLayer.innerHTML = ""),
    (diagramCaption.textContent = ""),
    console.error(e));
}
async function init() {
  try {
    const e = await loadAgenda();
    ((site = e.site),
      (globalOrder = e.globalOrder),
      (globalNodes = e.globalNodes),
      (conceptNodes = e.conceptNodes),
      (projects = e.projects),
      renderSite(),
      renderGlobalDiagram(),
      returnButton.addEventListener("click", returnToGlobalView),
      window.addEventListener("hashchange", () => {
        const e = getGlobalNodeFromHash();
        e ? openGlobalNode(e, !1) : globalStage.hidden && returnToGlobalView(!1);
      }));
    const t = getGlobalNodeFromHash();
    t && openGlobalNode(t, !1);
  } catch (e) {
    showLoadError(e);
  }
}
import { loadAgenda, mixColor } from "./content-loader.js";
const classicLoopPath = "M88 150 C158 84, 262 84, 332 150 C262 216, 158 216, 88 150",
  diagramWidth = 420,
  diagramHeight = 300,
  diagramCenter = { x: 210, y: 150 },
  diagramRadius = { x: 122, y: 66 },
  sphereRadius = 45,
  gradientPresets = {
    objective: [
      ["0%", "#ffffff", "1"],
      ["28%", "#e6ecff", "1"],
      ["68%", "#b4c1ea", "1"],
      ["100%", "#7d93d9", "1"],
    ],
    structure: [
      ["0%", "#ffffff", "1"],
      ["28%", "#e2f2ef", "1"],
      ["68%", "#acd5cf", "1"],
      ["100%", "#73aca5", "1"],
    ],
    limits: [
      ["0%", "#ffffff", "1"],
      ["28%", "#f7e8e3", "1"],
      ["68%", "#e7bdb0", "1"],
      ["100%", "#cb8f7d", "1"],
    ],
    design: [
      ["0%", "#ffffff", "1"],
      ["28%", "#f8efd9", "1"],
      ["68%", "#ead29a", "1"],
      ["100%", "#c9a455", "1"],
    ],
    sage: [
      ["0%", "#ffffff", "1"],
      ["28%", "#edf3e8", "1"],
      ["68%", "#cad8bd", "1"],
      ["100%", "#9caf8c", "1"],
    ],
  };
((gradientPresets.blue = gradientPresets.objective),
  (gradientPresets.teal = gradientPresets.structure),
  (gradientPresets.rust = gradientPresets.limits),
  (gradientPresets.gold = gradientPresets.design));
const pageTitle = document.getElementById("page-title"),
  detailLayer = document.getElementById("detailLayer"),
  globalStage = document.getElementById("globalStage"),
  returnButton = document.getElementById("returnButton"),
  layerEyebrow = document.getElementById("layerEyebrow"),
  layerTitle = document.getElementById("layerTitle"),
  layerText = document.getElementById("layerText"),
  nodeLayer = document.getElementById("nodeLayer"),
  nodeDetail = document.getElementById("nodeDetail"),
  diagramDefs = document.getElementById("diagramDefs"),
  diagramLoop = document.getElementById("diagramLoop"),
  diagramNodesLayer = document.getElementById("diagramNodes"),
  diagramCaption = document.getElementById("diagramCaption");
let site = null,
  globalOrder = [],
  globalNodes = {},
  conceptNodes = {},
  projects = {},
  activeGlobal = null,
  activeConcept = null,
  activeProject = null,
  projectDetailOpen = !0;
init();
