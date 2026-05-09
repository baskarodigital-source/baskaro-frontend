import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { SellSubShowcaseCarousels } from '../components/SellSubShowcaseCarousels'

const PHONE_FALLBACK =
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop'

const VARIANT_OPTIONS = ['4 GB/64 GB', '6 GB/128 GB']

function estimateFromVariant(base, variant) {
  const basePrice = Number(String(base || '19450').replace(/,/g, '')) || 19450
  if (variant === '6 GB/128 GB') return String(basePrice + 2200)
  return String(basePrice)
}

export default function SellModelDetailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const item = searchParams.get('item')?.trim() || 'Selected model'
  const cat = searchParams.get('cat')?.trim() || 'phone'
  const img = searchParams.get('img')?.trim() || PHONE_FALLBACK
  const sold = searchParams.get('sold')?.trim() || '19450+'
  const basePrice = searchParams.get('price')?.trim() || '19450'
  const [variant, setVariant] = useState('')

  const pageTitle = `Sell Old ${item}`
  const computedPrice = useMemo(() => estimateFromVariant(basePrice, variant), [basePrice, variant])

  return (
    <div className="min-h-screen bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-black via-red-900 to-black" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">{pageTitle}</h1>
        <nav className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-500">
          <Link to="/" className="hover:text-red-600">Home</Link>
          <span className="text-slate-300">&gt;</span>
          <Link to="/sell/phone" className="hover:text-red-600">Sell Old Mobile Phone</Link>
          <span className="text-slate-300">&gt;</span>
          <span className="text-slate-800">{pageTitle}</span>
        </nav>

        <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[220px_1fr] md:items-center">
            <div className="mx-auto flex h-[230px] w-[180px] items-center justify-center rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <img src={img} alt={item} className="max-h-full max-w-full object-contain" loading="lazy" />
            </div>
            <div className="min-w-0">
              <h2 className="text-4xl font-bold text-slate-900">{item}</h2>
              <p className="mt-3 text-emerald-600 text-lg font-semibold">{sold} already sold on Baskaro</p>

              <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
                <p className="text-2xl font-bold text-slate-900">Choose a variant</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:max-w-[520px]">
                  {VARIANT_OPTIONS.map((v) => {
                    const active = variant === v
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setVariant(v)}
                        className={`flex h-12 items-center gap-3 rounded-lg border px-4 text-lg font-bold transition ${
                          active ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-800'
                        }`}
                      >
                        <span className={`h-5 w-5 rounded-full border ${active ? 'border-red-500 bg-red-500' : 'border-slate-300'}`} />
                        {v}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled={!variant}
                onClick={() =>
                  navigate(
                    `/sell/device-check?item=${encodeURIComponent(`${item} ${variant}`)}&cat=${encodeURIComponent(cat)}&price=${encodeURIComponent(computedPrice)}&img=${encodeURIComponent(img)}`,
                  )
                }
                className="mt-4 inline-flex h-12 min-w-[230px] items-center justify-center rounded-lg bg-red-600 px-6 text-xl font-bold text-white transition enabled:hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Get Exact Value <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        </section>

        <SellSubShowcaseCarousels categorySlug={cat} />
      </div>
    </div>
  )
}
