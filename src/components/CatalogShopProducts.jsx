import React, { useEffect, useMemo, useState } from 'react'
import { getCatalogCategoryByRibbon, getProducts } from '../lib/api/baskaroApi.js'
import { mapCatalogProductToCard, normalizeCatalogProductList } from '../lib/mapCatalogProduct.js'
import { ProductCard } from './ProductCard.jsx'

export function CatalogShopProducts({
  ribbonCategoryId = '',
  searchQuery = '',
  title = 'Shop products',
  className = '',
}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setErr('')
      try {
        let catalogCategoryId = ''
        if (ribbonCategoryId) {
          try {
            const linked = await getCatalogCategoryByRibbon(ribbonCategoryId)
            catalogCategoryId = String(linked?._id || linked?.id || '').trim()
          } catch {
            catalogCategoryId = ''
          }
        }

        const params = { limit: '48', page: '1' }
        if (catalogCategoryId) params.categoryId = catalogCategoryId

        const data = await getProducts(params)
        if (cancelled) return

        const rows = normalizeCatalogProductList(data)
          .map(mapCatalogProductToCard)
          .filter(Boolean)

        setProducts(rows)
      } catch (e) {
        if (!cancelled) {
          setProducts([])
          setErr(e?.message || 'Could not load shop products')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [ribbonCategoryId])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => {
      const hay = `${p.title || ''} ${p.brand || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [products, searchQuery])

  if (loading) {
    return (
      <section className={`rounded-3xl border border-slate-100 bg-white p-6 ${className}`}>
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-5 flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 w-[260px] shrink-0 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </section>
    )
  }

  if (err) {
    return (
      <section className={`rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 ${className}`}>
        {err}
      </section>
    )
  }

  if (!filtered.length) return null

  return (
    <section className={`rounded-3xl border border-slate-100 bg-white p-6 ${className}`}>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-black uppercase tracking-widest text-slate-900">{title}</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Products from Catalog Builder — {filtered.length} available
          </p>
        </div>
      </div>
      <div className="-mx-1 flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {filtered.map((product) => (
          <ProductCard key={product.id} {...product} ctaLabel="View product" />
        ))}
      </div>
    </section>
  )
}
