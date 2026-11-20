import { useCallback, useState, type RefCallback } from 'react'
import type { Size } from '../sections/hero/placement'

/**
 * The element's current size in CSS px, kept up to date with a ResizeObserver.
 * `initial` lets the first render start from a good guess instead of waiting a frame.
 */
export function useElementSize<T extends HTMLElement>(
  initial?: () => Size,
): [RefCallback<T>, Size | null] {
  const [size, setSize] = useState<Size | null>(() => initial?.() ?? null)

  const ref = useCallback((element: T | null) => {
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0]
      const width = box ? box.inlineSize : entry.contentRect.width
      const height = box ? box.blockSize : entry.contentRect.height
      setSize((prev) =>
        prev && prev.width === width && prev.height === height
          ? prev
          : { width, height },
      )
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, size]
}
