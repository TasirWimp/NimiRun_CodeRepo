# Pocket Bot Project Requirements

## Current Phase 1 Refinement

As of the current Phase 1 plan, Pocket Bot is centered on **resource judgment in lossy environments**.

The earlier allowance-control scenario is retained as useful groundwork and as a later application, but it is no longer the whole Phase 1 MVP. Current Phase 1 should build a playable Nimiq Mini App mini game where:

- the bot spends **Bot Attention** to inspect, ask, remember, skip, or act,
- Nimiq pocket money is shown as collectible/testnet/recharge value,
- the user spends attention by guiding and correcting the bot,
- a low-cost GPT model proposes structured moves through a server-side relay,
- deterministic game/resource rules validate proposals before state changes,
- memory is session/context-window only,
- persistent memory and real-world task bridges start in later phases.

When older allowance-control examples appear in this document, treat them as supporting groundwork or later paid-resource applications. Use `docs/product/roadmap.md` and `docs/planning/mvp_implementation_plan.md` as the current Phase 1 scope.

## 1. Project Title

**Pocket Bot** is a playful Nimiq mini app prototype about teaching a software helper how to spend scarce resources well in messy, lossy environments.

Tagline:

> Train your bot to spend attention wisely.
>
> Product promise: bind attention to judgment, and keep control of the pocket.
>
> Independent individuals should be able to guide what their bot pays attention to, when it asks, what it remembers, when it spends pocket value, and what trace it leaves behind.

The product should use a compact 2D game scene to make hidden assumptions, limited attention, context capacity, pocket value, user guidance, and trace review visible.

The project is intentionally framed around **personal control for independent individuals**, not enterprise automation. The robot is a personal helper learning the user's judgment, not a corporate autonomous agent with broad spending authority.

## 2. Project Reason

This project is being developed for the **Nimiq Mini Apps Competition**.

Nimiq publicly frames itself as **"Universal Money for Independent Individuals"** and emphasizes accessible, intuitive apps that put people back in control. Nimiq also explains its name as an object or force that binds things together. Pocket Bot should align with both meanings: independent individuals keep control, and the game makes the binding between attention, pocket value, user judgment, hidden uncertainty, trace, and re-entry visible.

The goal is not to build a full autonomous agent economy. The goal is to create a small, playful, competition-ready prototype that demonstrates:

- a helper with limited Bot Attention,
- a Nimiq pocket value surface that stays under user control,
- visible resource and context boundaries,
- human guidance before ambiguous or costly actions,
- trace cards that bind action, cost, reveal, residue, and lesson,
- and clear review of why the bot did or did not finish safely.

The current repository already contains a Phaser 3 + Vite game foundation. The requirements in this document guide the first product milestone before implementing new features.

## 3. Competition Context

Pocket Bot should be suitable as a Nimiq mini app competition entry.

The competition-relevant idea is that Nimiq can provide the wallet and value layer, while the game world provides the human interface layer. The prototype should demonstrate how pocket value, limited attention, user guidance, and trace can become an understandable, guided interaction in a mini app.

As of the public competition guidance on June 3, 2026, Pocket Bot must use the Nimiq Mini App framework. The Phaser/Vite app should be built as a web app that can run inside Nimiq Pay's Mini App WebView, with Nimiq provider access isolated behind a small adapter when it is introduced.

For the internal CRPM/resource-judgment MVP, wallet and payment behavior may
remain simulated while Mini App framework compatibility is established. For
competition submission readiness, the project must separately close the
smallest safe Nimiq Pay integration path and NIM/USDT support decision without
granting broad wallet authority or turning the app into a payment dashboard.

Competition delivery should be treated as a floor, not the product's north
star. Pocket Bot should remain a CRPM-shaped resource-judgment game, but it
must not ignore competition basics:

- usable on first try by a real person,
- touch-friendly and understandable within about 60 seconds,
- built on the Nimiq Pay Mini Apps Framework,
- no hardcoded private keys, API secrets, or sensitive credentials,
- public, attributed, MIT-licensed code,
- a clear decision and implementation path for meaningful Nimiq Pay integration
  with NIM or USDT support before submission.

If NIM/USDT support is not implemented yet, the app may still be a useful
internal Phase 1 demo, but it should not be treated as competition-ready.

