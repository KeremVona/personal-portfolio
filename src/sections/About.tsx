import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { ABOUT } from '../content/about'
import { sectionLabel } from '../content/sections'

export function About() {
  return (
    <Section id="about">
      <SectionHeading
        id="about"
        eyebrow={sectionLabel('about')}
        title={ABOUT.title}
      />
    </Section>
  )
}
