import { init as initNimiqMiniApp } from '@nimiq/mini-app-sdk';

const DEFAULT_LANGUAGE = 'en';

function normalizeLanguage(language) {
  if (typeof language !== 'string' || language.trim() === '') {
    return DEFAULT_LANGUAGE;
  }

  return language.trim().split('-')[0].toLowerCase();
}

export function getMiniAppEnvironment(globalObject = globalThis) {
  const nimiqPay = globalObject?.nimiqPay;
  const navigatorLanguage = globalObject?.navigator?.language;
  const language = normalizeLanguage(nimiqPay?.language || navigatorLanguage);
  const hasNimiqProvider = Boolean(globalObject?.nimiq);
  const hasEthereumProvider = typeof globalObject?.ethereum?.request === 'function';
  const isNimiqPay = Boolean(nimiqPay);

  return {
    mode: isNimiqPay ? 'nimiq-pay' : 'local-simulated',
    isNimiqPay,
    hasNimiqProvider,
    hasEthereumProvider,
    language,
    providerStatus: hasNimiqProvider ? 'provider-injected-not-requested' : (isNimiqPay ? 'provider-not-requested' : 'local-fallback'),
    walletOperationsEnabled: false,
  };
}

export async function prepareNimiqProvider({
  globalObject = globalThis,
  timeout = 1000,
  initializeProvider = false,
} = {}) {
  const environment = getMiniAppEnvironment(globalObject);

  if (!environment.isNimiqPay || !initializeProvider) {
    return {
      environment,
      provider: null,
      status: environment.providerStatus,
    };
  }

  try {
    const provider = await initNimiqMiniApp({ timeout });

    return {
      environment: {
        ...environment,
        providerStatus: 'provider-ready',
      },
      provider,
      status: 'provider-ready',
    };
  } catch (error) {
    return {
      environment: {
        ...environment,
        providerStatus: 'provider-unavailable',
      },
      provider: null,
      status: 'provider-unavailable',
      error,
    };
  }
}
