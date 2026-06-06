import { init as initNimiqMiniApp } from '@nimiq/mini-app-sdk';

const DEFAULT_LANGUAGE = 'en';
const DEFAULT_POCKET_AMOUNT = 0;
const DEFAULT_POCKET_CURRENCY = 'NIM';

function normalizeLanguage(language) {
  if (typeof language !== 'string' || language.trim() === '') {
    return DEFAULT_LANGUAGE;
  }

  return language.trim().split('-')[0].toLowerCase();
}

function normalizeNetwork(nimiqPay = null, fallback = 'unknown') {
  const network =
    nimiqPay?.network ||
    nimiqPay?.nimiqNetwork ||
    nimiqPay?.chain ||
    nimiqPay?.networkId ||
    fallback;

  if (typeof network !== 'string' || network.trim() === '') {
    return fallback;
  }

  return network.trim().toLowerCase();
}

function normalizePocketAmount(pocket = {}) {
  const amount = Number(pocket.amount);

  return Number.isFinite(amount) ? amount : DEFAULT_POCKET_AMOUNT;
}

function previewAccount(address) {
  if (typeof address !== 'string' || address.trim() === '') {
    return null;
  }

  const compact = address.trim().replace(/\s+/g, ' ');

  if (compact.length <= 18) {
    return compact;
  }

  return `${compact.slice(0, 4)}...${compact.slice(-4)}`;
}

export function getMiniAppEnvironment(globalObject = globalThis) {
  const nimiqPay = globalObject?.nimiqPay;
  const navigatorLanguage = globalObject?.navigator?.language;
  const language = normalizeLanguage(nimiqPay?.language || navigatorLanguage);
  const hasNimiqProvider = Boolean(globalObject?.nimiq);
  const hasEthereumProvider = typeof globalObject?.ethereum?.request === 'function';
  const isNimiqPay = Boolean(nimiqPay);
  const network = isNimiqPay ? normalizeNetwork(nimiqPay) : 'local';

  return {
    mode: isNimiqPay ? 'nimiq-pay' : 'local-simulated',
    isNimiqPay,
    hasNimiqProvider,
    hasEthereumProvider,
    language,
    network,
    providerStatus: hasNimiqProvider ? 'provider-injected-not-requested' : (isNimiqPay ? 'provider-not-requested' : 'local-fallback'),
    walletOperationsEnabled: false,
    mainnetOperationsEnabled: false,
  };
}

export async function prepareNimiqProvider({
  globalObject = globalThis,
  timeout = 1000,
  initializeProvider = false,
  initProvider = initNimiqMiniApp,
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
    const provider = await initProvider({ timeout });

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

export function createNimiqPocketStatus({
  environment = getMiniAppEnvironment(),
  pocket = {},
  status = environment.providerStatus,
  accounts = [],
  consensusEstablished = null,
  blockNumber = null,
  error = null,
} = {}) {
  const mode = environment.isNimiqPay ? 'nimiq-pay' : 'local-simulated';
  const network = environment.isNimiqPay ? environment.network : 'local';
  const currency = pocket.currency || DEFAULT_POCKET_CURRENCY;
  const amount = normalizePocketAmount(pocket);
  const normalizedAccounts = Array.isArray(accounts) ? accounts.filter(Boolean) : [];
  const isProviderReady = status === 'provider-ready';
  const isUnavailable = status === 'provider-unavailable';
  const isTestnet = network === 'testnet';
  const statusLabel = !environment.isNimiqPay
    ? 'Local fallback pocket'
    : isUnavailable
      ? 'Nimiq Pay status unavailable'
      : isProviderReady && isTestnet
        ? 'Nimiq Pay testnet status'
        : isProviderReady
          ? 'Nimiq Pay status'
          : isTestnet
            ? 'Nimiq Pay testnet detected'
            : 'Nimiq Pay detected';

  return {
    label: pocket.label || 'Nimiq Pocket',
    mode,
    network,
    status,
    statusLabel,
    actionLabel: environment.isNimiqPay ? 'Check' : 'Local',
    amount,
    currency,
    accountsCount: normalizedAccounts.length,
    accountPreview: previewAccount(normalizedAccounts[0]),
    consensusEstablished,
    blockNumber,
    canRequestProvider: environment.isNimiqPay,
    canSend: false,
    canSign: false,
    walletOperationsEnabled: false,
    mainnetOperationsEnabled: false,
    errorMessage: error?.message || null,
  };
}

export async function requestNimiqPocketStatus({
  globalObject = globalThis,
  pocket = {},
  timeout = 1000,
  initializeProvider = false,
  initProvider = initNimiqMiniApp,
} = {}) {
  const prepared = await prepareNimiqProvider({
    globalObject,
    timeout,
    initializeProvider,
    initProvider,
  });

  if (!prepared.provider) {
    return {
      ...prepared,
      pocket: createNimiqPocketStatus({
        environment: prepared.environment,
        pocket,
        status: prepared.status,
        error: prepared.error,
      }),
    };
  }

  try {
    const [accounts, consensusEstablished, blockNumber] = await Promise.all([
      typeof prepared.provider.listAccounts === 'function'
        ? prepared.provider.listAccounts()
        : [],
      typeof prepared.provider.isConsensusEstablished === 'function'
        ? prepared.provider.isConsensusEstablished()
        : null,
      typeof prepared.provider.getBlockNumber === 'function'
        ? prepared.provider.getBlockNumber()
        : null,
    ]);

    return {
      ...prepared,
      pocket: createNimiqPocketStatus({
        environment: prepared.environment,
        pocket,
        status: prepared.status,
        accounts,
        consensusEstablished,
        blockNumber,
      }),
    };
  } catch (error) {
    return {
      environment: {
        ...prepared.environment,
        providerStatus: 'provider-unavailable',
      },
      provider: null,
      status: 'provider-unavailable',
      error,
      pocket: createNimiqPocketStatus({
        environment: prepared.environment,
        pocket,
        status: 'provider-unavailable',
        error,
      }),
    };
  }
}
