# Pocket Bot Product Roadmap

## Purpose

This roadmap separates the **small playable MVP** from the larger product and infrastructure hypotheses around Nimiq-funded helper allowances, LLM-powered route choice, and x402-like payment rails.

Pocket Bot has grown into a layered concept. The roadmap keeps those layers visible so implementation does not collapse under the full long-term vision.

## Core Product Thesis

Pocket Bot is a playful Nimiq mini app where users train a software helper to navigate paid resource choices under a bounded allowance.

The long-term idea is a value-conversion loop:

```text
sponsored or user-funded NIM allowance
→ user training interaction
→ bot experience / preference traces
→ better paid-resource judgment
→ useful API/tool management for the user
→ Nimiq remains the visible value carrier
```

The first milestone does **not** need to prove the whole loop. It only needs to make the first interaction visible.

## Roadmap Boundary

Only **Phase 1** is current implementation scope.

Later phases are staged hypotheses. They should guide architecture decisions, but they should not be implemented until the previous phase is stable and useful.

## Phase 0 — Concept Stabilization

### Goal

Stabilize the product meaning and documentation before building features.

### Status

Mostly complete.

### Inputs

- `docs/product/requirements.md`
- `docs/product/pitch.md`
- `docs/product/infrastructure_context.md`

### Scope

- Confirm Pocket Bot as the product name.
- Confirm the central pitch: independent individuals should be able to tell their bot how much it may spend, what it may spend on, when it must ask first, and what receipt it must leave behind.
- Confirm MVP scope remains simulated.
- Confirm Nimiq is framed as the user-trust and value-carrier surface.
- Confirm x402-like rails are future infrastructure context, not MVP dependency.

### Exit Criteria

- Product requirements exist.
- Pitch notes exist.
- Infrastructure context exists.
- Roadmap exists.
- Current implementation scope is explicitly limited to Phase 1.

## Phase 1 — MVP: Pocket Bot Workshop

### Goal

Build a local Phaser/Vite demo that shows the allowance-control loop without real wallet, real API, real LLM, or real payment infrastructure.

### User-Facing Story

The user sees a small robot helper with a limited simulated NIM allowance. The robot proposes one paid helper-tool action. The action must pass through a visible rule gate. If approved, simulated allowance decreases and a receipt is created.

### Scope

- One scene: `PocketBotWorkshop` or equivalent.
- One bot: `Pocket Bot`.
- One allowance: `AI Tools`.
- One paid helper tool: `Cart Scout` or equivalent.
- One approval gate.
- One receipt archive.
- One scripted paid-action proposal.
- One simulated NIM balance.
- One receipt with decision and outcome.

### Explicit Non-Scope

- No real Nimiq wallet connection.
- No real testnet or mainnet transaction.
- No real x402 payment.
- No real AI API call.
- No real LLM route proposal.
- No real sponsored reward.
- No persistent backend.

### Acceptance Criteria

- App runs through the Vite workflow.
- Scene shows bot, allowance, tool stall, gate, receipt archive, and UI overlay.
- User can trigger or observe a paid-action proposal.
- Gate evaluates simple rule checks:
  - tool approved,
  - cost under limit,
  - allowance sufficient,
  - no checkout/payment boundary respected.
- Approved action reduces simulated allowance.
- Receipt appears and can be inspected.
- UI clearly states simulation and limited allowance.

## Phase 2A — Scripted Training Game Layer

### Goal

Move from pure spend governance to a small training ritual, still without a real LLM.

### Product Shift

Phase 1 asks:

```text
Is this spend allowed?
```

Phase 2A asks:

```text
Can the user train the bot when spending is worth trying?
```

### Scope

- Add a scripted task with multiple route options:
  - free route,
  - ask-user route,
  - paid route.
- Add user feedback choices:
  - good route,
  - too expensive,
  - try free first,
  - ask me next time,
  - wrong direction,
  - stop earlier.
- Add simple bot experience indicators:
  - cost awareness,
  - ask-first habit,
  - stop-rule awareness,
  - tool judgment.
- Add simulated training reward.
- Add memory/receipt card that records what the bot learned.

### Explicit Non-Scope

- No real learning model.
- No LLM.
- No real NIM reward.
- No anti-abuse system.

