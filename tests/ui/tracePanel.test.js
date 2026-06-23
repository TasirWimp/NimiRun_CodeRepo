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
        'Move: act -> bright-signal',
        'Checked: none',
        'Not: trading advice',
      ]),
    });
    expect(panel.lines.join(' ')).toContain('Hindsight: The bright signal belonged');
    expect(panel.lines.join(' ')).toContain('support depth still unknown');
  });
});
