<!-- raw-agenda-content -->

---

id: contrastive
label: Contrastive learning
short: Shared information & geometry
theme: blue
question: What survives across views—and how is it organized?
summary: From constructing shared semantics to understanding the geometry of contrastive representations.
objective_title: Construct the views
structure_title: Identify what survives
limits_title: Explain the mismatch
design_title: Choose supervision deliberately
papers: [clap, misalignment, contrastiveGeometry]

---

## Objective

Paired modalities and augmentations define which information can be shared. The learning signal depends on how those views are constructed.

## Structure

Study the semantic factors that contrastive learning can recover, alongside the alignment and dispersion of the resulting representations.

## Limits

Factors that are not shared can disappear. Successful pairwise matching can also coexist with persistent separation between modality distributions.

## Design

Use view construction and pair selection to preserve relevant semantics. Evaluate representation geometry as well as retrieval performance.

## Scope

The recoverability results depend on the latent-variable and view-construction assumptions in the linked papers. Semantic recovery and representation geometry are related questions with distinct conclusions.

## Evidence clap

Shows how view construction and augmented prompts can steer content–style invariance.

## Evidence misalignment

Characterizes which semantics survive selection and perturbation biases in paired data.

## Evidence contrastiveGeometry

Connects contrastive risk to alignment, dispersion, and persistent modality separation.

## Next

How should view and pair design balance semantic recovery with useful representation geometry?
