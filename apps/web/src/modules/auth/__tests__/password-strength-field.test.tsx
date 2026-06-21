import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordStrengthField } from '../components/password-strength-field'

function StatefulPasswordField() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <PasswordStrengthField
      password={password}
      confirmPassword={confirmPassword}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
    />
  )
}

describe('PasswordStrengthField', () => {
  it('shows guidance before the user types a password', () => {
    render(<StatefulPasswordField />)

    expect(
      screen.getByText(/Use at least 8 characters with upper and lower case/i),
    ).toBeInTheDocument()
  })

  it('surfaces weak-password suggestions after input', async () => {
    const user = userEvent.setup()
    render(<StatefulPasswordField />)

    await user.type(screen.getByLabelText(/^Password$/i), 'abc')

    expect(screen.getByText(/Use at least 8 characters/i)).toBeInTheDocument()
    expect(screen.getByText('Weak')).toBeInTheDocument()
  })

  it('labels a strong password and validates confirmation', async () => {
    const user = userEvent.setup()
    render(<StatefulPasswordField />)

    await user.type(screen.getByLabelText(/^Password$/i), 'MySecurePass123!')
    await user.type(screen.getByLabelText(/Confirm password/i), 'MySecurePass123!')

    expect(screen.getByText('Strong')).toBeInTheDocument()
    expect(screen.getByText('Passwords match')).toBeInTheDocument()

    await user.clear(screen.getByLabelText(/Confirm password/i))
    await user.type(screen.getByLabelText(/Confirm password/i), 'different')

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })
})
