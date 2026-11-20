import type { CSSProperties } from 'react'
import { useElementSize } from '../hooks/useElementSize'
import { Meadow } from './hero/Meadow'
import { isNarrow } from './hero/placement'

// Cream wash behind the copy so it stays legible over the painting (spec §4).
const WASH_WIDE: CSSProperties = {
  background:
    'radial-gradient(ellipse 60% 55% at 28% 38%, rgb(251 247 238 / 0.78), rgb(251 247 238 / 0.4) 55%, rgb(251 247 238 / 0) 100%)',
}
const WASH_NARROW: CSSProperties = {
  background:
    'linear-gradient(rgb(251 247 238 / 0.75), rgb(251 247 238 / 0.45) 45%, rgb(251 247 238 / 0) 65%)',
}

export function Hero() {
  const [ref, size] = useElementSize<HTMLElement>()
  const narrow = size ? isNarrow(size) : false

  return (
    <section
      ref={ref}
      id="top"
      aria-labelledby="hero-title"
      className="relative min-h-[max(100svh,600px)] scroll-mt-24 overflow-hidden"
    >
      {size && <Meadow size={size} />}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={narrow ? WASH_NARROW : WASH_WIDE}
      />
      <div
        className={
          narrow
            ? 'absolute inset-x-5 top-[16%]'
            : 'absolute top-[22%] left-[7%] w-[62%]'
        }
      >
        <h1
          id="hero-title"
          className="font-display text-[clamp(2.25rem,5.6vw,5.75rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-ink"
        >
          Rooted in the back end.
          <br />
          Blooming on the front.
        </h1>
        <p className="mt-5 max-w-[44ch] text-[1.05rem] leading-relaxed text-ink-soft sm:text-[1.15rem]">
          I'm Kerem, a full-stack engineer finishing my Software Engineering
          degree in Istanbul. I build with .NET, React and TypeScript.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="#projects"
            className="rounded-full bg-ink px-6 py-3 font-medium text-cream hover:bg-ink-soft"
          >
            See my work
          </a>
          <a
            href="#contact"
            className="rounded-full border border-ink/22 bg-white/62 px-6 py-3 font-medium text-ink backdrop-blur-sm hover:bg-white/80"
          >
            Get in touch
          </a>
        </div>
      </div>
    </section>
  )
}
