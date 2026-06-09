# Test Strategy

Pocket Bot should use a practical test-driven approach: test resource rules, LLM proposal validation, map state, trace behavior, residue carry-forward, and landfall status with fast unit tests, then use build and browser checks to verify Phaser integration.

The first goal is not broad test coverage. The first goal is to keep the core resource-judgment and source-navigation teaching behavior testable outside Phaser scenes.

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
- Treat interaction checks as first-class for scene, UI, control, map navigation, resource meters, trace inspection, and final-run status.
- LLM output must be schema-validated before it can affect game state.
- The LLM may propose moves, but deterministic resource rules decide legality and cost.
- Proposals should be tested as compressed path sets: they must name cost, considered alternatives, cut price, remaining residue, and stop condition.
- Map-node tests should distinguish revealed information from residue that remains unresolved.
- Trace tests should prove that residue carries into the next proposal context when relevant.
- Goal arrival should not automatically count as success; tests must distinguish safe finish, partial finish, false finish, and open run.
- Accepted moves should be testable as runtime cycles: before-state, proposed move, deterministic rule result, after-state, transition classification, carrier update, and residue.
- Expected map/resource deltas are evidence, not success; finish tests must prove the final judgment checks protected outcomes and remaining residue before `safe_finish`.
- Player-facing UI should use the game glossary from `docs/planning/mvp_implementation_plan.md`; CRPM terms should remain internal scaffolding unless a debug/dev surface explicitly asks for them.
- UI copy, LLM response rendering, and trace summaries must not say "done", "solved", or "safe" unless the final status check has classified the run as `safe_finish`.

## Two Test Tracks

### Logic Tests, No User Interaction

Use these tests for behavior that can run without a browser, Phaser scene, pointer input, keyboard input, visual inspection, or live LLM call.

Primary targets:

- Bot Attention budget and spend rules,
- Nimiq Pocket / allowance math,
- Context Capacity slots,
- run session / scenario contract validation,
- move transition gate classification,
- run carrier updates,
- lossy map reveal state,
- route/action proposal validation,
- deterministic resource checks,
- residue and cut-price handling,
- session lesson creation,
- trace card creation,
- final landfall / partial / false-finish classification,
- finish judgment packet creation,
- LLM route proposal schema validation,
- relay/client behavior using mocks.

Current runner: **Vitest**.

### Interaction Tests And Checks

Use these checks for behavior where the product only works if the user can understand or control what is happening in the interface.

Primary targets:

- user can see the lossy map and current goal,
- user can see Bot Attention, Nimiq Pocket, User Attention prompts, and Context Capacity,
- user can request or receive a bot route proposal,
- user can inspect why the bot chose a route,
- user can see what remains unknown before approving,
- user can approve, redirect, correct, inspect first, or mark partial finish,
- player-facing controls use game terms such as inspect, ask, remember, skip, act, partial finish, safe finish, and remaining unknown,
- accepted moves visibly spend Bot Attention,
- inspect actions reveal hidden information while leaving some uncertainty when appropriate,
- skipped nodes preserve uncertainty as residue,
- session lessons are visible and applied later in the run,
- trace cards appear where the user expects them,
- trace cards make revealed information, remaining residue, and re-entry notes readable,
- trace cards visibly bind action, cost, reveal, residue, and lesson,
- Nimiq is not reduced to coin collecting; pocket value remains connected to control, attention, and trace,
- testnet/local Nimiq pocket mode is clear and low-stakes.

Until browser automation exists, interaction checks may be manual or browser-smoke checks. Each check must include a concrete user action and an observable result.

## Test Layers

### Unit Tests

Use unit tests for plain JavaScript modules under `src/domain/`, `src/llm/`, and narrow platform adapters.

Primary targets:

