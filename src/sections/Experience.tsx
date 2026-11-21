import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { EXPERIENCE } from '../content/experience'
import { sectionLabel } from '../content/sections'

export function Experience() {
  return (
    <Section
      id="experience"
      heading={
        <SectionHeading
          id="experience"
          eyebrow={sectionLabel('experience')}
          title={sectionLabel('experience')}
        />
      }
    >
      <ul className="space-y-2 text-lg">
        {EXPERIENCE.map((item) => (
          <li key={`${item.company}-${item.start}`}>
            {item.role} — {item.company}
          </li>
        ))}
      </ul>
    </Section>
  )
}
