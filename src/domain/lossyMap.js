import { createFinishJudgment, FINISH_STATUSES } from './finishJudgment.js';
import { applyResourceCost, createCoreResourceState, MOVE_TYPES } from './resourceRules.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function unique(values) {
  return [...new Set(normalizeList(values))];
}

function getNodeById(stateOrScenario, nodeId) {
  const nodes = stateOrScenario?.scenario?.nodes || stateOrScenario?.nodes || [];

  return nodes.find((node) => node.id === nodeId) || null;
}

function getNodeState(state, nodeId) {
  return state.nodeStates[nodeId] || null;
}

function getVisibleNodeIds(state) {
  return state.scenario.nodes
    .filter((node) => {
      const nodeState = getNodeState(state, node.id);

      return nodeState?.visibility !== 'fogged' || nodeState?.inspected === true;
    })
    .map((node) => node.id);
}

function createNodeStates(scenario, inspectedNodeIds = []) {
  const inspected = new Set(inspectedNodeIds);

  return Object.fromEntries(
    (scenario.nodes || []).map((node) => [
      node.id,
      {
        visibility: node.visibility,
        inspected: inspected.has(node.id),
      },
    ])
  );
}

function getInitialRemainingUnknowns(scenario) {
  return unique(
    (scenario.nodes || [])
      .filter((node) => node.visibility !== 'revealed')
      .flatMap((node) => normalizeList(node.residue))
  );
}

function getMoveConfig(node, moveType) {
  return node?.possibleMoves?.[moveType] || {};
}

function getMoveCost(node, moveType) {
  const configCost = getMoveConfig(node, moveType).cost || {};

  return {
    moveType,
    ...configCost,
  };
}

function getInspectReveal(node) {
  return {
    summary: node?.reveal?.inspect?.summary || node?.visibleClue || null,
    evidence: normalizeList(node?.reveal?.inspect?.evidence),
    residue: normalizeList(node?.reveal?.inspect?.residue),
    resolvesUnknowns: normalizeList(node?.reveal?.inspect?.resolvesUnknowns),
    hiddenPressure: normalizeList(node?.hiddenPressure).length
      ? normalizeList(node.hiddenPressure)
      : normalizeList(node?.pressure?.summary ? [node.pressure.summary] : []),
  };
}

function removeResolvedUnknowns(values, resolved) {
  const resolvedSet = new Set(normalizeList(resolved));

  return normalizeList(values).filter((item) => !resolvedSet.has(item));
}

function appendTrace(state, entry) {
  return [...state.trace, entry];
}

function setNodeInspected(state, nodeId) {
  return {
    ...state.nodeStates,
    [nodeId]: {
      ...state.nodeStates[nodeId],
      visibility: 'revealed',
      inspected: true,
    },
  };
}

function createOpenFinishJudgment(state) {
  return createFinishJudgment({
    goalReached: false,
    declaredComplete: false,
    protectedOutcomes: state.contract.protectedOutcomes,
    evidence: state.revealedEvidence,
    residue: state.residue,
    remainingUnknowns: state.remainingUnknowns,
  });
}

function createActFinishJudgment(state, node, residue, remainingUnknowns) {
  const isFalseLandfall = Boolean(node.falseLandfallTrap);
  const isGoalNode = node.id === state.goalNodeId || node.kind === 'safe-finish';

  if (isFalseLandfall) {
    return createFinishJudgment({
      goalReached: true,
      declaredComplete: true,
      protectedOutcomes: state.contract.protectedOutcomes,
      evidence: state.revealedEvidence,
      residue,
      remainingUnknowns,
      note: node.falseLandfallTrap.whyItIsFalseClosure,
    });
  }

  if (isGoalNode) {
    return createFinishJudgment({
      goalReached: true,
      declaredComplete: true,
      protectedOutcomes: state.contract.protectedOutcomes,
      evidence: state.revealedEvidence,
      residue,
      remainingUnknowns,
    });
  }

  return createFinishJudgment({
    goalReached: false,
    declaredComplete: false,
    protectedOutcomes: state.contract.protectedOutcomes,
    evidence: state.revealedEvidence,
    residue,
    remainingUnknowns,
  });
}