- attention spend checks,
- context slot capacity and replacement checks,
- map node reveal and route-state checks,
- false-landfall and partial-finish classification,
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
- Context Capacity / carrier slots are visible when implemented,
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
- proposal with missing considered alternative, cut price, residue, or stop condition is rejected,
- proposal cannot request unchecked payment, checkout, or wallet authority,
- full resource-map route-proposal fixture, including pocket and false-finish nodes, does not produce unsafe authority language in reason, alternatives, cut price, or stop condition,
- proposal cannot claim that its chosen route proves the whole terrain,
- proposal cannot render `safe_finish` wording unless the deterministic finish check has assigned that status,
- browser client calls only the backend relay,
- relay reads model id and API key from environment,
- offline/mock mode works without a provider key.

Live LLM checks may be manual or smoke checks when explicitly planned. Report model id, prompt shape, pass/fail result, and approximate token/cost risk if run.

Regression note from the June 6, 2026 Vercel smoke: a broad production payload reached the server-side OpenAI relay correctly, but validation rejected model wording in `considered_alternatives.3.why_not_selected` as unsafe authority language. Before wiring live route proposals into the playable scene, add an automated full-scenario prompt/relay regression that covers the pocket node, false-finish node, session lesson, and residue carry-forward. The expected result is either a valid bounded proposal or a deterministic validation error that is surfaced readably; the model must not mention wallet authority, checkout, payment execution, mainnet spend, private keys, persistent memory, external tools, or unbounded actions anywhere in proposal text.

### Nimiq Mini App Checks

Use Mini App checks when app-shell behavior, provider detection, localization, wallet-boundary messaging, testnet status, or pocket top-up behavior changes.

Minimum checks:

- app can still run through `npm run dev -- --host` or an equivalent Vite network host command,
- opening outside Nimiq Pay shows a safe local mode,
- testnet mode is visually distinct when available,
- no Phase 1 UI control can trigger mainnet operations,
- no broad wallet authority is granted to the bot,
- NIM/USDT support path is implemented or competition submission readiness is explicitly marked blocked,
- Nimiq Pocket remains visually separate from Bot Attention,
- when a Nimiq Pay device/emulator path is available, the app can be opened as a Mini App and still reaches the Pocket Bot map scene.

If a Nimiq Pay device/emulator check is not performed, report it as skipped with the reason.

### Competition Delivery Checks

Use these checks before treating the app as competition-ready. They are a
delivery floor, not a replacement for the CRPM/resource-judgment behavior tests.

Minimum checks:

- app is usable by a new user on first try,
- first-use path can reach the core loop in about 60 seconds,
- mobile viewport is readable and touch-friendly,
- public repo, MIT license, and source attribution are current,
- no private keys, API secrets, seeds, or sensitive credentials are present,
- Mini App Framework path is documented and tested or explicitly blocked,
- NIM/USDT support path is documented and implemented or explicitly blocked,
- `docs/product/competition_scorecard.md` reflects pass/blocked/unknown status and does not mark overall ready while required items are blocked or unknown,
- README/submission description explains what the app does, who it is for, and how it uses Nimiq Pay,
- screenshots, demo video, generated assets, fonts, icons, and copied examples are attributed when used,
- at least 3 external testers have tried the judge path before final submission, unless explicitly skipped,
- at least one feedback-driven improvement is recorded when entering a competition cycle,
- early-access/community feedback tasks are tracked if entering a competition cycle.

### Manual Acceptance Checks

Use manual checks for early Phaser interactions that are not yet worth automating.

Manual checks must be concrete, for example:

- start dev server,
- open the local app,
- request a bot move proposal,
- inspect why the bot proposes this route,
- inspect what remains unknown,
- approve an inspect move,
- confirm Bot Attention decreases,
- confirm a fogged node reveals information,
- confirm skipped or unresolved information remains visible as residue,
- correct the bot toward a cheaper/safer route,
- confirm the later proposal references the session lesson,
- confirm a trace card records and binds the move, cost, reveal, residue, and lesson,
- confirm final run status distinguishes safe finish, partial finish, false finish, or open run,
- confirm UI copy does not reduce Nimiq to coin collecting or crypto branding only,
- confirm player-facing UI does not expose CRPM jargon such as source ocean, cut, protected family, landfall, or re-entry in the normal play surface.

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

