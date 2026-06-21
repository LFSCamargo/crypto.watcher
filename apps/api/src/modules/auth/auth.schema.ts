import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { UserSchema } from '../users/users.schema'

extendZodWithOpenApi(z)

export const NonceBodySchema = z
  .object({
    address: z.string().min(1),
  })
  .openapi('NonceBody')

export const NonceResponseSchema = z
  .object({
    nonce: z.string(),
    message: z.string(),
  })
  .openapi('NonceResponse')

export const VerifyBodySchema = z
  .object({
    address: z.string().min(1),
    message: z.string().min(1),
    signature: z.string().min(1),
  })
  .openapi('VerifyBody')

export const RegisterBodySchema = z
  .object({
    email: z.email(),
    password: z.string().min(8).max(128),
    nickname: z.string().min(2).max(32).optional(),
  })
  .openapi('RegisterBody')

export const LoginBodySchema = z
  .object({
    email: z.email(),
    password: z.string().min(1).max(128),
  })
  .openapi('LoginBody')

export const LinkPublicKeyBodySchema = z
  .object({
    publicKey: z.string().min(1),
  })
  .openapi('LinkPublicKeyBody')

export const ForgotPasswordBodySchema = z
  .object({
    email: z.email(),
  })
  .openapi('ForgotPasswordBody')

export const ResetPasswordBodySchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8).max(128),
  })
  .openapi('ResetPasswordBody')

export const AuthUserResponseSchema = z
  .object({
    user: UserSchema,
  })
  .openapi('AuthUserResponse')
