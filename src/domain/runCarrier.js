import { FINISH_STATUSES } from './finishJudgment.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function summarizeResources(resources = {}) {
  return {
    botAttention: resources.botAttention
      ? {
          current: resources.botAttention.current,
          max: resources.botAttention.max,
        }
      : null,
    nimiqPocket: resources.nimiqPocket
      ? {
          amount: resources.nimiqPocket.amount,
          currency: resources.nimiqPocket.currency,
          mode: resources.nimiqPocket.mode,
        }
      : null,
    contextSlots: resources.contextSlots
      ? {
          used: resources.contextSlots.items?.length || 0,
          capacity: resources.contextSlots.capacity,
          items: (resources.contextSlots.items || []).map((item) => ({
            id: item.id,
            type: item.type,
            label: item.label,
          })),
        }
      : null,
  };
}

export function createRunCarrier({
  sessionId,
  goal,
  currentNodeId,
  resources,
  visibleNodeIds = [],
  residue = [],
  trace = [],
  finishStatus = FINISH_STATUSES.OPEN,
}) {
  return {
    sessionId,
    goal,
    currentNodeId,
    resources: summarizeResources(resources),
    visibleNodeIds: normalizeList(visibleNodeIds),
    residue: normalizeList(residue),
    revealedEvidence: [],
    trace: trace.map(clone),
    finishStatus,
  };
}

export function applyTransitionToRunCarrier(carrier, transition) {
  if (transition?.status !== 'closed') {
    throw new Error('Run carrier can only accept a closed transition.');
  }

  const nextResidue = [
    ...normalizeList(carrier.residue),
    ...normalizeList(transition.residue),
  ];
  const nextEvidence = [
    ...normalizeList(carrier.revealedEvidence),
    ...normalizeList(transition.observedEvidence),
  ];
  const traceEntry = {
    transitionId: transition.id,
    moveType: transition.proposal.moveType,
    targetNodeId: transition.proposal.targetNodeId,
    classification: transition.classification,
    residue: normalizeList(transition.residue),
    observedEvidence: normalizeList(transition.observedEvidence),
  };

  return {
    ...carrier,
    currentNodeId: transition.afterState.currentNodeId || carrier.currentNodeId,
    resources: summarizeResources(transition.afterState.resources || carrier.resources),
    visibleNodeIds: normalizeList(transition.afterState.visibleNodeIds || carrier.visibleNodeIds),
    residue: [...new Set(nextResidue)],
    revealedEvidence: [...new Set(nextEvidence)],
    trace: [...carrier.trace, traceEntry],
    finishStatus: carrier.finishStatus || FINISH_STATUSES.OPEN,
  };
}

export function serializeRunCarrierForPrompt(carrier) {
  return {
    goal: carrier.goal,
    current_node: carrier.currentNodeId,
    resources: carrier.resources,
    visible_nodes: carrier.visibleNodeIds,
    revealed_evidence: carrier.revealedEvidence,
    residue: carrier.residue,
    recent_trace: carrier.trace.slice(-4).map((entry) => ({
      move: entry.moveType,
      target: entry.targetNodeId,
      result: entry.classification,
      residue: entry.residue,
    })),
    finish_status: carrier.finishStatus || FINISH_STATUSES.OPEN,
  };
}

