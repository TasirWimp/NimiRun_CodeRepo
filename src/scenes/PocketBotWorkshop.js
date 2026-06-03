import Phaser from 'phaser';

import { createMvpScenario } from '../game/mvpScenario.js';
import { getMiniAppEnvironment } from '../platform/nimiqMiniApp.js';

const COLORS = Object.freeze({
  background: 0xf4f1e8,
  floor: 0xd7d9c7,
  ink: '#172026',
  muted: '#4f5b62',
  panelFill: 0xffffff,
  panelStroke: 0x27313a,
  bot: 0x1f9fb7,
  botDark: 0x0f5f70,
  allowance: 0xf4c542,
  toolIdle: 0xf28d35,
  toolHover: 0xffb347,
  gate: 0x5b6f95,
  receipt: 0x7f63b8,
  focus: 0x163d5c,
});

function formatNim(value) {
  return `${Number(value).toFixed(1)} NIM`;
}

export default class PocketBotWorkshop extends Phaser.Scene {
  constructor() {
    super({ key: 'PocketBotWorkshop' });
  }

  create() {
    this.scenario = createMvpScenario();
    this.miniAppEnvironment = getMiniAppEnvironment(window);

    this.drawBackground();
    this.drawHeader();
    this.drawWorkshop();
    this.drawOverlay();
    this.setStatus(this.getDefaultStatus());
  }

