const DESKTOP_GAME_SIZE = Object.freeze({ width: 1024, height: 768 });
const PORTRAIT_GAME_SIZE_LIMITS = Object.freeze({
  minWidth: 360,
  maxWidth: 430,
  minHeight: 740,
  maxHeight: 932,
});
const PHONE_LAYOUT_MAX_WIDTH = 600;
const DESKTOP_LAYOUT_MAX_WIDTH = 1100;
const PORTRAIT_RATIO = 1.2;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function readPositiveNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : null;
}

function createMetric(width, height) {
  const resolvedWidth = readPositiveNumber(width);
  const resolvedHeight = readPositiveNumber(height);

  if (!resolvedWidth || !resolvedHeight) {
    return null;
  }

  return {
    width: resolvedWidth,
    height: resolvedHeight,
  };
}

function normalizeScreenMetric(screenMetric, devicePixelRatio) {
  const ratio = readPositiveNumber(devicePixelRatio);

  if (!screenMetric || !ratio || ratio <= 1 || screenMetric.width <= PHONE_LAYOUT_MAX_WIDTH) {
    return screenMetric;
  }

  const cssWidth = screenMetric.width / ratio;
  const cssHeight = screenMetric.height / ratio;

  if (cssWidth <= PHONE_LAYOUT_MAX_WIDTH) {
    return {
      width: cssWidth,
      height: cssHeight,
    };
  }

  return screenMetric;
}

function isPortrait(metric) {
  return Boolean(metric && metric.height >= metric.width * PORTRAIT_RATIO);
}

function isPhoneWidth(metric) {
  return Boolean(metric && metric.width <= PHONE_LAYOUT_MAX_WIDTH);
}

function getViewportMetrics(globalObject) {
  const documentElement = globalObject?.document?.documentElement;
  const screenMetric = normalizeScreenMetric(
    createMetric(globalObject?.screen?.width, globalObject?.screen?.height),
    globalObject?.devicePixelRatio
  );

  return {
    visual: createMetric(globalObject?.visualViewport?.width, globalObject?.visualViewport?.height),
    document: createMetric(documentElement?.clientWidth, documentElement?.clientHeight),
    inner: createMetric(globalObject?.innerWidth, globalObject?.innerHeight),
    screen: screenMetric,
  };
}

function getPhonePortraitMetric(metrics) {
  return [metrics.visual, metrics.document, metrics.inner, metrics.screen].find(
    (metric) => isPhoneWidth(metric) && isPortrait(metric)
  );
}

function getVisibleHeight(metrics, width) {
  return [
    metrics.visual?.height,
    metrics.document?.height,
    metrics.inner?.height,
    metrics.screen?.height,
  ].find((height) => readPositiveNumber(height) && height >= width * PORTRAIT_RATIO);
}

export function getInitialGameSize(globalObject = globalThis) {
  const metrics = getViewportMetrics(globalObject);
  const phonePortraitMetric = getPhonePortraitMetric(metrics);

  if (phonePortraitMetric) {
    const width = clamp(
      Math.round(phonePortraitMetric.width),
      PORTRAIT_GAME_SIZE_LIMITS.minWidth,
      PORTRAIT_GAME_SIZE_LIMITS.maxWidth
    );
    const visibleHeight = getVisibleHeight(metrics, width) || phonePortraitMetric.height;

    return {
      width,
      height: clamp(
        Math.round(visibleHeight),
        PORTRAIT_GAME_SIZE_LIMITS.minHeight,
        PORTRAIT_GAME_SIZE_LIMITS.maxHeight
      ),
    };
  }

  const viewport = metrics.visual || metrics.document || metrics.inner || DESKTOP_GAME_SIZE;
  const isPhonePortrait = viewport.width <= DESKTOP_LAYOUT_MAX_WIDTH && isPortrait(viewport);

  if (!isPhonePortrait) {
    return DESKTOP_GAME_SIZE;
  }

  const width = clamp(
    Math.round(viewport.width),
    PORTRAIT_GAME_SIZE_LIMITS.minWidth,
    PORTRAIT_GAME_SIZE_LIMITS.maxWidth
  );
  const viewportRatio = viewport.height / viewport.width;

  return {
    width,
    height: clamp(
      Math.round(width * viewportRatio),
      PORTRAIT_GAME_SIZE_LIMITS.minHeight,
      PORTRAIT_GAME_SIZE_LIMITS.maxHeight
    ),
  };
}
