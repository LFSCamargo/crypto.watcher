export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

export interface PasswordStrengthResult {
  level: PasswordStrengthLevel
  score: number
  suggestions: string[]
  meetsMinimum: boolean
}

export function analyzePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      level: 'empty',
      score: 0,
      suggestions: ['Start typing to see password suggestions.'],
      meetsMinimum: false,
    }
  }

  const suggestions: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else suggestions.push('Use at least 8 characters.')

  if (password.length >= 12) score += 1
  else if (password.length >= 8) {
    suggestions.push('Use 12 or more characters for a stronger password.')
  }

  if (/[a-z]/.test(password)) score += 1
  else suggestions.push('Add a lowercase letter.')

  if (/[A-Z]/.test(password)) score += 1
  else suggestions.push('Add an uppercase letter.')

  if (/[0-9]/.test(password)) score += 1
  else suggestions.push('Add a number.')

  if (/[^A-Za-z0-9]/.test(password)) score += 1
  else suggestions.push('Add a symbol such as !, @, or #.')

  const meetsMinimum = password.length >= 8

  let level: PasswordStrengthLevel = 'weak'
  if (score >= 5 && password.length >= 12) level = 'strong'
  else if (score >= 4) level = 'good'
  else if (score >= 2 && meetsMinimum) level = 'fair'

  if (suggestions.length === 0) {
    suggestions.push('Looks strong — avoid reusing this password on other sites.')
  }

  return {
    level,
    score: Math.min(score, 5),
    suggestions,
    meetsMinimum,
  }
}

export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password.length > 0 && password === confirmPassword
}
