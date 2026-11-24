// Writes the sky hero from the private reference PNG: the background with the floating
// cloud removed (and its sky deepened behind the copy), the cloud layer on
// transparency, the cloud's box, a portrait crop, and the Open Graph image.
// Run once with `npm run art:hero` when the art changes.
// See docs/superpowers/specs/2026-11-24-sky-hero-design.md §3.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const SRC = 'reference/647386481.png'
const OUT = 'src/assets/hero'

if (!existsSync(SRC)) {
  console.error(`${SRC} not found`)
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

const { data, info } = await sharp(SRC)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
const W = info.width
const H = info.height
const at = (x, y) => (y * W + x) * 3

// The area holding the floating cloud, computer and plants.
const X0 = 800
const X1 = 1930
const Y0 = 440
const Y1 = 1268
// Below this row the sky is pale near the horizon, so only clearly cloudy pixels seed.
const HORIZON_Y = 1180
// A pixel on the computer to start the flood from.
const SEED = [1370, 900]
const RIM = 14 // px of soft edge; inside that the layer is solid
const FILL_GROW = 70 // px around the cloud the background is refilled with sky (its glow included)
const FEATHER = 40 // px over which the refill blends into the real sky

const inRegion = (x, y) => x >= X0 && x < X1 && y >= Y0 && y < Y1

// The sky colour of a row on either side of the region, and between them.
const sideSky = (y, side) => {
  const sum = [0, 0, 0]
  let n = 0
  const [a, b] = side < 0 ? [X0 - 60, X0 - 10] : [X1 + 10, X1 + 60]
  for (let x = a; x < b; x += 2) {
    const o = at(x, y)
    for (let c = 0; c < 3; c++) sum[c] += data[o + c]
    n++
  }
  return sum.map((v) => v / n)
}
const rowSky = []
for (let y = Y0; y < Y1; y++) rowSky[y] = [sideSky(y, -1), sideSky(y, 1)]
const skyAt = (x, y) => {
  const [L, R] = rowSky[y]
  const t = (x - X0) / (X1 - X0)
  return [0, 1, 2].map((c) => L[c] * (1 - t) + R[c] * t)
}
const blueness = (p) => p[2] - (p[0] + p[1]) / 2

// 1. How unlike the sky each pixel is (0 = sky, 1 = cloud or computer).
const alpha = new Float32Array(W * H)
for (let y = Y0; y < Y1; y++)
  for (let x = X0; x < X1; x++) {
    const o = at(x, y)
    const p = [data[o], data[o + 1], data[o + 2]]
    const sky = skyAt(x, y)
    // Near the horizon the sky is almost grey, so blueness says nothing there.
    const blueWeight = Math.min(1, Math.max(0, (blueness(sky) - 10) / 30))
    const byBlue = blueWeight * (1 - blueness(p) / Math.max(8, blueness(sky)))
    const byDistance =
      Math.hypot(p[0] - sky[0], p[1] - sky[1], p[2] - sky[2]) / 90
    alpha[y * W + x] = Math.min(
      1,
      Math.max(0, byBlue * 1.15 - 0.08, byDistance - 0.15),
    )
  }

// 2. The one connected shape around the computer (drops seeds and horizon bits).
const keep = new Uint8Array(W * H)
const stack = [SEED]
while (stack.length) {
  const [x, y] = stack.pop()
  if (!inRegion(x, y)) continue
  const i = y * W + x
  const threshold = y >= HORIZON_Y ? 0.55 : 0.2
  if (keep[i] || alpha[i] < threshold) continue
  keep[i] = 1
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
}

// 3. Fill holes, then make the inside solid and keep only a soft rim.
const outside = new Uint8Array(W * H)
for (let x = X0; x < X1; x++) stack.push([x, Y0], [x, Y1 - 1])
for (let y = Y0; y < Y1; y++) stack.push([X0, y], [X1 - 1, y])
while (stack.length) {
  const [x, y] = stack.pop()
  if (!inRegion(x, y)) continue
  const i = y * W + x
  if (outside[i] || keep[i]) continue
  outside[i] = 1
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
}
const isOutside = (x, y) => !inRegion(x, y) || outside[y * W + x]
for (let y = Y0; y < Y1; y++)
  for (let x = X0; x < X1; x++) {
    const i = y * W + x
    if (outside[i]) {
      alpha[i] = 0
      continue
    }
    let d = RIM
    for (let r = 1; r < RIM && d === RIM; r++)
      for (let k = -r; k <= r && d === RIM; k++)
        if (
          isOutside(x + k, y - r) ||
          isOutside(x + k, y + r) ||
          isOutside(x - r, y + k) ||
          isOutside(x + r, y + k)
        )
          d = r
    keep[i] = 1
    alpha[i] = Math.max(alpha[i], Math.min(1, (d - 2) / (RIM - 2)))
  }

// 4. The cloud's box, and the cloud layer cropped to it.
let left = X1
let right = X0
let top = Y1
let bottom = Y0
for (let y = Y0; y < Y1; y++)
  for (let x = X0; x < X1; x++)
    if (alpha[y * W + x] > 0.02) {
      left = Math.min(left, x)
      right = Math.max(right, x + 1)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y + 1)
    }
