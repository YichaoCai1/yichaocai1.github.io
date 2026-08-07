# Agenda content guide

All agenda text now lives in Markdown files.

Agenda data files begin with `<!-- raw-agenda-content -->`. Keep that marker on
the first line so Jekyll copies the Markdown verbatim for the browser loader.

## Top-level spheres

Edit `agenda.md` to change the page title, headline, caption, or order of
global spheres.

To add a top-level sphere:

1. Add its id to `global_nodes` in `agenda.md`.
2. Create `global/<id>.md`.
3. Add lens ids under `lenses`.

The `x` and `y` fields are optional. If you omit them, the page places the
sphere automatically.

## Lenses

Each file in `lenses/` describes one clickable card in a focused view. Add paper
ids under `papers` to control which paper cards appear for that lens.

## Papers

Each file in `papers/` describes one paper or future direction. The sections
`Claim`, `Limit`, and `Design move` are shown below the paper card.

Use an existing file as the safest template when adding new content.
