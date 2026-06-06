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

## Competition Boundary

The repo may contain `.env.example` as a non-secret template. Real provider keys
must live in shell/session variables for local work or deployment secrets for
hosted work. Do not commit real provider keys, and do not include repo-local env
files as competition artifacts.
