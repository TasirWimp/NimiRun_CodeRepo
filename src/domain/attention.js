export const ATTENTION_RESOURCE_ID = 'bot-attention';

export const DEFAULT_BOT_ATTENTION = Object.freeze({
  current: 10,
  max: 10,
  label: 'Bot Attention',
});

function normalizeNonNegativeInteger(value, fallback = 0) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(0, Math.floor(numberValue));
}

export function createBotAttention(config = {}) {
  const max = normalizeNonNegativeInteger(config.max, DEFAULT_BOT_ATTENTION.max);
  const current = normalizeNonNegativeInteger(config.current ?? max, max);

  return {
    id: config.id || ATTENTION_RESOURCE_ID,
    label: config.label || DEFAULT_BOT_ATTENTION.label,
    current: Math.min(current, max),
    max,
  };
}

export function getBotAttentionAvailable(attention) {
  return normalizeNonNegativeInteger(attention?.current);
}

export function canSpendBotAttention(attention, amount) {
  const cost = normalizeNonNegativeInteger(amount);

  return getBotAttentionAvailable(attention) >= cost;
}

export function spendBotAttention(attention, amount) {
  const normalizedAttention = createBotAttention(attention);
  const cost = normalizeNonNegativeInteger(amount);

  if (!canSpendBotAttention(normalizedAttention, cost)) {
    return {
      applied: false,
      cost,
      attention: normalizedAttention,
      reason: `Insufficient Bot Attention: ${normalizedAttention.current}/${normalizedAttention.max} available, ${cost} required.`,
    };
  }

  return {
    applied: true,
    cost,
    attention: {
      ...normalizedAttention,
      current: normalizedAttention.current - cost,
    },
  };
}

export function getBotAttentionRatio(attention) {
  const normalizedAttention = createBotAttention(attention);

  if (normalizedAttention.max === 0) {
    return 0;
  }

  return normalizedAttention.current / normalizedAttention.max;
}

