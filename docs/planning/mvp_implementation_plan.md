# MVP Implementation Plan

This plan translates `docs/product/requirements.md` into small, test-driven implementation slices for the first Pocket Bot milestone.

The milestone goal is a playable **Pocket Bot Workshop** scene that demonstrates:

1. limited AI Tools allowance,
2. Cart Scout paid helper-tool proposal,
3. approval gate checks,
4. simulated spend,
5. receipt creation and classification.

No real wallet, real Nimiq payment, real checkout, real grocery service, or real AI API execution should be implemented in this milestone.

## Source Documents

- Product requirements: `docs/product/requirements.md`
- Product pitch: `docs/product/pitch.md`
- Infrastructure context: `docs/product/infrastructure_context.md`
- Development workflow: `docs/process/development_workflow.md`
- Test strategy: `docs/testing/test_strategy.md`

## Implementation Assumptions

These assumptions are binding for the first implementation pass unless the product requirements are updated:

- The first interaction model is **UI-button-triggered**. Spending and approval controls should feel deliberate.
- Add a new `PocketBotWorkshop` scene instead of renaming `Street.js` immediately.
- Keep `Street.js` temporarily as a reference prototype until the new scene replaces it cleanly.
- Domain behavior belongs in plain JavaScript modules under `src/domain/`.
- MVP scenario constants belong under `src/game/`.
- Phaser scenes should orchestrate and display state, not own the rule logic.
- The first happy path can be auto-approved if all rule checks pass.
- A checkout/payment attempt must be blocked even in simulation.

## Proposed Runtime Structure

```text
src/
  domain/
    allowance.js
    rules.js
    proposals.js
    receipts.js
  game/
    mvpScenario.js
    pocketBotState.js
  scenes/
    PocketBotWorkshop.js
    Street.js
  ui/
    hud.js
    receiptPanel.js
```

Add files only when their feature slice needs them. Avoid creating empty implementation files.

## Proposed Test Structure

```text
tests/
  domain/
    allowance.test.js
    rules.test.js
    proposals.test.js
    receipts.test.js
  smoke/
    app-loads.spec.js
```

The first test tooling step should add Vitest and `npm run test` before implementing `src/domain/` behavior.

## Feature Slices

### PB-001 Domain Rule Decision

Goal:

Implement the rule-decision logic for the Cart Scout proposal.

User-visible behavior:

Pocket Bot can only spend from the AI Tools allowance when the tool, cost, allowance balance, and no-checkout boundary all pass.

Expected files:

- `src/domain/rules.js`
- `src/domain/allowance.js`
- `src/domain/proposals.js`
- `src/game/mvpScenario.js`
- `tests/domain/rules.test.js`
- `tests/domain/allowance.test.js`

Test plan:

- approved Cart Scout proposal at 0.4 NIM is allowed,
- unapproved tool is blocked,
- cost above 1 NIM is blocked or marked approval-required according to the rule,
- insufficient allowance is blocked,
- checkout/payment attempt is blocked.

Acceptance:

- rule decision returns a clear decision: `auto-approved`, `needs-approval`, or `blocked`,
- decision includes check results and a readable explanation,
- `npm run test` and `npm run build` pass.

### PB-002 Receipt Creation

Goal:

Create receipt data for an executed approved proposal.

User-visible behavior:

After the simulated helper-tool spend, the user can see what happened and why.

Expected files:

- `src/domain/receipts.js`
- `tests/domain/receipts.test.js`

Test plan:

- executed proposal creates one receipt,
- receipt records tool, cost, allowance, reason, decision, and outcome,
- receipt classification accepts the four MVP options,
- invalid classification is rejected.

Acceptance:

- receipt creation is deterministic,
- receipt data matches the product requirement fields,
- `npm run test` and `npm run build` pass.

### PB-003 Allowance Spend Execution

Goal:

Apply an approved simulated spend to the AI Tools allowance.

User-visible behavior:

The allowance balance decreases only after an approved action executes.

Expected files:

- `src/domain/allowance.js`
- `tests/domain/allowance.test.js`

Test plan:

- approved 0.4 NIM spend reduces balance by 0.4 NIM,
- blocked proposal does not change balance,
- insufficient balance cannot go negative,
- repeated approved spends produce the expected remaining balance.

Acceptance:

- allowance math is test-covered,
- spend execution returns updated allowance state without mutating unrelated objects unexpectedly,
- `npm run test` and `npm run build` pass.

### PB-004 Pocket Bot Workshop Scene Shell

Goal:

Add the first Pocket Bot Workshop scene and wire it as the active scene.

User-visible behavior:

The app opens to a compact workshop containing Pocket Bot, AI Tools allowance, Cart Scout stall, approval gate, receipt archive, and a simple overlay.

Expected files:

