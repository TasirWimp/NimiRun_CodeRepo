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

## Current Known Sources

| Source | Type | How Pocket Bot uses it | Shipping / runtime status |
|---|---|---|---|
| Nimiq homepage: https://www.nimiq.com/ | Brand/product framing source | Supports the public "Universal Money for Independent Individuals" framing and the name meaning that Nimiq is an object or force that binds things together. Pocket Bot uses this to frame Nimiq as a binding layer for attention, value, user judgment, trace, and re-entry. | Documentation source only; not a software dependency. |
| Nimiq About page: https://www.nimiq.com/about | Brand/product framing source | Supports the accessible "crypto for humans" positioning and reinforces the name meaning used by the product metaphor. | Documentation source only; not a software dependency. |
| Nimiq Mini Apps documentation: https://nimiq.dev/mini-apps/ | Platform documentation | Competition framework target and Mini App compatibility guidance. | Intended platform target; Mini App SDK may be used at runtime behind `src/platform/nimiqMiniApp.js`. |
| Nimiq Mini Apps Competition announcement: https://www.nimiq.com/blog/the-nimiq-mini-apps-competition-registration-is-open/ | Competition framing source | Supports the competition requirement that Mini Apps use the framework and run inside Nimiq Pay as useful, user-facing apps. | Documentation source only; not a software dependency. |
| Nimiq Mini Apps Competition scoring guide: https://miniappscompetition.com/scoring | Competition delivery source | Supports treating design/UX, functionality, usefulness/originality, and marketing/distribution as delivery constraints. Pocket Bot should not optimize only for scoring, but the plan must avoid obvious scoring and submission failures. | Documentation source only; not a software dependency. |
| Nimiq Mini Apps Competition rules: https://miniappscompetition.com/rules | Competition requirement source | Supports the submission floor: public GitHub repo, Mini Apps Framework, no hardcoded secrets, original/attributed code, first-try usability, and meaningful Nimiq Pay integration with USDT or NIM support. | Documentation source only; not a software dependency. |
| Nimiq Mini Apps Competition FAQ: https://miniappscompetition.com/faq | Competition requirement source | Supports the need for a working Mini App, a real user-facing story, community feedback, and NIM incentive consideration. | Documentation source only; not a software dependency. |
| `@nimiq/mini-app-sdk` | Implementation dependency | Mini App provider initialization boundary. | Listed in `package.json`; runtime use stays behind the platform adapter. |
| Phaser 3: https://phaser.io/ | Implementation dependency | 2D game framework for the playable Pocket Bot scene. | Listed in `package.json`; shipped in the client bundle. |
| Vite: https://vite.dev/ | Build tooling | Local development and production bundling. | Listed in `package.json`; development/build dependency. |
| Vitest: https://vitest.dev/ | Test tooling | Domain and integration-adjacent unit tests. | Listed in `package.json`; development/test dependency. |
| CRPM repo: `C:\Users\jensb\Desktop\Projects\CRPM` | Design discipline / conceptual source | Provides the internal discipline behind pressure, cuts, carriers, residue, protected outcomes, landfall, and re-entry. Pocket Bot translates these into player-facing game terms. | Not a software dependency; not bundled; normal UI should not expose raw CRPM jargon. |
| Agent Desktop Automation MCP Server repo: `C:\Users\jensb\Desktop\Projects\Agent_Desktop _Automation_MCP_Server` | Runtime design source | Provides the bounded session, transition-gate, carrier, residue, and closure-gate pattern adapted into the Pocket Bot run loop. | Not a software dependency; not bundled; no desktop automation tools are used by the game runtime. |
| OpenAI API / GPT model documentation | Planned service documentation | Phase 1 may use a low-cost GPT model behind a server-side relay for route proposals. The exact model must be selected from current official docs during implementation. | Future runtime service only if configured; provider keys must never be bundled into browser code. |
| OpenAI Operator announcement and system card | Research context | Background reference for user-visible agent control, action boundaries, and receipts. | Not a dependency; research context only. |
| x402, Coinbase x402, Base AI agents, and related papers | Research context / future planning | Background for future paid-resource governance and agent-payment risks. | Not Phase 1 implementation; not bundled; no x402 flow in MVP. |

## Sources To Add When Adopted

Add entries before or in the same commit that adopts any of these:

- Historic chart data source used to derive `Market Signal Scout` event windows,
  including provider name, URL, license/terms note, date range, transformation
  method, and whether raw data or only derived static fixtures are shipped.
- RPG map authoring tool or framework, such as Tiled or LDtk.
- Asset packs, fonts, icon libraries, generated sprites, generated tiles, music,
  sound effects, or AI-generated images.
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
