# Pocket Bot Product Roadmap

## Purpose

This roadmap separates the competition-ready mini game from the larger product hypotheses around persistent bot memory, Nimiq-funded attention, and real-world task execution.

Pocket Bot has shifted from a narrow paid-resource approval prototype to a broader training game:

```text
Pocket Bot is a gamified Nimiq Mini App where the user teaches a bot how to spend limited attention in messy, lossy environments.
```

The roadmap keeps that thesis visible so implementation does not collapse back into a payment dashboard or expand too early into a general agent platform.

## Core Product Thesis

Pocket Bot trains resource judgment in lossy environments.

The bot moves through ambiguous task landscapes with limited resources:

- **Bot Attention**: thinking/action energy, later mapped to LLM tokens, API calls, tool calls, and reasoning time.
- **Nimiq Pocket Money**: collectible or fundable value that can recharge or unlock Bot Attention.
- **User Attention**: the player's guidance, correction, and preference signal.
- **Context Capacity**: limited short-term working memory during a run.
- **Skills / Persistent Memory**: durable upgrades introduced after Phase 1.

The long-term value loop is:

```text
user plays and guides the bot
-> bot spends attention on uncertain choices
-> user feedback directs that attention toward useful judgment
-> Nimiq pocket money powers or rewards attention
-> traces become memory and skills
-> trained bot applies user preferences to real-world tasks
```

Phase 1 does not need to prove durable learning. It must make the first user-bot training interaction playable, legible, and competition-ready.

## Roadmap Boundary

Only **Phase 1** is current implementation scope.

Later phases are staged hypotheses. They may guide architecture decisions, but they should not be implemented until Phase 1 is playable and tested.

## Phase 0 - Concept Stabilization

### Goal

Stabilize the revised product meaning and documentation before expanding implementation.

### Status

In revision.

### Scope

- Freeze the thesis: resource judgment in lossy environments.
- Reframe Nimiq as the value carrier for Bot Attention, not the only resource being governed.
- Reframe the Phaser scene as an RPG-style environment the bot must navigate.
- Move persistent memory to Phase 2.
- Move mainnet/high-stake value exposure to later phases.
- Preserve earlier allowance/rule/receipt code as supporting groundwork.

### Exit Criteria

- Roadmap reflects the revised thesis.
- Phase 1 implementation plan reflects the playable mini game.
- Old allowance-only MVP language is either removed or clearly subordinated.
- Current implementation scope is explicitly limited to Phase 1.

## Phase 1 - Competition MVP: Playable Resource-Judgment Mini Game

### Goal

Build a Nimiq Mini App-compatible Phaser/Vite game where the user guides Pocket Bot through a small messy map. The bot spends Bot Attention to inspect, ask, remember, skip, or act. A low-cost GPT model proposes route moves through a safe backend relay. Nimiq testnet pocket money appears as a low-stakes value/recharge layer.

### User-Facing Story

The player gives Pocket Bot a goal. The bot sees a small, foggy RPG-like task landscape with uncertain paths and hidden assumptions. The bot proposes a move. The player can approve, redirect, or correct it. Accepted moves spend Bot Attention, reveal information, and create trace cards. When the player corrects the bot, the bot applies that lesson later in the same run using only session/context-window memory.

### Scope

- One playable Phaser scene: `PocketBotWorkshop` or equivalent.
- One bot: `Pocket Bot`.
- One small RPG-style lossy map.
- Bot Attention meter.
- Nimiq Pocket meter using local fallback and/or testnet status.
- User guidance controls.
- Context Capacity slots.
- LLM-backed structured route proposal through a server-side relay.
- Deterministic resource/legal checks outside the LLM.
- One session-only lesson that affects a later proposal.
- Trace cards for proposed move, user guidance, resource spend, revealed information, and applied lesson.
- Nimiq Mini App-compatible shell with local browser fallback.

### Explicit Non-Scope

- No Nimiq mainnet value.
- No broad wallet permission.
- No uncontrolled send/sign/payment operation.
- No x402 integration.
- No real checkout or payment-info entry.
- No real paid external-service execution.
- No persistent memory or durable user profile.
- No autonomous model self-improvement claim.
- No real-value rewards.
- No large RPG, combat, inventory bloat, or unrelated game mechanics.

### Required Architecture

```text
Phaser/Vite Mini App
-> game state and visible map
-> LLM route-proposal client
-> server-side LLM relay
-> low-cost GPT model
-> structured move proposal
-> deterministic resource checks
-> player guidance
-> trace card / session lesson
```

API keys must never be exposed in browser code. The model id must be configurable, with the low-cost GPT model selected from current official OpenAI guidance during implementation.

The invariant is:

```text
LLM proposes. Resource rules decide. User guides. Trace records.
```

### Acceptance Criteria

