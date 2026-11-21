import { useRef } from 'react'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { PROJECTS } from '../content/projects'
import { sectionLabel } from '../content/sections'
import type { ProjectItem } from '../content/types'
import { BOUQUET_LEFT, BOUQUET_RIGHT, largest, srcSet } from './projects/art'
import { ProjectCard } from './projects/ProjectCard'
import { ProjectPanel, type ProjectPanelHandle } from './projects/ProjectPanel'
import { gridClass } from './projects/projectLogic'

const BOUQUET_SIZES = '(min-width: 1545px) 340px, (min-width: 768px) 22vw, 44vw'
const BOUQUET_CLASS =
  'pointer-events-none absolute bottom-0 h-auto select-none md:w-[clamp(150px,22vw,340px)]'

function Bouquets() {
  return (
    <>
      <img
        src={largest(BOUQUET_LEFT).src}
        srcSet={srcSet(BOUQUET_LEFT)}
        sizes={BOUQUET_SIZES}
        width={largest(BOUQUET_LEFT).width}
        height={largest(BOUQUET_LEFT).height}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={`${BOUQUET_CLASS} left-0 w-[44vw]`}
      />
      <img
        src={largest(BOUQUET_RIGHT).src}
        srcSet={srcSet(BOUQUET_RIGHT)}
        sizes={BOUQUET_SIZES}
        width={largest(BOUQUET_RIGHT).width}
        height={largest(BOUQUET_RIGHT).height}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={`${BOUQUET_CLASS} right-0 hidden md:block`}
      />
    </>
  )
}

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
      className="relative overflow-x-clip pb-40 sm:pb-48"
      decoration={<Bouquets />}
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
