import { FINISH_STATUSES } from '../domain/finishJudgment.js';

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function formatList(items, fallback = 'none', limit = 1) {
  const values = normalizeList(items);

  if (values.length === 0) {
    return fallback;
  }

  const visible = values.slice(0, limit).map((item) => formatText(item, 54)).join(', ');
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
  return `Move: ${traceCard.acceptedMove.moveType} -> ${
    traceCard.acceptedMove.label || traceCard.acceptedMove.targetNodeId
  }`;
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
    `Move: ${traceCard.acceptedMove.moveType} -> ${traceCard.acceptedMove.label || traceCard.acceptedMove.targetNodeId}`,
    `${valueLabel}: ${costParts.join(', ') || 'none'}`,
  ].join(' | ');
  const reentryNote =
    traceCard.reentryNote === 'Run remains open because the goal has not been reached.'
      ? 'Goal not reached; carry trace forward.'
      : traceCard.reentryNote;
  const lessonText = formatText(
    traceCard.sessionLesson?.userWords ||
      (traceCard.lessonCandidate?.status === 'promoted'
        ? traceCard.lessonCandidate.userWords
        : null)
  );
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
    : traceCard.residueCarriedForward;
  const checkedRelations = [
    ...normalizeList(traceCard.worldRelationRevealed),
    ...normalizeList(traceCard.revealed),
  ];
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
      formatText(traceCard.reentryNote, 94) || `${statusLabel} recorded.`,
      createMoveLine(traceCard),
      `Checked: ${formatList(checkedRelations, 'none', 2)}`,
      `Still hidden: ${formatList(stillUnknown, 'none', 2)}`,
      hindsightLine,
      'Not: trading advice',
    ],
  };
}
