# Documentation Index

This folder keeps project documentation grouped by purpose. Avoid placing new Markdown files directly in `docs/` unless they are indexes for a documentation area.

## Current Structure

- `product/` - product requirements, roadmap, Phase 0 handoff, product scope, user-facing behavior, MVP acceptance criteria, source attribution.
- `process/` - development workflow, agent workflow, coding conventions.
- `planning/` - milestone plans, feature breakdowns, implementation plans.
- `testing/` - test strategy, test plans, acceptance checklists.

## Planned Structure

Create these folders only when a document in that category is needed:

- `process/` - development workflow, agent workflow, coding conventions.
- `planning/` - milestone plans, feature breakdowns, implementation plans.
- `testing/` - test strategy, test plans, acceptance checklists.
- `architecture/` - technical design notes, module boundaries, integration design.
- `research/` - source notes, competitive references, external evidence.

## Placement Rules

- Product decisions belong in `product/`.
- Competition-facing source attribution belongs in `product/source_attribution.md`.
- How-we-work instructions belong in `process/`.
- Build sequencing belongs in `planning/`.
- Test approach and test cases belong in `testing/`.
- Technical structure belongs in `architecture/`.
- Web findings and source summaries belong in `research/`.

When a new document is small or continues an existing topic, prefer updating the existing document instead of creating a near-duplicate file.
