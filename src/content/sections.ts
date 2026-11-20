import type { SectionLink } from './types'

/** Single source for nav links and section ids, so they can't drift apart. */
export const SECTIONS: readonly SectionLink[] = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]
