import { describe, expect, it } from 'vitest'
import {
  ART_ASPECT,
  artRect,
  chooseSource,
  isNarrow,
  sourceRect,
  visibleSpan,
  type Anchor,
  type CropDef,
  type ImageVariant,
  type LayerDef,
  type Rect,
} from './placement'

const V = (w: number): ImageVariant => ({
  src: `x-${w}.webp`,
  width: w,
  height: Math.round(w / ART_ASPECT),
})
const FULL = [V(1280), V(1920), V(2730)]
const CROP_VARIANT: ImageVariant = { src: 'c.webp', width: 864, height: 1080 }
const crop = (x0: number, x1: number): CropDef => ({
  x0: x0 / 2730,
  x1: x1 / 2730,
  variant: CROP_VARIANT,
})
const layer = (
  anchor: Anchor,
  clip: [number, number],
  c?: CropDef,
): LayerDef => ({
  id: 'cluster-left',
  bend: 0.011,
  anchor,
  clip,
  full: FULL,
  crop: c,
})

function expectRect(r: Rect, e: Rect) {
  expect(r.x).toBeCloseTo(e.x, 1)
  expect(r.y).toBeCloseTo(e.y, 1)
  expect(r.width).toBeCloseTo(e.width, 1)
  expect(r.height).toBeCloseTo(e.height, 1)
}

const PHONE = { width: 390, height: 844 }

describe('isNarrow', () => {
  it('switches below a 1.2 width-to-height ratio', () => {
    expect(isNarrow({ width: 1440, height: 900 })).toBe(false)
    expect(isNarrow({ width: 1200, height: 1000 })).toBe(false)
    expect(isNarrow({ width: 1199, height: 1000 })).toBe(true)
    expect(isNarrow(PHONE)).toBe(true)
  })
})

describe('artRect', () => {
  it('wide layers cover, anchored bottom-centre, whatever the anchor', () => {
    const e = { x: -79.8, y: 0, width: 1599.6, height: 900 }
    expectRect(artRect({ width: 1440, height: 900 }, 'left'), e)
    expectRect(artRect({ width: 1440, height: 900 }, 'right'), e)
    expectRect(artRect({ width: 1440, height: 900 }, 'cover'), e)
  })

  it('ultra-wide crops the sky, never the flowers', () => {
    expectRect(artRect({ width: 2560, height: 1080 }, 'cover'), {
      x: 0,
      y: -360.4,
      width: 2560,
      height: 1440.4,
    })
  })

  it('narrow: sky covers, flowers shrink to 0.72 and pin to their edge', () => {
    expectRect(artRect(PHONE, 'cover'), {
      x: -555.0,
      y: 0,
      width: 1500.1,
      height: 844,
    })
    expectRect(artRect(PHONE, 'left'), {
      x: 0,
      y: 236.3,
      width: 1080.1,
      height: 607.7,
    })
    expectRect(artRect(PHONE, 'right'), {
      x: -690.1,
      y: 236.3,
      width: 1080.1,
      height: 607.7,
    })
    expectRect(artRect(PHONE, 'centre'), {
      x: -345.0,
      y: 236.3,
      width: 1080.1,
      height: 607.7,
    })
  })
})

describe('visibleSpan', () => {
  it('returns the on-screen fraction of the art, within the clip', () => {
    const [a0, a1] = visibleSpan(PHONE, artRect(PHONE, 'left'), [0, 1])
    expect(a0).toBeCloseTo(0, 3)
    expect(a1).toBeCloseTo(0.3611, 3)
    const [b0, b1] = visibleSpan(PHONE, artRect(PHONE, 'right'), [0.5, 1])
    expect(b0).toBeCloseTo(0.6389, 3)
    expect(b1).toBeCloseTo(1, 3)
  })
})

describe('chooseSource', () => {
  it('phone uses the crop when it covers what is visible', () => {
    const left = layer('left', [0, 1], crop(0, 1229))
    expect(chooseSource(PHONE, 3, left)).toEqual({
      variant: CROP_VARIANT,
      x0: 0,
      x1: 1229 / 2730,
    })
    expect(chooseSource({ width: 360, height: 640 }, 2, left).variant).toBe(
      CROP_VARIANT,
    )
    expect(
      chooseSource(PHONE, 2, layer('cover', [0, 1], crop(751, 1979))).variant,
    ).toBe(CROP_VARIANT)
    expect(
      chooseSource(PHONE, 2, layer('right', [0.5, 1], crop(1501, 2730)))
        .variant,
    ).toBe(CROP_VARIANT)
  })

  it('portrait tablet falls back to a full layer sized for the drawn width', () => {
    const left = layer('left', [0, 1], crop(0, 1229))
    expect(chooseSource({ width: 768, height: 1024 }, 2, left)).toEqual({
      variant: FULL[2],
      x0: 0,
      x1: 1,
    })
  })

  it('wide screens never use crops', () => {
    const left = layer('left', [0, 1], crop(0, 1229))
    expect(chooseSource({ width: 1440, height: 900 }, 1, left).variant).toBe(
      FULL[1],
    )
  })

  it('wide picks the smallest variant at least drawn width × min(dpr, 2)', () => {
    const plain = layer('cover', [0, 1])
    expect(chooseSource({ width: 1440, height: 900 }, 1, plain).variant).toBe(
      FULL[1],
    )
    expect(chooseSource({ width: 1440, height: 900 }, 2, plain).variant).toBe(
      FULL[2],
    )
    expect(chooseSource({ width: 1280, height: 720 }, 1, plain).variant).toBe(
      FULL[0],
    )
    expect(chooseSource({ width: 1440, height: 900 }, 3, plain).variant).toBe(
      FULL[2],
    )
  })
})

describe('sourceRect', () => {
  it('narrows the art rectangle to the source span', () => {
    expectRect(
      sourceRect(
        { x: 0, y: 236.3, width: 1080.1, height: 607.7 },
        { variant: V(864), x0: 0, x1: 0.45 },
      ),
      { x: 0, y: 236.3, width: 486.0, height: 607.7 },
    )
    expectRect(
      sourceRect(
        { x: -555, y: 0, width: 1500, height: 844 },
        { variant: V(864), x0: 0.25, x1: 0.75 },
      ),
      { x: -180, y: 0, width: 750, height: 844 },
    )
  })
})
