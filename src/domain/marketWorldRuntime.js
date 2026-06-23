export const MARKET_WORLD_RUNTIME_RELATION_STATUS = Object.freeze({
  HIDDEN: 'hidden',
  VISIBLE: 'visible',
  REVEALED: 'revealed',
  RESIDUALIZED: 'residualized',
  RESOLVED: 'resolved',
});

const RELATION_ID_PREFIX = 'signal_to_';

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function unique(values) {
  return [...new Set(normalizeList(values))];
}

function isRelationId(value) {
  return typeof value === 'string' && value.startsWith(RELATION_ID_PREFIX);
}

function normalizeRelationState(relation = {}) {
  return {
    id: relation.id,
    status: relation.status || MARKET_WORLD_RUNTIME_RELATION_STATUS.HIDDEN,
    severity: relation.severity || 'medium',
    playerFacingHint: relation.playerFacingHint || null,
    stillUnknown: relation.stillUnknown || relation.playerFacingHint || relation.id,
    revealedBy: normalizeList(relation.revealedBy),
    sourceWitnessIds: normalizeList(relation.sourceWitnessIds),
  };
}

function normalizeRelationStates(relationStates = {}) {
  return Object.fromEntries(
    Object.entries(relationStates).map(([relationId, relation]) => [
      relationId,
      normalizeRelationState({
        id: relation?.id || relationId,
        ...relation,
      }),
    ])
  );
}

function normalizeAction(action = null) {
  if (!action) {
    return null;
  }

  return {
    id: action.id || null,
    label: action.label || action.id || 'Arena action',
    behavior: action.behavior || null,
    moveType: action.moveType || null,
    targetNodeId: action.targetNodeId || null,
    sourceReveals: normalizeList(action.sourceReveals).filter(isRelationId),
    residualizes: normalizeList(action.residualizes).filter(isRelationId),
    finishPressureDelta: clone(action.finishPressureDelta),
    stopCondition: action.stopCondition || null,
    resourcePolicy: action.resourcePolicy || 'no_spend_until_approve',
  };
}

function createFinishPressureState(delta = {}) {
  return {
    falseFinishRisk: delta.falseFinishRisk || 'unchanged',
    partialFinishAvailable: delta.partialFinishAvailable === true,
    safeFinishPossible: delta.safeFinishPossible ?? false,
  };
}

function getRepairReturnCondition(runtimeState) {
  return normalizeList(runtimeState?.repairEdges).find((edge) => edge?.returnCondition)
    ?.returnCondition || null;
}

function getStillUnknownRelations(relationStates = {}) {
  return Object.values(relationStates)
    .filter((relation) =>
      relation.status !== MARKET_WORLD_RUNTIME_RELATION_STATUS.REVEALED &&
      relation.status !== MARKET_WORLD_RUNTIME_RELATION_STATUS.RESOLVED
    )
    .map((relation) => relation.stillUnknown);
}

function getRelationStatusSummary(relationStates = {}) {
  return Object.fromEntries(
    Object.entries(relationStates).map(([relationId, relation]) => [
      relationId,
      relation.status,
    ])
  );
}

function createTransition({
  runtimeState,
  action,
  phase,
  revealedRelations = [],
  residualizedRelations = [],
} = {}) {
  const normalizedAction = normalizeAction(action);

  if (!normalizedAction) {
    return null;
  }

  return {
    phase,
    actionId: normalizedAction.id,
    label: normalizedAction.label,
    moveType: normalizedAction.moveType,
    targetNodeId: normalizedAction.targetNodeId,
    resourcePolicy: normalizedAction.resourcePolicy,
    worldRelationRevealed: unique(revealedRelations),
    worldRelationsResidualized: unique(residualizedRelations),
    stillUnknown: getStillUnknownRelations(runtimeState.relationStates),
    relationStatuses: getRelationStatusSummary(runtimeState.relationStates),
    finishPressureDelta: clone(normalizedAction.finishPressureDelta),
    returnCondition:
      normalizedAction.stopCondition || getRepairReturnCondition(runtimeState),
  };
}

