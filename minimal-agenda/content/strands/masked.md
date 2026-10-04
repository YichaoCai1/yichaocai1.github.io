<!-- raw-agenda-content -->

---

id: masked
label: Masked prediction
short: Visibility & global structure
theme: teal
question: When does local prediction reveal global structure?
summary: Understanding how conditional visibility shapes identifiability—and where good prediction can remain blind.
objective_title: Control what is visible
structure_title: Ask what can be recovered
limits_title: Expose mode blindness
design_title: Make uncertainty informative
papers: [masked]
directions: [richer, property]

---

## Objective

A mask schedule determines which variables are observed and which must be predicted. It sets the conditional information available to the learner.

## Structure

Connect conditional prediction risk to recovery of global distributional information. Ask which distinctions the masking distribution makes identifiable.

## Limits

In the studied multi-mode settings, near-optimal conditional predictions can leave global mode weights unresolved. Large visible contexts can conceal the uncertainty that matters.

## Design

Choose masks that expose residual uncertainty about the structure or property being recovered. Treat the schedule as part of the learning objective.

## Scope

The mode-blindness examples and recovery guarantees concern the regimes and masking distributions analyzed in the preprint. Conclusions depend on the visibility and conditional-prediction assumptions.

## Evidence masked

Connects mask schedules, residual mode uncertainty, and global recovery through an identifiability analysis.

## Next

Which useful properties remain recoverable when full distribution recovery fails?
