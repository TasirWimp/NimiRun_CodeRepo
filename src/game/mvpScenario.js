import { createActionProposal } from '../domain/proposals.js';

export function createMvpScenario() {
    const helper = {
        id: 'helper-pocket-bot',
        name: 'Pocket Bot',
        ruleId: 'rule-ai-tools-helper-route',
        currentProposalId: 'proposal-tool-scout',
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
        id: 'rule-ai-tools-helper-route',
        helperId: helper.id,
        summary: 'Pocket Bot may spend from AI Tools, max 1 NIM per action, only on approved helper tools, and never for checkout or payment info.',
        allowedAllowanceIds: [allowance.id],
        allowedToolCategories: ['helper-route'],
        maxCostPerAction: 1,
        approvalRule: {
            mode: 'auto-approve-below-threshold',
            autoApproveMaxCost: 1,
        },
    };

    const tools = {
        toolScout: {
            id: 'tool-scout',
            name: 'Tool Scout',
            category: 'helper-route',
            cost: 0.4,
            currency: 'NIM',
            approved: true,
        },
    };

    const proposals = {
        toolScout: createActionProposal({
            id: 'proposal-tool-scout',
            helperId: helper.id,
            toolId: tools.toolScout.id,
            allowanceId: allowance.id,
            cost: tools.toolScout.cost,
            currency: tools.toolScout.currency,
            reason: 'Use a paid helper route to prepare a reviewable result draft.',
            outcome: 'Result draft only, no checkout or payment info.',
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
