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
- Market Signal Scout market-world contract validation and layered arena-spine
  action mapping,
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
- full resource-map route-proposal fixture, including pocket and false-finish
  nodes, does not accept chosen moves that request unsafe authority,
- recoverable boundary mentions in rejected alternatives are normalized with
  governance warnings rather than forcing mock fallback,
- active unsafe authority wording remains a hard failure when it only uses
  soft contrast phrases such as "instead of" or "rather than",
- proposal overclaims that its chosen route proves the whole terrain are
  normalized before rendering,
- proposal `safe_finish` or full-success wording before deterministic finish
  judgment is normalized before rendering,
- browser client calls only the backend relay,
- relay reads model id and API key from environment,
- offline/mock mode works without a provider key.

Live LLM checks may be manual or smoke checks when explicitly planned. Report model id, prompt shape, pass/fail result, and approximate token/cost risk if run.

Regression note from the June 6, 2026 Vercel smoke: a broad production payload reached the server-side OpenAI relay correctly, but validation rejected model wording in `considered_alternatives.3.why_not_selected` as unsafe authority language. The current governance split is: malformed schema, unknown moves/targets, missing cost/residue fields, and chosen moves that request wallet/payment/trading/tool authority remain hard failures; recoverable overconfident or boundary wording is normalized with `governanceWarnings` so a bounded proposal can still reach gameplay.

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
- malformed proposals and chosen unsafe-authority proposals are rejected,
- missing cost, considered alternatives, cut price, residue, or stop condition is rejected,
- unbounded payment/tool/wallet requests are rejected,
- full resource-map prompt fixture with pocket and false-finish nodes stays inside the unsafe-authority wording guard,
- recoverable boundary wording in rejected alternatives is normalized,
- proposal cannot render full terrain certainty or premature final-success
  claims; those phrases are normalized with governance warnings,
- proposal prompt uses the run carrier rather than hidden scene state,
- client calls backend relay only,
- relay uses environment configuration,
- Vercel function uses the same route proposal relay and falls back to mock without a key,
- game runtime builds a compact relay payload from guidance state and normalizes
  relay proposal costs back to deterministic scenario costs,
- pending `ask` proposals can be approved without requiring a node-local
  `possibleMoves.ask`,
- mock/offline fallback works.

Expected manual or smoke checks:

- user can tap `Ask Bot` in the proposal panel and receive a relay or mock
  proposal in the playable scene,
- proposal displays reason, resource cost, considered alternative, and remaining unknown,
- no Bot Attention, Nimiq Pocket, or wallet authority is spent by requesting the
  proposal; spending happens only after `Approve`,
- no API key appears in browser-visible configuration,
- production relay smoke with the full scenario reports whether validation accepted the proposal or blocked unsafe wording, and the browser shows only same-origin `/api/route-proposal` traffic,
- failure state is readable when no relay/API key is configured.

Implemented regression coverage:

- mocked full-scenario relay test includes pocket, false-finish, trace-card, session-lesson, and residue context,
- accepted mocked output validates as a bounded proposal,
- blocked-boundary wording in a considered alternative normalizes without mock
  fallback,
- chosen unsafe-authority wording returns a readable relay validation error and
  mock fallback,
- active unsafe-authority wording with soft contrast language stays rejected
  while explicit boundary cautions can normalize,
- `tests/game/routeProposalRuntime.test.js` covers compact guidance-state
  payload creation, deterministic cost normalization, and unsupported move
  adjustment before a proposal reaches the playable scene,
- local 390x844 browser smoke after scene wiring tapped `Ask Bot`, received a
  mock fallback proposal (`inspect -> Bright Signal`), kept Bot Attention at
  `10/10`, created no trace card before approval, and produced no browser
  errors.
- prompt boundary tests prevent reintroducing exact unsafe output phrases into the system instruction.

Later governance tests should cover typed warning objects, tri-state validation
status, transition-packet derivation, warning carry-forward into trace cards,
finish evidence packets, and deterministic runtime-cost override warnings.

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
- proposal validation rejects actual live-trading, wallet-authority,
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

