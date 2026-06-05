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

## Source Documents

- Product requirements: `docs/product/requirements.md`
- Product roadmap: `docs/product/roadmap.md`
- Phase 0 alignment: `docs/product/phase0_alignment.md`
- Product pitch: `docs/product/pitch.md`
- Infrastructure context: `docs/product/infrastructure_context.md`
- Development workflow: `docs/process/development_workflow.md`
- Test strategy: `docs/testing/test_strategy.md`

When older docs still describe the allowance-only MVP, use this plan and `docs/product/roadmap.md` as the current Phase 1 scope until those docs are fully harmonized.

## Current Phase 1 Status

Implemented groundwork from the earlier allowance-control cut:

- PB-001 Domain Rule Decision is implemented.
- PB-002 Receipt Creation is implemented, including future-facing receipt classification data.
- PB-003 Allowance Spend Execution is implemented.
- PB-004 Pocket Bot Workshop Scene Shell is implemented with Mini App framework compatibility, local fallback status, and a Tool Scout hover witness interaction.

This work should be retained as supporting infrastructure. It becomes one possible resource-governance mechanic inside the broader resource-judgment game, not the active center of Phase 1.

Next work should pivot to the playable user-bot interaction loop:

- RPG-style map/tooling decision,
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

### PB-005 RPG Map Tooling And Scene Direction

Goal:

Choose the Phaser/Vite 2D RPG-map workflow for Phase 1.

User-visible behavior:

No major player-facing feature yet. This slice establishes how the map will be authored and rendered so the next slices can build the game loop without fighting the scene foundation.

Expected files:

- `docs/planning/mvp_implementation_plan.md`
- optional `docs/architecture/rpg_map_tooling.md`
- `src/scenes/PocketBotWorkshop.js`
- optional map asset/config files under the most specific existing asset directory, or a new focused map directory if needed.

Test plan:

- compare Phaser-native tilemap support, Tiled, LDtk, or equivalent Vite-friendly RPG/tilemap approach,
- pick the smallest workflow that supports tiles, object layers/nodes, fog/revealed state, and click/keyboard interaction,
- verify the chosen workflow can represent pressure/residue metadata on nodes without overcomplicating art production,
- `npm run build` passes after any dependency/config change,
- browser/manual check confirms the scene still renders.

Acceptance:

- selected workflow is documented,
- the choice does not require replacing Phaser/Vite,
- the scene can represent nodes, paths, obstacles/fog, interaction zones, hidden pressure, and reveal/residue state,
- implementation can proceed without committing to final art.

### PB-006 Core Resource Model

Goal:

Add the revised Phase 1 resource model.

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

Expected files:

- `src/domain/lossyMap.js`
- `src/game/resourceMapScenario.js`
- `src/scenes/PocketBotWorkshop.js`
- map data/assets as selected in PB-005
- `tests/domain/lossyMap.test.js`

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
- `npm run test` and `npm run build` pass.

Acceptance:

- the map makes ambiguity visible,
- each node asks "is this worth spending attention on?",
- at least one node teaches that reaching a goal-looking state is not automatically safe landfall,
- the first map is small enough to finish in a short competition demo.

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

Connect the Nimiq Mini App/testnet surface to the resource game without introducing real-value risk.

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
- pocket money can be shown as collectible or recharge potential,
- pocket value never masks Bot Attention scarcity,
- the bot still spends Bot Attention on moves,
- wallet access never grants broad bot authority.

## Milestone Sequence

Implemented groundwork:

1. PB-001 Domain Rule Decision.
2. PB-002 Receipt Creation.
3. PB-003 Allowance Spend Execution.
4. PB-004 Pocket Bot Workshop Scene Shell.

Revised next sequence:

5. PB-005 RPG Map Tooling And Scene Direction.
6. PB-006 Core Resource Model.
7. PB-007 LLM Route Proposal Bridge.
8. PB-008 Lossy Map Scenario.
9. PB-009 User-Bot Guidance Loop.
10. PB-010 Session Lesson Application.
11. PB-011 Trace Cards.
12. PB-012 Nimiq Testnet Pocket.

This order gets the game surface and resource rules clear before deeper Nimiq testnet behavior, while still adding LLM support early enough to shape the playable loop.

## Next Commit Recommendation

The next implementation commit should be:

```text
feat: choose rpg map workflow for pocket bot
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
- no persistent memory, mainnet spend, x402 flow, real paid external service, checkout, or autonomous spending exists.