Status: implemented with a Phaser-native custom node-map scaffold.

Expected checks:

- selected map workflow is documented,
- NimiRun V2 asset manifest points at committed public asset files,
- map workflow can represent fog/revealed state,
- map workflow can attach hidden pressure / residue metadata to nodes without overcomplicating art production,
- `npm run test` covers the scene-independent map scaffold,
- `npm run build` passes,
- browser opens the app,
- scene renders map or map placeholder,
- local fallback remains readable.

### PB-006 Core Resource Model

Status: implemented.

Expected automated tests:

- Bot Attention starts at the scenario budget,
- legal moves spend the expected attention,
- invalid spends cannot make attention negative,
- context slots enforce capacity,
- remembering a clue or residue fails or requires replacement when slots are full,
- replacement distinguishes safely trace-backed residue from dangerously lost context,
- Nimiq Pocket and Bot Attention are represented separately.

### PB-006A Run Session And Transition Runtime

Status: implemented.

Expected automated tests:

- scenario contract validates goal, allowed moves, resource budgets, protected outcomes, and stop conditions,
- run session starts only from a valid scenario contract,
- accepted move creates a transition gate with before-state, proposal, deterministic rule result, and expected evidence,
- transition gate remains pending until after-state is attached and classified,
- `expected_reveal` updates the run carrier but cannot mark the run as safe finish by itself,
- `no_effect`, `wrong_route`, `risk_boundary`, `unreadable_state`, and `repair_needed` carry explicit residue,
- run carrier serializes compactly for the next LLM prompt,
- finish judgment packet distinguishes safe finish, partial finish, false finish, and open run from protected outcomes and residue.

### PB-007 LLM Route Proposal Bridge

Status: implemented, including PB-007R full-scenario unsafe-authority relay regression coverage.

Expected automated tests:

- valid structured move proposal is accepted,
- malformed/unsafe proposals are rejected,
- missing cost, considered alternatives, cut price, residue, or stop condition is rejected,
- unbounded payment/tool/wallet requests are rejected,
- full resource-map prompt fixture with pocket and false-finish nodes stays inside the unsafe-authority wording guard,
- proposal cannot claim full terrain certainty from one route choice,
- proposal prompt uses the run carrier rather than hidden scene state,
- client calls backend relay only,
- relay uses environment configuration,
- Vercel function uses the same route proposal relay and falls back to mock without a key,
- mock/offline fallback works.

Expected manual or smoke checks:

- user can request a bot proposal,
- proposal displays reason, resource cost, considered alternative, and remaining unknown,
- no API key appears in browser-visible configuration,
- production relay smoke with the full scenario reports whether validation accepted the proposal or blocked unsafe wording, and the browser shows only same-origin `/api/route-proposal` traffic,
- failure state is readable when no relay/API key is configured.

Implemented regression coverage:

- mocked full-scenario relay test includes pocket, false-finish, trace-card, session-lesson, and residue context,
- accepted mocked output validates as a bounded proposal,
- unsafe authority wording in a considered alternative returns a readable relay validation error,
- prompt boundary tests prevent reintroducing exact unsafe output phrases into the system instruction.

### PB-008 Lossy Map Scenario

Status: implemented.

Expected automated tests:

- unrevealed nodes hide assumptions,
- inspect reveals a clue at attention cost,
- inspect records remaining unknowns when not everything is settled,
- skip preserves attention and carries uncertainty as residue,
- act commits to route state,
- acting through a false-landfall trap cannot mark the run as safe finish,
- map state serializes into LLM prompt context with revealed information and residue.

Expected checks:

- map, fog/uncertainty, route nodes, clue nodes, and goal are visible,
- at least one node makes a tempting shortcut legible,
- at least one node can demonstrate partial finish or false finish.

