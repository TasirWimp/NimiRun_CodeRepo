# Market Signal Scout Scenario

Status: selected Phase 1 scenario; PB-013 Golden Signal foundation implemented.
Role: first playable scenario script for the invariant Pocket Bot stage.

Supporting refinement docs:

- `docs/product/market_world_model.md` defines a richer market-arena contract
  for future scene/domain wiring.
- `docs/product/pocket_bot_arena_narrator_role_cut.md` defines the narrator and
  former signal-bot role cut behind future copy and trace-backed repair.

These docs do not replace the current verified Golden Signal playable loop
until a dedicated implementation slice wires them into the scene.

## Core Cut

This scenario is not a generic crypto trading simulator.

Market Signal Scout uses the shape of historic market signals as a **story
source** for teaching resource judgment in a lossy environment:

```text
A tempting signal appears.
The bot wants to act.
The player teaches the bot to inspect support, context, exit friction, and
residue before treating the signal as safe.
```

The scenario should evolve from a single support-inspection puzzle into a
linear voyage through historic market-event islands. Each level teaches one
transition lesson and ends with a safe, partial, false, or open finish
judgment.

Player-facing core lesson:

```text
Do not act on signal strength alone.
Spend attention when support, context, or exit path is unknown.
```

Deeper bot-policy lesson:

```text
A good bot policy is not one that chases bright signals.
A good bot policy knows which uncertainty must be reduced before acting.
```

CRPM-facing lesson, kept out of normal player UI:

```text
pattern is not proof
pressure reduction is not completion
goal-looking state is not safe finish
residue must be carried into the next move
```

Important boundary:

```text
historic chart data -> scenario script
not
historic chart data -> live trading model
```

The player is teaching a proposal policy, not a trading strategy.

Related governance artifacts:

- `docs/product/scenarios/market_witness_governance.md` governs how historical
  market material becomes attributed static witnesses, clues, hidden pressure,
  and hindsight cards.
- `src/game/scenarios/marketWitnessLedger.js` is the current static witness
  ledger scaffold for level-to-witness mapping and proposal visibility guards.
- `docs/product/reward_mode_boundary.md` keeps Pocket Spark, trace quality, and
  finish cards separate from any future NIM-denominated reward experiment.

## Game-Theory Contract

Market Signal Scout is an imperfect-information route game. The player shapes
Pocket Bot's policy under uncertainty.

Plain-language model:

```text
The game is a sequence of motivated decisions.

At each moment:
  the player and bot see only part of the market situation,
  choose an action,
  pay a cost,
  reveal something,
  leave something unknown,
  carry a trace,
  and move toward an outcome.

The player is not trying to win one trade.
The player is teaching the bot a better policy.
```

Design-facing model:

```yaml
player_agent:
  - user
  - Pocket Bot
  - environment

preference_payoff:
  - useful progress
  - false certainty avoided
  - attention preserved
  - residue visible
  - lesson learned
  - trace re-enterable

state:
  - current level
  - map node
  - resources
  - context slots
  - visible chart/event clues
  - hidden pressures
  - trace history
  - bot policy

action:
  - inspect chart
  - inspect event context
  - inspect exit path
  - inspect psychology
  - ask remaining unknown
  - remember lesson
  - enter
  - exit
  - wait
  - skip
  - mark partial

observation:
  - what the player and bot currently know

transition:
  - action changes state
  - hidden pressure may become visible
  - residue is created or resolved
  - time advances
  - bot policy may update inside the active run

terminal_outcome:
  - safe finish
  - partial finish
  - false finish
  - open run
```

## CRPM Alignment

