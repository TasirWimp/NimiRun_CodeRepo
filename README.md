# Pocket Bot

Pocket Bot is a Phaser 3 + Vite prototype for a Nimiq mini app concept.

The app explores how Nimiq could provide a self-custodied prepaid allowance for software helpers: a helper gets pocket money, clear rules, approval gates, and receipts instead of broad access to a user's wallet.

## Current Status

The repository currently contains:

- the original Phaser/Vite game foundation,
- a simple side-scroller prototype scene,
- organized product documentation under `docs/`,
- project structure prepared for testable domain logic and future Pocket Bot implementation.

Pocket Bot gameplay has not been implemented yet.

## Documentation

- Product requirements: `docs/product/requirements.md`
- Documentation structure guide: `docs/README.md`

## Development Commands

```bash
npm install
npm run dev
npm run test
npm run build
```

The development server uses Vite on `http://localhost:8080` by default.

## Project Structure

```text
docs/
  product/
    requirements.md

public/
  assets/
    backgrounds/
    props/
    sprites/

src/
  domain/
  game/
  scenes/
  ui/
```

## Implementation Direction

Future implementation should keep Phaser scene rendering separate from the Pocket Bot rules and allowance logic.

Use `src/domain/` for testable business rules, `src/game/` for MVP scenario data and constants, `src/ui/` for overlay helpers, and `src/scenes/` for Phaser scenes.
