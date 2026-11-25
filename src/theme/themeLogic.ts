export type Theme = 'day' | 'night'

/** The localStorage key. index.html's inline script uses the same one. */
export const THEME_KEY = 'theme'

/** A valid saved choice wins; otherwise the device setting decides. */
export function initialTheme(
  saved: string | null,
  prefersDark: boolean,
): Theme {
  if (saved === 'day' || saved === 'night') return saved
  return prefersDark ? 'night' : 'day'
}

/** The saved choice, or null when there is none or storage is blocked. */
export function readSaved(
  storage: Pick<Storage, 'getItem'> | null,
): string | null {
  try {
    return storage?.getItem(THEME_KEY) ?? null
  } catch {
    return null
  }
}

/** Saves the choice; silently does nothing when storage is blocked. */
export function save(
  storage: Pick<Storage, 'setItem'> | null,
  theme: Theme,
): void {
  try {
    storage?.setItem(THEME_KEY, theme)
  } catch {
    // Private mode or blocked storage: the choice lasts for this visit only.
  }
}

/** <meta name="theme-color"> for each theme. */
export const THEME_COLOR: Record<Theme, string> = {
  day: '#FBF7EE',
  night: '#081224',
}
