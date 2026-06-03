# Phase 0 Alignment

## Purpose

This document is the handoff from concept stabilization into Phase 1 implementation.

It summarizes the current product cut, the value-conversion thesis, documentation ownership, and the code containment strategy. It should be read with `docs/product/roadmap.md` before implementing new Phase 1 features.

## Current Center

Pocket Bot is a playful Nimiq mini app where users train a software helper to navigate paid resource choices under a bounded allowance.

The helper starts with limited pocket money, proposes when a paid resource might help, passes through a visible rule gate, and leaves a receipt behind. The experience should feel playful, but the control problem is serious: users should not need to give a bot broad wallet access or trust hidden spending behavior.

## Value-Conversion Thesis

The long-term product hypothesis is:

```text
NIM allowance / sponsor value
-> user training interaction
-> bot experience traces
-> better paid-resource judgment
-> user benefit
```

Phase 1 does not need to prove this full loop. It only needs to make the first allowance-control interaction visible and understandable.

## MVP Boundary

Only Phase 1 is current implementation scope.

Phase 1 is a Nimiq Mini App-compatible Phaser/Vite demo with:

- one bot,
- one simulated allowance,
- one paid-tool proposal,
- one approval gate,
- one receipt,
- a local browser fallback for development.

Phase 1 must not implement:

- real wallet/provider connection,
- real Nimiq transaction,
- real x402 payment,
- real paid API call,
- real LLM route proposal,
- real learning,
- real or simulated training reward,
- backend services,
- persistent user profiling.

The MVP may prepare data shapes that support later training and route-choice phases, but the Phase 1 user experience remains scripted and simulated.

Nimiq Mini App framework compatibility is now part of Phase 1 because the competition guidelines are public. That does not mean Phase 1 may perform real wallet operations. Provider or SDK access must be isolated behind a small adapter and must fail safely or fall back when the app is opened outside Nimiq Pay.

## Documentation Ownership

- `docs/product/requirements.md` is the MVP contract.
- `docs/product/pitch.md` is the external story and competition-facing wording.
- `docs/product/infrastructure_context.md` is the Nimiq, x402-like payment rail, and risk-boundary context.
- `docs/product/roadmap.md` is the staged delivery and phase-boundary document.
- `docs/product/phase0_alignment.md` is the current Phase 0 handoff into Phase 1 implementation.
- `docs/planning/mvp_implementation_plan.md` translates Phase 1 into small PB implementation slices.
- `docs/testing/test_strategy.md` defines logic tests, interaction checks, and reporting expectations.

When these documents disagree, use the plan change protocol in `AGENTS.md` and `docs/process/development_workflow.md`.

## Code Containment Strategy

Preserve the existing Phaser/Vite foundation.

- Keep `src/scenes/Street.js` as the old prototype/reference scene for now.
- Add `src/scenes/PocketBotWorkshop.js` for Phase 1 instead of mutating `Street.js` directly.
- Keep rule checks, allowance math, proposals, spend execution, and receipts in `src/domain/`.
- Keep MVP scenario constants and scene-independent setup in `src/game/`.
- Add a small Mini App environment adapter when PB-004 needs Nimiq Pay framework access.
- Keep Phaser scene code focused on rendering, input, movement, and orchestration.
- Use `SimulatedPaymentAdapter` for Phase 1 payment-like orchestration once scene execution needs a payment boundary.
- Do not let wallet, provider, SDK, or x402 assumptions leak into scene logic.
- Do not add real wallet, real API, real LLM, x402, backend, or rewards before Phase 1 is playable.

## Current Implementation Status

Implemented Phase 1 groundwork:

- PB-001 Domain Rule Decision.
- PB-002 Receipt Creation.
- PB-003 Allowance Spend Execution.

Still needed for Phase 1:

- PB-004 Pocket Bot Workshop Scene Shell with Mini App framework-compatible app wiring.
- PB-005 Proposal And Approval Flow.
- PB-006 Simulated Spend And Receipt Archive.
- PB-007 Receipt Inspection.

Receipt classification data exists as future-facing domain groundwork. Full user feedback, route correction, training rewards, and learned behavior belong to later roadmap phases unless explicitly pulled into Phase 1 as a small stretch.