### PB-014 Market World Runtime Seed

Status: implemented as the current gameplay-spine runtime layer. This slice
made `src/game/scenarios/marketWorldLevels.js` the active Golden Signal level
contract through an adapter-first runtime transition while preserving the
verified Golden Signal regression paths.

Baseline freeze status: implemented in
`tests/game/goldenSignalPlayableBaseline.test.js`. The test freezes
`Ask Hidden -> Wide Scan -> Approve -> Trace`, `Support Check -> Approve ->
Historic Witness -> Trace Archive`, and `Ask Bot -> bounded proposal ->
Approve` as regression paths before relation-state mutation is introduced.

Adapter status: implemented in `src/game/scenarios/marketWorldLevelAdapter.js`
with coverage in `tests/game/marketWorldLevelAdapter.test.js`. The adapter
initializes Golden Signal from `getGoldenSignalMarketWorldLevel()`, exposes the
current first-slice arena actions, preserves the Support Check regression path,
and keeps hindsight/terminal reveal data out of proposal context.

Relation-state mutation status: implemented in
`src/domain/marketWorldRuntime.js` with coverage in
`tests/domain/marketWorldRuntime.test.js`, `tests/domain/guidanceLoop.test.js`,
and `tests/game/routeProposalRuntime.test.js`. Ask Hidden residualizes named
unknowns without spending Bot Attention; Wide Scan, Check Exit, Support Check,
and Approve Enter mutate signal-crowd, signal-exit, signal-support, and
signal-event relation state on approval. Route-proposal context includes the
current relation-state snapshot and still excludes hindsight/terminal reveal
fields.

Relation-derived finish judgment status: implemented in
`src/domain/marketWorldRuntime.js` with guidance-loop coverage in
`tests/domain/guidanceLoop.test.js`. Direct bright-signal entry becomes a
relation-derived false finish when support, exit, and crowd pressure were
hidden; entry after named residue or partial checks becomes partial finish;
entry after support, exit, and crowd are checked becomes safe finish; and
non-finish scout moves remain open-run.

Finish-card display status: implemented in `src/ui/tracePanel.js` and
`src/scenes/PocketBotWorkshop.js` with coverage in
`tests/ui/tracePanel.test.js` and
`tests/game/goldenSignalPlayableBaseline.test.js`. Open traces do not unlock a
finish card; false/partial/safe finish traces can render a player-facing finish
card; and the market-world hindsight card is available only after finish. The
PB-014 phone-readability polish slice is also covered: trace cards translate
relation IDs into player-facing labels, show checked relation, still-hidden
residue, return condition, and witness count, serialize the same relation
metadata into proposal context, and keep finish-card copy compact enough for
phone portrait. Hosted/Nimiq Pay screenshot and final-media regression checks
remain part of PB-POLISH.

June 23, 2026 local browser smoke after the trace/finish polish used a
390x844 phone canvas and completed `Approve`, `Support -> Approve`, and
`Ask Hidden -> Wide Scan -> Approve` without console warnings or errors. This
was a local interaction smoke, not a hosted/Nimiq Pay media capture.

Expected automated tests:

- market-world adapter initializes the Golden Signal arena from
  `getGoldenSignalMarketWorldLevel()`,
- adapter exposes only legal first-slice arena actions: Ask Hidden, Wide Scan,
  Check Exit, Support Check, and Approve Enter,
- opening relation state hides support, exit, event, and crowd pressure while
  making the bright signal visible,
- `Ask Hidden` exposes support, exit, and crowd/FOMO unknowns without spending
  Bot Attention,
- `Wide Scan` prepares a crowd/FOMO inspection and does not spend until
  `Approve`,
- approving `Wide Scan` spends Bot Attention, reveals or residualizes the
  crowd relation, and creates a trace,
- `Check Exit` prepares an exit-friction inspection and does not spend until
  `Approve`,
- approving `Check Exit` spends Bot Attention, reveals or residualizes exit
  friction, and creates a trace,
- `Support Check` still follows the verified historic-witness judge path,
- `Approve Enter` with unchecked support, exit, or crowd pressure creates
  false or partial finish pressure instead of safe finish,
