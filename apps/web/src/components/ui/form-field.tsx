import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'
import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'

interface FormFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: ReactNode
  multiline?: boolean
  type?: 'text' | 'url' | 'number'
  inputRef?: React.Ref<HTMLInputElement>
  textareaRef?: React.Ref<HTMLTextAreaElement>
  placeholder?: string
  autoComplete?: string
  className?: string
}

export function FormField({
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
  autoComplete,
  className,
}: FormFieldProps) {
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
    autoComplete,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
  }

  return (
    <div className={cn('space-y-2', className)}>
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
