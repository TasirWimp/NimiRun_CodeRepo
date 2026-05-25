# Pocket Bot Infrastructure Context

## Purpose

Pocket Bot is an exploratory Nimiq mini app concept. It does not assume that crypto-native agent payments are already mainstream or mature. Instead, it asks what the user-facing control layer should look like if software helpers become able to pay for APIs, tools, content, or services through wallet-connected infrastructure.

## Pitch Line

Independent individuals should be able to tell their bot how much it may spend, what it may spend on, when it must ask first, and what receipt it must leave behind.

## Why This Matters Now

Agent products and developer workflows already show the underlying control problem:

- browser and shopping agents can prepare purchase-adjacent actions and require user confirmation before checkout or payment steps,
- developer agents can consume paid API resources unpredictably,
- agentic coding and tool-use workflows can create usage costs that are hard to predict from the user's original task alone.

The practical question is not simply whether a helper can spend. The practical question is whether the user can define a bounded allowance before the helper acts, see why a paid action is proposed, and review a receipt afterward.

## x402 And Related Payment Infrastructure

Pocket Bot connects to the wider discussion around x402 and related agent-payment designs. x402 revives the HTTP `402 Payment Required` pattern for web-native micropayments and pay-per-use access to APIs, tools, content, and services. Related documentation and ecosystem discussion increasingly describe software agents paying for resources directly.

This infrastructure direction makes the Pocket Bot interface problem more concrete: if helpers can initiate paid requests, users need something stronger than a hidden API bill or a broad wallet permission. They need allowance, rule, approval, receipt, and review.

## Risk Context

Pocket Bot should not present agent payments as solved or safe by default. Current research on x402-like designs discusses unresolved risks around authorization, request/payment matching, duplicate or repeated requests, metadata privacy, and the relation between payment and service delivery.

Pocket Bot does not solve these protocol-level risks. Its contribution is an interaction prototype for the human side of the problem: every helper action that spends from an allowance should pass a visible rule gate and produce an understandable receipt.

## Source Pointers

- OpenAI Operator announcement: https://openai.com/index/introducing-operator/
- OpenAI Operator system card: https://cdn.openai.com/operator_system_card.pdf
- SayToBuy AI shopping assistant: https://www.saytobuy.com/
- How Do AI Agents Spend Your Money?: https://arxiv.org/abs/2604.22750
- x402 project: https://x402.org/
- Coinbase x402 documentation: https://docs.cdp.coinbase.com/x402/welcome
- Base AI agents documentation: https://docs.base.org/ai-agents
- Five Attacks on x402 Agentic Payment Protocol: https://arxiv.org/abs/2605.11781
- Hardening x402: https://arxiv.org/abs/2604.11430
- A402: Atomic Agentic Payment Protocol: https://arxiv.org/abs/2603.01179

## Product Boundary

For the MVP, all payments, helper tools, and allowances are simulated. Real Nimiq wallet connection, real x402-style payment flows, real AI APIs, and real backend gateway behavior belong to later milestones.

The MVP is therefore not a payment product. It is a product-interaction exploration for future wallet-funded helper allowances.