- App runs through the Vite workflow.
- App is structured so it can be opened as a Nimiq Mini App while still working in local browser development.
- Scene uses a Phaser-compatible 2D RPG/tilemap workflow or a documented equivalent.
- Scene shows a small map with fog/uncertainty, route nodes, and a goal.
- HUD shows Bot Attention, Nimiq Pocket, User Attention prompts, and Context Capacity.
- Bot can request a structured LLM route proposal through a backend relay.
- Browser client does not contain provider API keys.
- LLM proposal is validated before it can affect game state.
- Player can approve, redirect, or correct the bot's proposed move.
- Accepted moves spend Bot Attention and update map state.
- At least one player correction becomes a session lesson.
- A later proposal reflects the session lesson without persistent storage.
- Trace cards show resource spend, revealed information, user guidance, and lesson application.
- Nimiq testnet/local fallback pocket status is visible and clearly low-stakes.
- No mainnet spend, persistent memory, x402, checkout, real paid service, or autonomous spending exists.

## Phase 2 - Persistent Memory And Skills

### Goal

Turn session lessons into durable, inspectable memory and skill upgrades.

### Product Shift

Phase 1 asks:

```text
Can the player guide the bot's attention during one run?
```

Phase 2 asks:

```text
Can the bot carry user-approved lessons into later runs?
```

### Scope

- Persistent memory store for explicit user-approved lessons.
- Skill unlocks from repeated feedback patterns.
- Memory inspection and reset controls.
- Context-slot upgrade paths.
- User preference traces that explain why the bot changed behavior.
- Continued use of deterministic resource rules around any costly action.

### Explicit Non-Scope

- No opaque personalization.
- No irreversible memory.
- No hidden user profiling.
- No automatic spending outside user rules.
- No mainnet value requirement.

### Acceptance Criteria

- User can save a lesson from a run.
- Saved lessons influence later runs.
- User can inspect, edit, disable, or reset memory.
- The bot can explain which lesson influenced a proposal.
- Resource spend remains bounded and visible.

## Phase 3 - Real Task Bridge

### Goal

Connect the trained resource-judgment loop to one real-world task type while preserving the game/control surface.

### Scope

- One backend task bridge.
- Real LLM/tool/API usage behind the backend.
- Bot Attention maps to actual token/tool usage.
- User sees expected attention/cost before proceeding.
- Trace records result, cost, and user feedback.
- Nimiq testnet may fund or simulate attention recharge.

### Explicit Non-Scope

- No broad marketplace.
- No mainnet default.
- No arbitrary autonomous task execution.
- No direct provider keys in the client.

### Acceptance Criteria

- User can start one bounded real-world task.
- The bot proposes a resource plan before execution.
- User can approve or redirect.
- The result returns to the game/control surface.
- Trace shows what was spent and why.

## Phase 4 - Nimiq Pocket Funding And Testnet Economy

### Goal

Make Nimiq more than a display meter by using testnet pocket funding as the low-stakes value carrier for Bot Attention.

### Scope

- Explicit testnet wallet connection/status.
- Testnet top-up or faucet-like flow when available.
- Pocket top-up trace cards.
- Conversion rule from testnet pocket value to Bot Attention/recharge.
- Clear separation between testnet demo value and real-value mainnet.

### Explicit Non-Scope

- No mainnet reward distribution.
- No real-value payout claim.
- No sponsor-funded campaign without anti-abuse design.
- No uncontrolled wallet operation.

### Acceptance Criteria

- User can see testnet pocket status.
- Top-up/recharge is explicit and traceable.
- Bot can only spend attention/resources inside visible limits.
- UI clearly identifies testnet/low-stakes mode.

## Phase 5 - Paid Resource Governance As One Application

### Goal

Reintroduce paid-resource governance as one real application of the broader resource-judgment thesis.

### Scope

- Use earlier allowance/rule/receipt groundwork.
- Represent paid API/tool/service calls as resource nodes.
- Require deterministic checks before any paid action.
- Keep `SimulatedPaymentAdapter` for local demos.
- Explore future `X402PaymentAdapter` or `NimiqNativePaymentAdapter` only behind adapters.

### Explicit Non-Scope

- No claim that native NIM is universally x402-compatible.
- No production payment facilitator.
- No broad wallet delegation.
- No payment without explicit user-controlled boundaries.

### Acceptance Criteria

- Paid action proposals are just one move type in the resource map.
- Allowance, rule, approval, and receipt logic remain test-covered.
- Payment rails are replaceable.
- User can see when money, attention, or interaction time is being spent.

## Phase 6 - Mainnet / Real-Value Readiness

### Goal

Prepare for real-value exposure only after the game loop, persistent memory, and resource governance are proven on low-stakes surfaces.

### Scope

- Mainnet risk review.
- User authorization and recovery design.
- Anti-abuse and reward eligibility design if rewards are considered.
- Security review of wallet and backend boundaries.
- Clear product/legal framing before real-value launch.

### Acceptance Criteria

- Mainnet behavior is explicitly user-triggered.
- Risk boundaries are documented.
- Recovery and reset paths exist.
- The bot never receives broad wallet access.

## Current Next Step

The immediate next step is **Phase 1**:

> Implement a Nimiq Mini App-compatible Phaser/Vite resource-judgment mini game with RPG-style map navigation, LLM-backed route proposals, Bot Attention, Nimiq testnet pocket value, user guidance, session-only lessons, and trace cards.

PB-001 through PB-012 are implemented as a playable local/browser slice. The next code slice should be **PB-POLISH Submission Vertical Slice**, with a separate Nimiq Pay testnet device/emulator check for the PB-012 NIM status path before competition readiness is marked pass.
