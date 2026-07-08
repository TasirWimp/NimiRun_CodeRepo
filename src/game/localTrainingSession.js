import {
  applyArenaAction,
  approvePendingProposal,
} from '../domain/guidanceLoop.js';
import { createMarketWorldRenderPlan } from './scenarios/marketWorldRenderPlan.js';
import { createMarketWorldActionResponsePanel } from '../ui/marketWorldActionResponsePanel.js';
import { createMarketWorldDecisionViewModel } from '../ui/marketWorldDecisionViewModel.js';
import { createNimiqPocketStatus } from '../platform/nimiqMiniApp.js';
import { createPocketBotState } from './pocketBotState.js';
import {
  applyRouteProposalResult,
  createRouteProposalRuntimeInput,
} from './routeProposalRuntime.js';
import { requestRouteProposal } from '../llm/routeProposalClient.js';
import {
  TRAINING_WORLD_NODE_IDS,
  createTrainingWorldNodes,
} from './trainingWorldMap.js';

export const TRAINING_COMMAND_TYPES = Object.freeze({
  PREPARE_MARKET_ACTION: 'prepare_market_action',
  APPROVE_PENDING_PROPOSAL: 'approve_pending_proposal',
  ASK_BOT_PROPOSAL: 'ask_bot_proposal',
  CHECK_POCKET_STATUS: 'check_pocket_status',
  DISMISS_TRACE: 'dismiss_trace',
  MOVE_ACTOR_TO_NODE: 'move_actor_to_node',
});

const SUPPORTED_COMMAND_TYPES = new Set(Object.values(TRAINING_COMMAND_TYPES));

function createLocalEnvironment() {
  return {
    isNimiqPay: false,
    network: 'local',
    providerStatus: 'local-fallback',
  };
}

