import { describe, expect, it } from 'vitest'
import { canCopy, copyrightLine } from './footerLogic'

describe('copyrightLine', () => {
  it('uses the year of the given date', () => {
    expect(copyrightLine('Kerem Can Bas', new Date('2026-11-21'))).toBe(
      '© 2026 Kerem Can Bas',
    )
    expect(copyrightLine('Kerem Can Bas', new Date('2027-03-01'))).toBe(
      '© 2027 Kerem Can Bas',
    )
  })
})

describe('canCopy', () => {
  it('needs a clipboard with writeText', () => {
    expect(canCopy({ clipboard: { writeText: () => {} } })).toBe(true)
    expect(canCopy({ clipboard: {} })).toBe(false)
    expect(canCopy({})).toBe(false)
    expect(canCopy(undefined)).toBe(false)
  })
})
