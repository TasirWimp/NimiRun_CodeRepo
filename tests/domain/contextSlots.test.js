import { describe, expect, it } from 'vitest';

import {
  CONTEXT_ITEM_TYPES,
  CONTEXT_REPLACEMENT_RISK,
  createContextSlots,
  getContextSlotUsage,
  hasContextCapacity,
  rememberContextItem,
  replaceContextItem,
} from '../../src/domain/contextSlots.js';

function createFullSlots() {
  return createContextSlots({
    capacity: 2,
    items: [
      {
        id: 'shortcut-risk',
        type: CONTEXT_ITEM_TYPES.RESIDUE,
        label: 'Shortcut risk',
        traceBacked: true,
      },
      {
        id: 'warning-open',
        type: CONTEXT_ITEM_TYPES.RESIDUE,
        label: 'Warning not inspected',
      },
    ],
  });
}

describe('Context Slots', () => {
  it('tracks fixed capacity and available slots', () => {
    const slots = createContextSlots({ capacity: 4 });

    expect(getContextSlotUsage(slots)).toMatchObject({
      used: 0,
      available: 4,
      capacity: 4,
    });
    expect(hasContextCapacity(slots)).toBe(true);
  });

  it('remembers a clue when capacity is available', () => {
    const result = rememberContextItem(createContextSlots({ capacity: 2 }), {
      id: 'cheap-route-clue',
      type: CONTEXT_ITEM_TYPES.CLUE,
      label: 'Cheap route clue',
      sourceNodeId: 'context-shrine',
    });

    expect(result).toMatchObject({
      applied: true,
      contextSlots: {
        items: [
          {
            id: 'cheap-route-clue',
            sourceNodeId: 'context-shrine',
          },
        ],
      },
    });
  });

  it('blocks remembering when capacity is full', () => {
    const result = rememberContextItem(createFullSlots(), {
      id: 'new-clue',
      type: CONTEXT_ITEM_TYPES.CLUE,
      label: 'New clue',
    });

    expect(result.applied).toBe(false);
    expect(result.reason).toContain('Context Capacity is full');
  });

  it('marks replacement as trace-backed when the removed item has a trace', () => {
    const result = replaceContextItem(createFullSlots(), 'shortcut-risk', {
      id: 'support-well',
      type: CONTEXT_ITEM_TYPES.CLUE,
      label: 'Support well',
    });

    expect(result).toMatchObject({
      applied: true,
      replacementRisk: CONTEXT_REPLACEMENT_RISK.TRACE_BACKED,
      replacedItem: {
        id: 'shortcut-risk',
      },
    });
  });

  it('marks replacement as dangerous when the removed item is not trace-backed', () => {
    const result = replaceContextItem(createFullSlots(), 'warning-open', {
      id: 'support-well',
      type: CONTEXT_ITEM_TYPES.CLUE,
      label: 'Support well',
    });

    expect(result).toMatchObject({
      applied: true,
      replacementRisk: CONTEXT_REPLACEMENT_RISK.DANGEROUS_LOSS,
      replacedItem: {
        id: 'warning-open',
      },
    });
  });
});

