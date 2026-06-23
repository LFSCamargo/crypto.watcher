import { compressAvatarImage, type CompressAvatarInput } from '../lib/compress-avatar-image'

export type CompressAvatarWorkerRequest = CompressAvatarInput & { id: number }

export type CompressAvatarWorkerSuccess = {
  id: number
  type: 'success'
  dataUrl: string
  width: number
  height: number
  byteLength: number
}

export type CompressAvatarWorkerError = {
  id: number
  type: 'error'
  message: string
}

export type CompressAvatarWorkerResponse = CompressAvatarWorkerSuccess | CompressAvatarWorkerError

self.onmessage = async (event: MessageEvent<CompressAvatarWorkerRequest>) => {
  const { id, buffer, mimeType } = event.data
  try {
    const result = await compressAvatarImage({ buffer, mimeType })
    const response: CompressAvatarWorkerSuccess = {
      id,
      type: 'success',
      dataUrl: result.dataUrl,
      width: result.width,
      height: result.height,
      byteLength: result.byteLength,
    }
    self.postMessage(response)
  } catch (error) {
    const response: CompressAvatarWorkerError = {
      id,
      type: 'error',
      message: error instanceof Error ? error.message : 'Failed to compress image.',
    }
    self.postMessage(response)
  }
}
