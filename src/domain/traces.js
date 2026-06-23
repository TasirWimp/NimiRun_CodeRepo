import { FINISH_STATUSES } from './finishJudgment.js';

export const TRACE_CARD_TYPES = Object.freeze({
  MOVE: 'move',
  RECEIPT: 'receipt',
  POCKET: 'pocket',
});

export const TRACE_LANDFALL_STATUSES = Object.freeze({
  OPEN: FINISH_STATUSES.OPEN,
  PARTIAL: FINISH_STATUSES.PARTIAL,
  SAFE: FINISH_STATUSES.SAFE,
  FALSE: FINISH_STATUSES.FALSE,
});

export const SESSION_LESSON_TYPES = Object.freeze({
  CUT_PREFERENCE: 'cut_preference',
  RESIDUE_RULE: 'residue_rule',
  RESOURCE_PRIORITY: 'resource_priority',
  STOP_CONDITION: 'stop_condition',
});

const TRACE_LANDFALL_STATUS_VALUES = Object.freeze(Object.values(TRACE_LANDFALL_STATUSES));
const SESSION_LESSON_TYPE_VALUES = Object.freeze(Object.values(SESSION_LESSON_TYPES));

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function unique(values) {
  return [...new Set(normalizeList(values))];
}

function normalizeNonNegativeInteger(value, fallback = 0) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(0, Math.floor(numberValue));
}

function normalizeOptionalNumber(value) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeCutPrice(cutPrice = {}) {
  return {
    reveals: normalizeList(cutPrice.reveals),
    suppresses: normalizeList(cutPrice.suppresses),
    leavesResidue: normalizeList(cutPrice.leavesResidue || cutPrice.leaves_residue),
  };
}

function normalizeProposal(proposal = null) {
  if (!proposal) {
    return null;
  }

  return {
    id: proposal.id || null,
    moveType: proposal.moveType || null,
    targetNodeId: proposal.targetNodeId || null,
    reason: proposal.reason || null,
    consideredAlternatives: normalizeList(proposal.consideredAlternatives).map(clone),
    cutPrice: normalizeCutPrice(proposal.cutPrice),
    stopCondition: proposal.stopCondition || null,
  };
}

function normalizeAcceptedMove(acceptedMove = {}, proposal = null) {
  const moveType = acceptedMove.moveType || proposal?.moveType;
  const targetNodeId = acceptedMove.targetNodeId || proposal?.targetNodeId;

  if (!moveType || !targetNodeId) {
    throw new TypeError('Trace card requires an accepted move type and target.');
  }

  return {
    moveType,
    targetNodeId,
    label: acceptedMove.label || targetNodeId,
  };
}

function normalizeResourceSpend(resourceSpend = {}) {
  const amount = normalizeOptionalNumber(resourceSpend.amount);
  const currency = resourceSpend.currency || null;

  return {
    moveType: resourceSpend.moveType || null,
    botAttention: normalizeNonNegativeInteger(resourceSpend.botAttention, 0),
    userGuidance: normalizeNonNegativeInteger(resourceSpend.userGuidance, 0),
    contextSlots: normalizeNonNegativeInteger(resourceSpend.contextSlots, 0),
    ...(amount == null ? {} : { amount }),
    ...(currency == null ? {} : { currency }),
  };
}

function normalizeGuidanceEntry(entry = {}) {
  return {
    action: entry.action || 'guidance',
    moveType: entry.moveType || null,
    targetNodeId: entry.targetNodeId || null,
    reason: entry.reason || entry.note || null,
  };
}

export function normalizeLandfallStatus(value = FINISH_STATUSES.OPEN) {
  const status = typeof value === 'string' ? value : value?.status;

  return TRACE_LANDFALL_STATUS_VALUES.includes(status) ? status : FINISH_STATUSES.OPEN;
}

