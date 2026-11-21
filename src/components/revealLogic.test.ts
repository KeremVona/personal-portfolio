import { describe, expect, it } from 'vitest'
import { anyIntersecting } from './revealLogic'

describe('anyIntersecting', () => {
  it('reveals when any entry in a batch is in view, not just the first', () => {
    expect(
      anyIntersecting([{ isIntersecting: false }, { isIntersecting: true }]),
    ).toBe(true)
  })

  it('stays hidden when nothing in the batch is in view', () => {
    expect(anyIntersecting([{ isIntersecting: false }])).toBe(false)
    expect(anyIntersecting([])).toBe(false)
  })
})
