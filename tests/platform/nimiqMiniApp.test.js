import { describe, expect, it } from 'vitest';

import { getMiniAppEnvironment } from '../../src/platform/nimiqMiniApp.js';

describe('getMiniAppEnvironment', () => {
  it('returns local simulated mode when Nimiq Pay globals are unavailable', () => {
    const environment = getMiniAppEnvironment({
      navigator: {
        language: 'de-DE',
      },
    });

    expect(environment).toMatchObject({
      mode: 'local-simulated',
      isNimiqPay: false,
      hasNimiqProvider: false,
      hasEthereumProvider: false,
      language: 'de',
      walletOperationsEnabled: false,
    });
  });

  it('detects Nimiq Pay language and injected Ethereum provider without enabling wallet operations', () => {
    const environment = getMiniAppEnvironment({
      navigator: {
        language: 'en-US',
      },
      nimiqPay: {
        language: 'es',
      },
      nimiq: {
        listAccounts: () => Promise.resolve([]),
      },
      ethereum: {
        request: () => Promise.resolve([]),
      },
    });

    expect(environment).toMatchObject({
      mode: 'nimiq-pay',
      isNimiqPay: true,
      hasNimiqProvider: true,
      hasEthereumProvider: true,
      language: 'es',
      walletOperationsEnabled: false,
    });
  });
});
