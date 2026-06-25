import { FINISH_STATUSES } from '../../domain/finishJudgment.js';
import { MARKET_WORLD_RUNTIME_RELATION_STATUS } from '../../domain/marketWorldRuntime.js';

const RELATION_IDS = Object.freeze({
  SUPPORT: 'signal_to_support',
  EXIT: 'signal_to_exit',
  CROWD: 'signal_to_crowd',
  EVENT: 'signal_to_event',
});

const FINISH_GATE_STATES = Object.freeze({
  [FINISH_STATUSES.OPEN]: 'open',
  [FINISH_STATUSES.FALSE]: 'false',
  [FINISH_STATUSES.PARTIAL]: 'partial',
  [FINISH_STATUSES.SAFE]: 'safe',
});

function normalizeTraceCards(traceCards = []) {
  return Array.isArray(traceCards) ? traceCards.filter(Boolean) : [];
}

function getRelation(runtimeState, relationId) {
  return runtimeState?.relationStates?.[relationId] || {
    id: relationId,
    status: MARKET_WORLD_RUNTIME_RELATION_STATUS.HIDDEN,
  };
}

function getRelationStatus(runtimeState, relationId) {
  return getRelation(runtimeState, relationId).status ||
    MARKET_WORLD_RUNTIME_RELATION_STATUS.HIDDEN;
}

function relationSurface({ runtimeState, relationId, stateByStatus }) {
  const relation = getRelation(runtimeState, relationId);
  const relationStatus = relation.status || MARKET_WORLD_RUNTIME_RELATION_STATUS.HIDDEN;

  return {
    relationId,
    relationStatus,
    state: stateByStatus[relationStatus] || stateByStatus.default || 'hidden',
    severity: relation.severity || 'medium',
    hint: relation.playerFacingHint || relation.stillUnknown || null,
    stillUnknown: relation.stillUnknown || null,
  };
}

function createGoldenSignalSurface({ runtimeState, selectedNodeId, finishStatus }) {
  const actedOn =
    finishStatus !== FINISH_STATUSES.OPEN ||
    (
      runtimeState?.lastTransition?.phase === 'approved' &&
      runtimeState.lastTransition.targetNodeId === 'bright-signal'
    );

  return {
    nodeId: 'bright-signal',
    state: actedOn ? 'acted-on' : selectedNodeId === 'bright-signal' ? 'selected' : 'tempting',
    pressure: 'bright-route',
  };
}

function createSupportWellSurface(runtimeState) {
  return relationSurface({
    runtimeState,
    relationId: RELATION_IDS.SUPPORT,
    stateByStatus: {
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.HIDDEN]: 'hidden',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.VISIBLE]: 'hinted',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED]: 'hinted',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.REVEALED]: 'stable',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.RESOLVED]: 'stable',
      default: 'hidden',
    },
  });
}

function createExitBridgeSurface(runtimeState) {
  return relationSurface({
    runtimeState,
    relationId: RELATION_IDS.EXIT,
    stateByStatus: {
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.HIDDEN]: 'hidden',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.VISIBLE]: 'hinted',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED]: 'hinted',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.REVEALED]: 'revealed',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.RESOLVED]: 'revealed',
      default: 'hidden',
    },
  });
}

function createCrowdPressureSurface(runtimeState) {
  return relationSurface({
    runtimeState,
    relationId: RELATION_IDS.CROWD,
    stateByStatus: {
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.HIDDEN]: 'hidden',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.VISIBLE]: 'visible',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED]: 'hinted',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.REVEALED]: 'active',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.RESOLVED]: 'active',
      default: 'hidden',
    },
  });
}

function createEventGateSurface(runtimeState) {
  return relationSurface({
    runtimeState,
    relationId: RELATION_IDS.EVENT,
    stateByStatus: {
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.HIDDEN]: 'visible',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.VISIBLE]: 'visible',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED]: 'hinted',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.REVEALED]: 'witnessed',
      [MARKET_WORLD_RUNTIME_RELATION_STATUS.RESOLVED]: 'witnessed',
      default: 'visible',
    },
  });
}

