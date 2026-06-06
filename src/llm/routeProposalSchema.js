import { FINISH_STATUSES } from '../domain/finishJudgment.js';
import { MOVE_TYPES } from '../domain/resourceRules.js';

export const DEFAULT_ROUTE_PROPOSAL_MOVE_TYPES = Object.freeze([
  MOVE_TYPES.INSPECT,
  MOVE_TYPES.ASK,
  MOVE_TYPES.REMEMBER,
  MOVE_TYPES.ACT,
  MOVE_TYPES.SKIP,
]);

export const ROUTE_PROPOSAL_RESPONSE_KEY = 'route_proposal';

export const ROUTE_PROPOSAL_JSON_SCHEMA = Object.freeze({
  type: 'object',
  additionalProperties: false,
  properties: {
    route_proposal: {
      type: 'object',
      additionalProperties: false,
      properties: {
        move_type: {
          type: 'string',
          enum: DEFAULT_ROUTE_PROPOSAL_MOVE_TYPES,
        },
        target_node: {
          type: 'string',
          minLength: 1,
        },
        reason: {
          type: 'string',
          minLength: 1,
        },
        resource_cost: {
          type: 'object',
          additionalProperties: false,
          properties: {
            bot_attention: {
              type: 'integer',
              minimum: 0,
            },
            user_attention: {
              type: 'integer',
              minimum: 0,
            },
            context_slots: {
              type: 'integer',
              minimum: 0,
            },
          },
          required: ['bot_attention', 'user_attention', 'context_slots'],
        },
        considered_alternatives: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              move: {
                type: 'string',
                minLength: 1,
              },
              why_not_selected: {
                type: 'string',
                minLength: 1,
              },
            },
            required: ['move', 'why_not_selected'],
          },
        },
        cut_price: {
          type: 'object',
          additionalProperties: false,
          properties: {
            reveals: {
              type: 'array',
              minItems: 1,
              items: { type: 'string', minLength: 1 },
            },
            suppresses: {
              type: 'array',
              minItems: 1,
              items: { type: 'string', minLength: 1 },
            },
            leaves_residue: {
              type: 'array',
              minItems: 1,
              items: { type: 'string', minLength: 1 },
            },
          },
          required: ['reveals', 'suppresses', 'leaves_residue'],
        },
        stop_condition: {
          type: 'string',
          minLength: 1,
        },
      },
      required: [
        'move_type',
        'target_node',
        'reason',
        'resource_cost',
        'considered_alternatives',
        'cut_price',
        'stop_condition',
      ],
    },
  },
  required: ['route_proposal'],
});

const FORBIDDEN_KEY_PATTERN =
  /api[_-]?key|secret|wallet[_-]?authority|checkout|payment|tool[_-]?calls?|tool[_-]?requests?|browser[_-]?action|spend[_-]?nimiq|mainnet|persistent[_-]?memory|private[_-]?key|execute[_-]?trade/i;

const FORBIDDEN_TEXT_PATTERN =
  /wallet authority|checkout|payment execution|mainnet spend|private key|persistent memory|execute trade|brokerage execution|unbounded tool/i;

const TERRAIN_CERTAINTY_PATTERN =
  /proves? (the )?(whole|entire) (map|terrain)|no unknowns remain|nothing remains unknown|fully known|complete certainty/i;

const TERRAIN_CERTAINTY_CAUTION_PATTERN =
  /do not|does not|doesn't|cannot|can't|must not|without claiming|not claim|not proving|not prove|avoid claiming|residue remains/i;

const SAFE_FINISH_PATTERN = /\bsafe[\s_-]?finish\b/i;