### PB-009 User-Bot Guidance Loop

Status: implemented.

Expected automated tests:

- approved inspect move spends Bot Attention and reveals state,
- redirect updates pending move without spending original cost,
- ask-user actions are represented as user attention prompts,
- asking why-this-route exposes the proposal rationale and considered alternative,
- asking what-remains-unknown exposes the proposal residue,
- inspect-first redirection changes an action proposal into a probe proposal when allowed,
- mark-partial records that a useful subgoal is not full success,
- illegal moves are blocked before resource state changes,
- trace is appended after each accepted action.

Expected checks:

- user can approve, redirect, correct, ask why, inspect what remains unknown, inspect first, or mark partial,
- HUD and map update after accepted move,
- user can feel that guidance changes later bot behavior.

### PB-010 Session Lesson Application

Status: implemented.

Expected automated tests:

- user correction creates a session lesson trace,
- session lesson is included in next LLM prompt context,
- cut-preference lesson can change inspect-before-act ordering,
- residue-rule lesson can require the next proposal to preserve remaining unknowns,
- stop-condition lesson can block premature full-success claims,
- lesson is not persisted beyond reset/reload.

Expected checks:

- later bot proposal visibly reflects the session lesson,
- UI wording does not claim durable training.

### PB-011 Trace Cards

Status: implemented.

Expected automated tests:

- trace card records proposal, accepted move, resource costs, map result, and lesson fields,
- trace card distinguishes revealed information from suppressed/not-checked information,
- trace card records residue carried forward,
- trace history order is stable,
- money-like actions can reference existing receipt data,
- final run trace can distinguish safe finish, partial finish, false finish, and open run,
- trace summary wording cannot overclaim safe completion when the final status is partial, false, open, or not evaluated.

Expected checks:

- latest trace can be inspected,
- trace content is readable,
- trace card binds action, resource cost, revealed information, remaining unknown, and lesson in one recoverable record,
- user can reconstruct why the bot acted and what remains unknown.

### PB-012 Nimiq Testnet Pocket

Status: implemented for local fallback and explicit Nimiq Pay NIM status checks. Android emulator Nimiq Pay Testnet verification was performed on June 7, 2026.

Expected automated tests:

- local fallback is safe and readable,
- testnet status is separate from mainnet behavior,
- no uncontrolled sign/send/payment action is reachable through resource rules,
- Nimiq Pocket display remains separate from Bot Attention,
- pocket/recharge trace cards distinguish value top-up from bot navigation moves.
- trace panel labels pocket value as pocket status rather than move cost.

Expected checks:

- Nimiq Pay testnet manual check is performed or explicitly skipped,
- testnet/local mode wording is clear,
- Nimiq Pocket never appears to grant broad bot authority.

Implemented checks:

- `tests/platform/nimiqMiniApp.test.js` covers local fallback, explicit provider init/status, provider errors, and no sign/send calls.
- `tests/domain/traces.test.js` covers pocket-status trace cards with zero Bot Attention spend.
- `tests/ui/resourceMeters.test.js` covers local/testnet pocket meter wording.
- `tests/ui/tracePanel.test.js` covers pocket trace display wording.
- Browser smoke on June 6, 2026 loaded `http://127.0.0.1:8080/?pb012-smoke=1`, rendered one canvas, showed the `Check` pocket control, and reported no runtime/log/network errors or DOM key leak.
- Android emulator Nimiq Pay check on June 7, 2026 used the Play Store Nimiq Pay app forced to Testnet through the hidden dev menu, loaded `http://10.0.2.2:8080/?pb012-pay=1` through Mini Apps, connected the local app, and confirmed the Pocket Bot scene rendered inside Nimiq Pay.
- The June 7 emulator check confirmed the `Check` action created a pocket-status trace with one connected Nimiq account and a provider block height, while the trace still stated no NIM send, sign, checkout, or mainnet authority was requested.
- Log review after the June 7 provider check found no `AndroidRuntime` crash, `am_crash`, sign/send/checkout call, transaction prompt, or mainnet error.

