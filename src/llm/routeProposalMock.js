import { assertRouteProposal } from './routeProposalSchema.js';

function getCarrierValue(carrier, camelKey, snakeKey, fallback = null) {
  return carrier?.[camelKey] ?? carrier?.[snakeKey] ?? fallback;
}

function chooseMove(allowedMoves = []) {
  if (allowedMoves.includes('inspect')) {
    return 'inspect';
  }

  return allowedMoves[0] || 'skip';
}

function chooseTargetNode(carrier, targetNodeIds = []) {
  const currentNodeId = getCarrierValue(carrier, 'currentNodeId', 'current_node', null);
  const visibleNodeIds = getCarrierValue(carrier, 'visibleNodeIds', 'visible_nodes', []);
  const candidates = targetNodeIds.length > 0 ? targetNodeIds : visibleNodeIds;

  return candidates.find((nodeId) => nodeId && nodeId !== currentNodeId) || currentNodeId || 'source-edge';
}

function getResidue(carrier) {
  const residue = getCarrierValue(carrier, 'residue', 'residue', []);

  if (Array.isArray(residue) && residue.length > 0) {
    return residue.slice(0, 2);
  }

  return ['Uninspected pressure may remain outside this move.'];
}

export function createMockRouteProposal({
  carrier,
  allowedMoves = ['inspect', 'ask', 'remember', 'act', 'skip'],
  targetNodeIds = [],
} = {}) {
  const moveType = chooseMove(allowedMoves);
  const targetNodeId = chooseTargetNode(carrier, targetNodeIds);
  const residue = getResidue(carrier);
  const raw = {
    route_proposal: {
      move_type: moveType,
      target_node: targetNodeId,
      reason: 'Mock fallback: inspect a reachable signal before committing attention elsewhere.',
      resource_cost: {
        bot_attention: moveType === 'skip' ? 0 : 2,
        user_attention: moveType === 'skip' ? 0 : 1,
        context_slots: 0,
      },
      considered_alternatives: [
        {
          move: 'act:goal',
          why_not_selected: 'Acting now could close the route before warning residue is checked.',
        },
      ],
      cut_price: {
        reveals: ['One local clue or warning near the selected node.'],
        suppresses: ['Other branches and long-route cost remain unchecked.'],
        leaves_residue: residue,
      },
      stop_condition: 'Stop after one reveal, a blocked move, or exhausted Bot Attention.',
    },
  };

  return assertRouteProposal(raw, {
    allowedMoves,
    allowedTargetNodeIds: targetNodeIds,
    finishStatus: getCarrierValue(carrier, 'finishStatus', 'finish_status', null),
  });
}
