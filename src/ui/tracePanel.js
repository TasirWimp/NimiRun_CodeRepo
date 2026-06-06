function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function formatList(items, fallback = 'none', limit = 2) {
  const values = normalizeList(items);

  if (values.length === 0) {
    return fallback;
  }

  const visible = values.slice(0, limit).join(', ');
  const remaining = values.length - limit;

  return remaining > 0 ? `${visible}, +${remaining} more` : visible;
}

function formatLandfallStatus(status) {
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
