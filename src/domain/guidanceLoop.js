import { createFinishJudgment } from './finishJudgment.js';
import {
  actOnLossyMapNode,
  inspectLossyMapNode,
  skipLossyMapNode,
} from './lossyMap.js';
import {
  MOVE_TYPES,
  applyResourceCost,
  getMoveResourceCost,
} from './resourceRules.js';
import {
  appendTraceCard,
  createMoveTraceCard,
  createTraceCard,
  markLatestTraceCardPartial,
} from './traces.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function getNodeById(mapState, nodeId) {
  return mapState.scenario.nodes.find((node) => node.id === nodeId) || null;
}

function getMoveCostFromScenario(mapState, moveType, targetNodeId) {
  const node = getNodeById(mapState, targetNodeId);
  const nodeCost = node?.possibleMoves?.[moveType]?.cost || {};

  return getMoveResourceCost(moveType, nodeCost);
}

function createGuidancePanel(title, lines = []) {
  return {
    title,
    lines: normalizeList(lines),
  };
}

function appendGuidanceTrace(state, entry) {
  return [
    ...state.guidanceTrace,
    {
      id: `guidance-${state.guidanceTrace.length + 1}`,
      ...entry,
    },
  ];
}

function normalizeAlternative(alternative) {
  if (typeof alternative === 'string') {
    return {
      move: alternative,
      whyNotSelected: 'Not selected for this proposal.',
    };
  }

  return {
    move: alternative?.move || 'unknown',
    whyNotSelected: alternative?.whyNotSelected || alternative?.why_not_selected || 'Not selected for this proposal.',
  };
}

function normalizeCutPrice(cutPrice = {}) {
  return {
    reveals: normalizeList(cutPrice.reveals),
    suppresses: normalizeList(cutPrice.suppresses),
    leavesResidue: normalizeList(cutPrice.leavesResidue || cutPrice.leaves_residue),
  };
}

export function createPendingProposal({
  id = null,
  moveType,
  targetNodeId,
  reason,
  resourceCost = null,
  consideredAlternatives = [],
  cutPrice = {},
  stopCondition = 'Stop after the accepted move resolves or carries residue.',
} = {}) {
  if (!moveType || !targetNodeId) {
    throw new TypeError('Pending proposal requires a move type and target node.');
  }

  const cost = resourceCost || getMoveResourceCost(moveType);

  return {
    id: id || `proposal-${moveType}-${targetNodeId}`,
    moveType,
    targetNodeId,
    reason: reason || 'No reason supplied.',
    resourceCost: {
      moveType,
      botAttention: cost.botAttention,
      userGuidance: cost.userGuidance,
      contextSlots: cost.contextSlots,
    },
    consideredAlternatives: consideredAlternatives.map(normalizeAlternative),
    cutPrice: normalizeCutPrice(cutPrice),
    stopCondition,
  };
}

export function createGuidanceLoopState({
  mapState,
  pendingProposal,
  guidancePanel = null,
  guidanceTrace = [],
  traceCards = [],
  partialResults = [],
} = {}) {
  if (!mapState?.scenario) {
    throw new TypeError('Guidance loop requires a lossy map state.');
  }

  if (!pendingProposal) {
    throw new TypeError('Guidance loop requires a pending proposal.');
  }

  return {
    mapState,
    pendingProposal,
    guidancePanel: guidancePanel || createGuidancePanel('Bot Proposal', [pendingProposal.reason]),
    guidanceTrace: guidanceTrace.map(clone),
    traceCards: traceCards.map(clone),
    partialResults: normalizeList(partialResults),
  };
}

function createBlockedState(state, message) {
  return {
    ...state,
    guidancePanel: createGuidancePanel('Move blocked', [message]),
  };
}

function validateProposalTarget(state) {
  const node = getNodeById(state.mapState, state.pendingProposal.targetNodeId);

  if (!node) {
    return {
      valid: false,
      message: `Unknown map node: ${state.pendingProposal.targetNodeId}.`,
    };
  }

  if (!node.possibleMoves?.[state.pendingProposal.moveType]) {
    return {
      valid: false,
      message: `${state.pendingProposal.moveType} is not available for ${node.label}.`,
    };
  }

  return {
    valid: true,
    node,
  };
}

function getPendingGuidanceEntries(state) {
  const lastAcceptedIndex = state.guidanceTrace.findLastIndex(
    (entry) => entry.action === 'approve' || entry.action === 'ask-user'
  );

  return state.guidanceTrace.slice(lastAcceptedIndex + 1);
}

function applyAskMove(state) {
  const result = applyResourceCost(state.mapState.resources, getMoveResourceCost(MOVE_TYPES.ASK));

  if (!result.applied) {
    return {
      applied: false,
      state: createBlockedState(state, result.checks.botAttention.message),
    };
  }

  const nextMapState = {
    ...state.mapState,
    resources: result.resources,
    finishJudgment: createFinishJudgment({
      goalReached: false,
      protectedOutcomes: state.mapState.contract.protectedOutcomes,
      evidence: state.mapState.revealedEvidence,
      residue: state.mapState.residue,
      remainingUnknowns: state.mapState.remainingUnknowns,
    }),
  };

  const traceCard = createTraceCard({
    sequence: state.traceCards.length + 1,
    proposal: state.pendingProposal,
    acceptedMove: {
      moveType: MOVE_TYPES.ASK,
      targetNodeId: state.pendingProposal.targetNodeId,
    },
    resourceSpend: result.cost,
    userGuidance: getPendingGuidanceEntries(state),
    revealed: ['user guidance prompt'],
    suppressedOrNotChecked: ['autonomous closure'],
    residueCarriedForward: [
      ...state.mapState.residue,
      ...state.mapState.remainingUnknowns,
    ],
    landfallStatus: nextMapState.finishJudgment.status,
    outcome: 'ask-user',
  });

  return {
    applied: true,
    state: {
      ...state,
      mapState: nextMapState,
      guidancePanel: createGuidancePanel('User Guidance', [
        'A user guidance prompt was recorded before the bot spends more attention.',
      ]),
      guidanceTrace: appendGuidanceTrace(state, {
        action: 'ask-user',
        moveType: MOVE_TYPES.ASK,
        targetNodeId: state.pendingProposal.targetNodeId,
      }),
      traceCards: appendTraceCard(state.traceCards, traceCard),
    },
  };
}

