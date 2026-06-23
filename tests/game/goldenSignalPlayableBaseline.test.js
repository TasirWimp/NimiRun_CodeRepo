import { describe, expect, it } from 'vitest';

import {
  applyArenaAction,
  approvePendingProposal,
} from '../../src/domain/guidanceLoop.js';
import { TRACE_CARD_TYPES } from '../../src/domain/traces.js';
import {
  applyRouteProposalResult,
  createRouteProposalRuntimeInput,
} from '../../src/game/routeProposalRuntime.js';
import { createPocketBotState } from '../../src/game/pocketBotState.js';
import { getNodeById } from '../../src/game/resourceMapScenario.js';
import { createMarketSignalScoutScenario } from '../../src/game/scenarios/marketSignalScoutScenario.js';
import { MARKET_WORLD_ACTIONS } from '../../src/game/scenarios/marketWorldLevels.js';
import {
  createFinishPanelContent,
  createTracePanelContent,
  formatTraceArchiveLabel,
} from '../../src/ui/tracePanel.js';
import { createWitnessPanelContent } from '../../src/ui/witnessPanel.js';

function createGoldenSignalState() {
  return createPocketBotState(createMarketSignalScoutScenario());
}

function createBoundedSupportProposal(overrides = {}) {
  return {
    mode: 'openai',
    model: 'baseline-freeze-model',
    proposal: {
      moveType: 'inspect',
      targetNodeId: 'support-check',
      reason: 'Inspect support before acting on the bright signal.',
      resourceCost: {
        moveType: 'inspect',
        botAttention: 99,
        userGuidance: 99,
        contextSlots: 0,
      },
      consideredAlternatives: [
        {
          move: 'act:bright-signal',
          whyNotSelected: 'Acting now leaves support, exit, and crowd pressure unresolved.',
        },
      ],
      cutPrice: {
        reveals: ['support clue', 'Futures Gate headline witness'],
        suppresses: ['entering on signal brightness alone'],
        leavesResidue: ['exit friction still unknown', 'FOMO pressure still unknown'],
      },
      stopCondition: 'Stop after support is inspected; trace remaining unknowns.',
      ...overrides,
    },
  };
}

function expectMoveTraceOnly(traceCard) {
  expect(traceCard).toMatchObject({
    type: TRACE_CARD_TYPES.MOVE,
  });
  expect(traceCard.resourceSpend).not.toHaveProperty('amount');
  expect(traceCard.resourceSpend).not.toHaveProperty('currency');
  expect(traceCard.acceptedMove.moveType).not.toBe('pocket-status');
}

function expectNoWalletOrTradingAuthority(state) {
  for (const traceCard of state.traceCards) {
    expectMoveTraceOnly(traceCard);
  }

  const authoritySurface = JSON.stringify({
    guidanceTrace: state.guidanceTrace,
    traceCards: state.traceCards.map((traceCard) => ({
      type: traceCard.type,
      acceptedMove: traceCard.acceptedMove,
      resourceSpend: traceCard.resourceSpend,
      outcome: traceCard.outcome,
    })),
  });

  expect(authoritySurface).not.toMatch(
    /pocket-status|wallet authority|checkout|payment execution|mainnet spend|sendBasicTransaction|execute trade|brokerage/i
  );
}

