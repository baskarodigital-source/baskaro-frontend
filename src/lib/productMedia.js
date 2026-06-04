import { isCloudinaryUrl } from './storeImageUpload.js'
import { optimizeDeliveryUrl } from './optimizeImageUrl.js'

/** Collect unique video URLs from a phone model document. */
export function collectModelVideoUrls(model) {
  const list = []
  const seen = new Set()
  const push = (raw) => {
    const u = String(raw || '').trim()
    if (!u || seen.has(u)) return
    seen.add(u)
    list.push(u)
  }
  if (Array.isArray(model?.videoUrls)) model.videoUrls.forEach(push)
  push(model?.videoUrl)
  push(model?.video)
  return list.filter((u) => isCloudinaryUrl(u) || /^https?:\/\//i.test(u))
}

/** Collect gallery image URLs from a phone model document. */
export function collectModelImageUrls(model) {
  const list = []
  const seen = new Set()
  const push = (raw) => {
    const u = String(raw || '').trim()
    if (!u || seen.has(u)) return
    seen.add(u)
    list.push(u)
  }
  push(model?.image)
  push(model?.imageUrl)
  if (Array.isArray(model?.images)) model.images.forEach(push)
  return list
}

/**
 * Unified media list for product gallery: images first, then videos.
 * @returns {{ media: { type: 'image'|'video', url: string, poster?: string }[], images: string[], videos: string[] }}
 */
export function buildModelMediaGallery(model) {
  const rawImages = collectModelImageUrls(model)
  const images = rawImages.length ? rawImages : ['/logo.png']
  const videos = collectModelVideoUrls(model)

  const media = [
    ...images.map((url) => ({
      type: 'image',
      url: optimizeDeliveryUrl(url, { width: 960 }),
      poster: optimizeDeliveryUrl(url, { width: 200 }),
    })),
    ...videos.map((url) => ({
      type: 'video',
      url,
      poster: cloudinaryVideoPoster(url) || images[0] || '',
    })),
  ]

  return {
    media,
    images: media.filter((m) => m.type === 'image').map((m) => m.url),
    videos,
  }
}

/** First-frame JPG poster for Cloudinary video thumbs (optional). */
export function cloudinaryVideoPoster(videoUrl) {
  const u = String(videoUrl || '').trim()
  if (!isCloudinaryUrl(u)) return ''
  try {
    const url = new URL(u)
    const parts = url.pathname.split('/').filter(Boolean)
    const uploadIdx = parts.findIndex((p) => p === 'upload')
    if (uploadIdx < 0) return ''
    if (!parts[uploadIdx + 1]?.includes('so_0')) {
      parts.splice(uploadIdx + 1, 0, 'so_0,f_jpg,q_auto,w_400')
    }
    url.pathname = `/${parts.join('/')}`.replace(/\.(mp4|mov|webm)$/i, '.jpg')
    return url.toString()
  } catch {
    return ''
  }
}
