# RPG Map Tooling

Status: PB-005 decision.

## Decision

Phase 1 uses a **Phaser-native custom node-map workflow**:

```text
plain JavaScript scenario data
  -> Phaser scene renders paths, nodes, fog, HUD, and interaction zones
    -> domain/runtime slices mutate map state later
```

The map is authored as structured data under `src/game/`, not in Tiled, LDtk,
or another external editor for the first playable slice.

## Why This Choice

The first competition path needs a compact, understandable map more than a
full map-authoring pipeline. A custom node-map keeps PB-005 small while still
supporting the mechanics the later slices need:

- visible and fogged nodes,
- paths between nodes,
- click/touch interaction zones,
- hidden pressure metadata,
- residue metadata,
- false-finish and safe-finish nodes,
- art-bible-compatible sprite/icon replacement later,
- fast unit tests without Phaser or a browser.

Tiled or LDtk can be introduced later if the map becomes large enough to justify
external editing. If that happens, exported map data should be converted into
the same game-facing node schema so domain and runtime modules do not depend on
one editor format.

## Runtime Shape

The current map scaffold lives in:

```text
src/game/resourceMapScenario.js
src/scenes/PocketBotWorkshop.js
```

`resourceMapScenario.js` owns the first map's scene-independent data:

- workflow metadata,
- viewport size,
- player-facing goal,
- starting resources,
- nodes,
- paths,
- proposal preview text,
- map capability helpers.

`PocketBotWorkshop.js` owns only rendering and pointer interaction:

- background,
- resource HUD,
- map frame,
- paths,
- node icons/placeholders,
- Pocket Bot marker,
- selected-node detail panel.

Later PB slices should keep rule checks, attention spend, move legality,
transition gates, finish judgment, LLM schemas, and Nimiq platform behavior out
of the Phaser scene.

## Node Schema

Map nodes use local map coordinates and include enough metadata for later lossy
map behavior:

```js
{
  id: 'shortcut-bridge',
  label: 'Shortcut',
  kind: 'shortcut',
  position: { x: 255, y: 210 },
  visibility: 'visible',
  interaction: { enabled: true, radius: 34 },
  pressure: {
    hidden: true,
    level: 'medium',
    summary: 'Fast route may hide a cost.',
  },
  reveal: {
    inspect: {
      summary: 'Shortcut risk can be revealed.',
      residue: ['long route safety still unknown'],
    },
  },
  residue: ['long route safety unknown'],
}
```

Player-facing labels should stay simple: goal, attention, pocket, context,
trace, clue, warning, shortcut, unknown, partial finish, safe finish.

## Asset Direction

PB-005 does not require final art. It must keep the scene ready for art from:

```text
docs/product/art_bible.md
public/assets/pocket-bot/
```

Use placeholder shapes until the first generated asset batch exists. Runtime
text should stay in Phaser/HTML, not inside PNGs.

## Acceptance Notes

This workflow satisfies PB-005 when:

- the selected workflow is documented,
- the scene renders a small RPG-like map scaffold,
- nodes and paths can carry fog/reveal state,
- nodes can carry hidden pressure and residue metadata,
- pointer/touch interaction zones select nodes,
- no external map editor dependency is required,
- final asset generation can wait until tile size and icon size are proven in
  the scene.

