# Test Strategy

Pocket Bot should use a practical test-driven approach: test resource rules, LLM proposal validation, map state, and trace behavior with fast unit tests, then use build and browser checks to verify Phaser integration.

The first goal is not broad test coverage. The first goal is to keep the core resource-judgment behavior testable outside Phaser scenes.

## Current Test State

The repository currently has:

- Phaser 3 + Vite app structure,
- Vitest configured through `npm run test`,
- `npm run build` for production build verification,
- Nimiq Mini App framework compatibility required for Phase 1,
- early allowance/rule/receipt tests from the prior MVP cut,
- no configured browser or end-to-end test runner.

Implementation plans must describe the intended tests for each feature slice before implementation starts.

## Testing Principles

- Test domain behavior before Phaser rendering.
- Keep tests small, deterministic, and independent of the game loop.
- Treat Phaser scene tests as integration or browser checks, not as the first testing layer.
- Every feature slice must list the tests or checks that prove it works.
- If a feature changes product behavior, the tests should describe the user-visible rule being protected.
- If a test cannot be automated yet, document the manual check and the missing automation.
- Distinguish logic tests that require no user interaction from interaction checks that prove the user can understand and guide the bot.
- Treat interaction checks as first-class for scene, UI, control, map navigation, resource meters, and trace inspection.
- LLM output must be schema-validated before it can affect game state.
- The LLM may propose moves, but deterministic resource rules decide legality and cost.

## Two Test Tracks

### Logic Tests, No User Interaction

Use these tests for behavior that can run without a browser, Phaser scene, pointer input, keyboard input, visual inspection, or live LLM call.

Primary targets:

- Bot Attention budget and spend rules,
- Nimiq Pocket / allowance math,
- Context Capacity slots,
- lossy map reveal state,
- route/action proposal validation,
- deterministic resource checks,
- session lesson creation,
- trace card creation,
- LLM route proposal schema validation,
- relay/client behavior using mocks.

Current runner: **Vitest**.

### Interaction Tests And Checks

Use these checks for behavior where the product only works if the user can understand or control what is happening in the interface.

Primary targets:

- user can see the lossy map and current goal,
- user can see Bot Attention, Nimiq Pocket, User Attention prompts, and Context Capacity,
- user can request or receive a bot route proposal,
- user can approve, redirect, or correct the bot,
- accepted moves visibly spend Bot Attention,
- inspect actions reveal hidden information,
- session lessons are visible and applied later in the run,
- trace cards appear where the user expects them,
- testnet/local Nimiq pocket mode is clear and low-stakes.

Until browser automation exists, interaction checks may be manual or browser-smoke checks. Each check must include a concrete user action and an observable result.

## Test Layers

### Unit Tests

Use unit tests for plain JavaScript modules under `src/domain/`, `src/llm/`, and narrow platform adapters.

Primary targets:

- attention spend checks,
- context slot capacity and replacement checks,
- map node reveal and route-state checks,
- proposal schema validation,
- resource decision generation,
- trace and session lesson creation,
- existing allowance/rule/receipt logic where money-like resources are involved,
- LLM client behavior with mocked fetch/relay responses,
- platform fallback behavior for Nimiq Mini App detection.

These tests should not import Phaser.

Current runner: **Vitest**, because it fits Vite and ES modules with low setup cost.

### Build Checks

Use `npm run build` to verify:

- Vite can bundle the app,
- imports resolve,
- map assets and static paths resolve,
- API keys are not accidentally referenced from bundled client code,
- syntax and module errors are caught before browser testing.

Run this for any source-code change unless the change is documentation-only.

### Browser Smoke Checks

Use a browser smoke check when scene rendering, UI overlays, input, Phaser asset loading, or map tooling changes.

Minimum smoke checks:

- app loads without console errors,
- first scene appears,
- map or placeholder map is visible,
- Bot Attention and Nimiq Pocket meters are readable,
- basic interaction can trigger the current feature slice,
- local browser fallback works when Nimiq Pay providers are unavailable,
- LLM offline/mock fallback state is readable if no relay/API key is configured.

Recommended future tool: **Playwright**. It can verify local Vite builds and capture screenshots for visual sanity checks.

### LLM Checks

Use mocked LLM checks for automated tests. Avoid live API calls in normal unit tests.

Minimum checks:

- valid structured proposal is accepted,
- malformed proposal is rejected,
- proposal with unknown move type is rejected,
- proposal with missing resource cost is rejected,
- proposal cannot request unchecked payment, checkout, or wallet authority,
- browser client calls only the backend relay,
- relay reads model id and API key from environment,
- offline/mock mode works without a provider key.

Live LLM checks may be manual or smoke checks when explicitly planned. Report model id, prompt shape, pass/fail result, and approximate token/cost risk if run.

### Nimiq Mini App Checks

Use Mini App checks when app-shell behavior, provider detection, localization, wallet-boundary messaging, testnet status, or pocket top-up behavior changes.

Minimum checks:

- app can still run through `npm run dev -- --host` or an equivalent Vite network host command,
- opening outside Nimiq Pay shows a safe local mode,
- testnet mode is visually distinct when available,
- no Phase 1 UI control can trigger mainnet operations,
- no broad wallet authority is granted to the bot,
- when a Nimiq Pay device/emulator path is available, the app can be opened as a Mini App and still reaches the Pocket Bot map scene.

