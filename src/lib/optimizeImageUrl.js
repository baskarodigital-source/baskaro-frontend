/**
 * Adds Cloudinary delivery transforms (f_auto, q_auto, width cap).
 * Safe no-op for non-Cloudinary URLs.
 */
export function optimizeDeliveryUrl(raw, { width = 640 } = {}) {
  const t = String(raw ?? '').trim()
  if (!t || t.startsWith('data:')) return t
  if (!/res\.cloudinary\.com/i.test(t)) return t

  try {
    const u = new URL(t)
    const parts = u.pathname.split('/').filter(Boolean)
    const uploadIdx = parts.findIndex((p) => p === 'upload')
    if (uploadIdx < 0) return t

    const next = parts[uploadIdx + 1] || ''
    const hasTransform =
      next.includes(',') || /^[a-z]\d/i.test(next) || next.startsWith('w_') || next.startsWith('f_')
    if (hasTransform) return t

    const w = Math.min(Math.max(Number(width) || 640, 120), 1600)
    parts.splice(uploadIdx + 1, 0, `f_auto,q_auto,w_${w}`)
    u.pathname = `/${parts.join('/')}`
    return u.toString()
  } catch {
    return t
  }
}
