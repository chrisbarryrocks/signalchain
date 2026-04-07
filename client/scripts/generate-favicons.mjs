import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "public", "favicon.svg");
const svg = readFileSync(svgPath);

/** Rasterize at exact output size; nearest kernel keeps edges sharp on integer downscales from 64→32 / 64→16. */
async function writeFaviconPng(size, fileName) {
  await sharp(svg)
    .resize(size, size, {
      fit: "fill",
      kernel: sharp.kernel.nearest
    })
    .png({
      compressionLevel: 9,
      effort: 10
    })
    .toFile(join(root, "public", fileName));
}

await writeFaviconPng(32, "favicon-32.png");
await writeFaviconPng(16, "favicon-16.png");
