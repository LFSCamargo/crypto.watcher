export interface RequestFormValues {
  projectName: string
  projectUrl: string
  description: string
}

export type RequestFormErrors = Partial<Record<keyof RequestFormValues, string>>

export const REQUEST_LIMITS = { projectName: 200, description: 5000, descriptionMin: 10 }

const isWebAddress = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

/** Mirrors `CreateAnalysisRequestBodySchema` on the API so errors show before submitting. */
export function validateRequestForm(values: RequestFormValues): RequestFormErrors {
  const errors: RequestFormErrors = {}
  const name = values.projectName.trim()
  const description = values.description.trim()

  if (!name) errors.projectName = 'Enter the project name.'
  else if (name.length > REQUEST_LIMITS.projectName)
    errors.projectName = `Use ${REQUEST_LIMITS.projectName} characters or fewer.`

  if (!isWebAddress(values.projectUrl.trim()))
    errors.projectUrl = 'Enter a full address starting with https://'

  if (description.length < REQUEST_LIMITS.descriptionMin)
    errors.description = 'Describe what to review in at least 10 characters.'
  else if (description.length > REQUEST_LIMITS.description)
    errors.description = 'Use 5,000 characters or fewer.'

  return errors
}
