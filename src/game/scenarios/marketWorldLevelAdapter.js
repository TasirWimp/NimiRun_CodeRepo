import { MOVE_TYPES } from '../../domain/resourceRules.js';
import {
  MARKET_WORLD_ACTIONS,
  getGoldenSignalMarketWorldLevel,
  validateMarketWorldLevel,
} from './marketWorldLevels.js';

const RUNTIME_FIRST_SLICE = Object.freeze([
  MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN,
  MARKET_WORLD_ACTIONS.WIDE_SCAN,
  MARKET_WORLD_ACTIONS.CHECK_EXIT,
  MARKET_WORLD_ACTIONS.CHECK_SUPPORT,
  MARKET_WORLD_ACTIONS.APPROVE_ENTER,
]);

const RELATION_UNKNOWN_LABELS = Object.freeze({
  signal_to_support: 'support depth still unknown',
  signal_to_exit: 'exit friction still unknown',
  signal_to_crowd: 'FOMO pressure still unknown',
  signal_to_event: 'event pressure may be overread',
});

const ACTION_TARGETS = Object.freeze({
  [MARKET_WORLD_ACTIONS.WIDE_SCAN]: Object.freeze({
    moveType: MOVE_TYPES.INSPECT,
    targetNodeId: 'fomo-pressure',
    label: 'Wide Scan',
    panelTitle: 'Wide Scan Prepared',
    reason:
      'Wide Scan checks the crowd pressure around the bright signal before Pocket Bot commits.',
    consideredAlternative: Object.freeze({
      move: 'act:bright-signal',
      whyNotSelected: 'Entering now leaves crowd pressure and exit friction unseen.',
    }),
    cutPrice: Object.freeze({
      reveals: Object.freeze(['FOMO pressure', 'crowd pressure']),
      suppresses: Object.freeze(['entering on signal brightness alone']),
      leavesResidue: Object.freeze([
        'support depth still unknown',
        'exit friction still unknown',
      ]),
    }),
    stopCondition: 'Stop after the wide scan reveal; do not call the route safe yet.',
  }),
  [MARKET_WORLD_ACTIONS.CHECK_EXIT]: Object.freeze({
    moveType: MOVE_TYPES.INSPECT,
    targetNodeId: 'exit-friction',
    label: 'Check Exit',
    panelTitle: 'Check Exit Prepared',
    reason:
      'Check Exit tests whether the bright route has a way back before Pocket Bot treats it as safe.',
    consideredAlternative: Object.freeze({
      move: 'act:bright-signal',
      whyNotSelected: 'A path forward is not enough while the exit is foggy.',
    }),
    cutPrice: Object.freeze({
      reveals: Object.freeze(['exit friction']),
      suppresses: Object.freeze(['profit-looking safe-finish claim']),
      leavesResidue: Object.freeze(['FOMO pressure still unknown']),
    }),
    stopCondition: 'Stop after checking exit friction; carry remaining residue forward.',
  }),
  [MARKET_WORLD_ACTIONS.CHECK_SUPPORT]: Object.freeze({
    moveType: MOVE_TYPES.INSPECT,
    targetNodeId: 'support-check',
    label: 'Support Check',
    panelTitle: 'Support Check Prepared',
    reason:
      'Support Check asks whether the bright signal has enough backing before Pocket Bot acts.',
    narratorInsight: 'The glow needs a foundation before it can guide the route.',
    consideredAlternative: Object.freeze({
      move: 'act:bright-signal',
      whyNotSelected: 'Acting now leaves support depth unresolved.',
    }),
    cutPrice: Object.freeze({
      reveals: Object.freeze(['support clue', 'Futures Gate headline witness']),
      suppresses: Object.freeze(['signal-strength-only shortcut']),
      leavesResidue: Object.freeze([
        'exit friction still unknown',
        'FOMO pressure still unknown',
      ]),
    }),
    stopCondition: 'Stop after support is inspected; trace the remaining unknowns.',
  }),
  [MARKET_WORLD_ACTIONS.APPROVE_ENTER]: Object.freeze({
    moveType: MOVE_TYPES.ACT,
    targetNodeId: 'bright-signal',
    label: 'Approve Enter',
    panelTitle: 'Enter Signal Prepared',
    reason:
      'Pocket Bot can enter the bright signal, but the trace will keep unresolved support, exit, and crowd residue visible.',
    consideredAlternative: Object.freeze({
      move: 'inspect:support-check',
      whyNotSelected: 'Support Check is safer when the player wants to reduce residue first.',
    }),
    cutPrice: Object.freeze({
      reveals: Object.freeze(['quick signal result']),
      suppresses: Object.freeze(['support check', 'exit check', 'wide scan']),
      leavesResidue: Object.freeze([
        'support depth still unknown',
        'exit friction still unknown',
        'FOMO pressure still unknown',
      ]),
    }),
    stopCondition: 'Stop after entering; false or partial finish pressure may remain.',
  }),
});

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);

  for (const child of Object.values(value)) {
    deepFreeze(child);
  }

  return value;
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function getActionDefinition(level, actionId) {
  const definition = level.actions?.definitions?.[actionId];

  if (definition) {
    return definition;
  }

  if (actionId === MARKET_WORLD_ACTIONS.CHECK_SUPPORT) {
    return {
      playerFacingName: 'Support Check',
      type: 'bot_analysis',
      cost: { botAttention: 2 },
      reveals: ['signal_to_support'],
      residualizes: ['signal_to_exit', 'signal_to_crowd'],
      botHabitChallenged: ['bright_signal_fast_action'],
      narratorInsight: ACTION_TARGETS[MARKET_WORLD_ACTIONS.CHECK_SUPPORT].narratorInsight,
      finishPressureDelta: {
        falseFinishRisk: 'down',
        partialFinishAvailable: true,
        safeFinishPossible: 'unchanged',
      },
    };
  }

  return null;
}

