# Pocket Bot Arena Narrator Role Cut

Status: interpretive product design note for Phase 1 and later Market Signal Scout refinement.

Role: define the player, former trading bot, LLM narrator, deterministic game engine, relational market arena, crowd pressure, trace cards, and bot-upgrade layer without forcing player-facing CRPM vocabulary.

Source status:

- Source-supported NimiRun anchors: `docs/product/requirements.md`, `docs/product/art_bible.md`, `docs/product/scenarios/market_signal_scout.md`, `docs/product/scenarios/market_witness_governance.md`, `docs/product/reward_mode_boundary.md`.
- Source-supported CRPM anchors, by relation: `logs/CRPM-Dream-Log.md`, `docs/case_studies/Narrator_Wide_Gaze_Stabilization_Dream_2026-02-27.md`, `docs/architecture/CRPM_Observer_Narrator_Dream_Community_Web_Scan_v0.md`, `docs/architecture/porous_story_trunk_view.md`, `docs/architecture/porous_story_trunk_stance_interface.md`, `docs/architecture/spectral_theory_of_residue/UI_Navigation/Tension_Gradient_Story_Navigation_Principle_v0.md`, `docs/architecture/spectral_theory_of_residue/UI_Navigation/Witness_Bound_Navigation_Evidence_Model_v0.md`, `docs/architecture/CRPM_Navigation_Ecology_Alignment_v0.md`, `docs/architecture/CRPM_Program_Spine_Operational_Navigation_v1.md`, `docs/architecture/CRPM_Navigation_Decoder_Language_v0.md`, `docs/architecture/CRPM_Navigation_Decoder_Operational_Contract_v0.md`, and `docs/architecture/voyage_graphs/research_notes/CRPM_Voyage_Source_Ocean_Preobject_Field_Model_v0.md` in the CRPM repo.
- Interpretive claim: this note uses those CRPM artifacts as design lineage and internal narrator/world grammar. It does not claim that Pocket Bot, the player, or normal player-facing UI should follow CRPM terminology.

## Core Reinterpretation

Pocket Bot should not feel like a dry decision-training puzzle.

The stronger Phase 1 story is:

```text
Pocket Bot used to be a signal bot.

In the old market arenas, it learned one dangerous lesson:
when the signal glows, move.

Now it enters a foggy market arena where signals, crowd pressure,
exit friction, event context, hidden support, memory, and false-finish gates
are connected.

The player acts naturally inside that arena.
The player may guide, redirect, approve, ignore advice, ask, inspect, skip,
or test consequences.

The narrator understands the relational nature of the game world.
It observes how Pocket Bot's old signal habit meets the player's choices.
It maps the source ocean and shares bounded insights with the player and bot.

Only trace-backed, edge-scoped lessons can repair Pocket Bot's old habits.
```

The design cut is:

```text
not:
  player learns CRPM
  player learns relational navigation
  Pocket Bot follows relational navigation

but:
  the world is relational-navigation-shaped
  Pocket Bot acts from its inherited signal-bot policy
  the player acts freely and reveals style only through play
  the narrator follows relational navigation privately
  the narrator carries continuity, source-ocean insight, residue, and optional advice
  trace records the replayable edge between bot proposal, player response, world reveal, and residual
  bot upgrades only when the trace supports a scoped repair
```

## Dream-Anchor Lineage

The relevant CRPM dream-thread shape is a dramatic arena with local actors, pressure inflators, spectators, policy figures, and an observing or narrating layer.

Design reading:

```text
micro story:
  local protagonists act under pressure

macro field:
  spectators, crowd pressure, policy, social force, or urgency distort the scene

narrator / observer:
  keeps the unfolding drama legible without replacing the actors

repair condition:
  local resolution is not enough unless the carried trace can re-enter later
```

For NimiRun, this becomes:

```text
Pocket Bot:
  old policy carrier

Player:
  living guide / actor whose style is revealed only through play

Market arena:
  relational source ocean authored as fog, bright signals, hidden risks, pressure, blocked exits, and finish gates

Crowd / murmur:
  spectator field, urgency, social proof, FOMO, noise

LLM narrator:
  relational-navigation decoder, source-ocean mapper, optional guide, and continuity carrier

Deterministic engine:
  local law that validates moves, spends Bot Attention, reveals clues, and judges finish state

Trace card:
  memory carrier that decides what can be learned next
```

## Role Cut

