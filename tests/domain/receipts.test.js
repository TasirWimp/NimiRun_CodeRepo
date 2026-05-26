import { describe, expect, it } from 'vitest';

import {
  RECEIPT_CLASSIFICATION_VALUES,
  RECEIPT_CLASSIFICATIONS,
  classifyReceipt,
  createReceipt,
} from '../../src/domain/receipts.js';
import { DECISIONS, evaluateRuleDecision } from '../../src/domain/rules.js';
import { createMvpScenario } from '../../src/game/mvpScenario.js';

function createApprovedReceipt() {
  const scenario = createMvpScenario();
  const proposal = scenario.proposals.toolScout;
  const tool = scenario.tools.toolScout;
  const decision = evaluateRuleDecision({
    rule: scenario.rule,
    allowance: scenario.allowance,
    tool,
    proposal,
  });

  return createReceipt({
    proposal,
    tool,
    allowance: scenario.allowance,
    decision,
    createdAt: '2026-05-25T12:00:00.000Z',
  });
}

describe('receipts', () => {
  it('creates a deterministic receipt for an executed proposal', () => {
    const receipt = createApprovedReceipt();

    expect(receipt).toMatchObject({
      id: 'receipt-proposal-tool-scout',
      proposalId: 'proposal-tool-scout',
      createdAt: '2026-05-25T12:00:00.000Z',
      userClassification: null,
    });
  });

  it('records tool, cost, allowance, reason, decision, and outcome', () => {
    const receipt = createApprovedReceipt();

    expect(receipt).toMatchObject({
      toolId: 'tool-scout',
      toolName: 'Tool Scout',
      cost: 0.4,
      currency: 'NIM',
      allowanceId: 'allowance-ai-tools',
      allowanceName: 'AI Tools',
      reason: 'Use a paid helper route to prepare a reviewable result draft.',
      decision: DECISIONS.AUTO_APPROVED,
      outcome: 'Result draft only, no checkout or payment info.',
    });
    expect(receipt.ruleResult).toMatchObject({
      decision: DECISIONS.AUTO_APPROVED,
      passed: true,
    });
  });

  it('accepts each MVP receipt classification', () => {
    const receipt = createApprovedReceipt();

    for (const classification of RECEIPT_CLASSIFICATION_VALUES) {
      expect(classifyReceipt(receipt, classification)).toMatchObject({
        id: receipt.id,
        userClassification: classification,
      });
    }
  });

  it('rejects invalid receipt classifications', () => {
    const receipt = createApprovedReceipt();

    expect(() => classifyReceipt(receipt, 'seems fine')).toThrow(RangeError);
  });

  it('keeps the receipt history fields unchanged when classified', () => {
    const receipt = createApprovedReceipt();
    const classifiedReceipt = classifyReceipt(receipt, RECEIPT_CLASSIFICATIONS.SHOULD_HAVE_ASKED);

    expect(classifiedReceipt).toMatchObject({
      proposalId: receipt.proposalId,
      cost: receipt.cost,
      decision: receipt.decision,
      outcome: receipt.outcome,
    });
    expect(receipt.userClassification).toBe(null);
  });
});
