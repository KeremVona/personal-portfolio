import { describe, expect, it } from 'vitest'
import { aboutFacts } from './about'
import { formatGraduation } from './format'
import { PROFILE } from './profile'

describe('formatGraduation', () => {
  it('turns YYYY-MM into "Month YYYY"', () => {
    expect(formatGraduation('2027-06')).toBe('June 2027')
    expect(formatGraduation('2025-01')).toBe('January 2025')
  })
})

describe('aboutFacts', () => {
  it('derives the About pills from the profile', () => {
    expect(aboutFacts(PROFILE)).toEqual([
      'Istanbul, Türkiye',
      'Graduating June 2027',
      'English · Turkish',
    ])
  })
})
