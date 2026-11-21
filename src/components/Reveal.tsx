import { m } from 'motion/react'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** Seconds to wait after entering the viewport, for light staggers. */
  delay?: number
  className?: string
}

/**
 * Fades content in and lifts it slightly, once, as it scrolls into view.
 * With reduced motion (MotionConfig reducedMotion="user" in App) only the fade runs.
 * See docs/superpowers/specs/2026-11-20-portfolio-foundation-design.md §5.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </m.div>
  )
}