function getRouteProposalPayload(raw) {
  if (raw?.[ROUTE_PROPOSAL_RESPONSE_KEY]) {
    return raw[ROUTE_PROPOSAL_RESPONSE_KEY];
  }

  if (raw?.move_type) {
    return raw;
  }

  if (raw?.moveType && raw?.targetNodeId) {
    return {
      id: raw.id,
      move_type: raw.moveType,
      target_node: raw.targetNodeId,
      reason: raw.reason,
      resource_cost: {
        bot_attention: raw.resourceCost?.botAttention,
        user_attention: raw.resourceCost?.userGuidance,
        context_slots: raw.resourceCost?.contextSlots,
      },
      considered_alternatives: (raw.consideredAlternatives || []).map((alternative) => ({
        move: alternative.move,
        why_not_selected: alternative.whyNotSelected,
      })),
      cut_price: {
        reveals: raw.cutPrice?.reveals,
        suppresses: raw.cutPrice?.suppresses,
        leaves_residue: raw.cutPrice?.leavesResidue,
      },
      stop_condition: raw.stopCondition,
    };
  }

  return null;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeStringList(value) {
  return Array.isArray(value)
    ? value.map(normalizeString).filter((item) => item.length > 0)
    : [];
}

function collectText(value, output = []) {
  if (typeof value === 'string') {
    output.push(value);
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectText(item, output));
    return output;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectText(item, output));
  }

  return output;
}

function collectTerrainCertaintyAssertionText(payload) {
  return [
    payload.reason,
    payload.stop_condition,
    ...normalizeStringList(payload.cut_price?.reveals),
  ]
    .filter(Boolean)
    .join('\n');
}

function collectUnsafeFindings(value, path = [], output = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectUnsafeFindings(item, [...path, String(index)], output));
    return output;
  }

  if (!value || typeof value !== 'object') {
    if (typeof value === 'string' && FORBIDDEN_TEXT_PATTERN.test(value)) {
      output.push(`${path.join('.') || 'proposal'} includes unsafe authority language.`);
    }
    return output;
  }

  Object.entries(value).forEach(([key, item]) => {
    const nextPath = [...path, key];

    if (FORBIDDEN_KEY_PATTERN.test(key)) {
      output.push(`${nextPath.join('.')} requests unsafe authority.`);
    }

    collectUnsafeFindings(item, nextPath, output);
  });

  return output;
}

function isTerrainCertaintyCaution(sentence) {
  if (TERRAIN_CERTAINTY_CAUTION_PATTERN.test(sentence)) {
    return true;
  }

  return /unknowns? remain/i.test(sentence) && !/no unknowns remain|nothing remains unknown/i.test(sentence);
}

function addRequiredStringError(errors, payload, key) {
  if (!isNonEmptyString(payload?.[key])) {
    errors.push(`${key} is required.`);
  }
}

function validateResourceCost(errors, cost) {
  if (!cost || typeof cost !== 'object' || Array.isArray(cost)) {
    errors.push('resource_cost is required.');
    return;
  }

  [
    ['bot_attention', 'resource_cost.bot_attention must be a non-negative integer.'],
    ['user_attention', 'resource_cost.user_attention must be a non-negative integer.'],
    ['context_slots', 'resource_cost.context_slots must be a non-negative integer.'],
  ].forEach(([key, message]) => {
    if (!isNonNegativeInteger(cost[key])) {
      errors.push(message);
    }
  });
}

function validateConsideredAlternatives(errors, alternatives) {
  if (!Array.isArray(alternatives) || alternatives.length === 0) {
    errors.push('considered_alternatives must include at least one rejected alternative.');
    return;
  }

  alternatives.forEach((alternative, index) => {
    if (!isNonEmptyString(alternative?.move)) {
      errors.push(`considered_alternatives.${index}.move is required.`);
    }
    if (!isNonEmptyString(alternative?.why_not_selected)) {
      errors.push(`considered_alternatives.${index}.why_not_selected is required.`);
    }
  });
}

function validateCutPrice(errors, cutPrice) {
  if (!cutPrice || typeof cutPrice !== 'object' || Array.isArray(cutPrice)) {
    errors.push('cut_price is required.');
    return;
  }

  [
    ['reveals', 'cut_price.reveals must include at least one item.'],
    ['suppresses', 'cut_price.suppresses must include at least one item.'],
    ['leaves_residue', 'cut_price.leaves_residue must include at least one item.'],
  ].forEach(([key, message]) => {
    if (normalizeStringList(cutPrice[key]).length === 0) {
      errors.push(message);
    }
  });
}

