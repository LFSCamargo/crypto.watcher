import type { ReactNode } from 'react'
import { Input, Label, Textarea } from '../../../components/ui'

interface RequestFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: ReactNode
  multiline?: boolean
  type?: 'text' | 'url'
  inputRef?: React.Ref<HTMLInputElement>
  textareaRef?: React.Ref<HTMLTextAreaElement>
  placeholder?: string
}

export function RequestField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  multiline = false,
  type = 'text',
  inputRef,
  textareaRef,
  placeholder,
}: RequestFieldProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(' ')
  const shared = {
    id,
    name: id,
    value,
    placeholder,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea
          {...shared}
          ref={textareaRef}
          className="min-h-[140px] rounded-2xl"
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          {...shared}
          ref={inputRef}
          type={type}
          className="rounded-2xl"
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-destructive-strong">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