### Acceptance Criteria

- User can choose or correct a route.
- Bot gains a visible scripted experience marker.
- Receipt records both action and user feedback.
- Simulated reward is clearly marked as simulated.

## Phase 2B — LLM-Powered Route Proposal

### Goal

Replace scripted route proposals with structured proposals from a real LLM while keeping deterministic allowance/rule checks outside the LLM.

### Design Invariant

```text
LLM proposes. Rules decide. User authorizes.
```

The LLM must not directly spend or bypass the rule gate.

### Required Architecture

```text
Phaser / mini app frontend
→ backend route-proposal endpoint
→ LLM provider
→ structured proposal
→ Pocket Bot rule gate
→ user feedback
→ receipt / memory trace
```

Provider API keys must not live in the browser client.

### Structured Proposal Shape

A route proposal should include:

```json
{
  "task_interpretation": "What the bot thinks the user needs",
  "route_options": ["free", "ask_user", "paid_tool"],
  "recommended_route": "ask_user | free | paid_tool",
  "paid_tool_candidate": "Tool name if any",
  "expected_benefit": "Why paid resource might help",
  "cost_estimate": "Estimated cost",
  "uncertainty": "low | medium | high",
  "stop_condition": "When to stop spending",
  "needs_user_approval": true
}
```

### Scope

- Backend endpoint for route proposal.
- One LLM provider integration.
- Deterministic schema validation.
- Deterministic rule-gate evaluation after proposal.
- User feedback stored in memory trace.

### Explicit Non-Scope

- No autonomous spending.
- No model self-improvement claim.
- No hidden user profiling.
- No API keys in frontend.
- No real payment by default.

### Acceptance Criteria

- User enters a vague task.
- LLM returns a structured route proposal.
- Rule gate evaluates proposal independently.
- User can approve, reject, or correct.
- Receipt records interpretation, route, rationale, rule decision, and feedback.

## Phase 3 — Nimiq Mini App Readiness

### Goal

Prepare Pocket Bot to run as a Nimiq mini app and align UX with Nimiq Pay constraints.

### Scope

- Review Nimiq Mini App SDK constraints.
- Identify available wallet/provider APIs.
- Define wallet action boundaries.
- Keep all sensitive actions user-confirmed.
- Add feature flags for:
  - local simulation,
  - mini app environment,
  - wallet unavailable fallback.
- Define a top-up UX mock.

### Explicit Non-Scope

- Real funded allowance may still be omitted.
- No x402 integration yet.
- No native NIM bridge claim.

### Acceptance Criteria

- App can detect or simulate mini app environment.
- UX distinguishes local demo from wallet-capable environment.
- Wallet integration plan is documented before live payment code is added.

## Phase 4 — Wallet-Funded Pocket Top-Up

### Goal

Make Nimiq meaningful as the value carrier by allowing a bot allowance to be funded through a real or testnet Nimiq wallet action.

### Product Meaning

This phase connects the neat MVP to the Nimiq ecosystem:

```text
Nimiq wallet action
→ bot pocket allowance
→ controlled helper behavior
→ receipt and trace
```

### Scope

- User can top up Pocket Bot allowance.
- Top-up creates a receipt.
- Allowance display reflects top-up.
- Helper spending may still be simulated.
- No full-wallet access is granted to the bot.

### Explicit Non-Scope

- No automatic uncontrolled bot spending.
- No x402 payment required.
- No real API gateway required.
- No sponsored rewards required.

### Acceptance Criteria

- User initiates a wallet-mediated top-up.
- Top-up is visible as allowance balance.
- Bot can only spend from allowance state.
- Receipt distinguishes top-up from helper spend.

## Phase 5 — x402-Like Compatibility Exploration

### Goal

Explore whether Pocket Bot can sit between a Nimiq-facing user wallet and x402-like paid services.

### Core Architecture

```text
Nimiq Pay / Nimiq wallet
  = user custody, approval, and trust surface

Pocket Bot
  = allowance, rule gate, route strategy, receipt, and review

x402-like services
  = paid APIs, tools, content, compute, or helper services
```

### Scope

