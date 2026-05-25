# Test Strategy

Pocket Bot should use a practical test-driven approach: test the product rules and allowance behavior with fast unit tests, then use build and browser checks to verify Phaser integration.

The first goal is not broad test coverage. The first goal is to keep the core spending-control behavior testable outside Phaser scenes.

## Current Test State

The repository currently has:

- Phaser 3 + Vite app structure,
- Vitest configured through `npm run test`,
- `npm run build` for production build verification,
- no configured browser or end-to-end test runner.

Implementation plans must describe the intended tests for each feature slice before implementation starts.

## Testing Principles

- Test domain behavior before Phaser rendering.
- Keep tests small, deterministic, and independent of the game loop.
- Treat Phaser scene tests as integration or browser checks, not as the first testing layer.
- Every feature slice must list the tests or checks that prove it works.
- If a feature changes product behavior, the tests should describe the user-visible rule being protected.
- If a test cannot be automated yet, document the manual check and the missing automation.
- Distinguish logic tests that require no user interaction from interaction checks that prove the user can understand and control the bot.
- Treat interaction checks as first-class for scene, UI, control, approval, and receipt-inspection changes.

## Two Test Tracks

### Logic Tests, No User Interaction

Use these tests for behavior that can run without a browser, Phaser scene, pointer input, keyboard input, or visual inspection.

Primary targets:

- allowance math,
- rule decisions,
- proposal validation,
- receipt creation,
- receipt classification state changes,
- simulated spend execution.

Current runner: **Vitest**.

### Interaction Tests And Checks

Use these checks for behavior where the product only works if the user can understand or control what is happening in the interface.

Primary targets:

- user can trigger the Pocket Bot proposal,
- approval gate visibly communicates auto-approved, needs-approval, or blocked,
- UI makes the allowance limit visible before spending,
- simulated spend cannot be mistaken for real wallet spending,
- receipt appears where the user expects it,
- user can inspect and classify the latest receipt.

Until browser automation exists, interaction checks may be manual or browser-smoke checks. Each check must include a concrete user action and an observable result.

## Test Layers

### Unit Tests

Use unit tests for plain JavaScript modules under `src/domain/`.

Primary targets:

- allowance balance checks,
- max-cost-per-action checks,
- approved tool/category checks,
- no-checkout boundary checks,
- proposal validation,
- rule decision generation,
- receipt creation,
- receipt classification state changes.

These tests should not import Phaser.

Current runner: **Vitest**, because it fits Vite and ES modules with low setup cost.

### Build Checks

Use `npm run build` to verify:

- Vite can bundle the app,
- imports resolve,
- moved assets do not break static paths,
- syntax and module errors are caught before browser testing.

Run this for any source-code change unless the change is documentation-only.

### Browser Smoke Checks

Use a browser smoke check when scene rendering, UI overlays, input, or Phaser asset loading changes.

Minimum smoke checks:

- app loads without console errors,
- first scene appears,
- expected core visual objects are present,
- UI overlay text is readable,
- basic interaction can trigger the current feature slice.

Recommended future tool: **Playwright**. It can verify local Vite builds and capture screenshots for visual sanity checks.

### Manual Acceptance Checks

Use manual checks for early Phaser interactions that are not yet worth automating.

Manual checks must be concrete, for example:

- start dev server,
- open the local app,
- trigger Pocket Bot proposal,
- confirm the gate decision appears,
- confirm allowance decreases only after approval,
- confirm a receipt card appears.

Avoid vague manual checks such as "looks good."

## MVP Test Coverage Plan

### PB-001 Domain Rule Decision

Expected automated tests:

- approved cart-prep tool under 1 NIM is allowed,
- unapproved tool is blocked,
- cost above 1 NIM is blocked or requires approval according to the rule,
- insufficient allowance is blocked,
- checkout/payment attempt is blocked.

### PB-002 Receipt Creation

Expected automated tests:

- executed proposal creates a receipt,
- receipt records tool, cost, allowance, reason, decision, and outcome,
- receipt classification can be set to one of the four MVP options.

### PB-003 Pocket Bot Workshop Scene Shell

Expected checks:

- `npm run build` passes,
- browser opens the app,
- Pocket Bot Workshop scene loads,
- allowance, tool stall, approval gate, receipt archive, and overlay are visible.

### PB-004 Proposal And Approval Flow

Expected checks:

- user can trigger or observe the Cart Scout proposal,
- gate evaluates approved tool, max cost, allowance balance, and no-checkout boundary,
- allowed proposal can execute,
- blocked proposal does not spend allowance.

### PB-005 Receipt Inspection

Expected checks:

- receipt appears after execution,
- latest receipt can be inspected,
- user can select each classification option,
- classification does not change the historical spend amount.

## Recommended Test Tooling Roadmap

Add more tooling only when an implementation slice needs it.

1. Add a focused `tests/domain/` folder for rule, allowance, proposal, and receipt tests.
2. Keep `npm run build` as the required integration check.
3. Add Playwright later when Phaser scene behavior needs repeatable browser verification.
4. Add CI only after local tests and build are stable.

Suggested future structure:

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

## Reporting Requirements

Every implementation summary must include:

- tests planned,
- logic tests run,
- interaction checks run,
- pass/fail result,
- skipped tests and reason,
- manual checks performed,
- remaining test gaps.

For documentation-only changes, state that no build or automated tests were required.

## Definition Of Tested For MVP

The MVP should be considered tested enough for the first milestone when:

- domain rule decisions have unit coverage,
- receipt creation has unit coverage,
- `npm run build` passes,
- the first scene has at least one browser smoke check,
- manual acceptance checks cover the full allowance -> proposal -> gate -> simulated spend -> receipt loop,
- no real wallet, real checkout, real payment, or real AI API execution is reachable in the MVP.
