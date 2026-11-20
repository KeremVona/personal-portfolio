import { PROFILE } from '../content/profile'

// Placeholder copy and no art yet: the hero is designed in its own session.
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-24 sm:px-6 sm:pt-24">
        <p className="inline-flex items-center gap-2 rounded-full border border-meadow-deep/20 bg-white/60 px-3 py-1 text-sm text-ink-soft">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-meadow-deep"
          />
          {PROFILE.availability}
        </p>
        <h1
          id="hero-title"
          className="mt-6 max-w-3xl font-display text-5xl leading-[0.98] font-semibold tracking-[-0.045em] sm:text-7xl"
        >
          Rooted in the back end. Blooming on the front.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-soft">
          I'm Kerem, a full-stack engineer finishing my Software Engineering
          degree in Istanbul.
        </p>
      </div>
    </section>
  )
}
