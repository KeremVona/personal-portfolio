import { describe, expect, it } from 'vitest'
import { aboutFacts } from './about'
import { EXPERIENCE } from './experience'
import { formatDateRange, formatGraduation, isYearMonth } from './format'
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

describe('formatDateRange', () => {
  it('shares the year when both months are in it', () => {
    expect(formatDateRange('2026-07', '2026-08')).toBe('Jul – Aug 2026')
  })

  it('shows both years across a new year', () => {
    expect(formatDateRange('2025-12', '2026-02')).toBe('Dec 2025 – Feb 2026')
  })

  it('says Present for an ongoing role', () => {
    expect(formatDateRange('2026-10', null)).toBe('Oct 2026 – Present')
  })

  it('collapses a single month', () => {
    expect(formatDateRange('2025-04', '2025-04')).toBe('Apr 2025')
  })
})

describe('isYearMonth', () => {
  it('accepts YYYY-MM and rejects anything else', () => {
    expect(isYearMonth('2026-07')).toBe(true)
    expect(isYearMonth('2026/07')).toBe(false)
    expect(isYearMonth('2026-13')).toBe(false)
    expect(isYearMonth('2026-7')).toBe(false)
  })

  it('holds for every date in the experience content, in order', () => {
    for (const item of EXPERIENCE) {
      expect(isYearMonth(item.start)).toBe(true)
      if (item.end !== null) {
        expect(isYearMonth(item.end)).toBe(true)
        expect(item.start <= item.end).toBe(true)
      }
    }
  })
})