This mapping is design discipline. Normal player UI should use the vocabulary
in [Cut Vocabulary For Player UI](#cut-vocabulary-for-player-ui).

```yaml
crpm_mapping:
  source_ocean:
    "historic crypto market period with chart movement, event shocks, latency, infrastructure failure, crowd psychology, and incomplete user knowledge"

  active_cuts:
    chart_cut:
      question: "Does the visible signal have technical support?"
    event_cut:
      question: "What external event or infrastructure condition changes the signal?"
    exit_cut:
      question: "Can the player actually react, exit, or reduce exposure in time?"
    psychology_cut:
      question: "Is the bot following evidence or FOMO pressure?"

  protected_family:
    - "signal is not proof"
    - "support/context/exit uncertainty must stay visible"
    - "trace must explain why the bot acted or waited"
    - "safe finish requires re-entry from the trace"

  carriers:
    - "trace cards"
    - "context slots"
    - "level summary cards"
    - "bot policy lesson"

  residue:
    - "uninspected support"
    - "unknown event context"
    - "unknown exit friction"
    - "crowd/FOMO pressure"
    - "hindsight uncertainty"

  landfall:
    "finish where protected lesson survived, residue is visible, scope is declared, and trace supports later re-entry"

  false_landfall:
    "goal-looking, profit-looking, or fast-looking finish where support/context/exit residue was hidden"
```

Each accepted move should behave like a cut transition: it states what was held
fixed, what was preserved, what was compressed or forgotten, what became
visible, what residue remains, and whether later re-entry is possible from the
trace.

### Hidden Versus Residualized

Implementation must distinguish hidden uncertainty from residualized
uncertainty.

```yaml
hidden:
  meaning: "the player/bot ignored it, did not name it, or never made it visible in the trace"
  finish_effect: "can create false finish when the hidden issue was protected"

residualized:
  meaning: "the player/bot named it as still unknown and accepted limited scope"
  finish_effect: "can allow partial finish, or safe finish only when the scenario declares that carrying this residue is enough"
```

This distinction prevents "unknown but explicitly carried" from being treated
the same as "unknown and hidden."

## Invariant Stage / Variant Script

The invariant game stage stays the same:

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

The variant changes only the domain script:

```text
Market Signal Scout
  = a fictionalized signal-navigation campaign based on selected historic chart
    and market-event archetypes.
```

Decision-model binding:

- Golden Signal = tempting observation.
- Support, noise, reversal risk, exit friction, and liquidity uncertainty =
  hidden state.
- Inspect, skip, remember, enter, exit, and mark partial = bounded actions.
- Bot Attention and context slots = scarce costs / carriers.
- Revealed support or residue = new observation after transition.
- Trace card plus session lesson = history that adjusts the bot's next proposal
  policy within the current run.
- Safe, partial, false, or open finish = terminal outcome.

This lets later variants reuse the same stage:

- Bug Failure Surface Scout.
- Shopping Boundary Scout.
- Travel Planner Residue Scout.
- Coding Agent Test Scout.

## Historic Timeline / Campaign Mode

The strongest scenario structure is a linear historic voyage:

```text
2016-2022 market ocean
  -> Event 1
    -> Event 2
      -> Event 3
        -> ...
          -> Policy Gate
```

Each event is a level-sized voyage. The player starts at the first event, plays
through it, receives a finish card, then moves to the next event. Time advances.
The bot's session lessons may influence later proposals.

Player-facing level names:

```text
Custody Fog
Golden Signal
Crowded Chain
Mirror Breakout
Thin Bridge
Exit Queue
Stable Mirage
Vanishing Exchange
```

Each level begins with:

```text
Time moves on.
A new signal rises from the Source Ocean.
```

Each level ends with:

```text
Later reveal:
  what actually happened in the scenario window.

Finish:
  safe / partial / false / open.

Lesson carried:
  one policy update for Pocket Bot.
```

Phase 1 does not need to ship the full campaign. It should keep the campaign as
the scenario spine while implementing the smallest playable vertical slice that
proves the loop.

## Data Source Requirements

Before importing any chart data, choose and document a source that satisfies:

- historic OHLCV or equivalent chart data available from 2016 onward;
- license / terms allow use in a small demo or derived educational scenario;
- source attribution can be added to `docs/product/source_attribution.md`;
- data can be reduced to a small static fixture;
- no API key is required in browser code;
- no live trading or live market claims are introduced.

Suggested workflow:

```text
1. Choose data source.
2. Export a small historic range offline.
3. Detect candidate event windows manually or with a small script.
4. Convert event windows into fictional level archetypes.
5. Store only the scenario fixture needed by the game.
6. Attribute the data source and transformation.
```

Do not ship a general chart-data downloader in Phase 1.

Preferred PB-013 market data source:

```yaml
preferred_market_data_source:
  provider: "Binance Public Data"
  source_urls:
    - "https://github.com/binance/binance-public-data"
    - "https://data.binance.vision/"
    - "https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1d/BTCUSDT-1d-2017-12.zip"
  source_checksum_url: "https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1d/BTCUSDT-1d-2017-12.zip.CHECKSUM"
  source_checksum: "45bf1c515b1108668b6bf10f7af323585f30cdf68e096cb71e6e3bb6aa0e9cb4"
  retrieval_date: "2026-06-08"
  pair: "BTCUSDT"
  market_scope: "Binance spot BTCUSDT venue history"
  covered_range: "2017-12-01 through 2017-12-24"
  interval:
    campaign_arc: "1d"
    optional_level_texture: "1h"
  license_note: "MIT licence stated in binance/binance-public-data README"
  shipped_as: "small transformed static fixture"
  fixture_path: "src/game/scenarios/data/marketSignalScoutBtcusdtWindows.js"
  raw_data_shipped: "avoid broad raw archives; allow only tiny scoped excerpts if needed and attributed"
  does_not_establish:
    - "global Bitcoin price index"
    - "live trading rule"
    - "investment advice"
    - "reward-bearing historical replay"
```

Historic event headlines should be used as immersive witness labels, not as
bare game instructions. Each headline/title needs a mechanics connector:

```yaml
headline_witness_card:
  source_title: "Cboe Plans December 10 Launch of Bitcoin Futures Trading"
  source_url: "https://ir.cboe.com/news/news-details/2017/Cboe-Plans-December-10-Launch-of-Bitcoin-Futures-Trading-12-04-2017/default.aspx"
  game_connector: "Futures Gate makes the signal brighter, but the route may be crowded."
  unlocks_surface:
    - event_surface
    - psychology_surface
  does_not_establish:
    - "trade entry should happen"
    - "price prediction"
```

## Campaign Level List

Suggested campaign:

```yaml
campaign:
  id: market_signal_scout_2016_2022
  title: "Signals Across the Source Ocean"
  start:
    title: "First Candle"
    lesson: "A signal is only an opening question."

  levels:
    - id: level_01_custody_fog
      title: "Custody Fog"
      teaches: "The place where value is held is part of the decision."

    - id: level_02_golden_signal
      title: "Golden Signal"
      teaches: "Fast signals need support."

    - id: level_03_crowded_chain
      title: "Crowded Chain"
      teaches: "Execution latency can turn a good idea into bad timing."

    - id: level_04_mirror_breakout
      title: "Mirror Breakout"
      teaches: "A breakout can become a false continuation."

    - id: level_05_thin_bridge
      title: "Thin Bridge"
      teaches: "Liquidity matters when you need to cross back."

    - id: level_06_exit_queue
      title: "Exit Queue"
      teaches: "Profit is not real if the exit path is blocked."

    - id: level_07_stable_mirage
      title: "Stable Mirage"
      teaches: "Apparent stability can hide fragile support."

    - id: level_08_vanishing_exchange
      title: "Vanishing Exchange"
      teaches: "Trusted interface is not the same as recoverable safety."

  final:
    title: "Policy Gate"
    teaches: "Pocket Bot now asks what remains unknown before following a signal."
```

These should be presented as game archetypes, not documentary lessons, unless
data attribution has been added.

## Campaign State

The campaign needs explicit state so the linear flow can carry lessons and
residue between level-sized voyages.

```yaml
campaign_state:
  current_level_id: "level_02_golden_signal"
  completed_levels:
    - "level_01_custody_fog"
  carried_policy_lessons:
    - "venue/context matters"
  carried_residue:
    - "event context was not inspected in previous level"
  bot_policy_flags:
    asks_remaining_unknown: true
    checks_support_before_action: false
    checks_exit_path_when_volatility_high: false
    treats_profit_as_unlanded_until_exit_checked: false
    carries_residue_between_levels: false
    accepts_partial_finish: false
  next_level_unlocked: "level_03_crowded_chain"
```

## Level Anatomy

Every historic-event level should use the same shape:

```yaml
level_start:
  visible_state:
    chart_surface: []
    event_surface: []
    psychology_surface: []
  starting_resources:
    bot_attention:
    context_slots:
    pocket_spark:
  inherited_lessons: []
  inherited_residue: []
  starting_bot_policy:

level_end:
  terminal_reveal:
  finish_status:
  policy_update:
  residue_carried_forward: []
  unlocks_next_level:
```

```yaml
historic_event_level:
  id: "level_02_golden_signal"
  title: "Golden Signal"
  time_label: "Historic Market Window 02"
  level_role: "fomo_breakout_lesson"

  opening_visible_state:
    chart_surface:
      - "large bright upward signal"
      - "momentum appears strong"
    player_context:
      - "Pocket Bot wants to act quickly"

  hidden_environment_state:
    chart_support: unknown
    event_context: unknown
    exit_friction: unknown
    psychology_pressure: high

  available_cuts:
    - chart_cut
    - event_cut
    - exit_cut
    - psychology_cut

  starting_bot_policy:
    name: "bright_signal_fast_action"
    bias:
      - "overweights visible momentum"
      - "underweights exit risk"
      - "underweights crowd pressure"

  protected_lesson:
    "Fast signals need support."

  terminal_reveal:
    reveal_style: "hindsight card"
    possible_reveals:
      - "brief continuation then reversal"
      - "support was thin"
      - "exit became delayed"

  landfall_conditions:
    safe_finish:
      - "support inspected before acting"
      - "exit friction inspected or residualized"
      - "trace explains decision"
    partial_finish:
      - "one major uncertainty inspected"
      - "remaining residue visible"
    false_finish:
      - "acted on signal strength alone"
      - "profit-looking or goal-looking state hides residue"
    open_run:
      - "attention exhausted or player marks unresolved"

  carry_forward:
    policy_lesson:
      - "when signal is bright, ask what remains unknown"
    residue:
      - "unknown event context carries into next level if not inspected"
```

## Three-Layer Signal Model

Every level should expose at least two of these layers.

### Chart Surface

```text
What does the visible market shape suggest?
```

Examples:

- breakout
- retrace
- support
- volume
- range
- large candle
- consolidation

### Event Surface

```text
What real-world or infrastructure pressure may change the meaning of the chart?
```

Examples:

- exchange overload
- slow settlement
- hack / custody failure
- withdrawal delay
- liquidity gap
- systemic collapse
- venue / counterparty risk

### Psychology Surface

```text
What human pressure is distorting the bot's policy?
```

Examples:

- FOMO
- panic
- overconfidence
- sunk cost
- crowd euphoria
- fear of missing exit

Gameplay consequence:

```text
Chart inspection alone may not be enough.
The player must sometimes inspect event or exit friction before acting.
```

## Cut Vocabulary For Player UI

Avoid showing CRPM words like `cut`, `Tau`, `landfall`, or `protected family`
in normal UI.

| CRPM / design term | Player-facing term |
| --- | --- |
| cut | way to inspect |
| chart cut | check signal |
| event cut | check what happened around it |
| exit cut | check exit path |
| psychology cut | check FOMO pressure |
| residue | still unknown |
| carrier | trace / memory slot |
| landfall | finish |
| false landfall | false finish |
| voyage | route through time |
| protected family | what must not be lost |

Example UI buttons:

```text
Check Signal
Check Event
Check Exit
Check FOMO
Remember Lesson
Enter Small
Wait
Exit
Skip
Mark Partial
```

## Tau / Transition Packet

Internal design object:

```yaml
level_transition:
  tau_id: "tau_level02_chart_to_exit"
  from_cut: "chart_signal_cut"
  to_cut: "exit_path_cut"
  type: "refine"
  fixed_frame: "same historic event window and same bot decision"
  preserved:
    - "visible signal remains relevant"
    - "decision still targets this event window"
  forgotten:
    - "exact candle detail compressed into signal-strength label"
  newly_visible:
    - "exit friction"
    - "latency risk"
  residual:
    - "event context still unknown"
    - "crowd pressure still unknown"
  reversibility: "protected-equivalent"
```

Player-facing equivalent:

```text
You looked past the bright signal and checked whether you could still exit.
New clue: exit path may be slow.
Still unknown: what caused the signal.
```

## Voyage / Level Route

Each level is a voyage:

```yaml
level_voyage:
  level_id: "level_02_golden_signal"
  tau_path:
    - "bright_signal -> check_signal"
    - "check_signal -> check_exit"
    - "check_exit -> remember_lesson"
    - "remember_lesson -> finish"
  protected_core:
    - "signal is not proof"
    - "exit friction matters"
  residual_accumulation:
    - "event context not inspected"
  return_condition:
    - "trace card explains what was checked and what was left unknown"
  stabilization_status: "candidate_landfall"
```

Design-to-game state mapping:

```text
in_flight       -> level still running
candidate       -> finish reached, trace under judgment
landed          -> safe finish
false_landfall  -> false finish
```

## Landfall And False Landfall

Use `finish` in player UI and `landfall` in design docs.

### Safe Finish

Player-facing:

```text
You reached the gate with a trace that explains why.
```

Design condition:

```yaml
safe_finish:
  requires:
    - protected_lesson_preserved
    - residue_visible
    - scope_declared
    - reentry_from_trace_possible
```

### Partial Finish

Player-facing:

```text
You made useful progress, but the route is not fully safe.
```

Design condition:

```yaml
partial_finish:
  requires:
    - one_major_uncertainty_inspected
    - remaining_uncertainty_visible
    - no_false_safe_claim
```

### False Finish

Player-facing:

```text
You reached something that looked like success, but the trace shows the
important unknown was hidden.
```

False finish examples:

```yaml
false_finish_cases:
  bright_signal_chase:
    trigger: "enter on signal strength alone"
    hidden_residue:
      - "support not inspected"
      - "FOMO pressure high"

  trapped_profit:
    trigger: "simulated gain shown but exit friction unchecked"
    hidden_residue:
      - "exit path blocked or delayed"

  stable_mirage:
    trigger: "stable-looking support trusted without event/context check"
    hidden_residue:
      - "support mechanism fragile"

  venue_confidence:
    trigger: "trusted interface treated as safety"
    hidden_residue:
      - "custody/counterparty risk unchecked"
```

A level may show a simulated gain and still be a false finish if the exit path
was never inspected or named. Simulated profit is not landfall.

### Open Run

Player-facing:

```text
The run ends without closure, but the trace supports re-entry.
```

This should be a valid learning outcome, not a failure.

## Payoff Model

Do not make payoff equal to simulated profit.

Use a multi-axis score:

```yaml
payoff:
  decision_quality:
    support_checked: 0..1
    event_context_checked: 0..1
    exit_path_checked: 0..1
    fomo_pressure_checked: 0..1
    residue_carried: 0..1
    trace_reenterable: 0..1
    false_certainty_avoided: 0..1

  resource_quality:
    attention_preserved: 0..1
    context_used_well: 0..1
    unnecessary_checks_avoided: 0..1

  simulated_market_result:
    result: gain | loss | avoided_loss | missed_gain
    weight: low

  learning_result:
    bot_policy_improved: true | false
    lesson_learned:
      - string
```

Player-facing version:

```text
You are scored on judgment, not hindsight profit.
```

The player should not learn "always do the historically profitable thing." They
should learn:

```text
Make the best traceable decision under the information visible at the time.
```

## Hindsight Reveal

Because historic events define the timeline, every level should end with a
hindsight reveal.

Structure:

```yaml
hindsight_reveal:
  what_you_saw:
    - "bright upward signal"
  what_was_hidden:
    - "support was thin"
    - "exit path slowed"
  what_happened_next:
    - "signal briefly continued, then reversed"
  trace_judgment:
    - "support checked"
    - "exit not checked"
  finish:
    "partial_finish"
  lesson:
    "A bright signal without exit-path check is not fully safe."
```

This makes historical data useful as story progression without becoming real
trading instruction.

## Bot Policy Progression

The player teaches a policy over time.

```yaml
bot_policy_state:
  initial_policy:
    name: "bright_signal_fast_action"
    tendencies:
      - "act quickly on strong visible signal"
      - "undervalue hidden exit friction"
      - "forget previous residue"

  learned_policy_flags:
    asks_remaining_unknown: false
    checks_support_before_action: false
    checks_exit_path_when_volatility_high: false
    treats_profit_as_unlanded_until_exit_checked: false
    carries_residue_between_levels: false
    accepts_partial_finish: false

  policy_update_sources:
    - trace_card
    - context_slot
    - landfall_card
    - player_guidance
```

Example progression:

```text
Level 1:
  Bot learns: venue/context matters.

Level 2:
  Bot learns: fast signals need support.

Level 3:
  Bot learns: execution path matters.

Level 4:
  Bot learns: confirmation can fail.

Level 5:
  Bot learns: liquidity matters.

Level 6:
  Bot learns: exit is part of the trade.

Level 7:
  Bot learns: stability can be fragile.

Level 8:
  Bot learns: interface trust is not safety.
```

## First Playable Level: Golden Signal

Title:

```text
The Golden Signal
```

Short story:

```text
A golden market signal appears in the fog.
Pocket Bot thinks it found a fast path to the glowing gate.
But the signal may be supported, noisy, or a trap.
Teach the bot to inspect support before acting.
```

Player goal:

```text
Reach the gate safely before Bot Attention runs out.
```

Starting resources:

```yaml
starting_resources:
  bot_attention: 7
  context_slots: 3
  pocket_spark: 2
```

Nimiq Pocket is not a trading balance. It is a controlled value/capacity surface
in the game.

Player-facing scenario text should call spendable pocket capacity `Pocket
Spark`, not `NIM`. Implementation may map Pocket Spark to Nimiq Pocket status
or capacity, but the player must not read it as spending money to enter a
trade.

### Map Nodes

```yaml
scenario:
  id: market_signal_scout
  title: "The Golden Signal"
  lesson: "Fast signals need support."
  no_live_trading: true
  no_persistent_strategy_export: true

  nodes:
    - id: start
      label: "Start"
      visible_clue: "Find a safe useful route."

    - id: golden_signal
      label: "Golden Signal"
      visible_clue: "A fast bright path appears."
      hidden_pressure:
        - "support unknown"
        - "noise source unknown"
        - "exit path unknown"
      historic_pattern_source:
        event_window_id: "btc_binance_btcusdt_2017_12_golden_signal"
        pattern_type: "strong_signal_with_reversal_risk"
      false_landfall_trap:
        trigger: "act_without_support"
        why_it_is_false_closure: "The signal looked strong, but support was never inspected."

    - id: support_well
      label: "Support Well"
      visible_clue: "This may show whether the signal has support."
      hidden_pressure:
        - "support may be thin"

    - id: event_echo
      label: "Event Echo"
      visible_clue: "This may show what happened around the signal."
      hidden_pressure:
        - "event context may change the meaning of the chart"

    - id: exit_queue
      label: "Exit Queue"
      visible_clue: "This may show whether the route can be exited in time."
      hidden_pressure:
        - "exit path may be delayed"

    - id: fomo_mirror
      label: "FOMO Mirror"
      visible_clue: "This may show whether the bot is chasing pressure."
      hidden_pressure:
        - "crowd pressure may distort the proposal"

    - id: context_shrine
      label: "Memory Shrine"
      visible_clue: "Carry one lesson forward."

    - id: pocket_spark
      label: "Pocket Spark"
      visible_clue: "Pocket value can recharge capacity, but it does not decide the route."

    - id: goal_gate
      label: "Glowing Gate"
      visible_clue: "Finish judgment happens here."
```

### Move Examples

```yaml
moves:
  inspect_support:
    target_node: support_well
    cost:
      bot_attention: 2
    reveals:
      - "support is thin"
    leaves_residue:
      - "noise source still unknown"
      - "exit path still unknown"

  inspect_event:
    target_node: event_echo
    cost:
      bot_attention: 2
    reveals:
      - "event context changes the meaning of the signal"
    leaves_residue:
      - "support depth still unknown"

  inspect_exit:
    target_node: exit_queue
    cost:
      bot_attention: 2
    reveals:
      - "exit path may be slow"
    leaves_residue:
      - "crowd pressure still unknown"

  inspect_fomo:
    target_node: fomo_mirror
    cost:
      bot_attention: 1
    reveals:
      - "bot is overweighting visible momentum"
    leaves_residue:
      - "support depth still unknown"

  remember_lesson:
    target_node: context_shrine
    cost:
      context_slots: 1
    remembers:
      - "Fast signals need support."

  enter_signal:
    target_node: golden_signal
    cost:
      bot_attention: 3
      pocket_spark: 1
    can_finish: true
    false_if:
      - "support not inspected_or_residualized"
      - "exit friction hidden_not_named"

  skip_signal:
    cost:
      bot_attention: 0
    preserves_residue:
      - "opportunity unresolved"
```

## Proposal, Trace, And Finish Cards

### Proposal Card

Initial proposal:

```text
Pocket Bot proposes:
  Enter the Golden Signal.

Why:
  The candle is bright and momentum is strong.

Cost:
  3 Bot Attention
  1 Pocket Spark

What this uses:
  Chart surface only.

What remains unknown:
  Support quality.
  Exit path.
  FOMO pressure.

Alternative:
  Check Support Well first.
  Check Exit Queue first.

Risk:
  Acting now may create a false finish.
```

Better proposal after policy improvement:

```text
Pocket Bot proposes:
  Check Exit Queue before entering.

Why:
  The signal is bright, but previous traces show exits can fail.

Cost:
  2 Bot Attention.

Reveals:
  Whether reaction is possible if the signal reverses.

Leaves unknown:
  Crowd/FOMO pressure.
```

### Trace Card

```text
Trace Card:
  Level: Golden Signal
  Action: Check Support Well
  Cost: 2 Bot Attention
  Revealed: Support is thin
  Still Unknown: Exit path, crowd pressure
  Policy Lesson: Bright signals need support
  Carry Forward: Ask what remains unknown before entering
```

### Landfall Card

Player UI should call this a finish card.

```text
Level Finish: Partial Finish

You reached:
  A useful decision point.

What survived:
  You did not act on signal strength alone.
  You inspected support.

What remains:
  Exit path was not checked.
  FOMO pressure was not checked.

Scope:
  This lesson applies to bright-signal situations,
  not every market situation.

Re-entry:
  Later, Pocket Bot can recover this lesson from the trace.

Next level:
  Crowded Chain
```

False finish card:

```text
Level Finish: False Finish

You reached:
  A goal-looking outcome.

But the trace shows:
  Support was not checked.
  Exit path was not checked.
  The bot acted from FOMO pressure.

Lesson:
  A bright candle can be a trap if the route cannot be explained.
```

## Route Proposal Schema Extension

For this scenario, route proposals should expose normalized scenario moves while
keeping the invariant proposal fields. The current MVP runtime still uses the
generic move set `inspect | ask | remember | skip | act`; a scenario adapter
should map the richer player-facing moves back to those generic runtime moves
until the shared runtime schema is upgraded.

```yaml
route_proposal:
  move_type:
    - inspect
    - ask
    - remember
    - enter
    - exit
    - wait
    - skip
    - mark_partial
  move_subtype:
    - chart
    - event
    - exit_path
    - psychology
    - support
    - fomo
    - remaining_unknown
    - lesson
  player_facing_action:
  runtime_move_type: inspect | ask | remember | skip | act
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

Scenario-to-runtime adapter:

```yaml
scenario_move_to_runtime:
  inspect:
    runtime_move_type: inspect
    allowed_subtypes:
      - chart
      - event
      - exit_path
      - psychology
      - support
      - fomo

  ask:
    runtime_move_type: ask
    allowed_subtypes:
      - remaining_unknown

  remember:
    runtime_move_type: remember
    allowed_subtypes:
      - lesson

  enter:
    runtime_move_type: act
    rule: "bounded game action; never exchange, brokerage, wallet, or live-trading execution"

  exit:
    runtime_move_type: act
    rule: "bounded game action; means inspect/resolve route exit, not exchange execution"

  wait:
    runtime_move_type: skip
    rule: "advance without spending Bot Attention, carrying residue forward"

  skip:
    runtime_move_type: skip
    rule: "decline this signal and carry unresolved opportunity/residue"

  mark_partial:
    runtime_move_type: act
    rule: "finish judgment action that declares limited scope rather than full success"
```

Scenario-specific adjustment:

- Keep scenario `move_type` normalized around player-meaningful actions.
- Use `move_subtype`, `player_facing_action`, and `runtime_move_type` to
  distinguish `Check Signal`, `Check Event`, `Check Exit`, `Check FOMO`,
  `Remember Lesson`, `Enter`, `Wait`, `Exit`, `Skip`, and `Mark Partial` while
  preserving the current generic runtime move boundary.
- Player-facing `Enter` and `Exit` are scenario actions. They must not imply
  exchange, brokerage, wallet, or live-trading execution.
- If a move uses pocket capacity, show it as `Pocket Spark` in scenario text and
  trace cards. Do not expose `1 NIM` or NIM-denominated trade entry costs.
- Allow market-like vocabulary inside the fictional game script.
- Do not ban terms such as signal, support, buy, sell, enter, exit, or skip
  when used as in-game language.
- Do not connect those terms to live market data, real trading,
  brokerage/exchange actions, portfolio advice, or exported strategy.
- Do not persist learned strategy beyond the session.
- Do not provide a downloadable or reusable trading bot policy.

Required product boundary text for docs or debug/dev surfaces:

```text
Market Signal Scout is a fictional signal-navigation puzzle using historic
patterns as story material. It is not financial advice and does not connect to
live trading.
```

Normal player UI can stay lighter:

```text
A bright signal is not always a safe path.
```

## Implementation Placement

Suggested files:

```text
docs/product/scenarios/market_signal_scout.md
src/game/scenarios/marketSignalScoutScenario.js
src/domain/scenarioVariants.js
src/domain/lossyMap.js
src/domain/proposals.js
src/domain/traces.js
src/domain/finishJudgment.js
tests/game/marketSignalScoutScenario.test.js
tests/domain/proposals.test.js
tests/domain/finishJudgment.test.js
```

## Scenario Fixture Shape

```js
export const marketSignalScoutCampaign = {
  id: "market_signal_scout_2016_2022",
  title: "Signals Across the Source Ocean",
  sourceMode: "historic_chart_derived_static_fixture",
  dataBoundary: {
    liveMarketData: false,
    realTrading: false,
    persistentStrategyExport: false
  },
  startingResources: {
    botAttention: 7,
    contextSlots: 3,
    pocketSpark: 2
  },
  protectedOutcomes: [
    "support/context/exit uncertainty remains visible",
    "trace explains the route",
    "safe finish requires re-entry from trace"
  ],
  levels: []
};
```

## Tests

Market Signal Scout tests:

- scenario loads with starting resources;
- scenario declares historic-chart-derived static fixture mode;
- campaign levels have start, hidden state, action set, transition, hindsight
  reveal, finish judgment, and carry-forward lesson;
- golden signal hides support, event, exit, and FOMO pressure before inspection;
- inspect support spends Bot Attention and reveals support state;
- inspect support leaves exit and/or event residue;
- inspect exit can reveal exit friction;
- skip signal preserves residue;
- enter signal without support triggers false finish;
- simulated profit-looking outcome can still be false finish when exit friction
  is hidden;
- proposal generation must not use `terminal_reveal`, hindsight-only fields, or
  later level outcomes before the current level finish;
- inspecting support plus carrying lesson can enable safe or partial finish;
- partial inspection leads to partial finish, not safe finish;
- trace card records level, action, cost, reveal, residue, and lesson;
- finish card distinguishes safe, partial, false, and open outcomes;
- payoff model scores judgment quality higher than simulated market result;
- proposal schema allows market-like game vocabulary;
- proposal schema blocks live-trading, wallet-authority, brokerage/exchange
  execution, portfolio advice, or persistent strategy export claims.

## Source Attribution Requirements

If historic chart data is used, add the data source to
`docs/product/source_attribution.md` with:

- provider name;
- URL;
- license or terms note;
- date range used;
- whether raw data is shipped, transformed, or only used to author the
  scenario;
- whether any script generated scenario windows;
- statement that the data is used for a fictional educational game scenario,
  not live trading.

## Non-Goals

This scenario does not implement:

- live trading;
- real portfolio decisions;
- exchange integration;
- brokerage integration;
- real price prediction;
- persistent trading memory;
- transferable trading strategy export;
- mainnet value movement;
- autonomous spending.

## Best First Vertical Slice

```text
1. Bot sees Golden Signal.
2. Bot proposes entering quickly.
3. Player asks what remains unknown.
4. Bot names support, exit, and FOMO residue.
5. Player redirects to inspect Support Well.
6. Bot spends 2 Attention.
7. Support clue is revealed.
8. Trace card records action, cost, reveal, residue.
9. Player remembers "Fast signals need support."
10. Bot proposes safer route, exit check, or partial finish.
11. Hindsight card reveals what happened next.
12. Final status shows safe / partial / false / open.
```
