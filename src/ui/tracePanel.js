import { FINISH_STATUSES } from '../domain/finishJudgment.js';

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

const GAME_TERM_LABELS = Object.freeze({
  signal_to_support: 'Support depth',
  signal_to_exit: 'Exit friction',
  signal_to_crowd: 'FOMO pressure',
  signal_to_event: 'Event pressure',
  'signal-support-inspected': 'Support checked',
  'exit-friction-inspected': 'Exit checked',
  'fomo-pressure-named': 'FOMO pressure named',
  'futures-gate-context-seen': 'Futures Gate witness',
  'bright-signal': 'Bright Signal',
  'support-check': 'Support Check',
  'exit-friction': 'Exit Friction',
  'fomo-pressure': 'FOMO Pressure',
  'safe-gate': 'Safe Finish',
  'false-gate': 'False Finish',
});

function formatGameTerm(value) {
  if (!value) {
    return null;
  }

  if (GAME_TERM_LABELS[value]) {
    return GAME_TERM_LABELS[value];
  }

  if (/^[a-z0-9_-]+$/i.test(value) && /[-_]/.test(value)) {
    return value
      .split(/[-_]+/)
      .filter(Boolean)
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join(' ');
  }

  return value;
}

function getGameTermPriority(value) {
  const text = formatGameTerm(value).toLowerCase();

  if (/support/.test(text)) {
    return 1;
  }

  if (/exit/.test(text)) {
    return 2;
  }

  if (/fomo|crowd|urgency/.test(text)) {
    return 3;
  }

  if (/event|futures/.test(text)) {
    return 4;
  }

  if (/safe/.test(text)) {
    return 5;
  }

  return 10;
}

function prioritizeGameTerms(values) {
  return [...values].sort((left, right) => {
    const priorityDelta = getGameTermPriority(left) - getGameTermPriority(right);

    return priorityDelta || formatGameTerm(left).localeCompare(formatGameTerm(right));
  });
}

function formatList(items, fallback = 'none', limit = 1) {
  const values = prioritizeGameTerms(normalizeList(items));

  if (values.length === 0) {
    return fallback;
  }

  const visible = values
    .slice(0, limit)
    .map((item) => formatText(formatGameTerm(item), 54))
    .join(', ');
  const remaining = values.length - limit;

  return remaining > 0 ? `${visible}, +${remaining} more` : visible;
}

export function formatLandfallStatus(status) {
  const labels = {
    'open-run': 'Open run',
    'partial-finish': 'Partial finish',
    'safe-finish': 'Safe finish',
    'false-finish': 'False finish',
  };

  return labels[status] || 'Open run';
}

function formatText(value, limit = 72) {
  if (!value) {
    return null;
  }

  return value.length > limit ? `${value.slice(0, limit - 3)}...` : value;
}

export function formatTraceArchiveLabel(traceCards = []) {
  const cards = normalizeList(traceCards);
  const latest = cards.at(-1);

  if (!latest) {
    return 'No trace card yet';
  }

  return `${cards.length} trace card(s) | ${formatLandfallStatus(latest.landfallStatus)}`;
}

function isFinishStatus(status) {
  return [
    FINISH_STATUSES.SAFE,
    FINISH_STATUSES.PARTIAL,
    FINISH_STATUSES.FALSE,
  ].includes(status);
}

function createMoveLine(traceCard) {
  return `Move: ${traceCard.acceptedMove.moveType} -> ${formatGameTerm(
    traceCard.acceptedMove.label || traceCard.acceptedMove.targetNodeId
  )}`;
}

function normalizeReentryNote(note) {
  if (note === 'Run remains open because the goal has not been reached.') {
    return 'Goal not reached; carry trace forward.';
  }

  if (note === 'Run remains open because no finish action has been approved.') {
    return 'Run stays open; inspect before claiming finish.';
  }

  return note;
}

function hasMarketWorldTrace(traceCard) {
  return Boolean(
    normalizeList(traceCard.worldRelationRevealed).length ||
      normalizeList(traceCard.worldRelationsResidualized).length ||
      normalizeList(traceCard.stillUnknown).length ||
      normalizeList(traceCard.finishCheckedRelations).length ||
      normalizeList(traceCard.finishUnresolvedRelations).length ||
      normalizeList(traceCard.sourceWitnessIds).length ||
      traceCard.returnCondition
  );
}

function createWitnessSuffix(traceCard) {
  const witnessCount = normalizeList(traceCard.sourceWitnessIds).length;

  if (witnessCount === 0) {
    return null;
  }

  return `Witness: ${witnessCount} historic source${witnessCount === 1 ? '' : 's'}`;
}

