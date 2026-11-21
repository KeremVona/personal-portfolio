import type { SectionId } from '../content/types'

interface SectionHeadingProps {
  id: SectionId
  /** Small uppercase label above the title, usually the section's nav label. */
  eyebrow: string
  title: string
}

/** Eyebrow + h2. The h2's id is what the section's aria-labelledby points at. */
export function SectionHeading({ id, eyebrow, title }: SectionHeadingProps) {
  return (
    <div>
      <p className="mb-2.5 font-display text-[13px] font-semibold tracking-[0.08em] text-meadow-deep uppercase">
        {eyebrow}
      </p>
      <h2
        id={`${id}-title`}
        className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
      >
        {title}
      </h2>
    </div>
  )
}
