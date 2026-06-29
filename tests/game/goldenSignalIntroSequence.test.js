import { describe, expect, it } from 'vitest';

import {
  GOLDEN_SIGNAL_INTRO_BEATS,
  createGoldenSignalIntroSequence,
  validateGoldenSignalIntroSequence,
} from '../../src/game/scenarios/goldenSignalIntroSequence.js';

describe('Golden Signal intro sequence', () => {
  it('creates a deterministic four-beat opening without runtime authority', () => {
    const sequence = createGoldenSignalIntroSequence();

    expect(validateGoldenSignalIntroSequence(sequence)).toEqual({
      ok: true,
      errors: [],
    });
    expect(sequence).toMatchObject({
      id: 'golden_signal_opening_cinematic',
      sourceLevelId: 'level_02_golden_signal',
      skippable: true,
      deterministic: true,
      usesLlm: false,
      mutatesRuntimeState: false,
      timeBoundary: {
        visibleHistoryStart: '2017-12-01',
        visibleHistoryEnd: '2017-12-16',
        decisionTime: '2017-12-17T00:00:00Z',
        asOfTime: '2017-12-17T00:00:00Z',
      },
    });
    expect(sequence.beats.map((beat) => beat.id)).toEqual([
      GOLDEN_SIGNAL_INTRO_BEATS.PRICE_ACTION_FORMS,
      GOLDEN_SIGNAL_INTRO_BEATS.BOT_DETECTS_SIGNAL,
      GOLDEN_SIGNAL_INTRO_BEATS.BOT_ANALYSIS_CONCLUDES,
      GOLDEN_SIGNAL_INTRO_BEATS.PLAYER_HANDOFF,
    ]);
  });

  it('keeps the proposal handoff pending and hindsight-free', () => {
    const sequence = createGoldenSignalIntroSequence();
    const text = JSON.stringify(sequence).toLowerCase();

    expect(sequence.proposalHandoff).toMatchObject({
      action: 'Enter the Golden Signal',
      costPreview: '2 Bot Attention | 1 User Guidance',
      approveGate: 'Player approval required before resources are spent.',
    });
    expect(sequence.proposalHandoff.stillHidden).toEqual([
      'support depth still unknown',
      'exit friction still unknown',
      'FOMO pressure still unknown',
    ]);
    expect(text).not.toContain('patternoutcome');
    expect(text).not.toContain('landfallrisk');
    expect(text).not.toContain('2017-12-22');
  });

  it('rejects intro sequences that use LLM authority or leak future outcome text', () => {
    const sequence = createGoldenSignalIntroSequence();
    const invalid = {
      ...sequence,
      usesLlm: true,
      beats: [
        ...sequence.beats,
        {
          id: 'bad_hindsight',
          title: 'Future',
          lines: ['2017-12-22 drawdown revealed early'],
        },
      ],
    };
    const validation = validateGoldenSignalIntroSequence(invalid);

    expect(validation.ok).toBe(false);
    expect(validation.errors.join(' ')).toContain('must not use the LLM');
    expect(validation.errors.join(' ')).toContain('out of order or incomplete');
    expect(validation.errors.join(' ')).toContain('2017-12-22');
  });
});
