import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

type MemberRow = { user_id: string; joined_at: string | null };
type ProgressRow = {
  user_id: string;
  xp: number | null;
  level: number | null;
  streak_days: number | null;
  last_session_at: string | null;
  learning_lang: string | null;
};
type EventRow = { user_id: string; event: string; created_at: string };

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function getServiceRoleKey(): string | null {
  const single = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (single) return single;

  // Some Supabase deployments expose secret keys as a JSON array. Keep this
  // tolerant so the function survives key-format changes without logging keys.
  const packed = Deno.env.get("SUPABASE_SECRET_KEYS")?.trim();
  if (!packed) return null;
  try {
    const parsed = JSON.parse(packed);
    if (Array.isArray(parsed)) {
      const first = parsed.find((value) => typeof value === "string" && value.trim());
      return first?.trim() ?? null;
    }
  } catch {
    // Fall through to unavailable.
  }
  return null;
}

function timingSafeEqualString(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  if (aa.length === 0 || aa.length !== bb.length) return false;

  let diff = 0;
  for (let i = 0; i < aa.length; i += 1) {
    diff |= aa[i] ^ bb[i];
  }
  return diff === 0;
}

function maskEmail(email: string | null): string | null {
  if (!email) return null;
  const at = email.indexOf("@");
  if (at <= 0) return `${email.slice(0, 1)}***`;
  return `${email.slice(0, 1)}***@${email.slice(at + 1)}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "GET") {
    return json(405, { error: "method_not_allowed" });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const serviceRoleKey = getServiceRoleKey();
    if (!supabaseUrl || !serviceRoleKey) {
      return json(503, { error: "service_unavailable" });
    }

    const url = new URL(req.url);
    const code = (url.searchParams.get("code") ?? "").trim();
    const key = url.searchParams.get("key") ?? "";
    if (!code) return json(404, { error: "unknown_code" });

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const ilikePattern = code.replace(/([\\%_])/g, "\\$1");
    const { data: cohortRows, error: cohortErr } = await admin
      .from("linguaai_cohorts")
      .select("id, name, join_code, teacher_key")
      .ilike("join_code", ilikePattern)
      .limit(2);
    if (cohortErr) throw cohortErr;

    const codeLower = code.toLowerCase();
    const cohort = (cohortRows ?? []).find(
      (c: { join_code?: string | null }) =>
        typeof c.join_code === "string" && c.join_code.toLowerCase() === codeLower,
    );
    if (!cohort) return json(404, { error: "unknown_code" });

    if (!timingSafeEqualString(key, String(cohort.teacher_key ?? ""))) {
      return json(401, { error: "bad_key" });
    }

    const { data: memberRows, error: memberErr } = await admin
      .from("linguaai_cohort_members")
      .select("user_id, joined_at")
      .eq("cohort_id", cohort.id);
    if (memberErr) throw memberErr;

    const members: MemberRow[] = ((memberRows ?? []) as MemberRow[]).filter(
      (m) => typeof m.user_id === "string" && m.user_id.length > 0,
    );
    const ids = members.map((m) => m.user_id);

    const progressByUid = new Map<string, ProgressRow>();
    const events: EventRow[] = [];
    const emailByUid = new Map<string, string | null>();

    if (ids.length > 0) {
      const [progressRes, eventsRes] = await Promise.all([
        admin
          .from("linguaai_user_progress")
          .select("user_id, xp, level, streak_days, last_session_at, learning_lang")
          .in("user_id", ids),
        admin
          .from("linguaai_learning_events")
          .select("user_id, event, created_at")
          .in("user_id", ids)
          .order("created_at", { ascending: false })
          .limit(50_000),
      ]);
      if (progressRes.error) throw progressRes.error;
      if (eventsRes.error) throw eventsRes.error;

      for (const p of (progressRes.data ?? []) as ProgressRow[]) {
        progressByUid.set(p.user_id, p);
      }
      events.push(...((eventsRes.data ?? []) as EventRow[]));

      const EMAIL_CHUNK = 10;
      for (let i = 0; i < ids.length; i += EMAIL_CHUNK) {
        const chunk = ids.slice(i, i + EMAIL_CHUNK);
        const looked = await Promise.all(
          chunk.map(async (uid) => {
            try {
              const { data } = await admin.auth.admin.getUserById(uid);
              return [uid, data?.user?.email ?? null] as const;
            } catch {
              return [uid, null] as const;
            }
          }),
        );
        for (const [uid, email] of looked) emailByUid.set(uid, email);
      }
    }

    const SPEAKING_EVENTS = new Set([
      "first_speaking_attempt_completed",
      "review_sentence_attempt_completed",
    ]);
    const DAY_MS = 86_400_000;
    const nowMs = Date.now();
    const sevenDaysAgoMs = nowMs - 7 * DAY_MS;
    const threeDaysAgoMs = nowMs - 3 * DAY_MS;
    const utcDay = (ms: number): number => Math.floor(ms / DAY_MS);
    const todayUtcDay = utcDay(nowMs);

    type EventAcc = {
      totalAttempts: number;
      attempts7d: number;
      activeDays7d: Set<number>;
      lastEventMs: number | null;
      firstEventDay: number | null;
      lastEventDay: number | null;
    };

    const accByUid = new Map<string, EventAcc>();
    for (const row of events) {
      const ms = Date.parse(row.created_at);
      if (!Number.isFinite(ms)) continue;
      let acc = accByUid.get(row.user_id);
      if (!acc) {
        acc = {
          totalAttempts: 0,
          attempts7d: 0,
          activeDays7d: new Set<number>(),
          lastEventMs: null,
          firstEventDay: null,
          lastEventDay: null,
        };
        accByUid.set(row.user_id, acc);
      }
      const day = utcDay(ms);
      if (acc.firstEventDay === null || day < acc.firstEventDay) acc.firstEventDay = day;
      if (acc.lastEventDay === null || day > acc.lastEventDay) acc.lastEventDay = day;
      if (acc.lastEventMs === null || ms > acc.lastEventMs) acc.lastEventMs = ms;
      if (ms >= sevenDaysAgoMs) acc.activeDays7d.add(day);
      if (SPEAKING_EVENTS.has(row.event)) {
        acc.totalAttempts += 1;
        if (ms >= sevenDaysAgoMs) acc.attempts7d += 1;
      }
    }

    const students = members.map((m) => {
      const p = progressByUid.get(m.user_id);
      const acc = accByUid.get(m.user_id);
      const lastEventIso =
        acc?.lastEventMs != null ? new Date(acc.lastEventMs).toISOString() : null;
      return {
        maskedEmail: maskEmail(emailByUid.get(m.user_id) ?? null),
        joinedAt: m.joined_at ?? null,
        xp: p?.xp ?? 0,
        level: p?.level ?? 0,
        streakDays: p?.streak_days ?? 0,
        learningLang: p?.learning_lang ?? null,
        lastSessionAt: p?.last_session_at ?? null,
        totalSpeakingAttempts: acc?.totalAttempts ?? 0,
        attempts7d: acc?.attempts7d ?? 0,
        activeDays7d: acc?.activeDays7d.size ?? 0,
        lastActiveAt: lastEventIso ?? p?.last_session_at ?? null,
        atRisk: acc?.lastEventMs == null || acc.lastEventMs <= threeDaysAgoMs,
      };
    });

    const sortMs = (iso: string | null): number => {
      if (!iso) return 0;
      const ms = Date.parse(iso);
      return Number.isFinite(ms) ? ms : 0;
    };
    students.sort((a, b) => sortMs(b.lastActiveAt) - sortMs(a.lastActiveAt));

    const retentionRate = (n: number): number | null => {
      let eligible = 0;
      let retained = 0;
      for (const m of members) {
        const acc = accByUid.get(m.user_id);
        if (!acc || acc.firstEventDay === null || acc.lastEventDay === null) continue;
        if (todayUtcDay - acc.firstEventDay < n) continue;
        eligible += 1;
        if (acc.lastEventDay - acc.firstEventDay >= n) retained += 1;
      }
      return eligible === 0 ? null : Math.round((retained / eligible) * 1000) / 1000;
    };

    let attempts7dTotal = 0;
    let activeDays7dTotal = 0;
    for (const s of students) {
      attempts7dTotal += s.attempts7d;
      activeDays7dTotal += s.activeDays7d;
    }
    const avgAttemptsPerActiveDay =
      activeDays7dTotal === 0
        ? null
        : Math.round((attempts7dTotal / activeDays7dTotal) * 100) / 100;

    return json(200, {
      cohort: {
        name: cohort.name ?? null,
        joinCode: cohort.join_code,
        memberCount: members.length,
        avgAttemptsPerActiveDay,
        retention: {
          d1: retentionRate(1),
          d7: retentionRate(7),
          d30: retentionRate(30),
        },
        generatedAt: new Date().toISOString(),
      },
      students,
    });
  } catch (err) {
    console.error("[teacher-cohort-summary] unexpected error", err);
    return json(500, { error: "internal" });
  }
});
