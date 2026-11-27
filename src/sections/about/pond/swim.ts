/**
 * How the About pond's koi swim. Pure and DOM-free; everything is in pond units, which
 * are the painting's pixels (1200 × 1599).
 * Ported from the approved prototype; see docs/superpowers/specs/2026-11-23-about-pond-design.md §2.
 *
 * A koi keeps the front of its body stiff along its heading. Behind that the body
 * follows the path its head has swum, never bending past a limit, and a swimming
 * wave grows from tiny at the head to large at the tail. It glides, then gives a few
 * tail kicks, and turns only as tightly as its speed allows.
 */

export interface Point {
  x: number
  y: number
}
export interface Box {
  x: number
  y: number
  w: number
  h: number
}
export type Mode = 'swim' | 'leave' | 'away' | 'return'

export interface Fish {
  /** Which koi sprite (0–2) to draw. */
  sprite: number
  length: number
  head: Point
  heading: number
  speed: number
  thrust: number
  /** The tail-beat phase, in radians. */
  phase: number
  mode: Mode
  /** POINTS centreline points, head → tail, including the swimming wave. */
  line: Point[]
  cruise: number
  seed: number
  kicking: boolean
  /** Seconds left in the current kick or glide, or out of sight when away. */
  timer: number
  /** Seconds left darting away from a nearby click. */
  dart: number
  aim: number
  /** Seconds left in the startle turn; negative counts the time since it. */
  cstart: number
  /** Where the head has been, newest first. */
  trail: Point[]
}

export const POND_VIEW: Box = { x: 0, y: 0, w: 1200, h: 1599 }
/** The painted area inside the paper border. */
export const POND_BOX: Box = { x: 72, y: 72, w: 1056, h: 1454 }
/** [x, y, heading, length, sprite] for each koi. */
export const FISH_START: readonly (readonly [
  number,
  number,
  number,
  number,
  number,
])[] = [
  [555, 1010, 0.6, 360, 0],
  [520, 1215, 0.35, 385, 1],
  [750, 1140, -0.9, 350, 2],
  [670, 670, 2.5, 250, 0],
  [800, 480, 0.8, 220, 1],
]

const SEGMENTS = 48
export const POINTS = SEGMENTS + 1
const DRAG = 0.85
const REACH = 330
const HIT = 0.16
const RETURN_SPEED = 110
const BEND_CRUISE = 0.85
const BEND_STARTLE = 1.9
/** The slowest a fish turns away from the edge, in rad/s. */
const EDGE_TURN = 1.2
/** How hard a fish heading for the edge slows down, per second. */
const EDGE_BRAKE = 1.5
const TAU = Math.PI * 2

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const between = (random: () => number, a: number, b: number) =>
  a + random() * (b - a)

export function createFish(
  start: (typeof FISH_START)[number],
  random: () => number = Math.random,
): Fish {
  const [x, y, heading, length, sprite] = start
  const fish: Fish = {
    sprite,
    length,
    head: { x, y },
    heading,
    cruise: between(random, 60, 85),
    speed: 0,
    thrust: 0.3,
    kicking: random() < 0.5,
    timer: between(random, 0.2, 1.5),
    phase: between(random, 0, TAU),
    seed: between(random, 0, 100),
    mode: 'swim',
    dart: 0,
    aim: heading,
    cstart: -Infinity,
    trail: [],
    line: [],
  }
  fish.speed = fish.cruise * 0.6
  resetTrail(fish)
  return fish
}

function resetTrail(fish: Fish) {
  fish.trail = [{ ...fish.head }]
  fish.line = centreline(fish)
}

const nearest = (fish: Fish, at: Point) =>
  Math.min(...fish.line.map((p) => Math.hypot(p.x - at.x, p.y - at.y)))

/** The topmost fish under a point, among fish simply swimming (not fleeing, away or returning). */
export function hitFish(fishes: readonly Fish[], at: Point): Fish | undefined {
  return fishes.findLast(
    (fish) =>
      fish.mode === 'swim' &&
      fish.line
        .slice(1, -6)
        .some((p) => Math.hypot(p.x - at.x, p.y - at.y) < fish.length * HIT),
  )
}

