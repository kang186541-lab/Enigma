import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const EMOJI_RE = /[\p{Extended_Pictographic}\p{Emoji_Presentation}]/u;

function walk(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(path));
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      files.push(path.replace(/\\/g, "/"));
    }
  }

  return files;
}

const themeSource = readFileSync("constants/theme.ts", "utf8");
assert.ok(themeSource.includes("Apple Color Emoji"), "Web font fallback must include Apple Color Emoji");
assert.ok(themeSource.includes("Segoe UI Emoji"), "Web font fallback must include Segoe UI Emoji");
assert.ok(themeSource.includes("Noto Color Emoji"), "Web font fallback must include Noto Color Emoji");

const emojiTextSource = readFileSync("components/EmojiText.tsx", "utf8");
assert.ok(emojiTextSource.includes("WEB_EMOJI_FONT_FAMILY"), "EmojiText must keep a dedicated web emoji font family");
assert.ok(emojiTextSource.includes("EMOJI_SPLIT_RE"), "EmojiText must keep emoji/text splitting for custom-font Text");

const rawEmojiTextHits: string[] = [];
for (const file of [...walk("app"), ...walk("components")]) {
  const source = readFileSync(file, "utf8");
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.includes("<Text") && EMOJI_RE.test(line)) {
      rawEmojiTextHits.push(`${file}:${index + 1}: ${line.trim()}`);
    }
  });

  const textBlockRe = /<Text(?!Input|Style)\b[\s\S]*?<\/Text>/g;
  const variableEmojiRe =
    /\{[^}]*\b(?:flag|emoji|heart)\b[^}]*\}|getCharTip\(|scoreInfo\.emoji|level\.heart|emojiIcon/;

  for (const match of source.matchAll(textBlockRe)) {
    const block = match[0];
    if (!EMOJI_RE.test(block) && !variableEmojiRe.test(block)) continue;

    const lineNumber = source.slice(0, match.index ?? 0).split(/\r?\n/).length;
    rawEmojiTextHits.push(
      `${file}:${lineNumber}: raw <Text> contains emoji or emoji-like variable; use EmojiText`,
    );
  }
}

assert.equal(
  rawEmojiTextHits.length,
  0,
  `Use EmojiText for visible emoji in app/components to avoid web square glyphs:\n${rawEmojiTextHits.join("\n")}`,
);

console.log("web emoji safety verification passed");