- trace cards include world relation revealed, still unknown, residue carried
  forward, return condition, and any historic witness reference,
- finish judgment derives safe, partial, false, or open status from relation
  state,
- hindsight-only fields remain unavailable before finish,
- player-facing action labels contain no CRPM jargon,
- `Ask Bot` remains bounded to legal moves and does not gain live-market,
  trading, wallet, reward, or persistent-strategy authority.

Expected manual checks:

- phone portrait smoke for `Ask Hidden -> Wide Scan -> Approve -> Trace`,
- phone portrait smoke for `Support Check -> Approve -> Historic Witness ->
  Trace Archive`,
- entering too early creates visible false/partial pressure rather than a vague
  success,
- trace/hindsight copy explains remaining unknowns in simple game language,
- no live market data, exchange action, NIM trade cost, payment, checkout,
  sign/send, or mainnet prompt appears.

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

### PB-015 Golden Signal World-Affordance Seed

Status: functional implementation complete. The lineage-data, pure render-plan,
and first `PocketBotWorkshop` overlay-integration substeps are implemented.
They are covered by `tests/game/marketWorldLevels.test.js`,
`tests/game/marketWorldLevelAdapter.test.js`,
`tests/game/marketWorldRenderPlan.test.js`, and
`tests/ui/marketWorldAffordanceOverlay.test.js`. Remaining work belongs to the
PB-POLISH lane: visual density/art tuning, hosted/Nimiq Pay regression, and
final manual submission checks.

PB-015 test scope:

- lineage data:
  - Golden Signal level exposes internal `navigationLineage` with source
    window, witness IDs, relation IDs, bundle ID, voyage ID, protected family,
    residue, and reopen conditions,
  - the adapter carries lineage into the runtime seed,
  - lineage is not included in normal player UI or hindsight-free LLM proposal
    context unless a later explicit debug/dev surface requests it.

- render-plan contract:
  - add pure tests for `marketWorldRenderPlan` outside Phaser,
  - opening relation state maps to tempting Golden Signal, hidden or hinted
    support, hidden or hinted exit, visible crowd pressure, visible event gate,
    empty trace memory, and open finish gate,
  - `Ask Hidden` residualized relation state maps to hinted/outlined hidden
    surfaces without Bot Attention spend,
  - approved `Wide Scan` maps the crowd/FOMO surface to revealed/active,
  - approved `Check Exit` maps the exit bridge/fog to revealed/active,
  - approved `Support Check` maps support well/foundation to revealed/stable,
  - false, partial, safe, and open finish states map to distinct arena states.

- scene integration:
  - `PocketBotWorkshop` renders the plan through lightweight overlays, tints,
    rings, fog, labels, or simple asset variants,
  - `marketWorldAffordanceOverlay` maps render-plan states to player-facing
    labels, colors, and node anchors without CRPM implementation terms,
  - the renderer reads state only; guidance-loop and market-world runtime remain
    the authority for legality, Bot Attention spending, relation mutation,
    trace creation, and finish judgment,
  - no final artwork requirement in this slice; simple rendering is enough if
    state changes are readable.

- regression:
  - `Ask Hidden -> Wide Scan -> Approve -> Trace` still works,
  - `Support Check -> Approve -> Historic Witness -> Trace Archive` still
    works,
  - `Ask Bot -> bounded proposal -> Approve` still works,
  - existing Nimiq Pay/local fallback behavior is unchanged,
  - player-facing labels still avoid CRPM jargon,
  - `npm run test` and `npm run build` pass,
  - browser/manual phone-portrait smoke confirms the new overlays do not
    overlap core controls or trace/witness cards.

Verification on June 25, 2026:

- `npm run test -- tests/ui/marketWorldAffordanceOverlay.test.js
  tests/game/marketWorldRenderPlan.test.js` passed,
- `npm run test` passed,
- `npm run build` passed,
- local phone viewport `390x844` rendered the canvas at full phone size with no
  console errors,
