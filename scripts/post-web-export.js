const fs = require("fs");
const path = require("path");

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

let html = fs.readFileSync(indexPath, "utf8");

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
      return name.startsWith(`${filePrefix}.`) && name.endsWith(".ttf");
    });
    return filePath ? { family, href: toWebPath(filePath) } : null;
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
