import { describe, expect, it } from 'vitest';

import {
  createWitnessHudSummary,
  createWitnessPanelContent,
  selectFeaturedWitness,
} from '../../src/ui/witnessPanel.js';

describe('witness panel formatting', () => {
  it('prefers historic event headlines over chart-shape witnesses for player display', () => {
    const witnessIds = [
      'btc_binance_btcusdt_2017_12_price_shape',
      'btc_futures_gate_cboe_2017_12_04',
    ];
    const witness = selectFeaturedWitness(witnessIds);
    const panel = createWitnessPanelContent(witnessIds);

    expect(witness.id).toBe('btc_futures_gate_cboe_2017_12_04');
    expect(panel).toMatchObject({
      title: 'Historic Witness',
      lines: [
        'Title: Cboe Plans December 10 Launch of Bitcoin Futures Trading',
        'Game: Futures Gate makes the signal brighter, but the route may be crowded.',
        'Source: Cboe Global Markets',
        'Not: trading advice',
      ],
    });
  });

  it('creates a compact HUD summary without exposing trading instructions', () => {
    const summary = createWitnessHudSummary(['btc_futures_gate_cboe_2017_12_04']);

    expect(summary).toContain('Historic witness: Cboe Plans December 10 Launch');
    expect(summary).not.toMatch(/buy|sell|trade now/i);
  });

  it('can render the Wide Scan crowd-pressure witness', () => {
    const panel = createWitnessPanelContent([
      'btc_futures_gate_cme_2017_12_01_event_pressure',
    ]);

    expect(panel).toMatchObject({
      title: 'Historic Witness',
      lines: expect.arrayContaining([
        'Title: CME Group Self-Certifies Bitcoin Futures to Launch Dec. 18',
        'Not: trading advice',
      ]),
    });
  });

  it('returns null when there is no known witness', () => {
    expect(selectFeaturedWitness(['missing'])).toBeNull();
    expect(createWitnessPanelContent(['missing'])).toBeNull();
    expect(createWitnessHudSummary(['missing'])).toBeNull();
  });
});
