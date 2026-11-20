import type { ExternalLink } from './types'

export const LINKS: Record<
  'email' | 'github' | 'linkedin' | 'resume',
  ExternalLink
> = {
  email: { label: 'Email', href: 'mailto:keremvona@gmail.com' },
  github: { label: 'GitHub', href: 'https://github.com/KeremVona' },
  linkedin: {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/kerem-can-bas',
  },
  resume: { label: 'Résumé', href: '/Kerem-Can-Bas-Resume.pdf' },
}