- `Ask Hidden -> Wide Scan -> Approve` in phone viewport spent Bot Attention
  only after approval, showed an active crowd-pressure overlay, and surfaced a
  trace/witness panel with no console errors,
- a reload plus `Support -> Approve` phone-viewport smoke kept the canvas live
  and produced no console errors; final screenshot capture timed out in the
  browser automation surface, so this path still wants a human visual pass after
  the next polish deployment.

## PB-POLISH-001 Checks

Golden Signal polish must verify:

- the HUD shows a compact historical witness cue without trading instructions,
- selecting or inspecting Support Check / Futures Gate can reveal a witness card
  with source headline/title, mechanics connector, source provider, and an
  explicit "not trading advice" boundary,
- the arena-spine path remains usable on a phone-sized viewport:
  Ask Hidden -> Wide Scan -> Approve -> trace/witness reveal,
- the original judge path remains usable:
  Support Check -> Approve -> trace/witness reveal,
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
  exposing provider keys; recoverable overclaim wording must normalize, while
  hard-invalid or actual unsafe OpenAI output must degrade to a deterministic
  mock-fallback proposal rather than breaking the hosted app,
- the hosted URL opens inside Nimiq Pay Mini Apps on an emulator or real phone,
- the 60-second judge path works inside Nimiq Pay:
  Support Check -> Approve -> Historic Witness -> Trace Archive,
- the Mini App shell does not trigger sign, send, payment, checkout, top-up, or
  mainnet authority,
- if hosted verification is skipped or blocked, the reason is recorded before
  submission readiness is claimed.

June 9, 2026 hosted check result:

- `https://nimi-run-code-repo.vercel.app` opened inside Nimiq Pay, but the
  first hosted build rendered a desktop-centered canvas strip instead of the
  phone-portrait layout,
- hosted `/api/route-proposal` returned `502` when OpenAI output failed
  deterministic proposal validation,
- local fixes now sync the deployed stylesheet, preserve Mini App WebView
  aspect ratio through `visualViewport` / document / screen fallbacks, and make
  invalid OpenAI output fall back to a deterministic mock proposal while
  normalizing recoverable governance wording,
- local browser smoke after the WebView-metric fix confirmed a phone viewport
  initializes a 390x844 Phaser canvas instead of a 1024x768 desktop canvas,
- after redeploy, the hosted Vercel app served the fixed stylesheet and current
  bundle,
- hosted `/api/route-proposal` returned `200` in live `openai` mode with
  `gpt-5.4-mini`, a bounded `inspect -> support-check` proposal, and one
  governance warning,
- after the Ask Bot scene wiring was deployed, Android emulator Nimiq Pay
  tapped `Ask Bot`, received a live `openai` proposal using `gpt-5.4-mini`,
  updated the pending move to `inspect -> Support Check`, kept Bot Attention at
  `10/10` and Trace Archive empty before approval, then approved the move,
- Android emulator Nimiq Pay opened the hosted URL, rendered the portrait
  Golden Signal scene, selected Support Check, approved inspection, showed the
  Historic Witness card, reduced Bot Attention to `8/10`, and opened Trace
  Archive with `Trace 1: Open run`,
- emulator log scan found no `AndroidRuntime`, `am_crash`, checkout, payment,
  mainnet, transaction prompt, sign, or send error,
- browser bundle scan found no `OPENAI_API_KEY`, `Bearer`, or `api.openai.com`;
  raw `sk-` substrings were checked and came from strings such as `ask-user`,
  `ask-bot`, and scenario text, not a secret.

## PB-POLISH-003 Checks

Golden Signal opening cinematic tests must verify:

- a pure intro-sequence helper returns the four required beats in order:
  price action forms, Pocket Bot detects, bot analysis concludes, pending
  proposal handoff,
- the sequence is derived from Golden Signal level/fixture metadata where
  practical instead of duplicating an unrelated hardcoded story,
- the intro-visible proposal matches the normal Golden Signal opening proposal
  after the cinematic completes or is skipped,
- completing or skipping the intro does not spend Bot Attention, create a trace,
  mutate relation state, reveal hidden relation answers, or change finish
  judgment,
