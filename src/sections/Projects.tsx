import { type RefObject, useEffect, useRef } from 'react'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { PROJECTS } from '../content/projects'
import { sectionLabel } from '../content/sections'
import type { ProjectItem } from '../content/types'
import { BOUQUET_LEFT, BOUQUET_RIGHT, largest, srcSet } from './projects/art'
import { ProjectCard } from './projects/ProjectCard'
import { ProjectPanel, type ProjectPanelHandle } from './projects/ProjectPanel'
import { gridClass, sinkBy } from './projects/projectLogic'

const BOUQUET_SIZES = '(min-width: 1545px) 340px, (min-width: 768px) 22vw, 44vw'
const BOUQUET_CLASS =
  'pointer-events-none fixed bottom-0 h-auto translate-y-full select-none will-change-transform md:w-[clamp(150px,22vw,340px)]'

/**
 * Keeps the bouquets in the screen's bottom corners while Projects is on screen,
 * sinking them below the edge as it arrives and leaves (see sinkBy).
 */
function useCornerBouquets(
  section: RefObject<HTMLElement | null>,
  bouquets: RefObject<(HTMLImageElement | null)[]>,
) {
  useEffect(() => {
    const element = section.current
    if (!element) return
    let frame = 0
    const place = () => {
      frame = 0
      const { top, bottom } = element.getBoundingClientRect()
      for (const image of bouquets.current) {
        if (!image) continue
        const sink = sinkBy(top, bottom, innerHeight, image.offsetHeight)
        image.style.translate = `0 ${sink}px`
      }
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(place)
    }
    // Only follow the scroll while the section is near the screen.
    const watcher = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        addEventListener('scroll', request, { passive: true })
        addEventListener('resize', request)
        request()
      } else {
        removeEventListener('scroll', request)
        removeEventListener('resize', request)
        for (const image of bouquets.current)
          image?.style.removeProperty('translate')
      }
    })
    watcher.observe(element)
    return () => {
      watcher.disconnect()
      removeEventListener('scroll', request)
      removeEventListener('resize', request)
      cancelAnimationFrame(frame)
    }
  }, [section, bouquets])
}

function Bouquets({
  imagesRef,
}: {
  imagesRef: RefObject<(HTMLImageElement | null)[]>
}) {
  return (
    <>
      <img
        ref={(image) => {
          imagesRef.current[0] = image
        }}
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
        ref={(image) => {
          imagesRef.current[1] = image
        }}
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
  const sectionRef = useRef<HTMLElement>(null)
  const bouquetsRef = useRef<(HTMLImageElement | null)[]>([])
  useCornerBouquets(sectionRef, bouquetsRef)

  return (
    <Section
      id="projects"
      ref={sectionRef}
      className="relative overflow-x-clip pb-40 sm:pb-48"
      decoration={<Bouquets imagesRef={bouquetsRef} />}
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
