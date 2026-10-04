async function fetchTextFromNetwork(e) {
  const r = await fetch(e);
  if (!r.ok) throw new Error(`Could not load ${e}: ${r.status} ${r.statusText}`);
  return r.text();
}
async function loadMarkdown(e, r, t) {
  const o = new URL(r, e);
  return parseMarkdownDocument(await t(o), r);
}
async function loadGlobalNode(e, r, t) {
  const o = await loadMarkdown(e, `global/${r}.md`, t),
    n = o.data,
    a = readId(n.id ?? r, o.source);
  assertMatchingId(r, a, o.source);
  const i = readOptionalString(n.theme ?? n.color, a),
    s = resolveThemeColors(i, n.soft);
  return {
    id: a,
    label: readRequiredString(n.label, `${o.source}: label`),
    subtitle: readOptionalString(n.subtitle, ""),
    eyebrow: readOptionalString(n.eyebrow, `Global node / ${readOptionalString(n.label, a)}`),
    title: readRequiredString(n.title, `${o.source}: title`),
    text: normalizeMarkdownText(o.body),
    theme: i,
    color: s.color,
    soft: s.soft,
    x: readOptionalNumber(n.x),
    y: readOptionalNumber(n.y),
    children: readIdList(n.lenses ?? n.children, `${o.source}: lenses`),
  };
}
async function loadLens(e, r, t) {
  const o = await loadMarkdown(e, `lenses/${r}.md`, t),
    n = o.data,
    a = readId(n.id ?? r, o.source);
  assertMatchingId(r, a, o.source);
  const i = readOptionalString(n.theme ?? n.color, a),
    s = resolveThemeColors(i, n.soft);
  return {
    id: a,
    label: readRequiredString(n.label, `${o.source}: label`),
    short: readOptionalString(n.short, ""),
    eyebrow: readOptionalString(n.eyebrow, ""),
    title: readRequiredString(n.title, `${o.source}: title`),
    text: normalizeMarkdownText(o.body),
    memory: readOptionalString(n.memory, ""),
    memoryLabel: readOptionalString(n.memory_label, ""),
    theme: i,
    color: s.color,
    soft: s.soft,
    projects: readIdList(n.papers ?? n.projects, `${o.source}: papers`),
  };
}
async function loadPaper(e, r, t) {
  const o = await loadMarkdown(e, `papers/${r}.md`, t),
    n = o.data,
    a = readId(n.id ?? r, o.source);
  assertMatchingId(r, a, o.source);
  const i = extractMarkdownSections(o.body);
  return {
    id: a,
    title: readRequiredString(n.title, `${o.source}: title`),
    venue: readRequiredString(n.venue, `${o.source}: venue`),
    url: readOptionalString(n.paper_url, ""),
    summary: readRequiredString(n.summary, `${o.source}: summary`),
    claim: readRequiredText(i.claim ?? n.claim, `${o.source}: Claim`),
    limit: readRequiredText(i.limit ?? n.limit, `${o.source}: Limit`),
    design: readRequiredText(i.design_move ?? i.design ?? n.design, `${o.source}: Design move`),
  };
}
function parseFrontmatterValue(e) {
  const r = String(e).trim();
  if (!r) return "";
  if ((r.startsWith('"') && r.endsWith('"')) || (r.startsWith("'") && r.endsWith("'"))) return r.slice(1, -1);
  if (r.startsWith("[") && r.endsWith("]")) {
    const e = r.slice(1, -1).trim();
    return e ? e.split(",").map((e) => parseFrontmatterValue(e.trim())) : [];
  }
  return /^-?\d+(\.\d+)?$/.test(r) ? Number(r) : "true" === r || ("false" !== r && r);
}
function normalizeSectionKey(e) {
  return String(e)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
function resolveThemeColors(e, r) {
  const t = resolveColor(e);
  return { color: t, soft: resolveSoftColor(r || e, t) };
}
function resolveColor(e) {
  const r = String(e).trim();
  if (isHexColor(r)) return r.toLowerCase();
  if (themeColors[r]) return themeColors[r];
  throw new Error(`Unknown color theme "${r}". Use a theme name or a hex color.`);
}
function resolveSoftColor(e, r) {
  const t = String(e).trim();
  return isHexColor(t) ? t.toLowerCase() : (themeSoftColors[t] ?? mixColor(r, "#ffffff", 0.08));
}
function isHexColor(e) {
  return /^#[0-9a-fA-F]{6}$/.test(String(e).trim());
}
function readId(e, r) {
  const t = readRequiredString(e, `${r}: id`);
  if (!/^[A-Za-z0-9_-]+$/.test(t)) throw new Error(`${r}: id "${t}" can only use letters, numbers, hyphens, and underscores.`);
  return t;
}
function readIdList(e, r) {
  const t = Array.isArray(e) ? e : [];
  if (!t.length) throw new Error(`${r} must list at least one id.`);
  return t.map((e) => readId(e, r));
}
function readRequiredString(e, r) {
  if ("string" != typeof e || !e.trim()) throw new Error(`${r} is required.`);
  return e.trim();
}
function readRequiredText(e, r) {
  const t = "string" == typeof e ? normalizeMarkdownText(e) : "";
  if (!t) throw new Error(`${r} is required.`);
  return t;
}
function readOptionalString(e, r) {
  return "string" == typeof e && e.trim() ? e.trim() : r;
}
function readOptionalNumber(e) {
  return "number" == typeof e && Number.isFinite(e) ? e : null;
}
function assertMatchingId(e, r, t) {
  if (e !== r) throw new Error(`${t}: id "${r}" does not match file name "${e}".`);
}
function uniqueIds(e) {
  return [...new Set(e)];
}
function indexById(e, r) {
  return e.reduce((e, t) => {
    if (e[t.id]) throw new Error(`Duplicate ${r} id "${t.id}".`);
    return ((e[t.id] = t), e);
  }, {});
}
function validateAgenda({ globalNodes: e, conceptNodes: r, projects: t }) {
  (Object.values(e).forEach((e) => {
    e.children.forEach((t) => {
      if (!r[t]) throw new Error(`Global node "${e.id}" references missing lens "${t}".`);
    });
  }),
    Object.values(r).forEach((e) => {
      e.projects.forEach((r) => {
        if (!t[r]) throw new Error(`Lens "${e.id}" references missing paper "${r}".`);
      });
    }),
    Object.values(t).forEach((e) => {
      requiredPaperSections.forEach((r) => {
        if (!e["design_move" === r ? "design" : r]) throw new Error(`Paper "${e.id}" is missing ${r}.`);
      });
    }));
}
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
export function hexToRgb(e) {
  const r = e.replace("#", "");
  return { r: parseInt(r.slice(0, 2), 16), g: parseInt(r.slice(2, 4), 16), b: parseInt(r.slice(4, 6), 16) };
}
export function toHex(e) {
  return e.toString(16).padStart(2, "0");
}
export function mixColor(e, r, t) {
  const o = hexToRgb(e),
    n = hexToRgb(r),
    a = 1 - t;
  return `#${toHex(Math.round(o.r * t + n.r * a))}${toHex(Math.round(o.g * t + n.g * a))}${toHex(Math.round(o.b * t + n.b * a))}`;
}
export function parseMarkdownDocument(e, r = "markdown document") {
  const t = String(e)
      .replace(/\r\n/g, "\n")
      .replace(/^<!-- raw-agenda-content -->\n+/, ""),
    o = t.match(/^(?:[ \t]*\n)*---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)([\s\S]*)$/);
  return o ? { data: parseFrontmatter(o[1], r), body: o[2].trim(), source: r } : { data: {}, body: t.trim(), source: r };
}
export function parseFrontmatter(e, r = "frontmatter") {
  const t = {};
  let o = null;
  return (
    e.split("\n").forEach((e, n) => {
      const a = e.trim();
      if (!a || a.startsWith("#")) return;
      const i = e.match(/^\s*-\s+(.+)$/);
      if (i && o) return void t[o].push(parseFrontmatterValue(i[1]));
      const s = e.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (!s) throw new Error(`${r}:${n + 1} is not valid frontmatter.`);
      const [, l, d] = s;
      if ("" === d) return ((t[l] = []), void (o = l));
      ((t[l] = parseFrontmatterValue(d)), (o = null));
    }),
    t
  );
}
export function extractMarkdownSections(e) {
  const r = {};
  let t = "body";
  return (
    (r[t] = []),
    String(e)
      .replace(/\r\n/g, "\n")
      .split("\n")
      .forEach((e) => {
        const o = e.match(/^##\s+(.+?)\s*$/);
        if (o) return ((t = normalizeSectionKey(o[1])), void (r[t] = []));
        r[t].push(e);
      }),
    Object.keys(r).forEach((e) => {
      r[e] = normalizeMarkdownText(r[e].join("\n"));
    }),
    r
  );
}
export function normalizeMarkdownText(e) {
  return String(e)
    .replace(/\r\n/g, "\n")
    .replace(/^\s*#\s+.+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
export async function loadAgenda(e = {}) {
  const r = e.contentRoot ?? new URL("../content/", import.meta.url),
    t = e.fetchText ?? fetchTextFromNetwork,
    o = (await loadMarkdown(r, "agenda.md", t)).data,
    n = readIdList(o.global_nodes, "agenda.md: global_nodes"),
    a = await Promise.all(n.map((e) => loadGlobalNode(r, e, t))),
    i = indexById(a, "global nodes"),
    s = uniqueIds(a.flatMap((e) => e.children)),
    l = await Promise.all(s.map((e) => loadLens(r, e, t))),
    d = indexById(l, "lenses"),
    c = uniqueIds(l.flatMap((e) => e.projects)),
    u = indexById(await Promise.all(c.map((e) => loadPaper(r, e, t))), "papers");
  return (
    validateAgenda({ globalNodes: i, conceptNodes: d, projects: u }),
    {
      site: {
        browserTitle: readOptionalString(o.browser_title, "Yichao Cai - Research Agenda"),
        headline: readRequiredString(o.headline, "agenda.md: headline"),
        captionLeft: readOptionalString(o.caption_left, "objective analysis"),
        captionRight: readOptionalString(o.caption_right, "objective design"),
        lensEyebrow: readOptionalString(o.lens_eyebrow, "Local mechanism"),
        memoryLabel: readOptionalString(o.memory_label, "Mental hook"),
        claimLabel: readOptionalString(o.claim_label, "Claim"),
        limitLabel: readOptionalString(o.limit_label, "Limit"),
        designMoveLabel: readOptionalString(o.design_move_label, "Design move"),
      },
      globalOrder: n,
      globalNodes: i,
      conceptNodes: d,
      projects: u,
    }
  );
}