function appendHistory(runtimeState, transition) {
  if (!transition) {
    return normalizeList(runtimeState.actionHistory);
  }

  return [
    ...normalizeList(runtimeState.actionHistory),
    {
      phase: transition.phase,
      actionId: transition.actionId,
      worldRelationRevealed: transition.worldRelationRevealed,
      worldRelationsResidualized: transition.worldRelationsResidualized,
    },
  ];
}

function mergeFinishPressure(current = {}, delta = {}) {
  if (!delta || Object.keys(delta).length === 0) {
    return createFinishPressureState(current);
  }

  return {
    falseFinishRisk: delta.falseFinishRisk || current.falseFinishRisk || 'unchanged',
    partialFinishAvailable:
      delta.partialFinishAvailable === true || current.partialFinishAvailable === true,
    safeFinishPossible:
      delta.safeFinishPossible === 'unchanged'
        ? current.safeFinishPossible ?? false
        : delta.safeFinishPossible ?? current.safeFinishPossible ?? false,
  };
}

function setRelationStatus(relationStates, relationId, status) {
  const relation = relationStates[relationId];

  if (!relation) {
    return relationStates;
  }

  return {
    ...relationStates,
    [relationId]: {
      ...relation,
      status,
    },
  };
}

function applyRelationMutation(relationStates, action) {
  const normalizedAction = normalizeAction(action);
  let nextRelationStates = normalizeRelationStates(relationStates);
  const revealedRelations = [];
  const residualizedRelations = [];
  const reveals = new Set(normalizedAction?.sourceReveals || []);

  for (const relationId of normalizedAction?.residualizes || []) {
    const currentStatus = nextRelationStates[relationId]?.status;

    if (
      currentStatus &&
      currentStatus !== MARKET_WORLD_RUNTIME_RELATION_STATUS.REVEALED &&
      currentStatus !== MARKET_WORLD_RUNTIME_RELATION_STATUS.RESOLVED &&
      !reveals.has(relationId)
    ) {
      nextRelationStates = setRelationStatus(
        nextRelationStates,
        relationId,
        MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED
      );
      residualizedRelations.push(relationId);
    }
  }

  for (const relationId of normalizedAction?.sourceReveals || []) {
    if (nextRelationStates[relationId]) {
      nextRelationStates = setRelationStatus(
        nextRelationStates,
        relationId,
        MARKET_WORLD_RUNTIME_RELATION_STATUS.REVEALED
      );
      revealedRelations.push(relationId);
    }
  }

  return {
    relationStates: nextRelationStates,
    revealedRelations,
    residualizedRelations,
  };
}

export function createMarketWorldRuntimeState(seed = null, overrides = {}) {
  if (!seed) {
    return null;
  }

  return {
    sourceLevelId: seed.sourceLevelId || null,
    title: seed.title || null,
    relationStates: normalizeRelationStates(seed.relationStates),
    repairEdges: clone(seed.repairEdges) || [],
    pendingArenaAction: clone(overrides.pendingArenaAction) || null,
    actionHistory: normalizeList(overrides.actionHistory).map(clone),
    finishPressure: createFinishPressureState(overrides.finishPressure),
    lastTransition: clone(overrides.lastTransition) || null,
  };
}

export function prepareMarketWorldAction(runtimeState, action) {
  if (!runtimeState || !action) {
    return {
      runtimeState,
      transition: null,
    };
  }

  const normalizedAction = normalizeAction(action);
  const nextRuntimeState = {
    ...runtimeState,
    pendingArenaAction: normalizedAction,
  };
  const transition = createTransition({
    runtimeState: nextRuntimeState,
    action: normalizedAction,
    phase: 'prepared',
  });

  return {
    runtimeState: {
      ...nextRuntimeState,
      actionHistory: appendHistory(nextRuntimeState, transition),
      lastTransition: transition,
    },
    transition,
  };
}

