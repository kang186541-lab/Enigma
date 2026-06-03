#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");
const zlib = require("zlib");

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const GROUP_ORDER = ["intro", "background", "portrait", "character", "sheet", "boss", "legacy"];

function usage() {
  return [
    "Usage: node scripts/audit-story-assets.js [options]",
    "",
    "Audits story PNGs for count, dimensions, file size, brightness, and asset group.",
    "",
    "Options:",
    "  --dir <path>            Asset root to scan. Default: assets/story",
    "  --json                  Print machine-readable JSON instead of tables",
    "  --no-files              Print only group summary tables",
    "  --contact-sheet         Write an HTML contact sheet grouped by asset type",
    "  --out <path>            Contact-sheet output directory. Default: OS temp",
    "  -h, --help              Show this help",
    "",
    "Examples:",
    "  node scripts/audit-story-assets.js",
    "  node scripts/audit-story-assets.js --contact-sheet",
    "  node scripts/audit-story-assets.js --json --contact-sheet",
  ].join("\n");
}

function parseArgs(argv) {
  const options = {
    dir: "assets/story",
    json: false,
    includeFiles: true,
    contactSheet: false,
    out: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const [name, inlineValue] = arg.split("=", 2);

    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--no-files") {
      options.includeFiles = false;
    } else if (arg === "--contact-sheet" || arg === "--sheet") {
      options.contactSheet = true;
    } else if (name === "--dir") {
      const value = readOptionValue(argv, i, name, inlineValue);
      options.dir = value.value;
      i = value.index;
    } else if (name === "--out") {
      const value = readOptionValue(argv, i, name, inlineValue);
      options.out = value.value;
      i = value.index;
    } else {
      throw new Error(`unknown option: ${arg}`);
    }
  }

  options.assetRoot = path.resolve(process.cwd(), options.dir);
  options.outDir = options.out
    ? path.resolve(process.cwd(), options.out)
    : path.join(os.tmpdir(), "linguaai-story-asset-audit");

  return options;
}

function readOptionValue(argv, index, name, inlineValue) {
  if (inlineValue !== undefined) {
    if (!inlineValue.trim()) {
      throw new Error(`${name} requires a value`);
    }
    return { value: inlineValue, index };
  }

  const next = argv[index + 1];
  if (!next || next.startsWith("--")) {
    throw new Error(`${name} requires a value`);
  }
  return { value: next, index: index + 1 };
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function walkPngs(root) {
  const files = [];
  const stack = [root];

  while (stack.length) {
    const dir = stack.pop();
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
        files.push(fullPath);
      }
    }
  }

  files.sort((a, b) => normalizePath(a).localeCompare(normalizePath(b)));
  return files;
}

function classifyAsset(relativeToAssetRoot) {
  const normalized = normalizePath(relativeToAssetRoot);
  const filename = path.basename(normalized, ".png").toLowerCase();
  const chapterMatch = normalized.match(/chapter(\d+)_motion_comic/i) ?? filename.match(/^ch(\d+)_/i);
  const chapter = chapterMatch ? `ch${chapterMatch[1]}` : "";

  if (/^dialogue_backgrounds\//.test(normalized)) {
    return { group: "background", chapter: "shared" };
  }
  if (/^characters\/_sheets\//.test(normalized)) {
    return { group: "sheet", chapter };
  }
  if (/^characters\//.test(normalized)) {
    return { group: "character", chapter };
  }
  if (/^ch\d+_intro_/.test(filename)) {
    return { group: "intro", chapter };
  }
  if (/^ch\d+_portrait_/.test(filename) || /_portrait$/.test(filename)) {
    return { group: "portrait", chapter };
  }
  if (/^ch\d+_boss_/.test(filename)) {
    return { group: "boss", chapter };
  }
  return { group: "legacy", chapter };
}

function parsePng(buffer) {
  if (buffer.length < PNG_SIGNATURE.length || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error("not a PNG file");
  }

  let offset = 8;
  let ihdr = null;
  let palette = null;
  let transparency = null;
  const idatChunks = [];

  while (offset < buffer.length) {
    if (offset + 12 > buffer.length) {
      throw new Error("truncated PNG chunk");
    }

    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const crcEnd = dataEnd + 4;

    if (crcEnd > buffer.length) {
      throw new Error(`truncated ${type} chunk`);
    }

    const data = buffer.subarray(dataStart, dataEnd);

    if (type === "IHDR") {
      if (length !== 13) {
        throw new Error("invalid IHDR length");
      }
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        compressionMethod: data[10],
        filterMethod: data[11],
        interlaceMethod: data[12],
      };
    } else if (type === "PLTE") {
      palette = [];
      for (let i = 0; i + 2 < data.length; i += 3) {
        palette.push([data[i], data[i + 1], data[i + 2]]);
      }
    } else if (type === "tRNS") {
      transparency = Buffer.from(data);
    } else if (type === "IDAT") {
      idatChunks.push(Buffer.from(data));
    } else if (type === "IEND") {
      break;
    }

    offset = crcEnd;
  }

  if (!ihdr) {
    throw new Error("missing IHDR chunk");
  }
  if (!idatChunks.length) {
    throw new Error("missing IDAT chunk");
  }

  return {
    ...ihdr,
    palette,
    transparency,
    idat: Buffer.concat(idatChunks),
  };
}

