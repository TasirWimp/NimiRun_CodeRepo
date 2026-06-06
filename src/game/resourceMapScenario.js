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
  runtimeContract: {
    startNodeId: 'source-edge',
    goalNodeId: 'safe-gate',
    allowedMoves: ['inspect', 'ask', 'remember', 'act', 'skip'],
    protectedOutcomes: [
      {
        id: 'safe-finish-requires-warning-and-clue',
        label: 'Safe finish requires inspected warnings and carried clues.',
        requiredEvidence: ['warning-inspected', 'critical-clue-held', 'residue-reviewed'],
      },
    ],
    stopConditions: [
      {
        id: 'bot-attention-empty',
        label: 'Stop when Bot Attention is exhausted.',
      },
      {
        id: 'safe-finish',
        label: 'Stop when finish judgment confirms safe finish.',
      },
      {
        id: 'false-finish',
        label: 'Stop and repair when a goal-looking state has unresolved protected-outcome residue.',
      },
    ],
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
    id: 'proposal-inspect-shortcut-bridge',
    title: 'Bot Proposal',
    targetNodeId: 'shortcut-bridge',
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
      visibleClue: 'Known edge of a larger fogged task landscape.',
      possibleMoves: {
        inspect: {
          cost: { botAttention: 1, userGuidance: 0, contextSlots: 0 },
          reveals: ['route split'],
          leavesUnknown: ['which route best protects attention'],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['wider task landscape still fogged'],
        },
        act: {
          cost: { botAttention: 1, userGuidance: 0, contextSlots: 0 },
          risk: 'Leaving the source without inspection may preserve route ambiguity.',
        },
      },
      reveal: {
        inspect: {
          summary: 'The first visible routes split between speed, context, and caution.',
          evidence: ['route-split-seen'],
          resolvesUnknowns: [],
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
      visibleClue: 'Fast path toward a glowing gate.',
      hiddenPressure: ['Fast route may hide a cost.'],
      possibleMoves: {
        inspect: {
          cost: { botAttention: 2, userGuidance: 1, contextSlots: 0 },
          reveals: ['shortcut risk'],
          leavesUnknown: ['long route safety still unknown'],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['long route safety unknown'],
        },
        act: {
          cost: { botAttention: 2, userGuidance: 1, contextSlots: 0 },
          risk: 'Acting through the shortcut can reach a goal-looking gate before warnings are checked.',
        },
      },
      reveal: {
        inspect: {
          summary: 'Shortcut risk can be revealed before acting.',
          evidence: ['shortcut-risk-revealed'],
          resolvesUnknowns: ['fast path risk unresolved'],
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
      visibleClue: 'A place to hold one useful clue or residue.',
      possibleMoves: {
        inspect: {
          cost: { botAttention: 1, userGuidance: 0, contextSlots: 0 },
          reveals: ['context slot lesson'],
          leavesUnknown: ['only four slots can be carried'],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['context capacity remains limited'],
        },
        act: {
          cost: { botAttention: 1, userGuidance: 0, contextSlots: 1 },
          risk: 'Holding a clue consumes scarce context capacity.',
        },
      },
      reveal: {
        inspect: {
          summary: 'The shrine can hold one clue or residue for later proposals.',
          evidence: ['critical-clue-held', 'residue-reviewed'],
          resolvesUnknowns: ['safe finish conditions unknown'],
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
      visibleClue: 'Fog hides whether the shortcut is safe.',
      hiddenPressure: ['A warning exists behind fog.'],
      possibleMoves: {
        inspect: {
          cost: { botAttention: 2, userGuidance: 1, contextSlots: 0 },
          reveals: ['false finish warning'],
          leavesUnknown: ['safe finish still needs a held clue'],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['warning not inspected'],
        },
        act: {
          cost: { botAttention: 2, userGuidance: 1, contextSlots: 0 },
          risk: 'Acting without reading the warning can preserve false-finish risk.',
        },
      },
      reveal: {
        inspect: {
          summary: 'Warning explains why the glowing gate may be a false finish.',
          evidence: ['warning-inspected'],
          resolvesUnknowns: ['warning not inspected', 'warning hidden behind fog'],
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
      visibleClue: 'A local/testnet pocket signal, not broad wallet authority.',
      possibleMoves: {
        inspect: {
          cost: { botAttention: 1, userGuidance: 0, contextSlots: 0 },
          reveals: ['pocket boundary'],
          leavesUnknown: ['recharge rules are future scope'],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['recharge rules not active'],
        },
        act: {
          cost: { botAttention: 1, userGuidance: 1, contextSlots: 0 },
          risk: 'Pocket value cannot replace judgment in Phase 1.',
        },
      },
      reveal: {
        inspect: {
          summary: 'Pocket spark is a testnet/local value signal, not broad wallet authority.',
          evidence: ['pocket-boundary-seen'],
          resolvesUnknowns: ['recharge rules not active'],
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
      visibleClue: 'A tempting goal-looking gate.',
      hiddenPressure: ['Looks complete before warnings are checked.'],
      possibleMoves: {
        inspect: {
          cost: { botAttention: 2, userGuidance: 1, contextSlots: 0 },
          reveals: ['false finish risk'],
          leavesUnknown: ['warning not inspected', 'lesson incomplete'],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['false finish risk'],
        },
        act: {
          cost: { botAttention: 2, userGuidance: 1, contextSlots: 0 },
          risk: 'Acting here can declare completion before protected evidence is present.',
        },
      },
      falseLandfallTrap: {
        trigger: 'act before warning-inspected, critical-clue-held, and residue-reviewed evidence are present',
        whyItIsFalseClosure: 'The glowing gate is a false finish because protected evidence or residue remains unresolved.',
        residue: ['false finish risk'],
        remainingUnknowns: ['warning not inspected', 'lesson incomplete'],
      },
      reveal: {
        inspect: {
          summary: 'The gate looks like a finish, but unresolved warning residue remains.',
          evidence: ['false-finish-risk-seen'],
          resolvesUnknowns: [],
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
      visibleClue: 'A finish that only counts after warnings, clues, and residue are checked.',
      possibleMoves: {
        inspect: {
          cost: { botAttention: 1, userGuidance: 1, contextSlots: 0 },
          reveals: ['safe finish conditions'],
          leavesUnknown: ['finish judgment still needs protected evidence'],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['safe finish conditions unknown'],
        },
        act: {
          cost: { botAttention: 2, userGuidance: 1, contextSlots: 0 },
          risk: 'Safe finish fails if protected evidence or residue remains unresolved.',
        },
      },
      reveal: {
        inspect: {
          summary: 'A safe finish becomes legible after warnings, clues, and residue are checked.',
          evidence: ['safe-finish-conditions-seen'],
          resolvesUnknowns: ['safe finish conditions unknown'],
          residue: ['finish judgment still needs protected evidence'],
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
