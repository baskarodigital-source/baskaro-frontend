import { apiRequest } from './api/client.js'
import { getToken } from './auth.js'
import {
  compressVideoForUpload,
  getCachedVideoUploadSignature,
  isNetworkVideoUploadError,
  prefetchVideoUploadSignature,
} from './videoUploadPrep.js'

export { prefetchVideoUploadSignature }

/** Must match backend `cloudinaryFolders.js` */
export const STORE_IMAGE_FOLDERS = {
  general: 'baskaro/general',
  homeServices: 'baskaro/home-services',
  offers: 'baskaro/offers',
  flashDeals: 'baskaro/flash-deals',
  banners: 'baskaro/banners',
  ribbon: 'baskaro/ribbon-categories',
  brands: 'baskaro/brands',
  devices: 'baskaro/devices',
  models: 'baskaro/models',
  videos: 'baskaro/videos',
  inventory: 'baskaro/inventory',
  cms: 'baskaro/cms',
}

export function isCloudinaryUrl(url) {
  return /res\.cloudinary\.com/i.test(String(url || ''))
}

/** Browser-only preview URLs — must not be saved to the API. */
export function isLocalMediaUrl(url) {
  const t = String(url || '').trim()
  return t.startsWith('blob:') || (t.startsWith('data:') && !isCloudinaryUrl(t))
}

export function isImageFile(file) {
  if (!file) return false
  if (file.type && /^image\/(jpeg|png|webp)$/i.test(file.type)) return true
  return /\.(jpe?g|png|webp)$/i.test(file.name || '')
}

export function isVideoFile(file) {
  if (!file) return false
  if (file.type && /^video\/(mp4|quicktime|webm)$/i.test(file.type)) return true
  return /\.(mp4|mov|webm)$/i.test(file.name || '')
}

/** Raw file size cap (base64 in JSON adds ~33% — keep under backend/Cloudinary limits). */
export const MAX_VIDEO_FILE_BYTES = 50 * 1024 * 1024

export function formatMegabytes(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const apiBase = () => (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

/** Normalize multipart upload JSON ({ url } or { success, data: { url } }). */
function parseUploadResponseUrl(data) {
  if (!data || typeof data !== 'object') return null
  if (typeof data.url === 'string' && data.url.trim()) return data.url.trim()
  if (typeof data.secure_url === 'string' && data.secure_url.trim()) return data.secure_url.trim()
  const nested = data.data
  if (nested && typeof nested === 'object') {
    if (typeof nested.url === 'string' && nested.url.trim()) return nested.url.trim()
    if (typeof nested.secure_url === 'string' && nested.secure_url.trim()) return nested.secure_url.trim()
  }
  return null
}

/** Video uploads hit the API directly — Vite proxy often times out during Cloudinary processing. */
function multipartUploadUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const isVideo = /\/video\/file$/i.test(normalized)
  const base = apiBase()
  if (isVideo) {
    if (base) return `${base}${normalized}`
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      const port = import.meta.env.VITE_API_PORT || '4001'
      return `http://127.0.0.1:${port}${normalized}`
    }
  }
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return normalized
  }
  return base ? `${base}${normalized}` : normalized
}

/**
 * Upload a File via multipart/form-data with real upload progress (no base64).
 */
