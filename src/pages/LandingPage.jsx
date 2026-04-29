import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { gPhoto } from '../constants/googleImages'
import { DownloadAppBanner } from '../components/DownloadAppBanner'
import { FlashDealsSection } from '../components/FlashDealsSection'
import { ProductCard } from '../components/ProductCard'
import { ServiceCard } from '../components/ServiceCard'
import { TopSellingBrands, PHONE_BRAND_PORTALS } from '../components/TopBrandPortals'
import { useCatalogBrands } from '../hooks/useCatalogBrands'
import { BestSellingSection } from '../components/BestSelling/BestSellingSection'

// Import premium PNG assets for that "wow" effect
import s25Front from '../assets/products/s25_titanium.jpg'
import s25Back from '../assets/products/s25_back.png'
import s25Perspective from '../assets/products/s25_inner.png'
import iphone14Front from '../assets/products/iphone14_purple.jpg'
import iphone13Blue from '../assets/products/iphone13_blue.jpg'

import promoVivoBanner from '../assets/banners/promo_vivo_banner.png'
import promoOppoBanner from '../assets/banners/promo_oppo_banner.png'
import promoRedmiBanner from '../assets/banners/promo_redmi_banner.png'
import {
  getBanners,
  getCatalogModels,
  getCatalogPhoneBrands,
  getHomeServices,
} from '../lib/api/baskaroApi.js'

const TOP_NAV = [
  'All',
  'Sell Phone',
  'Buy Pre-Owned Devices',
  'Find New Phone',
  'BASKARO Store',
  'More',
]

const SERVICES = [
  { label: 'Sell Phone', path: '/sell-phone' },
  { label: 'Buy Phone', path: '/marketplace' },
  { label: 'Repair Phone', path: '/repair-phone' },
  { label: 'Find New Phone', path: '/find-new-phone' },
  { label: 'Nearby Stores', path: '/nearby-stores' },
  { label: 'New Accessories', path: '/buy-accessories' },
  { label: 'Buy Smartwatches', path: '/buy-accessories' },
]

const NEARBY_STORE_IMAGE_URL =
  'https://img.freepik.com/premium-vector/shop-location-icon-3d-illustration-from-online-store-collection-creative-shop-location-3d-icon-web-design-templates-infographics-more_676904-843.jpg?semt=ais_incoming&w=740&q=80'

const REPAIR_PHONE_IMAGE_URL =
  'https://erepaircafe.com/wp-content/uploads/al_opt_content/IMAGE/erepaircafe.com/wp-content/uploads/2025/06/repair-phone.png.bv_resized_mobile.png.bv.webp?bv_host=erepaircafe.com'

const FIND_NEW_PHONE_IMAGE_URL =
  'https://s3n.cashify.in/builder/4060695bca3447c2b7296aa5ba9ce827.webp'

const BUY_PHONE_IMAGE_URL =
  'https://s3n.cashify.in/builder/caa3a1efa51541a5aa37fd292790ea81.webp'

const SELL_PHONE_IMAGE_URL =
  'https://s3ng.cashify.in/builder/81c3c74f0683463da548ae2cbe1fec28.webp?w=300'

const NEW_ACCESSORIES_IMAGE_URL =
  'https://s3n.cashify.in/builder/75750a866d214239bf52a47ee57e6674.webp'

const BUY_SMARTWATCHES_IMAGE_URL =
  'https://img.tatacliq.com/images/i10/437Wx649H/MP000000017249001_437Wx649H_202304181258383.jpeg'

const OFFERS = [
  {
    title: 'Get Instant Price Estimation',
    description: 'Select brand, model, and condition. Get an estimated payout in seconds.',
    imageUrl: gPhoto(0),
  },
  {
    title: 'Free Pickup Scheduling',
    description: 'Choose pickup date & time. We coordinate the pickup and verification steps.',
    imageUrl: gPhoto(1),
  },
  {
    title: 'Secure Payment After Verification',
    description: 'Pay via UPI or bank transfer once the device is received and verified.',
    imageUrl: gPhoto(2),
  },
]

/** Fallback hero slides when API returns none or fails */
const HERO_CAROUSEL_FALLBACK = [
  {
    id: 'sell',
    bgImg: '/hero/sell.png',
  },
  {
    id: 'buy',
    bgImg: '/hero/buy.png',
  },
  {
    id: 'repair',
    bgImg: '/hero/repair.png',
  },
  {
    id: 'exchange',
    bgImg: '/hero/exchange.png',
  },
  {
    id: 'accessories',
    bgImg: '/hero/accessories.png',
  },
  {
    id: 'bulk',
    bgImg: '/hero/bulk.png',
  },
  {
    id: 'security',
    bgImg: '/hero/security.png',
  },
  {
    id: 'app',
    bgImg: '/hero/app.png',
  },
]

function resolveHeroImageUrl(url) {
  if (!url || typeof url !== 'string') return ''
  const t = url.trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t) || t.startsWith('data:') || t.startsWith('/')) return t
  const base = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
  return base ? `${base}/${t.replace(/^\//, '')}` : t
}

function sanitizeHeroBgClass(raw) {
  const s = raw != null ? String(raw).trim() : ''
  if (/^bg-[a-z0-9]+(-[a-z0-9]+)*$/i.test(s) && s.length < 48) return s
  return 'bg-blue-50'
}

