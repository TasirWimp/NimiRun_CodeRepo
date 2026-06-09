# Competition Scorecard

This scorecard tracks competition readiness without replacing Pocket Bot's
product spine. The product spine remains CRPM-shaped resource judgment in lossy
environments. The scorecard is a delivery tool for avoiding false landfall:

```text
internal demo works
  != competition-ready submission
```

Use status values: `pass`, `blocked`, `unknown`, or `not_started`.

## Submission Status

```yaml
competition_submission_status:
  mini_app_framework_path: pass
  nim_or_usdt_support: pass
  no_secrets_scan: pass
  mit_license_public_repo: pass
  hosted_vercel_url_recorded: pass
  hosted_nimiq_pay_check: pass
  mobile_ux_60s_path: pass
  vertical_slice: pass
  submission_story: pass
  community_feedback: unknown
  overall: blocked
```

The overall status stays `blocked` until every required item is `pass` or has a
documented exception accepted by the project owner.

## Design & UX / 25

- First impression:
- Mobile readability: pass for local browser phone viewport and Android
  emulator Nimiq Pay local Mini App check on June 8, 2026. A June 9 hosted
  Nimiq Pay check exposed a desktop-canvas regression; after redeploy, the
  hosted Vercel app rendered correctly in portrait inside Nimiq Pay.
- Touch-friendly controls: pass for the Golden Signal Support Check -> Approve
  local/emulator path on June 8, 2026.
- 60-second onboarding: pass for local/mobile vertical slice and hosted Nimiq
  Pay judge path as of June 9, 2026.
- Visual trust:
- Asset consistency follows art bible:
- Trace readability:
- CRPM mechanics visible without jargon:

## Functionality / 25

- App runs locally through Vite:
- App runs inside Nimiq Pay Mini Apps path: pass on Android emulator with Nimiq Pay forced to Testnet on June 7, 2026; the local Mini App Golden Signal path was rechecked on June 8, 2026.
- Active hosted Vercel URL: pass;
  `https://nimi-run-code-repo.vercel.app` is recorded as the canonical public
  app URL as of June 9, 2026.
- Hosted Vercel URL inside Nimiq Pay: pass on June 9, 2026 after redeploy.
  The public URL opened in Nimiq Pay, rendered the phone portrait layout,
  completed Support Check -> Approve -> Historic Witness -> Trace Archive,
  and did not trigger sign, send, payment, checkout, top-up, or mainnet
  authority.
- NIM/USDT support path: NIM testnet/local status path implemented in PB-012 and emulator-verified in Nimiq Pay Testnet on June 7, 2026. USDT support remains future scope.
- Pocket Bot loop works:
- Bot Attention spend rules work:
- Runtime transition / finish judgment works:
- LLM proposal bridge works or mock fallback is clear: backend relay verified on
  June 9, 2026; local 390x844 scene smoke verified `Ask Bot` mock fallback
  without spending Bot Attention; hosted Nimiq Pay tap-through verified live
  `openai` proposal via `gpt-5.4-mini`, no spend before approval, and
  deterministic spend/trace after approval.
- Deterministic rules validate before state changes:
- No secrets / no unsafe wallet authority: pass through repeatable
  `npm run check:no-secrets`, `.gitignore` exclusion of repo-local env files
  except `.env.example`, hosted bundle scan on June 9, 2026, and Nimiq Pay
  emulator checks that triggered no sign/send/payment/mainnet prompt.

## Usefulness & Originality / 25

- Binding-layer concept:
- Resource judgment in lossy environments:
- Clear user problem:
- User can guide the bot's judgment:
- Trace cards bind action, cost, reveal, residue, and lesson:
- Safe / partial / false / open finish states are visible:
- First scenario communicates resource judgment without financial-advice confusion:

## Marketing & Distribution / 25

- 250-word submission description: pass; draft lives in `README.md`.
- 30-60 second demo video or GIF:
- 3-5 screenshots:
- README has "What it does / Who it is for / How it uses Nimiq Pay": pass.
- Community post:
- Tester feedback:
- Feedback-driven update:

## Bonus / 5

- NIM support: native NIM status path implemented as explicit Mini App provider check; no send/sign/payment authority.

## Judge Path

Current URL status:

```text
Local emulator path: http://10.0.2.2:8080/ verified on June 8, 2026.
Hosted Vercel path: https://nimi-run-code-repo.vercel.app recorded on June 9,
2026; Nimiq Pay hosted verification passed on June 9, 2026 after redeploy.
```

Target first 60 seconds:

```text
1. Open app.
2. See bot, goal, attention, pocket, trace.
3. Bot proposes: inspect shortcut first.
4. User approves.
5. Attention decreases.
6. Fog reveals clue plus remaining unknown.
7. Trace card binds action, cost, reveal, residue.
8. Bot applies lesson or reaches partial/safe finish.
9. Nimiq pocket is visibly connected to controlled capacity.
```

This path should not require the judge to understand CRPM terminology. The CRPM
discipline should be visible through mechanics, trace, residue, and finish
judgment.

## External Feedback

Track before submission:

- At least 3 external testers try the app.
- Feedback is recorded as GitHub issues, docs notes, or trace-style feedback
  cards.
- At least one improvement is made from feedback.
- Progress is shared in the competition community when entering a competition
  cycle.
