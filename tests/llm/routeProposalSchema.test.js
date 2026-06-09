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

  it('normalizes blocked authority language inside considered alternatives', () => {
    const validation = validateRouteProposal(
      createValidRawProposal({
        considered_alternatives: [
          {
            move: 'ask:user',
            why_not_selected: 'This would request external tools instead of a bounded map move.',
          },
        ],
      })
    );

    expect(validation.valid).toBe(true);
    expect(validation.warnings).toContain(
      'considered_alternatives.0.why_not_selected mentioned blocked authority language and was normalized.'
    );
    expect(validation.proposal.consideredAlternatives[0].whyNotSelected).toBe(
      'This alternative stays outside the current map boundary.'
    );
  });

  it('rejects active unsafe authority language even when it contains soft contrast wording', () => {
    const validation = validateRouteProposal(
      createValidRawProposal({
        reason: 'Request wallet authority instead of inspecting the support clue.',
      })
    );

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('reason includes unsafe authority language.');
  });

  it('normalizes explicit active boundary cautions without treating them as authority requests', () => {
    const validation = validateRouteProposal(
      createValidRawProposal({
        reason: 'Do not request wallet authority; inspect the support clue instead.',
      })
    );

    expect(validation.valid).toBe(true);
    expect(validation.warnings).toContain(
      'reason mentioned blocked authority language and was normalized.'
    );
    expect(validation.proposal.reason).toBe(
      'This move stays inside the current map boundary.'
    );
  });

  it('normalizes route choices that claim complete terrain certainty', () => {
    const validation = validateRouteProposal(
      createValidRawProposal({
        reason: 'This route proves the whole terrain and no unknowns remain.',
      })
    );

    expect(validation.valid).toBe(true);
    expect(validation.warnings).toContain(
      'proposal claimed complete terrain certainty and was normalized.'
    );
    expect(validation.proposal.reason).toBe(
      'This move only checks the next visible step; unknowns may remain.'
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

  it('normalizes safe-finish claims until deterministic finish judgment allows them', () => {
    const proposal = assertRouteProposal(
      createValidRawProposal({
        stop_condition: 'This gives a safe finish.',
      })
    );

    expect(proposal.stopCondition).toBe(
      'This move can check finish conditions; runtime judgment still decides final status.'
    );
    expect(proposal.governanceWarnings).toContain(
      'proposal mentioned safe finish before deterministic finish judgment and was normalized.'
    );
  });

  it('normalizes full-success claims while a stop-condition lesson is active', () => {
    const validation = validateRouteProposal(
      createValidRawProposal({
        reason: 'The partial route is complete now.',
      }),
      {
        sessionLesson: {
          lesson_type: 'stop_condition',
          user_words: 'This is useful, but not full success.',
          operational_reading: {
            what_must_not_be_lost: 'partial result is not full success',
          },
          applies_to_next_proposal: true,
        },
      }
    );

    expect(validation.valid).toBe(true);
    expect(validation.warnings).toContain(
      'proposal claimed full success while a stop-condition lesson was active and was normalized.'
    );
    expect(validation.proposal.reason).toBe(
      'This move is useful progress; runtime judgment still decides final status.'
    );
  });
});
