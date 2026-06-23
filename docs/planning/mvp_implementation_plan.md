# Phase 1 Implementation Plan

This plan translates the refined Pocket Bot thesis into small implementation slices for the first competition-ready milestone.

Phase 1 is no longer centered on a single paid-tool approval loop. The current thesis is:

```text
Pocket Bot is a gamified Nimiq Mini App where the user teaches a bot how to spend limited attention in messy, lossy environments.
```

The bot has limited resources:

- **Bot Attention**: the bot's thinking/action energy. It maps later to LLM tokens, API calls, tool calls, and reasoning time.
- **Nimiq Pocket Money**: a value resource collected, shown, or topped up on testnet. It can later recharge or unlock Bot Attention.
- **User Attention**: the player's investment through guidance, correction, approval, and preference feedback.
- **Context Capacity**: limited short-term memory slots for the current run.
- **Skills / Persistent Memory**: durable upgrades for Phase 2, not Phase 1.

## Nimiq Binding Layer

The product should use Nimiq as more than a crypto/payment label. Nimiq's
public framing around independent individuals and its name meaning as a binding
force support the game metaphor:

```text
Bot Attention binds uncertainty to effort.
Nimiq Pocket binds value to controlled capacity.
User Attention binds human judgment to bot proposals.
Context Capacity binds selected residue to future moves.
Trace Cards bind action, cost, reveal, residue, and lesson.
Session Lessons bind user correction to the next proposal.
```

This should shape mechanics and pitch language. Normal player UI should still
use simple game terms: attention, pocket, guidance, trace, clue, remaining
unknown, partial finish, and safe finish.

The milestone goal is a playable **Pocket Bot Workshop** or equivalent RPG-style map scene inside a Nimiq Mini App-compatible Phaser/Vite shell. The scene should demonstrate:

1. a small lossy environment with fog, ambiguous paths, and hidden assumptions,
2. a bot that proposes moves using an LLM route-proposal call,
3. Bot Attention spent on inspect, ask, remember, skip, or act choices,
4. user guidance that changes the bot's next move within the same session,
5. Nimiq testnet pocket money shown as low-stakes value or recharge potential,
6. context-window memory only, with no persistent memory until Phase 2,
7. trace cards that record what was spent, what was revealed, what residue remains, and what lesson was applied.

Phase 1 may use real LLM API calls through a small server-side relay. API keys must never live in the browser client. The first model should be a low-cost GPT model selected from current official OpenAI model/pricing guidance during implementation; the model id must be configurable and not hard-coded into gameplay logic.

Phase 1 may use Nimiq testnet for wallet/status/top-up experiments because testnet avoids real high-stake value exposure. Phase 1 must not use mainnet value, uncontrolled payments, checkout, real paid external services, x402, rewards, persistent user profiling, or autonomous spending.

## Competition Delivery Floor

The competition should constrain delivery quality without becoming the product's
north star. Pocket Bot should stay on the CRPM path: resource judgment in lossy
environments, trace, residue, re-entry, and safe/partial/false finish
discipline. The competition adds a floor for what must be shippable:

```text
Competition = working, polished, first-try Mini App surface.
CRPM = product spine and originality.
```

Do not flatten the project into a generic wallet game to chase points. Do not
ignore the competition basics either. Before submission, the app must have:

- a working Nimiq Pay Mini Apps Framework path,
- a documented NIM/USDT support decision and smallest meaningful integration,
- no hardcoded private keys, API secrets, or sensitive credentials,
- public, attributed, MIT-licensed code,
- mobile-first first impression and under-60-second first-use path,
- one polished vertical slice of the Pocket Bot loop,
- a short submission story, screenshots, and optional demo walkthrough.

Internal Phase 1 readiness and competition submission readiness are related but
not identical. If NIM/USDT support or first-try usability is missing, the CRPM
demo may still be useful, but the submission should be marked blocked.

Treat NIM/USDT support as the highest external competition uncertainty. Resolve
it early enough to avoid discovering late that the app is internally playable
but not submission-ready. The low-risk target is:

```text
NIM support path
  -> explicit connect/status or low-stakes top-up/recharge
  -> visible trace card
  -> no broad wallet authority
  -> no real checkout/payment flow
```

If testnet-only behavior is the intended path, ask in the official technical or
support channel whether it satisfies the competition integration requirement.

Track submission readiness in `docs/product/competition_scorecard.md`:

```yaml
competition_submission_status:
  mini_app_framework_path: pass | blocked | unknown
  nim_or_usdt_support: pass | blocked | unknown
  no_secrets_scan: pass | blocked | unknown
  mit_license_public_repo: pass | blocked | unknown
  mobile_ux_60s_path: pass | blocked | unknown
  vertical_slice: pass | blocked | unknown
  submission_story: pass | blocked | unknown
  community_feedback: pass | blocked | unknown
  overall: ready | blocked
```

Keep the judge path brutally simple:

```text
Open app
  -> see bot, goal, attention, pocket, trace
    -> bot proposes inspect shortcut first
      -> user approves
        -> attention decreases
          -> fog reveals clue plus remaining unknown
            -> trace card binds action, cost, reveal, residue
              -> bot applies lesson or reaches partial/safe finish
                -> Nimiq pocket is visibly connected to controlled capacity
```

## Cross-Platform Runtime Model

Pocket Bot should ship as **one Phaser/Vite web app**, not as separate Windows,
Android, and iOS products. The game loop, domain rules, LLM proposal relay,
scene, assets, and trace UI should be shared across every runtime. Platform
differences belong behind `src/platform/` adapters.

Target runtime behavior:

| Runtime | Game surface | Nimiq pocket path |
|---|---|---|
| Windows desktop browser | Normal hosted web app | Desktop TestAlbatross status through Nimiq Web Client; local fallback if unavailable |
| Android/iOS mobile browser | Normal hosted web app | Browser TestAlbatross status through Nimiq Web Client where supported; local fallback if unavailable |
| Nimiq Pay on Android/iOS | Mini App WebView | Nimiq Pay Mini App SDK/provider status path |
| Any unsupported browser | Normal hosted web app | Local fallback pocket, with no wallet access |

This means the finished game should be playable when a user opens the hosted URL
from Windows, Android, or iPhone. Nimiq access is a progressive enhancement:
use the strongest safe adapter available, but never make the core game depend on
wallet availability.

Adapter priority:

```text
Nimiq pocket status request
  -> if Nimiq Pay provider is available, use the Mini App SDK/provider adapter
  -> else if browser TestAlbatross support is enabled, use the Web Client adapter
  -> else use the local fallback pocket
```

Scope boundary:

- Mini App provider verification is required for competition readiness and was
  first confirmed on Android emulator with Nimiq Pay forced to Testnet on June
  7, 2026. Repeat it before final submission if the platform adapter changes.
- Desktop/mobile browser TestAlbatross support is required for broad product
  usability, especially Windows.
- Browser TestAlbatross status should start read-only: consensus/head status,
  network label, and trace card only. Do not add private-key management,
  signing, sending, Hub checkout, or real-value behavior as part of this slice.

## Source Documents

- Product requirements: `docs/product/requirements.md`
- Product roadmap: `docs/product/roadmap.md`
- Phase 0 alignment: `docs/product/phase0_alignment.md`
- Product pitch: `docs/product/pitch.md`
- Art bible: `docs/product/art_bible.md`
- Market Signal Scout scenario: `docs/product/scenarios/market_signal_scout.md`
- Market witness governance: `docs/product/scenarios/market_witness_governance.md`
- Reward mode boundary: `docs/product/reward_mode_boundary.md`
- Infrastructure context: `docs/product/infrastructure_context.md`
- Source attribution: `docs/product/source_attribution.md`
- Competition scorecard: `docs/product/competition_scorecard.md`
- Development workflow: `docs/process/development_workflow.md`
- Test strategy: `docs/testing/test_strategy.md`

When older docs still describe the allowance-only MVP, use this plan and `docs/product/roadmap.md` as the current Phase 1 scope until those docs are fully harmonized.

## Current Phase 1 Status

Implemented groundwork from the earlier allowance-control cut:

- PB-001 Domain Rule Decision is implemented.
- PB-002 Receipt Creation is implemented, including future-facing receipt classification data.
- PB-003 Allowance Spend Execution is implemented.
- PB-004 Pocket Bot Workshop Scene Shell is implemented with Mini App framework compatibility, local fallback status, and a Tool Scout hover witness interaction.
- PB-005 RPG Map Tooling And Scene Direction is implemented with a Phaser-native custom node-map workflow and NimiRun V2 runtime assets, documented in `docs/architecture/rpg_map_tooling.md`.
- PB-006 Core Resource Model is implemented with deterministic Bot Attention, Nimiq Pocket, User Guidance, Context Slot, and move-cost checks in `src/domain/`.
- PB-006A Run Session And Transition Runtime is implemented with scenario contract validation, move transition gates, run carriers, and finish judgment packets.
- PB-007 LLM Route Proposal Bridge is implemented with a structured route proposal schema, hard/soft governance validation, run-carrier prompt builder, browser relay client, Vite dev relay middleware, Vercel production function, OpenAI Responses API relay, offline/mock fallback, and full-scenario unsafe-authority relay regression coverage.
- PB-008 Lossy Map Scenario is implemented with deterministic hidden-pressure reveal, inspect/skip/act behavior, false-landfall traps, safe-finish judgment, and prompt serialization in `src/domain/lossyMap.js`.
- PB-009 User-Bot Guidance Loop is implemented with a testable guidance-loop domain module, scene state setup, Phaser proposal controls, redirect-by-node selection, why/unknowns/inspect-first/partial controls, deterministic approval, and HUD/map updates.
- PB-010 Session Lesson Application is implemented with trace-derived session lessons, inspect-before-act/residue/stop-condition lesson typing, next-proposal rewrite, prompt serialization, relay/client pass-through, and no persistence beyond the active run state.
- PB-011 Trace Cards is implemented with player-facing trace-card records for accepted moves, receipt-backed money-like actions, residue/re-entry context serialization, latest-trace inspection, and safe/partial/false/open landfall labeling.
- PB-012 Nimiq Testnet Pocket is implemented with a safe local fallback pocket, explicit Nimiq Pay NIM status check, testnet/local pocket HUD wording, pocket-status trace cards, no sign/send/payment authority, and Android emulator Nimiq Pay Testnet verification.
- PB-013 Market Signal Scout Golden Signal foundation is implemented with a
  transformed Binance BTCUSDT fixture evidence packet, accepted historic
  headline witnesses, a Golden Signal scenario contract, and Pocket Bot
  Workshop scene wiring. The pulled market-world model, arena narrator role cut,
  and `src/game/scenarios/marketWorldLevels.js` started as supporting
  design/contract material. PB-014 now adds
  `src/game/scenarios/marketWorldLevelAdapter.js`, so the live Golden Signal
  scenario gets its arena spine and initial proposal seed from the market-world
  level while preserving Ask Hidden, Wide Scan, Check Exit, Support Check, and
  approve-gated spending. PB-014 relation-state mutation and relation-derived
  finish judgment are now implemented in the domain runtime.