function startle(fish: Fish, at: Point, leave: boolean) {
  const h = fish.head
  let away = Math.atan2(h.y - at.y, h.x - at.x)
  // A fish that should stay doesn't dart straight into the nearby edge: it turns
  // along the pond instead, away from the edge.
  const reach = fish.length * 0.8
  const ax = h.x + Math.cos(away) * reach
  const ay = h.y + Math.sin(away) * reach
  const b = POND_BOX
  if (!leave && (ax < b.x || ax > b.x + b.w || ay < b.y || ay > b.y + b.h)) {
    away = Math.atan2(b.y + b.h / 2 - h.y, b.x + b.w / 2 - h.x)
  }
  fish.aim = fish.heading + clamp(wrap(away - fish.heading), -2.2, 2.2)
  fish.dart = leave ? 0 : 0.7
  fish.cstart = 0.2
  fish.thrust = leave ? 9 : 5
  fish.kicking = true
  fish.timer = leave ? 2 : 0.9
  if (leave) fish.mode = 'leave'
}

/**
 * A click at a point: the fish under it leaves; fish within reach (or all of them,
 * for the keyboard) dart away but stay. Fish not simply swimming ignore it.
 */
export function poke(
  fishes: readonly Fish[],
  at: Point,
  everyone = false,
  random: () => number = Math.random,
) {
  void random
  const hit = hitFish(fishes, at)
  for (const fish of fishes) {
    if (fish.mode !== 'swim') continue
    if (fish === hit) startle(fish, at, true)
    else if (everyone || nearest(fish, at) < REACH) startle(fish, at, false)
  }
}

/** True when the fish is heading for the edge of the pond. */
function facingEdge(fish: Fish, box: Box) {
  // Look further ahead the faster the fish goes: a darting fish needs room to turn.
  const m = fish.length * 0.35
  const ahead = Math.max(m, fish.speed * 0.7)
  const ax = fish.head.x + Math.cos(fish.heading) * ahead
  const ay = fish.head.y + Math.sin(fish.heading) * ahead
  return (
    ax < box.x + m / 2 ||
    ax > box.x + box.w - m / 2 ||
    ay < box.y + m / 2 ||
    ay > box.y + box.h - m / 2
  )
}

/** Where the fish wants to point this frame. */
function steer(
  fish: Fish,
  dt: number,
  time: number,
  box: Box,
  all: readonly Fish[],
  random: () => number,
) {
  const h = fish.head
  const cx = box.x + box.w / 2
  const cy = box.y + box.h / 2
  if (fish.mode === 'leave') {
    const pad = 10
    const gone = fish.line.every(
      (p) =>
        p.x < box.x - pad ||
        p.x > box.x + box.w + pad ||
        p.y < box.y - pad ||
        p.y > box.y + box.h + pad,
    )
    if (gone) {
      fish.mode = 'away'
      fish.timer = between(random, 2, 4)
    }
    return fish.aim
  }
  if (fish.mode === 'return') {
    const m = fish.length * 0.4
    if (
      h.x > box.x + m &&
      h.x < box.x + box.w - m &&
      h.y > box.y + m &&
      h.y < box.y + box.h - m
    )
      fish.mode = 'swim'
    return Math.atan2(cy - h.y, cx - h.x)
  }
  if (fish.dart > 0) {
    fish.dart -= dt
    // A fish darting from a nearby click stays in the pond.
    return facingEdge(fish, box) ? Math.atan2(cy - h.y, cx - h.x) : fish.aim
  }
  let aim =
    fish.heading +
    Math.sin(time * 0.45 + fish.seed) * 0.5 +
    Math.sin(time * 0.17 + fish.seed * 2) * 0.35
  for (const other of all) {
    if (other === fish || other.mode === 'away') continue
    const p = other.line[other.line.length >> 2]
    const dx = h.x - p.x
    const dy = h.y - p.y
    if (Math.hypot(dx, dy) < fish.length * 0.55)
      aim += wrap(Math.atan2(dy, dx) - aim) * 0.35
  }
  if (facingEdge(fish, box)) aim = Math.atan2(cy - h.y, cx - h.x)
  return aim
}

