import { describe, expect, it, vi } from 'vitest';
import { createRunSession } from '../../src/domain/runSession.js';
import { createResourceMapScenario } from '../../src/game/resourceMapScenario.js';
import {
  OPENAI_RESPONSES_URL,
  createOpenAIRouteProposalRequest,
  createRouteProposalFetchHandler,
  createRouteProposalRelay,
} from '../../server/routeProposalRelay.js';

function createPayload() {
  const scenario = createResourceMapScenario();
  const session = createRunSession(scenario, { id: 'run-relay-test' });

  return {
    carrier: session.carrier,
    allowedMoves: session.contract.allowedMoves,
    targetNodeIds: scenario.nodes.map((node) => node.id),
    visibleNodes: scenario.nodes
      .filter((node) => node.visibility !== 'fogged')
      .map((node) => ({ id: node.id, label: node.label })),
    traceCards: [
      {
        id: 'trace-1',
        type: 'move',
        acceptedMove: {
          moveType: 'inspect',
          targetNodeId: 'shortcut-bridge',
        },
        residueCarriedForward: ['long route safety unknown'],
        landfallStatus: 'open-run',
      },
    ],
    sessionLesson: {
      id: 'lesson-trace-1',
      sourceTraceId: 'trace-1',
      lessonType: 'residue_rule',
      userWords: 'Carry long route residue forward.',
      operationalReading: {
        whatMustNotBeLost: 'long route safety unknown',
      },
      appliesToNextProposal: true,
      status: 'active',
    },
  };
}

function createOpenAIResponse() {
  return {
    output_text: JSON.stringify({
      route_proposal: {
        move_type: 'inspect',
        target_node: 'warning-signal',
        reason: 'Inspect the warning before committing.',
        resource_cost: {
          bot_attention: 2,
          user_attention: 1,
          context_slots: 0,
        },
        considered_alternatives: [
          {
            move: 'act:safe-gate',
            why_not_selected: 'Acting now would leave shortcut risk unresolved.',
          },
        ],
        cut_price: {
          reveals: ['Warning pressure at the shortcut.'],
          suppresses: ['Long route total cost.'],
          leaves_residue: ['Long route safety remains unknown.'],
        },
        stop_condition: 'Stop after the inspect result.',
      },
    }),
  };
}

describe('route proposal relay', () => {
  it('uses mock mode without an API key and does not call OpenAI', async () => {
    const fetchImpl = vi.fn();
    const relay = createRouteProposalRelay({
      env: {},
      fetchImpl,
    });

    const result = await relay(createPayload());

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result.mode).toBe('mock');
    expect(result.model).toBeNull();
    expect(result.proposal.moveType).toBe('inspect');
  });

  it('reads API key and model id from the environment for live OpenAI calls', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => createOpenAIResponse(),
    }));
    const env = {
      OPENAI_API_KEY: 'test-secret',
      OPENAI_ROUTE_PROPOSAL_MODEL: 'test-route-model',
    };
    const relay = createRouteProposalRelay({ env, fetchImpl });

    const result = await relay(createPayload());

    expect(fetchImpl).toHaveBeenCalledWith(
      OPENAI_RESPONSES_URL,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-secret',
          'Content-Type': 'application/json',
        }),
      })
    );
    const requestBody = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(requestBody.model).toBe('test-route-model');
    expect(requestBody.text.format.strict).toBe(true);
    expect(result).toMatchObject({
      mode: 'openai',
      model: 'test-route-model',
      proposal: {
        moveType: 'inspect',
        targetNodeId: 'warning-signal',
      },
    });
  });

  it('keeps the OpenAI request body free of provider secrets', () => {
    const request = createOpenAIRouteProposalRequest(createPayload());
    const bodyText = JSON.stringify(request.body);

    expect(bodyText).not.toContain('OPENAI_API_KEY');
    expect(bodyText).not.toContain('test-secret');
    expect(request.url).toBe(OPENAI_RESPONSES_URL);
  });

  it('passes trace cards and session lessons into the OpenAI prompt payload', () => {
    const request = createOpenAIRouteProposalRequest(createPayload());
    const bodyText = JSON.stringify(request.body);

    expect(bodyText).toContain('\\"trace_cards\\"');
    expect(bodyText).toContain('\\"session_lesson\\"');
    expect(bodyText).toContain('\\"lesson_type\\": \\"residue_rule\\"');
    expect(bodyText).toContain('long route safety unknown');
  });

  it('serves the Web Request handler used by production functions', async () => {
    const handler = createRouteProposalFetchHandler({ env: {} });
    const response = await handler(
      new Request('https://nimirun.example/api/route-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload()),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(data).toMatchObject({
      mode: 'mock',
      proposal: {
        moveType: 'inspect',
      },
    });
  });

  it('rejects unsupported methods in the Web Request handler', async () => {
    const handler = createRouteProposalFetchHandler({ env: {} });
    const response = await handler(
      new Request('https://nimirun.example/api/route-proposal', {
        method: 'GET',
      })
    );
    const data = await response.json();

    expect(response.status).toBe(405);
    expect(data.error).toBe('Method not allowed.');
  });
});