Because this is a competition prototype, non-standard resources and design
sources must be explicitly attributed. The source register is
`docs/product/source_attribution.md`. It must include local design sources such
as the CRPM repo and Agent Desktop Automation MCP Server repo, external
documentation such as Nimiq Mini Apps docs, implementation dependencies, model
or API sources, generated assets, and any other resource that is not plain
standard implementation work.

Competition readiness is tracked in `docs/product/competition_scorecard.md`.
That scorecard must not mark the app ready while Mini App framework path,
NIM/USDT support, no-secrets scan, public MIT repo, mobile 60-second path,
vertical slice, submission story, or community feedback remain blocked or
unknown.

The project should avoid heavy enterprise language. It should feel closer to:

> A playful Nimiq mini app where an independent individual teaches a small robot helper to bind limited attention, pocket value, guidance, and trace into better decisions.

## 4. Problem Statement

As digital money becomes more programmable, people may increasingly allow software helpers to propose or prepare paid actions. But users should not need to give a helper broad wallet access or trust it blindly.

Users need to understand:

- how much allowance the helper has,
- what the helper is allowed to spend on,
- which budget envelope an action will use,
- whether the cost fits the rules,
- whether the tool or service is allowed,
- whether the action needs approval,
- what happened after execution,
- and how to inspect the receipt later.

The interface problem is to make these checks visible without forcing the user to read a technical audit log or understand agent infrastructure.

## 5. Product Thesis

Pocket Bot explores how Nimiq can be the value carrier for a gamified helper-training loop.

The core thesis is **resource judgment in lossy environments**. Real tasks contain incomplete information, hidden assumptions, ambiguous routes, and scarce resources. A useful helper must learn how this user wants those resources spent on the path to a goal.

Pocket Bot's core resources are:

- **Bot Attention:** thinking/action energy. It maps later to LLM tokens, API calls, tool calls, and reasoning time.
- **Nimiq Pocket Money:** collectible, testnet, or later fundable value that can recharge or unlock Bot Attention.
- **User Attention:** the player's guidance, correction, approval, and preference signal.
- **Context Capacity:** limited short-term working memory during a run.
- **Skills / Persistent Memory:** durable upgrades introduced after Phase 1.

Detailed infrastructure context for x402-like payment rails, Nimiq-to-x402 compatibility levels, and product boundaries lives in `docs/product/infrastructure_context.md`. Pitch wording lives in `docs/product/pitch.md`. Phased delivery boundaries live in `docs/product/roadmap.md`.

The system should not claim to validate a robot's or AI agent's inner intention. Instead, it should validate whether a proposed move is legal inside the current resource rules, whether the user has guided or corrected it, and what trace remains afterward.

The revised core product loop is:

1. user gives or selects a goal,
2. bot sees a messy, lossy map with hidden assumptions,
3. LLM proposes a structured next move,
4. deterministic resource rules validate the move,
5. user approves, redirects, or corrects,
6. approved move spends Bot Attention or another visible resource,
7. map state changes and partial truth is revealed,
8. trace card records what happened,
9. user feedback creates a session lesson,
10. later proposal reflects the session lesson within the same run.

Product principles:

> Delegation should never mean losing control of attention, memory, or pocket value.
>
> Train the bot's attention. Keep control of the pocket.

## 6. Target Users

Primary target users:

- Nimiq Mini Apps Competition judges evaluating usefulness, clarity, playfulness, and fit with wallet/payment interactions.
- Crypto-curious individuals who understand payments but may not understand autonomous or delegated software actions.
- Nimiq users who value simple, accessible, self-controlled money tools.
- Users curious about letting software help with small paid tasks without exposing their full wallet.

Secondary target users:

- Builders exploring human-in-the-loop controls for wallets and AI helpers.
- Product designers exploring wallet UX for delegated payments.
- Developers who need a simple prototype to extend toward later Nimiq wallet/provider capabilities.

The MVP should be understandable to a non-enterprise user. It should not require knowledge of AI governance, enterprise procurement, or agent-economy theory.

## 7. Core Use Case

The initial use case is a single robot helper navigating a small, messy task landscape with limited Bot Attention and limited context.

The first playable task should make hidden assumptions and resource tradeoffs concrete. The bot may inspect a clue, ask the user, remember a limited fact, skip an uncertain node, or act toward the goal. Each move has a cost or tradeoff.

### Source-Backed Motivation

Public examples show that this is a real product problem, not only a speculative crypto scenario:

- Browser and shopping agents already prepare purchase-adjacent actions. OpenAI Operator describes user confirmation before significant actions such as submitting orders, and takeover mode for payment information. SayToBuy describes an AI shopping assistant that builds a grocery cart, then hands the user off to the store checkout.
- Developers report agents getting stuck in loops and spending real API money. Public LangChain/agent posts describe incidents such as agents burning hundreds of dollars through repeated OpenAI or third-party API calls before a human noticed.
- Recent research on agentic coding tasks reports that AI-agent token usage can be highly variable across runs, which makes spend hard to predict from the user's original task alone.

These sources support one application of the broader Pocket Bot question:

> Can a Nimiq mini app make a helper's limited attention, pocket value, user guidance, and trace history visible before the helper spends scarce resources?

Reference sources:

- [OpenAI Operator announcement](https://openai.com/index/introducing-operator/)
- [OpenAI Operator system card](https://cdn.openai.com/operator_system_card.pdf)
- [SayToBuy AI shopping assistant](https://www.saytobuy.com/)
- [Reddit report: AI agent burned API spend overnight](https://www.reddit.com/r/SaaS/comments/1s8h2j5/my_ai_agent_silently_burned_800_in_api_calls/)
- [Reddit report: per-agent spending caps for production agents](https://www.reddit.com/r/LangChain/comments/1sx9b4n/psa_peragent_spending_caps_changed_how_we_think/)
- [arXiv: How Do AI Agents Spend Your Money?](https://arxiv.org/abs/2604.22750)

### First-Class MVP Scenario

Pocket Bot helps the user guide a bot through an abstract, lossy task map.

Example goal:

> Find the safest useful path to the result before Bot Attention runs out.

Example bot proposal:

> I can inspect the fogged clue node first. Cost: 2 Bot Attention. Reason: you prefer cheap scouting before expensive action, and this node may reveal whether the shortcut hides a cost.

System checks:

- Is the proposed move one of the allowed move types?
- Does the bot have enough Bot Attention?
- Does the move fit current Context Capacity?
- Does the move require user guidance before spending more resources?
- Does the move attempt any blocked action such as checkout, broad wallet access, or uncontrolled external service execution?

Possible outcomes:

- **Approved move:** the user accepts the move, Bot Attention is spent, and the map changes.
- **Redirected move:** the user points the bot to a cheaper, safer, or more relevant route before resources are spent.
- **Blocked move:** deterministic rules reject an unsafe, unbounded, or impossible proposal.

After execution, a trace card records the proposal, user guidance, resource spend, revealed information, and outcome.

Important MVP note:

The bot may use a real LLM API through a backend relay to propose moves. The LLM must not directly mutate game state, spend resources, access wallet functions, or bypass deterministic resource rules. Persistent memory and real-world task execution remain later-phase work.

Credential handling requirement:

Real provider keys must be supplied through shell/session environment variables
or deployment secret stores. Repo-local env files are not the preferred place for
real keys and must never be committed, bundled into browser code, or used as
competition submission artifacts.

### Later Paid-Resource Example

The earlier **Tool Scout** example is retained as a later paid-resource application. Its role is to show how the same resource-judgment loop can govern paid helper tools once the core game loop is proven.

## 8. MVP Scope

The Phase 1 MVP is a small playable Phaser scene with RPG-style map mechanics, not a large RPG.

The required first scene is **Pocket Bot Workshop**.

The MVP must include:

- one robot helper,
- one compact lossy map with fog, route nodes, hidden assumptions, and a goal,
- one Bot Attention meter,
- one Nimiq Pocket meter using local fallback and/or testnet status,
- one User Attention / guidance surface,
- one Context Capacity display,
- one LLM-backed structured route proposal flow through a server-side relay,
- deterministic resource checks outside the LLM,
- one session-only lesson that changes a later proposal,
- one trace archive,
- one visible UI overlay for resources, current goal, proposal, guidance, and trace state.

The Phase 1 MVP remains small: one bot, one lossy map, one attention budget, one pocket-value surface, one route-proposal loop, one session lesson, and trace cards. It must use a Nimiq Mini App-compatible app shell. It may include a real LLM API call through a server-side relay, but it must not expose provider API keys in client code.

The MVP should keep the existing Phaser 3 + Vite foundation. The current implementation uses `src/main.js` as the entry point and `src/scenes/Street.js` as the active scene. Future implementation should adapt or extend the existing foundation instead of replacing the project structure.

The MVP should remain usable in a normal local browser for development and test runs, while being structured so it can also be opened and tested inside Nimiq Pay as a Mini App.

The MVP does not implement persistent learning. It may demonstrate session/context-window learning by applying one player correction later in the same run. Durable memory, skills, and real-world task transfer belong to Phase 2 and later.

## 9. Non-Goals For MVP

The MVP should not include:

- Nimiq mainnet value,
- real Nimiq provider wallet operations through the Mini App SDK,
- broad wallet permission,
- uncontrolled signing, sending, payment, or checkout,
- provider API keys in browser code,
- real paid external-service execution,
- x402 integration,
- persistent memory or durable user profiles,
- autonomous model self-improvement claims,
- real-value rewards,
- real ordering, checkout, or external-service execution,
- multiple robots,
- multiple large maps,
- persistent backend storage beyond the minimum stateless LLM relay,
- user authentication,
- exportable audit logs,
- complex policy editor,
- trust levels,
- large RPG maps,
- inventory bloat,
- combat, quests, or unrelated game mechanics,
- enterprise procurement or compliance workflows.

These may be considered future features after the first milestone demonstrates the core resource-judgment loop.

## 10. Functional Requirements

### Nimiq Mini App Framework Compatibility

- The app must be structured as a Nimiq Mini App-compatible Phaser/Vite web app.
- Mini App environment access must be isolated behind a small adapter or platform module, not scattered through Phaser scene code.
- Local development must keep a browser fallback when the app is not opened inside Nimiq Pay.
- Phase 1 may include explicit, user-triggered Nimiq testnet status or pocket experiments.
- Phase 1 must not trigger mainnet value movement, uncontrolled signing, uncontrolled sending, checkout, or broad wallet permission.
- UI wording must clearly distinguish local fallback, testnet pocket value, Bot Attention, and any future real Nimiq wallet activity.

### Rule / Allowance

- The app must display the active goal and resource constraints in concise language.
- The MVP rules must include allowed move types, Bot Attention costs, context-slot limits, and blocked actions.
- The app must distinguish approved, redirected, and blocked moves.
- The language should use simple terms such as **goal**, **attention**, **pocket**, **context**, **guidance**, and **trace** before introducing advanced terms like policy or mandate.
- The UI must communicate that the helper has limited Bot Attention and no broad wallet access.

### Bot Attention / Nimiq Pocket

- The app must show one visible Bot Attention budget.
- Bot Attention must decrease only after an approved move executes.
- The UI must show remaining Bot Attention after each executed move.
- The app must show one visible Nimiq Pocket meter using local fallback and/or testnet status.
- Nimiq Pocket must be visually separate from Bot Attention.
- Nimiq Pocket should be represented as a pouch, pocket, backpack, or small fund controlled by the user.
- Phase 1 must frame Nimiq Pocket as collectible/testnet/recharge potential, not as broad wallet access.

### Need Navigation / Resource Strategy

- A helper's resource decision is not trivial.
- Phase 1 must capture why the helper thinks a move is useful.
- A proposal should explain:
  - why this route,
  - why this move,
  - what resource it spends,
  - what cheaper or safer alternative was considered,
  - what uncertainty remains,
  - when the helper will stop,
  - what trace will remain.
- Spending must remain bounded even when the helper's rationale sounds plausible.

### On-Chain Traffic / Pocket Funding

- Pocket Bot should not create meaningless transactions only for traffic.
- The natural future Nimiq on-chain action is funding or collecting pocket value that can recharge Bot Attention or unlock helper capacity.
- In later phases, this means:
  - a Nimiq wallet action funds the pocket,
  - the pocket value increases,
  - the bot can convert value into attention or capacity only inside visible rules,
  - traces distinguish top-up/recharge events from bot actions.
- For Phase 1, Nimiq pocket activity may use local fallback or explicit testnet only.

### Robot Helper

- The app must show one robot helper, provisionally named **Pocket Bot**.
- The robot must be presented as a personal helper learning the user's judgment.
- The robot must be able to move through or select nodes in the lossy map.
- The robot must present a concrete move proposal to the user or system.

### Lossy Map

- The scene must include one small lossy map.
- The map must include fog or hidden information.
- The map must include at least one ambiguous route or tempting shortcut.
- The map must include at least one clue/inspect node.
- The map must include at least one goal node.
- The map must include at least one pocket/recharge or Nimiq-value marker.
- The map must be small enough for a short competition demo.

### LLM Proposal Gate

- The LLM must return a structured move proposal.
- The proposal must be schema-validated before entering game state.
- Deterministic resource rules must check the proposal against active resources and blocked actions.
- The gate must provide one of three outcomes: approved/available, redirected by user, or rejected/blocked.
- A request to complete checkout, enter payment information, access broad wallet authority, or call an unbounded external service must be blocked in the MVP.
- If user approval or correction is required, the UI must provide clear guidance choices.

### Execution

- An approved move must execute in a visible way.
- Execution may be represented by the robot moving to a node, revealing fog, filling a context slot, or updating the goal path.
- Execution must create a trace card.

### Trace Cards

- Every executed move must create a trace card.
- Each trace card must include proposal, accepted move, resource spend, user guidance, revealed information, rule result, session lesson if any, and outcome.
- Trace cards must appear in or near the trace archive.
- The user must be able to inspect the latest trace.
- Receipt cards remain useful for later money-like actions, but traces are the primary Phase 1 history surface.

### Trace

- The app must preserve enough visible state for the user to understand what happened.
- The MVP can keep trace data in memory.
- The trace archive is the primary history surface for the first milestone.

## 11. Non-Functional Requirements

- The MVP must run as a local Phaser 3 + Vite application and be compatible with the Nimiq Mini App framework.
- The implementation should preserve the existing project foundation.
- Mini App SDK or provider access must be introduced behind an adapter with a safe local fallback.
- The game loop should remain simple and understandable.
- The UI should be readable on a typical desktop browser viewport.
- Controls should be obvious without requiring a long tutorial.
- Simulated payment behavior must be clearly distinguishable from real payment behavior.
- The prototype should avoid making real financial claims before Nimiq integration exists.
- Payment-specific behavior must be isolated behind adapters. MVP uses `SimulatedPaymentAdapter`. Future milestones may add `X402PaymentAdapter` and `NimiqNativePaymentAdapter`.
- Code should be organized so that rule checks, allowance state, and receipt creation can later be separated from scene rendering.
- Future Nimiq integration should not require rewriting the whole scene.
- The tone should feel playful but trustworthy.

## 12. UX Principles

- Make boundaries visible.
- Make allowance limits visible before spending.
- Make spending legible before it happens.
- Make approvals feel deliberate, not accidental.
- Make receipts easy to inspect.
- Use playful visuals to support understanding, not to hide risk.
- Keep the tone trustworthy rather than childish.
- Prefer concrete labels over abstract jargon.
- Show the current action state at all times.
- Treat the user as the final authority for ambiguous or rule-changing decisions.
- Align with Nimiq's accessible, non-jargon product style.
- Reinforce the central message: the helper has limited attention and pocket value, not full wallet access or broad authority.

## 13. Game Metaphor

The game metaphor is a compact 2D task landscape where the Nimiq binding idea becomes spatial: attention, value, user guidance, hidden uncertainty, context, trace, and re-entry are visibly connected instead of collapsing into blind bot action.

### Decision Model

Pocket Bot uses game-theory vocabulary as a design foundation, not as
player-facing tutorial language and not as a promise to implement a complete
formal solver.

A run is a sequential imperfect-information decision game: the user and Pocket
Bot observe partial state, choose bounded actions, pay local costs, reveal
partial observations, carry history forward, and eventually reach an outcome
judged by the user's preferences.

Core terms:

- Player / Agent = user, Pocket Bot, and environment.
- Preference / Payoff = why one outcome is better than another. In Phase 1,
  better means useful progress, attention preserved, false certainty avoided,
  and a lesson the bot can use within the active run.
- State = current map, resources, context slots, traces, residue, and bot
  proposal.
- Observation / Information Set = what the user and bot can currently see or
  infer. Hidden pressure remains outside the bot's knowledge until revealed.
- Action = approve, redirect, ask, inspect, remember, forget, skip, or act.
- Policy / Strategy = the bot's current rule for choosing proposals. Session
  lessons may adjust this policy inside the active run only.
- Transition = the deterministic resource and runtime result of an approved
  action.
- History / Trajectory = the traceable sequence of proposals, guidance, spends,
  reveals, residue, and lessons.
- Terminal Outcome = safe finish, partial finish, false finish, or open run.

The intended play loop is:

```text
preference
  -> choice
    -> cost
      -> state transition
        -> new observation
          -> updated bot policy
            -> next choice
              -> final outcome
```

This model is broader than "choices under constraints have consequences":
choices are motivated by preferences, and consequences matter because they
create the next decision position.

Suggested mapping:

- Robot = personal software helper.
- Bot Attention = effort spent to reduce uncertainty.
- Nimiq Pocket = pocket, pouch, backpack, or small fund controlled by the user.
- User Attention = guidance, correction, approval, and preference feedback.
- Context Capacity = limited slots that carry selected clues, residue, and lessons.
- Trace Cards = visible bindings between action, cost, reveal, residue, and lesson.
- Finish Judgment = safe finish, partial finish, false finish, or open run.

The metaphor should make constraints easier to understand. It should not turn Nimiq into only coin collecting, crypto branding, or an unrelated arcade challenge.

## 14. Domain Model / Key Objects

The first implementation should be able to represent these objects, even if they start as simple JavaScript objects inside the scene.

### Helper

- `id`
- `name`
- `ruleId`
- `currentProposalId`
- `state`

### Rule

- `id`
- `helperId`
- `summary`
- `allowedAllowanceIds`
- `allowedToolCategories`
- `maxCostPerAction`
- `approvalRule`

### Allowance

- `id`
- `name`
- `balance`
- `currency`
- `reservedAmount`
- `fundingMode`

### Tool / Service

- `id`
- `name`
- `category`
- `cost`
- `currency`
- `approved`

### Action Proposal

- `id`
- `helperId`
- `toolId`
- `allowanceId`
- `cost`
- `reason`
- `createdAt`
- `status`

### Rule Decision

- `proposalId`
- `checks`
- `decision`
- `requiresUserApproval`
- `explanation`

### Receipt

- `id`
- `proposalId`
- `toolName`
- `cost`
- `currency`
- `allowanceName`
- `reason`
- `decision`
- `outcome`
- `userClassification`
- `createdAt`

### SpendingRationale

Future-facing placeholder for Phase 2A/2B. Phase 1 may store simple rationale text, but does not need full route judgment.

- `freeAlternativeConsidered`
- `expectedBenefit`
- `uncertainty`
- `stopCondition`

### TrainingFeedback

Future-facing placeholder for persistent memory and skill training. Phase 1 may create session-only lessons from user correction, but it does not implement durable memory, rewards, or autonomous model improvement.

- `userJudgment`
- `correction`
- `learnedHint`

### AllowanceFundingEvent

Future-facing placeholder for wallet-funded pocket top-ups. Phase 1 may show local fallback or explicit Nimiq testnet pocket value, but mainnet funding and real-value top-ups belong to later phases.

- `id`
- `allowanceId`
- `amount`
- `currency`
- `fundingSource`
- `transactionId`
- `receiptId`
- `createdAt`

## 15. First Scene Requirements

Scene name: **Pocket Bot Workshop**

Required scene areas:

- **Start / goal area:** the robot begins with a selected goal.
- **Lossy map area:** small RPG-style map with fog, ambiguous paths, hidden assumptions, and a goal node.
- **Bot Attention meter:** shows thinking/action energy available for moves.
- **Nimiq Pocket area:** shows local fallback or testnet pocket value as collectible/recharge potential.
- **Context slot area:** shows what the bot can keep in short-term memory during the run.
- **User guidance controls:** approve, redirect, ask for cheaper route, inspect first, remember, forget, or skip.
- **Trace archive:** stores trace cards for proposals, user guidance, resource spend, reveals, and lessons.
- **UI overlay:** displays current goal, resources, LLM proposal, deterministic rule result, session lesson, and trace state.

Minimum first loop:

1. Scene loads with Pocket Bot, a small lossy map, Bot Attention, Nimiq Pocket, Context Capacity, and trace archive.
2. User sees or selects a goal.
3. Pocket Bot requests an LLM-backed structured move proposal through a server-side relay, or uses the offline/mock fallback.
4. Deterministic resource rules validate the proposal and show the cost.
5. User approves, redirects, or corrects the proposal.
6. Accepted move spends Bot Attention or another visible resource.
7. Map state changes by revealing information, preserving uncertainty, or advancing toward the goal.
8. Trace card records the move, user guidance, resource spend, and outcome.
9. User correction creates a session lesson.
10. Later proposal reflects the session lesson within the same run.

## 16. Acceptance Criteria For The First Milestone

The first milestone is complete when:

- The app runs locally through the existing Vite workflow.
- The app is structured for Nimiq Mini App framework compatibility while preserving local browser development.
- The first visible scene is Pocket Bot Workshop or an intentionally renamed equivalent.
- The scene includes the robot, lossy map, Bot Attention meter, Nimiq Pocket area, Context Capacity, guidance controls, trace archive, and UI overlay.
- The current goal and resource state are visible.
- The UI clearly communicates that the helper spends limited Bot Attention and does not receive broad wallet access.
- Runtime assets follow `docs/product/art_bible.md` so characters, nodes, UI icons, effects, and trace/finish states stay visually consistent.
- The bot can request or display a structured LLM route proposal through a backend relay or safe mock fallback.
- Browser client code does not contain provider API keys.
- Deterministic resource rules validate the proposal before game state changes.
- The user can approve, redirect, or correct the bot's proposed move.
- Accepted moves spend Bot Attention and update map state.
- At least one hidden assumption or clue can be revealed.
- A trace card records proposal, user guidance, resource spend, revealed information, and outcome.
- A user correction creates a session lesson.
- A later proposal reflects the session lesson without persistent storage.
- Nimiq Pocket value is visible as local fallback and/or testnet pocket value.
- Competition submission readiness includes a documented NIM/USDT support path and meaningful Nimiq Pay integration, or is explicitly marked blocked.
- `docs/product/competition_scorecard.md` is current and does not overclaim submission readiness.
- No Nimiq mainnet value, uncontrolled wallet operation, checkout, x402 flow, persistent memory, real paid external service, or autonomous spending occurs.
- Existing Phaser/Vite foundation remains intact.
- Non-standard implementation resources, design sources, local source repos, model/API sources, and generated assets used by the prototype are listed in `docs/product/source_attribution.md`.
- The wording and UI framing emphasize user control, Bot Attention, Nimiq pocket value, and independent individuals.

## 17. Open Questions

- Should the Phaser-native custom node-map workflow remain through the first submission, or should it later be migrated to Tiled/LDtk after the first judge path is stable?
- Should the first loop use keyboard/controller movement, node-click movement, UI button input, or a hybrid?
- The PB-007 local default is `gpt-5.4-mini`, selected from current official OpenAI model guidance on June 6, 2026. It remains configurable through `OPENAI_ROUTE_PROPOSAL_MODEL`.
- The LLM relay now lives in this repo as `server/routeProposalRelay.js`, with Vite middleware for local development and a Vercel function at `api/route-proposal.js` for hosted builds.
- What first task goal best communicates "messy, lossy environment" in a short competition demo?
- How much Bot Attention should the first run provide?
- What is the first Nimiq testnet pocket interaction after status: collectible value, explicit testnet top-up/recharge, or another traceable pocket event?
- Should `src/scenes/Street.js` be renamed later, or should a new Pocket Bot Workshop scene be added and wired as the active scene?
- Which exact generated-asset workflow and export sizes should be used to implement `docs/product/art_bible.md` after PB-005 selects the map workflow?
- After the Android/Nimiq Pay submission path is stable, how should the UI distinguish Nimiq Pay testnet status, desktop/mobile browser TestAlbatross status, and local fallback without overwhelming first-contact players?

## 18. Suggested Next Implementation Steps

Recommended next task:

1. PB-POLISH: finish the 60-second Android/Nimiq Pay judge path.
2. PB-MARKET: prepare submission materials and record external feedback.
3. Repeat the Nimiq Pay Testnet emulator check before final submission if PB-012 or polish work changes the platform adapter.
4. PB-012A: add desktop/mobile browser TestAlbatross status later, after the Android/Nimiq Pay submission path is stable.

Run `npm run test`, `npm run build`, and browser/manual scene checks for source
changes, including a Mini App/testnet compatibility check when available.

Future ideas after Phase 1:

- multiple robot helpers,
- multiple maps,
- persistent memory,
- skill unlocks,
- trained real-world task bridges,
- richer Nimiq pocket recharge loops,
- paid-resource governance as one application,
- trust levels,
- Nimiq mainnet readiness after risk review,
- real payment request flow,
- wallet-funded Bot Attention recharge,
- helper action replay,
- trace sorting/review mini-game,
- simple preference editor,
- exportable personal trace history,
- backend gateway for real paid API/tool calls,
- x402-like adapter experiments.
