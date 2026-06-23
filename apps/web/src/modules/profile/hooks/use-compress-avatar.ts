import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  CompressAvatarWorkerRequest,
  CompressAvatarWorkerResponse,
} from '../workers/compress-avatar.worker'
import type { CompressAvatarResult } from '../lib/compress-avatar-image'

export function useCompressAvatar() {
  const workerRef = useRef<Worker | null>(null)
  const requestIdRef = useRef(0)
  const [isCompressing, setIsCompressing] = useState(false)

  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  const getWorker = () => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/compress-avatar.worker.ts', import.meta.url),
        { type: 'module' },
      )
    }
    return workerRef.current
  }

  const compressFile = useCallback((file: File): Promise<CompressAvatarResult> => {
    setIsCompressing(true)
    const id = ++requestIdRef.current

    return new Promise((resolve, reject) => {
      const worker = getWorker()

      const onMessage = (event: MessageEvent<CompressAvatarWorkerResponse>) => {
        if (event.data.id !== id) return
        worker.removeEventListener('message', onMessage)
        worker.removeEventListener('error', onError)
        setIsCompressing(false)

        if (event.data.type === 'success') {
          resolve({
            dataUrl: event.data.dataUrl,
            width: event.data.width,
            height: event.data.height,
            byteLength: event.data.byteLength,
          })
          return
        }
        reject(new Error(event.data.message))
      }

      const onError = () => {
        worker.removeEventListener('message', onMessage)
        worker.removeEventListener('error', onError)
        setIsCompressing(false)
        reject(new Error('Image compression worker failed.'))
      }

      worker.addEventListener('message', onMessage)
      worker.addEventListener('error', onError)

      file
        .arrayBuffer()
        .then((buffer) => {
          const payload: CompressAvatarWorkerRequest = {
            id,
            buffer,
            mimeType: file.type,
          }
          worker.postMessage(payload, [buffer])
        })
        .catch(() => {
          worker.removeEventListener('message', onMessage)
          worker.removeEventListener('error', onError)
          setIsCompressing(false)
          reject(new Error('Could not read the selected image.'))
        })
    })
  }, [])

  return { compressFile, isCompressing }
}
