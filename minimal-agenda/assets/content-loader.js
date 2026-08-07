export const themeColors = {
  objective: "#226092",
  structure: "#1f7a73",
  limits: "#a45d47",
  design: "#9a6b20",
  blue: "#226092",
  teal: "#1f7a73",
  rust: "#a45d47",
  gold: "#9a6b20",
  sage: "#5f7650",
};

export const themeSoftColors = {
  objective: "#eef5fa",
  structure: "#eef8f6",
  limits: "#fbf1ee",
  design: "#fbf5e8",
  blue: "#eef5fa",
  teal: "#eef8f6",
  sage: "#f1f6ed",
  rust: "#fbf1ee",
  gold: "#fbf5e8",
};

const requiredPaperSections = ["claim", "limit", "design_move"];

export function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

export function toHex(value) {
  return value.toString(16).padStart(2, "0");
}

export function mixColor(color, target, colorWeight) {
  const source = hexToRgb(color);
  const destination = hexToRgb(target);
  const targetWeight = 1 - colorWeight;
  return `#${toHex(Math.round(source.r * colorWeight + destination.r * targetWeight))}${toHex(Math.round(source.g * colorWeight + destination.g * targetWeight))}${toHex(Math.round(source.b * colorWeight + destination.b * targetWeight))}`;
}

export function parseMarkdownDocument(markdown, source = "markdown document") {
  const normalized = String(markdown)
    .replace(/\r\n/g, "\n")
    .replace(/^<!-- raw-agenda-content -->\n+/, "");
  const match = normalized.match(/^(?:[ \t]*\n)*---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)([\s\S]*)$/);
  if (!match) {
    return {
      data: {},
      body: normalized.trim(),
      source,
    };
  }

  return {
    data: parseFrontmatter(match[1], source),
    body: match[2].trim(),
    source,
  };
}

export function parseFrontmatter(frontmatter, source = "frontmatter") {
  const data = {};
  let currentListKey = null;

  frontmatter.split("\n").forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch && currentListKey) {
      data[currentListKey].push(parseFrontmatterValue(listMatch[1]));
      return;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) {
      throw new Error(`${source}:${index + 1} is not valid frontmatter.`);
    }

    const [, key, rawValue] = keyMatch;
    if (rawValue === "") {
      data[key] = [];
      currentListKey = key;
      return;
    }

    data[key] = parseFrontmatterValue(rawValue);
    currentListKey = null;
  });

  return data;
}

