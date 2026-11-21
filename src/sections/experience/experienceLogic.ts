import type { ExperienceItem } from '../../content/types'

/** "Istanbul, Türkiye" + Onsite → "Istanbul · Onsite"; remote-only work → "Remote". */
export function placeLabel(
  item: Pick<ExperienceItem, 'location' | 'workMode'>,
): string {
  const city = item.location.split(',')[0].trim()
  return city === item.workMode ? city : `${city} · ${item.workMode}`
}

/** The highlights a card shows at first, and the ones behind "Show N more". */
export function splitHighlights(
  highlights: string[],
  visible = 2,
): { shown: string[]; hidden: string[] } {
  return {
    shown: highlights.slice(0, visible),
    hidden: highlights.slice(visible),
  }
}

/** The featured role first (it gets the wide card); the rest keep content order. */
export function orderRoles(items: ExperienceItem[]): ExperienceItem[] {
  return [
    ...items.filter((item) => item.featured),
    ...items.filter((item) => !item.featured),
  ]
}
