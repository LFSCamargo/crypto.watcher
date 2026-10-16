import { cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { CommentThread } from '../components/comment-thread'
import { mockApi } from '../../../test/mock-api'
import { renderRoutes } from '../../../test/render-routes'
import { useSession } from '../../../store/session'

const comment = {
  id: 'c1',
  projectId: 'p1',
  authorId: 'abcdef1234567890',
  body: 'The audit skipped the bridge contracts.',
  createdAt: '2026-10-01T12:00:00.000Z',
}

const renderThread = () =>
  renderRoutes(
    [{ path: '/app/projects/:slug', element: <CommentThread projectId="p1" /> }],
    '/app/projects/aave',
  )

describe('CommentThread', () => {
  afterEach(() => {
    cleanup()
    useSession.setState({ user: undefined })
  })

  it('does not claim a per-comment fee or on-chain transaction', async () => {
    useSession.setState({ user: { id: 'u1', role: 'user' } })
    mockApi({ 'GET /projects/p1/comments': [200, []] })
    renderThread()

    expect(await screen.findByText(/No comments yet/)).toBeInTheDocument()
    expect(
      screen.queryByText(/fee|on-chain transaction|protocol tokens/i),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Post comment' })).toBeDisabled()
  })

  it('links guests to sign in and back to the project', async () => {
    mockApi({ 'GET /projects/p1/comments': [200, [comment]] })
    renderThread()

    expect(await screen.findByText(comment.body)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in to comment' })).toHaveAttribute(
      'href',
      '/auth/signin?next=%2Fapp%2Fprojects%2Faave',
    )
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('keeps the draft and explains a failed post', async () => {
    useSession.setState({ user: { id: 'u1', role: 'user' } })
    mockApi({
      'GET /projects/p1/comments': [200, []],
      'POST /projects/p1/comments': [500, { message: 'boom' }],
    })
    const user = userEvent.setup()
    renderThread()

    const field = screen.getByLabelText('Add a comment')
    await user.type(field, 'Evidence: the multisig is 2-of-3.')
    await user.click(screen.getByRole('button', { name: 'Post comment' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Your comment wasn't posted.",
    )
    expect(field).toHaveValue('Evidence: the multisig is 2-of-3.')
  })

  it('clears the draft after posting', async () => {
    useSession.setState({ user: { id: 'u1', role: 'user' } })
    mockApi({
      'GET /projects/p1/comments': [200, []],
      'POST /projects/p1/comments': [201, comment],
    })
    const user = userEvent.setup()
    renderThread()

    const field = screen.getByLabelText('Add a comment')
    await user.type(field, comment.body)
    await user.click(screen.getByRole('button', { name: 'Post comment' }))

    await waitFor(() => expect(field).toHaveValue(''))
  })
})
