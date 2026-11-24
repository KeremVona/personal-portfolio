import { useRef } from 'react'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { PROJECTS } from '../content/projects'
import { sectionLabel } from '../content/sections'
import type { ProjectItem } from '../content/types'
import { ProjectCard } from './projects/ProjectCard'
import { ProjectPanel, type ProjectPanelHandle } from './projects/ProjectPanel'
import { gridClass } from './projects/projectLogic'

/**
 * Projects: a card grid; each card opens the project's panel.
 * See docs/superpowers/specs/2026-11-21-projects-design.md.
 */
export function Projects() {
  const panelRef = useRef<ProjectPanelHandle>(null)
  const openProject = (project: ProjectItem) => panelRef.current?.open(project)

  return (
    <Section
      id="projects"
      className="sky-projects"
      heading={
        <SectionHeading
          id="projects"
          eyebrow={sectionLabel('projects')}
          title="Things I've built"
        />
      }
    >
      <ul className={`grid gap-7 ${gridClass(PROJECTS.length)}`}>
        {PROJECTS.map((project, index) => (
          <li key={project.slug}>
            <Reveal delay={index * 0.08} className="h-full">
              <ProjectCard project={project} onOpen={openProject} />
            </Reveal>
          </li>
        ))}
      </ul>
      <ProjectPanel ref={panelRef} />
    </Section>
  )
}
