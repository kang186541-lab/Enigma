#!/usr/bin/env node

const { deflateSync, inflateSync } = require("node:zlib");
const { readdirSync, readFileSync, statSync, writeFileSync } = require("node:fs");
const { join, relative } = require("node:path");

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const ROOT = "assets/story";
const dryRun = process.argv.includes("--dry-run");
const verbose = process.argv.includes("--verbose");

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  typeBuffer.copy(out, 4);
  data.copy(out, 8);
  const crcInput = Buffer.concat([typeBuffer, data]);
  out.writeUInt32BE(crc32(crcInput), 8 + data.length);
  return out;
}

function walkPngs(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkPngs(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      files.push(fullPath);
    }
  }
  return files;
}

function optimizePng(filePath) {
  const input = readFileSync(filePath);
  if (!input.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error(`${filePath} is not a PNG`);
  }

  const chunks = [];
  const idatChunks = [];
  let cursor = PNG_SIGNATURE.length;

  while (cursor < input.length) {
    const length = input.readUInt32BE(cursor);
    const type = input.subarray(cursor + 4, cursor + 8).toString("ascii");
    const dataStart = cursor + 8;
    const dataEnd = dataStart + length;
    const data = input.subarray(dataStart, dataEnd);
    chunks.push({ type, data });
    if (type === "IDAT") idatChunks.push(data);
    cursor = dataEnd + 4;
    if (type === "IEND") break;
  }

  if (idatChunks.length === 0) return { before: input.length, after: input.length, changed: false };

  const inflated = inflateSync(Buffer.concat(idatChunks));
  const compressed = deflateSync(inflated, {
    level: 9,
    memLevel: 9,
  });

  const outputChunks = [];
  let wroteIdat = false;
  for (const chunk of chunks) {
    if (chunk.type === "IDAT") {
      if (!wroteIdat) {
        outputChunks.push(makeChunk("IDAT", compressed));
        wroteIdat = true;
      }
      continue;
    }
    outputChunks.push(makeChunk(chunk.type, chunk.data));
  }

  const output = Buffer.concat([PNG_SIGNATURE, ...outputChunks]);
  if (output.length >= input.length) {
    return { before: input.length, after: input.length, changed: false };
  }

  if (!dryRun) writeFileSync(filePath, output);
  return { before: input.length, after: output.length, changed: true };
}

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

let changed = 0;
let beforeTotal = 0;
let afterTotal = 0;
const files = walkPngs(ROOT);

for (const filePath of files) {
  const before = statSync(filePath).size;
  const result = optimizePng(filePath);
  changed += result.changed ? 1 : 0;
  beforeTotal += before;
  afterTotal += result.after;
  if (verbose && result.changed) {
    console.log(`${relative(process.cwd(), filePath)} ${formatMb(result.before)} -> ${formatMb(result.after)}`);
  }
}

console.log(
  `${dryRun ? "dry run: " : ""}optimized ${changed}/${files.length} PNGs, saved ${formatMb(beforeTotal - afterTotal)} (${formatMb(beforeTotal)} -> ${formatMb(afterTotal)})`,
);
