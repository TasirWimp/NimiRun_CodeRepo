import {
  MAP_WORKFLOW,
  NODE_KINDS,
  NODE_VISIBILITY,
  PATH_VISIBILITY,
} from '../resourceMapScenario.js';
import { getVisibleMarketWitnessIds } from './marketWitnessLedger.js';
import { getBtcusdtWitnessWindowById } from './data/marketSignalScoutBtcusdtWindows.js';

const LEVEL_ID = 'level_02_golden_signal';
const GOLDEN_SIGNAL_WINDOW_ID = 'btc_binance_btcusdt_2017_12_golden_signal';

const MARKET_SIGNAL_SCOUT_SCENARIO = Object.freeze({
  id: 'market-signal-scout-golden-signal',
  title: 'Market Signal Scout',
  supportLine: 'Train your bot to spend attention wisely.',
  goal: 'Teach Pocket Bot to inspect support before treating a bright signal as safe.',
  workflow: MAP_WORKFLOW,
  level: Object.freeze({
    id: LEVEL_ID,
    label: 'Golden Signal',
    witnessWindowId: GOLDEN_SIGNAL_WINDOW_ID,
    witnessWindow: getBtcusdtWitnessWindowById(GOLDEN_SIGNAL_WINDOW_ID),
    visibleWitnessIds: getVisibleMarketWitnessIds(LEVEL_ID),
    featuredWitnessIds: ['btc_futures_gate_cboe_2017_12_04'],
  }),
  viewport: {
    width: 640,
    height: 420,
    tileSize: MAP_WORKFLOW.tileSize,
  },
  runtimeContract: {
    startNodeId: 'source-edge',
    goalNodeId: 'safe-gate',
    allowedMoves: ['inspect', 'ask', 'remember', 'act', 'skip'],
    protectedOutcomes: [
      {
        id: 'safe-finish-requires-support-exit-and-fomo',
        label: 'Safe finish requires support, exit friction, and urgency pressure to be checked.',
        requiredEvidence: [
          'signal-support-inspected',
          'exit-friction-inspected',
          'fomo-pressure-named',
        ],
      },
    ],
    stopConditions: [
      {
        id: 'bot-attention-empty',
        label: 'Stop when Bot Attention is exhausted.',
      },
      {
        id: 'safe-finish',
        label: 'Stop when finish judgment confirms safe finish.',
      },
      {
        id: 'false-finish',
        label: 'Stop and repair when a bright route still hides support, exit, or FOMO residue.',
      },
    ],
  },
  resources: {
    botAttention: {
      current: 10,
      max: 10,
      label: 'Bot Attention',
    },
    nimiqPocket: {
      amount: 23,
      currency: 'NIM',
      mode: 'simulated-testnet-pocket',
      label: 'Nimiq Pocket',
    },
    userGuidance: {
      level: 'ready',
      prompts: 0,
      label: 'User Guidance',
    },
    contextSlots: {
      capacity: 4,
      items: [],
      label: 'Context Slots',
    },
  },
  proposalPreview: {
    id: 'proposal-act-bright-signal',
    title: 'Bot Proposal',
    targetNodeId: 'bright-signal',
    move: 'Act on the bright signal',
    reason:
      'The signal is bright and the Futures Gate makes it feel urgent. Acting now may catch the route, but support, exit friction, and FOMO pressure remain unknown.',
    cost: {
      moveType: 'act',
      botAttention: 2,
      userGuidance: 1,
      contextSlots: 0,
    },
    reveals: ['quick signal result'],
    leavesUnknown: [
      'support depth still unknown',
      'exit friction still unknown',
      'FOMO pressure still unknown',
    ],
    alternative: 'Inspect support before acting.',
  },
  nodes: [
    {
      id: 'source-edge',
      label: 'Source Ocean',
      kind: NODE_KINDS.START,
      position: { x: 82, y: 330 },
      visibility: NODE_VISIBILITY.REVEALED,
      interaction: { enabled: true, radius: 34 },
      pressure: {
        hidden: false,
        level: 'low',
        summary: 'Starting edge is known, but the market map is incomplete.',
      },
      visibleClue: 'A foggy market route begins with one bright signal and many hidden assumptions.',
      possibleMoves: {
        inspect: {
          cost: { botAttention: 1, userGuidance: 0, contextSlots: 0 },
          reveals: ['route split'],
          leavesUnknown: ['which signal checks protect attention'],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['market landscape still fogged'],
        },
        act: {
          cost: { botAttention: 1, userGuidance: 0, contextSlots: 0 },
          risk: 'Leaving the source without inspection preserves signal ambiguity.',
        },
      },
      reveal: {
        inspect: {
          summary: 'The first visible route splits between signal speed, support, and exit checks.',
          evidence: ['route-split-seen'],
          resolvesUnknowns: [],
          residue: ['which signal checks protect attention'],
        },
      },
      residue: ['market landscape still fogged'],
    },
    {
      id: 'bright-signal',
      label: 'Bright Signal',
      kind: NODE_KINDS.SHORTCUT,
      position: { x: 235, y: 205 },
      visibility: NODE_VISIBILITY.VISIBLE,
      interaction: { enabled: true, radius: 38 },
      pressure: {
        hidden: true,
        level: 'medium',
        summary: 'Bright route may hide support and exit costs.',
      },
      visibleClue: 'A strong chart shape glows near the Futures Gate.',
      hiddenPressure: ['Bright route may hide support and exit costs.'],
      witnessIds: getVisibleMarketWitnessIds(LEVEL_ID, 'check_signal'),
      possibleMoves: {
        inspect: {
          cost: { botAttention: 2, userGuidance: 1, contextSlots: 0 },
          reveals: ['bright signal shape'],
          leavesUnknown: [
            'support depth still unknown',
            'exit friction still unknown',
            'FOMO pressure still unknown',
          ],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['bright signal unchecked'],
        },
        act: {
          cost: { botAttention: 2, userGuidance: 1, contextSlots: 0 },
          risk: 'Acting on brightness alone can carry hidden support and exit residue.',
        },
      },
      reveal: {
        inspect: {
          summary:
            'The bright signal is real enough to notice, but it does not prove support or exit safety.',
          evidence: ['bright-signal-read'],
          resolvesUnknowns: ['bright signal shape unchecked'],
          residue: [
            'support depth still unknown',
            'exit friction still unknown',
            'FOMO pressure still unknown',
          ],
        },
      },
      residue: [
        'support depth still unknown',
        'exit friction still unknown',
        'FOMO pressure still unknown',
      ],
    },
    {
      id: 'support-check',
      label: 'Support Check',
      kind: NODE_KINDS.CLUE,
      position: { x: 255, y: 335 },
      visibility: NODE_VISIBILITY.VISIBLE,
      interaction: { enabled: true, radius: 36 },
      pressure: {
        hidden: false,
        level: 'medium',
        summary: 'Support must be inspected before the signal can be trusted.',
      },
      visibleClue: 'A clue well asks whether the bright path has support.',
      witnessIds: getVisibleMarketWitnessIds(LEVEL_ID, 'check_support'),
      possibleMoves: {
        inspect: {
          cost: { botAttention: 2, userGuidance: 1, contextSlots: 0 },
          reveals: ['support clue', 'Futures Gate headline witness'],
          leavesUnknown: ['exit friction still unknown', 'FOMO pressure still unknown'],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['support depth still unknown'],
        },
      },
      reveal: {
        inspect: {
          summary:
            'Support check ties the bright chart to a sourced Futures Gate witness, but exit and urgency remain unresolved.',
          evidence: ['signal-support-inspected', 'futures-gate-context-seen'],
          resolvesUnknowns: [
            'support depth still unknown',
            'support strength unknown',
            'bright signal shape unchecked',
          ],
          residue: ['exit friction still unknown', 'FOMO pressure still unknown'],
        },
      },
      residue: ['support strength unknown'],
    },
    {
      id: 'futures-gate',
      label: 'Futures Gate',
      kind: NODE_KINDS.CONTEXT,
      position: { x: 405, y: 110 },
      visibility: NODE_VISIBILITY.VISIBLE,
      interaction: { enabled: true, radius: 36 },
      pressure: {
        hidden: true,
        level: 'medium',
        summary: 'Event pressure can make a route feel more urgent than it is.',
      },
      visibleClue: 'A historic event marker sits near the signal.',
      hiddenPressure: ['Futures announcements can amplify urgency without proving safety.'],
      witnessIds: getVisibleMarketWitnessIds(LEVEL_ID, 'check_event'),
      possibleMoves: {
        inspect: {
          cost: { botAttention: 1, userGuidance: 1, contextSlots: 0 },
          reveals: ['event pressure'],
          leavesUnknown: ['event pressure can still be overread'],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['event pressure unchecked'],
        },
      },
      reveal: {
        inspect: {
          summary:
            'The historic headline explains why the signal feels important; it still is not a trading rule.',
          evidence: ['event-pressure-named'],
          resolvesUnknowns: ['event pressure may be overread', 'event pressure unchecked'],
          residue: ['event pressure can still be overread'],
        },
      },
      residue: ['event pressure may be overread'],
    },
    {
      id: 'exit-friction',
      label: 'Exit Friction',
      kind: NODE_KINDS.WARNING,
      position: { x: 420, y: 250 },
      visibility: NODE_VISIBILITY.FOGGED,
      interaction: { enabled: true, radius: 36 },
      pressure: {
        hidden: true,
        level: 'high',
        summary: 'Exit pressure is hidden until inspected.',
      },
      visibleClue: 'Fog hides whether the route can be left safely.',
      hiddenPressure: ['Exit pressure is hidden until inspected.'],
      witnessIds: getVisibleMarketWitnessIds(LEVEL_ID, 'check_exit'),
      possibleMoves: {
        inspect: {
          cost: { botAttention: 2, userGuidance: 1, contextSlots: 0 },
          reveals: ['exit friction'],
          leavesUnknown: ['FOMO pressure still unknown'],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['exit friction still unknown'],
        },
        act: {
          cost: { botAttention: 2, userGuidance: 1, contextSlots: 0 },
          risk: 'Acting through an unchecked exit can preserve false-finish risk.',
        },
      },
      reveal: {
        inspect: {
          summary:
            'Exit Friction reveals that a fast route can become unsafe when the way out is ignored.',
          evidence: ['exit-friction-inspected'],
          resolvesUnknowns: ['exit friction still unknown', 'exit path hidden'],
          residue: ['FOMO pressure still unknown'],
        },
      },
      residue: ['exit friction still unknown'],
    },
    {
      id: 'fomo-pressure',
      label: 'FOMO Pressure',
      kind: NODE_KINDS.WARNING,
      position: { x: 425, y: 365 },
      visibility: NODE_VISIBILITY.FOGGED,
      interaction: { enabled: true, radius: 36 },
      pressure: {
        hidden: true,
        level: 'high',
        summary: 'Urgency pressure is hidden until named.',
      },
      visibleClue: 'Fog hides whether urgency is steering the bot.',
      hiddenPressure: ['Urgency pressure is hidden until named.'],
      witnessIds: getVisibleMarketWitnessIds(LEVEL_ID, 'check_fomo'),
      possibleMoves: {
        inspect: {
          cost: { botAttention: 1, userGuidance: 1, contextSlots: 0 },
          reveals: ['FOMO pressure'],
          leavesUnknown: ['safe finish conditions unknown'],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['FOMO pressure still unknown'],
        },
      },
      reveal: {
        inspect: {
          summary:
            'FOMO Pressure reveals that urgency is a cost signal, not proof that the route is safe.',
          evidence: ['fomo-pressure-named'],
          resolvesUnknowns: ['FOMO pressure still unknown', 'urgency pressure hidden'],
          residue: ['safe finish conditions unknown'],
        },
      },
      residue: ['FOMO pressure still unknown'],
    },
    {
      id: 'false-gate',
      label: 'False Finish',
      kind: NODE_KINDS.FALSE_FINISH,
      position: { x: 560, y: 185 },
      visibility: NODE_VISIBILITY.VISIBLE,
      interaction: { enabled: true, radius: 38 },
      pressure: {
        hidden: true,
        level: 'high',
        summary: 'Looks profitable before support and exit are checked.',
      },
      visibleClue: 'A glowing result that looks complete too early.',
      hiddenPressure: ['Looks profitable before support and exit are checked.'],
      possibleMoves: {
        inspect: {
          cost: { botAttention: 1, userGuidance: 1, contextSlots: 0 },
          reveals: ['false finish risk'],
          leavesUnknown: [
            'support depth still unknown',
            'exit friction still unknown',
            'FOMO pressure still unknown',
          ],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['false finish risk'],
        },
        act: {
          cost: { botAttention: 2, userGuidance: 1, contextSlots: 0 },
          risk: 'Acting here declares success before protected evidence is present.',
        },
      },
      falseLandfallTrap: {
        trigger:
          'act before signal-support-inspected, exit-friction-inspected, and fomo-pressure-named evidence are present',
        whyItIsFalseClosure:
          'False Finish: the route looks successful, but support, exit, or urgency residue remains unresolved.',
        residue: ['false finish risk'],
        remainingUnknowns: [
          'support depth still unknown',
          'exit friction still unknown',
          'FOMO pressure still unknown',
        ],
      },
      reveal: {
        inspect: {
          summary:
            'The gate looks like a win, but it cannot be safe while support, exit, or urgency are unchecked.',
          evidence: ['false-finish-risk-seen'],
          resolvesUnknowns: [],
          residue: [
            'support depth still unknown',
            'exit friction still unknown',
            'FOMO pressure still unknown',
          ],
        },
      },
      residue: ['false finish risk'],
    },
    {
      id: 'safe-gate',
      label: 'Safe Finish',
      kind: NODE_KINDS.SAFE_FINISH,
      position: { x: 565, y: 330 },
      visibility: NODE_VISIBILITY.FOGGED,
      interaction: { enabled: true, radius: 38 },
      pressure: {
        hidden: false,
        level: 'protected',
        summary: 'Safe finish requires support, exit, and urgency pressure to be checked.',
      },
      visibleClue: 'A finish that only counts after residue is made visible.',
      possibleMoves: {
        inspect: {
          cost: { botAttention: 1, userGuidance: 1, contextSlots: 0 },
          reveals: ['safe finish conditions'],
          leavesUnknown: [],
        },
        skip: {
          cost: { botAttention: 0, userGuidance: 0, contextSlots: 0 },
          preservesResidue: ['safe finish conditions unknown'],
        },
        act: {
          cost: { botAttention: 2, userGuidance: 1, contextSlots: 0 },
          risk: 'Safe finish fails if evidence or residue remains unresolved.',
        },
      },
      reveal: {
        inspect: {
          summary:
            'Safe Finish becomes legible after support, exit friction, and FOMO pressure are checked.',
          evidence: ['safe-finish-conditions-seen'],
          resolvesUnknowns: [
            'safe finish conditions unknown',
            'false finish risk',
            'event pressure may be overread',
            'event pressure can still be overread',
          ],
          residue: [],
        },
      },
      residue: ['safe finish conditions unknown'],
    },
  ],
  paths: [
    {
      id: 'source-to-bright-signal',
      from: 'source-edge',
      to: 'bright-signal',
      visibility: PATH_VISIBILITY.VISIBLE,
      residue: ['bright signal unchecked'],
    },
    {
      id: 'source-to-support-check',
      from: 'source-edge',
      to: 'support-check',
      visibility: PATH_VISIBILITY.REVEALED,
      residue: ['support check costs attention'],
    },
    {
      id: 'bright-signal-to-futures-gate',
      from: 'bright-signal',
      to: 'futures-gate',
      visibility: PATH_VISIBILITY.VISIBLE,
      residue: ['event pressure may be overread'],
    },
    {
      id: 'bright-signal-to-false-gate',
      from: 'bright-signal',
      to: 'false-gate',
      visibility: PATH_VISIBILITY.VISIBLE,
      residue: ['may create false finish'],
    },
    {
      id: 'support-to-exit-friction',
      from: 'support-check',
      to: 'exit-friction',
      visibility: PATH_VISIBILITY.FOGGED,
      residue: ['exit path hidden'],
    },
    {
      id: 'support-to-fomo-pressure',
      from: 'support-check',
      to: 'fomo-pressure',
      visibility: PATH_VISIBILITY.FOGGED,
      residue: ['urgency pressure hidden'],
    },
    {
      id: 'exit-to-safe-gate',
      from: 'exit-friction',
      to: 'safe-gate',
      visibility: PATH_VISIBILITY.FOGGED,
      residue: ['safe route not fully revealed'],
    },
    {
      id: 'fomo-to-safe-gate',
      from: 'fomo-pressure',
      to: 'safe-gate',
      visibility: PATH_VISIBILITY.FOGGED,
      residue: ['urgency can still distort judgment'],
    },
  ],
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createMarketSignalScoutScenario() {
  return clone(MARKET_SIGNAL_SCOUT_SCENARIO);
}
