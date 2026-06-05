# Development Workflow

Pocket Bot should be developed in small, test-driven slices. The goal is to let Codex agents move quickly without skipping planning, changing scope silently, or burying product rules inside hard-to-test Phaser scene code.

## Source Of Truth

Read these documents before feature work:

1. `docs/product/requirements.md` - product scope, MVP behavior, acceptance criteria.
2. `docs/product/roadmap.md` - phased product boundary; only Phase 1 is current implementation scope.
3. `docs/product/phase0_alignment.md` - current Phase 0 handoff and code containment strategy.
4. `docs/product/pitch.md` - concise product framing.
5. `docs/product/infrastructure_context.md` - Nimiq and payment-layer context.
6. This file - development workflow.

When product scope changes, update the product document before or in the same change as the implementation plan. When implementation sequencing changes, update the relevant planning document.

## Required Development Loop

Every feature should follow this loop:

1. **Feature planning**
   Define the small user-visible behavior, source requirement, non-goals, expected files, and risks.
2. **Test planning**
   Separate logic tests that need no user interaction from interaction checks for the user/bot interface. Decide what needs a build check, what can be automated now, what must be manual for now, and what tooling is missing.
3. **Code implementation**
   Implement the smallest useful slice. Keep domain logic outside Phaser scenes when possible.
4. **Test run**
   Run the planned tests and record what passed, failed, or could not be run.
5. **Post-implementation documentation update**
   After implementation and verification succeed, update the relevant docs so future agents can see what is now implemented, what remains next, and whether planned checks changed.
6. **Summary**
   Report changed files, behavior delivered, tests run, and any follow-up tasks.

Do not start feature implementation before the feature and test plan are clear.

## Plan Change Protocol

Codex agents coordinate through source-of-truth documents, commits, and completion summaries. They do not automatically report changes to each other outside the repository.

If implementation reveals that the current plan is wrong, incomplete, or risky:

1. Stop expanding the implementation beyond the smallest needed investigation.
2. State the discovered issue clearly.
3. Classify the change as one or more of:
   - product requirement change,
   - implementation sequence change,
   - test strategy change,
   - architecture concern,
   - scope or MVP-boundary risk.
4. Update the relevant document before or in the same commit as the code change:
   - product behavior or MVP scope -> `docs/product/requirements.md`,
   - implementation order or slice boundary -> `docs/planning/mvp_implementation_plan.md`,
   - test approach or required checks -> `docs/testing/test_strategy.md`,
   - development process -> `docs/process/development_workflow.md`,
   - technical structure or cross-module design -> `docs/architecture/`.
5. Mention affected agent roles in the completion report when another role should adjust future work.
6. Ask the user before continuing if the change materially alters user-visible behavior, competition framing, real-payment boundaries, or MVP scope.

## Post-Implementation Documentation Update

After a feature slice is implemented and the planned verification passes, update documentation before treating the slice as complete.

Use the docs keeper role for this pass when working with sub-agents.

Update only the docs that need to reflect the delivered work:

- `docs/planning/mvp_implementation_plan.md` for PB slice status, changed sequencing, or next recommended slice.
- `docs/product/phase0_alignment.md` for current Phase 1 implementation status.
- `docs/testing/test_strategy.md` when actual tests/checks, missing automation, or required verification changed.
- `README.md` when setup commands, run instructions, or high-level project status changed.
- `docs/product/requirements.md` only when user-visible behavior or MVP scope changed.

Do not update product scope just because implementation succeeded. A successful implementation usually changes status and planning docs, not the product contract.

The documentation update should cite the verification result it reflects, for example `npm run test`, `npm run build`, or a browser/manual interaction check. If the implementation worker already ran the checks, the docs keeper may rely on that report instead of rerunning commands.

## Source Attribution Gate

Competition-facing documentation must make non-standard sources explicit.
Maintain `docs/product/source_attribution.md` as the attribution register.

For each feature or documentation change, check whether it uses or introduces:

- a local source repo, such as CRPM or Agent Desktop Automation MCP Server,
- external product, SDK, API, model, pricing, or protocol documentation,
- a framework, plugin, library, or test tool beyond plain JavaScript/HTML/CSS,
- a copied pattern from a tutorial, example, paper, or starter template,
- generated assets, asset packs, fonts, icon libraries, music, sound effects, or AI-generated images,
- backend, relay, wallet, testnet, faucet, explorer, or hosting infrastructure.

If yes, update the attribution register before or in the same commit as the
feature. State whether the source is an implementation dependency, design
influence, research context, test/tooling dependency, or future-planning
reference. Also state whether it is bundled, called at runtime, development-only,
or documentation-only.

The documentation sub-agent should run a source-attribution audit before
competition submission and verify that `package.json`, `src/`, public assets,
planning docs, product docs, and final submission text are covered.

## TDD Rules

- Prefer tests before implementation for domain behavior.
- Put rule checks, allowance math, proposal validation, and receipt creation in `src/domain/`.
- Keep Phaser scenes focused on rendering, input, movement, and orchestration.
- Avoid testing Phaser rendering through unit tests unless a behavior can be isolated cleanly.
- Use build checks and browser/manual checks for scene visibility and interaction.
- Treat interaction checks as first-class for scene, UI, control, approval, and receipt-inspection changes. These checks should describe a concrete user action and an observable result.
- If a behavior cannot be tested yet because the test stack is missing, document the intended test and implement only the smallest low-risk slice.

## Feature Slice Template

Use this shape in planning docs or implementation summaries:

```md
## Feature

ID:
Goal:
Requirement link:
Source attribution:
User-visible behavior:
Non-goals:

## Test Plan

Logic tests, no user interaction:

Build check:

Interaction tests/checks:

Manual acceptance checks:

Missing automation:

Commands to run:

Acceptance criteria:

## Implementation Notes

Expected files:
Risks:
Follow-ups:
```

## Agent Working Rules

- Inspect the repository before making claims about current code.
- Keep changes scoped to the requested feature or planning step.
- Do not introduce real wallet, real payment, real checkout, or real AI API execution during the MVP unless the product requirements are updated first.
- Preserve the Phaser 3 + Vite foundation.
- Prefer extending existing docs over creating near-duplicate files.
- Keep commits small and conventional.
- Always report tests run. If tests were not run, say why.

## Definition Of Done

A feature slice is done when:

- it matches an explicit requirement or documented plan,
- relevant domain logic is testable outside Phaser where practical,
- planned tests/checks have been run,
- `npm run build` passes unless the task is documentation-only,
- docs are updated when behavior, scope, or workflow changes,
- the final report lists changed files and remaining risks.

## Current Next Step

Before implementing the Pocket Bot Workshop scene, create a small MVP implementation plan and a test strategy. Then start with domain-level rule and allowance checks before scene rendering.
