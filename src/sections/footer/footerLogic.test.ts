import { describe, expect, it } from 'vitest'
import { canCopy } from './footerLogic'

describe('canCopy', () => {
  it('needs a clipboard with writeText', () => {
    expect(canCopy({ clipboard: { writeText: () => {} } })).toBe(true)
    expect(canCopy({ clipboard: {} })).toBe(false)
    expect(canCopy({})).toBe(false)
    expect(canCopy(undefined)).toBe(false)
  })
})
