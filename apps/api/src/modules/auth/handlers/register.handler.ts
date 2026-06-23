import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { authService } from '../auth.service'
import { RegisterBodySchema } from '../schemas'

const registerError = (error: unknown) => {
  const message = error instanceof Error ? error.message : undefined
  const mapped = {
    EMAIL_TAKEN: new HttpError(409, 'Email already registered'),
    NICKNAME_TAKEN: new HttpError(409, 'Nickname already taken'),
  }[message ?? '']

  return mapped ?? error
}

export async function registerHandler(req: Request, res: Response) {
  const body = RegisterBodySchema.parse(req.body)
  try {
    const result = await authService.register(body)
    res.status(201).json(result)
  } catch (error) {
    throw registerError(error)
  }
}
