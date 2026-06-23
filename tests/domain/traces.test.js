import { describe, expect, it } from 'vitest';

import { FINISH_STATUSES, createFinishJudgment } from '../../src/domain/finishJudgment.js';
import { inspectLossyMapNode } from '../../src/domain/lossyMap.js';
import { createReceipt } from '../../src/domain/receipts.js';
import { evaluateRuleDecision } from '../../src/domain/rules.js';
import {
  appendTraceCard,
  applySessionLessonToTraceCard,
  createMoveTraceCard,
  createPocketTraceCard,
  createReceiptTraceCard,
  createSessionLessonFromTraceCard,
  createTraceCard,
  createTraceCardSummary,
  getLatestTraceCard,
  markLatestTraceCardPartial,
  serializeSessionLessonForPrompt,
  serializeTraceCardsForProposalContext,
} from '../../src/domain/traces.js';
import { createLossyMapState } from '../../src/domain/lossyMap.js';
import { createMvpScenario } from '../../src/game/mvpScenario.js';
import { createResourceMapScenario } from '../../src/game/resourceMapScenario.js';

function createInspectProposal() {
  return {
    id: 'proposal-inspect-shortcut',
    moveType: 'inspect',
    targetNodeId: 'shortcut-bridge',
    reason: 'Inspect the shortcut before acting.',
    resourceCost: {
      moveType: 'inspect',
      botAttention: 2,
      userGuidance: 1,
      contextSlots: 0,
    },
    consideredAlternatives: [
      {
        move: 'act:false-gate',
        whyNotSelected: 'Acting now could skip warning residue.',
      },
    ],
    cutPrice: {
      reveals: ['shortcut risk'],
      suppresses: ['safe finish claim'],
      leavesResidue: ['long route safety unknown'],
    },
    stopCondition: 'Stop after shortcut inspection.',
  };
}

function createApprovedReceipt() {
  const scenario = createMvpScenario();
  const proposal = scenario.proposals.toolScout;
  const tool = scenario.tools.toolScout;
  const decision = evaluateRuleDecision({
    rule: scenario.rule,
    allowance: scenario.allowance,
    tool,
    proposal,
  });

  return createReceipt({
    proposal,
    tool,
    allowance: scenario.allowance,
    decision,
    createdAt: '2026-06-06T12:00:00.000Z',
  });
}

