import { createPendingProposal } from '../domain/guidanceLoop.js';
import { getLossyMapNodeView } from '../domain/lossyMap.js';
import { createRunCarrier } from '../domain/runCarrier.js';
import { getMoveResourceCost, MOVE_TYPES } from '../domain/resourceRules.js';

const PLAYABLE_ROUTE_PROPOSAL_MOVES = Object.freeze([
  MOVE_TYPES.INSPECT,
  MOVE_TYPES.ASK,
  MOVE_TYPES.ACT,
  MOVE_TYPES.SKIP,
]);

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function unique(values) {
  return [...new Set(normalizeList(values))];
}

function getScenarioNode(mapState, nodeId) {
  return mapState.scenario.nodes.find((node) => node.id === nodeId) || null;
}

function getVisibleNodes(mapState) {
  return normalizeList(mapState.visibleNodeIds).map((nodeId) => {
    const view = getLossyMapNodeView(mapState, nodeId);

    return {
      id: view.id,
      label: view.label,
      kind: view.kind,
      status: view.inspected ? 'inspected' : view.visibility,
      visibleClue: view.visibleClue,
      remainingUnknowns: view.remainingUnknowns,
    };
  });
}

function getAllowedRouteProposalMoves(contract = {}) {
  return normalizeList(contract.allowedMoves).filter((moveType) =>
    PLAYABLE_ROUTE_PROPOSAL_MOVES.includes(moveType)
  );
}

function chooseExecutableMoveType(node, requestedMoveType) {
  if (requestedMoveType === MOVE_TYPES.ASK) {
    return requestedMoveType;
  }

  if (node?.possibleMoves?.[requestedMoveType]) {
    return requestedMoveType;
  }

  if (node?.possibleMoves?.[MOVE_TYPES.INSPECT]) {
    return MOVE_TYPES.INSPECT;
  }

  if (node?.possibleMoves?.[MOVE_TYPES.SKIP]) {
    return MOVE_TYPES.SKIP;
  }

  return requestedMoveType;
}

function getRuntimeMoveCost(mapState, moveType, targetNodeId) {
  if (moveType === MOVE_TYPES.ASK) {
    return getMoveResourceCost(MOVE_TYPES.ASK);
  }

  const node = getScenarioNode(mapState, targetNodeId);
  const nodeCost = node?.possibleMoves?.[moveType]?.cost || {};

  return getMoveResourceCost(moveType, nodeCost);
}

function createAdjustedAlternative(proposal, moveType, node) {
  if (proposal.moveType === moveType) {
    return null;
  }

  return {
    move: `${proposal.moveType}:${proposal.targetNodeId}`,
    whyNotSelected: `${node.label} does not support that move in this map state, so the proposal was adjusted to ${moveType}.`,
  };
}

export function createRouteProposalRuntimeInput(guidanceState, { sessionId = null } = {}) {
  const mapState = guidanceState?.mapState;

  if (!mapState?.scenario) {
    throw new TypeError('Route proposal runtime input requires guidance state with map state.');
  }

  const targetNodeIds = mapState.scenario.nodes.map((node) => node.id);
  const carrier = createRunCarrier({
    sessionId: sessionId || `run-${mapState.scenarioId}`,
    goal: mapState.goal,
    currentNodeId: mapState.currentNodeId,
    resources: mapState.resources,
    visibleNodeIds: mapState.visibleNodeIds,
    residue: unique([
      ...normalizeList(mapState.residue),
      ...normalizeList(mapState.remainingUnknowns),
    ]),
    revealedEvidence: mapState.revealedEvidence,
    trace: mapState.trace,
    finishStatus: mapState.finishJudgment?.status,
  });

  return {
    carrier,
    allowedMoves: getAllowedRouteProposalMoves(mapState.contract),
    targetNodeIds,
    visibleNodes: getVisibleNodes(mapState),
    traceCards: guidanceState.traceCards,
    sessionLesson: guidanceState.sessionLesson,
  };
}

export function applyRouteProposalResult(guidanceState, routeProposalResult) {
  const proposal = routeProposalResult?.proposal;

  if (!proposal) {
    throw new TypeError('Route proposal result requires a proposal.');
  }

  const node = getScenarioNode(guidanceState.mapState, proposal.targetNodeId);

  if (!node) {
    throw new RangeError(`Unknown route proposal target: ${proposal.targetNodeId}`);
  }

  const moveType = chooseExecutableMoveType(node, proposal.moveType);
  const adjustedAlternative = createAdjustedAlternative(proposal, moveType, node);
  const nextProposal = createPendingProposal({
    ...proposal,
    id: `proposal-${routeProposalResult.mode || 'relay'}-${moveType}-${proposal.targetNodeId}`,
    moveType,
    resourceCost: getRuntimeMoveCost(guidanceState.mapState, moveType, proposal.targetNodeId),
    consideredAlternatives: [
      ...normalizeList(proposal.consideredAlternatives),
      ...(adjustedAlternative ? [adjustedAlternative] : []),
    ],
  });
  const warnings = normalizeList(proposal.governanceWarnings);
  const modeLabel = routeProposalResult.mode || 'relay';
  const modelLabel = routeProposalResult.model ? ` using ${routeProposalResult.model}` : '';
  const fallbackLine = routeProposalResult.error
    ? `Relay fallback: ${routeProposalResult.error}`
    : null;

  return {
    ...guidanceState,
    pendingProposal: nextProposal,
    guidancePanel: {
      title: 'Bot Proposal Updated',
      lines: [
        `Pocket Bot proposed ${nextProposal.moveType} -> ${node.label}${modelLabel}.`,
        nextProposal.reason,
        ...warnings.map((warning) => `Governance note: ${warning}`),
        ...(fallbackLine ? [fallbackLine] : []),
      ],
    },
    guidanceTrace: [
      ...guidanceState.guidanceTrace,
      {
        id: `guidance-${guidanceState.guidanceTrace.length + 1}`,
        action: 'ask-bot',
        moveType: nextProposal.moveType,
        targetNodeId: nextProposal.targetNodeId,
        reason: nextProposal.reason,
        relayMode: modeLabel,
        relayModel: routeProposalResult.model || null,
      },
    ],
  };
}