function channelsForColorType(colorType) {
  switch (colorType) {
    case 0:
      return 1;
    case 2:
      return 3;
    case 3:
      return 1;
    case 4:
      return 2;
    case 6:
      return 4;
    default:
      throw new Error(`unsupported PNG color type ${colorType}`);
  }
}

function validateBitDepth(png) {
  const allowed = {
    0: [1, 2, 4, 8, 16],
    2: [8, 16],
    3: [1, 2, 4, 8],
    4: [8, 16],
    6: [8, 16],
  };
  const depths = allowed[png.colorType];
  if (!depths || !depths.includes(png.bitDepth)) {
    throw new Error(`unsupported PNG bit depth ${png.bitDepth} for color type ${png.colorType}`);
  }
}

function paethPredictor(left, up, upLeft) {
  const p = left + up - upLeft;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - up);
  const pc = Math.abs(p - upLeft);
  if (pa <= pb && pa <= pc) return left;
  if (pb <= pc) return up;
  return upLeft;
}

function unfilterScanline(filterType, raw, prev, bytesPerPixel) {
  const row = Buffer.alloc(raw.length);

  for (let i = 0; i < raw.length; i += 1) {
    const left = i >= bytesPerPixel ? row[i - bytesPerPixel] : 0;
    const up = prev ? prev[i] : 0;
    const upLeft = prev && i >= bytesPerPixel ? prev[i - bytesPerPixel] : 0;
    let predictor = 0;

    if (filterType === 0) {
      predictor = 0;
    } else if (filterType === 1) {
      predictor = left;
    } else if (filterType === 2) {
      predictor = up;
    } else if (filterType === 3) {
      predictor = Math.floor((left + up) / 2);
    } else if (filterType === 4) {
      predictor = paethPredictor(left, up, upLeft);
    } else {
      throw new Error(`unsupported PNG filter ${filterType}`);
    }

    row[i] = (raw[i] + predictor) & 0xff;
  }

  return row;
}

function maxSampleValue(bitDepth) {
  return bitDepth === 16 ? 65535 : (1 << bitDepth) - 1;
}

function scaleSample(sample, bitDepth) {
  if (bitDepth === 8) return sample;
  if (bitDepth === 16) return Math.round((sample / 65535) * 255);
  return Math.round((sample / maxSampleValue(bitDepth)) * 255);
}

function readPackedSample(row, pixelIndex, bitDepth) {
  const bitIndex = pixelIndex * bitDepth;
  const byte = row[bitIndex >> 3];
  const shift = 8 - bitDepth - (bitIndex % 8);
  return (byte >> shift) & maxSampleValue(bitDepth);
}

function readSample(row, byteOffset, bitDepth) {
  return bitDepth === 16 ? row.readUInt16BE(byteOffset) : row[byteOffset];
}

function transparentGraySample(png) {
  return png.transparency && png.transparency.length >= 2 ? png.transparency.readUInt16BE(0) : null;
}

function transparentRgbSample(png) {
  if (!png.transparency || png.transparency.length < 6) return null;
  return [
    png.transparency.readUInt16BE(0),
    png.transparency.readUInt16BE(2),
    png.transparency.readUInt16BE(4),
  ];
}

