import { describe, expect, it } from 'vitest';

import {
  TRAINING_COMMAND_TYPES,
  createLocalTrainingSession,
} from '../../src/game/localTrainingSession.js';
import { TRAINING_WORLD_NODE_IDS } from '../../src/game/trainingWorldMap.js';
import { createMarketSignalScoutScenario } from '../../src/game/scenarios/marketSignalScoutScenario.js';
import { MARKET_WORLD_ACTIONS } from '../../src/game/scenarios/marketWorldLevels.js';

function createSession(options = {}) {
  return createLocalTrainingSession({
    scenario: createMarketSignalScoutScenario(),
    sessionId: 'session-golden-signal',
    roomId: 'local-room',
    playerId: 'player-one',
    botId: 'pocket-bot',
    ...options,
  });
}

function command(type, overrides = {}) {
  return {
    sessionId: 'session-golden-signal',
    roomId: 'local-room',
    playerId: 'player-one',
    botId: 'pocket-bot',
    clientSeq: 1,
    type,
    ...overrides,
  };
}

describe('local training session adapter', () => {
  it('rejects commands missing multiplayer-ready envelope ids', async () => {
    const session = createSession();

    await expect(session.dispatchTrainingCommand(command(TRAINING_COMMAND_TYPES.MOVE_ACTOR_TO_NODE, {
      sessionId: '',
      nodeId: TRAINING_WORLD_NODE_IDS.SIGNAL,
    }))).resolves.toMatchObject({
      accepted: false,
      error: 'Command missing sessionId.',
    });
    await expect(session.dispatchTrainingCommand(command(TRAINING_COMMAND_TYPES.MOVE_ACTOR_TO_NODE, {
      playerId: '',
      nodeId: TRAINING_WORLD_NODE_IDS.SIGNAL,
    }))).resolves.toMatchObject({
      accepted: false,
      error: 'Command missing playerId.',
    });
    await expect(session.dispatchTrainingCommand(command(TRAINING_COMMAND_TYPES.MOVE_ACTOR_TO_NODE, {
      botId: '',
      nodeId: TRAINING_WORLD_NODE_IDS.SIGNAL,
    }))).resolves.toMatchObject({
      accepted: false,
      error: 'Command missing botId.',
    });
  });

  it('preserves no-spend-before-approval through the command seam', async () => {
    const session = createSession();
    const start = session.getState();

    expect(start.resourceBar.botAttention.current).toBe(10);

    const prepared = await session.dispatchTrainingCommand(command(
      TRAINING_COMMAND_TYPES.PREPARE_MARKET_ACTION,
      { actionId: MARKET_WORLD_ACTIONS.WIDE_SCAN }
    ));

    expect(prepared.accepted).toBe(true);
    expect(prepared.state.resourceBar.botAttention.current).toBe(10);
    expect(prepared.state.guidanceState.traceCards).toHaveLength(0);
    expect(prepared.state.guidanceState.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'fomo-pressure',
    });

    const approved = await session.dispatchTrainingCommand(command(
      TRAINING_COMMAND_TYPES.APPROVE_PENDING_PROPOSAL,
      { clientSeq: 2 }
    ));

    expect(approved.accepted).toBe(true);
    expect(approved.state.resourceBar.botAttention.current).toBe(9);
    expect(approved.state.guidanceState.traceCards).toHaveLength(1);
    expect(approved.events.map((event) => event.type)).toContain('trace_created');
  });

  it('uses bounded mock route proposals without spending before approval', async () => {
    const session = createSession({
      routeProposalRequester: async () => ({
        mode: 'mock',
        model: 'session-test',
        proposal: {
          moveType: 'inspect',
          targetNodeId: 'support-check',
          reason: 'Inspect support before following the signal.',
          consideredAlternatives: [
            {
              move: 'act:bright-signal',
              whyNotSelected: 'Acting now leaves support unresolved.',
            },
          ],
          cutPrice: {
            reveals: ['support clue'],
            suppresses: ['signal-only shortcut'],
            leavesResidue: ['exit friction still unknown'],
          },
          stopCondition: 'Stop after support is inspected.',
        },
      }),
    });

    const proposed = await session.dispatchTrainingCommand(command(
      TRAINING_COMMAND_TYPES.ASK_BOT_PROPOSAL
    ));

    expect(proposed.accepted).toBe(true);
    expect(proposed.state.resourceBar.botAttention.current).toBe(10);
    expect(proposed.state.guidanceState.traceCards).toHaveLength(0);
    expect(proposed.state.guidanceState.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'support-check',
    });
  });

  it('returns player-facing world state without internal relation ids', async () => {
    const session = createSession();
    const result = await session.dispatchTrainingCommand(command(
      TRAINING_COMMAND_TYPES.MOVE_ACTOR_TO_NODE,
      { nodeId: TRAINING_WORLD_NODE_IDS.SUPPORT }
    ));

    expect(result.accepted).toBe(true);
    expect(result.state.selectedWorldNodeId).toBe(TRAINING_WORLD_NODE_IDS.SUPPORT);
    expect(result.state.botCompanion).toMatchObject({
      posture: 'impulsive',
    });
    expect(JSON.stringify({
      worldNodes: result.state.worldNodes,
      traceDrawer: result.state.traceDrawer,
      botCompanion: result.state.botCompanion,
    })).not.toMatch(/CRPM|source[- ]ocean|cut price|landfall|residualiz|signal_to_/i);
  });
});
