import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Watch,
  Tv,
  Wind,
  Laptop,
  Sparkles,
  Headphones,
  Tablet,
  Gift,
  Cpu,
} from 'lucide-react'
import { useRibbonCategories } from '../hooks/useRibbonCategories.js'

const ICON_MAP = {
  smartphone: Smartphone,
  watch: Watch,
  tv: Tv,
  wind: Wind,
  laptop: Laptop,
  sparkles: Sparkles,
  headphones: Headphones,
  tablet: Tablet,
  gift: Gift,
  cpu: Cpu,
}

/** Used only when GET /api/ribbon-categories fails or returns no rows */
const RIBBON_FALLBACK = [
  { _id: 'fb-phone', label: 'Smartphones', iconKey: 'smartphone', path: '/marketplace', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300&auto=format&fit=crop' },
  { _id: 'fb-watch', label: 'Smart Watches', iconKey: 'watch', path: '/marketplace', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop' },
  { _id: 'fb-tv', label: 'Smart TVs', iconKey: 'tv', path: '/marketplace', imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=300&auto=format&fit=crop' },
  { _id: 'fb-ac', label: 'Air Conditioner', iconKey: 'wind', path: '/marketplace', imageUrl: 'https://images.unsplash.com/photo-1585338447937-7082f8fc763d?q=80&w=300&auto=format&fit=crop' },
  { _id: 'fb-laptop', label: 'Laptops', iconKey: 'laptop', path: '/marketplace', imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=300&auto=format&fit=crop' },
  { _id: 'fb-care', label: 'Personal Care', iconKey: 'sparkles', path: '/marketplace', imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=300&auto=format&fit=crop' },
  { _id: 'fb-acc', label: 'Accessories', iconKey: 'headphones', path: '/buy-accessories', imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=300&auto=format&fit=crop' },
  { _id: 'fb-tab', label: 'Tablets', iconKey: 'tablet', path: '/marketplace', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=300&auto=format&fit=crop' },
  { _id: 'fb-gift', label: 'Gift cards', iconKey: 'gift', path: '/marketplace', imageUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=300&auto=format&fit=crop' },
  { _id: 'fb-gadget', label: 'Smart gadgets', iconKey: 'cpu', path: '/marketplace', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300&auto=format&fit=crop' },
]

const FALLBACK_IMG_BY_ICON = Object.fromEntries(RIBBON_FALLBACK.map((x) => [x.iconKey, x.imageUrl]))

function normalizePath(p) {
  if (!p || typeof p !== 'string') return '/marketplace'
  const t = p.trim()
  if (!t) return '/marketplace'
  return t.startsWith('/') ? t : `/${t}`
}

/** Backend ribbon rows: use only saved `imageUrl` — do not swap in stock images by iconKey (or labels look custom but icons look like a different preset). */
function normalizeApiDoc(doc, index) {
  const imageUrl = typeof doc.imageUrl === 'string' && doc.imageUrl.trim() ? doc.imageUrl.trim() : ''
  const iconKey = doc.iconKey || 'smartphone'
  return {
    _id: doc._id ?? doc.id ?? `cat-${index}`,
    label: doc.label || 'Category',
    iconKey,
    path: normalizePath(doc.path),
    imageUrl,
  }
}

/** Static fallback list only: fill missing images from icon presets */
function normalizeFallbackDoc(doc, index) {
  let imageUrl = typeof doc.imageUrl === 'string' && doc.imageUrl.trim() ? doc.imageUrl.trim() : ''
  const iconKey = doc.iconKey || 'smartphone'
  if (!imageUrl && FALLBACK_IMG_BY_ICON[iconKey]) {
    imageUrl = FALLBACK_IMG_BY_ICON[iconKey]
  }
  return {
    _id: doc._id ?? doc.id ?? `cat-${index}`,
    label: doc.label || 'Category',
    iconKey,
    path: normalizePath(doc.path),
    imageUrl,
  }
}

function RibbonCategoryLink({ cat }) {
  const [imgFailed, setImgFailed] = useState(false)
  const Icon = ICON_MAP[cat.iconKey] ?? Smartphone
  const imageUrl = cat.imageUrl
  const showImg = Boolean(imageUrl) && !imgFailed
  const isMarketplaceHub = cat.path === '/marketplace' || cat.path === '/buy-pre-owned'
  const to = isMarketplaceHub
    ? { pathname: '/marketplace', search: `?categoryId=${encodeURIComponent(String(cat._id ?? ''))}` }
    : cat.path

  return (
    <Link
      to={to}
      className="group flex flex-col items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
    >
      <div className="relative">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-slate-200/80 transition-all duration-300 group-hover:shadow-md sm:h-14 sm:w-14 lg:h-16 lg:w-16">
          {showImg ? (
            <img
              src={imageUrl}
              alt={cat.label}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-2">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-slate-50 to-slate-100 ring-1 ring-slate-200/80 transition-transform duration-300 group-hover:scale-105 group-hover:from-rose-50/80 group-hover:to-slate-50">
                <Icon
                  className="h-[42%] w-[42%] text-slate-700 transition-colors group-hover:text-rose-600 sm:h-[44%] sm:w-[44%]"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>
            </div>
          )}
        </div>
        <div className="absolute inset-0 -z-10 rounded-full bg-blue-600/0 blur-lg transition-all duration-500 group-hover:bg-blue-600/5" />
      </div>
      <span className="whitespace-nowrap text-center text-[10px] font-black tracking-tight text-white/90 transition-colors duration-300 group-hover:text-white sm:text-[11px] lg:text-[12px]">
        {cat.label}
      </span>
    </Link>
  )
}

/**
 * @param {{ variant?: 'bar' | 'embedded' }} props
 */
export function CategoryRibbon({ variant = 'bar' }) {
  const scrollRef = useRef(null)
  const { categories: apiRows, loading, error, fetchOk } = useRibbonCategories()

  const apiNormalized = fetchOk ? apiRows.map((d, i) => normalizeApiDoc(d, i)) : []
  const fallbackNormalized = RIBBON_FALLBACK.map((x, i) => normalizeFallbackDoc(x, i))
  const ribbonCategories = fetchOk ? apiNormalized : fallbackNormalized

  /** API returned successfully but no active categories — hide strip instead of showing demo list */
  if (!loading && fetchOk && ribbonCategories.length === 0) {
    return null
  }

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const displayList = loading
    ? Array.from({ length: 10 }).map((_, i) => ({ _id: `sk-${i}`, label: '', iconKey: 'smartphone', path: '/', imageUrl: '' }))
    : ribbonCategories

  const outer =
    variant === 'embedded'
      ? 'relative w-full rounded-2xl border border-red-900/40 bg-gradient-to-r from-black via-zinc-950 to-red-900 py-3 shadow-sm sm:py-4'
      : 'relative w-full border-b border-red-900/40 bg-gradient-to-r from-black via-zinc-950 to-red-900 py-2.5 sm:py-3.5'

  return (
    <section className={outer} aria-label="Shop by category">
      {error && (
        <span className="sr-only">
          Category list could not be loaded from the server. Showing default categories.
        </span>
      )}
      <div className={variant === 'embedded' ? 'w-full px-2 sm:px-4' : 'w-full px-4 sm:px-8 lg:px-20'}>
        <div className="group relative">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute -left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 opacity-0 shadow-lg ring-1 ring-slate-200 transition-all hover:scale-105 group-hover:opacity-100 sm:h-10 sm:w-10 lg:-left-4"
            aria-label="Scroll categories left"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute -right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 opacity-0 shadow-lg ring-1 ring-slate-200 transition-all hover:scale-105 group-hover:opacity-100 sm:h-10 sm:w-10 lg:-right-4"
            aria-label="Scroll categories right"
          >
            <ChevronRight size={20} />
          </button>

          <div
            ref={scrollRef}
            className="flex items-center gap-5 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-8 md:justify-center lg:gap-12"
          >
            {loading
              ? displayList.map((_, i) => (
                  <div
                    key={`ribbon-skel-${i}`}
                    className="flex flex-col items-center gap-2"
                    aria-hidden
                  >
                    <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200/90 sm:h-14 sm:w-14 lg:h-16 lg:w-16" />
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-200/90 sm:w-20" />
                  </div>
                ))
              : displayList.map((cat) => <RibbonCategoryLink key={String(cat._id)} cat={cat} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
