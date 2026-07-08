import { describe, expect, it } from 'vitest';

import {
  createSceneList,
  isV2DecisionSceneRequested,
  isV2WorldSceneRequested,
} from '../../src/game/sceneSelection.js';

class V1Scene {}
class V2Scene {}
class V2WorldScene {}
class StreetScene {}

describe('scene selection', () => {
  it('keeps V1 first by default', () => {
    expect(isV2DecisionSceneRequested('')).toBe(false);
    expect(isV2DecisionSceneRequested('?v2=0')).toBe(false);
    expect(createSceneList({
      PocketBotWorkshop: V1Scene,
      PocketBotWorkshopV2: V2Scene,
      PocketBotTrainingWorld: V2WorldScene,
      SideScrollerScene: StreetScene,
    })).toEqual([V1Scene, V2Scene, StreetScene]);
  });

  it('puts V2 first only when requested by query flag', () => {
    expect(isV2DecisionSceneRequested('?v2=1')).toBe(true);
    expect(createSceneList({
      useV2: true,
      PocketBotWorkshop: V1Scene,
      PocketBotWorkshopV2: V2Scene,
      PocketBotTrainingWorld: V2WorldScene,
      SideScrollerScene: StreetScene,
    })).toEqual([V2Scene, V1Scene, StreetScene]);
  });

  it('puts the experimental RPG world first only when requested', () => {
    expect(isV2WorldSceneRequested('?v2=world')).toBe(true);
    expect(isV2DecisionSceneRequested('?v2=world')).toBe(false);
    expect(createSceneList({
      useV2World: true,
      PocketBotWorkshop: V1Scene,
      PocketBotWorkshopV2: V2Scene,
      PocketBotTrainingWorld: V2WorldScene,
      SideScrollerScene: StreetScene,
    })).toEqual([V2WorldScene, V1Scene, V2Scene, StreetScene]);
  });
});
