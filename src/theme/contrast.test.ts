import { describe, expect, it } from 'vitest'
import { contrastRatio } from './contrast'

describe('contrastRatio', () => {
  it('gives 21 for black on white and 1 for a colour on itself', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 2)
    expect(contrastRatio('#ffffff', '#ffffff')).toBe(1)
  })

  it("doesn't care which colour is the text", () => {
    expect(contrastRatio('#3a64ac', '#fbf7ee')).toBe(
      contrastRatio('#fbf7ee', '#3a64ac'),
    )
  })
})
