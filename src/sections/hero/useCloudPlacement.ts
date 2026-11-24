import { type RefObject, useLayoutEffect } from 'react'
import { placeCloud, placeCloudNarrow } from './cloudLogic'

/** The hero's narrow (portrait) layout: keep in step with `narrow` in index.css. */
export const NARROW_QUERY = '(max-aspect-ratio: 6/5)'
const NAV_BOTTOM = 64 // the fixed nav's height (h-16)

/**
 * Places the cloud layer for the hero's current size (see placeCloud): right of the
 * copy on wide screens, under it on narrow ones. Runs before paint and on every
 * resize; the cloud stays invisible until it has been placed once.
 */
export function useCloudPlacement(
  hero: RefObject<HTMLElement | null>,
  copy: RefObject<HTMLElement | null>,
  cloud: RefObject<HTMLImageElement | null>,
) {
  useLayoutEffect(() => {
    const heroEl = hero.current
    const copyEl = copy.current
    const cloudEl = cloud.current
    if (!heroEl || !copyEl || !cloudEl) return
    const narrow = matchMedia(NARROW_QUERY)
    const place = () => {
      const h = heroEl.getBoundingClientRect()
      const c = copyEl.getBoundingClientRect()
      const size = { width: h.width, height: h.height }
      const rect = narrow.matches
        ? placeCloudNarrow(size, { copyBottom: c.bottom - h.top })
        : placeCloud(size, {
            copyRight: c.right - h.left,
            navBottom: NAV_BOTTOM,
          })
      cloudEl.style.left = `${rect.left}px`
      cloudEl.style.top = `${rect.top}px`
      cloudEl.style.width = `${rect.width}px`
      cloudEl.style.visibility = 'visible'
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(heroEl)
    observer.observe(copyEl)
    narrow.addEventListener('change', place)
    return () => {
      observer.disconnect()
      narrow.removeEventListener('change', place)
    }
  }, [hero, copy, cloud])
}
