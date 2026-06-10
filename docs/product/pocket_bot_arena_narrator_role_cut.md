# Pocket Bot Arena Narrator Role Cut

Status: interpretive product design note for Phase 1 and later Market Signal Scout refinement.

Role: define the player, former trading bot, LLM narrator, deterministic game engine, market arena, crowd pressure, trace cards, and bot-upgrade layer without forcing player-facing CRPM vocabulary.

Source status:

- Source-supported NimiRun anchors: `docs/product/requirements.md`, `docs/product/art_bible.md`, `docs/product/scenarios/market_signal_scout.md`, `docs/product/scenarios/market_witness_governance.md`, `docs/product/reward_mode_boundary.md`.
- Source-supported CRPM anchors, by relation: `logs/CRPM-Dream-Log.md`, `docs/case_studies/Narrator_Wide_Gaze_Stabilization_Dream_2026-02-27.md`, `docs/architecture/CRPM_Observer_Narrator_Dream_Community_Web_Scan_v0.md`, `docs/architecture/porous_story_trunk_view.md`, `docs/architecture/porous_story_trunk_stance_interface.md`, `docs/architecture/spectral_theory_of_residue/UI_Navigation/Tension_Gradient_Story_Navigation_Principle_v0.md`, `docs/architecture/spectral_theory_of_residue/UI_Navigation/Witness_Bound_Navigation_Evidence_Model_v0.md`, and `docs/architecture/voyage_graphs/research_notes/CRPM_Voyage_Source_Ocean_Preobject_Field_Model_v0.md` in the CRPM repo.
- Interpretive claim: this note uses those CRPM artifacts as design lineage and internal grammar. It does not claim that normal players should learn CRPM terminology.

## Core Reinterpretation

Pocket Bot should not feel like a dry decision-training puzzle.

The stronger Phase 1 story is:

```text
Pocket Bot used to be a signal bot.

In the old market arenas, it learned one dangerous lesson:
when the signal glows, move.

Now it enters foggy arenas where signals, crowd pressure,
exit friction, event context, and hidden support interfere.

The player does not control the market.
The player teaches Pocket Bot how to notice what kind of pressure it is under.

The narrator watches the relation between player and bot.
It offers advice.
The player may follow or ignore it.

Only trace-backed lessons can repair Pocket Bot's old habits.
```

The design cut is:

```text
not:
  player learns CRPM

but:
  player plays naturally
  Pocket Bot reveals its old compression habit
  narrator carries continuity and optional advice
  trace records what happened, what changed, and what remains unknown
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
  living guide whose style is revealed only through play

Market arena:
  fog, bright signals, hidden risks, pressure, blocked exits

Crowd / murmur:
  spectator field, urgency, social proof, FOMO, noise

LLM narrator:
  optional guide and continuity carrier

Deterministic engine:
  local law that validates moves, spends Bot Attention, reveals clues, and judges finish state

Trace card:
  memory carrier that decides what can be learned next
```

## Role Cut

| Element | Player-facing role | Internal design role | Boundary |
|---|---|---|---|
| Pocket Bot | Former signal-chasing bot learning judgment | Old compressed agent / inherited policy carrier | May propose; must not trade or bypass game rules |
| Player | Guide in a foggy market arena | Living stance source revealed through choices | Must not be pre-classified or forced into CRPM language |
| LLM narrator | Optional guide voice | Continuity reader, advice source, trace-reflection helper | May advise; must not command, spend, classify, or mutate state |
| Game engine | World law | Deterministic validator and transition executor | Must validate proposals before state changes |
| Bright signals | Tempting glow | Tension inflator | Must not imply real trading advice |
| Crowd / market murmur | Arena pressure | Spectator field and urgency amplifier | Must remain fictionalized / educational |
| Trace cards | What happened and what remains unknown | Active memory carrier | Must carry residue, cost, reveal, lesson, and scope |
| Bot upgrade layer | Pocket Bot learned a safer habit | Scoped, trace-backed repair | Must not export a reusable trading strategy |

## Player Non-Classification Rule

The player begins as unknown.

Do not assign a fixed player type such as:

```yaml
player_type: cautious
```

Use reversible, local, trace-supported hypotheses:

```yaml
player_style_hypothesis:
  claim: "In this run, the player often slows Pocket Bot down near bright signals."
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

The narrator is a compass, not the engine.

It may:

- read visible state;
- compare the current proposal with trace history;
- notice recurring pressure;
- offer optional advice;
- write trace reflection text;
- suggest scoped bot repair candidates;
- preserve unknowns and residue.

It must not:

- force the player to follow advice;
- mutate game state directly;
- spend Bot Attention;
- request wallet, exchange, brokerage, or trading authority;
- classify the player as a permanent type;
- call a finish safe without deterministic support;
- turn one event into a permanent bot upgrade;
- expose CRPM vocabulary in normal player UI.

Good narrator tone:

```text
Pocket Bot is staring at the bright route.

The crowd is getting louder,
but the exit is still foggy.

