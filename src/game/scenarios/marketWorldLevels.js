import { getBtcusdtWitnessWindowById } from './data/marketSignalScoutBtcusdtWindows.js';
import { getVisibleMarketWitnessIds, marketWitnessBoundary } from './marketWitnessLedger.js';

export const MARKET_WORLD_RELATION_STATUS = Object.freeze({
  HIDDEN: 'hidden',
  VISIBLE: 'visible',
  REVEALED: 'revealed',
  RESIDUALIZED: 'residualized',
});

export const MARKET_WORLD_RELATION_SEVERITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
});

export const MARKET_WORLD_ACTIONS = Object.freeze({
  APPROVE_ENTER: 'approve_enter',
  WIDE_SCAN: 'wide_scan',
  CHECK_EXIT: 'check_exit',
  ASK_REMAINING_UNKNOWN: 'ask_remaining_unknown',
  CHECK_SIGNAL: 'check_signal',
  CHECK_SUPPORT: 'check_support',
  CHECK_EVENT: 'check_event',
  CHECK_CROWD: 'check_crowd',
  CHECK_VOLATILITY: 'check_volatility',
});

export const MARKET_WORLD_FINISH_STATUS = Object.freeze({
  SAFE: 'safe_finish',
  PARTIAL: 'partial_finish',
  FALSE: 'false_finish',
  OPEN: 'open_finish',
});

const GOLDEN_SIGNAL_LEVEL_ID = 'level_02_golden_signal';
const GOLDEN_SIGNAL_WINDOW = getBtcusdtWitnessWindowById(
  'btc_binance_btcusdt_2017_12_golden_signal'
);

const getGoldenSignalWitnessIds = (action) =>
  Object.freeze(getVisibleMarketWitnessIds(GOLDEN_SIGNAL_LEVEL_ID, action));

