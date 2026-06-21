import type { Request, Response } from 'express'
import { authService } from '../auth.service'
import { NonceBodySchema } from '../schemas'

export async function createNonceHandler(req: Request, res: Response) {
  const body = NonceBodySchema.parse(req.body)
  res.json(await authService.createNonce(body.address))
}
