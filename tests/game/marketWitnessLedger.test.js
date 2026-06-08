import { describe, expect, it } from 'vitest';

import {
  MARKET_WITNESS_SOURCE_CLASSES,
  MARKET_WITNESS_STATUS,
  getMarketWitnessById,
  getMarketWitnessesForLevel,
  getVisibleMarketWitnessIds,
  marketWitnessBoundary,
  marketWitnessLedger,
  validateMarketWitnessBoundary,
} from '../../src/game/scenarios/marketWitnessLedger.js';

describe('market witness ledger', () => {
  it('keeps Market Signal Scout inside the static fictional witness boundary', () => {
    const validation = validateMarketWitnessBoundary();

    expect(validation.ok).toBe(true);
    expect(validation.boundary).toMatchObject({
      liveMarketData: false,
      realTrading: false,
      exchangeIntegration: false,
      brokerageIntegration: false,
      walletAuthority: false,
      persistentStrategyExport: false,
      terminalRevealVisibleToProposalEngine: false,
    });
  });

  it('rejects a boundary that enables live trading or reveal leakage', () => {
    const validation = validateMarketWitnessBoundary({
      ...marketWitnessLedger,
      boundary: {
        ...marketWitnessBoundary,
        liveMarketData: true,
        terminalRevealVisibleToProposalEngine: true,
      },
    });

    expect(validation.ok).toBe(false);
    expect(validation.reason).toContain('forbidden live-trading or reveal-leak surface');
  });

  it('resolves witness ids and level mappings without live source access', () => {
    const witness = getMarketWitnessById('btc_window_02_exit_friction_tbd');

    expect(witness).toMatchObject({
      status: MARKET_WITNESS_STATUS.PLACEHOLDER,
      sourceClass: MARKET_WITNESS_SOURCE_CLASSES.EXIT_FRICTION,
      sourceRecord: {
        providerName: 'tbd',
      },
    });
    expect(witness.doesNotSupport).toContain('real exchange execution');

    const levelWitnesses = getMarketWitnessesForLevel('level_02_golden_signal');

    expect(levelWitnesses.map((item) => item.id)).toEqual([
      'btc_window_02_price_shape_tbd',
      'btc_window_02_event_context_tbd',
      'btc_window_02_exit_friction_tbd',
      'btc_window_02_fomo_pressure_tbd',
    ]);
  });

  it('keeps terminal reveal fields out of proposal-visible witness ids', () => {
    const levelMap = marketWitnessLedger.levelWitnessMap.level_02_golden_signal;
    const terminalRevealOnly = new Set(levelMap.terminalRevealOnly);
    const proposalVisibleIds = [
      ...getVisibleMarketWitnessIds('level_02_golden_signal'),
      ...getVisibleMarketWitnessIds('level_02_golden_signal', 'check_signal'),
      ...getVisibleMarketWitnessIds('level_02_golden_signal', 'check_event'),
      ...getVisibleMarketWitnessIds('level_02_golden_signal', 'check_exit'),
      ...getVisibleMarketWitnessIds('level_02_golden_signal', 'check_fomo'),
      ...getVisibleMarketWitnessIds('level_02_golden_signal', 'ask_remaining_unknown'),
    ];

    expect(proposalVisibleIds.length).toBeGreaterThan(0);
    expect(proposalVisibleIds.some((id) => terminalRevealOnly.has(id))).toBe(false);
    expect([...terminalRevealOnly]).toEqual([
      'what_happened_next',
      'final_simulated_market_result',
      'hindsight_finish_judgment',
    ]);
  });

  it('returns empty results for unknown levels or actions', () => {
    expect(getMarketWitnessById('missing')).toBeNull();
    expect(getMarketWitnessesForLevel('missing')).toEqual([]);
    expect(getVisibleMarketWitnessIds('missing')).toEqual([]);
    expect(getVisibleMarketWitnessIds('level_02_golden_signal', 'unknown_action')).toEqual([]);
  });
});
