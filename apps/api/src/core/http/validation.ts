import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { ZodError, ZodType } from 'zod'

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
  }
}

const formatZodError = (error: ZodError) =>
  error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))

export const validate =
  (schemas: { body?: ZodType; query?: ZodType; params?: ZodType }): RequestHandler =>
  (req, _res, next) => {
    const failed = [
      schemas.body?.safeParse(req.body),
      schemas.query?.safeParse(req.query),
      schemas.params?.safeParse(req.params),
    ].find((result) => result?.success === false)

    if (failed?.success === false) {
      next(new HttpError(400, 'Invalid request', formatZodError(failed.error)))
      return
    }

    next()
  }

export const asyncHandler =
  <TParams, TResBody, TReqBody, TReqQuery>(
    handler: (
      req: Request<TParams, TResBody, TReqBody, TReqQuery>,
      res: Response<TResBody>,
      next: NextFunction,
    ) => Promise<unknown>,
  ): RequestHandler<TParams, TResBody, TReqBody, TReqQuery> =>
  (req, res, next) => {
    void handler(req, res, next).catch(next)
  }
