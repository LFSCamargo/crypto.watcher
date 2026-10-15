import { useRef, useState, type FormEvent } from 'react'
import { Button, FormAlert, FormField } from '../../../components/ui'
import { useCreateProject } from '../hooks/use-create-project'
import { adminErrorMessage } from '../lib/admin-error-message'

const DEFAULT_CHAIN_ID = '84532'

interface CreateErrors {
  name?: string
  chainId?: string
}

export function AdminCreateProjectForm() {
  const [name, setName] = useState('')
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID)
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<CreateErrors>({})
  const [createdName, setCreatedName] = useState<string>()
  const nameRef = useRef<HTMLInputElement>(null)
  const chainRef = useRef<HTMLInputElement>(null)
  const createProject = useCreateProject()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (createProject.isPending) return
    const trimmed = name.trim()
    const nextErrors: CreateErrors = {}
    if (!trimmed) nextErrors.name = 'Enter the project name.'
    else if (trimmed.length > 120) nextErrors.name = 'Use 120 characters or fewer.'
    if (!/^\d+$/.test(chainId.trim()))
      nextErrors.chainId = 'Enter a numeric chain ID, such as 84532.'
    setErrors(nextErrors)
    if (nextErrors.name) return nameRef.current?.focus()
    if (nextErrors.chainId) return chainRef.current?.focus()

    setCreatedName(undefined)
    createProject.mutate(
      {
        name: trimmed,
        chainId: Number(chainId),
        ...(description.trim() ? { description: description.trim() } : {}),
      },
      {
        onSuccess: (project) => {
          setCreatedName(project.name)
          setName('')
          setDescription('')
        },
      },
    )
  }

  return (
    <form
      aria-labelledby="create-project-title"
      noValidate
      onSubmit={handleSubmit}
      className="glass-card-flat space-y-4 rounded-3xl p-6"
    >
      <h2 id="create-project-title" className="text-lg font-semibold">
        Create a project
      </h2>
      <p className="text-sm text-muted-foreground">
        New projects start in analysis. They appear in the catalog under council projects.
      </p>
      {createProject.isError ? (
        <FormAlert>{adminErrorMessage(createProject.error)}</FormAlert>
      ) : null}
      <FormField
        id="admin-project-name"
        label="Project name"
        value={name}
        onChange={setName}
        error={errors.name}
        inputRef={nameRef}
      />
      <FormField
        id="admin-project-chain"
        label="Chain ID"
        type="number"
        value={chainId}
        onChange={setChainId}
        error={errors.chainId}
        hint="84532 is Base Sepolia."
        inputRef={chainRef}
      />
      <FormField
        id="admin-project-description"
        label="Description"
        value={description}
        onChange={setDescription}
        multiline
      />
      {createdName ? (
        <FormAlert tone="success">{createdName} was created.</FormAlert>
      ) : null}
      <Button type="submit" className="rounded-full" disabled={createProject.isPending}>
        {createProject.isPending ? 'Creating…' : 'Create project'}
      </Button>
    </form>
  )
}