export function nameMarketWorldUnknowns(runtimeState, action) {
  if (!runtimeState || !action) {
    return {
      runtimeState,
      transition: null,
    };
  }

  const normalizedAction = normalizeAction(action);
  const mutation = applyRelationMutation(runtimeState.relationStates, {
    ...normalizedAction,
    sourceReveals: [],
  });
  const nextRuntimeState = {
    ...runtimeState,
    relationStates: mutation.relationStates,
    pendingArenaAction: null,
    finishPressure: mergeFinishPressure(
      runtimeState.finishPressure,
      normalizedAction.finishPressureDelta
    ),
  };
  const transition = createTransition({
    runtimeState: nextRuntimeState,
    action: normalizedAction,
    phase: 'unknowns-named',
    residualizedRelations: mutation.residualizedRelations,
  });

  return {
    runtimeState: {
      ...nextRuntimeState,
      actionHistory: appendHistory(nextRuntimeState, transition),
      lastTransition: transition,
    },
    transition,
  };
}

export function findMarketWorldActionForAcceptedMove(runtimeState, scenario, proposal = {}) {
  const pending = runtimeState?.pendingArenaAction;

  if (
    pending?.moveType === proposal.moveType &&
    pending?.targetNodeId === proposal.targetNodeId
  ) {
    return pending;
  }

  return Object.values(scenario?.arenaSpine?.actions || {}).find((action) =>
    action.behavior === 'prepare_move' &&
    action.moveType === proposal.moveType &&
    action.targetNodeId === proposal.targetNodeId
  ) || null;
}

export function approveMarketWorldAction(runtimeState, action) {
  if (!runtimeState || !action) {
    return {
      runtimeState,
      transition: null,
    };
  }

  const normalizedAction = normalizeAction(action);
  const mutation = applyRelationMutation(runtimeState.relationStates, normalizedAction);
  const nextRuntimeState = {
    ...runtimeState,
    relationStates: mutation.relationStates,
    pendingArenaAction: null,
    finishPressure: mergeFinishPressure(
      runtimeState.finishPressure,
      normalizedAction.finishPressureDelta
    ),
  };
  const transition = createTransition({
    runtimeState: nextRuntimeState,
    action: normalizedAction,
    phase: 'approved',
    revealedRelations: mutation.revealedRelations,
    residualizedRelations: mutation.residualizedRelations,
  });

  return {
    runtimeState: {
      ...nextRuntimeState,
      actionHistory: appendHistory(nextRuntimeState, transition),
      lastTransition: transition,
    },
    transition,
  };
}

export function serializeMarketWorldRuntimeForProposalContext(runtimeState) {
  if (!runtimeState) {
    return null;
  }

  return {
    source_level_id: runtimeState.sourceLevelId,
    relation_statuses: getRelationStatusSummary(runtimeState.relationStates),
    still_unknown: getStillUnknownRelations(runtimeState.relationStates),
    pending_arena_action: runtimeState.pendingArenaAction
      ? {
          id: runtimeState.pendingArenaAction.id,
          move_type: runtimeState.pendingArenaAction.moveType,
          target_node_id: runtimeState.pendingArenaAction.targetNodeId,
        }
      : null,
    finish_pressure: clone(runtimeState.finishPressure),
    last_transition: runtimeState.lastTransition
      ? {
          phase: runtimeState.lastTransition.phase,
          action_id: runtimeState.lastTransition.actionId,
          world_relation_revealed: runtimeState.lastTransition.worldRelationRevealed,
          world_relations_residualized:
            runtimeState.lastTransition.worldRelationsResidualized,
          still_unknown: runtimeState.lastTransition.stillUnknown,
          return_condition: runtimeState.lastTransition.returnCondition,
        }
      : null,
  };
}
