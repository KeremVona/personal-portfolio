import { TAG_LABEL } from '../../components/labelStyle'
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
 * A project, as a classic computer window (.window in index.css). The whole card is clickable through a "stretched" button: the
 * button sits in the h3 (headings can't go inside a button) and its ::after
 * covers the card.
 */
export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const cover = project.media[0]
  const { shown, extra } = visibleTags(project.stack)

  return (
    <article className="window relative flex h-full flex-col has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-sky-deep">
      <div className="window-bar" aria-hidden="true">
        <span className="window-close" />
        <span className="window-title">{project.slug}</span>
      </div>
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
        <MediaPlaceholder className="aspect-[16/10]" />
      )}
      <div className="flex flex-1 flex-col px-5 pt-4.5 pb-5">
        {/* The ring is drawn on the article, around the whole window. */}
        <h3 className="font-display text-lg font-semibold tracking-[-0.01em]">
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => onOpen(project)}
            className="cursor-pointer text-left after:absolute after:inset-0 focus-visible:outline-none"
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
              <li key={tag} className={TAG_LABEL}>
                {tag}
              </li>
            ))}
            {extra > 0 && <li className={TAG_LABEL}>+{extra}</li>}
          </ul>
        )}
        <p className="mt-auto flex justify-between pt-4 font-mono text-xs text-ink-soft">
          <span>{sourceLabel(project)}</span>
          <span aria-hidden="true" className="font-semibold text-sky-deep">
            open ↗
          </span>
        </p>
      </div>
    </article>
  )
}
