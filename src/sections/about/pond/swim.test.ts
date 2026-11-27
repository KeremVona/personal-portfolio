import { describe, expect, it } from 'vitest'
import {
  FISH_START,
  POND_BOX,
  WAKE_GAP,
  bendAngle,
  createFish,
  frameDelta,
  hitFish,
  poke,
  stepFish,
  stepWake,
  toPond,
  type Fish,
} from './swim'

/** A small seeded generator (Park–Miller), so every run is the same. */
function seeded(seed = 42) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const DT = 1 / 60

function pond(random: () => number) {
  return FISH_START.map((start) => createFish(start, random))
}

function run(
  fishes: Fish[],
  seconds: number,
  random: () => number,
  each?: (time: number) => void,
) {
  let time = 0
  for (let n = 0; n < seconds / DT; n++) {
    time += DT
    for (const fish of fishes)
      stepFish(fish, DT, time, POND_BOX, fishes, random)
    each?.(time)
  }
}

const SWING = 0.35

describe('bend stays within limits', () => {
  it('keeps every body under the cruising and startle limits', () => {
    const random = seeded()
    const fishes = pond(random)
    let lastStartle = -Infinity
    let worstCruise = 0
    let worstStartle = 0
    run(fishes, 60, random, (time) => {
      if (time - lastStartle >= 3) {
        poke(fishes, { x: 600, y: 800 }, true, random)
        lastStartle = time
      }
      for (const fish of fishes) {
        if (fish.mode === 'away') continue
        const bend = bendAngle(fish.line)
        // Cruising: a calm, swimming fish. Racing off after a click is the startle's.
        const cruising =
          fish.mode === 'swim' &&
          fish.thrust <= 1.2 &&
          time - lastStartle > 0.5 + DT
        if (cruising) worstCruise = Math.max(worstCruise, bend)
        else worstStartle = Math.max(worstStartle, bend)
      }
    })
    expect(worstCruise).toBeLessThanOrEqual(0.85 + SWING)
    expect(worstStartle).toBeLessThanOrEqual(1.9 + SWING)
  })
})

describe('fish stay in the pond', () => {
  it('keeps scared fish in the pond even when clicked over and over', () => {
    const random = seeded(11)
    const fishes = pond(random)
    let lastStartle = -Infinity
    run(fishes, 60, random, (time) => {
      if (time - lastStartle >= 1) {
        poke(fishes, { x: 600, y: 800 }, true, random)
        lastStartle = time
      }
      for (const { head, mode } of fishes) {
        if (mode !== 'swim') continue
        expect(head.x).toBeGreaterThanOrEqual(POND_BOX.x - 10)
        expect(head.x).toBeLessThanOrEqual(POND_BOX.x + POND_BOX.w + 10)
        expect(head.y).toBeGreaterThanOrEqual(POND_BOX.y - 10)
        expect(head.y).toBeLessThanOrEqual(POND_BOX.y + POND_BOX.h + 10)
      }
    })
  })

  it('keeps every head inside the painted area when nothing startles them', () => {
    const random = seeded(7)
    const fishes = pond(random)
    run(fishes, 120, random, () => {
      for (const { head } of fishes) {
        expect(head.x).toBeGreaterThanOrEqual(POND_BOX.x - 10)
        expect(head.x).toBeLessThanOrEqual(POND_BOX.x + POND_BOX.w + 10)
        expect(head.y).toBeGreaterThanOrEqual(POND_BOX.y - 10)
        expect(head.y).toBeLessThanOrEqual(POND_BOX.y + POND_BOX.h + 10)
      }
    })
  })
})

describe('a clicked fish leaves and comes back', () => {
  it('goes leave → away within 4s → return → swim within 12s', () => {
    const random = seeded(3)
    const fishes = pond(random)
    const fish = fishes[0]
    poke(fishes, fish.line[10], false, random)
    expect(fish.mode).toBe('leave')
    const seen: string[] = []
    let awayAt = Infinity
    let backAt = Infinity
    run(fishes, 12, random, (time) => {
      if (seen.at(-1) !== fish.mode) seen.push(fish.mode)
      if (fish.mode === 'away') awayAt = Math.min(awayAt, time)
      if (fish.mode === 'swim' && seen.includes('return'))
        backAt = Math.min(backAt, time)
    })
    expect(seen).toEqual(['leave', 'away', 'return', 'swim'])
    expect(awayAt).toBeLessThanOrEqual(4)
    expect(backAt).toBeLessThanOrEqual(12)
  })
})

