import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import bodyMeta0 from '../../../assets/about/koi-body-0.webp?w=260;390&format=webp&quality=80&as=metadata'
import bodyMeta1 from '../../../assets/about/koi-body-1.webp?w=260;390&format=webp&quality=80&as=metadata'
import bodyMeta2 from '../../../assets/about/koi-body-2.webp?w=260;390&format=webp&quality=80&as=metadata'
import shadowMeta0 from '../../../assets/about/koi-shadow-0.webp?w=260;390&format=webp&quality=70&as=metadata'
import shadowMeta1 from '../../../assets/about/koi-shadow-1.webp?w=260;390&format=webp&quality=70&as=metadata'
import shadowMeta2 from '../../../assets/about/koi-shadow-2.webp?w=260;390&format=webp&quality=70&as=metadata'
import padsMeta from '../../../assets/about/pads.webp?w=480;720;960&format=webp&quality=76&as=metadata'
import pondMeta from '../../../assets/about/pond.webp?w=480;720;960&format=webp&quality=76&as=metadata'
import { ABOUT } from '../../../content/about'
import {
  RIPPLE_LIFE,
  createPondRenderer,
  type PondRenderer,
  type Ripple,
} from './renderer'
import {
  FISH_START,
  POND_BOX,
  POND_VIEW,
  createFish,
  frameDelta,
  hitFish,
  poke,
  stepFish,
  toPond,
  type Fish,
} from './swim'

export interface LivePondProps {
  onReady: () => void
  onFail: () => void
  /** False while the pond fades out: it stops moving. */
  running?: boolean
}

/** The print's tilt, which clicks are mapped back through. */
const TILT_DEG = -1.6
/** The largest koi is about a third of the painting's width. */
const FISH_SHARE = 385 / 1200

const variants = (meta: ImagetoolsMetadata | ImagetoolsMetadata[]) =>
  (Array.isArray(meta) ? meta : [meta]).toSorted((a, b) => a.width - b.width)
const pick = (
  meta: ImagetoolsMetadata | ImagetoolsMetadata[],
  need: number,
) => {
  const list = variants(meta)
  return (list.find((v) => v.width >= need) ?? list[list.length - 1]).src
}
const load = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

declare global {
  interface Window {
    /** Development only: the pond's state, for scripted checks. */
    __pond?: {
      fishes: Fish[]
      ripples: Ripple[]
      paused: () => boolean
      frames: () => number
    }
  }
}

/**
 * The living koi pond: a WebGL canvas over the About painting, with a pause button.
 * See docs/superpowers/specs/2026-11-23-about-pond-design.md.
 */