- `src/scenes/PocketBotWorkshop.js`
- `src/main.js`
- `src/game/mvpScenario.js`
- optional `src/ui/hud.js`

Test plan:

- `npm run build` passes,
- browser smoke check confirms the scene loads,
- scene displays required MVP entities,
- overlay displays allowance, rule, proposal, and decision state.

Acceptance:

- app starts with Pocket Bot Workshop,
- existing Phaser/Vite foundation remains intact,
- no real wallet, checkout, payment, or AI API behavior exists.

### PB-005 Proposal And Approval Flow

Goal:

Connect the scene to domain logic so the user can trigger the Cart Scout proposal and see the approval decision.

User-visible behavior:

The user presses a clear UI control to let Pocket Bot propose Cart Scout. The approval gate shows the rule result.

Expected files:

- `src/scenes/PocketBotWorkshop.js`
- `src/ui/hud.js`
- `src/domain/rules.js`
- `src/domain/proposals.js`
- `src/game/pocketBotState.js`

Test plan:

- domain unit tests from PB-001 still pass,
- `npm run build` passes,
- manual/browser check confirms the proposal can be triggered,
- manual/browser check confirms the gate decision appears.

Acceptance:

- proposal text includes tool, cost, allowance, reason, and no-checkout outcome,
- gate decision is visible,
- blocked states do not execute a spend.

### PB-006 Simulated Spend And Receipt Archive

Goal:

Execute the approved Cart Scout helper-tool call in simulation and create a visible receipt.

User-visible behavior:

After approval, the allowance decreases by 0.4 NIM and a receipt appears in the archive.

Expected files:

- `src/scenes/PocketBotWorkshop.js`
- `src/ui/receiptPanel.js`
- `src/domain/allowance.js`
- `src/domain/receipts.js`
- `src/game/pocketBotState.js`

Test plan:

- domain tests for allowance and receipts pass,
- `npm run build` passes,
- manual/browser check confirms balance decreases after approved execution,
- manual/browser check confirms receipt appears with required fields.

Acceptance:

- receipt records tool, cost, allowance, rule result, reason, decision, and outcome,
- balance changes only after approved execution,
- receipt archive is visible in the scene.

### PB-007 Receipt Inspection And Classification

Goal:

Allow the user to inspect and classify the latest receipt.

User-visible behavior:

The user can mark the receipt as `looks right`, `wrong category`, `should have asked`, or `block this tool next time`.

Expected files:

- `src/ui/receiptPanel.js`
- `src/domain/receipts.js`
- `tests/domain/receipts.test.js`

Test plan:

- receipt classification unit tests pass,
- `npm run build` passes,
- manual/browser check confirms every classification option can be selected,
- manual/browser check confirms classification does not alter spend history.

Acceptance:

- classification is visible,
- latest receipt remains inspectable,
- receipt amount and decision history remain unchanged after classification.

## Milestone Sequence

Implement in this order:

1. Add Vitest and `npm run test`.
2. PB-001 Domain Rule Decision.
3. PB-002 Receipt Creation.
4. PB-003 Allowance Spend Execution.
5. PB-004 Pocket Bot Workshop Scene Shell.
6. PB-005 Proposal And Approval Flow.
7. PB-006 Simulated Spend And Receipt Archive.
8. PB-007 Receipt Inspection And Classification.

This order keeps the spending-control behavior testable before scene rendering.

## First Commit Recommendation

The next implementation commit should be:

```text
test: add domain test setup
```

It should add Vitest, `npm run test`, and the first failing tests for PB-001 before implementing rule logic.

## Risks And Controls

- **Risk:** Scene code absorbs rule logic.
  **Control:** Keep PB-001 through PB-003 in `src/domain/` with tests before scene work.
- **Risk:** The prototype feels like a generic game instead of a payment-control interface.
  **Control:** Keep allowance, rule, approval, and receipt visible in the first scene.
- **Risk:** Real payment or checkout assumptions leak into the MVP.
  **Control:** Block checkout/payment attempts and label all NIM movement as simulated.
- **Risk:** UI grows faster than tests.
  **Control:** Implement the simplest scene shell after domain behavior is covered.

## Out Of Scope For This Plan

- real Nimiq wallet integration,
- Mini App SDK integration,
- testnet or mainnet payments,
- real AI API execution,
- real grocery/cart provider integration,
- backend services,
- persistence beyond in-memory state,
- multiple helpers or allowances.

## Completion Criteria

The MVP implementation plan is complete when:

- PB-001 through PB-007 are implemented,
- planned tests/checks for each slice have been run,
- `npm run build` passes,
- the Pocket Bot Workshop scene demonstrates the full allowance -> proposal -> gate -> simulated spend -> receipt loop,
- the MVP still cannot complete checkout, enter payment information, or spend from a real wallet.
