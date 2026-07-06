import Phaser from 'phaser';

import nimiRunV2AssetManifest from '../game/assets/nimirunV2AssetManifest.json';
import {
  applyArenaAction,
  approvePendingProposal,
  markPartialResult,
  redirectToInspectFirst,
  showWhyThisRoute,
} from '../domain/guidanceLoop.js';
import { createPocketBotState } from '../game/pocketBotState.js';
import {
  applyRouteProposalResult,
  createRouteProposalRuntimeInput,
} from '../game/routeProposalRuntime.js';
import { createMarketSignalScoutScenario } from '../game/scenarios/marketSignalScoutScenario.js';
import { MARKET_WORLD_ACTIONS } from '../game/scenarios/marketWorldLevels.js';
import { preloadNimiRunV2Assets } from '../game/assets/preloadNimiRunV2Assets.js';
import { requestRouteProposal } from '../llm/routeProposalClient.js';
import {
  createNimiqPocketStatus,
  getMiniAppEnvironment,
  requestNimiqPocketStatus,
} from '../platform/nimiqMiniApp.js';
import { createMarketWorldActionResponsePanel } from '../ui/marketWorldActionResponsePanel.js';
import { createMarketWorldDecisionViewModel } from '../ui/marketWorldDecisionViewModel.js';
import {
  createPocketBotDecisionSceneLayout,
  layoutDecisionActionButtons,
} from '../ui/pocketBotDecisionSceneLayout.js';

const COLORS = Object.freeze({
  background: 0x050b10,
  panel: 0x101923,
  panelSoft: 0x14202b,
  panelStroke: 0xf2b33d,
  panelDimStroke: 0x35506a,
  text: '#f3e4c2',
  muted: '#aab4bd',
  moonBlue: 0x2b5f8f,
  attentionBlue: 0x48a8ff,
  nimiqGold: 0xf2b33d,
  cluePurple: 0x9b63ff,
  warningRed: 0xff5a3d,
  safeGreen: 0x58d68d,
});

function createTextStyle(overrides = {}) {
  return {
    fontFamily: 'system-ui, sans-serif',
    fontSize: '14px',
    color: COLORS.text,
    ...overrides,
  };
}

function truncateText(value, limit = 92) {
  const text = String(value || '');

  return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
}

function createPanel(scene, rect, {
  fill = COLORS.panel,
  stroke = COLORS.panelDimStroke,
  alpha = 0.94,
  radius = 12,
} = {}) {
  scene.add
    .rectangle(rect.x, rect.y, rect.width, rect.height, fill, alpha)
    .setOrigin(0)
    .setStrokeStyle(1, stroke, 0.82);

  if (radius > 0) {
    scene.add
      .rectangle(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2, fill, 0)
      .setOrigin(0)
      .setStrokeStyle(1, stroke, 0.28);
  }
}

function lineColorForSurface(surface) {
  if (surface.state === 'stable' || surface.state === 'revealed') {
    return COLORS.safeGreen;
  }

  if (surface.state === 'active') {
    return COLORS.warningRed;
  }

  if (surface.state === 'hinted') {
    return COLORS.cluePurple;
  }

  return COLORS.panelDimStroke;
}

export default class PocketBotWorkshopV2 extends Phaser.Scene {
  constructor() {
    super({ key: 'PocketBotWorkshopV2' });
  }

  preload() {
    preloadNimiRunV2Assets(this, nimiRunV2AssetManifest);
  }

  create() {
    this.mapScenario = createMarketSignalScoutScenario();
    this.guidanceState = createPocketBotState(this.mapScenario);
    this.resourceState = this.guidanceState.mapState.resources;
    this.miniAppEnvironment = getMiniAppEnvironment(window);
    this.nimiqPocketStatus = createNimiqPocketStatus({
      environment: this.miniAppEnvironment,
      pocket: this.resourceState.nimiqPocket,
      status: this.miniAppEnvironment.providerStatus,
    });
    this.actionResponsePanel = null;
    this.routeProposalPending = false;
    this.statusMessage = 'Pocket Bot sees a bright signal and wants to enter.';
    this.dismissedTraceDrawerSignature = null;

    this.render();
  }

