import { describe, expect, it } from 'vitest';

import {
  createNimiqPocketDisplay,
  formatNimiqAmount,
} from '../../src/ui/resourceMeters.js';

describe('resource meter formatting', () => {
  it('formats NIM pocket amounts safely', () => {
    expect(formatNimiqAmount(23, 'NIM')).toBe('23 NIM');
    expect(formatNimiqAmount('bad', 'NIM')).toBe('0 NIM');
  });

  it('keeps local fallback wording separate from wallet access', () => {
    const display = createNimiqPocketDisplay({
      mode: 'local-simulated',
      amount: 23,
      currency: 'NIM',
      actionLabel: 'Local',
    });

    expect(display).toEqual({
      value: '23 NIM',
      status: 'Local fallback | no wallet access',
      actionLabel: 'Local',
    });
  });

  it('summarizes explicit testnet status without payment wording', () => {
    const display = createNimiqPocketDisplay({
      mode: 'nimiq-pay',
      network: 'testnet',
      status: 'provider-ready',
      statusLabel: 'Nimiq Pay testnet status',
      amount: 23,
      currency: 'NIM',
      accountPreview: 'NQ12...0000',
      consensusEstablished: true,
      blockNumber: 12345,
      actionLabel: 'Check',
    });

    expect(display).toEqual({
      value: '23 NIM',
      status: 'Nimiq Pay testnet status | NQ12...0000 | block 12345',
      actionLabel: 'Check',
    });
    expect(display.status).not.toMatch(/send|sign|checkout|mainnet authority/i);
  });
});
