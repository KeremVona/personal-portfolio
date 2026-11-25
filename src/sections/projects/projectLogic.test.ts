import { describe, expect, it } from 'vitest'
import { PROJECTS } from '../../content/projects'
import {
  gridClass,
  projectLinks,
  sourceLabel,
  stepSlide,
  visibleTags,
} from './projectLogic'

const REPO = 'https://github.com/example/repo'
const LIVE = 'https://example.com'

describe('gridClass', () => {
  it('never has more columns than projects', () => {
    expect(gridClass(0)).toBe('')
    expect(gridClass(1)).toBe('md:max-w-xl')
    expect(gridClass(2)).toBe('md:grid-cols-2')
  })

  it('caps at three columns on large screens', () => {
    expect(gridClass(3)).toBe('md:grid-cols-2 lg:grid-cols-3')
    expect(gridClass(7)).toBe('md:grid-cols-2 lg:grid-cols-3')
  })
})

describe('visibleTags', () => {
  it('shows four tags and counts the rest', () => {
    expect(visibleTags(['a', 'b', 'c', 'd', 'e', 'f'])).toEqual({
      shown: ['a', 'b', 'c', 'd'],
      extra: 2,
    })
  })

  it('shows everything when it fits', () => {
    expect(visibleTags(['a', 'b', 'c', 'd'])).toEqual({
      shown: ['a', 'b', 'c', 'd'],
      extra: 0,
    })
    expect(visibleTags([])).toEqual({ shown: [], extra: 0 })
  })

  it('honours a custom limit', () => {
    expect(visibleTags(['a', 'b', 'c'], 2)).toEqual({
      shown: ['a', 'b'],
      extra: 1,
    })
  })
})

describe('projectLinks', () => {
  it('makes GitHub the primary link', () => {
    expect(projectLinks({ repoUrl: REPO })).toEqual([
      { label: 'View on GitHub', href: REPO, primary: true },
    ])
    expect(projectLinks({ repoUrl: REPO, liveUrl: LIVE })).toEqual([
      { label: 'View on GitHub', href: REPO, primary: true },
      { label: 'Live site', href: LIVE, primary: false },
    ])
  })

  it('promotes the live site when there is no repo', () => {
    expect(projectLinks({ liveUrl: LIVE })).toEqual([
      { label: 'Live site', href: LIVE, primary: true },
    ])
    expect(projectLinks({})).toEqual([])
  })
})

describe('sourceLabel', () => {
  it('derives open or closed source from the repo link', () => {
    expect(sourceLabel({ repoUrl: REPO })).toBe('Open source')
    expect(sourceLabel({})).toBe('Closed source')
  })
})

describe('PROJECTS content', () => {
  it('has unique slugs and leads with HOI4', () => {
    const slugs = PROJECTS.map((project) => project.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(slugs[0]).toBe('encircled')
  })

  it('gives every project its card and panel text', () => {
    for (const project of PROJECTS) {
      expect(project.summary).not.toBe('')
      expect(project.description).not.toBe('')
      expect(project.highlights.length).toBeGreaterThan(0)
    }
  })
})

describe('stepSlide', () => {
  it('moves forward and back by one', () => {
    expect(stepSlide(0, 1, 3)).toBe(1)
    expect(stepSlide(2, -1, 3)).toBe(1)
  })

  it('wraps around at both ends', () => {
    expect(stepSlide(2, 1, 3)).toBe(0)
    expect(stepSlide(0, -1, 3)).toBe(2)
  })

  it('stays at 0 with no slides', () => {
    expect(stepSlide(0, 1, 0)).toBe(0)
  })
})
