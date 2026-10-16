import { Button } from '../../../components/ui'
import { projectCategories, type CuratedProject } from '../lib/curated-projects'

type Category = CuratedProject['category']

const options = [
  { id: undefined, label: 'All' },
  ...Object.entries(projectCategories).map(([id, label]) => ({
    id: id as Category,
    label,
  })),
]

export function CategoryFilter({
  value,
  onChange,
}: {
  value: Category | undefined
  onChange: (value: Category | undefined) => void
}) {
  return (
    <div
      role="group"
      aria-label="Filter reference assessments by category"
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => {
        const pressed = option.id === value
        return (
          <Button
            key={option.label}
            type="button"
            size="sm"
            variant={pressed ? 'default' : 'outline'}
            className="rounded-full"
            aria-pressed={pressed}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
