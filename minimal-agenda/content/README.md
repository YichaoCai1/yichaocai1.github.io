# Research agenda content

Agenda files begin with `<!-- raw-agenda-content -->` so Jekyll copies the
Markdown verbatim for the browser loader.

## Overview and research questions

Edit `agenda.md` for the headline, introduction, common-thread paragraph, and
ordered `strands` list. The non-clickable Objective → Structure → Limits → Design
overview is in `minimal-agenda/index.html`; its circulating loop is resized by
the application, with pause and reduced-motion support.

Each `strands/<id>.md` contains one complete research story:

- `label`, `short`, `question`, `summary`, and a `theme` (blue, teal, or violet).
- A heading field for each phase: `objective_title`, `structure_title`,
  `limits_title`, and `design_title`.
- Sections `Objective`, `Structure`, `Limits`, `Design`, `Scope`, and `Next`.
- A `papers` list and one `## Evidence <paper-id>` section per paper, explaining
  its relevance to this particular question.
- An optional `directions` list for ongoing projects and future questions.

A paper can support more than one strand, but needs a distinct contextual
description in each. Duplicate entries within a strand are rejected.
The URL hash selects a strand, such as `/research-agenda/#masked`.
Existing framework hashes still identify the four overview stages.

## Papers and directions

Canonical entries remain in `papers/<id>.md`.
Published work needs `status: published` or `status: preprint`, plus a
`paper_url` using HTTP(S). Titles link directly to the paper.

Directions need `status: ongoing`, `status: future`, or `status: long-term`
and a `question` field. The page presents these as questions, separately from
publication evidence. Existing Claim / Limit / Design move notes are retained
in the files as background material.

The previous `global/` and `lenses/` files are retained as reference material.
They no longer drive navigation or generate repeated paper cards.

Run `node --test minimal-agenda/tests/content-loader.test.js` after content edits.