describe('Golden Signal playable baseline regression', () => {
  it('freezes Ask Hidden -> Wide Scan -> Approve -> Trace', () => {
    const asked = applyArenaAction(
      createGoldenSignalState(),
      MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN
    );

    expect(asked.mapState.resources.botAttention.current).toBe(10);
    expect(asked.traceCards).toHaveLength(0);
    expect(asked.pendingProposal).toMatchObject({
      moveType: 'act',
      targetNodeId: 'bright-signal',
    });
    expect(asked.guidancePanel.title).toBe('Ask Hidden');
    expect(asked.guidancePanel.lines.join(' ')).toContain('support depth still unknown');
    expect(asked.guidancePanel.lines.join(' ')).toContain('exit friction still unknown');
    expect(asked.guidancePanel.lines.join(' ')).toContain('FOMO pressure still unknown');

    const prepared = applyArenaAction(asked, MARKET_WORLD_ACTIONS.WIDE_SCAN);

    expect(prepared.mapState.resources.botAttention.current).toBe(10);
    expect(prepared.traceCards).toHaveLength(0);
    expect(prepared.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'fomo-pressure',
      resourceCost: {
        botAttention: 1,
        userGuidance: 1,
      },
    });
    expect(prepared.guidancePanel.title).toBe('Wide Scan Prepared');
    expect(prepared.guidancePanel.lines.join(' ')).toContain(
      'Approve controls Bot Attention spending'
    );

    const accepted = approvePendingProposal(prepared);
    const state = accepted.state;
    const traceCard = state.traceCards.at(-1);
    const tracePanel = createTracePanelContent(traceCard);

    expect(accepted.applied).toBe(true);
    expect(state.mapState.resources.botAttention.current).toBe(9);
    expect(state.mapState.resources.userGuidance.prompts).toBe(1);
    expect(state.mapState.revealedEvidence).toContain('fomo-pressure-named');
    expect(formatTraceArchiveLabel(state.traceCards)).toBe('1 trace card(s) | Open run');
    expect(traceCard).toMatchObject({
      acceptedMove: {
        moveType: 'inspect',
        targetNodeId: 'fomo-pressure',
      },
      resourceSpend: {
        botAttention: 1,
        userGuidance: 1,
      },
      landfallStatus: 'open-run',
    });
    expect(traceCard.revealed).toContain('fomo-pressure-named');
    expect(traceCard.residueCarriedForward).toContain('safe finish conditions unknown');
    expect(tracePanel.title).toBe('Trace 1: Open run');
    expect(tracePanel.lines.join(' ')).toContain('Move: inspect -> fomo-pressure');
    expectNoWalletOrTradingAuthority(state);
  });

  it('freezes Support Check -> Approve -> Historic Witness -> Trace Archive', () => {
    const prepared = applyArenaAction(
      createGoldenSignalState(),
      MARKET_WORLD_ACTIONS.CHECK_SUPPORT
    );
    const supportNode = getNodeById(prepared.mapState.scenario, 'support-check');
    const witnessPanel = createWitnessPanelContent(supportNode.witnessIds);

    expect(prepared.mapState.resources.botAttention.current).toBe(10);
    expect(prepared.traceCards).toHaveLength(0);
    expect(prepared.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'support-check',
      resourceCost: {
        botAttention: 2,
        userGuidance: 1,
      },
    });
    expect(witnessPanel).toMatchObject({
      title: 'Historic Witness',
      lines: expect.arrayContaining([
        'Title: Cboe Plans December 10 Launch of Bitcoin Futures Trading',
        'Game: Futures Gate makes the signal brighter, but the route may be crowded.',
        'Not: trading advice',
      ]),
    });

    const accepted = approvePendingProposal(prepared);
    const state = accepted.state;
    const traceCard = state.traceCards.at(-1);
    const tracePanel = createTracePanelContent(traceCard);

    expect(accepted.applied).toBe(true);
    expect(state.mapState.resources.botAttention.current).toBe(8);
    expect(state.mapState.resources.userGuidance.prompts).toBe(1);
    expect(state.mapState.revealedEvidence).toEqual([
      'signal-support-inspected',
      'futures-gate-context-seen',
    ]);
    expect(formatTraceArchiveLabel(state.traceCards)).toBe('1 trace card(s) | Open run');
    expect(traceCard).toMatchObject({
      acceptedMove: {
        moveType: 'inspect',
        targetNodeId: 'support-check',
      },
      resourceSpend: {
        botAttention: 2,
        userGuidance: 1,
      },
      landfallStatus: 'open-run',
    });
    expect(traceCard.revealed).toContain('futures-gate-context-seen');
    expect(traceCard.residueCarriedForward).toContain('exit friction still unknown');
    expect(traceCard.residueCarriedForward).toContain('FOMO pressure still unknown');
    expect(tracePanel.title).toBe('Trace 1: Open run');
    expect(tracePanel.lines.join(' ')).toContain('Move: inspect -> support-check');
    expectNoWalletOrTradingAuthority(state);
  });

  it('freezes Ask Bot -> bounded proposal -> Approve without spending before approval', () => {
    const start = createGoldenSignalState();
    const runtimeInput = createRouteProposalRuntimeInput(start, {
      sessionId: 'baseline-freeze',
    });

    expect(runtimeInput.allowedMoves).toEqual(['inspect', 'ask', 'act', 'skip']);
    expect(runtimeInput.allowedMoves).not.toContain('remember');
    expect(runtimeInput.targetNodeIds).toContain('support-check');
    expect(runtimeInput.carrier.residue).toContain('support depth still unknown');

    const proposed = applyRouteProposalResult(start, createBoundedSupportProposal());

    expect(proposed.mapState.resources.botAttention.current).toBe(10);
    expect(proposed.traceCards).toHaveLength(0);
    expect(proposed.pendingProposal).toMatchObject({
      moveType: 'inspect',
      targetNodeId: 'support-check',
      resourceCost: {
        botAttention: 2,
        userGuidance: 1,
      },
    });
    expect(proposed.guidancePanel.title).toBe('Bot Proposal Updated');
    expect(proposed.guidanceTrace.at(-1)).toMatchObject({
      action: 'ask-bot',
      relayMode: 'openai',
      relayModel: 'baseline-freeze-model',
      moveType: 'inspect',
      targetNodeId: 'support-check',
    });

    const accepted = approvePendingProposal(proposed);
    const state = accepted.state;
    const traceCard = state.traceCards.at(-1);

    expect(accepted.applied).toBe(true);
    expect(state.mapState.resources.botAttention.current).toBe(8);
    expect(state.mapState.resources.userGuidance.prompts).toBe(1);
    expect(state.mapState.revealedEvidence).toContain('signal-support-inspected');
    expect(traceCard).toMatchObject({
      acceptedMove: {
        moveType: 'inspect',
        targetNodeId: 'support-check',
      },
      resourceSpend: {
        botAttention: 2,
        userGuidance: 1,
      },
      landfallStatus: 'open-run',
    });
    expectNoWalletOrTradingAuthority(state);
  });

  it('renders direct bright-signal entry as a false finish card with hindsight', () => {
    const accepted = approvePendingProposal(createGoldenSignalState());
    const state = accepted.state;
    const traceCard = state.traceCards.at(-1);
    const finishPanel = createFinishPanelContent(traceCard, {
      hindsightCard: state.mapState.scenario.marketWorldRuntime.hindsightCard,
    });

    expect(accepted.applied).toBe(true);
    expect(formatTraceArchiveLabel(state.traceCards)).toBe('1 trace card(s) | False finish');
    expect(finishPanel).toMatchObject({
      title: 'False finish',
      lines: expect.arrayContaining([
        'Move: act -> bright-signal',
        'Checked: none',
        'Not: trading advice',
      ]),
    });
    expect(finishPanel.lines.join(' ')).toContain('Hindsight: The bright signal belonged');
    expect(finishPanel.lines.join(' ')).toContain('support depth still unknown');
    expectNoWalletOrTradingAuthority(state);
  });
});
