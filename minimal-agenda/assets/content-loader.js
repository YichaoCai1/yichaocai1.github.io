export const phases = ["objective", "structure", "limits", "design"];
export const statusLabels = {
  published: "Published",
  preprint: "Preprint",
  ongoing: "Ongoing project",
  future: "Future direction",
  "long-term": "Long-term direction",
};

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
  const fetchText =
    options.fetchText ??
    (async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Could not load " + url + ": " + response.status);
      return response.text();
    });
  const read = async (name) => parseMarkdownDocument(await fetchText(new URL(name, contentRoot)), name);
  const manifest = await read("agenda.md");
  const strandOrder = readIds(manifest.data.strands, "agenda.md: strands");
  const strandEntries = await Promise.all(
    strandOrder.map(async (id) => {
      const doc = await read("strands/" + id + ".md");
      const data = doc.data;
      if (data.id !== id) throw new Error(doc.source + ": id must match file name");
      const sections = extractMarkdownSections(doc.body);
      const papers = readIds(data.papers, doc.source + ": papers");
      const directions = data.directions === undefined ? [] : readIds(data.directions, doc.source + ": directions");
      if (papers.some((key) => directions.includes(key))) throw new Error(doc.source + ": an entry cannot be both evidence and a future direction");
      if (!["blue", "teal", "violet"].includes(data.theme)) throw new Error(doc.source + ": unknown strand theme");
      return {
        id,
        label: required(data.label, doc.source + ": label"),
        short: required(data.short, doc.source + ": short"),
        theme: data.theme,
        question: required(data.question, doc.source + ": question"),
        summary: required(data.summary, doc.source + ": summary"),
        phases: phases.map((phase) => ({
          id: phase,
          title: required(data[phase + "_title"], doc.source + ": " + phase + "_title"),
          text: required(sections[phase], doc.source + ": " + phase),
        })),
        scope: required(sections.scope, doc.source + ": Scope"),
        next: required(sections.next, doc.source + ": Next"),
        papers,
        directions,
        evidence: Object.fromEntries(
          papers.map((key) => [key, required(sections[normalizeSectionKey("Evidence " + key)], doc.source + ": Evidence " + key)])
        ),
      };
    })
  );
  const projectIds = [...new Set(strandEntries.flatMap((strand) => [...strand.papers, ...strand.directions]))];
  const projectEntries = await Promise.all(
    projectIds.map(async (id) => {
      const doc = await read("papers/" + id + ".md");
      const data = doc.data;
      if (data.id !== id) throw new Error(doc.source + ": id must match file name");
      if (!Object.hasOwn(statusLabels, data.status)) throw new Error(doc.source + ": unknown publication status");
      const url = data.paper_url || "";
      if (url && !/^https?:\/\//.test(url)) throw new Error(doc.source + ": paper_url must be an HTTP(S) URL");
      return {
        id,
        title: required(data.title, doc.source + ": title"),
        venue: required(data.venue, doc.source + ": venue"),
        status: data.status,
        summary: required(data.summary, doc.source + ": summary"),
        url,
        question: data.question || "",
      };
    })
  );
  const projects = Object.fromEntries(projectEntries.map((project) => [project.id, project]));
  strandEntries.forEach((strand) => {
    strand.papers.forEach((id) => {
      if (!["published", "preprint"].includes(projects[id].status) || !projects[id].url)
        throw new Error(id + ": evidence needs a publication or preprint link");
    });
    strand.directions.forEach((id) => {
      if (["published", "preprint"].includes(projects[id].status) || !projects[id].question)
        throw new Error(id + ": a direction needs a research question and ongoing/future status");
    });
  });
  return {
    site: {
      browserTitle: manifest.data.browser_title || "Research agenda",
      headline: required(manifest.data.headline, "agenda.md: headline"),
      introduction: required(manifest.data.introduction, "agenda.md: introduction"),
      connection: required(extractMarkdownSections(manifest.body).connection, "agenda.md: Connection"),
    },
    strandOrder,
    strands: Object.fromEntries(strandEntries.map((strand) => [strand.id, strand])),
    projects,
  };
}

export function resolveStrandHash(hash, strandOrder) {
  try {
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    return strandOrder.includes(id) ? id : strandOrder[0];
  } catch {
    return strandOrder[0];
  }
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

function required(value, source) {
  if (typeof value !== "string" || !value.trim()) throw new Error(source + " is required");
  return value.trim();
}

function readIds(value, source) {
  if (!Array.isArray(value) || !value.length) throw new Error(source + " must list at least one id");
  if (value.some((id) => typeof id !== "string" || !/^[A-Za-z0-9_-]+$/.test(id))) throw new Error(source + ": invalid id");
  if (new Set(value).size !== value.length) throw new Error(source + ": duplicate id");
  return value;
}
