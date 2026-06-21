import type { Request, Response } from 'express'

export function getMeHandler(_req: Request, res: Response) {
  res.json({ user: res.locals.user })
}
