# Robot Ledger Project Requirements

## 1. Project Title

**Robot Ledger** is the working title for a playful Nimiq mini app prototype about independent individuals keeping control when software helpers are allowed to propose or perform small payment-related actions.

The product should use a compact 2D game scene to make delegated payments visible, bounded, understandable, and reviewable.

The project is intentionally framed around **personal control**, not enterprise automation. The robot is a personal helper, not a corporate autonomous agent.

## 2. Project Reason

This project is being developed for the **Nimiq Mini Apps Competition**.

Nimiq publicly frames itself as **"Universal Money for Independent Individuals"** and emphasizes accessible, intuitive apps that put people back in control. Robot Ledger should align with that framing by showing how a wallet-adjacent mini app can help an individual understand and control what a software helper may do with their money.

The goal is not to build a full autonomous agent economy. The goal is to create a small, playful, competition-ready prototype that demonstrates:

- simple delegated payment rules,
- visible spending boundaries,
- human approval before sensitive actions,
- automatic receipts,
- and clear review of what happened.

The current repository already contains a Phaser 3 + Vite game foundation. The requirements in this document guide the first product milestone before implementing new features.

## 3. Competition Context

Robot Ledger should be suitable as a Nimiq mini app competition entry.

The competition-relevant idea is that Nimiq can provide the wallet and payment layer, while the game world provides the human interface layer. The prototype should demonstrate how abstract wallet actions can become guided, understandable, and human-controlled interactions in a mini app.

For the MVP, Nimiq integration can be simulated. Real testnet, mainnet, SDK, or payment request integration belongs to a later milestone.

The project should avoid heavy enterprise language. It should feel closer to:

> A playful Nimiq mini app where an independent individual gives a small robot helper a tiny budget, sets simple spending rules, approves actions, and sees clear receipts.

## 4. Problem Statement

As digital money becomes more programmable, people may increasingly allow software helpers to propose or prepare payments. But users should not need to trust a helper blindly.

Users need to understand:

- what the helper is allowed to do,
- which budget envelope the action will use,
- whether the cost fits the rules,
- whether the tool or service is allowed,
- whether the action needs approval,
- what happened after execution,
- and how to inspect the receipt later.

The interface problem is to make these checks visible without forcing the user to read a technical audit log or understand agent infrastructure.

## 5. Product Thesis

Robot Ledger should help independent individuals keep control over delegated payment behavior.

The system should not claim to validate a robot's or AI agent's inner intention. Instead, it should validate whether a proposed action is an allowed continuation of a user-declared rule set.

The core product loop is:

1. user sets a simple rule,
2. user assigns a bounded budget envelope,
3. robot helper proposes a small paid action,
4. system checks the proposal against the rule,
5. action is auto-approved, sent for approval, or blocked,
6. approved action executes in simulation,
7. receipt is created,
8. user can inspect and classify the receipt,
9. trace can be replayed or reviewed.

Product principle:

> Delegation should never mean losing control.

## 6. Target Users

Primary target users:

- Nimiq Mini Apps Competition judges evaluating usefulness, clarity, playfulness, and fit with wallet/payment interactions.
- Crypto-curious individuals who understand payments but may not understand autonomous or delegated software actions.
- Nimiq users who value simple, accessible, self-controlled money tools.

Secondary target users:

- Builders exploring human-in-the-loop controls for wallets and AI helpers.
- Product designers exploring wallet UX for delegated payments.
- Developers who need a simple prototype to extend toward Nimiq SDK integration.

The MVP should be understandable to a non-enterprise user. It should not require knowledge of AI governance, enterprise procurement, or agent-economy theory.

## 7. Core Use Case

The initial use case is a single robot helper operating under a simple personal rule.

User rule:

> TestBot may spend from the Testing envelope, max 1 NIM per action, only on approved helper tools.

Robot proposal:

> I want to use BugTriage API. Cost: 0.4 NIM. Envelope: Testing. Reason: analyze a bug report.

System checks:

- Is BugTriage API an approved helper tool?
- Is 0.4 NIM at or below the 1 NIM max-per-action limit?
- Does the Testing envelope have enough remaining balance?
- Does the rule allow auto-approval, or does this require user approval?

Possible outcomes:

- **Auto-approved:** the action is within all rules and below the approval threshold.
- **Needs approval:** the action is allowed but requires explicit user confirmation.
- **Rejected/blocked:** the action violates policy or budget constraints.

After execution, a receipt card records the action, decision, rule result, and outcome.

## 8. MVP Scope

The MVP is a small Phaser scene, not a large RPG.

The required first scene is **Robot Workshop**.

The MVP must include:

- one robot helper,
- one budget envelope,
- one paid tool/service stall,
- one approval gate,
- one receipt archive,
- one simple task/action loop,
- one visible UI overlay for budget, rule, and current action state,
- simulated NIM amounts,
- simulated approval and receipt behavior.

