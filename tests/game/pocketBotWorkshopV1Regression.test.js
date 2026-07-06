import { describe, expect, it } from 'vitest';

import {
  applyArenaAction,
  approvePendingProposal,
} from '../../src/domain/guidanceLoop.js';
import { createPocketBotState } from '../../src/game/pocketBotState.js';
import { createGoldenSignalIntroSequence } from '../../src/game/scenarios/goldenSignalIntroSequence.js';
import { createMarketSignalScoutScenario } from '../../src/game/scenarios/marketSignalScoutScenario.js';
import { MARKET_WORLD_ACTIONS } from '../../src/game/scenarios/marketWorldLevels.js';
import { createMarketWorldRenderPlan } from '../../src/game/scenarios/marketWorldRenderPlan.js';
import { createMarketWorldActionResponsePanel } from '../../src/ui/marketWorldActionResponsePanel.js';
import { createMarketWorldAffordanceDescriptors } from '../../src/ui/marketWorldAffordanceOverlay.js';
import { formatTraceArchiveLabel } from '../../src/ui/tracePanel.js';

const V1_FIRST_SLICE_ACTIONS = Object.freeze([
  MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN,
  MARKET_WORLD_ACTIONS.WIDE_SCAN,
  MARKET_WORLD_ACTIONS.CHECK_EXIT,
  MARKET_WORLD_ACTIONS.CHECK_SUPPORT,
  MARKET_WORLD_ACTIONS.APPROVE_ENTER,
]);

const PLAYER_FACING_JARGON = /CRPM|source[- ]ocean|cut price|landfall|residualiz|v0|v1|v2|v3/i;

function createV1State() {
  return createPocketBotState(createMarketSignalScoutScenario());
}

function createActionResponsePanel(state) {
  return createMarketWorldActionResponsePanel({
    runtimeSeed: state.mapState.scenario.marketWorldRuntime,
    runtimeState: state.marketWorldRuntime,
  });
}

function descriptorsFor(state) {
  const renderPlan = createMarketWorldRenderPlan({
    runtimeState: state.marketWorldRuntime,
    finishJudgment: state.mapState.finishJudgment,
    selectedNodeId: state.pendingProposal.targetNodeId,
    traceCards: state.traceCards,
  });

  return Object.fromEntries(
    createMarketWorldAffordanceDescriptors(renderPlan).map((descriptor) => [
      descriptor.key,
      descriptor,
    ])
  );
}

function expectNoPlayerFacingJargon(values) {
  expect(values.filter(Boolean).join('\n')).not.toMatch(PLAYER_FACING_JARGON);
}

