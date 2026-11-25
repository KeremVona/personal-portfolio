import { useCallback, useEffect, useSyncExternalStore } from 'react'
import {
  THEME_COLOR,
  type Theme,
  initialTheme,
  readSaved,
  save,
} from './themeLogic'

const DARK_QUERY = '(prefers-color-scheme: dark)'
const listeners = new Set<() => void>()

const storage = () => {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const current = (): Theme =>
  document.documentElement.dataset.theme === 'night' ? 'night' : 'day'

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[theme])
  for (const listener of listeners) listener()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * The page's theme: `data-theme` on <html>, set before first paint by index.html.
 * `toggle` switches and remembers the choice; with nothing saved, the page follows
 * the device's setting live. See docs/superpowers/specs/2026-11-25-night-mode-design.md §3.
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const theme = useSyncExternalStore(subscribe, current, () => 'day' as Theme)

  useEffect(() => {
    const query = matchMedia(DARK_QUERY)
    const follow = () => {
      if (readSaved(storage()) === null)
        apply(initialTheme(null, query.matches))
    }
    query.addEventListener('change', follow)
    return () => query.removeEventListener('change', follow)
  }, [])

  const toggle = useCallback(() => {
    const next: Theme = current() === 'night' ? 'day' : 'night'
    save(storage(), next)
    apply(next)
  }, [])

  return { theme, toggle }
}
