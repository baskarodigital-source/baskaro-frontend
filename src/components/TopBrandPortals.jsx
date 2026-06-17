import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { gBrandLogo } from '../constants/googleImages'

/** Default route used by portal + service pages for a brand hub */
export function defaultBrandPagePath(brandName) {
  return `/brand/${encodeURIComponent(brandName)}`
}

/** Phone — layout fixed; swap entries to change content only */
export const PHONE_BRAND_PORTALS = [
  { name: 'Samsung', logoUrl: gBrandLogo('samsung.com') },
  { name: 'OPPO', logoUrl: gBrandLogo('oppo.com') },
  { name: 'Itel', logoUrl: gBrandLogo('itel-life.com') },
  { name: 'Nokia', logoUrl: gBrandLogo('nokia.com') },
  { name: 'Realme', logoUrl: gBrandLogo('realme.com') },
  { name: 'Apple', logoUrl: gBrandLogo('apple.com') },
  { name: 'Xiaomi', logoUrl: gBrandLogo('mi.com') },
  { name: 'OnePlus', logoUrl: gBrandLogo('oneplus.com') },
  { name: 'Tecno', logoUrl: gBrandLogo('tecno-mobile.com') },
  { name: 'Vivo', logoUrl: gBrandLogo('vivo.com') },
  { name: 'Google Pixel', logoUrl: gBrandLogo('google.com') },
]

export const LAPTOP_TABLET_BRAND_PORTALS = [
  { name: 'Apple', logoUrl: gBrandLogo('apple.com') },
  { name: 'Dell', logoUrl: gBrandLogo('dell.com') },
  { name: 'HP', logoUrl: gBrandLogo('hp.com') },
  { name: 'Lenovo', logoUrl: gBrandLogo('lenovo.com') },
  { name: 'Asus', logoUrl: gBrandLogo('asus.com') },
  { name: 'Acer', logoUrl: gBrandLogo('acer.com') },
  { name: 'Microsoft', logoUrl: gBrandLogo('microsoft.com') },
  { name: 'Samsung', logoUrl: gBrandLogo('samsung.com') },
]

export const REPAIR_BRAND_PORTALS = [
  { name: 'Apple', logoUrl: gBrandLogo('apple.com') },
  { name: 'Samsung', logoUrl: gBrandLogo('samsung.com') },
  { name: 'OnePlus', logoUrl: gBrandLogo('oneplus.com') },
  { name: 'Xiaomi', logoUrl: gBrandLogo('mi.com') },
  { name: 'Vivo', logoUrl: gBrandLogo('vivo.com') },
  { name: 'OPPO', logoUrl: gBrandLogo('oppo.com') },
  { name: 'Realme', logoUrl: gBrandLogo('realme.com') },
  { name: 'Google Pixel', logoUrl: gBrandLogo('google.com') },
]

export const RECYCLE_BRAND_PORTALS = [
  { name: 'Apple', logoUrl: gBrandLogo('apple.com') },
  { name: 'Samsung', logoUrl: gBrandLogo('samsung.com') },
  { name: 'Sony', logoUrl: gBrandLogo('sony.com') },
  { name: 'LG', logoUrl: gBrandLogo('lg.com') },
  { name: 'Dell', logoUrl: gBrandLogo('dell.com') },
  { name: 'HP', logoUrl: gBrandLogo('hp.com') },
  { name: 'Lenovo', logoUrl: gBrandLogo('lenovo.com') },
  { name: 'Xiaomi', logoUrl: gBrandLogo('mi.com') },
]

export const FIND_NEW_PHONE_BRAND_PORTALS = PHONE_BRAND_PORTALS