describe('only fish within reach dart', () => {
  it('leaves a fish more than 330 away swimming as it was', () => {
    const random = seeded(5)
    const fishes = pond(random)
    const at = { x: 140, y: 140 }
    const far = fishes.filter(
      (f) =>
        Math.min(...f.line.map((p) => Math.hypot(p.x - at.x, p.y - at.y))) >
        330,
    )
    expect(far.length).toBeGreaterThan(0)
    const before = far.map((f) => f.thrust)
    poke(fishes, at, false, random)
    far.forEach((f, i) => {
      expect(f.mode).toBe('swim')
      expect(f.thrust).toBe(before[i])
    })
  })
})

describe('a fish that is away ignores clicks', () => {
  it('is skipped by hitFish and left alone by poke', () => {
    const random = seeded(9)
    const fishes = pond(random)
    const fish = fishes[1]
    poke(fishes, fish.line[10], false, random)
    run(fishes, 4, random)
    expect(fish.mode).toBe('away')
    const where = { ...fish.head }
    const state = JSON.stringify(fish)
    expect(hitFish(fishes, where)).not.toBe(fish)
    poke(fishes, where, false, random)
    expect(JSON.stringify(fish)).toBe(state)
  })
})

describe('frameDelta caps long gaps', () => {
  it('limits a frame to 0.05s and starts at one 60Hz frame', () => {
    expect(frameDelta(10_000, 1_000)).toBe(0.05)
    expect(frameDelta(1016, 1000)).toBeCloseTo(0.016, 6)
    expect(frameDelta(5, null)).toBe(1 / 60)
  })
})

describe('toPond undoes the tilt', () => {
  const centre = { x: 300, y: 400 }
  const size = { w: 420, h: 560 }
  const tilt = (1.6 * Math.PI) / 180

  it('maps the box centre to the pond centre', () => {
    const p = toPond(centre, centre, size, -1.6)
    expect(p.x).toBeCloseTo(600, 6)
    expect(p.y).toBeCloseTo(799.5, 6)
  })

  it('maps a point right of centre through the rotation and scale', () => {
    const p = toPond({ x: centre.x + 100, y: centre.y }, centre, size, -1.6)
    expect(
      Math.abs(p.x - (600 + 100 * Math.cos(tilt) * (1200 / 420))),
    ).toBeLessThan(0.5)
    expect(
      Math.abs(p.y - (799.5 + 100 * Math.sin(tilt) * (1599 / 560))),
    ).toBeLessThan(0.5)
  })
})

describe('clicks only land on fish that are simply swimming', () => {
  it('lets a click pass through a fleeing fish to the one underneath', () => {
    const random = seeded(13)
    const fishes = pond(random)
    const fleeing = fishes[0]
    poke(fishes, fleeing.line[10], false, random)
    expect(fleeing.mode).toBe('leave')
    expect(hitFish(fishes, fleeing.line[10])).not.toBe(fleeing)
  })
})

describe('stepWake', () => {
  const fish = (speed: number, mode: Fish['mode'] = 'swim') => ({
    ...createFish(FISH_START[0], seeded()),
    speed,
    mode,
  })

  it('leaves no wake behind a cruising fish', () => {
    expect(stepWake(fish(85), 0, DT).size).toBe(0)
  })

  it('waits for the gap between rings', () => {
    const next = stepWake(fish(200), 0.1, 0.04)
    expect(next.size).toBe(0)
    expect(next.due).toBeCloseTo(0.06)
  })

  it('leaves a ring sized by speed once the gap has passed', () => {
    const next = stepWake(fish(155), 0.01, DT)
    expect(next.size).toBeCloseTo(0.18 + 60 / 600)
    expect(next.due).toBe(WAKE_GAP)
  })

  it('caps the ring size', () => {
    expect(stepWake(fish(900), 0, DT).size).toBe(0.4)
  })

  it('leaves no wake while out of sight', () => {
    expect(stepWake(fish(300, 'away'), 0, DT).size).toBe(0)
  })
})
