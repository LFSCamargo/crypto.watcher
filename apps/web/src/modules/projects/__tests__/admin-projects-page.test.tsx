import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { useSession } from '../../../store/session'
import { mockApi } from '../../../test/mock-api'
import { renderRoutes } from '../../../test/render-routes'
import { AdminProjectsPage } from '../pages/admin-projects-page'

const team = { id: 't1', email: 'team@example.com', role: 'team' as const }

const projects = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    slug: 'orbit-bridge',
    name: 'Orbit Bridge',
    chainId: 84532,
    state: 'in_analysis',
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    slug: 'vault-protocol',
    name: 'Vault Protocol',
    chainId: 84532,
    state: 'analyzed',
    createdAt: '2026-10-01T00:00:00.000Z',
  },
]

const renderAdmin = () =>
  renderRoutes([{ path: '/app/admin', element: <AdminProjectsPage /> }], '/app/admin')

describe('AdminProjectsPage', () => {
  afterEach(() => {
    cleanup()
    useSession.setState({ user: undefined })
  })

  it('asks guests to sign in', () => {
    mockApi({})
    renderAdmin()

    expect(
      screen.getByRole('heading', { name: 'Sign in to manage projects' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      expect.stringContaining('next=%2Fapp%2Fadmin'),
    )
  })

  it('shows a forbidden state to members without team access', () => {
    const fetchMock = mockApi({})
    useSession.setState({ user: { ...team, role: 'user' } })
    renderAdmin()

    expect(
      screen.getByRole('heading', { name: 'Team or admin access required' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('form', { name: 'Create a project' }),
    ).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('validates and creates a project', async () => {
    const user = userEvent.setup()
    const created: unknown[] = []
    mockApi({
      'GET /projects': [200, projects],
      'POST /projects': (body) => {
        created.push(body)
        return [201, { ...projects[0], id: 'new', name: 'Nova DEX' }]
      },
    })
    useSession.setState({ user: team })
    renderAdmin()

    const form = screen.getByRole('form', { name: 'Create a project' })
    await user.click(within(form).getByRole('button', { name: 'Create project' }))
    expect(within(form).getByLabelText('Project name')).toHaveAccessibleDescription(
      'Enter the project name.',
    )
    expect(created).toHaveLength(0)

    await user.type(within(form).getByLabelText('Project name'), 'Nova DEX')
    await user.type(within(form).getByLabelText('Description'), 'Order-book DEX')
    await user.click(within(form).getByRole('button', { name: 'Create project' }))

    expect(await within(form).findByRole('status')).toHaveTextContent(
      'Nova DEX was created.',
    )
    expect(created[0]).toEqual({
      name: 'Nova DEX',
      chainId: 84532,
      description: 'Order-book DEX',
    })
    expect(within(form).getByLabelText('Project name')).toHaveValue('')
  })

  it('moves a project to its only allowed next state', async () => {
    const user = userEvent.setup()
    const transitions: unknown[] = []
    mockApi({
      'GET /projects': [200, projects],
      [`POST /projects/${projects[0]!.id}/transition`]: (body) => {
        transitions.push(body)
        return [200, { ...projects[0], state: 'ready' }]
      },
    })
    useSession.setState({ user: team })
    renderAdmin()

    const form = screen.getByRole('form', { name: 'Move a project forward' })
    const select = await within(form).findByLabelText('Project')
    await user.selectOptions(select, projects[0]!.id)

    expect(within(form).getByText('Current: In analysis')).toBeInTheDocument()
    expect(within(form).getByText('Next: Awaiting governor review')).toBeInTheDocument()
    await user.click(
      within(form).getByRole('button', { name: 'Move to Awaiting governor review' }),
    )

    expect(await within(form).findByRole('status')).toHaveTextContent(
      'Orbit Bridge is now Awaiting governor review.',
    )
    expect(transitions[0]).toEqual({ state: 'ready' })
  })

  it('explains that published projects have no next state', async () => {
    const user = userEvent.setup()
    mockApi({ 'GET /projects': [200, projects] })
    useSession.setState({ user: team })
    renderAdmin()

    const form = screen.getByRole('form', { name: 'Move a project forward' })
    await user.selectOptions(
      await within(form).findByLabelText('Project'),
      projects[1]!.id,
    )

    expect(within(form).getByText(/final state/)).toBeInTheDocument()
    expect(
      within(form).queryByRole('button', { name: /Move to/ }),
    ).not.toBeInTheDocument()
  })

  it('reports a server-side permission refusal', async () => {
    const user = userEvent.setup()
    mockApi({
      'GET /projects': [200, projects],
      'POST /projects': [403, { message: 'Team or admin role required' }],
    })
    useSession.setState({ user: team })
    renderAdmin()

    const form = screen.getByRole('form', { name: 'Create a project' })
    await user.type(within(form).getByLabelText('Project name'), 'Nova DEX')
    await user.click(within(form).getByRole('button', { name: 'Create project' }))

    expect(await within(form).findByRole('alert')).toHaveTextContent(
      "Your account doesn't have permission for this action anymore.",
    )
    expect(within(form).getByLabelText('Project name')).toHaveValue('Nova DEX')
  })
})
