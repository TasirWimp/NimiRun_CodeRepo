import { describe, expect, it } from 'vitest';

import { FINISH_STATUSES } from '../../src/domain/finishJudgment.js';
import { TRANSITION_CLASSIFICATIONS, attachTransitionAfterState, createMoveTransitionGate } from '../../src/domain/moveTransitionGate.js';
import { applyTransitionToRunCarrier, serializeRunCarrierForPrompt } from '../../src/domain/runCarrier.js';
import { createRunSession } from '../../src/domain/runSession.js';
import { evaluateResourceCost, getMoveResourceCost } from '../../src/domain/resourceRules.js';
import { createResourceMapScenario } from '../../src/game/resourceMapScenario.js';

function createClosedExpectedRevealTransition(session) {
  const proposal = {
    id: 'proposal-inspect-shortcut',
    moveType: 'inspect',
    targetNodeId: 'shortcut-bridge',
  };
  const gate = createMoveTransitionGate({
    sessionId: session.id,
    beforeState: {
      currentNodeId: session.currentNodeId,
      resources: session.resources,
      visibleNodeIds: session.visibleNodeIds,
    },
    proposal,
    resourceEvaluation: evaluateResourceCost(session.resources, getMoveResourceCost('inspect')),
    expectedEvidence: ['shortcut-risk'],
  });

  return attachTransitionAfterState(gate, {
    afterState: {
      currentNodeId: 'shortcut-bridge',
      resources: session.resources,
      visibleNodeIds: [...session.visibleNodeIds, 'warning-signal'],
    },
    observedEvidence: ['shortcut-risk'],
    classification: TRANSITION_CLASSIFICATIONS.EXPECTED_REVEAL,
    residue: ['long route safety still unknown'],
  });
}

describe('run carrier', () => {
  it('carries expected reveals and residue without marking the run safe', () => {
    const session = createRunSession(createResourceMapScenario());
    const transition = createClosedExpectedRevealTransition(session);
    const carrier = applyTransitionToRunCarrier(session.carrier, transition);

    expect(carrier).toMatchObject({
      currentNodeId: 'shortcut-bridge',
      finishStatus: FINISH_STATUSES.OPEN,
    });
    expect(carrier.revealedEvidence).toContain('shortcut-risk');
    expect(carrier.residue).toContain('long route safety still unknown');
  });

  it('serializes compactly for the next LLM proposal prompt', () => {
    const session = createRunSession(createResourceMapScenario());
    const transition = createClosedExpectedRevealTransition(session);
    const carrier = applyTransitionToRunCarrier(session.carrier, transition);
    const serialized = serializeRunCarrierForPrompt(carrier);

    expect(serialized).toMatchObject({
      goal: session.goal,
      current_node: 'shortcut-bridge',
      finish_status: FINISH_STATUSES.OPEN,
      resources: {
        botAttention: {
          current: 10,
          max: 10,
        },
      },
    });
    expect(serialized.recent_trace).toEqual([
      expect.objectContaining({
        move: 'inspect',
        target: 'shortcut-bridge',
        result: TRANSITION_CLASSIFICATIONS.EXPECTED_REVEAL,
      }),
    ]);
  });
});