### PB-013 Market Signal Scout Witness-Governed Vertical Slice

Status: implemented as Golden Signal foundation; manual/mobile submission
polish remains in PB-POLISH.

Implemented automated tests:

- Golden Signal scenario loads with starting Bot Attention, Context Slots, and
  Pocket Spark / pocket-status capacity,
- bundled Binance BTCUSDT fixture declares source URL, license name, license
  evidence URL, retrieval date, source archive/checksum reference, venue-scope
  residue, interval, covered range, raw-vs-transformed shipping status, and
  transformed/static status,
- fixture metadata rejects vague provenance, global BTC index claims, live
  trading rules, investment advice, reward-replay claims, or missing
  `doesNotEstablish` boundaries,
- headline witness cards include source headline/title, source URL, and
  mechanics connector text,
- witness ledger boundary stays static, non-trading, non-reward-bearing, and
  hidden from proposal-only state where required,
- terminal reveal, hindsight-only fields, and later level outcomes are not
  available to proposal generation before finish,
- support, exit friction, and FOMO pressure start hidden or residualized,
- ask-unknowns names support, exit, and FOMO residue,
- inspect support spends Bot Attention and records revealed clue plus remaining
  residue,
- entering/acting with hidden support or exit friction produces false finish,
- explicitly named but unresolved uncertainty can produce partial finish without
  a false-safe claim,
- simulated gain cannot by itself produce safe finish,
- trace cards record level, action, cost, reveal, still unknown, and lesson,
- remembering "Fast signals need support" changes the next proposal inside the
  active run only,
- proposal validation rejects live-trading, wallet-authority,
  brokerage/exchange execution, portfolio advice, persistent strategy export,
  real reward/penalty, and terminal-reveal leakage claims.

Expected manual checks:

- first run can be completed in about 60 seconds on a mobile-sized viewport,
- at least one real headline/title is visible as a historic witness and paired
  with a plain in-game connector such as event pressure, exit pressure, or FOMO
  pressure,
- player-facing UI says signal, support, exit, FOMO, still unknown, trace, and
  finish instead of CRPM terms,
- Pocket Spark / Nimiq Pocket wording does not read as a trading balance or NIM
  cost to enter a trade,
- final status is safe, partial, false, or open and is recoverable from the
  trace card,
- Nimiq Pay/local fallback behavior remains unchanged unless the platform
  adapter is intentionally touched.

### PB-012A Desktop/Mobile Browser TestAlbatross Status

Status: postponed until after the Android/Nimiq Pay submission path is stable.
This covers the normal hosted-web-app path for Windows, Android browser, and
iPhone browser. It does not replace the Nimiq Pay Mini App provider
verification.

Expected automated tests:

- runtime selection prefers Nimiq Pay provider when present,
- desktop/mobile browser TestAlbatross status is used when Nimiq Pay is absent
  and the Web Client adapter is enabled,
- local fallback is used when neither Nimiq Pay nor Web Client status is
  available,
- Web Client factory/client behavior is mocked so unit tests do not require
  live consensus,
- Web Client timeout/error paths return readable fallback status,
- no private-key, mnemonic, sign, send, checkout, or broadcast method is called
  or exposed,
- pocket-status trace cards remain separate from Bot Attention spend.

Expected manual checks:

- Windows Chrome or Edge can open the local/hosted app and show read-only
  TestAlbatross status,
- unsupported desktop/mobile browsers remain playable with local fallback,
- Nimiq Pay provider behavior still works or remains explicitly marked pending
  for device/emulator verification,
