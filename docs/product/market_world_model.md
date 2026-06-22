# Market World Model

Status: implementation-base design note for Market Signal Scout.

Role: define how historical Bitcoin price windows, market-event witnesses, Pocket Bot's price-analysis toolbox, narrator insight, player action, trace cards, and finish judgment compose into an immersive relational market arena.

Current integration status: supporting contract only. The current playable
submission path remains `src/game/scenarios/marketSignalScoutScenario.js` and
the Golden Signal Support Check -> Approve -> Historic Witness -> Trace
Archive loop until a dedicated scene/domain refactor wires this market-world
model into gameplay.

Source status:

- Source-supported NimiRun anchors: `docs/product/scenarios/market_signal_scout.md`, `docs/product/scenarios/market_witness_governance.md`, `src/game/scenarios/marketWitnessLedger.js`, `src/game/scenarios/data/marketSignalScoutBtcusdtWindows.js`, `docs/product/reward_mode_boundary.md`, and `docs/product/pocket_bot_arena_narrator_role_cut.md`.
- Interpretive claim: this document converts existing Market Signal Scout and narrator-role ideas into a base world model for implementation. It does not authorize live market fetches, investment advice, real trading, exchange execution, wallet authority, or persistent trading strategy export.

## Core Design Cut

The trading-like interaction is intentionally simple.

```text
fictional enter / exit / wait / inspect
```

Player-facing copy may use buy/sell flavor only when it is clearly fictional, educational, and never connected to exchange execution, wallet signing, custody, real value movement, or investment advice.

The game complexity comes from the world those decisions live inside:

```text
price signal
  + support depth
  + historical event pressure
  + exit friction
  + crowd psychology
  + Bot Attention budget
  + Pocket Bot's inherited signal habit
  + narrator insight
  + trace memory
  + finish gate
```

Player-facing spine:

```text
Pocket Bot sees the signal.
You help it survive the world around the signal.
```

Internal design spine:

```text
The bot sees price.
The narrator sees world relations.
The player acts naturally inside the arena.
The trace decides what survives into later bot repair.
```

## Non-Negotiable Boundaries

Market Signal Scout may feel market-like, but it remains an educational fictionalized game mode.

```yaml
hard_boundaries:
  live_market_data: false
  real_trading: false
  exchange_execution: false
  brokerage_execution: false
  wallet_authority: false
  mainnet_value_movement: false
  investment_advice: false
  persistent_trading_strategy_export: false
  player_profit_primary_reward: false
```

Historical market material must flow through governed witnesses:

```text
historical / internet-reentered market material
  -> governed witness
  -> transformed static fixture
  -> playable clue, hidden pressure, trace, or hindsight card

not

historical / internet-reentered market material
  -> live trading model
  -> investment advice
  -> reusable trading strategy
  -> direct market prediction engine
```

## World Model Overview

Each playable level is a **relational market arena**.

A market arena is not just a chart. It is a bounded historical window rendered as interacting surfaces:

```yaml
market_arena:
  price_terrain:
    description: "chart-derived surface the bot can analyze"

  historical_event_weather:
    description: "market-event context surrounding the price window"

  execution_exit_world:
    description: "exit friction, liquidity, congestion, and route-back pressure"

  crowd_psychology_field:
    description: "FOMO, panic, urgency, overconfidence, and social pressure"

  bot_policy_layer:
    description: "Pocket Bot's inherited signal-bot habits and available analysis tools"

  narrator_relation_layer:
    description: "private relational source-ocean map used to provide bounded insight"

  trace_memory_layer:
    description: "record of proposal, player choice, reveal, cost, still-unknowns, and repair scope"
```

The player should experience the arena as drama:

```text
The signal is bright.
The crowd is loud.
The exit is foggy.
Pocket Bot wants to move.
What do you do?
```

The narrator privately reads the same situation as relation:

```text
bright signal + loud crowd + foggy exit + old bot habit
  -> high false-finish pressure unless one relation is revealed or residualized
```

## Historical Window To World Pipeline

Implementation should transform historical material through this pipeline:

```text
raw BTC OHLCV data / static fixture
  -> selected historical window
  -> price-shape features
  -> governed market-event witnesses
  -> relational pressure map
  -> fictional arena surfaces
  -> bot-visible analysis options
  -> player actions
  -> narrator reveals
  -> trace / finish / hindsight
```

