const MONEY_DECIMAL_PLACES = 6;

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
