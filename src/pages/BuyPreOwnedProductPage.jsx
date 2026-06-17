import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Heart,
  Share2,
  ShoppingCart,
  CreditCard,
  Wallet,
  Truck,
  BadgeIndianRupee,
  ChevronRightCircle,
  Smile,
  Award,
  Calendar,
  ShieldCheck,
  Store,
  Check,
  ArrowRight,
  Star,
} from 'lucide-react'
import { gPhoto } from '../constants/googleImages'
import { getOffers, getInventoryById } from '../lib/api/baskaroApi.js'
import { useCart } from '../context/CartContext'
import { appAlert } from '../lib/appDialog.js'
import { isLoggedIn } from '../lib/auth.js'

function rupee(n) {
  return Number(n || 0).toLocaleString('en-IN')
}

function StarRow({ value, className = '' }) {
  const n = Math.min(5, Math.max(0, Math.round(Number(value) || 0)))
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${i <= n ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
    </span>
  )
}

const REVIEW_DISTRIBUTION = [
  { stars: 5, pct: 62 },
  { stars: 4, pct: 24 },
  { stars: 3, pct: 9 },
  { stars: 2, pct: 3 },
  { stars: 1, pct: 2 },
]

const SAMPLE_REVIEWS = [
  {
    name: 'Rahul K.',
    date: 'Mar 2025',
    rating: 5,
    title: 'Exactly as described',
    body: 'Condition matched the Fair grade — battery health was good and the screen had only minor marks. Delivery was quick and packaging was neat.',
    verified: true,
  },
  {
    name: 'Ananya S.',
    date: 'Feb 2025',
    rating: 4,
    title: 'Solid value',
    body: 'Happy with the price vs a new phone. Camera and performance are fine for daily use. Support answered my questions before I ordered.',
    verified: true,
  },
  {
    name: 'Vikram P.',
    date: 'Jan 2025',
    rating: 5,
    title: 'Would buy refurbished again',
    body: 'Warranty card was in the box as promised. Device was reset and ready to set up. No surprises.',
    verified: true,
  },
]

