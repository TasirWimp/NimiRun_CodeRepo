# Pocket Bot Agent Instructions

## Repository Context

Pocket Bot is a Phaser 3 + Vite prototype for a Nimiq mini app concept. It explores how independent individuals can give software helpers a small, self-custodied prepaid allowance instead of broad wallet access.

Current MVP goal: build the Pocket Bot Workshop scene through small, test-driven slices inside a Nimiq Mini App-compatible app shell. Do not implement real wallet operations, real payment, real checkout, real grocery service, or real AI API behavior during the MVP unless the product requirements are updated first.

## Source Documents

Before feature work, read the relevant docs in this order:

1. `docs/product/requirements.md` - product scope, MVP behavior, acceptance criteria.
2. `docs/product/roadmap.md` - phased product boundary; only Phase 1 is current implementation scope.
3. `docs/product/phase0_alignment.md` - current Phase 0 handoff and code containment strategy.
4. `docs/product/pitch.md` - concise product framing and wording.
5. `docs/product/infrastructure_context.md` - Nimiq and payment-rail context.
6. `docs/process/development_workflow.md` - required development loop.
7. `docs/testing/test_strategy.md` - testing approach.
8. `docs/planning/mvp_implementation_plan.md` - PB feature slices and implementation order.

Use `README.md` for project setup and commands.

## Required Workflow

Follow this loop for implementation tasks:

1. Feature planning.
2. Test planning.
3. Code implementation.
4. Test run.
5. Post-implementation documentation update.
6. Summary.

Do not start feature implementation before the feature and test plan are clear. If the user asks only for planning, review, or brainstorming, do not edit code.

## Plan Change Protocol

Agents do not report to each other directly. They coordinate through repository docs, commits, and completion summaries.

If implementation shows that the current plan is wrong, incomplete, or risky:

1. Stop expanding the implementation beyond the smallest needed investigation.
2. State the discovered issue clearly.
3. Classify the change as one or more of:
   - product requirement change,
   - implementation sequence change,
   - test strategy change,
   - architecture concern,
   - scope or MVP-boundary risk.
4. Update the relevant source-of-truth document before or in the same commit as the code change.
5. Mention affected agent roles in the completion report when another role should adjust future work.
6. If the change would materially alter user-visible behavior or MVP scope, ask the user before continuing implementation.

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
8. PB-007 Receipt Inspection.

## Test Expectations

- For documentation-only changes, no build is required; say that explicitly.
- For source changes, run the planned tests and `npm run build`.
- Once `npm run test` exists, run it for domain changes.
- Use browser/manual checks for Phaser rendering and interaction until browser automation exists.
- Always report tests run, skipped tests, failures, and residual risk.

## Scope Boundaries

- Preserve the existing Phaser 3 + Vite foundation.
- Keep Phase 1 compatible with the Nimiq Mini App framework while preserving local browser development.
- Add a new `PocketBotWorkshop` scene rather than renaming `Street.js` immediately.
- Keep `Street.js` as a reference prototype until replacement is complete.
- Keep Mini App SDK/provider access behind a small adapter or platform module when introduced.
- Payment-specific behavior must stay behind adapters. MVP uses `SimulatedPaymentAdapter`.
- Checkout/payment attempts must be blocked in the MVP, even in simulation.
- Real Nimiq wallet/provider operations, x402, or backend gateway work is future scope unless requirements and planning docs are updated first.

## Documentation Rules

- Keep docs grouped by purpose under `docs/`.
- After a feature slice is implemented and verified, update planning/status docs before treating the slice as complete.
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
