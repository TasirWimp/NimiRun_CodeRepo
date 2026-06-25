const SURFACE_NODE_IDS = Object.freeze({
  goldenSignal: 'bright-signal',
  supportWell: 'support-check',
  exitBridge: 'exit-friction',
  crowdPressure: 'fomo-pressure',
  eventGate: 'futures-gate',
  traceMemory: 'source-edge',
});

const TONES = Object.freeze({
  gold: Object.freeze({
    fill: 0xf2b33d,
    stroke: 0xf2b33d,
    text: '#f2b33d',
  }),
  blue: Object.freeze({
    fill: 0x48a8ff,
    stroke: 0x48a8ff,
    text: '#8dccff',
  }),
  green: Object.freeze({
    fill: 0x58d68d,
    stroke: 0x58d68d,
    text: '#98f0b8',
  }),
  purple: Object.freeze({
    fill: 0x9b63ff,
    stroke: 0x9b63ff,
    text: '#c6a9ff',
  }),
  red: Object.freeze({
    fill: 0xff5a3d,
    stroke: 0xff5a3d,
    text: '#ff9a85',
  }),
  muted: Object.freeze({
    fill: 0x35506a,
    stroke: 0x6f8496,
    text: '#aab4bd',
  }),
});

const STATE_STYLE = Object.freeze({
  tempting: Object.freeze({
    tone: 'gold',
    label: 'Bright pull',
    fillAlpha: 0.2,
    strokeAlpha: 0.95,
    strokeWidth: 3,
    radiusScale: 1.38,
  }),
  selected: Object.freeze({
    tone: 'blue',
    label: 'Signal selected',
    fillAlpha: 0.12,
    strokeAlpha: 0.95,
    strokeWidth: 3,
    radiusScale: 1.36,
  }),
  'acted-on': Object.freeze({
    tone: 'red',
    label: 'Signal used',
    fillAlpha: 0.16,
    strokeAlpha: 0.95,
    strokeWidth: 3,
    radiusScale: 1.42,
  }),
  hidden: Object.freeze({
    tone: 'muted',
    label: 'Hidden',
    fillAlpha: 0.04,
    strokeAlpha: 0.4,
    strokeWidth: 2,
    radiusScale: 1.12,
    fogAlpha: 0.2,
  }),
  hinted: Object.freeze({
    tone: 'purple',
    label: 'Check this',
    fillAlpha: 0.1,
    strokeAlpha: 0.84,
    strokeWidth: 2,
    radiusScale: 1.28,
    fogAlpha: 0.28,
  }),
  stable: Object.freeze({
    tone: 'green',
    label: 'Support held',
    fillAlpha: 0.12,
    strokeAlpha: 0.95,
    strokeWidth: 3,
    radiusScale: 1.32,
  }),
  revealed: Object.freeze({
    tone: 'blue',
    label: 'Checked',
    fillAlpha: 0.12,
    strokeAlpha: 0.95,
    strokeWidth: 3,
    radiusScale: 1.3,
  }),
  visible: Object.freeze({
    tone: 'blue',
    label: 'Visible',
    fillAlpha: 0.08,
    strokeAlpha: 0.65,
    strokeWidth: 2,
    radiusScale: 1.18,
  }),
  active: Object.freeze({
    tone: 'red',
    label: 'Pressure active',
    fillAlpha: 0.14,
    strokeAlpha: 0.95,
    strokeWidth: 3,
    radiusScale: 1.32,
  }),
  witnessed: Object.freeze({
    tone: 'gold',
    label: 'Witnessed',
    fillAlpha: 0.12,
    strokeAlpha: 0.9,
    strokeWidth: 3,
    radiusScale: 1.28,
  }),
  empty: Object.freeze({
    tone: 'muted',
    label: 'Trace empty',
    fillAlpha: 0.02,
    strokeAlpha: 0.25,
    strokeWidth: 1,
    radiusScale: 1.04,
  }),
  'residue-carrier': Object.freeze({
    tone: 'purple',
    label: 'Trace carries',
    fillAlpha: 0.12,
    strokeAlpha: 0.9,
    strokeWidth: 2,
    radiusScale: 1.24,
  }),
  open: Object.freeze({
    tone: 'muted',
    label: 'Finish locked',
    fillAlpha: 0.04,
    strokeAlpha: 0.45,
    strokeWidth: 2,
    radiusScale: 1.12,
    fogAlpha: 0.18,
  }),
  false: Object.freeze({
    tone: 'red',
    label: 'False finish',
    fillAlpha: 0.16,
    strokeAlpha: 0.98,
    strokeWidth: 3,
    radiusScale: 1.38,
  }),
  partial: Object.freeze({
    tone: 'gold',
    label: 'Partial finish',
    fillAlpha: 0.14,
    strokeAlpha: 0.9,
    strokeWidth: 3,
    radiusScale: 1.3,
  }),
  safe: Object.freeze({
    tone: 'green',
    label: 'Safe finish',
    fillAlpha: 0.14,
    strokeAlpha: 0.95,
    strokeWidth: 3,
    radiusScale: 1.34,
  }),
});

