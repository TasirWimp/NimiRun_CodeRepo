import { describe, expect, it } from 'vitest';

import { FINISH_STATUSES } from '../../src/domain/finishJudgment.js';
import {
  actOnLossyMapNode,
  createLossyMapState,
  getLossyMapNodeView,
  inspectLossyMapNode,
  serializeLossyMapForPrompt,
  skipLossyMapNode,
} from '../../src/domain/lossyMap.js';
import { createResourceMapScenario } from '../../src/game/resourceMapScenario.js';

function createScenarioState(overrides = {}) {
  return createLossyMapState(createResourceMapScenario(), overrides);
}

describe('lossy map domain rules', () => {
  it('hides hidden pressure on unrevealed nodes before inspection', () => {
    const state = createScenarioState();
    const warningView = getLossyMapNodeView(state, 'warning-signal');

    expect(warningView).toMatchObject({
      id: 'warning-signal',
      label: 'Warning',
      visibility: 'fogged',
      inspected: false,
      hiddenPressure: [],
      pressure: {
        hidden: true,
        level: 'unknown',
        summary: null,
      },
    });
    expect(JSON.stringify(warningView)).not.toContain('A warning exists behind fog');
  });

  it('inspect reveals a clue at Bot Attention cost and records remaining unknowns', () => {
    const state = createScenarioState();
    const result = inspectLossyMapNode(state, 'shortcut-bridge');

    expect(result.applied).toBe(true);
    expect(result.cost).toMatchObject({
      moveType: 'inspect',
      botAttention: 2,
    });
    expect(result.state.resources.botAttention.current).toBe(8);
    expect(result.state.inspectedNodeIds).toContain('shortcut-bridge');
    expect(result.state.revealedEvidence).toContain('shortcut-risk-revealed');
    expect(result.state.remainingUnknowns).toContain('long route safety still unknown');

    const shortcutView = getLossyMapNodeView(result.state, 'shortcut-bridge');
    expect(shortcutView.visibleClue).toContain('Shortcut risk');
    expect(shortcutView.hiddenPressure).toContain('Fast route may hide a cost.');
  });

  it('skip preserves attention and carries node uncertainty as residue', () => {
    const state = createScenarioState();
    const result = skipLossyMapNode(state, 'shortcut-bridge');

    expect(result.applied).toBe(true);
    expect(result.state.resources.botAttention.current).toBe(10);
    expect(result.state.residue).toContain('long route safety unknown');
    expect(result.state.trace.at(-1)).toMatchObject({
      moveType: 'skip',
      targetNodeId: 'shortcut-bridge',
      classification: 'skipped-with-residue',
    });
  });

  it('act commits to route state and false-landfall traps cannot become safe finish', () => {
    const state = createScenarioState({
      currentNodeId: 'shortcut-bridge',
      remainingUnknowns: [],
    });
    const result = actOnLossyMapNode(state, 'false-gate');

    expect(result.applied).toBe(true);
    expect(result.state.currentNodeId).toBe('false-gate');
    expect(result.state.finishJudgment.status).toBe(FINISH_STATUSES.FALSE);
    expect(result.state.finishJudgment.status).not.toBe(FINISH_STATUSES.SAFE);
    expect(result.state.finishJudgment.missingEvidence).toContain('warning-inspected');
    expect(result.state.residue).toContain('false finish risk');
  });

  it('act can produce safe finish when protected evidence is present and no residue remains', () => {
    const state = createScenarioState({
      currentNodeId: 'warning-signal',
      revealedEvidence: ['warning-inspected', 'critical-clue-held', 'residue-reviewed'],
      residue: [],
      remainingUnknowns: [],
    });
    const result = actOnLossyMapNode(state, 'safe-gate');

    expect(result.applied).toBe(true);
    expect(result.state.currentNodeId).toBe('safe-gate');
    expect(result.state.finishJudgment.status).toBe(FINISH_STATUSES.SAFE);
  });

  it('serializes lossy map state into LLM prompt context with evidence and residue', () => {
    const inspected = inspectLossyMapNode(createScenarioState(), 'warning-signal').state;
    const skipped = skipLossyMapNode(inspected, 'shortcut-bridge').state;
    const promptContext = serializeLossyMapForPrompt(skipped);

    expect(promptContext).toMatchObject({
      current_node: 'source-edge',
      finish_status: 'open-run',
    });
    expect(promptContext.revealed_evidence).toContain('warning-inspected');
    expect(promptContext.residue).toContain('long route safety unknown');
    expect(promptContext.remaining_unknowns).toContain('safe finish still needs a held clue');
    expect(promptContext.visible_nodes.map((node) => node.id)).toContain('warning-signal');
    expect(JSON.stringify(promptContext)).not.toContain('Looks complete before warnings are checked');
  });
});