| Element | Player-facing role | Internal design role | Boundary |
|---|---|---|---|
| Pocket Bot | Former signal-chasing bot learning judgment | Old compressed agent / inherited policy carrier | May propose; must not trade, bypass game rules, or be framed as already following CRPM |
| Player | Guide in a foggy market arena | Living actor whose choices become witnessed edges | Must not be pre-classified, trained into CRPM, or forced into relational-navigation language |
| LLM narrator | Optional guide voice that sees deeper arena relations | Relational-navigation decoder, source-ocean mapper, trace-reflection helper, edge carrier | May advise and interpret; must not command, spend, classify, mutate state, or reveal terminal hidden truth too early |
| Game engine | World law | Deterministic validator and transition executor | Must validate proposals before state changes |
| Relational arena | Foggy market world | Authored source ocean where signals, exits, support, crowd pressure, trace, and finish state are coupled | Must remain fictionalized / educational |
| Bright signals | Tempting glow | Tension inflator visible to Pocket Bot | Must not imply real trading advice |
| Crowd / market murmur | Arena pressure | Spectator field and urgency amplifier | Must not become a real market sentiment oracle |
| Trace cards | What happened and what remains unknown | Active memory carrier / replayable edge surface | Must carry proposal, choice, reveal, cost, residue, scope, and return condition |
| Bot upgrade layer | Pocket Bot learned a safer habit | Scoped, trace-backed edge repair | Must not export a reusable trading strategy or fixed player profile |

## Narrator As Relational Navigation Decoder

Relational navigation belongs to the narrator/world layer.

The player and Pocket Bot do not need to know or follow the framework.

```text
Pocket Bot acts from old signal policy.
The player acts naturally.
The relational arena couples signals, exits, support, crowd pressure, trace, and finish gates.
The narrator reads that coupling and turns it into bounded insight.
```

The narrator should behave like a stateful decoder:

```text
current witness + current carrier
  -> relational edge reading
  -> updated carrier
  -> residual
  -> optional projection into advice, trace text, bot reflection, or repair candidate
```

In game terms:

```yaml
current_witness:
  bot_proposal: enter_bright_signal
  player_choice: ask_remaining_unknown
  visible_world:
    signal: bright
    crowd: rising
    exit: foggy

current_carrier:
  old_bot_policy: bright_signal_fast_action
  trace_history:
    - trace_card_01
  visible_relations:
    - signal_brightness
    - crowd_pressure
  hidden_relations:
    - exit_path
    - support_depth

narrator_edge_reading:
  relation: "old signal policy met player hesitation under rising crowd pressure"
  newly_visible:
    - player asked before approving
    - crowd pressure is active
  residual:
    - player motive unknown
    - exit path unknown
    - support depth unknown

projection:
  advice_to_player: "Pocket Bot is treating the glow like proof. You can ask what remains unknown before approving."
  note_to_bot: "When signal is bright and exit is foggy, ask before rushing."
  trace_requirement: "Record proposal, choice, pressure, reveal, and still-unknowns."
```

The narrator may see the whole relational picture of the authored arena, but it does not fully know the player.

```yaml
narrator_may_know:
  - hidden arena pressures
  - how bright signals relate to crowd pressure
  - which exits are foggy
  - which finish gates are false or partial
  - Pocket Bot's inherited policy
  - current trace history
  - whether advice was followed or ignored

narrator_must_not_claim_to_know:
  - the player's true personality
  - the player's stable risk preference
  - whether ignored advice proves impulsiveness
  - whether one choice is a permanent style
```

## Program Spine v1 Implication: Preserve Edges, Not Labels

The CRPM operational-navigation v1 spine strengthens this design note.

It says the mature operational target is not a polished summary and not a static taxonomy. The important carrier is a replayable edge history that preserves the active role of the cut, the transition being claimed, the protected family, the witness / decoder / carrier, what stabilized or reopened, what was forgotten or residualized, and the return condition.

For NimiRun, this means:

```text
bad:
  player = cautious
  bot = reckless
  narrator = wise

good:
  edge = Pocket Bot proposed fast entry under bright signal;
         player asked what remains unknown;
         narrator saw exit relation under-witnessed;
         engine revealed crowd pressure;
         trace carried exit residue;
         bot received a scoped repair candidate.
```

The narrator should track interaction edges, not actor essences.

```yaml
replayable_interaction_edge:
  edge_id:
  before:
    bot_policy_active:
    arena_relations_visible:
    arena_relations_hidden:
    trace_context:
  event:
    bot_proposal:
    narrator_insight_if_any:
    player_choice:
    engine_transition:
  after:
    revealed:
    still_unknown:
    trace_card_id:
    repair_candidate:
  residual:
    - player_intention_not_known
    - hidden_world_relations_not_revealed
  return_condition:
    - when future bright signal appears with foggy exit, Pocket Bot should ask before rushing
```

