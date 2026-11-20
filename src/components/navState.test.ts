import { describe, expect, it } from 'vitest'
import { nextNavState, type NavInput } from './navState'

const base: NavInput = {
  y: 0,
  lastY: 0,
  hideAfter: 780,
  menuOpen: false,
  focusWithin: false,
  hidden: false,
}
const next = (over: Partial<NavInput>) => nextNavState({ ...base, ...over })

describe('nextNavState', () => {
  it('is transparent at the very top', () => {
    expect(next({ y: 0 })).toEqual({ solid: false, hidden: false })
  })

  it('turns solid once scrolled past 24px', () => {
    expect(next({ y: 30, lastY: 0 }).solid).toBe(true)
  })

  it('hides when scrolling down past the hero', () => {
    expect(next({ y: 900, lastY: 880 }).hidden).toBe(true)
  })

  it('stays visible while scrolling down inside the hero', () => {
    expect(next({ y: 500, lastY: 480 }).hidden).toBe(false)
  })

  it('shows again on scroll up', () => {
    expect(next({ y: 880, lastY: 900, hidden: true }).hidden).toBe(false)
  })

  it('ignores 2px jitter', () => {
    expect(next({ y: 902, lastY: 900, hidden: true }).hidden).toBe(true)
    expect(next({ y: 898, lastY: 900, hidden: false }).hidden).toBe(false)
  })

  it('never hides while the menu is open', () => {
    expect(next({ y: 900, lastY: 880, menuOpen: true }).hidden).toBe(false)
  })

  it('shows when keyboard focus enters the nav', () => {
    expect(
      next({ y: 900, lastY: 900, hidden: true, focusWithin: true }).hidden,
    ).toBe(false)
  })
})
