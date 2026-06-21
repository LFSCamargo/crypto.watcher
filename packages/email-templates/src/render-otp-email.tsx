import { render } from '@react-email/render'
import { OtpEmail, type OtpEmailProps } from './templates/otp-email'
import { getOtpEmailCopy } from './otp-copy'

export type RenderedEmail = {
  subject: string
  html: string
  text: string
}

export async function renderOtpEmail(props: OtpEmailProps): Promise<RenderedEmail> {
  const copy = getOtpEmailCopy(props.purpose)
  const html = await render(<OtpEmail {...props} />)
  const text = [
    copy.heading,
    '',
    copy.body,
    '',
    props.code,
    '',
    `This code expires in ${props.expiresMinutes} minutes.`,
  ].join('\n')

  return { subject: copy.subject, html, text }
}
