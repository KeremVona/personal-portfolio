import { Mail } from 'lucide-react'
import bandMeta from '../assets/footer/band.webp?w=720;1280;1920;2730&format=webp&quality=75&as=metadata'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { CONTACT } from '../content/contact'
import { LINKS } from '../content/links'
import { PROFILE } from '../content/profile'
import { sectionLabel } from '../content/sections'
import { CopyEmailButton } from './footer/CopyEmailButton'
import { copyrightLine } from './footer/footerLogic'

const BAND = (Array.isArray(bandMeta) ? bandMeta : [bandMeta]).toSorted(
  (a, b) => a.width - b.width,
)
const BAND_FULL = BAND[BAND.length - 1]
const COPYRIGHT = copyrightLine(PROFILE.name, new Date())
const LINK_ROW = [LINKS.linkedin, LINKS.github, LINKS.resume]

/**
 * Footer (Contact), option A "Night meadow": one clear ask (email), then the
 * hero's painted flowers growing along the bottom.
 * See docs/superpowers/specs/2026-11-21-footer-design.md.
 */
export function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <Section
        id="contact"
        className="pt-16 pb-10 sm:pt-24 sm:pb-12"
        heading={
          <SectionHeading
            id="contact"
            eyebrow={sectionLabel('contact')}
            title={CONTACT.title}
            tone="dark"
            titleClassName="max-w-[14ch] text-[clamp(2rem,5vw,3.75rem)] leading-[1.02]"
          />
        }
      >
        <Reveal>
          <p className="max-w-[46ch] text-base leading-relaxed text-cream/78 sm:text-[1.05rem]">
            {CONTACT.lead}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={LINKS.email.href}
              className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 font-medium text-ink hover:bg-white"
            >
              <Mail aria-hidden="true" size={18} />
              {PROFILE.email}
            </a>
            <CopyEmailButton email={PROFILE.email} />
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {LINK_ROW.map((link) => {
              const external = link.href.startsWith('http')
              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noreferrer' : undefined}
                    download={
                      link === LINKS.resume
                        ? 'Kerem-Can-Bas-Resume.pdf'
                        : undefined
                    }
                    className="underline decoration-meadow decoration-2 underline-offset-4 hover:decoration-cream"
                  >
                    {link === LINKS.resume ? 'Résumé (PDF)' : link.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </Section>

      {/* Never narrower than 720px, so phones see flowers at both edges; capped at
          700px tall on very wide screens, cropping from the top (2.797 = 2730/976). */}
      <div
        aria-hidden="true"
        className="relative h-[min(calc(max(100vw,720px)/2.797),700px)] overflow-hidden"
      >
        <img
          src={BAND_FULL.src}
          srcSet={BAND.map((v) => `${v.src} ${v.width}w`).join(', ')}
          sizes="max(100vw, 720px)"
          width={BAND_FULL.width}
          height={BAND_FULL.height}
          alt=""
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute bottom-0 left-1/2 h-auto w-[max(100%,720px)] max-w-none -translate-x-1/2 select-none"
        />
      </div>

      <div className="bg-[#16221a]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-[13px] text-cream/70 sm:flex-row sm:justify-between sm:px-6">
          <p>{COPYRIGHT}</p>
          <a href="#top" className="hover:text-cream">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
