import { describe, expect, it } from 'vitest';

import { RESOURCE_DECISIONS, applyResourceCost, createCoreResourceState, evaluateResourceCost, getMoveResourceCost } from '../../src/domain/resourceRules.js';
import { createResourceMapScenario } from '../../src/game/resourceMapScenario.js';

describe('core resource rules', () => {
  it('normalizes scenario resources without conflating Nimiq Pocket and Bot Attention', () => {
    const scenario = createResourceMapScenario();
    const resources = createCoreResourceState(scenario.resources);

    expect(resources).toMatchObject({
      botAttention: {
        current: 10,
        max: 10,
      },
      nimiqPocket: {
        amount: 23,
        currency: 'NIM',
      },
      contextSlots: {
        capacity: 4,
        items: [],
      },
    });
  });

  it('uses deterministic move costs for Phase 1 actions', () => {
    expect(getMoveResourceCost('inspect')).toMatchObject({ botAttention: 2, userGuidance: 1, contextSlots: 0 });
    expect(getMoveResourceCost('ask')).toMatchObject({ botAttention: 1, userGuidance: 1, contextSlots: 0 });
    expect(getMoveResourceCost('remember')).toMatchObject({ botAttention: 1, userGuidance: 0, contextSlots: 1 });
    expect(getMoveResourceCost('act')).toMatchObject({ botAttention: 2, userGuidance: 1, contextSlots: 0 });
    expect(getMoveResourceCost('skip')).toMatchObject({ botAttention: 0, userGuidance: 0, contextSlots: 0 });
  });

  it('allows inspect when enough Bot Attention is available', () => {
    const resources = createCoreResourceState(createResourceMapScenario().resources);
    const evaluation = evaluateResourceCost(resources, getMoveResourceCost('inspect'));

    expect(evaluation).toMatchObject({
      decision: RESOURCE_DECISIONS.ALLOWED,
      allowed: true,
      requiresUserGuidance: true,
      checks: {
        pocketSeparated: {
          passed: true,
        },
      },
    });
  });

  it('blocks a move when Bot Attention would go negative', () => {
    const resources = createCoreResourceState({
      ...createResourceMapScenario().resources,
      botAttention: { current: 1, max: 10 },
    });
    const evaluation = evaluateResourceCost(resources, getMoveResourceCost('inspect'));

    expect(evaluation).toMatchObject({
      decision: RESOURCE_DECISIONS.BLOCKED,
      allowed: false,
    });
    expect(evaluation.checks.botAttention.passed).toBe(false);
  });

  it('blocks remember when no Context Capacity remains', () => {
    const resources = createCoreResourceState({
      ...createResourceMapScenario().resources,
      contextSlots: {
        capacity: 1,
        items: [{ id: 'existing-clue', label: 'Existing clue', traceBacked: true }],
      },
    });
    const evaluation = evaluateResourceCost(resources, getMoveResourceCost('remember'));

    expect(evaluation).toMatchObject({
      decision: RESOURCE_DECISIONS.BLOCKED,
      allowed: false,
    });
    expect(evaluation.checks.contextCapacity.passed).toBe(false);
  });

  it('applies move costs to Bot Attention and user guidance prompts', () => {
    const resources = createCoreResourceState(createResourceMapScenario().resources);
    const result = applyResourceCost(resources, getMoveResourceCost('inspect'));

    expect(result).toMatchObject({
      applied: true,
      resources: {
        botAttention: {
          current: 8,
        },
        userGuidance: {
          prompts: 1,
        },
        nimiqPocket: {
          amount: 23,
        },
      },
    });
    expect(resources.botAttention.current).toBe(10);
  });
});

