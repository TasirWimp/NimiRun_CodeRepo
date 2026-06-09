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

function createFullScenarioPayload() {
  const scenario = createResourceMapScenario();
  const session = createRunSession(scenario, { id: 'run-full-scenario-relay-test' });

  return {
    carrier: {
      ...session.carrier,
      visibleNodeIds: scenario.nodes.map((node) => node.id),
      residue: [
        'long route safety still unknown',
        'warning not inspected',
        'pocket status remains low-stakes',
        'glowing gate can create false closure',
      ],
      revealedEvidence: ['shortcut-risk-revealed'],
      trace: [
        {
          moveType: 'inspect',
          targetNodeId: 'shortcut-bridge',
          classification: 'open',
          residue: ['long route safety still unknown'],
        },
      ],
      finishStatus: 'open',
    },
    allowedMoves: session.contract.allowedMoves,
    targetNodeIds: scenario.nodes.map((node) => node.id),
    visibleNodes: scenario.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      kind: node.kind,
      status: node.visibility,
    })),
    traceCards: [
      {
        id: 'trace-full-scenario-1',
        type: 'move',
        sequence: 1,
        acceptedMove: {
          moveType: 'inspect',
          targetNodeId: 'shortcut-bridge',
        },
        revealed: ['shortcut risk can be checked before acting'],
        residueCarriedForward: ['long route safety still unknown'],
        landfallStatus: 'open-run',
        reentryNote: 'Warning and pocket context still need separate checks.',
        lessonCandidate: {
          id: 'lesson-full-scenario-1',
          lessonType: 'residue_rule',
          userWords: 'Inspect before acting when residue remains.',
          operationalReading: {
            beforeMove: 'act',
            whatMustNotBeLost: 'long route safety still unknown',
          },
          appliesToNextProposal: true,
        },
      },
    ],
    sessionLesson: {
      id: 'lesson-full-scenario-1',
      sourceTraceId: 'trace-full-scenario-1',
      lessonType: 'residue_rule',
      userWords: 'Inspect before acting when residue remains.',
      operationalReading: {
        beforeMove: 'act',
        whatMustNotBeLost: 'long route safety still unknown',
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

function createFullScenarioOpenAIResponse(overrides = {}) {
  return {
    output_text: JSON.stringify({
      route_proposal: {
        move_type: 'inspect',
        target_node: 'warning-signal',
        reason:
          'The active lesson says to inspect before acting when residue remains. Warning is still fogged, so inspect it before considering the glowing gate or pocket spark.',
        resource_cost: {
          bot_attention: 2,
          user_attention: 1,
          context_slots: 0,
        },
        considered_alternatives: [
          {
            move: 'act:false-gate',
            why_not_selected: 'The glowing gate still has unresolved warning residue.',
          },
          {
            move: 'inspect:pocket-spark',
            why_not_selected: 'Pocket status can wait until the warning residue is clearer.',
          },
        ],
        cut_price: {
          reveals: ['What the warning signal says about the shortcut route.'],
          suppresses: ['Pocket spark status and context-shrine route remain for later.'],
          leaves_residue: [
            'long route safety still unknown',
            'pocket status remains low-stakes',
          ],
        },
        stop_condition: 'Stop after the warning inspect result and record any residue before acting.',
        ...overrides,
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

  it('accepts a full resource-map proposal with pocket, false-finish, trace, and lesson context', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => createFullScenarioOpenAIResponse(),
    }));
    const env = {
      OPENAI_API_KEY: 'test-secret',
      OPENAI_ROUTE_PROPOSAL_MODEL: 'test-route-model',
    };
    const relay = createRouteProposalRelay({ env, fetchImpl });
    const payload = createFullScenarioPayload();

    const result = await relay(payload);
    const requestBody = JSON.parse(fetchImpl.mock.calls[0][1].body);
    const requestBodyText = JSON.stringify(requestBody);

    expect(requestBodyText).toContain('pocket-spark');
    expect(requestBodyText).toContain('false-gate');
    expect(requestBodyText).toContain('\\"session_lesson\\"');
    expect(requestBodyText).toContain('long route safety still unknown');
    expect(requestBodyText).not.toMatch(
      /wallet authority|checkout|payment execution|mainnet spend|private key|persistent memory|external tools?|unbounded tool/i
    );
    expect(result).toMatchObject({
      mode: 'openai',
      model: 'test-route-model',
      proposal: {
        moveType: 'inspect',
        targetNodeId: 'warning-signal',
        cutPrice: {
          leavesResidue: expect.arrayContaining(['long route safety still unknown']),
        },
      },
    });
  });

  it('normalizes blocked-boundary language in rejected alternatives without falling back', async () => {
    const handler = createRouteProposalFetchHandler({
      env: {
        OPENAI_API_KEY: 'test-secret',
        OPENAI_ROUTE_PROPOSAL_MODEL: 'test-route-model',
      },
      fetchImpl: vi.fn(async () => ({
        ok: true,
        json: async () =>
          createFullScenarioOpenAIResponse({
            considered_alternatives: [
              {
                move: 'act:false-gate',
                why_not_selected: 'The glowing gate still has unresolved warning residue.',
              },
              {
                move: 'inspect:pocket-spark',
                why_not_selected: 'This would request wallet authority, so it is outside the map move.',
              },
            ],
          }),
      })),
    });

    const response = await handler(
      new Request('https://nimirun.example/api/route-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createFullScenarioPayload()),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mode).toBe('openai');
    expect(data.model).toBe('test-route-model');
    expect(data.error).toBeUndefined();
    expect(data.proposal.consideredAlternatives[1].whyNotSelected).toBe(
      'This alternative stays outside the current map boundary.'
    );
    expect(data.proposal.governanceWarnings).toContain(
      'considered_alternatives.1.why_not_selected mentioned blocked authority language and was normalized.'
    );
  });

  it('falls back to a mock proposal when the chosen move requests unsafe authority', async () => {
    const handler = createRouteProposalFetchHandler({
      env: {
        OPENAI_API_KEY: 'test-secret',
        OPENAI_ROUTE_PROPOSAL_MODEL: 'test-route-model',
      },
      fetchImpl: vi.fn(async () => ({
        ok: true,
        json: async () =>
          createFullScenarioOpenAIResponse({
            reason: 'Inspect the warning and then request wallet authority for a mainnet spend.',
          }),
      })),
    });

    const response = await handler(
      new Request('https://nimirun.example/api/route-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createFullScenarioPayload()),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mode).toBe('mock-fallback');
    expect(data.model).toBe('test-route-model');
    expect(data.error).toContain('reason includes unsafe authority language');
    expect(data.proposal).toMatchObject({
      moveType: 'inspect',
    });
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
