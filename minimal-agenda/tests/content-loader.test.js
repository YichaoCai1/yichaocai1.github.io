import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { loadAgenda, parseMarkdownDocument, resolveStrandHash } from "../assets/content-loader.js";

const contentRoot = new URL("../content/", import.meta.url);
const loadReal = (changes = {}, requested = []) =>
  loadAgenda({
    contentRoot,
    fetchText: async (url) => {
      const key = url.href.slice(contentRoot.href.length);
      requested.push(key);
      const text = await readFile(url, "utf8");
      return changes[key] ? changes[key](text) : text;
    },
  });

test("three distinct research stories retain all five papers and five directions", async () => {
  const requested = [];
  const agenda = await loadReal({}, requested);
  assert.deepEqual(agenda.strandOrder, ["contrastive", "masked", "predictive"]);
  assert.deepEqual(agenda.strands.contrastive.papers, ["clap", "misalignment", "contrastiveGeometry"]);
  assert.deepEqual(agenda.strands.masked.papers, ["masked"]);
  assert.deepEqual(agenda.strands.predictive.papers, ["ipta"]);
  assert.equal(Object.keys(agenda.projects).length, 10);
  assert.equal(Object.values(agenda.projects).filter((p) => p.url).length, 5);
  assert.equal(agenda.projects.masked.status, "preprint");
  assert.equal(agenda.projects.ntp.status, "ongoing");
  assert.equal(agenda.projects.agents.status, "long-term");
  assert.ok(agenda.site.connection);
  assert.ok(requested.every((file) => !file.startsWith("lenses/") && !file.startsWith("global/")));
  assert.equal(requested.filter((file) => file.startsWith("papers/")).length, 10);
});

test("each story has four distinct explanations and contextual evidence", async () => {
  const agenda = await loadReal();
  for (const strand of Object.values(agenda.strands)) {
    assert.deepEqual(
      strand.phases.map((p) => p.id),
      ["objective", "structure", "limits", "design"]
    );
    assert.equal(new Set(strand.phases.map((p) => p.text)).size, 4);
    strand.papers.forEach((id) => assert.ok(strand.evidence[id]));
    strand.directions.forEach((id) => assert.ok(agenda.projects[id].question.endsWith("?")));
  }
});

test("editing strand Markdown updates the explanation without code changes", async () => {
  const agenda = await loadReal({ "strands/masked.md": (text) => text.replace("Control what is visible", "Choose the visible context") });
  assert.equal(agenda.strands.masked.phases[0].title, "Choose the visible context");
});

test("a shared paper is loaded once and keeps different contextual descriptions", async () => {
  const requested = [];
  const agenda = await loadReal(
    {
      "strands/masked.md": (text) =>
        text.replace("papers: [masked]", "papers: [masked, clap]") +
        "\n## Evidence clap\n\nView construction provides a comparison for controlling visibility.\n",
    },
    requested
  );
  assert.equal(requested.filter((file) => file === "papers/clap.md").length, 1);
  assert.notEqual(agenda.strands.masked.evidence.clap, agenda.strands.contrastive.evidence.clap);
});

test("duplicate placements within a strand are rejected", async () => {
  await assert.rejects(loadReal({ "strands/masked.md": (text) => text.replace("papers: [masked]", "papers: [masked, masked]") }), /duplicate id/);
});

test("missing contextual evidence and missing phase text are rejected", async () => {
  await assert.rejects(
    loadReal({ "strands/masked.md": (text) => text.replace("## Evidence masked", "## Removed evidence") }),
    /Evidence masked.*required/
  );
  await assert.rejects(loadReal({ "strands/masked.md": (text) => text.replace("## Limits", "## Removed limits") }), /limits.*required/);
});

test("unpublished directions cannot silently become evidence", async () => {
  await assert.rejects(
    loadReal({ "papers/masked.md": (text) => text.replace("status: preprint", "status: future") }),
    /evidence needs a publication/
  );
  await assert.rejects(loadReal({ "papers/ntp.md": (text) => text.replace(/^question:.*$/m, "") }), /direction needs a research question/);
});

test("unsafe publication link protocols are rejected", async () => {
  await assert.rejects(
    loadReal({ "papers/clap.md": (text) => text.replace("https://arxiv.org/abs/2311.16445", "javascript:alert(1)") }),
    /HTTP\(S\)/
  );
});

test("deep links restore strands while old framework and malformed hashes remain usable", () => {
  const ids = ["contrastive", "masked", "predictive"];
  assert.equal(resolveStrandHash("#masked", ids), "masked");
  assert.equal(resolveStrandHash("#predictive", ids), "predictive");
  for (const hash of ["", "#objective", "#structure", "#limits", "#design", "#missing", "#%broken"]) {
    assert.equal(resolveStrandHash(hash, ids), "contrastive");
  }
});

test("raw Markdown markers and quoted colons survive Jekyll copying", () => {
  const doc = parseMarkdownDocument(
    '<!-- raw-agenda-content -->\n\n---\ntitle: "Objective: signal"\nstrands:\n  - contrastive\n  - masked\n---\n\nBody text.\n'
  );
  assert.equal(doc.data.title, "Objective: signal");
  assert.deepEqual(doc.data.strands, ["contrastive", "masked"]);
  assert.equal(doc.body, "Body text.");
});
