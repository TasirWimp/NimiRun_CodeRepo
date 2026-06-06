import { describe, expect, it } from 'vitest';
import { createRunSession } from '../../src/domain/runSession.js';
import { createResourceMapScenario } from '../../src/game/resourceMapScenario.js';
import {
  buildRouteProposalPrompt,
  buildRouteProposalRequest,
} from '../../src/llm/routeProposalPrompt.js';

describe('route proposal prompt', () => {
  it('builds prompts from the compact run carrier rather than hidden scene state', () => {
    const session = createRunSession(createResourceMapScenario(), { id: 'run-prompt-test' });
    const prompt = buildRouteProposalPrompt({
      carrier: session.carrier,
      visibleNodes: [{ id: 'source-edge', label: 'Source Edge' }],
      allowedMoves: session.contract.allowedMoves,
    });

    expect(prompt.system).toContain('Pocket Bot');
    expect(prompt.system).toContain('Do not request wallet authority');
    expect(prompt.user).toContain('"run_carrier"');
    expect(prompt.user).toContain('"current_node": "source-edge"');
    expect(prompt.user).toContain('"visible_nodes"');
    expect(prompt.user).not.toContain('hiddenPressure');
    expect(prompt.user).not.toContain('runtimeContract');
  });

  it('creates a Responses API request with strict JSON schema output', () => {
    const session = createRunSession(createResourceMapScenario(), { id: 'run-request-test' });
    const request = buildRouteProposalRequest({
      carrier: session.carrier,
      allowedMoves: session.contract.allowedMoves,
    });

    expect(request.input).toHaveLength(2);
    expect(request.text.format).toMatchObject({
      type: 'json_schema',
      name: 'nimi_run_route_proposal',
      strict: true,
    });
    expect(request.text.format.schema.required).toEqual(['route_proposal']);
  });
});
