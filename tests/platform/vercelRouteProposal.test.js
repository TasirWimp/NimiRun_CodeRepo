import { afterEach, describe, expect, it } from 'vitest';
import routeProposalFunction from '../../api/route-proposal.js';
import { createRunSession } from '../../src/domain/runSession.js';
import { createResourceMapScenario } from '../../src/game/resourceMapScenario.js';

const originalMode = process.env.NIMIRUN_LLM_MODE;
const originalApiKey = process.env.OPENAI_API_KEY;

function createPayload() {
  const scenario = createResourceMapScenario();
  const session = createRunSession(scenario, { id: 'run-vercel-test' });

  return {
    carrier: session.carrier,
    allowedMoves: session.contract.allowedMoves,
    targetNodeIds: scenario.nodes.map((node) => node.id),
  };
}

afterEach(() => {
  if (originalMode === undefined) {
    delete process.env.NIMIRUN_LLM_MODE;
  } else {
    process.env.NIMIRUN_LLM_MODE = originalMode;
  }

  if (originalApiKey === undefined) {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = originalApiKey;
  }
});

describe('Vercel route proposal function', () => {
  it('uses deployment env at invocation time and falls back to mock without a key', async () => {
    process.env.NIMIRUN_LLM_MODE = 'mock';
    delete process.env.OPENAI_API_KEY;

    const response = await routeProposalFunction.fetch(
      new Request('https://nimirun.example/api/route-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload()),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mode).toBe('mock');
    expect(data.model).toBeNull();
    expect(data.proposal.moveType).toBe('inspect');
  });
});
