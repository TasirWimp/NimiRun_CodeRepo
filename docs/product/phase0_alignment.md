# Phase 0 Alignment

## Purpose

This document is the handoff from concept stabilization into the revised Phase 1 implementation.

It summarizes the current product cut, the value-conversion thesis, documentation ownership, and code containment strategy. It should be read with `docs/product/roadmap.md` and `docs/planning/mvp_implementation_plan.md` before implementing new Phase 1 features.

## Current Center

Pocket Bot is a playful Nimiq mini app where users train a software helper to spend limited attention well in messy, lossy environments.

The bot has constrained resources:

- Bot Attention: thinking/action energy, later mapped to LLM tokens, API calls, tool calls, and reasoning time.
- Nimiq Pocket Money: collectible or fundable value that can recharge or unlock Bot Attention.
- User Attention: the player's guidance, corrections, approvals, and preference signals.
- Context Capacity: limited short-term memory during a run.
- Skills / Persistent Memory: durable upgrades for Phase 2, not Phase 1.

The Phaser scene exists because the bot is navigating an environment, not because payments need decoration. The first scene should feel like a compact 2D RPG-style map where fog, paths, clues, gates, context slots, and resource meters make hidden assumptions and opportunity costs playable.

## Value-Conversion Thesis

The long-term product hypothesis is:

```text
user plays and guides the bot
-> bot spends attention on uncertain choices
-> user feedback directs that attention toward useful judgment
-> Nimiq pocket money powers or rewards attention
-> traces become memory and skills
-> trained bot applies user preferences to real-world tasks
```

Phase 1 does not need to prove persistent learning or real-world task utility. It needs to make one user-bot training loop playable:

```text
goal -> lossy map -> LLM move proposal -> user guidance
-> Bot Attention spend -> revealed outcome -> trace card
-> session lesson -> later proposal reflects lesson
```

## MVP Boundary

Only Phase 1 is current implementation scope.

Phase 1 is a Nimiq Mini App-compatible Phaser/Vite demo with:

- one bot,
- one compact RPG-style lossy map,
- Bot Attention,
- Nimiq Pocket display/local fallback and optional testnet status,
- User Attention prompts,
- Context Capacity slots,
- LLM-backed structured route proposals through a backend relay,
- deterministic resource checks outside the LLM,
- one session-only lesson,
- trace cards,
- a local browser fallback for development.

Phase 1 may implement:

- a low-cost GPT route-proposal call through a server-side relay,
- an offline/mock LLM fallback for local development and tests,
- Nimiq testnet wallet/status/pocket experiments when explicit and user-triggered,
- context-window/session memory supplied to the LLM prompt.

Phase 1 must not implement:

- Nimiq mainnet value,
- broad wallet/provider permission,
- uncontrolled signing, sending, or payment,
- real checkout or payment-info entry,
- x402 integration,
- real paid external-service execution,
- persistent user memory,
- durable user profiling,
- autonomous model self-improvement claims,
- real-value rewards,
- large RPG content, combat, inventory bloat, or unrelated game mechanics.

API keys must never be exposed in browser code. The LLM may propose moves, but deterministic game/resource rules decide whether a move is legal and what it costs.

## Documentation Ownership

- `docs/product/requirements.md` remains the broad product requirements document, but older allowance-only MVP language should be treated as superseded by the current roadmap and implementation plan until the requirements document is fully harmonized.
- `docs/product/pitch.md` is the external story and competition-facing wording.
- `docs/product/infrastructure_context.md` is the Nimiq, x402-like payment rail, and risk-boundary context.
- `docs/product/roadmap.md` is the staged delivery and phase-boundary document.
- `docs/product/phase0_alignment.md` is the current handoff into Phase 1 implementation.
- `docs/planning/mvp_implementation_plan.md` translates Phase 1 into small PB implementation slices.
- `docs/testing/test_strategy.md` defines logic tests, interaction checks, and reporting expectations.

When these documents disagree, use `docs/product/roadmap.md` and `docs/planning/mvp_implementation_plan.md` for current Phase 1 scope, then update the conflicting source document instead of silently implementing against stale requirements.

## Code Containment Strategy

Preserve the existing Phaser/Vite foundation.

- Keep `src/scenes/Street.js` as the old prototype/reference scene for now.
- Keep `src/scenes/PocketBotWorkshop.js` for Phase 1, but evolve it from payment workshop into the resource-navigation map.
- Evaluate a Phaser-compatible RPG/tilemap workflow before expanding the scene.
- Keep Mini App SDK/provider access behind `src/platform/` modules.
- Keep LLM provider access behind a server-side relay or equivalent backend boundary.
- Keep OpenAI/provider API keys out of browser code and out of committed files.
- Keep resource math, proposal schemas, map reveal rules, session lessons, and trace creation in `src/domain/` or narrow non-Phaser modules.
- Keep MVP scenario constants and scene-independent setup in `src/game/`.
- Keep Phaser scene code focused on rendering, input, movement, animation, and orchestration.
- Treat existing `allowance.js`, `rules.js`, `proposals.js`, and `receipts.js` as supporting groundwork for money/resource gates and trace cards.
- Do not let wallet, provider, SDK, LLM, or x402 assumptions leak into scene logic.
- Do not add persistent memory, mainnet value, real paid external-service execution, x402, or rewards before Phase 1 is playable.

## Current Implementation Status

Implemented Phase 1 groundwork from the earlier allowance-control cut:

- PB-001 Domain Rule Decision.
- PB-002 Receipt Creation.
- PB-003 Allowance Spend Execution.
- PB-004 Pocket Bot Workshop Scene Shell with Mini App framework-compatible app wiring.
- PB-005 RPG Map Tooling And Scene Direction with a Phaser-native custom node-map scaffold.
- PB-006 Core Resource Model with deterministic Bot Attention, Nimiq Pocket, User Guidance, and Context Slots.

These modules should not be reverted. They are now supporting pieces for future Nimiq Pocket / paid-resource gates.

Still needed for the revised Phase 1:

- PB-006A Run Session And Transition Runtime.
- PB-007 LLM Route Proposal Bridge.
- PB-008 Lossy Map Scenario.
- PB-009 User-Bot Guidance Loop.
- PB-010 Session Lesson Application.
- PB-011 Trace Cards.
- PB-012 Nimiq Testnet Pocket.

PB-005 replaced the old Tool Scout visual placeholder with the first lossy-map scaffold. The earlier allowance-control modules remain useful as future Nimiq Pocket / paid-resource gate groundwork.

Receipt classification data exists as future-facing domain groundwork. Full persistent memory, durable skill unlocks, real-world task bridges, and real paid-resource governance belong to later roadmap phases unless explicitly pulled forward in a separate plan change.
