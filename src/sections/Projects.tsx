import { Section } from '../components/Section'
import { PROJECTS } from '../content/projects'
import { sectionLabel } from '../content/sections'

export function Projects() {
  return (
    <Section id="projects" title={sectionLabel('projects')}>
      <ul className="space-y-2 text-lg">
        {PROJECTS.map((project) => (
          <li key={project.slug}>{project.name}</li>
        ))}
      </ul>
    </Section>
  )
}
