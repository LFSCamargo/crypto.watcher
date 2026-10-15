import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AnalysisRequestPage } from '../pages/analysis-request-page'
import { mockApi } from '../../../test/mock-api'
import { renderRoutes } from '../../../test/render-routes'
import { useSession } from '../../../store/session'

const member = {
  id: 'u1',
  email: 'ada@example.com',
  nickname: 'ada',
  role: 'user' as const,
}

const created = {
  id: 'r9',
  userId: 'u1',
  projectName: 'Orbit Bridge',
  projectUrl: 'https://orbit.example',
  description: 'Cross-chain bridge with a new validator set.',
  status: 'pending',
  paymentTxHash: null,
  feeAmount: '0',
  reviewNotes: null,
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: null,
}

const renderRequest = () =>
  renderRoutes(
    [{ path: '/app/analysis-request', element: <AnalysisRequestPage /> }],
    '/app/analysis-request',
  )

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Project name'), created.projectName)
  await user.type(screen.getByLabelText('Project website'), created.projectUrl)
  await user.type(
    screen.getByLabelText('What should the council look at?'),
    created.description,
  )
}

describe('AnalysisRequestPage', () => {
  afterEach(() => {
    cleanup()
    useSession.setState({ user: undefined })
  })

  it('asks guests to sign in and returns them to the form', () => {
    mockApi({})
    renderRequest()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Request a review' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/free during launch/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in to continue' })).toHaveAttribute(
      'href',
      '/auth/signin?next=%2Fapp%2Fanalysis-request',
    )
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/auth/signup?next=%2Fapp%2Fanalysis-request',
    )
    expect(screen.queryByText(/fee|paid/i)).not.toBeInTheDocument()
  })

  describe('signed in', () => {
    beforeEach(() => useSession.setState({ user: member }))

    it('describes what happens next without fee or payment steps', () => {
      mockApi({ 'GET /analysis-requests/me': [200, { items: [] }] })
      renderRequest()

      const next = screen.getByRole('region', { name: 'What happens next' })
      expect(within(next).getAllByRole('listitem')).toHaveLength(4)
      expect(next).toHaveTextContent(/free during launch/i)
      expect(screen.queryByText(/review fee|Paid review|pay /i)).not.toBeInTheDocument()
    })

    it('validates fields inline before sending anything', async () => {
      const fetchMock = mockApi({ 'GET /analysis-requests/me': [200, { items: [] }] })
      const user = userEvent.setup()
      renderRequest()

      await user.type(screen.getByLabelText('Project website'), 'orbit')
      await user.type(screen.getByLabelText('What should the council look at?'), 'short')
      await user.click(screen.getByRole('button', { name: 'Submit request' }))

      expect(screen.getByLabelText('Project name')).toHaveAccessibleDescription(
        'Enter the project name.',
      )
      expect(screen.getByLabelText('Project website')).toHaveAttribute(
        'aria-invalid',
        'true',
      )
      expect(
        screen.getByText('Enter a full address starting with https://'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Describe what to review in at least 10 characters.'),
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Project name')).toHaveFocus()
      expect(
        fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST'),
      ).toHaveLength(0)
    })

    it('keeps entered data and offers a retry when the server fails', async () => {
      let attempts = 0
      mockApi({
        'GET /analysis-requests/me': [200, { items: [] }],
        'POST /analysis-requests': () => {
          attempts += 1
          return attempts === 1 ? [500, { message: 'boom' }] : [201, created]
        },
      })
      const user = userEvent.setup()
      renderRequest()

      await fillForm(user)
      await user.click(screen.getByRole('button', { name: 'Submit request' }))

      expect(await screen.findByRole('alert')).toHaveTextContent(/went wrong on our side/)
      expect(screen.getByLabelText('Project name')).toHaveValue(created.projectName)
      expect(screen.getByLabelText('Project website')).toHaveValue(created.projectUrl)

      await user.click(screen.getByRole('button', { name: 'Submit request' }))
      expect(
        await screen.findByRole('heading', { name: 'Request received' }),
      ).toBeInTheDocument()
      expect(attempts).toBe(2)
    })

    it('asks to sign in again when the session has expired', async () => {
      mockApi({
        'GET /analysis-requests/me': [200, { items: [] }],
        'POST /analysis-requests': [401, { message: 'Unauthorized' }],
      })
      const user = userEvent.setup()
      renderRequest()

      await fillForm(user)
      await user.click(screen.getByRole('button', { name: 'Submit request' }))

      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent('Your session has expired.')
      expect(within(alert).getByRole('link', { name: 'Sign in again' })).toHaveAttribute(
        'href',
        '/auth/signin?next=%2Fapp%2Fanalysis-request',
      )
    })

    it('sends one request even when submit is clicked repeatedly', async () => {
      let resolve: (() => void) | undefined
      let posts = 0
      const fetchMock = mockApi({ 'GET /analysis-requests/me': [200, { items: [] }] })
      const base = fetchMock.getMockImplementation()!
      fetchMock.mockImplementation(async (input, init) => {
        if (init?.method === 'POST') {
          posts += 1
          await new Promise<void>((done) => (resolve = done))
          return new Response(JSON.stringify(created), { status: 201 })
        }
        return base(input, init)
      })
      const user = userEvent.setup()
      renderRequest()

      await fillForm(user)
      const submit = screen.getByRole('button', { name: 'Submit request' })
      await user.click(submit)
      await user.click(submit)

      expect(screen.getByRole('button', { name: 'Submitting…' })).toBeDisabled()
      expect(posts).toBe(1)
      resolve?.()
      expect(
        await screen.findByRole('heading', { name: 'Request received' }),
      ).toBeInTheDocument()
    })

    it('shows a persistent confirmation with tracking links and the request history', async () => {
      let mine: unknown[] = []
      mockApi({
        'GET /analysis-requests/me': () => [200, { items: mine }],
        'POST /analysis-requests': () => {
          mine = [created]
          return [201, created]
        },
      })
      const user = userEvent.setup()
      renderRequest()

      expect(
        await screen.findByText("You haven't requested a review yet."),
      ).toBeInTheDocument()
      await fillForm(user)
      await user.click(screen.getByRole('button', { name: 'Submit request' }))

      const confirmation = await screen.findByRole('heading', {
        name: 'Request received',
      })
      expect(confirmation).toHaveFocus()
      expect(
        screen.getByText(/Orbit Bridge is in the queue as Received/),
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Open the review queue' })).toHaveAttribute(
        'href',
        '/app/in-analysis',
      )

      const history = screen.getByRole('region', { name: 'Your requests' })
      expect(await within(history).findByText('Orbit Bridge')).toBeInTheDocument()
      expect(within(history).getByText('Received')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Request another review' }))
      expect(screen.getByLabelText('Project name')).toHaveValue('')
      await waitFor(() => expect(screen.getByLabelText('Project name')).toHaveFocus())
    })
  })
})
