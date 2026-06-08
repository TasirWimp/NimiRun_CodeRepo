import {
  MARKET_WITNESS_SOURCE_CLASSES,
  getMarketWitnessById,
} from '../game/scenarios/marketWitnessLedger.js';

const PREFERRED_WITNESS_CLASSES = Object.freeze([
  MARKET_WITNESS_SOURCE_CLASSES.MARKET_EVENT,
  MARKET_WITNESS_SOURCE_CLASSES.EXIT_FRICTION,
  MARKET_WITNESS_SOURCE_CLASSES.PSYCHOLOGY_PRESSURE,
  MARKET_WITNESS_SOURCE_CLASSES.PRICE_SHAPE,
]);

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function truncateText(value, limit = 76) {
  if (!value) {
    return '';
  }

  return value.length > limit ? `${value.slice(0, limit - 3)}...` : value;
}

function getWitnesses(witnessIds = []) {
  return normalizeList(witnessIds)
    .map((witnessId) => getMarketWitnessById(witnessId))
    .filter(Boolean);
}

export function selectFeaturedWitness(witnessIds = []) {
  const witnesses = getWitnesses(witnessIds);

  for (const sourceClass of PREFERRED_WITNESS_CLASSES) {
    const witness = witnesses.find((item) => item.sourceClass === sourceClass);

    if (witness) {
      return witness;
    }
  }

  return witnesses[0] || null;
}

export function createWitnessHudSummary(witnessIds = []) {
  const witness = selectFeaturedWitness(witnessIds);

  if (!witness) {
    return null;
  }

  return `Historic witness: ${truncateText(witness.title, 82)}`;
}

export function createWitnessPanelContent(witnessIds = []) {
  const witness = selectFeaturedWitness(witnessIds);

  if (!witness) {
    return null;
  }

  return {
    title: 'Historic Witness',
    witness,
    lines: [
      `Title: ${witness.title}`,
      `Game: ${witness.mechanicsConnector}`,
      `Source: ${witness.sourceRecord.providerName}`,
      'Not: trading advice',
    ],
  };
}
