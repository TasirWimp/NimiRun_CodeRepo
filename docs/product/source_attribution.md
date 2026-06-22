# Source Attribution Register

This document tracks non-obvious sources, design influences, frameworks,
services, and local repositories used by Pocket Bot. It exists because the
Nimiq Mini App competition requires explicit disclosure of resources that are
not plain standard implementation work.

Use this register as the documentation sub-agent's attribution checklist. When
a feature uses a source, concept, SDK, framework, model, generated asset, local
repository, or third-party documentation that is not obvious from plain
JavaScript/HTML/CSS implementation, add or update an entry here and link to it
from the relevant planning or product document.

## Attribution Rules

- Name every non-standard implementation dependency, design source, local repo,
  external paper, SDK, framework, model, asset source, generated asset workflow,
  and non-trivial documentation source used for the competition prototype.
- State whether each source is an implementation dependency, design influence,
  research context, test/tooling dependency, or future-planning reference.
- State whether the source is bundled into the app, called at runtime, used only
  during development, or used only as design documentation.
- Keep user-facing product claims separate from source-supported facts.
- Do not imply that a source endorses Pocket Bot unless there is explicit
  evidence.
- If a source informs gameplay or architecture but is not shipped as code, say
  that clearly.

## Competition License And Use Proof Summary

This summary is the competition-facing proof surface. Package license values
are taken from the installed package metadata in `node_modules/*/package.json`
and the locked package entries in `package-lock.json`; source and data licenses
are backed by the URLs in the attribution table below.

| Resource | Proof recorded | Bundled / runtime use | Competition note |
|---|---|---|---|
| Pocket Bot repo code | Root `LICENSE` and `package.json` declare MIT. | Public app source and docs. | Repo license is explicit for reviewers. |
| `@nimiq/mini-app-sdk` `0.1.0` | Installed package metadata declares MIT; package-lock pins `0.1.0`. | Runtime dependency behind `src/platform/nimiqMiniApp.js`. | Used for Mini App provider/status boundary only; no sign/send authority in Phase 1. |
| Phaser `3.87.0` | Installed package metadata declares MIT; package-lock pins `3.87.0`. | Bundled client game framework. | Primary 2D scene/runtime framework. |
| Vite `7.3.3` and Vitest `3.2.4` | Installed package metadata declares MIT; package-lock pins both versions. | Build and test tooling. | Development tooling, not player-facing source material. |
| Terser `5.31.2` | Installed package metadata declares BSD-2-Clause; package-lock pins `5.31.2`. | Production minifier through Vite config. | Build tooling. |
| Binance Public Data BTCUSDT fixture | Binance Public Data README lists MIT; exact archive URL and checksum are recorded below. | Transformed static witness fixture only; raw archive is not shipped. | Venue-scoped Binance BTCUSDT witness, not global Bitcoin index or investment advice. |
| Historical market headlines | Cboe, CME, and CFTC URLs/titles are recorded below. | Static title/URL witness metadata only; no article bodies copied. | Used as event witnesses and mechanics connectors, not trading/legal advice. |
| NimiRun V2 asset pack | Project-owner-provided generated asset pack, copied from the local source path listed below. | Bundled runtime art under `public/assets/nimirun-v2/`. | No stock/source pack is known; if the submission form asks for generation tool/model proof, project owner should provide that provenance note. |
| OpenAI route proposal service | Official OpenAI API/structured-output docs are recorded below; no OpenAI SDK or model weights are bundled. | Optional server-side relay call only when deployment secrets configure it. | API keys live in shell/deployment secrets; browser bundle must not include provider keys. |

## Current Known Sources