export const STORE_BRAND_PORTALS = [
  { name: 'Apple', logoUrl: gBrandLogo('apple.com') },
  { name: 'Samsung', logoUrl: gBrandLogo('samsung.com') },
  { name: 'Xiaomi', logoUrl: gBrandLogo('mi.com') },
  { name: 'OnePlus', logoUrl: gBrandLogo('oneplus.com') },
  { name: 'Vivo', logoUrl: gBrandLogo('vivo.com') },
  { name: 'OPPO', logoUrl: gBrandLogo('oppo.com') },
  { name: 'Realme', logoUrl: gBrandLogo('realme.com') },
  { name: 'Google Pixel', logoUrl: gBrandLogo('google.com') },
]

/** Keys must match `CATEGORY_DATA` in LandingPage (All Categories dropdown). */
export const MARKETPLACE_PORTAL_CONTENT = {
  Phone: {
    brands: PHONE_BRAND_PORTALS,
    trendingItems: ['iPhone 16 Pro Max', 'Galaxy S24 Ultra', 'OnePlus 12', 'Pixel 9 Pro'],
  },
  More: {
    brands: LAPTOP_TABLET_BRAND_PORTALS,
    trendingItems: ['MacBook Air M3', 'ThinkPad X1', 'Surface Laptop', 'Galaxy Tab S9'],
  },
  Repair: {
    brands: REPAIR_BRAND_PORTALS,
    trendingItems: ['Screen replacement', 'Battery swap', 'Charging port fix', 'Back glass repair'],
  },
  Recycle: {
    brands: RECYCLE_BRAND_PORTALS,
    trendingItems: ['Smartphones', 'Laptops', 'Tablets', 'Accessories'],
  },
  'Find New Phone': {
    brands: FIND_NEW_PHONE_BRAND_PORTALS,
    trendingItems: ['iPhone 16', 'Galaxy S25', 'Pixel 9', 'Nothing Phone (3)'],
  },
  'Baskaro Store': {
    brands: STORE_BRAND_PORTALS,
    trendingItems: ['Gurugram', 'Connaught Place', 'Noida', 'Bengaluru'],
  },
}

/** Accept API objects or plain brand name strings from static fallbacks */
function normalizeBrandEntry(brand, index) {
  if (typeof brand === 'string') {
    const name = brand.trim()
    return {
      name,
      id: `brand-${index}-${name}`,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      logoUrl: '',
      logo: '',
    }
  }
  const name = String(brand?.name ?? '').trim()
  const id = brand?.id != null && String(brand.id) !== '' ? String(brand.id) : ''
  const slug = String(brand?.slug ?? '').trim()
  const logoUrl = brand?.logoUrl || brand?.logo || ''
  return {
    name,
    id: id || slug || name || `brand-${index}`,
    slug,
    logoUrl,
    logo: logoUrl,
  }
}

/**
 * Horizontal “Top Selling Brands” row — same card layout as reference UI; content via `brands` only.
 */
function BrandRailSkeleton({ count = 10 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`brand-skel-${i}`}
          className="flex min-w-[96px] shrink-0 flex-col items-center text-center"
          aria-hidden
        >
          <div className="flex h-[92px] w-[92px] animate-pulse items-center justify-center rounded-full bg-[#f6f3ec]">
            <div className="h-[52px] w-[52px] rounded-full bg-slate-200/80" />
          </div>
          <div className="mt-3 h-4 w-16 max-w-full animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </>
  )
}

