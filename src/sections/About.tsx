import { Section } from '../components/Section'
import { PROFILE } from '../content/profile'
import { sectionLabel } from '../content/sections'

export function About() {
  return (
    <Section id="about" title={sectionLabel('about')}>
      <p className="max-w-2xl text-lg text-ink-soft">
        Software Engineering student at {PROFILE.school}.
      </p>
    </Section>
  )
}
