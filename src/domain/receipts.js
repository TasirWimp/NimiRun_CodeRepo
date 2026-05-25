import { DECISIONS } from './rules.js';

export const RECEIPT_CLASSIFICATIONS = Object.freeze({
    LOOKS_RIGHT: 'looks right',
    WRONG_CATEGORY: 'wrong category',
    SHOULD_HAVE_ASKED: 'should have asked',
    BLOCK_TOOL_NEXT_TIME: 'block this tool next time',
});

export const RECEIPT_CLASSIFICATION_VALUES = Object.freeze(Object.values(RECEIPT_CLASSIFICATIONS));

function getReceiptId(proposal, id) {
    return id || `receipt-${proposal.id}`;
}

function createRuleResult(decision) {
    const checkResults = Object.fromEntries(
        Object.entries(decision.checks || {}).map(([key, check]) => [
            key,
            {
                passed: check.passed,
                label: check.label,
            },
        ]),
    );

    return {
        decision: decision.decision,
        passed: decision.decision !== DECISIONS.BLOCKED,
        checkResults,
    };
}

export function createReceipt({
    proposal,
    tool,
    allowance,
    decision,
    id = null,
    createdAt = new Date().toISOString(),
}) {
    if (!proposal) {
        throw new TypeError('A proposal is required to create a receipt.');
    }

    if (!tool) {
        throw new TypeError('A tool is required to create a receipt.');
    }

    if (!allowance) {
        throw new TypeError('An allowance is required to create a receipt.');
    }

    if (!decision) {
        throw new TypeError('A rule decision is required to create a receipt.');
    }

    return {
        id: getReceiptId(proposal, id),
        proposalId: proposal.id,
        toolId: tool.id,
        toolName: tool.name,
        cost: proposal.cost,
        currency: proposal.currency || tool.currency || allowance.currency,
        allowanceId: allowance.id,
        allowanceName: allowance.name,
        reason: proposal.reason,
        decision: decision.decision,
        ruleResult: createRuleResult(decision),
        outcome: proposal.outcome,
        userClassification: null,
        createdAt,
    };
}

export function classifyReceipt(receipt, classification) {
    if (!RECEIPT_CLASSIFICATION_VALUES.includes(classification)) {
        throw new RangeError(`Unknown receipt classification: ${classification}`);
    }

    return {
        ...receipt,
        userClassification: classification,
    };
}
