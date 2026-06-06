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

## Source Documents

- Product requirements: `docs/product/requirements.md`
- Product roadmap: `docs/product/roadmap.md`
- Phase 0 alignment: `docs/product/phase0_alignment.md`
- Product pitch: `docs/product/pitch.md`
- Art bible: `docs/product/art_bible.md`
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

This work should be retained as supporting infrastructure. It becomes one possible resource-governance mechanic inside the broader resource-judgment game, not the active center of Phase 1.

Next work should pivot to the playable user-bot interaction loop:

- competition compliance floor,
- resource model,
- LLM route-proposal bridge,
- lossy map scenario,
- user guidance controls,
- session-only lesson application,
- trace cards,
- Nimiq testnet pocket integration.

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
- `pocket_bot_docs_keeper` - source-of-truth docs, competition attribution register, status updates, and role maintenance.
- `pocket_bot_reviewer` - read-only review for correctness, scope drift, missing tests, attribution gaps, and MVP boundary risk.

Deferred role:

- `pocket_bot_nimiq_platform_worker` should be added when PB-012 starts. It
  should own `src/platform/nimiqMiniApp.js`, Nimiq Mini App SDK integration,
  local fallback/testnet status behavior, no-mainnet/no-uncontrolled-wallet
  boundaries, and matching platform tests. Do not add this role earlier unless
  PB-012 is pulled forward.

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

Goal:

Add Phase 1 LLM support for route/move proposals.

User-visible behavior:

Pocket Bot can propose a next move in natural language based on the current goal, visible map state, resources, context slots, residue carried from prior moves, and current session trace.

Expected files:

- `src/llm/routeProposalSchema.js`
- `src/llm/routeProposalPrompt.js`
- `src/llm/routeProposalClient.js`
- server-side relay file or function under the repo's chosen backend/platform location
- `tests/llm/routeProposalSchema.test.js`
- `tests/llm/routeProposalClient.test.js`
- optional `tests/platform/openaiRelay.test.js`

Route proposal shape should include:

```yaml
route_proposal:
  move_type: inspect | ask | remember | forget | skip | act
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
  trace_summary:
```

Test plan:

- schema accepts a valid route proposal,
- schema rejects unknown actions, missing costs, missing residue/cut-price fields, or unbounded tool/payment requests,
- schema rejects proposals that treat a path choice as proof of the whole map,
- client calls only the backend relay, not OpenAI directly from browser code,
- relay reads API key from environment,
- relay model id is configurable,
- relay has a safe offline/mock mode for local demo and tests,
- `npm run test` and `npm run build` pass.

Acceptance:

- LLM proposals are structured, bounded, and validated before entering game state,
- every proposal says what it reveals, what it leaves unresolved, and what cheaper/safer alternative was considered,
- no provider API key is bundled into client code,
- failure/offline states produce a readable fallback move,
- the bot's proposal can reference only current session context and provided game state.

### PB-008 Lossy Map Scenario

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

Goal:

Connect LLM proposals, deterministic resource checks, and player guidance.

User-visible behavior:

The bot proposes a move. The player can approve, redirect, ask why this route, ask what remains unknown, ask for a cheaper route, ask the bot to inspect first, mark a result as partial, or tell the bot to remember/forget a clue. The bot spends resources only after a legal move is accepted.

Expected files:

- `src/scenes/PocketBotWorkshop.js`
- `src/ui/guidanceControls.js`
- `src/ui/resourceMeters.js`
- `src/game/pocketBotState.js`
- `src/domain/resourceRules.js`
- `src/domain/traces.js`
- `tests/domain/resourceRules.test.js`
- `tests/domain/traces.test.js`

Test plan:

- approved inspect move spends Bot Attention and reveals state,
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

Acceptance:

- the player can feel that guidance changes the bot's behavior,
- resources are spent deliberately,
- user controls teach navigation hygiene, not only yes/no approval,
- the LLM never directly mutates game state.

### PB-010 Session Lesson Application

Goal:

Make the bot apply one player lesson later in the same run using context-window memory only.

User-visible behavior:

After the player corrects the bot, the next proposal reflects that correction in a simple visible way.

Example:

```text
Player correction: Try cheap scouting before the expensive path.
Later bot proposal: You corrected me toward cheap scouting first, so I will inspect the clue node before using pocket money.
```

Expected files:

- `src/domain/traces.js`
- `src/game/pocketBotState.js`
- `src/llm/routeProposalPrompt.js`
- `src/ui/tracePanel.js`
- `tests/domain/traces.test.js`
- `tests/llm/routeProposalSchema.test.js`

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

Acceptance:

- Phase 1 demonstrates "bot learns during this run" without persistent memory,
- lessons teach route judgment and stop conditions, not only surface preferences,
- UI wording does not claim durable training,
- resetting the run clears the lesson.

### PB-011 Trace Cards

Goal:

Generalize receipts into trace cards for the broader resource-judgment loop.

User-visible behavior:

The player can inspect what happened: move proposed, user guidance, resource spent, information revealed, residue carried, lesson applied, and outcome.

Expected files:

- `src/domain/traces.js`
- `src/ui/tracePanel.js`
- `src/scenes/PocketBotWorkshop.js`
- `tests/domain/traces.test.js`

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

Acceptance:

- receipts are no longer the only trace type,
- trace cards support both attention spending and Nimiq pocket events,
- the user can reconstruct why the bot acted,
- the user can see what remains unknown and why the next move follows from it.

### PB-012 Nimiq Testnet Pocket

Goal:

Connect the Nimiq Mini App/testnet surface to the resource game without turning
the app into a payment dashboard. For competition submission, this slice must
also close the earlier NIM/USDT support decision or explicitly mark submission
readiness blocked.

User-visible behavior:

When opened in Nimiq Pay testnet, the player can explicitly connect and see testnet pocket/status. In local mode, the player sees a clear fallback pocket. Nimiq pocket money is framed as collectible/recharge value for Bot Attention, not as broad wallet access.

Expected files:

- `src/platform/nimiqMiniApp.js`
- `src/domain/allowance.js`
- `src/domain/resourceRules.js`
- `src/ui/resourceMeters.js`
- `src/scenes/PocketBotWorkshop.js`
- `tests/platform/nimiqMiniApp.test.js`
- optional tests for any testnet top-up adapter if added

Subagent activation:

- Add `.codex/agents/pocket_bot_nimiq_platform_worker.toml` when this slice
  starts.
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

Acceptance:

- Nimiq testnet is integrated as low-stakes value surface,
- the chosen NIM/USDT support path is implemented or submission readiness is marked blocked,
- pocket money can be shown as collectible or recharge potential,
- pocket value never masks Bot Attention scarcity,
- the bot still spends Bot Attention on moves,
- wallet access never grants broad bot authority.

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

Revised next sequence:

8. PB-006A Run Session And Transition Runtime.
9. PB-007 LLM Route Proposal Bridge.
10. PB-008 Lossy Map Scenario.
11. PB-009 User-Bot Guidance Loop.
12. PB-011 Trace Cards.
13. PB-010 Session Lesson Application.
14. PB-012 Nimiq Testnet Pocket.
15. PB-POLISH Submission Vertical Slice.
16. PB-MARKET Early Access And Community Feedback.

This order keeps CRPM/resource-judgment mechanics as the spine, pulls
competition blockers forward, and leaves polish/submission work as a focused
vertical-slice pass rather than a product pivot.

## Next Commit Recommendation

The next implementation commit should be:

```text
feat: add run session runtime
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
