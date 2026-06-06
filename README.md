# Pocket Bot

Pocket Bot is a Phaser 3 + Vite prototype for a Nimiq mini app concept.

The app explores how an independent individual can guide a small software helper with limited Bot Attention, limited context, and a small Nimiq pocket through messy, lossy task landscapes.

## Current Status

The repository currently contains:

- the original Phaser/Vite game foundation,
- a simple side-scroller prototype scene,
- Pocket Bot Workshop scene and domain groundwork from the earlier allowance-control cut,
- PB-005 RPG map tooling and a Phaser-native node-map scaffold,
- PB-006 deterministic resource model for Bot Attention, Nimiq Pocket, User Guidance, and Context Slots,
- PB-006A run-session runtime for transition gates, run carriers, residue, and finish judgment,
- PB-007 LLM route-proposal bridge with schema validation, run-carrier prompt shaping, browser relay client, Vite dev relay middleware, and mock fallback,
- NimiRun V2 runtime assets under `public/assets/nimirun-v2/`,
- organized product documentation under `docs/`,
- project structure prepared for testable domain logic, LLM proposal boundaries, runtime-cycle rules, and future Nimiq testnet work.

The revised resource-judgment gameplay has a map scaffold, deterministic resource state, runtime-cycle groundwork, and a bounded LLM proposal bridge, but the full playable loop is not complete yet.

## Documentation

- Product requirements: `docs/product/requirements.md`
- Art bible: `docs/product/art_bible.md`
- RPG map tooling: `docs/architecture/rpg_map_tooling.md`
- Phase 1 implementation plan: `docs/planning/mvp_implementation_plan.md`
- Test strategy: `docs/testing/test_strategy.md`
- Source attribution register: `docs/product/source_attribution.md`
- Development workflow: `docs/process/development_workflow.md`
- Documentation structure guide: `docs/README.md`

## Codex Subagents

Role-specific Codex agents live in `.codex/agents/`:

- `pocket_bot_planner`
- `pocket_bot_test_planner`
- `pocket_bot_domain_worker`
- `pocket_bot_runtime_worker`
- `pocket_bot_llm_worker`
- `pocket_bot_scene_worker`
- `pocket_bot_docs_keeper`
- `pocket_bot_reviewer`

`pocket_bot_nimiq_platform_worker` should be added when PB-012 Nimiq Testnet Pocket starts, as described in `docs/planning/mvp_implementation_plan.md`.

## Development Commands

```bash
npm install
npm run dev
npm run test
npm run build
```

The development server uses Vite on `http://localhost:8080` by default.

PB-007 LLM relay configuration:

```bash
cp .env.example .env.local
```

Leave `NIMIRUN_LLM_MODE=mock` or omit `OPENAI_API_KEY` for local mock proposals.
For live route proposals, set `NIMIRUN_LLM_MODE=openai`, set `OPENAI_API_KEY`
server-side, and optionally override `OPENAI_ROUTE_PROPOSAL_MODEL`.

## Project Structure

```text
docs/
  product/
    requirements.md
    source_attribution.md
  planning/
    mvp_implementation_plan.md
  testing/
    test_strategy.md

public/
  assets/
    backgrounds/
    props/
    sprites/

src/
  domain/
  llm/
  game/
  scenes/
  ui/

server/
  routeProposalRelay.js
```

## Implementation Direction

Future implementation should keep Phaser scene rendering separate from Pocket Bot rules, runtime-cycle logic, LLM proposal schemas, and wallet/platform boundaries.

Use `src/domain/` for testable game rules and runtime state, `src/game/` for MVP scenario data and constants, `src/llm/` for route proposal schema/client code, `src/platform/` for Mini App adapters, `src/ui/` for overlay helpers, and `src/scenes/` for Phaser scenes.
