import { Link } from 'react-router-dom'
import { RiArrowLeftLine } from '@remixicon/react'
import { Button } from '../../../components/ui'

interface ProjectDetailBackButtonProps {
  label?: string
  to?: string
}

export function ProjectDetailBackButton({
  label = 'Back to projects',
  to = '/app',
}: ProjectDetailBackButtonProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="-ml-2 mb-2 gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
    >
      <Link to={to}>
        <RiArrowLeftLine className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  )
}
