# Pocket Bot Agent Instructions

## Repository Context

Pocket Bot is a Phaser 3 + Vite prototype for a Nimiq mini app concept. It explores how independent individuals can guide a software helper that has limited attention, limited context, and a small Nimiq pocket.

Current MVP goal: build a playable Pocket Bot Workshop resource-judgment mini game inside a Nimiq Mini App-compatible app shell. The player guides a bot through a messy, lossy RPG-like map; the bot spends Bot Attention, uses session-only context, can request a bounded LLM route proposal through a server-side relay, and records trace cards. Do not implement real wallet operations, real payment, real checkout, real grocery service, mainnet value, persistent memory, autonomous spending, or browser-exposed API keys during the MVP unless the product requirements are updated first.

## Source Documents

Before feature work, read the relevant docs in this order:

1. `docs/product/requirements.md` - product scope, MVP behavior, acceptance criteria.
2. `docs/product/roadmap.md` - phased product boundary; only Phase 1 is current implementation scope.
3. `docs/product/phase0_alignment.md` - current Phase 0 handoff and code containment strategy.
4. `docs/product/pitch.md` - concise product framing and wording.
5. `docs/product/art_bible.md` - visual direction, asset families, generation prompts, naming, and attribution rules.
6. `docs/product/infrastructure_context.md` - Nimiq and payment-rail context.
7. `docs/product/source_attribution.md` - competition-facing attribution register.
8. `docs/process/development_workflow.md` - required development loop.
9. `docs/testing/test_strategy.md` - testing approach.
10. `docs/planning/mvp_implementation_plan.md` - PB feature slices, subagent roles, and implementation order.

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
- Keep rule checks, attention math, context-slot behavior, map reveal rules, runtime gates, finish judgment, allowance math, proposal validation, spend execution, and trace/receipt creation in `src/domain/`.
- Keep MVP scenario constants and state setup in `src/game/`.
- Keep Phaser scenes focused on rendering, input, movement, and orchestration.
- Do not bury product rules inside Phaser scene methods when they can be plain JavaScript.
- Add files only when their feature slice needs them. Avoid empty implementation placeholders.

## MVP Implementation Order

Use the plan in `docs/planning/mvp_implementation_plan.md`.

Current order:

1. PB-001 Domain Rule Decision - implemented groundwork.
2. PB-002 Receipt Creation - implemented groundwork.
3. PB-003 Allowance Spend Execution - implemented groundwork.
4. PB-004 Pocket Bot Workshop Scene Shell - implemented groundwork.
5. PB-005 RPG Map Tooling And Scene Direction - implemented.
6. PB-006 Core Resource Model - implemented.
7. PB-006A Run Session And Transition Runtime - implemented.
8. PB-007 LLM Route Proposal Bridge - implemented.
9. PB-008 Lossy Map Scenario - implemented.
10. PB-009 User-Bot Guidance Loop - implemented.
11. PB-011 Trace Cards - implemented.
12. PB-010 Session Lesson Application.
13. PB-012 Nimiq Testnet Pocket.

Use the subagent role plan in `docs/planning/mvp_implementation_plan.md`. Add `pocket_bot_nimiq_platform_worker` only when PB-012 starts unless PB-012 is explicitly pulled forward.

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
- LLM access must stay behind a server-side relay or equivalent backend boundary. Browser code must never contain provider API keys.
- LLM output may propose moves only; deterministic resource/runtime rules decide legality, cost, state mutation, and finish status.
- Checkout/payment attempts must be blocked in the MVP, even in simulation.
- Real Nimiq mainnet operations, uncontrolled wallet/provider operations, x402, persistent memory, rewards, real paid external-service execution, or backend gateway work beyond the planned stateless LLM relay are future scope unless requirements and planning docs are updated first.

## Documentation Rules

- Keep docs grouped by purpose under `docs/`.
- After a feature slice is implemented and verified, update planning/status docs before treating the slice as complete.
- Product decisions belong in `docs/product/`.
- How-we-work instructions belong in `docs/process/`.
- Build sequencing belongs in `docs/planning/`.
- Test approach and test cases belong in `docs/testing/`.
- Technical design notes belong in `docs/architecture/`.
- External research and source notes belong in `docs/research/`.
- Competition-facing attribution belongs in `docs/product/source_attribution.md`.
- Prefer updating an existing doc over creating a near-duplicate file.

## Git And Reporting

- Check `git status --short` before edits and commits.
- Do not revert or overwrite user changes unless explicitly asked.
- Keep commits small and conventional.
- If asked to commit all open changes, use `git add -A`.
- Final summaries should list changed files, behavior delivered, tests run, and next recommended step.
