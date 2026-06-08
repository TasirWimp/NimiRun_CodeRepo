export const BTCUSDT_FIXTURE_SOURCE = Object.freeze({
  provider: 'Binance Public Data',
  sourceUrls: Object.freeze([
    'https://github.com/binance/binance-public-data',
    'https://data.binance.vision/',
    'https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1d/BTCUSDT-1d-2017-12.zip',
  ]),
  licenseName: 'MIT',
  licenseEvidenceUrl: 'https://github.com/binance/binance-public-data#licence',
  retrievalDate: '2026-06-08',
  sourceArchiveUrl:
    'https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1d/BTCUSDT-1d-2017-12.zip',
  sourceChecksumUrl:
    'https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1d/BTCUSDT-1d-2017-12.zip.CHECKSUM',
  sourceChecksum:
    '45bf1c515b1108668b6bf10f7af323585f30cdf68e096cb71e6e3bb6aa0e9cb4',
  pair: 'BTCUSDT',
  interval: '1d',
  coveredRange: Object.freeze({
    start: '2017-12-01',
    end: '2017-12-24',
  }),
  marketScope: 'Binance spot BTCUSDT venue history',
  shippedAs: 'transformed_static_fixture',
  rawDataShipped: false,
  transformMethod:
    'Selected a compact December 2017 BTCUSDT daily-kline window, derived rounded chart indices and outcome metrics, and omitted the raw zip/CSV from the app bundle.',
  doesNotEstablish: Object.freeze([
    'global Bitcoin price index',
    'live trading rule',
    'investment advice',
    'reward-replay basis',
    'future price prediction',
  ]),
});

export const btcusdtWitnessWindows = Object.freeze([
  Object.freeze({
    id: 'btc_binance_btcusdt_2017_12_golden_signal',
    label: 'Golden Signal December 2017 BTCUSDT window',
    levelId: 'level_02_golden_signal',
    source: BTCUSDT_FIXTURE_SOURCE,
    transformed: true,
    playerVisible: Object.freeze({
      chartSurface: Object.freeze([
        'bright signal',
        'volatility rising',
        'futures gate nearby',
      ]),
      chartPoints: Object.freeze([
        Object.freeze({ date: '2017-12-01', closeIndex: 100 }),
        Object.freeze({ date: '2017-12-04', closeIndex: 107 }),
        Object.freeze({ date: '2017-12-07', closeIndex: 154 }),
        Object.freeze({ date: '2017-12-10', closeIndex: 138 }),
        Object.freeze({ date: '2017-12-13', closeIndex: 149 }),
        Object.freeze({ date: '2017-12-16', closeIndex: 177 }),
      ]),
    }),
    hiddenUntilInspect: Object.freeze({
      supportSurface: Object.freeze([
        'the rise is visible, but support depth is not proven by the bright shape alone',
      ]),
      exitSurface: Object.freeze([
        'later daily lows show exit pressure can appear quickly after the peak',
      ]),
      psychologySurface: Object.freeze([
        'the signal can look urgent before the route has been checked',
      ]),
    }),
    derivedMetrics: Object.freeze({
      sourceRowsUsed: 24,
      startCloseUsd: 10782.99,
      peakHighUsd: 19798.68,
      peakHighDate: '2017-12-17',
      reversalLowUsd: 10961,
      reversalLowDate: '2017-12-22',
      closeDrawdownBy2017_12_22Pct: -30.2,
      intradayDrawdownFromPeakHighPct: -44.6,
    }),
    mechanicsConnector:
      'A bright chart path can open a fast route, but support and exit pressure decide whether it is safe.',
    hindsightReveal: Object.freeze({
      patternOutcome:
        'The bright route later carries reversal pressure; a simulated gain alone does not prove a safe finish.',
      landfallRisk: 'false_finish_if_support_or_exit_is_unchecked',
    }),
    doesNotEstablish: BTCUSDT_FIXTURE_SOURCE.doesNotEstablish,
  }),
]);

const REQUIRED_SOURCE_FIELDS = Object.freeze([
  'provider',
  'sourceUrls',
  'licenseName',
  'licenseEvidenceUrl',
  'retrievalDate',
  'sourceArchiveUrl',
  'sourceChecksumUrl',
  'sourceChecksum',
  'pair',
  'interval',
  'coveredRange',
  'marketScope',
  'shippedAs',
  'rawDataShipped',
  'transformMethod',
  'doesNotEstablish',
]);

const REQUIRED_NON_CLAIMS = Object.freeze([
  'global Bitcoin price index',
  'live trading rule',
  'investment advice',
  'reward-replay basis',
]);

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function validateSourceEvidence(source, errors, prefix) {
  for (const field of REQUIRED_SOURCE_FIELDS) {
    if (source?.[field] == null || source[field] === '' || source[field] === 'tbd') {
      errors.push(`${prefix} missing source evidence field: ${field}`);
    }
  }

  if (source?.licenseName !== 'MIT') {
    errors.push(`${prefix} must declare the MIT license for Binance Public Data.`);
  }

  if (source?.pair !== 'BTCUSDT' || source?.interval !== '1d') {
    errors.push(`${prefix} must stay scoped to Binance BTCUSDT 1d data.`);
  }

  if (source?.rawDataShipped !== false || source?.shippedAs !== 'transformed_static_fixture') {
    errors.push(`${prefix} must ship as a transformed static fixture, not raw archive data.`);
  }

  if (/global bitcoin/i.test(source?.marketScope || '')) {
    errors.push(`${prefix} must not claim a global Bitcoin index scope.`);
  }

  const sourceUrls = normalizeList(source?.sourceUrls);
  if (!sourceUrls.some((url) => url.includes('binance-public-data'))) {
    errors.push(`${prefix} must link the Binance Public Data repo.`);
  }

  if (!sourceUrls.some((url) => url.includes('data.binance.vision'))) {
    errors.push(`${prefix} must link the Binance public data archive.`);
  }

  const nonClaims = normalizeList(source?.doesNotEstablish);
  for (const claim of REQUIRED_NON_CLAIMS) {
    if (!nonClaims.includes(claim)) {
      errors.push(`${prefix} must declare non-claim: ${claim}`);
    }
  }
}

export function getBtcusdtWitnessWindowById(windowId) {
  return btcusdtWitnessWindows.find((window) => window.id === windowId) ?? null;
}

export function validateBtcusdtWitnessWindowEvidence(windows = btcusdtWitnessWindows) {
  const errors = [];

  for (const window of normalizeList(windows)) {
    validateSourceEvidence(window.source, errors, window.id || 'window');

    if (window.transformed !== true) {
      errors.push(`${window.id} must be marked transformed.`);
    }

    if (!window.mechanicsConnector) {
      errors.push(`${window.id} must include a gameplay mechanics connector.`);
    }

    if (!normalizeList(window.doesNotEstablish).includes('investment advice')) {
      errors.push(`${window.id} must reject investment-advice interpretation.`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
