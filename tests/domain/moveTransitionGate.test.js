import { describe, expect, it } from 'vitest';

import {
  TRANSITION_CLASSIFICATIONS,
  TRANSITION_GATE_STATUS,
  attachTransitionAfterState,
  createMoveTransitionGate,
  isTransitionClosed,
} from '../../src/domain/moveTransitionGate.js';
import { evaluateResourceCost, getMoveResourceCost } from '../../src/domain/resourceRules.js';
import { createResourceMapScenario } from '../../src/game/resourceMapScenario.js';

function createGate() {
  const scenario = createResourceMapScenario();
  const proposal = {
    id: 'proposal-inspect-shortcut',
    moveType: 'inspect',
    targetNodeId: 'shortcut-bridge',
  };

  return createMoveTransitionGate({
    sessionId: 'run-test',
    beforeState: {
      currentNodeId: 'source-edge',
      resources: scenario.resources,
      visibleNodeIds: ['source-edge', 'shortcut-bridge'],
    },
    proposal,
    resourceEvaluation: evaluateResourceCost(scenario.resources, getMoveResourceCost('inspect')),
    expectedEvidence: ['shortcut-risk'],
  });
}

describe('move transition gate', () => {
  it('creates a pending transition with before-state, proposal, rule result, and expected evidence', () => {
    const gate = createGate();

    expect(gate).toMatchObject({
      status: TRANSITION_GATE_STATUS.PENDING,
      beforeState: {
        currentNodeId: 'source-edge',
      },
      proposal: {
        moveType: 'inspect',
        targetNodeId: 'shortcut-bridge',
      },
      resourceEvaluation: {
        allowed: true,
      },
      expectedEvidence: ['shortcut-risk'],
    });
    expect(isTransitionClosed(gate)).toBe(false);
  });

  it('closes only after after-state and classification are attached', () => {
    const closedGate = attachTransitionAfterState(createGate(), {
      afterState: {
        currentNodeId: 'shortcut-bridge',
        visibleNodeIds: ['source-edge', 'shortcut-bridge'],
      },
      observedEvidence: ['shortcut-risk'],
      classification: TRANSITION_CLASSIFICATIONS.EXPECTED_REVEAL,
      residue: ['long route safety still unknown'],
    });

    expect(closedGate.status).toBe(TRANSITION_GATE_STATUS.CLOSED);
    expect(isTransitionClosed(closedGate)).toBe(true);
    expect(closedGate.observedEvidence).toContain('shortcut-risk');
  });

  it('requires explicit residue for risk and repair classifications', () => {
    expect(() => attachTransitionAfterState(createGate(), {
      afterState: {
        currentNodeId: 'shortcut-bridge',
      },
      classification: TRANSITION_CLASSIFICATIONS.RISK_BOUNDARY,
      residue: [],
    })).toThrow('must carry explicit residue');

    const closedGate = attachTransitionAfterState(createGate(), {
      afterState: {
        currentNodeId: 'source-edge',
      },
      classification: TRANSITION_CLASSIFICATIONS.REPAIR_NEEDED,
      residue: ['shortcut risk unresolved'],
    });

    expect(closedGate.residue).toContain('shortcut risk unresolved');
  });
});

