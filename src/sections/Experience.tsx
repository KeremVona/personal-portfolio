import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { EXPERIENCE } from '../content/experience'
import { sectionLabel } from '../content/sections'
import { ExperienceCard } from './experience/ExperienceCard'
import { orderRoles } from './experience/experienceLogic'

/**
 * Experience, layout C: the featured role in a wide card with its numbers, then
 * the other roles in a two-column grid.
 * See docs/superpowers/specs/2026-11-21-experience-design.md.
 */
export function Experience() {
  return (
    <Section
      id="experience"
      heading={
        <SectionHeading
          id="experience"
          eyebrow={sectionLabel('experience')}
          title="Where I've worked"
        />
      }
    >
      <ul className="grid items-start gap-5 md:grid-cols-2">
        {orderRoles(EXPERIENCE).map((item, index) => (
          <li
            key={`${item.company}-${item.start}`}
            className={
              item.featured && item.stats?.length ? 'md:col-span-2' : ''
            }
          >
            <Reveal delay={index * 0.08}>
              <ExperienceCard item={item} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
