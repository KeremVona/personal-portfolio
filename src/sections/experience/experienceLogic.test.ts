import { describe, expect, it } from 'vitest'
import { EXPERIENCE } from '../../content/experience'
import type { ExperienceItem } from '../../content/types'
import { orderRoles, placeLabel, splitHighlights } from './experienceLogic'

const role = (company: string, featured?: boolean): ExperienceItem => ({
  company,
  role: 'Intern',
  start: '2025-01',
  end: '2025-02',
  location: 'Istanbul, Türkiye',
  workMode: 'Onsite',
  stack: [],
  highlights: ['a'],
  featured,
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
  it('moves the featured role first and keeps the rest in order', () => {
    const roles = [role('A'), role('B', true), role('C')]
    expect(orderRoles(roles).map((r) => r.company)).toEqual(['B', 'A', 'C'])
  })

  it('keeps the order when nothing is featured', () => {
    const roles = [role('A'), role('B'), role('C')]
    expect(orderRoles(roles).map((r) => r.company)).toEqual(['A', 'B', 'C'])
  })
})

describe('EXPERIENCE content', () => {
  it('features exactly Dijital Varlıklar, with its numbers', () => {
    const featured = EXPERIENCE.filter((item) => item.featured)
    expect(featured).toHaveLength(1)
    expect(featured[0].company).toBe('Dijital Varlıklar')
    expect(featured[0].stats?.map((s) => s.value)).toEqual(['~2.5M', '13+'])
  })
})