function normalizeStateInput(scenario, overrides) {
  const inspectedNodeIds = normalizeList(overrides.inspectedNodeIds);
  const resources = createCoreResourceState(overrides.resources || scenario.resources);
  const baseState = {
    scenario: clone(scenario),
    scenarioId: scenario.id,
    goal: scenario.goal,
    contract: clone(scenario.runtimeContract),
    currentNodeId: overrides.currentNodeId || scenario.runtimeContract.startNodeId,
    goalNodeId: scenario.runtimeContract.goalNodeId,
    resources,
    nodeStates: createNodeStates(scenario, inspectedNodeIds),
    inspectedNodeIds,
    revealedEvidence: unique(overrides.revealedEvidence || []),
    residue: unique(overrides.residue || []),
    remainingUnknowns: unique(overrides.remainingUnknowns ?? getInitialRemainingUnknowns(scenario)),
    trace: normalizeList(overrides.trace).map(clone),
  };

  return {
    ...baseState,
    visibleNodeIds: getVisibleNodeIds(baseState),
    finishJudgment:
      overrides.finishJudgment ||
      createFinishJudgment({
        goalReached: false,
        declaredComplete: false,
        protectedOutcomes: scenario.runtimeContract.protectedOutcomes,
        evidence: overrides.revealedEvidence || [],
        residue: overrides.residue || [],
        remainingUnknowns: overrides.remainingUnknowns ?? getInitialRemainingUnknowns(scenario),
      }),
  };
}

export function createLossyMapState(scenario, overrides = {}) {
  if (!scenario?.runtimeContract?.startNodeId) {
    throw new TypeError('Lossy map state requires a scenario with a runtime contract.');
  }

  return normalizeStateInput(scenario, overrides);
}

export function getLossyMapNodeView(state, nodeId) {
  const node = getNodeById(state, nodeId);
  const nodeState = getNodeState(state, nodeId);

  if (!node || !nodeState) {
    throw new RangeError(`Unknown map node: ${nodeId}`);
  }

  const inspected = nodeState.inspected === true;
  const hiddenPressure = inspected ? getInspectReveal(node).hiddenPressure : [];
  const pressure =
    node.pressure?.hidden === true && !inspected
      ? {
          hidden: true,
          level: 'unknown',
          summary: null,
        }
      : {
          ...clone(node.pressure || { hidden: false, level: 'low', summary: null }),
          hidden: false,
        };

  return {
    id: node.id,
    label: node.label,
    kind: node.kind,
    visibility: nodeState.visibility,
    inspected,
    visibleClue: inspected ? getInspectReveal(node).summary : node.visibleClue || null,
    hiddenPressure,
    pressure,
    remainingUnknowns: inspected ? getInspectReveal(node).residue : [],
    possibleMoves: Object.keys(node.possibleMoves || {}),
    falseLandfallTrap: inspected ? clone(node.falseLandfallTrap || null) : null,
  };
}

export function inspectLossyMapNode(state, nodeId) {
  const node = getNodeById(state, nodeId);

  if (!node) {
    throw new RangeError(`Unknown map node: ${nodeId}`);
  }

  const cost = getMoveCost(node, MOVE_TYPES.INSPECT);
  const resourceResult = applyResourceCost(state.resources, cost);

  if (!resourceResult.applied) {
    return {
      applied: false,
      cost: resourceResult.cost,
      state,
      reason: 'Inspect move is blocked by resource rules.',
      resourceResult,
    };
  }

  const reveal = getInspectReveal(node);
  const nextRemainingUnknowns = unique([
    ...removeResolvedUnknowns(state.remainingUnknowns, reveal.resolvesUnknowns),
    ...reveal.residue,
  ]);
  const nextState = {
    ...state,
    resources: resourceResult.resources,
    nodeStates: setNodeInspected(state, nodeId),
    inspectedNodeIds: unique([...state.inspectedNodeIds, nodeId]),
    revealedEvidence: unique([...state.revealedEvidence, ...reveal.evidence]),
    remainingUnknowns: nextRemainingUnknowns,
    trace: appendTrace(state, {
      moveType: MOVE_TYPES.INSPECT,
      targetNodeId: nodeId,
      classification: 'expected-reveal',
      revealed: reveal.summary ? [reveal.summary] : [],
      evidence: reveal.evidence,
      residue: reveal.residue,
    }),
  };

  nextState.visibleNodeIds = getVisibleNodeIds(nextState);
  nextState.finishJudgment = createOpenFinishJudgment(nextState);

  return {
    applied: true,
    cost: resourceResult.cost,
    reveal,
    state: nextState,
    resourceResult,
  };
}

