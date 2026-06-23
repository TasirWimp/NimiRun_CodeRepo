import { describe, expect, it } from 'vitest';

import {
  createFinishPanelContent,
  createTracePanelContent,
} from '../../src/ui/tracePanel.js';

describe('trace panel formatting', () => {
  it('labels pocket trace value as pocket status rather than cost', () => {
    const panel = createTracePanelContent({
      type: 'pocket',
      sequence: 1,
      landfallStatus: 'open-run',
      acceptedMove: {
        moveType: 'pocket-status',
        label: 'Nimiq Pocket',
      },
      resourceSpend: {
        amount: 23,
        currency: 'NIM',
      },
      revealed: ['Nimiq Pay testnet status'],
      suppressedOrNotChecked: ['No send or sign requested.'],
      residueCarriedForward: ['Pocket value is not Bot Attention spend.'],
      reentryNote: 'Pocket status checked.',
    });

    expect(panel.lines[0]).toBe('Move: pocket-status -> Nimiq Pocket | Pocket: 23 NIM');
    expect(panel.lines[0]).not.toContain('Cost:');
  });

  it('does not create a finish card for open traces', () => {
    const panel = createFinishPanelContent({
      sequence: 1,
      landfallStatus: 'open-run',
      acceptedMove: {
        moveType: 'inspect',
        targetNodeId: 'support-check',
      },
    }, {
      hindsightCard: {
        lockedUntilFinish: true,
        withheldFromProposalEngine: true,
        playerFacingSummary: 'Hidden later outcome.',
      },
    });

    expect(panel).toBeNull();
  });

  it('renders false finish with unlocked hindsight after finish judgment', () => {
    const panel = createFinishPanelContent({
      sequence: 1,
      landfallStatus: 'false-finish',
      acceptedMove: {
        moveType: 'act',
        targetNodeId: 'bright-signal',
      },
      revealed: [],
      worldRelationRevealed: [],
      stillUnknown: [
        'support depth still unknown',
        'exit friction still unknown',
        'FOMO pressure still unknown',
      ],
      residueCarriedForward: ['support depth still unknown'],
      reentryNote:
        'False finish: the bright signal was entered before support, exit, or crowd pressure was checked.',
    }, {
      hindsightCard: {
        lockedUntilFinish: true,
        withheldFromProposalEngine: true,
        playerFacingSummary:
          'The bright signal belonged to a larger moment of crowd pressure, event gates, volatility, and reversal risk.',
      },
    });

    expect(panel).toMatchObject({
      title: 'False finish',
      lines: expect.arrayContaining([
        'Move: act -> Bright Signal',
        'Checked: none | Still hidden: support depth still unknown, exit friction still unknown, +1 more',
        'Not: trading advice',
      ]),
    });
    expect(panel.lines.join(' ')).toContain('Hindsight: The bright signal belonged');
    expect(panel.lines.join(' ')).toContain('support depth still unknown');
  });

  it('renders market-world trace details with player-facing relation language', () => {
    const panel = createTracePanelContent({
      sequence: 1,
      landfallStatus: 'open-run',
      acceptedMove: {
        moveType: 'inspect',
        targetNodeId: 'fomo-pressure',
        label: 'FOMO Pressure',
      },
      resourceSpend: {
        botAttention: 1,
        userGuidance: 1,
      },
      revealed: ['fomo-pressure-named'],
      suppressedOrNotChecked: ['entering on signal brightness alone'],
      residueCarriedForward: [
        'safe finish conditions unknown',
        'support depth still unknown',
        'exit friction still unknown',
      ],
      worldRelationRevealed: ['signal_to_crowd'],
      worldRelationsResidualized: ['signal_to_support', 'signal_to_exit'],
      stillUnknown: [
        'event pressure may be overread',
        'exit friction still unknown',
        'support depth still unknown',
      ],
      returnCondition: 'Stop after the wide scan reveal; do not call the route safe yet.',
      sourceWitnessIds: ['btc_fomo_pressure_example'],
      reentryNote: 'Run remains open because no finish action has been approved.',
    });

    expect(panel).toMatchObject({
      title: 'Trace 1: Open run',
      lines: [
        'Move: inspect -> FOMO Pressure | Cost: 1 Bot Attention, 1 User Guidance',
        'Checked: FOMO pressure | Witness: 1 historic source',
        'Still hidden: support depth still unknown, exit friction still unknown, +1 more',
        'Residue: support depth still unknown, exit friction still unknown, +1 more',
        'Return: Stop after the wide scan reveal; do not call the route safe yet.',
      ],
    });
    expect(panel.lines.join(' ')).not.toMatch(/signal_to_|source ocean|cut|landfall|re-entry/i);
  });

  it('renders safe finish cards from finish-judgment relation evidence', () => {
    const panel = createFinishPanelContent({
      sequence: 4,
      landfallStatus: 'safe-finish',
      acceptedMove: {
        moveType: 'act',
        targetNodeId: 'bright-signal',
      },
      finishCheckedRelations: [
        'signal_to_support',
        'signal_to_exit',
        'signal_to_crowd',
      ],
      stillUnknown: [],
      residueCarriedForward: [],
      reentryNote: 'Safe finish: support, exit, and crowd pressure were checked before entering.',
    });

    expect(panel).toMatchObject({
      title: 'Safe finish',
      lines: expect.arrayContaining([
        'Move: act -> Bright Signal',
        'Checked: Support depth, Exit friction, +1 more | Still hidden: none',
        'Not: trading advice',
      ]),
    });
  });
});
