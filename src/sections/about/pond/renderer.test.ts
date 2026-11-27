import { describe, expect, it } from 'vitest'
import {
  MAX_RIPPLES,
  VERTEX,
  addRipple,
  fragmentShaders,
  rippleDone,
  rippleSlots,
  type Ripple,
} from './renderer'

describe('rippleDone', () => {
  const at = { x: 0, y: 0 }

  it('keeps a click ripple for its whole life', () => {
    expect(rippleDone({ at, age: 1.7 })).toBe(false)
    expect(rippleDone({ at, age: 1.9 })).toBe(true)
  })

  it('ends a wake sooner, by its pace', () => {
    expect(rippleDone({ at, age: 0.7, size: 0.3, pace: 2.2 })).toBe(false)
    expect(rippleDone({ at, age: 0.9, size: 0.3, pace: 2.2 })).toBe(true)
  })
})

describe('addRipple', () => {
  const at = { x: 0, y: 0 }
  const wake = (age: number): Ripple => ({ at, age, size: 0.3, pace: 2.2 })
  const full = () => [
    { at, age: 1 },
    ...Array.from({ length: MAX_RIPPLES - 1 }, (_, i) => wake(i / 100)),
  ]

  it('skips a wake when the pond is full, keeping the click', () => {
    const ripples = full()
    addRipple(ripples, wake(0))
    expect(ripples).toHaveLength(MAX_RIPPLES)
    expect(ripples[0].size).toBeUndefined()
  })

  it('makes room for a click by dropping the oldest wake', () => {
    const ripples = full()
    addRipple(ripples, { at, age: 0 })
    expect(ripples).toHaveLength(MAX_RIPPLES)
    expect(ripples.filter((r) => !r.size)).toHaveLength(2)
    expect(ripples[1].age).toBe(0.01)
  })

  it('adds freely while there is room', () => {
    const ripples: Ripple[] = []
    addRipple(ripples, wake(0))
    expect(ripples).toHaveLength(1)
  })
})

describe('addRipple with fewer slots', () => {
  it('keeps to the slots the device allows', () => {
    const at = { x: 0, y: 0 }
    const ripples: Ripple[] = [
      { at, age: 0 },
      { at, age: 0 },
    ]
    addRipple(ripples, { at, age: 0, size: 0.3, pace: 2.2 }, 2)
    expect(ripples).toHaveLength(2)
  })
})

describe('rippleSlots', () => {
  it('fits the ripples in the fragment uniforms WebGL1 guarantees', () => {
    expect(rippleSlots(16)).toBe(8)
  })

  it('uses up to MAX_RIPPLES where the device has room', () => {
    expect(rippleSlots(221)).toBe(MAX_RIPPLES)
  })

  it('never goes below four', () => {
    expect(rippleSlots(9)).toBe(4)
  })
})

describe('shaders', () => {
  // A uniform in both stages must have the same precision, and fragment precision can
  // fall back to mediump on some phones, so fragment shaders don't share the vertex ones.
  it('keep vertex uniforms out of the fragment shaders', () => {
    const names = [...VERTEX.matchAll(/uniform\s+\w+\s+(\w+)/g)].map(
      (m) => m[1],
    )
    for (const source of Object.values(fragmentShaders(8)))
      for (const name of names)
        expect(source).not.toMatch(
          new RegExp(String.raw`uniform\s+\w+\s+${name}\b`),
        )
  })

  it('size the ripple arrays to the slots', () => {
    const { water, rings } = fragmentShaders(8)
    expect(water).toContain('u_ripples[8]')
    expect(rings).toContain('u_ripples[8]')
  })
})
