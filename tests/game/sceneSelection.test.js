import { describe, expect, it } from 'vitest';

import {
  createSceneList,
  isV2DecisionSceneRequested,
} from '../../src/game/sceneSelection.js';

class V1Scene {}
class V2Scene {}
class StreetScene {}

describe('scene selection', () => {
  it('keeps V1 first by default', () => {
    expect(isV2DecisionSceneRequested('')).toBe(false);
    expect(isV2DecisionSceneRequested('?v2=0')).toBe(false);
    expect(createSceneList({
      PocketBotWorkshop: V1Scene,
      PocketBotWorkshopV2: V2Scene,
      SideScrollerScene: StreetScene,
    })).toEqual([V1Scene, V2Scene, StreetScene]);
  });

  it('puts V2 first only when requested by query flag', () => {
    expect(isV2DecisionSceneRequested('?v2=1')).toBe(true);
    expect(createSceneList({
      useV2: true,
      PocketBotWorkshop: V1Scene,
      PocketBotWorkshopV2: V2Scene,
      SideScrollerScene: StreetScene,
    })).toEqual([V2Scene, V1Scene, StreetScene]);
  });
});