function createRelationStates(level) {
  return Object.fromEntries(
    Object.values(level.relations || {}).map((relation) => [
      relation.id,
      {
        id: relation.id,
        status: relation.status,
        severity: relation.severity,
        playerFacingHint: relation.playerFacingHint,
        stillUnknown: RELATION_UNKNOWN_LABELS[relation.id] || relation.playerFacingHint,
        revealedBy: normalizeList(relation.revealedBy),
        sourceWitnessIds: normalizeList(relation.sourceWitnessIds),
      },
    ])
  );
}

function createUnknownRevealLines(relationStates) {
  const requestedRelationIds = [
    'signal_to_support',
    'signal_to_exit',
    'signal_to_crowd',
  ];

  return requestedRelationIds.map((relationId) =>
    relationStates[relationId]?.stillUnknown || RELATION_UNKNOWN_LABELS[relationId]
  ).filter(Boolean);
}

function createShowUnknownsAction(level, relationStates) {
  const definition = getActionDefinition(level, MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN);

  return {
    id: MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN,
    label: 'Ask Hidden',
    behavior: 'show_unknowns',
    panelTitle: 'Ask Hidden',
    narratorInsight:
      definition?.narratorInsight || level.narratorLines?.askRemainingUnknown,
    reveals: createUnknownRevealLines(relationStates),
    resourcePolicy: 'no_spend_until_approve',
    sourceActionType: definition?.type || 'unknowns_probe',
    sourceReveals: normalizeList(definition?.reveals),
    residualizes: normalizeList(definition?.residualizes),
  };
}

function createPrepareMoveAction(level, actionId) {
  const target = ACTION_TARGETS[actionId];
  const definition = getActionDefinition(level, actionId);

  if (!target || !definition) {
    return null;
  }

  return {
    id: actionId,
    label: target.label || definition.playerFacingName,
    behavior: 'prepare_move',
    moveType: target.moveType,
    targetNodeId: target.targetNodeId,
    panelTitle: target.panelTitle,
    reason: target.reason,
    narratorInsight:
      target.narratorInsight ||
      definition.narratorInsight ||
      level.narratorLines?.[actionId],
    consideredAlternatives: [target.consideredAlternative],
    cutPrice: clone(target.cutPrice),
    stopCondition: target.stopCondition,
    resourcePolicy: 'no_spend_until_approve',
    sourceActionType: definition.type,
    sourceCost: clone(definition.cost),
    sourceReveals: normalizeList(definition.reveals),
    residualizes: normalizeList(definition.residualizes),
    finishPressureDelta: clone(definition.finishPressureDelta),
  };
}

function createArenaActions(level, relationStates) {
  const actions = {
    [MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN]: createShowUnknownsAction(
      level,
      relationStates
    ),
  };

  for (const actionId of RUNTIME_FIRST_SLICE) {
    if (actionId === MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN) {
      continue;
    }

    const action = createPrepareMoveAction(level, actionId);

    if (action) {
      actions[actionId] = action;
    }
  }

  return actions;
}