  createActionResponsePanel(actionId = null) {
    return createMarketWorldActionResponsePanel({
      runtimeSeed: this.mapScenario.marketWorldRuntime,
      runtimeState: this.guidanceState.marketWorldRuntime,
      actionId,
    });
  }

  createViewModel() {
    return createMarketWorldDecisionViewModel({
      scenario: this.mapScenario,
      guidanceState: this.guidanceState,
      nimiqPocketStatus: this.nimiqPocketStatus,
      actionResponsePanel: this.actionResponsePanel,
    });
  }

  getTraceDrawerSignature() {
    const latestTrace = this.guidanceState.traceCards.at(-1);
    const transition = this.guidanceState.marketWorldRuntime?.lastTransition;

    if (latestTrace) {
      return `trace:${latestTrace.sequence}:${latestTrace.landfallStatus}`;
    }

    if (transition) {
      return `transition:${transition.actionId}:${transition.phase}:${this.guidanceState.guidanceTrace.length}`;
    }

    return 'empty';
  }

  shouldShowTraceDrawer(viewModel) {
    return viewModel.traceDrawer.visible &&
      this.getTraceDrawerSignature() !== this.dismissedTraceDrawerSignature;
  }

  render() {
    this.children.removeAll(true);
    this.layout = createPocketBotDecisionSceneLayout(this.scale.width, this.scale.height);
    const viewModel = this.createViewModel();

    this.drawBackground();
    this.drawResourceBar(viewModel.resourceBar);
    this.drawArenaCard(viewModel.arenaCard);
    this.drawBotProposal(viewModel.botProposal, viewModel.contextualControls);
    this.drawNarratorStrip(viewModel.narratorStrip);
    this.drawActionTray(viewModel.actionTray);
    this.drawStatusLine();

    if (this.shouldShowTraceDrawer(viewModel)) {
      this.drawTraceDrawer(viewModel.traceDrawer);
    }
  }