function readPixel(row, x, png) {
  const { bitDepth, colorType } = png;

  if (colorType === 0) {
    const raw = bitDepth < 8 ? readPackedSample(row, x, bitDepth) : readSample(row, x * (bitDepth / 8), bitDepth);
    const transparent = transparentGraySample(png);
    const alpha = transparent !== null && raw === transparent ? 0 : 1;
    const gray = scaleSample(raw, bitDepth);
    return { r: gray, g: gray, b: gray, alpha };
  }

  if (colorType === 2) {
    const step = bitDepth === 16 ? 6 : 3;
    const offset = x * step;
    const rawR = readSample(row, offset, bitDepth);
    const rawG = readSample(row, offset + bitDepth / 8, bitDepth);
    const rawB = readSample(row, offset + (bitDepth / 8) * 2, bitDepth);
    const transparent = transparentRgbSample(png);
    const alpha = transparent && rawR === transparent[0] && rawG === transparent[1] && rawB === transparent[2] ? 0 : 1;
    return {
      r: scaleSample(rawR, bitDepth),
      g: scaleSample(rawG, bitDepth),
      b: scaleSample(rawB, bitDepth),
      alpha,
    };
  }

  if (colorType === 3) {
    const index = bitDepth < 8 ? readPackedSample(row, x, bitDepth) : row[x];
    const color = png.palette?.[index] ?? [0, 0, 0];
    const alpha = png.transparency && index < png.transparency.length ? png.transparency[index] / 255 : 1;
    return { r: color[0], g: color[1], b: color[2], alpha };
  }

  if (colorType === 4) {
    const step = bitDepth === 16 ? 4 : 2;
    const offset = x * step;
    const rawGray = readSample(row, offset, bitDepth);
    const rawAlpha = readSample(row, offset + bitDepth / 8, bitDepth);
    const gray = scaleSample(rawGray, bitDepth);
    return {
      r: gray,
      g: gray,
      b: gray,
      alpha: rawAlpha / maxSampleValue(bitDepth),
    };
  }

  if (colorType === 6) {
    const step = bitDepth === 16 ? 8 : 4;
    const offset = x * step;
    const rawR = readSample(row, offset, bitDepth);
    const rawG = readSample(row, offset + bitDepth / 8, bitDepth);
    const rawB = readSample(row, offset + (bitDepth / 8) * 2, bitDepth);
    const rawAlpha = readSample(row, offset + (bitDepth / 8) * 3, bitDepth);
    return {
      r: scaleSample(rawR, bitDepth),
      g: scaleSample(rawG, bitDepth),
      b: scaleSample(rawB, bitDepth),
      alpha: rawAlpha / maxSampleValue(bitDepth),
    };
  }

  throw new Error(`unsupported PNG color type ${colorType}`);
}

function computeBrightness(png) {
  validateBitDepth(png);

  if (png.compressionMethod !== 0 || png.filterMethod !== 0) {
    throw new Error("unsupported PNG compression or filter method");
  }
  if (png.interlaceMethod !== 0) {
    throw new Error("interlaced PNG brightness decode is not supported");
  }

  const channels = channelsForColorType(png.colorType);
  const bitsPerPixel = channels * png.bitDepth;
  const scanlineLength = Math.ceil((png.width * bitsPerPixel) / 8);
  const bytesPerPixel = Math.max(1, Math.ceil(bitsPerPixel / 8));
  const inflated = zlib.inflateSync(png.idat);
  const expectedLength = (scanlineLength + 1) * png.height;

  if (inflated.length < expectedLength) {
    throw new Error("inflated PNG data is shorter than expected");
  }

  let offset = 0;
  let previous = null;
  let weightedLuminance = 0;
  let alphaWeight = 0;
  let min = Infinity;
  let max = -Infinity;
  let visiblePixels = 0;

  for (let y = 0; y < png.height; y += 1) {
    const filterType = inflated[offset];
    offset += 1;
    const raw = inflated.subarray(offset, offset + scanlineLength);
    offset += scanlineLength;
    const row = unfilterScanline(filterType, raw, previous, bytesPerPixel);

    for (let x = 0; x < png.width; x += 1) {
      const pixel = readPixel(row, x, png);
      if (pixel.alpha <= 0) {
        continue;
      }

      const luminance = 0.2126 * pixel.r + 0.7152 * pixel.g + 0.0722 * pixel.b;
      weightedLuminance += luminance * pixel.alpha;
      alphaWeight += pixel.alpha;
      min = Math.min(min, luminance);
      max = Math.max(max, luminance);
      visiblePixels += 1;
    }

    previous = row;
  }

  if (alphaWeight === 0) {
    return { avg255: 0, pct: 0, min255: 0, max255: 0, visiblePixels: 0 };
  }

  const avg255 = weightedLuminance / alphaWeight;
  return {
    avg255,
    pct: (avg255 / 255) * 100,
    min255: min,
    max255: max,
    visiblePixels,
  };
}

