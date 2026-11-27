import { describe, expect, it } from 'vitest'
import { MAX_RIPPLES, addRipple, rippleDone, type Ripple } from './renderer'

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
