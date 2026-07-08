import Phaser from 'phaser';

import nimiRunV2AssetManifest from '../game/assets/nimirunV2AssetManifest.json';
import { preloadNimiRunV2Assets } from '../game/assets/preloadNimiRunV2Assets.js';
import {
  TRAINING_COMMAND_TYPES,
  createLocalTrainingSession,
} from '../game/localTrainingSession.js';
import { createMarketSignalScoutScenario } from '../game/scenarios/marketSignalScoutScenario.js';
import {
  createNimiqPocketStatus,
  getMiniAppEnvironment,
  requestNimiqPocketStatus,
} from '../platform/nimiqMiniApp.js';

const WORLD_COLUMNS = 13;
const WORLD_ROWS = 9;
const BOT_START = Object.freeze({ x: 6, y: 8 });
const PLAYER_START = Object.freeze({ x: 5, y: 8 });
const PLAYER_ID = 'player-local';
const BOT_ID = 'pocket-bot';

const TILE_TYPES = Object.freeze({
  BASE: 0,
  PATH: 1,
  RIDGE: 2,
});

const WORLD_TILE_DATA = Object.freeze([
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 2],
  [2, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 2],
  [2, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 2],
  [2, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 2],
  [2, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 2],
  [2, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 2],
  [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2],
]);

const COLORS = Object.freeze({
  background: 0x061017,
  panel: 0x111c26,
  panelSoft: 0x172636,
  panelStroke: 0x34546b,
  text: '#f3e4c2',
  muted: '#aab4bd',
  attention: 0x48a8ff,
  gold: 0xf2b33d,
  purple: 0x9b63ff,
  red: 0xff5a3d,
  green: 0x58d68d,
  blue: 0x2b5f8f,
});

const NODE_COLORS = Object.freeze({
  signal: COLORS.gold,
  question: COLORS.purple,
  crowd: 0xd66cff,
  exit: COLORS.red,
  support: COLORS.green,
  bot: COLORS.attention,
  trace: 0xce8cff,
  pocket: COLORS.gold,
  finish: 0xf3e4c2,
});

const NODE_ASSETS = Object.freeze({
  signal: 'node_golden_signal_64',
  question: 'node_warning_64',
  crowd: 'node_noise_echo_64',
  exit: 'node_false_gate_64',
  support: 'node_support_well_64',
  bot: 'node_start_64',
  trace: 'node_context_shrine_64',
  pocket: 'node_pocket_spark_64',
  finish: 'node_safe_gate_64',
});

