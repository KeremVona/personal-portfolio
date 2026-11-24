import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { EXPERIENCE } from '../content/experience'
import { formatDateRange } from '../content/format'
import { sectionLabel } from '../content/sections'
import { ExperienceCard } from './experience/ExperienceCard'
import { orderRoles } from './experience/experienceLogic'

/**
 * Experience: one straight timeline, newest first. Dates on the left (above each card
 * on phones), a line with a dot per role, and same-width cards that grow downward.
 * Geometry: .timeline in index.css.
 * See docs/superpowers/specs/2026-11-24-sky-redesign-design.md §7.
 */
export function Experience() {
  return (
    <Section
      id="experience"
      className="sky-experience text-cream"
      heading={
        <SectionHeading
          id="experience"
          eyebrow={sectionLabel('experience')}
          title="Where I've worked"
          tone="dark"
        />
      }
    >
      <ol className="timeline">
        {orderRoles(EXPERIENCE).map((item, index) => (
          <li key={`${item.company}-${item.start}`}>
            <span
              aria-hidden="true"
              className="timeline-dot"
              data-now={item.end === null || undefined}
            />
            <p className="timeline-date">
              {formatDateRange(item.start, item.end)}
            </p>
            <Reveal delay={index * 0.06}>
              <ExperienceCard item={item} />
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  )
}