const box = { left, top, width: right - left, height: bottom - top }
const cloud = Buffer.alloc(box.width * box.height * 4)
for (let y = 0; y < box.height; y++)
  for (let x = 0; x < box.width; x++) {
    const sx = box.left + x
    const sy = box.top + y
    const o = at(sx, sy)
    const t = (y * box.width + x) * 4
    cloud[t] = data[o]
    cloud[t + 1] = data[o + 1]
    cloud[t + 2] = data[o + 2]
    cloud[t + 3] = Math.round(alpha[sy * W + sx] * 255)
  }

// 5. The background: refill the sky where the cloud was. The cloud is shown further
// right than in the picture, so its old spot must be clean sky, glow and all. The
// refill covers the cloud grown by FILL_GROW and blends in over FEATHER.
const sky = Buffer.from(data)
// Distance (px) from the cloud, by a two-pass chamfer transform over the region
// grown by the refill's reach.
const REACH = FILL_GROW + FEATHER
const DX0 = X0 - REACH
const DY0 = Y0 - REACH
const DW = X1 - X0 + 2 * REACH
const DH = Y1 - Y0 + 2 * REACH
const dist = new Float32Array(DW * DH).fill(1e9)
for (let y = Y0; y < Y1; y++)
  for (let x = X0; x < X1; x++)
    if (alpha[y * W + x] > 0.02) dist[(y - DY0) * DW + (x - DX0)] = 0
const relax = (i, j, cost) => {
  if (dist[j] + cost < dist[i]) dist[i] = dist[j] + cost
}
for (let y = 0; y < DH; y++)
  for (let x = 0; x < DW; x++) {
    const i = y * DW + x
    if (x > 0) relax(i, i - 1, 1)
    if (y > 0) relax(i, i - DW, 1)
    if (x > 0 && y > 0) relax(i, i - DW - 1, Math.SQRT2)
    if (x < DW - 1 && y > 0) relax(i, i - DW + 1, Math.SQRT2)
  }
for (let y = DH - 1; y >= 0; y--)
  for (let x = DW - 1; x >= 0; x--) {
    const i = y * DW + x
    if (x < DW - 1) relax(i, i + 1, 1)
    if (y < DH - 1) relax(i, i + DW, 1)
    if (x < DW - 1 && y < DH - 1) relax(i, i + DW + 1, Math.SQRT2)
    if (x > 0 && y < DH - 1) relax(i, i + DW - 1, Math.SQRT2)
  }
const refillWeight = (x, y) => {
  const dx = x - DX0
  const dy = y - DY0
  if (dx < 0 || dy < 0 || dx >= DW || dy >= DH) return 0
  const d = dist[dy * DW + dx]
  if (d <= FILL_GROW) return 1
  const t = Math.min(1, (d - FILL_GROW) / FEATHER)
  return 1 - t * t * (3 - 2 * t)
}
// Rows outside the sampled band reuse the nearest sampled row.
const fillAt = (x, y) =>
  skyAt(Math.min(X1 - 1, Math.max(X0, x)), Math.min(Y1 - 1, Math.max(Y0, y)))
for (let y = Math.max(0, DY0); y < Math.min(H, DY0 + DH); y++)
  for (let x = Math.max(0, DX0); x < Math.min(W, DX0 + DW); x++) {
    const weight = refillWeight(x, y)
    if (weight <= 0) continue
    const fill = fillAt(x, y)
    const o = at(x, y)
    for (let c = 0; c < 3; c++)
      sky[o + c] = Math.round(sky[o + c] * (1 - weight) + fill[c] * weight)
  }

// 6. Deepen the sky wherever copy can sit, so cream text passes AA: from the top
// down to just above the horizon glow, a little less at the far right. The picture
// is lighter on the left, which is where the copy is.
const DEEP = [34, 66, 124] // #22427c
const smooth = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const u = x / W
    const v = y / H
    const height = 1 - smooth(0.64, 0.77, v)
    const side =
      1 - 0.3 * smooth(0.72, 0.98, u) + 0.12 * (1 - smooth(0, 0.35, u))
    const weight = Math.min(0.82, 0.72 * height * side)
    if (weight <= 0) continue
    const o = at(x, y)
    for (let c = 0; c < 3; c++)
      sky[o + c] = Math.round(sky[o + c] * (1 - weight) + DEEP[c] * weight)
  }

// 7. Write everything. Masters at high quality: vite-imagetools re-encodes.
const raw3 = { raw: { width: W, height: H, channels: 3 } }
await sharp(sky, raw3).webp({ quality: 90 }).toFile(`${OUT}/sky.webp`)
const portraitLeft = Math.round(box.left + box.width / 2 - 1152 / 2)
await sharp(sky, raw3)
  .extract({ left: portraitLeft, top: 0, width: 1152, height: 1536 })
  .webp({ quality: 90 })
  .toFile(`${OUT}/sky-portrait.webp`)
await sharp(cloud, {
  raw: { width: box.width, height: box.height, channels: 4 },
})
  .webp({ quality: 90, alphaQuality: 90 })
  .toFile(`${OUT}/cloud.webp`)
writeFileSync(
  `${OUT}/cloud-box.json`,
  JSON.stringify({ ...box, portraitLeft }, null, 2) + '\n',
)
await sharp(SRC)
  .resize(1200, 675)
  .extract({ left: 0, top: 45, width: 1200, height: 630 })
  .jpeg({ quality: 85 })
  .toFile('public/og-image.jpg')

console.log(`Wrote the sky hero in ${OUT} and public/og-image.jpg`, box, {
  portraitLeft,
})
