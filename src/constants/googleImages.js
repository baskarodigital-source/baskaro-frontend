/**
 * High-quality, reliable smartphone product images from Unsplash.
 * These URLs are stable and provide excellent visual quality.
 */

const PHONE_IMAGES = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=640&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=640&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=640&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=640&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=640&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1601784551446-20c9e07cdbab?q=80&w=640&auto=format&fit=crop',
]

/** Rotates through specific mobile phone product shots. */
export function gPhoto(i = 0) {
  const n = Number(i) || 0
  return PHONE_IMAGES[((n % PHONE_IMAGES.length) + PHONE_IMAGES.length) % PHONE_IMAGES.length]
}

/** Homepage / services carousel — Repair Phone (hosted locally in app, not third-party WP CDN). */
export const REPAIR_PHONE_SERVICE_IMAGE = PHONE_IMAGES[4]

/** Site icon from Google's favicon cache (registrable domain, e.g. apple.com). */
export function gBrandLogo(domain) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
}