export function uploadStoreFileMultipart(path, file, { folder, onProgress, timeoutMs } = {}) {
  return new Promise((resolve, reject) => {
    const url = multipartUploadUrl(path)
    const xhr = new XMLHttpRequest()
    const form = new FormData()
    form.append('file', file, file.name || 'upload')
    if (folder) form.append('folder', folder)

    const isVideo = /\/video\/file$/i.test(path)
    const maxMs = timeoutMs ?? (isVideo ? 15 * 60 * 1000 : 3 * 60 * 1000)
    const timer = setTimeout(() => {
      xhr.abort()
      reject(
        new Error(
          isVideo
            ? 'Video upload timed out. Try a shorter clip, compress the file, or check Cloudinary configuration.'
            : 'Upload timed out. Try a smaller file.',
        ),
      )
    }, maxMs)

    const report = (pct, phase) => {
      onProgress?.(Math.min(99, Math.max(0, Math.round(pct))), phase)
    }

    xhr.open('POST', url)
    const token = getToken()
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onloadstart = () => report(8, 'send')

    xhr.upload.onprogress = (e) => {
      if (!onProgress) return
      if (e.lengthComputable && e.total > 0) {
        // Reserve headroom for server → Cloudinary processing
        report(8 + (e.loaded / e.total) * 82, 'send')
      } else if (e.loaded > 0) {
        const guess = Math.min(78, 12 + Math.round(e.loaded / 200000))
        report(guess, 'send')
      }
    }

    xhr.upload.onload = () => report(92, 'cloudinary')

    xhr.onload = () => {
      clearTimeout(timer)
      let data = null
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : null
      } catch {
        data = { raw: xhr.responseText }
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        report(100, 'done')
        if (data?.error) reject(new Error(data.error))
        const uploadedUrl = parseUploadResponseUrl(data)
        if (!uploadedUrl) {
          reject(new Error('Upload did not return a URL'))
          return
        }
        resolve(uploadedUrl)
        return
      }
      let msg = data?.error || data?.message || xhr.statusText || 'Upload failed'
      if (xhr.status === 413 || /entity too large|payload too large/i.test(msg)) {
        msg = `Video is too large for the server (max ${formatMegabytes(MAX_VIDEO_FILE_BYTES)}). Compress the file or ask ops to raise nginx client_max_body_size on api.baskaro.com.`
      } else if (xhr.status === 408 || /request timeout/i.test(msg)) {
        msg =
          'Upload timed out while sending to Cloudinary. Try a smaller video or check your connection.'
      }
      reject(new Error(msg))
    }

    xhr.onerror = () => {
      clearTimeout(timer)
      reject(
        new Error(
          isVideo
            ? 'Video upload failed (network or server limit). Large videos upload directly to Cloudinary when possible — retry, or use a file under 50MB.'
            : 'Network error during upload. Is the API server running?',
        ),
      )
    }
    xhr.onabort = () => {
      clearTimeout(timer)
      reject(new Error('Upload cancelled'))
    }
    xhr.send(form)
  })
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result || ''))
    r.onerror = () => reject(new Error('Could not read file'))
    r.readAsDataURL(file)
  })
}

function drawToJpegDataUrl(source, maxWidth, quality) {
  let w = source.width
  let h = source.height
  if (w < 1 || h < 1) return null
  if (w > maxWidth) {
    h = Math.round((h * maxWidth) / w)
    w = maxWidth
  }
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(source, 0, 0, w, h)
  try {
    return canvas.toDataURL('image/jpeg', quality)
  } catch {
    return null
  }
}

/** Resize large images before upload (keeps uploads fast and within API limits). */
export function compressDataUrl(dataUrl, maxWidth = 960, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const out = drawToJpegDataUrl(img, maxWidth, quality)
      resolve(out || dataUrl)
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

/** Faster path for File inputs — avoids loading multi‑MB data URLs when possible. */
export async function compressImageFile(file, maxWidth = 960, quality = 0.82) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file)
      const out = drawToJpegDataUrl(bitmap, maxWidth, quality)
      bitmap.close?.()
      if (out) return out
    } catch {
      /* fall through */
    }
  }
  const dataUrl = await readFileAsDataUrl(file)
  return compressDataUrl(dataUrl, maxWidth, quality)
}

/** Data URL → File for multipart upload after client-side compression. */
async function compressedImageFile(file, maxWidth, quality) {
  const dataUrl = await compressImageFile(file, maxWidth, quality)
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const name = (file.name || 'image').replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], name, { type: 'image/jpeg' })
}

export async function getCloudinaryStatus() {
  return apiRequest('/api/uploads/status')
}

/**
 * Upload image to Cloudinary via backend (admin auth required).
 * @returns {Promise<string>} secure HTTPS URL
 */
export async function uploadStoreImage(source, { folder = STORE_IMAGE_FOLDERS.general } = {}) {
  let filePayload = source
  if (source instanceof File) {
    if (!isImageFile(source)) throw new Error('File must be an image')
    filePayload = await readFileAsDataUrl(source)
  }
  let dataUrl = String(filePayload || '').trim()
  if (!dataUrl) throw new Error('No image to upload')

  if (isCloudinaryUrl(dataUrl)) return dataUrl

  if (dataUrl.length > 400_000) dataUrl = await compressDataUrl(dataUrl, 960, 0.8)
  if (dataUrl.length > 950_000) dataUrl = await compressDataUrl(dataUrl, 720, 0.75)

  const res = await apiRequest('/api/uploads/image', {
    method: 'POST',
    body: { file: dataUrl, folder },
    auth: true,
  })
  if (res?.error) throw new Error(res.error)
  if (!res?.url) throw new Error('Upload did not return a URL')
  return res.url
}

