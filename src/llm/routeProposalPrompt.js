import { serializeRunCarrierForPrompt } from '../domain/runCarrier.js';
import {
  DEFAULT_ROUTE_PROPOSAL_MOVE_TYPES,
  createRouteProposalTextFormat,
} from './routeProposalSchema.js';

function normalizeVisibleNodes(visibleNodes = []) {
  return visibleNodes.map((node) => ({
    id: node.id,
    label: node.label,
    kind: node.kind,
    status: node.status,
  }));
}

export function buildRouteProposalPrompt({
  carrier,
  allowedMoves = DEFAULT_ROUTE_PROPOSAL_MOVE_TYPES,
  visibleNodes = [],
  sessionLesson = null,
} = {}) {
  if (!carrier?.sessionId) {
    throw new TypeError('Route proposal prompt requires a run carrier.');
  }

  const promptPayload = {
    run_carrier: serializeRunCarrierForPrompt(carrier),
    allowed_moves: allowedMoves,
    visible_nodes: normalizeVisibleNodes(visibleNodes),
    session_lesson: sessionLesson,
    proposal_rules: {
      propose_one_move_only: true,
      include_considered_alternative: true,
      include_cut_price: true,
      include_remaining_residue: true,
      do_not_claim_safe_finish: true,
    },
  };

  return {
    system: [
      'You are Pocket Bot, a bounded route-proposal helper inside NimiRun.',
      'Use only the supplied run_carrier, visible_nodes, allowed_moves, and session_lesson.',
      'Propose one next move that spends attention carefully in a lossy map.',
      'Do not request wallet authority, checkout, payment execution, browser actions, external tools, or persistent memory.',
      'Do not claim certainty about uninspected terrain and do not claim safe finish.',
      'Avoid the literal phrases "whole terrain", "no unknowns remain", "complete certainty", and "safe finish" in proposal text.',
      'Return only the requested structured route_proposal object.',
    ].join('\n'),
    user: `Create one route_proposal JSON object for this run state:\n${JSON.stringify(
      promptPayload,
      null,
      2
    )}`,
    payload: promptPayload,
  };
}

export function buildRouteProposalRequest(options = {}) {
  const prompt = buildRouteProposalPrompt(options);

  return {
    input: [
      {
        role: 'system',
        content: prompt.system,
      },
      {
        role: 'user',
        content: prompt.user,
      },
    ],
    text: {
      format: createRouteProposalTextFormat(),
    },
    prompt,
  };
}
