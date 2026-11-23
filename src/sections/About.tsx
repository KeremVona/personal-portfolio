import koiMeta from '../assets/about/koi.webp?w=480;720;960&format=webp&quality=80&as=metadata'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { ABOUT, aboutFacts } from '../content/about'
import { PROFILE } from '../content/profile'
import { sectionLabel } from '../content/sections'
import { PondLayer } from './about/PondLayer'

const KOI = (Array.isArray(koiMeta) ? koiMeta : [koiMeta]).toSorted(
  (a, b) => a.width - b.width,
)
const KOI_SRCSET = KOI.map((v) => `${v.src} ${v.width}w`).join(', ')
// Column widths: ~38% of the 1152px container on desktop, ≤320px on phones.
const KOI_SIZES =
  '(min-width: 1152px) 420px, (min-width: 768px) 36vw, min(68vw, 320px)'

/**
 * About, layout A: the koi watercolour as a tilted print beside a short story.
 * Its koi come alive as a small pond once the section is near (PondLayer); the
 * painting itself stays underneath as the still version.
 * See docs/superpowers/specs/2026-11-21-about-design.md and 2026-11-23-about-pond-design.md.
 */
export function About() {
  return (
    <Section id="about">
      <div className="grid items-center gap-7 md:grid-cols-[38%_1fr] md:gap-[6%]">
        <Reveal className="w-[68%] max-w-[320px] md:w-full md:max-w-none">
          <div className="relative -rotate-[1.6deg] bg-[#f2ead8] shadow-[0_14px_30px_-12px_rgb(30_50_30/0.35),0_2px_6px_rgb(30_50_30/0.08)]">
            <PondLayer>
              <img
                src={KOI[1]?.src ?? KOI[0].src}
                srcSet={KOI_SRCSET}
                sizes={KOI_SIZES}
                width={1200}
                height={1599}
                alt={ABOUT.imageAlt}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
            </PondLayer>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <SectionHeading
            id="about"
            eyebrow={sectionLabel('about')}
            title={ABOUT.title}
          />
          <div className="mt-5 space-y-3.5 text-[1.05rem] leading-[1.65] text-ink-soft">
            {ABOUT.paragraphs.map((paragraph) => (
              <p key={paragraph} className="max-w-[58ch]">
                {paragraph}
              </p>
            ))}
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {aboutFacts(PROFILE).map((fact) => (
              <li
                key={fact}
                className="rounded-full bg-meadow-tint px-3 py-1.5 text-[13px] text-meadow-deep"
              >
                {fact}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  )
}