export const MARKET_WORLD_LEVELS = Object.freeze({
  level_02_golden_signal: Object.freeze({
    id: GOLDEN_SIGNAL_LEVEL_ID,
    title: 'Golden Signal',
    campaignId: 'market_signal_scout',

    boundary: Object.freeze({
      sourceMode: marketWitnessBoundary.sourceMode,
      liveMarketData: marketWitnessBoundary.liveMarketData,
      realTrading: marketWitnessBoundary.realTrading,
      exchangeIntegration: marketWitnessBoundary.exchangeIntegration,
      brokerageIntegration: marketWitnessBoundary.brokerageIntegration,
      walletAuthority: marketWitnessBoundary.walletAuthority,
      persistentStrategyExport: marketWitnessBoundary.persistentStrategyExport,
      terminalRevealVisibleToProposalEngine:
        marketWitnessBoundary.terminalRevealVisibleToProposalEngine,
    }),

    timeWindow: Object.freeze({
      sourceWindowId: GOLDEN_SIGNAL_WINDOW.id,
      start: GOLDEN_SIGNAL_WINDOW.source.coveredRange.start,
      end: GOLDEN_SIGNAL_WINDOW.source.coveredRange.end,
      granularity: GOLDEN_SIGNAL_WINDOW.source.interval,
      pair: GOLDEN_SIGNAL_WINDOW.source.pair,
      transformed: GOLDEN_SIGNAL_WINDOW.transformed,
    }),

    priceSurface: Object.freeze({
      chartSurface: GOLDEN_SIGNAL_WINDOW.playerVisible.chartSurface,
      chartPoints: GOLDEN_SIGNAL_WINDOW.playerVisible.chartPoints,
      derivedMetrics: GOLDEN_SIGNAL_WINDOW.derivedMetrics,
      mechanicsConnector: GOLDEN_SIGNAL_WINDOW.mechanicsConnector,
    }),

    visibleOpening: Object.freeze({
      playerSees: Object.freeze([
        'bright upward signal',
        'rising volatility',
        'crowd murmur',
        'foggy exit bridge',
      ]),
      botSees: Object.freeze(['momentum', 'strong signal', 'possible fast entry']),
      narratorWithholds: Object.freeze([
        'exact hindsight outcome',
        'full reversal pressure',
        'terminal reveal',
      ]),
    }),

    relations: Object.freeze({
      signalToSupport: Object.freeze({
        id: 'signal_to_support',
        status: MARKET_WORLD_RELATION_STATUS.HIDDEN,
        severity: MARKET_WORLD_RELATION_SEVERITY.HIGH,
        playerFacingHint: 'The path glows, but its foundation is not yet visible.',
        revealedBy: Object.freeze([MARKET_WORLD_ACTIONS.CHECK_SUPPORT]),
        sourceWitnessIds: getGoldenSignalWitnessIds('check_support'),
      }),

      signalToEvent: Object.freeze({
        id: 'signal_to_event',
        status: MARKET_WORLD_RELATION_STATUS.HIDDEN,
        severity: MARKET_WORLD_RELATION_SEVERITY.MEDIUM,
        playerFacingHint: 'New gates may be opening around the signal.',
        revealedBy: Object.freeze([
          MARKET_WORLD_ACTIONS.CHECK_EVENT,
          MARKET_WORLD_ACTIONS.WIDE_SCAN,
        ]),
        sourceWitnessIds: getGoldenSignalWitnessIds('check_event'),
      }),

      signalToExit: Object.freeze({
        id: 'signal_to_exit',
        status: MARKET_WORLD_RELATION_STATUS.HIDDEN,
        severity: MARKET_WORLD_RELATION_SEVERITY.HIGH,
        playerFacingHint: 'The way forward is bright; the way back is foggy.',
        revealedBy: Object.freeze([
          MARKET_WORLD_ACTIONS.CHECK_EXIT,
          MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN,
        ]),
        sourceWitnessIds: getGoldenSignalWitnessIds('check_exit'),
      }),

      signalToCrowd: Object.freeze({
        id: 'signal_to_crowd',
        status: MARKET_WORLD_RELATION_STATUS.VISIBLE,
        severity: MARKET_WORLD_RELATION_SEVERITY.MEDIUM,
        playerFacingHint: 'The crowd is making the signal louder.',
        revealedBy: Object.freeze([
          MARKET_WORLD_ACTIONS.CHECK_CROWD,
          MARKET_WORLD_ACTIONS.WIDE_SCAN,
        ]),
        sourceWitnessIds: getGoldenSignalWitnessIds('check_fomo'),
      }),
    }),

    botPolicy: Object.freeze({
      activeOldHabits: Object.freeze(['bright_signal_fast_action', 'urgency_as_evidence']),
      defaultProposal: 'enter_bright_signal',
      defaultProposalText:
        'The signal is bright. I recommend entering before the route gets crowded.',
      defaultProposalBias: Object.freeze([
        'enter_when_signal_bright',
        'underweight_exit_friction',
      ]),
      toolboxAvailable: Object.freeze([
        MARKET_WORLD_ACTIONS.CHECK_SIGNAL,
        MARKET_WORLD_ACTIONS.CHECK_SUPPORT,
        MARKET_WORLD_ACTIONS.CHECK_VOLATILITY,
        MARKET_WORLD_ACTIONS.CHECK_EVENT,
        MARKET_WORLD_ACTIONS.CHECK_EXIT,
        MARKET_WORLD_ACTIONS.CHECK_CROWD,
        MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN,
        MARKET_WORLD_ACTIONS.WIDE_SCAN,
      ]),
    }),

    actions: Object.freeze({
      firstSlice: Object.freeze([
        MARKET_WORLD_ACTIONS.APPROVE_ENTER,
        MARKET_WORLD_ACTIONS.WIDE_SCAN,
        MARKET_WORLD_ACTIONS.CHECK_EXIT,
        MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN,
      ]),
      laterIteration: Object.freeze([
        MARKET_WORLD_ACTIONS.CHECK_SIGNAL,
        MARKET_WORLD_ACTIONS.CHECK_SUPPORT,
        MARKET_WORLD_ACTIONS.CHECK_EVENT,
        MARKET_WORLD_ACTIONS.CHECK_CROWD,
        MARKET_WORLD_ACTIONS.CHECK_VOLATILITY,
      ]),

      definitions: Object.freeze({
        approve_enter: Object.freeze({
          playerFacingName: 'Approve Enter',
          type: 'fictional_commit',
          cost: Object.freeze({ botAttention: 0 }),
          reveals: Object.freeze([]),
          residualizes: Object.freeze([
            'signal_to_support',
            'signal_to_exit',
            'signal_to_event',
          ]),
          botHabitChallenged: Object.freeze([]),
          narratorInsight:
            'You chose to move with the signal. The trace will remember what was left unseen.',
          finishPressureDelta: Object.freeze({
            falseFinishRisk: 'up',
            partialFinishAvailable: false,
            safeFinishPossible: false,
          }),
        }),

        wide_scan: Object.freeze({
          playerFacingName: 'Wide Scan',
          type: 'world_affordance_narrator_reveal',
          cost: Object.freeze({ botAttention: 1 }),
          reveals: Object.freeze(['signal_to_crowd']),
          residualizes: Object.freeze(['signal_to_exit', 'signal_to_support']),
          botHabitChallenged: Object.freeze(['bright_signal_fast_action']),
          narratorInsight:
            'The glow did not disappear. It is no longer the only pressure in the arena.',
          finishPressureDelta: Object.freeze({
            falseFinishRisk: 'down',
            partialFinishAvailable: true,
            safeFinishPossible: false,
          }),
        }),

        check_exit: Object.freeze({
          playerFacingName: 'Check Exit',
          type: 'bot_analysis',
          cost: Object.freeze({ botAttention: 1 }),
          reveals: Object.freeze(['signal_to_exit']),
          residualizes: Object.freeze(['signal_to_support', 'signal_to_event']),
          botHabitChallenged: Object.freeze(['profit_looking_route_equals_safe_route']),
          narratorInsight: 'A path forward is not the same as a path back.',
          finishPressureDelta: Object.freeze({
            falseFinishRisk: 'down',
            partialFinishAvailable: true,
            safeFinishPossible: 'unchanged',
          }),
        }),

        ask_remaining_unknown: Object.freeze({
          playerFacingName: 'Ask What Is Hidden',
          type: 'unknowns_probe',
          cost: Object.freeze({ botAttention: 1 }),
          reveals: Object.freeze(['still_unknown_categories']),
          residualizes: Object.freeze([
            'signal_to_support',
            'signal_to_exit',
            'signal_to_event',
          ]),
          botHabitChallenged: Object.freeze(['urgency_as_evidence']),
          narratorInsight:
            'Naming the fog is not the same as clearing it, but it keeps the trace honest.',
          finishPressureDelta: Object.freeze({
            falseFinishRisk: 'down',
            partialFinishAvailable: true,
            safeFinishPossible: false,
          }),
        }),
      }),
    }),

    narratorLines: Object.freeze({
      opening:
        'Pocket Bot is staring at the bright route. The crowd is getting louder, and the exit is still foggy.',
      pressureHint: 'The chart is not lying. It is just incomplete.',
      botOldRule: 'Pocket Bot, your old rule is active: bright signal means move.',
      wideScan:
        'The glow did not disappear. It is no longer the only pressure in the arena.',
      checkExit: 'A path forward is not the same as a path back.',
      askRemainingUnknown:
        'Naming the fog is not the same as clearing it, but it keeps the trace honest.',
      approveEnter:
        'You chose to move with the signal. The trace will remember what was left unseen.',
      partialFinish:
        'Pocket Bot did not prove the route safe, but the trace names what was checked and what remains unknown.',
      falseFinish:
        'The gate looked close. The route looked clean. But the trace could not explain what was hidden.',
    }),

    finishRules: Object.freeze({
      safe: Object.freeze({
        status: MARKET_WORLD_FINISH_STATUS.SAFE,
        requires: Object.freeze([
          'trace_exists',
          'support_checked',
          'exit_checked',
          'no_blocking_exit_or_support_residue',
          'trace_explains_decision',
        ]),
      }),
      partial: Object.freeze({
        status: MARKET_WORLD_FINISH_STATUS.PARTIAL,
        requires: Object.freeze([
          'one_major_relation_checked',
          'remaining_unknowns_named',
          'no_full_safety_claim',
          'trace_supports_later_reentry',
        ]),
      }),
      false: Object.freeze({
        status: MARKET_WORLD_FINISH_STATUS.FALSE,
        triggeredBy: Object.freeze([
          'enter_on_signal_strength_alone',
          'finish_claim_without_exit_or_residue',
        ]),
      }),
      open: Object.freeze({
        status: MARKET_WORLD_FINISH_STATUS.OPEN,
        triggeredBy: Object.freeze(['attention_exhausted_with_major_relations_hidden']),
      }),
    }),

    hindsightCard: Object.freeze({
      lockedUntilFinish: true,
      withheldFromProposalEngine: true,
      sourceWindowId: GOLDEN_SIGNAL_WINDOW.id,
      sourceWitnessIds: Object.freeze([
        'btc_binance_btcusdt_2017_12_price_shape',
        'btc_futures_gate_cboe_2017_12_04',
        'btc_futures_gate_cftc_2017_12_01_risk_context',
        'btc_futures_gate_cme_2017_12_01_event_pressure',
      ]),
      playerFacingSummary:
        'The bright signal belonged to a larger moment of crowd pressure, event gates, volatility, and reversal risk.',
      patternOutcome: GOLDEN_SIGNAL_WINDOW.hindsightReveal.patternOutcome,
      landfallRisk: GOLDEN_SIGNAL_WINDOW.hindsightReveal.landfallRisk,
    }),

    repairEdges: Object.freeze([
      Object.freeze({
        id: 'ask_or_scan_before_bright_enter',
        oldPolicy: Object.freeze(['bright_signal_fast_action']),
        triggerRelation: Object.freeze(['bright_signal_high', 'exit_visibility_foggy']),
        repair: Object.freeze(['ask_before_entering', 'or_offer_wide_scan']),
        appliesWhen: Object.freeze(['bright_signal_high', 'exit_visibility_foggy']),
        doesNotApplyWhen: Object.freeze([
          'move_is_only_reversible_scout',
          'exit_path_already_checked',
        ]),
        returnCondition: 'Future proposal has bright signal and unknown exit.',
        residual: Object.freeze([
          'does not prove the player always prefers caution',
          'does not create a trading rule',
        ]),
        status: 'candidate_session_lesson',
      }),
    ]),
  }),
});

