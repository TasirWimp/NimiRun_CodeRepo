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
  mini_app_framework_path: unknown
  nim_or_usdt_support: unknown
  no_secrets_scan: unknown
  mit_license_public_repo: unknown
  mobile_ux_60s_path: unknown
  vertical_slice: unknown
  submission_story: unknown
  community_feedback: unknown
  overall: blocked
```

The overall status stays `blocked` until every required item is `pass` or has a
documented exception accepted by the project owner.

## Design & UX / 25

- First impression:
- Mobile readability:
- Touch-friendly controls:
- 60-second onboarding:
- Visual trust:
- Asset consistency follows art bible:
- Trace readability:
- CRPM mechanics visible without jargon:

## Functionality / 25

- App runs locally through Vite:
- App runs inside Nimiq Pay Mini Apps path:
- NIM/USDT support path:
- Pocket Bot loop works:
- Bot Attention spend rules work:
- Runtime transition / finish judgment works:
- LLM proposal bridge works or mock fallback is clear:
- Deterministic rules validate before state changes:
- No secrets / no unsafe wallet authority:

## Usefulness & Originality / 25

- Binding-layer concept:
- Resource judgment in lossy environments:
- Clear user problem:
- User can guide the bot's judgment:
- Trace cards bind action, cost, reveal, residue, and lesson:
- Safe / partial / false / open finish states are visible:
- First scenario communicates resource judgment without financial-advice confusion:

## Marketing & Distribution / 25

- 250-word submission description:
- 30-60 second demo video or GIF:
- 3-5 screenshots:
- README has "What it does / Who it is for / How it uses Nimiq Pay":
- Community post:
- Tester feedback:
- Feedback-driven update:

## Bonus / 5

- NIM support:

## Judge Path

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
