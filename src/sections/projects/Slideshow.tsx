import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ProjectMedia } from '../../content/types'
import { largest, srcSet } from './art'
import { stepSlide } from './projectLogic'

/** How long each screenshot shows before the next one fades in. */
const CYCLE_MS = 5000

const BUTTON =
  'flex size-8 cursor-pointer items-center justify-center border-2 border-ink bg-paper text-ink hover:bg-haze focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

type ImageMedia = Extract<ProjectMedia, { kind: 'image' }>

interface SlideshowProps {
  slides: ImageMedia[]
  /** What the screenshots show, for screen readers ("AgriTech screenshots"). */
  label: string
  sizes: string
  /** Sets the frame's aspect ratio (and any border). */
  className?: string
}

/**
 * A project's screenshots, one at a time. They step on every few seconds and
 * crossfade; back, forward and pause buttons sit in the corner. Auto-advance waits
 * while a mouse hovers and off screen, stops once paused (WCAG 2.2.2), and starts
 * paused with reduced motion.
 */
export function Slideshow({
  slides,
  label,
  sizes,
  className = '',
}: SlideshowProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(
    () =>
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [held, setHeld] = useState(false)
  const [onScreen, setOnScreen] = useState(false)
  const count = slides.length

  useEffect(() => {
    const frame = frameRef.current
    if (!frame || typeof IntersectionObserver !== 'function') return
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    )
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  // Restarts on every step, so a button press gives the new slide its full time.
  useEffect(() => {
    if (paused || held || !onScreen || count < 2) return
    const timer = setTimeout(
      () => setIndex((i) => stepSlide(i, 1, count)),
      CYCLE_MS,
    )
    return () => clearTimeout(timer)
  }, [index, paused, held, onScreen, count])

  return (
    <div
      ref={frameRef}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      className={`relative overflow-hidden ${className}`}
    >
      {slides.map((slide, i) => {
        const big = largest(slide.variants)
        return (
          <img
            key={big.src}
            src={big.src}
            srcSet={srcSet(slide.variants)}
            sizes={sizes}
            width={big.width}
            height={big.height}
            alt={slide.alt}
            aria-hidden={i !== index}
            loading="lazy"
            decoding="async"
            className={`slide absolute inset-0 size-full object-cover ${i === index ? 'opacity-100' : 'opacity-0'}`}
          />
        )
      })}
      {count > 1 && (
        // Above the card's stretched link, so pressing these never opens the panel.
        <div className="absolute right-2 bottom-2 z-10 flex items-center gap-1.5">
          <span
            aria-live={paused ? 'polite' : 'off'}
            className="border-2 border-ink bg-paper px-1.5 py-0.5 font-mono text-xs text-ink"
          >
            {index + 1} / {count}
          </span>
          <button
            type="button"
            aria-label="Previous screenshot"
            onClick={() => setIndex((i) => stepSlide(i, -1, count))}
            className={BUTTON}
          >
            <ChevronLeft aria-hidden="true" size={16} />
          </button>
          <button
            type="button"
            aria-label={paused ? 'Play the slideshow' : 'Pause the slideshow'}
            onClick={() => setPaused((p) => !p)}
            className={BUTTON}
          >
            {paused ? (
              <Play aria-hidden="true" size={14} />
            ) : (
              <Pause aria-hidden="true" size={14} />
            )}
          </button>
          <button
            type="button"
            aria-label="Next screenshot"
            onClick={() => setIndex((i) => stepSlide(i, 1, count))}
            className={BUTTON}
          >
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
