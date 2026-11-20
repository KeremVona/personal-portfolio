import { useCallback, useState, type RefCallback } from 'react'
import type { Size } from '../sections/hero/placement'

/** The element's current size in CSS px, kept up to date with a ResizeObserver. */
export function useElementSize<T extends HTMLElement>(): [
  RefCallback<T>,
  Size | null,
] {
  const [size, setSize] = useState<Size | null>(null)

  const ref = useCallback((element: T | null) => {
    if (!element) return
    const update = () => {
      const { width, height } = element.getBoundingClientRect()
      setSize((prev) =>
        prev && prev.width === width && prev.height === height
          ? prev
          : { width, height },
      )
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, size]
}
