import { RiCheckLine, RiCloseLine } from '@remixicon/react'
import { cn } from '../../../lib/utils'
import { Input, Label } from '../../../components/ui'
import {
  analyzePasswordStrength,
  passwordsMatch,
  type PasswordStrengthLevel,
} from '../lib/password-strength'

const levelStyles: Record<
  Exclude<PasswordStrengthLevel, 'empty'>,
  { bar: string; label: string; text: string }
> = {
  weak: {
    bar: 'bg-destructive',
    label: 'Weak',
    text: 'text-destructive',
  },
  fair: {
    bar: 'bg-warning',
    label: 'Fair',
    text: 'text-warning',
  },
  good: {
    bar: 'bg-primary',
    label: 'Good',
    text: 'text-primary',
  },
  strong: {
    bar: 'bg-success',
    label: 'Strong',
    text: 'text-success',
  },
}

interface PasswordStrengthFieldProps {
  password: string
  confirmPassword: string
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  passwordId?: string
  confirmId?: string
}

export function PasswordStrengthField({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  passwordId = 'password',
  confirmId = 'confirm-password',
}: PasswordStrengthFieldProps) {
  const strength = analyzePasswordStrength(password)
  const matched = passwordsMatch(password, confirmPassword)
  const activeStyle =
    strength.level === 'empty' ? null : levelStyles[strength.level]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={passwordId}>Password</Label>
        <Input
          id={passwordId}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          minLength={8}
          required
        />

        {password.length > 0 ? (
          <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-1 gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={cn(
                      'h-1.5 flex-1 rounded-full bg-muted transition-colors',
                      activeStyle && index < strength.score && activeStyle.bar,
                    )}
                  />
                ))}
              </div>
              {activeStyle ? (
                <span className={cn('text-xs font-semibold', activeStyle.text)}>
                  {activeStyle.label}
                </span>
              ) : null}
            </div>

            <ul className="space-y-1.5">
              {strength.suggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Use at least 8 characters with upper and lower case, a number, and a symbol.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={confirmId}>Confirm password</Label>
        <Input
          id={confirmId}
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
          minLength={8}
          required
        />
        {confirmPassword.length > 0 ? (
          <p
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium',
              matched ? 'text-success' : 'text-destructive',
            )}
          >
            {matched ? (
              <>
                <RiCheckLine className="h-3.5 w-3.5" />
                Passwords match
              </>
            ) : (
              <>
                <RiCloseLine className="h-3.5 w-3.5" />
                Passwords do not match
              </>
            )}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export { analyzePasswordStrength, passwordsMatch }
