export function createActionProposal({
    id,
    helperId,
    toolId,
    allowanceId,
    cost,
    currency = 'NIM',
    reason,
    outcome,
    checkoutRequested = false,
    createdAt = null,
    status = 'proposed',
}) {
    return {
        id,
        helperId,
        toolId,
        allowanceId,
        cost,
        currency,
        reason,
        outcome,
        checkoutRequested,
        createdAt,
        status,
    };
}
