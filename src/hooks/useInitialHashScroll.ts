import { useEffect } from 'react'

/**
 * Deep links like /#projects: the browser looks for the target before React has
 * rendered it, so it stays at the top. Scroll there once the page exists.
 */
export function useInitialHashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])
}
