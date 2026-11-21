// Cuts the About painting from the private reference/671.png into a committed WebP
// master. Run once with `npm run art:about` when the painting changes.
// See docs/superpowers/specs/2026-11-21-about-design.md §5.
import { existsSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'

const SRC = 'reference/671.png'
const OUT = 'src/assets/about'

if (!existsSync(SRC)) {
  console.error('reference/671.png not found')
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

await sharp(SRC)
  .resize({ width: 1200 })
  .webp({ quality: 85 })
  .toFile(`${OUT}/koi.webp`)

console.log(`Wrote ${OUT}/koi.webp`)
