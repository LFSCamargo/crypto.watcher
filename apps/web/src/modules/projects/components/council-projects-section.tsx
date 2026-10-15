import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button, Skeleton } from '../../../components/ui'
import { useProjects } from '../hooks/use-projects'
import { ProjectCard } from './project-card'

export function CouncilProjectsSection({ search }: { search: string }) {
  const { data, isLoading, isError, refetch, isFetching } = useProjects()
  const query = search.trim().toLowerCase()

  const projects = useMemo(() => {
    if (!data || !query) return data ?? []
    return data.filter((project) =>
      [project.name, project.slug, project.description ?? ''].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [data, query])

  return (
    <section aria-labelledby="council-projects-title" className="space-y-4">
      <div>
        <h2 id="council-projects-title" className="text-xl font-semibold">
          Council projects
        </h2>
        <p className="text-sm text-muted-foreground">
          Reviewed by the governor council. Only these projects carry an official safety
          score.
        </p>
      </div>

      {isLoading ? (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Loading council projects"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-3xl" />
          ))}
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="glass-card-flat flex flex-col items-start gap-3 p-5 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            <span className="font-semibold">
              Council projects couldn&apos;t be loaded.
            </span>{' '}
            <span className="text-muted-foreground">
              Reference assessments below are still available.
            </span>
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            Try again
          </Button>
        </div>
      ) : projects.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="glass-card-flat p-6 text-sm text-muted-foreground">
          {query ? (
            <p>No council projects match &ldquo;{search.trim()}&rdquo;.</p>
          ) : (
            <>
              <p className="font-medium text-foreground">No council projects yet.</p>
              <p className="mt-1">
                Know a project the council should look at?{' '}
                <Link
                  to="/app/analysis-request"
                  className="font-semibold text-primary-strong underline-offset-4 hover:underline"
                >
                  Request a review
                </Link>
              </p>
            </>
          )}
        </div>
      )}
    </section>
  )
}
