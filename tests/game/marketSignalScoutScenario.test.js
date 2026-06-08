import { describe, expect, it } from 'vitest';

import { FINISH_STATUSES } from '../../src/domain/finishJudgment.js';
import {
  approvePendingProposal,
  redirectPendingProposal,
  showRemainingUnknowns,
} from '../../src/domain/guidanceLoop.js';
import {
  actOnLossyMapNode,
  createLossyMapState,
  inspectLossyMapNode,
} from '../../src/domain/lossyMap.js';
import { validateScenarioContract } from '../../src/domain/runSession.js';
import { createPocketBotState } from '../../src/game/pocketBotState.js';
import {
  getNodeById,
  summarizeMapCapabilities,
} from '../../src/game/resourceMapScenario.js';
import {
  getBtcusdtWitnessWindowById,
  validateBtcusdtWitnessWindowEvidence,
} from '../../src/game/scenarios/data/marketSignalScoutBtcusdtWindows.js';
import { createMarketSignalScoutScenario } from '../../src/game/scenarios/marketSignalScoutScenario.js';

function createScenarioState() {
  return createLossyMapState(createMarketSignalScoutScenario());
}

describe('Market Signal Scout Golden Signal scenario', () => {
  it('ships a transformed Binance BTCUSDT fixture with license evidence metadata', () => {
    const validation = validateBtcusdtWitnessWindowEvidence();
    const window = getBtcusdtWitnessWindowById('btc_binance_btcusdt_2017_12_golden_signal');

    expect(validation).toEqual({
      ok: true,
      errors: [],
    });
    expect(window.source).toMatchObject({
      provider: 'Binance Public Data',
      licenseName: 'MIT',
      licenseEvidenceUrl: 'https://github.com/binance/binance-public-data#licence',
      sourceArchiveUrl:
        'https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1d/BTCUSDT-1d-2017-12.zip',
      sourceChecksum:
        '45bf1c515b1108668b6bf10f7af323585f30cdf68e096cb71e6e3bb6aa0e9cb4',
      rawDataShipped: false,
      shippedAs: 'transformed_static_fixture',
    });
    expect(window.source.doesNotEstablish).toContain('global Bitcoin price index');
    expect(window.source.doesNotEstablish).toContain('investment advice');
    expect(window.playerVisible.chartPoints).toHaveLength(6);
    expect(window.hindsightReveal.landfallRisk).toBe('false_finish_if_support_or_exit_is_unchecked');
  });

  it('rejects vague or overclaiming fixture provenance', () => {
    const window = getBtcusdtWitnessWindowById('btc_binance_btcusdt_2017_12_golden_signal');
    const validation = validateBtcusdtWitnessWindowEvidence([
      {
        ...window,
        source: {
          ...window.source,
          licenseEvidenceUrl: '',
          marketScope: 'global Bitcoin price index',
          doesNotEstablish: ['future price prediction'],
        },
      },
    ]);

    expect(validation.ok).toBe(false);
    expect(validation.errors.join(' ')).toContain('licenseEvidenceUrl');
    expect(validation.errors.join(' ')).toContain('global Bitcoin index');
    expect(validation.errors.join(' ')).toContain('investment advice');
  });

  it('loads as a valid scenario contract with fog, hidden pressure, and finish types', () => {
    const scenario = createMarketSignalScoutScenario();
    const validation = validateScenarioContract(scenario);
    const capabilities = summarizeMapCapabilities(scenario);

    expect(validation.valid).toBe(true);
    expect(scenario).toMatchObject({
      id: 'market-signal-scout-golden-signal',
      title: 'Market Signal Scout',
      goal: 'Teach Pocket Bot to inspect support before treating a bright signal as safe.',
    });
    expect(capabilities).toMatchObject({
      supportsFog: true,
      supportsHiddenPressure: true,
      supportsResidue: true,
      supportsFalseFinish: true,
      supportsSafeFinish: true,
    });
    expect(getNodeById(scenario, 'support-check').witnessIds).toContain(
      'btc_futures_gate_cboe_2017_12_04'
    );
    expect(scenario.level.featuredWitnessIds).toEqual([
      'btc_futures_gate_cboe_2017_12_04',
    ]);
    expect(scenario.level.visibleWitnessIds).not.toContain(
      'btc_futures_gate_cboe_2017_12_04'
    );
  });

  it('starts with a bot proposal to act on a bright signal while key unknowns remain visible', () => {
    const state = createPocketBotState(createMarketSignalScoutScenario());
    const unknowns = showRemainingUnknowns(state);

    expect(state.pendingProposal).toMatchObject({
      moveType: 'act',
      targetNodeId: 'bright-signal',
    });
    expect(unknowns.guidancePanel.title).toBe('What remains unknown?');
    expect(unknowns.guidancePanel.lines.join(' ')).toContain('support depth still unknown');
    expect(unknowns.guidancePanel.lines.join(' ')).toContain('exit friction still unknown');
    expect(unknowns.guidancePanel.lines.join(' ')).toContain('FOMO pressure still unknown');
  });

  it('lets the player redirect to inspect support and records a trace', () => {
    const state = createPocketBotState(createMarketSignalScoutScenario());
    const redirected = redirectPendingProposal(state, {
      moveType: 'inspect',
      targetNodeId: 'support-check',
      reason: 'Inspect support before acting on the bright signal.',
    });
    const accepted = approvePendingProposal(redirected);

    expect(accepted.applied).toBe(true);
    expect(accepted.state.mapState.resources.botAttention.current).toBe(8);
    expect(accepted.state.mapState.revealedEvidence).toContain('signal-support-inspected');
    expect(accepted.state.traceCards.at(-1)).toMatchObject({
      acceptedMove: {
        moveType: 'inspect',
        targetNodeId: 'support-check',
      },
      resourceSpend: {
        botAttention: 2,
      },
    });
    expect(accepted.state.traceCards.at(-1).revealed).toContain('signal-support-inspected');
  });

  it('classifies acting through the false finish as unsafe when support and exit are unchecked', () => {
    const result = actOnLossyMapNode(createScenarioState(), 'false-gate');

    expect(result.state.finishJudgment.status).toBe(FINISH_STATUSES.FALSE);
    expect(result.state.finishJudgment.missingEvidence).toEqual([
      'signal-support-inspected',
      'exit-friction-inspected',
      'fomo-pressure-named',
    ]);
    expect(result.state.finishJudgment.note).toContain('False Finish');
  });

  it('can reach safe finish after support, exit, FOMO, and finish conditions are checked', () => {
    const support = inspectLossyMapNode(createScenarioState(), 'support-check').state;
    const exit = inspectLossyMapNode(support, 'exit-friction').state;
    const fomo = inspectLossyMapNode(exit, 'fomo-pressure').state;
    const safeInspected = inspectLossyMapNode(fomo, 'safe-gate').state;
    const result = actOnLossyMapNode(safeInspected, 'safe-gate');

    expect(result.state.revealedEvidence).toEqual([
      'signal-support-inspected',
      'futures-gate-context-seen',
      'exit-friction-inspected',
      'fomo-pressure-named',
      'safe-finish-conditions-seen',
    ]);
    expect(result.state.remainingUnknowns).toEqual([]);
    expect(result.state.finishJudgment.status).toBe(FINISH_STATUSES.SAFE);
  });
});