Recommended implementation steps:

```yaml
world_build_pipeline:
  1_select_window:
    input:
      - transformed OHLCV fixture
      - date range
      - witness ledger entries
    output:
      - candidate level window

  2_extract_price_features:
    features:
      - trend_direction
      - momentum_strength
      - volatility_pressure
      - support_depth
      - peak_high
      - reversal_low
      - drawdown_from_peak
      - range_or_breakout_shape

  3_attach_historical_witnesses:
    witness_classes:
      - price_shape
      - market_event
      - exit_friction
      - psychology_pressure
    output:
      - chart_surface
      - event_surface
      - exit_surface
      - psychology_surface
      - hindsight_reveal

  4_build_relational_map:
    nodes:
      - signal
      - support
      - event
      - exit
      - crowd
      - bot_policy
      - narrator
      - player_choice
      - trace
      - finish_gate
      - hindsight
    edges:
      - signal_amplified_by_crowd
      - signal_unsupported_until_checked
      - event_changes_signal_meaning
      - profit_blocked_by_exit_friction
      - bot_overweights_price_signal
      - trace_preserves_or_loses_residue

  5_render_arena:
    surfaces:
      - map_nodes
      - fog_states
      - bot_analysis_actions
      - narrator_lines
      - trace_card_text
      - finish_gate_state

  6_finish_and_hindsight:
    output:
      - safe_finish
      - partial_finish
      - false_finish
      - open_finish
      - hindsight_card
      - bot_repair_edge
```

## Canonical World Enums

Use these names consistently in docs and runtime objects.

```yaml
relation_status:
  hidden:
    meaning: "exists in the authored arena but is not visible to the player or bot"
  visible:
    meaning: "can be sensed or hinted, but has not been inspected or narrator-revealed"
  revealed:
    meaning: "made explicit by a player action, bot analysis tool, or allowed narrator reveal"
  residualized:
    meaning: "named as still unknown and carried in the trace without pretending resolution"

relation_severity:
  - low
  - medium
  - high

finish_status:
  - safe_finish
  - partial_finish
  - false_finish
  - open_finish

finish_safety_rule:
  safe_finish:
    meaning: "blocking relations have been checked or declared non-blocking by explicit level rules"
  partial_finish:
    meaning: "important relations remain unresolved, but they are named and carried without overclaim"
  false_finish:
    meaning: "a goal-looking or profit-looking route hides blocking residue"
  open_finish:
    meaning: "the run remains unsettled without enough trace support for safe or partial finish"
```

## Market Arena Schema

Use this as the initial data shape for authored levels.

```yaml
market_world_level:
  id: string
  title: string
  campaign_id: market_signal_scout

  time_window:
    source_window_id: string
    start: yyyy-mm-dd
    end: yyyy-mm-dd
    granularity: daily | hourly | authored

  arena_theme:
    place_metaphor: string
    emotional_weather: []
    player_facing_hook: string

  visible_opening:
    player_sees: []
    bot_sees: []
    narrator_knows_but_withholds: []

  relational_surfaces:
    signal_to_support:
      status: hidden | visible | revealed | residualized
      severity: low | medium | high
      player_facing_hint: string
      revealed_by: []

    signal_to_event:
      status: hidden | visible | revealed | residualized
      severity: low | medium | high
      player_facing_hint: string
      revealed_by: []

    signal_to_exit:
      status: hidden | visible | revealed | residualized
      severity: low | medium | high
      player_facing_hint: string
      revealed_by: []

    signal_to_crowd:
      status: hidden | visible | revealed | residualized
      severity: low | medium | high
      player_facing_hint: string
      revealed_by: []

  bot_policy:
    active_old_habits: []
    toolbox_available: []
    default_proposal_bias: []

  narrator_rules:
    knows_authored_relations: true
    may_reveal_before_action: []
    may_reveal_after_action: []
    must_withhold_until_finish: []
    player_classification_allowed: false

  player_actions:
    available: []
    first_slice_recommended: []
    later_iteration_actions: []

  finish_logic:
    safe_finish:
      requires: []
    partial_finish:
      requires: []
    false_finish:
      triggered_by: []
    open_finish:
      triggered_by: []

  hindsight_card:
    locked_until_finish: true
    source_witness_ids: []
    player_facing_summary: string

  repair_edges:
    candidates: []
```