function createInitialPocketStatus(guidanceState) {
  return createNimiqPocketStatus({
    environment: createLocalEnvironment(),
    pocket: guidanceState.mapState.resources.nimiqPocket,
    status: 'local-fallback',
  });
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function getTraceDrawerSignature(guidanceState) {
  const latestTrace = guidanceState.traceCards.at(-1);
  const transition = guidanceState.marketWorldRuntime?.lastTransition;

  if (latestTrace) {
    return `trace:${latestTrace.sequence}:${latestTrace.landfallStatus}`;
  }

  if (transition) {
    return `transition:${transition.actionId}:${transition.phase}:${guidanceState.guidanceTrace.length}`;
  }

  return 'empty';
}

function createBotCompanionState(guidanceState) {
  const resources = guidanceState.mapState.resources;
  const latestTrace = guidanceState.traceCards.at(-1);
  const hasResidue =
    /partial|false/i.test(latestTrace?.landfallStatus || '') ||
    latestTrace?.residueCarriedForward?.length > 0;

  if (resources.botAttention.current <= 2) {
    return {
      posture: 'low-attention',
      label: 'Low attention',
      assetKey: 'bot_v2_warning',
    };
  }

  if (hasResidue) {
    return {
      posture: 'trace-carrying',
      label: 'Carrying trace',
      assetKey: 'bot_v2_learning',
    };
  }

  if (guidanceState.traceCards.length > 0) {
    return {
      posture: 'learning',
      label: 'Learning',
      assetKey: 'bot_v2_learning',
    };
  }

  if (guidanceState.pendingProposal.moveType === 'inspect') {
    return {
      posture: 'cautious',
      label: 'Inspecting first',
      assetKey: 'bot_v2_think',
    };
  }

  return {
    posture: 'impulsive',
    label: 'Signal tempted',
    assetKey: 'bot_v2_excited',
  };
}

function createStatusMessage({ guidanceState, selectedWorldNodeId, actionResponsePanel }) {
  if (actionResponsePanel?.title) {
    return actionResponsePanel.title;
  }

  if (selectedWorldNodeId === TRAINING_WORLD_NODE_IDS.TRACE) {
    return guidanceState.traceCards.length > 0
      ? 'Trace shrine selected. Review what was spent and what remains unknown.'
      : 'Trace shrine selected. No trace has been recorded yet.';
  }

  if (selectedWorldNodeId === TRAINING_WORLD_NODE_IDS.POCKET) {
    return 'Pocket terminal selected. Status checks never send, sign, or pay.';
  }

  return 'Move through the training world and inspect before Pocket Bot spends attention.';
}

function createPublicRenderPlan(renderPlan) {
  return {
    sourceLevelId: renderPlan.sourceLevelId,
    selectedNodeId: renderPlan.selectedNodeId,
    surfaces: Object.fromEntries(
      Object.entries(renderPlan.surfaces || {}).map(([key, surface]) => [
        key,
        {
          state: surface.state,
          finishStatus: surface.finishStatus,
          traceCount: surface.traceCount,
          missingEvidence: clone(surface.missingEvidence) || [],
          residue: clone(surface.residue) || [],
          remainingUnknowns: clone(surface.remainingUnknowns) || [],
        },
      ])
    ),
  };
}

function validateCommand(command, session) {
  for (const key of ['sessionId', 'playerId', 'botId']) {
    if (!normalizeString(command?.[key])) {
      return `Command missing ${key}.`;
    }
  }

  if (!normalizeString(command?.type)) {
    return 'Command missing type.';
  }

  if (!SUPPORTED_COMMAND_TYPES.has(command.type)) {
    return `Unsupported command type: ${command.type}.`;
  }

  if (command.sessionId !== session.sessionId) {
    return 'Command sessionId does not match this training session.';
  }

  if (command.playerId !== session.playerId) {
    return 'Command playerId does not match this training session.';
  }

  if (command.botId !== session.botId) {
    return 'Command botId does not match this training session.';
  }

  if (command.roomId && command.roomId !== session.roomId) {
    return 'Command roomId does not match this training session.';
  }

  return null;
}

export function createLocalTrainingSession({
  scenario,
  sessionId,
  roomId = 'local-room',
  playerId,
  botId,
  routeProposalRequester = requestRouteProposal,
  pocketStatusRequester = null,
  initialNimiqPocketStatus = null,
} = {}) {
  if (!scenario) {
    throw new TypeError('Local training session requires a scenario.');
  }

  const session = {
    sessionId,
    roomId,
    playerId,
    botId,
  };
  let guidanceState = createPocketBotState(scenario);
  let actionResponsePanel = null;
  let selectedWorldNodeId = TRAINING_WORLD_NODE_IDS.SIGNAL;
  let dismissedTraceDrawerSignature = null;
  let nimiqPocketStatus = initialNimiqPocketStatus || createInitialPocketStatus(guidanceState);

  function createActionResponsePanelFor(actionId = null) {
    return createMarketWorldActionResponsePanel({
      runtimeSeed: scenario.marketWorldRuntime,
      runtimeState: guidanceState.marketWorldRuntime,
      actionId,
    });
  }

  function getState() {
    const rawRenderPlan = createMarketWorldRenderPlan({
      runtimeState: guidanceState.marketWorldRuntime,
      finishJudgment: guidanceState.mapState.finishJudgment,
      selectedNodeId: guidanceState.pendingProposal.targetNodeId,
      traceCards: guidanceState.traceCards,
    });
    const viewModel = createMarketWorldDecisionViewModel({
      scenario,
      guidanceState,
      nimiqPocketStatus,
      actionResponsePanel,
    });
    const signature = getTraceDrawerSignature(guidanceState);
    const traceDrawer = {
      ...viewModel.traceDrawer,
      visible: viewModel.traceDrawer.visible &&
        (
          selectedWorldNodeId === TRAINING_WORLD_NODE_IDS.TRACE ||
          signature !== dismissedTraceDrawerSignature
        ),
    };

    return {
      session: { ...session },
      guidanceState,
      renderPlan: createPublicRenderPlan(rawRenderPlan),
      resourceBar: viewModel.resourceBar,
      botProposal: viewModel.botProposal,
      narratorStrip: viewModel.narratorStrip,
      actionTray: viewModel.actionTray,
      contextualControls: viewModel.contextualControls,
      traceDrawer,
      botCompanion: createBotCompanionState(guidanceState),
      worldNodes: createTrainingWorldNodes({
        renderPlan: rawRenderPlan,
        guidanceState,
        selectedNodeId: selectedWorldNodeId,
      }),
      selectedWorldNodeId,
      statusMessage: createStatusMessage({
        guidanceState,
        selectedWorldNodeId,
        actionResponsePanel,
      }),
    };
  }

  function createResult({ accepted, events = [], error = null }) {
    return {
      accepted,
      state: getState(),
      events,
      error,
    };
  }

  async function dispatchTrainingCommand(command = {}) {
    const validationError = validateCommand(command, session);

    if (validationError) {
      return createResult({
        accepted: false,
        error: validationError,
        events: [{ type: 'command_rejected', reason: validationError }],
      });
    }

    if (command.type === TRAINING_COMMAND_TYPES.MOVE_ACTOR_TO_NODE) {
      selectedWorldNodeId = command.nodeId || selectedWorldNodeId;

      return createResult({
        accepted: true,
        events: [{ type: 'actor_moved', nodeId: selectedWorldNodeId }],
      });
    }

    if (command.type === TRAINING_COMMAND_TYPES.DISMISS_TRACE) {
      dismissedTraceDrawerSignature = getTraceDrawerSignature(guidanceState);

      return createResult({
        accepted: true,
        events: [{ type: 'trace_dismissed' }],
      });
    }

    if (command.type === TRAINING_COMMAND_TYPES.PREPARE_MARKET_ACTION) {
      guidanceState = applyArenaAction(guidanceState, command.actionId);
      actionResponsePanel = createActionResponsePanelFor(command.actionId);
      dismissedTraceDrawerSignature = null;

      return createResult({
        accepted: true,
        events: [{ type: 'market_action_prepared', actionId: command.actionId }],
      });
    }

    if (command.type === TRAINING_COMMAND_TYPES.APPROVE_PENDING_PROPOSAL) {
      const result = approvePendingProposal(guidanceState);

      guidanceState = result.state;
      actionResponsePanel = result.applied
        ? createActionResponsePanelFor()
        : {
            title: guidanceState.guidancePanel.title,
            lines: guidanceState.guidancePanel.lines,
            tone: 'warning',
          };
      dismissedTraceDrawerSignature = null;

      return createResult({
        accepted: result.applied,
        events: [
          {
            type: result.applied ? 'proposal_approved' : 'proposal_blocked',
            targetNodeId: guidanceState.pendingProposal.targetNodeId,
          },
          ...(result.applied ? [{ type: 'trace_created' }] : []),
        ],
        error: result.applied ? null : guidanceState.guidancePanel.lines.join(' '),
      });
    }

    if (command.type === TRAINING_COMMAND_TYPES.ASK_BOT_PROPOSAL) {
      const requestPayload = createRouteProposalRuntimeInput(guidanceState, {
        sessionId: session.sessionId,
      });
      const routeResult = await routeProposalRequester({
        ...requestPayload,
        mockFallback: true,
      });

      guidanceState = applyRouteProposalResult(guidanceState, routeResult);
      actionResponsePanel = {
        title: 'Bot Proposal Updated',
        lines: [
          `Mode: ${routeResult.mode}`,
          `Move: ${guidanceState.pendingProposal.moveType} -> ${guidanceState.pendingProposal.targetNodeId}`,
          'Approve still controls resource spending.',
        ],
        tone: 'blue',
      };
      dismissedTraceDrawerSignature = null;

      return createResult({
        accepted: true,
        events: [{ type: 'bot_proposal_updated', mode: routeResult.mode }],
      });
    }

    if (command.type === TRAINING_COMMAND_TYPES.CHECK_POCKET_STATUS) {
      if (pocketStatusRequester) {
        const pocketResult = await pocketStatusRequester({
          pocket: guidanceState.mapState.resources.nimiqPocket,
          command,
        });
        nimiqPocketStatus = pocketResult?.pocket ||
          (typeof pocketResult?.status === 'object' ? pocketResult.status : null) ||
          pocketResult;
      }
      actionResponsePanel = {
        title: 'Pocket Status Checked',
        lines: [
          'No send, sign, trade, checkout, or payment action was requested.',
          nimiqPocketStatus?.statusLabel || 'Local fallback pocket remains active.',
        ],
        tone: 'gold',
      };

      return createResult({
        accepted: true,
        events: [{ type: 'pocket_status_checked' }],
      });
    }

    return createResult({
      accepted: false,
      error: `Unsupported command type: ${command.type}.`,
    });
  }

  return {
    getState,
    dispatchTrainingCommand,
  };
}
