// Writes the footer's sky background from the private reference PNG: the full image,
// plus a square centre crop for phones.
// Run once with `npm run art:footer` when the art changes.
// See docs/superpowers/specs/2026-11-22-footer-sky-design.md.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const SRC = 'reference/674561874.png'
const OUT = 'src/assets/footer'
const W = 2730
const H = 1536
// Keep in step with --color-footer-sky in src/index.css: the footer continues in it
// above the image.
const SKY = '#3a64ac'
// [height, strength] of SKY over the upper sky, so cream text (which ends above
// 32% of the height) reaches 4.5:1. The long tail keeps the fade from showing as
// a band; the computer is cut out of it.
const DEEPEN = [
  [0, 1],
  [0.1, 0.78],
  [0.22, 0.64],
  [0.32, 0.53],
  [0.36, 0.43],
  [0.4, 0.32],
  [0.44, 0.22],
  [0.48, 0.13],
  [0.53, 0.06],
  [0.6, 0],
]
const COMPUTER = { x: 1151, y: 699, width: 432, height: 540, rx: 22 }

if (!existsSync(SRC)) {
  console.error(`${SRC} not found`)
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

const stops = DEEPEN.map(
  ([at, strength]) =>
    `<stop offset="${at}" stop-color="${SKY}" stop-opacity="${strength}"/>`,
).join('')
const overlay = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient>
    <mask id="keep" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="#fff"/>
      <rect x="${COMPUTER.x}" y="${COMPUTER.y}" width="${COMPUTER.width}"
        height="${COMPUTER.height}" rx="${COMPUTER.rx}" fill="#000"/>
    </mask>
    <rect width="${W}" height="${H}" fill="url(#sky)" mask="url(#keep)"/>
  </svg>`,
)
const art = await sharp(SRC)
  .composite([{ input: overlay }])
  .removeAlpha()
  .png()
  .toBuffer()

await sharp(art).webp({ quality: 90 }).toFile(`${OUT}/sky.webp`)
await sharp(art)
  .extract({ left: (W - H) / 2, top: 0, width: H, height: H })
  .webp({ quality: 90 })
  .toFile(`${OUT}/sky-phone.webp`)

// The night version from reference/footer-dark.png, the same hilltop under the
// Milky Way. Cream passes on its sky as it is, so it only fades to its own top colour
// over its upper third (softly, so the stars come in gradually) from the top, where the footer continues as a solid colour above the image
// (--color-night-footer, written to night.json).
// See docs/superpowers/specs/2026-11-25-night-mode-design.md §5.
const NIGHT_SRC = 'reference/footer-dark.png'
if (existsSync(NIGHT_SRC)) {
  const { data } = await sharp(NIGHT_SRC)
    .removeAlpha()
    .extract({ left: 0, top: 0, width: W, height: 24 })
    .resize(1, 1)
    .raw()
    .toBuffer({ resolveWithObject: true })
  const top = `#${[...data].map((v) => v.toString(16).padStart(2, '0')).join('')}`
  const nightOverlay = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${top}" stop-opacity="1"/>
        <stop offset="0.06" stop-color="${top}" stop-opacity="0.72"/>
        <stop offset="0.14" stop-color="${top}" stop-opacity="0.4"/>
        <stop offset="0.24" stop-color="${top}" stop-opacity="0.14"/>
        <stop offset="0.34" stop-color="${top}" stop-opacity="0"/>
      </linearGradient>
      <rect width="${W}" height="${H}" fill="url(#top)"/>
    </svg>`,
  )
  const nightArt = await sharp(NIGHT_SRC)
    .composite([{ input: nightOverlay }])
    .removeAlpha()
    .png()
    .toBuffer()
  await sharp(nightArt).webp({ quality: 90 }).toFile(`${OUT}/sky-night.webp`)
  await sharp(nightArt)
    .extract({ left: (W - H) / 2, top: 0, width: H, height: H })
    .webp({ quality: 90 })
    .toFile(`${OUT}/sky-night-phone.webp`)
  writeFileSync(`${OUT}/night.json`, `${JSON.stringify({ top }, null, 2)}\n`)
  console.log(`Wrote the night footer (top ${top})`)
} else console.warn(`${NIGHT_SRC} not found: skipped the night footer`)

console.log(`Wrote ${OUT}/sky.webp and ${OUT}/sky-phone.webp`)
