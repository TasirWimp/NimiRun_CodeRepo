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
});
