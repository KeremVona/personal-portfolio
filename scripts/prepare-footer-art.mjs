// Composites the footer's flower band from the private reference/hero PNGs (the hero's
// stems and both flower clusters) into a committed WebP master.
// Run once with `npm run art:footer` when the art changes.
// See docs/superpowers/specs/2026-11-21-footer-design.md §3.
import { existsSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'

const SRC = 'reference/hero'
const OUT = 'src/assets/footer'
// The flowering part of the 2730×1536 art; painted content starts at about y 572.
const CROP = { left: 0, top: 560, width: 2730, height: 976 }

if (!existsSync(SRC)) {
  console.error('reference/hero not found')
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

const png = (file) => `${SRC}/${file}.png`
const band = await sharp(png('5'))
  .composite([{ input: png('2') }, { input: png('1') }])
  .png()
  .toBuffer()
// The band only ever sits on the footer's ink background, so flatten onto it:
// no alpha channel makes every served variant far smaller.
await sharp(band)
  .extract(CROP)
  .flatten({ background: '#1c2a1e' })
  .webp({ quality: 85 })
  .toFile(`${OUT}/band.webp`)

console.log(`Wrote ${OUT}/band.webp`)
