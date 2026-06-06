import { describe, expect, it } from 'vitest';

import {
  canSpendBotAttention,
  createBotAttention,
  getBotAttentionRatio,
  spendBotAttention,
} from '../../src/domain/attention.js';

describe('Bot Attention', () => {
  it('starts at the scenario budget when no current value is provided', () => {
    const attention = createBotAttention({ max: 10 });

    expect(attention).toMatchObject({
      label: 'Bot Attention',
      current: 10,
      max: 10,
    });
  });

  it('spends attention without mutating the original state', () => {
    const attention = createBotAttention({ current: 10, max: 10 });
    const result = spendBotAttention(attention, 2);

    expect(result).toMatchObject({
      applied: true,
      cost: 2,
      attention: {
        current: 8,
        max: 10,
      },
    });
    expect(attention.current).toBe(10);
  });

  it('blocks spends that would make Bot Attention negative', () => {
    const attention = createBotAttention({ current: 1, max: 10 });

    expect(canSpendBotAttention(attention, 2)).toBe(false);

    const result = spendBotAttention(attention, 2);

    expect(result).toMatchObject({
      applied: false,
      attention: {
        current: 1,
      },
    });
    expect(result.reason).toContain('Insufficient Bot Attention');
  });

  it('reports attention ratio for HUD rendering', () => {
    expect(getBotAttentionRatio({ current: 5, max: 10 })).toBe(0.5);
  });
});

