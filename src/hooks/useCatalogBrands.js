import { useEffect, useState } from 'react'
import { getCatalogPhoneBrands } from '../lib/api/baskaroApi'

/**
 * Phone brands from `GET /api/catalog/phone-brands` (filters out accessories-only brands).
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
                const imageUrl = b.imageUrl || ''
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