function createReentryNote({ residueCarriedForward, landfallStatus, fallback = null }) {
  if (fallback) {
    return fallback;
  }

  if (landfallStatus === FINISH_STATUSES.SAFE) {
    return 'Safe finish recorded. No unresolved residue is carried from this trace.';
  }

  const residue = normalizeList(residueCarriedForward);

  if (residue.length > 0) {
    return `Carry forward: ${residue[0]}.`;
  }

  return 'Run remains open; inspect the next proposed move before claiming completion.';
}

function createLessonCandidate({ guidanceEntries, proposal, residueCarriedForward }) {
  const guidance = normalizeList(guidanceEntries);

  if (guidance.length === 0) {
    return null;
  }

  const lastGuidance = guidance.at(-1);
  const residue = normalizeList(residueCarriedForward);
  const lessonType =
    lastGuidance.action === 'mark-partial'
      ? SESSION_LESSON_TYPES.STOP_CONDITION
      : lastGuidance.action === 'inspect-first'
        ? SESSION_LESSON_TYPES.CUT_PREFERENCE
        : residue.length > 0
          ? SESSION_LESSON_TYPES.RESIDUE_RULE
          : SESSION_LESSON_TYPES.CUT_PREFERENCE;

  return {
    lessonType,
    userWords: lastGuidance.reason || 'User corrected the route before acceptance.',
    operationalReading: {
      when: `Before ${proposal?.moveType || 'the next move'} on ${proposal?.targetNodeId || 'the selected node'}.`,
      preferMove: proposal?.moveType || null,
      beforeMove: lastGuidance.action === 'inspect-first' || proposal?.moveType === 'act' ? 'act' : null,
      whatMustNotBeLost: residue[0] || 'remaining unknowns',
    },
    appliesToNextProposal: false,
    status: 'candidate',
  };
}

export function createTraceCard({
  id = null,
  type = TRACE_CARD_TYPES.MOVE,
  sequence = 1,
  proposal = null,
  acceptedMove,
  resourceSpend = {},
  userGuidance = [],
  revealed = [],
  suppressedOrNotChecked = [],
  residueCarriedForward = [],
  contextChanges = [],
  lessonCandidate = null,
  reentryNote = null,
  landfallStatus = FINISH_STATUSES.OPEN,
  outcome = null,
  receipt = null,
  worldRelationRevealed = [],
  worldRelationsResidualized = [],
  stillUnknown = [],
  returnCondition = null,
  finishPressureDelta = null,
  createdAt = null,
} = {}) {
  const proposalSnapshot = normalizeProposal(proposal);
  const move = normalizeAcceptedMove(acceptedMove, proposalSnapshot);
  const normalizedLandfallStatus = normalizeLandfallStatus(landfallStatus);
  const normalizedResidue = unique(residueCarriedForward);

  return {
    id: id || `trace-${sequence}`,
    type,
    sequence,
    createdAt,
    proposal: proposalSnapshot,
    acceptedMove: move,
    resourceSpend: normalizeResourceSpend(resourceSpend),
    userGuidance: normalizeList(userGuidance).map(normalizeGuidanceEntry),
    revealed: unique(revealed),
    suppressedOrNotChecked: unique(suppressedOrNotChecked),
    residueCarriedForward: normalizedResidue,
    contextChanges: normalizeList(contextChanges).map(clone),
    lessonCandidate: clone(lessonCandidate),
    reentryNote: createReentryNote({
      residueCarriedForward: normalizedResidue,
      landfallStatus: normalizedLandfallStatus,
      fallback: reentryNote,
    }),
    landfallStatus: normalizedLandfallStatus,
    outcome: outcome || normalizedLandfallStatus,
    worldRelationRevealed: unique(worldRelationRevealed),
    worldRelationsResidualized: unique(worldRelationsResidualized),
    stillUnknown: unique(stillUnknown),
    returnCondition,
    finishPressureDelta: clone(finishPressureDelta),
    sessionLesson: null,
    receipt: clone(receipt),
  };
}

function getLatestMapTrace(mapResult = {}) {
  return mapResult.state?.trace?.at(-1) || {};
}

