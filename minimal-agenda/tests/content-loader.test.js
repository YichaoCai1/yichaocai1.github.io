import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { loadAgenda, parseMarkdownDocument } from "../assets/content-loader.js";

const realContentRoot = new URL("../content/", import.meta.url);

test("loads the current Markdown agenda", async () => {
  const agenda = await loadAgenda({
    contentRoot: realContentRoot,
    fetchText: readUrl,
  });

  assert.equal(agenda.site.headline, "Objectives decide what representations can know.");
  assert.equal(agenda.site.claimLabel, "Claim");
  assert.deepEqual(agenda.globalOrder, ["objective", "structure", "limits", "design"]);
  assert.equal(agenda.globalNodes.objective.children[0], "views");
  assert.equal(agenda.conceptNodes.views.projects[0], "clap");
  assert.equal(agenda.projects.clap.claim, "View construction changes which semantic factors are recoverable.");
});

test("paper claim edits are reflected without JavaScript changes", async () => {
  const files = createVirtualAgendaFiles();
  files["papers/basePaper.md"] = files["papers/basePaper.md"].replace("The original claim.", "The updated claim.");

  const agenda = await loadAgenda(createVirtualLoadOptions(files));

  assert.equal(agenda.projects.basePaper.claim, "The updated claim.");
});

test("new papers, lenses, and global nodes load from added Markdown files", async () => {
  const files = createVirtualAgendaFiles();
  files["agenda.md"] = files["agenda.md"].replace("  - objective", "  - objective\n  - newObjective");
  files["global/objective.md"] = files["global/objective.md"].replace("  - baseLens", "  - baseLens\n  - addedLens");
  files["global/newObjective.md"] = `---
id: newObjective
label: New objective
subtitle: new signal
title: A new global node.
theme: teal
lenses:
  - addedLens
---

This is an added top-level node.
`;
  files["lenses/baseLens.md"] = files["lenses/baseLens.md"].replace("  - basePaper", "  - basePaper\n  - addedPaper");
  files["lenses/addedLens.md"] = `---
id: addedLens
label: Added lens
title: An added lens.
theme: sage
papers:
  - addedPaper
---

This lens was added from Markdown.
`;
  files["papers/addedPaper.md"] = `---
id: addedPaper
title: Added paper
venue: Test venue
summary: Added summary.
---

## Claim

An added claim.

## Limit

An added limit.

## Design move

An added design move.
`;

  const agenda = await loadAgenda(createVirtualLoadOptions(files));

  assert.ok(agenda.globalNodes.newObjective);
  assert.ok(agenda.conceptNodes.addedLens);
  assert.ok(agenda.projects.addedPaper);
  assert.deepEqual(agenda.globalNodes.objective.children, ["baseLens", "addedLens"]);
  assert.deepEqual(agenda.conceptNodes.baseLens.projects, ["basePaper", "addedPaper"]);
});

test("frontmatter parser keeps quoted colons and list values", () => {
  const document = parseMarkdownDocument(`---
title: "Objective: the risk signal"
global_nodes:
  - objective
  - design
---

Body text.
`);

  assert.equal(document.data.title, "Objective: the risk signal");
  assert.deepEqual(document.data.global_nodes, ["objective", "design"]);
  assert.equal(document.body, "Body text.");
});

test("raw content marker keeps agenda Markdown readable after Jekyll copies it", () => {
  const document = parseMarkdownDocument(`<!-- raw-agenda-content -->

---

title: Marked agenda content

---

Body text.
`);

  assert.equal(document.data.title, "Marked agenda content");
  assert.equal(document.body, "Body text.");
});

async function readUrl(url) {
  return readFile(fileURLToPath(url), "utf8");
}

function createVirtualLoadOptions(files) {
  const contentRoot = new URL("https://example.test/content/");
  return {
    contentRoot,
    fetchText: async (url) => {
      const key = new URL(url).pathname.replace(/^\/content\//, "");
      if (!Object.hasOwn(files, key)) {
        throw new Error(`Missing virtual file ${key}`);
      }
      return files[key];
    },
  };
}

function createVirtualAgendaFiles() {
  return {
    "agenda.md": `---
browser_title: Test agenda
headline: Test headline.
caption_left: test left
caption_right: test right
lens_eyebrow: Test mechanism
memory_label: Test hook
claim_label: Claim
limit_label: Limit
design_move_label: Design move
global_nodes:
  - objective
---
`,
    "global/objective.md": `---
id: objective
label: Objective
subtitle: signal
title: Test objective.
theme: objective
lenses:
  - baseLens
---

The objective body.
`,
    "lenses/baseLens.md": `---
id: baseLens
label: Base lens
short: short lens
title: Base lens title.
memory: Base memory.
theme: blue
papers:
  - basePaper
---

The lens body.
`,
    "papers/basePaper.md": `---
id: basePaper
title: Base paper
venue: Test venue
summary: Base summary.
---

## Claim

The original claim.

## Limit

The original limit.

## Design move

The original design move.
`,
  };
}