- UI distinguishes Nimiq Pay testnet status, desktop/mobile browser
  TestAlbatross status, and local fallback clearly enough for first-contact
  players.

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
- run-session / transition-gate / carrier / finish-judgment behavior has unit coverage,
- lossy-map reveal / residue behavior has unit coverage,
- trace creation and residue carry-forward have unit coverage,
- existing allowance/receipt tests still pass,
- `npm run build` passes,
- the first scene has at least one browser smoke check,
- Mini App/testnet compatibility has at least one documented check or skipped check with reason,
- competition delivery checks have no unresolved blocker if the app is being submitted,
- competition scorecard is current if the app is being submitted,
- manual acceptance checks cover the goal -> lossy map -> LLM proposal -> user guidance -> attention spend -> reveal/outcome -> trace -> session lesson loop,
- manual acceptance checks include at least one inspect-first correction and one visible remaining-unknown/residue case,
- final status can distinguish safe finish, partial finish, false finish, and open run,
- normal player-facing UI uses the game glossary rather than raw CRPM terms.

## PB-POLISH-001 Checks

Golden Signal polish must verify:

- the HUD shows a compact historical witness cue without trading instructions,
- selecting or inspecting Support Check / Futures Gate can reveal a witness card
  with source headline/title, mechanics connector, source provider, and an
  explicit "not trading advice" boundary,
- the 60-second path remains usable on a phone-sized viewport:
  Unknowns -> Support Check -> Approve -> trace/witness reveal,
- high-density Nimiq Pay WebViews are classified as phone portrait surfaces
  rather than desktop canvases,
- trace archive remains reachable after the witness card is shown,
- Vercel deployment usage is documented for hosted browser and Nimiq Pay
  emulator/device checks,
- no Mini App provider, NIM status, sign/send, or mainnet boundary changes are
  introduced unless the platform adapter is intentionally changed.

Verification on June 8, 2026:

- local browser desktop smoke check rendered the Golden Signal scene with no
  console errors,
- browser phone viewport `390x844` completed Support Check selection,
  approval, Historic Witness reveal, and Trace Archive opening,
- Android emulator Nimiq Pay Testnet opened the local Mini App through the
  Mini Apps menu and `10.0.2.2` recent entry, rendered the phone-portrait
  layout, selected Support Check, approved inspection, and showed the Historic
  Witness card with attention reduced to `8/10`,
- no sign, send, payment, checkout, top-up, or mainnet action was triggered.

## PB-POLISH-002 Checks

Hosted submission verification must not be inferred from the local Mini App
check. It must verify:

- the active Production Vercel URL is recorded in the deployment doc and
  competition scorecard: `https://nimi-run-code-repo.vercel.app`,
- the hosted app opens in a normal browser and renders the Golden Signal scene,
- same-origin `/api/route-proposal` works in the hosted environment without
  exposing provider keys; invalid or unsafe OpenAI output must degrade to a
  deterministic mock-fallback proposal rather than breaking the hosted app,
- the hosted URL opens inside Nimiq Pay Mini Apps on an emulator or real phone,
- the 60-second judge path works inside Nimiq Pay:
  Support Check -> Approve -> Historic Witness -> Trace Archive,
- the Mini App shell does not trigger sign, send, payment, checkout, top-up, or
  mainnet authority,
- if hosted verification is skipped or blocked, the reason is recorded before
  submission readiness is claimed.

June 9, 2026 hosted check result:

- `https://nimi-run-code-repo.vercel.app` opened inside Nimiq Pay, but the
  hosted build rendered a desktop-centered canvas strip instead of the
  phone-portrait layout,
- hosted `/api/route-proposal` returned `502` when OpenAI output failed
  deterministic proposal validation,
- local fixes now sync the deployed stylesheet, preserve Mini App WebView
  aspect ratio through `visualViewport` / document / screen fallbacks, and make
  invalid OpenAI output fall back to a deterministic mock proposal,
- local browser smoke after the WebView-metric fix confirmed a phone viewport
  initializes a 390x844 Phaser canvas instead of a 1024x768 desktop canvas,
- repeat the hosted Nimiq Pay check after redeploy and keep this blocked until
  the public URL passes inside the Mini App shell.
