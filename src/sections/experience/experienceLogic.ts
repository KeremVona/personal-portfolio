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

/**
 * Newest first: the current role (no end date), then by end date, then by start.
 * Dates are "YYYY-MM", so they compare as strings. The sort is stable, so ties keep
 * content order.
 */
export function orderRoles(items: ExperienceItem[]): ExperienceItem[] {
  const end = (item: ExperienceItem) => item.end ?? '9999-99'
  return items.toSorted(
    (a, b) => end(b).localeCompare(end(a)) || b.start.localeCompare(a.start),
  )
}