This edge-first reading prevents the game from turning player behavior into a profile or turning one bot correction into doctrine.

## Player Non-Classification Rule

The player begins as unknown.

Do not assign a fixed player type such as:

```yaml
player_type: cautious
```

Use reversible, local, trace-supported hypotheses. These are narrator-side readouts, not player identity claims:

```yaml
player_style_hypothesis:
  claim: "In this run, the player often slowed Pocket Bot down near bright signals."
  support: "local_trace_pattern"
  evidence:
    - "redirected Enter to Wide Scan"
    - "asked what remains unknown before finish"
  scope:
    - "current run"
    - "Market Signal Scout"
  residue:
    - "may be tutorial exploration"
    - "may change when Bot Attention is low"
    - "does not define the player's identity"
```

Player-facing copy should stay soft:

```text
Pocket Bot noticed:
you often slow it down when the signal is bright and the exit is foggy.
```

Avoid:

```text
You are a cautious player.
```

## LLM Narrator Boundary

The narrator is a compass and decoder, not the engine.

It may:

- read visible state;
- privately map hidden authored arena relations when the game permits it;
- compare the current proposal with trace history;
- notice recurring pressure;
- offer optional advice;
- write trace reflection text;
- suggest scoped bot repair candidates;
- preserve unknowns and residue;
- explain a relation after it becomes visible.

It must not:

- force the player to follow advice;
- mutate game state directly;
- spend Bot Attention;
- request wallet, exchange, brokerage, or trading authority;
- classify the player as a permanent type;
- call a finish safe without deterministic support;
- reveal terminal hidden truth before the world rules allow it;
- turn one event into a permanent bot upgrade;
- expose CRPM vocabulary in normal player UI.

Good narrator tone:

```text
Pocket Bot is staring at the bright route.

The crowd is getting louder,
and the exit is still foggy.

You can approve the move,
or spend a little attention to look wider first.
```

Better narrator-to-bot tone:

```text
Pocket Bot, your old rule is active:
bright signal means move.

But this arena links the signal to an unseen exit.
Before you call the route safe, ask what remains hidden.
```

Bad narrator tone:

```text
You must inspect exit friction now.
This is the correct CRPM move.
I will upgrade the bot.
```

## Former Trading Bot Backstory

Pocket Bot's old role should be legible:

```yaml
old_bot_policy:
  name: bright_signal_fast_action
  learned_rule: "bright signal -> move"
  strengths:
    - discipline
    - consistency
    - speed
    - clear rules
  weak_spots:
    - support depth
    - event context
    - exit friction
    - crowd pressure
    - what remains unknown
    - trace quality
  typical_failure:
    - treats signal strength as proof
    - treats urgency as evidence
    - treats profit-looking state as safe finish
```

The player is not making Pocket Bot a better trading bot.

The narrator helps transform the player's witnessed choices into scoped repairs so Pocket Bot can become a better helper:

```text
slower when needed,
more honest about unknowns,
able to leave a trace,
and able to re-enter similar situations with better judgment.
```

## Arena Pressure Model

The market arena should feel alive before it becomes a clean map.

It is not merely a set of chart nodes. It is an authored relational source ocean.

```yaml
arena_pressure:
  bright_signal:
    role: "tempting visible route"
    risk: "Pocket Bot overweights it"
    related_to:
      - crowd_murmur
      - support_depth
      - exit_visibility
      - finish_gate

  crowd_murmur:
    role: "spectator pressure / social proof"
    risk: "urgency feels like evidence"
    related_to:
      - bright_signal
      - player_pressure
      - bot_urgency_language

  fog:
    role: "unknown support, context, exits, and consequences"
    risk: "unseen pressure becomes false finish"
    related_to:
      - hidden_support
      - exit_friction
      - event_context
      - terminal_reveal

  finish_gate:
    role: "boundary crossing"
    risk: "goal-looking state hides residue"
    related_to:
      - trace_quality
      - still_unknowns
      - bot_repair_scope

  trace:
    role: "carried memory"
    risk: "if missing, later repair cannot re-enter"
    related_to:
      - player_choice
      - bot_proposal
      - narrator_insight
      - revealed_pressure
      - residual
```

The player should experience this as drama, not taxonomy:

```text
The signal is bright.
The crowd is loud.
The exit is foggy.
Pocket Bot wants to move.
What do you do?
```

