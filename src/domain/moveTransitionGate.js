export const TRANSITION_GATE_STATUS = Object.freeze({
  PENDING: 'pending',
  CLOSED: 'closed',
});

export const TRANSITION_CLASSIFICATIONS = Object.freeze({
  EXPECTED_REVEAL: 'expected_reveal',
  NO_EFFECT: 'no_effect',
  WRONG_ROUTE: 'wrong_route',
  RISK_BOUNDARY: 'risk_boundary',
  UNREADABLE_STATE: 'unreadable_state',
  REPAIR_NEEDED: 'repair_needed',
});

const RESIDUE_REQUIRED_CLASSIFICATIONS = new Set([
  TRANSITION_CLASSIFICATIONS.NO_EFFECT,
  TRANSITION_CLASSIFICATIONS.WRONG_ROUTE,
  TRANSITION_CLASSIFICATIONS.RISK_BOUNDARY,
  TRANSITION_CLASSIFICATIONS.UNREADABLE_STATE,
  TRANSITION_CLASSIFICATIONS.REPAIR_NEEDED,
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function assertKnownClassification(classification) {
  if (!Object.values(TRANSITION_CLASSIFICATIONS).includes(classification)) {
    throw new RangeError(`Unknown transition classification: ${classification}`);
  }
}

export function createMoveTransitionGate({
  id,
  sessionId,
  beforeState,
  proposal,
  resourceEvaluation,
  expectedEvidence = [],
}) {
  if (!sessionId) {
    throw new TypeError('Transition gate requires a session id.');
  }

  if (!beforeState) {
    throw new TypeError('Transition gate requires before-state.');
  }

  if (!proposal?.moveType || !proposal?.targetNodeId) {
    throw new TypeError('Transition gate requires a proposal move type and target node.');
  }

  return {
    id: id || `transition-${sessionId}-${proposal.moveType}-${proposal.targetNodeId}`,
    sessionId,
    status: TRANSITION_GATE_STATUS.PENDING,
    beforeState: clone(beforeState),
    proposal: clone(proposal),
    resourceEvaluation: clone(resourceEvaluation),
    expectedEvidence: normalizeList(expectedEvidence),
    afterState: null,
    observedEvidence: [],
    classification: null,
    residue: [],
  };
}

export function isTransitionClosed(gate) {
  return (
    gate?.status === TRANSITION_GATE_STATUS.CLOSED &&
    gate.afterState !== null &&
    gate.classification !== null
  );
}

export function attachTransitionAfterState(gate, {
  afterState,
  observedEvidence = [],
  classification,
  residue = [],
}) {
  if (!gate || gate.status !== TRANSITION_GATE_STATUS.PENDING) {
    throw new Error('Only a pending transition gate can receive after-state.');
  }

  if (!afterState) {
    throw new TypeError('Transition closure requires after-state.');
  }

  assertKnownClassification(classification);

  const normalizedResidue = normalizeList(residue);

  if (RESIDUE_REQUIRED_CLASSIFICATIONS.has(classification) && normalizedResidue.length === 0) {
    throw new Error(`${classification} transitions must carry explicit residue.`);
  }

  return {
    ...gate,
    status: TRANSITION_GATE_STATUS.CLOSED,
    afterState: clone(afterState),
    observedEvidence: normalizeList(observedEvidence),
    classification,
    residue: normalizedResidue,
  };
}

