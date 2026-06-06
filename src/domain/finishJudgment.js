export const FINISH_STATUSES = Object.freeze({
  SAFE: 'safe-finish',
  PARTIAL: 'partial-finish',
  FALSE: 'false-finish',
  OPEN: 'open-run',
});

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function getRequiredEvidence(protectedOutcomes = []) {
  return protectedOutcomes.flatMap((outcome) => normalizeList(outcome.requiredEvidence));
}

function getMissingEvidence(requiredEvidence, evidence) {
  const evidenceSet = new Set(normalizeList(evidence));

  return requiredEvidence.filter((item) => !evidenceSet.has(item));
}

export function createFinishJudgment({
  goalReached = false,
  declaredComplete = false,
  protectedOutcomes = [],
  evidence = [],
  residue = [],
  remainingUnknowns = [],
  note = null,
} = {}) {
  const requiredEvidence = getRequiredEvidence(protectedOutcomes);
  const missingEvidence = getMissingEvidence(requiredEvidence, evidence);
  const activeResidue = normalizeList(residue);
  const activeUnknowns = normalizeList(remainingUnknowns);

  if (!goalReached) {
    return {
      status: FINISH_STATUSES.OPEN,
      goalReached: false,
      declaredComplete: false,
      missingEvidence,
      residue: activeResidue,
      remainingUnknowns: activeUnknowns,
      note: note || 'Run remains open because the goal has not been reached.',
    };
  }

  if (declaredComplete && (missingEvidence.length > 0 || activeResidue.length > 0 || activeUnknowns.length > 0)) {
    return {
      status: FINISH_STATUSES.FALSE,
      goalReached: true,
      declaredComplete: true,
      missingEvidence,
      residue: activeResidue,
      remainingUnknowns: activeUnknowns,
      note: note || 'Goal-looking state is false finish because protected evidence or residue remains unresolved.',
    };
  }

  if (missingEvidence.length > 0 || activeResidue.length > 0 || activeUnknowns.length > 0) {
    return {
      status: FINISH_STATUSES.PARTIAL,
      goalReached: true,
      declaredComplete: false,
      missingEvidence,
      residue: activeResidue,
      remainingUnknowns: activeUnknowns,
      note: note || 'Goal was reached only partially because evidence or residue remains unresolved.',
    };
  }

  return {
    status: FINISH_STATUSES.SAFE,
    goalReached: true,
    declaredComplete: true,
    missingEvidence: [],
    residue: [],
    remainingUnknowns: [],
    note: note || 'Safe finish: required evidence is present and no unresolved residue remains.',
  };
}

