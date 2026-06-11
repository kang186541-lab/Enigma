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

## Secrets

`SUPABASE_SERVICE_ROLE_KEY` is still useful on Railway because it keeps the
aggregation inside the Railway process and also powers admin GDPR export/delete
paths. It must remain server-only. Never put it in `EXPO_PUBLIC_*`, Vercel
frontend env, or committed files.

The teacher dashboard no longer depends on manually adding that key to Railway:
the Edge Function fallback uses Supabase-managed function secrets.