## Runtime World State

The runtime should track relation states separately from visual state.

```yaml
market_world_state:
  level_id:
  turn_index:

  resources:
    bot_attention:
    context_slots:
    pocket_spark:

  visible_surfaces:
    chart:
    event:
    exit:
    psychology:

  relations:
    signal_support:
      status: hidden | visible | revealed | residualized
      severity: low | medium | high
    signal_event:
      status: hidden | visible | revealed | residualized
      severity: low | medium | high
    signal_exit:
      status: hidden | visible | revealed | residualized
      severity: low | medium | high
    signal_crowd:
      status: hidden | visible | revealed | residualized
      severity: low | medium | high

  bot_analysis_state:
    tools_used: []
    bot_confidence:
    old_habits_active: []
    current_proposal:

  narrator_carrier:
    known_relations: []
    revealed_relations: []
    withheld_hindsight: []
    current_insight:
    latest_edge_id:

  trace_state:
    trace_cards: []
    revealed: []
    still_unknown: []
    lesson_candidates: []

  finish_pressure:
    safe_possible: boolean
    false_finish_risk: low | medium | high
    partial_finish_available: boolean
```

## Bot Analysis Toolbox

Pocket Bot may use standard price-analysis style tools. The player-facing language should stay simple, while the bot can carry familiar market-analysis flavor.

Every tool must declare:

```text
what it reveals
what it hides
what it costs
what failure mode it can create
```

Recommended tool set:

```yaml
bot_analysis_tools:
  check_signal:
    player_facing_name: "Check Signal"
    cost: 1
    reveals:
      - trend_direction
      - momentum_strength
    hides:
      - exit_friction
      - event_context
      - crowd_distortion
    failure_mode:
      - signal_strength_treated_as_proof
    narrator_line:
      "A strong signal is real information. It is not yet a safe route."

  check_support:
    player_facing_name: "Check Support"
    cost: 1
    reveals:
      - support_depth
      - whether_the_signal_has_visible_foundation
    hides:
      - event_context
      - future_exit_pressure
    failure_mode:
      - support_treated_as_permanent
    narrator_line:
      "The path has a ledge beneath it, but the weather around it is still changing."

  check_volatility:
    player_facing_name: "Check Volatility"
    cost: 1
    reveals:
      - route_shaking
      - instability_pressure
    hides:
      - why_volatility_is_rising
    failure_mode:
      - volatility_treated_only_as_opportunity
    narrator_line:
      "The route is moving fast. Fast can mean opportunity, pressure, or both."

  check_event:
    player_facing_name: "Check Event"
    cost: 1
    reveals:
      - historical_event_pressure
      - event_surface
    hides:
      - exact_future_outcome
    failure_mode:
      - headline_treated_as_causal_certainty
    narrator_line:
      "This signal did not rise alone. Something around the market is changing."

  check_exit:
    player_facing_name: "Check Exit"
    cost: 1
    reveals:
      - exit_visibility
      - exit_friction_risk
    hides:
      - exact_future_outcome
    failure_mode:
      - exit_check_treated_as_full_safety
    narrator_line:
      "A path forward is not the same as a path back."

  check_crowd:
    player_facing_name: "Check Crowd"
    cost: 1
    reveals:
      - crowd_pressure
      - urgency_as_evidence_risk
    hides:
      - support_depth
      - exit_visibility
    failure_mode:
      - crowding_treated_as_confirmation
    narrator_line:
      "The crowd can make a signal louder without making it safer."

  ask_remaining_unknown:
    player_facing_name: "Ask What Is Hidden"
    cost: 1
    reveals:
      - still_unknown_categories
    hides:
      - answers_to_those_unknowns
    failure_mode:
      - naming_unknowns_treated_as_solving_them
    narrator_line:
      "Naming the fog is not the same as clearing it, but it can keep the trace honest."

  wide_scan:
    player_facing_name: "Wide Scan"
    cost: 1
    type: world_affordance / narrator_reveal
    reveals_one_of:
      - signal_to_crowd
      - signal_to_event
      - signal_to_exit
      - signal_to_support
    hides:
      - terminal_outcome
      - exact_hindsight
    failure_mode:
      - wide_scan_treated_as_full_inspection
    narrator_line:
      "The glow did not disappear. It is no longer the only pressure in the arena."
```

