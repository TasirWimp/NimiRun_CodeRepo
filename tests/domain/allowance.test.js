import { describe, expect, it } from 'vitest';

import {
  createAllowanceCheck,
  executeAllowanceSpend,
  getAvailableBalance,
  hasSufficientBalance,
} from '../../src/domain/allowance.js';
import { DECISIONS, evaluateRuleDecision } from '../../src/domain/rules.js';
import { createMvpScenario } from '../../src/game/mvpScenario.js';

function createToolScoutDecision(overrides = {}) {
  const scenario = createMvpScenario();
  const allowance = { ...scenario.allowance, ...overrides.allowance };
  const proposal = { ...scenario.proposals.toolScout, ...overrides.proposal };
  const tool = { ...scenario.tools.toolScout, ...overrides.tool };
  const rule = { ...scenario.rule, ...overrides.rule };

  return {
    scenario,
    allowance,
    proposal,
    decision: evaluateRuleDecision({
      rule,
      allowance,
      tool,
      proposal,
    }),
  };
}

describe('allowance checks', () => {
  it('calculates available balance after reserved amount', () => {
    expect(getAvailableBalance({ balance: 1, reservedAmount: 0.25 })).toBe(0.75);
  });

  it('passes when the allowance can cover the proposal cost', () => {
    const { allowance, proposals } = createMvpScenario();

    expect(hasSufficientBalance(allowance, proposals.toolScout.cost)).toBe(true);
  });

  it('fails when reserved funds leave too little available balance', () => {
    const allowance = { balance: 1, reservedAmount: 0.75 };

    expect(hasSufficientBalance(allowance, 0.4)).toBe(false);
  });

  it('returns a readable allowance check result', () => {
    const { allowance, proposals } = createMvpScenario();

    expect(createAllowanceCheck(allowance, proposals.toolScout.cost)).toMatchObject({
      passed: true,
      availableBalance: 5,
      requiredAmount: 0.4,
      currency: 'NIM',
    });
  });
});

describe('allowance spend execution', () => {
  it('reduces the allowance balance for an approved 0.4 NIM spend', () => {
    const { allowance, proposal, decision } = createToolScoutDecision();

    const result = executeAllowanceSpend({ allowance, proposal, decision });

    expect(result).toMatchObject({
      applied: true,
      amount: 0.4,
      currency: 'NIM',
      allowance: {
        id: 'allowance-ai-tools',
        balance: 4.6,
      },
    });
    expect(allowance.balance).toBe(5);
    expect(result.allowance).not.toBe(allowance);
  });

  it('does not change the balance for a blocked proposal', () => {
    const { allowance, proposal, decision } = createToolScoutDecision({
      proposal: { checkoutRequested: true },
    });

    const result = executeAllowanceSpend({ allowance, proposal, decision });

    expect(decision.decision).toBe(DECISIONS.BLOCKED);
    expect(result).toMatchObject({
      applied: false,
      allowance: {
        balance: 5,
      },
    });
    expect(result.reason).toContain('not approved');
  });

  it('does not let an approved spend make the allowance negative', () => {
    const { proposal } = createToolScoutDecision();
    const allowance = {
      id: 'allowance-ai-tools',
      name: 'AI Tools',
      balance: 0.2,
      currency: 'NIM',
      reservedAmount: 0,
    };
    const approvedDecision = { decision: DECISIONS.AUTO_APPROVED };

    const result = executeAllowanceSpend({ allowance, proposal, decision: approvedDecision });

    expect(result).toMatchObject({
      applied: false,
      allowance: {
        balance: 0.2,
      },
    });
    expect(result.reason).toContain('Insufficient');
  });

  it('applies repeated approved spends with stable money math', () => {
    const { allowance, proposal, decision } = createToolScoutDecision();

    const firstSpend = executeAllowanceSpend({ allowance, proposal, decision });
    const secondSpend = executeAllowanceSpend({
      allowance: firstSpend.allowance,
      proposal,
      decision,
    });

    expect(secondSpend).toMatchObject({
      applied: true,
      allowance: {
        balance: 4.2,
      },
    });
  });
});
