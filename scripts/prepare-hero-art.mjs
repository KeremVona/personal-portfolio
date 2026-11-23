// Writes the hero picture from the private reference PNG: the wide master, a portrait
// crop and the Open Graph image. Run once with `npm run art:hero` when the art changes.
// See docs/superpowers/specs/2026-11-22-hero-still-design.md.
import { existsSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'

const SRC = 'reference/hero-background.png'
const OUT = 'src/assets/hero'
// 3:4, on the bend in the path and the tree.
const PORTRAIT = { left: 1490, top: 0, width: 1152, height: 1536 }

if (!existsSync(SRC)) {
  console.error(`${SRC} not found`)
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

await sharp(SRC).webp({ quality: 90 }).toFile(`${OUT}/valley.webp`)
await sharp(SRC)
  .extract(PORTRAIT)
  .webp({ quality: 90 })
  .toFile(`${OUT}/valley-portrait.webp`)
await sharp(SRC)
  .resize(1200, 675)
  .extract({ left: 0, top: 45, width: 1200, height: 630 })
  .jpeg({ quality: 85 })
  .toFile('public/og-image.jpg')

console.log(`Wrote the hero masters in ${OUT} and public/og-image.jpg`)
