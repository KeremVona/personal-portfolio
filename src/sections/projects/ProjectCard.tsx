import type { ProjectItem } from '../../content/types'
import { largest, srcSet } from './art'
import { MediaPlaceholder } from './MediaPlaceholder'
import { sourceLabel, visibleTags } from './projectLogic'

const COVER_SIZES = '(min-width: 1024px) 360px, (min-width: 768px) 45vw, 100vw'

interface ProjectCardProps {
  project: ProjectItem
  onOpen: (project: ProjectItem) => void
}

/**
 * A project card. The whole card is clickable through a "stretched" button: the
 * button sits in the h3 (headings can't go inside a button) and its ::after
 * covers the card.
 */
export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const cover = project.media[0]
  const { shown, extra } = visibleTags(project.stack)

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card transition-[translate,box-shadow] duration-300 ease-out hover:shadow-[0_14px_34px_rgb(30_50_30/0.17)] has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-sky-deep motion-safe:hover:-translate-y-1">
      {cover?.kind === 'image' ? (
        <img
          src={largest(cover.variants).src}
          srcSet={srcSet(cover.variants)}
          sizes={COVER_SIZES}
          width={largest(cover.variants).width}
          height={largest(cover.variants).height}
          alt={cover.alt}
          loading="lazy"
          decoding="async"
          className="aspect-[16/10] w-full object-cover"
        />
      ) : (
        <MediaPlaceholder tone={project.tone} className="aspect-[16/10]" />
      )}
      <div className="flex flex-1 flex-col px-5 pt-4.5 pb-5">
        {/* The ring is drawn on the article: its overflow-hidden would clip one on ::after. */}
        <h3 className="font-display text-lg font-semibold tracking-[-0.01em]">
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => onOpen(project)}
            className="cursor-pointer text-left after:absolute after:inset-0 after:rounded-card focus-visible:outline-none"
          >
            {project.name}
          </button>
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          {project.summary}
        </p>
        {shown.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {shown.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-haze px-2.5 py-1 text-xs text-sky-deep"
              >
                {tag}
              </li>
            ))}
            {extra > 0 && (
              <li className="rounded-full bg-haze px-2.5 py-1 text-xs text-sky-deep">
                +{extra}
              </li>
            )}
          </ul>
        )}
        <p className="mt-auto flex justify-between pt-4 text-xs text-ink/65">
          <span>{sourceLabel(project)}</span>
          <span aria-hidden="true" className="font-medium text-sky-deep">
            Read more →
          </span>
        </p>
      </div>
    </article>
  )
}
