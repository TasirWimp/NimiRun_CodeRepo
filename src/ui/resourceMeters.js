export function formatNimiqAmount(amount, currency = 'NIM') {
  const numericAmount = Number(amount);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

  return `${safeAmount.toFixed(0)} ${currency || 'NIM'}`;
}

export function createNimiqPocketDisplay(pocketStatus = {}) {
  const value = formatNimiqAmount(pocketStatus.amount, pocketStatus.currency);
  const network = pocketStatus.network && pocketStatus.network !== 'unknown'
    ? pocketStatus.network
    : 'network unknown';

  if (pocketStatus.errorMessage) {
    return {
      value,
      status: `${pocketStatus.statusLabel || 'Nimiq Pay status unavailable'} | ${pocketStatus.errorMessage}`,
      actionLabel: pocketStatus.actionLabel || 'Check',
    };
  }

  if (pocketStatus.mode === 'local-simulated') {
    return {
      value,
      status: 'Local fallback | no wallet access',
      actionLabel: pocketStatus.actionLabel || 'Local',
    };
  }

  if (pocketStatus.status === 'provider-ready') {
    const account = pocketStatus.accountPreview || `${pocketStatus.accountsCount || 0} account(s)`;
    const consensus = pocketStatus.consensusEstablished === true && pocketStatus.blockNumber != null
      ? `block ${pocketStatus.blockNumber}`
      : 'status checked';

    return {
      value,
      status: `${pocketStatus.statusLabel || 'Nimiq Pay status'} | ${account} | ${consensus}`,
      actionLabel: pocketStatus.actionLabel || 'Check',
    };
  }

  return {
    value,
    status: `${pocketStatus.statusLabel || 'Nimiq Pay detected'} | ${network}`,
    actionLabel: pocketStatus.actionLabel || 'Check',
  };
}
