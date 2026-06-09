# Pocket Bot

Pocket Bot is a Phaser 3 + Vite prototype for a Nimiq mini app concept.

The app explores how an independent individual can guide a small software helper with limited Bot Attention, limited context, and a small Nimiq pocket through messy, lossy task landscapes.

## What It Does

Pocket Bot turns user-bot alignment into a small RPG-style game. The bot has
limited Bot Attention and proposes moves through a messy map. The player can
ask the bot for a bounded LLM route proposal, inspect a node, redirect the bot,
approve a move, reveal hidden assumptions, and inspect trace cards that bind
action, cost, reveal, residue, and lesson.

The current playable scenario is `Market Signal Scout`. It teaches the bot not
to treat a bright market signal as safe until support, exit friction, urgency
pressure, and false-finish risks are checked. It is fictionalized educational
gameplay, not trading advice.

## Who It Is For

Pocket Bot is for independent users who want AI helpers to become useful
without surrendering judgment or broad authority. The prototype is also for
Nimiq Mini App judges and early testers who want to see a concrete mobile-first
loop: user guidance changes a bot proposal, resources are spent deliberately,
and the result remains inspectable.

## How It Uses Nimiq Pay

The app runs as a Nimiq Mini App inside Nimiq Pay and has been verified on an
Android emulator with the hosted Vercel URL. Phase 1 uses Nimiq as the visible
pocket/control layer: the player sees a Nimiq Pocket status surface while Bot
Attention remains the resource spent on proposals and map moves.

The current build supports explicit NIM status checks through the Mini App
provider boundary and local/testnet fallback. It does not request signing,
sending, checkout, top-up, mainnet spending, custody, or broad wallet authority.

## Competition Submission Draft

Pocket Bot is a playable Nimiq Mini App about teaching a small software helper to spend scarce attention wisely. The player and Pocket Bot enter a compact RPG-style market map called Market Signal Scout. The bot starts with a tempting policy: bright signal looks promising, act quickly. The player can ask the bot for a bounded LLM route proposal, approve it, redirect it, inspect first, ask what remains unknown, or mark progress as partial.

Every move has visible cost. Bot Attention is spent only after the player approves a legal deterministic move. Nimiq Pocket value is shown as a low-stakes testnet/local pocket status, not as broad wallet authority. The app never asks for signing, sending, checkout, mainnet spending, or custody. OpenAI proposals run through a server-side relay and are schema-validated before they can update the pending move.

The first scenario uses transformed Binance BTCUSDT public market data and attributed historical headlines as fictionalized game witnesses. The goal is not trading advice. The goal is to teach the bot to notice hidden support, exit friction, urgency pressure, and false-finish traps before calling a path safe.

Pocket Bot is for independent users who want useful AI helpers without surrendering judgment. It turns alignment into gameplay: spend attention, reveal partial truth, carry residue, record a trace, and let user guidance shape the next proposal. Phase 1 demonstrates the loop inside Nimiq Pay on mobile while keeping real-value risk postponed. The build is hosted on Vercel and verified in Android Nimiq Pay for submission.

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

The revised resource-judgment gameplay now has the first playable guidance loop with trace-card review, session-only lesson application, and an explicit low-stakes Nimiq pocket status surface. The Nimiq Pay Testnet Mini App path was verified on an Android emulator on June 7, 2026. Direct desktop/mobile browser TestAlbatross support is postponed; the current submission path now moves to final Android/Nimiq Pay polish.

## Documentation

- Product requirements: `docs/product/requirements.md`
- Art bible: `docs/product/art_bible.md`
- RPG map tooling: `docs/architecture/rpg_map_tooling.md`
- Deployment architecture: `docs/architecture/deployment.md`
- Phase 1 implementation plan: `docs/planning/mvp_implementation_plan.md`
- Test strategy: `docs/testing/test_strategy.md`
- Source attribution register: `docs/product/source_attribution.md`
- Market Signal Scout scenario: `docs/product/scenarios/market_signal_scout.md`
- Market witness governance: `docs/product/scenarios/market_witness_governance.md`
- Reward mode boundary: `docs/product/reward_mode_boundary.md`
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
npm run check:no-secrets
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

Competition no-secrets check:

```bash
npm run check:no-secrets
```

This scans tracked/unignored files plus forbidden repo-local env files for
high-confidence provider keys, private-key blocks, and wallet-secret
assignments. It is a guardrail for hardcoded credentials, not a replacement for
deployment-secret hygiene.

The first hosted deployment target is Vercel. The repo includes
`api/route-proposal.js` for the production serverless relay and `vercel.json`
for the Vite build output. Configure `NIMIRUN_LLM_MODE`,
`OPENAI_ROUTE_PROPOSAL_MODEL`, and `OPENAI_API_KEY` in Vercel Project Settings
-> Environment Variables.

Current hosted app URL:

```text
https://nimi-run-code-repo.vercel.app
```

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
