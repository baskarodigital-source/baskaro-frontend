import { useNavigate } from 'react-router-dom'
import { Star, ShoppingCart, Check, Heart } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { appAlert } from '../lib/appDialog.js'
import { isMongoObjectId } from '../lib/objectId.js'

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
  inventoryId,
  image,
  title,
  price,
  originalPrice,
  discount,
  rating,
  tag,
  brand = 'BASKARO',
  viewPath = '',
  ctaLabel = 'View Details',
  onCtaClick,
  className = '',
}) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [isAdding, setIsAdding] = useState(false)
  const wishlistKey = id || title
  const wishlisted = wishlistKey ? isWishlisted(wishlistKey) : false
  const cartInventoryId = inventoryId || id
  const canAddToCart = isMongoObjectId(cartInventoryId)

  const priceForWishlist = String(price || '')
    .replace(/₹/g, '')
    .replace(/\s/g, '')
    .trim()
  const tags = normalizeTags(tag)
  const badgeDiscount = discountBadgeText(discount)
  const priceDiscountPct = discountPriceLabel(discount)
  const showOriginal =
    originalPrice &&
    originalPrice !== price &&
    String(originalPrice).trim() !== String(price).trim()

  return (
    <article
      className={`group flex w-[260px] shrink-0 flex-col rounded-2xl border border-slate-100/90 bg-white p-4 shadow-md transition-all duration-300 hover:z-10 hover:scale-[1.02] hover:shadow-xl ${className}`}
    >
      <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100/80 p-4 ring-1 ring-inset ring-slate-100/80">
        {badgeDiscount ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm">
            {badgeDiscount}
          </span>
        ) : null}
        {rating != null && rating !== '' ? (
          <span className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/80">
            <Star
              className="h-3 w-3 fill-amber-400 text-amber-400"
              strokeWidth={0}
              aria-hidden
            />
            <span className="tabular-nums">{rating}</span>
          </span>
        ) : null}
        {wishlistKey ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleWishlist({
                id: wishlistKey,
                name: title,
                price: priceForWishlist,
                img: image,
              })
            }}
            className={`absolute bottom-2 right-2 z-10 rounded-full p-2 shadow-md ring-1 transition ${
              wishlisted ? 'bg-red-50 text-red-600 ring-red-200' : 'bg-white/95 text-slate-500 ring-slate-200 hover:text-red-600'
            }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-600 text-red-600' : ''}`} strokeWidth={2} />
          </button>
        ) : null}
        <div className="flex h-full w-full items-center justify-center">
          <img
            src={image}
            alt={title}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>

      <h3
        title={title}
        className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug tracking-tight text-slate-900"
      >
        {title}
      </h3>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-lg font-bold text-slate-900">{price}</span>
        {showOriginal ? (
          <span className="text-sm font-medium text-slate-400 line-through">
            {originalPrice}
          </span>
        ) : null}
        {priceDiscountPct && showOriginal ? (
          <span className="text-sm font-semibold text-red-600">{priceDiscountPct}</span>
        ) : null}
      </div>

      {tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${TAG_STYLES[i % TAG_STYLES.length]}`}
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}



      <div className="mt-auto pt-3 flex gap-2">
        <button
          type="button"
          onClick={
            onCtaClick ??
            (() => {
              if (viewPath) navigate(viewPath)
              else if (id) navigate(`/product/${id}`)
            })
          }
          className="flex-1 flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/80 px-2 py-2.5 text-[13px] font-bold text-slate-600 transition-all duration-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
        >
          {ctaLabel}
        </button>
        <button
          type="button"
          disabled={isAdding || !canAddToCart}
          onClick={async (e) => {
            e.stopPropagation()
            if (!canAddToCart) {
              appAlert('This demo listing is not connected to live inventory. Open Buy Pre-Owned for in-stock devices.', {
                title: 'Not available',
                variant: 'info',
              })
              if (viewPath) navigate(viewPath)
              return
            }
            setIsAdding(true)
            const result = await addToCart({
              id: cartInventoryId,
              inventoryId: cartInventoryId,
              name: title,
              price: price,
              img: image,
            })
            setIsAdding(false)
            if (result?.error === 'LOGIN_REQUIRED') {
              appAlert('Please log in to reserve and add pre-owned devices to your cart.', {
                title: 'Login required',
                variant: 'info',
              })
              navigate('/login', { state: { from: viewPath || '/cart' } })
              return
            }
            if (result?.error) {
              appAlert(result.error, { title: 'Could not add to cart', variant: 'error' })
              return
            }
            appAlert('Added to cart — reserved for 30 minutes.', { title: 'In your cart', variant: 'success' })
          }}
          className={`flex-1 flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border transition-all duration-300 px-2 py-2.5 text-[13px] font-black uppercase tracking-tight ${
            !canAddToCart
              ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
              : isAdding
              ? 'bg-green-600 border-green-600 text-white'
              : 'border-rose-600 bg-white text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm'
          }`}
        >
          {isAdding ? (
            <>
              <Check size={14} strokeWidth={3} />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingCart size={14} strokeWidth={2.5} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </article>
  )
}
