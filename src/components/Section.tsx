import type { ReactNode } from 'react'
import type { SectionId } from '../content/types'

interface SectionProps {
  id: SectionId
  title: string
  children?: ReactNode
}

export function Section({ id, title, children }: SectionProps) {
  const titleId = `${id}-title`

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="scroll-mt-24 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          id={titleId}
          className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
        >
          {title}
        </h2>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  )
}