Implementation note: the first Golden Signal playable slice should not expose the full toolbox. Start with the smallest set that proves the world loop. Add deeper bot analysis tools after the first relation-state and finish checks feel playable.

## Action Effect Contract

Every player action should update the world through a relation-aware effect packet.

```yaml
action_effect:
  action_id: string
  cost:
    bot_attention: number
  legal_when: []
  reveals: []
  residualizes: []
  hides_or_leaves_unknown: []
  bot_habit_challenged: []
  narrator_insight: string
  trace_fields_added: []
  finish_pressure_delta:
    false_finish_risk: up | down | unchanged
    partial_finish_available: true | false | unchanged
    safe_finish_possible: true | false | unchanged
```

Example:

```yaml
action_effect:
  action_id: check_exit
  cost:
    bot_attention: 1
  legal_when:
    - bot_attention_at_least_1
  reveals:
    - signal_to_exit
  residualizes:
    - support_depth_if_unchecked
    - event_context_if_unchecked
  hides_or_leaves_unknown:
    - exact_future_outcome
  bot_habit_challenged:
    - profit_looking_route_equals_safe_route
  narrator_insight: "A path forward is not the same as a path back."
  trace_fields_added:
    - action
    - cost
    - world_relation_revealed
    - still_unknown
  finish_pressure_delta:
    false_finish_risk: down
    partial_finish_available: true
    safe_finish_possible: unchanged
```

## Narrator Source-Ocean Map

The narrator is the only actor that follows relational navigation privately.

It may know the authored arena relations, but it should share them only through bounded insight and game-timed reveal.

```yaml
narrator_source_ocean_map:
  knows:
    - which price shape produced the visible terrain
    - which historical event witnesses surround the price window
    - which exit and crowd pressures are authored
    - which relation each bot tool can reveal
    - which relations remain hidden
    - which terminal reveal is locked until finish

  may_share_before_choice:
    - pressure_hint
    - relation_warning
    - optional_advice

  may_share_after_action:
    - what_relation_became_visible
    - what_stayed_hidden
    - why_trace_matters

  may_share_at_finish:
    - why_finish_is_safe_partial_false_or_open
    - what_relation_was_missed_or_residualized
    - what_Pocket_Bot_can_carry_forward

  must_not_share_before_finish:
    - exact_terminal_outcome
    - hindsight_only_fields
    - future_level_outcomes
```

Narrator line pattern:

```text
The chart is not lying.
It is just incomplete.

The glow shows momentum.
It does not show the exit.
```

## Trace Card Contract

Trace cards are not passive logs. They are the replayable edge surface that supports bot repair and finish judgment.

```yaml
trace_card:
  id:
  level_id:
  turn_index:
  bot_proposal_before_player_choice:
  narrator_insight_if_any:
  player_choice:
  action_cost:
  world_relation_revealed:
  revealed:
  still_unknown:
  pressure_seen:
  bot_habit_challenged:
  lesson_candidate:
  scope:
  residue:
  return_condition:
  source_witness_ids:
```

Player-facing trace should be short:

```text
Trace added

Pocket Bot wanted to enter the bright signal.
You chose Wide Scan first.

Cost: 1 Bot Attention
Revealed: crowd pressure is rising
Still unknown: exit path, support depth
Lesson candidate: bright signals deserve a wider look before action
```

## Finish Logic

A finish is not a route endpoint. It is a boundary crossing where Pocket Bot must explain what was seen, what remains unknown, and why the level is safe, partial, false, or open.

Safe finish should not mean "some residue exists but we call it safe anyway." Residue usually points to partial finish unless the level explicitly declares the unresolved relation non-blocking.

```yaml
finish_logic:
  safe_finish:
    requires:
      - trace_exists
      - all_blocking_relations_checked_or_declared_non_blocking_by_level_rules
      - no_blocking_exit_or_support_residue
      - major_pressure_named
      - bot_repair_scope_declared
      - no_terminal_reveal_used_before_finish

  partial_finish:
    requires:
      - at_least_one_major_relation_checked
      - remaining_unknowns_named
      - unresolved_blocking_relations_are_carried_as_residue
      - player_or_bot_does_not_claim_full_safety
      - trace_supports_later_reentry

  false_finish:
    triggered_by:
      - acted_on_signal_strength_alone
      - profit_looking_state_hid_exit_residue
      - terminal_claim_without_trace
      - narrator_or_bot_overclaimed_safety

  open_finish:
    triggered_by:
      - insufficient_attention_for_more_checks
      - player_stops_without_safe_or_partial_conditions
      - too_many_relations_remain_hidden_without_residualization
```

