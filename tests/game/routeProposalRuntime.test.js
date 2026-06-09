import { describe, expect, it } from 'vitest';

import {
  applyRouteProposalResult,
  createRouteProposalRuntimeInput,
} from '../../src/game/routeProposalRuntime.js';
import { createPocketBotState } from '../../src/game/pocketBotState.js';
import { createMarketSignalScoutScenario } from '../../src/game/scenarios/marketSignalScoutScenario.js';

function createState() {
  return createPocketBotState(createMarketSignalScoutScenario());
}

function createRelayProposal(overrides = {}) {
  return {
    mode: 'openai',
    model: 'test-model',
    proposal: {
      moveType: 'inspect',
      targetNodeId: 'support-check',
      reason: 'Inspect support before acting on the bright signal.',
      resourceCost: {
        moveType: 'inspect',
        botAttention: 99,
        userGuidance: 99,
        contextSlots: 0,
      },
      consideredAlternatives: [
        {
          move: 'act:bright-signal',
          whyNotSelected: 'Acting now leaves support residue unresolved.',
        },
      ],
      cutPrice: {
        reveals: ['support clue'],
        suppresses: ['exit path remains outside this move'],
        leavesResidue: ['exit friction still unknown'],
      },
      stopCondition: 'Stop after one inspect result.',
      ...overrides,
    },
  };
}

describe('route proposal runtime', () => {
  it('builds a compact relay payload from playable guidance state', () => {
    const input = createRouteProposalRuntimeInput(createState(), { sessionId: 'run-ui-test' });

    expect(input.carrier).toMatchObject({
      sessionId: 'run-ui-test',
      currentNodeId: 'source-edge',
      finishStatus: 'open-run',
    });
    expect(input.allowedMoves).toEqual(['inspect', 'ask', 'act', 'skip']);
    expect(input.allowedMoves).not.toContain('remember');
    expect(input.targetNodeIds).toContain('support-check');
    expect(input.visibleNodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'support-check',
          label: 'Support Check',
          status: 'visible',
        }),
      ])
    );
    expect(input.carrier.residue).toContain('support depth still unknown');
  });

  it('normalizes relay proposal costs against scenario runtime costs', () => {
    const nextState = applyRouteProposalResult(createState(), createRelayProposal());

    expect(nextState.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'support-check',
      resourceCost: {
        botAttention: 2,
        userGuidance: 1,
      },
    });
    expect(nextState.guidancePanel.title).toBe('Bot Proposal Updated');
    expect(nextState.guidanceTrace.at(-1)).toMatchObject({
      action: 'ask-bot',
      relayMode: 'openai',
      relayModel: 'test-model',
    });
  });

  it('adjusts unsupported node moves to an executable inspect proposal', () => {
    const nextState = applyRouteProposalResult(
      createState(),
      createRelayProposal({
        moveType: 'act',
        targetNodeId: 'support-check',
      })
    );

    expect(nextState.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'support-check',
    });
    expect(nextState.pendingProposal.consideredAlternatives).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          move: 'act:support-check',
        }),
      ])
    );
  });
});
