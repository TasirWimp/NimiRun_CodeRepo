/**
 * Static witness ledger scaffold for Market Signal Scout.
 *
 * Boundary:
 * - no live market fetches
 * - no wallet, exchange, brokerage, or transaction authority
 * - no price prediction
 * - no persistent trading strategy export
 *
 * Historical and internet-reentered market material must enter the game as
 * attributed, transformed, static witnesses. Scenario actions may reveal clues,
 * residue, and hindsight cards; they must not execute or imply real trading.
 */

export const MARKET_WITNESS_SOURCE_CLASSES = Object.freeze({
  PRICE_SHAPE: "price_shape",
  MARKET_EVENT: "market_event",
  EXIT_FRICTION: "exit_friction",
  PSYCHOLOGY_PRESSURE: "psychology_pressure",
  MIXED: "mixed"
});

export const MARKET_WITNESS_SURFACES = Object.freeze({
  CHART: "chart_surface",
  EVENT: "event_surface",
  EXIT: "exit_surface",
  PSYCHOLOGY: "psychology_surface",
  HINDSIGHT: "hindsight_reveal"
});

export const MARKET_WITNESS_STATUS = Object.freeze({
  PLACEHOLDER: "placeholder",
  CANDIDATE: "candidate",
  ACCEPTED: "accepted",
  REJECTED: "rejected"
});

export const MARKET_WITNESS_SHIPPING = Object.freeze({
  RAW_DATA: "raw_data",
  TRANSFORMED_FIXTURE: "transformed_fixture",
  AUTHORING_REFERENCE_ONLY: "authoring_reference_only"
});

export const marketWitnessBoundary = Object.freeze({
  scenarioId: "market_signal_scout",
  sourceMode: "historic_internet_reentered_static_fixture",
  liveMarketData: false,
  realTrading: false,
  exchangeIntegration: false,
  brokerageIntegration: false,
  walletAuthority: false,
  persistentStrategyExport: false,
  terminalRevealVisibleToProposalEngine: false,
  primaryRewardBasis: "traceable_decision_quality_not_simulated_profit"
});