This work should be retained as supporting infrastructure. It becomes one possible resource-governance mechanic inside the broader resource-judgment game, not the active center of Phase 1.

PB-POLISH has a verified hosted/Nimiq Pay submission path for the current
Golden Signal proof of concept. The current product-spine work remains
**PB-014 Market World Runtime Seed**; its next step is player-facing finish
state and hindsight-card presentation around the relation-derived finish
packet, while preserving the verified Support Check path as a regression
baseline.

PB-POLISH remains the submission/regression lane for final screenshots, demo
media, and pre-submission checks after PB-014 changes the gameplay surface.

PB-012A Desktop/Mobile Browser TestAlbatross Status is postponed. The hosted
web app should still remain playable in ordinary desktop/mobile browsers with
local fallback, but direct desktop/browser Nimiq TestAlbatross support is no
longer required before the first competition submission pass.

## Implementation Assumptions

These assumptions are binding for the revised Phase 1 unless the product requirements are updated again:

- The first screen should be a playable mini game, not a landing page and not a policy dashboard.
- The scene should feel like a compact 2D RPG map built in Phaser/Vite, using a Phaser-compatible RPG/tilemap workflow where practical.
- Runtime art should follow `docs/product/art_bible.md`: dark storybook RPG mood, readable 2D assets, Nimiq-gold value accents, Bot Attention blue, context green, clue purple, residue shadow, and no text baked into art.
- Before rebuilding the scene, evaluate a Phaser-compatible map workflow such as Tiled, LDtk, or an equivalent Vite-friendly RPG/tilemap approach.
- Keep the existing Phaser 3 + Vite foundation.
- Keep `src/scenes/Street.js` as the old prototype/reference scene.
- Keep `src/scenes/PocketBotWorkshop.js`, but allow it to evolve from payment workshop into a resource-navigation map.
- Keep Mini App SDK/provider access behind `src/platform/` adapters.
- Keep LLM API access behind a server-side relay or equivalent backend boundary; no OpenAI or provider API key may be exposed to browser code.
- Supply real provider keys through shell/session environment variables or deployment secrets. Treat `.env.example` as a variable-name template, not a secret store; do not rely on repo-local env files for competition or submission work.
- Use Vercel as the first hosted deployment target unless a later plan change replaces it. Production route proposals should use the same-origin `api/route-proposal.js` function and Vercel environment variables.
- LLM calls in Phase 1 are stateless except for the current session trace supplied in the prompt/context.
- The LLM may propose moves, but deterministic game/resource rules decide whether a move is legal and what it costs.
- Phase 1 memory is context-window/session memory only. No database-backed user memory or durable preference store is allowed.
- Nimiq testnet wallet/status/top-up experiments are allowed when explicit and user-triggered.
- Mainnet NIM, real-value rewards, real checkout, real paid API/tool execution, x402, and autonomous spending remain out of scope.
- Domain behavior belongs in plain JavaScript modules under `src/domain/`.
- Scenario constants and scene-independent setup belong under `src/game/`.
- Phaser scenes should orchestrate and display state, not own resource rules, LLM schemas, or wallet logic.

## CRPM-Compatible Navigation Teaching Rules

Pocket Bot should teach source-ocean navigation through gameplay without exposing CRPM jargon to the player.

Use the CRPM reading as design scaffolding only:

```text
foggy map / hidden assumptions
  -> selected move or probe
    -> revealed information plus residue
      -> trace and context carrier
        -> later re-entry or landfall judgment
```

Player-facing translation:

| CRPM design idea | Player-facing term |
|---|---|
| source ocean | foggy / lossy map |
| pressure | uncertainty, pull, question, or risk |
| cut | way to look / chosen move type |
| probe | inspect, ask, scout, or compare |
| carrier | context slot or trace card |
| residue | still unknown / not settled |
| protected family | what must not be lost |
| landfall | safe finish / partial finish / false finish |
| re-entry | can we explain this later? |

Gameplay rules:

1. Fog is source pressure, not merely hidden objects.
2. Every move has a cut price: it reveals, suppresses, and leaves residue.
3. Residue is carried forward as next decision pressure.
4. Context slots are carriers, not inventory.
5. Bot proposals are compressed path sets, not proof of the terrain.
6. Goal arrival is not automatically landfall.
7. Trace cards must preserve what changed, what was spent, what was revealed, what remains unknown, and why re-entry is possible.
8. User lessons should teach cut preferences and stop conditions, not only surface preferences.

Design target:

```text
Make every accepted move answer four questions:
  What did we reveal?
  What did we suppress or leave unresolved?
  What residue do we carry?
  Can we re-enter later and explain why this was a good move?
```

The UI should keep the simple product language: goal, attention, pocket, context, guidance, trace, clue, shortcut, ask, inspect, remember, skip, act, partial finish, and safe finish.

## Scenario Variant Strategy

Pocket Bot should keep one invariant stage and allow scenario scripts to vary.
The invariant stage is:

```text
foggy map
  -> bot proposal
    -> player approve / redirect / ask / remember / skip / act
      -> attention spend
        -> reveal plus residue
          -> trace card
            -> session lesson
              -> safe / partial / false / open finish
```

Scenario scripts provide the domain wrapper for that stage. The current leading
candidate is:

```text
docs/product/scenarios/market_signal_scout.md
```

Treat `Market Signal Scout` as a candidate, not as the automatically final first
scenario. It should be selected only if it helps the first player understand
resource judgment quickly and does not create financial-advice confusion.

Selection gate for `Market Signal Scout`:

- market-like vocabulary remains fictional and non-advisory,
- no live market data is used,
- no brokerage, exchange, portfolio, trading bot, or strategy-export behavior is introduced,
- any historic chart-derived fixture has source attribution before implementation,
- the judge path remains understandable in about 60 seconds,
- Nimiq Pocket remains a controlled capacity/value surface, not a trading balance.

Other scenario variants can reuse the same stage later, such as bug failure
surface, shopping boundary, travel-planning residue, or coding-agent test
scouts.

### Game Glossary For CRPM Terms

Use this glossary when implementing domain objects, LLM schemas, prompts, and UI labels. CRPM terms may appear in internal planning docs and code comments where they clarify structure, but player-facing UI should prefer the game terms.

| Internal CRPM term | Game-facing term | Implementation meaning |
|---|---|---|
| source ocean | task landscape | The richer goal situation beyond what Pocket Bot currently sees. The visible map is only a partial access surface. |
| pressure | unresolved decision pressure | A question, risk, pull, or hidden assumption that makes another move useful. |
| cut | access mode / move lens | The chosen way of looking or acting: inspect, ask, remember, skip, or act. It reveals some things and hides others. |
| cut price | move tradeoff | The attention/user/pocket cost plus what the move reveals, suppresses, and leaves unresolved. |
| probe | scouting move | A bounded, preferably reversible information-gathering move such as inspect, ask, compare, or scout. |
| carrier | context slot / trace card | A limited state holder that preserves clues, residue, lessons, and re-entry support. It is not generic inventory. |
| residue | remaining unknown | What is still unknown, unresolved, suppressed, or unsafe to claim after a move. |
| protected family | what must not be lost | The user goal, safety boundary, clue, correction, wallet boundary, or preference signal that must survive the move. |
| landfall | finish judgment | A scoped run outcome: safe finish, partial finish, false finish, or open run. Reaching a goal-looking node is not enough. |
| re-entry | explainable return | The ability to reconstruct later why the bot moved, what it saw, what it ignored, and what remains open. |

Player-facing finish rule:

```text
A finish is safe only if Pocket Bot preserved the goal, showed remaining unknowns,
stayed inside attention and pocket boundaries, and left a trace that explains the route.

Otherwise the result is partial, false, or still open.
```

Implementation rule:

```text
Do not let UI copy, LLM responses, or final trace summaries say "done", "solved",
or "safe" unless the landfall/finish check has explicitly classified the run as safe_finish.
```

### Runtime Discipline Source

This runtime shape is adapted from the local `Agent_Desktop_Automation_MCP_Server`
repo as a design source, not as a software dependency. The relevant source
documents are:

- `C:\Users\jensb\Desktop\Projects\Agent_Desktop _Automation_MCP_Server\docs\architecture\licensed_desktop_interaction_sessions.md`
- `C:\Users\jensb\Desktop\Projects\Agent_Desktop _Automation_MCP_Server\docs\planning\licensed_desktop_interaction_feature_design.md`

The source-supported pattern from that repo is:

```text
bounded session
  -> observe
    -> infer
      -> licensed probe or action
        -> observe transition
          -> classify delta
            -> carry residue
              -> continue / repair / ask / partial landfall / close
```

Pocket Bot should borrow the runtime discipline, not the desktop-control
machinery. No Phase 1 gameplay code should depend on the MCP server, desktop
observation tools, mouse/click automation, OCR, app launching, or raw desktop
authority.

Pocket Bot translation:

| Agent Desktop runtime idea | Pocket Bot runtime idea |
|---|---|
| bounded task license | bounded run session / scenario contract |
| observed app-under-test scope | observed map state and current goal scope |
| licensed probes/actions | allowed bot moves: inspect, ask, remember, skip, act |
| interaction transition gate | bot move transition gate |
| post-action observation | map/resource/trace state after the move |
| post-action classification | move delta classification |
| run-level carrier | session trace, context slots, and unresolved residue |
| closure / landfall packet | finish judgment packet |

