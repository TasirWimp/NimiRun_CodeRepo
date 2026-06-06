import Phaser from 'phaser';

import {
  NODE_KINDS,
  NODE_VISIBILITY,
  PATH_VISIBILITY,
  createResourceMapScenario,
  getNodeById,
  getPathEndpoints,
} from '../game/resourceMapScenario.js';
import { getMiniAppEnvironment } from '../platform/nimiqMiniApp.js';

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

const LAYOUT = Object.freeze({
  map: { x: 32, y: 112, width: 650, height: 430 },
  hud: { x: 704, y: 112, width: 288, height: 430 },
  details: { x: 32, y: 558, width: 470, height: 170 },
  proposal: { x: 520, y: 558, width: 472, height: 170 },
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

function formatNim(value) {
  return `${Number(value).toFixed(0)} NIM`;
}

function toWorldPosition(node) {
  return {
    x: LAYOUT.map.x + 5 + node.position.x,
    y: LAYOUT.map.y + 5 + node.position.y,
  };
}

function createTextStyle(overrides = {}) {
  return {
    fontFamily: 'system-ui, sans-serif',
    fontSize: '14px',
    color: COLORS.text,
    ...overrides,
  };
}

function createPanel(scene, layout, stroke = COLORS.panelStroke) {
  scene.add
    .rectangle(layout.x, layout.y, layout.width, layout.height, COLORS.panel, 0.94)
    .setOrigin(0)
    .setStrokeStyle(2, stroke, 0.86);
}

function formatList(items, fallback = 'none') {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback;
  }

  return items.join(', ');
}

export default class PocketBotWorkshop extends Phaser.Scene {
  constructor() {
    super({ key: 'PocketBotWorkshop' });
  }

  create() {
    this.mapScenario = createResourceMapScenario();
    this.miniAppEnvironment = getMiniAppEnvironment(window);
    this.nodeMarkers = new Map();

    this.drawBackground();
    this.drawHeader();
    this.drawMap();
    this.drawHud();
    this.drawBottomPanels();
    this.selectNode('shortcut-bridge');
    this.setStatus(this.getDefaultStatus());
  }

  drawBackground() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, COLORS.background).setOrigin(0);
    this.add.rectangle(0, 0, width, 96, 0x071018, 0.98).setOrigin(0);
    this.add.rectangle(0, 96, width, 1, COLORS.panelStroke, 0.6).setOrigin(0);

    for (let index = 0; index < 42; index += 1) {
      const x = 18 + ((index * 73) % width);
      const y = 18 + ((index * 41) % 70);
      const alpha = 0.18 + ((index % 5) * 0.04);
      this.add.circle(x, y, 1.2, 0xf3e4c2, alpha);
    }
  }

  drawHeader() {
    this.add.text(32, 22, this.mapScenario.title, {
      ...createTextStyle({ fontSize: '30px', color: '#f2b33d', fontStyle: '700' }),
    });

    this.add.text(34, 62, this.mapScenario.supportLine, {
      ...createTextStyle({ fontSize: '15px', color: '#f3e4c2' }),
    });

    const environmentText = this.miniAppEnvironment.isNimiqPay
      ? `Mini App: Nimiq Pay detected | ${this.miniAppEnvironment.language}`
      : `Mini App: local simulated mode | ${this.miniAppEnvironment.language}`;

    this.add.text(704, 28, environmentText, {
      ...createTextStyle({ fontSize: '13px', color: '#f3e4c2', align: 'right' }),
      wordWrap: { width: 280 },
    });

    this.add.text(704, 58, 'Mainnet wallet actions disabled', {
      ...createTextStyle({ fontSize: '13px', color: '#aab4bd', align: 'right' }),
      wordWrap: { width: 280 },
    });
  }

  drawMap() {
    createPanel(this, LAYOUT.map);

    this.drawMapGround();
    this.drawPaths();
    this.drawNodes();
    this.drawPocketBotMarker();
  }

  drawMapGround() {
    const map = LAYOUT.map;

    this.add.rectangle(map.x + 5, map.y + 5, 640, 420, COLORS.sourceNight, 0.9).setOrigin(0);

    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x1d3242, 0.48);

    for (let x = map.x + 5; x <= map.x + 645; x += this.mapScenario.viewport.tileSize) {
      graphics.lineBetween(x, map.y + 5, x, map.y + 425);
    }

    for (let y = map.y + 5; y <= map.y + 425; y += this.mapScenario.viewport.tileSize) {
      graphics.lineBetween(map.x + 5, y, map.x + 645, y);
    }

    this.add.circle(map.x + 575, map.y + 84, 54, COLORS.nimiqGold, 0.08);
    this.add.circle(map.x + 575, map.y + 84, 32, COLORS.nimiqGold, 0.08);
    this.add.rectangle(map.x + 5, map.y + 5, 640, 420, COLORS.residueShadow, 0.12).setOrigin(0);
  }

  drawPaths() {
    const graphics = this.add.graphics();

    for (const path of this.mapScenario.paths) {
      const { from, to } = getPathEndpoints(this.mapScenario, path);

      if (!from || !to) {
        continue;
      }

      const start = toWorldPosition(from);
      const end = toWorldPosition(to);
      const style = this.getPathStyle(path.visibility);

      graphics.lineStyle(style.width, style.color, style.alpha);
      graphics.beginPath();
      graphics.moveTo(start.x, start.y);
      graphics.lineTo(end.x, end.y);
      graphics.strokePath();
    }
  }

  drawNodes() {
    for (const node of this.mapScenario.nodes) {
      const position = toWorldPosition(node);
      const style = this.getNodeStyle(node);
      const isFogged = node.visibility === NODE_VISIBILITY.FOGGED;

      if (isFogged) {
        this.add.circle(position.x, position.y, 52, COLORS.residueShadow, 0.45);
      }

      const marker = this.add
        .circle(position.x, position.y, 24, style.fill, isFogged ? 0.48 : 0.94)
        .setStrokeStyle(isFogged ? 2 : 3, style.stroke, isFogged ? 0.55 : 0.95);

      this.add.text(position.x, position.y - 8, isFogged ? '?' : style.icon, {
        ...createTextStyle({
          fontSize: '18px',
          color: isFogged ? '#aab4bd' : '#050b10',
          fontStyle: '700',
          align: 'center',
        }),
      }).setOrigin(0.5);

      this.add.text(position.x, position.y + 32, node.label, {
        ...createTextStyle({
          fontSize: '12px',
          color: isFogged ? '#aab4bd' : '#f3e4c2',
          align: 'center',
        }),
        wordWrap: { width: 92 },
      }).setOrigin(0.5, 0);

      const hitArea = this.add
        .circle(position.x, position.y, node.interaction.radius, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true });

      hitArea.on('pointerover', () => this.previewNode(node.id));
      hitArea.on('pointerout', () => this.setStatus(this.getDefaultStatus()));
      hitArea.on('pointerdown', () => this.selectNode(node.id));

      this.nodeMarkers.set(node.id, marker);
    }
  }

  drawPocketBotMarker() {
    const startNode = getNodeById(this.mapScenario, 'source-edge');
    const position = toWorldPosition(startNode);
    const bodyPoints = [0, -25, 23, -12, 23, 12, 0, 25, -23, 12, -23, -12];

    this.add
      .polygon(position.x, position.y - 58, bodyPoints, COLORS.nimiqGold, 0.94)
      .setStrokeStyle(3, COLORS.emberGold, 0.95);
    this.add.rectangle(position.x, position.y - 58, 28, 16, COLORS.sourceNight, 0.96);
    this.add.circle(position.x - 8, position.y - 58, 3, COLORS.nimiqGold, 1);
    this.add.circle(position.x + 8, position.y - 58, 3, COLORS.nimiqGold, 1);
    this.add.text(position.x, position.y - 28, 'Pocket Bot', {
      ...createTextStyle({ fontSize: '12px', color: '#f2b33d', align: 'center' }),
    }).setOrigin(0.5);
  }

  drawHud() {
    const { resources } = this.mapScenario;
    const hud = LAYOUT.hud;

    createPanel(this, hud);

    this.add.text(hud.x + 20, hud.y + 18, 'Current Run', {
      ...createTextStyle({ fontSize: '18px', color: '#f2b33d', fontStyle: '700' }),
    });

    this.add.text(hud.x + 20, hud.y + 50, this.mapScenario.goal, {
      ...createTextStyle({ fontSize: '13px', color: '#f3e4c2' }),
      wordWrap: { width: 246 },
    });

    this.drawMeter({
      x: hud.x + 20,
      y: hud.y + 112,
      label: resources.botAttention.label,
      value: `${resources.botAttention.current}/${resources.botAttention.max}`,
      color: COLORS.attentionBlue,
      current: resources.botAttention.current,
      max: resources.botAttention.max,
    });

    this.drawValueRow({
      x: hud.x + 20,
      y: hud.y + 174,
      label: resources.nimiqPocket.label,
      value: formatNim(resources.nimiqPocket.amount),
      color: COLORS.nimiqGold,
    });

    this.drawValueRow({
      x: hud.x + 20,
      y: hud.y + 224,
      label: resources.userGuidance.label,
      value: resources.userGuidance.level,
      color: COLORS.warningRed,
    });

    this.drawContextSlots(hud.x + 20, hud.y + 278, resources.contextSlots);

    this.add.text(hud.x + 20, hud.y + 376, 'Trace Archive', {
      ...createTextStyle({ fontSize: '15px', color: '#f2b33d', fontStyle: '700' }),
    });
    this.add.text(hud.x + 20, hud.y + 402, 'No trace card yet', {
      ...createTextStyle({ fontSize: '13px', color: '#aab4bd' }),
    });
  }

  drawMeter({ x, y, label, value, color, current, max }) {
    this.add.text(x, y, label, {
      ...createTextStyle({ fontSize: '14px', color: '#f3e4c2', fontStyle: '700' }),
    });
    this.add.text(x + 184, y, value, {
      ...createTextStyle({ fontSize: '14px', color: '#f3e4c2', align: 'right' }),
    });

    for (let index = 0; index < max; index += 1) {
      const filled = index < current;
      this.add
        .rectangle(x + index * 20, y + 30, 14, 12, filled ? color : COLORS.panelSoft, 1)
        .setOrigin(0)
        .setStrokeStyle(1, filled ? color : COLORS.panelDimStroke, 0.9);
    }
  }

  drawValueRow({ x, y, label, value, color }) {
    this.add.circle(x + 7, y + 7, 7, color, 0.95);
    this.add.text(x + 24, y, label, {
      ...createTextStyle({ fontSize: '14px', color: '#f3e4c2', fontStyle: '700' }),
    });
    this.add.text(x + 176, y, value, {
      ...createTextStyle({ fontSize: '14px', color: '#f3e4c2', align: 'right' }),
    });
  }

  drawContextSlots(x, y, contextSlots) {
    this.add.text(x, y, `${contextSlots.label} ${contextSlots.used}/${contextSlots.max}`, {
      ...createTextStyle({ fontSize: '14px', color: '#f3e4c2', fontStyle: '700' }),
    });

    for (let index = 0; index < contextSlots.max; index += 1) {
      this.add
        .rectangle(x + index * 48, y + 32, 34, 42, COLORS.panelSoft, 1)
        .setOrigin(0)
        .setStrokeStyle(2, COLORS.contextGreen, index < contextSlots.used ? 1 : 0.45);
    }
  }

  drawBottomPanels() {
    createPanel(this, LAYOUT.details, COLORS.panelDimStroke);
    createPanel(this, LAYOUT.proposal);

    this.detailTitle = this.add.text(LAYOUT.details.x + 18, LAYOUT.details.y + 16, '', {
      ...createTextStyle({ fontSize: '17px', color: '#f2b33d', fontStyle: '700' }),
    });
    this.detailBody = this.add.text(LAYOUT.details.x + 18, LAYOUT.details.y + 48, '', {
      ...createTextStyle({ fontSize: '13px', color: '#f3e4c2' }),
      lineSpacing: 3,
      wordWrap: { width: 430 },
    });

    this.drawProposalPreview();

    this.statusText = this.add.text(LAYOUT.proposal.x + 18, LAYOUT.proposal.y + 132, '', {
      ...createTextStyle({ fontSize: '13px', color: '#48a8ff', fontStyle: '700' }),
      wordWrap: { width: 430 },
    });
  }

  drawProposalPreview() {
    const proposal = this.mapScenario.proposalPreview;
    const x = LAYOUT.proposal.x + 18;
    const y = LAYOUT.proposal.y + 16;

    this.add.text(x, y, proposal.title, {
      ...createTextStyle({ fontSize: '17px', color: '#f2b33d', fontStyle: '700' }),
    });
    this.add.text(x, y + 32, proposal.move, {
      ...createTextStyle({ fontSize: '14px', color: '#f3e4c2', fontStyle: '700' }),
    });
    this.add.text(x, y + 56, proposal.reason, {
      ...createTextStyle({ fontSize: '13px', color: '#f3e4c2' }),
      wordWrap: { width: 430 },
    });
    this.add.text(x, y + 104, `Cost: ${proposal.cost.botAttention} Bot Attention`, {
      ...createTextStyle({ fontSize: '13px', color: '#48a8ff' }),
    });
  }

  getPathStyle(visibility) {
    if (visibility === PATH_VISIBILITY.REVEALED) {
      return { color: COLORS.nimiqGold, alpha: 0.84, width: 4 };
    }

    if (visibility === PATH_VISIBILITY.FOGGED) {
      return { color: COLORS.residueShadow, alpha: 0.75, width: 3 };
    }

    return { color: COLORS.emberGold, alpha: 0.64, width: 3 };
  }

  getNodeStyle(node) {
    return NODE_STYLES[node.kind] || {
      fill: COLORS.moonBlue,
      stroke: COLORS.nimiqGold,
      icon: '?',
    };
  }

  previewNode(nodeId) {
    const node = getNodeById(this.mapScenario, nodeId);

    if (!node) {
      return;
    }

    const pressure = node.pressure?.hidden ? 'risk hidden until inspected' : node.pressure?.summary;
    this.setStatus(`${node.label}: ${pressure}`);
  }

  selectNode(nodeId) {
    const node = getNodeById(this.mapScenario, nodeId);

    if (!node) {
      return;
    }

    this.selectedNodeId = nodeId;
    const position = toWorldPosition(node);

    if (!this.selectedRing) {
      this.selectedRing = this.add.circle(position.x, position.y, 32, COLORS.nimiqGold, 0)
        .setStrokeStyle(3, COLORS.nimiqGold, 0.98);
    } else {
      this.selectedRing.setPosition(position.x, position.y);
    }

    const knownState = node.visibility === NODE_VISIBILITY.FOGGED ? 'fogged' : 'visible';
    const riskState = node.pressure?.hidden ? 'Hidden until inspected' : node.pressure?.summary;
    const inspectSummary = node.reveal?.inspect?.summary || 'No inspect detail yet.';

    this.detailTitle.setText(node.label);
    this.detailBody.setText([
      `State: ${knownState}`,
      `Risk: ${riskState}`,
      `Inspect: ${inspectSummary}`,
      `Residue: ${formatList(node.residue)}`,
    ].join('\n'));
  }

  getDefaultStatus() {
    const mode = this.miniAppEnvironment.isNimiqPay ? 'Nimiq Pay Mini App shell' : 'local simulated Mini App fallback';

    return `${mode}. PB-005 map scaffold active; wallet operations are disabled.`;
  }

  setStatus(message) {
    this.statusText?.setText(message);
  }
}