function normalizeProposal(payload) {
  const moveType = normalizeString(payload.move_type);
  const targetNodeId = normalizeString(payload.target_node);

  return {
    id: payload.id || `proposal-${moveType}-${targetNodeId}`,
    source: 'route-proposal',
    moveType,
    targetNodeId,
    reason: normalizeString(payload.reason),
    resourceCost: {
      moveType,
      botAttention: payload.resource_cost.bot_attention,
      userGuidance: payload.resource_cost.user_attention,
      contextSlots: payload.resource_cost.context_slots,
    },
    consideredAlternatives: payload.considered_alternatives.map((alternative) => ({
      move: normalizeString(alternative.move),
      whyNotSelected: normalizeString(alternative.why_not_selected),
    })),
    cutPrice: {
      reveals: normalizeStringList(payload.cut_price.reveals),
      suppresses: normalizeStringList(payload.cut_price.suppresses),
      leavesResidue: normalizeStringList(payload.cut_price.leaves_residue),
    },
    stopCondition: normalizeString(payload.stop_condition),
  };
}

export function createRouteProposalTextFormat() {
  return {
    type: 'json_schema',
    name: 'nimi_run_route_proposal',
    strict: true,
    schema: ROUTE_PROPOSAL_JSON_SCHEMA,
  };
}

export function validateRouteProposal(raw, options = {}) {
  const errors = [];
  const payload = getRouteProposalPayload(raw);
  const allowedMoves = options.allowedMoves || DEFAULT_ROUTE_PROPOSAL_MOVE_TYPES;
  const allowedTargetNodeIds = options.allowedTargetNodeIds || [];
  const finishStatus = options.finishStatus || FINISH_STATUSES.OPEN;

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      valid: false,
      proposal: null,
      errors: ['route_proposal is required.'],
    };
  }

  addRequiredStringError(errors, payload, 'move_type');
  addRequiredStringError(errors, payload, 'target_node');
  addRequiredStringError(errors, payload, 'reason');
  validateResourceCost(errors, payload.resource_cost);
  validateConsideredAlternatives(errors, payload.considered_alternatives);
  validateCutPrice(errors, payload.cut_price);
  addRequiredStringError(errors, payload, 'stop_condition');

  if (isNonEmptyString(payload.move_type) && !allowedMoves.includes(payload.move_type)) {
    errors.push(`move_type must be one of: ${allowedMoves.join(', ')}.`);
  }

  if (
    isNonEmptyString(payload.target_node) &&
    allowedTargetNodeIds.length > 0 &&
    !allowedTargetNodeIds.includes(payload.target_node)
  ) {
    errors.push('target_node must be one of the provided scenario nodes.');
  }

  const unsafeFindings = collectUnsafeFindings(payload);
  errors.push(...unsafeFindings);

  const allText = collectText(payload).join('\n');
  const terrainCertaintyAssertionText = collectTerrainCertaintyAssertionText(payload);

  const hasTerrainCertaintyClaim = terrainCertaintyAssertionText
    .split(/[.!?\n]/)
    .some(
      (sentence) =>
        TERRAIN_CERTAINTY_PATTERN.test(sentence) &&
        !isTerrainCertaintyCaution(sentence)
    );

  if (hasTerrainCertaintyClaim) {
    errors.push('proposal must not claim complete terrain certainty from one route choice.');
  }

  if (finishStatus !== FINISH_STATUSES.SAFE && SAFE_FINISH_PATTERN.test(allText)) {
    errors.push('proposal must not claim safe finish before deterministic finish judgment.');
  }

  if (errors.length > 0) {
    return {
      valid: false,
      proposal: null,
      errors,
    };
  }

  return {
    valid: true,
    proposal: normalizeProposal(payload),
    errors: [],
  };
}

export function assertRouteProposal(raw, options = {}) {
  const validation = validateRouteProposal(raw, options);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  return validation.proposal;
}
