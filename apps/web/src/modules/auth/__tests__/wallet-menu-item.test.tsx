import type { ReactNode } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import WalletMenuItem from '../components/wallet-menu-item'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../../../components/ui'
import { mockApi } from '../../../test/mock-api'
import { renderWithProviders } from '../../../test/render'

const ADDRESS = '0x1111111111111111111111111111111111111111'
const signMessageAsync = vi.fn()
const toast = vi.hoisted(() => ({
  loading: vi.fn(() => 'pending'),
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('sonner', () => ({ toast }))
vi.mock('../../../lib/web3/web3-providers', () => ({
  Web3Providers: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('wagmi', () => ({
  useAccount: () => ({ address: ADDRESS, isConnected: true }),
  useSignMessage: () => ({ signMessageAsync }),
}))
vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: {
    Custom: ({ children }: { children: (props: object) => ReactNode }) =>
      children({
        openConnectModal: vi.fn(),
        openAccountModal: vi.fn(),
        account: { address: ADDRESS },
        mounted: true,
      }),
  },
}))

function renderItem() {
  renderWithProviders(
    <DropdownMenu open>
      <DropdownMenuTrigger>Account</DropdownMenuTrigger>
      <DropdownMenuContent>
        <WalletMenuItem walletLinked={false} />
      </DropdownMenuContent>
    </DropdownMenu>,
  )
}

describe('WalletMenuItem', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('explains that signing sends no transaction, and reports a rejected signature', async () => {
    mockApi({ 'POST /auth/nonce': [200, { message: 'Sign in to Crypto Watcher' }] })
    signMessageAsync.mockRejectedValue(
      Object.assign(new Error('User rejected the request.'), {
        name: 'UserRejectedRequestError',
      }),
    )
    renderItem()
    await userEvent
      .setup()
      .click(screen.getByRole('menuitem', { name: /Link this wallet/ }))
    expect(toast.loading).toHaveBeenCalledWith(
      expect.stringMatching(/sends no transaction/),
    )
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Signature request cancelled — nothing was linked.',
        {
          id: 'pending',
        },
      ),
    )
  })

  it('reports a wallet already linked to another account', async () => {
    mockApi({
      'POST /auth/nonce': [200, { message: 'Sign in to Crypto Watcher' }],
      'POST /auth/verify': [409, { message: 'Wallet already linked' }],
    })
    signMessageAsync.mockResolvedValue('0xsignature')
    renderItem()
    await userEvent
      .setup()
      .click(screen.getByRole('menuitem', { name: /Link this wallet/ }))
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'This wallet is already linked to another account.',
        { id: 'pending' },
      ),
    )
  })
})
