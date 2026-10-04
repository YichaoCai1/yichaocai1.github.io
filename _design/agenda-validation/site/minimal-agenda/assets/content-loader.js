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
function required(e, r) {
  if ("string" != typeof e || !e.trim()) throw new Error(r + " is required");
  return e.trim();
}
function readIds(e, r) {
  if (!Array.isArray(e) || !e.length) throw new Error(r + " must list at least one id");
  if (e.some((e) => "string" != typeof e || !/^[A-Za-z0-9_-]+$/.test(e))) throw new Error(r + ": invalid id");
  if (new Set(e).size !== e.length) throw new Error(r + ": duplicate id");
  return e;
}
export const phases = ["objective", "structure", "limits", "design"];
export const statusLabels = {
  published: "Published",
  preprint: "Preprint",
  ongoing: "Ongoing project",
  future: "Future direction",
  "long-term": "Long-term direction",
};
export function parseMarkdownDocument(e, r = "markdown document") {
  const t = String(e)
      .replace(/\r\n/g, "\n")
      .replace(/^<!-- raw-agenda-content -->\n+/, ""),
    n = t.match(/^(?:[ \t]*\n)*---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)([\s\S]*)$/);
  return n ? { data: parseFrontmatter(n[1], r), body: n[2].trim(), source: r } : { data: {}, body: t.trim(), source: r };
}
export function parseFrontmatter(e, r = "frontmatter") {
  const t = {};
  let n = null;
  return (
    e.split("\n").forEach((e, o) => {
      const i = e.trim();
      if (!i || i.startsWith("#")) return;
      const s = e.match(/^\s*-\s+(.+)$/);
      if (s && n) return void t[n].push(parseFrontmatterValue(s[1]));
      const a = e.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (!a) throw new Error(`${r}:${o + 1} is not valid frontmatter.`);
      const [, u, c] = a;
      if ("" === c) return ((t[u] = []), void (n = u));
      ((t[u] = parseFrontmatterValue(c)), (n = null));
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
        const n = e.match(/^##\s+(.+?)\s*$/);
        if (n) return ((t = normalizeSectionKey(n[1])), void (r[t] = []));
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
    t =
      e.fetchText ??
      (async (e) => {
        const r = await fetch(e);
        if (!r.ok) throw new Error("Could not load " + e + ": " + r.status);
        return r.text();
      }),
    n = async (e) => parseMarkdownDocument(await t(new URL(e, r)), e),
    o = await n("agenda.md"),
    i = readIds(o.data.strands, "agenda.md: strands"),
    s = await Promise.all(
      i.map(async (e) => {
        const r = await n("strands/" + e + ".md"),
          t = r.data;
        if (t.id !== e) throw new Error(r.source + ": id must match file name");
        const o = extractMarkdownSections(r.body),
          i = readIds(t.papers, r.source + ": papers"),
          s = void 0 === t.directions ? [] : readIds(t.directions, r.source + ": directions");
        if (i.some((e) => s.includes(e))) throw new Error(r.source + ": an entry cannot be both evidence and a future direction");
        if (!["blue", "teal", "violet"].includes(t.theme)) throw new Error(r.source + ": unknown strand theme");
        return {
          id: e,
          label: required(t.label, r.source + ": label"),
          short: required(t.short, r.source + ": short"),
          theme: t.theme,
          question: required(t.question, r.source + ": question"),
          summary: required(t.summary, r.source + ": summary"),
          phases: phases.map((e) => ({
            id: e,
            title: required(t[e + "_title"], r.source + ": " + e + "_title"),
            text: required(o[e], r.source + ": " + e),
          })),
          scope: required(o.scope, r.source + ": Scope"),
          next: required(o.next, r.source + ": Next"),
          papers: i,
          directions: s,
          evidence: Object.fromEntries(i.map((e) => [e, required(o[normalizeSectionKey("Evidence " + e)], r.source + ": Evidence " + e)])),
        };
      })
    ),
    a = [...new Set(s.flatMap((e) => [...e.papers, ...e.directions]))],
    u = await Promise.all(
      a.map(async (e) => {
        const r = await n("papers/" + e + ".md"),
          t = r.data;
        if (t.id !== e) throw new Error(r.source + ": id must match file name");
        if (!Object.hasOwn(statusLabels, t.status)) throw new Error(r.source + ": unknown publication status");
        const o = t.paper_url || "";
        if (o && !/^https?:\/\//.test(o)) throw new Error(r.source + ": paper_url must be an HTTP(S) URL");
        return {
          id: e,
          title: required(t.title, r.source + ": title"),
          venue: required(t.venue, r.source + ": venue"),
          status: t.status,
          summary: required(t.summary, r.source + ": summary"),
          url: o,
          question: t.question || "",
        };
      })
    ),
    c = Object.fromEntries(u.map((e) => [e.id, e]));
  return (
    s.forEach((e) => {
      (e.papers.forEach((e) => {
        if (!["published", "preprint"].includes(c[e].status) || !c[e].url) throw new Error(e + ": evidence needs a publication or preprint link");
      }),
        e.directions.forEach((e) => {
          if (["published", "preprint"].includes(c[e].status) || !c[e].question)
            throw new Error(e + ": a direction needs a research question and ongoing/future status");
        }));
    }),
    {
      site: {
        browserTitle: o.data.browser_title || "Research agenda",
        headline: required(o.data.headline, "agenda.md: headline"),
        introduction: required(o.data.introduction, "agenda.md: introduction"),
        connection: required(extractMarkdownSections(o.body).connection, "agenda.md: Connection"),
      },
      strandOrder: i,
      strands: Object.fromEntries(s.map((e) => [e.id, e])),
      projects: c,
    }
  );
}
export function resolveStrandHash(e, r) {
  try {
    const t = decodeURIComponent(e.replace(/^#/, ""));
    return r.includes(t) ? t : r[0];
  } catch {
    return r[0];
  }
}
