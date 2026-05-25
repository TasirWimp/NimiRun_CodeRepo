import { createActionProposal } from '../domain/proposals.js';

export function createMvpScenario() {
    const helper = {
        id: 'helper-pocket-bot',
        name: 'Pocket Bot',
        ruleId: 'rule-ai-tools-cart-prep',
        currentProposalId: 'proposal-cart-scout',
        state: 'ready',
    };

    const allowance = {
        id: 'allowance-ai-tools',
        name: 'AI Tools',
        balance: 5,
        currency: 'NIM',
        reservedAmount: 0,
        fundingMode: 'simulated-prepaid',
    };

    const rule = {
        id: 'rule-ai-tools-cart-prep',
        helperId: helper.id,
        summary: 'Pocket Bot may spend from AI Tools, max 1 NIM per action, only on approved cart-prep helper tools, and never for checkout.',
        allowedAllowanceIds: [allowance.id],
        allowedToolCategories: ['cart-prep'],
        maxCostPerAction: 1,
        approvalRule: {
            mode: 'auto-approve-below-threshold',
            autoApproveMaxCost: 1,
        },
    };

    const tools = {
        cartScout: {
            id: 'tool-cart-scout',
            name: 'Cart Scout',
            category: 'cart-prep',
            cost: 0.4,
            currency: 'NIM',
            approved: true,
        },
    };

    const proposals = {
        cartScout: createActionProposal({
            id: 'proposal-cart-scout',
            helperId: helper.id,
            toolId: tools.cartScout.id,
            allowanceId: allowance.id,
            cost: tools.cartScout.cost,
            currency: tools.cartScout.currency,
            reason: 'Find matching grocery items and prepare a reviewable cart draft.',
            outcome: 'Cart draft only, no checkout.',
            checkoutRequested: false,
            createdAt: '2026-05-25T00:00:00.000Z',
        }),
    };

    return {
        helper,
        allowance,
        rule,
        tools,
        proposals,
    };
}
