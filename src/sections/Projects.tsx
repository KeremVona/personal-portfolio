import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { PROJECTS } from '../content/projects'
import { sectionLabel } from '../content/sections'

export function Projects() {
  return (
    <Section
      id="projects"
      heading={
        <SectionHeading
          id="projects"
          eyebrow={sectionLabel('projects')}
          title={sectionLabel('projects')}
        />
      }
    >
      <ul className="space-y-2 text-lg">
        {PROJECTS.map((project) => (
          <li key={project.slug}>{project.name}</li>
        ))}
      </ul>
    </Section>
  )
}