function createCheckedLine(traceCard, { includeWitness = true } = {}) {
  const checked = normalizeList(traceCard.finishCheckedRelations).length
    ? traceCard.finishCheckedRelations
    : traceCard.worldRelationRevealed;
  const witnessSuffix = includeWitness ? createWitnessSuffix(traceCard) : null;

  return [
    `Checked: ${formatList(checked, 'none', 2)}`,
    witnessSuffix,
  ].filter(Boolean).join(' | ');
}

function createStillHiddenLine(traceCard, limit = 2) {
  const stillHidden = normalizeList(traceCard.stillUnknown).length
    ? traceCard.stillUnknown
    : normalizeList(traceCard.finishUnresolvedRelations).length
      ? traceCard.finishUnresolvedRelations
      : traceCard.residueCarriedForward;

  return `Still hidden: ${formatList(stillHidden, 'none', limit)}`;
}

export function createTracePanelContent(traceCard) {
  if (!traceCard) {
    return {
      title: 'Trace Archive',
      lines: ['No trace card yet.'],
    };
  }

  const costParts = [];

  if (traceCard.resourceSpend?.botAttention) {
    costParts.push(`${traceCard.resourceSpend.botAttention} Bot Attention`);
  }

  if (traceCard.resourceSpend?.userGuidance) {
    costParts.push(`${traceCard.resourceSpend.userGuidance} User Guidance`);
  }

  if (traceCard.resourceSpend?.amount != null) {
    costParts.push(`${traceCard.resourceSpend.amount} ${traceCard.resourceSpend.currency || ''}`.trim());
  }

  const valueLabel = traceCard.type === 'pocket' ? 'Pocket' : 'Cost';
  const moveCostLine = [
    createMoveLine(traceCard),
    `${valueLabel}: ${costParts.join(', ') || 'none'}`,
  ].join(' | ');
  const reentryNote = normalizeReentryNote(traceCard.reentryNote);
  const lessonText = formatText(
    traceCard.sessionLesson?.userWords ||
      (traceCard.lessonCandidate?.status === 'promoted'
        ? traceCard.lessonCandidate.userWords
        : null)
  );

  if (hasMarketWorldTrace(traceCard)) {
    return {
      title: `Trace ${traceCard.sequence}: ${formatLandfallStatus(traceCard.landfallStatus)}`,
      lines: [
        moveCostLine,
        createCheckedLine(traceCard),
        createStillHiddenLine(traceCard),
        `Residue: ${formatList(traceCard.residueCarriedForward, 'none', 2)}`,
        `Return: ${formatText(traceCard.returnCondition || reentryNote, 84)}`,
      ],
    };
  }

  const middleLine = lessonText
    ? `Lesson: ${lessonText}`
    : `Not checked: ${formatList(traceCard.suppressedOrNotChecked)}`;

  return {
    title: `Trace ${traceCard.sequence}: ${formatLandfallStatus(traceCard.landfallStatus)}`,
    lines: [
      moveCostLine,
      `Reveal: ${formatList(traceCard.revealed)}`,
      middleLine,
      `Residue: ${formatList(traceCard.residueCarriedForward)}`,
      `Re-entry: ${reentryNote}`,
    ],
  };
}

export function createFinishPanelContent(traceCard, {
  hindsightCard = null,
} = {}) {
  if (!traceCard || !isFinishStatus(traceCard.landfallStatus)) {
    return null;
  }

  const statusLabel = formatLandfallStatus(traceCard.landfallStatus);
  const stillUnknown = normalizeList(traceCard.stillUnknown).length
    ? traceCard.stillUnknown
    : normalizeList(traceCard.finishUnresolvedRelations).length
      ? traceCard.finishUnresolvedRelations
      : traceCard.residueCarriedForward;
  const hindsightUnlocked =
    hindsightCard &&
    hindsightCard.lockedUntilFinish === true &&
    hindsightCard.withheldFromProposalEngine === true;
  const hindsightLine = hindsightUnlocked
    ? `Hindsight: ${formatText(hindsightCard.playerFacingSummary || hindsightCard.patternOutcome, 86)}`
    : 'Hindsight: locked until a finish is recorded.';

  return {
    title: statusLabel,
    lines: [
      formatText(normalizeReentryNote(traceCard.reentryNote), 92) || `${statusLabel} recorded.`,
      createMoveLine(traceCard),
      [
        createCheckedLine(traceCard, { includeWitness: false }),
        `Still hidden: ${formatList(stillUnknown, 'none', 2)}`,
      ].join(' | '),
      formatText(hindsightLine, 92),
      'Not: trading advice',
    ],
  };
}
