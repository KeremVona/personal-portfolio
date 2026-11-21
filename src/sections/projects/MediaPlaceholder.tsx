import type { ProjectTone } from '../../content/types'

const TONES: Record<ProjectTone, string> = {
  parchment: 'bg-linear-135 from-[#e6dcc4] to-[#cbbd96]',
  meadow: 'bg-linear-135 from-[#dfe9cf] to-[#b5cc98]',
  sky: 'bg-linear-135 from-[#dde8f0] to-[#a9c6dc]',
}

/** Stands in for a project's screenshots until Kerem adds them (spec §5). */
export function MediaPlaceholder({
  tone,
  className = '',
}: {
  tone: ProjectTone
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={`grid place-items-center ${TONES[tone]} ${className}`}
    >
      <span className="text-xs tracking-[0.04em] text-ink/50">
        Screenshots coming soon
      </span>
    </div>
  )
}
