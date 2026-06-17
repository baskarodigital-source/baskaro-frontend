import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, ShieldCheck } from 'lucide-react'
import { getProductById } from '../lib/api/baskaroApi.js'
import {
  formatCatalogInr,
  pickCatalogImage,
  pickCatalogVariant,
} from '../lib/mapCatalogProduct.js'
import { PageSpinner } from '../components/PageSpinner.jsx'

function formatAttributeValue(value) {
  if (value == null || value === '') return '—'
  if (Array.isArray(value)) {
    if (!value.length) return '—'
    if (typeof value[0] === 'object') {
      return `${value.length} file${value.length === 1 ? '' : 's'}`
    }
    return value.join(', ')
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

export default function ShopProductPage() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setErr('')
      try {
        const data = await getProductById(productId)
        if (!cancelled) setProduct(data)
      } catch (e) {
        if (!cancelled) setErr(e?.message || 'Product not found')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [productId])

  const variant = useMemo(() => pickCatalogVariant(product), [product])
  const image = useMemo(() => pickCatalogImage(product, variant), [product, variant])

  const brandName =
    (product?.brandId && typeof product.brandId === 'object' ? product.brandId.name : '') ||
    product?.brand ||
    ''
  const deviceName =
    product?.deviceId && typeof product.deviceId === 'object' ? product.deviceId.name : ''
  const productDescription = product?.description || product?.shortDescription || ''

  const price = Number(variant?.price)
  const compareAt = Number(variant?.compareAtPrice)
  const hasCompare = Number.isFinite(compareAt) && compareAt > price

  if (loading) return <PageSpinner />
  if (err || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-bold text-slate-900">Product not found</p>
        <p className="mt-2 text-sm text-slate-500">{err || 'This product may have been removed.'}</p>
        <Link to="/marketplace" className="mt-6 inline-block text-sm font-semibold text-red-600 hover:text-red-700">
          Back to marketplace
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-xs font-medium text-slate-500">
          <Link to="/" className="hover:text-slate-800">Home</Link>
          <ChevronRight size={14} />
          <Link to="/marketplace" className="hover:text-slate-800">Marketplace</Link>
          <ChevronRight size={14} />
          <span className="truncate text-slate-800">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6">
          <img
            src={image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop'}
            alt={product.name}
            className="mx-auto max-h-[420px] w-full object-contain"
          />
        </div>

        <div className="space-y-5">
          <div>
            {brandName || deviceName ? (
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {[brandName, deviceName].filter(Boolean).join(' · ')}
              </p>
            ) : null}
            <h1 className="mt-1 text-3xl font-black text-slate-900">{product.name}</h1>
            {variant?.title ? <p className="mt-2 text-sm font-medium text-slate-600">{variant.title}</p> : null}
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">{formatCatalogInr(price)}</span>
            {hasCompare ? (
              <span className="text-lg font-medium text-slate-400 line-through">{formatCatalogInr(compareAt)}</span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            {variant?.condition ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                {variant.condition}
              </span>
            ) : null}
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
              {Number(variant?.stock) > 0 ? `${variant.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {Array.isArray(product.attributes) && product.attributes.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Details</h2>
              <dl className="mt-3 space-y-2">
                {product.attributes.map((row, idx) => (
                  <div key={`${row?.attributeId || idx}`} className="flex justify-between gap-4 text-sm">
                    <dt className="font-medium text-slate-500">{row?.name || row?.code || 'Attribute'}</dt>
                    <dd className="text-right font-semibold text-slate-800">{formatAttributeValue(row?.value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {productDescription ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Description</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{productDescription}</p>
            </div>
          ) : null}

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            <ShieldCheck size={18} className="text-emerald-600" />
            Quality-checked product listed from Baskaro Catalog Builder
          </div>
        </div>
      </div>
    </div>
  )
}
