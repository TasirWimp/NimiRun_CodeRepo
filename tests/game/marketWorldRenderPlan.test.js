import { describe, expect, it } from 'vitest';

import { FINISH_STATUSES } from '../../src/domain/finishJudgment.js';
import {
  approveMarketWorldAction,
  createMarketWorldRuntimeState,
  nameMarketWorldUnknowns,
} from '../../src/domain/marketWorldRuntime.js';
import { createGoldenSignalMarketWorldRuntimeSeed } from '../../src/game/scenarios/marketWorldLevelAdapter.js';
import { MARKET_WORLD_ACTIONS } from '../../src/game/scenarios/marketWorldLevels.js';
import { createMarketWorldRenderPlan } from '../../src/game/scenarios/marketWorldRenderPlan.js';

function createRuntime() {
  return createMarketWorldRuntimeState(createGoldenSignalMarketWorldRuntimeSeed());
}

function getAction(actionId) {
  return createGoldenSignalMarketWorldRuntimeSeed().arenaSpine.actions[actionId];
}

describe('market world render plan', () => {
  it('maps opening Golden Signal state to simple world affordances', () => {
    const plan = createMarketWorldRenderPlan({
      runtimeState: createRuntime(),
    });

    expect(plan.surfaces).toMatchObject({
      goldenSignal: { state: 'tempting' },
      supportWell: { state: 'hidden', relationStatus: 'hidden' },
      exitBridge: { state: 'hidden', relationStatus: 'hidden' },
      crowdPressure: { state: 'visible', relationStatus: 'visible' },
      eventGate: { state: 'visible', relationStatus: 'hidden' },
      traceMemory: { state: 'empty', traceCount: 0 },
      finishGate: { state: 'open', finishStatus: FINISH_STATUSES.OPEN },
    });
  });

  it('maps Ask Hidden residue to hinted hidden surfaces without trace memory', () => {
    const named = nameMarketWorldUnknowns(
      createRuntime(),
      getAction(MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN)
    );
    const plan = createMarketWorldRenderPlan({
      runtimeState: named.runtimeState,
    });

    expect(plan.surfaces.supportWell).toMatchObject({
      state: 'hinted',
      relationStatus: 'residualized',
    });
    expect(plan.surfaces.exitBridge).toMatchObject({
      state: 'hinted',
      relationStatus: 'residualized',
    });
    expect(plan.surfaces.eventGate).toMatchObject({
      state: 'hinted',
      relationStatus: 'residualized',
    });
    expect(plan.surfaces.traceMemory).toMatchObject({
      state: 'empty',
      traceCount: 0,
    });
  });

  it('maps approved Wide Scan to active crowd pressure and carried residue', () => {
    const approved = approveMarketWorldAction(
      createRuntime(),
      getAction(MARKET_WORLD_ACTIONS.WIDE_SCAN)
    );
    const plan = createMarketWorldRenderPlan({
      runtimeState: approved.runtimeState,
    });

    expect(plan.surfaces.crowdPressure).toMatchObject({
      state: 'active',
      relationStatus: 'revealed',
    });
    expect(plan.surfaces.supportWell).toMatchObject({
      state: 'hinted',
      relationStatus: 'residualized',
    });
    expect(plan.surfaces.exitBridge).toMatchObject({
      state: 'hinted',
      relationStatus: 'residualized',
    });
  });

  it('maps approved Check Exit and Support Check to distinct world surfaces', () => {
    const exit = approveMarketWorldAction(
      createRuntime(),
      getAction(MARKET_WORLD_ACTIONS.CHECK_EXIT)
    );
    const exitPlan = createMarketWorldRenderPlan({
      runtimeState: exit.runtimeState,
    });

    expect(exitPlan.surfaces.exitBridge).toMatchObject({
      state: 'revealed',
      relationStatus: 'revealed',
    });
    expect(exitPlan.surfaces.supportWell).toMatchObject({
      state: 'hinted',
      relationStatus: 'residualized',
    });

    const support = approveMarketWorldAction(
      createRuntime(),
      getAction(MARKET_WORLD_ACTIONS.CHECK_SUPPORT)
    );
    const supportPlan = createMarketWorldRenderPlan({
      runtimeState: support.runtimeState,
    });

    expect(supportPlan.surfaces.supportWell).toMatchObject({
      state: 'stable',
      relationStatus: 'revealed',
    });
    expect(supportPlan.surfaces.exitBridge).toMatchObject({
      state: 'hinted',
      relationStatus: 'residualized',
    });
  });

  it.each([
    [FINISH_STATUSES.OPEN, 'open'],
    [FINISH_STATUSES.FALSE, 'false'],
    [FINISH_STATUSES.PARTIAL, 'partial'],
    [FINISH_STATUSES.SAFE, 'safe'],
  ])('maps %s finish judgment to %s finish gate', (finishStatus, renderState) => {
    const plan = createMarketWorldRenderPlan({
      runtimeState: createRuntime(),
      finishJudgment: { status: finishStatus },
    });

    expect(plan.surfaces.finishGate).toMatchObject({
      state: renderState,
      finishStatus,
    });
  });

  it('maps trace cards to empty, active, and residue-carrier memory states', () => {
    expect(
      createMarketWorldRenderPlan({
        runtimeState: createRuntime(),
      }).surfaces.traceMemory
    ).toMatchObject({ state: 'empty', traceCount: 0 });

    expect(
      createMarketWorldRenderPlan({
        runtimeState: createRuntime(),
        traceCards: [{ landfallStatus: FINISH_STATUSES.OPEN, residue: [] }],
      }).surfaces.traceMemory
    ).toMatchObject({ state: 'active', traceCount: 1 });

    expect(
      createMarketWorldRenderPlan({
        runtimeState: createRuntime(),
        traceCards: [{ landfallStatus: FINISH_STATUSES.PARTIAL, residue: ['exit unknown'] }],
      }).surfaces.traceMemory
    ).toMatchObject({ state: 'residue-carrier', traceCount: 1 });
  });
});
