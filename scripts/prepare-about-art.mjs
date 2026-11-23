// Cuts the About art from the private reference/671.png into committed WebP masters:
// - koi.webp: the painting, shown as is (and the pond's still fallback);
// - pond.webp: the painting with its koi painted out;
// - pads.webp: its lily pads alone, which the fish swim under;
// - koi-body-N / koi-shadow-N: three koi lifted out straight (tail left, head right),
//   without their painted side fins, plus a blurred silhouette of each for its shadow.
// Run once with `npm run art:about` when the painting changes.
// See docs/superpowers/specs/2026-11-23-about-pond-design.md §4.
import { existsSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'

const SRC = 'reference/671.png'
const OUT = 'src/assets/about'
const WIDTH = 1200

// Each koi's spine in the 1200-wide painting, tail → head, and its half-height in px.
// Only the first three become sprites; all five are painted out of the pond.
const FISH = [
  [
    [392, 722],
    [365, 760],
    [343, 822],
    [372, 880],
    [430, 932],
    [500, 1000],
    [545, 1030],
    [578, 1040],
  ],
  [
    [180, 890],
    [205, 975],
    [250, 1052],
    [335, 1112],
    [420, 1162],
    [490, 1196],
    [538, 1228],
  ],
  [
    [455, 1430],
    [525, 1410],
    [590, 1365],
    [650, 1300],
    [700, 1225],
    [740, 1170],
    [768, 1130],
  ],
  [
    [866, 450],
    [862, 530],
    [826, 590],
    [760, 627],
    [700, 662],
    [648, 688],
  ],
  [
    [612, 356],
    [680, 383],
    [736, 420],
    [778, 467],
    [806, 500],
  ],
]
const HALF = [94, 98, 100, 76, 48]
const SPRITES = 3

// Half-width along the fish (0 = tail, 1 = head) as a share of HALF.
// The whole painted fish, fins included: what gets painted out.
const PAINTED = [
  [0, 0.45],
  [0.08, 0.62],
  [0.17, 0.42],
  [0.26, 0.34],
  [0.4, 0.62],
  [0.55, 0.8],
  [0.72, 0.86],
  [0.82, 0.64],
  [0.92, 0.5],
  [0.98, 0.28],
  [1, 0.12],
]
// The body and tail only: the sprite (the pond draws its own side fins).
const BODY = [
  [0, 0.5],
  [0.07, 0.62],
  [0.15, 0.24],
  [0.24, 0.2],
  [0.36, 0.33],
  [0.5, 0.45],
  [0.66, 0.52],
  [0.8, 0.5],
  [0.9, 0.42],
  [0.97, 0.27],
  [1, 0.12],
]

const PADS = [
  [
    [632, 930],
    [650, 890],
    [700, 860],
    [760, 845],
    [830, 838],
    [900, 865],
    [920, 890],
    [842, 918],
    [845, 930],
    [925, 925],
    [950, 950],
    [915, 1000],
    [850, 1030],
    [770, 1045],
    [700, 1030],
    [645, 990],
  ],
  [
    [506, 815],
    [530, 775],
    [590, 755],
    [660, 758],
    [725, 785],
    [738, 830],
    [700, 865],
    [640, 880],
    [570, 880],
    [520, 855],
  ],
  [
    [728, 760],
    [760, 740],
    [790, 708],
    [860, 703],
    [950, 722],
    [1002, 765],
    [990, 800],
    [920, 820],
    [850, 852],
    [780, 830],
    [738, 800],
  ],
  [
    [905, 880],
    [935, 835],
    [990, 815],
    [1070, 810],
    [1128, 830],
    [1128, 975],
    [1040, 960],
    [990, 975],
    [930, 940],
  ],
  [
    [888, 1050],
    [925, 1005],
    [975, 985],
    [1005, 1030],
    [1030, 1010],
    [1005, 968],
    [1128, 965],
    [1128, 1150],
    [1050, 1168],
    [960, 1150],
    [895, 1110],
  ],
  [
    [470, 505],
    [510, 470],
    [560, 458],
    [640, 460],
    [688, 500],
    [670, 540],
    [600, 562],
    [540, 560],
    [480, 535],
  ],
  [
    [145, 555],
    [170, 515],
    [250, 488],
    [340, 500],
    [382, 535],
    [360, 580],
    [290, 605],
    [200, 600],
  ],
  [
    [318, 440],
    [380, 425],
    [450, 425],
    [505, 450],
    [470, 482],
    [380, 488],
    [325, 475],
  ],
  [
    [958, 680],
    [1010, 655],
    [1080, 655],
    [1128, 675],
    [1128, 765],
    [1050, 775],
    [970, 740],
  ],
  [
    [72, 1280],
    [140, 1262],
    [270, 1275],
    [300, 1300],
    [215, 1390],
    [360, 1345],
    [395, 1390],
    [400, 1470],
    [360, 1525],
    [72, 1525],
  ],
]

// Watercolour washes dabbed over the painted-out water, so it isn't a flat blur.
const WATER = [
  [38, 128, 150],
  [70, 120, 190],
  [110, 185, 196],
  [28, 82, 108],
  [140, 160, 215],
  [48, 150, 170],
]
const SKY_WATER = [
  [168, 172, 222],
  [238, 226, 190],
  [140, 200, 215],
]

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const lerpTable = (table, u) => {
  for (let i = 1; i < table.length; i++) {
    if (u > table[i][0]) continue
    const [a, p] = table[i - 1]
    const [b, q] = table[i]
    return p + ((q - p) * (u - a)) / (b - a)
  }
  return table.at(-1)[1]
}
// A deterministic generator, so re-running gives byte-identical art.
let seed = 7
const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647

/** A Catmull-Rom spine resampled every 1px: [x, y, dirX, dirY] per step. */
function spine(points) {
  const dense = []
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i - 1] ?? points[i]
    const b = points[i]
    const c = points[i + 1]
    const e = points[i + 2] ?? c
    for (let s = 0; s < 60; s++) {
      const t = s / 60
      dense.push(
        [0, 1].map(
          (k) =>
            0.5 *
            (2 * b[k] +
              (c[k] - a[k]) * t +
              (2 * a[k] - 5 * b[k] + 4 * c[k] - e[k]) * t * t +
              (3 * b[k] - a[k] - 3 * c[k] + e[k]) * t * t * t),
        ),
      )
    }
  }
  dense.push(points.at(-1))
  const out = [dense[0]]
  let run = 0
  for (let i = 1; i < dense.length; i++) {
    run += Math.hypot(
      dense[i][0] - dense[i - 1][0],
      dense[i][1] - dense[i - 1][1],
    )
    if (run >= out.length) out.push(dense[i])
  }
  return out.map((p, i) => {
    const a = out[Math.max(0, i - 9)]
    const b = out[Math.min(out.length - 1, i + 9)]
    const l = Math.hypot(b[0] - a[0], b[1] - a[1])
    return [p[0], p[1], (b[0] - a[0]) / l, (b[1] - a[1]) / l]
  })
}

