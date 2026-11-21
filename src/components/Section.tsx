import type { ReactNode } from 'react'
import type { SectionId } from '../content/types'

interface SectionProps {
  id: SectionId
  /**
   * A heading rendered above the content (usually a SectionHeading). Omit it when
   * the section places its own SectionHeading inside its layout.
   */
  heading?: ReactNode
  children?: ReactNode
}

export function Section({ id, heading, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {heading}
        {children && <div className={heading ? 'mt-6' : ''}>{children}</div>}
      </div>
    </section>
  )
}
