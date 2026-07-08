export function isV2DecisionSceneRequested(search = '') {
  return new URLSearchParams(search || '').get('v2') === '1';
}

export function isV2WorldSceneRequested(search = '') {
  return new URLSearchParams(search || '').get('v2') === 'world';
}

export function createSceneList({
  useV2 = false,
  useV2World = false,
  PocketBotWorkshop,
  PocketBotWorkshopV2,
  PocketBotTrainingWorld,
  SideScrollerScene,
} = {}) {
  const fallbackScenes = [PocketBotWorkshop, SideScrollerScene].filter(Boolean);
  const allScenes = [
    PocketBotWorkshop,
    PocketBotWorkshopV2,
    PocketBotTrainingWorld,
    SideScrollerScene,
  ].filter(Boolean);

  if (!PocketBotWorkshopV2) {
    return fallbackScenes;
  }

  if (useV2World && PocketBotTrainingWorld) {
    return [
      PocketBotTrainingWorld,
      ...allScenes.filter((Scene) => Scene !== PocketBotTrainingWorld),
    ];
  }

  return useV2
    ? [PocketBotWorkshopV2, PocketBotWorkshop, SideScrollerScene].filter(Boolean)
    : [PocketBotWorkshop, PocketBotWorkshopV2, SideScrollerScene].filter(Boolean);
}