export const marketWitnessLedger = Object.freeze({
  id: "market_witness_ledger_v0",
  scenarioId: "market_signal_scout",
  relatedDocs: Object.freeze([
    "docs/product/scenarios/market_signal_scout.md",
    "docs/product/scenarios/market_witness_governance.md",
    "docs/product/reward_mode_boundary.md",
    "docs/product/source_attribution.md"
  ]),
  boundary: marketWitnessBoundary,
  protectedOutcomes: Object.freeze([
    "support/context/exit uncertainty remains visible",
    "trace explains the route",
    "safe finish requires re-entry from trace",
    "simulated profit is not treated as safety"
  ]),
  witnesses: Object.freeze([
    Object.freeze({
      id: "btc_window_02_price_shape_tbd",
      title: "Golden Signal price-shape witness placeholder",
      status: MARKET_WITNESS_STATUS.PLACEHOLDER,
      sourceClass: MARKET_WITNESS_SOURCE_CLASSES.PRICE_SHAPE,
      sourceRecord: Object.freeze({
        providerName: "tbd",
        url: "tbd",
        retrievalDate: "tbd",
        coveredTimeRange: "tbd",
        licenseOrTermsNote: "tbd",
        shippedAs: MARKET_WITNESS_SHIPPING.TRANSFORMED_FIXTURE
      }),
      usedForSurfaces: Object.freeze([
        MARKET_WITNESS_SURFACES.CHART,
        MARKET_WITNESS_SURFACES.HINDSIGHT
      ]),
      relatedLevelIds: Object.freeze(["level_02_golden_signal"]),
      transformedGameClaim:
        "A strong visible signal can be authored as the opening lure for a level.",
      supportsClaim:
        "The player and Pocket Bot may initially see a bright momentum-like signal.",
      doesNotSupport: Object.freeze([
        "live trading rule",
        "future price prediction",
        "player-specific portfolio advice",
        "safe finish by profit alone"
      ]),
      visibility: Object.freeze({
        visibleAtLevelStart: true,
        visibleAfterActions: Object.freeze(["check_signal"]),
        hiddenUntilHindsight: false,
        forbiddenBeforeFinish: Object.freeze(["what_happened_next"])
      }),
      residue: Object.freeze([
        "support depth not established",
        "exit path not established",
        "event context not established"
      ])
    }),
    Object.freeze({
      id: "btc_window_02_event_context_tbd",
      title: "Golden Signal event-context witness placeholder",
      status: MARKET_WITNESS_STATUS.PLACEHOLDER,
      sourceClass: MARKET_WITNESS_SOURCE_CLASSES.MARKET_EVENT,
      sourceRecord: Object.freeze({
        providerName: "tbd",
        url: "tbd",
        retrievalDate: "tbd",
        coveredTimeRange: "tbd",
        licenseOrTermsNote: "tbd",
        shippedAs: MARKET_WITNESS_SHIPPING.AUTHORING_REFERENCE_ONLY
      }),
      usedForSurfaces: Object.freeze([
        MARKET_WITNESS_SURFACES.EVENT,
        MARKET_WITNESS_SURFACES.HINDSIGHT
      ]),
      relatedLevelIds: Object.freeze(["level_02_golden_signal"]),
      transformedGameClaim:
        "A signal may have surrounding event pressure that changes its meaning.",
      supportsClaim:
        "Checking what happened around the signal can reveal relevant context.",
      doesNotSupport: Object.freeze([
        "unscoped causal certainty",
        "documentary claim without attribution",
        "trading instruction"
      ]),
      visibility: Object.freeze({
        visibleAtLevelStart: false,
        visibleAfterActions: Object.freeze(["check_event"]),
        hiddenUntilHindsight: false,
        forbiddenBeforeFinish: Object.freeze(["terminal_reveal"])
      }),
      residue: Object.freeze([
        "chart support may still be unknown",
        "exit friction may still be unknown"
      ])
    }),
    Object.freeze({
      id: "btc_window_02_exit_friction_tbd",
      title: "Golden Signal exit-friction witness placeholder",
      status: MARKET_WITNESS_STATUS.PLACEHOLDER,
      sourceClass: MARKET_WITNESS_SOURCE_CLASSES.EXIT_FRICTION,
      sourceRecord: Object.freeze({
        providerName: "tbd",
        url: "tbd",
        retrievalDate: "tbd",
        coveredTimeRange: "tbd",
        licenseOrTermsNote: "tbd",
        shippedAs: MARKET_WITNESS_SHIPPING.AUTHORING_REFERENCE_ONLY
      }),
      usedForSurfaces: Object.freeze([
        MARKET_WITNESS_SURFACES.EXIT,
        MARKET_WITNESS_SURFACES.HINDSIGHT
      ]),
      relatedLevelIds: Object.freeze(["level_02_golden_signal"]),
      transformedGameClaim:
        "A profit-looking route may still be unsafe if the exit path is slow or unknown.",
      supportsClaim:
        "The level may require checking or residualizing exit friction before safe finish.",
      doesNotSupport: Object.freeze([
        "real exchange execution",
        "wallet action",
        "guaranteed liquidity",
        "safe finish by mark-to-market gain"
      ]),
      visibility: Object.freeze({
        visibleAtLevelStart: false,
        visibleAfterActions: Object.freeze(["check_exit"]),
        hiddenUntilHindsight: false,
        forbiddenBeforeFinish: Object.freeze(["terminal_reveal"])
      }),
      residue: Object.freeze([
        "event context may still be unknown",
        "crowd pressure may still be unknown"
      ])
    }),
    Object.freeze({
      id: "btc_window_02_fomo_pressure_tbd",
      title: "Golden Signal FOMO-pressure witness placeholder",
      status: MARKET_WITNESS_STATUS.PLACEHOLDER,
      sourceClass: MARKET_WITNESS_SOURCE_CLASSES.PSYCHOLOGY_PRESSURE,
      sourceRecord: Object.freeze({
        providerName: "scenario_authoring",
        url: "docs/product/scenarios/market_signal_scout.md",
        retrievalDate: "n/a",
        coveredTimeRange: "fictionalized level pressure",
        licenseOrTermsNote: "internal design fixture",
        shippedAs: MARKET_WITNESS_SHIPPING.TRANSFORMED_FIXTURE
      }),
      usedForSurfaces: Object.freeze([
        MARKET_WITNESS_SURFACES.PSYCHOLOGY
      ]),
      relatedLevelIds: Object.freeze(["level_02_golden_signal"]),
      transformedGameClaim:
        "Pocket Bot may overweight a bright visible signal before the player teaches it to ask what remains unknown.",
      supportsClaim:
        "The bot can begin with a bright_signal_fast_action bias.",
      doesNotSupport: Object.freeze([
        "diagnosis of real player psychology",
        "claim about all market participants",
        "trading advice"
      ]),
      visibility: Object.freeze({
        visibleAtLevelStart: false,
        visibleAfterActions: Object.freeze(["check_fomo", "ask_remaining_unknown"]),
        hiddenUntilHindsight: false,
        forbiddenBeforeFinish: Object.freeze([])
      }),
      residue: Object.freeze([
        "support depth may still be unknown",
        "exit path may still be unknown"
      ])
    })
  ]),
  levelWitnessMap: Object.freeze({
    level_02_golden_signal: Object.freeze({
      visibleAtStart: Object.freeze(["btc_window_02_price_shape_tbd"]),
      inspectable: Object.freeze({
        check_signal: Object.freeze(["btc_window_02_price_shape_tbd"]),
        check_event: Object.freeze(["btc_window_02_event_context_tbd"]),
        check_exit: Object.freeze(["btc_window_02_exit_friction_tbd"]),
        check_fomo: Object.freeze(["btc_window_02_fomo_pressure_tbd"]),
        ask_remaining_unknown: Object.freeze(["btc_window_02_fomo_pressure_tbd"])
      }),
      terminalRevealOnly: Object.freeze([
        "what_happened_next",
        "final_simulated_market_result",
        "hindsight_finish_judgment"
      ])
    })
  })
});

