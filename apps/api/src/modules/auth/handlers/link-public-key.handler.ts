import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { authService } from '../auth.service'
import { LinkPublicKeyBodySchema } from '../schemas'

export async function linkPublicKeyHandler(req: Request, res: Response) {
  const body = LinkPublicKeyBodySchema.parse(req.body)
  try {
    const user = await authService.linkPublicKey(res.locals.user.id, body.publicKey)
    res.json({ user })
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_PUBLIC_KEY') {
      throw new HttpError(400, 'Invalid wallet address format')
    }
    if (error instanceof Error && error.message === 'WALLET_TAKEN') {
      throw new HttpError(409, 'Wallet already linked to another account')
    }
    throw error
  }
}
