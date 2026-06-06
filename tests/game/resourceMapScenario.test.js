import { describe, expect, it } from 'vitest';

import {
  MAP_WORKFLOW,
  createResourceMapScenario,
  getInteractiveNodes,
  getNodeById,
  getPathEndpoints,
  summarizeMapCapabilities,
} from '../../src/game/resourceMapScenario.js';

describe('resource map scenario scaffold', () => {
  it('uses the PB-005 Phaser-native node-map workflow', () => {
    const scenario = createResourceMapScenario();

    expect(scenario.workflow).toMatchObject({
      id: MAP_WORKFLOW.id,
      tileSize: 48,
      nodeIconSize: 48,
    });
  });

  it('can represent fog, paths, hidden pressure, residue, and finish types', () => {
    const scenario = createResourceMapScenario();
    const capabilities = summarizeMapCapabilities(scenario);

    expect(capabilities).toMatchObject({
      workflowId: 'phaser-native-node-map',
      supportsFog: true,
      supportsHiddenPressure: true,
      supportsResidue: true,
      supportsInteractionZones: true,
      supportsFalseFinish: true,
      supportsSafeFinish: true,
    });
    expect(capabilities.nodeCount).toBeGreaterThanOrEqual(6);
    expect(capabilities.pathCount).toBeGreaterThanOrEqual(6);
  });

  it('keeps node metadata scene-independent and addressable by id', () => {
    const scenario = createResourceMapScenario();
    const shortcut = getNodeById(scenario, 'shortcut-bridge');

    expect(shortcut).toMatchObject({
      label: 'Shortcut',
      pressure: {
        hidden: true,
      },
    });
    expect(shortcut.reveal.inspect.residue).toContain('long route safety still unknown');
  });

  it('exposes interactive nodes with touch/click radii', () => {
    const scenario = createResourceMapScenario();
    const interactiveNodes = getInteractiveNodes(scenario);

    expect(interactiveNodes).toHaveLength(scenario.nodes.length);
    expect(interactiveNodes.every((node) => node.interaction.radius >= 34)).toBe(true);
  });

  it('resolves path endpoints to map nodes', () => {
    const scenario = createResourceMapScenario();

    for (const path of scenario.paths) {
      const endpoints = getPathEndpoints(scenario, path);

      expect(endpoints.from?.id).toBe(path.from);
      expect(endpoints.to?.id).toBe(path.to);
    }
  });

  it('returns a fresh scenario object for callers to mutate later', () => {
    const first = createResourceMapScenario();
    const second = createResourceMapScenario();

    first.nodes[0].label = 'Changed';

    expect(second.nodes[0].label).toBe('Source Edge');
  });
});

