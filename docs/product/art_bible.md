# Pocket Bot Art Bible

Status: Phase 1 asset direction.

Source reference: project-owner-provided storyboard image,
`C:\Users\jensb\Downloads\ChatGPT Image Jun 5, 2026, 10_23_27 PM.png`.

This document turns the storyboard into a production guide for consistent
Phaser assets. It is not a final asset list and does not move the storyboard
image into the shipped app. Any generated or sourced asset used in the runtime
must still be recorded in `docs/product/source_attribution.md`.

## Purpose

Pocket Bot needs a coherent asset system before individual sprites, tiles,
icons, and effects are generated. The storyboard defines the mood, symbols,
palette, UI language, and gameplay progression. Runtime assets should be a
simplified, readable derivative of that direction rather than cropped pieces of
the storyboard.

Use this art bible for:

- generated image prompts,
- asset-pack selection checks,
- sprite and tile naming,
- UI icon direction,
- splash/story art direction,
- competition screenshots and demo polish.

Do not use it to justify adding decorative art that weakens gameplay
readability or hides resource state.

## Product And Story Signal

Core promise:

```text
Bind attention to judgment. Keep control of the pocket.
```

Player-facing support line:

```text
Train your bot to spend attention wisely.
```

The storyboard title uses `NIMIRUN`. Until product requirements are changed,
the in-game helper remains `Pocket Bot`. `NimiRun` can act as the game/project
title or competition-facing wrapper, while Pocket Bot remains the named helper.

## Visual Thesis

Pocket Bot should feel like a small storybook RPG about judgment under fog.
The world is beautiful but incomplete. Gold, blue, green, and purple signals
show resources, clues, memory, and uncertainty. The player should immediately
see:

- the bot is limited but helpful,
- attention is spendable,
- context slots are scarce,
- traces carry memory forward,
- not every glowing finish is safe.

## Storyboard Beats

The first asset set should support these beats:

| Beat | Gameplay Meaning | Asset Implication |
|---|---|---|
| Source ocean | Messy task landscape with hidden assumptions | dark map base, fog edge, distant goal lights |
| Choosing guidance | Bot proposes, user decides | proposal card, approve/reject controls, bot thinking pose |
| Inspection and revelation | Spend attention to reveal partial truth | fog reveal effect, clue node, attention spend effect |
| Trace is born | Action, cost, reveal, residue, lesson bind together | trace card frame, trace ribbon, residue marker |
| Context capacity | Player chooses what the bot carries | context slot icons, locked slot, selected clue cards |
| Proposals evolve | Session lesson affects next proposal | updated proposal card, lesson glow, bot reasoning pose |
| False finish warning | Goal-looking path can still be unsafe | false finish gate, warning panel, residue shadow |
| Safe finish | Finish requires preserved clues and inspected warnings | safe gate, finish checklist, soft gold reveal |
| Session summary | Trace review and lesson absorption | trace archive, lesson cards, context going forward |
| Loop continues | Re-entry with better judgment | source ocean background, renewed bindings HUD |

## Style Rules

- Use dark storybook fantasy with soft sci-fi details.
- Keep the mood mystical, not horror.
- Prefer clear 2D RPG readability over painterly detail in runtime assets.
- Use simple silhouettes, consistent lighting, and strong foreground shapes.
- Keep the camera slightly top-down or lightly isometric.
- Keep UI frames clean, thin, and readable on mobile.
- Do not bake UI text into images. Phaser or HTML should render text.
- Do not generate fake Nimiq UI, wallet screens, exchange screens, or trading
  surfaces.
- Do not use raw CRPM terminology in player-facing art.
- Avoid one-note color palettes. Gold should be an accent and value signal,
  not the whole screen.

## Palette

Use these as direction, not strict implementation constants:

| Role | Hex | Use |
|---|---:|---|
| Source night | `#050b10` | world background, fog base |
| Deep slate | `#101923` | panels, map shadows |
| Moon blue | `#2b5f8f` | distant light, safe readable contrast |
| Bot Attention blue | `#48a8ff` | attention icons, spend pips, inspect effects |
| Nimiq gold | `#f2b33d` | pocket value, trace binding, gates, key outlines |
| Ember gold | `#d87822` | warmth, campfires, trace glow |
| Context green | `#80c84d` | remembered clue, context slot, safe knowledge |
| Clue purple | `#9b63ff` | unknown clue, magic source, inspect target |
| Residue shadow | `#2d2438` | remaining unknown, false finish pressure |
| Warning red | `#ff5a3d` | false finish, blocked action, danger |
| Text cream | `#f3e4c2` | readable UI text on dark panels |

## Scale And Camera

Phase 1 should optimize for a compact mobile-readable map, not a large RPG.

- Target a tile workflow compatible with Phaser, Tiled, LDtk, or Phaser-native
  tilemaps.
- Keep logical tile size at `32x32` or `48x48` until PB-005 selects the map
  workflow.
- Generate or source art at 2x or 4x resolution, then downscale/slice for
  runtime readability.
- Interactive node icons should remain readable at about `48px` display size.
- Character sprites should read at about `64px` to `96px` display height.
- HUD icons should read at `20px` to `32px`.
- Avoid thin details that disappear on mobile.

## Asset Families

### Core Actors

Required first:

- `Pocket Bot`: golden hex body, dark face, amber eyes, small readable limbs.
- `Nimiq Pocket`: golden hex pocket/value object, distinct from Bot Attention.
- `User Guidance`: simple heart/hand/star-like icon for the player's guidance
  investment.

Useful animation states:

- idle,
- thinking/proposing,
- moving,
- inspecting,
- low attention,
- lesson absorbed,
- safe finish.

The child/guide from the storyboard can be used in splash/story panels and later
scene art, but Phase 1 gameplay can keep the player represented through UI
guidance controls if that is faster and clearer.

### Map Kit

Required first:

- dark ground tile,
- revealed path tile,
- fog overlay tile,
- obstacle/shadow tile,
- clue node,
- shortcut node,
- warning node,
- context shrine,
- Nimiq pocket/recharge node,
- false finish gate,
- safe finish gate.

Map nodes must have visual states:

- hidden,
- visible but uninspected,
- inspected,
- selected/proposed,
- exhausted,
- risky/false,
- safe.

### UI Kit

Required first:

- Bot Attention icon and meter/pips,
- Nimiq Pocket icon and value meter,
- Context Slot card frame,
- Proposal Card frame,
- Trace Card frame,
- residue marker,
- lesson marker,
- finish checklist states for safe, partial, false, and open finish.

UI art should provide frames and icons only. Runtime text stays in code.

### Effects

Required first:

- fog reveal,
- attention spend pulse,
- trace ribbon,
- clue glow,
- residue shadow pulse,
- context slot lock/unlock,
- safe finish glow,
- false finish warning pulse.

Keep effects short and low-cost. They should communicate state changes, not
hide the map.

### Story And Marketing Art

The storyboard can guide:

- splash screen,
- README image,
- competition screenshots,
- demo video panels,
- loading screen,
- store/community post visuals.

High-detail painterly art belongs here, not inside small map tiles.

## Directory And Naming Convention

Runtime assets should live under one focused directory:

```text
public/assets/pocket-bot/
  characters/
  tiles/
  nodes/
  ui/
  effects/
  backgrounds/
  marketing/
```

Use lowercase kebab-case filenames:

```text
pocket-bot-idle.png
pocket-bot-inspect-sheet.png
node-clue-purple.png
node-context-shrine.png
ui-icon-bot-attention.png
ui-card-trace-frame.png
effect-fog-reveal-sheet.png
bg-source-ocean-splash.png
```

When an asset is loaded by Phaser, add it to a small manifest rather than
scattering string paths through scene code:

```text
src/game/pocketBotAssetManifest.js
```

That manifest should hold stable asset keys, file paths, expected dimensions,
and the source-attribution id when available.

## Prompt Header

Use this shared prompt header for generated runtime assets:

```text
Pocket Bot / NimiRun Phase 1 game asset.
Dark storybook fantasy with soft sci-fi details.
Deep blue-black world, Nimiq-gold accents, readable 2D RPG silhouette.
Slightly top-down or lightly isometric game perspective.
Clean transparent PNG game asset, no background unless requested.
No text, no letters, no UI labels, no fake wallet screen, no trading screen.
Consistent warm light from lower front-left, cool moon rim light from upper back.
Readable at small mobile game size.
```

Then append the specific asset request:

```text
Create: [asset name].
State: [idle / thinking / inspected / warning / safe / residue].
Output: [single transparent PNG / sprite sheet / tileset].
Size target: [for example 512x512 source, downscaled in runtime].
```

For generated story or marketing art, allow a full background but keep the same
palette and character anchors.

## Generation Batches

Generate assets in coherent batches so style drift is visible early:

1. `PB-ASSET-001 Core readable set`: Pocket Bot, Bot Attention, Nimiq Pocket,
   Context Slot, clue node, trace card frame.
2. `PB-ASSET-002 Map kit`: ground, fog, paths, clue, shortcut, warning,
   context shrine, false finish gate, safe finish gate.
3. `PB-ASSET-003 Interaction states`: selected, inspected, exhausted, risky,
   safe, low-attention, lesson absorbed.
4. `PB-ASSET-004 Effects`: fog reveal, attention spend, trace ribbon, residue
   shadow, safe finish glow, false finish warning.
5. `PB-ASSET-005 Marketing`: splash, README image, screenshots, demo panels.

Each batch should be checked in the actual Phaser scene before generating the
next batch.

## Attribution And Licensing

Before committing generated or sourced assets:

- add or update a source entry in `docs/product/source_attribution.md`,
- record the generation model/tool or asset-pack source,
- record the prompt family or source pack name,
- record whether the storyboard was used as a reference,
- record any post-processing tool,
- record whether the asset ships in `public/assets/`,
- keep copied third-party license files when required.

If an asset source does not clearly allow public MIT-compatible use in this
competition prototype, do not ship it.

## Acceptance Checklist

An asset batch is acceptable when:

- it matches the palette and character anchors,
- each interactive object is readable at mobile size,
- states are visually distinct without relying on text,
- Bot Attention, Nimiq Pocket, Context Slots, trace, residue, and finish status
  are visually separable,
- no mainnet, wallet, trading, brokerage, or exchange behavior is implied,
- the asset source is attributed,
- the Phaser scene still renders and controls remain touch-readable.