/**
 * Ensure value is stored on Cloudinary (data URL, remote URL, or already Cloudinary).
 */
export async function ensureStoredImageUrl(value, { folder = STORE_IMAGE_FOLDERS.general } = {}) {
  const t = String(value ?? '').trim()
  if (!t) return ''
  if (isCloudinaryUrl(t)) return t
  if (isLocalMediaUrl(t)) {
    throw new Error('Image is still local. Wait for Cloudinary upload to finish.')
  }
  return uploadStoreImage(t, { folder })
}

/** Pick a file → compress → multipart → Cloudinary URL. */
export async function uploadStoreImageFile(
  file,
  {
    folder = STORE_IMAGE_FOLDERS.general,
    maxWidth = 960,
    quality = 0.82,
    onProgress,
  } = {},
) {
  if (!isImageFile(file)) throw new Error('File must be an image (JPG, PNG, or WEBP)')
  const payload = await compressedImageFile(file, maxWidth, quality)
  return uploadStoreFileMultipart('/api/uploads/image/file', payload, { folder, onProgress })
}

/**
 * Upload multiple images in parallel (chunked to avoid overloading the API).
 * @returns {Promise<string[]>} Cloudinary URLs in the same order as input files
 */
export async function uploadStoreImageFiles(
  files,
  {
    folder = STORE_IMAGE_FOLDERS.general,
    maxWidth = 960,
    quality = 0.82,
    concurrency = 4,
    onProgress,
  } = {},
) {
  const list = Array.from(files || []).filter(isImageFile)
  if (!list.length) return []

  const urls = []
  const limit = Math.max(1, Math.min(concurrency, 6))
  for (let i = 0; i < list.length; i += limit) {
    const chunk = list.slice(i, i + limit)
    const batch = await Promise.all(
      chunk.map((file, chunkIdx) =>
        uploadStoreImageFile(file, {
          folder,
          maxWidth,
          quality,
          onProgress: onProgress
            ? (pct) => {
                const globalIdx = i + chunkIdx
                const done = urls.length + chunkIdx + (pct >= 100 ? 1 : 0)
                onProgress({
                  done: Math.min(list.length, urls.length + chunkIdx + (pct >= 100 ? 1 : 0)),
                  total: list.length,
                  fileIndex: globalIdx,
                  percent: pct,
                })
              }
            : undefined,
        }),
      ),
    )
    urls.push(...batch)
    onProgress?.({ done: urls.length, total: list.length })
  }
  return urls
}

export async function uploadStoreVideo(source, { folder = STORE_IMAGE_FOLDERS.videos } = {}) {
  let filePayload = source
  if (source instanceof File) {
    if (!isVideoFile(source)) throw new Error('File must be a video')
    return uploadStoreVideoFile(source, { folder })
  }
  const dataUrl = String(filePayload || '').trim()
  if (!dataUrl) throw new Error('No video to upload')

  if (isCloudinaryUrl(dataUrl)) return dataUrl

  const res = await apiRequest('/api/uploads/video', {
    method: 'POST',
    body: { file: dataUrl, folder },
    auth: true,
  })
  if (res?.error) throw new Error(res.error)
  if (!res?.url) throw new Error('Video upload did not return a URL')
  return res.url
}

export async function uploadStoreVideoFile(file, { folder = STORE_IMAGE_FOLDERS.videos, onProgress } = {}) {
  if (!isVideoFile(file)) throw new Error('File must be a video (MP4, MOV, or WEBM)')
  if (file.size > MAX_VIDEO_FILE_BYTES) {
    throw new Error(
      `Video is too large (${formatMegabytes(file.size)}). Maximum size is ${formatMegabytes(MAX_VIDEO_FILE_BYTES)}.`,
    )
  }

  const prepared = await compressVideoForUpload(file, { onProgress })
  if (prepared.size > MAX_VIDEO_FILE_BYTES) {
    throw new Error(
      `Video is too large (${formatMegabytes(prepared.size)}). Maximum is ${formatMegabytes(MAX_VIDEO_FILE_BYTES)}.`,
    )
  }

  const mapProgress = (pct, phase) => {
    if (phase === 'compress') onProgress?.(pct, phase)
    else onProgress?.(40 + (pct / 100) * 60, phase)
  }

  try {
    return await uploadStoreVideoFileDirect(prepared, { folder, onProgress: mapProgress })
  } catch (directErr) {
    if (!isNetworkVideoUploadError(directErr)) throw directErr
    const maxApiRelayBytes = 12 * 1024 * 1024
    if (prepared.size > maxApiRelayBytes) {
      throw new Error(
        `Video upload failed (${formatMegabytes(prepared.size)}). Large files must upload directly to Cloudinary — refresh the page, disable ad blockers, and try again.`,
      )
    }
    onProgress?.(42, 'api')
    return uploadStoreFileMultipart('/api/uploads/video/file', prepared, {
      folder,
      onProgress: (pct, phase) => mapProgress(pct, phase === 'cloudinary' ? 'cloudinary' : 'send'),
    })
  }
}

