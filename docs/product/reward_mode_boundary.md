# Reward Mode Boundary

Status: scaffold for future reward-mode design.
Role: product, safety, and implementation boundary for any Nimiq-denominated reward experiment connected to `Market Signal Scout` or later generated-pattern modes.

## Purpose

`Market Signal Scout` may use market-like vocabulary, historical pattern fixtures, Pocket Bot learning, and game outcomes. This document keeps those game outcomes separate from live trading, gambling-like mechanics, portfolio advice, and uncontrolled value movement.

The current playable scenario should treat value as an in-game capacity surface unless and until a separate reviewed reward mode is intentionally implemented.

## Current Rule

```yaml
phase_1_rule:
  real_nim_rewards: false
  real_nim_penalties: false
  user_account_debits: false
  mainnet_value_movement: false
  live_trading: false
  exchange_or_brokerage_execution: false
  persistent_trading_strategy_export: false
  reward_basis: "Pocket Spark, trace quality, lessons, and finish cards only"
```

Player-facing Phase 1 language should use:

```text
Pocket Spark
```

not:

```text
NIM trading balance
```

## Hard Boundaries

These boundaries are not tuning knobs.

```yaml
hard_boundaries:
  no_real_user_loss:
    rule: "Never debit, slash, fine, or subtract real NIM from a user account because of a game outcome."

  no_live_trading:
    rule: "Scenario actions such as Enter, Exit, Wait, or Skip are fictional game actions only."

  no_profit_primary_reward:
    rule: "Do not make simulated market profit the primary reward basis."

  no_historical_reward_farming:
    rule: "Do not attach real rewards to replayable historical windows where users can memorize known outcomes."

  no_strategy_export:
    rule: "Do not export a persistent or reusable trading bot policy."

  no_hidden_value_authority:
    rule: "The bot must never gain wallet, exchange, brokerage, or autonomous spending authority from scenario play."
```

## Mode Split

### 1. Training Mode

Historical Bitcoin-derived fixtures belong here first.

```yaml
training_mode:
  source_material:
    - historical chart-derived static fixtures
    - attributed market-event witnesses
    - fictionalized signal-navigation levels
  real_rewards: false
  real_penalties: false
  replay_allowed: true
  player_goal:
    - teach Pocket Bot
    - spend attention wisely
    - preserve trace
    - avoid false finish
  reward_surfaces:
    - Pocket Spark
    - finish cards
    - badges
    - score
    - unlocked levels
    - bot policy lessons
```

Training Mode may use hindsight cards because no real reward is attached to memorizing the history.

### 2. Generated Pattern Reward Mode

This is a possible later mode, not Phase 1.

```yaml
generated_pattern_reward_mode:
  status: future_review_required
  source_material:
    - generated market-like patterns
    - no live market data
    - no exact historical replay windows
  real_rewards:
    allowed_only_if:
      - reward pool is capped
      - user never stakes or loses real funds
      - reward is based on traceable decision quality
      - terms and user-facing copy are reviewed
      - anti-abuse controls exist
      - proposal engine cannot see terminal reveal
  real_penalties: false
  user_account_debits: false
  primary_score_axes:
    - support checked when needed
    - event context checked or residualized
    - exit friction checked or residualized
    - FOMO/crowd pressure recognized
    - trace re-enterable
    - false certainty avoided
    - partial finish accepted when full finish is unsupported
```

### 3. Forbidden Mode

```yaml
forbidden_mode:
  examples:
    - user stakes NIM to play a market outcome
    - user can lose real NIM because the route failed
    - rewards mainly follow simulated PnL
    - bot learns and exports a trading strategy
    - game connects Enter/Exit to exchange or wallet execution
    - historical chart replay pays real rewards
    - live market data determines reward outcome
```

## Reward Basis

Reward the quality of the decision trace, not hindsight profit.