describe('PocketBotWorkshop V1 regression boundary', () => {
  it('freezes the current first-contact contract before presentation overhaul', () => {
    const scenario = createMarketSignalScoutScenario();
    const intro = createGoldenSignalIntroSequence();
    const playerHandoff = intro.beats.at(-1);
    const actionLabels = Object.fromEntries(
      V1_FIRST_SLICE_ACTIONS.map((actionId) => [
        actionId,
        scenario.arenaSpine.actions[actionId].label,
      ])
    );

    expect(scenario).toMatchObject({
      title: 'Market Signal Scout',
      supportLine: 'Train your bot to spend attention wisely.',
      goal: 'Teach Pocket Bot to inspect support before treating a bright signal as safe.',
    });
    expect(scenario.proposalPreview).toMatchObject({
      targetNodeId: 'bright-signal',
      move: 'Act on the bright signal',
      cost: {
        moveType: 'act',
        botAttention: 2,
        userGuidance: 1,
      },
    });
    expect(scenario.arenaSpine).toMatchObject({
      sourceLevelId: 'level_02_golden_signal',
      openingHabit: 'Pocket Bot sees a bright signal and wants to enter.',
      firstSlice: V1_FIRST_SLICE_ACTIONS,
    });
    expect(actionLabels).toEqual({
      [MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN]: 'Ask Hidden',
      [MARKET_WORLD_ACTIONS.WIDE_SCAN]: 'Wide Scan',
      [MARKET_WORLD_ACTIONS.CHECK_EXIT]: 'Check Exit',
      [MARKET_WORLD_ACTIONS.CHECK_SUPPORT]: 'Support Check',
      [MARKET_WORLD_ACTIONS.APPROVE_ENTER]: 'Approve Enter',
    });
    expect(playerHandoff.enabledControls).toEqual([
      'Approve',
      'Ask Hidden',
      'Wide Scan',
      'Check Exit',
      'Support Check',
    ]);
    expectNoPlayerFacingJargon([
      scenario.title,
      scenario.supportLine,
      scenario.goal,
      ...Object.values(actionLabels),
      playerHandoff.title,
      ...playerHandoff.lines,
    ]);
  });

  it('freezes V1 no-spend prepare gates, approved responses, and render states', () => {
    const asked = applyArenaAction(
      createV1State(),
      MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN
    );
    const askPanel = createActionResponsePanel(asked);
    const askDescriptors = descriptorsFor(asked);

    expect(asked.mapState.resources.botAttention.current).toBe(10);
    expect(asked.traceCards).toHaveLength(0);
    expect(asked.pendingProposal).toMatchObject({
      moveType: 'act',
      targetNodeId: 'bright-signal',
    });
    expect(askPanel).toMatchObject({
      title: 'Ask Hidden Response',
      phase: 'unknowns-named',
      sourceStatus: 'not_consumed',
    });
    expect(askPanel.lines.join(' ')).toContain('No Bot Attention spent.');
    expect(askDescriptors.supportWell).toMatchObject({
      nodeId: 'support-check',
      state: 'hinted',
      label: 'Support?',
    });
    expect(askDescriptors.exitBridge).toMatchObject({
      nodeId: 'exit-friction',
      state: 'hinted',
      label: 'Exit?',
    });

    const widePrepared = applyArenaAction(createV1State(), MARKET_WORLD_ACTIONS.WIDE_SCAN);
    const widePreparedPanel = createActionResponsePanel(widePrepared);

    expect(widePrepared.mapState.resources.botAttention.current).toBe(10);
    expect(widePrepared.traceCards).toHaveLength(0);
    expect(widePrepared.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'fomo-pressure',
      resourceCost: {
        botAttention: 1,
        userGuidance: 1,
      },
    });
    expect(widePreparedPanel).toMatchObject({
      title: 'Wide Scan Prepared',
      phase: 'prepared',
      targetNodeId: 'fomo-pressure',
    });
    expect(widePreparedPanel.lines.join(' ')).toContain(
      'Approve controls Bot Attention spending.'
    );

    const wideAccepted = approvePendingProposal(widePrepared).state;
    const wideResponse = createActionResponsePanel(wideAccepted);
    const wideDescriptors = descriptorsFor(wideAccepted);

    expect(wideAccepted.mapState.resources.botAttention.current).toBe(9);
    expect(formatTraceArchiveLabel(wideAccepted.traceCards)).toBe(
      '1 trace card(s) | Open run'
    );
    expect(wideResponse).toMatchObject({
      title: 'Wide Scan Response',
      phase: 'approved',
      targetNodeId: 'fomo-pressure',
    });
    expect(wideDescriptors.crowdPressure).toMatchObject({
      nodeId: 'fomo-pressure',
      state: 'active',
      label: 'Crowd pressure',
    });
    expect(wideDescriptors.traceMemory).toMatchObject({
      state: 'residue-carrier',
      label: 'Trace carries',
    });

    const exitPrepared = applyArenaAction(createV1State(), MARKET_WORLD_ACTIONS.CHECK_EXIT);
    const exitPreparedPanel = createActionResponsePanel(exitPrepared);

    expect(exitPrepared.mapState.resources.botAttention.current).toBe(10);
    expect(exitPrepared.traceCards).toHaveLength(0);
    expect(exitPrepared.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'exit-friction',
      resourceCost: {
        botAttention: 2,
        userGuidance: 1,
      },
    });
    expect(exitPreparedPanel).toMatchObject({
      title: 'Check Exit Prepared',
      phase: 'prepared',
      targetNodeId: 'exit-friction',
    });

    const exitAccepted = approvePendingProposal(exitPrepared).state;
    const exitResponse = createActionResponsePanel(exitAccepted);
    const exitDescriptors = descriptorsFor(exitAccepted);

    expect(exitAccepted.mapState.resources.botAttention.current).toBe(8);
    expect(exitAccepted.traceCards).toHaveLength(1);
    expect(exitResponse).toMatchObject({
      title: 'Check Exit Response',
      phase: 'approved',
      targetNodeId: 'exit-friction',
    });
    expect(exitResponse.lines.join(' ')).toContain(
      'Source gate: Coin Metrics remains blocked until review.'
    );
    expect(exitDescriptors.exitBridge).toMatchObject({
      nodeId: 'exit-friction',
      state: 'revealed',
      label: 'Exit checked',
    });

    const supportPrepared = applyArenaAction(
      createV1State(),
      MARKET_WORLD_ACTIONS.CHECK_SUPPORT
    );
    const supportAccepted = approvePendingProposal(supportPrepared).state;
    const supportResponse = createActionResponsePanel(supportAccepted);
    const supportDescriptors = descriptorsFor(supportAccepted);

    expect(supportAccepted.mapState.resources.botAttention.current).toBe(8);
    expect(supportResponse).toMatchObject({
      title: 'Support Check Response',
      phase: 'approved',
      targetNodeId: 'support-check',
    });
    expect(supportResponse.lines.join(' ')).toContain(
      'Source: Binance Public Data BTCUSDT transformed static fixture.'
    );
    expect(supportDescriptors.supportWell).toMatchObject({
      nodeId: 'support-check',
      state: 'stable',
      label: 'Support held',
    });
    expectNoPlayerFacingJargon([
      askPanel.title,
      ...askPanel.lines,
      widePreparedPanel.title,
      ...widePreparedPanel.lines,
      wideResponse.title,
      ...wideResponse.lines,
      exitResponse.title,
      ...exitResponse.lines,
      supportResponse.title,
      ...supportResponse.lines,
      ...Object.values(supportDescriptors).map((descriptor) => descriptor.label),
    ]);
  });

  it('freezes direct enter as V1 false-finish feedback instead of success', () => {
    const accepted = approvePendingProposal(createV1State()).state;
    const response = createActionResponsePanel(accepted);
    const descriptors = descriptorsFor(accepted);

    expect(formatTraceArchiveLabel(accepted.traceCards)).toBe(
      '1 trace card(s) | False finish'
    );
    expect(response).toMatchObject({
      title: 'Approve Enter Response',
      phase: 'approved',
      targetNodeId: 'bright-signal',
    });
    expect(descriptors.goldenSignal).toMatchObject({
      nodeId: 'bright-signal',
      state: 'acted-on',
      label: 'Signal used',
    });
    expect(descriptors.finishGate).toMatchObject({
      nodeId: 'false-gate',
      state: 'false',
      label: 'False finish',
    });
    expectNoPlayerFacingJargon([
      response.title,
      ...response.lines,
      ...Object.values(descriptors).map((descriptor) => descriptor.label),
    ]);
  });
});