| Source | Type | How Pocket Bot uses it | Shipping / runtime status |
|---|---|---|---|
| Nimiq homepage: https://www.nimiq.com/ | Brand/product framing source | Supports the public "Universal Money for Independent Individuals" framing and the name meaning that Nimiq is an object or force that binds things together. Pocket Bot uses this to frame Nimiq as a binding layer for attention, value, user judgment, trace, and re-entry. | Documentation source only; not a software dependency. |
| Nimiq About page: https://www.nimiq.com/about | Brand/product framing source | Supports the accessible "crypto for humans" positioning and reinforces the name meaning used by the product metaphor. | Documentation source only; not a software dependency. |
| Nimiq Mini Apps documentation: https://nimiq.dev/mini-apps/ | Platform documentation | Competition framework target and Mini App compatibility guidance. | Intended platform target; Mini App SDK may be used at runtime behind `src/platform/nimiqMiniApp.js`. |
| Nimiq Provider API: https://nimiq.dev/mini-apps/api-reference/nimiq-provider | Platform API documentation | PB-012 uses the documented provider boundary for explicit NIM account/status checks through `init()`, `listAccounts()`, `isConsensusEstablished()`, and `getBlockNumber()`. Sign/send methods are documented but intentionally not called in Phase 1. | Runtime platform reference; provider calls occur only inside Nimiq Pay after user-triggered status check. |
| Nimiq local Mini App and testnet guide: https://nimiq.dev/mini-apps/load-local-mini-app | Development and manual-test documentation | Defines the local Mini App loading path and testnet-switch behavior used for PB-012 manual test planning. The Android emulator check on June 7, 2026 used this path with Nimiq Pay forced to Testnet and a local URL loaded through Mini Apps. | Development/manual-test source only; not bundled. |
| Nimiq EVM token guide: https://nimiq.dev/mini-apps/evm-tokens | Future-planning reference | Clarifies the USDT/EVM route available through `window.ethereum`. PB-012 chooses native NIM status for Phase 1 and does not implement USDT balance or transfer behavior. | Documentation-only future reference; no EVM token library or transfer flow is bundled. |
| Nimiq Web Client getting started: https://nimiq.dev/web-client/getting-started | Future implementation planning source | Supports PB-012A planning for desktop/mobile browser TestAlbatross status through the browser Web Client path. The first planned use is read-only consensus/head status, not wallet creation, signing, sending, or transaction broadcast. | Documentation source only until PB-012A adopts `@nimiq/core`; not currently bundled by PB-012. |
| Nimiq Web Client Vite integration: https://nimiq.dev/web-client/integrations/vite | Future build planning source | Identifies the Vite/WebAssembly setup needed if PB-012A adopts `@nimiq/core`, including WebAssembly and top-level-await plugin requirements. | Documentation source only until PB-012A adds the implementation dependencies. |
| Nimiq Mini Apps Competition announcement: https://www.nimiq.com/blog/the-nimiq-mini-apps-competition-registration-is-open/ | Competition framing source | Supports the competition requirement that Mini Apps use the framework and run inside Nimiq Pay as useful, user-facing apps. | Documentation source only; not a software dependency. |
| Nimiq Mini Apps Competition scoring guide: https://miniappscompetition.com/scoring | Competition delivery source | Supports treating design/UX, functionality, usefulness/originality, and marketing/distribution as delivery constraints. Pocket Bot should not optimize only for scoring, but the plan must avoid obvious scoring and submission failures. | Documentation source only; not a software dependency. |
| Nimiq Mini Apps Competition rules: https://miniappscompetition.com/rules | Competition requirement source | Supports the submission floor: public GitHub repo, Mini Apps Framework, no hardcoded secrets, original/attributed code, first-try usability, and meaningful Nimiq Pay integration with USDT or NIM support. | Documentation source only; not a software dependency. |
| Nimiq Mini Apps Competition FAQ: https://miniappscompetition.com/faq | Competition requirement source | Supports the need for a working Mini App, a real user-facing story, community feedback, and NIM incentive consideration. | Documentation source only; not a software dependency. |
| `@nimiq/mini-app-sdk` | Implementation dependency | Mini App provider initialization boundary. | Listed in `package.json`; runtime use stays behind the platform adapter. |
| Phaser 3: https://phaser.io/ | Implementation dependency | 2D game framework for the playable Pocket Bot scene. | Listed in `package.json`; shipped in the client bundle. |
| Vite: https://vite.dev/ | Build tooling | Local development and production bundling. | Listed in `package.json`; development/build dependency. |
| Vitest: https://vitest.dev/ | Test tooling | Domain and integration-adjacent unit tests. | Listed in `package.json`; development/test dependency. |
| Vercel Functions and environment variables: https://vercel.com/docs/functions, https://vercel.com/docs/environment-variables | Hosted deployment and secret-management source | Provides the first Phase 1 hosted deployment target: static Vite output plus same-origin `/api/route-proposal` serverless relay. Vercel environment variables hold provider keys for function execution. | Optional hosted deployment platform; no provider keys are committed or bundled. |
| CRPM repo: `C:\Users\jensb\Desktop\Projects\CRPM` | Design discipline / conceptual source | Provides the internal discipline behind pressure, cuts, carriers, residue, protected outcomes, landfall, and re-entry. Pocket Bot translates these into player-facing game terms. | Not a software dependency; not bundled; normal UI should not expose raw CRPM jargon. |
| Agent Desktop Automation MCP Server repo: `C:\Users\jensb\Desktop\Projects\Agent_Desktop _Automation_MCP_Server` | Runtime design source | Provides the bounded session, transition-gate, carrier, residue, and closure-gate pattern adapted into the Pocket Bot run loop. | Not a software dependency; not bundled; no desktop automation tools are used by the game runtime. |
| Pocket Bot storyboard reference image: `C:\Users\jensb\Downloads\ChatGPT Image Jun 5, 2026, 10_23_27 PM.png` | Generated design reference / storyboard | Informs `docs/product/art_bible.md`: dark storybook RPG mood, gold/blue/purple/green signal palette, Pocket Bot silhouette, Nimiq pocket object, trace cards, context slots, false finish, and safe finish visual language. | Local design reference only; not bundled into the app unless later copied into the repo and attributed as a shipped asset. |
| NimiRun V2 game asset pack: `C:\Users\jensb\Downloads\nimirun_v2_game_assets` | Project-owner-provided generated runtime asset pack | Provides the current PB-005 runtime art: source-ocean map background, node pads/icons/rings, path threads, fog overlays, Pocket Bot V2 sprites, context slot images, and HUD/proposal/trace panel frames. | Bundled into the app under `public/assets/nimirun-v2/`; manifest and preload helper live under `src/game/assets/`. Generation tool/model and final competition license note should be confirmed before submission. |
| Market witness governance: `docs/product/scenarios/market_witness_governance.md` and `src/game/scenarios/marketWitnessLedger.js` | Internal scenario-governance artifact / implementation scaffold | Defines how historical market material must become attributed, transformed, static witnesses before it can influence `Market Signal Scout` clues, hidden pressure, traces, or hindsight cards. | The ledger module is bundled source and wired into the PB-013 Golden Signal scenario; no live market API or broad raw historical data archive is bundled. |
| Market world model: `docs/product/market_world_model.md` and `src/game/scenarios/marketWorldLevels.js` | Internal implementation-base design note / scenario contract scaffold | Converts the existing Market Signal Scout witness ledger, Binance fixture, historic headline witnesses, narrator role cut, and reward boundary into a relational market-arena contract for later gameplay refinement. | Design note and source module are in the repo; the module is validated by tests but is not yet the live scene source of truth. It does not authorize live market data, investment advice, exchange execution, wallet authority, or persistent trading strategy export. |
| Pocket Bot arena narrator role cut: `docs/product/pocket_bot_arena_narrator_role_cut.md` | Internal CRPM-derived design lineage and role-boundary note | Defines the former signal-bot story, private narrator/world grammar, trace-backed repair rules, and player-facing language boundaries for later Market Signal Scout refinement. It explicitly names the CRPM repository artifacts that informed the design reading. | Documentation source only; not bundled as runtime code; normal UI should keep CRPM and relational-navigation terminology hidden behind plain game language. |
| Binance Public Data: https://github.com/binance/binance-public-data and https://data.binance.vision/ | Adopted PB-013 market-data fixture source | Source for the transformed Golden Signal Binance spot `BTCUSDT` 1d fixture in `src/game/scenarios/data/marketSignalScoutBtcusdtWindows.js`. Exact authoring archive: `https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1d/BTCUSDT-1d-2017-12.zip`; checksum URL: `https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1d/BTCUSDT-1d-2017-12.zip.CHECKSUM`; checksum: `45bf1c515b1108668b6bf10f7af323585f30cdf68e096cb71e6e3bb6aa0e9cb4`; retrieved 2026-06-08. The fixture covers 2017-12-01 through 2017-12-24 and is scoped as Binance BTCUSDT venue history, not a global Bitcoin index. License evidence: MIT listed in the Binance Public Data README. | Bundled as a small transformed static fixture; broad raw zip/CSV archive is not committed or shipped; no live Binance API/runtime fetch. |
| Cboe Bitcoin futures launch announcement: https://ir.cboe.com/news/news-details/2017/Cboe-Plans-December-10-Launch-of-Bitcoin-Futures-Trading-12-04-2017/default.aspx | Historical event headline witness | Adopted source headline/title for the Golden Signal `Futures Gate` event surface: `Cboe Plans December 10 Launch of Bitcoin Futures Trading`. The title and URL are used as attribution and paired with project-authored mechanics connector text. No article body is copied. | Bundled only as static witness metadata in `src/game/scenarios/marketWitnessLedger.js`; no exchange/trading integration. |
| CME Bitcoin futures launch announcement: https://www.cmegroup.com/media-room/press-releases/2017/12/01/cme_group_self-certifiesbitcoinfuturestolaunchdec18.html | Historical event headline witness | Adopted source headline/title for Golden Signal event-pressure/FOMO surface: `CME Group Self-Certifies Bitcoin Futures to Launch Dec. 18`. The title and URL are used as attribution and paired with project-authored mechanics connector text. No article body is copied. | Bundled only as static witness metadata in `src/game/scenarios/marketWitnessLedger.js`; no exchange/trading integration. |
| CFTC bitcoin products self-certification statement: https://www.cftc.gov/PressRoom/PressReleases/7654-17 | Historical event headline witness / regulatory context | Adopted source title/context for the Golden Signal exit-friction surface: `CFTC Statement on Self-Certification of Bitcoin Products by CME, CFE and Cantor Exchange`. The title and URL are used as attribution and paired with project-authored mechanics connector text. No article body is copied. | Bundled only as static witness metadata in `src/game/scenarios/marketWitnessLedger.js`; no legal, investment, or trading claim. |
| Reward mode boundary: `docs/product/reward_mode_boundary.md` | Internal future-planning and safety boundary | Separates Phase 1 Pocket Spark / trace-quality scoring from any future NIM-denominated reward experiment and preserves the no-trading/no-user-debit boundary. | Documentation source only; no reward runtime, token payout, or user-account adjustment is implemented. |
| OpenAI API model, text generation, and structured output docs: https://developers.openai.com/api/docs/models/gpt-5.4, https://developers.openai.com/api/docs/guides/text-generation, https://developers.openai.com/api/docs/guides/structured-outputs | Runtime service documentation | PB-007 uses the OpenAI Responses API shape and strict JSON-schema structured outputs for route proposals. The local default model is `gpt-5.4-mini`, selected from current official model guidance on June 6, 2026 as a lower-cost GPT option. | Optional runtime service only when configured through the server-side relay. Provider keys must never be bundled into browser code. Local mock mode works without an API key. |
| OpenAI Operator announcement and system card | Research context | Background reference for user-visible agent control, action boundaries, and receipts. | Not a dependency; research context only. |
| x402, Coinbase x402, Base AI agents, and related papers | Research context / future planning | Background for future paid-resource governance and agent-payment risks. | Not Phase 1 implementation; not bundled; no x402 flow in MVP. |

