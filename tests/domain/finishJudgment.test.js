import { describe, expect, it } from 'vitest';

import { FINISH_STATUSES, createFinishJudgment } from '../../src/domain/finishJudgment.js';

const protectedOutcomes = [
  {
    id: 'safe-finish-requires-warning-and-clue',
    requiredEvidence: ['warning-inspected', 'critical-clue-held'],
  },
];

describe('finish judgment', () => {
  it('keeps the run open when the goal has not been reached', () => {
    const judgment = createFinishJudgment({
      goalReached: false,
      protectedOutcomes,
      evidence: ['warning-inspected'],
      residue: ['critical clue missing'],
    });

    expect(judgment).toMatchObject({
      status: FINISH_STATUSES.OPEN,
      goalReached: false,
      missingEvidence: ['critical-clue-held'],
    });
  });

  it('classifies a safe finish only when required evidence and residue are clear', () => {
    const judgment = createFinishJudgment({
      goalReached: true,
      declaredComplete: true,
      protectedOutcomes,
      evidence: ['warning-inspected', 'critical-clue-held'],
      residue: [],
      remainingUnknowns: [],
    });

    expect(judgment).toMatchObject({
      status: FINISH_STATUSES.SAFE,
      missingEvidence: [],
      residue: [],
    });
  });

  it('classifies a false finish when completion is claimed with missing evidence', () => {
    const judgment = createFinishJudgment({
      goalReached: true,
      declaredComplete: true,
      protectedOutcomes,
      evidence: ['warning-inspected'],
      residue: ['shortcut cost unresolved'],
    });

    expect(judgment).toMatchObject({
      status: FINISH_STATUSES.FALSE,
      goalReached: true,
      declaredComplete: true,
      missingEvidence: ['critical-clue-held'],
      residue: ['shortcut cost unresolved'],
    });
  });

  it('classifies a partial finish when the goal is reached without a completion claim', () => {
    const judgment = createFinishJudgment({
      goalReached: true,
      declaredComplete: false,
      protectedOutcomes,
      evidence: ['warning-inspected'],
      remainingUnknowns: ['critical clue held?'],
    });

    expect(judgment).toMatchObject({
      status: FINISH_STATUSES.PARTIAL,
      remainingUnknowns: ['critical clue held?'],
    });
  });
});