The MVP should keep the existing Phaser 3 + Vite foundation. The current implementation uses `src/main.js` as the entry point and `src/scenes/Street.js` as the active scene. Future implementation should adapt or extend the existing foundation instead of replacing the project structure.

## 9. Non-Goals For MVP

The MVP should not include:

- real Nimiq wallet connection,
- real Nimiq testnet or mainnet payments,
- Nimiq Mini App SDK integration,
- multiple robots,
- multiple budget envelopes,
- persistent backend storage,
- real AI-agent execution,
- user authentication,
- exportable audit logs,
- complex policy editor,
- trust levels,
- large RPG maps,
- inventory systems,
- combat, quests, or unrelated game mechanics,
- enterprise procurement or compliance workflows.

These may be considered future features after the first milestone demonstrates the core action loop.

## 10. Functional Requirements

### Rule / Mandate

- The app must display the active user rule in concise language.
- The MVP rule must include a helper name, envelope name, max cost per action, and allowed tool category.
- The app must represent the rule boundary visually as an approval gate.
- The app must distinguish allowed, approval-required, and blocked actions.
- The language should use simple terms such as **rule**, **budget**, **helper**, **approval**, and **receipt** before introducing advanced terms like mandate or policy.

### Budget Envelope

- The app must show one visible budget envelope named **Testing**.
- The envelope must have a simulated NIM balance.
- The balance must decrease only after an approved action executes.
- The UI must show remaining balance after each executed action.

### Robot Helper

- The app must show one robot helper, provisionally named **TestBot**.
- The robot must be presented as a personal helper acting under user rules.
- The robot must be able to enter or approach the action flow in the scene.
- The robot must present a concrete action proposal to the user or system.

### Paid Tool / Service Stall

- The scene must include one paid tool/service stall.
- The initial stall should represent **BugTriage API** or a similar approved helper tool.
- The stall must have a visible cost in simulated NIM.
- The stall must be treated as a paid service, not as a generic collectible.

### Approval Gate

- The gate must check the proposal against the active rules.
- The gate must provide one of three decisions: auto-approved, needs approval, or rejected/blocked.
- For the initial happy path, BugTriage API at 0.4 NIM should pass the max-per-action and approved-tool checks.
- If human approval is required in a scenario, the UI must provide approve and reject choices.

### Execution

- An approved action must execute in a visible way.
- Execution may be represented by the robot moving through the gate, visiting the stall, or triggering a small scene event.
- Execution must create a receipt.

### Receipts

- Every executed spend/action must create a receipt card.
- Each receipt must include tool, cost, envelope, rule result, reason, decision, and outcome.
- Receipts must appear in or near the receipt archive.
- The user must be able to inspect the latest receipt.
- The MVP should allow the user to classify a receipt as one of:
  - looks right,
  - wrong category,
  - should have asked,
  - block this tool next time.

### Trace

- The app must preserve enough visible state for the user to understand what happened.
- The MVP can keep trace data in memory.
- The receipt archive is the primary trace surface for the first milestone.

## 11. Non-Functional Requirements

- The MVP must run as a local Phaser 3 + Vite application.
- The implementation should preserve the existing project foundation.
- The game loop should remain simple and understandable.
- The UI should be readable on a typical desktop browser viewport.
- Controls should be obvious without requiring a long tutorial.
- Simulated payment behavior must be clearly distinguishable from real payment behavior.
- The prototype should avoid making real financial claims before Nimiq integration exists.
- Code should be organized so that rule checks, budget state, and receipt creation can later be separated from scene rendering.
- Future Nimiq integration should not require rewriting the whole scene.
- The tone should feel playful but trustworthy.

## 12. UX Principles

- Make boundaries visible.
- Make spending legible before it happens.
- Make approvals feel deliberate, not accidental.
- Make receipts easy to inspect.
- Use playful visuals to support understanding, not to hide risk.
- Keep the tone trustworthy rather than childish.
- Prefer concrete labels over abstract jargon.
- Show the current action state at all times.
- Treat the user as the final authority for ambiguous or rule-changing decisions.
- Align with Nimiq's accessible, non-jargon product style.

## 13. Game Metaphor

The game metaphor is a compact 2D workshop where delegated payments become spatial.

Suggested mapping:

- Robot = personal software helper.
- Budget envelope = pouch, backpack, crate, or resource container.
- Paid tool/service = stall, vending machine, lab bench, or service counter.
- Approval rule = gate, checkpoint, scanner, or safety barrier.
- Receipt archive = filing cabinet, ledger desk, wall board, or card stack.
- Action trace = path the robot took plus receipt records.

The metaphor should make constraints easier to understand. It should not turn financial control into an unrelated arcade challenge.

## 14. Domain Model / Key Objects

