import { describe, expect, it } from 'vitest';

import {
  createMarketWorldFinishJudgment,
  MARKET_WORLD_RUNTIME_RELATION_STATUS,
  approveMarketWorldAction,
  createMarketWorldRuntimeState,
  nameMarketWorldUnknowns,
  prepareMarketWorldAction,
  serializeMarketWorldRuntimeForProposalContext,
} from '../../src/domain/marketWorldRuntime.js';
import { FINISH_STATUSES } from '../../src/domain/finishJudgment.js';
import { createGoldenSignalMarketWorldRuntimeSeed } from '../../src/game/scenarios/marketWorldLevelAdapter.js';
import { MARKET_WORLD_ACTIONS } from '../../src/game/scenarios/marketWorldLevels.js';

function createRuntime() {
  return createMarketWorldRuntimeState(createGoldenSignalMarketWorldRuntimeSeed());
}

function getAction(actionId) {
  return createGoldenSignalMarketWorldRuntimeSeed().arenaSpine.actions[actionId];
}

describe('market world runtime relation state', () => {
  it('initializes relation states from the adapter seed', () => {
    const runtime = createRuntime();

    expect(runtime.relationStates.signal_to_support.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.HIDDEN
    );
    expect(runtime.relationStates.signal_to_exit.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.HIDDEN
    );
    expect(runtime.relationStates.signal_to_event.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.HIDDEN
    );
    expect(runtime.relationStates.signal_to_crowd.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.VISIBLE
    );
    expect(runtime.pendingArenaAction).toBeNull();
    expect(runtime.actionHistory).toEqual([]);
  });

  it('names hidden unknowns as residualized without revealing them', () => {
    const result = nameMarketWorldUnknowns(
      createRuntime(),
      getAction(MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN)
    );

    expect(result.transition).toMatchObject({
      phase: 'unknowns-named',
      actionId: MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN,
      worldRelationRevealed: [],
      worldRelationsResidualized: [
        'signal_to_support',
        'signal_to_exit',
        'signal_to_event',
      ],
    });
    expect(result.runtimeState.relationStates.signal_to_support.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED
    );
    expect(result.runtimeState.relationStates.signal_to_exit.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED
    );
    expect(result.runtimeState.relationStates.signal_to_event.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED
    );
    expect(result.runtimeState.relationStates.signal_to_crowd.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.VISIBLE
    );
  });

  it('prepares Wide Scan without mutating relation status, then approval reveals crowd pressure', () => {
    const action = getAction(MARKET_WORLD_ACTIONS.WIDE_SCAN);
    const prepared = prepareMarketWorldAction(createRuntime(), action);

    expect(prepared.transition).toMatchObject({
      phase: 'prepared',
      actionId: MARKET_WORLD_ACTIONS.WIDE_SCAN,
      worldRelationRevealed: [],
      worldRelationsResidualized: [],
    });
    expect(prepared.runtimeState.pendingArenaAction).toMatchObject({
      id: MARKET_WORLD_ACTIONS.WIDE_SCAN,
      moveType: 'inspect',
      targetNodeId: 'fomo-pressure',
    });
    expect(prepared.runtimeState.relationStates.signal_to_crowd.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.VISIBLE
    );

    const approved = approveMarketWorldAction(prepared.runtimeState, action);

    expect(approved.transition).toMatchObject({
      phase: 'approved',
      actionId: MARKET_WORLD_ACTIONS.WIDE_SCAN,
      worldRelationRevealed: ['signal_to_crowd'],
      worldRelationsResidualized: ['signal_to_exit', 'signal_to_support'],
      returnCondition: 'Stop after the wide scan reveal; do not call the route safe yet.',
    });
    expect(approved.runtimeState.pendingArenaAction).toBeNull();
    expect(approved.runtimeState.relationStates.signal_to_crowd.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.REVEALED
    );
    expect(approved.runtimeState.relationStates.signal_to_exit.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED
    );
    expect(approved.runtimeState.relationStates.signal_to_support.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED
    );
  });

  it('reveals exit friction and preserves event/support residue on Check Exit approval', () => {
    const action = getAction(MARKET_WORLD_ACTIONS.CHECK_EXIT);
    const approved = approveMarketWorldAction(createRuntime(), action);

    expect(approved.transition).toMatchObject({
      phase: 'approved',
      actionId: MARKET_WORLD_ACTIONS.CHECK_EXIT,
      worldRelationRevealed: ['signal_to_exit'],
      worldRelationsResidualized: ['signal_to_support', 'signal_to_event'],
    });
    expect(approved.runtimeState.relationStates.signal_to_exit.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.REVEALED
    );
    expect(approved.runtimeState.relationStates.signal_to_support.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED
    );
    expect(approved.runtimeState.relationStates.signal_to_event.status).toBe(
      MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED
    );
  });

  it('residualizes unchecked relations when approving enter', () => {
    const approved = approveMarketWorldAction(
      createRuntime(),
      getAction(MARKET_WORLD_ACTIONS.APPROVE_ENTER)
    );

    expect(approved.transition).toMatchObject({
      phase: 'approved',
      actionId: MARKET_WORLD_ACTIONS.APPROVE_ENTER,
      worldRelationRevealed: [],
      worldRelationsResidualized: [
        'signal_to_support',
        'signal_to_exit',
        'signal_to_event',
      ],
      finishPressureDelta: {
        falseFinishRisk: 'up',
        partialFinishAvailable: false,
        safeFinishPossible: false,
      },
    });
  });

  it('classifies direct enter as false finish when protected relations were hidden before entry', () => {
    const start = createRuntime();
    const action = getAction(MARKET_WORLD_ACTIONS.APPROVE_ENTER);
    const approved = approveMarketWorldAction(start, action);
    const judgment = createMarketWorldFinishJudgment({
      previousRuntimeState: start,
      runtimeState: approved.runtimeState,
      action,
      mapState: {
        contract: {
          protectedOutcomes: [
            {
              requiredEvidence: [
                'signal-support-inspected',
                'exit-friction-inspected',
                'fomo-pressure-named',
              ],
            },
          ],
        },
      },
    });

    expect(judgment).toMatchObject({
      status: FINISH_STATUSES.FALSE,
      source: 'market-world-relations',
      missingEvidence: [
        'signal-support-inspected',
        'exit-friction-inspected',
        'fomo-pressure-named',
      ],
      unresolvedRelations: [
        'signal_to_support',
        'signal_to_exit',
        'signal_to_crowd',
      ],
    });
    expect(judgment.note).toContain('False finish');
  });

  it('classifies enter as partial finish when residue was named or one major relation was checked', () => {
    const asked = nameMarketWorldUnknowns(
      createRuntime(),
      getAction(MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN)
    );
    const action = getAction(MARKET_WORLD_ACTIONS.APPROVE_ENTER);
    const approved = approveMarketWorldAction(asked.runtimeState, action);
    const judgment = createMarketWorldFinishJudgment({
      previousRuntimeState: asked.runtimeState,
      runtimeState: approved.runtimeState,
      action,
    });

    expect(judgment).toMatchObject({
      status: FINISH_STATUSES.PARTIAL,
      source: 'market-world-relations',
      missingEvidence: [
        'signal-support-inspected',
        'exit-friction-inspected',
        'fomo-pressure-named',
      ],
    });
    expect(judgment.note).toContain('Partial finish');
  });

  it('classifies enter as safe finish when support, exit, and crowd were checked first', () => {
    const support = approveMarketWorldAction(
      createRuntime(),
      getAction(MARKET_WORLD_ACTIONS.CHECK_SUPPORT)
    );
    const exit = approveMarketWorldAction(
      support.runtimeState,
      getAction(MARKET_WORLD_ACTIONS.CHECK_EXIT)
    );
    const wide = approveMarketWorldAction(
      exit.runtimeState,
      getAction(MARKET_WORLD_ACTIONS.WIDE_SCAN)
    );
    const action = getAction(MARKET_WORLD_ACTIONS.APPROVE_ENTER);
    const approved = approveMarketWorldAction(wide.runtimeState, action);
    const judgment = createMarketWorldFinishJudgment({
      previousRuntimeState: wide.runtimeState,
      runtimeState: approved.runtimeState,
      action,
    });

    expect(judgment).toMatchObject({
      status: FINISH_STATUSES.SAFE,
      source: 'market-world-relations',
      missingEvidence: [],
      unresolvedRelations: [],
      checkedRelations: [
        'signal_to_support',
        'signal_to_exit',
        'signal_to_crowd',
      ],
    });
  });

  it('keeps non-finish relation moves open', () => {
    const action = getAction(MARKET_WORLD_ACTIONS.WIDE_SCAN);
    const approved = approveMarketWorldAction(createRuntime(), action);
    const judgment = createMarketWorldFinishJudgment({
      previousRuntimeState: createRuntime(),
      runtimeState: approved.runtimeState,
      action,
    });

    expect(judgment).toMatchObject({
      status: FINISH_STATUSES.OPEN,
      source: 'market-world-relations',
      goalReached: false,
    });
  });

  it('serializes current relation state without hindsight data', () => {
    const approved = approveMarketWorldAction(
      createRuntime(),
      getAction(MARKET_WORLD_ACTIONS.WIDE_SCAN)
    );
    const context = serializeMarketWorldRuntimeForProposalContext(approved.runtimeState);
    const contextText = JSON.stringify(context);

    expect(context).toMatchObject({
      source_level_id: 'level_02_golden_signal',
      relation_statuses: {
        signal_to_crowd: MARKET_WORLD_RUNTIME_RELATION_STATUS.REVEALED,
        signal_to_exit: MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED,
        signal_to_support: MARKET_WORLD_RUNTIME_RELATION_STATUS.RESIDUALIZED,
      },
      last_transition: {
        action_id: MARKET_WORLD_ACTIONS.WIDE_SCAN,
        world_relation_revealed: ['signal_to_crowd'],
      },
    });
    expect(contextText).not.toMatch(/hindsight|terminal|patternOutcome|landfallRisk/i);
  });
});