Player-facing examples:

```text
False finish

Pocket Bot reached the glowing gate quickly.
But the trace cannot explain the exit path,
and the crowd pressure was never checked.
```

```text
Partial finish

Pocket Bot did not prove the route safe.
But the trace names what was checked,
what remains unknown,
and why you stopped here.
```

## Golden Signal Arena Example

Use the existing December 2017 BTCUSDT window as the first complete implementation target.

```yaml
market_world_level:
  id: level_02_golden_signal
  title: Golden Signal
  campaign_id: market_signal_scout

  time_window:
    source_window_id: btc_binance_btcusdt_2017_12_golden_signal
    start: 2017-12-01
    end: 2017-12-24
    granularity: daily

  arena_theme:
    place_metaphor: "a golden path rising through a loud market crowd"
    emotional_weather:
      - wonder
      - urgency
      - crowd_pressure
      - instability
    player_facing_hook: "A bright signal rises. Pocket Bot wants to enter before the route gets crowded."

  visible_opening:
    player_sees:
      - bright upward signal
      - rising volatility
      - crowd murmur
      - foggy exit bridge
    bot_sees:
      - momentum
      - strong signal
      - possible fast entry
    narrator_knows_but_withholds:
      - exact hindsight outcome
      - full reversal pressure
      - terminal reveal

  relational_surfaces:
    signal_to_support:
      status: hidden
      severity: high
      player_facing_hint: "The path glows, but its foundation is not yet visible."
      revealed_by:
        - check_support

    signal_to_event:
      status: hidden
      severity: medium
      player_facing_hint: "New gates may be opening around the signal."
      revealed_by:
        - check_event
        - wide_scan

    signal_to_exit:
      status: hidden
      severity: high
      player_facing_hint: "The way forward is bright; the way back is foggy."
      revealed_by:
        - check_exit
        - ask_remaining_unknown

    signal_to_crowd:
      status: visible
      severity: medium
      player_facing_hint: "The crowd is making the signal louder."
      revealed_by:
        - check_crowd
        - wide_scan

  bot_policy:
    active_old_habits:
      - bright_signal_fast_action
      - urgency_as_evidence
    toolbox_available:
      - check_signal
      - check_support
      - check_volatility
      - check_event
      - check_exit
      - check_crowd
      - ask_remaining_unknown
      - wide_scan
    default_proposal_bias:
      - enter_when_signal_bright
      - underweight_exit_friction

  player_actions:
    available:
      - approve_enter
      - wide_scan
      - check_exit
      - ask_remaining_unknown
      - check_signal
      - check_support
      - check_event
      - check_crowd
    first_slice_recommended:
      - approve_enter
      - wide_scan
      - check_exit
      - ask_remaining_unknown
    later_iteration_actions:
      - check_signal
      - check_support
      - check_event
      - check_crowd
      - check_volatility

  narrator_rules:
    knows_authored_relations: true
    may_reveal_before_action:
      - pressure_hint
      - exit_fog_warning
      - crowd_pressure_hint
    may_reveal_after_action:
      - relation_revealed
      - still_unknowns
      - trace_meaning
    must_withhold_until_finish:
      - exact_hindsight_card
      - terminal_reveal
    player_classification_allowed: false

  finish_logic:
    safe_finish:
      requires:
        - trace_exists
        - support_checked
        - exit_checked
        - no_blocking_exit_or_support_residue
        - trace_explains_decision
    partial_finish:
      requires:
        - one_major_relation_checked
        - remaining_unknowns_named
        - no_full_safety_claim
        - trace_supports_later_reentry
    false_finish:
      triggered_by:
        - enter_on_signal_strength_alone
        - finish_claim_without_exit_or_residue
    open_finish:
      triggered_by:
        - attention_exhausted_with_major_relations_hidden

  hindsight_card:
    locked_until_finish: true
    source_witness_ids:
      - btc_binance_btcusdt_2017_12_price_shape
      - btc_futures_gate_cboe_2017_12_04
      - btc_futures_gate_cftc_2017_12_01_risk_context
      - btc_futures_gate_cme_2017_12_01_event_pressure
    player_facing_summary: "The bright signal belonged to a larger moment of crowd pressure, event gates, volatility, and reversal risk."
```

