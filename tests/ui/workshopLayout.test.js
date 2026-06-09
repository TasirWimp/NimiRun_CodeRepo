import { describe, expect, it } from 'vitest';

import { createWorkshopLayout } from '../../src/ui/workshopLayout.js';

describe('createWorkshopLayout', () => {
  it('keeps the existing desktop layout stable', () => {
    const layout = createWorkshopLayout(1024, 768);

    expect(layout.isMobile).toBe(false);
    expect(layout.map).toMatchObject({ x: 32, y: 112, width: 650, height: 430 });
    expect(layout.proposal).toMatchObject({ x: 520, y: 558, width: 472, height: 170 });
  });

  it('stacks the first-run panels for phone portrait', () => {
    const layout = createWorkshopLayout(390, 844);

    expect(layout.isMobile).toBe(true);
    expect(layout.map.width).toBe(366);
    expect(layout.proposal.y).toBeGreaterThan(layout.map.y + layout.map.height);
    expect(layout.details.y).toBeGreaterThan(layout.proposal.y + layout.proposal.height);
    expect(layout.hud.y + layout.hud.height).toBeLessThanOrEqual(844);
  });

  it('fits a shorter high-density Mini App portrait surface', () => {
    const layout = createWorkshopLayout(430, 790);

    expect(layout.isMobile).toBe(true);
    expect(layout.map.height).toBeLessThan(277);
    expect(layout.proposal.height).toBe(158);
    expect(layout.details.height).toBe(126);
    expect(layout.hud.height).toBe(126);
    expect(layout.hud.y + layout.hud.height).toBeLessThanOrEqual(790);
  });
});
