import { describe, expect, it } from 'vitest';

import { createRunSession, validateScenarioContract } from '../../src/domain/runSession.js';
import { createResourceMapScenario } from '../../src/game/resourceMapScenario.js';

describe('run session', () => {
  it('validates the scenario contract for goal, moves, resources, protected outcomes, and stop conditions', () => {
    const scenario = createResourceMapScenario();
    const validation = validateScenarioContract(scenario);

    expect(validation.valid).toBe(true);
    expect(Object.values(validation.checks).every((check) => check.passed)).toBe(true);
  });

  it('rejects a scenario contract with missing protected outcomes', () => {
    const scenario = createResourceMapScenario();
    scenario.runtimeContract.protectedOutcomes = [];
    const validation = validateScenarioContract(scenario);

    expect(validation.valid).toBe(false);
    expect(validation.checks.protectedOutcomes.passed).toBe(false);
    expect(() => createRunSession(scenario)).toThrow('Invalid scenario contract');
  });

  it('starts a run session only from a valid scenario contract', () => {
    const scenario = createResourceMapScenario();
    const session = createRunSession(scenario, { id: 'run-demo' });

    expect(session).toMatchObject({
      id: 'run-demo',
      scenarioId: scenario.id,
      goal: scenario.goal,
      status: 'open',
      currentNodeId: 'source-edge',
      resources: {
        botAttention: {
          current: 10,
          max: 10,
        },
      },
      carrier: {
        sessionId: 'run-demo',
        finishStatus: 'open-run',
      },
    });
    expect(session.visibleNodeIds).toContain('shortcut-bridge');
    expect(session.residue).toContain('false finish risk');
  });
});