If a Nimiq Pay device/emulator check is not performed, report it as skipped with the reason.

### Manual Acceptance Checks

Use manual checks for early Phaser interactions that are not yet worth automating.

Manual checks must be concrete, for example:

- start dev server,
- open the local app,
- request a bot move proposal,
- approve an inspect move,
- confirm Bot Attention decreases,
- confirm a fogged node reveals information,
- correct the bot toward a cheaper/safer route,
- confirm the later proposal references the session lesson,
- confirm a trace card records the move and lesson.

Avoid vague manual checks such as "looks good."

## Phase 1 Test Coverage Plan

### PB-001 Domain Rule Decision

Status: implemented from the earlier allowance-control cut.

Keep tests as regression coverage for future money gates.

### PB-002 Receipt Creation

Status: implemented from the earlier allowance-control cut.

Keep tests as regression coverage for spend-like trace cards.

### PB-003 Allowance Spend Execution

Status: implemented from the earlier allowance-control cut.

Keep tests as regression coverage for the Nimiq Pocket resource.

### PB-004 Pocket Bot Workshop Scene Shell

Status: implemented from the earlier allowance-control cut.

Keep build and browser checks as baseline scene smoke coverage.

### PB-005 RPG Map Tooling And Scene Direction

Expected checks:

- selected map workflow is documented,
- `npm run build` passes after dependency/config changes,
- browser opens the app,
- scene renders map or map placeholder,
- local fallback remains readable.

### PB-006 Core Resource Model

Expected automated tests:

- Bot Attention starts at the scenario budget,
- legal moves spend the expected attention,
- invalid spends cannot make attention negative,
- context slots enforce capacity,
- Nimiq Pocket and Bot Attention are represented separately.

### PB-007 LLM Route Proposal Bridge

Expected automated tests:

- valid structured move proposal is accepted,
- malformed/unsafe proposals are rejected,
- client calls backend relay only,
- relay uses environment configuration,
- mock/offline fallback works.

Expected manual or smoke checks:

- user can request a bot proposal,
- no API key appears in browser-visible configuration,
- failure state is readable when no relay/API key is configured.

### PB-008 Lossy Map Scenario

Expected automated tests:

- unrevealed nodes hide assumptions,
- inspect reveals a clue at attention cost,
- skip preserves attention and uncertainty,
- act commits to route state,
- map state serializes into LLM prompt context.

Expected checks:

- map, fog/uncertainty, route nodes, and goal are visible.

### PB-009 User-Bot Guidance Loop

Expected automated tests:

- approved inspect move spends Bot Attention and reveals state,
- redirect updates pending move without spending original cost,
- ask-user actions are represented as user attention prompts,
- illegal moves are blocked before resource state changes,
- trace is appended after each accepted action.

Expected checks:

- user can approve, redirect, or correct a proposal,
- HUD and map update after accepted move.

### PB-010 Session Lesson Application

Expected automated tests:

- user correction creates a session lesson trace,
- session lesson is included in next LLM prompt context,
- lesson is not persisted beyond reset/reload.

Expected checks:

- later bot proposal visibly reflects the session lesson.

### PB-011 Trace Cards

Expected automated tests:

- trace card records proposal, accepted move, resource costs, map result, and lesson fields,
- trace history order is stable,
- money-like actions can reference existing receipt data.

Expected checks:

- latest trace can be inspected,
- trace content is readable.

### PB-012 Nimiq Testnet Pocket

Expected automated tests:

- local fallback is safe and readable,
- testnet status is separate from mainnet behavior,
- no uncontrolled sign/send/payment action is reachable through resource rules,
- Nimiq Pocket display remains separate from Bot Attention.

Expected checks:

- Nimiq Pay testnet manual check is performed or explicitly skipped,
- testnet/local mode wording is clear.

## Recommended Test Tooling Roadmap

Add more tooling only when an implementation slice needs it.

1. Keep `tests/domain/` for resource rules, map state, traces, allowance, and receipts.
2. Add `tests/llm/` for schemas, prompt-context shaping, client behavior, and mocked relay behavior.
3. Keep `npm run build` as the required integration check.
4. Add Playwright when Phaser scene behavior needs repeatable browser verification.
5. Add CI only after local tests and build are stable.

Suggested future structure:

```text
tests/
  domain/
    allowance.test.js
    attention.test.js
    contextSlots.test.js
    lossyMap.test.js
    resourceRules.test.js
    traces.test.js
    rules.test.js
    receipts.test.js
  llm/
    routeProposalSchema.test.js
    routeProposalClient.test.js
  platform/
    nimiqMiniApp.test.js
    openaiRelay.test.js
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

## Definition Of Tested For Phase 1

Phase 1 should be considered tested enough for the first milestone when:

- resource rules have unit coverage,
- LLM proposal schemas have unit coverage,
- trace creation has unit coverage,
- existing allowance/receipt tests still pass,
- `npm run build` passes,
- the first scene has at least one browser smoke check,
- Mini App/testnet compatibility has at least one documented check or skipped check with reason,
- manual acceptance checks cover the goal -> lossy map -> LLM proposal -> user guidance -> attention spend -> reveal/outcome -> trace -> session lesson loop,
- no mainnet wallet spend, checkout, x402, persistent memory, real paid external service, or autonomous spending is reachable in Phase 1.
