import { type RefObject, useEffect } from 'react'
import {
  clampToRoom,
  isAtRest,
  type Point,
  type Spring,
  shyTarget,
  springStep,
} from './cloudLogic'
import { NAV_HEIGHT } from '../../components/navState'

/** Only with a hovering mouse, motion allowed, and the wide layout. */
// 121/100, not 6/5: both ends are inclusive, and at exactly 6:5 the hero is narrow.
const SHY_QUERY =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (min-aspect-ratio: 121/100)'
const RADIUS = 1.3 // × the cloud's half-width
const MAX_AT_1440 = 28 // px of push on a 1440px-wide hero
const PUSHED_COPY_GAP = 8 // px the pushed cloud keeps from the copy

/**
 * The shy cloud: it drifts away from a nearby cursor and floats back when the cursor
 * leaves (see shyTarget and springStep). One rAF loop, running only while the cloud
 * is moving or the cursor is near, and only while the hero is on screen.
 * See docs/superpowers/specs/2026-11-24-sky-hero-design.md §6.
 */
export function useShyCloud(
  hero: RefObject<HTMLElement | null>,
  copy: RefObject<HTMLElement | null>,
  cloud: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const heroEl = hero.current
    const copyEl = copy.current
    const cloudEl = cloud.current
    if (!heroEl || !copyEl || !cloudEl || !('IntersectionObserver' in window))
      return
    const allowed = matchMedia(SHY_QUERY)
    let pointer: Point | null = null
    let spring: Spring = { x: 0, y: 0, tilt: 0, vx: 0, vy: 0, vtilt: 0 }
    let frame = 0
    let last = 0
    let listening = false

    const reset = () => {
      cancelAnimationFrame(frame)
      frame = 0
      spring = { x: 0, y: 0, tilt: 0, vx: 0, vy: 0, vtilt: 0 }
      cloudEl.style.removeProperty('translate')
      cloudEl.style.removeProperty('rotate')
    }

    const tick = (now: number) => {
      const dt = last ? (now - last) / 1000 : 1 / 60
      last = now
      const h = heroEl.getBoundingClientRect()
      const copyRight = copyEl.getBoundingClientRect().right - h.left
      // The placed box, not the moved one: offset* ignore translate and rotate.
      const left = cloudEl.offsetLeft
      const top = cloudEl.offsetTop
      const width = cloudEl.offsetWidth
      const height = cloudEl.offsetHeight
      const centre = {
        x: h.left + left + width / 2,
        y: h.top + top + height / 2,
      }
      const target = clampToRoom(
        shyTarget(
          pointer,
          centre,
          RADIUS * (width / 2),
          (MAX_AT_1440 * h.width) / 1440,
        ),
        {
          left: Math.max(0, left - copyRight - PUSHED_COPY_GAP),
          right: Math.max(0, h.width - left - width),
          up: Math.max(0, top - NAV_HEIGHT),
          down: Math.max(0, h.height - top - height),
        },
      )
      spring = springStep(spring, target, dt)
      cloudEl.style.translate = `${spring.x.toFixed(2)}px ${spring.y.toFixed(2)}px`
      cloudEl.style.rotate = `${spring.tilt.toFixed(3)}deg`
      // Settled: stop the loop until the next pointer move (or for good at rest).
      if (isAtRest(spring, target)) {
        frame = 0
        if (target.x === 0 && target.y === 0) reset()
        return
      }
      frame = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (frame) return
      last = 0
      frame = requestAnimationFrame(tick)
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      pointer = { x: event.clientX, y: event.clientY }
      wake()
    }
    // Leaving the window (no related target) or the window losing focus.
    const onOut = (event: PointerEvent) => {
      if (event.relatedTarget) return
      pointer = null
      wake()
    }
    const onBlur = () => {
      pointer = null
      wake()
    }
    const listen = (on: boolean) => {
      if (on === listening) return
      listening = on
      const method = on ? addEventListener : removeEventListener
      method('pointermove', onMove as EventListener, { passive: true })
      method('pointerout', onOut as EventListener)
      method('blur', onBlur)
      if (!on) {
        pointer = null
        reset()
      }
    }

    let visible = false
    const update = () => listen(visible && allowed.matches)
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      update()
    })
    watcher.observe(heroEl)
    allowed.addEventListener('change', update)
    return () => {
      watcher.disconnect()
      allowed.removeEventListener('change', update)
      listen(false)
      reset()
    }
  }, [hero, copy, cloud])
}
