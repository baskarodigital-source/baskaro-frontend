import { apiRequest } from './api/client.js'

const DEFAULT_VIDEO_FOLDER = 'baskaro/videos'

/** Cloudinary signatures are valid ~1 hour; refresh before expiry. */
const SIG_CACHE_MAX_AGE_MS = 50 * 60 * 1000

/** Compress when at or above this size (e.g. 4K stock clips ~30–40 MB). */
const COMPRESS_MIN_BYTES = 8 * 1024 * 1024

/** Output cap — 4K sources are scaled down (much faster upload). */
const OUTPUT_MAX_WIDTH = 1280
const OUTPUT_MAX_HEIGHT = 720

/** Skip re-encode when longer than this (unless file is very large). */
const COMPRESS_MAX_DURATION_SEC = 90
const COMPRESS_MAX_DURATION_LARGE_SEC = 150
const LARGE_FILE_BYTES = 22 * 1024 * 1024

let signatureCache = null

export function clearVideoUploadSignatureCache() {
  signatureCache = null
}

export async function prefetchVideoUploadSignature(folder = DEFAULT_VIDEO_FOLDER) {
  try {
    const sig = await apiRequest('/api/uploads/video/signature', {
      method: 'POST',
      body: { folder },
      auth: true,
    })
    if (sig?.error || !sig?.signature) return null
    signatureCache = { folder, sig, fetchedAt: Date.now() }
    return sig
  } catch {
    return null
  }
}

export function getCachedVideoUploadSignature(folder = DEFAULT_VIDEO_FOLDER) {
  if (!signatureCache || signatureCache.folder !== folder) return null
  if (Date.now() - signatureCache.fetchedAt > SIG_CACHE_MAX_AGE_MS) {
    signatureCache = null
    return null
  }
  return signatureCache.sig
}

export function isNetworkVideoUploadError(err) {
  const m = String(err?.message || '').toLowerCase()
  if (/invalid|signature|unauthorized|401|403|rejected|format|denied|api key/.test(m)) {
    return false
  }
  return /network|connection|timeout|cancelled|failed to fetch|cloudinary failed|upload failed/.test(
    m,
  )
}

function pickRecorderMimeType() {
  const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4']
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return ''
}

function fitOutputDimensions(srcW, srcH) {
  let w = Math.max(2, Math.round(srcW || 1280))
  let h = Math.max(2, Math.round(srcH || 720))
  if (w <= OUTPUT_MAX_WIDTH && h <= OUTPUT_MAX_HEIGHT) {
    return { w: w % 2 === 0 ? w : w - 1, h: h % 2 === 0 ? h : h - 1 }
  }
  const scale = Math.min(OUTPUT_MAX_WIDTH / w, OUTPUT_MAX_HEIGHT / h)
  w = Math.round(w * scale)
  h = Math.round(h * scale)
  return { w: w % 2 === 0 ? w : w - 1, h: h % 2 === 0 ? h : h - 1 }
}

/**
 * Shrink large / MOV / WebM clips before upload (faster transfer + less Cloudinary processing).
 * Falls back to the original file when compression is unsupported or not worthwhile.
 */
export async function compressVideoForUpload(file, { onProgress } = {}) {
  const isMp4 = file.type === 'video/mp4' || /\.mp4$/i.test(file.name || '')
  if (file.size < COMPRESS_MIN_BYTES && isMp4) return file

  if (typeof document === 'undefined' || typeof MediaRecorder === 'undefined') {
    return file
  }

  const mimeType = pickRecorderMimeType()
  if (!mimeType) return file

  onProgress?.(2, 'compress')

  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'

    const objectUrl = URL.createObjectURL(file)
    let settled = false
    let rafId = 0

    const finish = (out) => {
      if (settled) return
      settled = true
      if (rafId) cancelAnimationFrame(rafId)
      URL.revokeObjectURL(objectUrl)
      video.src = ''
      video.load()
      resolve(out)
    }

    const failSafe = setTimeout(() => finish(file), 4 * 60 * 1000)

    video.onerror = () => {
      clearTimeout(failSafe)
      finish(file)
    }

    video.onloadedmetadata = () => {
      const duration = Number(video.duration)
      const maxDuration =
        file.size >= LARGE_FILE_BYTES ? COMPRESS_MAX_DURATION_LARGE_SEC : COMPRESS_MAX_DURATION_SEC

      if (!Number.isFinite(duration) || duration <= 0 || duration > maxDuration) {
        clearTimeout(failSafe)
        finish(file)
        return
      }

      const srcW = video.videoWidth || 1920
      const srcH = video.videoHeight || 1080
      const is4K = srcW >= 2560 || srcH >= 1440
      const { w, h } = fitOutputDimensions(srcW, srcH)

      if (!is4K && file.size < COMPRESS_MIN_BYTES && w === srcW && h === srcH) {
        clearTimeout(failSafe)
        finish(file)
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx || typeof canvas.captureStream !== 'function') {
        clearTimeout(failSafe)
        finish(file)
        return
      }

      let recorder
      try {
        const stream = canvas.captureStream(30)
        recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: is4K ? 1_800_000 : 1_200_000,
        })
      } catch {
        clearTimeout(failSafe)
        finish(file)
        return
      }

      const chunks = []
      recorder.ondataavailable = (e) => {
        if (e.data?.size) chunks.push(e.data)
      }

      recorder.onstop = () => {
        clearTimeout(failSafe)
        if (!chunks.length) {
          finish(file)
          return
        }
        const blob = new Blob(chunks, { type: mimeType })
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
        const base = (file.name || 'video').replace(/\.[^.]+$/, '')
        const out = new File([blob], `${base}-720p.${ext}`, { type: mimeType })
        if (out.size >= file.size * 0.92) finish(file)
        else finish(out)
      }

      recorder.onerror = () => {
        clearTimeout(failSafe)
        finish(file)
      }

      const tick = () => {
        if (!Number.isFinite(duration) || duration <= 0) return
        const pct = Math.min(38, Math.round((video.currentTime / duration) * 38))
        onProgress?.(pct, 'compress')
      }

      video.ontimeupdate = tick

      const drawFrame = () => {
        if (video.readyState >= 2) {
          ctx.drawImage(video, 0, 0, w, h)
        }
        if (!video.paused && !video.ended) {
          rafId = requestAnimationFrame(drawFrame)
        }
      }

      recorder.start(1000)
      const rate = duration > 60 ? 8 : duration > 30 ? 6 : 4
      video.playbackRate = rate

      video
        .play()
        .then(() => {
          onProgress?.(5, 'compress')
          drawFrame()
        })
        .catch(() => {
          clearTimeout(failSafe)
          try {
            recorder.stop()
          } catch {
            finish(file)
          }
        })

      video.onended = () => {
        video.ontimeupdate = null
        onProgress?.(40, 'compress')
        try {
          if (recorder.state !== 'inactive') recorder.stop()
        } catch {
          finish(file)
        }
      }
    }

    video.src = objectUrl
  })
}
