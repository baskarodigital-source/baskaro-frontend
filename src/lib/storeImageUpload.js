import { apiRequest } from './api/client.js'

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
  inventory: 'baskaro/inventory',
  cms: 'baskaro/cms',
}

export function isCloudinaryUrl(url) {
  return /res\.cloudinary\.com/i.test(String(url || ''))
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result || ''))
    r.onerror = () => reject(new Error('Could not read file'))
    r.readAsDataURL(file)
  })
}

/** Resize large images before upload (keeps uploads fast and within API limits). */
export function compressDataUrl(dataUrl, maxWidth = 640, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w < 1 || h < 1) return resolve(dataUrl)
      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w)
        w = maxWidth
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve(dataUrl)
      ctx.drawImage(img, 0, 0, w, h)
      try {
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
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
    if (!source.type.startsWith('image/')) throw new Error('File must be an image')
    filePayload = await readFileAsDataUrl(source)
  }
  let dataUrl = String(filePayload || '').trim()
  if (!dataUrl) throw new Error('No image to upload')

  if (isCloudinaryUrl(dataUrl)) return dataUrl

  if (dataUrl.length > 250_000) dataUrl = await compressDataUrl(dataUrl)
  if (dataUrl.length > 950_000) dataUrl = await compressDataUrl(dataUrl, 480, 0.75)

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
  return uploadStoreImage(t, { folder })
}

/** Pick a file → compress → Cloudinary URL. */
export async function uploadStoreImageFile(file, { folder = STORE_IMAGE_FOLDERS.general } = {}) {
  if (!file?.type?.startsWith('image/')) throw new Error('File must be an image')
  let dataUrl = await readFileAsDataUrl(file)
  if (dataUrl.length > 250_000) dataUrl = await compressDataUrl(dataUrl)
  if (dataUrl.length > 950_000) dataUrl = await compressDataUrl(dataUrl, 480, 0.75)
  return uploadStoreImage(dataUrl, { folder })
}
