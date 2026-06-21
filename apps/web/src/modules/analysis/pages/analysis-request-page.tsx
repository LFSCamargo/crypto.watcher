import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { RiAddLine, RiShieldCheckLine } from '@remixicon/react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useSession } from '../../../store/session'
import { analysisRequestsApi } from '../api/analysis-requests.api'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '../../../components/ui'

export function AnalysisRequestPage() {
  const user = useSession((state) => state.user)
  const [projectName, setProjectName] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [description, setDescription] = useState('')

  const createRequest = useMutation({
    mutationFn: analysisRequestsApi.create,
    onSuccess: () => {
      toast.success('Review request submitted!')
      setProjectName('')
      setProjectUrl('')
      setDescription('')
    },
    onError: () => toast.error('Could not submit request'),
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    createRequest.mutate({ projectName, projectUrl, description })
  }

  if (!user) {
    return (
      <Card className="mx-auto max-w-lg rounded-2xl p-8 text-center">
        <RiShieldCheckLine className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="heading-3 mb-2">Request a project review</h1>
        <p className="mb-6 text-muted-foreground">
          Sign in to pay the review fee and submit your project to the governor council queue.
        </p>
        <Button asChild className="rounded-full">
          <Link to="/auth/signin">Sign in to continue</Link>
        </Button>
      </Card>
    )
  }

  return (
    <motion.section
      className="mx-auto max-w-2xl space-y-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <Badge variant="secondary" className="mb-3">
          Paid review
        </Badge>
        <h1 className="heading-2 mb-2">Request Analysis</h1>
        <p className="body-large">
          Ask our expert governor council to review a DApp or crypto project. After
          submission, pay the review fee to enter the investigation queue.
        </p>
      </div>

      <Card className="rounded-2xl border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-6">
          <RiAddLine className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-semibold">How it works</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-muted-foreground">
              <li>Submit your project details below</li>
              <li>Pay the review fee (funds the protocol treasury and expert work)</li>
              <li>Governors investigate and publish a structured report</li>
              <li>Official safety score appears in the Safe Projects catalog</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Project details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectUrl">Project URL</Label>
              <Input
                id="projectUrl"
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://..."
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">What should we review?</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minLength={10}
                required
                className="min-h-[120px] rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={createRequest.isPending}
            >
              {createRequest.isPending ? 'Submitting...' : 'Submit review request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.section>
  )
}
