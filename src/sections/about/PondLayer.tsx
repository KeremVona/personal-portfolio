import {
  type ReactNode,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react'
import type { LivePondProps } from './pond/LivePond'

/** If the pond's script can't load (offline, a stale deploy), keep the painting. */
function NoPond({ onFail }: LivePondProps) {
  useEffect(onFail, [onFail])
  return null
}
const LivePond = lazy<ComponentType<LivePondProps>>(() =>
  import('./pond/LivePond').catch(() => ({ default: NoPond })),
)

const FADE_MS = 400

type Phase = 'waiting' | 'loading' | 'shown' | 'leaving' | 'off'

const reducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/**
 * Lays the living pond over the About painting (its children). It loads only when the
 * section is near the screen and with motion allowed, and fades in over the painting
 * once its first frame is drawn. Any failure (no WebGL included: the renderer reports
 * it) fades it back out, leaving the still painting.
 * Only one of the two is ever announced or focusable: the painting until the pond shows.
 * See docs/superpowers/specs/2026-11-23-about-pond-design.md §3.
 */
export function PondLayer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  // Without motion allowed or an observer, the painting simply stays still.
  const [phase, setPhase] = useState<Phase>(() =>
    'IntersectionObserver' in window && !reducedMotion() ? 'waiting' : 'off',
  )

  useEffect(() => {
    const element = ref.current
    if (!element || phase !== 'waiting') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        setPhase('loading')
      },
      { rootMargin: '600px' },
    )
    // Never compete with the page's own first load: start watching once it's done.
    const watch = () => observer.observe(element)
    if (document.readyState === 'complete') watch()
    else window.addEventListener('load', watch, { once: true })
    return () => {
      window.removeEventListener('load', watch)
      observer.disconnect()
    }
  }, [phase])

  // Someone turning on "reduce motion" while the pond runs gets the still painting.
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!query) return
    const change = () => {
      if (query.matches) setPhase((p) => (p === 'shown' ? 'leaving' : 'off'))
    }
    query.addEventListener('change', change)
    return () => query.removeEventListener('change', change)
  }, [])

  const onReady = useCallback(
    () => setPhase((p) => (p === 'loading' ? 'shown' : p)),
    [],
  )
  const onFail = useCallback(
    () => setPhase((p) => (p === 'shown' ? 'leaving' : 'off')),
    [],
  )

  // Fade out first, then unmount the pond.
  useEffect(() => {
    if (phase !== 'leaving') return
    const timer = setTimeout(() => setPhase('off'), FADE_MS)
    return () => clearTimeout(timer)
  }, [phase])

  const live = phase === 'loading' || phase === 'shown' || phase === 'leaving'
  const shown = phase === 'shown'
  return (
    <>
      <div aria-hidden={shown || undefined}>{children}</div>
      <div
        ref={ref}
        inert={!shown}
        className={`absolute inset-0 transition-opacity duration-[400ms] ease-out ${shown ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        {live && (
          <Suspense fallback={null}>
            <LivePond
              onReady={onReady}
              onFail={onFail}
              running={phase !== 'leaving'}
            />
          </Suspense>
        )}
      </div>
    </>
  )
}
