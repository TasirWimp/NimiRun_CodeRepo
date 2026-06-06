import { describe, expect, it } from 'vitest';

import {
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
import { createResourceMapScenario } from '../../src/game/resourceMapScenario.js';

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
});
