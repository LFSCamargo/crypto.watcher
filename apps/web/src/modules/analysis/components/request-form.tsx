import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, FormAlert, FormField } from '../../../components/ui'
import type { AnalysisRequest } from '../api/analysis-requests.api'
import { useCreateAnalysisRequest } from '../hooks/use-create-analysis-request'
import { isSessionExpired, requestErrorMessage } from '../lib/request-error-message'
import {
  REQUEST_LIMITS,
  validateRequestForm,
  type RequestFormErrors,
  type RequestFormValues,
} from '../lib/validate-request-form'

const EMPTY: RequestFormValues = { projectName: '', projectUrl: '', description: '' }
const FIELD_ORDER: (keyof RequestFormValues)[] = [
  'projectName',
  'projectUrl',
  'description',
]

export function RequestForm({
  signInHref,
  focusOnMount = false,
  onCreated,
}: {
  signInHref: string
  focusOnMount?: boolean
  onCreated: (request: AnalysisRequest) => void
}) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState<RequestFormErrors>({})
  const create = useCreateAnalysisRequest()
  const nameRef = useRef<HTMLInputElement>(null)
  const urlRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (focusOnMount) nameRef.current?.focus()
  }, [focusOnMount])

  const setField = (field: keyof RequestFormValues) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (create.isPending) return
    const nextErrors = validateRequestForm(values)
    setErrors(nextErrors)
    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field])
    if (firstInvalid) {
      const refs = {
        projectName: nameRef,
        projectUrl: urlRef,
        description: descriptionRef,
      }
      refs[firstInvalid].current?.focus()
      return
    }
    create.mutate(
      {
        projectName: values.projectName.trim(),
        projectUrl: values.projectUrl.trim(),
        description: values.description.trim(),
      },
      { onSuccess: onCreated },
    )
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-6"
      aria-busy={create.isPending}
    >
      {create.isError ? (
        <FormAlert>
          {isSessionExpired(create.error) ? (
            <p>
              Your session has expired.{' '}
              <Link
                to={signInHref}
                className="font-semibold underline underline-offset-4"
              >
                Sign in again
              </Link>{' '}
              — your details stay on this page.
            </p>
          ) : (
            <p>{requestErrorMessage(create.error)}</p>
          )}
        </FormAlert>
      ) : null}

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold">About the project</legend>
        <FormField
          id="projectName"
          label="Project name"
          value={values.projectName}
          onChange={setField('projectName')}
          error={errors.projectName}
          inputRef={nameRef}
        />
        <FormField
          id="projectUrl"
          label="Project website"
          type="url"
          placeholder="https://"
          value={values.projectUrl}
          onChange={setField('projectUrl')}
          error={errors.projectUrl}
          hint="Official site, docs or repository."
          inputRef={urlRef}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold">What to review</legend>
        <FormField
          id="description"
          label="What should the council look at?"
          multiline
          value={values.description}
          onChange={setField('description')}
          error={errors.description}
          hint={`Contracts, audits, team or concerns worth checking. ${values.description.length.toLocaleString('en')} / ${REQUEST_LIMITS.description.toLocaleString('en')} characters.`}
          textareaRef={descriptionRef}
        />
      </fieldset>

      <Button type="submit" className="w-full rounded-full" disabled={create.isPending}>
        {create.isPending ? 'Submitting…' : 'Submit request'}
      </Button>
    </form>
  )
}