export function getMarketWitnessById(witnessId) {
  return marketWitnessLedger.witnesses.find((witness) => witness.id === witnessId) ?? null;
}

export function getMarketWitnessesForLevel(levelId) {
  return marketWitnessLedger.witnesses.filter((witness) =>
    witness.relatedLevelIds.includes(levelId)
  );
}

export function getVisibleMarketWitnessIds(levelId, action = "visibleAtStart") {
  const levelMap = marketWitnessLedger.levelWitnessMap[levelId];

  if (!levelMap) {
    return [];
  }

  if (action === "visibleAtStart") {
    return [...levelMap.visibleAtStart];
  }

  return [...(levelMap.inspectable[action] ?? [])];
}

export function validateMarketWitnessBoundary(ledger = marketWitnessLedger) {
  const boundary = ledger.boundary;
  const forbiddenEnabled = [
    boundary.liveMarketData,
    boundary.realTrading,
    boundary.exchangeIntegration,
    boundary.brokerageIntegration,
    boundary.walletAuthority,
    boundary.persistentStrategyExport,
    boundary.terminalRevealVisibleToProposalEngine
  ].some(Boolean);

  return {
    ok: !forbiddenEnabled,
    boundary,
    reason: forbiddenEnabled
      ? "Market Signal Scout witness boundary enables a forbidden live-trading or reveal-leak surface."
      : "Market Signal Scout witness boundary stays inside static fictional scenario use."
  };
}
