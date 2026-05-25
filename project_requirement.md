# Pocket Bot Project Requirements

## 1. Project Title

**Pocket Bot** is a playful Nimiq mini app prototype about giving software helpers a small, self-custodied prepaid allowance instead of broad access to a user's wallet.

Tagline:

> Give your helper pocket money, not your wallet.

The product should use a compact 2D game scene to make helper allowances visible, bounded, understandable, and reviewable.

The project is intentionally framed around **personal control for independent individuals**, not enterprise automation. The robot is a personal helper with a small allowance, not a corporate autonomous agent with broad spending authority.

## 2. Project Reason

This project is being developed for the **Nimiq Mini Apps Competition**.

Nimiq publicly frames itself as **"Universal Money for Independent Individuals"** and emphasizes accessible, intuitive apps that put people back in control. Pocket Bot should align with that framing by exploring how Nimiq could provide a self-custodied prepaid allowance for software helpers.

The goal is not to build a full autonomous agent economy. The goal is to create a small, playful, competition-ready prototype that demonstrates:

- a user-funded helper allowance,
- simple spending rules,
- visible spending boundaries,
- human approval before sensitive actions,
- automatic receipts,
- and clear review of what happened.

The current repository already contains a Phaser 3 + Vite game foundation. The requirements in this document guide the first product milestone before implementing new features.

## 3. Competition Context

Pocket Bot should be suitable as a Nimiq mini app competition entry.

The competition-relevant idea is that Nimiq can provide the wallet and payment layer, while the game world provides the human interface layer. The prototype should demonstrate how a wallet-funded allowance can become an understandable, guided interaction in a mini app.

For the MVP, Nimiq integration can be simulated. Real testnet, mainnet, Mini App SDK, wallet, or payment request integration belongs to a later milestone.

The project should avoid heavy enterprise language. It should feel closer to:

> A playful Nimiq mini app where an independent individual gives a small robot helper a prepaid allowance, sets simple spending rules, approves actions, and sees clear receipts.

## 4. Problem Statement

As digital money becomes more programmable, people may increasingly allow software helpers to propose or prepare paid actions. But users should not need to give a helper broad wallet access or trust it blindly.

Users need to understand:

- how much allowance the helper has,
- what the helper is allowed to spend on,
- which budget envelope an action will use,
- whether the cost fits the rules,
- whether the tool or service is allowed,
- whether the action needs approval,
- what happened after execution,
- and how to inspect the receipt later.

The interface problem is to make these checks visible without forcing the user to read a technical audit log or understand agent infrastructure.

## 5. Product Thesis

Pocket Bot explores how Nimiq could provide a **self-custodied prepaid allowance for software helpers**.

The system should not claim to validate a robot's or AI agent's inner intention. Instead, it should validate whether a proposed action is an allowed continuation of a user-declared rule set and a bounded prepaid allowance.

The core product loop is:

1. user gives the helper a small allowance,
2. user sets a simple rule,
3. user assigns a bounded budget envelope,
4. robot helper proposes a small paid action,
5. system checks the proposal against the rule and allowance,
6. action is auto-approved, sent for approval, or blocked,
7. approved action executes in simulation,
8. receipt is created,
9. user can inspect and classify the receipt,
10. trace can be replayed or reviewed.

Product principles:

> Delegation should never mean losing control.
>
> A helper gets pocket money, not the user's wallet.

## 6. Target Users

Primary target users:

- Nimiq Mini Apps Competition judges evaluating usefulness, clarity, playfulness, and fit with wallet/payment interactions.
- Crypto-curious individuals who understand payments but may not understand autonomous or delegated software actions.
- Nimiq users who value simple, accessible, self-controlled money tools.
- Users curious about letting software help with small paid tasks without exposing their full wallet.

Secondary target users:

- Builders exploring human-in-the-loop controls for wallets and AI helpers.
- Product designers exploring wallet UX for delegated payments.
- Developers who need a simple prototype to extend toward Nimiq Mini App SDK integration.

The MVP should be understandable to a non-enterprise user. It should not require knowledge of AI governance, enterprise procurement, or agent-economy theory.

## 7. Core Use Case

The initial use case is a single robot helper operating with a small prepaid allowance.

User rule:

> Pocket Bot may spend from the AI Tools allowance, max 1 NIM per action, only on approved helper tools.

Robot proposal:

> I want to use Quick Summarizer. Cost: 0.4 NIM. Envelope: AI Tools. Reason: summarize this long note.

System checks:

- Is Quick Summarizer an approved helper tool?
- Is 0.4 NIM at or below the 1 NIM max-per-action limit?
- Does the AI Tools allowance have enough remaining balance?
- Does the rule allow auto-approval, or does this require user approval?

