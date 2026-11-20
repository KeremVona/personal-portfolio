/** Nav look and visibility rules. See docs/superpowers/specs/2026-11-21-hero-design.md §6. */

export const NAV_HEIGHT = 64
export const SOLID_AFTER = 24
const JITTER = 2

export interface NavInput {
  y: number
  lastY: number
  /** Scroll position past which the nav may hide (hero height − nav height). */
  hideAfter: number
  menuOpen: boolean
  focusWithin: boolean
  hidden: boolean
}

export interface NavState {
  solid: boolean
  hidden: boolean
}

export function nextNavState(input: NavInput): NavState {
  const { y, lastY, hideAfter, menuOpen, focusWithin } = input
  const solid = y > SOLID_AFTER

  let hidden = input.hidden
  if (menuOpen || focusWithin) hidden = false
  else if (y - lastY > JITTER && y > hideAfter) hidden = true
  else if (lastY - y > JITTER) hidden = false

  return { solid, hidden }
}
