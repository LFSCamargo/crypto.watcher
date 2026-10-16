import { useEffect, useState, type RefObject } from 'react'

export interface PageHeading {
  id: string
  label: string
}

const sameHeadings = (a: PageHeading[], b: PageHeading[]) =>
  a.length === b.length &&
  a.every(
    (heading, index) => heading.id === b[index]?.id && heading.label === b[index]?.label,
  )

const readHeadings = (root: HTMLElement): PageHeading[] =>
  Array.from(root.querySelectorAll<HTMLHeadingElement>('h2[id]')).map((heading) => ({
    id: heading.id,
    label: heading.dataset.label ?? heading.textContent?.trim() ?? '',
  }))

/** Tracks the section headings rendered inside `ref`, including lazily loaded content. */
export function usePageHeadings(ref: RefObject<HTMLElement>, pageKey: string) {
  const [headings, setHeadings] = useState<PageHeading[]>([])

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const sync = () => {
      const next = readHeadings(root)
      setHeadings((current) => (sameHeadings(current, next) ? current : next))
    }
    sync()

    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [ref, pageKey])

  return headings
}