Phase 1 run loop:

```text
scenario contract
  -> start run session
    -> observe map state
      -> LLM proposes a move
        -> deterministic resource and safety rules license or block the move
          -> execute accepted move
            -> observe map/resource/trace delta
              -> classify transition
                -> update run carrier and residue
                  -> continue / repair / ask / partial_finish / safe_finish / false_finish / open_run
```

Required runtime artifacts:

- **Scenario contract**: goal, allowed moves, resource budgets, context capacity,
  hidden-pressure rules, protected outcomes, stop conditions, and finish policy.
- **Run session**: current goal scope, resources, context slots, trace ids,
  allowed move set, and stop conditions.
- **Move transition gate**: before-state, proposed move, deterministic rule result,
  expected evidence, after-state, transition classification, and residue.
- **Run carrier**: compact session model carried into the next LLM prompt,
  including revealed clues, remaining unknowns, session lessons, and trace support.
- **Finish judgment packet**: final status, satisfied outcomes, unsatisfied residue,
  trace ids, stop reason, and re-entry notes.

Move transition classifications should stay game-facing:

- `expected_reveal`: the map/resource delta matches the move's expected evidence.
- `no_effect`: the move spent nothing useful or changed nothing relevant.
- `wrong_route`: the move affected an unintended route, node, or pressure.
- `risk_boundary`: the move would cross a wallet, payment, scope, or safety boundary.
- `unreadable_state`: the game cannot classify the result from available state.
- `repair_needed`: a bounded correction path remains available.

`expected_reveal` is evidence, not success. A finish can be called safe only after
the finish judgment packet checks the protected outcomes and remaining residue.

Optional CRPM leakage into gameplay should happen through a softened bot journal,
not normal UI jargon:

```text
What I saw.
What I spent.
What I ignored.
What still worries me.
Why I am or am not calling this finished.
```

## Proposed Runtime Structure

```text
src/
  domain/
    allowance.js              # existing Nimiq pocket / money-resource groundwork
    attention.js              # Bot Attention budget and spend rules
    contextSlots.js           # short-term memory slot rules and carrier behavior
    finishJudgment.js         # safe / partial / false / open run closure rules
    lossyMap.js               # map node state, pressure, reveal, residue, and landfall rules
    moveTransitionGate.js     # accepted-move before/after state, delta classification, and repair pressure
    proposals.js              # broader action / route proposal shape, cut price, and path-set residue
    resourceRules.js          # deterministic resource/legal checks
    runCarrier.js             # compact state carried into the next proposal prompt
    runSession.js             # scenario contract, run scope, allowed moves, stop conditions
    traces.js                 # action trace, residue, re-entry, and lesson cards
    rules.js                  # existing allowance rule checks retained for money gates
    receipts.js               # existing receipt groundwork retained for spend-like traces
  game/
    mvpScenario.js            # existing scenario, to be replaced or wrapped
    resourceMapScenario.js    # first source-ocean navigation teaching scenario
    pocketBotState.js
  llm/
    routeProposalSchema.js
    routeProposalClient.js     # browser client for backend relay only
    routeProposalPrompt.js
  platform/
    nimiqMiniApp.js
    nimiqDesktopTestnet.js
    nimiqPocketRuntime.js
    openaiRelay.js             # server-side boundary if hosted in-repo
  scenes/
    PocketBotWorkshop.js
    Street.js
  ui/
    hud.js
    resourceMeters.js
    guidanceControls.js
    tracePanel.js
```

Add files only when their feature slice needs them. Avoid empty placeholders.

## Proposed Test Structure

```text
tests/
  domain/
    allowance.test.js
    attention.test.js
    contextSlots.test.js
    finishJudgment.test.js
    lossyMap.test.js
    moveTransitionGate.test.js
    resourceRules.test.js
    runCarrier.test.js
    runSession.test.js
    traces.test.js
    rules.test.js
    receipts.test.js
  llm/
    routeProposalSchema.test.js
    routeProposalClient.test.js
  platform/
    nimiqMiniApp.test.js
    nimiqDesktopTestnet.test.js
    nimiqPocketRuntime.test.js
    openaiRelay.test.js
  smoke/
    app-loads.spec.js
```

Vitest remains the baseline unit-test tooling. Browser/manual checks are required for Phaser map rendering and user-bot interaction until browser automation is added.

## Codex Subagent Roles

Role-specific Codex agents live in `.codex/agents/`. Use them as scoped
workers; they coordinate through docs, commits, and completion summaries rather
than private handoff.

Current Phase 1 roles:

- `pocket_bot_planner` - feature slicing, scope checks, source attribution checks, and implementation planning.
- `pocket_bot_test_planner` - TDD coverage, runtime-cycle checks, scene checks, and verification planning.
- `pocket_bot_domain_worker` - plain JavaScript domain rules for attention, context, lossy map state, resources, traces, and lessons.
- `pocket_bot_runtime_worker` - PB-006A run sessions, move transition gates, run carriers, and finish judgment packets.
- `pocket_bot_llm_worker` - PB-007 route proposal schema, prompt/context shaping, backend relay boundary, and mock fallback.
- `pocket_bot_scene_worker` - Phaser RPG map, HUD, guidance controls, bot journal, trace panel, and interaction wiring.
- `pocket_bot_nimiq_platform_worker` - PB-012 and later Nimiq Mini App SDK/provider boundaries, local fallback/testnet status behavior, no-mainnet/no-uncontrolled-wallet controls, and matching platform tests.
- `pocket_bot_docs_keeper` - source-of-truth docs, competition attribution register, status updates, and role maintenance.
- `pocket_bot_reviewer` - read-only review for correctness, scope drift, missing tests, attribution gaps, and MVP boundary risk.

## Revised Feature Slices

### PB-001 Domain Rule Decision

Status: implemented from the earlier allowance-control cut.

Keep as supporting groundwork for future money/resource gates.

### PB-002 Receipt Creation

Status: implemented from the earlier allowance-control cut.

Keep as supporting groundwork. Future trace cards may reuse receipt fields when an action spends Nimiq pocket money or a paid tool is involved.

### PB-003 Allowance Spend Execution

Status: implemented from the earlier allowance-control cut.

Keep as supporting groundwork for the Nimiq Pocket resource.

### PB-004 Pocket Bot Workshop Scene Shell

Status: implemented from the earlier allowance-control cut.

Keep the scene but evolve it into the playable resource-navigation map.

### PB-004A Competition Compliance Floor

Goal:

Add a small competition-readiness gate without letting the scoring rubric
override the CRPM-centered product spine.

User-visible behavior:

No new game mechanic is required in this slice. It makes sure the app has a
credible path to a working Mini App submission: first-try usability, Nimiq Pay
integration, NIM/USDT support decision, source attribution, no secrets, and
clear submission story.

Expected files:

- `docs/planning/mvp_implementation_plan.md`
- `docs/product/requirements.md`
- `docs/product/source_attribution.md`
- `docs/product/competition_scorecard.md`
- `docs/testing/test_strategy.md`
- optional `README.md` competition-readiness checklist if submission docs are being prepared

Test plan:

- confirm competition scoring, rules, FAQ, and Mini Apps docs are listed in source attribution,
- decide whether the first submission targets NIM, USDT, or both,
- document the smallest meaningful Nimiq Pay integration that preserves the resource-judgment game,
- if relying on testnet-only behavior, ask the official technical/support channel whether it satisfies the integration requirement,
- initialize `docs/product/competition_scorecard.md` with blocked/unknown/pass status,
- confirm no browser-visible API key, private key, seed, or sensitive credential exists,
- confirm public repo and MIT license readiness,
- define the under-60-second first-use path,
- define the one polished vertical slice to demo,
- list any competition blocker separately from internal Phase 1 blockers.

Acceptance:

- the plan distinguishes competition delivery floor from CRPM product spine,
- Nimiq integration is not postponed into an undefined late risk,
- competition readiness has explicit pass/block criteria,
- NIM/USDT support is treated as the earliest external uncertainty,
- the project does not pivot into a generic wallet/payment game.

### PB-005 RPG Map Tooling And Scene Direction

Goal:

Choose the Phaser/Vite 2D RPG-map workflow for Phase 1.

Status:

Implemented as a Phaser-native custom node-map workflow with the NimiRun V2
runtime asset pack. See
`docs/architecture/rpg_map_tooling.md`.

User-visible behavior:

No major player-facing feature yet. This slice establishes how the map will be authored and rendered so the next slices can build the game loop without fighting the scene foundation.

Expected files:

- `docs/planning/mvp_implementation_plan.md`
- `docs/product/art_bible.md`
- `docs/architecture/rpg_map_tooling.md`
- `public/assets/nimirun-v2/`
- `src/game/assets/nimirunV2AssetManifest.json`
- `src/game/assets/preloadNimiRunV2Assets.js`
- `src/game/resourceMapScenario.js`
- `src/scenes/PocketBotWorkshop.js`
- optional map asset/config files under the most specific existing asset directory, or a new focused map directory if needed.

Test plan:

- compare Phaser-native tilemap support, Tiled, LDtk, or equivalent Vite-friendly RPG/tilemap approach,
- pick the smallest workflow that supports tiles, object layers/nodes, fog/revealed state, and click/keyboard interaction,
- confirm the selected workflow can implement the art bible with small readable sprites, modular tiles, UI icons, and state effects,
- verify the chosen workflow can represent pressure/residue metadata on nodes without overcomplicating art production,
- `npm run test` covers the map scaffold data shape and asset manifest paths,
- `npm run build` passes,
- browser/manual check confirms the scene still renders.

Acceptance:

- selected workflow is documented,
- the choice does not require replacing Phaser/Vite,
- the scene can represent nodes, paths, obstacles/fog, interaction zones, hidden pressure, and reveal/residue state,
- asset generation can proceed from `docs/product/art_bible.md` without committing to final art in PB-005,
- implementation can proceed without committing to final art.

### PB-006 Core Resource Model

Goal:

Add the revised Phase 1 resource model.

Status:

Implemented.

User-visible behavior:

