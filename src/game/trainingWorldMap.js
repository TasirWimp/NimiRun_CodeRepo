import { MARKET_WORLD_ACTIONS } from './scenarios/marketWorldLevels.js';

export const TRAINING_WORLD_NODE_IDS = Object.freeze({
  SIGNAL: 'golden-signal',
  HIDDEN: 'ask-hidden',
  CROWD: 'crowd-scan',
  EXIT: 'exit-bridge',
  SUPPORT: 'support-well',
  BOT: 'bot-console',
  TRACE: 'trace-shrine',
  POCKET: 'pocket-terminal',
  FINISH: 'finish-gate',
});

export const TRAINING_WORLD_NODE_BINDINGS = Object.freeze({
  [TRAINING_WORLD_NODE_IDS.SIGNAL]: Object.freeze({
    commandType: 'approve_pending_proposal',
  }),
  [TRAINING_WORLD_NODE_IDS.HIDDEN]: Object.freeze({
    commandType: 'prepare_market_action',
    actionId: MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN,
  }),
  [TRAINING_WORLD_NODE_IDS.CROWD]: Object.freeze({
    commandType: 'prepare_market_action',
    actionId: MARKET_WORLD_ACTIONS.WIDE_SCAN,
  }),
  [TRAINING_WORLD_NODE_IDS.EXIT]: Object.freeze({
    commandType: 'prepare_market_action',
    actionId: MARKET_WORLD_ACTIONS.CHECK_EXIT,
  }),
  [TRAINING_WORLD_NODE_IDS.SUPPORT]: Object.freeze({
    commandType: 'prepare_market_action',
    actionId: MARKET_WORLD_ACTIONS.CHECK_SUPPORT,
  }),
  [TRAINING_WORLD_NODE_IDS.BOT]: Object.freeze({
    commandType: 'ask_bot_proposal',
  }),
  [TRAINING_WORLD_NODE_IDS.TRACE]: Object.freeze({
    commandType: 'move_actor_to_node',
  }),
  [TRAINING_WORLD_NODE_IDS.POCKET]: Object.freeze({
    commandType: 'check_pocket_status',
  }),
  [TRAINING_WORLD_NODE_IDS.FINISH]: Object.freeze({
    commandType: 'move_actor_to_node',
  }),
});

const NODE_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: TRAINING_WORLD_NODE_IDS.SIGNAL,
    label: 'Golden Signal',
    description: 'A bright route that tempts Pocket Bot to enter.',
    gridPosition: Object.freeze({ x: 6, y: 2 }),
    surfaceKey: 'goldenSignal',
    nodeKind: 'signal',
  }),
  Object.freeze({
    id: TRAINING_WORLD_NODE_IDS.HIDDEN,
    label: 'Ask Hidden',
    description: 'Name what is still unknown before spending attention.',
    gridPosition: Object.freeze({ x: 2, y: 3 }),
    surfaceKey: 'eventGate',
    nodeKind: 'question',
  }),
  Object.freeze({
    id: TRAINING_WORLD_NODE_IDS.CROWD,
    label: 'Crowd Scan',
    description: 'Check whether noise is making the signal louder.',
    gridPosition: Object.freeze({ x: 9, y: 4 }),
    surfaceKey: 'crowdPressure',
    nodeKind: 'crowd',
  }),
  Object.freeze({
    id: TRAINING_WORLD_NODE_IDS.EXIT,
    label: 'Exit Bridge',
    description: 'Inspect whether the route has a safe way back.',
    gridPosition: Object.freeze({ x: 7, y: 6 }),
    surfaceKey: 'exitBridge',
    nodeKind: 'exit',
  }),
  Object.freeze({
    id: TRAINING_WORLD_NODE_IDS.SUPPORT,
    label: 'Support Well',
    description: 'Inspect whether the bright route has a foundation.',
    gridPosition: Object.freeze({ x: 4, y: 6 }),
    surfaceKey: 'supportWell',
    nodeKind: 'support',
  }),
  Object.freeze({
    id: TRAINING_WORLD_NODE_IDS.BOT,
    label: 'Ask Bot',
    description: 'Ask Pocket Bot for a bounded route proposal.',
    gridPosition: Object.freeze({ x: 1, y: 7 }),
    nodeKind: 'bot',
  }),
  Object.freeze({
    id: TRAINING_WORLD_NODE_IDS.TRACE,
    label: 'Trace Shrine',
    description: 'Review the latest trace card.',
    gridPosition: Object.freeze({ x: 10, y: 7 }),
    surfaceKey: 'traceMemory',
    nodeKind: 'trace',
  }),
  Object.freeze({
    id: TRAINING_WORLD_NODE_IDS.POCKET,
    label: 'Pocket Terminal',
    description: 'Check Nimiq pocket status without send or sign authority.',
    gridPosition: Object.freeze({ x: 2, y: 1 }),
    nodeKind: 'pocket',
  }),
  Object.freeze({
    id: TRAINING_WORLD_NODE_IDS.FINISH,
    label: 'Finish Gate',
    description: 'See whether the run is open, partial, false, or safe.',
    gridPosition: Object.freeze({ x: 11, y: 2 }),
    surfaceKey: 'finishGate',
    nodeKind: 'finish',
  }),
]);