const SURFACE_LABELS = Object.freeze({
  goldenSignal: Object.freeze({
    tempting: 'Bright pull',
    selected: 'Signal selected',
    'acted-on': 'Signal used',
  }),
  supportWell: Object.freeze({
    hidden: 'Support unseen',
    hinted: 'Support?',
    stable: 'Support held',
  }),
  exitBridge: Object.freeze({
    hidden: 'Exit fog',
    hinted: 'Exit?',
    revealed: 'Exit checked',
  }),
  crowdPressure: Object.freeze({
    visible: 'Crowd murmur',
    hinted: 'Crowd?',
    active: 'Crowd pressure',
  }),
  eventGate: Object.freeze({
    visible: 'Event gate',
    hinted: 'Event?',
    witnessed: 'Event witnessed',
  }),
  traceMemory: Object.freeze({
    empty: 'Trace empty',
    active: 'Trace active',
    'residue-carrier': 'Trace carries',
  }),
  finishGate: Object.freeze({
    open: 'Finish locked',
    false: 'False finish',
    partial: 'Partial finish',
    safe: 'Safe finish',
  }),
});

function getFinishNodeId(surface) {
  if (surface?.state === 'false') {
    return 'false-gate';
  }

  return 'safe-gate';
}

function createDescriptor(surfaceKey, surface, nodeId) {
  const state = surface?.state || 'hidden';
  const style = STATE_STYLE[state] || STATE_STYLE.hidden;
  const tone = TONES[style.tone] || TONES.muted;
  const labels = SURFACE_LABELS[surfaceKey] || {};

  return {
    key: surfaceKey,
    nodeId,
    state,
    label: labels[state] || style.label,
    fill: tone.fill,
    stroke: tone.stroke,
    textColor: tone.text,
    fillAlpha: style.fillAlpha,
    strokeAlpha: style.strokeAlpha,
    strokeWidth: style.strokeWidth,
    radiusScale: style.radiusScale,
    fogAlpha: style.fogAlpha || 0,
    relationId: surface?.relationId || null,
    relationStatus: surface?.relationStatus || null,
    hint: surface?.hint || null,
  };
}

export function createMarketWorldAffordanceDescriptors(renderPlan = {}) {
  const surfaces = renderPlan.surfaces || {};

  return [
    createDescriptor('goldenSignal', surfaces.goldenSignal, SURFACE_NODE_IDS.goldenSignal),
    createDescriptor('supportWell', surfaces.supportWell, SURFACE_NODE_IDS.supportWell),
    createDescriptor('exitBridge', surfaces.exitBridge, SURFACE_NODE_IDS.exitBridge),
    createDescriptor('crowdPressure', surfaces.crowdPressure, SURFACE_NODE_IDS.crowdPressure),
    createDescriptor('eventGate', surfaces.eventGate, SURFACE_NODE_IDS.eventGate),
    createDescriptor('traceMemory', surfaces.traceMemory, SURFACE_NODE_IDS.traceMemory),
    createDescriptor('finishGate', surfaces.finishGate, getFinishNodeId(surfaces.finishGate)),
  ];
}
