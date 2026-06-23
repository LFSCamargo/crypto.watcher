import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { authService } from '../auth.service'
import { RegisterBodySchema } from '../schemas'

export async function registerHandler(req: Request, res: Response) {
  const body = RegisterBodySchema.parse(req.body)
  try {
    const result = await authService.register(body)
    res.status(201).json(result)
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_TAKEN') {
      throw new HttpError(409, 'Email already registered')
    }
    if (error instanceof Error && error.message === 'NICKNAME_TAKEN') {
      throw new HttpError(409, 'Nickname already taken')
    }
    throw error
  }
}
