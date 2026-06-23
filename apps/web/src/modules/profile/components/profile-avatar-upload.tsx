import { useRef, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { Button, Input, Label } from '../../../components/ui'
import { useCompressAvatar } from '../hooks/use-compress-avatar'

type ProfileAvatarUploadProps = {
  avatarUrl: string
  onAvatarChange: (value: string) => void
  onClear?: () => void
}

export function ProfileAvatarUpload({ avatarUrl, onAvatarChange, onClear }: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { compressFile, isCompressing } = useCompressAvatar()

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const compressed = await compressFile(file)
      onAvatarChange(compressed.dataUrl)
      toast.success('Profile picture ready to save')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not process image.')
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="avatarFile">Profile picture</Label>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={inputRef}
          id="avatarFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="rounded-xl"
          disabled={isCompressing}
          onChange={handleFileChange}
        />
        {avatarUrl ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={isCompressing}
            onClick={() => {
              onAvatarChange('')
              onClear?.()
            }}
          >
            Remove
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {isCompressing
          ? 'Compressing image…'
          : 'Upload JPEG, PNG, WebP, or GIF. Compressed in a background worker before saving.'}
      </p>
    </div>
  )
}
