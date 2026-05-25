const MONEY_DECIMAL_PLACES = 6;
const EXECUTABLE_DECISIONS = new Set(['auto-approved']);

export function normalizeMoneyAmount(amount) {
    return Number(Number(amount || 0).toFixed(MONEY_DECIMAL_PLACES));
}

export function getAvailableBalance(allowance) {
    return normalizeMoneyAmount((allowance?.balance || 0) - (allowance?.reservedAmount || 0));
}

export function hasSufficientBalance(allowance, requiredAmount) {
    return getAvailableBalance(allowance) >= normalizeMoneyAmount(requiredAmount);
}

export function createAllowanceCheck(allowance, requiredAmount) {
    const availableBalance = getAvailableBalance(allowance);
    const normalizedRequiredAmount = normalizeMoneyAmount(requiredAmount);
    const passed = availableBalance >= normalizedRequiredAmount;

    return {
        id: 'allowance-balance',
        label: 'Allowance balance',
        passed,
        allowanceId: allowance?.id,
        availableBalance,
        requiredAmount: normalizedRequiredAmount,
        currency: allowance?.currency,
        message: passed
            ? `${availableBalance} ${allowance?.currency} is available.`
            : `Only ${availableBalance} ${allowance?.currency} is available for a ${normalizedRequiredAmount} ${allowance?.currency} request.`,
    };
}

function cloneAllowance(allowance) {
    return {
        ...allowance,
        balance: normalizeMoneyAmount(allowance?.balance),
        reservedAmount: normalizeMoneyAmount(allowance?.reservedAmount),
    };
}

function getDecisionValue(decision) {
    return typeof decision === 'string' ? decision : decision?.decision;
}

export function executeAllowanceSpend({ allowance, proposal, decision }) {
    if (!allowance) {
        throw new TypeError('An allowance is required to execute a spend.');
    }

    if (!proposal) {
        throw new TypeError('A proposal is required to execute a spend.');
    }

    const amount = normalizeMoneyAmount(proposal.cost);
    const currency = proposal.currency || allowance.currency;
    const currentAllowance = cloneAllowance(allowance);
    const decisionValue = getDecisionValue(decision);

    if (!EXECUTABLE_DECISIONS.has(decisionValue)) {
        return {
            applied: false,
            amount,
            currency,
            proposalId: proposal.id,
            allowance: currentAllowance,
            reason: 'Spend was not approved by the rule decision.',
        };
    }

    if (!hasSufficientBalance(currentAllowance, amount)) {
        return {
            applied: false,
            amount,
            currency,
            proposalId: proposal.id,
            allowance: currentAllowance,
            reason: 'Insufficient allowance balance for this spend.',
        };
    }

    return {
        applied: true,
        amount,
        currency,
        proposalId: proposal.id,
        allowance: {
            ...currentAllowance,
            balance: normalizeMoneyAmount(currentAllowance.balance - amount),
        },
        reason: 'Spend applied to allowance.',
    };
}
