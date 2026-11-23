import { formatGraduation } from './format'
import type { Profile } from './types'

/** About copy. Placeholder text: Kerem rewrites it at the end. */
export const ABOUT = {
  title: 'A little about me',
  paragraphs: [
    "I'm Kerem, a final-year Software Engineering student at Fatih Sultan Mehmet Vakıf University in Istanbul, graduating in June 2027.",
    "Over the last two years I've interned at four companies, building a news-intelligence platform, browser games for a site with 2.5M monthly visits, and now a benchmarking platform for decision-making AI. I like owning the whole thing: the data underneath and the interface people actually touch.",
    "Away from the keyboard, you'll usually find me [a hobby or two].",
  ],
  imageAlt: 'Watercolour painting of koi fish swimming among lily pads',
  pondLabel:
    'Watercolour painting of koi fish swimming among lily pads. The koi swim; click one and it darts away.',
}

/** The small pills under the About text, derived from the profile. */
export function aboutFacts(profile: Profile): string[] {
  return [
    profile.location,
    `Graduating ${formatGraduation(profile.graduation)}`,
    profile.languages.join(' · '),
  ]
}
