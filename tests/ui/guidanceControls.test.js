import { describe, expect, it } from 'vitest';

import { layoutGuidanceButtons } from '../../src/ui/guidanceControls.js';

function createArenaButtons(isMobile) {
  return [
    { label: 'Approve', width: isMobile ? 66 : 72 },
    { label: 'Ask Hidden', width: isMobile ? 78 : 80 },
    { label: 'Wide Scan', width: isMobile ? 74 : 78 },
    { label: 'Check Exit', width: isMobile ? 72 : 78 },
    { label: 'Support', width: isMobile ? 64 : 68 },
    { label: 'Why', width: isMobile ? 48 : 54 },
    { label: 'Inspect 1st', width: isMobile ? 76 : 80 },
    { label: 'Partial', width: isMobile ? 60 : 64 },
  ];
}

describe('layoutGuidanceButtons', () => {
  it('wraps arena controls into two compact phone rows without horizontal overflow', () => {
    const x = 30;
    const y = 126;
    const maxWidth = 330;
    const buttons = layoutGuidanceButtons(createArenaButtons(true), {
      x,
      y,
      maxWidth,
      rowGap: 22,
    });
    const rows = new Set(buttons.map((button) => button.y));

    expect(rows.size).toBe(2);
    for (const button of buttons) {
      expect(button.x + button.width).toBeLessThanOrEqual(x + maxWidth);
    }
    expect(Math.max(...buttons.map((button) => button.y)) + 20).toBeLessThanOrEqual(y + 42);
  });

  it('keeps desktop arena controls inside the proposal panel width', () => {
    const x = 538;
    const maxWidth = 436;
    const buttons = layoutGuidanceButtons(createArenaButtons(false), {
      x,
      y: 696,
      maxWidth,
      rowGap: 24,
    });

    expect(new Set(buttons.map((button) => button.y)).size).toBe(2);
    for (const button of buttons) {
      expect(button.x + button.width).toBeLessThanOrEqual(x + maxWidth);
    }
  });
});
