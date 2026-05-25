# Pocket Bot Agent Instructions

## Repository Context

Pocket Bot is a Phaser 3 + Vite prototype for a Nimiq mini app concept. It explores how independent individuals can give software helpers a small, self-custodied prepaid allowance instead of broad wallet access.

Current MVP goal: build the Pocket Bot Workshop scene through small, test-driven slices. Do not implement real wallet, real payment, real checkout, real grocery service, or real AI API behavior during the MVP unless the product requirements are updated first.

## Source Documents

Before feature work, read the relevant docs in this order:

1. `docs/product/requirements.md` - product scope, MVP behavior, acceptance criteria.
2. `docs/product/pitch.md` - concise product framing and wording.
3. `docs/product/infrastructure_context.md` - Nimiq and payment-rail context.
4. `docs/process/development_workflow.md` - required development loop.
5. `docs/testing/test_strategy.md` - testing approach.
6. `docs/planning/mvp_implementation_plan.md` - PB feature slices and implementation order.

Use `README.md` for project setup and commands.

## Required Workflow

Follow this loop for implementation tasks:

1. Feature planning.
2. Test planning.
3. Code implementation.
4. Test run.
5. Summary.

Do not start feature implementation before the feature and test plan are clear. If the user asks only for planning, review, or brainstorming, do not edit code.

## TDD Rules

- Prefer tests before implementation for domain behavior.
- Keep rule checks, allowance math, proposal validation, spend execution, and receipt creation in `src/domain/`.
- Keep MVP scenario constants and state setup in `src/game/`.
- Keep Phaser scenes focused on rendering, input, movement, and orchestration.
- Do not bury product rules inside Phaser scene methods when they can be plain JavaScript.
- Add files only when their feature slice needs them. Avoid empty implementation placeholders.

## MVP Implementation Order

Use the plan in `docs/planning/mvp_implementation_plan.md`.

Default order:

1. Add Vitest and `npm run test`.
2. PB-001 Domain Rule Decision.
3. PB-002 Receipt Creation.
4. PB-003 Allowance Spend Execution.
5. PB-004 Pocket Bot Workshop Scene Shell.
6. PB-005 Proposal And Approval Flow.
7. PB-006 Simulated Spend And Receipt Archive.
8. PB-007 Receipt Inspection And Classification.

## Test Expectations

- For documentation-only changes, no build is required; say that explicitly.
- For source changes, run the planned tests and `npm run build`.
- Once `npm run test` exists, run it for domain changes.
- Use browser/manual checks for Phaser rendering and interaction until browser automation exists.
- Always report tests run, skipped tests, failures, and residual risk.

## Scope Boundaries

- Preserve the existing Phaser 3 + Vite foundation.
- Add a new `PocketBotWorkshop` scene rather than renaming `Street.js` immediately.
- Keep `Street.js` as a reference prototype until replacement is complete.
- Payment-specific behavior must stay behind adapters. MVP uses `SimulatedPaymentAdapter`.
- Checkout/payment attempts must be blocked in the MVP, even in simulation.
- Real Nimiq, x402, wallet, or backend gateway work is future scope unless requirements and planning docs are updated first.

## Documentation Rules

- Keep docs grouped by purpose under `docs/`.
- Product decisions belong in `docs/product/`.
- How-we-work instructions belong in `docs/process/`.
- Build sequencing belongs in `docs/planning/`.
- Test approach and test cases belong in `docs/testing/`.
- Technical design notes belong in `docs/architecture/`.
- External research and source notes belong in `docs/research/`.
- Prefer updating an existing doc over creating a near-duplicate file.

## Git And Reporting

- Check `git status --short` before edits and commits.
- Do not revert or overwrite user changes unless explicitly asked.
- Keep commits small and conventional.
- If asked to commit all open changes, use `git add -A`.
- Final summaries should list changed files, behavior delivered, tests run, and next recommended step.
