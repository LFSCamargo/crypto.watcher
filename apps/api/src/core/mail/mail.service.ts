import nodemailer from 'nodemailer'
import { renderOtpEmail, renderPasswordResetEmail, type OtpPurpose } from 'email-templates'
import { config } from '../config'

let transporter: nodemailer.Transporter | undefined

const emailLogoUrl = () => `${config.webUrl}/logo.png`

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user
        ? {
            user: config.smtp.user,
            pass: config.smtp.pass,
          }
        : undefined,
    })
  }
  return transporter
}

export const mailService = {
  async sendOtpEmail(input: {
    to: string
    code: string
    purpose: OtpPurpose
    expiresMinutes: number
  }) {
    const message = await renderOtpEmail({
      code: input.code,
      purpose: input.purpose,
      expiresMinutes: input.expiresMinutes,
      logoUrl: emailLogoUrl(),
    })

    await getTransporter().sendMail({
      from: config.smtp.from,
      to: input.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    })
  },

  async sendPasswordResetEmail(input: {
    to: string
    resetUrl: string
    expiresMinutes: number
  }) {
    const message = await renderPasswordResetEmail({
      resetUrl: input.resetUrl,
      expiresMinutes: input.expiresMinutes,
      logoUrl: emailLogoUrl(),
    })

    await getTransporter().sendMail({
      from: config.smtp.from,
      to: input.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    })
  },
}
