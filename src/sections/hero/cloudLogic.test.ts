import { describe, expect, it } from 'vitest'
import {
  clampToRoom,
  isAtRest,
  placeCloud,
  shyTarget,
  springStep,
  type Spring,
} from './cloudLogic'
import { CLOUD_BOX } from './heroArt'

const ASPECT = CLOUD_BOX.width / CLOUD_BOX.height

describe('placeCloud', () => {
  it('centres the cloud 64-68% across on a wide screen, clear of the copy', () => {
    const r = placeCloud(
      { width: 1440, height: 900 },
      { copyRight: 690, navBottom: 64 },
    )
    const centre = (r.left + r.width / 2) / 1440
    expect(centre).toBeGreaterThanOrEqual(0.64 - 0.002)
    expect(centre).toBeLessThanOrEqual(0.68 + 0.002)
    expect(r.left).toBeGreaterThanOrEqual(714)
  })

  it('keeps 64% when there is room', () => {
    const r = placeCloud(
      { width: 2560, height: 1080 },
      { copyRight: 900, navBottom: 64 },
    )
    expect(Math.abs(r.left + r.width / 2 - 0.64 * 2560)).toBeLessThanOrEqual(2)
  })

  it('moves right and shrinks rather than touching the copy on a 4:3 screen', () => {
    const r = placeCloud(
      { width: 1024, height: 768 },
      { copyRight: 512, navBottom: 64 },
    )
    const natural = CLOUD_BOX.width * Math.max(1024 / 2730, 768 / 1536)
    expect(r.left).toBeGreaterThanOrEqual(536)
    expect(r.left + r.width).toBeLessThanOrEqual(1008)
    expect(r.width).toBeLessThan(natural)
  })

  it('stays below the nav and inside the right edge on a short wide screen', () => {
    const r = placeCloud(
      { width: 1920, height: 700 },
      { copyRight: 900, navBottom: 64 },
    )
    expect(r.top).toBeGreaterThanOrEqual(80)
    expect(r.left + r.width).toBeLessThanOrEqual(1904)
  })

  it('always keeps the cloud art in proportion', () => {
    for (const [w, h, c] of [
      [1440, 900, 690],
      [1024, 768, 512],
      [1920, 700, 900],
      [2560, 1080, 1100],
    ]) {
      const r = placeCloud(
        { width: w, height: h },
        { copyRight: c, navBottom: 64 },
      )
      expect(r.width / r.height).toBeCloseTo(ASPECT, 2)
    }
  })
})

describe('shyTarget', () => {
  const centre = { x: 500, y: 300 }

  it('is at rest with no pointer, or one outside the radius', () => {
    expect(shyTarget(null, centre, 200, 28)).toEqual({ x: 0, y: 0, tilt: 0 })
    expect(shyTarget({ x: 700, y: 300 }, centre, 200, 28)).toEqual({
      x: 0,
      y: 0,
      tilt: 0,
    })
  })

  it('moves away from a close pointer, hardest when closest', () => {
    const t = shyTarget({ x: 510, y: 300 }, centre, 200, 28)
    expect(t.x).toBeCloseTo(-0.95 * 28, 5)
    expect(t.y).toBeCloseTo(0, 5)
    expect(t.tilt).toBeLessThan(0)
    const below = shyTarget({ x: 500, y: 400 }, centre, 200, 28)
    expect(below.y).toBeLessThan(0)
  })
})

describe('clampToRoom', () => {
  it('keeps the offset inside the room on each side', () => {
    expect(
      clampToRoom(
        { x: -30, y: 10, tilt: -1 },
        { left: 12, right: 50, up: 50, down: 4 },
      ),
    ).toEqual({ x: -12, y: 4, tilt: -1 })
  })
})

describe('springStep', () => {
  const rest: Spring = { x: 0, y: 0, tilt: 0, vx: 0, vy: 0, vtilt: 0 }
  const target = { x: 28, y: 0, tilt: 0 }

  it('eases toward the target softly, without overshooting, and settles', () => {
    let s = rest
    let peak = 0
    for (let i = 1; i <= 120; i++) {
      s = springStep(s, target, 1 / 60)
      peak = Math.max(peak, s.x)
      if (i === 30) expect(s.x).toBeGreaterThan(20)
    }
    expect(peak).toBeLessThanOrEqual(28.3)
    expect(isAtRest(s, target)).toBe(true)
  })

  it('treats a long frame like a short one', () => {
    expect(springStep(rest, target, 1)).toEqual(
      springStep(rest, target, 1 / 30),
    )
  })
})
