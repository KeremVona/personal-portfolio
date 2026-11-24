import type { SectionId } from '../content/types'

interface SectionHeadingProps {
  id: SectionId
  /** Small uppercase label above the title, usually the section's nav label. */
  eyebrow: string
  title: string
  /** 'dark' for sections on a deep background (the footer's sky): a cream eyebrow. */
  tone?: 'light' | 'dark'
  /** Replaces the default title size, e.g. for the footer's larger heading. */
  titleClassName?: string
}

/** Eyebrow + h2. The h2's id is what the section's aria-labelledby points at. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  tone = 'light',
  titleClassName = 'text-3xl sm:text-4xl',
}: SectionHeadingProps) {
  return (
    <div>
      <p
        className={`mb-2.5 font-display text-[13px] font-semibold tracking-[0.08em] uppercase ${
          tone === 'dark' ? 'text-cream' : 'text-sky-deep'
        }`}
      >
        {eyebrow}
      </p>
      <h2
        id={`${id}-title`}
        className={`font-display font-semibold tracking-[-0.03em] ${titleClassName}`}
      >
        {title}
      </h2>
    </div>
  )
}