function auditFile(filePath, assetRoot) {
  const stats = fs.statSync(filePath);
  const relFromRoot = normalizePath(path.relative(assetRoot, filePath));
  const relFromCwd = normalizePath(path.relative(process.cwd(), filePath));
  const classification = classifyAsset(relFromRoot);
  const result = {
    file: relFromCwd,
    absolutePath: filePath,
    group: classification.group,
    chapter: classification.chapter,
    bytes: stats.size,
    size: formatBytes(stats.size),
    width: null,
    height: null,
    dimensions: "n/a",
    bitDepth: null,
    colorType: null,
    brightnessAvg255: null,
    brightnessPct: null,
    brightnessRange255: null,
    warnings: [],
  };

  try {
    const png = parsePng(fs.readFileSync(filePath));
    result.width = png.width;
    result.height = png.height;
    result.dimensions = `${png.width}x${png.height}`;
    result.bitDepth = png.bitDepth;
    result.colorType = png.colorType;

    try {
      const brightness = computeBrightness(png);
      result.brightnessAvg255 = round(brightness.avg255, 1);
      result.brightnessPct = round(brightness.pct, 1);
      result.brightnessRange255 = `${round(brightness.min255, 0)}-${round(brightness.max255, 0)}`;
      result.visiblePixels = brightness.visiblePixels;
    } catch (error) {
      result.warnings.push(`brightness unavailable: ${error.message}`);
    }
  } catch (error) {
    result.warnings.push(`PNG parse failed: ${error.message}`);
  }

  return result;
}

function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function brightnessLabel(item) {
  return item.brightnessPct === null ? "n/a" : `${item.brightnessPct.toFixed(1)}%`;
}

function summarize(items) {
  const groups = {};
  for (const group of GROUP_ORDER) {
    const groupItems = items.filter((item) => item.group === group);
    const totalBytes = groupItems.reduce((sum, item) => sum + item.bytes, 0);
    const brightnessItems = groupItems.filter((item) => item.brightnessPct !== null);
    const avgBrightness = brightnessItems.length
      ? brightnessItems.reduce((sum, item) => sum + item.brightnessPct, 0) / brightnessItems.length
      : null;
    const dimensions = countBy(groupItems.map((item) => item.dimensions));
    groups[group] = {
      count: groupItems.length,
      bytes: totalBytes,
      size: formatBytes(totalBytes),
      avgBrightnessPct: avgBrightness === null ? null : round(avgBrightness, 1),
      dimensions,
    };
  }

  return {
    count: items.length,
    bytes: items.reduce((sum, item) => sum + item.bytes, 0),
    groups,
    dimensions: countBy(items.map((item) => item.dimensions)),
    warnings: items.flatMap((item) => item.warnings.map((warning) => ({ file: item.file, warning }))),
  };
}