The HUD shows Bot Attention, Nimiq Pocket, User Attention prompts, and Context Capacity.

Expected files:

- `src/domain/attention.js`
- `src/domain/contextSlots.js`
- `src/domain/resourceRules.js`
- `src/game/resourceMapScenario.js`
- `tests/domain/attention.test.js`
- `tests/domain/contextSlots.test.js`
- `tests/domain/resourceRules.test.js`

Test plan:

- Bot Attention starts at the scenario budget,
- inspect/ask/remember/act choices spend the expected attention amount,
- invalid spends cannot make attention negative,
- context slots have a fixed capacity,
- remembering a clue or residue fails or requires replacement when slots are full,
- replacement distinguishes safely archived trace residue from dangerously lost context,
- Nimiq Pocket is represented separately from Bot Attention.

Acceptance:

- resource math is deterministic and test-covered,
- Nimiq Pocket and Bot Attention are not conflated,
- Context Capacity behaves like a limited carrier for clues, residue, and session lessons,
- user-facing labels make clear that Bot Attention is the spendable thinking/action energy.

### PB-006A Run Session And Transition Runtime

Status:

Implemented.

Goal:

Add the Phase 1 runtime discipline adapted from
`Agent_Desktop_Automation_MCP_Server`: bounded run session, move transition
gate, run carrier, and finish judgment packet.

User-visible behavior:

No new major scene feature is required in this slice. It makes later bot moves
behave consistently: every accepted move has a before-state, expected evidence,
after-state, transition classification, visible residue, and bounded next step.

Expected files:

- `src/domain/runSession.js`
- `src/domain/moveTransitionGate.js`
- `src/domain/runCarrier.js`
- `src/domain/finishJudgment.js`
- `tests/domain/runSession.test.js`
- `tests/domain/moveTransitionGate.test.js`
- `tests/domain/runCarrier.test.js`
- `tests/domain/finishJudgment.test.js`

Test plan:

- scenario contract validates goal, allowed moves, resource budgets, protected outcomes, and stop conditions,
- run session starts only from a valid scenario contract,
- accepted move creates a transition gate with before-state, proposal, rule result, and expected evidence,
- transition gate cannot be treated as closed until after-state is attached and classified,
- `expected_reveal` updates the run carrier but does not mark the run safe by itself,
- `no_effect`, `wrong_route`, `risk_boundary`, `unreadable_state`, and `repair_needed` carry explicit residue,
- run carrier serializes compactly for the next LLM prompt,
- finish judgment distinguishes safe finish, partial finish, false finish, and open run from protected outcomes and residue.

Acceptance:

- LLM proposals have a deterministic runtime boundary before they can affect game state,
- every accepted move can produce a traceable cycle packet,
- remaining unknowns carry forward into the next proposal context,
- success claims are impossible without a finish judgment packet,
- runtime terms remain internal unless a debug/dev surface exposes them deliberately.

### PB-007 LLM Route Proposal Bridge

Status:

Implemented.

Goal:

Add Phase 1 LLM support for route/move proposals.

User-visible behavior:

Pocket Bot can propose a next move in natural language based on the current goal, visible map state, resources, context slots, residue carried from prior moves, and current session trace.

Expected files:

- `src/llm/routeProposalSchema.js`
- `src/llm/routeProposalPrompt.js`
- `src/llm/routeProposalClient.js`
- `src/llm/routeProposalMock.js`
- `src/game/routeProposalRuntime.js`
- `server/routeProposalRelay.js`
- `api/route-proposal.js`
- `vercel.json`
- `tests/llm/routeProposalSchema.test.js`
- `tests/llm/routeProposalPrompt.test.js`
- `tests/llm/routeProposalClient.test.js`
- `tests/game/routeProposalRuntime.test.js`
- `tests/platform/routeProposalRelay.test.js`

Route proposal shape should include:

```yaml
route_proposal:
  move_type: inspect | ask | remember | skip | act
  target_node:
  reason:
  resource_cost:
    bot_attention:
    user_attention:
    context_slots:
  considered_alternatives:
    - move:
      why_not_selected:
  cut_price:
    reveals:
      - "what this move may make visible"
    suppresses:
      - "what this move will not inspect or decide"
    leaves_residue:
      - "what remains unknown after the move"
  stop_condition:
```

Test plan:

- schema accepts a valid route proposal,
- schema rejects unknown actions, missing costs, missing residue/cut-price fields, or unbounded tool/payment requests,
- schema normalizes overconfident wording that treats a path choice as proof of
  the whole map, claims full success, or mentions safe finish before runtime
  judgment,
- schema records governance warnings for normalized proposal wording,
- full resource-map prompt fixture, including pocket and false-finish nodes, stays inside the unsafe-authority wording guard,
- client calls only the backend relay, not OpenAI directly from browser code,
- relay reads API key from environment,
- relay model id is configurable,
- relay has a safe offline/mock mode for local demo and tests,
- `npm run test` and `npm run build` pass.

Implementation note:

- PB-007R full-scenario relay regression is implemented with mocked OpenAI responses that include pocket, false-finish, trace-card, session-lesson, and residue context. The positive case validates a bounded proposal; recoverable overclaim/boundary wording is normalized with governance warnings; chosen moves that request unsafe authority still surface a readable relay validation error before gameplay.
- `src/game/routeProposalRuntime.js` turns the current guidance state into the
  compact same-origin relay payload used by the Phaser scene, filters out
  non-playable Phase 1 moves such as `remember`, normalizes model-claimed costs
  to deterministic scenario costs, and records the proposal source in
  guidance trace without spending resources.
- The prompt boundary avoids seeding exact forbidden proposal phrases such as wallet authority, checkout, payment execution, mainnet spend, private key, persistent memory, external tools, or unbounded tool language into the model instruction.
- Boundary-language recovery is path-aware: rejected alternatives may mention
  blocked authority as the reason they were not selected, and explicit boundary
  cautions such as "do not" / "must not" / "outside" may normalize. Soft
  contrast wording such as "instead of" or "rather than" must not soften an
  active proposal that requests unsafe authority.

Later governance refinements, after the current submission path is stable:

- replace string-only `governanceWarnings` with typed warning objects that
  include a code, field path, severity, original text, normalized text, and
  false-closure family,
- return a tri-state validation status such as `accepted`,
  `accepted_with_normalization`, or `rejected` instead of relying only on
  `valid: true` plus warnings,
- derive an internal transition packet from accepted proposals that records
  preserved content, suppressed content, newly visible content, residue, and
  reversibility,
- carry governance warnings into trace cards so overclaim repairs remain
  recoverable as run residue rather than disappearing as validator metadata,
- add finish evidence packets that make safe/partial/false/open judgments
  auditable through protected evidence, missing evidence, residue, remaining
  unknowns, scope, and re-entry condition,
- compare LLM-claimed resource cost with deterministic runtime cost and record
  a warning when runtime overrides the model's cost claim.

Acceptance:

- LLM proposals are structured, bounded, and validated before entering game state,
- every proposal says what it reveals, what it leaves unresolved, and what cheaper/safer alternative was considered,
- broad scenario prompts return a valid bounded proposal, a normalized bounded
  proposal with governance warnings, or a readable deterministic validation
  error before entering gameplay,
- no provider API key is bundled into client code,
- failure/offline states produce a readable fallback move,
- the bot's proposal can reference only current session context and provided game state.

### PB-008 Lossy Map Scenario

Status:

Implemented.

Goal:

Create the first abstract task landscape.

User-visible behavior:

The player sees a small RPG-like map with fog, ambiguous route nodes, clue nodes, a tempting shortcut, a context-memory station, a Nimiq pocket/recharge node, and a goal node.

Current candidate script:

- `docs/product/scenarios/market_signal_scout.md`

Use the candidate only if it passes the scenario variant selection gate above.

Expected files:

- `src/domain/lossyMap.js`
- `src/game/resourceMapScenario.js`
- optional `src/game/scenarios/marketSignalScoutScenario.js` if `Market Signal Scout` is selected
- `src/scenes/PocketBotWorkshop.js`
- map data/assets as selected in PB-005
- `tests/domain/lossyMap.test.js`
- optional `tests/game/marketSignalScoutScenario.test.js` if `Market Signal Scout` is selected

Map-node shape should support:

```yaml
map_node:
  node_id:
  visible_label:
  visible_clue:
  hidden_pressure:
    - "uncertainty before inspection"
  possible_moves:
    inspect:
      cost:
      reveals:
      leaves_unknown:
    skip:
      cost: 0
      preserves_residue:
    act:
      cost:
      risk:
  false_landfall_trap:
    trigger:
    why_it_is_false_closure:
```

Test plan:

- unrevealed nodes hide their assumptions,
- inspect reveals a clue at attention cost,
- inspect records what remains unknown,
- skip preserves attention and carries uncertainty as residue,
- act commits to route state and can trigger false-landfall traps when hidden pressure was ignored,
- map state serializes into the LLM prompt context, including residue and carried trace,
- if `Market Signal Scout` is selected, market-like vocabulary is allowed only as fictional game language,
- if `Market Signal Scout` is selected, proposals are blocked from making live-trading, wallet-authority, brokerage/exchange execution, portfolio advice, or persistent strategy export claims,
- `npm run test` and `npm run build` pass.

Data-source gate:

- If historic chart-derived fixtures are used, document provider name, URL,
  terms/license note, date range, and transformation method in
  `docs/product/source_attribution.md` before implementation.
- Do not ship raw historic data unless its license/terms explicitly allow that.
- Do not ship a general chart-data downloader in Phase 1.
- The scenario must remain a fictional educational game scenario, not financial
  advice or live trading support.

Acceptance:

- the map makes ambiguity visible,
- each node asks "is this worth spending attention on?",
- at least one node teaches that reaching a goal-looking state is not automatically safe landfall,
- the first map is small enough to finish in a short competition demo,
- selected scenario script is linked from the plan and has explicit non-goals.

### PB-009 User-Bot Guidance Loop

Status: implemented.

Goal:

Connect LLM proposals, deterministic resource checks, and player guidance.

User-visible behavior:

The bot proposes a move. In the implemented PB-009 vertical slice, the player can request a fresh route proposal with `Ask Bot`, approve, redirect by selecting a node, ask why this route, ask what remains unknown, ask the bot to inspect first, or mark a result as partial. The bot spends resources only after a legal move is accepted.

Cheaper-route controls and remember/forget clue controls remain later refinements tied to session lessons, context-slot handling, and trace cards.

Implemented files:

- `src/scenes/PocketBotWorkshop.js`
- `src/ui/guidanceControls.js`
- `src/game/pocketBotState.js`
- `src/game/routeProposalRuntime.js`
- `src/domain/guidanceLoop.js`
- `src/domain/lossyMap.js`
- `src/llm/routeProposalClient.js`
- `tests/domain/guidanceLoop.test.js`
- `tests/domain/lossyMap.test.js`
- `tests/game/routeProposalRuntime.test.js`

Test plan:

- approved inspect move spends Bot Attention and reveals state,
- Ask Bot creates a bounded relay request from guidance state and updates the
  pending proposal without spending resources,
- redirect updates the pending move without spending the original cost,
- ask-user actions are represented as user attention prompts,
- asking "why this route" exposes the proposal's reason and considered alternatives,
- asking "what remains unknown" exposes the proposal's residue,
- "inspect first" redirects from action to probe when residue controls the target,
- "mark partial" records that a subgoal is useful but not full success,
- illegal moves are blocked before resource state changes,
- trace is appended after each accepted action,
- `npm run test` and `npm run build` pass,
- browser/manual check confirms controls update map and HUD.

Implementation note:

- `src/domain/guidanceLoop.js` owns proposal approval, redirect, inspect-first, remaining-unknown, why-route, partial-result, ask-user, and guidance-trace behavior.
- `src/game/pocketBotState.js` builds the scene-independent guidance state from the lossy-map scenario.
- `src/game/routeProposalRuntime.js` is the scene-independent bridge between
  guidance state and the same-origin LLM relay. It applies only validated
  proposals and lets deterministic rules keep legal moves and costs
  authoritative.
- `src/ui/guidanceControls.js` supplies compact Phaser controls for the proposal panel.
- `src/scenes/PocketBotWorkshop.js` wires Ask Bot, approve, node-click redirect,
  why, unknowns, inspect first, and mark partial into deterministic
  map/resource state.

Acceptance:

- the player can feel that guidance changes the bot's behavior,
- resources are spent deliberately,
- user controls teach navigation hygiene, not only yes/no approval,
- the LLM never directly mutates game state.

### PB-010 Session Lesson Application

Status: implemented.

Goal:

Make the bot apply one player lesson later in the same run using context-window memory only.

User-visible behavior:

After the player corrects the bot, the next proposal reflects that correction in a simple visible way.

Example:

```text
Player correction: Try cheap scouting before the expensive path.
Later bot proposal: You corrected me toward cheap scouting first, so I will inspect the clue node before using pocket money.
```

Implemented files:

- `src/domain/traces.js`
- `src/domain/guidanceLoop.js`
- `src/llm/routeProposalPrompt.js`
- `src/ui/tracePanel.js`
- `tests/domain/traces.test.js`
- `tests/domain/guidanceLoop.test.js`
- `tests/llm/routeProposalSchema.test.js`
- `tests/llm/routeProposalPrompt.test.js`
- `tests/llm/routeProposalClient.test.js`
- `tests/platform/routeProposalRelay.test.js`

Session lessons should be typed:

```yaml
session_lesson:
  lesson_type: cut_preference | residue_rule | resource_priority | stop_condition
  user_words:
  operational_reading:
    when:
    prefer_move:
    before_move:
    what_must_not_be_lost:
  applies_to_next_proposal: true
```

Test plan:

- user correction creates a session lesson trace,
- session lesson is included in the next LLM prompt context,
- session lesson can influence a validated proposal,
- cut-preference lessons can change inspect-before-act ordering,
- residue-rule lessons can make the next proposal carry "what remains unknown",
- stop-condition lessons can block premature full-success claims,
- lesson is not persisted beyond reload/session reset,
- `npm run test` and `npm run build` pass.

Implementation note:

- `src/domain/traces.js` promotes trace lesson candidates into active session lessons and serializes them in the player-facing `session_lesson` shape.
- `src/domain/guidanceLoop.js` applies the active session lesson by rewriting the next pending proposal inside the current run only.
- Cut-preference lessons can force inspect-before-act ordering, residue-rule lessons carry unresolved residue into the next proposal, and stop-condition lessons normalize premature full-success claims through route proposal validation.
- `src/llm/routeProposalPrompt.js`, `src/llm/routeProposalClient.js`, and `server/routeProposalRelay.js` pass the active session lesson to the bounded LLM proposal path.
- `src/ui/tracePanel.js` shows promoted lesson wording without claiming durable training.

Acceptance:

- Phase 1 demonstrates "bot learns during this run" without persistent memory,
- lessons teach route judgment and stop conditions, not only surface preferences,
- UI wording does not claim durable training,
- resetting the run clears the lesson.

### PB-011 Trace Cards

Status: implemented.

Goal:

Generalize receipts into trace cards for the broader resource-judgment loop.

User-visible behavior:

The player can inspect what happened: move proposed, user guidance, resource spent, information revealed, residue carried, lesson applied, and outcome.

Implemented files:

- `src/domain/traces.js`
- `src/ui/tracePanel.js`
- `src/scenes/PocketBotWorkshop.js`
- `tests/domain/traces.test.js`
- `tests/domain/guidanceLoop.test.js`
- `tests/llm/routeProposalPrompt.test.js`

Trace cards should include:

```yaml
trace_card:
  proposal:
  accepted_move:
  resource_spend:
  revealed:
  suppressed_or_not_checked:
  residue_carried_forward:
  context_changes:
  lesson_candidate:
  reentry_note:
  landfall_status: open | partial | safe_finish | false_finish
```

Test plan:

- trace card records proposal, accepted move, resource costs, map result, and lesson fields,
- trace card records revealed information and remaining residue separately,
- residue carries into the next proposal context when relevant,
- final run trace can distinguish safe finish, partial finish, false finish, and open run,
- money-like actions can reference existing receipt data,
- trace history order is stable,
- latest trace can be inspected,
- `npm run test` and `npm run build` pass,
- browser/manual check confirms trace panel is readable.

Implementation note:

- `src/domain/traces.js` creates move trace cards, receipt-backed trace cards, trace-card summaries, latest-trace lookup, partial-trace marking, and compact next-proposal context.
- `src/domain/guidanceLoop.js` appends a trace card after each accepted move and marks the latest trace partial when the user marks a result partial.
- `src/ui/tracePanel.js` formats the latest trace for the Phaser detail panel and HUD archive label.
- `src/llm/routeProposalPrompt.js` accepts trace cards as bounded prompt context so PB-010 can derive/apply session lessons without a separate state path.

Acceptance:

- receipts are no longer the only trace type,
- trace cards support both attention spending and Nimiq pocket events,
- the user can reconstruct why the bot acted,
- the user can see what remains unknown and why the next move follows from it.

### PB-012 Nimiq Testnet Pocket

Status: implemented for local browser fallback and explicit Nimiq Pay NIM status checks. Android emulator Nimiq Pay Testnet verification was performed on June 7, 2026.

Goal:

Connect the Nimiq Mini App/testnet surface to the resource game without turning
the app into a payment dashboard. For competition submission, this slice must
also close the earlier NIM/USDT support decision or explicitly mark submission
readiness blocked.

User-visible behavior:

When opened in Nimiq Pay testnet, the player can explicitly connect and see testnet pocket/status. In local mode, the player sees a clear fallback pocket. Nimiq pocket money is framed as collectible/recharge value for Bot Attention, not as broad wallet access.

Expected files:

- `.codex/agents/pocket_bot_nimiq_platform_worker.toml`
- `src/platform/nimiqMiniApp.js`
- `src/domain/allowance.js`
- `src/domain/resourceRules.js`
- `src/ui/resourceMeters.js`
- `src/scenes/PocketBotWorkshop.js`
- `tests/platform/nimiqMiniApp.test.js`
- `tests/ui/resourceMeters.test.js`
- `tests/ui/tracePanel.test.js`
- optional tests for any testnet top-up adapter if added

Subagent activation:

- `.codex/agents/pocket_bot_nimiq_platform_worker.toml` is active.
- Keep this worker scoped to Nimiq Mini App SDK/provider boundaries, local
  fallback, testnet status/top-up experiments, and platform tests.
- Do not let the platform worker introduce mainnet operations, broad wallet
  authority, uncontrolled signing/sending, checkout, x402, or payment execution.

Test plan:

- local fallback is safe and readable,
- connect/status action is explicit and user-triggered,
- testnet-only wording is visible when applicable,
- no mainnet operation is reachable,
- no uncontrolled sign/send/payment is reachable,
- Nimiq Pocket display remains separate from Bot Attention,
- pocket/recharge events produce traces that distinguish value top-up from bot navigation moves,
- `npm run test` and `npm run build` pass,
- Nimiq Pay testnet manual check is planned or performed when device/emulator path is available.

Implementation note:

- The implemented Phase 1 support path is native NIM testnet/local pocket status, not USDT transfer support. USDT remains future scope because it would require EVM account requests and token balance/transfer handling that are not needed for the current resource-judgment loop.
- `src/platform/nimiqMiniApp.js` reads Mini App environment/language/network, keeps wallet operations disabled, and exposes `requestNimiqPocketStatus()` for explicit user-triggered status checks.
- The status check calls only `init()`, `listAccounts()`, `isConsensusEstablished()`, and `getBlockNumber()` when Nimiq Pay is present. It does not call sign, send, checkout, or EVM transfer methods.
- `src/scenes/PocketBotWorkshop.js` shows the local/testnet pocket status in the HUD and records a pocket trace when the user clicks `Check`.
- `src/domain/traces.js` supports `pocket` trace cards that distinguish pocket status/value from Bot Attention spend.
- Verification on June 6, 2026: `npm run test` passed with 123 tests, `npm run build` passed, and a local headless Chrome smoke loaded the scene with one canvas, visible `Check` pocket control, no runtime/log errors, no failed network requests, and no DOM API-key leak.
- Verification on June 7, 2026: Android emulator Nimiq Pay was forced to Testnet through the hidden dev menu, loaded `http://10.0.2.2:8080/?pb012-pay=1` through Mini Apps, connected the local Mini App, and confirmed the Pocket Bot scene rendered inside Nimiq Pay with a provider-backed Nimiq Pocket status trace. The trace showed one connected Nimiq account and a provider block height; log review found no crash, sign, send, checkout, transaction prompt, or mainnet error.

