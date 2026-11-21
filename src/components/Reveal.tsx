import { useEffect, useRef, useState, type ReactNode } from 'react'
import { anyIntersecting } from './revealLogic'

interface RevealProps {
  children: ReactNode
  /** Seconds to wait after entering the viewport, for light staggers. */
  delay?: number
  className?: string
}

/**
 * Fades content in and lifts it 20px, once, as it scrolls into view.
 * Reduced motion keeps only the fade.
 * See docs/superpowers/specs/2026-11-20-portfolio-foundation-design.md §5.
 */
export function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  // Without IntersectionObserver there is nothing to wait for: show straight away.
  const [shown, setShown] = useState(() => !('IntersectionObserver' in window))

  useEffect(() => {
    const element = ref.current
    if (!element || shown) return
    // Fires once the top of the element is in the lower 85% of the viewport,
    // so tall content reveals too.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!anyIntersecting(entries)) return
        setShown(true)
        observer.disconnect()
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [shown])

  return (
    <div
      ref={ref}
      data-reveal={shown ? 'shown' : 'hidden'}
      className={`${className} transition-[opacity,translate] duration-[600ms] ease-out motion-reduce:translate-y-0 ${shown ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
      style={shown && delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