export function createMoveTraceCard({
  sequence = 1,
  proposal,
  mapResult,
  guidanceEntries = [],
  worldTransition = null,
  id = null,
  createdAt = null,
} = {}) {
  if (!proposal) {
    throw new TypeError('Move trace card requires a proposal.');
  }

  const latestMapTrace = getLatestMapTrace(mapResult);
  const revealed = unique([
    ...(mapResult?.reveal?.summary ? [mapResult.reveal.summary] : []),
    ...normalizeList(mapResult?.reveal?.evidence),
    ...normalizeList(latestMapTrace.revealed),
    ...normalizeList(latestMapTrace.evidence),
    ...normalizeList(latestMapTrace.observedEvidence),
  ]);
  const residueCarriedForward = unique([
    ...normalizeList(proposal.cutPrice?.leavesResidue),
    ...normalizeList(mapResult?.reveal?.residue),
    ...normalizeList(latestMapTrace.residue),
    ...normalizeList(mapResult?.state?.residue),
    ...normalizeList(mapResult?.state?.remainingUnknowns),
  ]);
  const landfallStatus = normalizeLandfallStatus(mapResult?.state?.finishJudgment || mapResult?.finishJudgment);
  const guidance = normalizeList(guidanceEntries).map(normalizeGuidanceEntry);
  const lessonCandidate = createLessonCandidate({
    guidanceEntries: guidance,
    proposal,
    residueCarriedForward,
  });

  return createTraceCard({
    id,
    sequence,
    proposal,
    acceptedMove: {
      moveType: proposal.moveType,
      targetNodeId: proposal.targetNodeId,
    },
    resourceSpend: mapResult?.cost || proposal.resourceCost,
    userGuidance: guidance,
    revealed,
    suppressedOrNotChecked: normalizeList(proposal.cutPrice?.suppresses),
    residueCarriedForward,
    lessonCandidate,
    reentryNote: mapResult?.state?.finishJudgment?.note,
    landfallStatus,
    outcome: latestMapTrace.classification || landfallStatus,
    worldRelationRevealed: worldTransition?.worldRelationRevealed,
    worldRelationsResidualized: worldTransition?.worldRelationsResidualized,
    stillUnknown: worldTransition?.stillUnknown,
    returnCondition: worldTransition?.returnCondition,
    finishPressureDelta: worldTransition?.finishPressureDelta,
    createdAt,
  });
}

export function createReceiptTraceCard({
  sequence = 1,
  receipt,
  id = null,
  createdAt = null,
  landfallStatus = FINISH_STATUSES.OPEN,
} = {}) {
  if (!receipt) {
    throw new TypeError('Receipt trace card requires a receipt.');
  }

  return createTraceCard({
    id,
    type: TRACE_CARD_TYPES.RECEIPT,
    sequence,
    proposal: {
      id: receipt.proposalId,
      reason: receipt.reason,
    },
    acceptedMove: {
      moveType: 'receipt',
      targetNodeId: receipt.toolId || receipt.allowanceId,
      label: receipt.toolName || receipt.allowanceName || receipt.toolId || receipt.allowanceId,
    },
    resourceSpend: {
      amount: receipt.cost,
      currency: receipt.currency,
    },
    revealed: [],
    suppressedOrNotChecked: [],
    residueCarriedForward: [],
    contextChanges: [],
    landfallStatus,
    outcome: receipt.outcome,
    receipt: {
      id: receipt.id,
      decision: receipt.decision,
      ruleResult: receipt.ruleResult,
      userClassification: receipt.userClassification,
    },
    createdAt,
  });
}

