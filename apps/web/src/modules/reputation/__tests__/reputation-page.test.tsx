import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { mockApi } from '../../../test/mock-api'
import { renderRoutes } from '../../../test/render-routes'
import { ReputationPage } from '../pages/reputation-page'

const address = '0x1234567890abcdef1234567890abcdef12345678'

const renderCredentials = (target = address) =>
  renderRoutes(
    [{ path: '/app/u/:address', element: <ReputationPage /> }],
    `/app/u/${target}`,
  )

describe('ReputationPage', () => {
  afterEach(cleanup)

  it('shows council membership and reviewer weight for governors', async () => {
    mockApi({
      [`GET /reputation/${address}`]: [
        200,
        { walletAddress: address, eligible: true, weight: '3', factors: null },
      ],
    })
    renderCredentials()

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Reviewer credentials' }),
    ).toBeInTheDocument()
    expect(screen.getByText(address)).toBeInTheDocument()
    expect(screen.getByText('Governor council member')).toBeInTheDocument()
    expect(screen.getByText('Reviewer weight')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('describes non-members neutrally without implying publish rights', async () => {
    mockApi({
      [`GET /reputation/${address}`]: [
        200,
        { walletAddress: address, eligible: false, weight: '0', factors: null },
      ],
    })
    renderCredentials()

    expect(await screen.findByText('Not on the governor council')).toBeInTheDocument()
    expect(screen.queryByText('Reviewer weight')).not.toBeInTheDocument()
    expect(
      screen.getByText(/Only governor council members publish official scores/),
    ).toBeInTheDocument()
  })

  it('explains an invalid address', async () => {
    const fetchMock = mockApi({})
    renderCredentials('not-an-address')

    expect(
      await screen.findByRole('heading', { name: "That isn't a wallet address" }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse projects' })).toHaveAttribute(
      'href',
      '/app',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('offers a retry when credentials fail to load', async () => {
    const user = userEvent.setup()
    let calls = 0
    mockApi({
      [`GET /reputation/${address}`]: () => {
        calls += 1
        return calls === 1
          ? [500, { message: 'boom' }]
          : [200, { walletAddress: address, eligible: true, weight: '1', factors: null }]
      },
    })
    renderCredentials()

    await user.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Governor council member')).toBeInTheDocument()
  })
})
