import { useEffect, useState, type KeyboardEvent } from 'react'

export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }

    document.addEventListener('keydown', handleKeyDown as unknown as EventListener)
    return () =>
      document.removeEventListener('keydown', handleKeyDown as unknown as EventListener)
  }, [])

  return { open, setOpen }
}