export function createPocketTraceCard({
  sequence = 1,
  pocketStatus,
  id = null,
  createdAt = null,
  landfallStatus = FINISH_STATUSES.OPEN,
} = {}) {
  if (!pocketStatus) {
    throw new TypeError('Pocket trace card requires a pocket status.');
  }

  const accountCount = normalizeNonNegativeInteger(pocketStatus.accountsCount, 0);
  const revealed = [
    pocketStatus.statusLabel || 'Nimiq pocket status checked',
    accountCount > 0
      ? `${accountCount} Nimiq account${accountCount === 1 ? '' : 's'} connected`
      : 'No Nimiq account connected',
  ];

  if (pocketStatus.consensusEstablished === true && pocketStatus.blockNumber != null) {
    revealed.push(`Consensus established at block ${pocketStatus.blockNumber}`);
  } else if (pocketStatus.consensusEstablished === false) {
    revealed.push('Consensus not established yet');
  }

  const verificationResidue =
    pocketStatus.network === 'testnet'
      ? 'Testnet pocket status remains low-stakes.'
      : pocketStatus.mode === 'nimiq-pay' && pocketStatus.status === 'provider-ready'
        ? 'Nimiq Pay device/emulator status check completed; preserve the provider network label separately.'
        : 'Local fallback is not a live Nimiq Pay provider check.';

  return createTraceCard({
    id,
    type: TRACE_CARD_TYPES.POCKET,
    sequence,
    proposal: {
      id: 'nimiq-pocket-status',
      reason: 'User explicitly checked the Nimiq pocket/status surface.',
    },
    acceptedMove: {
      moveType: 'pocket-status',
      targetNodeId: 'nimiq-pocket',
      label: 'Nimiq Pocket',
    },
    resourceSpend: {
      botAttention: 0,
      userGuidance: 0,
      contextSlots: 0,
      amount: pocketStatus.amount,
      currency: pocketStatus.currency,
    },
    revealed,
    suppressedOrNotChecked: [
      'No NIM send, sign, checkout, or mainnet authority requested.',
    ],
    residueCarriedForward: [
      'Pocket value is status/recharge context, not Bot Attention spend.',
      verificationResidue,
    ],
    contextChanges: [],
    landfallStatus,
    outcome: pocketStatus.status,
    createdAt,
  });
}

export function appendTraceCard(traceCards = [], traceCard) {
  if (!traceCard) {
    throw new TypeError('A trace card is required.');
  }

  return [
    ...normalizeList(traceCards).map(clone),
    {
      ...clone(traceCard),
      sequence: traceCard.sequence || normalizeList(traceCards).length + 1,
    },
  ];
}

export function getLatestTraceCard(traceCards = []) {
  return normalizeList(traceCards).at(-1) || null;
}

export function markLatestTraceCardPartial(traceCards = [], note = 'Marked partial by user.') {
  const cards = normalizeList(traceCards).map(clone);
  const latest = cards.at(-1);

  if (!latest) {
    return cards;
  }

  cards[cards.length - 1] = {
    ...latest,
    landfallStatus: FINISH_STATUSES.PARTIAL,
    outcome: note,
    reentryNote: note,
    lessonCandidate: {
      lessonType: SESSION_LESSON_TYPES.STOP_CONDITION,
      userWords: note,
      operationalReading: {
        when: 'When a result looks useful but incomplete.',
        preferMove: null,
        beforeMove: null,
        whatMustNotBeLost: 'partial result is not full success',
      },
      appliesToNextProposal: false,
      status: 'candidate',
    },
  };

  return cards;
}

function normalizeLessonType(value) {
  return SESSION_LESSON_TYPE_VALUES.includes(value) ? value : SESSION_LESSON_TYPES.RESIDUE_RULE;
}

function normalizeOperationalReading(operationalReading = {}) {
  return {
    when: operationalReading.when || 'Before the next proposal.',
    preferMove: operationalReading.preferMove || operationalReading.prefer_move || null,
    beforeMove: operationalReading.beforeMove || operationalReading.before_move || null,
    whatMustNotBeLost:
      operationalReading.whatMustNotBeLost ||
      operationalReading.what_must_not_be_lost ||
      'remaining unknowns',
  };
}

export function createSessionLessonFromTraceCard(traceCard, {
  id = null,
  appliesToNextProposal = true,
} = {}) {
  const candidate = traceCard?.lessonCandidate;

  if (!candidate) {
    return null;
  }

  return {
    id: id || `lesson-${traceCard.id}`,
    sourceTraceId: traceCard.id,
    lessonType: normalizeLessonType(candidate.lessonType || candidate.lesson_type),
    userWords: candidate.userWords || candidate.user_words || 'User corrected the route.',
    operationalReading: normalizeOperationalReading(candidate.operationalReading || candidate.operational_reading),
    appliesToNextProposal,
    appliedToProposalId: null,
    status: appliesToNextProposal ? 'active' : 'inactive',
  };
}