  drawBackground() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, COLORS.background).setOrigin(0);
    for (let index = 0; index < 54; index += 1) {
      const x = (index * 73) % width;
      const y = (index * 47) % height;
      const alpha = 0.08 + ((index % 5) * 0.025);
      this.add.circle(x, y, 1.2, 0xf3e4c2, alpha);
    }
  }

  drawResourceBar(resourceBar) {
    const rect = this.layout.resourceBar;

    createPanel(this, rect, { stroke: COLORS.panelStroke, alpha: 0.9 });
    this.add.text(rect.x + 12, rect.y + 9, `${resourceBar.botAttention.label}`, {
      ...createTextStyle({ fontSize: '11px', color: '#f3e4c2', fontStyle: '700' }),
    });
    this.add.text(rect.x + 12, rect.y + 27, `${resourceBar.botAttention.current}/${resourceBar.botAttention.max}`, {
      ...createTextStyle({ fontSize: '14px', color: '#48a8ff', fontStyle: '700' }),
    });

    for (let index = 0; index < resourceBar.botAttention.max; index += 1) {
      const filled = index < resourceBar.botAttention.current;
      this.add
        .rectangle(rect.x + 70 + index * 11, rect.y + 32, 8, 9, filled ? COLORS.attentionBlue : COLORS.panelSoft, 1)
        .setOrigin(0)
        .setStrokeStyle(1, filled ? COLORS.attentionBlue : COLORS.panelDimStroke, 0.9);
    }

    this.add.text(rect.x + 190, rect.y + 9, resourceBar.nimiqPocket.label, {
      ...createTextStyle({ fontSize: '11px', color: '#f3e4c2', fontStyle: '700' }),
    });
    this.add.text(rect.x + 190, rect.y + 27, resourceBar.nimiqPocket.value, {
      ...createTextStyle({ fontSize: '14px', color: '#f2b33d', fontStyle: '700' }),
    });
    this.drawSmallButton({
      x: rect.x + rect.width - 58,
      y: rect.y + 17,
      width: 46,
      height: 22,
      label: resourceBar.nimiqPocket.actionLabel || 'Check',
      onClick: () => this.handleCheckPocketStatus(),
    });
    this.add.text(rect.x + rect.width - 120, rect.y + 9, `Trace ${resourceBar.traceCount}`, {
      ...createTextStyle({ fontSize: '11px', color: '#aab4bd', align: 'right' }),
    });
  }

  drawArenaCard(arenaCard) {
    const rect = this.layout.arenaCard;

    if (this.textures.exists(arenaCard.backgroundAssetKey)) {
      this.add
        .image(rect.x, rect.y, arenaCard.backgroundAssetKey)
        .setOrigin(0)
        .setDisplaySize(rect.width, rect.height);
    } else {
      createPanel(this, rect, { stroke: COLORS.panelStroke });
    }

    this.add.text(rect.x + 18, rect.y + 14, arenaCard.title, {
      ...createTextStyle({ fontSize: '22px', color: '#f2b33d', fontStyle: '700' }),
    });
    this.add.text(rect.x + 18, rect.y + 42, arenaCard.subtitle, {
      ...createTextStyle({ fontSize: '11px', color: '#aab4bd' }),
    });

    if (this.textures.exists(arenaCard.signalAssetKey)) {
      this.add
        .image(rect.x + rect.width / 2, rect.y + rect.height * 0.38, arenaCard.signalAssetKey)
        .setDisplaySize(rect.width * 0.82, rect.height * 0.28)
        .setAlpha(0.92);
    }

    this.drawChartLine(arenaCard.chartPoints, rect);
    this.drawArenaSurface(arenaCard.surfaces.support, rect.x + 58, rect.y + rect.height - 145);
    this.drawArenaSurface(arenaCard.surfaces.exit, rect.x + rect.width - 138, rect.y + rect.height - 150);
    this.drawArenaSurface(arenaCard.surfaces.crowd, rect.x + rect.width - 136, rect.y + 90);

    if (this.textures.exists(arenaCard.botAssetKey)) {
      this.add
        .image(rect.x + rect.width * 0.5, rect.y + rect.height - 80, arenaCard.botAssetKey)
        .setDisplaySize(112, 112);
    }

    this.add.text(rect.x + 18, rect.y + rect.height - 34, `Finish: ${arenaCard.finishState}`, {
      ...createTextStyle({ fontSize: '11px', color: '#aab4bd' }),
    });
  }

  drawChartLine(chartPoints, rect) {
    if (!Array.isArray(chartPoints) || chartPoints.length < 2) {
      return;
    }

    const values = chartPoints.map((point) => point.closeIndex);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const width = rect.width - 76;
    const height = 94;
    const originX = rect.x + 38;
    const originY = rect.y + 168;
    const graphics = this.add.graphics();

    graphics.lineStyle(3, COLORS.panelStroke, 0.94);
    chartPoints.forEach((point, index) => {
      const x = originX + (index / (chartPoints.length - 1)) * width;
      const normalized = (point.closeIndex - min) / Math.max(1, max - min);
      const y = originY + height - normalized * height;

      if (index === 0) {
        graphics.beginPath();
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    });
    graphics.strokePath();
  }

  drawArenaSurface(surface, x, y) {
    if (this.textures.exists(surface.assetKey)) {
      this.add.image(x + 45, y + 45, surface.assetKey).setDisplaySize(90, 90).setAlpha(0.9);
    } else {
      this.add.circle(x + 45, y + 45, 42, lineColorForSurface(surface), 0.2);
    }

    this.add
      .circle(x + 45, y + 45, 48, lineColorForSurface(surface), 0)
      .setStrokeStyle(2, lineColorForSurface(surface), 0.82);
    this.add.text(x, y + 96, surface.title, {
      ...createTextStyle({ fontSize: '11px', color: '#f3e4c2', fontStyle: '700', align: 'center' }),
      wordWrap: { width: 90 },
    }).setOrigin(0, 0);
    this.add.text(x, y + 112, surface.label, {
      ...createTextStyle({ fontSize: '10px', color: '#aab4bd', align: 'center' }),
      wordWrap: { width: 92 },
    }).setOrigin(0, 0);
  }

  drawBotProposal(botProposal, contextualControls) {
    const rect = this.layout.botProposal;

    createPanel(this, rect, { stroke: COLORS.panelStroke, alpha: 0.92 });
    this.add.text(rect.x + 14, rect.y + 9, botProposal.speaker, {
      ...createTextStyle({ fontSize: '12px', color: '#f2b33d', fontStyle: '700' }),
    });
    this.add.text(rect.x + 14, rect.y + 29, truncateText(botProposal.text, 86), {
      ...createTextStyle({ fontSize: '11px', color: '#f3e4c2' }),
      wordWrap: { width: rect.width - 118 },
    });
    this.add.text(rect.x + 14, rect.y + rect.height - 19, botProposal.cost, {
      ...createTextStyle({ fontSize: '10px', color: '#48a8ff' }),
    });
    this.drawContextualControls(contextualControls, rect);
  }

  drawContextualControls(controls, rect) {
    const visible = controls.slice(0, 3);
    const buttonWidth = 74;
    const startX = rect.x + rect.width - buttonWidth - 12;
    let y = rect.y + 9;

    for (const control of visible) {
      this.drawSmallButton({
        x: startX,
        y,
        width: buttonWidth,
        height: 18,
        label: control.label,
        onClick: () => this.handleContextualControl(control.id),
      });
      y += 21;
    }
  }

  drawNarratorStrip(narratorStrip) {
    const rect = this.layout.narratorStrip;
    const stroke = narratorStrip.tone === 'warning'
      ? COLORS.warningRed
      : narratorStrip.tone === 'purple'
        ? COLORS.cluePurple
        : COLORS.moonBlue;

    createPanel(this, rect, { stroke, alpha: 0.9 });
    if (this.textures.exists('narrator_sigil_96')) {
      this.add.image(rect.x + 28, rect.y + rect.height / 2, 'narrator_sigil_96').setDisplaySize(34, 34);
    }
    this.add.text(rect.x + 52, rect.y + 10, truncateText(narratorStrip.text, 112), {
      ...createTextStyle({ fontSize: '12px', color: '#f3e4c2' }),
      wordWrap: { width: rect.width - 64 },
    });
  }

  drawActionTray(actionTray) {
    const buttons = layoutDecisionActionButtons(this.layout.actionTray, actionTray);

    for (const button of buttons) {
      this.drawLargeButton(button);
    }
  }

  drawLargeButton(button) {
    const frameKey = button.variant === 'primary'
      ? 'action_button_primary_220x72'
      : 'action_button_secondary_220x72';

    if (this.textures.exists(frameKey)) {
      const image = this.add
        .image(button.x, button.y, frameKey)
        .setOrigin(0)
        .setDisplaySize(button.width, button.height)
        .setInteractive({ useHandCursor: true });
      image.on('pointerdown', () => this.handlePrimaryAction(button.id));
    } else {
      this.add
        .rectangle(button.x, button.y, button.width, button.height, button.primary ? COLORS.panelStroke : COLORS.panelSoft, 0.92)
        .setOrigin(0)
        .setStrokeStyle(2, button.primary ? COLORS.panelStroke : COLORS.panelDimStroke, 0.9)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.handlePrimaryAction(button.id));
    }

    this.add.text(button.x + button.width / 2, button.y + button.height / 2, button.label, {
      ...createTextStyle({
        fontSize: button.label.length > 12 ? '12px' : '13px',
        color: button.primary ? '#050b10' : '#f3e4c2',
        fontStyle: '700',
        align: 'center',
      }),
      wordWrap: { width: button.width - 12 },
    }).setOrigin(0.5);
  }

  drawSmallButton({ x, y, width, height, label, onClick }) {
    const background = this.add
      .rectangle(x, y, width, height, COLORS.panelSoft, 0.92)
      .setOrigin(0)
      .setStrokeStyle(1, COLORS.panelDimStroke, 0.9)
      .setInteractive({ useHandCursor: true });

    background.on('pointerdown', onClick);
    this.add.text(x + width / 2, y + height / 2, label, {
      ...createTextStyle({ fontSize: '9px', color: '#f3e4c2', fontStyle: '700' }),
    }).setOrigin(0.5);
  }

  drawStatusLine() {
    this.add.text(this.layout.content.x, this.scale.height - 18, truncateText(this.statusMessage, 100), {
      ...createTextStyle({ fontSize: '10px', color: '#48a8ff', fontStyle: '700' }),
      wordWrap: { width: this.layout.content.width },
    });
  }

  drawTraceDrawer(traceDrawer) {
    const rect = this.layout.traceDrawer;

    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.42).setOrigin(0);
    if (this.textures.exists('trace_drawer_frame_720x360')) {
      this.add
        .image(rect.x, rect.y, 'trace_drawer_frame_720x360')
        .setOrigin(0)
        .setDisplaySize(rect.width, rect.height);
    } else {
      createPanel(this, rect, { stroke: COLORS.cluePurple, alpha: 0.98 });
    }

    this.add.text(rect.x + 24, rect.y + 24, traceDrawer.title, {
      ...createTextStyle({ fontSize: '18px', color: '#f2b33d', fontStyle: '700' }),
      wordWrap: { width: rect.width - 48 },
    });
    this.add.text(rect.x + 24, rect.y + 62, traceDrawer.lines.slice(0, 5).join('\n'), {
      ...createTextStyle({ fontSize: '12px', color: '#f3e4c2' }),
      lineSpacing: 4,
      wordWrap: { width: rect.width - 48 },
    });
    this.drawSmallButton({
      x: rect.x + rect.width - 94,
      y: rect.y + rect.height - 44,
      width: 70,
      height: 24,
      label: 'Continue',
      onClick: () => {
        this.dismissedTraceDrawerSignature = this.getTraceDrawerSignature();
        this.render();
      },
    });
  }

  handlePrimaryAction(actionId) {
    if (actionId === MARKET_WORLD_ACTIONS.APPROVE_ENTER) {
      this.handleApproveProposal();
      return;
    }

    this.handleArenaAction(actionId);
  }

  handleArenaAction(actionId) {
    const action = this.mapScenario.arenaSpine?.actions?.[actionId];

    this.guidanceState = applyArenaAction(this.guidanceState, actionId);
    this.actionResponsePanel = this.createActionResponsePanel(actionId);
    this.dismissedTraceDrawerSignature = null;
    this.statusMessage = action?.behavior === 'show_unknowns'
      ? 'Hidden assumptions exposed before spending attention.'
      : action
        ? `${action.label} prepared. Approve controls Bot Attention spending.`
        : 'Arena action could not be prepared.';
    this.render();
  }

  handleApproveProposal() {
    const result = approvePendingProposal(this.guidanceState);

    this.guidanceState = result.state;
    this.actionResponsePanel = result.applied
      ? this.createActionResponsePanel()
      : {
          title: this.guidanceState.guidancePanel.title,
          lines: this.guidanceState.guidancePanel.lines,
          tone: 'warning',
        };
    this.dismissedTraceDrawerSignature = null;
    this.statusMessage = result.applied
      ? 'Accepted move. Trace drawer updated.'
      : 'Move blocked before resources were spent.';
    this.render();
  }

  handleContextualControl(controlId) {
    if (controlId === MARKET_WORLD_ACTIONS.CHECK_SUPPORT) {
      this.handleArenaAction(MARKET_WORLD_ACTIONS.CHECK_SUPPORT);
      return;
    }

    if (controlId === 'why') {
      this.guidanceState = showWhyThisRoute(this.guidanceState);
      this.actionResponsePanel = {
        title: this.guidanceState.guidancePanel.title,
        lines: this.guidanceState.guidancePanel.lines,
        tone: 'blue',
      };
      this.dismissedTraceDrawerSignature = null;
      this.statusMessage = 'Route rationale exposed.';
      this.render();
      return;
    }

    if (controlId === 'inspect_first') {
      this.guidanceState = redirectToInspectFirst(this.guidanceState);
      this.actionResponsePanel = {
        title: this.guidanceState.guidancePanel.title,
        lines: this.guidanceState.guidancePanel.lines,
        tone: 'blue',
      };
      this.dismissedTraceDrawerSignature = null;
      this.statusMessage = 'Proposal changed to inspect first.';
      this.render();
      return;
    }

    if (controlId === 'partial') {
      this.guidanceState = markPartialResult(
        this.guidanceState,
        'This is useful, but not full success.'
      );
      this.actionResponsePanel = null;
      this.dismissedTraceDrawerSignature = null;
      this.statusMessage = 'Marked as partial progress.';
      this.render();
      return;
    }

    if (controlId === 'ask_bot') {
      this.handleAskBotProposal();
    }
  }

  async handleAskBotProposal() {
    if (this.routeProposalPending) {
      this.statusMessage = 'Pocket Bot is already preparing a route proposal.';
      this.render();
      return;
    }

    this.routeProposalPending = true;
    this.statusMessage = 'Asking Pocket Bot for a bounded route proposal...';
    this.render();

    try {
      const requestPayload = createRouteProposalRuntimeInput(this.guidanceState, {
        sessionId: `run-${this.mapScenario.id}-v2`,
      });
      const result = await requestRouteProposal({
        ...requestPayload,
        mockFallback: true,
      });

      this.guidanceState = applyRouteProposalResult(this.guidanceState, result);
      this.actionResponsePanel = {
        title: 'Bot Proposal Updated',
        lines: [
          `Mode: ${result.mode}`,
          `Move: ${this.guidanceState.pendingProposal.moveType} -> ${this.guidanceState.pendingProposal.targetNodeId}`,
          'Approve still controls resource spending.',
        ],
        tone: 'blue',
      };
      this.dismissedTraceDrawerSignature = null;
      this.statusMessage = `Bot proposal updated via ${result.mode}.`;
    } catch (error) {
      this.actionResponsePanel = {
        title: 'Bot Proposal Unavailable',
        lines: [
          'The route relay did not return a usable proposal.',
          error.message,
        ],
        tone: 'warning',
      };
      this.dismissedTraceDrawerSignature = null;
      this.statusMessage = 'Bot proposal request failed before resources were spent.';
    } finally {
      this.routeProposalPending = false;
      this.render();
    }
  }

  async handleCheckPocketStatus() {
    this.statusMessage = 'Checking Nimiq pocket status. No send, sign, or payment action will run.';
    this.render();

    const result = await requestNimiqPocketStatus({
      globalObject: window,
      pocket: this.guidanceState.mapState.resources.nimiqPocket,
      initializeProvider: true,
    });

    this.nimiqPocketStatus = result.status;
    this.statusMessage = result.traceCard
      ? 'Nimiq pocket status checked. No wallet authority was requested.'
      : 'Nimiq pocket status unavailable; local fallback remains active.';
    this.render();
  }
}
