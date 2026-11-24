import { useImperativeHandle, useRef, useState, type Ref } from 'react'
import { flushSync } from 'react-dom'
import { TAG_LABEL } from '../../components/labelStyle'
import type { ProjectItem, ProjectMedia } from '../../content/types'
import { largest, srcSet } from './art'
import { MediaPlaceholder } from './MediaPlaceholder'
import { projectLinks } from './projectLogic'

export interface ProjectPanelHandle {
  open: (project: ProjectItem) => void
}

const LABEL =
  'font-display text-xs font-semibold tracking-[0.08em] text-sky-deep uppercase'
const MEDIA_SIZES = '(min-width: 768px) 460px, 100vw'

/**
 * One native <dialog> for every project: a side panel on wide screens, a bottom
 * sheet on phones (styles in index.css). showModal() gives the focus trap, Escape
 * and focus return to the card that opened it.
 */
export function ProjectPanel({ ref }: { ref: Ref<ProjectPanelHandle> }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Where the last press started: a text selection dragged out of the panel ends
  // with a click on the dialog itself, which must not count as a backdrop click.
  const pressedOnBackdrop = useRef(false)
  // Kept after closing, so the closing slide still shows the content.
  const [project, setProject] = useState<ProjectItem | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      open(next) {
        const dialog = dialogRef.current
        if (!dialog) return
        // Render the new project before the dialog appears, so it never shows the old one.
        flushSync(() => setProject(next))
        dialog.showModal()
        dialog.scrollTop = 0
      },
    }),
    [],
  )

  const close = () => dialogRef.current?.close()

  return (
    <dialog
      ref={dialogRef}
      className="project-panel"
      aria-labelledby="project-panel-title"
      // The content fills the dialog, so a press and click on the dialog itself
      // are on the backdrop.
      onPointerDown={(event) => {
        pressedOnBackdrop.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        if (pressedOnBackdrop.current && event.target === event.currentTarget)
          close()
      }}
    >
      {project && (
        <PanelContent key={project.slug} project={project} onClose={close} />
      )}
    </dialog>
  )
}

function PanelContent({
  project,
  onClose,
}: {
  project: ProjectItem
  onClose: () => void
}) {
  const links = projectLinks(project)

  return (
    <div className="flex min-h-full flex-col">
      {/* Sticky, so the close box stays in reach after scrolling a long phone sheet. */}
      <div className="window-bar sticky top-0 z-10 h-9!">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-ml-1.5 grid size-10 cursor-pointer place-items-center"
        >
          <span className="window-close" />
        </button>
        <span aria-hidden="true" className="window-title">
          {project.slug}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-6 pt-2 pb-8 sm:px-8 sm:pb-10">
        <h2
          id="project-panel-title"
          className="mt-6 font-display text-[1.65rem] leading-tight font-semibold tracking-[-0.025em]"
        >
          {project.name}
        </h2>
        <p className="mt-3 leading-relaxed text-ink-soft">
          {project.description}
        </p>

        <Gallery project={project} />

        <h3 className={`mt-7 ${LABEL}`}>What I built</h3>
        <ul className="mt-2.5 list-disc space-y-2 pl-5 text-[0.9rem] leading-relaxed text-ink-soft marker:text-sky">
          {project.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>

        {project.stack.length > 0 && (
          <>
            <h3 className={`mt-7 ${LABEL}`}>Built with</h3>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {project.stack.map((tag) => (
                <li key={tag} className={TAG_LABEL}>
                  {tag}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={
                link.primary
                  ? 'bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-ink-soft'
                  : 'border-2 border-ink px-5 py-2.5 text-sm font-medium text-ink hover:bg-white/70'
              }
            >
              {link.label}
            </a>
          ))}
          {!project.repoUrl && (
            <span className="text-sm text-ink-soft">Closed source</span>
          )}
        </div>
      </div>
    </div>
  )
}

function Gallery({ project }: { project: ProjectItem }) {
  const [index, setIndex] = useState(0)
  const { media } = project
  const current = media[index]

  return (
    <div className="mt-6">
      {current ? (
        <MediaItem item={current} />
      ) : (
        <MediaPlaceholder className="aspect-video border-2 border-ink" />
      )}
      {media.length > 1 && (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {media.map((item, i) => (
            <button
              key={item.kind === 'image' ? item.variants[0].src : item.src}
              type="button"
              aria-label={`Show ${item.alt}`}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
              className="cursor-pointer overflow-hidden ring-sky-deep ring-offset-2 aria-pressed:ring-2"
            >
              <img
                src={item.kind === 'image' ? item.variants[0].src : item.poster}
                alt=""
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MediaItem({ item }: { item: ProjectMedia }) {
  if (item.kind === 'video') {
    return (
      <video
        controls
        muted
        preload="none"
        poster={item.poster}
        aria-label={item.alt}
        className="aspect-video w-full border-2 border-ink bg-ink"
      >
        <source src={item.src} type="video/mp4" />
      </video>
    )
  }
  const big = largest(item.variants)
  return (
    <img
      src={big.src}
      srcSet={srcSet(item.variants)}
      sizes={MEDIA_SIZES}
      width={big.width}
      height={big.height}
      alt={item.alt}
      loading="lazy"
      decoding="async"
      className="aspect-video w-full border-2 border-ink object-cover"
    />
  )
}
