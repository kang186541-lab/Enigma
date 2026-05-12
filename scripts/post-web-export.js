const fs = require("fs");
const path = require("path");

const outDir = process.argv[2] || "dist";
const indexPath = path.join(outDir, "index.html");
const vercelPath = path.join(outDir, "vercel.json");

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

const emojiFontLink =
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap" />';

if (!html.includes("Noto+Color+Emoji")) {
  html = html.replace(
    "</head>",
    `  ${emojiFontLink}\n</head>`,
  );
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
