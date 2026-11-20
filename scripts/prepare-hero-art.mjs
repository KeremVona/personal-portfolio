// Cuts the hero art from the private reference/hero PNGs into committed WebP masters,
// phone crops and the Open Graph image. Run once with `npm run art:hero` when the art changes.
// See docs/superpowers/specs/2026-11-21-hero-design.md §3 and §7.
import { existsSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'

const SRC = 'reference/hero'
const OUT = 'src/assets/hero'
const HEIGHT = 1536

// [output id, source file]
const MASTERS = [
  ['sky', '4'],
  ['meadow', '3'],
  ['stems', '5'],
  ['cluster-left', '2'],
  ['cluster-right', '1'],
]

// [output id, source file, left px, right px] in the 2730-wide art
const CENTRE = [751, 1979]
const LEFT = [0, 1229]
const RIGHT = [1501, 2730]
const CROPS = [
  ['sky-centre', '4', ...CENTRE],
  ['meadow-centre', '3', ...CENTRE],
  ['stems-left', '5', ...LEFT],
  ['stems-right', '5', ...RIGHT],
  ['cluster-left-left', '2', ...LEFT],
  ['cluster-right-right', '1', ...RIGHT],
]

// back to front
const STACK = ['4', '3', '5', '2', '1']

if (!existsSync(SRC)) {
  console.error('reference/hero not found')
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

const png = (file) => `${SRC}/${file}.png`

for (const [id, file] of MASTERS) {
  await sharp(png(file)).webp({ quality: 92 }).toFile(`${OUT}/${id}.webp`)
}

for (const [id, file, x0, x1] of CROPS) {
  await sharp(png(file))
    .extract({ left: x0, top: 0, width: x1 - x0, height: HEIGHT })
    .webp({ quality: 92 })
    .toFile(`${OUT}/${id}.webp`)
}

const [base, ...over] = STACK
const composed = await sharp(png(base))
  .composite(over.map((file) => ({ input: png(file) })))
  .png()
  .toBuffer()
await sharp(composed)
  .resize(1200, 675)
  .extract({ left: 0, top: 45, width: 1200, height: 630 })
  .jpeg({ quality: 85 })
  .toFile('public/og-image.jpg')

console.log(
  `Wrote ${MASTERS.length} masters, ${CROPS.length} crops and public/og-image.jpg`,
)