export function extractMarkdownSections(markdown) {
  const sections = {};
  let currentKey = "body";
  sections[currentKey] = [];

  String(markdown)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .forEach((line) => {
      const heading = line.match(/^##\s+(.+?)\s*$/);
      if (heading) {
        currentKey = normalizeSectionKey(heading[1]);
        sections[currentKey] = [];
        return;
      }

      sections[currentKey].push(line);
    });

  Object.keys(sections).forEach((key) => {
    sections[key] = normalizeMarkdownText(sections[key].join("\n"));
  });

  return sections;
}

export function normalizeMarkdownText(markdown) {
  return String(markdown)
    .replace(/\r\n/g, "\n")
    .replace(/^\s*#\s+.+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function loadAgenda(options = {}) {
  const contentRoot = options.contentRoot ?? new URL("../content/", import.meta.url);
  const fetchText = options.fetchText ?? fetchTextFromNetwork;
  const manifest = await loadMarkdown(contentRoot, "agenda.md", fetchText);
  const manifestData = manifest.data;
  const globalOrder = readIdList(manifestData.global_nodes, "agenda.md: global_nodes");

  const globalEntries = await Promise.all(globalOrder.map((id) => loadGlobalNode(contentRoot, id, fetchText)));

  const globalNodes = indexById(globalEntries, "global nodes");
  const lensIds = uniqueIds(globalEntries.flatMap((node) => node.children));
  const lensEntries = await Promise.all(lensIds.map((id) => loadLens(contentRoot, id, fetchText)));

  const conceptNodes = indexById(lensEntries, "lenses");
  const paperIds = uniqueIds(lensEntries.flatMap((lens) => lens.projects));
  const paperEntries = await Promise.all(paperIds.map((id) => loadPaper(contentRoot, id, fetchText)));

  const projects = indexById(paperEntries, "papers");
  validateAgenda({ globalNodes, conceptNodes, projects });

  return {
    site: {
      browserTitle: readOptionalString(manifestData.browser_title, "Yichao Cai - Research Agenda"),
      headline: readRequiredString(manifestData.headline, "agenda.md: headline"),
      captionLeft: readOptionalString(manifestData.caption_left, "objective analysis"),
      captionRight: readOptionalString(manifestData.caption_right, "objective design"),
      lensEyebrow: readOptionalString(manifestData.lens_eyebrow, "Local mechanism"),
      memoryLabel: readOptionalString(manifestData.memory_label, "Mental hook"),
      claimLabel: readOptionalString(manifestData.claim_label, "Claim"),
      limitLabel: readOptionalString(manifestData.limit_label, "Limit"),
      designMoveLabel: readOptionalString(manifestData.design_move_label, "Design move"),
    },
    globalOrder,
    globalNodes,
    conceptNodes,
    projects,
  };
}

async function fetchTextFromNetwork(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function loadMarkdown(contentRoot, relativePath, fetchText) {
  const url = new URL(relativePath, contentRoot);
  const text = await fetchText(url);
  return parseMarkdownDocument(text, relativePath);
}

async function loadGlobalNode(contentRoot, id, fetchText) {
  const document = await loadMarkdown(contentRoot, `global/${id}.md`, fetchText);
  const data = document.data;
  const resolvedId = readId(data.id ?? id, document.source);
  assertMatchingId(id, resolvedId, document.source);
  const theme = readOptionalString(data.theme ?? data.color, resolvedId);
  const colors = resolveThemeColors(theme, data.soft);

  return {
    id: resolvedId,
    label: readRequiredString(data.label, `${document.source}: label`),
    subtitle: readOptionalString(data.subtitle, ""),
    eyebrow: readOptionalString(data.eyebrow, `Global node / ${readOptionalString(data.label, resolvedId)}`),
    title: readRequiredString(data.title, `${document.source}: title`),
    text: normalizeMarkdownText(document.body),
    theme,
    color: colors.color,
    soft: colors.soft,
    x: readOptionalNumber(data.x),
    y: readOptionalNumber(data.y),
    children: readIdList(data.lenses ?? data.children, `${document.source}: lenses`),
  };
}

async function loadLens(contentRoot, id, fetchText) {
  const document = await loadMarkdown(contentRoot, `lenses/${id}.md`, fetchText);
  const data = document.data;
  const resolvedId = readId(data.id ?? id, document.source);
  assertMatchingId(id, resolvedId, document.source);
  const theme = readOptionalString(data.theme ?? data.color, resolvedId);
  const colors = resolveThemeColors(theme, data.soft);

  return {
    id: resolvedId,
    label: readRequiredString(data.label, `${document.source}: label`),
    short: readOptionalString(data.short, ""),
    eyebrow: readOptionalString(data.eyebrow, ""),
    title: readRequiredString(data.title, `${document.source}: title`),
    text: normalizeMarkdownText(document.body),
    memory: readOptionalString(data.memory, ""),
    memoryLabel: readOptionalString(data.memory_label, ""),
    theme,
    color: colors.color,
    soft: colors.soft,
    projects: readIdList(data.papers ?? data.projects, `${document.source}: papers`),
  };
}

async function loadPaper(contentRoot, id, fetchText) {
  const document = await loadMarkdown(contentRoot, `papers/${id}.md`, fetchText);
  const data = document.data;
  const resolvedId = readId(data.id ?? id, document.source);
  assertMatchingId(id, resolvedId, document.source);
  const sections = extractMarkdownSections(document.body);

  return {
    id: resolvedId,
    title: readRequiredString(data.title, `${document.source}: title`),
    venue: readRequiredString(data.venue, `${document.source}: venue`),
    summary: readRequiredString(data.summary, `${document.source}: summary`),
    claim: readRequiredText(sections.claim ?? data.claim, `${document.source}: Claim`),
    limit: readRequiredText(sections.limit ?? data.limit, `${document.source}: Limit`),
    design: readRequiredText(sections.design_move ?? sections.design ?? data.design, `${document.source}: Design move`),
  };
}

function parseFrontmatterValue(value) {
  const trimmed = String(value).trim();
  if (!trimmed) {
    return "";
  }

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    return inner ? inner.split(",").map((item) => parseFrontmatterValue(item.trim())) : [];
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  return trimmed;
}

function normalizeSectionKey(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function resolveThemeColors(themeOrColor, softOverride) {
  const color = resolveColor(themeOrColor);
  const soft = softOverride ? resolveSoftColor(softOverride, color) : resolveSoftColor(themeOrColor, color);
  return { color, soft };
}

function resolveColor(themeOrColor) {
  const value = String(themeOrColor).trim();
  if (isHexColor(value)) {
    return value.toLowerCase();
  }
  if (themeColors[value]) {
    return themeColors[value];
  }
  throw new Error(`Unknown color theme "${value}". Use a theme name or a hex color.`);
}

function resolveSoftColor(themeOrColor, baseColor) {
  const value = String(themeOrColor).trim();
  if (isHexColor(value)) {
    return value.toLowerCase();
  }
  return themeSoftColors[value] ?? mixColor(baseColor, "#ffffff", 0.08);
}

function isHexColor(value) {
  return /^#[0-9a-fA-F]{6}$/.test(String(value).trim());
}

function readId(value, source) {
  const id = readRequiredString(value, `${source}: id`);
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error(`${source}: id "${id}" can only use letters, numbers, hyphens, and underscores.`);
  }
  return id;
}

function readIdList(value, source) {
  const list = Array.isArray(value) ? value : [];
  if (!list.length) {
    throw new Error(`${source} must list at least one id.`);
  }
  return list.map((id) => readId(id, source));
}

function readRequiredString(value, source) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${source} is required.`);
  }
  return value.trim();
}

function readRequiredText(value, source) {
  const text = typeof value === "string" ? normalizeMarkdownText(value) : "";
  if (!text) {
    throw new Error(`${source} is required.`);
  }
  return text;
}

function readOptionalString(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readOptionalNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function assertMatchingId(expected, actual, source) {
  if (expected !== actual) {
    throw new Error(`${source}: id "${actual}" does not match file name "${expected}".`);
  }
}

function uniqueIds(ids) {
  return [...new Set(ids)];
}

function indexById(entries, label) {
  return entries.reduce((index, entry) => {
    if (index[entry.id]) {
      throw new Error(`Duplicate ${label} id "${entry.id}".`);
    }
    index[entry.id] = entry;
    return index;
  }, {});
}

function validateAgenda({ globalNodes, conceptNodes, projects }) {
  Object.values(globalNodes).forEach((node) => {
    node.children.forEach((id) => {
      if (!conceptNodes[id]) {
        throw new Error(`Global node "${node.id}" references missing lens "${id}".`);
      }
    });
  });

  Object.values(conceptNodes).forEach((lens) => {
    lens.projects.forEach((id) => {
      if (!projects[id]) {
        throw new Error(`Lens "${lens.id}" references missing paper "${id}".`);
      }
    });
  });

  Object.values(projects).forEach((paper) => {
    requiredPaperSections.forEach((field) => {
      const key = field === "design_move" ? "design" : field;
      if (!paper[key]) {
        throw new Error(`Paper "${paper.id}" is missing ${field}.`);
      }
    });
  });
}
