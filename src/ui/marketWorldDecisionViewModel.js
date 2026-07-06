import { FINISH_STATUSES } from '../domain/finishJudgment.js';
import { MARKET_WORLD_ACTIONS } from '../game/scenarios/marketWorldLevels.js';
import { createMarketWorldRenderPlan } from '../game/scenarios/marketWorldRenderPlan.js';
import { createNimiqPocketDisplay } from './resourceMeters.js';
import {
  createFinishPanelContent,
  createTracePanelContent,
} from './tracePanel.js';

const PRIMARY_ACTION_IDS = Object.freeze([
  MARKET_WORLD_ACTIONS.APPROVE_ENTER,
  MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN,
  MARKET_WORLD_ACTIONS.WIDE_SCAN,
  MARKET_WORLD_ACTIONS.CHECK_EXIT,
]);

const FORBIDDEN_PLAYER_WORDS = /\b(CRPM|source[- ]ocean|cut price|landfall|residualiz|signal_to_|v0|v1|v2|v3)\b/i;

const SURFACE_CONFIG = Object.freeze({
  support: {
    key: 'supportWell',
    assetKey: 'surface_support_fog_160',
    title: 'Support',
    labels: {
      hidden: 'Support hidden',
      hinted: 'Support?',
      stable: 'Support held',
    },
  },
  exit: {
    key: 'exitBridge',
    assetKey: 'surface_exit_fog_160',
    title: 'Exit',
    labels: {
      hidden: 'Exit fog',
      hinted: 'Exit?',
      revealed: 'Exit checked',
    },
  },
  crowd: {
    key: 'crowdPressure',
    assetKey: 'surface_crowd_pressure_160',
    title: 'Crowd',
    labels: {
      hidden: 'Crowd hidden',
      visible: 'Crowd murmur',
      hinted: 'Crowd?',
      active: 'Crowd pressure',
    },
  },
});

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function compactText(value, limit = 96) {
  const text = String(value || '').trim();

  return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
}

function cleanPlayerText(value) {
  return compactText(value)
    .replace(/residualized?/gi, 'carried forward')
    .replace(/signal_to_support/gi, 'support pressure')
    .replace(/signal_to_exit/gi, 'exit pressure')
    .replace(/signal_to_crowd/gi, 'crowd pressure')
    .replace(/signal_to_event/gi, 'event pressure');
}

function collectVisibleText(viewModel) {
  return [
    viewModel.resourceBar.botAttention.label,
    viewModel.resourceBar.nimiqPocket.label,
    viewModel.resourceBar.nimiqPocket.value,
    viewModel.arenaCard.title,
    viewModel.arenaCard.subtitle,
    viewModel.botProposal.speaker,
    viewModel.botProposal.move,
    viewModel.botProposal.text,
    viewModel.botProposal.cost,
    viewModel.narratorStrip.text,
    ...viewModel.actionTray.map((action) => action.label),
    ...viewModel.contextualControls.map((control) => control.label),
    ...Object.values(viewModel.arenaCard.surfaces).flatMap((surface) => [
      surface.title,
      surface.label,
      surface.statusLabel,
      surface.hint,
    ]),
    viewModel.traceDrawer.title,
    ...viewModel.traceDrawer.lines,
  ].filter(Boolean).join('\n');
}

function getArenaAction(scenario, actionId) {
  return scenario?.arenaSpine?.actions?.[actionId] || null;
}

function createPrimaryAction(scenario, actionId) {
  const action = getArenaAction(scenario, actionId);

  if (!action) {
    return null;
  }

  return {
    id: actionId,
    label: actionId === MARKET_WORLD_ACTIONS.APPROVE_ENTER
      ? 'Approve Enter'
      : action.label,
    primary: actionId === MARKET_WORLD_ACTIONS.APPROVE_ENTER,
    variant: actionId === MARKET_WORLD_ACTIONS.APPROVE_ENTER ? 'primary' : 'secondary',
  };
}

function getPrimaryActions(scenario) {
  return PRIMARY_ACTION_IDS
    .map((actionId) => createPrimaryAction(scenario, actionId))
    .filter(Boolean);
}

