# MVP Implementation Plan

This plan translates `docs/product/requirements.md` into small, test-driven implementation slices for the first Pocket Bot milestone.

This is the **Phase 1** implementation plan from `docs/product/roadmap.md`. Later roadmap phases should guide containment decisions, but they are not implementation scope until Phase 1 is playable.

The milestone goal is a playable **Pocket Bot Workshop** scene inside a Nimiq Mini App-compatible Phaser/Vite shell that demonstrates:

1. limited AI Tools allowance,
2. Tool Scout paid helper-tool proposal,
3. approval gate checks,
4. simulated spend,
5. receipt creation and inspection.

No real Nimiq payment, signing flow, checkout, real external service, real AI API execution, real LLM route proposal, real learning, real reward, x402 integration, or backend should be implemented in this milestone. Mini App framework compatibility is required. A narrow user-triggered testnet wallet connection/status shell is allowed in PB-004A so the app can prove it runs inside Nimiq Pay early.

## Source Documents

- Product requirements: `docs/product/requirements.md`
- Product roadmap: `docs/product/roadmap.md`
- Phase 0 alignment: `docs/product/phase0_alignment.md`
- Product pitch: `docs/product/pitch.md`
- Infrastructure context: `docs/product/infrastructure_context.md`
- Development workflow: `docs/process/development_workflow.md`
- Test strategy: `docs/testing/test_strategy.md`

## Current Phase 1 Status

- PB-001 Domain Rule Decision is implemented.
- PB-002 Receipt Creation is implemented, including future-facing receipt classification data.
- PB-003 Allowance Spend Execution is implemented.
- PB-004 Pocket Bot Workshop Scene Shell is implemented with Mini App framework compatibility, local fallback status, and a Tool Scout hover witness interaction.
- PB-004A Testnet Wallet Connection Shell is the next implementation slice.
- PB-005 Proposal And Approval Flow follows PB-004A.

Receipt classification UI and training feedback are not Phase 1 baseline requirements. They may remain as small future-facing domain data, but full user feedback and training behavior belong to Phase 2A unless explicitly pulled forward.

## Implementation Assumptions

These assumptions are binding for the first implementation pass unless the product requirements are updated:

- The first interaction model is **UI-button-triggered**. Spending and approval controls should feel deliberate.
- Add a new `PocketBotWorkshop` scene instead of renaming `Street.js` immediately.
- Keep `Street.js` temporarily as a reference prototype until the new scene replaces it cleanly.
- Keep the app compatible with the Nimiq Mini App framework while preserving local browser development.
- Put Mini App SDK/provider access behind a small adapter or platform module when introduced.
- Any wallet connection in Phase 1 must be explicit, user-triggered, and limited to testnet/status display. It must not fund allowances, sign messages, send NIM, or execute helper spend.
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
  platform/
    nimiqMiniApp.js
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

Vitest and `npm run test` are the baseline unit-test tooling for `src/domain/` behavior.

## Feature Slices

### PB-001 Domain Rule Decision

Goal:

Implement the rule-decision logic for the Tool Scout proposal.

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

- approved Tool Scout proposal at 0.4 NIM is allowed,
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
- receipt classification accepts the future-facing classification values,
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

Add the first Pocket Bot Workshop scene and wire it as the active scene inside a Nimiq Mini App-compatible shell.

User-visible behavior:

The app opens to a compact workshop containing Pocket Bot, AI Tools allowance, Tool Scout stall, approval gate, receipt archive, and a simple overlay.

Expected files:

- `src/scenes/PocketBotWorkshop.js`
- `src/main.js`
- `src/game/mvpScenario.js`
- optional `src/platform/nimiqMiniApp.js`
- optional `src/ui/hud.js`

Test plan:

- `npm run build` passes,
- browser smoke check confirms the scene loads,
- local browser fallback works when Nimiq Pay providers are unavailable,
- scene displays required MVP entities,
- overlay displays allowance, rule, proposal, and decision state,
- Nimiq Pay Mini App manual check is planned or performed when a device/emulator test path is available.

Acceptance:

- app starts with Pocket Bot Workshop,
- app remains compatible with Nimiq Mini App framework expectations,
- existing Phaser/Vite foundation remains intact,
- no real wallet operation, checkout, payment, or AI API behavior exists.

### PB-004A Testnet Wallet Connection Shell

Goal:

Add a narrow, explicit Nimiq Pay testnet wallet connection/status panel before the proposal flow.

User-visible behavior:

When the app is opened inside Nimiq Pay, the user can press a clear connect button to prove the Mini App can access the injected Nimiq provider on testnet. The app shows wallet connection status, account address, consensus status, and current block number when available. Outside Nimiq Pay, the same panel clearly shows local simulated mode.

Expected files:

