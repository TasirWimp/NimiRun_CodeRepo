# Market Witness Governance

Status: scaffold for `Market Signal Scout`.
Role: internal product and implementation governance for turning historical Bitcoin market material into fictional, playable scenario witnesses.
Player UI rule: do not expose CRPM terms, witness-governance terms, trading-model language, or source-ocean language directly to normal players.

## Purpose

`Market Signal Scout` uses historical market material as story input for a lossy signal-navigation game. This file governs how raw price data, historical market events, exchange/infrastructure context, and later internet-reentered evidence may become bounded game witnesses.

The controlling distinction is:

```text
historical / internet-reentered market information
  -> governed witness
  -> transformed static scenario fixture
  -> playable clue, hidden pressure, trace, or hindsight card

not

historical / internet-reentered market information
  -> live trading model
  -> investment advice
  -> reusable trading strategy
  -> direct market prediction engine
```

## Relation To `market_signal_scout.md`

`docs/product/scenarios/market_signal_scout.md` defines the playable scenario loop.

This document defines the upstream evidence discipline for that loop:

- what counts as a market witness;
- how a witness may be transformed into a level clue;
- what must remain attributed, scoped, and residualized;
- what the bot may know before a reveal;
- what is forbidden to turn into player-facing claims.

The scenario can stay playful. This file keeps the authoring layer honest.

## World Model

Design-facing world description:

```text
A fog-covered historical Bitcoin market ocean where chart signals appear before their support,
context, exit path, infrastructure pressure, and crowd psychology are fully visible.
```

Player-facing version:

```text
Teach Pocket Bot to survive bright signals in a foggy market world.
```

Internal objects:

```yaml
source_ocean:
  description: "historical Bitcoin market reality richer than any one chart, article, metric, or event label"

witnesses:
  description: "retrievable historical records or transformed evidence packets used to author scenario fixtures"

level_fixture:
  description: "fictionalized playable island derived from one or more witnesses"

trace:
  description: "player/bot route memory: action, cost, reveal, still unknown, and carried lesson"

hindsight_card:
  description: "post-level reveal of what the level fixture says happened after the visible decision point"
```

## Witness Classes

Each imported or re-entered market fact must be classified before it can affect gameplay.

```yaml
witness_classes:
  price_shape:
    examples:
      - OHLCV window
      - drawdown / breakout / reversal shape
      - volatility cluster
    may_support:
      - chart_surface
      - hindsight_reveal
    may_not_support:
      - live prediction
      - player-specific trading advice

  market_event:
    examples:
      - exchange failure
      - regulatory shock
      - protocol or infrastructure event
      - liquidity or settlement disruption
    may_support:
      - event_surface
      - hidden_environment_state
      - hindsight_reveal
    may_not_support:
      - unscoped causal certainty
      - documentary claim without attribution

  exit_friction:
    examples:
      - exchange overload
      - withdrawal delay
      - liquidity gap
      - high congestion / delayed settlement
    may_support:
      - exit_surface
      - false_finish condition
      - partial_finish condition
    may_not_support:
      - real exchange execution logic
      - wallet authority

  psychology_pressure:
    examples:
      - FOMO
      - panic
      - crowd euphoria
      - overconfidence
    may_support:
      - psychology_surface
      - bot proposal bias
      - lesson wording
    may_not_support:
      - diagnosis of real player psychology
```

## Witness Packet

Every adopted witness should be reducible to this packet before Codex or a scenario adapter turns it into runtime data.

```yaml
market_witness:
  witness_id:
  status: candidate | accepted | rejected | placeholder
  source_class: price_shape | market_event | exit_friction | psychology_pressure | mixed

  source_record:
    provider_name:
    url:
    retrieval_date:
    covered_time_range:
    license_or_terms_note:
    raw_data_shipped: true | false
    transformed_fixture_shipped: true | false
    authoring_reference_only: true | false

  source_claim:
    raw_claim:
    confidence_note:
    attribution_required: true | false

  transformation:
    transformed_game_claim:
    fictionalization_level: low | medium | high
    used_for_surfaces:
      - chart_surface
      - event_surface
      - exit_surface
      - psychology_surface
      - hindsight_reveal
    used_for_level_ids: []

  visibility:
    visible_at_level_start: true | false
    visible_after_actions: []
    hidden_until_hindsight: true | false
    forbidden_before_finish: []

  residue:
    does_not_establish: []
    still_unknown: []
    scope_limits: []

  implementation_notes:
    fixture_path:
    source_attribution_entry_added: true | false
    proposal_engine_may_read: true | false
    terminal_reveal_only: true | false
```

