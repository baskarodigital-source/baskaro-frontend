import { useNavigate } from 'react-router-dom'
import { Star, ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '../context/CartContext'

const TAG_STYLES = [
  'bg-amber-50 text-amber-800 ring-amber-100',
  'bg-sky-50 text-sky-800 ring-sky-100',
  'bg-rose-50 text-rose-800 ring-rose-100',
  'bg-violet-50 text-violet-800 ring-violet-100',
]

function normalizeTags(tag) {
  if (tag == null) return []
  return Array.isArray(tag) ? tag.filter(Boolean) : [tag]
}

/** Top-left pill: only for numeric / percent-style discounts */
function discountBadgeText(discount) {
  if (discount == null || discount === '') return null
  if (typeof discount === 'number' && discount > 0) return `-${discount}%`
  const s = String(discount).trim()
  if (/^-?\d+(\.\d+)?%$/.test(s)) return s.startsWith('-') ? s : `-${s}`
  return null
}

/** Red text next to prices */
function discountPriceLabel(discount) {
  if (discount == null || discount === '') return null
  if (typeof discount === 'number' && discount > 0) return `${discount}%`
  const s = String(discount).trim()
  if (/^-?\d+(\.\d+)?%$/.test(s)) return s.replace(/^-/, '')
  return null
}

/**
 * @param {{
 *   id?: string
 *   image: string
 *   title: string
 *   price: string
 *   originalPrice?: string
 *   discount?: number | string
 *   rating?: number | string
 *   tag?: string | string[]
 *   brand?: string
 *   ctaLabel?: string
 *   onCtaClick?: () => void
 *   className?: string
 * }} props
 */
export function ProductCard({
  id,
  image,
  title,
  price,
  originalPrice,
  discount,
  rating,
  tag,
  brand = 'BASKARO',
  ctaLabel = 'View Details',
  onCtaClick,
  className = '',
}) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const tags = normalizeTags(tag)
  const badgeDiscount = discountBadgeText(discount)
  const priceDiscountPct = discountPriceLabel(discount)
  const showOriginal =
    originalPrice &&
    originalPrice !== price &&
    String(originalPrice).trim() !== String(price).trim()

  return (
    <article
      onClick={onCtaClick ?? (() => id && navigate(`/product/${id}`))}
      className={`group cursor-pointer flex w-[220px] shrink-0 flex-col rounded-[2rem] bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-xl sm:w-[240px] md:w-[260px] ${className}`}
    >
      <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-gray-100 p-6 transition-all duration-500 group-hover:bg-gray-200">
        {badgeDiscount ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm">
            {badgeDiscount}
          </span>
        ) : null}
        
        <div className="flex h-full w-full items-center justify-center">
          <img
            src={image}
            alt={title}
            className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </div>
      </div>

      <div className="flex flex-col items-center text-center px-2 pb-2">
        <h3
          title={title}
          className="line-clamp-2 min-h-[2.5rem] text-[16px] font-bold leading-tight tracking-tight text-[#1e1b4b] transition-colors group-hover:text-blue-600"
        >
          {title}
        </h3>

        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-xl font-bold text-[#0070c1]">{price}</span>
          {showOriginal ? (
            <span className="text-sm font-medium text-slate-400 line-through">
              {originalPrice}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