function getSurfaceStatusLabel(surface) {
  if (!surface) {
    return 'Hidden';
  }

  if (surface.state === 'hidden') {
    return 'Hidden';
  }

  if (surface.state === 'hinted') {
    return 'Question';
  }

  if (surface.state === 'stable' || surface.state === 'revealed') {
    return 'Checked';
  }

  if (surface.state === 'active') {
    return 'Active';
  }

  return surface.label || surface.state || 'Visible';
}

function createArenaSurfaces(renderPlan) {
  return Object.fromEntries(
    Object.entries(SURFACE_CONFIG).map(([id, config]) => {
      const surface = renderPlan.surfaces?.[config.key] || {};

      return [
        id,
        {
          id,
          title: config.title,
          label: cleanPlayerText(config.labels?.[surface.state] || getSurfaceStatusLabel(surface)),
          statusLabel: getSurfaceStatusLabel(surface),
          state: surface.state || 'hidden',
          relationStatus: surface.relationStatus || null,
          assetKey: config.assetKey,
          hint: cleanPlayerText(surface.hint || ''),
        },
      ];
    })
  );
}

function createResourceBar(guidanceState, nimiqPocketStatus) {
  const resources = guidanceState.mapState.resources;
  const pocketDisplay = createNimiqPocketDisplay(nimiqPocketStatus);

  return {
    botAttention: {
      label: resources.botAttention.label,
      current: resources.botAttention.current,
      max: resources.botAttention.max,
    },
    nimiqPocket: {
      label: resources.nimiqPocket.label,
      value: pocketDisplay.value,
      status: pocketDisplay.status,
      actionLabel: pocketDisplay.actionLabel,
    },
    traceCount: guidanceState.traceCards.length,
  };
}

function createBotProposal(guidanceState, scenario) {
  const proposal = guidanceState.pendingProposal;
  const preview = scenario.proposalPreview || {};
  const nodeLabel = scenario.nodes?.find((node) => node.id === proposal.targetNodeId)?.label ||
    proposal.targetNodeId;

  return {
    speaker: 'Pocket Bot',
    move: `${proposal.moveType} -> ${nodeLabel}`,
    text: cleanPlayerText(proposal.reason || preview.reason || preview.sourceBotPolicyText),
    cost: `${proposal.resourceCost.botAttention} Bot Attention | ${proposal.resourceCost.userGuidance} User Guidance`,
  };
}

function createNarratorStrip({ scenario, guidanceState, actionResponsePanel }) {
  const transition = guidanceState.marketWorldRuntime?.lastTransition;
  const actionId = transition?.actionId;
  const action = getArenaAction(scenario, actionId);
  const fallback = scenario.marketWorldRuntime?.navigationLineage?.protectedFamily?.[0] ||
    scenario.marketWorldRuntime?.proposalPreview?.reason ||
    'The chart is not lying. It is just incomplete.';
  const text =
    actionResponsePanel?.lines?.find((line) => /^Revealed:|^Still unknown:|^Does not prove:/i.test(line)) ||
    action?.narratorInsight ||
    scenario.marketWorldRuntime?.narratorLines?.pressureHint ||
    fallback;

  return {
    text: cleanPlayerText(text),
    tone: actionId === MARKET_WORLD_ACTIONS.CHECK_EXIT
      ? 'warning'
      : actionId === MARKET_WORLD_ACTIONS.WIDE_SCAN
        ? 'purple'
        : 'moon-blue',
  };
}

function getBotAssetKey({ guidanceState }) {
  const latestTrace = guidanceState.traceCards.at(-1);

  if (latestTrace) {
    return 'bot_v2_learning';
  }

  if (guidanceState.pendingProposal.moveType === 'inspect') {
    return 'bot_v2_think';
  }

  return 'bot_v2_excited';
}