## Witness Lifecycle

```text
1. Re-enter source material.
2. Classify the witness.
3. Record attribution and use rights.
4. Declare which scenario surface it may affect.
5. Transform it into a fictional clue, hidden pressure, or hindsight reveal.
6. Declare what it does not establish.
7. Store only the bounded fixture needed by the game.
8. Keep terminal reveal fields unavailable to proposal generation before finish.
9. Preserve residue in the trace or hindsight card.
```

## Visibility Rules

The world engine may hold hidden fixture information. Pocket Bot's proposal policy must not behave as if it has already seen future or hindsight-only fields.

```yaml
visibility_rules:
  player_visible:
    - current map node
    - current resources
    - revealed clues
    - trace cards
    - player-facing proposal reason

  bot_proposal_visible:
    - player_visible
    - current bot policy flags
    - inherited lessons and carried residue
    - allowed alternatives for the current state

  world_engine_hidden:
    - hidden pressures for current level
    - terminal reveal
    - future level fixtures

  forbidden_for_bot_before_finish:
    - terminal_reveal
    - hindsight-only fields
    - later level outcomes
    - real market future beyond the current fixture boundary
```

## Finish Governance

Player UI should say `finish`, not `landfall`.

```yaml
finish_status:
  safe_finish:
    requires:
      - protected lesson survived
      - relevant residue is visible or resolved
      - scope is clear
      - trace supports later re-entry

  partial_finish:
    requires:
      - at least one major uncertainty inspected
      - remaining uncertainty is named
      - no full-safe claim is made

  false_finish:
    triggered_by:
      - signal strength treated as proof
      - simulated profit treated as safety
      - exit friction hidden
      - support/context hidden when protected
      - hindsight result substituted for decision quality

  open_run:
    allowed_when:
      - attention is exhausted
      - player marks unresolved
      - trace still supports later return
```

## Allowed Transformations

```yaml
allowed:
  - historical OHLCV window -> chart-shape clue
  - Binance BTCUSDT static fixture -> scoped chart-surface witness
  - actual historical headline/title -> witness label plus in-game mechanics connector
  - drawdown/reversal window -> fictional signal archetype
  - exchange/event report -> event or exit-pressure clue
  - historical crowd narrative -> fictional FOMO/panic pressure
  - hindsight outcome -> post-level reveal only
  - multiple witnesses -> composite level fixture with explicit residue
```

## Forbidden Transformations

```yaml
forbidden:
  - live market data fetch in the Phase 1 browser runtime
  - exchange, brokerage, wallet, or transaction execution from a scenario action
  - real portfolio advice
  - price prediction claims
  - persistent or downloadable trading strategy export
  - treating simulated profit as safe finish
  - presenting a historical headline as a direct trading instruction
  - letting proposal generation inspect terminal reveal before finish
  - unattributed documentary claims
  - reward-bearing historical replay without a separate reward-mode boundary
```

## Preferred PB-013 Market Data Source

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
  market_scope: "Binance spot BTCUSDT venue history, not a global Bitcoin index"
  covered_range: "2017-12-01 through 2017-12-24"
  intervals:
    - "1d for campaign arc"
    - "1h only for small local level windows if needed"
  license_note: "MIT licence stated in binance/binance-public-data README"
  shipped_as: "transformed_static_fixture"
  fixture_path: "src/game/scenarios/data/marketSignalScoutBtcusdtWindows.js"
  residue:
    - "Binance-specific venue history"
    - "BTCUSDT pair, not BTC/EUR or global BTC/USD index"
    - "coverage starts only when Binance/BTCUSDT data exists"
    - "suitable for game fixture authoring, not live trading claims"
```

Actual headline/title witnesses may be player-visible when they are paired with
a mechanics connector. The connector must explain what the headline changes in
the level, such as event pressure, exit pressure, or FOMO pressure. It must not
tell the player to trade.

## Source Attribution Duty

When a historical chart or market-event source is adopted, update `docs/product/source_attribution.md` with:

- provider name;
- URL;
- license or terms note;
- date range used;
- whether raw data is shipped, transformed, or used only to author the scenario;
- whether a script generated scenario windows;
- statement that the data is used for a fictional educational game scenario, not live trading.

## Implementation Ports For Codex

Codex may continue from this file by wiring:

```text
src/game/scenarios/marketWitnessLedger.js
  -> static witness registry
  -> level-to-witness mapping
  -> fixture visibility guards
  -> tests that block terminal reveal leakage
```

This file does not require runtime integration by itself.