Acceptance:

- Nimiq testnet is integrated as low-stakes value surface,
- the chosen Phase 1 support path is NIM testnet/local pocket status with emulator-confirmed Nimiq Pay provider status,
- pocket money can be shown as collectible or recharge potential,
- pocket value never masks Bot Attention scarcity,
- the bot still spends Bot Attention on moves,
- wallet access never grants broad bot authority.

### PB-012A Desktop/Mobile Browser TestAlbatross Status

Status: postponed. This slice remains the intended future path for direct
desktop/mobile browser Nimiq testnet support, but it is no longer part of the
current Android/Nimiq Pay competition submission path.

Goal:

Add a desktop/mobile browser Nimiq TestAlbatross status adapter while preserving
the existing Nimiq Pay Mini App provider path and local fallback. This is a
product usability slice, not a replacement for Mini App competition
verification.

User-visible behavior:

When opened in a normal desktop or mobile browser, the player can explicitly
check a read-only Nimiq TestAlbatross status. The HUD labels this as desktop or
browser testnet status, shows network/head/consensus information when available,
and records a pocket-status trace. The game remains playable if TestAlbatross
connection fails or the browser cannot support the Web Client path.

Expected files:

- `src/platform/nimiqDesktopTestnet.js`
- `src/platform/nimiqPocketRuntime.js`
- `src/platform/nimiqMiniApp.js`
- `src/ui/resourceMeters.js`
- `src/scenes/PocketBotWorkshop.js`
- `tests/platform/nimiqDesktopTestnet.test.js`
- `tests/platform/nimiqPocketRuntime.test.js`
- `tests/ui/resourceMeters.test.js`
- `vite/config.dev.mjs`
- `vite/config.prod.mjs`
- `package.json`
- `docs/product/source_attribution.md`

Implementation plan:

- Add `@nimiq/core` only when this slice starts.
- Add the Vite WebAssembly/top-level-await plugins required by the Nimiq Web
  Client Vite integration.
- Keep Web Client setup behind `src/platform/nimiqDesktopTestnet.js`.
- Add a small runtime chooser in `src/platform/nimiqPocketRuntime.js`:

```text
if Nimiq Pay is present
  use Mini App provider status
else if desktop/browser TestAlbatross is enabled
  use Web Client TestAlbatross status
else
  use local fallback
```

- Keep the first Web Client behavior read-only: initialize client, connect to
  `TestAlbatross`, wait for consensus or a bounded timeout, read head height,
  and return a pocket-status object.
- Do not generate keys, import mnemonics, persist wallet data, sign, send,
  request Hub checkout, or broadcast transactions in this slice.

Test plan:

- unit-test runtime selection priority: Nimiq Pay provider wins over desktop
  Web Client, desktop Web Client wins over local fallback, local fallback works
  when neither runtime is available,
- mock the Web Client factory so automated tests do not require live consensus,
- verify Web Client timeout/error paths return readable fallback status,
- verify no sign/send/payment/key-management method is called or exposed,
- verify pocket-status trace cards still distinguish pocket value/status from
  Bot Attention spend,
- run `npm run test` and `npm run build`,
- manually test the hosted/local app in Windows Chrome or Edge for visible
  TestAlbatross status.

Acceptance:

- the same hosted app remains playable on Windows, Android, iPhone, and Nimiq
  Pay,
- Windows desktop browser can show real Nimiq TestAlbatross read-only status
  when the Web Client path is available,
- unsupported browsers fall back cleanly without blocking gameplay,
- Nimiq Pay Mini App provider behavior remains unchanged,
- repeat the separate Nimiq Pay device/emulator verification before final
  submission if this adapter changes.

### PB-013 Market Signal Scout Witness-Governed Vertical Slice

Goal:

Turn the current abstract resource-judgment map into the first playable Market
Signal Scout level, **Golden Signal**, using the witness ledger as static
governance scaffolding without live market data, trading behavior, or reward
mode.

This slice should make the core game legible before polish: the player teaches
Pocket Bot not to treat a bright signal as safe until support, exit friction,
FOMO pressure, or remaining residue has been inspected or named.

User-visible behavior:

- the first run is framed as Golden Signal, not a generic shortcut map,
- Pocket Bot initially proposes entering/acting on the bright signal,
- the player can ask what remains unknown,
- Pocket Bot names support, exit, and FOMO residue,
- the player can redirect to inspect support,
- historical witness cards can show the actual source headline/title plus a
  short in-game mechanics connector, for example:
  - headline/title: `Cboe Plans December 10 Launch of Bitcoin Futures Trading`,
  - connector: `Futures Gate makes the signal brighter, but the route may be crowded`,
- accepted inspection spends Bot Attention and reveals a bounded clue,
- a trace records action, cost, reveal, still unknown, and lesson,
- the player can remember "Fast signals need support",
- the next proposal reflects the session lesson by suggesting safer route,
  exit check, or partial finish,
- a finish/hindsight card distinguishes safe, partial, false, or open outcome.

Scenario and data boundary:

- use `docs/product/scenarios/market_signal_scout.md` as the scenario source,
- use `docs/product/scenarios/market_witness_governance.md` and
  `src/game/scenarios/marketWitnessLedger.js` as static witness-governance
  scaffolding,
- use Binance Public Data as the selected bundled market-data source:
  - source: `https://github.com/binance/binance-public-data` and
    `https://data.binance.vision/`,
  - license note: MIT licence stated in the Binance Public Data README,
  - pair: Binance spot `BTCUSDT`,
  - interval: `1d` for campaign arc; optional `1h` only for a small local
    level window if needed,
  - bundled shape: prefer transformed static fixture over broad raw archives,
  - fixture path: `src/game/scenarios/data/marketSignalScoutBtcusdtWindows.js`,
  - scope note: Binance BTCUSDT venue history, not a global Bitcoin price index,
- treat the Bitcoin fixture as a license evidence packet before bundling:
  - update `docs/product/source_attribution.md` from planned source to adopted
    source with the exact data archive URL or URLs used, README/LICENSE evidence
    URL, retrieval date, pair, interval, covered date range, raw-vs-transformed
    shipping status, and transformation method,
  - fixture metadata must include provider, source URLs, license name,
    license evidence URL, retrieval date, source archive/checksum URL or checksum
    note, pair, interval, covered range, venue scope, transformed/static status,
    raw-data-shipped flag, and `doesNotEstablish` boundary claims,
  - if raw zip or CSV data is ever shipped, include the exact license evidence
    and checksum reference for that archive; if only a transformed gameplay
    fixture is shipped, keep the archive URL and checksum reference as authoring
    evidence without bundling the broad raw archive,
  - tests must fail when this metadata is missing, vague, or claims a global BTC
    index, live trading rule, investment advice, or reward-replay basis,
- use actual historic headline/source titles as attributed witness labels, but
  pair each with a fictionalized mechanics connector that explains what it
  changes in the level,
- keep event headline witnesses separate from market-data witnesses: headlines
  may unlock event pressure, exit pressure, or FOMO pressure; they must not
  establish a trading rule,
- do not add live market APIs, raw historic data downloaders, exchange or
  brokerage behavior, price prediction, portfolio advice, or persistent trading
  strategy export,
- do not use real NIM rewards or penalties,
- player-facing pocket capacity remains Pocket Spark / Nimiq Pocket status, not
  a trading balance or trade entry cost,
- terminal reveal, hindsight-only fields, and later level outcomes must not be
  visible to proposal generation before finish.

Expected files:

- `src/game/scenarios/marketSignalScoutScenario.js`
- `src/game/scenarios/marketWitnessLedger.js`
- `src/game/scenarios/data/marketSignalScoutBtcusdtWindows.js`
- `src/game/pocketBotState.js`
- `src/scenes/PocketBotWorkshop.js`
- `src/domain/lossyMap.js`
- `src/domain/guidanceLoop.js`
- `src/domain/traces.js`
- `src/domain/finishJudgment.js`
- `tests/game/marketSignalScoutScenario.test.js`
- `tests/game/marketWitnessLedger.test.js`
- `docs/product/scenarios/market_signal_scout.md`
- `docs/product/source_attribution.md`

Test plan:

- Golden Signal scenario loads with starting Bot Attention, Context Slots, and
  Pocket Spark / pocket-status capacity,
- bundled Binance BTCUSDT fixture declares source URL, MIT license note,
  license evidence URL, retrieval date, source archive/checksum reference,
  venue-scope residue, interval, covered range, raw-vs-transformed shipping
  status, and transformed/static status,
- headline witness cards include source headline/title, source URL, and
  mechanics connector text,
- witness ledger boundary remains static, non-trading, and non-reward-bearing,
- terminal reveal is unavailable to proposal generation before finish,
- support, exit, and FOMO pressure are hidden or residualized at level start,
- ask-unknowns names support, exit, and FOMO residue,
- inspect support spends Bot Attention and creates trace residue,
- entering/acting with hidden support or exit friction creates false finish,
- named but unresolved uncertainty can produce partial finish without a false
  safe claim,
- simulated gain cannot by itself produce safe finish,
- trace card records level, action, cost, reveal, still unknown, and lesson,
- next proposal changes after the remembered lesson,
- proposal schema / adapter blocks live-trading, wallet-authority,
  brokerage/exchange execution, portfolio advice, persistent strategy export,
  and terminal-reveal leakage,
- `npm run test` and `npm run build` pass,
- browser/manual check confirms the first run is understandable on mobile/Nimiq
  Pay sized viewports.

Acceptance:

- Golden Signal can be played as a complete 60-second loop,
- the player can explain the lesson as "bright signals need support" without
  seeing CRPM jargon,
- the player sees at least one real historic headline/source title connected to
  a game mechanic rather than a trading instruction,