export function approvePendingProposal(state) {
  const validation = validateProposalTarget(state);

  if (!validation.valid) {
    return {
      applied: false,
      state: createBlockedState(state, validation.message),
    };
  }

  if (state.pendingProposal.moveType === MOVE_TYPES.ASK) {
    return applyAskMove(state);
  }

  const moveHandlers = {
    [MOVE_TYPES.INSPECT]: inspectLossyMapNode,
    [MOVE_TYPES.SKIP]: skipLossyMapNode,
    [MOVE_TYPES.ACT]: actOnLossyMapNode,
  };
  const handler = moveHandlers[state.pendingProposal.moveType];

  if (!handler) {
    return {
      applied: false,
      state: createBlockedState(state, `${state.pendingProposal.moveType} is not executable yet.`),
    };
  }

  const result = handler(state.mapState, state.pendingProposal.targetNodeId);

  if (!result.applied) {
    return {
      applied: false,
      state: createBlockedState(state, result.reason || 'Move was blocked.'),
      result,
    };
  }

  const traceCard = createMoveTraceCard({
    sequence: state.traceCards.length + 1,
    proposal: state.pendingProposal,
    mapResult: result,
    guidanceEntries: getPendingGuidanceEntries(state),
  });

  return {
    applied: true,
    result,
    state: {
      ...state,
      mapState: result.state,
      guidancePanel: createGuidancePanel('Move accepted', [
        `${state.pendingProposal.moveType} -> ${state.pendingProposal.targetNodeId}`,
        ...state.pendingProposal.cutPrice.leavesResidue.map((item) => `Residue: ${item}`),
      ]),
      guidanceTrace: appendGuidanceTrace(state, {
        action: 'approve',
        moveType: state.pendingProposal.moveType,
        targetNodeId: state.pendingProposal.targetNodeId,
        resourceCost: state.pendingProposal.resourceCost,
        finishStatus: result.state.finishJudgment?.status,
      }),
      traceCards: appendTraceCard(state.traceCards, traceCard),
    },
  };
}

export function redirectPendingProposal(state, { moveType, targetNodeId, reason = null } = {}) {
  const nextMoveType = moveType || state.pendingProposal.moveType;
  const nextTargetNodeId = targetNodeId || state.pendingProposal.targetNodeId;
  const resourceCost = getMoveCostFromScenario(state.mapState, nextMoveType, nextTargetNodeId);
  const nextProposal = createPendingProposal({
    ...state.pendingProposal,
    id: `proposal-${nextMoveType}-${nextTargetNodeId}`,
    moveType: nextMoveType,
    targetNodeId: nextTargetNodeId,
    reason: reason || `User redirected the bot toward ${nextTargetNodeId}.`,
    resourceCost,
  });

  return {
    ...state,
    pendingProposal: nextProposal,
    guidancePanel: createGuidancePanel('Proposal redirected', [
      `${nextProposal.moveType} -> ${nextProposal.targetNodeId}`,
      nextProposal.reason,
    ]),
    guidanceTrace: appendGuidanceTrace(state, {
      action: 'redirect',
      moveType: nextProposal.moveType,
      targetNodeId: nextProposal.targetNodeId,
    }),
  };
}

export function redirectToInspectFirst(state) {
  return redirectPendingProposal(state, {
    moveType: MOVE_TYPES.INSPECT,
    targetNodeId: state.pendingProposal.targetNodeId,
    reason: 'Inspect first before acting on a route that still carries residue.',
  });
}

export function requestUserGuidance(state, userWords = 'Ask the user before continuing.') {
  return applyAskMove({
    ...state,
    pendingProposal: createPendingProposal({
      moveType: MOVE_TYPES.ASK,
      targetNodeId: state.pendingProposal.targetNodeId,
      reason: userWords,
      cutPrice: {
        reveals: ['user preference'],
        suppresses: ['autonomous closure'],
        leavesResidue: ['map uncertainty remains'],
      },
    }),
  });
}

export function showWhyThisRoute(state) {
  return {
    ...state,
    guidancePanel: createGuidancePanel('Why this route?', [
      state.pendingProposal.reason,
      ...state.pendingProposal.consideredAlternatives.map(
        (alternative) => `${alternative.move}: ${alternative.whyNotSelected}`
      ),
    ]),
  };
}

export function showRemainingUnknowns(state) {
  return {
    ...state,
    guidancePanel: createGuidancePanel('What remains unknown?', [
      ...state.pendingProposal.cutPrice.leavesResidue,
      ...state.mapState.residue,
      ...state.mapState.remainingUnknowns,
    ]),
  };
}

export function markPartialResult(state, note = 'Useful progress, not full success.') {
  return {
    ...state,
    partialResults: [...state.partialResults, note],
    guidancePanel: createGuidancePanel('Marked partial', [note]),
    traceCards: markLatestTraceCardPartial(state.traceCards, note),
    guidanceTrace: appendGuidanceTrace(state, {
      action: 'mark-partial',
      note,
    }),
  };
}
