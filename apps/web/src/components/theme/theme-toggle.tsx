import { RiMoonLine, RiSunLine } from '@remixicon/react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { useTheme } from '../../lib/theme/theme-provider'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('rounded-full', className)}
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <RiSunLine className="h-5 w-5" /> : <RiMoonLine className="h-5 w-5" />}
    </Button>
  )
}