function traceHasResidue(traceCard) {
  if (!traceCard) {
    return false;
  }

  return (
    traceCard.landfallStatus === FINISH_STATUSES.FALSE ||
    traceCard.landfallStatus === FINISH_STATUSES.PARTIAL ||
    (Array.isArray(traceCard.residue) && traceCard.residue.length > 0) ||
    (Array.isArray(traceCard.stillUnknown) && traceCard.stillUnknown.length > 0) ||
    (Array.isArray(traceCard.unresolvedRelations) && traceCard.unresolvedRelations.length > 0)
  );
}

function createTraceMemorySurface(traceCards = []) {
  const cards = normalizeTraceCards(traceCards);

  if (cards.length === 0) {
    return {
      state: 'empty',
      traceCount: 0,
    };
  }

  return {
    state: cards.some(traceHasResidue) ? 'residue-carrier' : 'active',
    traceCount: cards.length,
  };
}

function createFinishGateSurface(finishJudgment = null) {
  const finishStatus = finishJudgment?.status || FINISH_STATUSES.OPEN;

  return {
    state: FINISH_GATE_STATES[finishStatus] || 'open',
    finishStatus,
    missingEvidence: Array.isArray(finishJudgment?.missingEvidence)
      ? finishJudgment.missingEvidence
      : [],
    residue: Array.isArray(finishJudgment?.residue) ? finishJudgment.residue : [],
    remainingUnknowns: Array.isArray(finishJudgment?.remainingUnknowns)
      ? finishJudgment.remainingUnknowns
      : [],
  };
}

function collectResidualizedRelationIds(runtimeState) {
  return Object.entries(runtimeState?.relationStates || {})
    .filter(([, relation]) =>
      relation?.status === MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED
    )
    .map(([relationId]) => relationId);
}

function collectRevealedRelationIds(runtimeState) {
  return Object.entries(runtimeState?.relationStates || {})
    .filter(([, relation]) =>
      relation?.status === MARKET_WORLD_RUNTIME_RELATION_STATUS.REVEALED ||
      relation?.status === MARKET_WORLD_RUNTIME_RELATION_STATUS.RESOLVED
    )
    .map(([relationId]) => relationId);
}

export function createMarketWorldRenderPlan({
  runtimeState = null,
  finishJudgment = null,
  selectedNodeId = null,
  traceCards = [],
} = {}) {
  const finishStatus = finishJudgment?.status || FINISH_STATUSES.OPEN;

  return {
    sourceLevelId: runtimeState?.sourceLevelId || null,
    selectedNodeId,
    lastTransition: runtimeState?.lastTransition || null,
    relationStatuses: {
      [RELATION_IDS.SUPPORT]: getRelationStatus(runtimeState, RELATION_IDS.SUPPORT),
      [RELATION_IDS.EXIT]: getRelationStatus(runtimeState, RELATION_IDS.EXIT),
      [RELATION_IDS.CROWD]: getRelationStatus(runtimeState, RELATION_IDS.CROWD),
      [RELATION_IDS.EVENT]: getRelationStatus(runtimeState, RELATION_IDS.EVENT),
    },
    residualizedRelationIds: collectResidualizedRelationIds(runtimeState),
    revealedRelationIds: collectRevealedRelationIds(runtimeState),
    surfaces: {
      goldenSignal: createGoldenSignalSurface({
        runtimeState,
        selectedNodeId,
        finishStatus,
      }),
      supportWell: createSupportWellSurface(runtimeState),
      exitBridge: createExitBridgeSurface(runtimeState),
      crowdPressure: createCrowdPressureSurface(runtimeState),
      eventGate: createEventGateSurface(runtimeState),
      traceMemory: createTraceMemorySurface(traceCards),
      finishGate: createFinishGateSurface(finishJudgment),
    },
  };
}
