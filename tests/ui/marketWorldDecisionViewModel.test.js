import { describe, expect, it } from 'vitest';

import {
  applyArenaAction,
  approvePendingProposal,
} from '../../src/domain/guidanceLoop.js';
import { createPocketBotState } from '../../src/game/pocketBotState.js';
import { createMarketSignalScoutScenario } from '../../src/game/scenarios/marketSignalScoutScenario.js';
import { MARKET_WORLD_ACTIONS } from '../../src/game/scenarios/marketWorldLevels.js';
import { createMarketWorldActionResponsePanel } from '../../src/ui/marketWorldActionResponsePanel.js';
import { createMarketWorldDecisionViewModel } from '../../src/ui/marketWorldDecisionViewModel.js';

const LOCAL_POCKET_STATUS = Object.freeze({
  amount: 23,
  currency: 'NIM',
  mode: 'local-simulated',
  statusLabel: 'Local fallback',
});

function createScenarioAndState() {
  const scenario = createMarketSignalScoutScenario();

  return {
    scenario,
    state: createPocketBotState(scenario),
  };
}

function createPanel(scenario, state) {
  return createMarketWorldActionResponsePanel({
    runtimeSeed: scenario.marketWorldRuntime,
    runtimeState: state.marketWorldRuntime,
  });
}

function createViewModel(scenario, state, actionResponsePanel = null) {
  return createMarketWorldDecisionViewModel({
    scenario,
    guidanceState: state,
    nimiqPocketStatus: LOCAL_POCKET_STATUS,
    actionResponsePanel,
  });
}

describe('market world decision view model', () => {
  it('creates the V2 first-contact decision surface with four primary actions', () => {
    const { scenario, state } = createScenarioAndState();
    const viewModel = createViewModel(scenario, state);

    expect(viewModel.resourceBar).toMatchObject({
      botAttention: {
        label: 'Bot Attention',
        current: 10,
        max: 10,
      },
      nimiqPocket: {
        label: 'Nimiq Pocket',
        value: '23 NIM',
      },
      traceCount: 0,
    });
    expect(viewModel.actionTray.map((action) => action.id)).toEqual([
      MARKET_WORLD_ACTIONS.APPROVE_ENTER,
      MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN,
      MARKET_WORLD_ACTIONS.WIDE_SCAN,
      MARKET_WORLD_ACTIONS.CHECK_EXIT,
    ]);
    expect(viewModel.actionTray.map((action) => action.label)).toEqual([
      'Approve Enter',
      'Ask Hidden',
      'Wide Scan',
      'Check Exit',
    ]);
    expect(viewModel.actionTray).toHaveLength(4);
    expect(viewModel.actionTray.some((action) => action.id === MARKET_WORLD_ACTIONS.CHECK_SUPPORT)).toBe(false);
    expect(viewModel.contextualControls.some((control) => control.id === MARKET_WORLD_ACTIONS.CHECK_SUPPORT)).toBe(false);
    expect(viewModel.arenaCard).toMatchObject({
      title: 'Golden Signal',
      subtitle: 'As-of 2017-12-16',
      backgroundAssetKey: 'decision_arena_card_bg_720x520',
      signalAssetKey: 'btc_signal_glow_512x180',
      botAssetKey: 'bot_v2_excited',
    });
    expect(viewModel.arenaCard.surfaces.support).toMatchObject({
      title: 'Support',
      state: 'hidden',
      assetKey: 'surface_support_fog_160',
    });
    expect(viewModel.arenaCard.surfaces.exit).toMatchObject({
      title: 'Exit',
      state: 'hidden',
      assetKey: 'surface_exit_fog_160',
    });
    expect(viewModel.arenaCard.surfaces.crowd).toMatchObject({
      title: 'Crowd',
      state: 'visible',
      assetKey: 'surface_crowd_pressure_160',
    });
    expect(JSON.stringify(viewModel)).not.toMatch(/CRPM|source[- ]ocean|cut price|landfall|residualiz|signal_to_/i);
  });

  it('promotes Support Check contextually after Ask Hidden names the fog', () => {
    const { scenario, state } = createScenarioAndState();
    const asked = applyArenaAction(state, MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN);
    const viewModel = createViewModel(scenario, asked, createPanel(scenario, asked));

    expect(viewModel.actionTray.map((action) => action.id)).not.toContain(
      MARKET_WORLD_ACTIONS.CHECK_SUPPORT
    );
    expect(viewModel.contextualControls.map((control) => control.id)).toContain(
      MARKET_WORLD_ACTIONS.CHECK_SUPPORT
    );
    expect(viewModel.arenaCard.surfaces.support).toMatchObject({
      state: 'hinted',
      label: 'Support?',
    });
    expect(viewModel.traceDrawer).toMatchObject({
      visible: true,
      title: 'Ask Hidden Response',
    });
    expect(viewModel.traceDrawer.lines.join(' ')).toContain('No Bot Attention spent');
  });

  it('turns approved moves into trace drawer state without changing authority', () => {
    const { scenario, state } = createScenarioAndState();
    const prepared = applyArenaAction(state, MARKET_WORLD_ACTIONS.WIDE_SCAN);
    const accepted = approvePendingProposal(prepared).state;
    const viewModel = createViewModel(scenario, accepted, createPanel(scenario, accepted));

    expect(viewModel.resourceBar.botAttention.current).toBe(9);
    expect(viewModel.resourceBar.traceCount).toBe(1);
    expect(viewModel.arenaCard.botAssetKey).toBe('bot_v2_learning');
    expect(viewModel.arenaCard.surfaces.crowd).toMatchObject({
      state: 'active',
      label: 'Crowd pressure',
    });
    expect(viewModel.traceDrawer.visible).toBe(true);
    expect(viewModel.traceDrawer.title).toBe('Trace 1: Open run');
    expect(viewModel.traceDrawer.lines.join(' ')).toContain('Cost: 1 Bot Attention');
    expect(JSON.stringify(viewModel.traceDrawer)).not.toMatch(/CRPM|source[- ]ocean|cut price|landfall|residualiz|signal_to_/i);
  });
});
