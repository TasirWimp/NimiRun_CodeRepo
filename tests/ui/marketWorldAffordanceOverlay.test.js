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
import { createMarketWorldAffordanceDescriptors } from '../../src/ui/marketWorldAffordanceOverlay.js';

function createRuntime() {
  return createMarketWorldRuntimeState(createGoldenSignalMarketWorldRuntimeSeed());
}

function getAction(actionId) {
  return createGoldenSignalMarketWorldRuntimeSeed().arenaSpine.actions[actionId];
}

function descriptorsFor(renderPlan) {
  return Object.fromEntries(
    createMarketWorldAffordanceDescriptors(renderPlan).map((descriptor) => [
      descriptor.key,
      descriptor,
    ])
  );
}

describe('market world affordance overlay descriptors', () => {
  it('turns the opening render plan into player-facing overlay descriptors', () => {
    const descriptors = descriptorsFor(
      createMarketWorldRenderPlan({
        runtimeState: createRuntime(),
      })
    );

    expect(descriptors.goldenSignal).toMatchObject({
      nodeId: 'bright-signal',
      state: 'tempting',
      label: 'Bright pull',
    });
    expect(descriptors.supportWell).toMatchObject({
      nodeId: 'support-check',
      state: 'hidden',
      label: 'Support unseen',
    });
    expect(descriptors.exitBridge).toMatchObject({
      nodeId: 'exit-friction',
      state: 'hidden',
      label: 'Exit fog',
    });
    expect(descriptors.finishGate).toMatchObject({
      nodeId: 'safe-gate',
      state: 'open',
      label: 'Finish locked',
    });
  });

  it('turns Ask Hidden residue into hinted support, exit, and event overlays', () => {
    const named = nameMarketWorldUnknowns(
      createRuntime(),
      getAction(MARKET_WORLD_ACTIONS.ASK_REMAINING_UNKNOWN)
    );
    const descriptors = descriptorsFor(
      createMarketWorldRenderPlan({
        runtimeState: named.runtimeState,
      })
    );

    expect(descriptors.supportWell).toMatchObject({
      state: 'hinted',
      label: 'Support?',
    });
    expect(descriptors.exitBridge).toMatchObject({
      state: 'hinted',
      label: 'Exit?',
    });
    expect(descriptors.eventGate).toMatchObject({
      state: 'hinted',
      label: 'Event?',
    });
  });

  it('turns approved Wide Scan into active crowd pressure without CRPM wording', () => {
    const approved = approveMarketWorldAction(
      createRuntime(),
      getAction(MARKET_WORLD_ACTIONS.WIDE_SCAN)
    );
    const descriptors = descriptorsFor(
      createMarketWorldRenderPlan({
        runtimeState: approved.runtimeState,
      })
    );

    expect(descriptors.crowdPressure).toMatchObject({
      nodeId: 'fomo-pressure',
      state: 'active',
      label: 'Crowd pressure',
    });

    const labels = Object.values(descriptors).map((descriptor) => descriptor.label).join(' ');
    expect(labels).not.toMatch(/CRPM|cut|landfall|source-ocean|v0|v1|v2|v3/i);
  });

  it('anchors false finish pressure on the false gate and safe finish on the safe gate', () => {
    const falseDescriptors = descriptorsFor(
      createMarketWorldRenderPlan({
        runtimeState: createRuntime(),
        finishJudgment: { status: FINISH_STATUSES.FALSE },
      })
    );
    const safeDescriptors = descriptorsFor(
      createMarketWorldRenderPlan({
        runtimeState: createRuntime(),
        finishJudgment: { status: FINISH_STATUSES.SAFE },
      })
    );

    expect(falseDescriptors.finishGate).toMatchObject({
      nodeId: 'false-gate',
      state: 'false',
      label: 'False finish',
    });
    expect(safeDescriptors.finishGate).toMatchObject({
      nodeId: 'safe-gate',
      state: 'safe',
      label: 'Safe finish',
    });
  });
});
