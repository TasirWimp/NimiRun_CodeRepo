# Pocket Bot Pitch Notes

## One-Line Pitch

Train your bot to spend attention wisely.

## Short Pitch

Pocket Bot is a playful Nimiq mini app where users guide a software helper through messy, lossy task landscapes. The bot has limited attention, limited context, and a small Nimiq pocket. The player teaches it when to inspect, ask, remember, skip, or act.

Pocket Bot turns user-bot alignment into a small RPG-style game: the bot proposes a move, the player redirects or approves it, resources are spent, hidden assumptions are revealed, and trace cards show what the bot learned during the run.

Nimiq is the value carrier. Pocket money can be collected, topped up on testnet, or later converted into Bot Attention. Bot Attention is the resource the helper spends while trying to reach a goal.

## Competition Framing

Nimiq stands for universal money for independent individuals. Pocket Bot extends that idea into a future where independent individuals train their own software helpers, instead of granting opaque systems broad authority.

The competition prototype should use the Nimiq Mini App framework: a Phaser/Vite web app that can run inside Nimiq Pay's Mini App WebView while preserving local browser development.

Phase 1 should be a playable mini game, not a policy dashboard. The user sees a compact 2D RPG-like map, a bot, attention/resource meters, ambiguous paths, and trace cards. A low-cost GPT model can propose the bot's next move through a safe backend relay, while deterministic game rules decide what is legal and what it costs.

The project asks:

> Can a Mini App make the process of training a helper's judgment playful, visible, and user-controlled?

## Product Promise

Train your bot's attention. Keep control of the pocket.

## What Phase 1 Demonstrates

- a small lossy task map,
- a bot with limited Bot Attention,
- Nimiq Pocket value as collectible/testnet/recharge potential,
- context slots as limited working memory,
- an LLM-backed structured move proposal,
- user guidance that corrects the bot,
- one session-only lesson applied later in the same run,
- trace cards that show resource spend, revealed information, guidance, and lesson application.

## Why It Matters

Real tasks are messy. Good helpers must navigate incomplete information, hidden assumptions, ambiguous routes, and limited resources. The hard product problem is not only whether a bot may spend money. The deeper problem is whether the bot can learn how this user wants scarce resources spent on the path to a goal.

Pocket Bot makes that judgment problem playable:

- spend Bot Attention to inspect,
- ask the user when ambiguity matters,
- remember only what fits,
- conserve resources when a route looks wasteful,
- use Nimiq pocket value as the visible value/recharge layer,
- record what happened so the user can inspect and correct it.

The long-term value path is:

```text
user plays and guides the bot
-> bot spends attention on uncertain choices
-> user feedback directs that attention toward useful judgment
-> Nimiq pocket money powers or rewards attention
-> traces become memory and skills
-> trained bot applies user preferences to real-world tasks
```

## Nimiq Framing

The clearest architecture is:

```text
Nimiq Pay / Nimiq wallet
  = user custody, testnet pocket value, approval, and independent-individual trust surface

Pocket Bot
  = attention economy, map/game loop, user guidance, resource rules, trace cards, and later memory

LLM / tools / APIs
  = attention-consuming resources the bot may use under user-controlled limits
```

Pocket Bot should not create meaningless transactions for its own sake. The natural Nimiq action is funding or collecting pocket value that can recharge Bot Attention or unlock later helper capacity. Phase 1 can use testnet or local fallback value to avoid real high-stake exposure.

## Boundary

Phase 1 may use a real LLM API through a backend relay because the bot's move proposals are part of the playable interaction. API keys must not live in the browser client, and LLM output must be validated before it affects game state.

Phase 1 does not include persistent memory, mainnet value, real paid external-service execution, checkout, x402, broad wallet access, real-value rewards, or autonomous spending. Persistent memory and real-world task bridges belong to later phases.