/**
 * Browser → Cloudinary direct upload (signed). Avoids sending large files through api.baskaro.com / nginx.
 */
export function uploadStoreVideoFileDirect(file, { folder = STORE_IMAGE_FOLDERS.videos, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const report = (pct, phase) => {
      onProgress?.(Math.min(99, Math.max(0, Math.round(pct))), phase)
    }

    const maxMs = 15 * 60 * 1000
    let xhr = null
    const timer = setTimeout(() => {
      xhr?.abort()
      reject(new Error('Video upload timed out. Try a shorter clip or compress the file.'))
    }, maxMs)

    ;(async () => {
      let sig = getCachedVideoUploadSignature(folder)
      try {
        if (!sig) {
          sig = await apiRequest('/api/uploads/video/signature', {
            method: 'POST',
            body: { folder },
            auth: true,
          })
        }
      } catch (err) {
        clearTimeout(timer)
        reject(err)
        return
      }

      if (sig?.error) {
        clearTimeout(timer)
        reject(new Error(sig.error))
        return
      }

      const uploadUrl =
        sig.uploadUrl ||
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`

      xhr = new XMLHttpRequest()
      const form = new FormData()
      form.append('file', file, file.name || 'video')
      form.append('api_key', sig.apiKey)
      form.append('timestamp', String(sig.timestamp))
      form.append('signature', sig.signature)
      form.append('folder', sig.folder)

      xhr.open('POST', uploadUrl)

      xhr.upload.onloadstart = () => report(42, 'send')

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          report(42 + (e.loaded / e.total) * 52, 'send')
        } else if (e.loaded > 0) {
          report(Math.min(94, 48 + Math.round(e.loaded / 400000)), 'send')
        }
      }

      xhr.upload.onload = () => report(96, 'cloudinary')

      xhr.onload = () => {
        clearTimeout(timer)
        let data = null
        try {
          data = xhr.responseText ? JSON.parse(xhr.responseText) : null
        } catch {
          data = { raw: xhr.responseText }
        }
        if (xhr.status >= 200 && xhr.status < 300 && data?.secure_url) {
          report(100, 'done')
          resolve(data.secure_url)
          return
        }
        const msg =
          data?.error?.message ||
          data?.error ||
          data?.message ||
          xhr.statusText ||
          'Cloudinary video upload failed'
        reject(new Error(typeof msg === 'string' ? msg : 'Cloudinary video upload failed'))
      }

      xhr.onerror = () => {
        clearTimeout(timer)
        reject(new Error('Video upload to Cloudinary failed. Check your connection and try again.'))
      }

      xhr.onabort = () => {
        clearTimeout(timer)
        reject(new Error('Upload cancelled'))
      }

      xhr.send(form)
    })()
  })
}

/** Upload multiple video files (limited concurrency — each file is large). */
export async function uploadStoreVideoFiles(files, { folder = STORE_IMAGE_FOLDERS.videos, concurrency = 2, onProgress } = {}) {
  const list = Array.from(files || []).filter(isVideoFile)
  if (!list.length) return []

  const urls = []
  const limit = Math.max(1, Math.min(concurrency, 3))
  for (let i = 0; i < list.length; i += limit) {
    const chunk = list.slice(i, i + limit)
    const batch = await Promise.all(
      chunk.map((file, chunkIdx) =>
        uploadStoreVideoFile(file, {
          folder,
          onProgress: onProgress
            ? (pct, phase) => {
                onProgress({
                  done: Math.min(list.length, urls.length + chunkIdx + (pct >= 100 ? 1 : 0)),
                  total: list.length,
                  fileIndex: i + chunkIdx,
                  percent: pct,
                  phase,
                })
              }
            : undefined,
        }),
      ),
    )
    urls.push(...batch)
    onProgress?.({ done: urls.length, total: list.length })
  }
  return urls
}
