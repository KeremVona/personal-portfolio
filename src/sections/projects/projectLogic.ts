import type { ProjectItem } from '../../content/types'

/**
 * Grid columns for a number of projects: never more columns than projects, and at
 * most three. Literal strings so Tailwind generates them.
 */
export function gridClass(count: number): string {
  if (count <= 0) return ''
  if (count === 1) return 'md:max-w-xl'
  if (count === 2) return 'md:grid-cols-2'
  return 'md:grid-cols-2 lg:grid-cols-3'
}

/** The card's tag row: the first few tags, plus how many are left for "+N". */
export function visibleTags(
  stack: string[],
  max = 4,
): { shown: string[]; extra: number } {
  return { shown: stack.slice(0, max), extra: Math.max(0, stack.length - max) }
}

export interface ProjectLink {
  label: 'View on GitHub' | 'Live site'
  href: string
  primary: boolean
}

/** The panel's links. The first one is the primary button. */
export function projectLinks(
  project: Pick<ProjectItem, 'repoUrl' | 'liveUrl'>,
): ProjectLink[] {
  const links: ProjectLink[] = []
  if (project.repoUrl)
    links.push({
      label: 'View on GitHub',
      href: project.repoUrl,
      primary: true,
    })
  if (project.liveUrl)
    links.push({
      label: 'Live site',
      href: project.liveUrl,
      primary: links.length === 0,
    })
  return links
}

export function sourceLabel(
  project: Pick<ProjectItem, 'repoUrl'>,
): 'Open source' | 'Closed source' {
  return project.repoUrl ? 'Open source' : 'Closed source'
}
