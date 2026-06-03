# Pocket Bot Pitch Notes

## One-Line Pitch

Independent individuals should be able to tell their bot how much it may spend, what it may spend on, when it must ask first, and what receipt it must leave behind.

## Short Pitch

Pocket Bot is a playful Nimiq mini app where independent individuals train a software helper to navigate paid resources under a bounded allowance.

Pocket Bot is a playful Nimiq mini app exploring self-custodied prepaid allowances for software helpers. Instead of giving a bot broad wallet access, the user gives it a small allowance, sets simple rules, and reviews every paid action through clear receipts.

Pocket Bot is a playful Nimiq mini app where users train a software helper to navigate paid resources. The helper starts with a small allowance, proposes when spending might help, and every paid action must explain why it is worth trying, when it will stop, and what receipt it leaves behind.

## Competition Framing

Nimiq stands for universal money for independent individuals. Pocket Bot extends that idea into a future where software helpers may request paid tools, APIs, content, compute, or services.

The competition prototype should use the Nimiq Mini App framework: a Phaser/Vite web app that can run inside Nimiq Pay's Mini App WebView while keeping Phase 1 wallet and payment behavior simulated.

The project asks what a safe user interface should look like before that kind of spending becomes common.

Pocket Bot explores how Nimiq can carry value through the training loop: allowance becomes interaction, interaction becomes experience, experience becomes better paid-resource judgment.

Users do not merely want a bot that follows literal instructions. They want a helper that learns what they need, and what they need often emerges during exploration. Pocket Bot turns that exploration into a visible training loop.

## Nimiq + x402 Framing

The clearest architecture is:

```text
Nimiq Pay / Nimiq wallet
  = user custody, approval, and independent-individual trust surface

Pocket Bot
  = allowance, rule gate, approval logic, receipt, and review

x402-like paid services
  = APIs, tools, content, compute, or helper services that request payment per use
```

Pocket Bot does not claim that native NIM already works with every x402 service. Instead, it explores the user-facing layer that would be needed if Nimiq Pay, EVM-compatible wallet access, supported tokens, or future Nimiq-native bridges connect users to x402-like paid resources.

## Product Promise

Give your helper pocket money, not your wallet.

## What The MVP Demonstrates

- a small simulated NIM allowance,
- a bot that proposes one paid helper-tool action,
- a visible rule gate,
- approval, auto-approval, or blocking,
- and a receipt that explains what happened.

## Why It Matters

If bots can pay for APIs and tools, the missing user experience is not simply a payment button. The missing user experience is control:

- how much may the helper spend,
- on what kind of resource,
- under which rule,
- when must it ask,
- and what proof remains afterward?

Pocket Bot turns that future infrastructure question into a small playable prototype.

The long-term value path is:

```text
NIM allowance / sponsor value
-> user training interaction
-> bot experience traces
-> better paid-resource judgment
-> future user benefit
```

A strong Nimiq path should eventually create meaningful wallet use and on-chain activity. Pocket Bot's natural on-chain action is funding the bot's pocket allowance, not random transaction spam. The MVP simulates this.

## Boundary

Pocket Bot is not claiming that the full payment infrastructure is mature today. The MVP is a Mini App-compatible interaction prototype. Real NIM rewards, real wallet-funded allowances, sensitive provider operations, live helper-tool payments, real LLM route proposals, x402-style service calls, and backend gateway integration belong to later milestones.
