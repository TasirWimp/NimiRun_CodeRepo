import Phaser from 'phaser';

import nimiRunV2AssetManifest from '../game/assets/nimirunV2AssetManifest.json';
import { getContextSlotUsage } from '../domain/contextSlots.js';
import {
  evaluateResourceCost,
} from '../domain/resourceRules.js';
import {
  appendTraceCard,
  createPocketTraceCard,
} from '../domain/traces.js';
import {
  approvePendingProposal,
  markPartialResult,
  redirectPendingProposal,
  redirectToInspectFirst,
  showRemainingUnknowns,
  showWhyThisRoute,
} from '../domain/guidanceLoop.js';
import { getLossyMapNodeView } from '../domain/lossyMap.js';
import { preloadNimiRunV2Assets } from '../game/assets/preloadNimiRunV2Assets.js';
import { createPocketBotState } from '../game/pocketBotState.js';
import {
  NODE_KINDS,
  NODE_VISIBILITY,
  PATH_VISIBILITY,
  getNodeById,
  getPathEndpoints,
} from '../game/resourceMapScenario.js';
import { createMarketSignalScoutScenario } from '../game/scenarios/marketSignalScoutScenario.js';
import {
  createNimiqPocketStatus,
  getMiniAppEnvironment,
  requestNimiqPocketStatus,
} from '../platform/nimiqMiniApp.js';
import { createGuidanceButton } from '../ui/guidanceControls.js';
import { createNimiqPocketDisplay } from '../ui/resourceMeters.js';
import {
  createTracePanelContent,
  formatTraceArchiveLabel,
} from '../ui/tracePanel.js';
import {
  createWitnessHudSummary,
  createWitnessPanelContent,
} from '../ui/witnessPanel.js';
import { createWorkshopLayout } from '../ui/workshopLayout.js';

const COLORS = Object.freeze({
  background: 0x050b10,
  panel: 0x101923,
  panelSoft: 0x14202b,
  panelStroke: 0xf2b33d,
  panelDimStroke: 0x35506a,
  text: '#f3e4c2',
  muted: '#aab4bd',
  darkText: '#050b10',
  sourceNight: 0x050b10,
  slate: 0x101923,
  moonBlue: 0x2b5f8f,
  attentionBlue: 0x48a8ff,
  nimiqGold: 0xf2b33d,
  emberGold: 0xd87822,
  contextGreen: 0x80c84d,
  cluePurple: 0x9b63ff,
  residueShadow: 0x2d2438,
  warningRed: 0xff5a3d,
  safeGreen: 0x58d68d,
});

const NODE_STYLES = Object.freeze({
  [NODE_KINDS.START]: { fill: COLORS.emberGold, stroke: COLORS.nimiqGold, icon: 'S' },
  [NODE_KINDS.SHORTCUT]: { fill: COLORS.warningRed, stroke: COLORS.emberGold, icon: '!' },
  [NODE_KINDS.CLUE]: { fill: COLORS.cluePurple, stroke: COLORS.nimiqGold, icon: 'C' },
  [NODE_KINDS.CONTEXT]: { fill: COLORS.contextGreen, stroke: COLORS.nimiqGold, icon: 'M' },
  [NODE_KINDS.POCKET]: { fill: COLORS.nimiqGold, stroke: COLORS.emberGold, icon: 'N' },
  [NODE_KINDS.WARNING]: { fill: COLORS.warningRed, stroke: COLORS.nimiqGold, icon: '!' },
  [NODE_KINDS.FALSE_FINISH]: { fill: COLORS.emberGold, stroke: COLORS.warningRed, icon: 'F' },
  [NODE_KINDS.SAFE_FINISH]: { fill: COLORS.safeGreen, stroke: COLORS.nimiqGold, icon: 'G' },
});

const NODE_ASSETS = Object.freeze({
  [NODE_KINDS.START]: {
    pad: 'node_pad_gold_signal_96',
    icon: 'node_start_64',
    ring: 'node_ring_current_96',
  },
  [NODE_KINDS.SHORTCUT]: {
    pad: 'node_pad_gold_signal_96',
    icon: 'node_golden_signal_64',
    ring: 'node_ring_reachable_96',
  },
  [NODE_KINDS.CLUE]: {
    pad: 'node_pad_support_well_96',
    icon: 'node_support_well_64',
    ring: 'node_ring_reachable_96',
  },
  [NODE_KINDS.CONTEXT]: {
    pad: 'node_pad_context_shrine_96',
    icon: 'node_context_shrine_64',
    ring: 'node_ring_reachable_96',
  },
  [NODE_KINDS.POCKET]: {
    pad: 'node_pad_pocket_spark_96',
    icon: 'node_pocket_spark_64',
    ring: 'node_ring_reachable_96',
  },
  [NODE_KINDS.WARNING]: {
    pad: 'node_pad_noise_echo_96',
    icon: 'node_warning_64',
    ring: 'node_ring_blocked_96',
  },
  [NODE_KINDS.FALSE_FINISH]: {
    pad: 'node_pad_false_gate_96',
    icon: 'node_false_gate_64',
    ring: 'node_ring_blocked_96',
  },
  [NODE_KINDS.SAFE_FINISH]: {
    pad: 'node_pad_safe_gate_96',
    icon: 'node_safe_gate_64',
    ring: 'node_ring_reachable_96',
  },
});

