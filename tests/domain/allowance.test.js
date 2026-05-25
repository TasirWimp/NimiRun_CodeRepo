import { describe, expect, it } from 'vitest';

import {
  createAllowanceCheck,
  getAvailableBalance,
  hasSufficientBalance,
} from '../../src/domain/allowance.js';
import { createMvpScenario } from '../../src/game/mvpScenario.js';

describe('allowance checks', () => {
  it('calculates available balance after reserved amount', () => {
    expect(getAvailableBalance({ balance: 1, reservedAmount: 0.25 })).toBe(0.75);
  });

  it('passes when the allowance can cover the proposal cost', () => {
    const { allowance, proposals } = createMvpScenario();

    expect(hasSufficientBalance(allowance, proposals.cartScout.cost)).toBe(true);
  });

  it('fails when reserved funds leave too little available balance', () => {
    const allowance = { balance: 1, reservedAmount: 0.75 };

    expect(hasSufficientBalance(allowance, 0.4)).toBe(false);
  });

  it('returns a readable allowance check result', () => {
    const { allowance, proposals } = createMvpScenario();

    expect(createAllowanceCheck(allowance, proposals.cartScout.cost)).toMatchObject({
      passed: true,
      availableBalance: 5,
      requiredAmount: 0.4,
      currency: 'NIM',
    });
  });
});
