import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { authService } from '../auth.service'
import { LinkPublicKeyBodySchema } from '../schemas'

const linkPublicKeyError = (error: unknown) => {
  const message = error instanceof Error ? error.message : undefined
  const mapped = {
    INVALID_PUBLIC_KEY: new HttpError(400, 'Invalid wallet address format'),
    WALLET_TAKEN: new HttpError(409, 'Wallet already linked to another account'),
  }[message ?? '']

  return mapped ?? error
}

export async function linkPublicKeyHandler(req: Request, res: Response) {
  const body = LinkPublicKeyBodySchema.parse(req.body)
  try {
    const user = await authService.linkPublicKey(res.locals.user.id, body.publicKey)
    res.json({ user })
  } catch (error) {
    throw linkPublicKeyError(error)
  }
}
