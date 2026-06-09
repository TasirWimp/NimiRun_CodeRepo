const DESKTOP_GAME_SIZE = Object.freeze({ width: 1024, height: 768 });
const PORTRAIT_GAME_SIZE_LIMITS = Object.freeze({
  minWidth: 360,
  maxWidth: 430,
  minHeight: 740,
  maxHeight: 932,
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getInitialGameSize(globalObject = globalThis) {
  const viewportWidth = Number(globalObject?.innerWidth) || DESKTOP_GAME_SIZE.width;
  const viewportHeight = Number(globalObject?.innerHeight) || DESKTOP_GAME_SIZE.height;
  const isPhonePortrait = viewportWidth <= 1100 && viewportHeight >= viewportWidth * 1.2;

  if (!isPhonePortrait) {
    return DESKTOP_GAME_SIZE;
  }

  const width = clamp(
    Math.round(viewportWidth),
    PORTRAIT_GAME_SIZE_LIMITS.minWidth,
    PORTRAIT_GAME_SIZE_LIMITS.maxWidth
  );
  const viewportRatio = viewportHeight / viewportWidth;

  return {
    width,
    height: clamp(
      Math.round(width * viewportRatio),
      PORTRAIT_GAME_SIZE_LIMITS.minHeight,
      PORTRAIT_GAME_SIZE_LIMITS.maxHeight
    ),
  };
}
