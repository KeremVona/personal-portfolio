import { Download, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LINKS } from '../content/links'
import { PROFILE } from '../content/profile'
import { SECTIONS } from '../content/sections'
import { useNavState } from '../hooks/useNavState'

/**
 * Fixed nav: transparent at the very top, solid once scrolled, hides on the way
 * down past the hero and returns on the way up. Phones get a menu card.
 * See docs/superpowers/specs/2026-11-21-hero-design.md §6.
 */
export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)
  const { solid, hidden } = useNavState(menuOpen, focusWithin)
  const headerRef = useRef<HTMLElement>(null)

  // Close the phone menu on Escape or a tap outside the nav.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [menuOpen])

  // Transparent at the very top, over the hero's deep sky: cream there.
  const onSky = !solid && !menuOpen
  const look = onSky
    ? 'bg-transparent text-cream'
    : 'bg-haze/88 shadow-[0_1px_0_rgb(21_38_74/0.1)] backdrop-blur-[10px]'

  return (
    <header
      ref={headerRef}
      onFocus={() => setFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setFocusWithin(false)
      }}
      className={`fixed inset-x-0 top-0 z-50 h-16 transition-[translate,background-color,box-shadow] duration-300 ease-out motion-reduce:transition-none ${hidden ? '-translate-y-full' : 'translate-y-0'} ${look}`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-[-0.03em]"
        >
          {PROFILE.name}
        </a>
        <ul
          className={`hidden gap-8 text-sm font-medium sm:flex ${onSky ? 'text-cream' : 'text-ink-soft'}`}
        >
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={onSky ? 'hover:underline' : 'hover:text-ink'}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a
            href={LINKS.resume.href}
            download="Kerem-Can-Bas-Resume.pdf"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${onSky ? 'bg-cream text-ink hover:bg-white' : 'bg-ink text-cream hover:bg-ink-soft'}`}
          >
            {LINKS.resume.label}
            <Download aria-hidden="true" className="size-4" />
          </a>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
            className={`inline-flex size-9 items-center justify-center rounded-full border sm:hidden ${onSky ? 'border-cream/70' : 'border-ink/20 bg-white/55'}`}
          >
            {menuOpen ? (
              <X aria-hidden="true" className="size-4" />
            ) : (
              <Menu aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </nav>
      <div
        id="nav-menu"
        hidden={!menuOpen}
        className="absolute inset-x-3 top-full rounded-card bg-cream p-2 shadow-card sm:hidden"
      >
        <ul>
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={() => setMenuOpen(false)}
                className="block rounded-[10px] px-4 py-3 text-base font-medium hover:bg-haze"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
