import { Download } from 'lucide-react'
import { LINKS } from '../content/links'
import { PROFILE } from '../content/profile'
import { SECTIONS } from '../content/sections'

// Not sticky, and section links hidden below 640px: both revisited in the hero session.
export function Nav() {
  return (
    <header>
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6"
      >
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-[-0.03em]"
        >
          {PROFILE.name}
        </a>
        <ul className="hidden gap-8 text-sm font-medium text-ink-soft sm:flex">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="hover:text-ink">
                {section.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={LINKS.resume.href}
          download="Kerem-Can-Bas-Resume.pdf"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream hover:bg-ink-soft"
        >
          {LINKS.resume.label}
          <Download aria-hidden="true" className="size-4" />
        </a>
      </nav>
    </header>
  )
}
