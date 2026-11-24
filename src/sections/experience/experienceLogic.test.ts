import { describe, expect, it } from 'vitest'
import { EXPERIENCE } from '../../content/experience'
import type { ExperienceItem } from '../../content/types'
import { orderRoles, placeLabel, splitHighlights } from './experienceLogic'

const role = (
  company: string,
  end: string | null = '2025-02',
  start = '2025-01',
): ExperienceItem => ({
  company,
  role: 'Intern',
  start,
  end,
  location: 'Istanbul, Türkiye',
  workMode: 'Onsite',
  stack: [],
  highlights: ['a'],
})

describe('placeLabel', () => {
  it('keeps the city and adds the work mode', () => {
    expect(
      placeLabel({ location: 'Istanbul, Türkiye', workMode: 'Onsite' }),
    ).toBe('Istanbul · Onsite')
    expect(placeLabel({ location: 'Berlin', workMode: 'Hybrid' })).toBe(
      'Berlin · Hybrid',
    )
  })

  it('says Remote once for remote-only work', () => {
    expect(placeLabel({ location: 'Remote', workMode: 'Remote' })).toBe(
      'Remote',
    )
  })
})

describe('splitHighlights', () => {
  it('shows two and hides the rest', () => {
    expect(splitHighlights(['a', 'b', 'c', 'd'])).toEqual({
      shown: ['a', 'b'],
      hidden: ['c', 'd'],
    })
  })

  it('hides nothing when it fits', () => {
    expect(splitHighlights(['a', 'b'])).toEqual({
      shown: ['a', 'b'],
      hidden: [],
    })
  })

  it('honours a custom count', () => {
    expect(splitHighlights(['a', 'b', 'c'], 1)).toEqual({
      shown: ['a'],
      hidden: ['b', 'c'],
    })
  })
})

describe('orderRoles', () => {
  it('puts the current role first, then the rest by end date', () => {
    const roles = [role('A', '2025-02'), role('B', null), role('C', '2026-08')]
    expect(orderRoles(roles).map((r) => r.company)).toEqual(['B', 'C', 'A'])
  })

  it('breaks an end-date tie by the later start, then keeps content order', () => {
    const roles = [
      role('A', '2025-08', '2025-01'),
      role('B', '2025-08', '2025-06'),
      role('C', '2025-08', '2025-06'),
    ]
    expect(orderRoles(roles).map((r) => r.company)).toEqual(['B', 'C', 'A'])
  })

  it('orders the real content newest first', () => {
    expect(orderRoles(EXPERIENCE).map((r) => r.company)).toEqual([
      'Ihlas Holding',
      'Dijital Varlıklar',
      'OBSS',
      'InfinitumIT',
      'Freelance',
    ])
  })
})

describe('EXPERIENCE content', () => {
  it('keeps the Dijital Varlıklar numbers', () => {
    const dijital = EXPERIENCE.find(
      (item) => item.company === 'Dijital Varlıklar',
    )
    expect(dijital?.stats?.map((s) => s.value)).toEqual(['~2.5M', '13+'])
  })
})
