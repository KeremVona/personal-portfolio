import { Mail } from 'lucide-react'
import { useEffect, useRef } from 'react'
import phoneMeta from '../assets/footer/sky-phone.webp?w=640;1024;1536&format=webp&quality=78&as=metadata'
import phoneNightMeta from '../assets/footer/sky-night-phone.webp?w=640;1024;1536&format=webp&quality=78&as=metadata'
import wideNightMeta from '../assets/footer/sky-night.webp?w=1280;1920;2730&format=webp&quality=78&as=metadata'
import wideMeta from '../assets/footer/sky.webp?w=1280;1920;2730&format=webp&quality=78&as=metadata'
import { Reveal } from '../components/Reveal'
import { ThemedLayers } from '../components/ThemedLayers'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { CONTACT } from '../content/contact'
import { LINKS } from '../content/links'
import { PROFILE } from '../content/profile'
import { sectionLabel } from '../content/sections'
import { useTheme } from '../theme/useTheme'
import { CopyEmailButton } from './footer/CopyEmailButton'

const byWidth = (meta: ImagetoolsMetadata | ImagetoolsMetadata[]) =>
  (Array.isArray(meta) ? meta : [meta]).toSorted((a, b) => a.width - b.width)
const srcSet = (variants: ImagetoolsMetadata[]) =>
  variants.map((v) => `${v.src} ${v.width}w`).join(', ')
// Day and night skies (see docs/superpowers/specs/2026-11-25-night-mode-design.md §5).
const ART = {
  day: { wide: byWidth(wideMeta), phone: byWidth(phoneMeta) },
  night: { wide: byWidth(wideNightMeta), phone: byWidth(phoneNightMeta) },
}
const largest = (variants: ImagetoolsMetadata[]) =>
  variants[variants.length - 1]
const LINK_ROW = [LINKS.linkedin, LINKS.github, LINKS.resume]

/**
 * Footer (Contact): one clear ask (email) in the sky above Kerem's hilltop
 * computer. The geometry is .sky-footer in index.css.
 * See docs/superpowers/specs/2026-11-22-footer-sky-design.md.
 */
export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const { theme } = useTheme()
  // While the footer is on screen, the overscroll bounce under it is sky, not cream.
  useEffect(() => {
    const footer = ref.current
    if (!footer || !('IntersectionObserver' in window)) return
    const root = document.documentElement
    const observer = new IntersectionObserver(([entry]) =>
      root.classList.toggle('at-footer', entry.isIntersecting),
    )
    observer.observe(footer)
    return () => {
      observer.disconnect()
      root.classList.remove('at-footer')
    }
  }, [])

  return (
    <footer ref={ref} className="text-cream">
      <div className="sky-footer">
        <Section
          id="contact"
          className="relative z-10 scroll-mt-0! pt-12 pb-0 text-center sm:pt-12 sm:pb-0"
          heading={
            <SectionHeading
              id="contact"
              eyebrow={sectionLabel('contact')}
              title={CONTACT.title}
              tone="dark"
              titleClassName="text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.05] text-balance wrap-anywhere"
            />
          }
        >
          <Reveal>
            <p className="mx-auto max-w-[54ch] text-base leading-relaxed text-pretty sm:text-[1.05rem]">
              {CONTACT.lead}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={LINKS.email.href}
                className="inline-flex max-w-full items-center gap-2 rounded-full bg-cream px-5 py-3 font-medium text-ink hover:bg-white"
              >
                <Mail aria-hidden="true" size={18} className="shrink-0" />
                <span className="min-w-0 wrap-anywhere">{PROFILE.email}</span>
              </a>
              <CopyEmailButton email={PROFILE.email} />
            </div>
            <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2">
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
                      className="underline decoration-cream/65 decoration-2 underline-offset-4 hover:decoration-cream"
                    >
                      {link === LINKS.resume ? 'Résumé (PDF)' : link.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </Reveal>
        </Section>

        {/* Reserves the part of the image that must stay clear of text. */}
        <div aria-hidden="true" className="sky-footer-space" />
        <ThemedLayers theme={theme}>
          {(layer, { onLoad, className }) => (
            <picture aria-hidden="true">
              {/* Keep the media query in step with the one in index.css. */}
              <source
                media="(max-width: 500px)"
                srcSet={srcSet(ART[layer].phone)}
                sizes="507px"
                width={largest(ART[layer].phone).width}
                height={largest(ART[layer].phone).height}
              />
              <img
                src={largest(ART[layer].wide).src}
                srcSet={srcSet(ART[layer].wide)}
                sizes="max(100vw, 900px)"
                width={largest(ART[layer].wide).width}
                height={largest(ART[layer].wide).height}
                alt=""
                loading="lazy"
                decoding="async"
                onLoad={onLoad}
                className={`sky-footer-art ${className}`}
              />
            </picture>
          )}
        </ThemedLayers>
      </div>
    </footer>
  )
}
