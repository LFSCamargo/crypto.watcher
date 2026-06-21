import { RiMoonLine, RiSunLine } from '@remixicon/react'
import { Button } from '../ui'
import { useTheme } from '../../lib/theme/theme-provider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="rounded-full"
    >
      {theme === 'light' ? <RiMoonLine size={18} /> : <RiSunLine size={18} />}
    </Button>
  )
}