- Pocket Bot visibly learns a session-only proposal preference,
- trace and finish cards make remaining uncertainty recoverable,
- no UI copy implies live trading, real rewards, real NIM penalties, price
  prediction, or wallet/exchange authority,
- the slice is ready for PB-POLISH instead of competing with it.

### PB-014 Market World Runtime Seed

Goal:

Turn the current Golden Signal proof of concept into the first real gameplay
seed for Market Signal Scout by making the market-world level contract drive
runtime state, player actions, trace records, and finish pressure.

This is a layered transition, not a full scene rewrite. The current verified
Golden Signal scene remains the playable baseline while the runtime source of
truth moves from the older `marketSignalScoutScenario.js` shape toward
`src/game/scenarios/marketWorldLevels.js`.

Player-facing seed loop:

1. Pocket Bot sees the bright signal and wants to enter quickly.
2. The player can use `Ask Hidden` to name support, exit, and crowd/FOMO
   unknowns without spending Bot Attention.
3. `Wide Scan` prepares a crowd/FOMO inspection; Bot Attention is spent only
   after `Approve`.
4. `Check Exit` prepares an exit-friction inspection; Bot Attention is spent
   only after `Approve`.
5. `Support Check` remains available as the easiest first good judgment path.
6. `Approve Enter` before enough relations are checked creates false or partial
   finish pressure rather than automatic success.
7. Trace cards record the world relation revealed, what remains unknown, and
   the return condition for later re-entry.
8. A hindsight card unlocks only after a finish state, never inside proposal
   context.

Transition plan:

1. Freeze the current playable baseline with regression tests for:
   `Ask Hidden -> Wide Scan -> Approve -> Trace` and
   `Support Check -> Approve -> Historic Witness -> Trace`.
2. Add a market-world runtime adapter that can initialize the Golden Signal
   arena from `getGoldenSignalMarketWorldLevel()` without changing the Phaser
   scene first.
3. Add explicit relation-state runtime for signal-support, signal-exit,
   signal-event, and signal-crowd links. Each relation should be hidden,
   visible, revealed, residualized, or resolved.
4. Move first-slice arena actions into the runtime adapter:
   `ask_remaining_unknown`, `wide_scan`, `check_exit`, `check_support`, and
   `approve_enter`.
5. Keep prepare/approve separation: redirects and scans may update the pending
   proposal, but only approved moves spend Bot Attention or mutate revealed
   relation state.
6. Upgrade trace records to include `worldRelationRevealed`,
   `stillUnknown`, `residueCarriedForward`, `returnCondition`, and optional
   historic witness references.
7. Upgrade finish judgment to derive safe, partial, false, or open finish from
   relation state instead of from a single node outcome.
8. Point `PocketBotWorkshop` at the adapter output only after domain tests
   prove parity with the current Golden Signal path.
9. Retire duplicated old scenario fields only after the new runtime can supply
   the same player-facing proposal, map, witness, trace, and finish data.

Implementation status:

- Step 1 baseline freeze is implemented in
  `tests/game/goldenSignalPlayableBaseline.test.js`. It locks the current
  `Ask Hidden -> Wide Scan -> Approve -> Trace`, `Support Check -> Approve ->
  Historic Witness -> Trace Archive`, and `Ask Bot -> bounded proposal ->
  Approve` paths before the adapter work starts.
- Step 2, the Market World Runtime Adapter, is implemented in
  `src/game/scenarios/marketWorldLevelAdapter.js` with coverage in
  `tests/game/marketWorldLevelAdapter.test.js`. It adapts
  `getGoldenSignalMarketWorldLevel()` into `arenaSpine`, `relationStates`,
  `proposalPreview`, and a hindsight-free `proposalContext`, and the live
  Golden Signal scenario now consumes that adapter output.
- Step 3, explicit relation-state runtime mutation, is implemented in
  `src/domain/marketWorldRuntime.js` with coverage in
  `tests/domain/marketWorldRuntime.test.js` and guidance-loop integration
  checks. Ask Hidden now residualizes named unknowns, prepared arena actions
  store pending relation context without spending resources, and approved arena
  moves reveal or residualize signal-support, signal-exit, signal-event, and
  signal-crowd relations.
- Step 6 has a first non-UI metadata hook: move trace cards can now carry
  `worldRelationRevealed`, residualized relations, still-unknown relation
  labels, and a return condition. Player-facing trace rendering can be refined
  later.
- Step 7, relation-derived finish judgment, is implemented in
  `src/domain/marketWorldRuntime.js` and wired through
  `src/domain/guidanceLoop.js`. Direct bright-signal entry now becomes a
  relation-derived false finish when support, exit, and crowd pressure were
  hidden; entry after named residue or partial checks becomes partial finish;
  and entry after support, exit, and crowd are checked becomes safe finish.
  Non-finish scout moves remain open-run.
- Player-facing finish-state presentation is implemented through
  `src/ui/tracePanel.js` and `src/scenes/PocketBotWorkshop.js`. Finish actions
  now show a safe/partial/false finish card, keep open scout moves on the
  existing witness/trace path, and unlock the market-world hindsight card only
  after a finish state.
- The PB-014 phone-readability polish slice is implemented in
  `src/ui/tracePanel.js`, `src/domain/traces.js`, and related tests. Trace
  Archive cards now translate market-world relation IDs into player-facing
  terms, show checked relation, still-hidden residue, return condition, and
  historic witness count, and finish cards use relation-derived checked /
  unresolved sets so safe, partial, and false finishes remain readable on phone
  portrait. Hosted/Nimiq Pay screenshots and final media checks remain in the
  PB-POLISH lane.

Expected files:

- `src/domain/marketWorldRuntime.js`
- `src/game/scenarios/marketWorldLevelAdapter.js`
- `src/game/scenarios/marketWorldLevels.js`
- `src/game/scenarios/marketSignalScoutScenario.js`
- `src/domain/guidanceLoop.js`
- `src/domain/traces.js`
- `src/domain/finishJudgment.js`
- `src/scenes/PocketBotWorkshop.js`
- `tests/domain/marketWorldRuntime.test.js`
- `tests/game/marketWorldLevelAdapter.test.js`
- existing Golden Signal scenario, guidance-loop, trace, finish, and UI tests

Test plan:

- market-world adapter loads Golden Signal from `marketWorldLevels.js` and
  exposes only legal first-slice player actions,
- opening relation state hides support, exit, event, and crowd pressure while
  making the bright signal visible,
- `Ask Hidden` exposes remaining unknowns without spending Bot Attention,
- `Wide Scan` prepares a crowd/FOMO inspection without spending resources,
- approving `Wide Scan` spends Bot Attention, reveals or residualizes the
  crowd relation, and creates a trace,
- `Check Exit` prepares an exit-friction inspection without spending resources,
- approving `Check Exit` spends Bot Attention, reveals or residualizes exit
  friction, and creates a trace,
- `Support Check` still follows the verified witness-backed judge path,
- `Approve Enter` with unchecked support/exit/crowd pressure produces false or
  partial finish pressure rather than safe finish,
- hindsight-only fields remain unavailable before finish,
- player-facing labels contain no CRPM jargon,
- existing LLM `Ask Bot` proposal flow remains bounded to legal moves and does
  not gain trading, wallet, or market-data authority,
- `npm run check:no-secrets`, `npm run test`, and `npm run build` pass,
- browser/manual smoke confirms mobile portrait usability for
  `Ask Hidden -> Wide Scan -> Approve -> Trace` and
  `Support Check -> Approve -> Historic Witness -> Trace`.

Acceptance:

- `marketWorldLevels.js` becomes the active level contract for the Golden
  Signal gameplay seed, not only supporting design material,
- the first minute tells a clearer story: the bot is tempted, the player reveals
  hidden forces, attention is spent deliberately, and traces make residue
  recoverable,
- the current hosted/Nimiq Pay judge path remains recoverable as a regression
  path,
- no live market data, investment advice, trading execution, wallet authority,
  mainnet value, or persistent trading strategy is introduced,
- the code has a reversible cut: if the full scene refactor needs more time,
  the adapter can keep feeding the existing scene.

Residue / risks:

- relation-state runtime adds more state complexity than the current node-only
  scene,
- UI density can increase if every relation is surfaced at once,
- scenario writing becomes a real content-production task, not only a code task,
- old scenario shape and new market-world shape may overlap temporarily,
- finish judgment can become confusing if safe/partial/false/open are not
  explained through trace and hindsight cards.

Controls:

- keep the first seed to one arena and five actions,
- keep CRPM vocabulary private to docs and tests,
- keep player copy simple: signal, support, exit, crowd, hidden, trace, finish,
- preserve the verified proof-of-concept path until PB-014 passes tests and
  browser checks.

### PB-POLISH Submission Vertical Slice

Goal:

Make one complete Pocket Bot loop feel polished, mobile-readable, and
competition-testable without expanding into a full RPG.

User-visible behavior:

A new user can open the app and understand the loop in about 60 seconds:
goal, map, bot proposal, approve/correct, attention spend, reveal, residue,
trace card, and finish status. Nimiq pocket value is visibly connected to
control and trace, not just branding.

Expected files:

- `src/scenes/PocketBotWorkshop.js`
- `src/ui/`
- `README.md`
- `docs/product/pitch.md`
- `docs/product/source_attribution.md`
- `docs/product/competition_scorecard.md`
- optional screenshots or demo assets under an attributed asset location

Test plan:

- mobile viewport/browser check for first impression, layout, and readable text,
- first-use path takes about 60 seconds without reading external instructions,
- one complete loop can be demonstrated from reset,
- trace card is readable on mobile,
- Nimiq pocket is visible and meaningful without masking Bot Attention,
- final status is safe/partial/false/open, not vague success,
- README/submission description explains what the app does, who it is for, and how it uses Nimiq Pay,
- screenshots/demo assets are attributed if used.
- competition scorecard reflects the current vertical-slice status.

PB-POLISH-001 Golden Signal 60-second path and witness-card polish:

Status: implemented for local browser, mobile viewport, and Android emulator
Nimiq Pay local Mini App smoke checks on June 8, 2026.

- expose a compact historic witness cue in the HUD,
- show a `Historic Witness` card with source headline/title, mechanics
  connector, source provider, and "not trading advice" boundary when a
  witness-bearing node is selected or inspected,
