import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { getFlashDeals, getFlashDealSection } from '../lib/api/baskaroApi'

const FLASH_DEALS_FALLBACK = [
  {
    id: 's25-5g',
    name: 'Samsung S25 5G 12GB 256GB M...',
    price: '₹70,999',
    originalPrice: '₹80,999',
    discount: '12% off',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=640&auto=format&fit=crop',
    linkUrl: '',
  },
  {
    id: 'iphone-15',
    name: 'Apple iPhone 15 128GB Black',
    price: '₹53,999',
    originalPrice: '₹69,900',
    discount: '23% off',
    image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=640&auto=format&fit=crop',
    linkUrl: '',
  },
  {
    id: 'oneplus-13',
    name: 'OnePlus 13 5G 16GB',
    price: '₹70,980',
    originalPrice: '₹86,999',
    discount: '18% off',
    image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=640&auto=format&fit=crop',
    linkUrl: '',
  },
]

function formatInr(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '—'
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(v)
  } catch {
    return `₹${v}`
  }
}

function discountLabel(mrpInr, saleInr) {
  const m = Number(mrpInr)
  const s = Number(saleInr)
  if (!Number.isFinite(m) || m <= 0 || !Number.isFinite(s) || s >= m) return 'Deal'
  const pct = Math.round(((m - s) / m) * 100)
  return `${pct}% off`
}

function mapApiDeal(d) {
  const id = d._id != null ? String(d._id) : d.id
  return {
    id,
    name: d.title || 'Product',
    price: formatInr(d.salePriceInr),
    originalPrice: formatInr(d.mrpInr),
    discount: discountLabel(d.mrpInr, d.salePriceInr),
    image: d.imageUrl || '',
    linkUrl: d.linkUrl || '',
  }
}

export function FlashDealsSection({ title: propTitle }) {
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const [activeTab, setActiveTab] = useState(0)
  const [deals, setDeals] = useState(FLASH_DEALS_FALLBACK)
  const [loading, setLoading] = useState(true)
  const [usedFallback, setUsedFallback] = useState(true)
  const [title, setTitle] = useState(propTitle || 'Brand New Phones')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getFlashDealSection()
      .then((section) => {
        if (cancelled) return
        if (section?.title && !propTitle) setTitle(String(section.title))
      })
      .catch(() => { })
    getFlashDeals()
      .then((list) => {
        if (cancelled) return
        const arr = Array.isArray(list) ? list : []
        if (arr.length > 0) {
          setDeals(arr.map(mapApiDeal))
          setUsedFallback(false)
        } else {
          setDeals([])
          setUsedFallback(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDeals(FLASH_DEALS_FALLBACK)
          setUsedFallback(true)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  function openDealLink(deal, e) {
    if (e) e.stopPropagation()
    if (!deal.linkUrl) return
    if (/^https?:\/\//i.test(deal.linkUrl)) {
      window.open(deal.linkUrl, '_blank', 'noopener,noreferrer')
    } else {
      navigate(deal.linkUrl)
    }
  }

  const CardInner = ({ deal }) => (
    <>
      <div className="relative mb-3 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[1.5rem] bg-gray-50 p-4 transition-all duration-500 group-hover:bg-gray-100">
        <div className="absolute left-0 top-3 z-10">
          <span className="bg-[#ff4d4d] px-3 py-1.5 text-[11px] font-bold text-white rounded-r-lg">
            {deal.discount}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200/50 text-slate-700 transition-all hover:bg-red-600 hover:text-white"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>

        {deal.image ? (
          <img
            src={deal.image}
            alt=""
            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <span className="text-[10px] font-bold text-slate-300">No Image</span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center text-center px-1 pb-2">
        <h3 className="mb-1 line-clamp-2 min-h-[2.5rem] text-[15px] font-bold leading-tight text-slate-900 transition-colors group-hover:text-red-600">
          {deal.name}
        </h3>

        <div className="mt-auto">
          <p className="text-[11px] font-medium text-slate-400 mb-0.5">*best price starts from</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl font-bold text-red-600 tracking-tight">{deal.price}</span>
            <span className="text-sm font-medium text-slate-400 line-through">
              {deal.originalPrice}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full border-2 border-red-600 bg-red-600 py-2 text-[12px] font-bold text-white transition-all duration-300 hover:bg-red-700 hover:border-red-700"
        >
          <Plus className="h-4 w-4" />
          add to cart
        </button>
      </div>
    </>
  )

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-red-950 via-zinc-950 to-black pt-10 pb-6">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="mb-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {title}
            </h2>
            <div className="mt-1 h-[3px] w-[50px] bg-red-600" />
          </div>
          
          <div className="flex gap-2">
             <button
              type="button"
              onClick={() => scroll('left')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-sm transition-all hover:bg-red-600 hover:border-red-600 active:scale-90"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-sm transition-all hover:bg-red-600 hover:border-red-600 active:scale-90"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="h-[300px] w-[170px] shrink-0 animate-pulse rounded-2xl bg-slate-100 sm:w-[190px] md:w-[210px]"
              />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 py-12 text-center">
             <p className="text-sm font-extrabold text-slate-400">No active flash deals.</p>
          </div>
        ) : (
          <div className="relative">

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-4 pt-1 transition-all duration-300 scrollbar-hide"
            >
              {deals.map((deal) => {
                const wrapClass =
                  'group relative flex w-[220px] shrink-0 flex-col rounded-[2rem] bg-white p-3.5 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 sm:w-[240px] md:w-[260px]'
                const clickable = Boolean(deal.linkUrl)
                return (
                  <div
                    key={deal.id}
                    className={[wrapClass, clickable ? 'cursor-pointer' : ''].join(' ')}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onClick={() => openDealLink(deal)}
                    onKeyDown={(e) => {
                      if (!clickable) return
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openDealLink(deal)
                      }
                    }}
                  >
                    <CardInner deal={deal} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