function createTextStyle(overrides = {}) {
  return {
    fontFamily: 'system-ui, sans-serif',
    fontSize: '12px',
    color: COLORS.text,
    ...overrides,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function truncateText(value, limit = 92) {
  const text = String(value || '');

  return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
}

function cleanStatus(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getNodeColor(node) {
  if (node.visualState === 'hidden') {
    return COLORS.panelStroke;
  }

  if (node.visualState === 'active') {
    return COLORS.red;
  }

  if (node.visualState === 'stable' || node.visualState === 'revealed') {
    return COLORS.green;
  }

  if (node.selected) {
    return COLORS.gold;
  }

  return NODE_COLORS[node.nodeKind] || COLORS.attention;
}

function addToLayer(layer, object) {
  layer.add(object);

  return object;
}

export default class PocketBotTrainingWorld extends Phaser.Scene {
  constructor() {
    super({ key: 'PocketBotTrainingWorld' });
  }

  preload() {
    preloadNimiRunV2Assets(this, nimiRunV2AssetManifest);
  }

  create() {
    this.clientSeq = 0;
    this.pendingCommand = false;
    this.transientStatus = null;
    this.sessionIds = {
      sessionId: 'session-golden-signal-world',
      roomId: 'local-training-room',
      playerId: PLAYER_ID,
      botId: BOT_ID,
    };
    this.createTrainingSession();
    this.createGeneratedTextures();
    this.buildWorld();
    this.renderWorldState();
  }

  createTrainingSession() {
    this.scenario = createMarketSignalScoutScenario();
    this.miniAppEnvironment = getMiniAppEnvironment(window);
    this.trainingSession = createLocalTrainingSession({
      scenario: this.scenario,
      ...this.sessionIds,
      initialNimiqPocketStatus: createNimiqPocketStatus({
        environment: this.miniAppEnvironment,
        pocket: this.scenario.resources.nimiqPocket,
        status: this.miniAppEnvironment.providerStatus,
      }),
      pocketStatusRequester: ({ pocket }) => requestNimiqPocketStatus({
        globalObject: window,
        pocket,
        initializeProvider: true,
      }),
    });
    this.trainingState = this.trainingSession.getState();
  }

  createGeneratedTextures() {
    this.tileSize = this.scale.width < 440 ? 28 : 32;
    this.tileTextureKey = `training_world_tiles_${this.tileSize}`;
    this.playerTextureKey = `training_world_player_${this.tileSize}`;

    if (!this.textures.exists(this.tileTextureKey)) {
      const size = this.tileSize;
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });

      graphics.fillStyle(0x122031, 1);
      graphics.fillRect(0, 0, size, size);
      graphics.lineStyle(1, 0x26384a, 0.75);
      graphics.strokeRect(0.5, 0.5, size - 1, size - 1);
      graphics.fillStyle(0x172b3d, 1);
      graphics.fillRect(size, 0, size, size);
      graphics.lineStyle(1, 0xf2b33d, 0.38);
      graphics.strokeRect(size + 0.5, 0.5, size - 1, size - 1);
      graphics.fillStyle(0x0d1721, 1);
      graphics.fillRect(size * 2, 0, size, size);
      graphics.lineStyle(1, 0x34546b, 0.5);
      graphics.strokeRect(size * 2 + 0.5, 0.5, size - 1, size - 1);
      graphics.generateTexture(this.tileTextureKey, size * 3, size);
      graphics.destroy();
    }

    if (!this.textures.exists(this.playerTextureKey)) {
      const size = this.tileSize;
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });

      graphics.fillStyle(0x48a8ff, 1);
      graphics.fillCircle(size / 2, size / 2, size * 0.28);
      graphics.lineStyle(2, 0xf3e4c2, 0.9);
      graphics.strokeCircle(size / 2, size / 2, size * 0.3);
      graphics.generateTexture(this.playerTextureKey, size, size);
      graphics.destroy();
    }
  }

  buildWorld() {
    const { width, height } = this.scale;
    const worldWidth = WORLD_COLUMNS * this.tileSize;
    const worldHeight = WORLD_ROWS * this.tileSize;
    const topPad = height <= 620 ? 74 : 92;

    this.worldBounds = {
      x: Math.round((width - worldWidth) / 2),
      y: topPad,
      width: worldWidth,
      height: worldHeight,
    };

    this.drawStaticBackground();
    this.createTilemap();
    this.createCharacters();
  }

  drawStaticBackground() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, COLORS.background).setOrigin(0);
    for (let index = 0; index < 50; index += 1) {
      this.add.circle(
        (index * 79) % width,
        (index * 43) % height,
        1 + (index % 3) * 0.4,
        0xf3e4c2,
        0.06 + (index % 4) * 0.025
      );
    }

    const titleX = clamp(this.worldBounds.x, 12, 48);
    this.add.text(titleX, 14, 'Golden Signal Training World', {
      ...createTextStyle({ fontSize: '18px', color: '#f2b33d', fontStyle: '700' }),
    });
    this.add.text(titleX, 38, 'Local room | Session-only bot training', {
      ...createTextStyle({ fontSize: '11px', color: '#aab4bd' }),
    });
  }

  createTilemap() {
    this.tilemap = this.make.tilemap({
      data: WORLD_TILE_DATA.map((row) => [...row]),
      tileWidth: this.tileSize,
      tileHeight: this.tileSize,
    });
    const tileset = this.tilemap.addTilesetImage(
      this.tileTextureKey,
      this.tileTextureKey,
      this.tileSize,
      this.tileSize
    );

    this.tileLayer = this.tilemap.createLayer(
      0,
      tileset,
      this.worldBounds.x,
      this.worldBounds.y
    );
    this.tileLayer.setDepth(1);
  }

  createCharacters() {
    this.playerSprite = this.add
      .sprite(0, 0, this.playerTextureKey)
      .setDisplaySize(this.tileSize * 0.88, this.tileSize * 0.88)
      .setDepth(8);
    this.botSprite = this.add
      .sprite(0, 0, 'bot_v2_excited')
      .setDisplaySize(this.tileSize * 0.95, this.tileSize * 0.95)
      .setDepth(9);

    this.gridEngine.create(this.tilemap, {
      characters: [
        {
          id: this.sessionIds.playerId,
          sprite: this.playerSprite,
          startPosition: PLAYER_START,
          speed: 4,
          collides: false,
          offsetX: this.worldBounds.x,
          offsetY: this.worldBounds.y,
          labels: ['local-player'],
        },
        {
          id: this.sessionIds.botId,
          sprite: this.botSprite,
          startPosition: BOT_START,
          speed: 4,
          collides: false,
          offsetX: this.worldBounds.x,
          offsetY: this.worldBounds.y,
          labels: ['companion-bot'],
        },
      ],
    });
  }

  renderWorldState() {
    this.trainingState = this.trainingSession.getState();
    this.nodeLayer?.destroy(true);
    this.uiLayer?.destroy(true);
    this.overlayLayer?.destroy(true);
    this.nodeLayer = this.add.container(0, 0).setDepth(5);
    this.uiLayer = this.add.container(0, 0).setDepth(20);

    this.updateBotSprite();
    this.drawWorldNodes();
    this.drawResourceBar();
    this.drawSelectedNodePanel();
    this.drawProposalPanel();
    this.drawActionStrip();
    this.drawStatusLine();

    if (this.trainingState.traceDrawer.visible) {
      this.drawTraceDrawer();
    }
  }

  updateBotSprite() {
    const assetKey = this.trainingState.botCompanion.assetKey;

    if (assetKey && this.textures.exists(assetKey) && this.botSprite.texture.key !== assetKey) {
      this.botSprite.setTexture(assetKey);
    }
  }

  drawWorldNodes() {
    for (const node of this.trainingState.worldNodes) {
      const x = this.worldBounds.x + (node.gridPosition.x + 0.5) * this.tileSize;
      const y = this.worldBounds.y + (node.gridPosition.y + 0.5) * this.tileSize;
      const color = getNodeColor(node);
      const radius = this.tileSize * (node.selected ? 0.55 : 0.46);
      const assetKey = NODE_ASSETS[node.nodeKind];
      const hitArea = addToLayer(
        this.nodeLayer,
        this.add.circle(x, y, radius + 8, color, 0.001)
      );

      hitArea
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.handleNodeSelected(node));

      addToLayer(
        this.nodeLayer,
        this.add.circle(x, y, radius, color, node.visualState === 'hidden' ? 0.14 : 0.24)
          .setStrokeStyle(node.selected ? 3 : 2, color, node.selected ? 0.95 : 0.7)
      );

      if (assetKey && this.textures.exists(assetKey)) {
        addToLayer(
          this.nodeLayer,
          this.add.image(x, y, assetKey)
            .setDisplaySize(this.tileSize * 0.9, this.tileSize * 0.9)
            .setAlpha(node.visualState === 'hidden' ? 0.48 : 0.9)
        );
      }

      const label = addToLayer(
        this.nodeLayer,
        this.add.text(x, y + radius + 5, node.label, {
          ...createTextStyle({
            fontSize: this.tileSize < 32 ? '8px' : '9px',
            color: node.selected ? '#f2b33d' : '#f3e4c2',
            align: 'center',
            fontStyle: node.selected ? '700' : '600',
          }),
          wordWrap: { width: this.tileSize * 2.1 },
        }).setOrigin(0.5, 0)
      );
      label.setAlpha(node.visualState === 'hidden' ? 0.72 : 1);
    }
  }

  drawResourceBar() {
    const bar = this.trainingState.resourceBar;
    const rect = {
      x: clamp(this.worldBounds.x, 10, 26),
      y: this.worldBounds.y - 48,
      width: Math.min(this.scale.width - 20, Math.max(390, this.worldBounds.width)),
      height: 36,
    };

    this.drawPanel(rect, { stroke: COLORS.gold, alpha: 0.9 });
    addToLayer(this.uiLayer, this.add.text(rect.x + 10, rect.y + 7, bar.botAttention.label, {
      ...createTextStyle({ fontSize: '10px', color: '#f3e4c2', fontStyle: '700' }),
    }));
    for (let index = 0; index < bar.botAttention.max; index += 1) {
      addToLayer(
        this.uiLayer,
        this.add.rectangle(
          rect.x + 92 + index * 12,
          rect.y + 14,
          8,
          10,
          index < bar.botAttention.current ? COLORS.attention : COLORS.panelSoft,
          1
        ).setOrigin(0).setStrokeStyle(1, COLORS.panelStroke, 0.8)
      );
    }
    addToLayer(this.uiLayer, this.add.text(rect.x + 232, rect.y + 7, bar.nimiqPocket.value, {
      ...createTextStyle({ fontSize: '11px', color: '#f2b33d', fontStyle: '700' }),
    }));
    addToLayer(this.uiLayer, this.add.text(rect.x + rect.width - 92, rect.y + 7, `Trace ${bar.traceCount}`, {
      ...createTextStyle({ fontSize: '11px', color: '#aab4bd', fontStyle: '700' }),
    }));
  }

  drawSelectedNodePanel() {
    const node = this.getSelectedNode();
    const rect = this.getLowerPanelRect();

    this.drawPanel(rect, { stroke: COLORS.panelStroke, alpha: 0.94 });
    addToLayer(this.uiLayer, this.add.text(rect.x + 12, rect.y + 10, node.label, {
      ...createTextStyle({ fontSize: '15px', color: '#f2b33d', fontStyle: '700' }),
      wordWrap: { width: rect.width - 130 },
    }));
    addToLayer(this.uiLayer, this.add.text(rect.x + 12, rect.y + 34, truncateText(node.description, 112), {
      ...createTextStyle({ fontSize: '11px', color: '#f3e4c2' }),
      wordWrap: { width: rect.width - 24 },
    }));
    addToLayer(this.uiLayer, this.add.text(rect.x + 12, rect.y + 69, `State: ${cleanStatus(node.statusLabel || node.visualState)}`, {
      ...createTextStyle({ fontSize: '10px', color: '#aab4bd', fontStyle: '700' }),
    }));

    this.drawButton({
      x: rect.x + rect.width - 106,
      y: rect.y + 10,
      width: 92,
      height: 30,
      label: 'Interact',
      primary: true,
      onClick: () => this.handleSelectedNodeInteraction(),
    });
  }

  drawProposalPanel() {
    const proposal = this.trainingState.botProposal;
    const rect = this.getProposalPanelRect();

    this.drawPanel(rect, { stroke: COLORS.gold, alpha: 0.92 });
    addToLayer(this.uiLayer, this.add.text(rect.x + 12, rect.y + 8, proposal.speaker, {
      ...createTextStyle({ fontSize: '11px', color: '#f2b33d', fontStyle: '700' }),
    }));
    addToLayer(this.uiLayer, this.add.text(rect.x + 12, rect.y + 25, truncateText(proposal.text, 118), {
      ...createTextStyle({ fontSize: '10px', color: '#f3e4c2' }),
      wordWrap: { width: rect.width - 24 },
    }));
    addToLayer(this.uiLayer, this.add.text(rect.x + 12, rect.y + rect.height - 17, proposal.cost, {
      ...createTextStyle({ fontSize: '9px', color: '#48a8ff' }),
    }));
    addToLayer(this.uiLayer, this.add.text(rect.x + rect.width - 108, rect.y + 8, this.trainingState.botCompanion.label, {
      ...createTextStyle({ fontSize: '10px', color: '#aab4bd', fontStyle: '700', align: 'right' }),
      wordWrap: { width: 96 },
    }).setOrigin(0, 0));
  }

  drawActionStrip() {
    const actions = this.trainingState.actionTray.slice(0, 4);
    const y = this.scale.height - 42;
    const gap = 6;
    const availableWidth = Math.min(this.scale.width - 20, 520);
    const buttonWidth = Math.floor((availableWidth - gap * (actions.length - 1)) / actions.length);
    const startX = Math.round((this.scale.width - availableWidth) / 2);

    actions.forEach((action, index) => {
      this.drawButton({
        x: startX + index * (buttonWidth + gap),
        y,
        width: buttonWidth,
        height: 30,
        label: action.label,
        primary: action.primary,
        onClick: () => this.handleActionButton(action.id),
      });
    });
  }

  drawStatusLine() {
    const status = this.pendingCommand
      ? 'Working...'
      : this.transientStatus || this.trainingState.statusMessage;

    addToLayer(this.uiLayer, this.add.text(12, this.scale.height - 62, truncateText(status, 120), {
      ...createTextStyle({ fontSize: '10px', color: '#48a8ff', fontStyle: '700' }),
      wordWrap: { width: this.scale.width - 24 },
    }));
  }

  drawTraceDrawer() {
    const trace = this.trainingState.traceDrawer;
    const width = Math.min(this.scale.width - 28, 560);
    const height = Math.min(252, this.scale.height - 120);
    const rect = {
      x: Math.round((this.scale.width - width) / 2),
      y: Math.round((this.scale.height - height) / 2),
      width,
      height,
    };

    this.overlayLayer = this.add.container(0, 0).setDepth(40);
    addToLayer(this.overlayLayer, this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.46).setOrigin(0));
    this.drawPanel(rect, { stroke: trace.tone === 'warning' ? COLORS.red : COLORS.purple, alpha: 0.98 }, this.overlayLayer);
    addToLayer(this.overlayLayer, this.add.text(rect.x + 18, rect.y + 18, trace.title || 'Trace', {
      ...createTextStyle({ fontSize: '16px', color: '#f2b33d', fontStyle: '700' }),
      wordWrap: { width: rect.width - 36 },
    }));
    addToLayer(this.overlayLayer, this.add.text(rect.x + 18, rect.y + 52, trace.lines.slice(0, 5).join('\n'), {
      ...createTextStyle({ fontSize: '11px', color: '#f3e4c2' }),
      lineSpacing: 4,
      wordWrap: { width: rect.width - 36 },
    }));
    this.drawButton({
      x: rect.x + rect.width - 100,
      y: rect.y + rect.height - 42,
      width: 80,
      height: 26,
      label: 'Continue',
      primary: false,
      onClick: () => this.dispatchCommand(TRAINING_COMMAND_TYPES.DISMISS_TRACE),
      layer: this.overlayLayer,
    });
  }

  getLowerPanelRect() {
    const width = Math.min(this.scale.width - 22, 520);
    const height = this.scale.height <= 620 ? 92 : 102;
    const y = Math.min(this.scale.height - 164, this.worldBounds.y + this.worldBounds.height + 10);

    return {
      x: Math.round((this.scale.width - width) / 2),
      y,
      width,
      height,
    };
  }

  getProposalPanelRect() {
    const lower = this.getLowerPanelRect();
    const width = lower.width;
    const height = this.scale.height <= 620 ? 64 : 76;

    return {
      x: lower.x,
      y: lower.y + lower.height + 6,
      width,
      height,
    };
  }

  drawPanel(rect, options = {}, layer = this.uiLayer) {
    const panel = this.add
      .rectangle(rect.x, rect.y, rect.width, rect.height, options.fill || COLORS.panel, options.alpha ?? 0.94)
      .setOrigin(0)
      .setStrokeStyle(1, options.stroke || COLORS.panelStroke, 0.86);

    addToLayer(layer, panel);

    return panel;
  }

  drawButton({ x, y, width, height, label, primary = false, onClick, layer = this.uiLayer }) {
    const fill = primary ? COLORS.gold : COLORS.panelSoft;
    const textColor = primary ? '#061017' : '#f3e4c2';
    const button = this.add
      .rectangle(x, y, width, height, fill, primary ? 0.96 : 0.92)
      .setOrigin(0)
      .setStrokeStyle(1, primary ? COLORS.gold : COLORS.panelStroke, 0.9)
      .setInteractive({ useHandCursor: true });

    button.on('pointerdown', onClick);
    addToLayer(layer, button);
    addToLayer(layer, this.add.text(x + width / 2, y + height / 2, truncateText(label, 18), {
      ...createTextStyle({
        fontSize: width < 96 ? '9px' : '10px',
        color: textColor,
        fontStyle: '700',
        align: 'center',
      }),
      wordWrap: { width: width - 8 },
    }).setOrigin(0.5));
  }

  getSelectedNode() {
    return this.trainingState.worldNodes.find((node) => node.selected) ||
      this.trainingState.worldNodes[0];
  }

  createCommand(type, payload = {}) {
    this.clientSeq += 1;

    return {
      ...this.sessionIds,
      clientSeq: this.clientSeq,
      type,
      ...payload,
    };
  }

  async dispatchCommand(type, payload = {}) {
    if (this.pendingCommand) {
      return null;
    }

    this.pendingCommand = true;
    this.transientStatus = null;
    this.renderWorldState();

    try {
      const result = await this.trainingSession.dispatchTrainingCommand(
        this.createCommand(type, payload)
      );

      this.trainingState = result.state;
      this.transientStatus = result.accepted ? null : result.error;
      return result;
    } catch (error) {
      this.transientStatus = error.message;
      return {
        accepted: false,
        error: error.message,
        state: this.trainingState,
        events: [],
      };
    } finally {
      this.pendingCommand = false;
      this.renderWorldState();
    }
  }

  async handleNodeSelected(node) {
    this.moveCharactersToNode(node);
    await this.dispatchCommand(TRAINING_COMMAND_TYPES.MOVE_ACTOR_TO_NODE, {
      actorId: this.sessionIds.botId,
      nodeId: node.id,
      target: node.gridPosition,
    });
  }

  moveCharactersToNode(node) {
    const botTarget = node.gridPosition;
    const guideTarget = {
      x: clamp(node.gridPosition.x - 1, 0, WORLD_COLUMNS - 1),
      y: node.gridPosition.y,
    };

    try {
      this.gridEngine.moveTo(this.sessionIds.playerId, guideTarget);
      this.gridEngine.moveTo(this.sessionIds.botId, botTarget);
    } catch (error) {
      this.gridEngine.setPosition(this.sessionIds.playerId, guideTarget);
      this.gridEngine.setPosition(this.sessionIds.botId, botTarget);
    }
  }

  async handleSelectedNodeInteraction() {
    const node = this.getSelectedNode();
    const binding = node.binding;

    if (!binding) {
      this.transientStatus = 'This node has no action yet.';
      this.renderWorldState();
      return;
    }

    await this.dispatchBinding(binding, node);
  }

  async dispatchBinding(binding, node) {
    if (binding.commandType === TRAINING_COMMAND_TYPES.PREPARE_MARKET_ACTION) {
      await this.dispatchCommand(TRAINING_COMMAND_TYPES.PREPARE_MARKET_ACTION, {
        nodeId: node.id,
        actionId: binding.actionId,
      });
      return;
    }

    if (binding.commandType === TRAINING_COMMAND_TYPES.APPROVE_PENDING_PROPOSAL) {
      await this.dispatchCommand(TRAINING_COMMAND_TYPES.APPROVE_PENDING_PROPOSAL, {
        nodeId: node.id,
      });
      return;
    }

    if (binding.commandType === TRAINING_COMMAND_TYPES.ASK_BOT_PROPOSAL) {
      await this.dispatchCommand(TRAINING_COMMAND_TYPES.ASK_BOT_PROPOSAL, {
        nodeId: node.id,
      });
      return;
    }

    if (binding.commandType === TRAINING_COMMAND_TYPES.CHECK_POCKET_STATUS) {
      await this.dispatchCommand(TRAINING_COMMAND_TYPES.CHECK_POCKET_STATUS, {
        nodeId: node.id,
      });
      return;
    }

    this.transientStatus = node.description;
    this.renderWorldState();
  }

  async handleActionButton(actionId) {
    const commandType = actionId === 'approve_enter'
      ? TRAINING_COMMAND_TYPES.APPROVE_PENDING_PROPOSAL
      : TRAINING_COMMAND_TYPES.PREPARE_MARKET_ACTION;
    const payload = actionId === 'approve_enter' ? {} : { actionId };

    await this.dispatchCommand(commandType, payload);
  }
}
