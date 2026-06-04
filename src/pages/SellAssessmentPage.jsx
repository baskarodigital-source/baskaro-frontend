import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getCatalogPhoneBrands, getCatalogModels } from '../lib/api/baskaroApi.js'
import { SellSubShowcaseCarousels } from '../components/SellSubShowcaseCarousels.jsx'

const PHONE_FALLBACK =
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop'

function decodeParam(value) {
  return decodeURIComponent(String(value || '')).trim()
}

function modelPathSlug(name, slug) {
  const fromApi = String(slug || '').trim()
  if (fromApi) return fromApi
  return String(name || '').trim().replace(/\s+/g, '-')
}

function slugMatches(model, modelSlug) {
  const want = decodeParam(modelSlug).toLowerCase()
  const name = model?.modelName || model?.name || ''
  const candidates = [
    modelPathSlug(name, model?.slug).toLowerCase(),
    String(model?.slug || '').toLowerCase(),
    String(name).toLowerCase().replace(/\s+/g, '-'),
    String(model?._id || model?.id || '').toLowerCase(),
  ]
  return candidates.some((c) => c && c === want)
}

function defaultVariantOptions(basePrice) {
  const base = Number(basePrice) || 19450
  return [
    { key: '4gb-64', label: '4 GB/64 GB', price: base },
    { key: '6gb-128', label: '6 GB/128 GB', price: base + 2200 },
  ]
}

export default function SellAssessmentPage() {
  const { brandSlug, modelSlug } = useParams()
  const [searchParams] = useSearchParams()
  const modelIdFromQuery = searchParams.get('modelId')?.trim() || ''
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [model, setModel] = useState(null)
  const [brandLabel, setBrandLabel] = useState('')
  const [error, setError] = useState('')
  const [variantKey, setVariantKey] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      setModel(null)
      setBrandLabel('')
      setVariantKey('')
      try {
        const brandKey = decodeParam(brandSlug)
        const brands = await getCatalogPhoneBrands()
        const brand = Array.isArray(brands)
          ? brands.find((x) => String(x?.name || '').toLowerCase() === brandKey.toLowerCase())
          : null
        if (!brand?._id) {
          if (!cancelled) setError('Brand not found. Go back and pick a brand from Sell Phone.')
          return
        }
        if (!cancelled) setBrandLabel(brand.name)

        const list = await getCatalogModels({ brandId: brand._id })
        const arr = Array.isArray(list) ? list : []
        let found = null
        if (modelIdFromQuery) {
          found = arr.find((m) => String(m._id || m.id) === modelIdFromQuery) || null
        }
        if (!found) {
          found = arr.find((m) => slugMatches(m, modelSlug)) || null
        }
        if (!found) {
          if (!cancelled) setError('Model not found. It may be inactive or removed from the catalog.')
          return
        }
        if (!cancelled) setModel(found)
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Could not load this device. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (brandSlug && (modelSlug || modelIdFromQuery)) load()
    else {
      setLoading(false)
      setError('Invalid sell link. Please choose your device again.')
    }
    return () => {
      cancelled = true
    }
  }, [brandSlug, modelSlug, modelIdFromQuery])

  const variantOptions = useMemo(() => {
    const vs = Array.isArray(model?.storageVariants) ? model.storageVariants : []
    if (vs.length) {
      return vs.map((v, idx) => {
        const label =
          v.ram && v.label ? `${v.ram} / ${v.label}` : String(v.label || v.ram || `Variant ${idx + 1}`)
        return {
          key: `v-${idx}`,
          label,
          price: Number(v.basePrice ?? model?.basePrice) || 0,
        }
      })
    }
    return defaultVariantOptions(model?.basePrice)
  }, [model])

  const selectedVariant = variantOptions.find((v) => v.key === variantKey)
  const itemName = model ? `${brandLabel} ${model.modelName || model.name}`.trim() : ''
  const img = model?.image || PHONE_FALLBACK
  const sold = '19450+'
  const computedPrice = selectedVariant ? String(selectedVariant.price) : ''

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm font-semibold text-slate-500">
        Loading your device…
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg font-bold text-slate-900">Unable to start assessment</p>
        <p className="mt-2 text-sm text-slate-600">{error || 'Device not found.'}</p>
        <Link
          to={brandSlug ? `/brand/${encodeURIComponent(decodeParam(brandSlug))}` : '/sell/phone'}
          className="mt-6 inline-flex rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
        >
          {brandSlug ? 'Back to brand models' : 'Sell phone home'}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-black via-red-900 to-black" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Sell Old {itemName}</h1>
        <nav className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-500">
          <Link to="/" className="hover:text-red-600">
            Home
          </Link>
          <span className="text-slate-300">&gt;</span>
          <Link to="/sell/phone" className="hover:text-red-600">
            Sell Old Mobile Phone
          </Link>
          <span className="text-slate-300">&gt;</span>
          <Link to={`/brand/${encodeURIComponent(brandLabel)}`} className="hover:text-red-600">
            {brandLabel}
          </Link>
          <span className="text-slate-300">&gt;</span>
          <span className="text-slate-800">{model.modelName || model.name}</span>
        </nav>

        <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[220px_1fr] md:items-center">
            <div className="mx-auto flex h-[230px] w-[180px] items-center justify-center rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <img src={img} alt={itemName} className="max-h-full max-w-full object-contain" loading="lazy" />
            </div>
            <div className="min-w-0">
              <h2 className="text-4xl font-bold text-slate-900">{itemName}</h2>
              <p className="mt-3 text-lg font-semibold text-emerald-600">{sold} already sold on Baskaro</p>

              <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
                <p className="text-2xl font-bold text-slate-900">Choose a variant</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:max-w-[520px]">
                  {variantOptions.map((v) => {
                    const active = variantKey === v.key
                    return (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => setVariantKey(v.key)}
                        className={`flex h-12 items-center gap-3 rounded-lg border px-4 text-lg font-bold transition ${
                          active ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-800'
                        }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-full border ${active ? 'border-red-500 bg-red-500' : 'border-slate-300'}`}
                        />
                        {v.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled={!selectedVariant}
                onClick={() =>
                  navigate(
                    `/sell/device-check?item=${encodeURIComponent(`${itemName} ${selectedVariant?.label || ''}`.trim())}&cat=phone&price=${encodeURIComponent(computedPrice)}&img=${encodeURIComponent(img)}&modelId=${encodeURIComponent(String(model._id || model.id || ''))}`,
                  )
                }
                className="mt-4 inline-flex h-12 min-w-[230px] items-center justify-center rounded-lg bg-red-600 px-6 text-xl font-bold text-white transition enabled:hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Get Exact Value <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        </section>

        <SellSubShowcaseCarousels categorySlug="phone" />
      </div>
    </div>
  )
}
