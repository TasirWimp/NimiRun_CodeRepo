import { describe, expect, it } from 'vitest';
import { createRunSession } from '../../src/domain/runSession.js';
import { createTraceCard } from '../../src/domain/traces.js';
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

  it('includes trace-card residue in the next proposal payload', () => {
    const session = createRunSession(createResourceMapScenario(), { id: 'run-trace-context-test' });
    const traceCard = createTraceCard({
      sequence: 1,
      acceptedMove: {
        moveType: 'inspect',
        targetNodeId: 'shortcut-bridge',
      },
      residueCarriedForward: ['long route safety still unknown'],
    });
    const prompt = buildRouteProposalPrompt({
      carrier: session.carrier,
      allowedMoves: session.contract.allowedMoves,
      traceCards: [traceCard],
    });

    expect(prompt.payload.trace_cards).toEqual([
      expect.objectContaining({
        id: 'trace-1',
        move: 'inspect',
        residue: expect.arrayContaining(['long route safety still unknown']),
      }),
    ]);
    expect(prompt.user).toContain('"trace_cards"');
  });

  it('serializes session lessons into the prompt payload', () => {
    const session = createRunSession(createResourceMapScenario(), { id: 'run-session-lesson-test' });
    const prompt = buildRouteProposalPrompt({
      carrier: session.carrier,
      allowedMoves: session.contract.allowedMoves,
      sessionLesson: {
        id: 'lesson-trace-1',
        sourceTraceId: 'trace-1',
        lessonType: 'cut_preference',
        userWords: 'Inspect before acting on residue.',
        operationalReading: {
          when: 'Before acting on a goal-looking gate.',
          preferMove: 'inspect',
          beforeMove: 'act',
          whatMustNotBeLost: 'warning residue',
        },
        appliesToNextProposal: true,
        status: 'applied',
      },
    });

    expect(prompt.payload.session_lesson).toMatchObject({
      id: 'lesson-trace-1',
      source_trace_id: 'trace-1',
      lesson_type: 'cut_preference',
      user_words: 'Inspect before acting on residue.',
      operational_reading: {
        prefer_move: 'inspect',
        before_move: 'act',
        what_must_not_be_lost: 'warning residue',
      },
      applies_to_next_proposal: true,
      status: 'applied',
    });
  });
});
