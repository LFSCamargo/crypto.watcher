import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, FormAlert, FormField } from '../../../components/ui'
import type { SessionUser } from '../../../store/session'
import { useAuthLinks } from '../../auth/hooks/use-auth-links'
import { useUpdateProfile } from '../hooks/use-update-profile'
import {
  isProfileSessionExpired,
  profileErrorMessage,
} from '../lib/profile-error-message'
import {
  PROFILE_FIELD_ORDER,
  validateProfileForm,
  type ProfileFormErrors,
  type ProfileFormValues,
} from '../lib/validate-profile-form'
import { ProfileAvatarUpload } from './profile-avatar-upload'

const valuesFrom = (user: SessionUser): ProfileFormValues => ({
  nickname: user.nickname ?? '',
  displayName: user.displayName ?? '',
  xAccount: user.xAccount ?? '',
  bio: user.bio ?? '',
  publicKey: user.publicKey ?? user.walletAddress ?? '',
})

const optional = (value: string) => value.trim() || undefined

export function ProfileSettingsForm({ user }: { user: SessionUser }) {
  const [values, setValues] = useState(() => valuesFrom(user))
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '')
  const [errors, setErrors] = useState<ProfileFormErrors>({})
  const [saved, setSaved] = useState(false)
  const updateProfile = useUpdateProfile()
  const { signInHref } = useAuthLinks()
  const inputRefs = useRef<
    Partial<Record<keyof ProfileFormValues, HTMLInputElement | null>>
  >({})
  const bioRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setValues(valuesFrom(user))
    setAvatarUrl(user.avatarUrl ?? '')
  }, [user])

  const update = (field: keyof ProfileFormValues) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setSaved(false)
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (updateProfile.isPending) return
    const nextErrors = validateProfileForm(values)
    setErrors(nextErrors)
    const firstInvalid = PROFILE_FIELD_ORDER.find((field) => nextErrors[field])
    if (firstInvalid) {
      if (firstInvalid === 'bio') bioRef.current?.focus()
      else inputRefs.current[firstInvalid]?.focus()
      return
    }
    setSaved(false)
    updateProfile.mutate(
      {
        nickname: optional(values.nickname),
        displayName: optional(values.displayName),
        xAccount: optional(values.xAccount),
        bio: values.bio.trim() ? values.bio : undefined,
        publicKey: optional(values.publicKey),
        avatarUrl: avatarUrl.trim() ? avatarUrl : null,
      },
      { onSuccess: () => setSaved(true) },
    )
  }

  const inputRef =
    (field: keyof ProfileFormValues) => (node: HTMLInputElement | null) => {
      inputRefs.current[field] = node
    }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="profile-settings-title"
      className="glass-card-flat space-y-5 rounded-3xl p-6"
    >
      <h2 id="profile-settings-title" className="text-lg font-semibold">
        Profile settings
      </h2>

      {updateProfile.isError ? (
        <FormAlert>
          <p className="font-semibold">Your profile wasn&apos;t saved.</p>
          {isProfileSessionExpired(updateProfile.error) ? (
            <p>
              Your session expired.{' '}
              <Link
                to={signInHref}
                className="font-semibold underline underline-offset-2"
              >
                Sign in again
              </Link>{' '}
              to save these changes.
            </p>
          ) : (
            <p>{profileErrorMessage(updateProfile.error)}</p>
          )}
        </FormAlert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="nickname"
          label="Nickname"
          value={values.nickname}
          onChange={update('nickname')}
          error={errors.nickname}
          hint="2–32 characters. Shown on your comments."
          inputRef={inputRef('nickname')}
          autoComplete="nickname"
        />
        <FormField
          id="displayName"
          label="Display name"
          value={values.displayName}
          onChange={update('displayName')}
          error={errors.displayName}
          inputRef={inputRef('displayName')}
          autoComplete="name"
        />
      </div>

      <ProfileAvatarUpload
        avatarUrl={avatarUrl}
        onAvatarChange={(next) => {
          setAvatarUrl(next)
          setSaved(false)
        }}
        onClear={() => setAvatarUrl('')}
      />

      <FormField
        id="xAccount"
        label="X account"
        value={values.xAccount}
        onChange={update('xAccount')}
        error={errors.xAccount}
        placeholder="@username"
        inputRef={inputRef('xAccount')}
      />
      <FormField
        id="bio"
        label="Bio"
        value={values.bio}
        onChange={update('bio')}
        error={errors.bio}
        multiline
        textareaRef={bioRef}
      />
      <FormField
        id="publicKey"
        label="Public wallet address"
        value={values.publicKey}
        onChange={update('publicKey')}
        error={errors.publicKey}
        placeholder="0x…"
        hint="Optional. Shown on your public profile."
        inputRef={inputRef('publicKey')}
        className="font-mono"
      />

      {saved ? <FormAlert tone="success">Profile saved.</FormAlert> : null}

      <Button type="submit" className="rounded-full" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  )
}