Possible outcomes:

- **Auto-approved:** the action is within all rules and below the approval threshold.
- **Needs approval:** the action is allowed but requires explicit user confirmation.
- **Rejected/blocked:** the action violates rule or allowance constraints.

After execution, a receipt card records the action, decision, rule result, and outcome.

Important MVP note:

The paid helper tool is simulated. The purpose of the first milestone is to demonstrate the allowance and control interface, not to integrate a real AI API or real Nimiq payment.

## 8. MVP Scope

The MVP is a small Phaser scene, not a large RPG.

The required first scene is **Pocket Bot Workshop**.

The MVP must include:

- one robot helper,
- one prepaid allowance / budget envelope,
- one paid helper tool stall,
- one approval gate,
- one receipt archive,
- one simple task/action loop,
- one visible UI overlay for allowance, rule, and current action state,
- simulated NIM amounts,
- simulated approval and receipt behavior.

The MVP should keep the existing Phaser 3 + Vite foundation. The current implementation uses `src/main.js` as the entry point and `src/scenes/Street.js` as the active scene. Future implementation should adapt or extend the existing foundation instead of replacing the project structure.

## 9. Non-Goals For MVP

The MVP should not include:

- real Nimiq wallet connection,
- real Nimiq testnet or mainnet payments,
- Nimiq Mini App SDK integration,
- real wallet-funded allowances,
- real AI API execution,
- multiple robots,
- multiple budget envelopes,
- persistent backend storage,
- user authentication,
- exportable audit logs,
- complex policy editor,
- trust levels,
- large RPG maps,
- inventory systems,
- combat, quests, or unrelated game mechanics,
- enterprise procurement or compliance workflows.

These may be considered future features after the first milestone demonstrates the core allowance loop.

## 10. Functional Requirements

### Rule / Allowance

- The app must display the active user rule in concise language.
- The MVP rule must include a helper name, allowance/envelope name, max cost per action, and allowed tool category.
- The app must represent the rule boundary visually as an approval gate.
- The app must distinguish allowed, approval-required, and blocked actions.
- The language should use simple terms such as **rule**, **allowance**, **helper**, **approval**, and **receipt** before introducing advanced terms like mandate or policy.
- The UI must communicate that the helper has limited pocket money, not full wallet access.

### Prepaid Allowance / Budget Envelope

- The app must show one visible prepaid allowance named **AI Tools**.
- The allowance must have a simulated NIM balance.
- The balance must decrease only after an approved action executes.
- The UI must show remaining allowance after each executed action.
- The allowance should be visually represented as a pouch, pocket, backpack, or small fund controlled by the user.

### Robot Helper

- The app must show one robot helper, provisionally named **Pocket Bot**.
- The robot must be presented as a personal helper acting under user rules.
- The robot must be able to enter or approach the action flow in the scene.
- The robot must present a concrete action proposal to the user or system.

### Paid Helper Tool Stall

- The scene must include one paid helper tool stall.
- The initial stall should represent **Quick Summarizer** or a similar approved helper tool.
- The stall must have a visible cost in simulated NIM.
- The stall must be treated as a paid service, not as a generic collectible.

### Approval Gate

- The gate must check the proposal against the active rules and allowance.
- The gate must provide one of three decisions: auto-approved, needs approval, or rejected/blocked.
- For the initial happy path, Quick Summarizer at 0.4 NIM should pass the max-per-action and approved-tool checks.
- If user approval is required in a scenario, the UI must provide approve and reject choices.

### Execution

- An approved action must execute in a visible way.
- Execution may be represented by the robot moving through the gate, visiting the stall, or triggering a small scene event.
- Execution must create a receipt.

### Receipts

- Every executed spend/action must create a receipt card.
- Each receipt must include tool, cost, allowance/envelope, rule result, reason, decision, and outcome.
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
- Code should be organized so that rule checks, allowance state, and receipt creation can later be separated from scene rendering.
- Future Nimiq integration should not require rewriting the whole scene.
- The tone should feel playful but trustworthy.

## 12. UX Principles

- Make boundaries visible.
- Make allowance limits visible before spending.
- Make spending legible before it happens.
- Make approvals feel deliberate, not accidental.
- Make receipts easy to inspect.
- Use playful visuals to support understanding, not to hide risk.
- Keep the tone trustworthy rather than childish.
- Prefer concrete labels over abstract jargon.
- Show the current action state at all times.
- Treat the user as the final authority for ambiguous or rule-changing decisions.
- Align with Nimiq's accessible, non-jargon product style.
- Reinforce the central message: the helper has pocket money, not full wallet access.

## 13. Game Metaphor

