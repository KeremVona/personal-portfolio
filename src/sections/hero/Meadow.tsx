import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { LAYERS } from './art'
import { createMeadowRenderer, type MeadowRenderer } from './meadowRenderer'
import {
  artRect,
  chooseSource,
  sourceRect,
  textureClip,
  type LayerId,
  type Size,
  type Source,
} from './placement'

interface MeadowDebug {
  events: {
    id: LayerId
    srcSetAt: number
    loadedAt?: number
    faded: boolean
  }[]
  canvasMountedAt?: number
  time?: () => number
}

declare global {
  interface Window {
    __meadowDebug?: MeadowDebug
  }
}

const FADE = 'opacity 550ms ease-out'
const CANVAS_FADE = 'opacity 400ms ease-out'

/** Run `task` when the main thread is idle (or after a short delay where unsupported). */
function whenIdle(task: () => void): () => void {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(task, { timeout: 2000 })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(task, 200)
  return () => clearTimeout(id)
}
// A layer that arrives this soon after being requested (cache) appears without fading.
const QUICK_LOAD_MS = 120

/**
 * The hero's painted meadow as static, stacked <img> layers.
 * The sky loads first; flowers load after it and fade in ("bloom"). Every image is
 * preloaded off-DOM and swapped in only once decoded.
 * See docs/superpowers/specs/2026-11-21-hero-design.md §4–5.
 */
export function Meadow({ size }: { size: Size }) {
  const reducedMotion = useReducedMotion()
  const images = useRef(new Map<LayerId, HTMLImageElement>())
  // layer|src pairs currently being preloaded
  const pending = useRef(new Set<string>())
  // The last fully loaded source per layer: what each <img> shows.
  const [shown, setShown] = useState<Partial<Record<LayerId, Source>>>({})
  // Flower layers whose first appearance blooms in.
  const [blooming, setBlooming] = useState<Partial<Record<LayerId, boolean>>>(
    {},
  )
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [renderer, setRenderer] = useState<MeadowRenderer | null>(null)
  const [canvasShown, setCanvasShown] = useState(false)
  // WebGL missing, failed to build, or lost: stay static for this visit
  const [webglFailed, setWebglFailed] = useState(false)

  const dpr = window.devicePixelRatio || 1
  const targets = useMemo(
    () =>
      LAYERS.map((layer) => ({
        layer,
        target: chooseSource(size, dpr, layer),
      })),
    [size, dpr],
  )
  // The sky must have appeared once before any flower starts loading.
  const skyReady = shown.sky !== undefined

  // Preload each layer's target off-DOM. The <img> swaps only once it has decoded,
  // so a resize or rotation never shows a missing or stretched layer.
  useEffect(() => {
    for (const { layer, target } of targets) {
      const src = target.variant.src
      if (shown[layer.id]?.variant.src === src) continue
      if (layer.id !== 'sky' && !skyReady) continue
      const key = `${layer.id}|${src}`
      if (pending.current.has(key)) continue
      pending.current.add(key)
      const first = shown[layer.id] === undefined
      const startedAt = performance.now()
      const event: MeadowDebug['events'][number] = {
        id: layer.id,
        srcSetAt: startedAt,
        faded: false,
      }
      if (import.meta.env.DEV) {
        window.__meadowDebug ??= { events: [] }
        window.__meadowDebug.events.push(event)
      }
      const preload = new Image()
      preload.decoding = 'async'
      if (layer.id === 'sky') preload.fetchPriority = 'high'
      preload.src = src
      preload.decode().then(
        () => {
          pending.current.delete(key)
          // Only a flower's first appearance blooms, and not when it came from cache.
          const bloom =
            first &&
            layer.id !== 'sky' &&
            !reducedMotion &&
            performance.now() - startedAt >= QUICK_LOAD_MS
          if (import.meta.env.DEV) {
            event.loadedAt = performance.now()
            event.faded = bloom
          }
          if (bloom) setBlooming((prev) => ({ ...prev, [layer.id]: true }))
          setShown((prev) => ({ ...prev, [layer.id]: target }))
        },
        () => pending.current.delete(key),
      )
    }
  }, [targets, shown, skyReady, reducedMotion])

  // Each layer is drawn from the source it actually shows, placed for the current size.
  const placed = useMemo(
    () =>
      targets.map(({ layer, target }) => {
        const source = shown[layer.id]
        return {
          layer,
          target,
          source,
          rect: source ? sourceRect(artRect(size, layer.anchor), source) : null,
          clip: source ? textureClip(layer.clip, source) : ([0, 1] as const),
        }
      }),
    [targets, shown, size],
  )

  const allLoaded = placed.every(
    ({ source, target }) => source?.variant.src === target.variant.src,
  )
  const animate = allLoaded && !reducedMotion && !webglFailed
  // Any source change rebuilds the renderer, so old textures never meet new rectangles.
  const sourceKey = targets.map(({ target }) => target.variant.src).join('|')

  // The WebGL renderer exists only while every layer has loaded and motion is allowed.
  // It starts when the browser is idle, so it never competes with the first paint.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!animate || !canvas) return
    let created: MeadowRenderer | null = null
    const begin = () => {
      created = createMeadowRenderer(
        canvas,
        () => setCanvasShown(true),
        () => setWebglFailed(true),
      )
      if (!created) {
        setWebglFailed(true)
        return
      }
      setRenderer(created)
      if (import.meta.env.DEV && window.__meadowDebug) {
        window.__meadowDebug.canvasMountedAt = performance.now()
        window.__meadowDebug.time = created.time
      }
    }
    const cancel = whenIdle(begin)
    return () => {
      cancel()
      created?.destroy()
      setRenderer(null)
      setCanvasShown(false)
    }
  }, [animate, sourceKey])

  // Feed the loaded images and their rectangles to the renderer.
  useEffect(() => {
    if (!renderer) return
    const layers = placed.flatMap(({ layer, source, rect, clip }) => {
      const image = images.current.get(layer.id)
      if (!image || !source || !rect) return []
      const span = source.x1 - source.x0
      const texClip: [number, number] = [clip[0], clip[1]]
      return [{ image, bend: layer.bend, rect, span, texClip }]
    })
    renderer.setLayers(layers, size)
  }, [renderer, placed, size])

  // Animate only while the hero is on screen and the tab is visible.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!renderer || !canvas) return
    let onScreen = true
    const update = () =>
      onScreen && !document.hidden ? renderer.start() : renderer.stop()
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      update()
    })
    observer.observe(canvas)
    document.addEventListener('visibilitychange', update)
    update()
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
      renderer.stop()
    }
  }, [renderer])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {placed.map(({ layer, source, rect, clip }) => {
        const style: CSSProperties = {
          ...(rect && {
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
          }),
          opacity: source ? 1 : 0,
          transition: blooming[layer.id] ? FADE : undefined,
          clipPath:
            clip[0] > 0 || clip[1] < 1
              ? `inset(0 ${(1 - clip[1]) * 100}% 0 ${clip[0] * 100}%)`
              : undefined,
        }
        return (
          <img
            key={layer.id}
            ref={(img) => {
              if (img) images.current.set(layer.id, img)
              else images.current.delete(layer.id)
            }}
            data-layer={layer.id}
            src={source?.variant.src}
            alt=""
            draggable={false}
            decoding="async"
            className="absolute max-w-none select-none"
            style={style}
          />
        )
      })}
      {animate && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ opacity: canvasShown ? 1 : 0, transition: CANVAS_FADE }}
        />
      )}
    </div>
  )
}
