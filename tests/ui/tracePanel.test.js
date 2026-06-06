import { describe, expect, it } from 'vitest';

import { createTracePanelContent } from '../../src/ui/tracePanel.js';

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
});
