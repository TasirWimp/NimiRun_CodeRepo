import { describe, expect, it, vi } from 'vitest';

import {
  createNimiqPocketStatus,
  getMiniAppEnvironment,
  requestNimiqPocketStatus,
} from '../../src/platform/nimiqMiniApp.js';

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

describe('Nimiq pocket status', () => {
  it('creates a safe local fallback pocket without requesting providers', async () => {
    const initProvider = vi.fn();
    const result = await requestNimiqPocketStatus({
      globalObject: {
        navigator: {
          language: 'en-US',
        },
      },
      pocket: {
        amount: 23,
        currency: 'NIM',
      },
      initProvider,
    });

    expect(initProvider).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      status: 'local-fallback',
      provider: null,
      pocket: {
        mode: 'local-simulated',
        network: 'local',
        amount: 23,
        currency: 'NIM',
        walletOperationsEnabled: false,
        mainnetOperationsEnabled: false,
        canRequestProvider: false,
        statusLabel: 'Local fallback pocket',
      },
    });
  });

  it('requests Nimiq Pay status explicitly without signing or sending', async () => {
    const provider = {
      listAccounts: vi.fn(async () => ['NQ12 TEST 0000 0000 0000 0000 0000 0000 0000']),
      isConsensusEstablished: vi.fn(async () => true),
      getBlockNumber: vi.fn(async () => 12345),
      sign: vi.fn(),
      sendBasicTransaction: vi.fn(),
      sendBasicTransactionWithData: vi.fn(),
    };
    const initProvider = vi.fn(async () => provider);

    const result = await requestNimiqPocketStatus({
      globalObject: {
        navigator: {
          language: 'de-DE',
        },
        nimiqPay: {
          language: 'de',
          network: 'testnet',
        },
        nimiq: provider,
      },
      pocket: {
        amount: 23,
        currency: 'NIM',
      },
      initProvider,
      initializeProvider: true,
    });

    expect(initProvider).toHaveBeenCalledWith({ timeout: 1000 });
    expect(provider.listAccounts).toHaveBeenCalledTimes(1);
    expect(provider.isConsensusEstablished).toHaveBeenCalledTimes(1);
    expect(provider.getBlockNumber).toHaveBeenCalledTimes(1);
    expect(provider.sign).not.toHaveBeenCalled();
    expect(provider.sendBasicTransaction).not.toHaveBeenCalled();
    expect(provider.sendBasicTransactionWithData).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      status: 'provider-ready',
      pocket: {
        mode: 'nimiq-pay',
        network: 'testnet',
        accountsCount: 1,
        consensusEstablished: true,
        blockNumber: 12345,
        walletOperationsEnabled: false,
        mainnetOperationsEnabled: false,
        canRequestProvider: true,
        canSend: false,
        canSign: false,
        statusLabel: 'Nimiq Pay testnet status',
      },
    });
    expect(result.pocket.accountPreview).toMatch(/^NQ12/);
  });

  it('keeps provider errors readable and non-authorizing', async () => {
    const result = await requestNimiqPocketStatus({
      globalObject: {
        navigator: {
          language: 'en-US',
        },
        nimiqPay: {
          language: 'en',
          network: 'testnet',
        },
      },
      initProvider: vi.fn(async () => {
        throw new Error('User rejected account access.');
      }),
      initializeProvider: true,
    });

    expect(result).toMatchObject({
      status: 'provider-unavailable',
      provider: null,
      pocket: {
        mode: 'nimiq-pay',
        network: 'testnet',
        walletOperationsEnabled: false,
        mainnetOperationsEnabled: false,
        statusLabel: 'Nimiq Pay status unavailable',
        errorMessage: 'User rejected account access.',
      },
    });
  });

  it('normalizes detected Mini App status without enabling mainnet authority', () => {
    const pocket = createNimiqPocketStatus({
      environment: getMiniAppEnvironment({
        navigator: {
          language: 'en-US',
        },
        nimiqPay: {
          language: 'en',
          network: 'mainnet',
        },
      }),
      status: 'provider-not-requested',
    });

    expect(pocket).toMatchObject({
      mode: 'nimiq-pay',
      network: 'mainnet',
      walletOperationsEnabled: false,
      mainnetOperationsEnabled: false,
      canRequestProvider: true,
      statusLabel: 'Nimiq Pay detected',
    });
  });
});
