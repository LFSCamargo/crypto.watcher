import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProfileAvatarUpload } from '../components/profile-avatar-upload'

vi.mock('../hooks/use-compress-avatar', () => ({
  useCompressAvatar: () => ({
    isCompressing: false,
    compressFile: vi.fn().mockResolvedValue({
      dataUrl: 'data:image/jpeg;base64,compressed',
      width: 256,
      height: 256,
      byteLength: 1200,
    }),
  }),
}))

describe('ProfileAvatarUpload', () => {
  it('compresses a selected file and returns a data URL', async () => {
    const user = userEvent.setup()
    const onAvatarChange = vi.fn()

    render(<ProfileAvatarUpload avatarUrl="" onAvatarChange={onAvatarChange} />)

    const file = new File(['fake-image'], 'avatar.png', { type: 'image/png' })
    const input = screen.getByLabelText(/profile picture/i)

    await user.upload(input, file)

    await waitFor(() => {
      expect(onAvatarChange).toHaveBeenCalledWith('data:image/jpeg;base64,compressed')
    })
  })

  it('clears the avatar when Remove is clicked', async () => {
    const user = userEvent.setup()
    const onAvatarChange = vi.fn()
    const onClear = vi.fn()

    render(
      <ProfileAvatarUpload
        avatarUrl="data:image/png;base64,abc"
        onAvatarChange={onAvatarChange}
        onClear={onClear}
      />,
    )

    await user.click(screen.getByRole('button', { name: /remove/i }))

    expect(onAvatarChange).toHaveBeenCalledWith('')
    expect(onClear).toHaveBeenCalled()
  })
})
