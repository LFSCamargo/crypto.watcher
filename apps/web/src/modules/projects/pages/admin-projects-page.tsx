import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { RiAddLine, RiRefreshLine } from '@remixicon/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import type { ProjectState } from '../../../lib/api/types'
import { useSession } from '../../../store/session'
import { projectsApi } from '../api/projects.api'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from '../../../components/ui'

export function AdminProjectsPage() {
  const user = useSession((state) => state.user)
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [chainId, setChainId] = useState(84532)
  const [description, setDescription] = useState('')
  const [transitionId, setTransitionId] = useState('')
  const [state, setState] = useState<ProjectState>('ready')

  const createProject = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })
  const transitionProject = useMutation({
    mutationFn: () => projectsApi.transition(transitionId, { state }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  if (user?.role !== 'team' && user?.role !== 'admin') {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Team or admin access required.</p>
      </Card>
    )
  }

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    await createProject.mutateAsync({ name, chainId, description })
    setName('')
    setDescription('')
    toast.success('Project created')
  }

  const handleTransition = async (event: FormEvent) => {
    event.preventDefault()
    await transitionProject.mutateAsync()
    setTransitionId('')
    toast.success('Project transitioned')
  }

  return (
    <motion.div
      className="grid gap-6 lg:grid-cols-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiAddLine className="h-5 w-5" />
            Create Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter project name"
                value={name}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Chain ID</label>
              <Input
                onChange={(event) => setChainId(Number(event.target.value))}
                placeholder="Chain ID"
                type="number"
                value={chainId}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Project description"
                value={description}
              />
            </div>
            <Button type="submit" className="w-full gap-2 rounded-full">
              <RiAddLine className="h-4 w-4" />
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiRefreshLine className="h-5 w-5" />
            Transition Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleTransition}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project UUID</label>
              <Input
                onChange={(event) => setTransitionId(event.target.value)}
                placeholder="Enter project UUID"
                value={transitionId}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New State</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onChange={(event) => setState(event.target.value as ProjectState)}
                value={state}
              >
                <option value="ready">Ready</option>
                <option value="voting">Voting</option>
                <option value="closed">Closed</option>
                <option value="analyzed">Analyzed</option>
              </select>
            </div>
            <Button type="submit" className="w-full gap-2 rounded-full" variant="secondary">
              <RiRefreshLine className="h-4 w-4" />
              Transition
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