  drawBackground() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, COLORS.background).setOrigin(0);
    this.add.rectangle(0, height - 170, width, 170, COLORS.floor).setOrigin(0);
    this.add.rectangle(0, 96, width, 2, 0xd2d5c9).setOrigin(0);
    this.add.rectangle(0, height - 170, width, 3, 0xb4b8a8).setOrigin(0);
  }

  drawHeader() {
    this.add.text(32, 24, 'Pocket Bot Workshop', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '32px',
      color: COLORS.ink,
      fontStyle: '700',
    });

    this.add.text(34, 64, 'Simulated allowance loop for a Nimiq Mini App shell', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: COLORS.muted,
    });

    const environmentText = this.miniAppEnvironment.isNimiqPay
      ? `Mini App: Nimiq Pay detected | Language: ${this.miniAppEnvironment.language}`
      : `Mini App: local simulated mode | Language: ${this.miniAppEnvironment.language}`;

    this.add.text(690, 34, environmentText, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: COLORS.ink,
      align: 'right',
      wordWrap: { width: 290 },
    });
  }

  drawWorkshop() {
    this.drawAllowancePocket();
    this.drawRobot();
    this.drawToolScoutStall();
    this.drawApprovalGate();
    this.drawReceiptArchive();
  }

  drawAllowancePocket() {
    const { allowance } = this.scenario;

    this.add.rectangle(126, 342, 160, 124, COLORS.allowance).setStrokeStyle(4, 0x8a6a00);
    this.add.rectangle(126, 297, 108, 34, 0xffdc67).setStrokeStyle(3, 0x8a6a00);
    this.add.text(63, 323, allowance.name, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#211900',
      fontStyle: '700',
    });
    this.add.text(65, 351, formatNim(allowance.balance), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      color: '#211900',
      fontStyle: '700',
    });
    this.add.text(64, 385, 'simulated pocket', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#3d3107',
    });
  }

  drawRobot() {
    const { helper } = this.scenario;

    this.add.rectangle(300, 380, 88, 98, COLORS.bot).setStrokeStyle(4, COLORS.botDark);
    this.add.circle(282, 360, 8, 0xffffff);
    this.add.circle(318, 360, 8, 0xffffff);
    this.add.circle(282, 360, 4, COLORS.botDark);
    this.add.circle(318, 360, 4, COLORS.botDark);
    this.add.rectangle(300, 399, 48, 8, COLORS.botDark);
    this.add.rectangle(258, 438, 26, 46, COLORS.botDark);
    this.add.rectangle(342, 438, 26, 46, COLORS.botDark);
    this.add.text(248, 468, helper.name, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      color: COLORS.ink,
      fontStyle: '700',
    });
  }

  drawToolScoutStall() {
    const tool = this.scenario.tools.toolScout;

    this.toolStall = this.add.rectangle(540, 358, 178, 118, COLORS.toolIdle)
      .setStrokeStyle(4, 0x7b4218)
      .setInteractive({ useHandCursor: true });

    this.add.rectangle(540, 296, 198, 24, 0x27313a);
    this.add.text(477, 287, tool.name, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: '700',
    });
    this.add.text(487, 339, `${formatNim(tool.cost)} cost`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#2a1404',
      fontStyle: '700',
    });
    this.add.text(481, 369, 'approved helper tool', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#3e210a',
    });

    this.toolTooltip = this.add.text(438, 430, 'Tool Scout selected: simulated paid route, no wallet action.', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#172026',
      padding: { x: 10, y: 6 },
    }).setVisible(false);

    this.toolStall.on('pointerover', () => {
      this.toolStall.setFillStyle(COLORS.toolHover);
      this.toolStall.setStrokeStyle(6, COLORS.focus);
      this.toolTooltip.setVisible(true);
      this.setStatus('Tool Scout selected - 0.4 NIM simulated cost, no wallet action requested.');
    });

    this.toolStall.on('pointerout', () => {
      this.toolStall.setFillStyle(COLORS.toolIdle);
      this.toolStall.setStrokeStyle(4, 0x7b4218);
      this.toolTooltip.setVisible(false);
      this.setStatus(this.getDefaultStatus());
    });
  }

  drawApprovalGate() {
    this.add.rectangle(720, 360, 22, 146, COLORS.gate);
    this.add.rectangle(800, 360, 22, 146, COLORS.gate);
    this.add.rectangle(760, 305, 110, 20, COLORS.gate);
    this.add.rectangle(760, 360, 96, 68, 0xffffff).setStrokeStyle(4, COLORS.gate);
    this.add.text(722, 338, 'Rule Gate', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: COLORS.ink,
      fontStyle: '700',
    });
    this.add.text(721, 365, 'ready', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: COLORS.muted,
    });
  }

  drawReceiptArchive() {
    this.add.rectangle(900, 368, 120, 138, COLORS.receipt).setStrokeStyle(4, 0x3e2a60);
    this.add.rectangle(900, 318, 86, 24, 0xffffff).setStrokeStyle(3, 0x3e2a60);
    this.add.rectangle(900, 366, 86, 24, 0xffffff).setStrokeStyle(3, 0x3e2a60);
    this.add.rectangle(900, 414, 86, 24, 0xffffff).setStrokeStyle(3, 0x3e2a60);
    this.add.text(845, 456, 'Receipt Archive', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: COLORS.ink,
      fontStyle: '700',
    });
  }

  drawOverlay() {
    const { allowance, proposals, rule, tools } = this.scenario;
    const proposal = proposals.toolScout;
    const tool = tools.toolScout;

    this.add.rectangle(32, 558, 960, 150, COLORS.panelFill).setOrigin(0).setStrokeStyle(3, COLORS.panelStroke);
    this.add.text(54, 578, `Allowance: ${allowance.name} | ${formatNim(allowance.balance)} simulated`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      color: COLORS.ink,
      fontStyle: '700',
    });
    this.add.text(54, 608, `Rule: ${rule.summary}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: COLORS.muted,
      wordWrap: { width: 560 },
    });
    this.add.text(650, 578, `Proposal: ${tool.name} for ${formatNim(proposal.cost)}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      color: COLORS.ink,
      fontStyle: '700',
    });
    this.add.text(650, 608, proposal.reason, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: COLORS.muted,
      wordWrap: { width: 300 },
    });
    this.add.text(650, 652, 'Gate: ready to check | Receipt: none yet', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: COLORS.muted,
    });

    this.statusText = this.add.text(54, 676, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: COLORS.focus,
      fontStyle: '700',
      wordWrap: { width: 880 },
    });
  }

  getDefaultStatus() {
    const mode = this.miniAppEnvironment.isNimiqPay ? 'Nimiq Pay Mini App shell' : 'local simulated Mini App fallback';

    return `${mode}. Wallet operations are disabled for Phase 1.`;
  }

  setStatus(message) {
    this.statusText?.setText(message);
  }
}