- Introduce internal `PaymentRequirement` object.
- Keep `SimulatedPaymentAdapter` for MVP compatibility.
- Prototype adapter boundary for future `X402PaymentAdapter`.
- Explore EVM-token route if exposed through Nimiq Pay where available.
- Document that native NIM is not assumed x402-compatible by default.

### Explicit Non-Scope

- No native NIM x402 claim.
- No production payment facilitator.
- No direct integration with arbitrary paid APIs.

### Acceptance Criteria

- Code architecture separates allowance engine from payment rail.
- Payment requirements can be represented internally.
- Simulated x402-like flow can be demonstrated.
- Future EVM-token or native Nimiq adapter can be added without rewriting the game loop.

## Phase 6 — Real Paid Tool Gateway

### Goal

Connect one real paid API/tool through a backend gateway while preserving the Pocket Bot rule gate.

### Required Architecture

```text
Pocket Bot frontend
→ backend gateway
→ provider API / paid tool
→ result
→ receipt
```

### Scope

- Backend owns provider API keys.
- User task triggers route proposal.
- Rule gate checks allowance before paid call.
- User approval required for paid action.
- Gateway returns result and cost estimate/actual usage.
- Receipt records cost, result, and decision.

### Explicit Non-Scope

- No direct provider API keys in client.
- No claim of fully autonomous spending.
- No broad marketplace.
- No multi-provider optimization unless one-provider path works.

### Acceptance Criteria

- One real paid tool/API can be called from backend.
- User sees cost before approval when possible.
- Receipt records provider/tool, decision, cost, and result.
- Failures produce a receipt-like trace instead of silent loss.

## Phase 7 — Sponsored Training Economy

### Goal

Explore the ecosystem loop where a sponsor-funded NIM pool rewards users for useful training interactions.

### Product Hypothesis

```text
sponsor-funded NIM
→ bot starting allowance / reward pool
→ user training time
→ bot experience traces
→ better helper behavior
→ user receives helpful bot + NIM reward
```

### Scope

- Simulated sponsored allowance pool.
- Simulated training rewards.
- Reward logic tied to useful feedback, not random clicking.
- Eligibility and anti-abuse requirements documented.

### Explicit Non-Scope

- No real faucet without anti-abuse.
- No real reward distribution before wallet and eligibility rules exist.
- No promise that Nimiq Foundation funds the pool.

### Acceptance Criteria

- Training reward mechanic is understandable.
- Reward is tied to quality of training feedback.
- Product docs clearly mark sponsor funding as a future campaign model, not guaranteed infrastructure.

## Phase 8 — Trained Helper Utility

### Goal

Test whether a trained Pocket Bot can manage a user's API/tool choices in a way the user experiences as genuinely helpful.

### Scope

- Reuse memory traces from previous sessions.
- Bot proposes routes based on prior feedback.
- User can inspect what was learned.
- User can reset or edit preferences.
- Spending remains bounded by allowance and rules.

### Explicit Non-Scope

- No opaque personalization.
- No irreversible memory without user control.
- No automatic spending outside allowance.

### Acceptance Criteria

- Bot behavior changes based on prior feedback.
- User can understand why behavior changed.
- User can correct or reset learned preferences.
- Paid resources remain governed by allowance and approval rules.

## Phase 9 — Ecosystem / Product Validation

### Goal

Validate whether Pocket Bot is a useful Nimiq mini app, not only an interesting concept.

### Key Questions

- Do users understand the pocket allowance metaphor?
- Does the game make bot spending easier to reason about?
- Does Nimiq feel naturally connected as allowance/reward carrier?
- Does the training loop feel valuable or like extra work?
- Which use case is most compelling:
  - AI API/tool usage,
  - shopping/cart preparation,
  - paid web tools,
  - Nimiq-native mini app services,
  - sponsored training quests?

### Evidence To Collect

- Demo completion rate.
- User confusion points.
- Whether users can explain the bot's allowance after playing.
- Whether users trust the bot more or less after seeing receipts.
- Whether users want real wallet funding.
- Whether users want real LLM-powered route proposals.

## Current Next Step

The immediate next step is **Phase 1**:

> Implement a local Phaser/Vite Pocket Bot Workshop demo with one bot, one simulated allowance, one paid-tool proposal, one approval gate, and one receipt.

No real wallet, LLM, x402, reward, or backend work should be implemented before Phase 1 is playable.
