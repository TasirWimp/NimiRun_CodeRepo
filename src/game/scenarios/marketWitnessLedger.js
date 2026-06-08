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

import {
  BTCUSDT_FIXTURE_SOURCE,
  getBtcusdtWitnessWindowById,
} from './data/marketSignalScoutBtcusdtWindows.js';

const GOLDEN_SIGNAL_WINDOW = getBtcusdtWitnessWindowById(
  'btc_binance_btcusdt_2017_12_golden_signal'
);

const HEADLINE_WITNESS_NOTE =
  'Source headline/title and URL are used for attribution; no article body is copied, and the mechanics connector is project-authored.';

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
      id: "btc_binance_btcusdt_2017_12_price_shape",
      title: "Golden Signal Binance BTCUSDT December 2017 price-shape witness",
      status: MARKET_WITNESS_STATUS.ACCEPTED,
      sourceClass: MARKET_WITNESS_SOURCE_CLASSES.PRICE_SHAPE,
      sourceRecord: Object.freeze({
        providerName: BTCUSDT_FIXTURE_SOURCE.provider,
        url: BTCUSDT_FIXTURE_SOURCE.sourceArchiveUrl,
        licenseEvidenceUrl: BTCUSDT_FIXTURE_SOURCE.licenseEvidenceUrl,
        retrievalDate: BTCUSDT_FIXTURE_SOURCE.retrievalDate,
        coveredTimeRange: `${BTCUSDT_FIXTURE_SOURCE.coveredRange.start}..${BTCUSDT_FIXTURE_SOURCE.coveredRange.end}`,
        licenseOrTermsNote: `${BTCUSDT_FIXTURE_SOURCE.licenseName} per Binance Public Data README; checksum ${BTCUSDT_FIXTURE_SOURCE.sourceChecksum}`,
        sourceChecksumUrl: BTCUSDT_FIXTURE_SOURCE.sourceChecksumUrl,
        sourceChecksum: BTCUSDT_FIXTURE_SOURCE.sourceChecksum,
        shippedAs: MARKET_WITNESS_SHIPPING.TRANSFORMED_FIXTURE
      }),
      sourceWindowId: GOLDEN_SIGNAL_WINDOW.id,
      mechanicsConnector: GOLDEN_SIGNAL_WINDOW.mechanicsConnector,
      usedForSurfaces: Object.freeze([
        MARKET_WITNESS_SURFACES.CHART,
        MARKET_WITNESS_SURFACES.HINDSIGHT
      ]),
      relatedLevelIds: Object.freeze(["level_02_golden_signal"]),
      transformedGameClaim:
        "A strong visible BTCUSDT signal can be authored as the opening lure for a level.",
      supportsClaim:
        "The player and Pocket Bot may initially see a bright momentum-like signal.",
      doesNotSupport: Object.freeze([
        "global Bitcoin price index",
        "live trading rule",
        "future price prediction",
        "player-specific portfolio advice",
        "safe finish by profit alone",
        "investment advice"
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
      id: "btc_futures_gate_cboe_2017_12_04",
      title: "Cboe Plans December 10 Launch of Bitcoin Futures Trading",
      status: MARKET_WITNESS_STATUS.ACCEPTED,
      sourceClass: MARKET_WITNESS_SOURCE_CLASSES.MARKET_EVENT,
      sourceRecord: Object.freeze({
        providerName: "Cboe Global Markets",
        url: "https://ir.cboe.com/news/news-details/2017/Cboe-Plans-December-10-Launch-of-Bitcoin-Futures-Trading-12-04-2017/default.aspx",
        retrievalDate: "2026-06-08",
        coveredTimeRange: "2017-12-04 source announcement",
        licenseOrTermsNote: HEADLINE_WITNESS_NOTE,
        shippedAs: MARKET_WITNESS_SHIPPING.AUTHORING_REFERENCE_ONLY
      }),
      mechanicsConnector:
        "Futures Gate makes the signal brighter, but the route may be crowded.",
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
        "trading instruction",
        "investment advice"
      ]),
      visibility: Object.freeze({
        visibleAtLevelStart: false,
        visibleAfterActions: Object.freeze(["check_event", "check_support"]),
        hiddenUntilHindsight: false,
        forbiddenBeforeFinish: Object.freeze(["terminal_reveal"])
      }),
      residue: Object.freeze([
        "chart support may still be unknown",
        "exit friction may still be unknown"
      ])
    }),
    Object.freeze({
      id: "btc_futures_gate_cftc_2017_12_01_risk_context",
      title: "CFTC Statement on Self-Certification of Bitcoin Products by CME, CFE and Cantor Exchange",
      status: MARKET_WITNESS_STATUS.ACCEPTED,
      sourceClass: MARKET_WITNESS_SOURCE_CLASSES.EXIT_FRICTION,
      sourceRecord: Object.freeze({
        providerName: "U.S. Commodity Futures Trading Commission",
        url: "https://www.cftc.gov/PressRoom/PressReleases/7654-17",
        retrievalDate: "2026-06-08",
        coveredTimeRange: "2017-12-01 source statement",
        licenseOrTermsNote: HEADLINE_WITNESS_NOTE,
        shippedAs: MARKET_WITNESS_SHIPPING.AUTHORING_REFERENCE_ONLY
      }),
      mechanicsConnector:
        "Exit Friction warns that a bright route can break if volatility and exit pressure are ignored.",
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
        "safe finish by mark-to-market gain",
        "legal advice",
        "investment advice"
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
      id: "btc_futures_gate_cme_2017_12_01_event_pressure",
      title: "CME Group Self-Certifies Bitcoin Futures to Launch Dec. 18",
      status: MARKET_WITNESS_STATUS.ACCEPTED,
      sourceClass: MARKET_WITNESS_SOURCE_CLASSES.PSYCHOLOGY_PRESSURE,
      sourceRecord: Object.freeze({
        providerName: "CME Group",
        url: "https://www.cmegroup.com/media-room/press-releases/2017/12/01/cme_group_self-certifiesbitcoinfuturestolaunchdec18.html",
        retrievalDate: "2026-06-08",
        coveredTimeRange: "2017-12-01 source announcement",
        licenseOrTermsNote: HEADLINE_WITNESS_NOTE,
        shippedAs: MARKET_WITNESS_SHIPPING.AUTHORING_REFERENCE_ONLY
      }),
      mechanicsConnector:
        "Second Gate raises urgency pressure, but urgency is not support.",
      usedForSurfaces: Object.freeze([
        MARKET_WITNESS_SURFACES.PSYCHOLOGY
      ]),
      relatedLevelIds: Object.freeze(["level_02_golden_signal"]),
      transformedGameClaim:
        "Pocket Bot may overweight a bright visible signal before the player teaches it to ask what remains unknown.",
      supportsClaim:
        "The bot can begin with a bright_signal_fast_action bias around a busy event surface.",
      doesNotSupport: Object.freeze([
        "diagnosis of real player psychology",
        "claim about all market participants",
        "trading advice",
        "investment advice"
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
      visibleAtStart: Object.freeze(["btc_binance_btcusdt_2017_12_price_shape"]),
      inspectable: Object.freeze({
        check_signal: Object.freeze(["btc_binance_btcusdt_2017_12_price_shape"]),
        check_support: Object.freeze([
          "btc_binance_btcusdt_2017_12_price_shape",
          "btc_futures_gate_cboe_2017_12_04"
        ]),
        check_event: Object.freeze([
          "btc_futures_gate_cboe_2017_12_04",
          "btc_futures_gate_cme_2017_12_01_event_pressure"
        ]),
        check_exit: Object.freeze(["btc_futures_gate_cftc_2017_12_01_risk_context"]),
        check_fomo: Object.freeze(["btc_futures_gate_cme_2017_12_01_event_pressure"]),
        ask_remaining_unknown: Object.freeze(["btc_futures_gate_cme_2017_12_01_event_pressure"])
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

export function validateMarketWitnessEvidence(ledger = marketWitnessLedger) {
  const errors = [];

  for (const witness of ledger.witnesses || []) {
    const record = witness.sourceRecord || {};

    if (witness.status === MARKET_WITNESS_STATUS.PLACEHOLDER) {
      errors.push(`${witness.id} is still a placeholder.`);
    }

    for (const field of ["providerName", "url", "retrievalDate", "coveredTimeRange", "licenseOrTermsNote", "shippedAs"]) {
      if (!record[field] || record[field] === "tbd") {
        errors.push(`${witness.id} missing source record field: ${field}`);
      }
    }

    if (!witness.mechanicsConnector) {
      errors.push(`${witness.id} missing mechanics connector.`);
    }

    if (!witness.doesNotSupport?.includes("investment advice")) {
      errors.push(`${witness.id} must reject investment-advice interpretation.`);
    }

    if (witness.sourceClass === MARKET_WITNESS_SOURCE_CLASSES.PRICE_SHAPE) {
      if (!record.licenseEvidenceUrl || !record.sourceChecksumUrl || !record.sourceChecksum) {
        errors.push(`${witness.id} missing Binance license or checksum evidence.`);
      }

      if (record.shippedAs !== MARKET_WITNESS_SHIPPING.TRANSFORMED_FIXTURE) {
        errors.push(`${witness.id} must ship as a transformed fixture.`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
