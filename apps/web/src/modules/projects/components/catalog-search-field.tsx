import { RiSearchLine } from '@remixicon/react'
import { Input } from '../../../components/ui'

export function CatalogSearchField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div role="search" className="relative">
      <label htmlFor="catalog-search" className="sr-only">
        Search projects
      </label>
      <RiSearchLine
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id="catalog-search"
        type="search"
        className="h-11 rounded-full pl-11"
        placeholder="Search by name, symbol or network"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