function toWorldPosition(node, layout, mapSize) {
  const scaleX = layout.map.innerWidth / mapSize.width;
  const usableHeight = layout.isMobile ? layout.map.innerHeight - 28 : layout.map.innerHeight;
  const scaleY = usableHeight / mapSize.height;

  return {
    x: layout.map.x + 5 + node.position.x * scaleX,
    y: layout.map.y + 5 + node.position.y * scaleY,
  };
}

function scaleValue(value, scale, minimum = 1) {
  return Math.max(minimum, Math.round(value * scale));
}

function scaleSignedValue(value, scale, minimum = 1) {
  if (value === 0) {
    return 0;
  }

  return Math.sign(value) * Math.max(minimum, Math.round(Math.abs(value) * scale));
}

function createTextStyle(overrides = {}) {
  return {
    fontFamily: 'system-ui, sans-serif',
    fontSize: '14px',
    color: COLORS.text,
    ...overrides,
  };
}

function createPanel(scene, layout, stroke = COLORS.panelStroke, frameKey = null) {
  scene.add
    .rectangle(layout.x, layout.y, layout.width, layout.height, COLORS.panel, 0.94)
    .setOrigin(0);

  if (frameKey && scene.textures.exists(frameKey)) {
    scene.add
      .image(layout.x, layout.y, frameKey)
      .setOrigin(0)
      .setDisplaySize(layout.width, layout.height);
    return;
  }

  scene.add
    .rectangle(layout.x, layout.y, layout.width, layout.height, COLORS.panel, 0)
    .setOrigin(0)
    .setStrokeStyle(2, stroke, 0.86);
}

function formatList(items, fallback = 'none') {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback;
  }

  const visible = items.slice(0, 2).join(', ');
  const remaining = items.length - 2;

  return remaining > 0 ? `${visible}, +${remaining} more` : visible;
}

function formatGuidanceValue(userGuidance) {
  const prompts = userGuidance.prompts || 0;

  return prompts > 0 ? `${userGuidance.level} (${prompts})` : userGuidance.level;
}

function truncateText(value, limit = 120) {
  if (!value || value.length <= limit) {
    return value || '';
  }

  return `${value.slice(0, limit - 3)}...`;
}

function createNodeDetailLines({ knownState, riskState, inspectSummary, remainingUnknowns, witnessPanel }) {
  if (!witnessPanel) {
    return [
      `State: ${knownState}`,
      `Risk: ${riskState}`,
      `Inspect: ${inspectSummary}`,
      `Residue: ${formatList(remainingUnknowns)}`,
    ];
  }

  return [
    `State: ${knownState}`,
    `Risk: ${riskState}`,
    `Witness: ${witnessPanel.witness.title}`,
    `Game: ${witnessPanel.witness.mechanicsConnector}`,
    'Not: trading advice',
  ];
}

export default class PocketBotWorkshop extends Phaser.Scene {
  constructor() {
    super({ key: 'PocketBotWorkshop' });
  }

  preload() {
    preloadNimiRunV2Assets(this, nimiRunV2AssetManifest);
  }

  create() {
    this.mapScenario = createMarketSignalScoutScenario();
    this.layout = createWorkshopLayout(this.scale.width, this.scale.height);
    this.mapSize = this.mapScenario.map || { width: 640, height: 420 };
    this.mapScale = Math.min(
      this.layout.map.innerWidth / this.mapSize.width,
      this.layout.map.innerHeight / this.mapSize.height
    );
    this.guidanceState = createPocketBotState(this.mapScenario);
    this.resourceState = this.guidanceState.mapState.resources;
    this.miniAppEnvironment = getMiniAppEnvironment(window);
    this.nimiqPocketStatus = createNimiqPocketStatus({
      environment: this.miniAppEnvironment,
      pocket: this.resourceState.nimiqPocket,
      status: this.miniAppEnvironment.providerStatus,
    });
    this.nodeMarkers = new Map();
    this.attentionSegments = [];

    this.drawBackground();
    this.drawHeader();
    this.drawMap();
    this.drawHud();
    this.drawBottomPanels();
    this.selectNode(this.mapScenario.proposalPreview.targetNodeId, { redirectProposal: false });
    this.setStatus(this.getDefaultStatus());
  }

  getNodePosition(node) {
    return toWorldPosition(node, this.layout, this.mapSize);
  }

  scaleMapValue(value, minimum = 1) {
    return scaleValue(value, this.mapScale, minimum);
  }

  drawBackground() {
    const { width, height } = this.scale;
    const headerHeight = this.layout.isMobile ? 88 : 96;

    this.add.rectangle(0, 0, width, height, COLORS.background).setOrigin(0);
    this.add.rectangle(0, 0, width, headerHeight, 0x071018, 0.98).setOrigin(0);
    this.add.rectangle(0, headerHeight, width, 1, COLORS.panelStroke, 0.6).setOrigin(0);

    for (let index = 0; index < 42; index += 1) {
      const x = 18 + ((index * 73) % width);
      const y = 18 + ((index * 41) % Math.max(24, headerHeight - 24));
      const alpha = 0.18 + ((index % 5) * 0.04);
      this.add.circle(x, y, 1.2, 0xf3e4c2, alpha);
    }
  }

