const SOURCE_FIXTURE_STATUSES = Object.freeze({
  ADOPTED_STATIC_FIXTURE: 'adopted_static_fixture',
  PLANNED_FIXTURE_REQUIRED: 'planned_fixture_required',
  BLOCKED_UNTIL_REVIEW: 'blocked_until_review',
});

const STATUS_LABELS = Object.freeze({
  [SOURCE_FIXTURE_STATUSES.ADOPTED_STATIC_FIXTURE]: 'adopted fixture',
  [SOURCE_FIXTURE_STATUSES.PLANNED_FIXTURE_REQUIRED]: 'fixture planned',
  [SOURCE_FIXTURE_STATUSES.BLOCKED_UNTIL_REVIEW]: 'review required',
});

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function formatLayer(value) {
  const words = String(value || '')
    .split('_')
    .filter(Boolean);

  if (words.length === 0) {
    return '';
  }

  return [
    words[0].charAt(0).toUpperCase() + words[0].slice(1),
    ...words.slice(1),
  ].join(' ');
}

function formatLayerList(values = []) {
  return normalizeList(values).map(formatLayer).join(' / ');
}

function formatDate(value) {
  if (!value) {
    return null;
  }

  const date = String(value).slice(0, 10);

  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : value;
}

function firstItems(values = [], limit = 2) {
  return normalizeList(values).slice(0, limit);
}

function getActionId({ runtimeState, actionId }) {
  return actionId || runtimeState?.lastTransition?.actionId || null;
}

function getPhase({ runtimeState, phase }) {
  return phase || runtimeState?.lastTransition?.phase || 'current';
}

function getAction(runtimeSeed, actionId) {
  return runtimeSeed?.arenaSpine?.actions?.[actionId] || null;
}

function getResponse(runtimeSeed, actionId) {
  return runtimeSeed?.actionResponses?.[actionId] || null;
}

function createSourceLine(response) {
  const basis = response?.sourceWitnessBasis || {};
  const current = firstItems(basis.current, 2);

  if (basis.status === SOURCE_FIXTURE_STATUSES.ADOPTED_STATIC_FIXTURE) {
    return `Source: ${current.join('; ')}.`;
  }

  if (basis.status === SOURCE_FIXTURE_STATUSES.PLANNED_FIXTURE_REQUIRED) {
    return 'Source gate: planned GDELT/Wikimedia fixtures are not claimed yet.';
  }

  if (basis.status === SOURCE_FIXTURE_STATUSES.BLOCKED_UNTIL_REVIEW) {
    return 'Source gate: Coin Metrics remains blocked until review.';
  }

  if (current.length > 0) {
    return `Source: ${current.join('; ')}.`;
  }

  return `Source status: ${STATUS_LABELS[basis.status] || 'declared in level contract'}.`;
}

function createPhaseLines({ response, phase }) {
  if (phase === 'prepared') {
    return [
      ...firstItems(response.prepareVisual).map((line) => `Before spend: ${line}`),
      'Approve controls Bot Attention spending.',
    ];
  }

  if (phase === 'unknowns-named') {
    return [
      'No Bot Attention spent.',
      ...firstItems(response.revealResult, 3).map((line) => `Revealed: ${line}`),
    ];
  }

  if (phase === 'approved') {
    return [
      ...firstItems(response.approveVisual).map((line) => `After spend: ${line}`),
      ...firstItems(response.revealResult).map((line) => `Revealed: ${line}`),
    ];
  }

  return firstItems(response.revealResult).map((line) => `World response: ${line}`);
}

function createResidueLines(transition) {
  const stillUnknown = firstItems(transition?.stillUnknown, 2);

  if (stillUnknown.length === 0) {
    return [];
  }

  return [`Still unknown: ${stillUnknown.join('; ')}`];
}

function createDoesNotProveLines(response) {
  const limits = firstItems(response.doesNotProve, 3);

  if (limits.length === 0) {
    return [];
  }

  return [`Does not prove: ${limits.join('; ')}`];
}

function createRuntimeMutationLines(response, phase) {
  if (phase === 'prepared') {
    return [];
  }

  return firstItems(response.runtimeMutation, 1).map((line) => `Runtime reflected: ${line}`);
}

function createTitle(action, phase) {
  const label = action?.label || 'World Action';

  if (phase === 'prepared') {
    return `${label} Prepared`;
  }

  return `${label} Response`;
}

function createOverlayTone(actionId, phase) {
  if (phase === 'prepared') {
    return 'blue';
  }

  if (actionId === 'check_exit') {
    return 'red';
  }

  if (actionId === 'check_support') {
    return 'green';
  }

  if (actionId === 'wide_scan') {
    return 'purple';
  }

  return 'gold';
}

export function createMarketWorldActionResponsePanel({
  runtimeSeed = null,
  runtimeState = null,
  actionId = null,
  phase = null,
} = {}) {
  const resolvedActionId = getActionId({ runtimeState, actionId });
  const resolvedPhase = getPhase({ runtimeState, phase });
  const action = getAction(runtimeSeed, resolvedActionId);
  const response = getResponse(runtimeSeed, resolvedActionId);
  const transition = runtimeState?.lastTransition || null;
  const asOf = formatDate(runtimeSeed?.timeWindow?.asOfTime);

  if (!action || !response) {
    return null;
  }

  const lines = [
    `World layer: ${formatLayerList(response.targetLayers)}`,
    asOf ? `As-of: ${asOf}` : null,
    createSourceLine(response),
    ...createPhaseLines({ response, phase: resolvedPhase }),
    ...createResidueLines(transition),
    ...createDoesNotProveLines(response),
    ...createRuntimeMutationLines(response, resolvedPhase),
  ].filter(Boolean);

  return {
    title: createTitle(action, resolvedPhase),
    actionId: resolvedActionId,
    phase: resolvedPhase,
    targetNodeId: action.targetNodeId || null,
    sourceStatus: response.sourceWitnessBasis?.status || null,
    tone: createOverlayTone(resolvedActionId, resolvedPhase),
    lines,
  };
}
