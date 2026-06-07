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
- PB-007 LLM route-proposal bridge with schema validation, run-carrier prompt shaping, browser relay client, Vite dev relay middleware, mock fallback, and full-scenario unsafe-authority relay regression coverage,
- PB-008 lossy-map domain rules for hidden-pressure reveal, inspect/skip/act behavior, false-landfall traps, safe-finish judgment, and prompt serialization,
- PB-009 user-bot guidance loop with deterministic proposal approval, node-click redirect, why/unknowns/inspect-first/partial controls, and HUD/map updates,
- PB-010 session lesson application with trace-derived lessons, next-proposal rewrite, bounded prompt/relay pass-through, and no persistence beyond the active run,
- PB-011 trace cards for accepted moves, receipt-backed money-like events, residue/re-entry context, latest-trace inspection, and landfall status labels,
- PB-012 Nimiq testnet pocket surface with local fallback, emulator-verified Nimiq Pay NIM status check, pocket-status trace cards, and no sign/send/payment authority,
- NimiRun V2 runtime assets under `public/assets/nimirun-v2/`,
- organized product documentation under `docs/`,
- project structure prepared for testable domain logic, LLM proposal boundaries, runtime-cycle rules, Nimiq pocket-status checks, and future desktop/mobile browser TestAlbatross work.

The revised resource-judgment gameplay now has the first playable guidance loop with trace-card review, session-only lesson application, and an explicit low-stakes Nimiq pocket status surface. The Nimiq Pay Testnet Mini App path was verified on an Android emulator on June 7, 2026; broader submission readiness still depends on the PB-012A browser TestAlbatross path and final polish.

## Documentation

- Product requirements: `docs/product/requirements.md`
- Art bible: `docs/product/art_bible.md`
- RPG map tooling: `docs/architecture/rpg_map_tooling.md`
- Deployment architecture: `docs/architecture/deployment.md`
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

`pocket_bot_nimiq_platform_worker` is active for PB-012 and later Nimiq Mini App SDK/provider boundary work, as described in `docs/planning/mvp_implementation_plan.md`.

## Development Commands

```bash
npm install
npm run dev
npm run test
npm run build
```

The development server uses Vite on `http://localhost:8080` by default.

PB-007 LLM relay configuration:

Do not store a real OpenAI API key in the repo working tree for competition or
submission work. `.env.example` documents variable names only.

For local mock proposals, leave `NIMIRUN_LLM_MODE=mock` or omit
`OPENAI_API_KEY`.

For live local route proposals, prefer shell/session variables:

```powershell
$env:NIMIRUN_LLM_MODE = "openai"
$env:OPENAI_ROUTE_PROPOSAL_MODEL = "gpt-5.4-mini"
$env:OPENAI_API_KEY = Read-Host "OpenAI API key"
npm run dev -- --host 127.0.0.1
```

For hosted builds, set the same values through deployment secrets or server-side
environment configuration. Provider keys must never be committed or bundled into
browser code.

The first hosted deployment target is Vercel. The repo includes
`api/route-proposal.js` for the production serverless relay and `vercel.json`
for the Vite build output. Configure `NIMIRUN_LLM_MODE`,
`OPENAI_ROUTE_PROPOSAL_MODEL`, and `OPENAI_API_KEY` in Vercel Project Settings
-> Environment Variables.

## Project Structure

```text
docs/
  architecture/
    deployment.md
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

api/
  route-proposal.js
```

## Implementation Direction

Future implementation should keep Phaser scene rendering separate from Pocket Bot rules, runtime-cycle logic, LLM proposal schemas, and wallet/platform boundaries.

Use `src/domain/` for testable game rules and runtime state, `src/game/` for MVP scenario data and constants, `src/llm/` for route proposal schema/client code, `src/platform/` for Mini App adapters, `src/ui/` for overlay helpers, and `src/scenes/` for Phaser scenes.
