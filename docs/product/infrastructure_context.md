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

## Nimiq-to-x402 Compatibility Route

Nimiq connects naturally to the **user side** of this problem: wallet custody, user approval, simple payment UX, and mini app interaction. x402-like systems connect to the **machine-payment side**: HTTP payment requirements, supported tokens/networks, payment signatures, facilitator checks, and paid resource delivery.

Pocket Bot should therefore be framed as a control adapter between the two:

```text
Nimiq Pay / Nimiq wallet
  = user custody, approval, and independent-individual trust surface

Pocket Bot
  = allowance, rule gate, approval logic, receipt, and review

x402-like paid services
  = APIs, tools, content, compute, or helper services that request payment per use
```

Native NIM should not be assumed to be x402-compatible by default. Current x402-style integrations are strongest around EVM-compatible or otherwise supported networks/tokens. The more realistic near-term route is:

```text
Nimiq Pay user
→ Pocket Bot mini app
→ EVM-compatible wallet access where available
→ supported token/network for x402-like payment
→ paid API/tool/service
→ Pocket Bot receipt and trace
```

This keeps Nimiq central where it is strongest: the user-facing wallet and approval experience. It also avoids pretending that native NIM already plugs into every x402 service.

## Compatibility Levels

### Level 1 — Simulated x402-like Flow

The MVP simulates the shape of a paid resource request:

1. helper requests a paid tool,
2. tool returns a payment requirement,
3. Pocket Bot checks allowance and rules,
4. the user approves, auto-approves, or blocks,
5. a simulated payment executes,
6. a receipt is created.

This is enough for the competition prototype because the product question is the user-facing control layer.

### Level 2 — EVM Token x402 Adapter

A later milestone can explore real x402 compatibility by using an EVM-compatible wallet surface exposed through Nimiq Pay where available. The app would need to:

- parse x402-style payment requirements,
- check the user's Pocket Bot allowance before signing,
- request wallet approval for the payment payload,
- submit the payment according to the service's expected flow,
- record service, amount, token, network, decision, and result in a receipt.

This level should start with a widely supported x402 token/network combination rather than native NIM.

### Level 3 — Native Nimiq Rail Or Bridge

A deeper future milestone could explore native NIM support for x402-like flows. That would likely require one of:

- a Nimiq-specific payment scheme/facilitator,
- a bridge from NIM to an x402-supported token,
- or a Nimiq-native payment requirement format that preserves the x402 pattern.

This is not an MVP requirement.

## Product Architecture Implication

Pocket Bot should keep payment-specific code behind adapters:

- `SimulatedPaymentAdapter` for the MVP,
- future `X402PaymentAdapter` for supported token/network flows,
- possible future `NimiqNativePaymentAdapter` if native NIM support becomes realistic.

The allowance engine should stay independent from the payment rail. This ensures the core product idea survives changes in payment infrastructure.

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
- Coinbase x402 network support: https://docs.cdp.coinbase.com/x402/network-support
- Coinbase x402 wallet concept: https://docs.cdp.coinbase.com/x402/core-concepts/wallet
- Coinbase x402 payment flow: https://docs.cdp.coinbase.com/x402/core-concepts/how-it-works
- Base AI agents documentation: https://docs.base.org/ai-agents
- Nimiq Mini Apps documentation: https://nimiq.dev/mini-apps/
- Five Attacks on x402 Agentic Payment Protocol: https://arxiv.org/abs/2605.11781
- Hardening x402: https://arxiv.org/abs/2604.11430
- A402: Atomic Agentic Payment Protocol: https://arxiv.org/abs/2603.01179

## Product Boundary

For the MVP, all payments, helper tools, and allowances are simulated. Real Nimiq wallet connection, real x402-style payment flows, real AI APIs, and real backend gateway behavior belong to later milestones.

The MVP is therefore not a payment product. It is a product-interaction exploration for future wallet-funded helper allowances.

The clearest current stance is:

> Nimiq is the user-trust surface. x402-like services are the machine-payment rail. Pocket Bot is the allowance and receipt layer between them.