import { describe, expect, it } from 'vitest';

import {
  applyArenaAction,
  approvePendingProposal,
  createGuidanceLoopState,
  createPendingProposal,
  markPartialResult,
  redirectPendingProposal,
  redirectToInspectFirst,
  requestUserGuidance,
  showRemainingUnknowns,
  showWhyThisRoute,
} from '../../src/domain/guidanceLoop.js';
import { createLossyMapState } from '../../src/domain/lossyMap.js';
import { FINISH_STATUSES } from '../../src/domain/finishJudgment.js';
import { MARKET_WORLD_RUNTIME_RELATION_STATUS } from '../../src/domain/marketWorldRuntime.js';
import { createPocketBotState } from '../../src/game/pocketBotState.js';
import { createResourceMapScenario } from '../../src/game/resourceMapScenario.js';
import { createMarketSignalScoutScenario } from '../../src/game/scenarios/marketSignalScoutScenario.js';
import { MARKET_WORLD_ACTIONS } from '../../src/game/scenarios/marketWorldLevels.js';

function createState(overrides = {}) {
  const scenario = createResourceMapScenario();

  return createGuidanceLoopState({
    mapState: createLossyMapState(scenario, overrides.mapStateOverrides || {}),
    pendingProposal:
      overrides.pendingProposal ||
      createPendingProposal({
        moveType: 'inspect',
        targetNodeId: 'shortcut-bridge',
        reason: 'Inspect the shortcut before acting.',
        consideredAlternatives: [
          {
            move: 'act:false-gate',
            whyNotSelected: 'Acting now could leave warning residue unchecked.',
          },
        ],
        cutPrice: {
          reveals: ['shortcut risk'],
          suppresses: ['safe finish claim'],
          leavesResidue: ['long route safety unknown'],
        },
      }),
  });
}

function createMarketState() {
  return createPocketBotState(createMarketSignalScoutScenario());
}