export function applySessionLessonToTraceCard(traceCard, sessionLesson) {
  if (!traceCard || !sessionLesson) {
    return traceCard;
  }

  return {
    ...clone(traceCard),
    lessonCandidate: traceCard.lessonCandidate
      ? {
          ...clone(traceCard.lessonCandidate),
          appliesToNextProposal: true,
          status: 'promoted',
        }
      : null,
    sessionLesson: clone(sessionLesson),
  };
}

export function markSessionLessonApplied(sessionLesson, proposalId) {
  if (!sessionLesson) {
    return null;
  }

  return {
    ...clone(sessionLesson),
    appliedToProposalId: proposalId,
    status: 'applied',
  };
}

export function serializeSessionLessonForPrompt(sessionLesson) {
  if (!sessionLesson) {
    return null;
  }

  const operationalReading = normalizeOperationalReading(
    sessionLesson.operationalReading || sessionLesson.operational_reading
  );

  return {
    id: sessionLesson.id || null,
    source_trace_id: sessionLesson.sourceTraceId || sessionLesson.source_trace_id || null,
    lesson_type: normalizeLessonType(sessionLesson.lessonType || sessionLesson.lesson_type),
    user_words: sessionLesson.userWords || sessionLesson.user_words || 'User corrected the route.',
    operational_reading: {
      when: operationalReading.when,
      prefer_move: operationalReading.preferMove,
      before_move: operationalReading.beforeMove,
      what_must_not_be_lost: operationalReading.whatMustNotBeLost,
    },
    applies_to_next_proposal:
      sessionLesson.appliesToNextProposal ?? sessionLesson.applies_to_next_proposal ?? false,
    status: sessionLesson.status || 'active',
  };
}

export function serializeTraceCardsForProposalContext(traceCards = [], { limit = 4 } = {}) {
  return normalizeList(traceCards)
    .slice(-limit)
    .map((card) => ({
      id: card.id,
      type: card.type,
      move: card.acceptedMove?.moveType || null,
      target: card.acceptedMove?.targetNodeId || null,
      landfall_status: normalizeLandfallStatus(card.landfallStatus),
      revealed: normalizeList(card.revealed),
      residue: normalizeList(card.residueCarriedForward),
      world_relation_revealed: normalizeList(card.worldRelationRevealed),
      world_relations_residualized: normalizeList(card.worldRelationsResidualized),
      still_unknown: normalizeList(card.stillUnknown),
      return_condition: card.returnCondition || null,
      reentry_note: card.reentryNote || null,
      lesson_candidate: card.lessonCandidate
        ? {
            lesson_type: card.lessonCandidate.lessonType,
            user_words: card.lessonCandidate.userWords,
            status: card.lessonCandidate.status,
            applies_to_next_proposal: card.lessonCandidate.appliesToNextProposal,
          }
        : null,
    }));
}

export function createTraceCardSummary(traceCard) {
  if (!traceCard) {
    return 'No trace card recorded yet.';
  }

  const residue = normalizeList(traceCard.residueCarriedForward);

  if (traceCard.landfallStatus === FINISH_STATUSES.SAFE) {
    return 'Safe finish: required evidence is present and no unresolved residue remains.';
  }

  if (traceCard.landfallStatus === FINISH_STATUSES.FALSE) {
    return `False finish: goal-looking result still carries ${residue[0] || 'unresolved residue'}.`;
  }

  if (traceCard.landfallStatus === FINISH_STATUSES.PARTIAL) {
    return `Partial finish: useful progress, but ${residue[0] || 'something remains unresolved'}.`;
  }

  return `Open run: carry ${residue[0] || 'remaining unknowns'} into the next move.`;
}