export function stepFish(
  fish: Fish,
  dt: number,
  time: number,
  box: Box,
  all: readonly Fish[],
  random: () => number = Math.random,
) {
  if (fish.mode === 'away') {
    fish.timer -= dt
    if (fish.timer > 0) return
    // Come back head first from just outside the edge it left by.
    fish.heading = Math.atan2(
      box.y + box.h / 2 - fish.head.y,
      box.x + box.w / 2 - fish.head.x,
    )
    fish.mode = 'return'
    fish.speed = RETURN_SPEED
    fish.thrust = 1.6
    fish.cstart = -Infinity
    resetTrail(fish)
    return
  }
  const aim = steer(fish, dt, time, box, all, random)

  // Glide, then a few tail kicks, then glide again. Near the edge, kick to turn away:
  // a slow glide can't turn fast enough on its own.
  const edge = fish.mode === 'swim' && facingEdge(fish, box)
  if (edge && !fish.kicking) {
    fish.kicking = true
    fish.timer = between(random, 0.6, 1.3)
  }
  fish.timer -= dt
  if (fish.timer <= 0 && fish.mode === 'swim') {
    fish.kicking = !fish.kicking
    fish.timer = fish.kicking
      ? between(random, 0.6, 1.3)
      : between(random, 1, 2.6)
  }
  const want =
    fish.mode === 'leave'
      ? 9
      : fish.mode === 'return'
        ? 1.6
        : fish.kicking
          ? 1
          : 0
  fish.thrust +=
    (want - fish.thrust) * Math.min(1, dt * (want > fish.thrust ? 6 : 1.6))
  fish.speed +=
    (fish.thrust * DRAG * fish.cruise - DRAG * fish.speed) *
    dt *
    (fish.thrust > 2 ? 4 : 1)
  if (edge) {
    // Brake with the fins rather than overshoot the edge after a fast dart.
    fish.thrust = Math.min(fish.thrust, 1)
    fish.speed -= fish.speed * EDGE_BRAKE * dt
  }
  fish.speed = Math.max(fish.speed, 12)

  // Fish turn only as tightly as their speed allows, except in the startle turn and
  // away from the edge, where they turn harder the faster they go.
  fish.cstart -= dt
  const cruiseRate =
    Math.min(2.4, fish.speed / (fish.length * 0.55)) * (fish.kicking ? 1 : 0.6)
  const edgeRate = edge
    ? clamp(fish.speed / (fish.length * 0.45), EDGE_TURN, 3.5)
    : 0
  const rate = fish.cstart > 0 ? 11 : Math.max(edgeRate, cruiseRate)
  fish.heading += clamp(wrap(aim - fish.heading), -rate * dt, rate * dt)

  const beat =
    0.35 +
    1.5 * Math.min(fish.thrust, 1) +
    0.25 * Math.min(Math.max(fish.thrust - 1, 0), 6)
  fish.phase += dt * TAU * beat
  const h = fish.head
  h.x += Math.cos(fish.heading) * fish.speed * dt
  h.y += Math.sin(fish.heading) * fish.speed * dt

  const newest = fish.trail[0]
  if (Math.hypot(newest.x - h.x, newest.y - h.y) > 1.5)
    fish.trail.unshift({ ...h })
  else Object.assign(newest, h)
  let run = 0
  for (let i = 1; i < fish.trail.length; i++) {
    run += Math.hypot(
      fish.trail[i].x - fish.trail[i - 1].x,
      fish.trail[i].y - fish.trail[i - 1].y,
    )
    if (run > fish.length * 1.3) {
      fish.trail.length = i + 1
      break
    }
  }
  fish.line = centreline(fish)
}