function createArenaCard({ scenario, guidanceState, renderPlan }) {
  const timeWindow = scenario.marketWorldRuntime?.timeWindow || scenario.level?.witnessWindow?.source?.coveredRange || {};

  return {
    title: scenario.level?.label || 'Golden Signal',
    subtitle: timeWindow.visibleHistoryEnd
      ? `As-of ${String(timeWindow.visibleHistoryEnd).slice(0, 10)}`
      : 'Dec 2017',
    backgroundAssetKey: 'decision_arena_card_bg_720x520',
    signalAssetKey: 'btc_signal_glow_512x180',
    botAssetKey: getBotAssetKey({ guidanceState }),
    chartPoints: normalizeList(scenario.level?.witnessWindow?.playerVisible?.chartPoints),
    surfaces: createArenaSurfaces(renderPlan),
    finishState: renderPlan.surfaces?.finishGate?.state || 'open',
  };
}

function createContextualControls({ scenario, renderPlan, guidanceState }) {
  const controls = [
    {
      id: 'ask_bot',
      label: 'Ask Bot',
      variant: 'ghost',
    },
    {
      id: 'why',
      label: 'Why',
      variant: 'ghost',
    },
  ];

  if (renderPlan.surfaces?.supportWell?.state !== 'hidden') {
    controls.push({
      id: MARKET_WORLD_ACTIONS.CHECK_SUPPORT,
      label: 'Support Check',
      variant: 'context',
    });
  }

  if (guidanceState.traceCards.length > 0) {
    controls.push({
      id: 'partial',
      label: 'Mark Partial',
      variant: 'context',
    });
  }

  const pendingMoveIsInspect = guidanceState.pendingProposal.moveType === 'inspect';
  if (guidanceState.traceCards.length > 0 && !pendingMoveIsInspect) {
    controls.push({
      id: 'inspect_first',
      label: 'Inspect 1st',
      variant: 'context',
    });
  }

  return controls.filter((control) =>
    control.id !== MARKET_WORLD_ACTIONS.CHECK_SUPPORT ||
    Boolean(getArenaAction(scenario, MARKET_WORLD_ACTIONS.CHECK_SUPPORT))
  );
}

function createTraceDrawer({ guidanceState, scenario, actionResponsePanel }) {
  const latestTrace = guidanceState.traceCards.at(-1);

  if (latestTrace) {
    const finishPanel = createFinishPanelContent(latestTrace, {
      hindsightCard: scenario.marketWorldRuntime?.hindsightCard,
    });
    const panel = finishPanel || createTracePanelContent(latestTrace);

    return {
      visible: true,
      title: panel.title,
      lines: panel.lines.map((line) => cleanPlayerText(line)),
      tone: latestTrace.landfallStatus === FINISH_STATUSES.FALSE ? 'warning' : 'trace',
    };
  }

  if (actionResponsePanel) {
    return {
      visible: true,
      title: cleanPlayerText(actionResponsePanel.title),
      lines: actionResponsePanel.lines.slice(0, 5).map((line) => cleanPlayerText(line)),
      tone: actionResponsePanel.tone || 'trace',
    };
  }

  return {
    visible: false,
    title: null,
    lines: [],
    tone: 'trace',
  };
}

export function createMarketWorldDecisionViewModel({
  scenario,
  guidanceState,
  nimiqPocketStatus,
  actionResponsePanel = null,
} = {}) {
  if (!scenario || !guidanceState) {
    throw new TypeError('Decision view model requires a scenario and guidance state.');
  }

  const renderPlan = createMarketWorldRenderPlan({
    runtimeState: guidanceState.marketWorldRuntime,
    finishJudgment: guidanceState.mapState.finishJudgment,
    selectedNodeId: guidanceState.pendingProposal.targetNodeId,
    traceCards: guidanceState.traceCards,
  });
  const viewModel = {
    resourceBar: createResourceBar(guidanceState, nimiqPocketStatus),
    arenaCard: createArenaCard({ scenario, guidanceState, renderPlan }),
    botProposal: createBotProposal(guidanceState, scenario),
    narratorStrip: createNarratorStrip({ scenario, guidanceState, actionResponsePanel }),
    actionTray: getPrimaryActions(scenario),
    contextualControls: createContextualControls({ scenario, renderPlan, guidanceState }),
    traceDrawer: createTraceDrawer({ guidanceState, scenario, actionResponsePanel }),
  };
  const playerText = collectVisibleText(viewModel);

  if (FORBIDDEN_PLAYER_WORDS.test(playerText)) {
    throw new Error('Decision view model leaked internal navigation terminology.');
  }

  return viewModel;
}