## Campaign Expansion Grammar

Each later level should teach one missing relation, not add general trading complexity.

```yaml
campaign_world:
  level_01_custody_fog:
    relation_problem: "price signal depends on where value is held"
    bot_failure: "trusted venue/interface = safety"

  level_02_golden_signal:
    relation_problem: "momentum depends on support, exit, and crowd pressure"
    bot_failure: "bright signal = proof"

  level_03_crowded_chain:
    relation_problem: "execution depends on network congestion"
    bot_failure: "decision time = execution time"

  level_04_mirror_breakout:
    relation_problem: "similar chart shapes can differ underneath"
    bot_failure: "similar chart = same outcome"

  level_05_thin_bridge:
    relation_problem: "liquidity affects whether a route can be crossed back"
    bot_failure: "market price = executable price"

  level_06_exit_queue:
    relation_problem: "selling depends on path availability"
    bot_failure: "profit shown = profit reachable"

  level_07_stable_mirage:
    relation_problem: "apparent stability may hide fragile backing"
    bot_failure: "flat line = safe support"

  level_08_vanishing_exchange:
    relation_problem: "interface trust and recoverability diverge"
    bot_failure: "account screen = actual control"
```

## Visual World Grammar

Repeated visual relations should let the player learn the world without learning the theory.

```yaml
visual_relations:
  signal:
    color_role: gold
    shape: glowing path / candle ridge
    meaning: "tempting visible route"

  support:
    color_role: green / stone
    shape: ledge / foundation / roots
    meaning: "what holds the signal up"

  event:
    color_role: blue / white
    shape: gate / bell / document shard / news wind
    meaning: "historical pressure around the signal"

  exit:
    color_role: orange / gray
    shape: bridge / queue / tunnel / door
    meaning: "whether action can be reversed or completed"

  crowd:
    color_role: purple / red
    shape: murmuring lights / masks / pressure waves
    meaning: "social force, FOMO, urgency, noise"

  residue:
    color_role: dark violet
    shape: shadow on trace card
    meaning: "what remains unknown"

  narrator:
    color_role: moon-blue / cream
    shape: constellation line connecting hidden relations
    meaning: "bounded insight into the arena"
```

## Implementation Order

Build one complete relational arena before expanding the campaign.

Recommended first implementation target:

```text
Golden Signal Arena
```

Minimum implementation slice:

1. Load or define the Golden Signal level object.
2. Render the visible opening: bright signal, crowd murmur, foggy exit.
3. Give Pocket Bot one default biased proposal: `enter_bright_signal`.
4. Provide four first-slice player actions: `approve_enter`, `wide_scan`, `check_exit`, `ask_remaining_unknown`.
5. Implement relation-state updates for each first-slice action.
6. Add narrator insight lines tied to relation reveals.
7. Emit trace cards with `world_relation_revealed`, `still_unknown`, and `return_condition`.
8. Implement false / partial / safe / open finish checks.
9. Add a locked hindsight card that opens only after finish.
10. Add one bot repair edge, such as `ask_or_scan_before_bright_enter`.
11. Add `check_signal`, `check_support`, `check_event`, `check_crowd`, and `check_volatility` only after the first-slice loop is playable.

## Player-Facing Language Rules

Use simple, atmospheric language.

Prefer:

```text
The signal is bright.
The crowd is loud.
The exit is foggy.
```

Avoid:

```text
The relational source-ocean cut has unresolved residuals.
```

Prefer:

```text
Pocket Bot checked momentum.
The signal is real, but the exit is still hidden.
```

Avoid:

```text
The player performed relational navigation.
```

Prefer:

```text
The narrator notices a hidden link between the glow and the crowd.
```

Avoid:

```text
The narrator exposes the CRPM edge carrier.
```

## Design Doctrine

```text
Trading is simple.
The world around trading is not.

Pocket Bot's old toolbox can read price.
The narrator can read relations.
The player acts inside the arena.
The trace decides what can be learned.
```
