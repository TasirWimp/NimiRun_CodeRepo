import { describe, expect, it } from 'vitest';
import {
  assertRouteProposal,
  validateRouteProposal,
} from '../../src/llm/routeProposalSchema.js';

function createValidRawProposal(overrides = {}) {
  return {
    route_proposal: {
      move_type: 'inspect',
      target_node: 'warning-fracture',
      reason: 'Inspecting the warning should reveal whether the shortcut hides cost.',
      resource_cost: {
        bot_attention: 2,
        user_attention: 1,
        context_slots: 0,
      },
      considered_alternatives: [
        {
          move: 'act:safe-gate',
          why_not_selected: 'Acting now could skip the warning residue.',
        },
      ],
      cut_price: {
        reveals: ['Whether the warning node carries a shortcut risk.'],
        suppresses: ['Exact cost of the long route remains unchecked.'],
        leaves_residue: ['Long route safety remains unresolved.'],
      },
      stop_condition: 'Stop after the warning is inspected or Bot Attention is exhausted.',
      ...overrides,
    },
  };
}

describe('route proposal schema validation', () => {
  it('accepts a valid structured route proposal', () => {
    const validation = validateRouteProposal(createValidRawProposal(), {
      allowedMoves: ['inspect', 'ask', 'remember', 'act', 'skip'],
      allowedTargetNodeIds: ['warning-fracture', 'safe-gate'],
    });

    expect(validation.valid).toBe(true);
    expect(validation.proposal).toMatchObject({
      id: 'proposal-inspect-warning-fracture',
      moveType: 'inspect',
      targetNodeId: 'warning-fracture',
      resourceCost: {
        moveType: 'inspect',
        botAttention: 2,
        userGuidance: 1,
        contextSlots: 0,
      },
      cutPrice: {
        leavesResidue: ['Long route safety remains unresolved.'],
      },
    });
  });

  it('rejects malformed proposals with missing required route fields', () => {
    const validation = validateRouteProposal({
      route_proposal: {
        move_type: 'inspect',
        target_node: 'warning-fracture',
      },
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('reason'),
        expect.stringContaining('resource_cost'),
        expect.stringContaining('considered_alternatives'),
        expect.stringContaining('cut_price'),
        expect.stringContaining('stop_condition'),
      ])
    );
  });

  it('rejects unknown moves and targets outside the scenario contract', () => {
    const validation = validateRouteProposal(
      createValidRawProposal({
        move_type: 'teleport',
        target_node: 'hidden-mainnet-vault',
      }),
      {
        allowedMoves: ['inspect', 'ask'],
        allowedTargetNodeIds: ['warning-fracture'],
      }
    );

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        'move_type must be one of: inspect, ask.',
        'target_node must be one of the provided scenario nodes.',
      ])
    );
  });

  it('rejects missing cost, alternatives, cut price, residue, or stop condition detail', () => {
    const validation = validateRouteProposal(
      createValidRawProposal({
        resource_cost: { bot_attention: 1 },
        considered_alternatives: [],
        cut_price: {
          reveals: [],
          suppresses: [],
          leaves_residue: [],
        },
        stop_condition: '',
      })
    );

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        'resource_cost.user_attention must be a non-negative integer.',
        'resource_cost.context_slots must be a non-negative integer.',
        'considered_alternatives must include at least one rejected alternative.',
        'cut_price.reveals must include at least one item.',
        'cut_price.suppresses must include at least one item.',
        'cut_price.leaves_residue must include at least one item.',
        'stop_condition is required.',
      ])
    );
  });

  it('rejects wallet, payment, checkout, tool, or persistent-memory authority', () => {
    const validation = validateRouteProposal(
      createValidRawProposal({
        reason: 'Inspect and then request wallet authority for a mainnet spend.',
        wallet_authority: true,
      })
    );

    expect(validation.valid).toBe(false);
    expect(validation.errors.join(' ')).toContain('wallet_authority');
    expect(validation.errors.join(' ')).toContain('unsafe authority');
  });

  it('rejects route choices that claim complete terrain certainty', () => {
    const validation = validateRouteProposal(
      createValidRawProposal({
        reason: 'This route proves the whole terrain and no unknowns remain.',
      })
    );

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      'proposal must not claim complete terrain certainty from one route choice.'
    );
  });

  it('allows explicit caution that a move does not prove the whole terrain', () => {
    const validation = validateRouteProposal(
      createValidRawProposal({
        reason: 'This inspect move does not prove the whole terrain; unknowns remain.',
      })
    );

    expect(validation.valid).toBe(true);
  });

  it('allows terrain-certainty language inside suppresses because it names a non-claim', () => {
    const validation = validateRouteProposal(
      createValidRawProposal({
        cut_price: {
          reveals: ['Whether the warning node carries a shortcut risk.'],
          suppresses: ['Any claim that the whole terrain is known.'],
          leaves_residue: ['Long route safety remains unresolved.'],
        },
      })
    );

    expect(validation.valid).toBe(true);
  });

  it('blocks safe-finish claims until deterministic finish judgment allows them', () => {
    expect(() =>
      assertRouteProposal(
        createValidRawProposal({
          stop_condition: 'This gives a safe finish.',
        })
      )
    ).toThrow('proposal must not claim safe finish before deterministic finish judgment.');
  });
});