describe('guidance loop domain rules', () => {
  it('approved inspect move spends Bot Attention and reveals map state', () => {
    const state = createState();
    const result = approvePendingProposal(state);

    expect(result.applied).toBe(true);
    expect(result.state.mapState.resources.botAttention.current).toBe(8);
    expect(result.state.mapState.inspectedNodeIds).toContain('shortcut-bridge');
    expect(result.state.mapState.revealedEvidence).toContain('shortcut-risk-revealed');
    expect(result.state.guidanceTrace.at(-1)).toMatchObject({
      action: 'approve',
      moveType: 'inspect',
      targetNodeId: 'shortcut-bridge',
    });
    expect(result.state.traceCards.at(-1)).toMatchObject({
      acceptedMove: {
        moveType: 'inspect',
        targetNodeId: 'shortcut-bridge',
      },
      resourceSpend: {
        botAttention: 2,
      },
    });
  });

  it('redirect updates the pending move without spending the original cost', () => {
    const state = createState();
    const redirected = redirectPendingProposal(state, {
      moveType: 'inspect',
      targetNodeId: 'warning-signal',
      reason: 'User wants the warning inspected first.',
    });

    expect(redirected.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'warning-signal',
    });
    expect(redirected.mapState.resources.botAttention.current).toBe(10);
    expect(redirected.guidanceTrace.at(-1)).toMatchObject({
      action: 'redirect',
      targetNodeId: 'warning-signal',
    });
  });

  it('ask-user actions are represented as user guidance prompts', () => {
    const state = createState();
    const result = requestUserGuidance(state, 'Ask which route should preserve attention.');

    expect(result.applied).toBe(true);
    expect(result.state.mapState.resources.userGuidance.prompts).toBe(1);
    expect(result.state.guidancePanel).toMatchObject({
      title: 'User Guidance',
    });
  });

  it('approves pending ask proposals without requiring a node-local ask move', () => {
    const state = createState({
      pendingProposal: createPendingProposal({
        moveType: 'ask',
        targetNodeId: 'shortcut-bridge',
        reason: 'Ask the user how much attention to spend before moving.',
        cutPrice: {
          reveals: ['user preference'],
          suppresses: ['autonomous closure'],
          leavesResidue: ['map uncertainty remains'],
        },
      }),
    });
    const result = approvePendingProposal(state);

    expect(result.applied).toBe(true);
    expect(result.state.mapState.resources.botAttention.current).toBe(9);
    expect(result.state.mapState.resources.userGuidance.prompts).toBe(1);
    expect(result.state.guidanceTrace.at(-1)).toMatchObject({
      action: 'ask-user',
      moveType: 'ask',
      targetNodeId: 'shortcut-bridge',
    });
  });

  it('asking why-this-route exposes the proposal rationale and considered alternative', () => {
    const state = createState();
    const nextState = showWhyThisRoute(state);

    expect(nextState.guidancePanel.title).toBe('Why this route?');
    expect(nextState.guidancePanel.lines.join(' ')).toContain('Inspect the shortcut');
    expect(nextState.guidancePanel.lines.join(' ')).toContain('Acting now could leave warning residue unchecked.');
  });

  it('asking what-remains-unknown exposes proposal residue and map residue', () => {
    const state = createState();
    const nextState = showRemainingUnknowns(state);

    expect(nextState.guidancePanel.title).toBe('What remains unknown?');
    expect(nextState.guidancePanel.lines.join(' ')).toContain('long route safety unknown');
    expect(nextState.guidancePanel.lines.join(' ')).toContain('false finish risk');
  });

  it('inspect-first changes an action proposal into a probe proposal when allowed', () => {
    const state = createState({
      pendingProposal: createPendingProposal({
        moveType: 'act',
        targetNodeId: 'false-gate',
        reason: 'Try the goal-looking gate.',
        cutPrice: {
          reveals: ['whether the gate accepts arrival'],
          suppresses: ['warning check'],
          leavesResidue: ['warning not inspected'],
        },
      }),
    });
    const redirected = redirectToInspectFirst(state);

    expect(redirected.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'false-gate',
    });
    expect(redirected.mapState.resources.botAttention.current).toBe(10);
  });

  it('mark-partial records that a useful result is not full success', () => {
    const state = createState();
    const nextState = markPartialResult(state, 'Shortcut inspected, but long route safety remains unknown.');

    expect(nextState.partialResults).toEqual([
      'Shortcut inspected, but long route safety remains unknown.',
    ]);
    expect(nextState.guidanceTrace.at(-1)).toMatchObject({
      action: 'mark-partial',
    });
    expect(nextState.traceCards).toHaveLength(0);
  });

  it('mark-partial updates the latest trace card when a move was already accepted', () => {
    const accepted = approvePendingProposal(createState()).state;
    const nextState = markPartialResult(accepted, 'Shortcut inspected, but long route safety remains unknown.');

    expect(nextState.traceCards.at(-1)).toMatchObject({
      landfallStatus: 'partial-finish',
      outcome: 'Shortcut inspected, but long route safety remains unknown.',
    });
  });

  it('creates a cut-preference session lesson and applies it to the next proposal', () => {
    const corrected = redirectToInspectFirst(createState({
      pendingProposal: createPendingProposal({
        moveType: 'act',
        targetNodeId: 'false-gate',
        reason: 'Try the goal-looking gate.',
        cutPrice: {
          reveals: ['whether the gate accepts arrival'],
          suppresses: ['warning check'],
          leavesResidue: ['warning not inspected'],
        },
      }),
    }));
    const accepted = approvePendingProposal(corrected).state;

    expect(accepted.sessionLesson).toMatchObject({
      lessonType: 'cut_preference',
      appliesToNextProposal: true,
      status: 'applied',
    });
    expect(accepted.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'warning-signal',
    });
    expect(accepted.pendingProposal.reason).toContain("This run's lesson");
    expect(accepted.pendingProposal.reason).not.toContain('persistent');
  });

  it('creates a residue-rule lesson that carries unresolved residue into the next proposal', () => {
    const redirected = redirectPendingProposal(createState(), {
      moveType: 'inspect',
      targetNodeId: 'shortcut-bridge',
      reason: 'Carry the long route residue forward before acting.',
    });
    const accepted = approvePendingProposal(redirected).state;

    expect(accepted.sessionLesson).toMatchObject({
      lessonType: 'residue_rule',
    });
    expect(accepted.sessionLesson.operationalReading.whatMustNotBeLost).toContain('long route safety');
    expect(accepted.pendingProposal.cutPrice.leavesResidue.join(' ')).toContain('safe finish');
  });

  it('mark-partial creates a stop-condition session lesson for the next proposal', () => {
    const accepted = approvePendingProposal(createState()).state;
    const nextState = markPartialResult(accepted, 'Shortcut inspected, but this is not full success.');

    expect(nextState.sessionLesson).toMatchObject({
      lessonType: 'stop_condition',
      userWords: 'Shortcut inspected, but this is not full success.',
      appliesToNextProposal: true,
    });
    expect(nextState.pendingProposal.reason).toContain('not full success');
  });

  it('does not persist session lessons when a fresh guidance state is created', () => {
    const accepted = approvePendingProposal(redirectToInspectFirst(createState())).state;
    const fresh = createState();

    expect(accepted.sessionLesson).not.toBeNull();
    expect(fresh.sessionLesson).toBeNull();
  });

  it('illegal moves are blocked before resource state changes', () => {
    const state = createState({
      pendingProposal: createPendingProposal({
        moveType: 'inspect',
        targetNodeId: 'missing-node',
        reason: 'Invalid node.',
        cutPrice: {
          reveals: ['nothing'],
          suppresses: ['valid route'],
          leavesResidue: ['route unknown'],
        },
      }),
    });
    const result = approvePendingProposal(state);

    expect(result.applied).toBe(false);
    expect(result.state.mapState.resources.botAttention.current).toBe(10);
    expect(result.state.guidanceTrace).toHaveLength(0);
    expect(result.state.guidancePanel.title).toBe('Move blocked');
  });

  it('ask-hidden exposes market residue without spending Bot Attention', () => {
    const state = createMarketState();
    const nextState = applyArenaAction(state, MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN);

    expect(nextState.mapState.resources.botAttention.current).toBe(10);
    expect(nextState.pendingProposal).toMatchObject({
      moveType: 'act',
      targetNodeId: 'bright-signal',
    });
    expect(nextState.guidancePanel.title).toBe('Ask Hidden');
    expect(nextState.guidancePanel.lines.join(' ')).toContain('support depth still unknown');
    expect(nextState.guidancePanel.lines.join(' ')).toContain('exit friction still unknown');
    expect(nextState.guidancePanel.lines.join(' ')).toContain('FOMO pressure still unknown');
    expect(nextState.guidanceTrace.at(-1)).toMatchObject({
      action: 'arena-action',
      arenaActionId: MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN,
    });
    expect(nextState.marketWorldRuntime.relationStates.signal_to_support.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED
    );
    expect(nextState.marketWorldRuntime.relationStates.signal_to_exit.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED
    );
    expect(nextState.marketWorldRuntime.lastTransition).toMatchObject({
      phase: 'unknowns-named',
      worldRelationsResidualized: [
        'signal_to_support',
        'signal_to_exit',
        'signal_to_event',
      ],
    });
  });

  it('wide-scan prepares a FOMO/crowd inspect move and spends only after approve', () => {
    const prepared = applyArenaAction(createMarketState(), MARKET_WORLD_ACTIONS.WIDE_SCAN);

    expect(prepared.mapState.resources.botAttention.current).toBe(10);
    expect(prepared.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'fomo-pressure',
      resourceCost: {
        botAttention: 1,
        userGuidance: 1,
      },
    });
    expect(prepared.guidancePanel.lines.join(' ')).toContain('Approve controls Bot Attention spending');
    expect(prepared.marketWorldRuntime.pendingArenaAction).toMatchObject({
      id: MARKET_WORLD_ACTIONS.WIDE_SCAN,
      moveType: 'inspect',
      targetNodeId: 'fomo-pressure',
    });
    expect(prepared.marketWorldRuntime.relationStates.signal_to_crowd.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.VISIBLE
    );

    const accepted = approvePendingProposal(prepared);

    expect(accepted.applied).toBe(true);
    expect(accepted.state.mapState.resources.botAttention.current).toBe(9);
    expect(accepted.state.mapState.revealedEvidence).toContain('fomo-pressure-named');
    expect(accepted.state.traceCards.at(-1)).toMatchObject({
      acceptedMove: {
        moveType: 'inspect',
        targetNodeId: 'fomo-pressure',
      },
      resourceSpend: {
        botAttention: 1,
      },
      worldRelationRevealed: ['signal_to_crowd'],
      worldRelationsResidualized: ['signal_to_exit', 'signal_to_support'],
    });
    expect(accepted.state.marketWorldRuntime.pendingArenaAction).toBeNull();
    expect(accepted.state.marketWorldRuntime.relationStates.signal_to_crowd.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.REVEALED
    );
    expect(accepted.state.marketWorldRuntime.relationStates.signal_to_exit.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED
    );
  });

  it('check-exit prepares an exit inspect move and approval reveals exit evidence', () => {
    const prepared = applyArenaAction(createMarketState(), MARKET_WORLD_ACTIONS.CHECK_EXIT);

    expect(prepared.mapState.resources.botAttention.current).toBe(10);
    expect(prepared.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'exit-friction',
      resourceCost: {
        botAttention: 2,
        userGuidance: 1,
      },
    });

    const accepted = approvePendingProposal(prepared);

    expect(accepted.applied).toBe(true);
    expect(accepted.state.mapState.resources.botAttention.current).toBe(8);
    expect(accepted.state.mapState.revealedEvidence).toContain('exit-friction-inspected');
    expect(accepted.state.traceCards.at(-1).residueCarriedForward).toContain(
      'FOMO pressure still unknown'
    );
    expect(accepted.state.traceCards.at(-1)).toMatchObject({
      worldRelationRevealed: ['signal_to_exit'],
      worldRelationsResidualized: ['signal_to_support', 'signal_to_event'],
    });
    expect(accepted.state.marketWorldRuntime.relationStates.signal_to_exit.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.REVEALED
    );
  });

  it('support-check remains an arena action for the witness-backed judge path', () => {
    const prepared = applyArenaAction(createMarketState(), MARKET_WORLD_ACTIONS.CHECK_SUPPORT);
    const accepted = approvePendingProposal(prepared);

    expect(prepared.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'support-check',
    });
    expect(accepted.applied).toBe(true);
    expect(accepted.state.mapState.revealedEvidence).toContain('signal-support-inspected');
    expect(accepted.state.traceCards.at(-1)).toMatchObject({
      acceptedMove: {
        moveType: 'inspect',
        targetNodeId: 'support-check',
      },
      worldRelationRevealed: ['signal_to_support'],
    });
    expect(accepted.state.marketWorldRuntime.relationStates.signal_to_support.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.REVEALED
    );
  });

  it('classifies direct bright-signal entry as a relation-derived false finish', () => {
    const accepted = approvePendingProposal(createMarketState());

    expect(accepted.applied).toBe(true);
    expect(accepted.state.mapState.finishJudgment).toMatchObject({
      status: FINISH_STATUSES.FALSE,
      source: 'market-world-relations',
      unresolvedRelations: [
        'signal_to_support',
        'signal_to_exit',
        'signal_to_crowd',
      ],
    });
    expect(accepted.state.traceCards.at(-1)).toMatchObject({
      landfallStatus: FINISH_STATUSES.FALSE,
      acceptedMove: {
        moveType: 'act',
        targetNodeId: 'bright-signal',
      },
    });
  });

  it('classifies enter after named residue as partial finish instead of safe finish', () => {
    const asked = applyArenaAction(
      createMarketState(),
      MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN
    );
    const prepared = applyArenaAction(asked, MARKET_WORLD_ACTIONS.APPROVE_ENTER);
    const accepted = approvePendingProposal(prepared);

    expect(accepted.applied).toBe(true);
    expect(accepted.state.mapState.finishJudgment).toMatchObject({
      status: FINISH_STATUSES.PARTIAL,
      source: 'market-world-relations',
    });
    expect(accepted.state.traceCards.at(-1).landfallStatus).toBe(FINISH_STATUSES.PARTIAL);
  });

  it('classifies enter as safe only after support, exit, and crowd relations are checked', () => {
    const support = approvePendingProposal(
      applyArenaAction(createMarketState(), MARKET_WORLD_ACTIONS.CHECK_SUPPORT)
    ).state;
    const exit = approvePendingProposal(
      applyArenaAction(support, MARKET_WORLD_ACTIONS.CHECK_EXIT)
    ).state;
    const crowd = approvePendingProposal(
      applyArenaAction(exit, MARKET_WORLD_ACTIONS.WIDE_SCAN)
    ).state;
    const entered = approvePendingProposal(
      applyArenaAction(crowd, MARKET_WORLD_ACTIONS.APPROVE_ENTER)
    );

    expect(entered.applied).toBe(true);
    expect(entered.state.mapState.finishJudgment).toMatchObject({
      status: FINISH_STATUSES.SAFE,
      source: 'market-world-relations',
      unresolvedRelations: [],
    });
    expect(entered.state.traceCards.at(-1).landfallStatus).toBe(FINISH_STATUSES.SAFE);
  });

  it('rejects unknown arena actions without spending resources', () => {
    const state = createMarketState();
    const nextState = applyArenaAction(state, 'missing-action');

    expect(nextState.mapState.resources.botAttention.current).toBe(10);
    expect(nextState.pendingProposal).toEqual(state.pendingProposal);
    expect(nextState.guidancePanel.title).toBe('Arena action unavailable');
  });
});
