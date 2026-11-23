import type { ReactNode, Ref } from 'react'
import type { SectionId } from '../content/types'

interface SectionProps {
  id: SectionId
  /**
   * A heading rendered above the content (usually a SectionHeading). Omit it when
   * the section places its own SectionHeading inside its layout.
   */
  heading?: ReactNode
  children?: ReactNode
  /** Extra classes for the <section> itself. */
  className?: string
  /** Rendered inside the section but outside the centred container, e.g. corner art. */
  decoration?: ReactNode
  ref?: Ref<HTMLElement>
}

export function Section({
  id,
  heading,
  children,
  className = '',
  decoration,
  ref,
}: SectionProps) {
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={`${id}-title`}
      className={`scroll-mt-24 py-16 sm:py-24 ${className}`}
    >
      {decoration}
      {/* Positioned when there's decoration, so the content paints above it. */}
      <div
        className={`mx-auto max-w-6xl px-4 sm:px-6 ${decoration ? 'relative' : ''}`}
      >
        {heading}
        {children && <div className={heading ? 'mt-6' : ''}>{children}</div>}
      </div>
    </section>
  )
}
