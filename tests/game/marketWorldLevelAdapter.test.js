import { describe, expect, it } from 'vitest';

import { MOVE_TYPES } from '../../src/domain/resourceRules.js';
import { getNodeById } from '../../src/game/resourceMapScenario.js';
import {
  createGoldenSignalMarketWorldRuntimeSeed,
  createMarketWorldRuntimeSeed,
} from '../../src/game/scenarios/marketWorldLevelAdapter.js';
import {
  MARKET_WORLD_ACTIONS,
  getGoldenSignalMarketWorldLevel,
} from '../../src/game/scenarios/marketWorldLevels.js';
import { createMarketSignalScoutScenario } from '../../src/game/scenarios/marketSignalScoutScenario.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

describe('Market World level adapter', () => {
  it('adapts the Golden Signal level into runtime seed state', () => {
    const seed = createGoldenSignalMarketWorldRuntimeSeed();

    expect(seed).toMatchObject({
      sourceLevelId: 'level_02_golden_signal',
      campaignId: 'market_signal_scout',
      title: 'Golden Signal',
      timeWindow: {
        sourceWindowId: 'btc_binance_btcusdt_2017_12_golden_signal',
        pair: 'BTCUSDT',
        granularity: '1d',
        transformed: true,
        visibleHistoryEnd: '2017-12-16',
        decisionTime: '2017-12-17T00:00:00Z',
        asOfTime: '2017-12-17T00:00:00Z',
      },
      boundary: {
        liveMarketData: false,
        realTrading: false,
        walletAuthority: false,
        persistentStrategyExport: false,
      },
      hindsightCard: {
        lockedUntilFinish: true,
        withheldFromProposalEngine: true,
        playerFacingSummary:
          'The bright signal belonged to a larger moment of crowd pressure, event gates, volatility, and reversal risk.',
      },
      hindsightLocked: true,
      hindsightWithheldFromProposalEngine: true,
    });
    expect(seed.relationStates.signal_to_support).toMatchObject({
      id: 'signal_to_support',
      status: 'hidden',
      severity: 'high',
      stillUnknown: 'support depth still unknown',
    });
    expect(seed.relationStates.signal_to_crowd).toMatchObject({
      id: 'signal_to_crowd',
      status: 'visible',
      stillUnknown: 'FOMO pressure still unknown',
      sourceWitnessIds: ['btc_futures_gate_cme_2017_12_01_event_pressure'],
    });
    expect(seed.proposalPreview).toMatchObject({
      id: 'proposal-act-bright-signal',
      targetNodeId: 'bright-signal',
      cost: {
        moveType: MOVE_TYPES.ACT,
        botAttention: 2,
        userGuidance: 1,
      },
      leavesUnknown: [
        'support depth still unknown',
        'exit friction still unknown',
        'FOMO pressure still unknown',
      ],
    });
    expect(seed.actionResponses[MARKET_WORLD_ACTIONS.CHECK_SUPPORT]).toMatchObject({
      targetLayers: ['price_terrain'],
      sourceWitnessBasis: {
        status: 'adopted_static_fixture',
        current: ['Binance Public Data BTCUSDT transformed static fixture'],
      },
      asOfRule: 'May inspect support only from price history visible through the decision cut.',
    });
  });

  it('creates the first runtime arena spine without spending resources directly', () => {
    const seed = createGoldenSignalMarketWorldRuntimeSeed();
    const actions = seed.arenaSpine.actions;

    expect(seed.arenaSpine.firstSlice).toEqual([
      MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN,
      MARKET_WORLD_ACTIONS.WIDE_SCAN,
      MARKET_WORLD_ACTIONS.CHECK_EXIT,
      MARKET_WORLD_ACTIONS.CHECK_SUPPORT,
      MARKET_WORLD_ACTIONS.APPROVE_ENTER,
    ]);
    expect(actions[MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN]).toMatchObject({
      label: 'Ask Hidden',
      behavior: 'show_unknowns',
      resourcePolicy: 'no_spend_until_approve',
      reveals: [
        'support depth still unknown',
        'exit friction still unknown',
        'FOMO pressure still unknown',
      ],
      sourceReveals: ['still_unknown_categories'],
    });
    expect(actions[MARKET_WORLD_ACTIONS.WIDE_SCAN]).toMatchObject({
      label: 'Wide Scan',
      behavior: 'prepare_move',
      moveType: MOVE_TYPES.INSPECT,
      targetNodeId: 'fomo-pressure',
      sourceReveals: ['signal_to_crowd'],
      residualizes: ['signal_to_exit', 'signal_to_support'],
      resourcePolicy: 'no_spend_until_approve',
    });
    expect(actions[MARKET_WORLD_ACTIONS.CHECK_SUPPORT]).toMatchObject({
      label: 'Support Check',
      behavior: 'prepare_move',
      moveType: MOVE_TYPES.INSPECT,
      targetNodeId: 'support-check',
      sourceReveals: ['signal_to_support'],
      residualizes: ['signal_to_exit', 'signal_to_crowd'],
      resourcePolicy: 'no_spend_until_approve',
    });
    expect(actions[MARKET_WORLD_ACTIONS.APPROVE_ENTER]).toMatchObject({
      label: 'Approve Enter',
      behavior: 'prepare_move',
      moveType: MOVE_TYPES.ACT,
      targetNodeId: 'bright-signal',
      sourceReveals: [],
      residualizes: ['signal_to_support', 'signal_to_exit', 'signal_to_event'],
      resourcePolicy: 'no_spend_until_approve',
    });
  });

  it('keeps hindsight and terminal reveal out of proposal context', () => {
    const seed = createGoldenSignalMarketWorldRuntimeSeed();
    const contextText = JSON.stringify(seed.proposalContext);

    expect(seed.proposalContext).toMatchObject({
      levelId: 'level_02_golden_signal',
      liveMarketData: false,
      realTrading: false,
      walletAuthority: false,
      timeBoundary: {
        visibleHistoryStart: '2017-12-01',
        visibleHistoryEnd: '2017-12-16',
        decisionTime: '2017-12-17T00:00:00Z',
        asOfTime: '2017-12-17T00:00:00Z',
      },
      hindsightWithheldFromProposalEngine: true,
    });
    expect(contextText).not.toContain('hindsightCard');
    expect(contextText).not.toContain('patternOutcome');
    expect(contextText).not.toContain('landfallRisk');
    expect(contextText).not.toContain('2017-12-22');
    expect(contextText).not.toContain('terminal reveal');
    expect(contextText).not.toContain('navigationLineage');
    expect(contextText).not.toContain('sourcePressurePacketId');
    expect(seed.hindsightCard.patternOutcome).toBeTruthy();
  });

  it('carries internal navigation lineage into the runtime seed only', () => {
    const seed = createGoldenSignalMarketWorldRuntimeSeed();

    expect(seed.navigationLineage).toMatchObject({
      sourcePressurePacketId: 'v0_golden_signal_december_2017_pressure',
      sourceBasis: {
        marketWindowIds: ['btc_binance_btcusdt_2017_12_golden_signal'],
        witnessIds: [
          'btc_futures_gate_cboe_2017_12_04',
          'btc_futures_gate_cme_2017_12_01_event_pressure',
          'btc_futures_gate_cftc_2017_12_01_risk_context',
        ],
      },
      v1RelationEdgeIds: [
        'signal_to_support',
        'signal_to_exit',
        'signal_to_crowd',
        'signal_to_event',
      ],
      v2BundleId: 'golden_signal_false_finish_pressure_bundle',
      v3VoyageId: 'golden_signal_first_slice_voyage',
    });
    expect(seed.proposalContext.navigationLineage).toBeUndefined();
  });

  it('is the active adapter source for the current Golden Signal scenario', () => {
    const scenario = createMarketSignalScoutScenario();
    const seed = createGoldenSignalMarketWorldRuntimeSeed();
    const legalMoveTypes = new Set(Object.values(MOVE_TYPES));

    expect(scenario.marketWorldRuntime.sourceLevelId).toBe(seed.sourceLevelId);
    expect(scenario.marketWorldRuntime.proposalContext).toEqual(seed.proposalContext);
    expect(scenario.proposalPreview).toEqual(seed.proposalPreview);
    expect(scenario.arenaSpine).toEqual(seed.arenaSpine);

    for (const actionId of scenario.arenaSpine.firstSlice) {
      const action = scenario.arenaSpine.actions[actionId];

      expect(action.label).not.toMatch(/CRPM|relational|source-ocean/i);

      if (action.behavior !== 'prepare_move') {
        continue;
      }

      const node = getNodeById(scenario, action.targetNodeId);

      expect(node).toBeTruthy();
      expect(legalMoveTypes.has(action.moveType)).toBe(true);
      expect(node.possibleMoves[action.moveType]).toBeTruthy();
    }
  });

  it('rejects invalid market-world levels before adaptation', () => {
    const level = clone(getGoldenSignalMarketWorldLevel());

    level.boundary.realTrading = true;

    expect(() => createMarketWorldRuntimeSeed(level)).toThrow(/invalid market world level/i);
  });
});