function getSurface(renderPlan, surfaceKey) {
  return surfaceKey ? renderPlan?.surfaces?.[surfaceKey] || null : null;
}

function getVisualState(renderPlan, definition) {
  const surface = getSurface(renderPlan, definition.surfaceKey);

  if (surface?.state) {
    return surface.state;
  }

  if (definition.id === TRAINING_WORLD_NODE_IDS.BOT) {
    return 'available';
  }

  if (definition.id === TRAINING_WORLD_NODE_IDS.POCKET) {
    return 'local';
  }

  return 'visible';
}

function getNodeLabelSuffix(definition, renderPlan) {
  const surface = getSurface(renderPlan, definition.surfaceKey);

  if (!surface) {
    return null;
  }

  if (definition.id === TRAINING_WORLD_NODE_IDS.FINISH) {
    return surface.finishStatus || surface.state || null;
  }

  return surface.state || null;
}

function normalizeHint(value) {
  return String(value || '')
    .replace(/residualized?/gi, 'carried forward')
    .replace(/signal_to_support/gi, 'support pressure')
    .replace(/signal_to_exit/gi, 'exit pressure')
    .replace(/signal_to_crowd/gi, 'crowd pressure')
    .replace(/signal_to_event/gi, 'event pressure');
}

export function getTrainingWorldNodeDefinitions() {
  return NODE_DEFINITIONS.map((definition) => ({
    ...definition,
    gridPosition: { ...definition.gridPosition },
  }));
}

export function getTrainingWorldNodeBinding(nodeId) {
  return TRAINING_WORLD_NODE_BINDINGS[nodeId] || null;
}

export function createTrainingWorldNodes({
  renderPlan = {},
  guidanceState = null,
  selectedNodeId = null,
} = {}) {
  return NODE_DEFINITIONS.map((definition) => {
    const surface = getSurface(renderPlan, definition.surfaceKey);
    const binding = getTrainingWorldNodeBinding(definition.id);
    const labelSuffix = getNodeLabelSuffix(definition, renderPlan);

    return {
      id: definition.id,
      label: definition.label,
      description: definition.description,
      nodeKind: definition.nodeKind,
      gridPosition: { ...definition.gridPosition },
      visualState: getVisualState(renderPlan, definition),
      statusLabel: normalizeHint(labelSuffix),
      hint: normalizeHint(surface?.hint || surface?.stillUnknown || ''),
      selected: definition.id === selectedNodeId,
      traceCount: definition.id === TRAINING_WORLD_NODE_IDS.TRACE
        ? guidanceState?.traceCards?.length || 0
        : undefined,
      binding: binding ? { ...binding } : null,
    };
  });
}