export default function LivePond({
  onReady,
  onFail,
  running = true,
}: LivePondProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(paused)
  const runningRef = useRef(running)
  const wake = useRef<() => void>(() => {})
  const pond = useRef<{ fishes: Fish[]; ripples: Ripple[] } | null>(null)

  useEffect(() => {
    pausedRef.current = paused
    runningRef.current = running
    wake.current()
  }, [paused, running])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let renderer: PondRenderer | null = null
    let cancelled = false
    let frame = 0
    let last: number | null = null
    let time = 0
    let onScreen = true
    let frames = 0
    const fishes = FISH_START.map((start) => createFish(start))
    const ripples: Ripple[] = []
    pond.current = { fishes, ripples }
    if (import.meta.env.DEV) {
      window.__pond = {
        fishes,
        ripples,
        paused: () => pausedRef.current,
        frames: () => frames,
      }
    }

    const tick = (now: number) => {
      frame = 0
      if (!renderer) return
      const dt = frameDelta(now, last)
      last = now
      time += dt
      for (const fish of fishes) stepFish(fish, dt, time, POND_BOX, fishes)
      for (const ripple of ripples) ripple.age += dt
      while (ripples.length && ripples[0].age > RIPPLE_LIFE) ripples.shift()
      renderer.draw(fishes, ripples)
      frames++
      schedule()
    }
    // Runs only while on screen, with the tab visible, not paused and not fading out.
    const schedule = () => {
      const go =
        onScreen && !document.hidden && !pausedRef.current && runningRef.current
      if (go && !frame) frame = requestAnimationFrame(tick)
      if (!go) {
        if (frame) cancelAnimationFrame(frame)
        frame = 0
        last = null
      }
    }
    wake.current = schedule

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      renderer?.resize(canvas.offsetWidth, canvas.offsetHeight, dpr)
      renderer?.draw(fishes, ripples)
    }
    const resizer = new ResizeObserver(size)
    const watcher = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      schedule()
    })
    document.addEventListener('visibilitychange', schedule)

    const need = canvas.offsetWidth * Math.min(window.devicePixelRatio || 1, 2)
    const fishNeed = need * FISH_SHARE
    Promise.all([
      load(pick(pondMeta, need)),
      load(pick(padsMeta, need)),
      ...[bodyMeta0, bodyMeta1, bodyMeta2].map((m) => load(pick(m, fishNeed))),
      ...[shadowMeta0, shadowMeta1, shadowMeta2].map((m) =>
        load(pick(m, fishNeed)),
      ),
    ])
      .then(([pondImage, padsImage, ...sprites]) => {
        if (cancelled) return
        renderer = createPondRenderer(
          canvas,
          {
            pond: pondImage,
            pads: padsImage,
            bodies: sprites.slice(0, 3),
            shadows: sprites.slice(3),
          },
          onFail,
        )
        if (!renderer) {
          onFail()
          return
        }
        size()
        resizer.observe(canvas)
        watcher.observe(canvas)
        onReady()
        schedule()
      })
      .catch(() => {
        if (!cancelled) onFail()
      })

    return () => {
      cancelled = true
      if (frame) cancelAnimationFrame(frame)
      resizer.disconnect()
      watcher.disconnect()
      document.removeEventListener('visibilitychange', schedule)
      renderer?.destroy()
      wake.current = () => {}
      pond.current = null
      if (import.meta.env.DEV) delete window.__pond
    }
  }, [onReady, onFail])

  const toPondPoint = (event: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current!
    const box = canvas.getBoundingClientRect()
    return toPond(
      { x: event.clientX, y: event.clientY },
      { x: box.left + box.width / 2, y: box.top + box.height / 2 },
      { w: canvas.offsetWidth, h: canvas.offsetHeight },
      TILT_DEG,
    )
  }
  const startle = (at: { x: number; y: number }, everyone = false) => {
    const current = pond.current
    if (!current || pausedRef.current || !runningRef.current) return
    poke(current.fishes, at, everyone)
    current.ripples.push({ at, age: 0 })
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={ABOUT.pondLabel}
        tabIndex={0}
        className="absolute inset-0 block size-full touch-manipulation select-none"
        onClick={(event) => startle(toPondPoint(event))}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          startle({ x: POND_VIEW.w / 2, y: 800 }, true)
        }}
        onPointerMove={(event) => {
          if (event.pointerType !== 'mouse' || !pond.current) return
          const over =
            !pausedRef.current &&
            !!hitFish(pond.current.fishes, toPondPoint(event))
          event.currentTarget.style.cursor = over ? 'pointer' : ''
        }}
      />
      <button
        type="button"
        aria-pressed={paused}
        aria-label="Pause the pond"
        title={paused ? 'Play the pond' : 'Pause the pond'}
        onClick={() => setPaused((p) => !p)}
        className="absolute right-[2.5%] bottom-[2%] flex size-9 cursor-pointer items-center justify-center rounded-full bg-cream/90 text-ink shadow-[0_1px_4px_rgb(30_50_30/0.25)] hover:bg-cream"
      >
        {paused ? (
          <Play aria-hidden="true" size={16} />
        ) : (
          <Pause aria-hidden="true" size={16} />
        )}
      </button>
    </>
  )
}
