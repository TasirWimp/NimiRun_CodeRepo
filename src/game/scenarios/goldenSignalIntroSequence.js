import { getGoldenSignalMarketWorldLevel } from './marketWorldLevels.js';

export const GOLDEN_SIGNAL_INTRO_BEATS = Object.freeze({
  PRICE_ACTION_FORMS: 'price_action_forms',
  BOT_DETECTS_SIGNAL: 'bot_detects_signal',
  BOT_ANALYSIS_CONCLUDES: 'bot_analysis_concludes',
  PLAYER_HANDOFF: 'player_handoff',
});

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function relationResidue(level) {
  return normalizeList(level.navigationLineage?.residueToKeepVisible);
}

function createTimeBoundary(level) {
  return {
    visibleHistoryStart: level.timeWindow?.visibleHistoryStart || null,
    visibleHistoryEnd: level.timeWindow?.visibleHistoryEnd || null,
    decisionTime: level.timeWindow?.decisionTime || null,
    asOfTime: level.timeWindow?.asOfTime || null,
  };
}

function createProposalHandoff(level) {
  return {
    title: 'Pocket Bot proposal',
    action: 'Enter the Golden Signal',
    costPreview: '2 Bot Attention | 1 User Guidance',
    reason: 'Momentum looks strong, but support, exit, and crowd pressure are still hidden.',
    stillHidden: relationResidue(level).slice(0, 3),
    approveGate: 'Player approval required before resources are spent.',
  };
}

export function createGoldenSignalIntroSequence(
  level = getGoldenSignalMarketWorldLevel()
) {
  const chartPoints = normalizeList(level.priceSurface?.chartPoints);
  const timeBoundary = createTimeBoundary(level);
  const proposalHandoff = createProposalHandoff(level);

  return {
    id: 'golden_signal_opening_cinematic',
    sourceLevelId: level.id,
    title: 'Golden Signal Opening',
    skippable: true,
    deterministic: true,
    usesLlm: false,
    mutatesRuntimeState: false,
    timeBoundary,
    proposalHandoff,
    beats: [
      {
        id: GOLDEN_SIGNAL_INTRO_BEATS.PRICE_ACTION_FORMS,
        durationMs: 2300,
        title: 'Price Action Forms',
        layer: 'price_terrain',
        lines: [
          'BTCUSDT price motion rises into a bright signal.',
          `Pocket Bot sees only history through ${timeBoundary.visibleHistoryEnd}.`,
        ],
        visualCues: ['price-line draw', 'gold signal glow'],
        chartPoints,
      },
      {
        id: GOLDEN_SIGNAL_INTRO_BEATS.BOT_DETECTS_SIGNAL,
        durationMs: 2300,
        title: 'Pocket Bot Detects',
        layer: 'bot_policy_layer',
        lines: [
          'Pocket Bot notices momentum and wants to move quickly.',
          'Support, exit, crowd, and event pressure stay behind fog.',
        ],
        visualCues: ['bot scan pulse', 'attention pips wake'],
        hiddenLayers: ['support', 'exit', 'crowd', 'event'],
      },
      {
        id: GOLDEN_SIGNAL_INTRO_BEATS.BOT_ANALYSIS_CONCLUDES,
        durationMs: 2500,
        title: 'Analysis Concludes',
        layer: 'bot_policy_layer',
        lines: [
          proposalHandoff.action,
          proposalHandoff.reason,
          `Cost preview: ${proposalHandoff.costPreview}`,
        ],
        visualCues: ['proposal card materialize'],
        proposal: proposalHandoff,
      },
      {
        id: GOLDEN_SIGNAL_INTRO_BEATS.PLAYER_HANDOFF,
        durationMs: 2400,
        title: 'Your Judgment Starts',
        layer: 'player_choice',
        lines: [
          'The proposal is not executed yet.',
          'Approve, ask what is hidden, scan wider, or check exit/support first.',
        ],
        visualCues: ['control handoff pulse'],
        enabledControls: ['Approve', 'Ask Hidden', 'Wide Scan', 'Check Exit', 'Support Check'],
      },
    ],
  };
}

export function validateGoldenSignalIntroSequence(sequence) {
  const errors = [];
  const expectedBeatIds = Object.values(GOLDEN_SIGNAL_INTRO_BEATS);

  if (!sequence) {
    return {
      ok: false,
      errors: ['Missing Golden Signal intro sequence.'],
    };
  }

  if (sequence.usesLlm !== false) {
    errors.push('Intro sequence must not use the LLM.');
  }

  if (sequence.mutatesRuntimeState !== false) {
    errors.push('Intro sequence must not mutate runtime state.');
  }

  if (!sequence.timeBoundary?.decisionTime || !sequence.timeBoundary?.asOfTime) {
    errors.push('Intro sequence must carry decisionTime and asOfTime.');
  }

  const actualBeatIds = normalizeList(sequence.beats).map((beat) => beat.id);
  if (JSON.stringify(actualBeatIds) !== JSON.stringify(expectedBeatIds)) {
    errors.push('Intro sequence beats are out of order or incomplete.');
  }

  const text = JSON.stringify(sequence).toLowerCase();
  for (const forbidden of [
    'patternoutcome',
    'landfallrisk',
    '2017-12-22',
    'investment advice',
    'wallet authority',
    'exchange order',
  ]) {
    if (text.includes(forbidden)) {
      errors.push(`Intro sequence leaks forbidden text: ${forbidden}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