/** The body, head → tail: stiff front, path-following rear within the bend limit, plus the wave. */
function centreline(fish: Fish): Point[] {
  const L = fish.length
  const seg = L / SEGMENTS
  const h = fish.head
  const dir = { x: Math.cos(fish.heading), y: Math.sin(fish.heading) }
  const trail = fish.trail
  const path: Point[] = []
  let j = 0
  let acc = 0
  for (let i = 0; i <= SEGMENTS; i++) {
    const s = i * seg
    while (j < trail.length - 1) {
      const d = Math.hypot(
        trail[j].x - trail[j + 1].x,
        trail[j].y - trail[j + 1].y,
      )
      if (acc + d >= s) break
      acc += d
      j++
    }
    let p: Point
    if (j < trail.length - 1) {
      const a = trail[j]
      const b = trail[j + 1]
      const t = (s - acc) / (Math.hypot(a.x - b.x, a.y - b.y) || 1)
      p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
    } else {
      // Past the end of the trail, carry straight on behind it.
      const last = trail[trail.length - 1]
      const prev = trail[trail.length - 2] ?? {
        x: last.x + dir.x,
        y: last.y + dir.y,
      }
      const l = Math.hypot(prev.x - last.x, prev.y - last.y) || 1
      p = {
        x: last.x - ((prev.x - last.x) / l) * (s - acc),
        y: last.y - ((prev.y - last.y) / l) * (s - acc),
      }
    }
    const w = smooth(0.16, 0.5, i / SEGMENTS)
    path.push({
      x: (h.x - dir.x * s) * (1 - w) + p.x * w,
      y: (h.y - dir.y * s) * (1 - w) + p.y * w,
    })
  }

  const limit = (fish.cstart > -0.3 ? BEND_STARTLE : BEND_CRUISE) / SEGMENTS
  let previous = fish.heading
  for (let i = 1; i <= SEGMENTS; i++) {
    const a = path[i - 1]
    const b = path[i]
    const angle =
      previous +
      clamp(wrap(Math.atan2(a.y - b.y, a.x - b.x) - previous), -limit, limit)
    b.x = a.x - Math.cos(angle) * seg
    b.y = a.y - Math.sin(angle) * seg
    previous = angle
  }

  const t = fish.thrust
  const amp =
    L *
    (0.01 + 0.045 * Math.min(t, 1) + 0.012 * Math.min(Math.max(t - 1, 0), 4))
  return path.map((q, i) => {
    const u = i / SEGMENTS
    const a = path[Math.max(0, i - 1)]
    const b = path[Math.min(SEGMENTS, i + 1)]
    const l = Math.hypot(a.x - b.x, a.y - b.y) || 1
    const off =
      amp * (0.1 + 0.9 * u * u) * Math.sin(fish.phase - u * TAU * 0.85)
    return {
      x: q.x - ((a.y - b.y) / l) * off,
      y: q.y + ((a.x - b.x) / l) * off,
    }
  })
}

/** The angle between the head's direction and the tail's direction, in radians. */
export function bendAngle(line: readonly Point[]): number {
  const n = line.length - 1
  const head = Math.atan2(line[0].y - line[6].y, line[0].x - line[6].x)
  const tail = Math.atan2(line[n - 6].y - line[n].y, line[n - 6].x - line[n].x)
  return Math.abs(wrap(head - tail))
}

/** Seconds since the last frame, capped so a long pause never makes fish jump. */
export function frameDelta(now: number, last: number | null): number {
  if (last === null) return 1 / 60
  return Math.min(0.05, Math.max(0, (now - last) / 1000))
}

/**
 * A point on screen to pond units, undoing the print's tilt around its centre.
 * `size` is the canvas's untransformed CSS size.
 */
export function toPond(
  client: Point,
  centre: Point,
  size: { w: number; h: number },
  tiltDeg: number,
  view: Box = POND_VIEW,
): Point {
  const turn = (-tiltDeg * Math.PI) / 180
  const dx = client.x - centre.x
  const dy = client.y - centre.y
  const lx = dx * Math.cos(turn) - dy * Math.sin(turn)
  const ly = dx * Math.sin(turn) + dy * Math.cos(turn)
  return {
    x: view.x + view.w / 2 + (lx * view.w) / size.w,
    y: view.y + view.h / 2 + (ly * view.h) / size.h,
  }
}

/** A fish faster than this (pond units/s) leaves a wake; cruising is 60–85. */
export const WAKE_SPEED = 95
/** Seconds between a fast fish's wake rings. */
export const WAKE_GAP = 0.14

/**
 * A fast fish's wake: counts `due` down to its next ring. `size` is that ring's size
 * as a share of a click ripple, or 0 for no ring this frame.
 * See docs/superpowers/specs/2026-11-27-pond-water-design.md §3.
 */
export function stepWake(
  fish: Fish,
  due: number,
  dt: number,
): { due: number; size: number } {
  const left = due - dt
  if (fish.mode === 'away' || fish.speed <= WAKE_SPEED)
    return { due: left, size: 0 }
  if (left > 0) return { due: left, size: 0 }
  return {
    due: WAKE_GAP,
    size: Math.min(0.4, 0.18 + (fish.speed - WAKE_SPEED) / 600),
  }
}
