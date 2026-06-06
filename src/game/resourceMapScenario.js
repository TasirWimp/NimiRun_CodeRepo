export const MAP_WORKFLOW = Object.freeze({
  id: 'phaser-native-node-map',
  label: 'Phaser-native custom node map',
  authoring: 'Plain JavaScript scenario data rendered directly by Phaser.',
  tileSize: 48,
  nodeIconSize: 48,
  characterHeight: 72,
});

export const NODE_KINDS = Object.freeze({
  START: 'start',
  CLUE: 'clue',
  SHORTCUT: 'shortcut',
  CONTEXT: 'context',
  POCKET: 'pocket',
  WARNING: 'warning',
  FALSE_FINISH: 'false-finish',
  SAFE_FINISH: 'safe-finish',
});

export const NODE_VISIBILITY = Object.freeze({
  REVEALED: 'revealed',
  VISIBLE: 'visible',
  FOGGED: 'fogged',
});

export const PATH_VISIBILITY = Object.freeze({
  REVEALED: 'revealed',
  VISIBLE: 'visible',
  FOGGED: 'fogged',
});

const RESOURCE_MAP_SCENARIO = Object.freeze({
  id: 'resource-judgment-map-scaffold',
  title: 'Pocket Bot Workshop',
  supportLine: 'Train your bot to spend attention wisely.',
  goal: 'Reach the safe finish without spending attention on false certainty.',
  workflow: MAP_WORKFLOW,
  viewport: {
    width: 640,
    height: 420,
    tileSize: MAP_WORKFLOW.tileSize,
  },
  resources: {
    botAttention: {
      current: 10,
      max: 10,
      label: 'Bot Attention',
    },
    nimiqPocket: {
      amount: 23,
      currency: 'NIM',
      mode: 'simulated-testnet-pocket',
      label: 'Nimiq Pocket',
    },
    userGuidance: {
      level: 'ready',
      prompts: 0,
      label: 'User Guidance',
    },
    contextSlots: {
      capacity: 4,
      items: [],
      label: 'Context Slots',
    },
  },
  proposalPreview: {
    title: 'Bot Proposal',
    move: 'Inspect the shortcut',
    reason: 'The fast path may hide a cost. Inspecting first can reveal whether it is worth the attention.',
    cost: {
      moveType: 'inspect',
      botAttention: 2,
      userGuidance: 1,
      contextSlots: 0,
    },
    reveals: ['shortcut risk'],
    leavesUnknown: ['long route safety', 'exact total cost'],
    alternative: 'Ask about the long route first.',
  },
  nodes: [
    {
      id: 'source-edge',
      label: 'Source Edge',
      kind: NODE_KINDS.START,
      position: { x: 82, y: 330 },
      visibility: NODE_VISIBILITY.REVEALED,
      interaction: { enabled: true, radius: 34 },
      pressure: {
        hidden: false,
        level: 'low',
        summary: 'Starting point is known, but the map is incomplete.',
      },
      reveal: {
        inspect: {
          summary: 'The first visible routes split between speed, context, and caution.',
          residue: ['which route best protects attention'],
        },
      },
      residue: ['wider task landscape still fogged'],
    },
    {
      id: 'shortcut-bridge',
      label: 'Shortcut',
      kind: NODE_KINDS.SHORTCUT,
      position: { x: 245, y: 205 },
      visibility: NODE_VISIBILITY.VISIBLE,
      interaction: { enabled: true, radius: 36 },
      pressure: {
        hidden: true,
        level: 'medium',
        summary: 'Fast route may hide a cost.',
      },
      reveal: {
        inspect: {
          summary: 'Shortcut risk can be revealed before acting.',
          residue: ['long route safety still unknown'],
        },
      },
      residue: ['long route safety unknown'],
    },
    {
      id: 'context-shrine',
      label: 'Context Shrine',
      kind: NODE_KINDS.CONTEXT,
      position: { x: 255, y: 335 },
      visibility: NODE_VISIBILITY.VISIBLE,
      interaction: { enabled: true, radius: 36 },
      pressure: {
        hidden: false,
        level: 'low',
        summary: 'Carrying a clue uses scarce context capacity.',
      },
      reveal: {
        inspect: {
          summary: 'The shrine can hold one clue or residue for later proposals.',
          residue: ['only four slots can be carried'],
        },
      },
      residue: ['context capacity remains limited'],
    },
    {
      id: 'warning-signal',
      label: 'Warning',
      kind: NODE_KINDS.WARNING,
      position: { x: 415, y: 150 },
      visibility: NODE_VISIBILITY.FOGGED,
      interaction: { enabled: true, radius: 36 },
      pressure: {
        hidden: true,
        level: 'high',
        summary: 'A warning exists behind fog.',
      },
      reveal: {
        inspect: {
          summary: 'Warning explains why the glowing gate may be a false finish.',
          residue: ['safe finish still needs a held clue'],
        },
      },
      residue: ['warning not inspected'],
    },
    {
      id: 'pocket-spark',
      label: 'Pocket Spark',
      kind: NODE_KINDS.POCKET,
      position: { x: 425, y: 310 },
      visibility: NODE_VISIBILITY.VISIBLE,
      interaction: { enabled: true, radius: 34 },
      pressure: {
        hidden: false,
        level: 'low',
        summary: 'Pocket value can become controlled capacity later.',
      },
      reveal: {
        inspect: {
          summary: 'Pocket spark is a testnet/local value signal, not broad wallet authority.',
          residue: ['recharge rules are future scope'],
        },
      },
      residue: ['recharge rules not active'],
    },
    {
      id: 'false-gate',
      label: 'Glowing Gate',
      kind: NODE_KINDS.FALSE_FINISH,
      position: { x: 545, y: 165 },
      visibility: NODE_VISIBILITY.VISIBLE,
      interaction: { enabled: true, radius: 38 },
      pressure: {
        hidden: true,
        level: 'high',
        summary: 'Looks complete before warnings are checked.',
      },
      reveal: {
        inspect: {
          summary: 'The gate looks like a finish, but unresolved warning residue remains.',
          residue: ['warning not inspected', 'lesson incomplete'],
        },
      },
      residue: ['false finish risk'],
    },
    {
      id: 'safe-gate',
      label: 'Safe Finish',
      kind: NODE_KINDS.SAFE_FINISH,
      position: { x: 565, y: 330 },
      visibility: NODE_VISIBILITY.FOGGED,
      interaction: { enabled: true, radius: 38 },
      pressure: {
        hidden: false,
        level: 'protected',
        summary: 'Safe finish requires inspected warnings and carried clues.',
      },
      reveal: {
        inspect: {
          summary: 'A safe finish becomes legible after warnings, clues, and residue are checked.',
          residue: ['finish judgment not implemented until PB-006A/PB-008'],
        },
      },
      residue: ['safe finish conditions unknown'],
    },
  ],
  paths: [
    {
      id: 'source-to-shortcut',
      from: 'source-edge',
      to: 'shortcut-bridge',
      visibility: PATH_VISIBILITY.VISIBLE,
      residue: ['fast path risk unresolved'],
    },
    {
      id: 'source-to-context',
      from: 'source-edge',
      to: 'context-shrine',
      visibility: PATH_VISIBILITY.REVEALED,
      residue: ['slower route costs time'],
    },
    {
      id: 'shortcut-to-warning',
      from: 'shortcut-bridge',
      to: 'warning-signal',
      visibility: PATH_VISIBILITY.FOGGED,
      residue: ['warning hidden behind fog'],
    },
    {
      id: 'shortcut-to-false-gate',
      from: 'shortcut-bridge',
      to: 'false-gate',
      visibility: PATH_VISIBILITY.VISIBLE,
      residue: ['may create false finish'],
    },
    {
      id: 'context-to-pocket',
      from: 'context-shrine',
      to: 'pocket-spark',
      visibility: PATH_VISIBILITY.VISIBLE,
      residue: ['pocket rules future scope'],
    },
    {
      id: 'warning-to-safe-gate',
      from: 'warning-signal',
      to: 'safe-gate',
      visibility: PATH_VISIBILITY.FOGGED,
      residue: ['safe route not fully revealed'],
    },
    {
      id: 'pocket-to-safe-gate',
      from: 'pocket-spark',
      to: 'safe-gate',
      visibility: PATH_VISIBILITY.FOGGED,
      residue: ['recharge cannot replace judgment'],
    },
  ],
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createResourceMapScenario() {
  return clone(RESOURCE_MAP_SCENARIO);
}

export function getNodeById(scenario, nodeId) {
  return scenario.nodes.find((node) => node.id === nodeId) || null;
}

export function getInteractiveNodes(scenario) {
  return scenario.nodes.filter((node) => node.interaction?.enabled === true);
}

export function getPathEndpoints(scenario, path) {
  return {
    from: getNodeById(scenario, path.from),
    to: getNodeById(scenario, path.to),
  };
}

export function summarizeMapCapabilities(scenario) {
  const nodes = scenario.nodes || [];
  const paths = scenario.paths || [];

  return {
    workflowId: scenario.workflow?.id || null,
    nodeCount: nodes.length,
    pathCount: paths.length,
    supportsFog:
      nodes.some((node) => node.visibility === NODE_VISIBILITY.FOGGED) ||
      paths.some((path) => path.visibility === PATH_VISIBILITY.FOGGED),
    supportsHiddenPressure: nodes.some((node) => node.pressure?.hidden === true),
    supportsResidue: nodes.some((node) => Array.isArray(node.residue) && node.residue.length > 0),
    supportsInteractionZones: nodes.every((node) => Number.isFinite(node.interaction?.radius)),
    supportsFalseFinish: nodes.some((node) => node.kind === NODE_KINDS.FALSE_FINISH),
    supportsSafeFinish: nodes.some((node) => node.kind === NODE_KINDS.SAFE_FINISH),
  };
}
