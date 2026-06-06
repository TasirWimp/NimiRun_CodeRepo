import { createCoreResourceState, MOVE_TYPES } from './resourceRules.js';
import { createRunCarrier } from './runCarrier.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createCheck({ id, label, passed, message }) {
  return {
    id,
    label,
    passed,
    message,
  };
}

function getNodeIds(scenario) {
  return new Set((scenario.nodes || []).map((node) => node.id));
}

function getVisibleNodeIds(scenario) {
  return (scenario.nodes || [])
    .filter((node) => node.visibility !== 'fogged')
    .map((node) => node.id);
}

function getInitialResidue(scenario) {
  return [
    ...new Set(
      (scenario.nodes || [])
        .filter((node) => node.visibility !== 'revealed')
        .flatMap((node) => node.residue || [])
    ),
  ];
}

export function validateScenarioContract(scenario) {
  const contract = scenario?.runtimeContract || {};
  const nodeIds = getNodeIds(scenario || {});
  const allowedMoveValues = Object.values(MOVE_TYPES);

  const checks = {
    goal: createCheck({
      id: 'goal',
      label: 'Goal',
      passed: typeof scenario?.goal === 'string' && scenario.goal.length > 0,
      message: 'Scenario requires a player-facing goal.',
    }),
    startNode: createCheck({
      id: 'start-node',
      label: 'Start node',
      passed: Boolean(contract.startNodeId && nodeIds.has(contract.startNodeId)),
      message: 'Scenario contract requires a valid start node.',
    }),
    goalNode: createCheck({
      id: 'goal-node',
      label: 'Goal node',
      passed: Boolean(contract.goalNodeId && nodeIds.has(contract.goalNodeId)),
      message: 'Scenario contract requires a valid goal node.',
    }),
    allowedMoves: createCheck({
      id: 'allowed-moves',
      label: 'Allowed moves',
      passed:
        Array.isArray(contract.allowedMoves) &&
        contract.allowedMoves.length > 0 &&
        contract.allowedMoves.every((move) => allowedMoveValues.includes(move)),
      message: 'Scenario contract requires valid allowed moves.',
    }),
    resources: createCheck({
      id: 'resources',
      label: 'Resource budgets',
      passed: Boolean(scenario?.resources?.botAttention && scenario?.resources?.contextSlots && scenario?.resources?.nimiqPocket),
      message: 'Scenario requires Bot Attention, Context Slots, and Nimiq Pocket resources.',
    }),
    protectedOutcomes: createCheck({
      id: 'protected-outcomes',
      label: 'Protected outcomes',
      passed: Array.isArray(contract.protectedOutcomes) && contract.protectedOutcomes.length > 0,
      message: 'Scenario contract requires at least one protected outcome.',
    }),
    stopConditions: createCheck({
      id: 'stop-conditions',
      label: 'Stop conditions',
      passed: Array.isArray(contract.stopConditions) && contract.stopConditions.length > 0,
      message: 'Scenario contract requires stop conditions.',
    }),
  };

  const valid = Object.values(checks).every((check) => check.passed);

  return {
    valid,
    checks,
    messages: Object.values(checks)
      .filter((check) => !check.passed)
      .map((check) => check.message),
  };
}

export function createRunSession(scenario, { id = null } = {}) {
  const validation = validateScenarioContract(scenario);

  if (!validation.valid) {
    throw new Error(`Invalid scenario contract: ${validation.messages.join(' ')}`);
  }

  const resources = createCoreResourceState(scenario.resources);
  const session = {
    id: id || `run-${scenario.id}`,
    scenarioId: scenario.id,
    goal: scenario.goal,
    contract: clone(scenario.runtimeContract),
    status: 'open',
    currentNodeId: scenario.runtimeContract.startNodeId,
    resources,
    visibleNodeIds: getVisibleNodeIds(scenario),
    residue: getInitialResidue(scenario),
    trace: [],
  };

  return {
    ...session,
    carrier: createRunCarrier({
      ...session,
      sessionId: session.id,
    }),
  };
}
