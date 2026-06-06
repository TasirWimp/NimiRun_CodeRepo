import { createMockRouteProposal } from './routeProposalMock.js';
import { validateRouteProposal } from './routeProposalSchema.js';

export const DEFAULT_ROUTE_PROPOSAL_ENDPOINT = '/api/route-proposal';

function assertBackendRelayEndpoint(endpoint) {
  const parsed = new URL(endpoint, 'http://nimirun.local');

  if (parsed.hostname.includes('openai.com')) {
    throw new Error('Browser client must call the backend route proposal relay.');
  }
}

function normalizeFetchResponsePayload(data) {
  if (data?.proposal) {
    return data.proposal;
  }

  return data;
}

export async function requestRouteProposal({
  carrier,
  allowedMoves,
  targetNodeIds = [],
  visibleNodes = [],
  sessionLesson = null,
  endpoint = DEFAULT_ROUTE_PROPOSAL_ENDPOINT,
  fetchImpl = globalThis.fetch,
  mockFallback = false,
} = {}) {
  assertBackendRelayEndpoint(endpoint);

  const requestPayload = {
    carrier,
    allowedMoves,
    targetNodeIds,
    visibleNodes,
    sessionLesson,
  };

  try {
    if (typeof fetchImpl !== 'function') {
      throw new Error('fetch is not available.');
    }

    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      throw new Error(`Route proposal relay failed with status ${response.status}.`);
    }

    const data = await response.json();
    const validation = validateRouteProposal(normalizeFetchResponsePayload(data), {
      allowedMoves,
      allowedTargetNodeIds: targetNodeIds,
      finishStatus: carrier?.finishStatus,
    });

    if (!validation.valid) {
      throw new Error(validation.errors.join(' '));
    }

    return {
      mode: data.mode || 'relay',
      model: data.model || null,
      proposal: validation.proposal,
    };
  } catch (error) {
    if (!mockFallback) {
      throw error;
    }

    return {
      mode: 'mock',
      model: null,
      error: error.message,
      proposal: createMockRouteProposal({
        carrier,
        allowedMoves,
        targetNodeIds,
      }),
    };
  }
}