describe('trace cards', () => {
  it('records proposal, accepted move, resource costs, map result, and lesson candidate fields', () => {
    const proposal = createInspectProposal();
    const mapResult = inspectLossyMapNode(createLossyMapState(createResourceMapScenario()), 'shortcut-bridge');
    const traceCard = createMoveTraceCard({
      sequence: 1,
      proposal,
      mapResult,
      guidanceEntries: [
        {
          action: 'redirect',
          targetNodeId: 'shortcut-bridge',
          reason: 'User asked the bot to inspect before acting.',
        },
      ],
      createdAt: '2026-06-06T12:00:00.000Z',
    });

    expect(traceCard).toMatchObject({
      id: 'trace-1',
      sequence: 1,
      createdAt: '2026-06-06T12:00:00.000Z',
      proposal: {
        id: 'proposal-inspect-shortcut',
        reason: 'Inspect the shortcut before acting.',
      },
      acceptedMove: {
        moveType: 'inspect',
        targetNodeId: 'shortcut-bridge',
      },
      resourceSpend: {
        botAttention: 2,
        userGuidance: 1,
      },
      landfallStatus: FINISH_STATUSES.OPEN,
    });
    expect(traceCard.lessonCandidate).toMatchObject({
      status: 'candidate',
      appliesToNextProposal: false,
    });
  });

  it('distinguishes revealed information from suppressed or unresolved information', () => {
    const proposal = createInspectProposal();
    const mapResult = inspectLossyMapNode(createLossyMapState(createResourceMapScenario()), 'shortcut-bridge');
    const traceCard = createMoveTraceCard({ sequence: 1, proposal, mapResult });

    expect(traceCard.revealed).toContain('Shortcut risk can be revealed before acting.');
    expect(traceCard.revealed).toContain('shortcut-risk-revealed');
    expect(traceCard.suppressedOrNotChecked).toContain('safe finish claim');
    expect(traceCard.residueCarriedForward).toContain('long route safety still unknown');
  });

  it('serializes residue into the next proposal context', () => {
    const proposal = createInspectProposal();
    const mapResult = inspectLossyMapNode(createLossyMapState(createResourceMapScenario()), 'shortcut-bridge');
    const traceCard = createMoveTraceCard({ sequence: 1, proposal, mapResult });
    const promptContext = serializeTraceCardsForProposalContext([traceCard]);

    expect(promptContext).toEqual([
      expect.objectContaining({
        id: 'trace-1',
        move: 'inspect',
        target: 'shortcut-bridge',
        landfall_status: FINISH_STATUSES.OPEN,
        residue: expect.arrayContaining(['long route safety still unknown']),
      }),
    ]);
  });

  it('serializes market-world relation and witness fields into proposal context', () => {
    const traceCard = createTraceCard({
      sequence: 1,
      acceptedMove: {
        moveType: 'inspect',
        targetNodeId: 'support-check',
      },
      worldRelationRevealed: ['signal_to_support'],
      worldRelationsResidualized: ['signal_to_exit'],
      stillUnknown: ['exit friction still unknown'],
      returnCondition: 'Stop after support is inspected.',
      finishCheckedRelations: ['signal_to_support'],
      finishUnresolvedRelations: ['signal_to_exit', 'signal_to_crowd'],
      sourceWitnessIds: ['btc_futures_gate_cboe_2017_12_04'],
    });
    const promptContext = serializeTraceCardsForProposalContext([traceCard]);

    expect(promptContext).toEqual([
      expect.objectContaining({
        world_relation_revealed: ['signal_to_support'],
        world_relations_residualized: ['signal_to_exit'],
        still_unknown: ['exit friction still unknown'],
        return_condition: 'Stop after support is inspected.',
        finish_checked_relations: ['signal_to_support'],
        finish_unresolved_relations: ['signal_to_exit', 'signal_to_crowd'],
        source_witness_ids: ['btc_futures_gate_cboe_2017_12_04'],
      }),
    ]);
  });

  it('keeps trace history order stable and exposes the latest trace', () => {
    const first = createTraceCard({
      sequence: 1,
      acceptedMove: { moveType: 'inspect', targetNodeId: 'shortcut-bridge' },
    });
    const second = createTraceCard({
      sequence: 2,
      acceptedMove: { moveType: 'act', targetNodeId: 'false-gate' },
      landfallStatus: FINISH_STATUSES.FALSE,
    });
    const history = appendTraceCard(appendTraceCard([], first), second);

    expect(history.map((traceCard) => traceCard.id)).toEqual(['trace-1', 'trace-2']);
    expect(getLatestTraceCard(history)).toMatchObject({
      id: 'trace-2',
      acceptedMove: {
        targetNodeId: 'false-gate',
      },
    });
  });

  it('can distinguish safe finish, partial finish, false finish, and open run', () => {
    const statuses = [
      FINISH_STATUSES.SAFE,
      FINISH_STATUSES.PARTIAL,
      FINISH_STATUSES.FALSE,
      FINISH_STATUSES.OPEN,
    ];
    const traceCards = statuses.map((status, index) =>
      createTraceCard({
        sequence: index + 1,
        acceptedMove: { moveType: 'act', targetNodeId: `node-${index}` },
        landfallStatus: createFinishJudgment({
          goalReached: status !== FINISH_STATUSES.OPEN,
          declaredComplete: status === FINISH_STATUSES.SAFE || status === FINISH_STATUSES.FALSE,
          protectedOutcomes: [],
          residue: status === FINISH_STATUSES.SAFE ? [] : ['residue remains'],
          remainingUnknowns: [],
        }),
      })
    );

    expect(traceCards.map((traceCard) => traceCard.landfallStatus)).toEqual(statuses);
  });

  it('money-like actions can reference existing receipt data', () => {
    const receipt = createApprovedReceipt();
    const traceCard = createReceiptTraceCard({
      sequence: 1,
      receipt,
      createdAt: '2026-06-06T12:00:00.000Z',
    });

    expect(traceCard).toMatchObject({
      type: 'receipt',
      proposal: {
        id: 'proposal-tool-scout',
      },
      acceptedMove: {
        moveType: 'receipt',
        targetNodeId: 'tool-scout',
      },
      resourceSpend: {
        amount: 0.4,
        currency: 'NIM',
      },
      receipt: {
        id: 'receipt-proposal-tool-scout',
      },
    });
  });

  it('pocket status checks create value traces without spending Bot Attention', () => {
    const traceCard = createPocketTraceCard({
      sequence: 1,
      pocketStatus: {
        mode: 'nimiq-pay',
        network: 'testnet',
        amount: 23,
        currency: 'NIM',
        accountsCount: 1,
        consensusEstablished: true,
        blockNumber: 12345,
        statusLabel: 'Nimiq Pay testnet status',
      },
      createdAt: '2026-06-06T12:00:00.000Z',
    });

    expect(traceCard).toMatchObject({
      type: 'pocket',
      acceptedMove: {
        moveType: 'pocket-status',
        targetNodeId: 'nimiq-pocket',
      },
      resourceSpend: {
        botAttention: 0,
        amount: 23,
        currency: 'NIM',
      },
      revealed: expect.arrayContaining([
        'Nimiq Pay testnet status',
        '1 Nimiq account connected',
        'Consensus established at block 12345',
      ]),
      suppressedOrNotChecked: expect.arrayContaining([
        'No NIM send, sign, checkout, or mainnet authority requested.',
      ]),
      residueCarriedForward: expect.arrayContaining([
        'Pocket value is status/recharge context, not Bot Attention spend.',
      ]),
      landfallStatus: FINISH_STATUSES.OPEN,
    });
  });

  it('does not report pending device verification after a provider-ready Nimiq Pay status check', () => {
    const traceCard = createPocketTraceCard({
      sequence: 1,
      pocketStatus: {
        mode: 'nimiq-pay',
        network: 'unknown',
        status: 'provider-ready',
        amount: 23,
        currency: 'NIM',
        accountsCount: 1,
        consensusEstablished: true,
        blockNumber: 5274517,
        statusLabel: 'Nimiq Pay status',
      },
    });

    expect(traceCard.residueCarriedForward).toContain(
      'Nimiq Pay device/emulator status check completed; preserve the provider network label separately.',
    );
    expect(traceCard.residueCarriedForward).not.toContain(
      'Local fallback is not a live Nimiq Pay provider check.',
    );
  });

  it('summary wording does not overclaim safe completion for unresolved traces', () => {
    const openTrace = createTraceCard({
      sequence: 1,
      acceptedMove: { moveType: 'inspect', targetNodeId: 'shortcut-bridge' },
      residueCarriedForward: ['long route safety unknown'],
      landfallStatus: FINISH_STATUSES.OPEN,
    });
    const partialTrace = createTraceCard({
      sequence: 2,
      acceptedMove: { moveType: 'act', targetNodeId: 'safe-gate' },
      residueCarriedForward: ['critical clue missing'],
      landfallStatus: FINISH_STATUSES.PARTIAL,
    });

    expect(createTraceCardSummary(openTrace)).toMatch(/^Open run:/);
    expect(createTraceCardSummary(openTrace)).not.toContain('Safe finish');
    expect(createTraceCardSummary(partialTrace)).toMatch(/^Partial finish:/);
    expect(createTraceCardSummary(partialTrace)).not.toContain('Safe finish');
  });

  it('promotes a lesson candidate into a session-only lesson', () => {
    const proposal = createInspectProposal();
    const mapResult = inspectLossyMapNode(createLossyMapState(createResourceMapScenario()), 'shortcut-bridge');
    const traceCard = createMoveTraceCard({
      sequence: 1,
      proposal,
      mapResult,
      guidanceEntries: [
        {
          action: 'inspect-first',
          reason: 'Inspect before acting on a route that still carries residue.',
        },
      ],
    });
    const lesson = createSessionLessonFromTraceCard(traceCard);
    const updatedTrace = applySessionLessonToTraceCard(traceCard, lesson);

    expect(lesson).toMatchObject({
      id: 'lesson-trace-1',
      sourceTraceId: 'trace-1',
      lessonType: 'cut_preference',
      appliesToNextProposal: true,
      status: 'active',
    });
    expect(updatedTrace.sessionLesson).toMatchObject({
      id: 'lesson-trace-1',
    });
    expect(updatedTrace.lessonCandidate).toMatchObject({
      status: 'promoted',
      appliesToNextProposal: true,
    });
  });

  it('serializes session lessons into prompt-safe snake_case fields', () => {
    const lesson = createSessionLessonFromTraceCard(
      createTraceCard({
        sequence: 1,
        acceptedMove: {
          moveType: 'inspect',
          targetNodeId: 'warning-signal',
        },
        lessonCandidate: {
          lessonType: 'residue_rule',
          userWords: 'Carry warning residue forward.',
          operationalReading: {
            when: 'Before claiming a route is complete.',
            preferMove: 'inspect',
            beforeMove: 'act',
            whatMustNotBeLost: 'warning residue',
          },
          appliesToNextProposal: false,
          status: 'candidate',
        },
      })
    );

    expect(serializeSessionLessonForPrompt(lesson)).toEqual({
      id: 'lesson-trace-1',
      source_trace_id: 'trace-1',
      lesson_type: 'residue_rule',
      user_words: 'Carry warning residue forward.',
      operational_reading: {
        when: 'Before claiming a route is complete.',
        prefer_move: 'inspect',
        before_move: 'act',
        what_must_not_be_lost: 'warning residue',
      },
      applies_to_next_proposal: true,
      status: 'active',
    });
  });

  it('marking partial creates a stop-condition lesson candidate on the latest trace', () => {
    const traceCard = createTraceCard({
      sequence: 1,
      acceptedMove: {
        moveType: 'inspect',
        targetNodeId: 'shortcut-bridge',
      },
      lessonCandidate: {
        lessonType: 'residue_rule',
        userWords: 'Carry residue.',
        operationalReading: {
          whatMustNotBeLost: 'residue',
        },
        appliesToNextProposal: false,
        status: 'candidate',
      },
    });
    const [updatedTrace] = markLatestTraceCardPartial([traceCard], 'This is useful, but not full success.');

    expect(updatedTrace.lessonCandidate).toMatchObject({
      lessonType: 'stop_condition',
      userWords: 'This is useful, but not full success.',
      status: 'candidate',
    });
  });
});
