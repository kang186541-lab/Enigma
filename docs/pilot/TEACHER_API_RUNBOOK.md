# Teacher API Runbook

## Current Production Path

- Web dashboard: `https://web-dist2.vercel.app/teacher-dashboard`
- Web API path: `/api/teacher/cohort-summary?code=<code>&key=<teacher-key>`
- Vercel rewrites `/api/*` to Railway.
- Railway endpoint prefers `SUPABASE_SERVICE_ROLE_KEY`.
- If Railway lacks `SUPABASE_SERVICE_ROLE_KEY`, it falls back to the Supabase Edge Function:
  `https://atydkhvemgsrtjthxkwk.supabase.co/functions/v1/teacher-cohort-summary`

## Demo

- Class code: `GNU2026`
- Teacher key: `tk-gnu-demo-7k3x9p`

## Verification

```powershell
npm run verify:teacher-api
```

Expected results:

- valid demo key: HTTP 200
- wrong teacher key: HTTP 401
- unknown code: HTTP 404

## Live User Smoke Test

Purpose: prove the last untested link in the pilot spine:

`signed-in learner UI -> activity_completed -> Supabase -> cohort summary -> teacher dashboard`

Use this after the demo class is empty/reset.

1. Open `https://web-dist2.vercel.app/`.
2. Sign in with a test learner account.
3. Go to Settings -> Class -> Enter class code.
4. Join class code `GNU2026`.
5. Complete one activity that emits `activity_completed`:
   - Rudy training day -> `activityType: "daily"`
   - Story chapter -> `activityType: "story"`
   - NPC mission -> `activityType: "npc"`
   - Escape room -> `activityType: "escape"`
6. Open:

```text
https://web-dist2.vercel.app/teacher-dashboard
```

Use demo code/key from the Demo section.

Expected:

- API remains HTTP 200.
- `memberCount` is at least 1.
- The matching `activityTotals.<type>` increases to at least 1.
- The dashboard "일일 / NPC / 스토리 / 탈출" KPI row shows the same count.

If the dashboard stays at 0:

- Confirm the learner was signed in before completing the activity.
- Confirm the learner joined `GNU2026` before completing the activity.
- Re-check `/api/teacher/cohort-summary?code=GNU2026&key=<teacher-key>`.
- If the event exists in `linguaai_learning_events` but the dashboard does not move, inspect cohort membership and `props.activityType`.

## Secrets

`SUPABASE_SERVICE_ROLE_KEY` is still useful on Railway because it keeps the
aggregation inside the Railway process and also powers admin GDPR export/delete
paths. It must remain server-only. Never put it in `EXPO_PUBLIC_*`, Vercel
frontend env, or committed files.

The teacher dashboard no longer depends on manually adding that key to Railway:
the Edge Function fallback uses Supabase-managed function secrets.
