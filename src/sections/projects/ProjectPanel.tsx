import { X } from 'lucide-react'
import { useImperativeHandle, useRef, useState, type Ref } from 'react'
import { flushSync } from 'react-dom'
import type { ProjectItem, ProjectMedia } from '../../content/types'
import { BOUQUET_RIGHT, largest, srcSet } from './art'
import { MediaPlaceholder } from './MediaPlaceholder'
import { projectLinks } from './projectLogic'

export interface ProjectPanelHandle {
  open: (project: ProjectItem) => void
}

const LABEL =
  'font-display text-xs font-semibold tracking-[0.08em] text-meadow-deep uppercase'
const MEDIA_SIZES = '(min-width: 768px) 460px, 100vw'

/**
 * One native <dialog> for every project: a side panel on wide screens, a bottom
 * sheet on phones (styles in index.css). showModal() gives the focus trap, Escape
 * and focus return to the card that opened it.
 */
export function ProjectPanel({ ref }: { ref: Ref<ProjectPanelHandle> }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
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
      // The content fills the dialog, so a click on the dialog itself is the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
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
    <div className="relative flex min-h-full flex-col px-6 pt-6 sm:px-8 sm:pt-8">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 grid size-10 cursor-pointer place-items-center rounded-full border border-ink/18 bg-white/70 text-ink hover:bg-white"
      >
        <X aria-hidden="true" size={18} />
      </button>

      <h2
        id="project-panel-title"
        className="mt-10 pr-8 font-display text-[1.65rem] leading-tight font-semibold tracking-[-0.025em]"
      >
        {project.name}
      </h2>
      <p className="mt-3 leading-relaxed text-ink-soft">
        {project.description}
      </p>

      <Gallery project={project} />

      <h3 className={`mt-7 ${LABEL}`}>What I built</h3>
      <ul className="mt-2.5 list-disc space-y-2 pl-5 text-[0.9rem] leading-relaxed text-ink-soft marker:text-meadow">
        {project.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>

      {project.stack.length > 0 && (
        <>
          <h3 className={`mt-7 ${LABEL}`}>Built with</h3>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {project.stack.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-meadow-tint px-2.5 py-1 text-xs text-meadow-deep"
              >
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
                ? 'rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-ink-soft'
                : 'rounded-full border border-ink/22 px-5 py-2.5 text-sm font-medium text-ink hover:bg-white/70'
            }
          >
            {link.label}
          </a>
        ))}
        {!project.repoUrl && (
          <span className="text-sm text-ink/60">Closed source</span>
        )}
      </div>

      <img
        src={largest(BOUQUET_RIGHT).src}
        srcSet={srcSet(BOUQUET_RIGHT)}
        sizes="240px"
        width={largest(BOUQUET_RIGHT).width}
        height={largest(BOUQUET_RIGHT).height}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none mt-auto -mr-6 ml-auto block h-auto w-[46%] pt-8 select-none sm:-mr-8"
      />
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
        <MediaPlaceholder
          tone={project.tone}
          className="aspect-video rounded-[10px]"
        />
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
              className="cursor-pointer overflow-hidden rounded-md ring-meadow-deep aria-pressed:ring-2"
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
        className="aspect-video w-full rounded-[10px] bg-ink"
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
      className="aspect-video w-full rounded-[10px] object-cover"
    />
  )
}