function mapHeroBannersFromApi(list) {
  if (!Array.isArray(list)) return []
  return list
    .map((b) => {
      const id = b._id != null ? String(b._id) : b.id
      const img = resolveHeroImageUrl(b.imageUrl)
      const heading = b.title != null ? String(b.title).trim() : ''
      if (!id || !heading || !img) return null
      const subtext = b.subtitle != null ? String(b.subtitle).trim() : ''
      const ctaRaw = b.buttonText != null ? String(b.buttonText).trim() : ''
      return {
        id,
        heading,
        subtext,
        cta: ctaRaw || 'Learn more',
        ctaTo: (b.redirectUrl != null ? String(b.redirectUrl).trim() : '') || '/',
        bgClass: sanitizeHeroBgClass(b.bgClass),
        img,
      }
    })
    .filter(Boolean)
}

function HeroCtaLink({ to, className, children }) {
  const href = to && String(to).trim() ? String(to).trim() : '/'
  const external = /^https?:\/\//i.test(href)
  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  )
}

const TRUST_TESTIMONIALS = [
  {
    id: 't1',
    name: 'Tarun Singh Verma',
    location: 'New Delhi',
    quote:
      'Sold off my phone very easily and got the payment on the spot. Best experience so far.',
    avatar: 'https://ui-avatars.com/api/?name=Tarun+Singh+Verma&background=2563eb&color=fff&size=128',
  },
  {
    id: 't2',
    name: 'Karan Sharma',
    location: 'Delhi NCR',
    quote:
      'Well trained staff. Overall a positive experience in selling my phone at BAS karo.',
    avatar: 'https://ui-avatars.com/api/?name=Karan+Sharma&background=2563eb&color=fff&size=128',
  },
  {
    id: 't3',
    name: 'Abhiyash',
    location: 'New Delhi',
    quote:
      'No complaints, sold my phone very easily here. Definitely worth a try.',
    avatar: 'https://ui-avatars.com/api/?name=Abhiyash&background=2563eb&color=fff&size=128',
  },
  {
    id: 't4',
    name: 'Vinit Kumar',
    location: 'New Delhi',
    quote:
      'Payment was very instant and the whole process was quick. Will recommend it.',
    avatar: 'https://ui-avatars.com/api/?name=Vinit+Kumar&background=2563eb&color=fff&size=128',
  },
]

/** Partner strip — infinite horizontal marquee (placed before “Top Brands We Buy”) */
const MAJOR_BRANDS_STRIP = [
  { id: 'realme', label: 'realme', className: 'text-lg font-semibold lowercase tracking-tight' },
  { id: 'oppo', label: 'oppo', className: 'text-lg font-medium lowercase tracking-wide' },
  {
    id: 'mi',
    label: 'mi',
    className:
      'flex h-9 w-9 items-center justify-center rounded border-2 border-white text-sm font-bold',
  },
  {
    id: 'vijay-sales',
    label: 'vijay sales',
    className: 'font-serif text-lg italic tracking-tight',
  },
  {
    id: 'reliance',
    label: 'Reliance digital',
    className: 'text-base font-semibold tracking-tight',
  },
  {
    id: 'hp',
    label: 'hp',
    className:
      'flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-sm font-bold uppercase',
  },
  { id: 'paytm', label: 'paytm', className: 'text-xl font-bold lowercase tracking-tight' },
  { id: 'nokia', label: 'NOKIA', className: 'text-lg font-black uppercase tracking-widest' },
  { id: 'oneplus', label: 'OnePlus', className: 'text-lg font-bold tracking-tight' },
  { id: 'dell', label: 'DELL', className: 'text-lg font-semibold uppercase tracking-widest' },
]

