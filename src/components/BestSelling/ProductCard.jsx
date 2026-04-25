import React from 'react'
import { Plus, Heart } from 'lucide-react'
import { DiscountBadge } from './DiscountBadge'
/**
 * @param {{
 *   image: string
 *   name: string
 *   price: string
 *   originalPrice?: string
 *   discount?: number | string
 * }} props
 */
export function ProductCard({
  image,
  name,
  price,
  originalPrice,
  discount,
  onClick,
}) {
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer flex w-[220px] shrink-0 snap-start flex-col rounded-[2rem] bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-xl sm:w-[240px] md:w-[260px]"
    >
      <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-gray-100 p-6 transition-all duration-500 group-hover:bg-gray-200">
        <DiscountBadge discount={discount} />

        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-blue-900/40 opacity-0 transition-all hover:text-red-600 group-hover:opacity-100"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>

        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <span className="text-[10px] font-bold text-slate-300">No Image</span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center px-2 pb-2 text-center">
        <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-[16px] font-bold leading-tight text-[#1e1b4b] transition-colors group-hover:text-blue-600">
          {name}
        </h3>

        <div className="flex items-center justify-center gap-2 mt-auto">
          <span className="text-xl font-bold text-[#0070c1] tracking-tight">{price}</span>
          {originalPrice && (
            <span className="text-sm font-medium text-slate-400 line-through">
              {originalPrice}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex w-[140px] shrink-0 snap-start flex-col sm:w-[160px] md:w-[180px]">
      <div className="animate-pulse">
        <div className="mb-4 aspect-[5/4] w-full bg-slate-200" />
        <div className="px-0.5 space-y-2">
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-4/5 rounded bg-slate-200" />
          <div className="mt-4 pt-1">
            <div className="h-2 w-16 mb-1 rounded bg-slate-200" />
            <div className="flex items-baseline gap-2">
              <div className="h-5 w-16 rounded bg-slate-300" />
              <div className="h-3 w-10 rounded bg-slate-200" />
            </div>
          </div>
          <div className="mt-4 h-9 w-full rounded bg-slate-300" />
        </div>
      </div>
    </div>
  )
}

