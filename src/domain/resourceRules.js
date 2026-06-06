import {
  canSpendBotAttention,
  createBotAttention,
  spendBotAttention,
} from './attention.js';
import {
  createContextSlots,
  getContextSlotUsage,
  hasContextCapacity,
} from './contextSlots.js';

export const MOVE_TYPES = Object.freeze({
  INSPECT: 'inspect',
  ASK: 'ask',
  REMEMBER: 'remember',
  ACT: 'act',
  SKIP: 'skip',
});

export const RESOURCE_DECISIONS = Object.freeze({
  ALLOWED: 'allowed',
  BLOCKED: 'blocked',
});

export const DEFAULT_MOVE_RESOURCE_COSTS = Object.freeze({
  [MOVE_TYPES.INSPECT]: Object.freeze({ botAttention: 2, userGuidance: 1, contextSlots: 0 }),
  [MOVE_TYPES.ASK]: Object.freeze({ botAttention: 1, userGuidance: 1, contextSlots: 0 }),
  [MOVE_TYPES.REMEMBER]: Object.freeze({ botAttention: 1, userGuidance: 0, contextSlots: 1 }),
  [MOVE_TYPES.ACT]: Object.freeze({ botAttention: 2, userGuidance: 1, contextSlots: 0 }),
  [MOVE_TYPES.SKIP]: Object.freeze({ botAttention: 0, userGuidance: 0, contextSlots: 0 }),
});

function normalizeNonNegativeInteger(value, fallback = 0) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(0, Math.floor(numberValue));
}

function normalizeNimiqPocket(pocket = {}) {
  return {
    label: pocket.label || 'Nimiq Pocket',
    amount: Number.isFinite(Number(pocket.amount)) ? Number(pocket.amount) : 0,
    currency: pocket.currency || 'NIM',
    mode: pocket.mode || 'simulated-testnet-pocket',
  };
}

function normalizeUserGuidance(userGuidance = {}) {
  return {
    label: userGuidance.label || 'User Guidance',
    level: userGuidance.level || 'ready',
    prompts: normalizeNonNegativeInteger(userGuidance.prompts, 0),
  };
}

export function createCoreResourceState(config = {}) {
  return {
    botAttention: createBotAttention(config.botAttention),
    nimiqPocket: normalizeNimiqPocket(config.nimiqPocket),
    userGuidance: normalizeUserGuidance(config.userGuidance),
    contextSlots: createContextSlots({
      label: config.contextSlots?.label,
      capacity: config.contextSlots?.capacity ?? config.contextSlots?.max,
      items: config.contextSlots?.items,
    }),
  };
}

export function getMoveResourceCost(moveType, overrides = {}) {
  const baseCost = DEFAULT_MOVE_RESOURCE_COSTS[moveType];

  if (!baseCost) {
    throw new RangeError(`Unknown move type: ${moveType}`);
  }

  return {
    moveType,
    botAttention: normalizeNonNegativeInteger(overrides.botAttention ?? baseCost.botAttention),
    userGuidance: normalizeNonNegativeInteger(overrides.userGuidance ?? baseCost.userGuidance),
    contextSlots: normalizeNonNegativeInteger(overrides.contextSlots ?? baseCost.contextSlots),
  };
}

function createCheck({ id, label, passed, message }) {
  return {
    id,
    label,
    passed,
    message,
  };
}

export function evaluateResourceCost(resources, cost) {
  const state = createCoreResourceState(resources);
  const resourceCost = getMoveResourceCost(cost.moveType, cost);
  const contextUsage = getContextSlotUsage(state.contextSlots);

  const checks = {
    botAttention: createCheck({
      id: 'bot-attention',
      label: 'Bot Attention available',
      passed: canSpendBotAttention(state.botAttention, resourceCost.botAttention),
      message: `${resourceCost.botAttention} Bot Attention required, ${state.botAttention.current}/${state.botAttention.max} available.`,
    }),
    contextCapacity: createCheck({
      id: 'context-capacity',
      label: 'Context Capacity available',
      passed: hasContextCapacity(state.contextSlots, resourceCost.contextSlots),
      message: `${resourceCost.contextSlots} context slot required, ${contextUsage.available}/${contextUsage.capacity} available.`,
    }),
    pocketSeparated: createCheck({
      id: 'pocket-separated',
      label: 'Nimiq Pocket is separate',
      passed: resourceCost.botAttention >= 0 && state.nimiqPocket.amount >= 0,
      message: 'Nimiq Pocket is visible but is not spent as Bot Attention in PB-006.',
    }),
  };

  const hardChecksPassed = checks.botAttention.passed && checks.contextCapacity.passed && checks.pocketSeparated.passed;

  return {
    decision: hardChecksPassed ? RESOURCE_DECISIONS.ALLOWED : RESOURCE_DECISIONS.BLOCKED,
    allowed: hardChecksPassed,
    resources: state,
    cost: resourceCost,
    checks,
    requiresUserGuidance: resourceCost.userGuidance > 0,
  };
}

export function applyResourceCost(resources, cost) {
  const evaluation = evaluateResourceCost(resources, cost);

  if (!evaluation.allowed) {
    return {
      applied: false,
      ...evaluation,
    };
  }

  const attentionResult = spendBotAttention(evaluation.resources.botAttention, evaluation.cost.botAttention);
  const nextContextSlots = {
    ...evaluation.resources.contextSlots,
    pendingSlotReservations: evaluation.cost.contextSlots,
  };

  return {
    applied: true,
    ...evaluation,
    resources: {
      ...evaluation.resources,
      botAttention: attentionResult.attention,
      userGuidance: {
        ...evaluation.resources.userGuidance,
        prompts: evaluation.resources.userGuidance.prompts + evaluation.cost.userGuidance,
      },
      contextSlots: nextContextSlots,
    },
  };
}