function MajorBrandsMarquee({ className = '', fullBleed = false }) {
  const shell = fullBleed
    ? 'overflow-hidden border-y border-white/10 bg-blue-900 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
    : 'overflow-hidden rounded-2xl border border-gray-200 bg-blue-900 py-4 shadow-xl'
  return (
    <div
      className={[shell, className].join(' ')}
      role="region"
      aria-label="Major partner brands"
    >
      <div className="major-brands-marquee-track">
        {MAJOR_BRANDS_STRIP.map((b) => (
          <div key={b.id} className="flex shrink-0 items-center px-8 sm:px-12">
            <span className={`whitespace-nowrap text-white ${b.className}`}>
              {b.label}
            </span>
          </div>
        ))}
        {MAJOR_BRANDS_STRIP.map((b) => (
          <div
            key={`${b.id}-dup`}
            className="flex shrink-0 items-center px-8 sm:px-12"
            aria-hidden="true"
          >
            <span className={`whitespace-nowrap text-white ${b.className}`}>
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Mobile-selling-only navbar dropdown content
const SELL_MEGA_BRANDS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'OnePlus',
  'Vivo',
  'Oppo',
]
const SELL_TOP_PHONES = [
  'iPhone 13',
  'iPhone 12',
  'Samsung S21',
  'OnePlus 9',
  'Redmi Note Series',
]

const PRE_OWNED_CATEGORIES = [
  'Pre-Owned Phones',
  'Pre-Owned Laptops',
  'Pre-Owned Smart Watches',
  'Pre-Owned Tablets',
  'Pre-Owned Gaming Consoles',
  'Pre-Owned Cameras',
  'Speakers',
  'Amazon Devices',
]

const PRE_OWNED_TOP_BRANDS = [
  'Apple',
  'Xiaomi',
  'Samsung',
  'Oneplus',
  'Google',
  'Oppo',
  'Vivo',
  'All Brands',
]

const MORE_CATEGORIES = [
  { title: 'Sell Phone', img: gPhoto(0), path: '/sell-phone' },
  { title: 'Sell Tablet', img: gPhoto(1), path: '/sell-phone' },
  { title: 'Sell Smartwatch', img: gPhoto(2), path: '/sell-phone' },
  { title: 'Sell Earbuds', img: gPhoto(3), path: '/sell-phone' },
  { title: 'Repair Phone', img: gPhoto(4), path: '/repair-phone' },
  { title: 'Buy Pre-Owned Phones', img: gPhoto(5), path: '/find-new-phone' },
  { title: 'Find New Phone', img: gPhoto(0), path: '/find-new-phone' },
]

function IconBox({ idx }) {
  const boxBg = [
    'bg-red-50 border-red-100 text-red-700',
    'bg-blue-50 border-blue-100 text-blue-700',
    'bg-white border-slate-200 text-slate-700',
    'bg-red-50 border-red-100 text-red-700',
    'bg-blue-50 border-blue-100 text-blue-700',
    'bg-slate-50 border-slate-200 text-slate-800',
    'bg-red-50 border-red-100 text-red-700',
    'bg-blue-50 border-blue-100 text-blue-700',
  ]

  const icon = (() => {
    // simple inline icons; no external assets required
    const PhoneIcon = (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M10 6h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    )
    const TagIcon = (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M20.59 13.41 11 3H3v8l9.59 9.59a2 2 0 0 0 2.82 0l.18-.18a2 2 0 0 0 0-2.82Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M7 7h.01"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    )
    const WrenchIcon = (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    )

    const RecyclingIcon = (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 19 3 12l4-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M21 5h-8l3-3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M21 19l-4 2-3-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    )

    const StoreIcon = (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9l2-5h14l2 5v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 22V12h6v10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    )

    const WatchIcon = (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M8 2h8l-1 4H9L8 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M7 6h10v4a5 5 0 0 1-10 0V6Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M12 11v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    )

    const icons = [
      PhoneIcon,
      TagIcon,
      PhoneIcon,
      TagIcon,
      WrenchIcon,
      RecyclingIcon,
      PhoneIcon,
      StoreIcon,
      TagIcon,
      WatchIcon,
    ]
    return icons[idx % icons.length]
  })()

  return (
    <div
      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${boxBg[idx % boxBg.length]}`}
      aria-hidden="true"
    >
      {icon}
    </div>
  )
}

const SERVICE_THUMBS = {
  'Sell Phone': SELL_PHONE_IMAGE_URL,
  'Buy Gadgets': gPhoto(1),
  'Buy Phone': BUY_PHONE_IMAGE_URL,
  'Buy Laptops': gPhoto(3),
  'Buy Accessories': NEW_ACCESSORIES_IMAGE_URL,
  'Repair Phone': REPAIR_PHONE_IMAGE_URL,
  'Repair Laptop': gPhoto(0),
  Recycle: gPhoto(1),
  'Find New Phone': FIND_NEW_PHONE_IMAGE_URL,
  'Nearby Stores': NEARBY_STORE_IMAGE_URL,
  'New Accessories': NEW_ACCESSORIES_IMAGE_URL,
  'Buy Smartwatches': BUY_SMARTWATCHES_IMAGE_URL,
}

// ─── New Branded Phones (fallback cards) ─────────────────────────────────────
const NEW_BRANDED_PHONES = [
  {
    id: 'iphone-16-pro',
    brand: 'apple',
    name: 'iPhone 16 Pro',
    subtitle: '256 GB · Desert Titanium',
    price: '₹1,19,900',
    originalPrice: '₹1,34,900',
    discount: 11,
    badge: 'New Launch',
    badgeColor: 'bg-violet-600',
    image: 'https://images.unsplash.com/photo-1603891128711-11b4b03bb138?q=80&w=640&auto=format&fit=crop',
    brandLogo: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128',
  },
  {
    id: 'samsung-s25-ultra',
    brand: 'samsung',
    name: 'Samsung Galaxy S25 Ultra',
    subtitle: '512 GB · Titanium Black',
    price: '₹1,29,999',
    originalPrice: '₹1,54,999',
    discount: 16,
    badge: 'Trending',
    badgeColor: 'bg-red-600',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=640&auto=format&fit=crop',
    brandLogo: 'https://www.google.com/s2/favicons?domain=samsung.com&sz=128',
  },
  {
    id: 'oneplus-13',
    brand: 'oneplus',
    name: 'OnePlus 13',
    subtitle: '256 GB · Midnight Ocean',
    price: '₹69,999',
    originalPrice: '₹79,999',
    discount: 13,
    badge: 'Best Seller',
    badgeColor: 'bg-red-500',
    image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=640&auto=format&fit=crop',
    brandLogo: 'https://www.google.com/s2/favicons?domain=oneplus.com&sz=128',
  },
  {
    id: 'xiaomi-15-ultra',
    brand: 'xiaomi',
    name: 'Xiaomi 15 Ultra',
    subtitle: '512 GB · Titanium Silver',
    price: '₹99,999',
    originalPrice: '₹1,09,999',
    discount: 9,
    badge: 'New',
    badgeColor: 'bg-orange-500',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=640&auto=format&fit=crop',
    brandLogo: 'https://www.google.com/s2/favicons?domain=mi.com&sz=128',
  },
  {
    id: 'vivo-x200-pro',
    brand: 'vivo',
    name: 'Vivo X200 Pro',
    subtitle: '256 GB · Titanium Grey',
    price: '₹94,999',
    originalPrice: '₹1,04,999',
    discount: 10,
    badge: 'Hot',
    badgeColor: 'bg-pink-600',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=640&auto=format&fit=crop',
    brandLogo: 'https://www.google.com/s2/favicons?domain=vivo.com&sz=128',
  },
  {
    id: 'oppo-find-x8-pro',
    brand: 'oppo',
    name: 'OPPO Find X8 Pro',
    subtitle: '512 GB · Space Black',
    price: '₹1,09,999',
    originalPrice: '₹1,19,999',
    discount: 8,
    badge: 'Premium',
    badgeColor: 'bg-blue-600',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=640&auto=format&fit=crop',
    brandLogo: 'https://www.google.com/s2/favicons?domain=oppo.com&sz=128',
  },
  {
    id: 'iphone-15',
    brand: 'apple',
    name: 'iPhone 15',
    subtitle: '128 GB · Pink',
    price: '₹72,900',
    originalPrice: '₹79,900',
    discount: 9,
    badge: 'Popular',
    badgeColor: 'bg-indigo-600',
    image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=640&auto=format&fit=crop',
    brandLogo: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128',
  },
  {
    id: 'samsung-a55',
    brand: 'samsung',
    name: 'Samsung Galaxy A55 5G',
    subtitle: '256 GB · Awesome Lilac',
    price: '₹38,999',
    originalPrice: '₹44,999',
    discount: 13,
    badge: 'Value Pick',
    badgeColor: 'bg-teal-600',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=640&auto=format&fit=crop',
    brandLogo: 'https://www.google.com/s2/favicons?domain=samsung.com&sz=128',
  },
]

function BrandedPhonesSection() {
  const [activeBrand, setActiveBrand] = useState('')
  const scrollerRef = useRef(null)
  const [brands, setBrands] = useState([])
  const [phones, setPhones] = useState(NEW_BRANDED_PHONES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const apiBrands = await getCatalogPhoneBrands()
        const list = Array.isArray(apiBrands) ? apiBrands : []
        const top = list.slice(0, 12).map((b) => ({
          id: String(b.slug || b.name || '').toLowerCase().replace(/\s+/g, '-') || String(b._id),
          label: b.name,
          brandId: b._id,
        }))
        if (!cancelled && top.length) {
          setBrands(top)
          setActiveBrand(top[0].id)
        }

        // Fetch models for first few brands (or all) to build cards.
        const brandsToFetch = top.slice(0, 6)
        const modelLists = await Promise.all(
          brandsToFetch.map(async (b) => {
            try {
              const ms = await getCatalogModels({ brandId: b.brandId })
              const arr = Array.isArray(ms) ? ms : []
              return arr.map((m) => ({
                id: String(m._id),
                brand: b.id,
                brandLabel: b.label,
                name: m.modelName || m.name || '',
                image: m.image || '',
                priceInr:
                  Array.isArray(m.storageVariants) && m.storageVariants.length
                    ? Math.min(...m.storageVariants.map((v) => Number(v.basePrice) || Infinity))
                    : Number(m.basePrice) || 0,
                brandLogo: b.brandId ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                  `${b.id}.com`,
                )}&sz=128` : '',
              }))
            } catch {
              return []
            }
          }),
        )
        const flat = modelLists.flat().filter((x) => x.name)
        if (!cancelled && flat.length) {
          // convert to the card shape used below
          setPhones(
            flat.slice(0, 30).map((p, idx) => ({
              id: p.id,
              brand: p.brand,
              name: p.name,
              subtitle: p.brandLabel,
              price: p.priceInr ? `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(p.priceInr)}` : '',
              originalPrice: '',
              discount: 0,
              badge: idx < 6 ? 'New' : 'Popular',
              badgeColor: idx < 6 ? 'bg-orange-500' : 'bg-indigo-600',
              image: p.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=640&auto=format&fit=crop',
              brandLogo: '',
            })),
          )
        } else if (!cancelled) {
          setPhones(NEW_BRANDED_PHONES)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered =
    (!activeBrand || activeBrand === 'all') ? phones : phones.filter((p) => String(p.brand) === String(activeBrand))

  const scrollCarousel = (dir) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: Math.min(el.clientWidth * 0.85, 480) * dir, behavior: 'smooth' })
  }

  return (
    <section className="w-full py-6 bg-black border-y border-white/10">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
              Newly Launched / Trending <span className="text-red-600">.</span>
            </h2>
            <p className="mt-2 text-sm font-medium text-gray-500">
              Latest flagship launches from top brands — all in one place
            </p>
          </div>
          <a
            href="/find-new-phone"
            className="inline-flex items-center gap-2 rounded-full bg-blue-900 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25"
          >
            View All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Brand filter pills */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveBrand(b.id)}
              className={[
                'shrink-0 rounded-full border-2 px-5 py-2 text-xs font-bold transition-all duration-300',
                activeBrand === b.id
                  ? 'border-blue-900 bg-blue-900 text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-900 hover:text-blue-950',
              ].join(' ')}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            aria-label="Scroll branded phones left"
            className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-red-700 sm:flex"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            aria-label="Scroll branded phones right"
            className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-red-700 sm:flex"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth scrollbar-hide sm:px-12"
          >
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`sk-${i}`}
                  className="h-[285px] w-[260px] shrink-0 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))
            ) : null}
            {filtered.map((phone) => (
              <ProductCard
                key={phone.id}
                id={phone.id}
                image={phone.image}
                title={phone.name}
                price={phone.price}
                originalPrice={phone.originalPrice}
                discount={phone.discount}
                tag={[phone.badge, phone.subtitle].filter(Boolean)}
                brand={phone.brand}
              />
            ))}

            {/* Empty state when brand filter yields nothing */}
            {filtered.length === 0 && (
              <div className="flex h-48 w-full items-center justify-center text-sm font-semibold text-slate-400">
                No phones found for this brand yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const PRE_OWNED_DEVICES_CAROUSEL = [
  {
    id: 'samsung-s25-edge',
    image: s25Front, // Premium PNG
    title: 'Samsung Galaxy S25 Edge - Pre-Owned',
    price: '₹57,599',
    originalPrice: '₹75,900',
    discount: 57,
    rating: 4.8,
    tag: ['Flash Sale', 'Month End Sale'],
    brand: 'BASKARO',
  },
  {
    id: 'iphone-14',
    image: iphone14Front, // Premium PNG
    title: 'Apple iPhone 14 - Pre-Owned',
    price: '₹29,999',
    originalPrice: '₹42,900',
    discount: 30,
    rating: 4.8,
    tag: ['Flash Sale'],
    brand: 'BASKARO',
  },
  {
    id: 'samsung-s25-back',
    image: s25Back,
    title: 'Samsung Galaxy S25 Edge (12/256GB)',
    price: '₹56,499',
    originalPrice: '₹113,799',
    discount: 50,
    rating: 4.9,
    tag: ['Top Seller'],
    brand: 'BASKARO',
  },
  {
    id: 'oneplus-nord-ce',
    image: gPhoto(1),
    title: 'OnePlus Nord CE 5G - Pre-Owned',
    price: '₹11,699',
    rating: 4.0,
    tag: ['Flash Sale'],
    brand: 'BASKARO',
  },
  {
    id: 'samsung-s20-fe',
    image: gPhoto(2),
    title: 'Samsung Galaxy S20 FE 5G - Pre-Owned',
    price: '₹14,699',
    originalPrice: '₹18,500',
    discount: 21,
    rating: 4.4,
    tag: ['Month End Sale', 'Flash Sale'],
    brand: 'BASKARO',
  },
]

function CarouselSection({ title, viewAllText, products }) {
  const scrollerRef = useRef(null)

  const scrollCarousel = (direction) => {
    const el = scrollerRef.current
    if (!el) return
    const delta = Math.min(el.clientWidth * 0.85, 520) * direction
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="w-full py-6 bg-black border-y border-white/10">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
            {title} <span className="text-red-600">.</span>
          </h2>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/25"
          >
            {viewAllText}
            <ChevronRight size={14} strokeWidth={3} />
          </a>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            aria-label="Scroll products left"
            className="absolute -left-5 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-xl transition-all hover:scale-110 hover:border-red-600 hover:bg-red-600 sm:flex"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            aria-label="Scroll products right"
            className="absolute -right-5 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-xl transition-all hover:scale-110 hover:border-red-600 hover:bg-red-600 sm:flex"
          >
            <ChevronRight className="h-6 w-6" aria-hidden />
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-hide sm:px-12"
          >
            {products.map((p) => (
              <ProductCard key={p.title} {...p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function PromoImageCard({ title, imageUrl }) {
  return (
    <div className="group w-[280px] shrink-0 overflow-hidden rounded-[1.25rem] bg-gray-100 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-900/10 lg:w-[calc((100%-3rem)/4)]">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-5 transform transition-transform duration-500 group-hover:-translate-y-1">
          <div className="text-sm font-black leading-snug text-white line-clamp-2 drop-shadow-md">
            {title}
          </div>
        </div>
      </div>
    </div>
  )
}

function PromoSliderRow({ title, cards, viewAllText = 'See all' }) {
  const scrollerRef = useRef(null)

  const onScrollRight = () => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: 880, behavior: 'smooth' })
  }

  return (
    <section className="w-full py-12">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            {title}
          </h2>
          <a
            href="#"
            className="text-sm font-bold text-gray-500 hover:text-blue-950 underline underline-offset-4 decoration-2 decoration-gray-200 hover:decoration-blue-900 transition-colors"
          >
            {viewAllText}
          </a>
        </div>

        <div className="relative group/slider">
          <div
            ref={scrollerRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent px-1"
          >
            {cards.map((c) => (
              <PromoImageCard key={c.title} title={c.title} imageUrl={c.imageUrl} />
            ))}
          </div>

          <button
            type="button"
            onClick={onScrollRight}
            aria-label={`Scroll ${title} right`}
            className="absolute -right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-blue-950 shadow-xl opacity-0 transition-all duration-300 hover:scale-110 hover:border-blue-900 hover:bg-blue-900 hover:text-white group-hover/slider:opacity-100"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

const FAQS = [
  {
    id: 'faq-1',
    q: 'How is my device value calculated?',
    a: 'We check the device condition, functional tests, and market demand to give you an accurate estimate before confirmation.',
  },
  {
    id: 'faq-2',
    q: 'Do you provide warranty on pre-owned devices?',
    a: 'Yes. Pre-Owned devices come with warranty to ensure a safe purchase and peace of mind.',
  },
  {
    id: 'faq-3',
    q: 'What condition grades do you accept?',
    a: 'We accept multiple grades (like Excellent, Good, Fair, etc.). Your grade affects the final payout/price.',
  },
  {
    id: 'faq-4',
    q: 'How do you handle damaged or faulty devices?',
    a: 'If a device fails verification tests, we will show the issue and adjust the estimate accordingly based on the findings.',
  },
  {
    id: 'faq-5',
    q: 'When do I receive payment after selling?',
    a: 'Payment is completed after the device is picked up and verified. Timing depends on the selected payment method.',
  },
  {
    id: 'faq-6',
    q: 'Can I schedule pickup at a convenient time?',
    a: 'Yes. Choose a pickup date/time during the scheduling step and we will coordinate the rest of the process.',
  },
]

function FaqsSection() {
  const [openId, setOpenId] = useState(null)

  return (
    <section className="w-full py-16 bg-gray-50 border-t border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Frequently Asked Questions <span className="text-red-600">.</span>
          </h2>
          <p className="mt-3 text-sm font-bold uppercase tracking-widest text-gray-500">
            Quick answers about buying and selling pre-owned devices
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((item) => {
            const isOpen = item.id === openId
            const buttonId = `${item.id}-btn`
            const panelId = `${item.id}-panel`
            return (
              <div
                key={item.id}
                className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${isOpen ? 'border-blue-900 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
                >
                  <span className={`text-base font-black sm:text-lg ${isOpen ? 'text-blue-950' : 'text-gray-700'}`}>
                    {item.q}
                  </span>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${isOpen ? 'bg-blue-900 text-white' : 'bg-gray-100 text-blue-950 group-hover:bg-gray-200'}`}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      {isOpen ? (
                        <path
                          d="M6 12h12"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      ) : (
                        <>
                          <path
                            d="M12 6v12"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M6 12h12"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </>
                      )}
                    </svg>
                  </span>
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={[
                    'grid transition-all duration-300 ease-in-out',
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100 pb-5'
                      : 'grid-rows-[0fr] opacity-0 pb-0',
                  ].join(' ')}
                >
                  <div className="overflow-hidden px-6 text-sm font-medium leading-relaxed text-gray-600 sm:text-base">
                    <div className="border-t border-gray-100 pt-4">
                      {item.a}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function badgeClass(category) {
  if (category === 'Guide') return 'bg-white/90 text-slate-900'
  if (category === 'Tips') return 'bg-blue-50 text-blue-700'
  return 'bg-red-50 text-red-700'
}

function FeaturedArticleCard({ article }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[16/9]">
        <img
          src={article.imageUrl}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/35 to-black/10" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold shadow-sm ${badgeClass(article.category)}`}
        >
          {article.category}
        </span>
        <h3 className="mt-3 line-clamp-2 text-xl font-extrabold leading-tight text-white sm:text-2xl">
          {article.title}
        </h3>
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-white/85">
          <span>{article.readTime}</span>
          <span aria-hidden="true">•</span>
          <span>{article.date}</span>
        </div>
      </div>
    </article>
  )
}

function SideArticleCard({ article }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex min-h-[170px]">
        <div className="relative w-2/5 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="w-3/5 p-4">
          <span
            className={`inline-flex rounded-full px-2 py-1 text-[10px] font-extrabold ${badgeClass(article.category)}`}
          >
            {article.category}
          </span>
          <h3 className="mt-2 line-clamp-2 text-sm font-extrabold leading-snug text-slate-900">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-600">
            {article.excerpt}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <span>{article.readTime}</span>
            <span aria-hidden="true">•</span>
            <span>{article.date}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

function BottomArticleCard({ article }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={article.imageUrl}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-slate-900 sm:text-base">
          {article.title}
        </h3>
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
          <span>{article.readTime}</span>
          <span aria-hidden="true">•</span>
          <span>{article.date}</span>
        </div>
      </div>
    </article>
  )
}

function DownloadAppSection() {
  return <DownloadAppBanner />
}

function formatINR(value) {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `₹${value}`
  }
}

function CategoryGridSection() {
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 2)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      ro.disconnect()
    }
  }, [])

  return (
    <section className="w-full py-6 bg-white border-y border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Popular categories <span className="text-red-600">.</span>
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
              disabled={!canScrollLeft}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                canScrollLeft ? 'border-slate-300 bg-white text-slate-700' : 'border-slate-100 bg-slate-50 text-slate-300'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
              disabled={!canScrollRight}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                canScrollRight ? 'border-slate-300 bg-white text-slate-700' : 'border-slate-100 bg-slate-50 text-slate-300'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
        >
          {MORE_CATEGORIES.map((c) => (
            <button
              key={c.title}
              type="button"
              className="group flex min-w-[100px] shrink-0 flex-col items-center text-center sm:min-w-[120px]"
              onClick={() => c.path && navigate(c.path)}
            >
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-100 transition-all duration-300 group-hover:scale-105 group-hover:bg-white group-hover:shadow-md group-hover:ring-red-100 sm:h-24 sm:w-24">
                <img
                  src={c.img}
                  alt={c.title}
                  className="h-10 w-10 object-contain transition-transform duration-500 group-hover:scale-110 sm:h-12 sm:w-12"
                  loading="lazy"
                />
              </div>
              <span className="mt-3 text-[11px] font-black uppercase tracking-widest text-slate-500 transition-colors group-hover:text-red-600 sm:text-xs">
                {c.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function PromoBannersSection() {
  return (
    <section className="w-full py-4 sm:py-6 bg-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:pb-0 sm:snap-none">
          <Link to="/find-new-phone" className="group relative aspect-[21/9] w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-900/10 sm:aspect-auto sm:h-[200px] sm:w-full md:h-[240px] lg:h-[280px]">
            <img
              src={promoVivoBanner}
              alt="vivo T5x 5G"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-blue-900/0 transition-colors duration-500 group-hover:bg-blue-900/10" />
          </Link>
          <Link to="/find-new-phone" className="group relative aspect-[21/9] w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-900/10 sm:aspect-auto sm:h-[200px] sm:w-full md:h-[240px] lg:h-[280px]">
            <img
              src={promoOppoBanner}
              alt="OPPO A6 Pro 5G"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-blue-900/0 transition-colors duration-500 group-hover:bg-blue-900/10" />
          </Link>
          <Link to="/find-new-phone" className="group relative aspect-[21/9] w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-900/10 sm:aspect-auto sm:h-[200px] sm:w-full md:h-[240px] lg:h-[280px]">
            <img
              src={promoRedmiBanner}
              alt="REDMI Note 15 5G"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-blue-900/0 transition-colors duration-500 group-hover:bg-blue-900/10" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [services, setServices] = useState(
    SERVICES.map((s) => ({ ...s, imageUrl: SERVICE_THUMBS[s.label] ?? SERVICE_THUMBS['Sell Phone'] })),
  )
  const { brands: catalogBrands, loading: catalogBrandsLoading } = useCatalogBrands()
  const topSellingBrands = useMemo(() => {
    if (!catalogBrandsLoading && catalogBrands.length > 0) return catalogBrands
    return PHONE_BRAND_PORTALS
  }, [catalogBrandsLoading, catalogBrands])

  const [moreOpen, setMoreOpen] = useState(false)
  const [navDropdownOpen, setNavDropdownOpen] = useState(null)

  const [heroSlides, setHeroSlides] = useState(HERO_CAROUSEL_FALLBACK)
  const [heroSlide, setHeroSlide] = useState(0)
  const heroSlideCount = heroSlides.length
  const [storePincode, setStorePincode] = useState('')
  const [trustSlide, setTrustSlide] = useState(0)
  const trustCount = TRUST_TESTIMONIALS.length

  const servicesScrollRef = useRef(null)
  const [canServicesLeft, setCanServicesLeft] = useState(false)
  const [canServicesRight, setCanServicesRight] = useState(true)

  const sellScrollRef = useRef(null)
  const [canSellLeft, setCanSellLeft] = useState(false)
  const [canSellRight, setCanSellRight] = useState(true)

  const checkScroll = (ref, setLeft, setRight) => {
    if (!ref.current) return
    const { scrollLeft, scrollWidth, clientWidth } = ref.current
    setLeft(scrollLeft > 2)
    setRight(scrollLeft < scrollWidth - clientWidth - 2)
  }

  useEffect(() => {
    const sEl = servicesScrollRef.current
    const slEl = sellScrollRef.current

    const handleServicesScroll = () => checkScroll(servicesScrollRef, setCanServicesLeft, setCanServicesRight)
    const handleSellScroll = () => checkScroll(sellScrollRef, setCanSellLeft, setCanSellRight)

    if (sEl) {
      handleServicesScroll()
      sEl.addEventListener('scroll', handleServicesScroll, { passive: true })
      // use ResizeObserver in case of layout shifts
      const ro = new ResizeObserver(handleServicesScroll)
      ro.observe(sEl)
      sEl._ro = ro
    }
    if (slEl) {
      handleSellScroll()
      slEl.addEventListener('scroll', handleSellScroll, { passive: true })
      const ro = new ResizeObserver(handleSellScroll)
      ro.observe(slEl)
      slEl._ro = ro
    }

    return () => {
      if (sEl) {
        sEl.removeEventListener('scroll', handleServicesScroll)
        if (sEl._ro) sEl._ro.disconnect()
      }
      if (slEl) {
        slEl.removeEventListener('scroll', handleSellScroll)
        if (slEl._ro) slEl._ro.disconnect()
      }
    }
  }, [services])

  useEffect(() => {
    if (trustCount <= 1) return
    const id = window.setInterval(() => {
      setTrustSlide((i) => (i + 1) % trustCount)
    }, 5000)
    return () => window.clearInterval(id)
  }, [trustCount])

  useEffect(() => {
    if (heroSlideCount <= 1) return
    const id = window.setInterval(() => {
      setHeroSlide((i) => (i + 1) % heroSlideCount)
    }, 3000)
    return () => window.clearInterval(id)
  }, [heroSlideCount])

  useEffect(() => {
    let cancelled = false
    getHomeServices()
      .then((list) => {
        if (cancelled) return
        const arr = Array.isArray(list) ? list : []
        const mapped = arr
          .map((s) => ({
            label: s.label || '',
            path: s.path || '',
            imageUrl: s.imageUrl || '',
          }))
          .filter((s) => s.label && s.path)
        if (mapped.length) {
          setServices(
            mapped.map((s) => ({
              ...s,
              imageUrl: s.imageUrl || SERVICE_THUMBS[s.label] || SERVICE_THUMBS['Sell Phone'],
            })),
          )
        }
      })
      .catch(() => { })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getBanners({ position: 'HOME_HERO' })
      .then((list) => {
        if (cancelled) return
        const mapped = mapHeroBannersFromApi(Array.isArray(list) ? list : [])
        if (mapped.length) {
          setHeroSlides(mapped)
          setHeroSlide(0)
        }
      })
      .catch(() => { })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!moreOpen) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMoreOpen(false)
    }

    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
    }
  }, [moreOpen])

  useEffect(() => {
    if (!navDropdownOpen) return

    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setNavDropdownOpen(null)
    }
    const onPointerDown = (e) => {
      if (!(e.target instanceof Element)) return
      if (e.target.closest('[data-nav-dropdown-wrap="true"]')) return
      setNavDropdownOpen(null)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
    }
  }, [navDropdownOpen])

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-red-100 selection:text-red-900">
      {/* Hero Section */}
      <section className="w-full py-0">
        <div className="w-full">
          <div
            className="relative"
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured offers"
          >
            <div className="overflow-hidden bg-white">
              <div
                className="flex flex-nowrap transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{
                  width: `${heroSlideCount * 100}%`,
                  transform: `translateX(-${(heroSlide * 100) / heroSlideCount}%)`,
                }}
              >
                {heroSlides.map((slide, index) => (
                  <div
                    key={slide.id || index}
                    className="relative box-border shrink-0 h-[250px] bg-red-600 overflow-hidden"
                    style={{ width: `${100 / heroSlideCount}%` }}
                  >
                    <img
                      src={resolveHeroImageUrl(slide.bgImg || slide.img) || 'https://placehold.co/1200x250/e11d48/ffffff?text=Baskaro+Banner'}
                      alt="Hero banner"
                      className="h-full w-full object-cover"
                    />
                    {/* Carousel content removed to keep imagery 'untouched' */}
                  </div>
                ))}
              </div>
            </div>

            {/* Centered Navigation Bar */}
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-blue-900/40 px-3 py-1.5 backdrop-blur-md border border-white/20 shadow-2xl">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-all hover:bg-white/20 hover:text-white"
                aria-label="Previous slide"
                onClick={() =>
                  setHeroSlide(
                    (i) => (i - 1 + heroSlideCount) % heroSlideCount,
                  )
                }
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <div className="flex gap-2">
                {heroSlides.map((_, i) => (
                  <button
                    key={`dot-${i}`}
                    type="button"
                    role="tab"
                    aria-selected={heroSlide === i}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setHeroSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${heroSlide === i ? 'w-6 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                  />
                ))}
              </div>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-all hover:bg-white/20 hover:text-white"
                aria-label="Next slide"
                onClick={() =>
                  setHeroSlide((i) => (i + 1) % heroSlideCount)
                }
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full pt-2 pb-4 bg-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-white to-white opacity-60 pointer-events-none" />
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 relative z-10">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
              Our Services <span className="text-red-600">.</span>
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => servicesScrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                disabled={!canServicesLeft}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                  canServicesLeft ? 'border-slate-300 bg-white text-slate-700' : 'border-slate-100 bg-slate-50 text-slate-300'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => servicesScrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                disabled={!canServicesRight}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                  canServicesRight ? 'border-slate-300 bg-white text-slate-700' : 'border-slate-100 bg-slate-50 text-slate-300'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div ref={servicesScrollRef} className="overflow-x-auto pb-6 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-4 sm:gap-5">
              {services.map((service) => (
                <div
                  key={service.label}
                  className="w-[140px] shrink-0 sm:w-[160px] lg:w-[180px]"
                >
                  <ServiceCard label={service.label} path={service.path} thumbUrl={service.imageUrl} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top Selling Brands Section */}
      <section className="w-full pt-6 pb-2 bg-gradient-to-b from-white to-slate-50/50 border-b border-slate-100">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <TopSellingBrands title="Shop Phone by Brand" brands={topSellingBrands} />
        </div>
      </section>

      <FlashDealsSection title="Brand New Phones" />

      {/* Sell Your Old Device Now */}
      <section id="sell-your-device" className="w-full scroll-mt-20 pt-6 pb-8 bg-white border-y border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-80 pointer-events-none" />
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 relative z-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="mb-3 text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
                Sell Your Old Device Now <span className="text-red-600">.</span>
              </h2>
              <p className="text-sm font-bold tracking-widest text-slate-400 uppercase mt-2">
                Pick what you want to sell. We'll calculate an estimate.
              </p>
            </div>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => sellScrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                disabled={!canSellLeft}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                  canSellLeft ? 'border-slate-300 bg-white text-slate-700' : 'border-slate-100 bg-slate-50 text-slate-300'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => sellScrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                disabled={!canSellRight}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                  canSellRight ? 'border-slate-300 bg-white text-slate-700' : 'border-slate-100 bg-slate-50 text-slate-300'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="mt-8">
            <div ref={sellScrollRef} className="overflow-x-auto px-2 pt-2 pb-6 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-3">
              <div className="flex min-w-max gap-6">
                {[
                  {
                    title: 'Sell Phone',
                    img: SERVICE_THUMBS['Sell Phone'],
                    path: '/sell-phone',
                  },
                  {
                    title: 'Get estimate',
                    img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hand%20holding%20Smartphone.jpg',
                    path: '/sell-phone',
                  },
                  {
                    title: 'Buy Accessories',
                    img: SERVICE_THUMBS['Buy Accessories'],
                    path: '/buy-accessories',
                  },
                  {
                    title: 'Repair Phone',
                    img: SERVICE_THUMBS['Repair Phone'],
                    path: '/repair-phone',
                  },
                  {
                    title: 'Find New Phone',
                    img: SERVICE_THUMBS['Find New Phone'],
                    path: '/find-new-phone',
                  },
                  {
                    title: 'Nearby Stores',
                    img: SERVICE_THUMBS['Nearby Stores'],
                    path: '/nearby-stores',
                  },
                ].map((card, idx) => (
                  <div
                    key={`${card.title}-${idx}`}
                    className="w-[140px] shrink-0 sm:w-[160px] lg:w-[180px]"
                  >
                    <ServiceCard
                      label={card.title}
                      path={card.path}
                      thumbUrl={card.img}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buy Pre-Owned Devices */}
      <CarouselSection
        title="Buy Pre-Owned Devices"
        viewAllText="View All"
        products={PRE_OWNED_DEVICES_CAROUSEL}
      />

      {/* Banners 1 */}
      <PromoBannersSection />

      {/* Popular categories */}
      <CategoryGridSection />

      {/* Best selling phones */}
      <BestSellingSection
        title="Trending Electronics"
        products={PRE_OWNED_DEVICES_CAROUSEL.map((p) => ({ ...p, name: p.title }))}
      />

      {/* Banners 2 */}
      <PromoBannersSection />

      {/* Right-side "More" drawer */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-blue-900/40"
            aria-label="Close sidebar"
            onClick={() => setMoreOpen(false)}
          />

          <aside className="relative h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-base font-extrabold text-slate-900">
                Sell Your Old Device Now
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                aria-label="Close"
                onClick={() => setMoreOpen(false)}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m6 6 12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="h-full overflow-y-auto px-4 py-5">
              <div className="grid grid-cols-2 gap-6">
                {MORE_CATEGORIES.map((c) => (
                  <button
                    key={c.title}
                    type="button"
                    className="group"
                    onClick={() => {
                      setMoreOpen(false)
                      if (c.path) navigate(c.path)
                    }}
                  >
                    <div className="flex h-20 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100">
                      <img
                        src={c.img}
                        alt=""
                        aria-hidden="true"
                        className="h-10 w-10 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="mt-2 text-center text-xs font-bold text-slate-700 group-hover:text-red-700">
                      {c.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