  drawHeader() {
    const header = this.layout.header;

    this.add.text(header.titleX, header.titleY, this.mapScenario.title, {
      ...createTextStyle({ fontSize: header.titleSize, color: '#f2b33d', fontStyle: '700' }),
    });

    this.add.text(header.supportX, header.supportY, this.mapScenario.supportLine, {
      ...createTextStyle({ fontSize: header.supportSize, color: '#f3e4c2' }),
    });

    const environmentText = this.miniAppEnvironment.isNimiqPay
      ? `Mini App: Nimiq Pay detected | ${this.miniAppEnvironment.language} | ${this.miniAppEnvironment.network}`
      : `Mini App: local simulated mode | ${this.miniAppEnvironment.language}`;

    this.add.text(header.environmentX, header.environmentY, environmentText, {
      ...createTextStyle({
        fontSize: this.layout.isMobile ? '9px' : '13px',
        color: '#f3e4c2',
        align: 'right',
      }),
      wordWrap: { width: header.environmentWidth },
    });

    this.add.text(header.environmentX, this.layout.isMobile ? header.environmentY + 28 : 58, 'Mainnet wallet actions disabled', {
      ...createTextStyle({
        fontSize: this.layout.isMobile ? '9px' : '13px',
        color: '#aab4bd',
        align: 'right',
      }),
      wordWrap: { width: header.environmentWidth },
    });

    this.statusText = this.add.text(header.statusX, header.statusY, '', {
      ...createTextStyle({
        fontSize: this.layout.isMobile ? '10px' : '12px',
        color: '#48a8ff',
        fontStyle: '700',
      }),
      wordWrap: { width: header.statusWidth },
    });
  }

  drawMap() {
    createPanel(this, this.layout.map);

    this.drawMapGround();
    this.drawPaths();
    this.drawNodes();
    this.drawPocketBotMarker();
  }

  drawMapGround() {
    const map = this.layout.map;

    if (this.textures.exists('source_ocean_moonlit_640x420')) {
      this.add
        .image(map.x + 5, map.y + 5, 'source_ocean_moonlit_640x420')
        .setOrigin(0)
        .setDisplaySize(map.innerWidth, map.innerHeight);
    } else {
      this.add
        .rectangle(map.x + 5, map.y + 5, map.innerWidth, map.innerHeight, COLORS.sourceNight, 0.9)
        .setOrigin(0);
    }

    this.add
      .rectangle(map.x + 5, map.y + 5, map.innerWidth, map.innerHeight, COLORS.sourceNight, 0.12)
      .setOrigin(0);
  }

