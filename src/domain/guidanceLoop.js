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
  applySessionLessonToTraceCard,
  createMoveTraceCard,
  createSessionLessonFromTraceCard,
  createTraceCard,
  markSessionLessonApplied,
  markLatestTraceCardPartial,
} from './traces.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function unique(values) {
  return [...new Set(normalizeList(values))];
}

function compactGuidanceLines(lines, limit = 4) {
  const uniqueLines = unique(lines);

  if (uniqueLines.length <= limit) {
    return uniqueLines;
  }

  const selected = uniqueLines.slice(0, limit);
  const falseFinishLine = uniqueLines.find((line) => /false finish/i.test(line));

  if (falseFinishLine && !selected.includes(falseFinishLine)) {
    selected[selected.length - 1] = falseFinishLine;
  }

  return [
    ...selected,
    `+${uniqueLines.length - limit} more still unknown`,
  ];
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
  sessionLesson = null,
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
    sessionLesson: clone(sessionLesson),
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

function findPreferredLessonNode(mapState, sessionLesson, fallbackNodeId) {
  const nodes = mapState.scenario.nodes || [];
  const lessonText = [
    sessionLesson?.userWords,
    sessionLesson?.lessonType,
    sessionLesson?.operationalReading?.whatMustNotBeLost,
    sessionLesson?.operationalReading?.when,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const inspectedIds = new Set(mapState.inspectedNodeIds || []);
  const canInspect = (node) => node?.possibleMoves?.[MOVE_TYPES.INSPECT];
  const findNode = (predicate) => nodes.find((node) => canInspect(node) && predicate(node));
  const findNodeById = (ids) => findNode((node) => ids.includes(node.id));

  if (/support/.test(lessonText)) {
    return findNodeById(['support-check', 'context-shrine']);
  }

  if (/fomo|urgency/.test(lessonText)) {
    return findNodeById(['fomo-pressure']);
  }

  if (/exit|warning|false|safe|finish/.test(lessonText)) {
    return findNodeById(['exit-friction', 'warning-signal', 'safe-gate']);
  }

  if (/context|clue|residue/.test(lessonText)) {
    return findNodeById(['context-shrine', 'support-check']);
  }

  return (
    findNode((node) => node.visibility === 'fogged' && !inspectedIds.has(node.id)) ||
    findNode((node) => node.pressure?.hidden === true && !inspectedIds.has(node.id)) ||
    findNode((node) => node.id !== fallbackNodeId) ||
    findNode((node) => node.id === fallbackNodeId)
  );
}

function createLessonAppliedProposal(state, sessionLesson) {
  const previousProposal = state.pendingProposal;
  const node = findPreferredLessonNode(state.mapState, sessionLesson, previousProposal.targetNodeId);

  if (!node) {
    return previousProposal;
  }

  const moveType = MOVE_TYPES.INSPECT;
  const resourceCost = getMoveCostFromScenario(state.mapState, moveType, node.id);
  const mustNotLose = sessionLesson.operationalReading?.whatMustNotBeLost || 'remaining unknowns';
  const beforeMove = sessionLesson.operationalReading?.beforeMove || previousProposal.moveType;
  const lessonSummary = sessionLesson.lessonType === 'cut_preference'
    ? 'inspect before acting'
    : sessionLesson.lessonType === 'stop_condition'
      ? 'partial is not full success'
      : 'carry residue forward';
  const proposal = createPendingProposal({
    id: `proposal-lesson-${sessionLesson.id}-${moveType}-${node.id}`,
    moveType,
    targetNodeId: node.id,
    reason: `This run's lesson: ${lessonSummary}. I will inspect ${node.label} before ${beforeMove || 'acting'} so "${mustNotLose}" stays visible.`,
    resourceCost,
    consideredAlternatives: [
      {
        move: `${previousProposal.moveType}:${previousProposal.targetNodeId}`,
        whyNotSelected: `The session lesson says "${mustNotLose}" must stay visible before the next commitment.`,
      },
    ],
    cutPrice: {
      reveals: normalizeList(node.possibleMoves?.[moveType]?.reveals || node.reveal?.inspect?.evidence || [node.label]),
      suppresses: ['premature full-success claim'],
      leavesResidue: normalizeList(node.possibleMoves?.[moveType]?.leavesUnknown || node.residue || [mustNotLose]),
    },
    stopCondition: `Stop after applying the session lesson from ${sessionLesson.sourceTraceId}; do not claim durable training.`,
  });

  return proposal;
}

function promoteSessionLessonFromTrace(state, traceCard) {
  const sessionLesson = createSessionLessonFromTraceCard(traceCard);

  if (!sessionLesson) {
    return {
      traceCard,
      sessionLesson: state.sessionLesson,
      pendingProposal: state.pendingProposal,
    };
  }

  const traceWithLesson = applySessionLessonToTraceCard(traceCard, sessionLesson);
  const pendingProposal = createLessonAppliedProposal(
    {
      ...state,
      sessionLesson,
    },
    sessionLesson
  );

  return {
    traceCard: traceWithLesson,
    sessionLesson: markSessionLessonApplied(sessionLesson, pendingProposal.id),
    pendingProposal,
  };
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
  const lessonResult = promoteSessionLessonFromTrace(state, traceCard);

  return {
    applied: true,
    state: {
      ...state,
      mapState: nextMapState,
      pendingProposal: lessonResult.pendingProposal,
      guidancePanel: createGuidancePanel('User Guidance', [
        'A user guidance prompt was recorded before the bot spends more attention.',
      ]),
      guidanceTrace: appendGuidanceTrace(state, {
        action: 'ask-user',
        moveType: MOVE_TYPES.ASK,
        targetNodeId: state.pendingProposal.targetNodeId,
      }),
      traceCards: appendTraceCard(state.traceCards, lessonResult.traceCard),
      sessionLesson: lessonResult.sessionLesson,
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
  const lessonResult = promoteSessionLessonFromTrace(
    {
      ...state,
      mapState: result.state,
    },
    traceCard
  );

  return {
    applied: true,
    result,
    state: {
      ...state,
      mapState: result.state,
      pendingProposal: lessonResult.pendingProposal,
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
      traceCards: appendTraceCard(state.traceCards, lessonResult.traceCard),
      sessionLesson: lessonResult.sessionLesson,
    },
  };
}

export function redirectPendingProposal(state, {
  moveType,
  targetNodeId,
  reason = null,
  action = 'redirect',
} = {}) {
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
      action,
      moveType: nextProposal.moveType,
      targetNodeId: nextProposal.targetNodeId,
      reason: nextProposal.reason,
    }),
  };
}

export function redirectToInspectFirst(state) {
  return redirectPendingProposal(state, {
    moveType: MOVE_TYPES.INSPECT,
    targetNodeId: state.pendingProposal.targetNodeId,
    reason: 'Inspect first before acting on a route that still carries residue.',
    action: 'inspect-first',
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
      ...compactGuidanceLines([
        ...state.pendingProposal.cutPrice.leavesResidue,
        ...state.mapState.residue,
        ...state.mapState.remainingUnknowns,
      ]),
    ]),
  };
}

export function markPartialResult(state, note = 'Useful progress, not full success.') {
  const traceCards = markLatestTraceCardPartial(state.traceCards, note);
  const latestTraceCard = traceCards.at(-1);
  const lessonResult = promoteSessionLessonFromTrace(
    {
      ...state,
      traceCards,
    },
    latestTraceCard
  );
  const nextTraceCards = latestTraceCard
    ? [
        ...traceCards.slice(0, -1),
        lessonResult.traceCard,
      ]
    : traceCards;

  return {
    ...state,
    partialResults: [...state.partialResults, note],
    guidancePanel: createGuidancePanel('Marked partial', [note]),
    traceCards: nextTraceCards,
    sessionLesson: lessonResult.sessionLesson,
    pendingProposal: lessonResult.pendingProposal,
    guidanceTrace: appendGuidanceTrace(state, {
      action: 'mark-partial',
      note,
    }),
  };
}