## Sources To Add When Adopted

Add entries before or in the same commit that adopts any of these:

- Historic chart data source used to derive `Market Signal Scout` event windows,
  including provider name, URL, license/terms note, date range, transformation
  method, and whether raw data or only derived static fixtures are shipped.
- RPG map authoring tool or framework, such as Tiled or LDtk.
- Additional asset packs, fonts, icon libraries, generated sprites, generated
  tiles, music, sound effects, or AI-generated images beyond the NimiRun V2
  pack above.
- Any live LLM provider, model id, pricing source, prompt library, schema helper,
  backend relay framework, or hosting platform.
- Any Nimiq testnet faucet, explorer, wallet, provider, or transaction reference.
- Any browser automation, screenshot, or visual-regression tooling.
- Any copied algorithm, code pattern, tutorial, starter template, or example
  beyond ordinary documentation lookup.

## Documentation Sub-Agent Task

Before competition submission, the documentation sub-agent should audit:

- `package.json`,
- `src/`,
- `docs/product/`,
- `docs/planning/`,
- `docs/testing/`,
- generated assets and public assets,
- final README / submission text.

The audit should confirm that every non-standard source is listed here, that
claims in the pitch and requirements do not overstate what sources support, and
that local design sources such as CRPM and Agent Desktop Automation are credited
as design inputs rather than hidden dependencies.