  drawPaths() {
    for (const path of this.mapScenario.paths) {
      const { from, to } = getPathEndpoints(this.mapScenario, path);

      if (!from || !to) {
        continue;
      }

      const start = this.getNodePosition(from);
      const end = this.getNodePosition(to);
      const style = this.getPathStyle(path);
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const length = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);
      const angle = Phaser.Math.Angle.Between(start.x, start.y, end.x, end.y);

      if (this.textures.exists(style.asset)) {
        this.add
          .image(midX, midY, style.asset)
          .setOrigin(0.5)
          .setRotation(angle)
          .setDisplaySize(length, this.scaleMapValue(style.height, 10))
          .setAlpha(style.alpha);
      } else {
        this.add
          .graphics()
          .lineStyle(this.scaleMapValue(style.width, 2), style.color, style.alpha)
          .lineBetween(start.x, start.y, end.x, end.y);
      }
    }
  }

  drawNodes() {
    for (const node of this.mapScenario.nodes) {
      const position = this.getNodePosition(node);
      const style = this.getNodeStyle(node);
      const asset = this.getNodeAsset(node);
      const isFogged = node.visibility === NODE_VISIBILITY.FOGGED;
      const isHiddenPressure = node.pressure?.hidden === true;

      if (isFogged) {
        this.add
          .image(position.x, position.y, 'fog_residue_cloud_192')
          .setDisplaySize(this.scaleMapValue(106, 54), this.scaleMapValue(106, 54))
          .setAlpha(0.72);
      }

      const marker = this.drawNodeAsset({ node, position, style, asset, isFogged });

      if (isHiddenPressure && !isFogged && this.textures.exists('fog_residue_overlay_96')) {
        this.add
          .image(position.x, position.y, 'fog_residue_overlay_96')
          .setDisplaySize(this.scaleMapValue(72, 36), this.scaleMapValue(72, 36))
          .setAlpha(0.28);
      }

      this.add.text(position.x, position.y + this.scaleMapValue(32, 18), node.label, {
        ...createTextStyle({
          fontSize: this.layout.isMobile ? '9px' : '12px',
          color: isFogged ? '#aab4bd' : '#f3e4c2',
          align: 'center',
        }),
        wordWrap: { width: this.scaleMapValue(92, 58) },
      }).setOrigin(0.5, 0);

      const hitArea = this.add
        .circle(position.x, position.y, this.scaleMapValue(node.interaction.radius, 24), 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true });

      hitArea.on('pointerover', () => this.previewNode(node.id));
      hitArea.on('pointerout', () => this.setStatus(this.getDefaultStatus()));
      hitArea.on('pointerdown', () => this.selectNode(node.id, { redirectProposal: true }));

      this.nodeMarkers.set(node.id, marker);
    }
  }

  drawPocketBotMarker() {
    const startNode = getNodeById(this.mapScenario, 'source-edge');
    const position = this.getNodePosition(startNode);
    const botOffset = this.scaleMapValue(58, 30);

    if (this.textures.exists('node_ring_current_96')) {
      this.add
        .image(position.x, position.y - botOffset, 'node_ring_current_96')
        .setDisplaySize(this.scaleMapValue(82, 40), this.scaleMapValue(82, 40))
        .setAlpha(0.82);
    }

    if (this.textures.exists('bot_v2_idle')) {
      this.add
        .image(position.x, position.y - botOffset, 'bot_v2_idle')
        .setDisplaySize(this.scaleMapValue(78, 38), this.scaleMapValue(78, 38));
    } else {
      const bodyPoints = [0, -25, 23, -12, 23, 12, 0, 25, -23, 12, -23, -12]
        .map((point) => scaleSignedValue(point, this.mapScale, 1));
      this.add
        .polygon(position.x, position.y - botOffset, bodyPoints, COLORS.nimiqGold, 0.94)
        .setStrokeStyle(3, COLORS.emberGold, 0.95);
      this.add.rectangle(position.x, position.y - botOffset, this.scaleMapValue(28, 14), this.scaleMapValue(16, 8), COLORS.sourceNight, 0.96);
      this.add.circle(position.x - this.scaleMapValue(8, 4), position.y - botOffset, this.scaleMapValue(3, 2), COLORS.nimiqGold, 1);
      this.add.circle(position.x + this.scaleMapValue(8, 4), position.y - botOffset, this.scaleMapValue(3, 2), COLORS.nimiqGold, 1);
    }

    this.add.text(position.x, position.y - this.scaleMapValue(28, 16), 'Pocket Bot', {
      ...createTextStyle({
        fontSize: this.layout.isMobile ? '9px' : '12px',
        color: '#f2b33d',
        align: 'center',
      }),
    }).setOrigin(0.5);
  }

  drawHud() {
    if (this.layout.isMobile) {
      this.drawMobileHud();
      return;
    }

    const resources = this.guidanceState.mapState.resources;
    const hud = this.layout.hud;

    createPanel(this, hud, COLORS.panelStroke, 'hud_panel_frame_v2');

    this.add.text(hud.x + 20, hud.y + 18, 'Current Run', {
      ...createTextStyle({ fontSize: '18px', color: '#f2b33d', fontStyle: '700' }),
    });

    this.add.text(hud.x + 20, hud.y + 50, this.mapScenario.goal, {
      ...createTextStyle({ fontSize: '13px', color: '#f3e4c2' }),
      wordWrap: { width: 246 },
    });

    const witnessSummary = createWitnessHudSummary(
      this.mapScenario.level?.featuredWitnessIds || this.mapScenario.level?.visibleWitnessIds
    );

    if (witnessSummary) {
      this.add.text(hud.x + 20, hud.y + 82, witnessSummary, {
        ...createTextStyle({ fontSize: '10px', color: '#d6c08f' }),
        wordWrap: { width: 246 },
      });
    }

    this.attentionMeter = this.drawMeter({
      x: hud.x + 20,
      y: hud.y + 112,
      label: resources.botAttention.label,
      value: `${resources.botAttention.current}/${resources.botAttention.max}`,
      color: COLORS.attentionBlue,
      current: resources.botAttention.current,
      max: resources.botAttention.max,
    });

    const pocketDisplay = createNimiqPocketDisplay(this.nimiqPocketStatus);

    this.nimiqValueText = this.drawValueRow({
      x: hud.x + 20,
      y: hud.y + 174,
      label: resources.nimiqPocket.label,
      value: pocketDisplay.value,
      color: COLORS.nimiqGold,
    });
    this.nimiqPocketStatusText = this.add.text(hud.x + 44, hud.y + 196, pocketDisplay.status, {
      ...createTextStyle({ fontSize: '11px', color: '#aab4bd' }),
      wordWrap: { width: 144 },
    });
    createGuidanceButton(this, {
      x: hud.x + 196,
      y: hud.y + 192,
      width: 56,
      label: 'Check',
      onClick: () => this.handleCheckPocketStatus(),
    });

    this.userGuidanceValueText = this.drawValueRow({
      x: hud.x + 20,
      y: hud.y + 238,
      label: resources.userGuidance.label,
      value: formatGuidanceValue(resources.userGuidance),
      color: COLORS.warningRed,
    });

    this.drawContextSlots(hud.x + 20, hud.y + 292, resources.contextSlots);

    this.add.text(hud.x + 20, hud.y + 376, 'Trace Archive', {
      ...createTextStyle({ fontSize: '15px', color: '#f2b33d', fontStyle: '700' }),
    });
    this.traceArchiveText = this.add.text(hud.x + 20, hud.y + 402, 'No trace card yet', {
      ...createTextStyle({ fontSize: '13px', color: '#aab4bd' }),
    });
    this.add
      .rectangle(hud.x + 14, hud.y + 366, 252, 52, 0xffffff, 0.001)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.renderLatestTraceCard());
  }

  drawMobileHud() {
    const resources = this.guidanceState.mapState.resources;
    const hud = this.layout.hud;

    createPanel(this, hud, COLORS.panelStroke, 'hud_panel_frame_v2');

    this.add.text(hud.x + 14, hud.y + 10, 'Current Run', {
      ...createTextStyle({ fontSize: '14px', color: '#f2b33d', fontStyle: '700' }),
    });

    const witnessSummary = createWitnessHudSummary(
      this.mapScenario.level?.featuredWitnessIds || this.mapScenario.level?.visibleWitnessIds
    );

    this.add.text(hud.x + 14, hud.y + 32, witnessSummary || this.mapScenario.goal, {
      ...createTextStyle({ fontSize: '9px', color: '#d6c08f' }),
      wordWrap: { width: hud.width - 28 },
    });

    this.attentionMeter = this.drawMeter({
      x: hud.x + 14,
      y: hud.y + 58,
      label: resources.botAttention.label,
      value: `${resources.botAttention.current}/${resources.botAttention.max}`,
      color: COLORS.attentionBlue,
      current: resources.botAttention.current,
      max: resources.botAttention.max,
    });

    const pocketDisplay = createNimiqPocketDisplay(this.nimiqPocketStatus);

    this.add.circle(hud.x + 205, hud.y + 63, 5, COLORS.nimiqGold, 0.95);
    this.add.text(hud.x + 218, hud.y + 58, resources.nimiqPocket.label, {
      ...createTextStyle({ fontSize: '11px', color: '#f3e4c2', fontStyle: '700' }),
    });
    this.nimiqValueText = this.add.text(hud.x + 318, hud.y + 58, pocketDisplay.value, {
      ...createTextStyle({ fontSize: '11px', color: '#f3e4c2', align: 'right' }),
    });
    this.nimiqPocketStatusText = this.add.text(hud.x + 218, hud.y + 78, pocketDisplay.status, {
      ...createTextStyle({ fontSize: '9px', color: '#aab4bd' }),
      wordWrap: { width: 96 },
    });
    createGuidanceButton(this, {
      x: hud.x + hud.width - 62,
      y: hud.y + 76,
      width: 48,
      height: 20,
      label: 'Check',
      onClick: () => this.handleCheckPocketStatus(),
    });

    this.add.circle(hud.x + 19, hud.y + 110, 5, COLORS.warningRed, 0.95);
    this.add.text(hud.x + 32, hud.y + 105, 'Guidance', {
      ...createTextStyle({ fontSize: '11px', color: '#f3e4c2', fontStyle: '700' }),
    });
    this.userGuidanceValueText = this.add.text(hud.x + 92, hud.y + 105, formatGuidanceValue(resources.userGuidance), {
      ...createTextStyle({ fontSize: '11px', color: '#f3e4c2' }),
    });

    this.add.text(hud.x + 196, hud.y + 105, 'Trace Archive', {
      ...createTextStyle({ fontSize: '12px', color: '#f2b33d', fontStyle: '700' }),
    });
    this.traceArchiveText = this.add.text(hud.x + 196, hud.y + 122, 'No trace card yet', {
      ...createTextStyle({ fontSize: '10px', color: '#aab4bd' }),
    });
    this.add
      .rectangle(hud.x + 188, hud.y + 98, hud.width - 202, 36, 0xffffff, 0.001)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.renderLatestTraceCard());
  }

  drawMeter({ x, y, label, value, color, current, max }) {
    const isMobile = this.layout.isMobile;

    this.add.text(x, y, label, {
      ...createTextStyle({ fontSize: isMobile ? '11px' : '14px', color: '#f3e4c2', fontStyle: '700' }),
    });
    const segmentStep = isMobile ? 14 : 20;
    const valueText = this.add.text(x + (isMobile ? 130 : 184), y, value, {
      ...createTextStyle({ fontSize: isMobile ? '11px' : '14px', color: '#f3e4c2', align: 'right' }),
    });

    const segments = [];

    for (let index = 0; index < max; index += 1) {
      const filled = index < current;
      const segment = this.add
        .rectangle(
          x + index * segmentStep,
          y + (isMobile ? 22 : 30),
          isMobile ? 10 : 14,
          isMobile ? 9 : 12,
          filled ? color : COLORS.panelSoft,
          1
        )
        .setOrigin(0)
        .setStrokeStyle(1, filled ? color : COLORS.panelDimStroke, 0.9);
      segments.push(segment);
    }

    return { valueText, segments, color };
  }

  drawValueRow({ x, y, label, value, color }) {
    const isMobile = this.layout.isMobile;
    const dotRadius = isMobile ? 5 : 7;

    this.add.circle(x + dotRadius, y + dotRadius, dotRadius, color, 0.95);
    this.add.text(x + 24, y, label, {
      ...createTextStyle({ fontSize: isMobile ? '11px' : '14px', color: '#f3e4c2', fontStyle: '700' }),
    });
    return this.add.text(x + (isMobile ? 92 : 176), y, value, {
      ...createTextStyle({ fontSize: isMobile ? '11px' : '14px', color: '#f3e4c2', align: 'right' }),
    });
  }

  drawContextSlots(x, y, contextSlots) {
    const usage = getContextSlotUsage(contextSlots);

    this.add.text(x, y, `${contextSlots.label} ${usage.used}/${usage.capacity}`, {
      ...createTextStyle({ fontSize: '14px', color: '#f3e4c2', fontStyle: '700' }),
    });

    for (let index = 0; index < usage.capacity; index += 1) {
      const item = contextSlots.items[index];
      const slotKey = item?.type === 'clue'
        ? 'context_slot_clue_v2'
        : item
          ? 'context_slot_context_v2'
          : 'context_slot_empty_v2';

      if (this.textures.exists(slotKey)) {
        this.add
          .image(x + index * 48 + 17, y + 53, slotKey)
          .setDisplaySize(42, 42)
          .setAlpha(item ? 1 : 0.74);
      } else {
        this.add
          .rectangle(x + index * 48, y + 32, 34, 42, COLORS.panelSoft, 1)
          .setOrigin(0)
          .setStrokeStyle(2, COLORS.contextGreen, item ? 1 : 0.45);
      }
    }
  }

  drawBottomPanels() {
    const { details, proposal, isMobile } = this.layout;

    createPanel(this, details, COLORS.panelDimStroke, 'trace_card_frame_v2');
    createPanel(this, proposal, COLORS.panelStroke, 'proposal_card_frame_v2');

    this.detailTitle = this.add.text(details.x + 18, details.y + (isMobile ? 12 : 16), '', {
      ...createTextStyle({ fontSize: isMobile ? '14px' : '17px', color: '#f2b33d', fontStyle: '700' }),
    });
    this.detailBody = this.add.text(details.x + 18, details.y + (isMobile ? 38 : 48), '', {
      ...createTextStyle({ fontSize: isMobile ? '11px' : '13px', color: '#f3e4c2' }),
      lineSpacing: isMobile ? 1 : 3,
      wordWrap: { width: details.width - 40 },
    });

    this.drawProposalPreview();
  }

  drawProposalPreview() {
    const { proposal, isMobile } = this.layout;
    const x = proposal.x + 18;
    const y = proposal.y + (isMobile ? 12 : 16);

    this.proposalTitleText = this.add.text(x, y, 'Bot Proposal', {
      ...createTextStyle({ fontSize: isMobile ? '14px' : '17px', color: '#f2b33d', fontStyle: '700' }),
    });
    this.proposalMoveText = this.add.text(x, y + (isMobile ? 24 : 28), '', {
      ...createTextStyle({ fontSize: isMobile ? '11px' : '14px', color: '#f3e4c2', fontStyle: '700' }),
    });
    this.proposalReasonText = this.add.text(x, y + (isMobile ? 44 : 50), '', {
      ...createTextStyle({ fontSize: isMobile ? '10px' : '13px', color: '#f3e4c2' }),
      wordWrap: { width: proposal.width - 40 },
    });
    this.proposalCostText = this.add.text(x, y + (isMobile ? 91 : 88), '', {
      ...createTextStyle({ fontSize: isMobile ? '10px' : '13px', color: '#48a8ff' }),
    });
    this.proposalCheckText = this.add.text(x, y + (isMobile ? 106 : 104), '', {
      ...createTextStyle({ fontSize: isMobile ? '10px' : '13px', color: '#80c84d' }),
    });

    this.drawGuidanceControls(x, y + (isMobile ? 122 : 122));
    this.updateProposalPanel();
  }

  drawGuidanceControls(x, y) {
    const isMobile = this.layout.isMobile;
    const buttons = [
      ['Approve', () => this.handleApproveProposal(), isMobile ? 70 : 76],
      ['Why', () => this.handleWhyRoute(), isMobile ? 52 : 58],
      ['Unknowns', () => this.handleRemainingUnknowns(), isMobile ? 72 : 78],
      ['Inspect 1st', () => this.handleInspectFirst(), isMobile ? 78 : 82],
      ['Partial', () => this.handleMarkPartial(), isMobile ? 62 : 66],
    ];
    let offsetX = 0;
    let rowY = y;
    const maxWidth = this.layout.proposal.width - 36;

    for (const [label, onClick, width] of buttons) {
      if (isMobile && offsetX > 0 && offsetX + width > maxWidth) {
        offsetX = 0;
        rowY += 26;
      }

      createGuidanceButton(this, {
        x: x + offsetX,
        y: rowY,
        width,
        height: isMobile ? 22 : 22,
        label,
        onClick,
      });
      offsetX += width + 8;
    }
  }

  updateProposalPanel() {
    const proposal = this.guidanceState.pendingProposal;
    const node = getNodeById(this.mapScenario, proposal.targetNodeId);
    const evaluation = evaluateResourceCost(this.guidanceState.mapState.resources, proposal.resourceCost);
    const nodeLabel = node?.label || proposal.targetNodeId;

    this.proposalMoveText?.setText(`${proposal.moveType.toUpperCase()} -> ${nodeLabel}`);
    this.proposalReasonText?.setText(truncateText(proposal.reason, this.layout.isMobile ? 108 : 120));
    this.proposalCostText?.setText(
      `Cost: ${evaluation.cost.botAttention} Bot Attention | Guidance: ${evaluation.cost.userGuidance}`
    );
    this.proposalCheckText
      ?.setText(evaluation.allowed ? 'Resource check: allowed' : 'Resource check: blocked')
      .setColor(evaluation.allowed ? '#80c84d' : '#ff5a3d');
  }

  getPathStyle(path) {
    if (path.visibility === PATH_VISIBILITY.FOGGED) {
      return {
        asset: 'path_thread_fogged_128x32',
        color: COLORS.residueShadow,
        alpha: 0.76,
        width: 3,
        height: 18,
      };
    }

    if (path.to === 'false-gate' || path.from === 'false-gate') {
      return {
        asset: 'path_thread_warning_128x32',
        color: COLORS.warningRed,
        alpha: 0.72,
        width: 3,
        height: 18,
      };
    }

    if (path.to === 'safe-gate' || path.from === 'safe-gate') {
      return {
        asset: 'path_thread_safe_128x32',
        color: COLORS.safeGreen,
        alpha: 0.64,
        width: 3,
        height: 18,
      };
    }

    if (path.visibility === PATH_VISIBILITY.REVEALED) {
      return {
        asset: 'path_thread_gold_128x32',
        color: COLORS.nimiqGold,
        alpha: 0.86,
        width: 4,
        height: 20,
      };
    }

    return {
      asset: 'path_thread_moonblue_128x32',
      color: COLORS.moonBlue,
      alpha: 0.78,
      width: 3,
      height: 18,
    };
  }

  getNodeStyle(node) {
    return NODE_STYLES[node.kind] || {
      fill: COLORS.moonBlue,
      stroke: COLORS.nimiqGold,
      icon: '?',
    };
  }

  getNodeAsset(node) {
    return NODE_ASSETS[node.kind] || {
      pad: 'node_pad_dark_hex_96',
      icon: 'node_noise_echo_64',
      ring: 'node_ring_reachable_96',
    };
  }

  drawNodeAsset({ node, position, style, asset, isFogged }) {
    const alpha = isFogged ? 0.52 : 0.96;
    const ringAlpha = isFogged ? 0.46 : 0.72;
    const largeNode = node.kind === NODE_KINDS.FALSE_FINISH || node.kind === NODE_KINDS.SAFE_FINISH;
    const nodeSize = this.scaleMapValue(largeNode ? 78 : 72, largeNode ? 42 : 38);

    if (this.textures.exists(asset.ring)) {
      this.add
        .image(position.x, position.y, asset.ring)
        .setDisplaySize(this.scaleMapValue(76, 40), this.scaleMapValue(76, 40))
        .setAlpha(ringAlpha);
    }

    let marker;

    if (this.textures.exists(asset.pad)) {
      marker = this.add
        .image(position.x, position.y, asset.pad)
        .setDisplaySize(nodeSize, nodeSize)
        .setAlpha(alpha);
    } else {
      marker = this.add
        .circle(position.x, position.y, this.scaleMapValue(24, 16), style.fill, alpha)
        .setStrokeStyle(isFogged ? 2 : 3, style.stroke, isFogged ? 0.55 : 0.95);
    }

    if (this.textures.exists(asset.icon)) {
      this.add
        .image(position.x, position.y, asset.icon)
        .setDisplaySize(this.scaleMapValue(44, 24), this.scaleMapValue(44, 24))
        .setAlpha(isFogged ? 0.62 : 1);
    } else {
      this.add.text(position.x, position.y - 8, isFogged ? '?' : style.icon, {
        ...createTextStyle({
          fontSize: '18px',
          color: isFogged ? '#aab4bd' : '#050b10',
          fontStyle: '700',
          align: 'center',
        }),
      }).setOrigin(0.5);
    }

    if (isFogged && this.textures.exists('fog_residue_overlay_96')) {
      this.add
        .image(position.x, position.y, 'fog_residue_overlay_96')
        .setDisplaySize(this.scaleMapValue(82, 42), this.scaleMapValue(82, 42))
        .setAlpha(0.8);
    }

    return marker;
  }

  previewNode(nodeId) {
    const node = getNodeById(this.mapScenario, nodeId);

    if (!node) {
      return;
    }

    const view = getLossyMapNodeView(this.guidanceState.mapState, nodeId);
    const pressure = view.pressure?.hidden ? 'risk hidden until inspected' : view.pressure?.summary;
    this.setStatus(`${node.label}: ${pressure}`);
  }

  selectNode(nodeId, { redirectProposal = false } = {}) {
    const node = getNodeById(this.mapScenario, nodeId);

    if (!node) {
      return;
    }

    this.selectedNodeId = nodeId;
    const position = this.getNodePosition(node);

    if (!this.selectedRing) {
      if (this.textures.exists('node_ring_selected_96')) {
        this.selectedRing = this.add
          .image(position.x, position.y, 'node_ring_selected_96')
          .setDisplaySize(this.scaleMapValue(88, 44), this.scaleMapValue(88, 44));
      } else {
        this.selectedRing = this.add.circle(position.x, position.y, this.scaleMapValue(32, 20), COLORS.nimiqGold, 0)
          .setStrokeStyle(3, COLORS.nimiqGold, 0.98);
      }
    } else {
      this.selectedRing.setPosition(position.x, position.y);
    }

    if (redirectProposal) {
      this.redirectProposalToNode(node);
    }

    const view = getLossyMapNodeView(this.guidanceState.mapState, nodeId);
    const knownState = view.visibility === NODE_VISIBILITY.FOGGED ? 'fogged' : view.visibility;
    const riskState = view.pressure?.hidden ? 'Hidden until inspected' : view.pressure?.summary;
    const inspectSummary = view.visibleClue || node.reveal?.inspect?.summary || 'No inspect detail yet.';
    const remainingUnknowns = view.remainingUnknowns.length > 0 ? view.remainingUnknowns : node.residue;
    const witnessPanel = createWitnessPanelContent(node.witnessIds);

    this.detailTitle.setText(node.label);
    this.detailBody.setText(createNodeDetailLines({
      knownState,
      riskState,
      inspectSummary,
      remainingUnknowns,
      witnessPanel,
    }).join('\n'));
  }

  redirectProposalToNode(node) {
    const moveType = node.possibleMoves?.[this.guidanceState.pendingProposal.moveType]
      ? this.guidanceState.pendingProposal.moveType
      : 'inspect';

    this.guidanceState = redirectPendingProposal(this.guidanceState, {
      moveType,
      targetNodeId: node.id,
      reason: `User redirected the bot toward ${node.label}.`,
    });
    this.updateProposalPanel();
    this.setStatus(`Proposal redirected to ${node.label}.`);
  }

  renderGuidancePanel() {
    const panel = this.guidanceState.guidancePanel;

    this.detailTitle.setText(panel.title);
    this.detailBody.setText(panel.lines.join('\n'));
  }

  updateHud() {
    const resources = this.guidanceState.mapState.resources;
    const attention = resources.botAttention;

    this.resourceState = resources;
    this.attentionMeter?.valueText.setText(`${attention.current}/${attention.max}`);
    this.attentionMeter?.segments.forEach((segment, index) => {
      const filled = index < attention.current;
      segment
        .setFillStyle(filled ? this.attentionMeter.color : COLORS.panelSoft, 1)
        .setStrokeStyle(1, filled ? this.attentionMeter.color : COLORS.panelDimStroke, 0.9);
    });
    this.userGuidanceValueText?.setText(formatGuidanceValue(resources.userGuidance));
    this.updateNimiqPocketDisplay();
    this.traceArchiveText?.setText(
      formatTraceArchiveLabel(this.guidanceState.traceCards)
    );
  }

  updateNimiqPocketDisplay() {
    const resources = this.guidanceState.mapState.resources;
    const pocketDisplay = createNimiqPocketDisplay(
      this.nimiqPocketStatus ||
        createNimiqPocketStatus({
          environment: this.miniAppEnvironment,
          pocket: resources.nimiqPocket,
          status: this.miniAppEnvironment.providerStatus,
        })
    );

    this.nimiqValueText?.setText(pocketDisplay.value);
    this.nimiqPocketStatusText?.setText(pocketDisplay.status);
  }

  renderLatestTraceCard() {
    const traceCard = this.guidanceState.traceCards.at(-1);
    const panel = createTracePanelContent(traceCard);

    this.detailTitle.setText(panel.title);
    this.detailBody.setText(panel.lines.join('\n'));
    this.setStatus(traceCard ? 'Latest trace card shown.' : 'No trace card recorded yet.');
  }

  renderWitnessCardForNode(nodeId) {
    const node = getNodeById(this.mapScenario, nodeId);
    const panel = createWitnessPanelContent(node?.witnessIds);

    if (!panel) {
      return false;
    }

    this.detailTitle.setText(panel.title);
    this.detailBody.setText(panel.lines.join('\n'));
    this.setStatus(`Historic witness revealed for ${node.label}.`);
    return true;
  }

  handleApproveProposal() {
    const targetNodeId = this.guidanceState.pendingProposal.targetNodeId;
    const result = approvePendingProposal(this.guidanceState);

    this.guidanceState = result.state;
    this.updateHud();
    this.updateProposalPanel();

    if (result.applied) {
      this.selectNode(targetNodeId, { redirectProposal: false });
      const witnessShown = result.state.mapState.inspectedNodeIds.includes(targetNodeId) &&
        this.renderWitnessCardForNode(targetNodeId);

      if (!witnessShown) {
        this.renderLatestTraceCard();
      }
      const lessonApplied =
        this.guidanceState.sessionLesson?.appliedToProposalId === this.guidanceState.pendingProposal.id;
      this.setStatus(
        lessonApplied
          ? 'Accepted move. Session lesson applied to the next proposal for this run.'
          : `Accepted ${this.guidanceState.guidanceTrace.at(-1).moveType}. Trace card recorded.`
      );
      return;
    }

    this.renderGuidancePanel();
    this.setStatus('Move blocked before resources were spent.');
  }

  handleWhyRoute() {
    this.guidanceState = showWhyThisRoute(this.guidanceState);
    this.renderGuidancePanel();
    this.setStatus('Route rationale exposed.');
  }

  handleRemainingUnknowns() {
    this.guidanceState = showRemainingUnknowns(this.guidanceState);
    this.renderGuidancePanel();
    this.setStatus('Remaining unknowns exposed.');
  }

  handleInspectFirst() {
    this.guidanceState = redirectToInspectFirst(this.guidanceState);
    this.updateProposalPanel();
    this.renderGuidancePanel();
    this.setStatus('Proposal changed to inspect first.');
  }

  handleMarkPartial() {
    const node = getNodeById(this.mapScenario, this.selectedNodeId);

    this.guidanceState = markPartialResult(
      this.guidanceState,
      `${node?.label || 'Selected result'} is useful, but not full success.`
    );
    this.updateHud();
    this.renderLatestTraceCard();
    this.setStatus('Marked as partial progress.');
  }

  async handleCheckPocketStatus() {
    this.setStatus('Checking Nimiq pocket status. No send, sign, or payment action will run.');

    const result = await requestNimiqPocketStatus({
      globalObject: window,
      pocket: this.guidanceState.mapState.resources.nimiqPocket,
      initializeProvider: true,
    });

    this.miniAppEnvironment = result.environment;
    this.nimiqPocketStatus = result.pocket;
    this.updateNimiqPocketDisplay();

    const traceCard = createPocketTraceCard({
      sequence: this.guidanceState.traceCards.length + 1,
      pocketStatus: result.pocket,
    });
    this.guidanceState = {
      ...this.guidanceState,
      traceCards: appendTraceCard(this.guidanceState.traceCards, traceCard),
    };
    this.updateHud();
    this.renderLatestTraceCard();

    this.setStatus(
      result.status === 'provider-ready'
        ? 'Nimiq pocket status checked. No send, sign, or payment authority granted.'
        : `${result.pocket.statusLabel}. Pocket remains local/testnet status only.`
    );
  }

  getDefaultStatus() {
    return this.miniAppEnvironment.isNimiqPay
      ? 'Ready in Nimiq Pay Mini App shell. Wallet actions disabled.'
      : 'Ready in local Mini App fallback. Wallet actions disabled.';
  }

  setStatus(message) {
    this.statusText?.setText(message);
  }
}
