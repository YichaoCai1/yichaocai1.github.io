import { loadAgenda, mixColor } from "./content-loader.js";

const classicLoopPath = "M88 150 C158 84, 262 84, 332 150 C262 216, 158 216, 88 150";

const diagramWidth = 420;
const diagramHeight = 300;
const diagramCenter = { x: 210, y: 150 };
const diagramRadius = { x: 122, y: 66 };
const sphereRadius = 45;

const gradientPresets = {
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

gradientPresets.blue = gradientPresets.objective;
gradientPresets.teal = gradientPresets.structure;
gradientPresets.rust = gradientPresets.limits;
gradientPresets.gold = gradientPresets.design;

const pageTitle = document.getElementById("page-title");
const detailLayer = document.getElementById("detailLayer");
const globalStage = document.getElementById("globalStage");
const returnButton = document.getElementById("returnButton");
const layerEyebrow = document.getElementById("layerEyebrow");
const layerTitle = document.getElementById("layerTitle");
const layerText = document.getElementById("layerText");
const nodeLayer = document.getElementById("nodeLayer");
const nodeDetail = document.getElementById("nodeDetail");
const diagramDefs = document.getElementById("diagramDefs");
const diagramLoop = document.getElementById("diagramLoop");
const diagramNodesLayer = document.getElementById("diagramNodes");
const diagramCaption = document.getElementById("diagramCaption");

let site = null;
let globalOrder = [];
let globalNodes = {};
let conceptNodes = {};
let projects = {};
let activeGlobal = null;
let activeConcept = null;
let activeProject = null;
let projectDetailOpen = true;

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char]
  );
}

function formatText(value) {
  return escapeHtml(value)
    .replace(/\n{2,}/g, "<br><br>")
    .replace(/\n/g, "<br>");
}

function setLayerTheme(color, softColor) {
  detailLayer.style.setProperty("--active", color);
  detailLayer.style.setProperty("--active-soft", softColor);
}

function setActiveDiagramNode(id) {
  document.querySelectorAll("[data-global-node]").forEach((node) => {
    node.classList.toggle("is-active", node.dataset.globalNode === id);
  });
}

