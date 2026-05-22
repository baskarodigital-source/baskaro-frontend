import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { getFlashDeals, getFlashDealSection } from '../lib/api/baskaroApi'
import { useWishlist } from '../context/WishlistContext'

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

function wishlistPriceFromDeal(deal) {
  return String(deal.price || '')
    .replace(/₹/g, '')
    .replace(/\s/g, '')
    .trim()
}

function FlashDealCardInner({ deal }) {
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(deal.id)

  return (
    <>
      <span className="absolute left-3 top-3 z-10 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
        {deal.discount}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          toggleWishlist({
            id: deal.id,
            name: deal.name,
            price: wishlistPriceFromDeal(deal),
            img: deal.image,
          })
        }}
        className={`absolute right-3 top-3 z-10 rounded-full p-1.5 shadow-sm transition ${
          wishlisted ? 'bg-red-50 text-red-600' : 'bg-white text-slate-400 hover:text-red-500'
        }`}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-600 text-red-600' : ''}`} />
      </button>

      <div className="mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-2">
        {deal.image ? (
          <img
            src={deal.image}
            alt=""
            className="h-full w-full object-contain transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="text-[10px] font-bold text-slate-400">No image</span>
        )}
      </div>

      <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-[13px] font-bold text-slate-800">{deal.name}</h3>

      <p className="mb-1 text-[10px] font-medium text-slate-400">*best price starts from</p>

      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-sm font-extrabold text-green-600">{deal.price}</span>
        <span className="text-[11px] font-medium text-slate-400 line-through">{deal.originalPrice}</span>
      </div>

      <button
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-900 py-1.5 text-[10px] font-bold text-slate-900 transition-all hover:bg-slate-900 hover:text-white"
      >
        <Plus className="h-3 w-3 stroke-[2.5]" />
        add to cart
      </button>
    </>
  )
}

export function FlashDealsSection() {
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const [activeTab, setActiveTab] = useState(0)
  const [deals, setDeals] = useState(FLASH_DEALS_FALLBACK)
  const [loading, setLoading] = useState(false)
  const [usedFallback, setUsedFallback] = useState(true)
  const [title, setTitle] = useState('Hurry Up! Get Up to 40% Off')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getFlashDealSection()
      .then((section) => {
        if (cancelled) return
        if (section?.title) setTitle(String(section.title))
      })
      .catch(() => {})
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

  return (
    <section className="w-full border-y border-red-950/40 bg-gradient-to-b from-[#6f0006] via-[#230001] to-black py-10">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="mb-6 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setActiveTab(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${i === activeTab ? 'bg-red-500' : 'bg-white/35'}`}
            />
          ))}
        </div>

        <h2 className="mb-8 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>

        {loading ? (
          <div className="flex gap-4 overflow-hidden pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="h-[280px] w-[170px] shrink-0 animate-pulse rounded-2xl bg-white/80 sm:w-[190px] md:w-[210px]"
              />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-red-900/50 bg-black/30 py-12 text-center text-sm font-semibold text-white/70">
            No flash deals yet. Add products in Admin → Offers &amp; Coupons → Homepage flash deals.
          </p>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 p-2 text-white shadow-lg backdrop-blur-sm transition hover:bg-white/20 lg:flex"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 p-2 text-white shadow-lg backdrop-blur-sm transition hover:bg-white/20 lg:flex"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-4 transition-all duration-300 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {deals.map((deal) => {
                const wrapClass =
                  'group relative flex w-[170px] shrink-0 flex-col rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-md sm:w-[190px] md:w-[210px]'
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
                    <FlashDealCardInner deal={deal} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!loading && usedFallback ? (
          <p className="mt-2 text-center text-[11px] text-white/50">
            Could not load deals — showing samples. Check API or add deals in Admin.
          </p>
        ) : null}
      </div>
    </section>
  )
}