```yaml
preferred_reward_basis:
  decision_quality:
    - checked_signal_support
    - checked_event_context
    - checked_exit_path
    - checked_fomo_or_pressure
    - named_remaining_unknowns
    - carried_residue
    - avoided_false_certainty

  trace_quality:
    - action_cost_recorded
    - reveal_recorded
    - still_unknown_recorded
    - lesson_carried_forward
    - later_reentry_possible

  resource_quality:
    - attention_not_wasted
    - context_slots_used_meaningfully
    - partial_finish_chosen_when_appropriate

  learning_quality:
    - bot_policy_improved
    - unsafe_bias_corrected
    - future_proposals_become_more_cautious_in_the_right_place
```

Low-weight or diagnostic-only:

```yaml
simulated_market_result:
  examples:
    - gain
    - loss
    - avoided_loss
    - missed_gain
  allowed_role: "hindsight flavor and diagnostic context"
  forbidden_role: "primary reward or proof of good decision"
```

## Account Adjustment Rule

If a future reviewed mode uses real NIM at all, account adjustment must be one-way from an explicit reward pool to the user.

```yaml
account_adjustment:
  allowed_future_shape:
    - non-negative user reward only
    - capped reward pool
    - explicit user consent
    - visible reward terms
    - no user stake
    - no user debit
    - no autonomous bot spend
    - no hidden transaction request

  forbidden_shape:
    - subtract NIM from user account
    - lock user funds as stake
    - make player losses payable in real tokens
    - connect game Enter/Exit to wallet send/sign actions
```

## Historical Exploit Boundary

Known historical fixtures are good for learning. They are bad for reward-bearing competition.

```yaml
historical_mode:
  use_for:
    - onboarding
    - training
    - replay
    - campaign story
    - policy lesson demonstrations
  do_not_use_for:
    - real token reward optimization
    - leaderboard prizes based on known outcomes
    - user-account adjustment
```

If players study historical charts, that is acceptable in Training Mode. It becomes a design problem only when real rewards are attached.

## Bot Learning Boundary

Pocket Bot should learn signal-navigation discipline, not an exportable trading strategy.

```yaml
bot_may_learn:
  - ask what remains unknown
  - check support before bright-signal action
  - check exit path when volatility or pressure is high
  - treat profit-looking states as unlanded until exit is checked
  - carry residue between levels
  - accept partial finish

bot_must_not_learn_or_export:
  - buy/sell rules for real markets
  - parameterized trading strategy
  - future price prediction policy
  - portfolio allocation advice
  - autonomous exchange or wallet behavior
```

## Implementation Gates

Before any future reward mode ships, create explicit gates and tests for:

```yaml
required_gates:
  product_gate:
    - player copy states fictional scenario use
    - reward terms are explicit
    - no promise of investment outcome

  runtime_gate:
    - no live market data dependency
    - no terminal reveal leakage
    - no wallet send/sign call from scenario action
    - no negative user balance adjustment

  scoring_gate:
    - simulated profit has low or diagnostic weight
    - decision and trace quality dominate score
    - false finish can occur despite simulated gain

  abuse_gate:
    - capped rewards
    - replay limits if real rewards exist
    - generated fixtures for reward mode
    - no known historical answer farming

  documentation_gate:
    - source attribution updated
    - reward boundary documented
    - non-goals remain visible
```

## Safe Player Copy

Phase 1:

```text
Pocket Spark is game energy. It helps Pocket Bot inspect the fog, but it is not a trading balance.
```

Future reviewed reward experiment, if ever adopted:

```text
Rewards are based on the quality of your route and trace, not on real trading or investment performance.
```

Do not use:

```text
Trade Bitcoin to earn NIM.
Profit from historical Bitcoin patterns.
Let the bot trade for you.
Stake NIM on market outcomes.
```

## Close Rule

Until this document is explicitly superseded by a reviewed implementation plan, `Market Signal Scout` remains:

```text
a fictional signal-navigation puzzle with Pocket Spark, trace cards, lessons, and finish judgments;
not a real trading, betting, wallet-spending, or NIM-loss game.
```
