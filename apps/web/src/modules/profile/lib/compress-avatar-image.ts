/** Shared avatar compression settings (profile display + DB payload). */
export const AVATAR_MAX_DIMENSION = 512
export const AVATAR_JPEG_QUALITY = 0.88
export const AVATAR_MAX_INPUT_BYTES = 10 * 1024 * 1024
/** Match API `MAX_AVATAR_URL_LENGTH` (256 KB); base64 adds ~33% overhead. */
export const AVATAR_MAX_DATA_URL_LENGTH = 256_000
export const AVATAR_MAX_BLOB_BYTES = 180_000

export type CompressAvatarInput = {
  buffer: ArrayBuffer
  mimeType: string
}

export type CompressAvatarResult = {
  dataUrl: string
  width: number
  height: number
  byteLength: number
}

const ALLOWED_INPUT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const scaleToFit = (width: number, height: number, maxDimension: number) => {
  const longest = Math.max(width, height)
  if (longest <= maxDimension) return { width, height }
  const ratio = maxDimension / longest
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  }
}

const encodeJpegBlob = async (canvas: OffscreenCanvas, quality: number) =>
  canvas.convertToBlob({ type: 'image/jpeg', quality })

/** Shrink quality until the blob fits the API payload budget. */
export async function compressCanvasToBlob(canvas: OffscreenCanvas): Promise<Blob> {
  let quality = AVATAR_JPEG_QUALITY
  let blob = await encodeJpegBlob(canvas, quality)

  while (blob.size > AVATAR_MAX_BLOB_BYTES && quality > 0.55) {
    quality -= 0.07
    blob = await encodeJpegBlob(canvas, quality)
  }

  if (blob.size > AVATAR_MAX_BLOB_BYTES) {
    throw new Error('Image is still too large after compression. Try a smaller photo.')
  }

  return blob
}

/** Resize + re-encode off the main thread (worker or jsdom tests). */
export async function compressAvatarImage(
  input: CompressAvatarInput,
): Promise<CompressAvatarResult> {
  if (!ALLOWED_INPUT_TYPES.has(input.mimeType)) {
    throw new Error('Unsupported image type. Use JPEG, PNG, WebP, or GIF.')
  }
  if (input.buffer.byteLength > AVATAR_MAX_INPUT_BYTES) {
    throw new Error('Image is too large. Maximum upload size is 10 MB.')
  }

  const bitmap = await createImageBitmap(new Blob([input.buffer], { type: input.mimeType }))
  const { width, height } = scaleToFit(bitmap.width, bitmap.height, AVATAR_MAX_DIMENSION)

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not prepare image canvas.')

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await compressCanvasToBlob(canvas)

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Failed to encode compressed image.'))
    reader.readAsDataURL(blob)
  })

  if (dataUrl.length > AVATAR_MAX_DATA_URL_LENGTH) {
    throw new Error('Image is still too large after compression. Try a smaller photo.')
  }

  return {
    dataUrl,
    width,
    height,
    byteLength: blob.size,
  }
}
