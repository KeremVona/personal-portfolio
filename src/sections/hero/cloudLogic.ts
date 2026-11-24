import { ART, CLOUD_BOX } from './heroArt'

export interface Size {
  width: number
  height: number
}
export interface Point {
  x: number
  y: number
}
export interface Rect {
  left: number
  top: number
  width: number
  height: number
}
export interface Offset {
  x: number
  y: number
  tilt: number
}
export interface Spring extends Offset {
  vx: number
  vy: number
  vtilt: number
}

/** How much `object-fit: cover` scales the picture to fill the hero. */
export function coverScale(hero: Size, art: Size = ART): number {
  return Math.max(hero.width / art.width, hero.height / art.height)
}

const PREFERRED_CENTRE = 0.64
const RIGHTMOST_CENTRE = 0.68
const COPY_GAP = 24
const EDGE_GAP = 16

/**
 * Where the cloud layer goes in the wide layout: at its natural size and height,
 * centred 64% across. If that would reach under the copy it moves right (up to 68%),
 * then shrinks, keeping its proportions and vertical centre. It also stays inside
 * the right edge and below the nav.
 */
export function placeCloud(
  hero: Size,
  opts: { copyRight: number; navBottom: number; centreX?: number },
): Rect {
  const scale = coverScale(hero)
  let width = CLOUD_BOX.width * scale
  const aspect = CLOUD_BOX.width / CLOUD_BOX.height
  const top = (hero.height - ART.height * scale) / 2 + CLOUD_BOX.top * scale
  const centreY = top + (CLOUD_BOX.height * scale) / 2
  const minLeft = opts.copyRight + COPY_GAP
  const maxRight = hero.width - EDGE_GAP
  const minTop = opts.navBottom + EDGE_GAP

  let centreX = hero.width * (opts.centreX ?? PREFERRED_CENTRE)
  if (centreX - width / 2 < minLeft)
    centreX = Math.min(hero.width * RIGHTMOST_CENTRE, minLeft + width / 2)
  width = Math.min(
    width,
    2 * (centreX - minLeft),
    2 * (maxRight - centreX),
    2 * (centreY - minTop) * aspect,
    2 * (hero.height - EDGE_GAP - centreY) * aspect,
  )
  width = Math.max(0, width)
  const height = width / aspect
  return {
    left: centreX - width / 2,
    top: centreY - height / 2,
    width,
    height,
  }
}

const REST: Offset = { x: 0, y: 0, tilt: 0 }

/**
 * Where the shy cloud wants to be: pushed away from a pointer inside `radius` of its
 * centre, hardest when closest (up to `max` px), leaning away horizontally.
 */
export function shyTarget(
  pointer: Point | null,
  centre: Point,
  radius: number,
  max: number,
  maxTilt = 2,
): Offset {
  if (!pointer) return REST
  const dx = centre.x - pointer.x
  const dy = centre.y - pointer.y
  const d = Math.hypot(dx, dy)
  if (d >= radius || d < 1) return REST
  const push = max * (1 - d / radius)
  const x = (dx / d) * push
  return { x, y: (dy / d) * push, tilt: max ? maxTilt * (x / max) : 0 }
}

/** Keeps an offset inside the room the cloud has on each side. */
export function clampToRoom(
  offset: Offset,
  room: { left: number; right: number; up: number; down: number },
): Offset {
  return {
    x: Math.min(room.right, Math.max(-room.left, offset.x)),
    y: Math.min(room.down, Math.max(-room.up, offset.y)),
    tilt: offset.tilt,
  }
}

const STIFFNESS = 70
const DAMPING = 2 * Math.sqrt(STIFFNESS) // critically damped: no overshoot
const MAX_DT = 1 / 30

/** One step of a soft, critically damped spring toward the target. */
export function springStep(state: Spring, target: Offset, dt: number): Spring {
  const t = Math.min(MAX_DT, Math.max(0, dt))
  const axis = (pos: number, vel: number, goal: number) => {
    const accel = STIFFNESS * (goal - pos) - DAMPING * vel
    const v = vel + accel * t
    return [pos + v * t, v]
  }
  const [x, vx] = axis(state.x, state.vx, target.x)
  const [y, vy] = axis(state.y, state.vy, target.y)
  const [tilt, vtilt] = axis(state.tilt, state.vtilt, target.tilt)
  return { x, y, tilt, vx, vy, vtilt }
}

/** True once the spring has (all but) arrived and stopped. */
export function isAtRest(state: Spring, target: Offset): boolean {
  return (
    Math.abs(state.x - target.x) < 0.1 &&
    Math.abs(state.y - target.y) < 0.1 &&
    Math.abs(state.tilt - target.tilt) < 0.1 &&
    Math.hypot(state.vx, state.vy, state.vtilt) < 0.5
  )
}
