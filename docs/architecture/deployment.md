# Deployment Architecture

## Chosen Phase 1 Host

NimiRun uses Vercel as the first hosted deployment target for Phase 1.

Reason:

- the app is already a Vite static frontend,
- Vercel serves static Vite output from `dist`,
- Vercel functions can serve the same-origin `/api/route-proposal` relay,
- Vercel project environment variables are available during function execution,
- the OpenAI key stays server-side and is never bundled into browser code.

## Runtime Shape

```text
Browser
  -> /api/route-proposal
  -> api/route-proposal.js
  -> server/routeProposalRelay.js
  -> OpenAI Responses API when configured
```

Local development still uses Vite middleware for the same endpoint:

```text
Browser
  -> /api/route-proposal
  -> vite/config.dev.mjs middleware
  -> server/routeProposalRelay.js
```

Both paths use the same proposal schema, prompt builder, mock fallback, and
server-side credential boundary.

## Vercel Secrets

Set these in Vercel Project Settings -> Environment Variables:

```text
NIMIRUN_LLM_MODE=openai
OPENAI_ROUTE_PROPOSAL_MODEL=gpt-5.4-mini
OPENAI_API_KEY=<secret value>
```

Use Production and Preview scopes as needed. Do not prefix secret names with
`VITE_`, because Vite exposes `VITE_` variables to browser code.

After changing Vercel environment variables, trigger a new deployment. Existing
deployments keep the values they were built or invoked with.

## Deployment Target Status

Current hosted Vercel URL:

```text
https://nimi-run-code-repo.vercel.app
```

This is the canonical public app URL for submission and Nimiq Pay Mini Apps
checks. Deployment-specific URLs can be useful for testing one exact deployment,
but the stable domain above is the URL to record in competition-facing docs.
Use a public app URL only; never record deployment secrets, provider keys,
private dashboard URLs, or local `.env` values.

## Vercel Deployment Use

Use this path when testing the hosted Mini App candidate instead of the local
Vite server.

1. In Vercel, import the GitHub repo and keep the default Vite-style build:
   `npm run build`, output directory `dist`.
2. Add the three environment variables above in Project Settings ->
   Environment Variables. Use at least Production for the submission candidate;
   Preview can be enabled for branch or pre-submission checks.
3. Redeploy after changing any environment variable. A previous deployment may
   still run with older function environment values.
4. Open the deployed URL in a normal browser first. Confirm the Phaser scene
   loads and the `/api/route-proposal` path either returns a bounded proposal or
   falls back to the mock mode without exposing a key.
5. For Nimiq Pay emulator/device checks, open the deployed URL through Nimiq
   Pay's Mini Apps flow: open Nimiq Pay, use the menu, choose Mini Apps, and
   enter the deployed Vercel URL in the "Search or enter App URL" field. Use
   the local `http://10.0.2.2:8080/` URL only when explicitly testing a local
   Vite server from the Android emulator.
6. Keep `.env.local` and real provider keys out of the repo and out of
   competition artifacts. Vercel environment variables are the preferred hosted
   secret boundary.

## Competition Boundary

The repo may contain `.env.example` as a non-secret template. Real provider keys
must live in shell/session variables for local work or deployment secrets for
hosted work. Do not commit real provider keys, and do not include repo-local env
files as competition artifacts.