The game metaphor is a compact 2D workshop where prepaid helper allowances become spatial.

Suggested mapping:

- Robot = personal software helper.
- Prepaid allowance = pocket, pouch, backpack, crate, or resource container.
- Paid helper tool = stall, vending machine, lab bench, or service counter.
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
- `allowedAllowanceIds`
- `allowedToolCategories`
- `maxCostPerAction`
- `approvalRule`

### Allowance

- `id`
- `name`
- `balance`
- `currency`
- `reservedAmount`
- `fundingMode`

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
- `allowanceId`
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
- `allowanceName`
- `reason`
- `decision`
- `outcome`
- `userClassification`
- `createdAt`

## 15. First Scene Requirements

Scene name: **Pocket Bot Workshop**

Required scene areas:

- **Workshop start:** the robot begins here.
- **Allowance pocket area:** shows the current allowance and remaining balance.
- **Tool stall:** represents the paid helper service.
- **Approval gate:** checks whether the proposed action can proceed.
- **Receipt archive:** stores the generated receipt card.
- **UI overlay:** displays allowance, user rule, proposal, and decision state.

Minimum first loop:

1. Scene loads with Pocket Bot, AI Tools allowance, Quick Summarizer stall, approval gate, and receipt archive.
2. UI shows the user rule and AI Tools allowance balance.
3. Pocket Bot proposes using Quick Summarizer for 0.4 NIM.
4. Gate checks approved tool, cost threshold, and allowance balance.
5. Action is auto-approved or presented for approval depending on the selected first milestone behavior.
6. On execution, balance decreases by 0.4 NIM.
7. A receipt card appears in the receipt archive.
8. User can inspect and classify the receipt.

## 16. Acceptance Criteria For The First Milestone

The first milestone is complete when:

- The app runs locally through the existing Vite workflow.
- The first visible scene is Pocket Bot Workshop or an intentionally renamed equivalent.
- The scene includes the robot, allowance pocket, paid helper tool stall, approval gate, receipt archive, and UI overlay.
- The user rule is visible in the UI.
- The UI clearly communicates that the helper has a limited allowance, not full wallet access.
- The user can trigger or observe a proposal for Quick Summarizer costing 0.4 NIM.
- The rule check evaluates tool approval, max cost per action, and allowance balance.
- The action produces a clear decision: auto-approved, needs approval, or blocked.
- Approved execution reduces the AI Tools allowance balance.
- Execution creates a receipt card with the required receipt fields.
- The latest receipt can be inspected.
- The user can classify the receipt using the four MVP classification options.
- No real wallet or payment action occurs.
- Existing Phaser/Vite foundation remains intact.
- The wording and UI framing emphasize user control, prepaid allowances, and independent individuals.

## 17. Open Questions

- Should the first playable loop be user-triggered by keyboard/controller input, UI button input, or automatic scene progression?
- Should the first milestone use auto-approval only, or include an explicit approval choice for the happy path?
- What initial AI Tools allowance balance should be shown?
- Should the robot movement remain side-scroller style, or shift toward a top-down workshop layout?
- Should `src/scenes/Street.js` be renamed later, or should a new Pocket Bot Workshop scene be added and wired as the active scene?
- What visual style should be used for the robot, allowance pocket, tool stall, gate, and receipt archive before final art exists?
- How explicit should the simulated nature of NIM payments be in the first UI?
- Which Nimiq Mini App SDK or wallet APIs should be targeted in a later milestone?
- Should the later real-product path target AI API usage, paid web tools, Nimiq-native mini app services, or another type of helper action first?

## 18. Suggested Next Implementation Steps

Recommended next task:

1. Review and approve this revised Pocket Bot requirements document.
2. Decide the first interaction model: automatic loop, keyboard-triggered loop, or UI-button-triggered loop.
3. Decide whether the first milestone starts by adapting `src/scenes/Street.js` or by adding a new `PocketBotWorkshop` scene.
4. Define the initial in-memory data objects for rule, allowance, tool, proposal, decision, and receipt.
5. Implement the Pocket Bot Workshop scene using existing Phaser/Vite structure.
6. Add the UI overlay for rule, allowance, proposal, decision, and receipt state.
7. Add a minimal receipt archive interaction.
8. Test locally through Vite and document any follow-up requirements.

Future ideas after MVP:

- multiple robot helpers,
- multiple allowances,
- trust levels,
- simulated spending mode,
- Nimiq testnet integration,
- real payment request flow,
- wallet-funded prepaid allowance,
- Nimiq Mini App SDK integration,
- helper action replay,
- receipt sorting mini-game,
- simple rule editor,
- exportable personal receipt history,
- backend gateway for real paid API/tool calls.