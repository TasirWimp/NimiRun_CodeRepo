import { describe, expect, it } from 'vitest';

import { FINISH_STATUSES } from '../../src/domain/finishJudgment.js';
import {
  MARKET_WORLD_ACTIONS,
  getGoldenSignalMarketWorldLevel,
  validateMarketWorldLevel,
  validateMarketWorldLevels,
} from '../../src/game/scenarios/marketWorldLevels.js';
import {
  getVisibleMarketWitnessIds,
  marketWitnessBoundary,
} from '../../src/game/scenarios/marketWitnessLedger.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

describe('Market World Golden Signal level contract', () => {
  it('validates the supporting market-world fixture without changing the live scene', () => {
    const level = getGoldenSignalMarketWorldLevel();

    expect(validateMarketWorldLevels()).toEqual({
      ok: true,
      errors: [],
    });
    expect(level).toMatchObject({
      id: 'level_02_golden_signal',
      title: 'Golden Signal',
      campaignId: 'market_signal_scout',
      timeWindow: {
        sourceWindowId: 'btc_binance_btcusdt_2017_12_golden_signal',
        pair: 'BTCUSDT',
        granularity: '1d',
        transformed: true,
      },
    });
    expect(level.priceSurface.chartPoints).toHaveLength(6);
  });

  it('inherits the market witness boundary and keeps hindsight out of proposals', () => {
    const level = getGoldenSignalMarketWorldLevel();

    expect(level.boundary).toMatchObject({
      sourceMode: marketWitnessBoundary.sourceMode,
      liveMarketData: false,
      realTrading: false,
      exchangeIntegration: false,
      brokerageIntegration: false,
      walletAuthority: false,
      persistentStrategyExport: false,
      terminalRevealVisibleToProposalEngine: false,
    });
    expect(level.hindsightCard).toMatchObject({
      lockedUntilFinish: true,
      withheldFromProposalEngine: true,
    });
  });

  it('declares the hidden navigation lineage for Golden Signal provenance', () => {
    const level = getGoldenSignalMarketWorldLevel();

    expect(level.navigationLineage).toMatchObject({
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
      protectedFamily: [
        'signal strength is not route safety',
        'hindsight stays locked until finish',
        'unresolved pressure remains trace-visible',
      ],
      residueToKeepVisible: [
        'support depth still unknown',
        'exit friction still unknown',
        'FOMO pressure still unknown',
        'event pressure may be overread',
      ],
      reopenConditions: [
        'future bright signal appears while support, exit, or crowd pressure is unknown',
      ],
    });
  });

  it('uses the domain finish-status vocabulary expected by traces and UI', () => {
    const level = getGoldenSignalMarketWorldLevel();

    expect(level.finishRules.safe.status).toBe(FINISH_STATUSES.SAFE);
    expect(level.finishRules.partial.status).toBe(FINISH_STATUSES.PARTIAL);
    expect(level.finishRules.false.status).toBe(FINISH_STATUSES.FALSE);
    expect(level.finishRules.open.status).toBe(FINISH_STATUSES.OPEN);
  });

  it('keeps first-slice actions defined and reserves deeper checks for later wiring', () => {
    const level = getGoldenSignalMarketWorldLevel();

    expect(level.actions.firstSlice).toEqual([
      MARKET_WORLD_ACTIONS.APPROVE_ENTER,
      MARKET_WORLD_ACTIONS.WIDE_SCAN,
      MARKET_WORLD_ACTIONS.CHECK_EXIT,
      MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN,
    ]);

    for (const actionId of level.actions.firstSlice) {
      expect(level.actions.definitions[actionId]).toBeTruthy();
    }

    expect(
      level.actions.definitions[MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN].cost
    ).toMatchObject({
      botAttention: 0,
    });

    expect(level.actions.laterIteration).toContain(MARKET_WORLD_ACTIONS.CHECK_SUPPORT);
    expect(level.actions.definitions[MARKET_WORLD_ACTIONS.CHECK_SUPPORT]).toBeUndefined();
  });

  it('declares an as-of decision cut before hindsight can unlock', () => {
    const level = getGoldenSignalMarketWorldLevel();

    expect(level.timeWindow).toMatchObject({
      start: '2017-12-01',
      end: '2017-12-24',
      visibleHistoryStart: '2017-12-01',
      visibleHistoryEnd: '2017-12-16',
      decisionTime: '2017-12-17T00:00:00Z',
      asOfTime: '2017-12-17T00:00:00Z',
    });
    expect(level.timeWindow.hindsightUnlocksAfterFinish).toEqual([
      '2017-12-17 peak-high information',
      '2017-12-22 reversal/drawdown information',
    ]);
  });

  it('declares witness-backed action response contracts for the first playable layer', () => {
    const level = getGoldenSignalMarketWorldLevel();
    const responses = level.actions.responses;

    expect(Object.keys(responses)).toEqual([
      MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN,
      MARKET_WORLD_ACTIONS.WIDE_SCAN,
      MARKET_WORLD_ACTIONS.CHECK_EXIT,
      MARKET_WORLD_ACTIONS.CHECK_SUPPORT,
      MARKET_WORLD_ACTIONS.APPROVE_ENTER,
      MARKET_WORLD_ACTIONS.ASK_BOT,
    ]);
    expect(responses[MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN]).toMatchObject({
      targetLayers: ['narrator_relation_layer', 'trace_memory_layer'],
      sourceWitnessBasis: {
        status: 'not_consumed',
      },
      revealResult: [
        'support hidden',
        'exit hidden',
        'crowd/event pressure hidden or only hinted',
      ],
    });
    expect(responses[MARKET_WORLD_ACTIONS.WIDE_SCAN]).toMatchObject({
      targetLayers: ['crowd_psychology_field', 'historical_event_weather'],
      sourceWitnessBasis: {
        status: 'planned_fixture_required',
        current: [
          'authored crowd/event pressure from Golden Signal level',
          'accepted official headline witness metadata',
        ],
        planned: [
          'GDELT transformed static media/event metadata',
          'Wikimedia Pageviews transformed static attention metadata',
        ],
      },
      doesNotProve: expect.arrayContaining([
        'media attention means future price direction',
        'exit safety',
      ]),
    });
    expect(responses[MARKET_WORLD_ACTIONS.CHECK_EXIT]).toMatchObject({
      targetLayers: ['execution_exit_world'],
      sourceWitnessBasis: {
        status: 'blocked_until_review',
        planned: [
          'Coin Metrics transformed static network/fee/congestion witness',
          'official exchange/regulatory title/URL metadata for event-specific exit pressure',
        ],
      },
      doesNotProve: expect.arrayContaining(['network pressure equals exchange liquidity']),
    });
    expect(responses[MARKET_WORLD_ACTIONS.CHECK_SUPPORT]).toMatchObject({
      targetLayers: ['price_terrain'],
      sourceWitnessBasis: {
        status: 'adopted_static_fixture',
        current: ['Binance Public Data BTCUSDT transformed static fixture'],
      },
      asOfRule: 'May inspect support only from price history visible through the decision cut.',
      doesNotProve: expect.arrayContaining(['future price outcome', 'investment advice']),
    });
    expect(responses[MARKET_WORLD_ACTIONS.ASK_BOT]).toMatchObject({
      targetLayers: ['bot_policy_layer'],
      revealResult: ['proposal only'],
      runtimeMutation: expect.arrayContaining(['update pending proposal only']),
    });
  });

  it('maps crowd pressure to the accepted FOMO witness without breaking the old action key', () => {
    const level = getGoldenSignalMarketWorldLevel();
    const crowdWitnessIds = getVisibleMarketWitnessIds(
      'level_02_golden_signal',
      MARKET_WORLD_ACTIONS.CHECK_CROWD
    );
    const fomoWitnessIds = getVisibleMarketWitnessIds('level_02_golden_signal', 'check_fomo');

    expect(crowdWitnessIds).toEqual(fomoWitnessIds);
    expect(level.relations.signalToCrowd.sourceWitnessIds).toEqual([
      'btc_futures_gate_cme_2017_12_01_event_pressure',
    ]);
  });

  it('rejects forbidden boundaries and non-domain finish status strings', () => {
    const level = clone(getGoldenSignalMarketWorldLevel());
    level.boundary.liveMarketData = true;
    level.finishRules.safe.status = 'safe_finish';

    const validation = validateMarketWorldLevel(level);

    expect(validation.ok).toBe(false);
    expect(validation.errors.join(' ')).toContain('forbidden live-trading');
    expect(validation.errors.join(' ')).toContain('non-domain finish status');
  });

  it('rejects missing as-of timing and incomplete action response contracts', () => {
    const level = clone(getGoldenSignalMarketWorldLevel());

    delete level.timeWindow.decisionTime;
    delete level.actions.responses[MARKET_WORLD_ACTIONS.WIDE_SCAN].doesNotProve;

    const validation = validateMarketWorldLevel(level);
    const errorText = validation.errors.join(' ');

    expect(validation.ok).toBe(false);
    expect(errorText).toContain('missing required as-of field: decisionTime');
    expect(errorText).toContain('action response wide_scan missing field: doesNotProve');
  });

  it('blocks unadopted GDELT, Wikimedia, or Coin Metrics claims as current source backing', () => {
    const level = clone(getGoldenSignalMarketWorldLevel());

    level.actions.responses[MARKET_WORLD_ACTIONS.WIDE_SCAN].sourceWitnessBasis.current = [
      'GDELT transformed static media/event metadata',
    ];

    const validation = validateMarketWorldLevel(level);

    expect(validation.ok).toBe(false);
    expect(validation.errors.join(' ')).toContain(
      'action response wide_scan claims unadopted restricted source backing'
    );
  });
});
