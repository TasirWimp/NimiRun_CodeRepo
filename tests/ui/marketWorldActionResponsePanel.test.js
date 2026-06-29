import { describe, expect, it } from 'vitest';

import {
  approveMarketWorldAction,
  createMarketWorldRuntimeState,
  nameMarketWorldUnknowns,
  prepareMarketWorldAction,
} from '../../src/domain/marketWorldRuntime.js';
import { createGoldenSignalMarketWorldRuntimeSeed } from '../../src/game/scenarios/marketWorldLevelAdapter.js';
import { MARKET_WORLD_ACTIONS } from '../../src/game/scenarios/marketWorldLevels.js';
import { createMarketWorldActionResponsePanel } from '../../src/ui/marketWorldActionResponsePanel.js';

function createSeed() {
  return createGoldenSignalMarketWorldRuntimeSeed();
}

function createRuntime(seed = createSeed()) {
  return createMarketWorldRuntimeState(seed);
}

function getAction(seed, actionId) {
  return seed.arenaSpine.actions[actionId];
}

function createPanelLines(panel) {
  return [panel.title, ...panel.lines].join('\n');
}

describe('market world action response panel', () => {
  it('turns Ask Hidden into a no-spend response without claiming witness proof', () => {
    const seed = createSeed();
    const named = nameMarketWorldUnknowns(
      createRuntime(seed),
      getAction(seed, MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN)
    );
    const panel = createMarketWorldActionResponsePanel({
      runtimeSeed: seed,
      runtimeState: named.runtimeState,
    });
    const lines = createPanelLines(panel);

    expect(panel.title).toBe('Ask Hidden Response');
    expect(panel.phase).toBe('unknowns-named');
    expect(lines).toContain('No Bot Attention spent.');
    expect(lines).toContain('Source: authored level relation metadata.');
    expect(lines).toContain('Revealed: support hidden');
    expect(lines).toContain('Revealed: exit hidden');
    expect(lines).toContain('Revealed: crowd/event pressure hidden or only hinted');
    expect(lines).toContain('Does not prove: whether support exists');
    expect(lines).not.toMatch(/GDELT|Wikimedia|Coin Metrics|investment advice/i);
  });

  it('shows Wide Scan preparation as approve-gated and does not claim planned source fixtures', () => {
    const seed = createSeed();
    const prepared = prepareMarketWorldAction(
      createRuntime(seed),
      getAction(seed, MARKET_WORLD_ACTIONS.WIDE_SCAN)
    );
    const panel = createMarketWorldActionResponsePanel({
      runtimeSeed: seed,
      runtimeState: prepared.runtimeState,
    });
    const lines = createPanelLines(panel);

    expect(panel.title).toBe('Wide Scan Prepared');
    expect(panel.phase).toBe('prepared');
    expect(lines).toContain('Before spend: scan arc widens from signal to crowd/event surfaces');
    expect(lines).toContain('Approve controls Bot Attention spending.');
    expect(lines).toContain(
      'Source gate: planned GDELT/Wikimedia fixtures are not claimed yet.'
    );
    expect(lines).not.toContain('GDELT transformed static media/event metadata');
    expect(lines).not.toContain('Wikimedia Pageviews transformed static attention metadata');
  });

  it('shows approved Wide Scan as a crowd/event layer answer with residue', () => {
    const seed = createSeed();
    const approved = approveMarketWorldAction(
      createRuntime(seed),
      getAction(seed, MARKET_WORLD_ACTIONS.WIDE_SCAN)
    );
    const panel = createMarketWorldActionResponsePanel({
      runtimeSeed: seed,
      runtimeState: approved.runtimeState,
    });
    const lines = createPanelLines(panel);

    expect(panel.title).toBe('Wide Scan Response');
    expect(panel.targetNodeId).toBe('fomo-pressure');
    expect(lines).toContain('World layer: Crowd psychology field / Historical event weather');
    expect(lines).toContain('After spend: crowd/event weather wakes up');
    expect(lines).toContain('Revealed: attention or media pressure is amplifying the signal');
    expect(lines).toContain('Still unknown: support depth still unknown');
    expect(lines).toContain('Does not prove: crowd is correct');
  });

  it('keeps Check Exit behind its current review gate', () => {
    const seed = createSeed();
    const approved = approveMarketWorldAction(
      createRuntime(seed),
      getAction(seed, MARKET_WORLD_ACTIONS.CHECK_EXIT)
    );
    const panel = createMarketWorldActionResponsePanel({
      runtimeSeed: seed,
      runtimeState: approved.runtimeState,
    });
    const lines = createPanelLines(panel);

    expect(panel.title).toBe('Check Exit Response');
    expect(lines).toContain('World layer: Execution exit world');
    expect(lines).toContain('Source gate: Coin Metrics remains blocked until review.');
    expect(lines).toContain('Does not prove: profit can be realized');
    expect(lines).not.toContain('Coin Metrics transformed static network/fee/congestion witness');
  });

  it('names the adopted Binance fixture for Support Check without leaking hindsight', () => {
    const seed = createSeed();
    const approved = approveMarketWorldAction(
      createRuntime(seed),
      getAction(seed, MARKET_WORLD_ACTIONS.CHECK_SUPPORT)
    );
    const panel = createMarketWorldActionResponsePanel({
      runtimeSeed: seed,
      runtimeState: approved.runtimeState,
    });
    const lines = createPanelLines(panel);

    expect(panel.title).toBe('Support Check Response');
    expect(lines).toContain('World layer: Price terrain');
    expect(lines).toContain('Source: Binance Public Data BTCUSDT transformed static fixture.');
    expect(lines).toContain('As-of: 2017-12-17');
    expect(lines).toContain('future price outcome');
    expect(lines).not.toMatch(/2017-12-22|peakHighUsd|reversalLowUsd|investment advice/i);
  });
});
