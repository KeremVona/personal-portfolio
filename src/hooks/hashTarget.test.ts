import { describe, expect, it } from 'vitest'
import { hashTarget } from './hashTarget'

describe('hashTarget', () => {
  it('returns the element id from a location hash', () => {
    expect(hashTarget('#about')).toBe('about')
    expect(hashTarget('#caf%C3%A9')).toBe('café')
    expect(hashTarget('')).toBe('')
  })

  it('never throws on a malformed hash; falls back to the raw text', () => {
    expect(hashTarget('#100%')).toBe('100%')
    expect(hashTarget('#%E0')).toBe('%E0')
  })
})
