import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../../../store/session'
import { useAuthLinks } from '../../auth/hooks/use-auth-links'
import { Button } from '../../../components/ui'
import type { AnalysisRequest } from '../api/analysis-requests.api'
import { MyRequestsSection } from '../components/my-requests-section'
import { RequestForm } from '../components/request-form'
import { RequestSuccessPanel } from '../components/request-success-panel'
import { WhatHappensNext } from '../components/what-happens-next'

export function AnalysisRequestPage() {
  const user = useSession((state) => state.user)
  const { signInHref, signUpHref } = useAuthLinks()
  const [created, setCreated] = useState<AnalysisRequest>()
  const [formKey, setFormKey] = useState(0)

  if (!user) {
    return (
      <section className="glass-panel mx-auto max-w-lg space-y-4 rounded-3xl p-8 text-center">
        <h1 className="heading-3">Request a review</h1>
        <p className="text-muted-foreground">
          Ask the governor council to review a crypto project. Requests are free during
          launch — sign in so you can follow your request.
        </p>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild className="rounded-full">
            <Link to={signInHref}>Sign in to continue</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to={signUpHref}>Create an account</Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="max-w-2xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-strong">
          Review request
        </p>
        <h1 className="heading-2">Request a review</h1>
        <p className="body-large">
          Point the governor council at a project you want assessed. Tell us where to look
          and why.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="Request form" className="glass-panel rounded-3xl p-6 sm:p-8">
          {created ? (
            <RequestSuccessPanel
              request={created}
              onRequestAnother={() => {
                setCreated(undefined)
                setFormKey((key) => key + 1)
              }}
            />
          ) : (
            <RequestForm
              key={formKey}
              signInHref={signInHref}
              focusOnMount={formKey > 0}
              onCreated={setCreated}
            />
          )}
        </section>
        <aside className="space-y-4">
          <WhatHappensNext />
          <MyRequestsSection />
        </aside>
      </div>
    </div>
  )
}