export function TopSellingBrands({
  brands = [],
  loading = false,
  title = 'Shop Phone by Brand',
  getHref = (brand) => defaultBrandPagePath(brand.name),
  className = '',
}) {
  const scrollerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const brandItems = useMemo(
    () => (Array.isArray(brands) ? brands : []).map(normalizeBrandEntry),
    [brands],
  )

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      setCanScrollLeft(el.scrollLeft > 2)
      setCanScrollRight(el.scrollLeft < max - 2)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [brandItems])

  const scrollPrev = () => {
    scrollerRef.current?.scrollBy({ left: -320, behavior: 'smooth' })
  }
  const scrollNext = () => {
    scrollerRef.current?.scrollBy({ left: 320, behavior: 'smooth' })
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollLeft}
            aria-label="Scroll to previous brands"
            className={[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition',
              canScrollLeft
                ? 'border-slate-300 text-slate-600 hover:border-slate-400'
                : 'cursor-not-allowed border-slate-200 text-slate-300 opacity-70',
            ].join(' ')}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.2} aria-hidden />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollRight}
            aria-label="Scroll to more brands"
            className={[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition',
              canScrollRight
                ? 'border-slate-300 text-slate-600 hover:border-slate-400'
                : 'cursor-not-allowed border-slate-200 text-slate-300 opacity-70',
            ].join(' ')}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.2} aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-7 flex items-center gap-4 relative">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollLeft}
          aria-label="Scroll to previous brands"
          className={[
            'hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition lg:inline-flex',
            canScrollLeft
              ? 'border-slate-300 text-slate-700 hover:border-slate-400'
              : 'cursor-not-allowed border-slate-200 text-slate-300 opacity-70',
          ].join(' ')}
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>
        <div
          ref={scrollerRef}
          className="flex flex-1 gap-7 overflow-x-auto pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loading ? (
            <BrandRailSkeleton count={10} />
          ) : brandItems.length === 0 ? (
            <p className="py-6 text-sm font-semibold text-slate-500">No brands available yet. Check back soon.</p>
          ) : (
            brandItems.map((brand, index) => {
              const logoSrc = brand.logoUrl || brand.logo || ''
              return (
                <Link
                  key={brand.id || `brand-${index}`}
                  to={getHref(brand)}
                  className="group flex min-w-[96px] shrink-0 flex-col items-center text-center"
                >
                  <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[#f6f3ec] transition group-hover:-translate-y-0.5">
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt=""
                        loading="lazy"
                        className="h-[52px] w-[52px] object-contain"
                      />
                    ) : (
                      <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-slate-100 text-xs font-black uppercase text-slate-500">
                        {(brand.name || '?').slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-base font-bold text-slate-600 group-hover:text-slate-900">{brand.name}</p>
                </Link>
              )
            })
          )}
        </div>
        <button
          type="button"
          onClick={scrollNext}
          disabled={!canScrollRight}
          aria-label="Scroll to more brands"
          className={[
            'hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition lg:inline-flex',
            canScrollRight
              ? 'border-slate-300 text-slate-700 hover:border-slate-400'
              : 'cursor-not-allowed border-slate-200 text-slate-300 opacity-70',
          ].join(' ')}
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  )
}

/**
 * Same layout for every category — pass `brands` and optional `trendingItems` to change content only.
 */
export function TopBrandPortals({
  brands,
  onBrandClick,
  onViewAllClick,
  title = 'Top Brand Portals',
  viewAllLabel = 'View All Brands',
  trendingTitle = 'Trending Now',
  trendingItems = [],
}) {
  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{title}</h4>
          <button
            type="button"
            onClick={onViewAllClick}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            {viewAllLabel}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {brands.map((brand) => (
            <button
              key={brand.name}
              type="button"
              onClick={() => onBrandClick?.(brand)}
              className="flex items-center gap-3 text-left group"
            >
              <div className="h-8 w-8 rounded-lg bg-slate-50 p-1.5 group-hover:bg-rose-50 transition-colors">
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              </div>
              <span className="text-[14px] font-bold text-slate-600 group-hover:text-rose-600 transition-colors tracking-tight">
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {trendingItems.length > 0 && (
        <div className="pt-8 border-t border-slate-50">
          <h4 className="text-base font-black text-slate-900 mb-6 uppercase tracking-tight">{trendingTitle}</h4>
          <div className="grid grid-cols-2 gap-4">
            {trendingItems.map((label) => (
              <button
                key={label}
                type="button"
                className="flex items-center gap-2 text-left text-[14px] font-bold text-slate-500 hover:text-rose-600 transition-colors"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
