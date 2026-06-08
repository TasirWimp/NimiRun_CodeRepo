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
  validateMarketWitnessEvidence,
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

  it('resolves accepted witness ids and level mappings without live source access', () => {
    const witness = getMarketWitnessById('btc_futures_gate_cftc_2017_12_01_risk_context');

    expect(witness).toMatchObject({
      status: MARKET_WITNESS_STATUS.ACCEPTED,
      sourceClass: MARKET_WITNESS_SOURCE_CLASSES.EXIT_FRICTION,
      sourceRecord: {
        providerName: 'U.S. Commodity Futures Trading Commission',
      },
    });
    expect(witness.doesNotSupport).toContain('real exchange execution');
    expect(witness.mechanicsConnector).toContain('Exit Friction');

    const levelWitnesses = getMarketWitnessesForLevel('level_02_golden_signal');

    expect(levelWitnesses.map((item) => item.id)).toEqual([
      'btc_binance_btcusdt_2017_12_price_shape',
      'btc_futures_gate_cboe_2017_12_04',
      'btc_futures_gate_cftc_2017_12_01_risk_context',
      'btc_futures_gate_cme_2017_12_01_event_pressure',
    ]);
  });

  it('keeps adopted witness evidence attribution-ready', () => {
    const validation = validateMarketWitnessEvidence();
    const priceShape = getMarketWitnessById('btc_binance_btcusdt_2017_12_price_shape');
    const event = getMarketWitnessById('btc_futures_gate_cboe_2017_12_04');

    expect(validation).toEqual({
      ok: true,
      errors: [],
    });
    expect(priceShape.sourceRecord).toMatchObject({
      providerName: 'Binance Public Data',
      licenseEvidenceUrl: 'https://github.com/binance/binance-public-data#licence',
      sourceChecksum:
        '45bf1c515b1108668b6bf10f7af323585f30cdf68e096cb71e6e3bb6aa0e9cb4',
    });
    expect(priceShape.doesNotSupport).toContain('global Bitcoin price index');
    expect(event.title).toBe('Cboe Plans December 10 Launch of Bitcoin Futures Trading');
    expect(event.mechanicsConnector).toBe(
      'Futures Gate makes the signal brighter, but the route may be crowded.'
    );
  });

  it('keeps terminal reveal fields out of proposal-visible witness ids', () => {
    const levelMap = marketWitnessLedger.levelWitnessMap.level_02_golden_signal;
    const terminalRevealOnly = new Set(levelMap.terminalRevealOnly);
    const proposalVisibleIds = [
      ...getVisibleMarketWitnessIds('level_02_golden_signal'),
      ...getVisibleMarketWitnessIds('level_02_golden_signal', 'check_signal'),
      ...getVisibleMarketWitnessIds('level_02_golden_signal', 'check_support'),
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
