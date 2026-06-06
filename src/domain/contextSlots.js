export const CONTEXT_ITEM_TYPES = Object.freeze({
  CLUE: 'clue',
  RESIDUE: 'residue',
  LESSON: 'lesson',
});

export const CONTEXT_REPLACEMENT_RISK = Object.freeze({
  TRACE_BACKED: 'trace-backed',
  DANGEROUS_LOSS: 'dangerous-context-loss',
});

export const DEFAULT_CONTEXT_SLOT_COUNT = 4;

function normalizeNonNegativeInteger(value, fallback = 0) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(0, Math.floor(numberValue));
}

function normalizeContextItem(item) {
  if (!item?.id) {
    throw new TypeError('Context item requires an id.');
  }

  return {
    id: item.id,
    type: item.type || CONTEXT_ITEM_TYPES.CLUE,
    label: item.label || item.id,
    sourceNodeId: item.sourceNodeId || null,
    traceBacked: item.traceBacked === true,
    archivedTraceId: item.archivedTraceId || null,
  };
}

export function createContextSlots(config = {}) {
  const capacity = normalizeNonNegativeInteger(config.capacity ?? config.max, DEFAULT_CONTEXT_SLOT_COUNT);
  const items = Array.isArray(config.items) ? config.items.map(normalizeContextItem) : [];

  if (items.length > capacity) {
    throw new RangeError(`Context slots can hold ${capacity} items, received ${items.length}.`);
  }

  return {
    label: config.label || 'Context Slots',
    capacity,
    items,
  };
}

export function getContextSlotUsage(contextSlots) {
  const slots = createContextSlots(contextSlots);

  return {
    used: slots.items.length,
    available: slots.capacity - slots.items.length,
    capacity: slots.capacity,
  };
}

export function hasContextCapacity(contextSlots, requiredSlots = 1) {
  const required = normalizeNonNegativeInteger(requiredSlots, 1);
  const usage = getContextSlotUsage(contextSlots);

  return usage.available >= required;
}

export function rememberContextItem(contextSlots, item) {
  const slots = createContextSlots(contextSlots);
  const contextItem = normalizeContextItem(item);

  if (!hasContextCapacity(slots, 1)) {
    return {
      applied: false,
      contextSlots: slots,
      item: contextItem,
      reason: 'Context Capacity is full. Replace an item or skip remembering this clue.',
    };
  }

  return {
    applied: true,
    contextSlots: {
      ...slots,
      items: [...slots.items, contextItem],
    },
    item: contextItem,
  };
}

export function replaceContextItem(contextSlots, replacedItemId, item) {
  const slots = createContextSlots(contextSlots);
  const contextItem = normalizeContextItem(item);
  const replacedIndex = slots.items.findIndex((candidate) => candidate.id === replacedItemId);

  if (replacedIndex === -1) {
    return {
      applied: false,
      contextSlots: slots,
      item: contextItem,
      reason: `Context item ${replacedItemId} was not found.`,
    };
  }

  const replacedItem = slots.items[replacedIndex];
  const replacementRisk = replacedItem.traceBacked || replacedItem.archivedTraceId
    ? CONTEXT_REPLACEMENT_RISK.TRACE_BACKED
    : CONTEXT_REPLACEMENT_RISK.DANGEROUS_LOSS;
  const items = [...slots.items];
  items[replacedIndex] = contextItem;

  return {
    applied: true,
    contextSlots: {
      ...slots,
      items,
    },
    item: contextItem,
    replacedItem,
    replacementRisk,
  };
}