if (!existsSync(SRC)) {
  console.error(`${SRC} not found`)
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

const painting = sharp(SRC).resize({ width: WIDTH })
await painting.clone().webp({ quality: 85 }).toFile(`${OUT}/koi.webp`)
const { data, info } = await painting
  .clone()
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
const W = info.width
const H = info.height
const px = (x, y, c) =>
  data[
    (clamp(Math.round(y), 0, H - 1) * W + clamp(Math.round(x), 0, W - 1)) * 3 +
      c
  ]

// 1. Lift the koi out, and mark where each one was.
const hole = new Float32Array(W * H)
for (let f = 0; f < FISH.length; f++) {
  const line = spine(FISH[f])
  const L = line.length
  const R = HALF[f]
  if (f < SPRITES) {
    const body = Buffer.alloc(L * R * 2 * 4)
    line.forEach(([x, y, dx, dy], i) => {
      const u = i / (L - 1)
      const w = lerpTable(BODY, u) * R
      const tail = u < 0.16
      for (let v = -R; v < R; v++) {
        const sx = x - dy * v
        const sy = y + dx * v
        const [r, g, b] = [0, 1, 2].map((c) => px(sx, sy, c))
        const q = Math.abs(v) / w
        // Koi are warm and the water cool: keep warm pixels near the edge of the body.
        const warm = smooth(-32, 34, r - 0.55 * b - 0.45 * g)
        const core = 1 - smooth(0.38, 0.66, q)
        const edge = 1 - smooth(tail ? 0.78 : 0.7, tail ? 1.12 : 1, q)
        const ends = smooth(0, 14, i) * smooth(0, 7, L - 1 - i)
        const alpha = edge * Math.max(core, tail ? warm : warm * 0.85) * ends
        body.set([r, g, b, Math.round(alpha * 255)], ((v + R) * L + i) * 4)
      }
    })
    const raw = { raw: { width: L, height: R * 2, channels: 4 } }
    await sharp(body, raw)
      .webp({ quality: 85 })
      .toFile(`${OUT}/koi-body-${f}.webp`)
    const shade = Buffer.from(body)
    for (let k = 0; k < shade.length; k += 4) shade.set([18, 40, 52], k)
    await sharp(shade, raw)
      .blur(7)
      .webp({ quality: 70 })
      .toFile(`${OUT}/koi-shadow-${f}.webp`)
  }
  for (let i = 0; i < L; i += 3) {
    const radius = lerpTable(PAINTED, i / (L - 1)) * R + 9
    const [x, y] = line[i]
    for (
      let yy = Math.max(0, (y - radius - 16) | 0);
      yy < Math.min(H, y + radius + 16);
      yy++
    ) {
      for (
        let xx = Math.max(0, (x - radius - 16) | 0);
        xx < Math.min(W, x + radius + 16);
        xx++
      ) {
        const a = 1 - smooth(radius, radius + 16, Math.hypot(xx - x, yy - y))
        const k = yy * W + xx
        if (a > hole[k]) hole[k] = a
      }
    }
  }
}

// 2. Paint the water back: diffuse the surrounding washes into the holes at quarter size,
//    add a little grain, then dab watercolour washes over them.
const w = (W / 4) | 0
const h = (H / 4) | 0
const small = new Float32Array(w * h * 3)
const fixed = new Uint8Array(w * h)
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const k = y * w + x
    fixed[k] = hole[(y * 4 + 2) * W + x * 4 + 2] < 0.02 ? 1 : 0
    for (let c = 0; c < 3; c++)
      small[k * 3 + c] = fixed[k] ? px(x * 4 + 2, y * 4 + 2, c) : 100
  }
}
for (let n = 0; n < 1500; n++) {
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const k = y * w + x
      if (fixed[k]) continue
      for (let c = 0; c < 3; c++) {
        const i = k * 3 + c
        small[i] =
          (small[i - 3] + small[i + 3] + small[i - w * 3] + small[i + w * 3]) /
          4
      }
    }
  }
}
const fill = await sharp(Buffer.from(Uint8Array.from(small, Math.round)), {
  raw: { width: w, height: h, channels: 3 },
})
  .resize(W, H, { fit: 'fill' })
  .raw()
  .toBuffer()
