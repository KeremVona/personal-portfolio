import { useRef } from 'react'
import cloudNightMeta from '../assets/hero/cloud-night.webp?w=420;700;1047&format=webp&quality=78&as=metadata'
import cloudMeta from '../assets/hero/cloud.webp?w=420;700;1047&format=webp&quality=78&as=metadata'
import portraitNightMeta from '../assets/hero/sky-night-portrait.webp?w=640;900;1152&format=webp&quality=62&as=metadata'
import portraitMeta from '../assets/hero/sky-portrait.webp?w=640;900;1152&format=webp&quality=62&as=metadata'
import wideNightMeta from '../assets/hero/sky-night.webp?w=1280;1920;2730&format=webp&quality=65&as=metadata'
import wideMeta from '../assets/hero/sky.webp?w=1280;1920;2730&format=webp&quality=65&as=metadata'
import { ThemedLayers } from '../components/ThemedLayers'
import { useTheme } from '../theme/useTheme'
import { CLOUD_BOX } from './hero/heroArt'
import { useCloudPlacement } from './hero/useCloudPlacement'
import { useShyCloud } from './hero/useShyCloud'

const byWidth = (meta: ImagetoolsMetadata | ImagetoolsMetadata[]) =>
  (Array.isArray(meta) ? meta : [meta]).toSorted((a, b) => a.width - b.width)
const srcSet = (variants: ImagetoolsMetadata[]) =>
  variants.map((v) => `${v.src} ${v.width}w`).join(', ')
// Day and night versions of each layer (see docs/superpowers/specs/2026-11-25-night-mode-design.md).
const ART = {
  day: {
    wide: byWidth(wideMeta),
    portrait: byWidth(portraitMeta),
    cloud: byWidth(cloudMeta),
  },
  night: {
    wide: byWidth(wideNightMeta),
    portrait: byWidth(portraitNightMeta),
    cloud: byWidth(cloudNightMeta),
  },
}
const largest = (variants: ImagetoolsMetadata[]) =>
  variants[variants.length - 1]

/**
 * The hero: Kerem's computer on a cloud, in a deep sky. The cloud is its own layer,
 * placed right of the copy (under it on narrow screens), and shies away from a
 * nearby cursor. See docs/superpowers/specs/2026-11-24-sky-hero-design.md.
 */
export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const cloudRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  useCloudPlacement(heroRef, copyRef, cloudRef)
  useShyCloud(heroRef, copyRef, cloudRef)

  return (
    <section
      ref={heroRef}
      id="top"
      aria-labelledby="hero-title"
      className="relative min-h-[max(100svh,600px)] scroll-mt-24 overflow-clip"
    >
      {/* Only the current theme's pictures load; a switch crossfades (ThemedLayers). */}
      <ThemedLayers theme={theme}>
        {(layer, { onLoad, onError, className }) => (
          <picture aria-hidden="true">
            {/* The picture covers the hero, so on tall screens it is drawn wider than
                the screen: hence the heights in `sizes`. */}
            <source
              media="(max-aspect-ratio: 3/4)"
              srcSet={srcSet(ART[layer].portrait)}
              sizes="max(100vw, 75vh, 450px)"
            />
            <img
              fetchPriority={layer === theme ? 'high' : 'auto'}
              sizes="max(100vw, 178vh, 1067px)"
              srcSet={srcSet(ART[layer].wide)}
              src={largest(ART[layer].wide).src}
              alt=""
              draggable={false}
              onLoad={onLoad}
              onError={onError}
              className={`pointer-events-none absolute inset-0 size-full object-cover select-none ${className}`}
            />
          </picture>
        )}
      </ThemedLayers>
      {/* The cloud and the TV's night glow move together. Placed by useCloudPlacement;
          hidden until then so it never shows in the wrong spot. */}
      <div
        ref={cloudRef}
        aria-hidden="true"
        style={{ aspectRatio: `${CLOUD_BOX.width} / ${CLOUD_BOX.height}` }}
        className="pointer-events-none invisible absolute select-none"
      >
        <ThemedLayers theme={theme}>
          {(layer, { onLoad, onError, className }) => (
            <img
              src={largest(ART[layer].cloud).src}
              srcSet={srcSet(ART[layer].cloud)}
              sizes="(max-aspect-ratio: 6/5) 90vw, 45vw"
              width={CLOUD_BOX.width}
              height={CLOUD_BOX.height}
              alt=""
              draggable={false}
              fetchPriority={layer === theme ? 'high' : 'auto'}
              onLoad={onLoad}
              onError={onError}
              className={`absolute inset-0 size-full max-w-none ${className}`}
            />
          )}
        </ThemedLayers>
        <span className="tv-glow" />
      </div>
      <div
        aria-hidden="true"
        className="hero-fade pointer-events-none absolute inset-x-0 bottom-0 h-[clamp(44px,7%,96px)]"
      />
      <div
        ref={copyRef}
        className="absolute top-[max(88px,14%)] left-[7%] isolate w-[min(43%,640px)] narrow:inset-x-5 narrow:top-[max(84px,11%)] narrow:w-auto"
      >
        <h1
          id="hero-title"
          className="font-display text-[clamp(2.25rem,4.4vw,5rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-cream"
        >
          Rooted in the back end.
          <br />
          Blooming on the front.
        </h1>
        <p className="mt-5 max-w-[44ch] text-[1.05rem] leading-relaxed text-cream sm:text-[1.15rem]">
          I'm Kerem, a full-stack engineer finishing my Software Engineering
          degree in Istanbul. I build with .NET, React and TypeScript.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="#projects"
            className="rounded-full bg-cream px-6 py-3 font-medium text-ink hover:bg-white"
          >
            See my work
          </a>
          <a
            href="#contact"
            className="rounded-full border-2 border-cream bg-[rgb(34_66_124/0.72)] px-6 py-3 font-medium text-cream backdrop-blur-sm hover:bg-[rgb(34_66_124/0.9)]"
          >
            Get in touch
          </a>
        </div>
      </div>
    </section>
  )
}
