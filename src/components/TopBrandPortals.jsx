import React, { useEffect, useRef, useState } from 'react'
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
  'Cashify Store': {
    brands: STORE_BRAND_PORTALS,
    trendingItems: ['Gurugram', 'Connaught Place', 'Noida', 'Bengaluru'],
  },
}

/**
 * Horizontal “Top Selling Brands” row — same card layout as reference UI; content via `brands` only.
 */
export function TopSellingBrands({
  brands,
  title = 'Top Selling Brands',
  getHref = (brand) => defaultBrandPagePath(brand.name),
  className = '',
}) {
  const scrollerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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
  }, [brands])

  const scrollPrev = () => {
    scrollerRef.current?.scrollBy({ left: -320, behavior: 'smooth' })
  }
  const scrollNext = () => {
    scrollerRef.current?.scrollBy({ left: 320, behavior: 'smooth' })
  }

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
      <div className="mt-8 flex items-center gap-4 relative">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollLeft}
          aria-label="Scroll to previous brands"
          className={[
            'hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition md:inline-flex',
            canScrollLeft
              ? 'border-slate-300 text-slate-700 hover:border-slate-400'
              : 'cursor-not-allowed border-slate-200 text-slate-300 opacity-70',
          ].join(' ')}
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>
        <div
          ref={scrollerRef}
          className="flex flex-1 gap-5 overflow-x-auto pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {brands.map((brand) => {
            const logoSrc = brand.logoUrl || brand.logo || ''
            const key = brand.id || brand.slug || brand.name
            return (
              <Link
                key={key}
                to={getHref(brand)}
                className="group flex min-w-[90px] shrink-0 flex-col items-center text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                  {logoSrc ? (
                    <img
                      src={logoSrc}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 object-contain"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[11px] font-black uppercase text-slate-500">
                      {(brand.name || '?').slice(0, 2)}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[11px] font-bold text-slate-500 group-hover:text-slate-900">{brand.name}</p>
              </Link>
            )
          })}
        </div>
        <button
          type="button"
          onClick={scrollNext}
          disabled={!canScrollRight}
          aria-label="Scroll to more brands"
          className={[
            'hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition md:inline-flex',
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