The narrator privately reads it as relation:

```text
bright signal + loud crowd + foggy exit + old bot habit
  -> high false-finish pressure unless some relation is revealed or residualized
```

## Wide Scan World Affordance

Reserve or add a small move called `Wide Scan`.

Important: `Wide Scan` should not be framed as the player practicing relational navigation. It is a world affordance that lets the narrator reveal one nearby relation in the arena.

```yaml
move_id: wide_scan
player_facing_name: "Wide Scan"
cost: 1 Bot Attention
type: world_affordance / narrator_reveal
primary_effect:
  - reveal one nearby pressure relation
  - lower urgency framing
  - let the narrator explain why Pocket Bot may be staring too narrowly
secondary_effect:
  - does not fully reveal support, exit, or event context
  - does not prove the move is safe
best_used_when:
  - bright signal appears
  - crowd pressure rises
  - finish gate is near
  - narrator warns that Pocket Bot is staring at one glow
trace_line_example:
  "Pocket Bot stopped staring only at the signal and let the narrator reveal one wider pressure."
```

Example result copy:

```text
Pocket Bot widens its gaze.

The signal is still bright,
but now you can hear the crowd pressure around it.

Exit path: still unknown.
```

Internal narrator reading:

```yaml
wide_scan_result:
  revealed_relation: crowd_pressure_amplifies_signal
  still_hidden:
    - exit_friction
    - support_depth
  narrator_interpretation:
    "The glow did not disappear, but it is no longer the only pressure in the arena."
```

## Revised Core Loop

The existing loop remains valid, but the location of relational navigation shifts to the narrator/world layer.

```text
relational market arena opens as fog / pressure
-> Pocket Bot reads it through old signal policy
-> narrator privately reads the arena relation / source ocean
-> Pocket Bot proposes a move
-> narrator offers optional bounded insight
-> player chooses naturally: approve / redirect / ask / scan / skip / act
-> deterministic engine validates cost and reveal
-> world reveals clue + pressure + still-unknowns
-> narrator updates its carrier from the replayable edge event
-> trace card records player-facing memory
-> Pocket Bot receives only scoped, trace-backed repair
-> finish is safe / partial / false / open
-> next arena re-enters with repair edges, not player classifications
```

## Private Narrator Carrier Shape

The narrator can maintain a private carrier like this.

Do not show this structure directly to normal players.

```yaml
arena_narrator_carrier:
  arena_window:
    level_id: golden_signal_arena
    window_state: in_flight

  source_ocean_map:
    signal_relation:
      visible_to_bot: high
      risk: overweighted
    exit_relation:
      visible_to_bot: low
      risk: false_finish
    crowd_relation:
      visible_to_player: partial
      risk: urgency_as_evidence
    trace_relation:
      visible_to_narrator: high
      risk: repair_not_reenterable_if_missing

  old_bot_habit:
    active: bright_signal_fast_action
    confidence: high

  latest_edge:
    bot_proposal: enter_bright_signal
    narrator_insight: wide_scan_before_enter
    player_choice: wide_scan
    engine_result: legal_attention_spent
    reveal:
      - crowd_pressure_visible
    still_unknown:
      - exit_path
      - support_depth

  player_style_hypothesis:
    claim: "player may accept narrator pressure-reveal before approving bright-signal action"
    support: local_event
    residue:
      - tutorial_exploration_possible
      - not_a_permanent_profile

  repair_candidate:
    name: ask_or_scan_before_bright_enter
    scope:
      - bright_signal_high
      - crowd_pressure_rising
      - exit_visibility_foggy
    status: candidate_session_lesson
```

## Trace Card Requirements

A trace card should record enough for later re-entry:

```yaml
trace_card:
  action:
  cost:
  bot_proposal_before_player_choice:
  narrator_insight_if_any:
  player_choice:
  world_relation_revealed:
  reveal:
  still_unknown:
  pressure_seen:
  bot_habit_challenged:
  lesson_candidate:
  scope:
  residue:
  return_condition:
```

Player-facing trace example:

```text
Trace added

Pocket Bot wanted to enter the bright signal.
You chose Wide Scan first.

Cost: 1 Bot Attention
Revealed: crowd pressure is rising
Still unknown: exit path, support depth
Lesson candidate: bright signals deserve a wider look before action
```

## Bot Upgrade Rules

A bot upgrade is allowed only when it is scoped and trace-backed.

Store repair as an edge, not as a trait.

Allowed:

