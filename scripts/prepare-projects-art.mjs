// Cuts the Projects corner bouquets from the private reference/hero PNGs (the same
// painted clusters as the hero) into committed WebP masters.
// Run once with `npm run art:projects` when the art changes.
// See docs/superpowers/specs/2026-11-21-projects-design.md §3.
import { existsSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'

const SRC = 'reference/hero'
const OUT = 'src/assets/projects'

// [output id, source file, crop] in the 2730×1536 art
const BOUQUETS = [
  ['bouquet-left', '2', { left: 0, top: 560, width: 1220, height: 976 }],
  ['bouquet-right', '1', { left: 1510, top: 580, width: 1220, height: 956 }],
]

if (!existsSync(SRC)) {
  console.error('reference/hero not found')
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

for (const [id, file, crop] of BOUQUETS) {
  const cropped = await sharp(`${SRC}/${file}.png`)
    .extract(crop)
    .png()
    .toBuffer()
  await sharp(cropped)
    .trim()
    .resize({ width: 760 })
    .webp({ quality: 85, alphaQuality: 90 })
    .toFile(`${OUT}/${id}.webp`)
  console.log(`Wrote ${OUT}/${id}.webp`)
}
