import { buildRouteProposalRequest } from '../src/llm/routeProposalPrompt.js';
import { createMockRouteProposal } from '../src/llm/routeProposalMock.js';
import { assertRouteProposal } from '../src/llm/routeProposalSchema.js';

export const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
export const DEFAULT_ROUTE_PROPOSAL_MODEL = 'gpt-5.4-mini';

function getRouteProposalModel(env = {}) {
  return (
    env.OPENAI_ROUTE_PROPOSAL_MODEL ||
    env.NIMIRUN_OPENAI_MODEL ||
    env.OPENAI_MODEL ||
    DEFAULT_ROUTE_PROPOSAL_MODEL
  );
}

function getApiKey(env = {}) {
  return env.OPENAI_API_KEY || '';
}

function shouldUseMock(env = {}) {
  const mode = env.NIMIRUN_LLM_MODE || env.LLM_MODE || '';

  return mode.toLowerCase() === 'mock' || !getApiKey(env);
}

function getAllowedMoves(payload = {}) {
  return payload.allowedMoves || payload.allowed_moves || ['inspect', 'ask', 'remember', 'act', 'skip'];
}

function getTargetNodeIds(payload = {}) {
  return payload.targetNodeIds || payload.target_node_ids || [];
}

export function createOpenAIRouteProposalRequest(payload = {}, { env = {} } = {}) {
  const routeRequest = buildRouteProposalRequest({
    carrier: payload.carrier,
    allowedMoves: getAllowedMoves(payload),
    visibleNodes: payload.visibleNodes || payload.visible_nodes || [],
    traceCards: payload.traceCards || payload.trace_cards || [],
    sessionLesson: payload.sessionLesson || payload.session_lesson || null,
  });

  return {
    url: OPENAI_RESPONSES_URL,
    body: {
      model: getRouteProposalModel(env),
      input: routeRequest.input,
      text: routeRequest.text,
    },
  };
}

function extractResponseText(responseJson) {
  if (typeof responseJson?.output_text === 'string') {
    return responseJson.output_text;
  }

  const contentText = (responseJson?.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text)
    .filter((text) => typeof text === 'string')
    .join('\n');

  if (contentText.length > 0) {
    return contentText;
  }

  throw new Error('OpenAI response did not include output text.');
}

async function requestOpenAIRouteProposal(payload, { env, fetchImpl }) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('fetch is not available for OpenAI relay calls.');
  }

  const apiKey = getApiKey(env);
  const request = createOpenAIRouteProposalRequest(payload, { env });
  const response = await fetchImpl(request.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request.body),
  });

  if (!response.ok) {
    throw new Error(`OpenAI route proposal request failed with status ${response.status}.`);
  }

  const responseJson = await response.json();
  const parsed = JSON.parse(extractResponseText(responseJson));

  return assertRouteProposal(parsed, {
    allowedMoves: getAllowedMoves(payload),
    allowedTargetNodeIds: getTargetNodeIds(payload),
    finishStatus: payload.carrier?.finishStatus,
    sessionLesson: payload.sessionLesson || payload.session_lesson || null,
  });
}

export function createRouteProposalRelay({
  env = process.env,
  fetchImpl = globalThis.fetch,
} = {}) {
  return async function routeProposalRelay(payload = {}) {
    const allowedMoves = getAllowedMoves(payload);
    const targetNodeIds = getTargetNodeIds(payload);

    if (shouldUseMock(env)) {
      return {
        mode: 'mock',
        model: null,
        proposal: createMockRouteProposal({
          carrier: payload.carrier,
          allowedMoves,
          targetNodeIds,
        }),
      };
    }

    const model = getRouteProposalModel(env);

    try {
      return {
        mode: 'openai',
        model,
        proposal: await requestOpenAIRouteProposal(payload, { env, fetchImpl }),
      };
    } catch (error) {
      return {
        mode: 'mock-fallback',
        model,
        error: error.message,
        proposal: createMockRouteProposal({
          carrier: payload.carrier,
          allowedMoves,
          targetNodeIds,
        }),
      };
    }
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error(`Invalid JSON body: ${error.message}`));
      }
    });

    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function createJsonResponse(statusCode, payload) {
  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

async function readFetchJsonBody(request) {
  try {
    return await request.json();
  } catch (error) {
    throw new Error(`Invalid JSON body: ${error.message}`);
  }
}

export function createRouteProposalMiddleware(options = {}) {
  const relay = createRouteProposalRelay(options);

  return async function routeProposalMiddleware(req, res, next) {
    const path = new URL(req.url, 'http://nimirun.local').pathname;

    if (path !== '/api/route-proposal') {
      next();
      return;
    }

    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {});
      return;
    }

    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed.' });
      return;
    }

    try {
      const payload = await readJsonBody(req);
      const result = await relay(payload);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 502, {
        error: 'Route proposal relay failed.',
        detail: error.message,
      });
    }
  };
}

export function createRouteProposalFetchHandler(options = {}) {
  const relay = createRouteProposalRelay(options);

  return async function routeProposalFetchHandler(request) {
    if (request.method === 'OPTIONS') {
      return createJsonResponse(204, {});
    }

    if (request.method !== 'POST') {
      return createJsonResponse(405, { error: 'Method not allowed.' });
    }

    try {
      const payload = await readFetchJsonBody(request);
      const result = await relay(payload);

      return createJsonResponse(200, result);
    } catch (error) {
      return createJsonResponse(502, {
        error: 'Route proposal relay failed.',
        detail: error.message,
      });
    }
  };
}