- `src/platform/nimiqMiniApp.js`
- `src/scenes/PocketBotWorkshop.js`
- optional `src/ui/walletStatusPanel.js`
- `tests/platform/nimiqMiniApp.test.js`

Test plan:

- platform tests cover local fallback when `window.nimiq` is unavailable,
- platform tests cover provider-ready status without performing signing or payments,
- `npm run test` passes,
- `npm run build` passes,
- browser/manual check confirms local mode cannot connect to a wallet,
- Nimiq Pay testnet manual check confirms:
  - app opens through the custom Mini App URL,
  - hidden dev menu is set to Testnet,
  - connect action calls `init()` and `listAccounts()` only after user action,
  - account, consensus, and block number display when approved,
  - no sign, send, top-up, or allowance funding action is reachable.

Acceptance:

- wallet connection is optional and user-triggered,
- local browser fallback remains safe and readable,
- Nimiq Pay testnet status can be displayed when the Mini App host is available,
- no NIM is sent,
- no message is signed,
- no wallet-funded allowance is created,
- Tool Scout spend remains simulated.

### PB-005 Proposal And Approval Flow

Goal:

Connect the scene to domain logic so the user can trigger the Tool Scout proposal and see the approval decision.

User-visible behavior:

The user presses a clear UI control to let Pocket Bot propose Tool Scout. The approval gate shows the rule result.

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

Execute the approved Tool Scout helper-tool call in simulation and create a visible receipt.

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

### PB-007 Receipt Inspection

Goal:

Allow the user to inspect the latest receipt.

User-visible behavior:

The user can open or focus the latest receipt and understand what was spent, why, which rule decision applied, and what outcome was recorded.

Expected files:

- `src/ui/receiptPanel.js`
- `src/domain/receipts.js`
- `tests/domain/receipts.test.js`

Test plan:

- receipt classification unit tests pass,
- `npm run build` passes,
- manual/browser check confirms the latest receipt can be inspected,
- manual/browser check confirms receipt amount, decision, reason, and outcome remain readable.

Acceptance:

- latest receipt remains inspectable,
- receipt amount and decision history are visible and unchanged.

Optional Phase 1 stretch:

- user can classify the receipt using the future-facing classification values.
- classification does not alter spend history.

## Milestone Sequence

Implement in this order:

1. PB-001 Domain Rule Decision.
2. PB-002 Receipt Creation.
3. PB-003 Allowance Spend Execution.
4. PB-004 Pocket Bot Workshop Scene Shell.
5. PB-004A Testnet Wallet Connection Shell.
6. PB-005 Proposal And Approval Flow.
7. PB-006 Simulated Spend And Receipt Archive.
8. PB-007 Receipt Inspection.

This order keeps the spending-control behavior testable before scene rendering.

## Next Commit Recommendation

The next implementation commit should be:

```text
feat: add PB-004A testnet wallet connection shell
```

It should add explicit, user-triggered Nimiq Pay testnet wallet status without enabling signing, sending, top-up, helper spend, or wallet-funded allowance behavior.

## Risks And Controls

- **Risk:** Scene code absorbs rule logic.
  **Control:** Keep PB-001 through PB-003 in `src/domain/` with tests before scene work.
- **Risk:** The prototype feels like a generic game instead of a payment-control interface.
  **Control:** Keep allowance, rule, approval, and receipt visible in the first scene.
- **Risk:** Real payment or checkout assumptions leak into the MVP.
  **Control:** Block checkout/payment attempts and label all NIM movement as simulated.
- **Risk:** The scene is built as a browser-only demo and fails Mini App expectations later.
  **Control:** Introduce a small Mini App environment adapter/fallback boundary with PB-004.
- **Risk:** Wallet connection is confused with spend permission.
  **Control:** PB-004A may show account/status only; it must not sign, send, fund allowances, or give the helper wallet access.
- **Risk:** UI grows faster than tests.
  **Control:** Implement the simplest scene shell after domain behavior is covered.

## Out Of Scope For This Plan

- real Nimiq signing, sending, staking, top-up, or payment operations,
- wallet-funded helper allowances,
- mainnet payments,
- real AI API execution,
- real external tool/provider integration,
- backend services,
- persistence beyond in-memory state,
- multiple helpers or allowances.

## Completion Criteria

The MVP implementation plan is complete when:

- PB-001 through PB-007 are implemented,
- planned tests/checks for each slice have been run,
- `npm run build` passes,
- the Pocket Bot Workshop scene demonstrates the full allowance -> proposal -> gate -> simulated spend -> receipt loop,
- the latest receipt can be inspected,
- the app is compatible with the Nimiq Mini App framework while still supporting local browser development,
- optional testnet wallet connection is limited to account/status display and does not fund helper spend,
- the MVP still cannot complete checkout, enter payment information, spend from a real wallet, call a real LLM, call a real paid API, distribute rewards, or use x402 infrastructure.
