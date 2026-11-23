import type { CSSProperties } from 'react'
import portraitMeta from '../assets/hero/valley-portrait.webp?w=640;900;1024;1152&format=webp&quality=62&as=metadata'
import wideMeta from '../assets/hero/valley.webp?w=1280;1920;2730&format=webp&quality=65&as=metadata'

const byWidth = (meta: ImagetoolsMetadata | ImagetoolsMetadata[]) =>
  (Array.isArray(meta) ? meta : [meta]).toSorted((a, b) => a.width - b.width)
const srcSet = (variants: ImagetoolsMetadata[]) =>
  variants.map((v) => `${v.src} ${v.width}w`).join(', ')
const WIDE = byWidth(wideMeta)
const WIDE_FULL = WIDE[WIDE.length - 1]
const PORTRAIT = byWidth(portraitMeta)

// The valley dissolves into the cream page instead of ending in a hard line. Short
// and mostly clear, so it doesn't lay a milky band over the meadow; eased stops so
// it has no visible starting edge.
const BOTTOM_FADE: CSSProperties = {
  background:
    'linear-gradient(rgb(251 247 238 / 0), rgb(251 247 238 / 0.04) 30%, rgb(251 247 238 / 0.16) 52%, rgb(251 247 238 / 0.45) 74%, rgb(251 247 238 / 0.84) 91%, rgb(251 247 238))',
}

/**
 * The hero: a still valley picture with the copy in its sky.
 * See docs/superpowers/specs/2026-11-22-hero-still-design.md.
 */
export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative min-h-[max(100svh,600px)] scroll-mt-24 overflow-clip"
    >
      <picture aria-hidden="true">
        {/* The picture covers the hero, so on tall screens it is drawn wider than
            the screen: hence the heights in `sizes`. */}
        <source
          media="(max-aspect-ratio: 3/4)"
          srcSet={srcSet(PORTRAIT)}
          sizes="max(100vw, 75vh, 450px)"
        />
        <img
          fetchPriority="high"
          sizes="max(100vw, 178vh, 1067px)"
          srcSet={srcSet(WIDE)}
          src={WIDE_FULL.src}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 size-full object-cover object-[47%_60%] select-none"
        />
      </picture>
      <div aria-hidden="true" className="hero-mist absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[clamp(44px,7%,96px)]"
        style={BOTTOM_FADE}
      />
      <div className="absolute top-[max(88px,14%)] left-[7%] isolate w-[62%] narrow:inset-x-5 narrow:top-[max(84px,11%)] narrow:w-auto">
        <h1
          id="hero-title"
          className="font-display text-[clamp(2.25rem,5.6vw,5.75rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-ink"
        >
          Rooted in the back end.
          <br />
          Blooming on the front.
        </h1>
        <p className="hero-lead mt-5 max-w-[44ch] text-[1.05rem] leading-relaxed text-ink sm:text-[1.15rem]">
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
            className="rounded-full border border-ink/22 bg-cream/85 px-6 py-3 font-medium text-ink hover:bg-cream"
          >
            Get in touch
          </a>
        </div>
      </div>
    </section>
  )
}