function getGlobalNodeFromHash() {
  const id = window.location.hash.replace(/^#/, "");
  return globalNodes[id] ? id : null;
}

function setViewHash(id) {
  const nextUrl = id ? `#${id}` : `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", nextUrl);
}

function renderSite() {
  document.title = site.browserTitle;
  pageTitle.textContent = site.headline;
  diagramCaption.innerHTML = `
    <tspan>${escapeHtml(site.captionLeft)}</tspan>
    <tspan class="caption-arrow" dx="9">&#8594;</tspan>
    <tspan dx="9">${escapeHtml(site.captionRight)}</tspan>
  `;
}

function renderGlobalDiagram() {
  const positionedNodes = globalOrder.map((id, index) => {
    const node = globalNodes[id];
    return {
      ...node,
      ...getNodePosition(node, index, globalOrder.length),
    };
  });

  diagramDefs.innerHTML = positionedNodes.map(renderGradientDefinition).join("");
  diagramLoop.setAttribute("d", getLoopPath(positionedNodes));
  diagramNodesLayer.innerHTML = positionedNodes.map(renderGlobalNode).join("");

  diagramNodesLayer.querySelectorAll("[data-global-node]").forEach((node) => {
    node.addEventListener("click", () => openGlobalNode(node.dataset.globalNode));
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openGlobalNode(node.dataset.globalNode);
      }
    });
  });
}

function renderGradientDefinition(node) {
  const gradientId = getGradientId(node.id);
  const stops = getGradientStops(node);
  return `
    <radialGradient id="${gradientId}" cx="30%" cy="20%" r="72%">
      ${stops.map(([offset, color, opacity]) => `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"></stop>`).join("")}
    </radialGradient>
  `;
}

function getGradientStops(node) {
  if (gradientPresets[node.theme]) {
    return gradientPresets[node.theme];
  }

  return [
    ["0%", mixColor(node.color, "#ffffff", 0.08), "0.98"],
    ["24%", mixColor(node.color, "#ffffff", 0.42), "0.9"],
    ["64%", mixColor(node.color, "#ffffff", 0.76), "0.86"],
    ["100%", mixColor(node.color, "#000000", 0.62), "0.98"],
  ];
}

function renderGlobalNode(node) {
  const gradientId = getGradientId(node.id);
  const shine = {
    x: node.x - 20,
    y: node.y - 24,
  };
  const titleY = node.subtitle ? node.y - 3 : node.y + 5;

  return `
    <g
      class="diagram-node node-${toSafeClassName(node.id)}"
      role="button"
      tabindex="0"
      data-global-node="${escapeHtml(node.id)}"
      aria-label="${escapeHtml(`${node.label} node`)}"
      style="--node-color: ${node.color};"
    >
      <circle class="node-glow" cx="${node.x}" cy="${node.y}" r="55"></circle>
      <circle class="node-occluder" cx="${node.x}" cy="${node.y}" r="48"></circle>
      <circle class="node-globe" cx="${node.x}" cy="${node.y}" r="${sphereRadius}" fill="url(#${gradientId})"></circle>
      <circle class="node-shine" cx="${shine.x}" cy="${shine.y}" r="11"></circle>
      <ellipse class="node-grid" cx="${node.x}" cy="${node.y}" rx="45" ry="16"></ellipse>
      <ellipse class="node-grid" cx="${node.x}" cy="${node.y}" rx="17" ry="45"></ellipse>
      <path class="node-grid" d="${getUpperGridPath(node.x, node.y)}"></path>
      <path class="node-grid" d="${getLowerGridPath(node.x, node.y)}"></path>
      <text class="node-title" x="${node.x}" y="${titleY}" text-anchor="middle">${escapeHtml(node.label)}</text>
      ${node.subtitle ? `<text class="node-sub" x="${node.x}" y="${node.y + 16}" text-anchor="middle">${escapeHtml(node.subtitle)}</text>` : ""}
    </g>
  `;
}

function getNodePosition(node, index, count) {
  if (Number.isFinite(node.x) && Number.isFinite(node.y)) {
    return { x: node.x, y: node.y };
  }

  const classicAngles = [-Math.PI, -Math.PI / 2, 0, Math.PI / 2];
  const angle = count === 4 ? classicAngles[index] : -Math.PI / 2 + (index * 2 * Math.PI) / count;

  return {
    x: Math.round(diagramCenter.x + diagramRadius.x * Math.cos(angle)),
    y: Math.round(diagramCenter.y + diagramRadius.y * Math.sin(angle)),
  };
}

function getLoopPath(nodes) {
  if (isClassicFourNodeLayout(nodes)) {
    return classicLoopPath;
  }
  return makeSmoothClosedPath(nodes);
}

function isClassicFourNodeLayout(nodes) {
  if (nodes.length !== 4) {
    return false;
  }

  const classic = [
    { x: 88, y: 150 },
    { x: 210, y: 84 },
    { x: 332, y: 150 },
    { x: 210, y: 216 },
  ];

  return nodes.every((node, index) => Math.abs(node.x - classic[index].x) < 0.5 && Math.abs(node.y - classic[index].y) < 0.5);
}

function makeSmoothClosedPath(nodes) {
  if (!nodes.length) {
    return "";
  }
  if (nodes.length === 1) {
    const node = nodes[0];
    return `M${node.x - sphereRadius} ${node.y} A${sphereRadius} ${sphereRadius} 0 1 0 ${node.x + sphereRadius} ${node.y} A${sphereRadius} ${sphereRadius} 0 1 0 ${node.x - sphereRadius} ${node.y}`;
  }
  if (nodes.length === 2) {
    return `M${nodes[0].x} ${nodes[0].y} L${nodes[1].x} ${nodes[1].y}`;
  }

  const tension = 0.34;
  const segments = [`M${nodes[0].x} ${nodes[0].y}`];

  nodes.forEach((point, index) => {
    const previous = nodes[(index - 1 + nodes.length) % nodes.length];
    const next = nodes[(index + 1) % nodes.length];
    const afterNext = nodes[(index + 2) % nodes.length];
    const controlOne = {
      x: point.x + ((next.x - previous.x) * tension) / 2,
      y: point.y + ((next.y - previous.y) * tension) / 2,
    };
    const controlTwo = {
      x: next.x - ((afterNext.x - point.x) * tension) / 2,
      y: next.y - ((afterNext.y - point.y) * tension) / 2,
    };

    segments.push(`C${round(controlOne.x)} ${round(controlOne.y)}, ${round(controlTwo.x)} ${round(controlTwo.y)}, ${next.x} ${next.y}`);
  });

  return segments.join(" ");
}

function getUpperGridPath(x, y) {
  return `M${x - 36} ${y - 26} C${x - 15} ${y - 14}, ${x + 16} ${y - 14}, ${x + 36} ${y - 26}`;
}

function getLowerGridPath(x, y) {
  return `M${x - 36} ${y + 26} C${x - 15} ${y + 14}, ${x + 16} ${y + 14}, ${x + 36} ${y + 26}`;
}

function getGradientId(id) {
  return `globe-${toSafeClassName(id)}`;
}

function toSafeClassName(value) {
  return String(value).replace(/[^A-Za-z0-9_-]/g, "-");
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function renderConceptNodes(globalNode) {
  nodeLayer.innerHTML = globalNode.children
    .map((id) => {
      const node = conceptNodes[id];
      return `
      <button
        class="layer-node"
        type="button"
        data-concept-node="${escapeHtml(id)}"
        aria-current="${id === activeConcept}"
        style="--node-color: ${globalNode.color};"
      >
        <b>${escapeHtml(node.label)}</b>
        <span>${escapeHtml(node.short)}</span>
      </button>
    `;
    })
    .join("");

  nodeLayer.querySelectorAll("[data-concept-node]").forEach((button) => {
    button.addEventListener("click", () => {
      activeConcept = button.dataset.conceptNode;
      activeProject = conceptNodes[activeConcept].projects[0];
      projectDetailOpen = true;
      renderConceptDetail();
      renderConceptNodes(globalNodes[activeGlobal]);
    });
  });
}

function renderProjectNodes(concept) {
  return concept.projects
    .map((id) => {
      const project = projects[id];
      const isActive = id === activeProject;
      const inlineDetail = isActive && projectDetailOpen ? renderProjectDetail(project, "inline-project-detail") : "";
      return `
      <button
        class="project-node"
        type="button"
        data-project-node="${escapeHtml(id)}"
        aria-current="${isActive}"
        aria-expanded="${isActive && projectDetailOpen}"
        style="--project-accent: ${concept.color};"
      >
        <span class="project-meta">${escapeHtml(project.venue)}</span>
        <b>${escapeHtml(project.title)}</b>
        <span>${escapeHtml(project.summary)}</span>
      </button>
      ${inlineDetail}
    `;
    })
    .join("");
}

function renderProjectDetail(project, extraClass = "") {
  const className = ["project-detail", extraClass].filter(Boolean).join(" ");
  return `
    <div class="${className}">
      <div>
        <b>${escapeHtml(site.claimLabel)}</b>
        <span>${formatText(project.claim)}</span>
      </div>
      <div>
        <b>${escapeHtml(site.limitLabel)}</b>
        <span>${formatText(project.limit)}</span>
      </div>
      <div>
        <b>${escapeHtml(site.designMoveLabel)}</b>
        <span>${formatText(project.design)}</span>
      </div>
    </div>
  `;
}

function renderConceptDetail() {
  const concept = conceptNodes[activeConcept];
  const project = projects[activeProject];
  setLayerTheme(concept.color, concept.soft);

  nodeDetail.classList.remove("is-empty");
  nodeDetail.innerHTML = `
    <div class="detail-top">
      <div>
        <p class="eyebrow">${escapeHtml(concept.eyebrow || site.lensEyebrow)}</p>
        <h3>${escapeHtml(concept.title)}</h3>
        <p>${formatText(concept.text)}</p>
      </div>
      <div class="memory-chip">
        <b>${escapeHtml(concept.memoryLabel || site.memoryLabel)}</b>
        <span>${formatText(concept.memory)}</span>
      </div>
    </div>
    <div class="project-nodes">
      ${renderProjectNodes(concept)}
    </div>
    ${projectDetailOpen ? renderProjectDetail(project, "desktop-project-detail") : ""}
  `;

  nodeDetail.querySelectorAll("[data-project-node]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextProject = button.dataset.projectNode;
      if (nextProject === activeProject) {
        projectDetailOpen = !projectDetailOpen;
      } else {
        activeProject = nextProject;
        projectDetailOpen = true;
      }
      renderConceptDetail();
    });
  });
}

function openGlobalNode(id, updateHash = true) {
  const globalNode = globalNodes[id];
  if (!globalNode) {
    return;
  }

  activeGlobal = id;
  activeConcept = globalNode.children[0];
  activeProject = conceptNodes[activeConcept].projects[0];
  projectDetailOpen = true;

  globalStage.hidden = true;
  detailLayer.hidden = false;
  setActiveDiagramNode(id);
  setLayerTheme(globalNode.color, globalNode.soft);

  layerEyebrow.textContent = globalNode.eyebrow;
  layerTitle.textContent = globalNode.title;
  layerText.textContent = globalNode.text;

  renderConceptNodes(globalNode);
  renderConceptDetail();

  if (updateHash) {
    setViewHash(id);
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

function returnToGlobalView(updateHash = true) {
  detailLayer.hidden = true;
  globalStage.hidden = false;
  activeGlobal = null;
  activeConcept = null;
  activeProject = null;
  projectDetailOpen = true;
  setActiveDiagramNode(null);
  if (updateHash) {
    setViewHash(null);
  }
  window.scrollTo({ top: 0, behavior: "auto" });
}

function showLoadError(error) {
  pageTitle.textContent = "Research agenda could not load.";
  diagramDefs.innerHTML = "";
  diagramNodesLayer.innerHTML = "";
  diagramCaption.textContent = "";
  console.error(error);
}

async function init() {
  try {
    const agenda = await loadAgenda();
    site = agenda.site;
    globalOrder = agenda.globalOrder;
    globalNodes = agenda.globalNodes;
    conceptNodes = agenda.conceptNodes;
    projects = agenda.projects;

    renderSite();
    renderGlobalDiagram();

    returnButton.addEventListener("click", returnToGlobalView);
    window.addEventListener("hashchange", () => {
      const hashNode = getGlobalNodeFromHash();
      if (hashNode) {
        openGlobalNode(hashNode, false);
      } else if (globalStage.hidden) {
        returnToGlobalView(false);
      }
    });

    const initialHashNode = getGlobalNodeFromHash();
    if (initialHashNode) {
      openGlobalNode(initialHashNode, false);
    }
  } catch (error) {
    showLoadError(error);
  }
}

init();