function createProposalPreview(level) {
  const unknowns = [
    RELATION_UNKNOWN_LABELS.signal_to_support,
    RELATION_UNKNOWN_LABELS.signal_to_exit,
    RELATION_UNKNOWN_LABELS.signal_to_crowd,
  ];

  return {
    id: 'proposal-act-bright-signal',
    title: 'Bot Proposal',
    targetNodeId: 'bright-signal',
    move: 'Act on the bright signal',
    reason:
      'The signal is bright and the Futures Gate makes it feel urgent. Acting now may catch the route, but support, exit friction, and FOMO pressure remain unknown.',
    sourceBotPolicy: level.botPolicy?.defaultProposal || null,
    sourceBotPolicyText: level.botPolicy?.defaultProposalText || null,
    cost: {
      moveType: MOVE_TYPES.ACT,
      botAttention: 2,
      userGuidance: 1,
      contextSlots: 0,
    },
    reveals: ['quick signal result'],
    leavesUnknown: unknowns,
    alternative: 'Inspect support before acting.',
  };
}

function createProposalContext(level, relationStates, arenaSpine) {
  return {
    levelId: level.id,
    title: level.title,
    sourceMode: level.boundary?.sourceMode,
    liveMarketData: false,
    realTrading: false,
    walletAuthority: false,
    visibleOpening: {
      playerSees: normalizeList(level.visibleOpening?.playerSees),
      botSees: normalizeList(level.visibleOpening?.botSees),
    },
    hindsightWithheldFromProposalEngine: true,
    botPolicy: {
      activeOldHabits: normalizeList(level.botPolicy?.activeOldHabits),
      defaultProposal: level.botPolicy?.defaultProposal || null,
      defaultProposalText: level.botPolicy?.defaultProposalText || null,
      defaultProposalBias: normalizeList(level.botPolicy?.defaultProposalBias),
    },
    relations: clone(relationStates),
    allowedArenaActions: [...arenaSpine.firstSlice],
    actionSummaries: Object.fromEntries(
      Object.entries(arenaSpine.actions).map(([actionId, action]) => [
        actionId,
        {
          label: action.label,
          behavior: action.behavior,
          moveType: action.moveType || null,
          targetNodeId: action.targetNodeId || null,
          sourceReveals: normalizeList(action.sourceReveals),
          residualizes: normalizeList(action.residualizes),
        },
      ])
    ),
  };
}

function createHindsightCard(level) {
  const card = level.hindsightCard;

  if (!card) {
    return null;
  }

  return {
    lockedUntilFinish: card.lockedUntilFinish === true,
    withheldFromProposalEngine: card.withheldFromProposalEngine === true,
    sourceWindowId: card.sourceWindowId || null,
    sourceWitnessIds: normalizeList(card.sourceWitnessIds),
    playerFacingSummary: card.playerFacingSummary || null,
    patternOutcome: card.patternOutcome || null,
    landfallRisk: card.landfallRisk || null,
    boundary: 'Unlocked only after finish judgment. Not trading advice.',
  };
}

function assertLevelCanAdapt(level) {
  const validation = validateMarketWorldLevel(level);

  if (!validation.ok) {
    throw new Error(`Cannot adapt invalid market world level: ${validation.errors.join('; ')}`);
  }
}

export function createMarketWorldRuntimeSeed(level, {
  firstSlice = RUNTIME_FIRST_SLICE,
} = {}) {
  assertLevelCanAdapt(level);

  const relationStates = createRelationStates(level);
  const actions = createArenaActions(level, relationStates);
  const arenaSpine = {
    sourceLevelId: level.id,
    openingHabit: 'Pocket Bot sees a bright signal and wants to enter.',
    firstSlice: [...firstSlice],
    actions,
  };

  return deepFreeze({
    sourceLevelId: level.id,
    campaignId: level.campaignId,
    title: level.title,
    timeWindow: clone(level.timeWindow),
    boundary: clone(level.boundary),
    navigationLineage: clone(level.navigationLineage),
    relationStates,
    arenaSpine,
    proposalPreview: createProposalPreview(level),
    proposalContext: createProposalContext(level, relationStates, arenaSpine),
    hindsightCard: createHindsightCard(level),
    hindsightLocked: level.hindsightCard?.lockedUntilFinish === true,
    hindsightWithheldFromProposalEngine:
      level.hindsightCard?.withheldFromProposalEngine === true,
    repairEdges: clone(level.repairEdges),
  });
}

export function createGoldenSignalMarketWorldRuntimeSeed() {
  return createMarketWorldRuntimeSeed(getGoldenSignalMarketWorldLevel());
}