- intro copy contains no CRPM jargon, no investment advice, no exchange/wallet
  authority, no live market implication, and no terminal hindsight,
- the cinematic does not call the LLM relay, live market APIs, Nimiq Pay
  provider methods, wallet/sign/send methods, checkout, top-up, or payment
  methods,
- phone portrait layout keeps skip/continue, proposal text, and first arena
  controls readable without overlap,
- browser/manual smoke still reaches:
  `Ask Hidden -> Wide Scan -> Approve -> Trace`,
  `Support Check -> Approve -> Historic Witness -> Trace Archive`,
  `Approve default -> false finish`.

For source changes in this slice, run:

```text
npm run check:no-secrets
npm run test
npm run build
```

Then perform one browser/manual smoke in a phone-sized viewport. Hosted Vercel
and Nimiq Pay checks are required again only before marking the polished
submission slice ready.

Current coverage: `tests/game/goldenSignalIntroSequence.test.js` verifies the
four-beat deterministic sequence, as-of timing, pending proposal handoff, and
hindsight-free/LLM-free boundary. The Phaser scene currently uses simple
placeholder rendering for the intro; final visual polish and hosted/Nimiq Pay
media checks remain future PB-POLISH work.

## PocketBotWorkshop V1 Freeze Checks

The current `PocketBotWorkshop` Golden Signal scene is the V1 playable baseline
for the next presentation overhaul. New visual work may change rendering,
layout, animation, and art direction, but it must preserve the V1 gameplay
contract until a replacement passes the same checks.

Automated V1 freeze coverage:

- `tests/game/pocketBotWorkshopV1Regression.test.js` freezes:
  - the first-contact title, support line, default bright-signal proposal, and
    intro handoff controls,
  - first-slice arena actions: `Ask Hidden`, `Wide Scan`, `Check Exit`,
    `Support Check`, and `Approve Enter`,
  - no-spend prepare gates for `Ask Hidden`, `Wide Scan`, and `Check Exit`,
  - approved response panels for `Wide Scan`, `Check Exit`, and `Support
    Check`,
  - render-state descriptors for support, exit, crowd pressure, trace memory,
    and false finish,
  - direct `Approve Enter` as false-finish feedback rather than success,
  - player-facing response wording without CRPM jargon, internal relation IDs,
    or `residualized` terminology.
- `tests/game/goldenSignalPlayableBaseline.test.js` freezes the longer playable
  V1 paths:
  `Ask Hidden -> Wide Scan -> Approve -> Trace`,
  `Support Check -> Approve -> Historic Witness -> Trace Archive`,
  `Ask Bot -> bounded proposal -> Approve`, and
  direct bright-signal entry as a false finish.

Manual/browser V1 smoke before replacing the scene shell:

- phone portrait opens on the Golden Signal scene with reachable controls,
- `Ask Hidden` names hidden support, exit, and crowd pressure without spending
  Bot Attention,
- `Wide Scan -> Approve` spends Bot Attention and records a trace,
- `Check Exit -> Approve` spends Bot Attention and keeps safe finish locked,
- `Support Check -> Approve` opens the Historic Witness/Trace path,
- direct `Approve` creates false-finish feedback,
- `Ask Bot -> Approve` still goes through the bounded relay/mock proposal path,
- Nimiq pocket status remains visible without sign, send, checkout, top-up,
  payment, or mainnet authority prompts.

## PocketBotWorkshop V2 Decision Scene Checks

V2 is an opt-in presentation scaffold opened with `?v2=1`. It must remain a
renderer over the existing V1 mechanics until it passes the V1 regression paths.

Automated V2 coverage:

- `tests/ui/marketWorldDecisionViewModel.test.js` verifies the four-action
  first-contact tray, contextual `Support Check`, resource/trace mapping,
  render-plan surface states, trace drawer output, and no player-facing internal
  terminology.
- `tests/ui/pocketBotDecisionSceneLayout.test.js` verifies the phone-first
  390x844 layout, 2x2 action tray, and centered desktop fallback frame.
- `tests/game/sceneSelection.test.js` verifies V1 remains first by default and
  V2 is first only when `?v2=1` is present.