- preserve trace cards as the archive while letting the witness card be the
  immediate post-inspection reveal for Support Check / Futures Gate surfaces,
- keep the first useful route legible: the bot wants the bright signal; the
  player can Ask Hidden, Wide Scan, Check Exit, redirect to Support Check,
  approve inspection, and carry trace residue forward,
- use a phone-portrait layout for narrow browser viewports and high-density
  Nimiq Pay WebViews so the game does not collapse into a tiny desktop strip,
- document hosted Vercel usage for normal browser and Nimiq Pay
  emulator/device checks.
- keep `docs/product/market_world_model.md`,
  `docs/product/pocket_bot_arena_narrator_role_cut.md`,
  `src/game/scenarios/marketWorldLevels.js`, and
  `src/game/scenarios/marketWorldLevelAdapter.js` as the market-world contract
  and adapter layer; the scene must not silently replace the verified Support
  Check judge path.

PB-POLISH-002 Hosted Vercel/Nimiq Pay submission verification:

Status: verified on hosted Vercel and Android emulator Nimiq Pay on June 9,
2026. The first hosted Nimiq Pay attempt exposed a desktop-centered canvas
strip and relay fallback issue. After redeploy, the hosted app served the
fixed stylesheet and current bundle, classified the embedded WebView as phone
portrait, opened inside Nimiq Pay, completed Support Check -> Approve ->
Historic Witness -> Trace Archive, and kept sign, send, checkout, top-up,
payment, and mainnet authority inactive.

Hosted relay verification on June 9, 2026 returned `200` from
`/api/route-proposal` in live `openai` mode using `gpt-5.4-mini`, with a
bounded `inspect -> support-check` proposal and one governance warning.
After the `Ask Bot` scene wiring was deployed, the Android emulator Nimiq Pay
check tapped `Ask Bot`, received a live `openai` proposal using
`gpt-5.4-mini`, updated the pending move to `inspect -> Support Check`, kept
Bot Attention at `10/10` before approval, then approved the deterministic move,
spent `2` Bot Attention and `1` User Guidance, opened the Historic Witness
card, and recorded `Trace 1: Open run` without any wallet authority prompt.

- record the active hosted Vercel URL in `docs/architecture/deployment.md`
  and `docs/product/competition_scorecard.md` once the project owner confirms
  the deployment target. Canonical URL:
  `https://nimi-run-code-repo.vercel.app`,
- verified: open that URL in a normal browser and verify the Phaser scene plus
  same-origin `/api/route-proposal` relay behavior,
- verified: open the same hosted URL inside Nimiq Pay Mini Apps on the Android
  emulator,
- verified: run the 60-second judge path: Support Check -> Approve ->
  Historic Witness -> Trace Archive,
- verified: run the hosted scene-level LLM path: Ask Bot -> live OpenAI
  proposal -> Approve -> Historic Witness -> Trace Archive,
- verified: confirm the Mini App shell still shows Nimiq Pay/local status
  correctly and does not trigger sign, send, checkout, top-up, payment, or
  mainnet authority,
- verified: update the test strategy and competition scorecard with the hosted
  verification result.

Acceptance:

- one vertical slice is polished enough for early access feedback,
- the CRPM path remains visible through mechanics, not jargon,
- submission story and demo materials explain the binding-layer idea in plain language,
- marketing/distribution work supports the product rather than distorting it.

### PB-MARKET Early Access And Community Feedback

Goal:

Turn the polished vertical slice into real feedback and visible competition
engagement without distorting the product into a marketing-first build.

User-visible behavior:

No new mechanic is required. The project has clear submission materials, a demo
path, public progress, and feedback from real users.

Expected files:

- `README.md`
- `docs/product/pitch.md`
- `docs/product/competition_scorecard.md`
- optional screenshots, GIF, or demo video assets in an attributed location
- GitHub issues or documented feedback notes

Test plan:

- draft a 250-word submission description,
- prepare a 30-60 second demo video or GIF,
- prepare 3-5 screenshots,
- update README with "What it does / Who it is for / How it uses Nimiq Pay",
- get at least 3 external testers through the judge path,
- record feedback as GitHub issues, docs notes, or trace-style feedback cards,
- make at least one improvement from feedback,
- share progress in the competition community when entering a competition cycle.

Acceptance:

- submission materials explain the app in plain language,
- external feedback has affected at least one change,
- competition scorecard marketing/distribution fields are updated,
- community engagement supports the CRPM/resource-judgment story rather than replacing it.

## Milestone Sequence

Implemented groundwork:

1. PB-001 Domain Rule Decision.
2. PB-002 Receipt Creation.
3. PB-003 Allowance Spend Execution.
4. PB-004 Pocket Bot Workshop Scene Shell.
5. PB-004A Competition Compliance Floor.
6. PB-005 RPG Map Tooling And Scene Direction.
7. PB-006 Core Resource Model.
8. PB-006A Run Session And Transition Runtime.
9. PB-007 LLM Route Proposal Bridge.
10. PB-008 Lossy Map Scenario.
11. PB-009 User-Bot Guidance Loop.
12. PB-011 Trace Cards.
13. PB-010 Session Lesson Application.
14. PB-012 Nimiq Testnet Pocket.
15. PB-013 Market Signal Scout Witness-Governed Vertical Slice.

Revised next sequence:

16. PB-014 Market World Runtime Seed.
17. PB-POLISH Submission Vertical Slice regression and final media pass.
18. PB-MARKET Early Access And Community Feedback.
19. PB-012A Desktop/Mobile Browser TestAlbatross Status, postponed until after
    the Android/Nimiq Pay submission path is stable.

This order keeps CRPM/resource-judgment mechanics as the spine, keeps
Golden Signal as the playable core, and moves immersion work through a
testable market-world runtime seed before broader polish or marketing.

## Next Commit Recommendation

The next implementation commit should be:

```text
feat: add market world runtime seed
```

## Risks And Controls

- **Risk:** LLM behavior becomes the game authority.
  **Control:** LLM proposes; deterministic resource rules decide legality and cost.
- **Risk:** API keys leak into the browser bundle.
  **Control:** all LLM API calls go through a server-side relay and tests guard against direct client provider calls.
- **Risk:** Phase 1 grows into a full RPG.
  **Control:** keep the first map small: one goal, a few nodes, one lesson, one pocket/recharge element.
- **Risk:** Nimiq pocket money overshadows Bot Attention.
  **Control:** treat Nimiq as value/recharge layer; Bot Attention is the resource spent on task navigation.
- **Risk:** The competition rubric pushes the app into a generic wallet/payment game.
  **Control:** treat competition requirements as a delivery floor; keep the playable loop centered on attention, residue, trace, and finish judgment.
- **Risk:** The app is internally playable but not competition-ready.
  **Control:** track submission blockers separately, especially NIM/USDT support, Mini App framework compliance, first-try usability, and source attribution.
- **Risk:** NIM/USDT uncertainty is resolved too late.
  **Control:** treat it as the first external competition question; decide NIM, USDT, or both during PB-004A and ask official support if the intended testnet path is ambiguous.
- **Risk:** Testnet wallet connection is confused with spend permission.
  **Control:** testnet interactions are explicit, user-triggered, and never grant broad bot authority.
- **Risk:** Persistent-memory claims appear too early.
  **Control:** Phase 1 only uses session/context-window memory; Phase 2 owns durable memory and skills.
- **Risk:** The RPG-map framework choice locks the app into unnecessary complexity.
  **Control:** pick the smallest Phaser/Vite-compatible workflow that supports map nodes, fog/reveal state, and interaction zones.
- **Risk:** Goal arrival is treated as full success.
  **Control:** trace cards and final run state must distinguish safe finish, partial finish, false finish, and open voyage.
- **Risk:** The game teaches route choice but not navigation discipline.
  **Control:** proposals, map nodes, guidance controls, session lessons, and trace cards must preserve cut price, residue, and re-entry information in player-facing language.
- **Risk:** The market-world refactor breaks the verified submission path.
  **Control:** make PB-014 an adapter-first transition, keep Support Check as a regression path, and do not retire old scenario fields until the new runtime passes domain, build, and browser checks.

## Out Of Scope For Phase 1

- Nimiq mainnet value,
- uncontrolled wallet operations,
- broad wallet permissions,
- real checkout or payment-info entry,
- x402 integration,
- real paid external service execution,
- persistent memory or durable user profiles,
- autonomous model self-improvement claims,
- real-value rewards,
- combat, inventory bloat, or large RPG content,
- multi-bot or multi-user systems,
- exportable cross-session trace history,
- durable preference learning,
- real-world task bridge execution.

## Completion Criteria

The revised Phase 1 implementation plan is complete when:

- the app runs through the Vite workflow,
- `npm run test` and `npm run build` pass,
- the first screen is a playable Phaser RPG-style resource-navigation scene,
- the scene shows Bot Attention, Nimiq Pocket, User Attention prompts, and Context Capacity,
- the map contains fog, hidden pressure, ambiguous route nodes, and at least one false-landfall trap or partial-finish case,
- the bot can request an LLM-backed structured route proposal through a safe backend relay,
- route proposals include resource cost, considered alternatives, cut price, remaining residue, and a stop condition,
- the player can guide or correct the bot with controls that expose reasons, remaining unknowns, inspect-first redirection, and partial-finish marking,
- accepted moves spend Bot Attention and update map state,
- at least one session lesson changes a later proposal within the same run,
- trace cards show resource spend, revealed information, suppressed/not-checked information, residue carried forward, user guidance, and lesson application,
- the final run state distinguishes safe finish, partial finish, false finish, and open run,
- Nimiq testnet/local fallback pocket status is visible without mainnet risk,
- competition submission readiness has no unresolved Mini App framework, NIM/USDT support, no-secrets, attribution, license, or first-try usability blocker,
- one polished vertical slice can be explained in a short submission description and optional demo walkthrough,
- competition scorecard is current and does not mark submission ready while required items are blocked or unknown,
- at least 3 external testers have tried the judge path before final submission, unless the project owner explicitly skips competition submission,
- no persistent memory, mainnet spend, x402 flow, real paid external service, checkout, or autonomous spending exists.
