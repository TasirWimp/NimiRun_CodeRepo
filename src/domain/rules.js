import { createAllowanceCheck, normalizeMoneyAmount } from './allowance.js';

export const DECISIONS = Object.freeze({
    AUTO_APPROVED: 'auto-approved',
    NEEDS_APPROVAL: 'needs-approval',
    BLOCKED: 'blocked',
});

function createCheck({ id, label, passed, message }) {
    return {
        id,
        label,
        passed,
        message,
    };
}

function includesValue(values, value) {
    return Array.isArray(values) && values.includes(value);
}

function buildExplanation(decision, checks) {
    const failedChecks = Object.values(checks).filter((check) => !check.passed);

    if (decision === DECISIONS.AUTO_APPROVED) {
        return 'This proposal is auto-approved because the tool, cost, allowance, and no-checkout checks passed.';
    }

    if (decision === DECISIONS.NEEDS_APPROVAL) {
        return 'This proposal is allowed by the hard rule checks, but it needs user approval before spending.';
    }

    const failedMessages = failedChecks.map((check) => check.message).join(' ');
    return `This proposal is blocked. ${failedMessages}`;
}

export function evaluateRuleDecision({ rule, allowance, tool, proposal }) {
    const cost = normalizeMoneyAmount(proposal?.cost);
    const maxCostPerAction = normalizeMoneyAmount(rule?.maxCostPerAction);
    const autoApproveMaxCost = normalizeMoneyAmount(rule?.approvalRule?.autoApproveMaxCost);
    const checkoutRequested = proposal?.checkoutRequested === true;

    const checks = {
        approvedTool: createCheck({
            id: 'approved-tool',
            label: 'Approved tool',
            passed: tool?.approved === true && includesValue(rule?.allowedToolCategories, tool?.category),
            message: `${tool?.name || 'The requested tool'} is not approved for this helper rule.`,
        }),
        allowanceAllowed: createCheck({
            id: 'allowance-allowed',
            label: 'Allowed allowance',
            passed: allowance?.id === proposal?.allowanceId && includesValue(rule?.allowedAllowanceIds, proposal?.allowanceId),
            message: `${proposal?.allowanceId || 'The requested allowance'} is not allowed by this rule.`,
        }),
        costWithinMax: createCheck({
            id: 'cost-within-max',
            label: 'Max cost per action',
            passed: cost <= maxCostPerAction,
            message: `${cost} ${proposal?.currency || allowance?.currency || 'NIM'} is above the ${maxCostPerAction} ${allowance?.currency || 'NIM'} max per action.`,
        }),
        allowanceBalance: createAllowanceCheck(allowance, cost),
        noCheckoutBoundary: createCheck({
            id: 'no-checkout-boundary',
            label: 'No checkout or payment',
            passed: !checkoutRequested,
            message: 'checkout or payment attempts are blocked in the MVP.',
        }),
        autoApprovalThreshold: createCheck({
            id: 'auto-approval-threshold',
            label: 'Auto-approval threshold',
            passed: cost <= autoApproveMaxCost && rule?.approvalRule?.mode !== 'manual',
            message: `${cost} ${proposal?.currency || allowance?.currency || 'NIM'} needs approval before spending.`,
        }),
    };

    const hardChecksPassed =
        checks.approvedTool.passed &&
        checks.allowanceAllowed.passed &&
        checks.costWithinMax.passed &&
        checks.allowanceBalance.passed &&
        checks.noCheckoutBoundary.passed;

    const decision = hardChecksPassed
        ? (checks.autoApprovalThreshold.passed ? DECISIONS.AUTO_APPROVED : DECISIONS.NEEDS_APPROVAL)
        : DECISIONS.BLOCKED;

    return {
        proposalId: proposal?.id,
        decision,
        requiresUserApproval: decision === DECISIONS.NEEDS_APPROVAL,
        checks,
        explanation: buildExplanation(decision, checks),
    };
}