The first implementation should be able to represent these objects, even if they start as simple JavaScript objects inside the scene.

### Helper

- `id`
- `name`
- `ruleId`
- `currentProposalId`
- `state`

### Rule

- `id`
- `helperId`
- `summary`
- `allowedEnvelopeIds`
- `allowedToolCategories`
- `maxCostPerAction`
- `approvalRule`

### Budget Envelope

- `id`
- `name`
- `balance`
- `currency`
- `reservedAmount`

### Tool / Service

- `id`
- `name`
- `category`
- `cost`
- `currency`
- `approved`

### Action Proposal

- `id`
- `helperId`
- `toolId`
- `envelopeId`
- `cost`
- `reason`
- `createdAt`
- `status`

### Rule Decision

- `proposalId`
- `checks`
- `decision`
- `requiresUserApproval`
- `explanation`

### Receipt

- `id`
- `proposalId`
- `toolName`
- `cost`
- `currency`
- `envelopeName`
- `reason`
- `decision`
- `outcome`
- `userClassification`
- `createdAt`

## 15. First Scene Requirements

Scene name: **Robot Workshop**

Required scene areas:

- **Workshop start:** the robot begins here.
- **Testing envelope area:** shows the current budget and remaining balance.
- **API Market or Testing Lab stall:** represents the paid service.
- **Approval gate:** checks whether the proposed action can proceed.
- **Receipt archive:** stores the generated receipt card.
- **UI overlay:** displays budget, user rule, proposal, and decision state.

Minimum first loop:

1. Scene loads with TestBot, Testing envelope, BugTriage API stall, approval gate, and receipt archive.
2. UI shows the user rule and Testing envelope balance.
3. TestBot proposes using BugTriage API for 0.4 NIM.
4. Gate checks approved tool, cost threshold, and envelope balance.
5. Action is auto-approved or presented for approval depending on the selected first milestone behavior.
6. On execution, balance decreases by 0.4 NIM.
7. A receipt card appears in the receipt archive.
8. User can inspect and classify the receipt.

## 16. Acceptance Criteria For The First Milestone

The first milestone is complete when:

- The app runs locally through the existing Vite workflow.
- The first visible scene is Robot Workshop or an intentionally renamed equivalent.
- The scene includes the robot, budget envelope, paid tool/service stall, approval gate, receipt archive, and UI overlay.
- The user rule is visible in the UI.
- The user can trigger or observe a proposal for BugTriage API costing 0.4 NIM.
- The rule check evaluates tool approval, max cost per action, and envelope balance.
- The action produces a clear decision: auto-approved, needs approval, or blocked.
- Approved execution reduces the Testing envelope balance.
- Execution creates a receipt card with the required receipt fields.
- The latest receipt can be inspected.
- The user can classify the receipt using the four MVP classification options.
- No real wallet or payment action occurs.
- Existing Phaser/Vite foundation remains intact.
- The wording and UI framing emphasize user control and independent individuals, not enterprise agent governance.

## 17. Open Questions

- Should the first playable loop be user-triggered by keyboard/controller input, UI button input, or automatic scene progression?
- Should the first milestone use auto-approval only, or include an explicit approval choice for the happy path?
- What initial Testing envelope balance should be shown?
- Should the robot movement remain side-scroller style, or shift toward a top-down workshop layout?
- Should `src/scenes/Street.js` be renamed later, or should a new scene be added and wired as the active scene?
- What visual style should be used for the robot, envelope, stall, gate, and receipt archive before final art exists?
- How explicit should the simulated nature of NIM payments be in the first UI?
- Which Nimiq Mini App SDK or wallet APIs should be targeted in a later milestone?
- What final product name best aligns with Nimiq's independent-individual framing: Robot Ledger, Pocket Robot, Nimiq Buddy, or another name?

## 18. Suggested Next Implementation Steps

Recommended next task:

1. Review and approve this revised requirements document.
2. Decide the first interaction model: automatic loop, keyboard-triggered loop, or UI-button-triggered loop.
3. Decide whether the first milestone starts by adapting `src/scenes/Street.js` or by adding a new `RobotWorkshop` scene.
4. Define the initial in-memory data objects for rule, envelope, tool, proposal, decision, and receipt.
5. Implement the Robot Workshop scene using existing Phaser/Vite structure.
6. Add the UI overlay for rule, budget, proposal, decision, and receipt state.
7. Add a minimal receipt archive interaction.
8. Test locally through Vite and document any follow-up requirements.

Future ideas after MVP:

- multiple robot helpers,
- multiple envelopes,
- trust levels,
- simulated spending mode,
- Nimiq testnet integration,
- real payment request flow,
- Nimiq Mini App SDK integration,
- helper action replay,
- receipt sorting mini-game,
- simple rule editor,
- exportable personal receipt history.