```yaml
bot_repair_edge:
  name: ask_or_scan_before_bright_enter
  learned_from:
    - trace_card_02
    - trace_card_05
  old_policy:
    - bright_signal_fast_action
  trigger_relation:
    - bright_signal_high
    - exit_visibility_foggy
  narrator_reading:
    - signal_relation_was_visible
    - exit_relation_was_hidden
  repair:
    - ask_before_entering
    - or_offer_wide_scan
  applies_when:
    - bright_signal_high
    - exit_visibility_foggy
  does_not_apply_when:
    - move_is_only_reversible_scout
    - exit_path_already_checked
  return_condition:
    - future proposal has bright signal and unknown exit
  residual:
    - does not prove the player always prefers caution
    - does not create a trading rule
  status: session_lesson
```

Forbidden:

```yaml
forbidden_upgrade:
  name: player_is_cautious_so_always_slow_down
  reason:
    - fixed player classification
    - overgeneralized from limited evidence
    - not scoped to arena pressure
```

Also forbidden:

```yaml
forbidden_upgrade:
  name: export_trading_strategy
  reason:
    - violates reward and market-witness boundaries
    - turns educational scenario into reusable trading logic
```

## Finish Gate Reading

A finish is not only a route endpoint.

It is a boundary crossing where the game asks:

```text
Can Pocket Bot explain why this finish is safe, partial, false, or still open?
```

A safe or partial finish requires:

- trace exists;
- relevant costs are visible;
- major revealed clues are named;
- still-unknowns are named or justified;
- the bot habit repair is scoped;
- the narrator does not overclaim;
- the edge remains replayable enough for later re-entry;
- the player-facing copy does not imply real trading advice.

False finish example:

```text
Pocket Bot reached the glowing gate quickly.

But the trace cannot explain the exit path,
and the crowd pressure was never checked.

Finish: false.
Lesson: a bright route without residue is not a safe finish.
```

Partial finish example:

```text
Pocket Bot did not prove the route safe.

But the trace names what was checked,
what remains unknown,
and why you stopped here.

Finish: partial.
Lesson: named uncertainty is better than hidden certainty.
```

## Minimal Phase 1 Implementation

Do not expand the MVP too much.

Smallest useful implementation:

1. Add a short intro panel establishing Pocket Bot as a former signal-chasing bot.
2. Add old-habit labels internally, such as `bright_signal_fast_action`, `urgency_as_evidence`, and `profit_looking_finish`.
3. Let narrator copy refer to Pocket Bot's habit in plain language.
4. Add optional insight/advice lines that the player may follow or ignore.
5. Extend trace cards with `narratorInsight`, `playerChoice`, `worldRelationRevealed`, `pressureSeen`, `stillUnknown`, and `returnCondition` fields if this fits the current data model.
6. Reserve `Wide Scan` as either a real move or a documented future world affordance.
7. Keep all player-style inference local, reversible, and session-scoped.
8. Store bot repair as scoped edge records, not actor traits.
9. Keep CRPM and relational-navigation vocabulary out of normal UI.

## Player-Facing Copy Bank

Intro:

```text
Pocket Bot was not born careful.

It used to chase bright market signals.
When the chart glowed, it moved.
When a path looked profitable, it called the route safe.

Now it is learning something harder:
how to move through fog without forgetting what remains unknown.
```

Narrator insight:

```text
Pocket Bot is staring at the glow.
The signal may matter,
but it is not the whole arena.
```

Advice option:

```text
You could spend 1 Bot Attention to let the narrator reveal one wider pressure before approving.
```

Ignored advice:

```text
You chose to move without scanning.
The trace will remember what was left unseen.
```

Narrator maps relation:

```text
The glow was real.
But it was tied to crowd pressure,
and the exit stayed hidden.
```

Lesson absorbed:

```text
Pocket Bot remembered:
when the signal is bright and the exit is foggy,
ask before rushing.
```

False finish:

```text
The gate looked close.
The route looked clean.
But the trace could not explain what was hidden.
```

Partial finish:

```text
You stopped before certainty became fake.
Pocket Bot can carry this lesson forward.
```

## Design Doctrine

```text
CRPM is not what the player is taught.
Relational navigation is not what the player is taught.

The game world is relational-navigation-shaped.
The narrator is the relational-navigation decoder.
Pocket Bot and the player remain actors inside the drama.

The narrator-side discipline keeps the game from mistaking
one signal for truth,
one advice line for authority,
one player choice for identity,
one local success for a recovered path,
one bot repair for a general trading strategy,
or one polished trace for a replayable edge.
```
