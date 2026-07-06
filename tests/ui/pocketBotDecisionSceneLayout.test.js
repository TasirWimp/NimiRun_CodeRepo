import { describe, expect, it } from 'vitest';

import {
  createPocketBotDecisionSceneLayout,
  layoutDecisionActionButtons,
} from '../../src/ui/pocketBotDecisionSceneLayout.js';

function bottom(rect) {
  return rect.y + rect.height;
}

function right(rect) {
  return rect.x + rect.width;
}

function expectWithinViewport(rect, width, height) {
  expect(rect.x).toBeGreaterThanOrEqual(0);
  expect(rect.y).toBeGreaterThanOrEqual(0);
  expect(right(rect)).toBeLessThanOrEqual(width);
  expect(bottom(rect)).toBeLessThanOrEqual(height);
}

describe('pocket bot decision scene layout', () => {
  it('fits the V2 phone decision surface into a 390x844 portrait viewport', () => {
    const width = 390;
    const height = 844;
    const layout = createPocketBotDecisionSceneLayout(width, height);

    expect(layout.isPhoneFirst).toBe(true);
    expect(layout.content.width).toBe(366);
    expectWithinViewport(layout.resourceBar, width, height);
    expectWithinViewport(layout.arenaCard, width, height);
    expectWithinViewport(layout.botProposal, width, height);
    expectWithinViewport(layout.narratorStrip, width, height);
    expectWithinViewport(layout.actionTray, width, height);
    expectWithinViewport(layout.traceDrawer, width, height);
    expect(layout.arenaCard.y).toBeGreaterThanOrEqual(bottom(layout.resourceBar));
    expect(layout.botProposal.y).toBeGreaterThanOrEqual(bottom(layout.arenaCard));
    expect(layout.narratorStrip.y).toBeGreaterThanOrEqual(bottom(layout.botProposal));
    expect(layout.actionTray.y).toBeGreaterThanOrEqual(bottom(layout.narratorStrip));
  });

  it('lays four primary action buttons into a stable 2x2 tray', () => {
    const layout = createPocketBotDecisionSceneLayout(390, 844);
    const buttons = layoutDecisionActionButtons(layout.actionTray, [
      { id: 'approve_enter', label: 'Approve Enter' },
      { id: 'ask_remaining_unknown', label: 'Ask Hidden' },
      { id: 'wide_scan', label: 'Wide Scan' },
      { id: 'check_exit', label: 'Check Exit' },
    ]);

    expect(buttons).toHaveLength(4);
    expect(buttons[0].y).toBe(buttons[1].y);
    expect(buttons[2].y).toBe(buttons[3].y);
    expect(buttons[2].y).toBeGreaterThan(buttons[0].y);
    expect(buttons[0].x).toBe(buttons[2].x);
    expect(buttons[1].x).toBe(buttons[3].x);

    for (const button of buttons) {
      expectWithinViewport(button, 390, 844);
      expect(button.width).toBeGreaterThanOrEqual(170);
      expect(button.height).toBeGreaterThanOrEqual(58);
    }
  });

  it('keeps the phone-first frame usable on desktop-sized canvases', () => {
    const layout = createPocketBotDecisionSceneLayout(1024, 768);

    expect(layout.content.width).toBe(430);
    expect(layout.content.x).toBeGreaterThan(280);
    expectWithinViewport(layout.actionTray, 1024, 768);
    expect(bottom(layout.actionTray)).toBeLessThanOrEqual(768);
  });
});
