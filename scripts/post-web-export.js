const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const outDir = process.argv[2] || "dist";
const indexPath = path.join(outDir, "index.html");
const vercelPath = path.join(outDir, "vercel.json");
const ICON_FONT_FAMILIES = {
  Ionicons: "ionicons",
  Feather: "feather",
};

function writeIfChanged(filePath, nextContent) {
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  if (current !== nextContent) {
    fs.writeFileSync(filePath, nextContent);
  }
}

if (!fs.existsSync(indexPath)) {
  throw new Error(`Missing web export index.html: ${indexPath}`);
}

// ── Rename assets/node_modules → assets/vendor and rewrite bundle references ──
// Vercel deployments swallow any path containing `node_modules/` as static asset
// (catch-all rewrite serves SPA fallback HTML for them), so Expo's default web
// export breaks fonts/images sourced from node_modules. We rename the directory
// at deploy time and patch the JS bundles to point at the new location.
const assetsDir = path.join(outDir, "assets");
const nodeModulesAssetDir = path.join(assetsDir, "node_modules");
const vendorAssetDir = path.join(assetsDir, "vendor");

if (fs.existsSync(nodeModulesAssetDir)) {
  if (fs.existsSync(vendorAssetDir)) {
    // Merge: move children into existing vendor dir (avoid clobber on reruns).
    const entries = fs.readdirSync(nodeModulesAssetDir, { withFileTypes: true });
    for (const entry of entries) {
      const from = path.join(nodeModulesAssetDir, entry.name);
      const to = path.join(vendorAssetDir, entry.name);
      if (!fs.existsSync(to)) {
        fs.renameSync(from, to);
      }
    }
    fs.rmSync(nodeModulesAssetDir, { recursive: true, force: true });
  } else {
    fs.renameSync(nodeModulesAssetDir, vendorAssetDir);
  }
  console.log("Renamed assets/node_modules → assets/vendor");
}

const bundleRenames = new Map();
const bundleDir = path.join(outDir, "_expo", "static", "js", "web");
if (fs.existsSync(bundleDir)) {
  for (const entry of fs.readdirSync(bundleDir)) {
    if (!entry.endsWith(".js")) continue;
    const bundlePath = path.join(bundleDir, entry);
    const original = fs.readFileSync(bundlePath, "utf8");
    let patched = original;
    let changed = false;
    if (patched.includes("/assets/node_modules/")) {
      patched = patched.replace(/\/assets\/node_modules\//g, "/assets/vendor/");
      changed = true;
      console.log(`Rewrote node_modules → vendor in ${entry}`);
    }
    if (changed) {
      fs.writeFileSync(bundlePath, patched);
      // Rebuild filename from new content hash so the immutable Cache-Control
      // header does not pin browsers to an older, broken cached version.
      const match = entry.match(/^entry-([a-fA-F0-9]+)\.js$/);
      if (match) {
        const oldHash = match[1].toLowerCase();
        const newHash = crypto.createHash("md5").update(patched).digest("hex");
        if (newHash !== oldHash) {
          const newName = `entry-${newHash}.js`;
          fs.renameSync(bundlePath, path.join(bundleDir, newName));
          bundleRenames.set(entry, newName);
          console.log(`Renamed bundle ${entry} → ${newName}`);
        }
      } else {
        console.warn(`Patched bundle ${entry} could not be re-hashed (non-standard filename); browsers may serve a stale cached copy.`);
      }
    }
  }
}

let html = fs.readFileSync(indexPath, "utf8");

if (bundleRenames.size) {
  for (const [oldName, newName] of bundleRenames.entries()) {
    html = html.split(oldName).join(newName);
  }
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function toWebPath(filePath) {
  return `/${path.relative(outDir, filePath).split(path.sep).join("/")}`;
}

function injectBlock(source, marker, block) {
  const start = `<!-- ${marker}:start -->`;
  const end = `<!-- ${marker}:end -->`;
  const wrapped = `${start}\n${block}\n${end}`;
  const existing = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (existing.test(source)) {
    return source.replace(existing, wrapped);
  }
  return source.replace("</head>", `  ${wrapped}\n</head>`);
}

const emojiFontLink =
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap" />';

if (!html.includes("Noto+Color+Emoji")) {
  html = html.replace(
    "</head>",
    `  ${emojiFontLink}\n</head>`,
  );
}

const assetFiles = walkFiles(path.join(outDir, "assets"));
const iconFontEntries = Object.entries(ICON_FONT_FAMILIES)
  .map(([filePrefix, family]) => {
    const filePath = assetFiles.find((file) => {
      const name = path.basename(file);
      // Match `Ionicons.<hash>.ttf` but not `Ionicons.Bold.<hash>.ttf` — the
      // hash segment must contain only hex.
      return /^[^.]+\.[a-fA-F0-9]+\.ttf$/.test(name) && name.startsWith(`${filePrefix}.`);
    });
    if (!filePath) {
      console.warn(`Icon font ${filePrefix} (.ttf) not found under assets/ — preload+@font-face injection skipped for ${family}.`);
      return null;
    }
    return { family, href: toWebPath(filePath) };
  })
  .filter(Boolean);

if (iconFontEntries.length) {
  const iconFontLinks = iconFontEntries
    .map(({ href }) => `<link rel="preload" href="${href}" as="font" type="font/ttf" crossorigin />`)
    .join("\n");
  const iconFontCss = [
    "<style id=\"lingua-icon-font-faces\">",
    ...iconFontEntries.map(({ family, href }) =>
      `@font-face{font-family:"${family}";src:url("${href}") format("truetype");font-display:block;}`
    ),
    "</style>",
  ].join("\n");
  html = injectBlock(html, "lingua-icon-fonts", `${iconFontLinks}\n${iconFontCss}`);
}

writeIfChanged(indexPath, html);

writeIfChanged(
  vercelPath,
  `${JSON.stringify(
    {
      rewrites: [
        {
          source: "/api/:path*",
          destination: "https://enigma-production-ea19.up.railway.app/api/:path*",
        },
        { source: "/:path*", destination: "/index.html" },
      ],
    },
    null,
    2,
  )}\n`,
);

console.log(`Post-export patches applied to ${outDir}`);
