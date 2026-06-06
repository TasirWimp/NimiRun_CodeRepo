import { createGuidanceLoopState, createPendingProposal } from '../domain/guidanceLoop.js';
import { createLossyMapState } from '../domain/lossyMap.js';

function createPendingProposalFromPreview(preview) {
  return createPendingProposal({
    id: preview.id || 'proposal-initial-preview',
    moveType: preview.cost.moveType,
    targetNodeId: preview.targetNodeId,
    reason: preview.reason,
    resourceCost: preview.cost,
    consideredAlternatives: [
      {
        move: preview.alternative || 'ask',
        whyNotSelected: 'Kept as the safer alternative the user can inspect from the panel.',
      },
    ],
    cutPrice: {
      reveals: preview.reveals,
      suppresses: ['uninspected branches'],
      leavesResidue: preview.leavesUnknown,
    },
    stopCondition: 'Stop after the selected node is inspected or residue is carried forward.',
  });
}

export function createPocketBotState(scenario) {
  return createGuidanceLoopState({
    mapState: createLossyMapState(scenario),
    pendingProposal: createPendingProposalFromPreview(scenario.proposalPreview),
  });
}
