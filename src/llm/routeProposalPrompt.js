import { serializeRunCarrierForPrompt } from '../domain/runCarrier.js';
import {
  serializeSessionLessonForPrompt,
  serializeTraceCardsForProposalContext,
} from '../domain/traces.js';
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
    visible_clue: node.visibleClue || node.visible_clue || null,
    remaining_unknowns: node.remainingUnknowns || node.remaining_unknowns || [],
  }));
}

export function buildRouteProposalPrompt({
  carrier,
  allowedMoves = DEFAULT_ROUTE_PROPOSAL_MOVE_TYPES,
  visibleNodes = [],
  traceCards = [],
  sessionLesson = null,
} = {}) {
  if (!carrier?.sessionId) {
    throw new TypeError('Route proposal prompt requires a run carrier.');
  }

  const promptPayload = {
    run_carrier: serializeRunCarrierForPrompt(carrier),
    allowed_moves: allowedMoves,
    visible_nodes: normalizeVisibleNodes(visibleNodes),
    trace_cards: serializeTraceCardsForProposalContext(traceCards),
    session_lesson: serializeSessionLessonForPrompt(sessionLesson),
    proposal_rules: {
      propose_one_move_only: true,
      include_considered_alternative: true,
      include_cut_price: true,
      include_remaining_residue: true,
      final_status_requires_runtime_judgment: true,
    },
  };

  return {
    system: [
      'You are Pocket Bot, a bounded route-proposal helper inside NimiRun.',
      'Use only the supplied run_carrier, visible_nodes, allowed_moves, trace_cards, and session_lesson.',
      'Propose one next move that spends attention carefully in a lossy map.',
      'Stay inside the supplied game boundary: propose only allowed map moves and never ask for custody permissions, transfer or signing steps, purchase flows, browser control, outside services, durable memory, or uncontrolled actions.',
      'Do not claim certainty about uninspected terrain or final outcome.',
      'When discussing outcomes, say "finish conditions" or "runtime judgment" instead of final-success labels.',
      'Avoid the literal phrases "whole terrain", "no unknowns remain", "complete certainty", and any final-success label in proposal text.',
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
