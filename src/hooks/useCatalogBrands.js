import { useEffect, useState } from 'react'
import { getCatalogPhoneBrands, resolveHomeServiceImageUrl } from '../lib/api/baskaroApi'

/**
 * Phone brands from `GET /api/catalog/phone-brands` (brands that have at least one active model).
 */
export function useCatalogBrands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getCatalogPhoneBrands()
      .then((list) => {
        if (cancelled) return
        const mapped = Array.isArray(list)
          ? list
              .map((b) => {
                const raw = String(b.imageUrl || b.image || '').trim()
                const imageUrl = resolveHomeServiceImageUrl(raw) || raw
                return {
                  name: b.name || '',
                  slug: b.slug || '',
                  logo: imageUrl,
                  logoUrl: imageUrl,
                  id: b._id != null ? String(b._id) : '',
                }
              })
              .filter((b) => b.name)
          : []
        setBrands(mapped)
      })
      .catch((e) => {
        if (!cancelled) setError(e)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { brands, loading, error }
}
