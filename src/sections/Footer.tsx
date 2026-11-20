import { Section } from '../components/Section'
import { LINKS } from '../content/links'
import { PROFILE } from '../content/profile'
import { sectionLabel } from '../content/sections'

const CONTACT_LINKS = [LINKS.email, LINKS.linkedin, LINKS.github, LINKS.resume]
const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer>
      <Section id="contact" title={sectionLabel('contact')}>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 text-lg">
          {CONTACT_LINKS.map((link) => {
            const external = link.href.startsWith('http')
            return (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  download={
                    link === LINKS.resume
                      ? 'Kerem-Can-Bas-Resume.pdf'
                      : undefined
                  }
                  className="underline decoration-meadow decoration-2 underline-offset-4 hover:decoration-ink"
                >
                  {link.label}
                </a>
              </li>
            )
          })}
        </ul>
        <p className="mt-12 text-sm text-ink-soft">
          © {YEAR} {PROFILE.name}
        </p>
      </Section>
    </footer>
  )
}
