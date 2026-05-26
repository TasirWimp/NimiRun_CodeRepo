import { describe, expect, it } from 'vitest';

import { DECISIONS, evaluateRuleDecision } from '../../src/domain/rules.js';
import { createMvpScenario } from '../../src/game/mvpScenario.js';

function evaluateScenario(overrides = {}) {
  const scenario = createMvpScenario();
  const rule = {
    ...scenario.rule,
    ...overrides.rule,
    approvalRule: {
      ...scenario.rule.approvalRule,
      ...overrides.rule?.approvalRule,
    },
  };
  const allowance = { ...scenario.allowance, ...overrides.allowance };
  const tool = { ...scenario.tools.toolScout, ...overrides.tool };
  const proposal = { ...scenario.proposals.toolScout, ...overrides.proposal };

  return evaluateRuleDecision({ rule, allowance, tool, proposal });
}

describe('rule decisions', () => {
  it('auto-approves the happy path Tool Scout proposal', () => {
    const decision = evaluateScenario();

    expect(decision).toMatchObject({
      proposalId: 'proposal-tool-scout',
      decision: DECISIONS.AUTO_APPROVED,
      requiresUserApproval: false,
    });
    expect(Object.values(decision.checks).every((check) => check.passed)).toBe(true);
    expect(decision.explanation).toContain('auto-approved');
  });

  it('blocks an unapproved helper tool', () => {
    const decision = evaluateScenario({
      tool: { approved: false },
    });

    expect(decision.decision).toBe(DECISIONS.BLOCKED);
    expect(decision.checks.approvedTool.passed).toBe(false);
    expect(decision.explanation).toContain('not approved');
  });

  it('blocks a proposal above the max per-action cost', () => {
    const decision = evaluateScenario({
      proposal: { cost: 1.4 },
    });

    expect(decision.decision).toBe(DECISIONS.BLOCKED);
    expect(decision.checks.costWithinMax.passed).toBe(false);
  });

  it('blocks a proposal when the allowance balance is insufficient', () => {
    const decision = evaluateScenario({
      allowance: { balance: 0.2 },
    });

    expect(decision.decision).toBe(DECISIONS.BLOCKED);
    expect(decision.checks.allowanceBalance.passed).toBe(false);
  });

  it('blocks checkout or payment attempts even when other checks pass', () => {
    const decision = evaluateScenario({
      proposal: { checkoutRequested: true },
    });

    expect(decision.decision).toBe(DECISIONS.BLOCKED);
    expect(decision.checks.noCheckoutBoundary.passed).toBe(false);
    expect(decision.explanation).toContain('checkout');
  });

  it('requires approval when the proposal is allowed but above the auto-approval threshold', () => {
    const decision = evaluateScenario({
      rule: {
        approvalRule: {
          autoApproveMaxCost: 0.25,
        },
      },
    });

    expect(decision.decision).toBe(DECISIONS.NEEDS_APPROVAL);
    expect(decision.requiresUserApproval).toBe(true);
    expect(decision.checks.autoApprovalThreshold.passed).toBe(false);
  });
});
