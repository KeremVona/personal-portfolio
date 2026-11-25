import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../theme/useTheme'

/** Day/night switch: a moon by day, a sun at night. */
export function ThemeToggle({ onSky }: { onSky: boolean }) {
  const { theme, toggle } = useTheme()
  const night = theme === 'night'
  const Icon = night ? Sun : Moon
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={night ? 'Switch to day' : 'Switch to night'}
      className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-full border ${
        onSky
          ? 'border-cream/70 hover:bg-cream/15'
          : 'night:border-night-line/50 border-ink/20 bg-white/55 hover:bg-white night:bg-transparent night:hover:bg-cream/10'
      }`}
    >
      <Icon aria-hidden="true" className="size-4" />
    </button>
  )
}
