import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
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
 * The sky loads first; flowers load after it and fade in ("bloom").
 * See docs/superpowers/specs/2026-11-21-hero-design.md §4–5.
 */
export function Meadow({ size }: { size: Size }) {
  const reducedMotion = useReducedMotion()
  const images = useRef(new Map<LayerId, HTMLImageElement>())
  // when each layer|src was requested
  const requestedAt = useRef(new Map<string, number>())
  // src that has finished loading, per layer
  const [loaded, setLoaded] = useState<Partial<Record<LayerId, string>>>({})
  // layers that arrived (almost) immediately, e.g. from cache: no fade
  const [instant, setInstant] = useState<Partial<Record<LayerId, boolean>>>({})
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [renderer, setRenderer] = useState<MeadowRenderer | null>(null)
  const [canvasShown, setCanvasShown] = useState(false)
  // WebGL missing, failed to build, or lost: stay static for this visit
  const [webglFailed, setWebglFailed] = useState(false)

  const dpr = window.devicePixelRatio || 1
  const placed = useMemo(
    () =>
      LAYERS.map((layer) => {
        const source = chooseSource(size, dpr, layer)
        const rect = sourceRect(artRect(size, layer.anchor), source)
        return { layer, source, rect, clip: textureClip(layer.clip, source) }
      }),
    [size, dpr],
  )

  const skyLoaded = loaded.sky === placed[0].source.variant.src
  // Flowers get their src only once the sky has loaded.
  const requested = useMemo(
    () =>
      placed.map(({ layer, source }) =>
        layer.id === 'sky' || skyLoaded ? source.variant.src : undefined,
      ),
    [placed, skyLoaded],
  )

  const markLoaded = useCallback(
    (id: LayerId, src: string) => {
      const key = `${id}|${src}`
      const at = requestedAt.current.get(key)
      if (at === undefined) return
      requestedAt.current.delete(key)
      const now = performance.now()
      const quick = now - at < QUICK_LOAD_MS
      if (quick) setInstant((prev) => ({ ...prev, [id]: true }))
      setLoaded((prev) => (prev[id] === src ? prev : { ...prev, [id]: src }))
      if (import.meta.env.DEV) {
        const event = window.__meadowDebug?.events.findLast((e) => e.id === id)
        if (event) {
          event.loadedAt = now
          event.faded = id !== 'sky' && !quick && !reducedMotion
        }
      }
    },
    [reducedMotion],
  )

  // Record when each src is requested; an image that is already complete (cached) loads now.
  useLayoutEffect(() => {
    placed.forEach(({ layer }, i) => {
      const src = requested[i]
      const img = images.current.get(layer.id)
      const key = `${layer.id}|${src}`
      if (
        !src ||
        !img ||
        loaded[layer.id] === src ||
        requestedAt.current.has(key)
      )
        return
      requestedAt.current.set(key, performance.now())
      if (import.meta.env.DEV) {
        window.__meadowDebug ??= { events: [] }
        window.__meadowDebug.events.push({
          id: layer.id,
          srcSetAt: performance.now(),
          faded: false,
        })
      }
      if (img.complete && img.naturalWidth > 0) markLoaded(layer.id, src)
    })
  }, [placed, requested, loaded, markLoaded])

  const allLoaded = placed.every(
    ({ layer, source }) => loaded[layer.id] === source.variant.src,
  )
  const animate = allLoaded && !reducedMotion && !webglFailed
  // Any source change rebuilds the renderer, so old textures never meet new rectangles.
  const sourceKey = placed.map(({ source }) => source.variant.src).join('|')

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
      if (!image) return []
      const span = source.x1 - source.x0
      return [{ image, bend: layer.bend, rect, span, texClip: clip }]
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
      {placed.map(({ layer, source, rect, clip }, i) => {
        const src = requested[i]
        const isLoaded = loaded[layer.id] === source.variant.src
        const fade = layer.id !== 'sky' && !instant[layer.id] && !reducedMotion
        const style: CSSProperties = {
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
          opacity: layer.id === 'sky' || isLoaded ? 1 : 0,
          transition: fade ? FADE : undefined,
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
            src={src}
            alt=""
            draggable={false}
            decoding="async"
            fetchPriority={layer.id === 'sky' ? 'high' : 'low'}
            onLoad={() => src && markLoaded(layer.id, src)}
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