function countBy(values) {
  const counts = {};
  for (const value of values) {
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function printTextReport(items, summary, options, contactSheetPath) {
  console.log("Story PNG asset audit");
  console.log(`Root: ${normalizePath(path.relative(process.cwd(), options.assetRoot)) || "."}`);
  console.log(`PNG count: ${summary.count}`);
  console.log(`Total size: ${formatBytes(summary.bytes)}`);
  if (contactSheetPath) {
    console.log(`Contact sheet: ${contactSheetPath}`);
  }
  console.log("");

  const groupRows = GROUP_ORDER.map((group) => {
    const data = summary.groups[group];
    return [
      group,
      String(data.count),
      data.size,
      data.avgBrightnessPct === null ? "n/a" : `${data.avgBrightnessPct.toFixed(1)}%`,
      formatDimensionCounts(data.dimensions),
    ];
  });

  printTable(["Group", "Count", "Total size", "Avg brightness", "Dimensions"], groupRows);

  if (options.includeFiles) {
    console.log("");
    const fileRows = items.map((item) => [
      item.group,
      item.chapter,
      item.dimensions,
      item.size,
      brightnessLabel(item),
      item.brightnessRange255 ?? "n/a",
      item.file,
    ]);
    printTable(["Group", "Ch", "Dimensions", "Size", "Brightness", "Range", "File"], fileRows);
  }

  if (summary.warnings.length) {
    console.log("");
    console.log("Warnings:");
    for (const warning of summary.warnings) {
      console.log(`- ${warning.file}: ${warning.warning}`);
    }
  }
}

function formatDimensionCounts(dimensions) {
  const entries = Object.entries(dimensions);
  if (!entries.length) return "n/a";
  return entries.map(([dimensionsLabel, count]) => `${dimensionsLabel} (${count})`).join(", ");
}

function printTable(headers, rows) {
  const widths = headers.map((header, index) => {
    const values = rows.map((row) => String(row[index] ?? ""));
    return Math.max(header.length, ...values.map((value) => value.length));
  });

  const divider = widths.map((width) => "-".repeat(width)).join("  ");
  console.log(headers.map((header, index) => header.padEnd(widths[index])).join("  "));
  console.log(divider);
  for (const row of rows) {
    console.log(row.map((value, index) => String(value ?? "").padEnd(widths[index])).join("  "));
  }
}

function writeContactSheet(items, summary, options) {
  fs.mkdirSync(options.outDir, { recursive: true });
  const htmlPath = path.join(options.outDir, "story-assets-contact-sheet.html");
  const generatedAt = new Date().toISOString();
  const sections = GROUP_ORDER.map((group) => {
    const groupItems = items.filter((item) => item.group === group);
    const cards = groupItems.map(contactSheetCard).join("\n");
    return [
      `<section>`,
      `  <h2>${escapeHtml(group)} <span>${groupItems.length} PNGs</span></h2>`,
      `  <div class="grid">${cards}</div>`,
      `</section>`,
    ].join("\n");
  }).join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>LinguaAI Story Asset Contact Sheet</title>
  <style>
    :root {
      color-scheme: dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #111318;
      color: #f3f5f7;
    }
    body {
      margin: 0;
      padding: 24px;
    }
    header {
      margin: 0 0 24px;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 24px;
      line-height: 1.2;
    }
    p {
      margin: 0;
      color: #a8b0bd;
    }
    section {
      margin: 28px 0 0;
    }
    h2 {
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin: 0 0 12px;
      font-size: 18px;
    }
    h2 span {
      color: #a8b0bd;
      font-size: 13px;
      font-weight: 500;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
      gap: 12px;
    }
    figure {
      margin: 0;
      overflow: hidden;
      border: 1px solid #2a303a;
      border-radius: 8px;
      background: #181b22;
    }
    .thumb {
      display: grid;
      place-items: center;
      aspect-ratio: 4 / 3;
      background:
        linear-gradient(45deg, #1d222b 25%, transparent 25%),
        linear-gradient(-45deg, #1d222b 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #1d222b 75%),
        linear-gradient(-45deg, transparent 75%, #1d222b 75%);
      background-color: #141820;
      background-size: 18px 18px;
      background-position: 0 0, 0 9px, 9px -9px, -9px 0;
    }
    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    figcaption {
      padding: 10px;
      border-top: 1px solid #2a303a;
      font-size: 12px;
      line-height: 1.45;
    }
    .name {
      display: block;
      margin: 0 0 6px;
      color: #f3f5f7;
      font-weight: 700;
      overflow-wrap: anywhere;
    }
    .meta {
      color: #a8b0bd;
    }
  </style>
</head>
<body>
  <header>
    <h1>LinguaAI Story Asset Contact Sheet</h1>
    <p>${summary.count} PNGs from ${escapeHtml(normalizePath(path.relative(process.cwd(), options.assetRoot)) || ".")} generated ${escapeHtml(generatedAt)}</p>
  </header>
  ${sections}
</body>
</html>
`;

  fs.writeFileSync(htmlPath, html, "utf8");
  return htmlPath;
}

function contactSheetCard(item) {
  const src = pathToFileURL(item.absolutePath).href;
  return [
    `<figure>`,
    `  <div class="thumb"><img src="${escapeHtml(src)}" alt="${escapeHtml(path.basename(item.file))}" loading="lazy"></div>`,
    `  <figcaption>`,
    `    <span class="name">${escapeHtml(path.basename(item.file))}</span>`,
    `    <span class="meta">${escapeHtml(item.chapter || "no chapter")} | ${escapeHtml(item.dimensions)} | ${escapeHtml(item.size)} | ${escapeHtml(brightnessLabel(item))}</span>`,
    `  </figcaption>`,
    `</figure>`,
  ].join("\n");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`story asset audit failed: ${error.message}`);
    console.error("");
    console.error(usage());
    process.exit(1);
  }

  if (options.help) {
    console.log(usage());
    return;
  }

  if (!fs.existsSync(options.assetRoot)) {
    console.error(`story asset audit failed: missing asset root ${options.assetRoot}`);
    process.exit(1);
  }

  const pngFiles = walkPngs(options.assetRoot);
  const items = pngFiles.map((filePath) => auditFile(filePath, options.assetRoot));
  const summary = summarize(items);
  const contactSheetPath = options.contactSheet ? writeContactSheet(items, summary, options) : null;

  if (options.json) {
    const payload = {
      root: normalizePath(path.relative(process.cwd(), options.assetRoot)) || ".",
      contactSheet: contactSheetPath,
      ...summary,
    };
    if (options.includeFiles) {
      payload.files = items;
    }
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  printTextReport(items, summary, options, contactSheetPath);
}

main();
