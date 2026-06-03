#!/usr/bin/env node

const { execFileSync } = require("node:child_process");

const MB = 1024 * 1024;

const MAX_TOTAL_BYTES = 205 * MB;
const MAX_PNG_COUNT = 103;
const GROUP_LIMITS_MB = {
  intro: 75,
  background: 20.5,
  portrait: 29,
  character: 70.5,
  boss: 12.5,
  sheet: 0,
  legacy: 0,
};

function formatMb(bytes) {
  return `${(bytes / MB).toFixed(2)} MB`;
}

function fail(message) {
  console.error(`story asset budget verification failed: ${message}`);
  process.exit(1);
}

let audit;
try {
  const raw = execFileSync(process.execPath, ["scripts/audit-story-assets.js", "--json", "--no-files"], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  audit = JSON.parse(raw);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

if (audit.count > MAX_PNG_COUNT) {
  fail(`PNG count ${audit.count} exceeds budget ${MAX_PNG_COUNT}`);
}

if (audit.bytes > MAX_TOTAL_BYTES) {
  fail(`total PNG size ${formatMb(audit.bytes)} exceeds budget ${formatMb(MAX_TOTAL_BYTES)}`);
}

for (const [group, maxMb] of Object.entries(GROUP_LIMITS_MB)) {
  const groupBytes = audit.groups?.[group]?.bytes ?? 0;
  const maxBytes = maxMb * MB;
  if (groupBytes > maxBytes) {
    fail(`${group} group size ${formatMb(groupBytes)} exceeds budget ${maxMb.toFixed(2)} MB`);
  }
}

console.log(
  `story asset budget verification passed (${audit.count}/${MAX_PNG_COUNT} PNGs, ${formatMb(audit.bytes)}/${formatMb(MAX_TOTAL_BYTES)})`,
);