You can approve the move,
or spend a little attention to scan the arena first.
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

The player is teaching Pocket Bot to become a better helper:

```text
slower when needed,
more honest about unknowns,
able to leave a trace,
and able to re-enter similar situations with better judgment.
```

## Arena Pressure Model

The market arena should feel alive before it becomes a clean map.

```yaml
arena_pressure:
  bright_signal:
    role: "tempting visible route"
    risk: "Pocket Bot overweights it"

  crowd_murmur:
    role: "spectator pressure / social proof"
    risk: "urgency feels like evidence"

  fog:
    role: "unknown support, context, exits, and consequences"
    risk: "unseen pressure becomes false finish"

  finish_gate:
    role: "boundary crossing"
    risk: "goal-looking state hides residue"

  trace:
    role: "carried memory"
    risk: "if missing, later repair cannot re-enter"
```

The player should experience this as drama, not taxonomy:

```text
The signal is bright.
The crowd is loud.
The exit is foggy.
Pocket Bot wants to move.
What do you make visible first?
```

## Wide Scan Stance Move

Add or reserve a small stance move called `Wide Scan`.

Purpose: prevent the binary of `act` versus `deep inspect` by giving the player a cheap stabilizing move.

```yaml
move_id: wide_scan
player_facing_name: "Wide Scan"
cost: 1 Bot Attention
type: stance_move
primary_effect:
  - reveal one nearby pressure class
  - lower urgency framing
  - prevent Pocket Bot from treating one glow as the whole route
secondary_effect:
  - does not fully reveal support, exit, or event context
  - does not prove the move is safe
best_used_when:
  - bright signal appears
  - crowd pressure rises
  - finish gate is near
  - narrator warns that Pocket Bot is staring at one glow
trace_line_example:
  "You made Pocket Bot stop staring at the signal and scan the whole arena."
```

Example result copy:

```text
Pocket Bot widens its gaze.

The signal is still bright,
but now you can hear the crowd pressure around it.

Exit path: still unknown.
```

## Revised Core Loop

The existing loop remains valid, but its meaning shifts.

```text
market arena opens as fog / pressure
-> Pocket Bot reads one bright route
-> narrator offers optional pressure-reading advice
-> player chooses stance:
     wide scan / inspect / ask / redirect / approve / skip / act
-> deterministic engine validates and spends Bot Attention
-> world reveals clue + pressure + still-unknowns
-> trace card records action, cost, reveal, residue, player response
-> narrator summarizes only what the trace supports
-> Pocket Bot receives scoped repair candidate
-> finish is safe / partial / false / open
-> next arena re-enters with trace-backed habit changes
```

## Private Narrator Readout Shape

The narrator can maintain a private packet like this.

Do not show this structure directly to normal players.

```yaml
narrator_readout:
  arena_window:
    level_id: golden_signal_arena
    window_state: in_flight

  old_bot_habit:
    active: bright_signal_fast_action
    confidence: high

  visible_pressure:
    bright_signal: high
    crowd_murmur: rising
    exit_visibility: foggy
    event_context: unknown

  latest_interaction:
    bot_proposal: enter_bright_signal
    narrator_advice: wide_scan_before_enter
    player_choice: wide_scan
    engine_result: legal_attention_spent
    reveal:
      - crowd_pressure_visible
    still_unknown:
      - exit_path
      - support_depth

  player_style_hypothesis:
    claim: "player may prefer stabilizing the field before approving bright-signal action"
    support: local_event
    residue:
      - tutorial_exploration_possible
      - not_a_permanent_profile

  repair_candidate:
    name: scan_before_bright_enter
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
  narrator_advice_if_any:
  player_choice:
  reveal:
  still_unknown:
  pressure_seen:
  bot_habit_challenged:
  lesson_candidate:
  scope:
  residue:
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

Allowed:

```yaml
bot_upgrade:
  name: ask_or_scan_before_bright_enter
  learned_from:
    - trace_card_02
    - trace_card_05
  applies_when:
    - bright_signal_high
    - exit_visibility_foggy
  does_not_apply_when:
    - move_is_only_reversible_scout
    - exit_path_already_checked
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
4. Add optional advice lines that the player may follow or ignore.
5. Extend trace cards with `narratorAdvice`, `playerChoice`, `pressureSeen`, and `stillUnknown` fields if this fits the current data model.
6. Reserve `Wide Scan` as either a real move or a documented future move.
7. Keep all player-style inference local, reversible, and session-scoped.
8. Keep CRPM vocabulary out of normal UI.

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

Narrator advice:

```text
Pocket Bot is staring at the glow.
The signal may matter,
but it is not the whole arena.
```

Advice option:

```text
You could spend 1 Bot Attention to scan the wider pressure before approving.
```

Ignored advice:

```text
You chose to move without scanning.
The trace will remember what was left unseen.
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

CRPM is the narrator-side discipline that keeps the game from mistaking
one signal for truth,
one advice line for authority,
one player choice for identity,
one local success for a recovered path,
or one trace-backed repair for a general trading strategy.
```
