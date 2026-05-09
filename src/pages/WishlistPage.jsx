import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

function isCatalogProductId(id) {
  return /^[a-f0-9]{24}$/i.test(String(id ?? ''))
}

export default function WishlistPage() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { wishlist, wishlistCount, removeFromWishlist, clearWishlist } = useWishlist()

  if (wishlistCount === 0) {
    return (
      <section className="flex min-h-[min(85vh,52rem)] w-full flex-col items-center justify-center bg-white px-4 py-16 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 text-red-600 shadow-inner ring-1 ring-rose-100">
          <Heart className="h-11 w-11 fill-red-600" strokeWidth={1.5} />
        </div>
        <h1 className="mt-8 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Your wishlist is empty</h1>
        <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-500 sm:text-base">
          Save your favorite products and review them any time before checkout.
        </p>
        <Link
          to="/"
          className="mt-10 inline-flex items-center justify-center rounded-xl bg-red-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
        >
          Start exploring
        </Link>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              My Wishlist <span className="ml-1 text-slate-400">({wishlistCount})</span>
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Products you saved for later.
            </p>
          </div>
          <button
            type="button"
            onClick={clearWishlist}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            Clear wishlist
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <article
              key={item.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <button
                type="button"
                onClick={() => removeFromWishlist(item.id)}
                className="ml-auto rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                aria-label={`Remove ${item.name} from wishlist`}
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="mt-1 flex h-44 items-center justify-center rounded-xl bg-slate-50 p-3">
                <img src={item.img} alt={item.name} className="max-h-full max-w-full object-contain" />
              </div>

              <h2 className="mt-4 line-clamp-2 min-h-[2.75rem] text-sm font-bold text-slate-900">
                {item.name}
              </h2>
              <p className="mt-2 text-lg font-black text-red-600">₹{item.price}</p>

              <div className="mt-auto flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    addToCart(item)
                    removeFromWishlist(item.id)
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-600"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={() =>
                    isCatalogProductId(item.id)
                      ? navigate(`/product/${item.id}`)
                      : navigate('/buy-pre-owned')
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {isCatalogProductId(item.id) ? 'View' : 'Browse'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
