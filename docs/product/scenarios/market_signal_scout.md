# Market Signal Scout Scenario

Status: Phase 1 candidate scenario variant.  
Role: first playable scenario script for the invariant Pocket Bot stage.

## Core Cut

This scenario is not a generic crypto trading simulator.

It uses the shape of historic market signals as a **story source** for teaching resource judgment in a lossy environment:

```text
A tempting signal appears.
The bot wants to act.
The player teaches the bot to inspect support, carry residue, and avoid false finish.
```

Player-facing lesson:

```text
Fast signals need support.
```

CRPM-facing lesson, kept out of normal UI:

```text
pattern is not proof
pressure reduction is not completion
goal-looking state is not safe finish
residue must be carried into the next move
```

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
  = a fictionalized signal-navigation puzzle based on selected historic chart events.
```

This lets later variants reuse the same stage:

- Bug Failure Surface Scout.
- Shopping Boundary Scout.
- Travel Planner Residue Scout.
- Coding Agent Test Scout.

## Why Historic Chart Data

The first version may use **real historic chart data from 2016 onward** as a scenario-writing source.

Use the data to identify moments such as:

- strong upward signal,
- sudden reversal,
- low-liquidity-looking move,
- high-volatility corridor,
- breakout followed by retrace,
- consolidation before movement,
- false continuation,
- safer delayed confirmation.

Then convert those into game events.

Important boundary:

```text
historic chart data -> scenario script
not
historic chart data -> live trading model
```

The game may use market-like words such as signal, support, risk, entry, exit, buy, sell, or skip **inside the fictional scenario**, but the app must not connect this to live trading, brokerage/exchange execution, portfolio advice, or saved transferable strategy.

Phase 1 must not use live market data. It should use a small checked-in scenario fixture or generated static JSON derived from historic data.

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
4. Convert 3-5 event windows into fictional map nodes.
5. Store only the scenario fixture needed by the game.
6. Attribute the data source and transformation.
```

Do not ship a general chart-data downloader in Phase 1.

## Scenario Story

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
  nimiq_pocket: 2
```

Nimiq Pocket is not a trading balance. It is a controlled value/capacity surface in the game.

## Map Nodes

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
      historic_pattern_source:
        event_window_id: "tbd"
        pattern_type: "strong_signal_with_reversal_risk"
      false_landfall_trap:
        trigger: "act_without_support"
        why_it_is_false_closure: "The signal looked strong, but support was never inspected."

    - id: support_well
      label: "Support Well"
      visible_clue: "This may show whether the signal has support."
      hidden_pressure:
        - "support may be thin"

    - id: rumor_echo
      label: "Noise Echo"
      visible_clue: "This may show whether the signal is noise."
      hidden_pressure:
        - "source may be unreliable"

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

## Move Examples

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

  inspect_noise:
    target_node: rumor_echo
    cost:
      bot_attention: 1
    reveals:
      - "signal may be noise-driven"
    leaves_residue:
      - "support depth still unknown"

  remember_lesson:
    target_node: context_shrine
    cost:
      context_slots: 1
    remembers:
      - "Fast signals need support."

  act_on_signal:
    target_node: golden_signal
    cost:
      bot_attention: 3
      nimiq_pocket: 1
    can_finish: true
    false_if:
      - "support not inspected"

  skip_signal:
    cost:
      bot_attention: 0
    preserves_residue:
      - "opportunity unresolved"
```

## Proposal Card Example

```text
Pocket Bot proposes:
  Inspect the Support Well.

Why:
  The Golden Signal is bright, but support is unknown.

Cost:
  2 Bot Attention.

Reveals:
  Whether the signal has support.

Leaves unknown:
  Noise source.

Alternative:
  Act now, but that may create a false finish.
```

## Trace Card Example

```text
Trace Card:
  Action: Inspect Support Well
  Cost: 2 Bot Attention
  Revealed: Support is thin
  Residue: Noise source unknown
  Lesson: Bright signals need support
```

## Finish Judgments

```yaml
finish_judgments:
  safe_finish:
    when:
      - "support inspected before acting"
      - "remaining uncertainty visible or carried"
      - "trace explains the route"
    message: "You did not just follow the signal. You inspected what mattered."

  partial_finish:
    when:
      - "one support source inspected"
      - "some target-relevant residue remains visible"
    message: "Useful progress. Not enough for a full safe finish."

  false_finish:
    when:
      - "act_on_signal before support inspection"
    message: "The path looked bright, but the trace shows hidden risk remained."

  open_run:
    when:
      - "attention exhausted before finish"
    message: "The route is open. Your trace can guide the next run."
```

## Route Proposal Schema Extension

For this scenario, the route proposal schema should keep the current invariant fields:

```yaml
route_proposal:
  move_type: inspect | ask | remember | forget | skip | act
  target_node:
  reason:
  resource_cost:
    bot_attention:
    user_attention:
    context_slots:
    nimiq_pocket:
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

Scenario-specific adjustment:

- Allow market-like vocabulary inside the fictional game script.
- Do not ban terms such as signal, support, buy, sell, enter, exit, or skip when used as in-game language.
- Do not connect those terms to live market data, real trading, brokerage/exchange actions, portfolio advice, or exported strategy.
- Do not persist learned strategy beyond the session.
- Do not provide a downloadable or reusable trading bot policy.

Required product boundary text for docs or debug/dev surfaces:

```text
Market Signal Scout is a fictional signal-navigation puzzle using historic patterns as story material. It is not financial advice and does not connect to live trading.
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
export const marketSignalScoutScenario = {
  id: "market_signal_scout",
  title: "The Golden Signal",
  lesson: "Fast signals need support.",
  sourceMode: "historic_chart_derived_static_fixture",
  dataBoundary: {
    liveMarketData: false,
    realTrading: false,
    persistentStrategyExport: false
  },
  startingResources: {
    botAttention: 7,
    contextSlots: 3,
    nimiqPocket: 2
  },
  protectedOutcomes: [
    "support inspected before acting",
    "remaining uncertainty visible",
    "trace explains the route"
  ],
  nodes: {}
};
```

## Tests

```text
Market Signal Scout tests:
```

- scenario loads with starting resources;
- scenario declares historic-chart-derived static fixture mode;
- golden signal hides support and noise pressure before inspection;
- inspect support spends Bot Attention and reveals support state;
- inspect support leaves noise residue;
- skip signal preserves residue;
- act on signal without support triggers false finish;
- inspecting support plus carrying lesson can enable safe finish;
- partial inspection leads to partial finish, not safe finish;
- trace card records action, cost, reveal, residue, and lesson;
- proposal schema allows market-like game vocabulary;
- proposal schema blocks live-trading, wallet-authority, brokerage/exchange execution, or persistent strategy export claims.

## Source Attribution Requirements

If historic chart data is used, add the data source to `docs/product/source_attribution.md` with:

- provider name;
- URL;
- license or terms note;
- date range used;
- whether raw data is shipped, transformed, or only used to author the scenario;
- whether any script generated scenario windows;
- statement that the data is used for a fictional educational game scenario, not live trading.

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
2. Bot proposes acting quickly.
3. Player asks what remains unknown.
4. Bot names support residue.
5. Player redirects to inspect Support Well.
6. Bot spends 2 Attention.
7. Support clue is revealed.
8. Trace card records action, cost, reveal, residue.
9. Bot proposes safer route or partial finish.
10. Final status shows safe / partial / false / open.
```
