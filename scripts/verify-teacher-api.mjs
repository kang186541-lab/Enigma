#!/usr/bin/env node

const BASE_URL = (process.env.TEACHER_DASHBOARD_BASE_URL || "https://web-dist2.vercel.app").replace(/\/+$/, "");
const CODE = process.env.TEACHER_DEMO_CODE || "GNU2026";
const KEY = process.env.TEACHER_DEMO_KEY || "tk-gnu-demo-7k3x9p";

async function request(label, params, expectedStatus) {
  const url = new URL("/api/teacher/cohort-summary", BASE_URL);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const res = await fetch(url);
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  const ok = res.status === expectedStatus;
  console.log(`${ok ? "PASS" : "FAIL"} ${label}: HTTP ${res.status}`);
  if (!ok) {
    console.log(typeof body === "string" ? body.slice(0, 500) : JSON.stringify(body, null, 2));
  }

  if (res.status === 503 && body?.error === "service_unavailable") {
    console.log("Hint: Railway is missing SUPABASE_SERVICE_ROLE_KEY or has not redeployed after setting it.");
  }

  return ok;
}

const results = [];
results.push(await request("valid demo teacher key", { code: CODE, key: KEY }, 200));
results.push(await request("wrong teacher key is rejected", { code: CODE, key: "wrong-key" }, 401));
results.push(await request("unknown code is rejected", { code: "NO_SUCH_CODE", key: KEY }, 404));

if (!results.every(Boolean)) {
  process.exitCode = 1;
}
