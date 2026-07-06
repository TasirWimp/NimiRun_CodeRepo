export function isV2DecisionSceneRequested(search = '') {
  return new URLSearchParams(search || '').get('v2') === '1';
}

export function createSceneList({
  useV2 = false,
  PocketBotWorkshop,
  PocketBotWorkshopV2,
  SideScrollerScene,
} = {}) {
  const fallbackScenes = [PocketBotWorkshop, SideScrollerScene].filter(Boolean);

  if (!PocketBotWorkshopV2) {
    return fallbackScenes;
  }

  return useV2
    ? [PocketBotWorkshopV2, PocketBotWorkshop, SideScrollerScene].filter(Boolean)
    : [PocketBotWorkshop, PocketBotWorkshopV2, SideScrollerScene].filter(Boolean);
}