- `tests/game/nimirunV2AssetManifest.test.js` verifies all V2 assets preload
  and SVG placeholders contain no baked `<text>` labels.

Manual/browser V2 smoke:

- open `http://127.0.0.1:<port>/?v2=1` in a phone portrait viewport,
- confirm the first screen shows one proposal, one narrator insight, four
  primary actions, and no always-visible node-map dashboard,
- run `Ask Hidden`, then confirm the trace drawer opens and `Support Check`
  appears only as a contextual action,
- run `Wide Scan -> Approve` and confirm Bot Attention decreases, crowd
  pressure changes, and the trace drawer records the result,
- reload without `?v2=1` and confirm V1 still opens first.

## PB-POLISH-004 Checks

Witness-backed action response tests must verify:

- Golden Signal exposes explicit `decisionTime` / `asOfTime` metadata before
  source-backed action results are enabled,
- visible opening, intro, action UI, proposal context, and trace pre-finish
  fields exclude post-decision price data, terminal reveal, hidden relation
  answers, and hindsight-only witness fields,
- every market-data action declares target layer, source witness basis, as-of
  rule, reveal result, `doesNotProve` limits, trace text, and runtime mutation,
- `Ask Hidden` names support, exit, crowd/event unknowns without spending Bot
  Attention or claiming a market-data witness answer,
- `Wide Scan` cannot claim GDELT or Wikimedia Pageviews backing unless a static
  fixture records source URLs, license/terms evidence, query, fields, covered
  dates, retrieval date, transformation method, and residue,
- `Check Exit` cannot claim Coin Metrics backing unless the non-commercial /
  reward-mode licensing gate has been reviewed or separate permission is
  recorded,
- `Support Check` uses only Binance BTCUSDT transformed fixture evidence
  available through the decision cut,
- approved action traces state both what was revealed and what it does not
  prove,
- action-response panels are pure view-model output from level response
  contracts plus runtime transition state, and never become authority for
  resource spend, relation mutation, trace creation, or finish classification,
- visual response remains derived from runtime relation state and never becomes
  the authority for resource spend, relation mutation, trace creation, or finish
  classification,
- `Ask Bot` sees only hindsight-free context and updates pending proposal only.

Manual/browser checks for this slice:

- `Ask Hidden` pulses hidden layers without spend,
- `Wide Scan -> Approve` spends Bot Attention and reveals crowd/event pressure
  while support and exit remain residue,
- `Check Exit -> Approve` spends Bot Attention and reveals exit/friction
  residue without claiming safe finish,
- `Support Check -> Approve` spends Bot Attention and shows the price-terrain
  witness path,
- `Approve default` can still produce false/partial finish when blocking residue
  remains,
- phone portrait layout keeps action result, witness card, and trace controls
  readable without overlap.

For source changes in this slice, run:

```text
npm run check:no-secrets
npm run test
npm run build
```

Current coverage: the as-of contract foundation is covered in
`tests/game/marketWorldLevels.test.js` and
`tests/game/marketWorldLevelAdapter.test.js`. These tests verify Golden Signal
timing metadata, action-response fields, source gates for unadopted
GDELT/Wikimedia/Coin Metrics claims, Support Check's Binance fixture basis, and
adapter carry-through into the runtime seed/proposal context.
`tests/ui/marketWorldActionResponsePanel.test.js` covers the first placeholder
response layer for Ask Hidden, Wide Scan, Check Exit, and Support Check:
no-spend unknown naming, approve-gated prepared responses, as-of source lines,
gated candidate-source wording, adopted Binance fixture wording, still-unknown
residue, and `doesNotProve` limits without hindsight leakage.
Local Playwright phone-viewport smoke after the placeholder response wiring
confirmed `Ask Hidden`, `Wide Scan -> Approve`, `Check Exit -> Approve`, and
`Support -> Approve` render a response detail panel plus a small map-layer badge
on a 390x844 canvas without console/page errors. This is a local rendering
check only; hosted Vercel/Nimiq Pay media capture remains a later final pass.
