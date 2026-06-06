import { describe, expect, it, vi } from 'vitest';
import { createRunSession } from '../../src/domain/runSession.js';
import { createResourceMapScenario } from '../../src/game/resourceMapScenario.js';
import { requestRouteProposal } from '../../src/llm/routeProposalClient.js';

function createRelayResponse() {
  return {
    ok: true,
    json: async () => ({
      mode: 'relay',
      model: 'test-model',
      proposal: {
        id: 'proposal-inspect-warning-signal',
        moveType: 'inspect',
        targetNodeId: 'warning-signal',
        reason: 'Inspect the warning before choosing a path.',
        resourceCost: {
          moveType: 'inspect',
          botAttention: 2,
          userGuidance: 1,
          contextSlots: 0,
        },
        consideredAlternatives: [
          {
            move: 'act:safe-gate',
            whyNotSelected: 'Acting now leaves warning residue unchecked.',
          },
        ],
        cutPrice: {
          reveals: ['Warning pressure near the shortcut.'],
          suppresses: ['Exact long route cost.'],
          leavesResidue: ['Long route safety unknown.'],
        },
        stopCondition: 'Stop after one inspect result.',
      },
    }),
  };
}

describe('route proposal client', () => {
  it('posts only to the backend relay endpoint and validates the response', async () => {
    const scenario = createResourceMapScenario();
    const session = createRunSession(scenario, { id: 'run-client-test' });
    const fetchImpl = vi.fn(async () => createRelayResponse());

    const result = await requestRouteProposal({
      carrier: session.carrier,
      allowedMoves: session.contract.allowedMoves,
      targetNodeIds: scenario.nodes.map((node) => node.id),
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      '/api/route-proposal',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(body).toMatchObject({
      carrier: expect.objectContaining({ sessionId: 'run-client-test' }),
      allowedMoves: session.contract.allowedMoves,
    });
    expect(result).toMatchObject({
      mode: 'relay',
      model: 'test-model',
      proposal: {
        moveType: 'inspect',
        targetNodeId: 'warning-signal',
      },
    });
  });

  it('blocks direct OpenAI API endpoints from browser code', async () => {
    const session = createRunSession(createResourceMapScenario(), { id: 'run-client-openai' });

    await expect(
      requestRouteProposal({
        carrier: session.carrier,
        endpoint: 'https://api.openai.com/v1/responses',
        fetchImpl: vi.fn(),
      })
    ).rejects.toThrow('Browser client must call the backend route proposal relay.');
  });

  it('uses the mock fallback when configured and the relay is unavailable', async () => {
    const scenario = createResourceMapScenario();
    const session = createRunSession(scenario, { id: 'run-client-mock' });
    const fetchImpl = vi.fn(async () => {
      throw new Error('relay unavailable');
    });

    const result = await requestRouteProposal({
      carrier: session.carrier,
      allowedMoves: session.contract.allowedMoves,
      targetNodeIds: scenario.nodes.map((node) => node.id),
      fetchImpl,
      mockFallback: true,
    });

    expect(result.mode).toBe('mock');
    expect(result.proposal.moveType).toBe('inspect');
    expect(result.error).toBe('relay unavailable');
  });
});