/** Zoom-lens style callout on product shots (red ring matches site accent). */
function GradeLensShot({ src, caption, lensPosition = '50% 45%' }) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-sky-50/60 p-2 sm:p-3">
      <img src={src} alt="" className="mx-auto h-32 w-full object-contain object-top sm:h-36" />
      <div
        className="pointer-events-none absolute bottom-2 right-2 flex flex-col items-center sm:bottom-3 sm:right-3"
        aria-hidden
      >
        <div className="relative h-11 w-11 overflow-hidden rounded-full border-[3px] border-red-500 bg-white shadow-md sm:h-12 sm:w-12">
          <img
            src={src}
            alt=""
            className="absolute left-1/2 top-1/2 h-[240%] w-[240%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
            style={{ objectPosition: lensPosition }}
          />
        </div>
        {caption ? (
          <span className="mt-1.5 max-w-[5.5rem] text-center text-[10px] font-medium leading-tight text-slate-600">
            {caption}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function buildGradeExplainedModel() {
  const p = (i) => gPhoto(i)
  return {
    Superb: {
      items: [
        { key: 'overall', label: 'Overall', body: 'No functional defects', photos: null },
        {
          key: 'screen',
          label: 'Screen Glass',
          body: 'Minimal scratches that are barely noticeable only when the screen is off.',
          photos: [
            { src: p(1), lensPosition: '32% 22%', caption: 'Micro-scratches' },
            { src: p(2), lensPosition: '68% 72%', caption: 'Micro-scratches' },
          ],
        },
        {
          key: 'display',
          label: 'Display',
          body: 'Perfect condition.',
          photos: [{ src: p(3), lensPosition: '48% 68%', caption: null }],
          singleCol: true,
        },
      ],
      chrome: {
        body: 'Minor signs of wear and light scratches. Invisible from a 20 cm distance.',
        photos: [
          { src: p(1), lensPosition: '44% 36%', caption: null },
          { src: p(2), lensPosition: '56% 50%', caption: null },
          { src: p(4), lensPosition: '50% 58%', caption: null },
        ],
      },
    },
    Good: {
      items: [
        {
          key: 'overall',
          label: 'Overall',
          body: 'Fully functional; light cosmetic wear only.',
          photos: null,
        },
        {
          key: 'screen',
          label: 'Screen Glass',
          body: 'Light scratches visible when the display is off; fine in daily use.',
          photos: [
            { src: p(1), lensPosition: '50% 40%', caption: 'Light wear' },
            { src: p(5), lensPosition: '40% 55%', caption: 'Light wear' },
          ],
        },
        {
          key: 'display',
          label: 'Display',
          body: 'May show minor shadowing; no dead pixels.',
          photos: [{ src: p(3), lensPosition: '52% 50%', caption: null }],
          singleCol: true,
        },
      ],
      chrome: {
        body: 'Visible scratches or scuffs on edges; does not affect buttons or grip.',
        photos: [
          { src: p(2), lensPosition: '38% 42%', caption: null },
          { src: p(1), lensPosition: '62% 48%', caption: null },
          { src: p(3), lensPosition: '45% 60%', caption: null },
        ],
      },
    },
    Fair: {
      items: [
        {
          key: 'overall',
          label: 'Overall',
          body: 'Works well; cosmetic wear is more noticeable.',
          photos: null,
        },
        {
          key: 'screen',
          label: 'Screen Glass',
          body: 'Scratches visible when the display is on or off.',
          photos: [
            { src: p(1), lensPosition: '50% 45%', caption: 'Scratches' },
            { src: p(2), lensPosition: '35% 60%', caption: 'Scratches' },
          ],
        },
        {
          key: 'display',
          label: 'Display',
          body: 'May show slight discolouration; fully usable.',
          photos: [{ src: p(4), lensPosition: '50% 55%', caption: null }],
          singleCol: true,
        },
      ],
      chrome: {
        body: 'Clear scuffs on frame or back — best value if you use a case.',
        photos: [
          { src: p(5), lensPosition: '36% 38%', caption: null },
          { src: p(2), lensPosition: '64% 52%', caption: null },
          { src: p(1), lensPosition: '48% 65%', caption: null },
        ],
      },
    },
  }
}

const GRADE_EXPLAINED = buildGradeExplainedModel()

function isMongoObjectId(value) {
  return /^[a-f0-9]{24}$/i.test(String(value || '').trim())
}

export default function BuyPreOwnedProductPage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const [searchParams] = useSearchParams()
  const modelIdFromQuery = searchParams.get('modelId') || ''
  const { addToCart } = useCart()

  const [inventory, setInventory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [adding, setAdding] = useState(false)

  const name = inventory?.title || searchParams.get('name') || 'Refurbished Device'
  const img = inventory?.imageUrl || searchParams.get('img') || gPhoto(0)
  const rating = searchParams.get('rating') || '4.4'
  const price = inventory?.price ?? Number(searchParams.get('price') || 16099)
  const mrp = Number(searchParams.get('mrp') || Math.round(price * 1.12))

  const gallery = inventory?.images?.length ? inventory.images : [img, gPhoto(1), gPhoto(2), gPhoto(3)]
  const [activeImg, setActiveImg] = useState(gallery[0])
  const condition = inventory?.conditionLabel || 'Fair'
  const [offers, setOffers] = useState([])
  const [offersLoading, setOffersLoading] = useState(true)

  const gradeContent = GRADE_EXPLAINED[condition] ?? GRADE_EXPLAINED.Fair
  const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0
  const canPurchase = inventory?.available !== false && !inventory?.isSold

  useEffect(() => {
    if (!isMongoObjectId(productId)) {
      setLoadError('Invalid product')
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getInventoryById(productId)
      .then((data) => {
        if (cancelled) return
        setInventory(data)
        setLoadError('')
        if (data?.imageUrl) setActiveImg(data.imageUrl)
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err?.message || 'Could not load product')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [productId])

  const handleAddToCart = useCallback(async () => {
    if (!isLoggedIn()) {
      appAlert('Please log in to add this device to your cart.', { title: 'Login required', variant: 'info' })
      navigate('/login', { state: { from: window.location.pathname + window.location.search } })
      return
    }
    if (!canPurchase) {
      appAlert('This device is no longer available.', { variant: 'error' })
      return
    }
    setAdding(true)
    const result = await addToCart({
      id: productId,
      inventoryId: productId,
      name,
      price: String(price),
      img,
    })
    setAdding(false)
    if (result?.error) {
      appAlert(result.error, { title: 'Could not add to cart', variant: 'error' })
      return
    }
    appAlert('Added to cart — reserved for 30 minutes.', { title: 'In your cart', variant: 'success' })
  }, [addToCart, canPurchase, img, name, navigate, price, productId])

  const handleBuyNow = useCallback(async () => {
    await handleAddToCart()
    navigate('/cart')
  }, [handleAddToCart, navigate])

  useEffect(() => {
    let cancelled = false
    async function loadOffers() {
      setOffersLoading(true)
      try {
        const params = isMongoObjectId(modelIdFromQuery) ? { modelId: modelIdFromQuery } : {}
        const list = await getOffers(params)
        if (!cancelled) setOffers(Array.isArray(list) ? list : [])
      } catch {
        if (!cancelled) setOffers([])
      } finally {
        if (!cancelled) setOffersLoading(false)
      }
    }
    loadOffers()
    return () => {
      cancelled = true
    }
  }, [modelIdFromQuery, productId])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm font-semibold text-slate-500">
        Loading product…
      </div>
    )
  }

  if (loadError && !inventory) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg font-bold text-slate-900">{loadError}</p>
        <Link to="/buy-pre-owned" className="mt-4 inline-block text-sm font-semibold text-red-600 hover:underline">
          Back to pre-owned phones
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <nav className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-500">
          <Link to="/" className="hover:text-red-600">Home</Link>
          <span className="text-slate-300">&gt;</span>
          <Link to="/buy-pre-owned" className="hover:text-red-600">Buy Refurbished Mobile Phone</Link>
          <span className="text-slate-300">&gt;</span>
          <span className="text-slate-900">{name}</span>
        </nav>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <div className="grid grid-cols-[56px_1fr] items-start gap-3 sm:grid-cols-[72px_1fr]">
            <div className="space-y-2">
              {gallery.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setActiveImg(g)}
                  className={`flex h-16 w-14 items-center justify-center rounded-lg border bg-white sm:h-20 sm:w-16 ${
                    activeImg === g ? 'border-slate-900' : 'border-slate-200'
                  }`}
                >
                  <img src={g} alt="" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img src={activeImg} alt={name} className="h-full w-full object-contain object-top p-3 sm:p-4" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold leading-snug text-slate-900 sm:text-2xl">{name}</h1>
                <p className="mt-1 text-sm font-semibold text-slate-500 sm:text-base">
                  Baskaro Warranty · {condition}
                  {inventory?.availability === 'RESERVED' ? ' · Currently reserved' : ''}
                </p>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <button className="rounded-full border p-2 hover:text-red-600"><Heart size={18} /></button>
                <button className="rounded-full border p-2 hover:text-slate-700"><Share2 size={18} /></button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white sm:text-sm">{rating} ★</span>
              <span className="text-sm font-semibold text-slate-500">177 reviews</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-lg font-semibold text-rose-600">-{discountPct}%</span>
              <span className="text-3xl font-bold tabular-nums text-slate-900 sm:text-4xl">₹{rupee(price)}</span>
              <span className="text-sm font-medium text-slate-400 line-through">₹{rupee(mrp)}</span>
            </div>

            <div className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white">
              Member price: ₹{rupee(Math.max(0, price - 600))}
            </div>
            <p className="text-sm text-slate-700 sm:text-base">₹1,395/month EMI available.</p>

            <div className="rounded-xl border border-slate-200 p-4">
              <h2 className="text-base font-semibold text-slate-900">This exact device</h2>
              <p className="mt-2 text-sm text-slate-600">
                Pre-owned units are unique — condition, price, and photos match this specific inventory item.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                  Condition: {condition}
                </span>
                {inventory?.conditionGrade ? (
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                    Grade: {inventory.conditionGrade}
                  </span>
                ) : null}
                <span
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${canPurchase ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-100 text-slate-500'}`}
                >
                  {canPurchase ? 'In stock — 1 unit' : 'Not available'}
                </span>
              </div>
              <div className="mt-3 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white">
                All devices have a default 6 Months warranty out of the box
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Save extra on buying these together</h3>
              <p className="mt-1 text-sm font-medium text-emerald-600">Up to ₹150 extra off</p>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {[1, 2].map((combo) => (
                  <article key={combo} className="min-w-[290px] rounded-xl border border-slate-200 bg-white p-3">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <div className="rounded-lg border border-slate-200 p-2">
                        <img src={img} alt="" className="mx-auto h-20 object-contain" />
                      </div>
                      <span className="text-lg font-semibold text-slate-500">+</span>
                      <div className="rounded-lg border border-slate-200 p-2">
                        <img src={gPhoto(2)} alt="" className="mx-auto h-20 object-contain" />
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-800">
                      {name} + boAt Wave Magma Smart Watch - Bluetooth Calling
                    </p>
                    <div className="mt-2">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Combo Price</span>
                      <p className="mt-1 text-sm text-slate-700">
                        <span className="font-semibold text-rose-600">-50%</span>{' '}
                        <span className="text-lg font-bold text-slate-900">₹17,448</span>{' '}
                        <span className="text-xs text-slate-400 line-through">(₹16,099 + ₹1,349)</span>
                      </p>
                      <p className="text-sm font-semibold text-emerald-600">Extra ₹150 combo savings</p>
                    </div>
                    <button className="mt-3 h-10 w-full rounded-lg border border-slate-300 text-sm font-bold text-slate-800 hover:bg-slate-50">
                      Add combo to cart
                    </button>
                  </article>
                ))}
              </div>
            </div>

            <button type="button" className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700">
              View Benefits of buying a Refurbished Device
              <ChevronRightCircle size={16} />
            </button>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Available Offers</h3>
              {offersLoading ? (
                <p className="mt-2 text-sm font-medium text-slate-500">Loading offers...</p>
              ) : offers.length > 0 ? (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                  {offers.map((offer, i) => (
                    <article
                      key={offer?._id || `${offer?.title || 'offer'}-${i}`}
                      className="min-w-[260px] rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-800">{offer.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{offer.desc}</p>
                      <div className="mt-2 border-t border-dashed border-slate-300 pt-2 text-xs font-mono font-bold uppercase tracking-wide text-slate-500">
                        {offer.code || 'No code required'}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm font-medium text-slate-500">No offers available right now.</p>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Available Payment Methods</h3>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {[
                  { label: 'EMI', Icon: Wallet },
                  { label: 'UPI', Icon: BadgeIndianRupee },
                  { label: 'Credit Card', Icon: CreditCard },
                  { label: 'COD Available', Icon: Truck },
                  { label: 'Split Payment', Icon: BadgeIndianRupee },
                  { label: 'Debit Card', Icon: CreditCard },
                ].map(({ label, Icon }) => (
                  <div key={label} className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 px-2 py-3 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
                      <Icon size={18} className="text-slate-700" />
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-slate-600">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Enter pincode for exact delivery dates</h3>
              <div className="mt-3 flex max-w-xl">
                <input
                  type="text"
                  placeholder="Postal code e.g. 414001"
                  className="h-11 flex-1 rounded-l-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-slate-300"
                />
                <button className="h-11 rounded-r-lg border border-l-0 border-slate-200 px-5 text-sm font-bold text-slate-500 hover:bg-slate-50">
                  Check
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                disabled={!canPurchase || adding}
                onClick={handleAddToCart}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                {adding ? 'Adding…' : 'Add to cart'}
              </button>
              <button
                type="button"
                disabled={!canPurchase || adding}
                onClick={handleBuyNow}
                className="h-11 rounded-lg bg-black px-6 text-sm font-semibold text-white disabled:opacity-50"
              >
                Buy now
              </button>
            </div>
          </div>
        </section>

        <section className="ymal-section mt-10 border-t border-slate-200 pt-8">
          <h2 className="ymal-heading">You May Also Like</h2>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {[
              { name: 'OnePlus 9RT 5G - Refurbished', off: '₹21,400 OFF', rating: '4.0', price: '17,199', mrp: '38,599' },
              { name: 'OnePlus Nord 2 5G - Refurbished', off: '₹13,500 OFF', rating: '4.0', price: '14,399', mrp: '27,899' },
              { name: 'OnePlus Nord CE 2 5G - Refurbished', off: '₹15,700 OFF', rating: '4.5', price: '13,699', mrp: '29,399' },
              { name: 'Samsung Galaxy A26 5G - Refurbished', off: '₹6,900 OFF', rating: '5.0', price: '17,199', mrp: '24,099' },
              { name: 'Samsung Galaxy M55 - Refurbished', off: '₹8,100 OFF', rating: '4.2', price: '18,499', mrp: '28,599' },
            ].map((item, idx) => (
              <article
                key={item.name}
                className="ymal-card min-w-[200px] max-w-[220px] shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-slate-600">
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 font-medium text-white">Baskaro Assured</span>
                  <span className="rounded border border-slate-200 px-1.5 py-0.5 font-normal normal-case tracking-normal text-slate-600">
                    {idx % 2 === 0 ? '1 left' : '5 left'}
                  </span>
                </div>
                <div className="flex h-28 items-center justify-center rounded-lg bg-slate-50">
                  <img src={gPhoto(idx + 1)} alt="" className="max-h-full max-w-[85%] object-contain object-top" />
                </div>
                <p className="mt-2 text-[11px] font-normal text-slate-500">{item.off}</p>
                <h3 className="ymal-title mt-1.5 line-clamp-2">{item.name}</h3>
                <p className="mt-2 inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50/80 px-1.5 py-0.5 text-[11px] font-normal text-slate-600">
                  {item.rating} <span className="text-amber-500">★</span>
                </p>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0">
                  <span className="ymal-pct text-rose-600">-55%</span>
                  <span className="ymal-price tabular-nums">₹{item.price}</span>
                  <span className="text-[11px] font-normal text-slate-400 line-through">₹{item.mrp}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Baskaro Trust</h2>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-hide sm:gap-4 lg:grid lg:grid-cols-6 lg:overflow-visible">
            {[
              { Icon: Smile, value: '50+ Lakh', label: 'Happy Customers' },
              { Icon: BadgeIndianRupee, value: '27+ Lakh', label: 'Devices Sold' },
              { Icon: Award, value: '32 Points', label: 'Quality Checks' },
              { Icon: Calendar, value: '15 Days', label: 'Refund*' },
              { Icon: ShieldCheck, value: 'Upto 12 Months', label: 'Warranty*' },
              { Icon: Store, value: '200+', label: 'Baskaro Stores' },
            ].map(({ Icon, value, label }) => (
              <div
                key={label}
                className="flex min-w-[132px] shrink-0 flex-col items-center rounded-xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm sm:min-w-[148px] lg:min-w-0"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="mt-3 text-sm font-semibold tabular-nums text-slate-900">{value}</p>
                <p className="mt-1 max-w-[11rem] text-xs font-normal leading-snug text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 border-t border-slate-200 pt-8">
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Grade Explained</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Superb', 'Good', 'Fair'].map((g) => (
              <span
                key={g}
                className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                  condition === g
                    ? 'border-red-500 bg-red-50/80 text-red-800'
                    : 'border-slate-200 text-slate-400'
                }`}
              >
                {g}
              </span>
            ))}
          </div>

          <div className="mt-6 space-y-8">
            {gradeContent.items.map((item) => (
              <div key={item.key}>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-slate-700">
                      <span className="font-semibold text-slate-900">{item.label}</span>
                      {' '}
                      – {item.body}
                    </p>
                    {item.photos?.length ? (
                      <div
                        className={`mt-4 ${item.singleCol ? 'mx-auto max-w-sm' : 'grid gap-3 sm:grid-cols-2'}`}
                      >
                        {item.photos.map((ph, i) => (
                          <GradeLensShot
                            key={`${item.key}-${i}`}
                            src={ph.src}
                            caption={ph.caption}
                            lensPosition={ph.lensPosition}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-slate-200 pt-8">
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              </span>
              <p className="text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">Chrome/Body</span>
                {' '}
                – {gradeContent.chrome.body}
              </p>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
              {gradeContent.chrome.photos.map((ph, i) => (
                <div key={`chrome-${i}`} className="min-w-[240px] shrink-0 sm:min-w-0">
                  <GradeLensShot src={ph.src} caption={ph.caption} lensPosition={ph.lensPosition} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <h3 className="text-base font-semibold text-slate-900">Why Choose Baskaro?</h3>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-600 marker:text-red-500">
              <li>Every device passes a 32-point quality check before it is listed.</li>
              <li>Warranty-backed purchases with easy returns on eligible orders.</li>
              <li>Transparent grading so you know exactly what you are buying.</li>
            </ul>
          </div>
        </section>

        <section className="mt-10 border-t border-slate-200 pt-8">
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Top Specs</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Screen Size', value: '17.02 cm (6.7 inch)' },
              { label: 'Chipset', value: 'MediaTek Dimensity 8100 Max' },
              { label: 'Pixel Density', value: '394 ppi' },
              { label: 'Network Support', value: '5G' },
              { label: 'SIM Slot(s)', value: 'Dual SIM, GSM+GSM' },
            ].map((spec) => (
              <div
                key={spec.label}
                className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6"
              >
                <p className="text-sm font-semibold text-slate-900">{spec.label}</p>
                <p className="mt-2 text-sm font-normal leading-snug text-slate-500">{spec.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-slate-100 px-4 py-8 sm:px-8 sm:py-10">
          <h2 className="text-center text-base font-semibold text-slate-900 sm:text-lg">
            What comes with the phone?
          </h2>
          <div className="mx-auto mt-8 grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
            <div className="flex justify-center rounded-xl bg-white/60 p-4 lg:justify-end">
              <img
                src="/packaging-inbox.png"
                alt="Retail box, USB cable, and warranty materials included with your phone"
                className="max-h-[320px] w-full max-w-md object-contain object-center"
              />
            </div>
            <div className="space-y-3">
              {[
                {
                  title: 'A minimalistic box',
                  body:
                    'Every refurbished phone is repackaged in a brand-new Baskaro retail box, highlighting the environmental and quality benefits of choosing refurbished.',
                },
                {
                  title: 'A compatible USB cable',
                  body:
                    'Baskaro-refurbished phones include a charging cable when needed; power adapters and headphones are not in the box. If original accessories are still available with the device, we may skip the cable to cut e-waste.',
                },
                {
                  title: 'A warranty card',
                  body:
                    'We include a warranty card for 6 or 12 months of coverage, redeemable at 200+ Baskaro partner stores.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5"
                >
                  <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm font-normal leading-relaxed text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              to="/nearby-stores"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Find nearest Baskaro store
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        <section className="mt-10 border-t border-slate-200 pt-8">
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Ratings &amp; reviews</h2>

          <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-3xl font-bold tabular-nums text-slate-900 sm:text-4xl">{rating}</p>
              <StarRow value={rating} className="mt-2" />
              <p className="mt-2 text-sm font-medium text-slate-500">177 reviews</p>
              <button
                type="button"
                className="mt-4 w-full rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Write a review
              </button>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Rating breakdown</p>
              <ul className="mt-3 space-y-2">
                {REVIEW_DISTRIBUTION.map(({ stars, pct }) => (
                  <li key={stars} className="flex items-center gap-3 text-sm">
                    <span className="w-8 tabular-nums text-slate-600">{stars}★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-9 text-right tabular-nums text-slate-500">{pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="mt-10 space-y-4">
            {SAMPLE_REVIEWS.map((rev) => (
              <li
                key={`${rev.name}-${rev.date}`}
                className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                      {rev.name.charAt(0)}
                    </span>
                    <div>
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{rev.name}</span>
                        {rev.verified ? (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700">
                            Verified
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-slate-500">{rev.date}</p>
                    </div>
                  </div>
                  <StarRow value={rev.rating} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{rev.title}</p>
                <p className="mt-1.5 text-sm font-normal leading-relaxed text-slate-600">{rev.body}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              View all reviews
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