export function skipLossyMapNode(state, nodeId) {
  const node = getNodeById(state, nodeId);

  if (!node) {
    throw new RangeError(`Unknown map node: ${nodeId}`);
  }

  const residue = unique([
    ...state.residue,
    ...normalizeList(getMoveConfig(node, MOVE_TYPES.SKIP).preservesResidue),
    ...normalizeList(node.residue),
  ]);
  const nextState = {
    ...state,
    residue,
    trace: appendTrace(state, {
      moveType: MOVE_TYPES.SKIP,
      targetNodeId: nodeId,
      classification: 'skipped-with-residue',
      residue: residue.filter((item) => !state.residue.includes(item)),
    }),
  };

  nextState.finishJudgment = createOpenFinishJudgment(nextState);

  return {
    applied: true,
    cost: getMoveCost(node, MOVE_TYPES.SKIP),
    state: nextState,
  };
}

export function actOnLossyMapNode(state, nodeId) {
  const node = getNodeById(state, nodeId);

  if (!node) {
    throw new RangeError(`Unknown map node: ${nodeId}`);
  }

  const cost = getMoveCost(node, MOVE_TYPES.ACT);
  const resourceResult = applyResourceCost(state.resources, cost);

  if (!resourceResult.applied) {
    return {
      applied: false,
      cost: resourceResult.cost,
      state,
      reason: 'Act move is blocked by resource rules.',
      resourceResult,
    };
  }

  const trapResidue = normalizeList(node.falseLandfallTrap?.residue);
  const trapUnknowns = normalizeList(node.falseLandfallTrap?.remainingUnknowns);
  const residue = unique([...state.residue, ...trapResidue]);
  const remainingUnknowns = unique([...state.remainingUnknowns, ...trapUnknowns]);
  const finishJudgment = createActFinishJudgment(state, node, residue, remainingUnknowns);
  const nextState = {
    ...state,
    currentNodeId: nodeId,
    resources: resourceResult.resources,
    residue,
    remainingUnknowns,
    finishJudgment,
    trace: appendTrace(state, {
      moveType: MOVE_TYPES.ACT,
      targetNodeId: nodeId,
      classification:
        finishJudgment.status === FINISH_STATUSES.OPEN
          ? 'route-committed'
          : finishJudgment.status,
      residue: trapResidue,
    }),
  };

  return {
    applied: true,
    cost: resourceResult.cost,
    finishJudgment,
    state: nextState,
    resourceResult,
  };
}

export function serializeLossyMapForPrompt(state) {
  return {
    goal: state.goal,
    current_node: state.currentNodeId,
    visible_nodes: getVisibleNodeIds(state).map((nodeId) => {
      const view = getLossyMapNodeView(state, nodeId);

      return {
        id: view.id,
        label: view.label,
        kind: view.kind,
        visibility: view.visibility,
        inspected: view.inspected,
        visible_clue: view.visibleClue,
        pressure:
          view.pressure.hidden === true
            ? { hidden: true, level: view.pressure.level }
            : view.pressure,
        remaining_unknowns: view.remainingUnknowns,
      };
    }),
    revealed_evidence: state.revealedEvidence,
    residue: state.residue,
    remaining_unknowns: state.remainingUnknowns,
    recent_trace: state.trace.slice(-4).map((entry) => ({
      move: entry.moveType,
      target: entry.targetNodeId,
      result: entry.classification,
      residue: entry.residue,
    })),
    finish_status: state.finishJudgment?.status || FINISH_STATUSES.OPEN,
  };
}