const pond = Buffer.from(data)
for (let k = 0; k < W * H; k++) {
  if (hole[k] <= 0) continue
  const grain = (random() - 0.5) * 20
  for (let c = 0; c < 3; c++)
    pond[k * 3 + c] = clamp(
      data[k * 3 + c] * (1 - hole[k]) + (fill[k * 3 + c] + grain) * hole[k],
      0,
      255,
    )
}
for (let n = 0; n < 900; n++) {
  const cx = 100 + random() * 1000
  const cy = 340 + random() * 1170
  if (hole[(cy | 0) * W + (cx | 0)] < 0.5) continue
  const rx = 18 + random() * 55
  const ry = 6 + random() * 20
  const tilt = (random() - 0.5) * 0.7
  const colour =
    cy < 700
      ? SKY_WATER[(random() * 3) | 0]
      : WATER[(random() * WATER.length) | 0]
  const strength = 0.12 + random() * 0.17
  const phase = random() * 6
  for (let y = (cy - rx) | 0; y < Math.min(H, cy + rx); y++) {
    for (let x = (cx - rx) | 0; x < Math.min(W, cx + rx); x++) {
      const X = (x - cx) * Math.cos(tilt) + (y - cy) * Math.sin(tilt)
      const Y = -(x - cx) * Math.sin(tilt) + (y - cy) * Math.cos(tilt)
      const angle = Math.atan2(Y / ry, X / rx)
      const d =
        Math.hypot(X / rx, Y / ry) /
        (1 + 0.12 * Math.sin(angle * 3 + phase) + 0.06 * Math.sin(angle * 7))
      if (d >= 1) continue
      const k = y * W + x
      const a = strength * (1 - smooth(0.82, 1, d)) * hole[k] * (0.8 + 0.35 * d)
      for (let c = 0; c < 3; c++)
        pond[k * 3 + c] = pond[k * 3 + c] * (1 - a) + colour[c] * a
    }
  }
}
await sharp(pond, { raw: { width: W, height: H, channels: 3 } })
  .webp({ quality: 85 })
  .toFile(`${OUT}/pond.webp`)

// 3. The lily pads, with soft edges, cut from the painted-out pond.
const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${PADS.map((p) => `<polygon points="${p.join(' ')}" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`).join('')}</svg>`
const mask = await sharp(Buffer.from(svg))
  .extractChannel(3)
  .blur(3)
  .raw()
  .toBuffer()
const pads = Buffer.alloc(W * H * 4)
for (let k = 0; k < W * H; k++)
  pads.set([pond[k * 3], pond[k * 3 + 1], pond[k * 3 + 2], mask[k]], k * 4)
await sharp(pads, { raw: { width: W, height: H, channels: 4 } })
  .webp({ quality: 85 })
  .toFile(`${OUT}/pads.webp`)

console.log(
  `Wrote koi, pond, pads and ${SPRITES} koi bodies and shadows to ${OUT}`,
)
