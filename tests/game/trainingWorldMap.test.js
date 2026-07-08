import { describe, expect, it } from 'vitest';

import {
  TRAINING_WORLD_NODE_IDS,
  createTrainingWorldNodes,
  getTrainingWorldNodeBinding,
} from '../../src/game/trainingWorldMap.js';
import { createPocketBotState } from '../../src/game/pocketBotState.js';
import { createMarketSignalScoutScenario } from '../../src/game/scenarios/marketSignalScoutScenario.js';
import { MARKET_WORLD_ACTIONS } from '../../src/game/scenarios/marketWorldLevels.js';
import { createMarketWorldRenderPlan } from '../../src/game/scenarios/marketWorldRenderPlan.js';

function createRenderPlan() {
  const scenario = createMarketSignalScoutScenario();
  const guidanceState = createPocketBotState(scenario);

  return {
    guidanceState,
    renderPlan: createMarketWorldRenderPlan({
      runtimeState: guidanceState.marketWorldRuntime,
      finishJudgment: guidanceState.mapState.finishJudgment,
      selectedNodeId: guidanceState.pendingProposal.targetNodeId,
      traceCards: guidanceState.traceCards,
    }),
  };
}

describe('training world map bindings', () => {
  it('maps world nodes to existing Golden Signal actions', () => {
    expect(getTrainingWorldNodeBinding(TRAINING_WORLD_NODE_IDS.SUPPORT)).toMatchObject({
      commandType: 'prepare_market_action',
      actionId: MARKET_WORLD_ACTIONS.CHECK_SUPPORT,
    });
    expect(getTrainingWorldNodeBinding(TRAINING_WORLD_NODE_IDS.EXIT)).toMatchObject({
      commandType: 'prepare_market_action',
      actionId: MARKET_WORLD_ACTIONS.CHECK_EXIT,
    });
    expect(getTrainingWorldNodeBinding(TRAINING_WORLD_NODE_IDS.CROWD)).toMatchObject({
      commandType: 'prepare_market_action',
      actionId: MARKET_WORLD_ACTIONS.WIDE_SCAN,
    });
    expect(getTrainingWorldNodeBinding(TRAINING_WORLD_NODE_IDS.SIGNAL)).toMatchObject({
      commandType: 'approve_pending_proposal',
    });
  });

  it('creates player-facing world nodes from render-plan affordances', () => {
    const { guidanceState, renderPlan } = createRenderPlan();
    const nodes = createTrainingWorldNodes({
      renderPlan,
      guidanceState,
      selectedNodeId: TRAINING_WORLD_NODE_IDS.SIGNAL,
    });

    expect(nodes.map((node) => node.id)).toContain(TRAINING_WORLD_NODE_IDS.SUPPORT);
    expect(nodes.find((node) => node.id === TRAINING_WORLD_NODE_IDS.SUPPORT)).toMatchObject({
      label: 'Support Well',
      visualState: 'hidden',
      selected: false,
    });
    expect(nodes.find((node) => node.id === TRAINING_WORLD_NODE_IDS.SIGNAL)).toMatchObject({
      label: 'Golden Signal',
      visualState: 'selected',
      selected: true,
    });
    expect(JSON.stringify(nodes)).not.toMatch(/CRPM|source[- ]ocean|cut price|landfall|residualiz|signal_to_/i);
  });
});