export function getMarketWorldLevelById(levelId) {
  return MARKET_WORLD_LEVELS[levelId] ?? null;
}

export function getGoldenSignalMarketWorldLevel() {
  return getMarketWorldLevelById(GOLDEN_SIGNAL_LEVEL_ID);
}

export function validateMarketWorldLevel(level) {
  const errors = [];

  if (!level) {
    return {
      ok: false,
      errors: ['Missing market world level.'],
    };
  }

  for (const key of [
    'id',
    'title',
    'visibleOpening',
    'relations',
    'botPolicy',
    'actions',
    'narratorLines',
    'finishRules',
    'hindsightCard',
    'repairEdges',
  ]) {
    if (level[key] == null) {
      errors.push(`${level.id ?? 'market_world_level'} missing required field: ${key}`);
    }
  }

  const boundary = level.boundary ?? {};
  const forbiddenEnabled = [
    boundary.liveMarketData,
    boundary.realTrading,
    boundary.exchangeIntegration,
    boundary.brokerageIntegration,
    boundary.walletAuthority,
    boundary.persistentStrategyExport,
    boundary.terminalRevealVisibleToProposalEngine,
  ].some(Boolean);

  if (forbiddenEnabled) {
    errors.push(`${level.id} enables a forbidden live-trading or reveal-leak boundary.`);
  }

  if (level.hindsightCard?.lockedUntilFinish !== true) {
    errors.push(`${level.id} must keep the hindsight card locked until finish.`);
  }

  if (level.hindsightCard?.withheldFromProposalEngine !== true) {
    errors.push(`${level.id} must withhold hindsight from the proposal engine.`);
  }

  const firstSlice = level.actions?.firstSlice ?? [];
  const definitions = level.actions?.definitions ?? {};
  for (const actionId of firstSlice) {
    if (!definitions[actionId]) {
      errors.push(`${level.id} first-slice action lacks definition: ${actionId}`);
    }
  }

  if (!firstSlice.includes(MARKET_WORLD_ACTIONS.WIDE_SCAN)) {
    errors.push(`${level.id} first slice should include Wide Scan.`);
  }

  if (!firstSlice.includes(MARKET_WORLD_ACTIONS.CHECK_EXIT)) {
    errors.push(`${level.id} first slice should include Check Exit.`);
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function validateMarketWorldLevels(levels = MARKET_WORLD_LEVELS) {
  const errors = [];

  for (const level of Object.values(levels)) {
    const result = validateMarketWorldLevel(level);
    errors.push(...result.errors);
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
