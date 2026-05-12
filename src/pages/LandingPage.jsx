import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { gPhoto } from '../constants/googleImages'
import { DownloadAppBanner } from '../components/DownloadAppBanner'
import { FlashDealsSection } from '../components/FlashDealsSection'
import { ProductCard } from '../components/ProductCard'
import { TopSellingBrands } from '../components/TopBrandPortals'
import { useCatalogBrands } from '../hooks/useCatalogBrands'

// Import premium PNG assets for that "wow" effect
import s25Front from '../assets/products/s25_titanium.jpg'
import s25Back from '../assets/products/s25_back.png'
import s25Perspective from '../assets/products/s25_inner.png'
import iphone14Front from '../assets/products/iphone14_purple.jpg'

import promoVivoBanner from '../assets/banners/promo_vivo_banner.png'
import promoOppoBanner from '../assets/banners/promo_oppo_banner.png'
import promoRedmiBanner from '../assets/banners/promo_redmi_banner.png'
import {
  getBanners,
  getCatalogModels,
  getCatalogPhoneBrands,
  getFeaturedPreOwned,
  getHomeServices,
  resolveHomeServiceImageUrl,
} from '../lib/api/baskaroApi.js'

const TOP_NAV = [
  'All',
  'Sell Phone',
  'Buy Pre-Owned Devices',
  'Find New Phone',
  'BASKARO Store',
  'More',
]

/** Offline / API-error fallback — paths match `App.jsx` routes; labels align with `SERVICE_THUMBS`. */
const SERVICES_FALLBACK = [
  { label: 'Sell Phone', path: '/sell-phone' },
  { label: 'Get estimate', path: '/sell-phone' },
  { label: 'Buy Phone', path: '/buy-pre-owned' },
  { label: 'Repair Phone', path: '/repair-phone' },
  { label: 'Find New Phone', path: '/find-new-phone' },
  { label: 'Nearby Stores', path: '/nearby-stores' },
  { label: 'Buy Accessories', path: '/buy-accessories' },
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
    heading: 'Sell your smartphone',
    subtext: 'Best price guaranteed — free pickup at your doorstep',
    cta: 'Sell now',
    ctaTo: '/sell/phone',
    bgClass: 'bg-red-50',
    img: s25Back,
  },
  {
    id: 'buy',
    heading: 'Certified pre-owned phones',
    subtext: 'Warranty included · Save big on Apple, Samsung & more',
    cta: 'Shop deals',
    ctaTo: '/find-new-phone',
    bgClass: 'bg-blue-50',
    img: s25Perspective,
  },
  {
    id: 'exchange',
    heading: 'Swap & upgrade',
    subtext: 'Trade in your old phone for instant credit on your next buy',
    cta: 'Start exchange',
    ctaTo: '/sell/phone',
    bgClass: 'bg-slate-100',
    img: iphone14Front,
  },
]

const PROMO_BANNERS_FALLBACK = [
  { id: 'promo-vivo', img: promoVivoBanner, alt: 'vivo T5x 5G', to: '/find-new-phone' },
  { id: 'promo-oppo', img: promoOppoBanner, alt: 'OPPO A6 Pro 5G', to: '/find-new-phone' },
  { id: 'promo-redmi', img: promoRedmiBanner, alt: 'REDMI Note 15 5G', to: '/find-new-phone' },
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
  const heroPositions = new Set(['HOME_HERO', 'HOMEPAGE', 'Homepage'])
  return list
    .map((b) => {
      const position = b?.position != null ? String(b.position).trim() : ''
      if (position && !heroPositions.has(position)) return null
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

function mapPromoBannersFromApi(list) {
  if (!Array.isArray(list)) return []
  const promoPositions = new Set(['HOME_TOP', 'HOME_MIDDLE', 'HOME_BOTTOM'])
  const order = { HOME_TOP: 0, HOME_MIDDLE: 1, HOME_BOTTOM: 2 }

  return list
    .map((b) => {
      const position = b?.position != null ? String(b.position).trim() : ''
      if (position && !promoPositions.has(position)) return null
      const id = b?._id != null ? String(b._id) : String(b?.id || '')
      const img = resolveHeroImageUrl(b?.imageUrl)
      if (!id || !img) return null
      const alt = String(b?.title || b?.subtitle || 'Promotional banner').trim()
      const to = String(b?.redirectUrl || '/find-new-phone').trim() || '/find-new-phone'
      return {
        id,
        img,
        alt,
        to,
        _sort: order[position] ?? 99,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a._sort - b._sort)
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
    ? 'overflow-hidden border-y border-white/15 bg-gradient-to-r from-[#3a0002] via-[#7a0008] to-[#260001] py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
    : 'overflow-hidden rounded-xl border border-red-900/40 bg-gradient-to-r from-[#3a0002] via-[#7a0008] to-[#260001] py-3.5 shadow-sm'
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

const POPULAR_CATEGORIES_FALLBACK = [
  { title: 'Sell Phone', img: gPhoto(0), path: '/sell/phone' },
  { title: 'Sell Tablet', img: gPhoto(1), path: '/sell/tablet' },
  { title: 'Sell Smartwatch', img: gPhoto(2), path: '/sell/smartwatch' },
  { title: 'Sell Earbuds', img: gPhoto(3), path: '/sell/earbuds' },
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

function serviceThumbForLabel(label) {
  if (!label) return SERVICE_THUMBS['Sell Phone']
  if (SERVICE_THUMBS[label]) return SERVICE_THUMBS[label]
  const hit = Object.keys(SERVICE_THUMBS).find((k) => k.toLowerCase() === String(label).trim().toLowerCase())
  return hit ? SERVICE_THUMBS[hit] : SERVICE_THUMBS['Sell Phone']
}

function buildFallbackHomeServiceRows() {
  return SERVICES_FALLBACK.map((s, i) => ({
    id: `fallback-${i}`,
    label: s.label,
    path: s.path,
    imageUrl: serviceThumbForLabel(s.label),
  }))
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
  const [activeBrand, setActiveBrand] = useState('all')
  const scrollerRef = useRef(null)
  const [, setBrands] = useState([{ id: 'all', label: 'All', brandId: '' }])
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
        if (!cancelled && top.length) setBrands([{ id: 'all', label: 'All', brandId: '' }, ...top])

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
    activeBrand === 'all' ? phones : phones.filter((p) => String(p.brand) === String(activeBrand))

  const scrollCarousel = (dir) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: Math.min(el.clientWidth * 0.85, 480) * dir, behavior: 'smooth' })
  }

  return (
    <section className="w-full border-y border-red-950/40 bg-gradient-to-b from-[#6f0006] via-[#230001] to-black py-8">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black leading-none tracking-tight text-white sm:text-4xl">
              Brand New Phones
            </h2>
            <span className="mt-2 block h-1 w-20 rounded-full bg-red-600" />
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollCarousel(-1)}
              aria-label="Scroll branded phones left"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 backdrop-blur transition hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel(1)}
              aria-label="Scroll branded phones right"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 backdrop-blur transition hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto pb-3 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`sk-${i}`}
                  className="h-[350px] w-[255px] shrink-0 animate-pulse rounded-[30px] bg-white/90"
                />
              ))
            ) : null}
            {filtered.map((phone) => (
              <Link
                key={phone.id}
                to={/^[a-f0-9]{24}$/i.test(String(phone.id)) ? `/product/${phone.id}` : '/buy-pre-owned'}
                className="group relative flex w-[255px] shrink-0 flex-col rounded-[30px] border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1"
              >
                {/* Badge */}
                <span
                  className="absolute left-4 top-4 z-10 rounded-md bg-red-500 px-2 py-1 text-[10px] font-extrabold text-white shadow"
                >
                  {phone.discount ? `${phone.discount}% off` : phone.badge}
                </span>

                <span className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm ring-1 ring-slate-200">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 21s-6.5-4.35-9-8.06C.6 9.43 2.08 5 6.36 5c2.17 0 3.26 1.23 3.94 2.19C10.99 6.23 12.08 5 14.24 5c4.28 0 5.76 4.43 3.36 7.94C18.5 16.65 12 21 12 21Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                {/* Phone image */}
                <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-[16px] bg-slate-100 p-2.5">
                  <img
                    src={phone.image}
                    alt={phone.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col px-2 pb-2 pt-3 text-center">
                  <h3 className="line-clamp-2 min-h-[44px] text-[13px] font-bold leading-tight text-slate-800">
                    {phone.name}
                  </h3>
                  <p className="mt-1 text-[10px] font-semibold text-slate-400">*best price starts from</p>
                  <div className="mt-1 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5">
                    <span className="text-[26px] font-extrabold leading-none text-red-600">{phone.price || ''}</span>
                    {phone.originalPrice && (
                      <span className="text-xs font-semibold text-slate-400 line-through">{phone.originalPrice}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-full bg-red-600 py-3 text-sm font-extrabold text-white transition-all duration-200 hover:bg-red-700"
                  >
                    +&nbsp; add to cart
                  </button>
                </div>
              </Link>
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

function formatInrPlain(n) {
  const v = Number(n)
  if (!Number.isFinite(v) || v < 0) return '—'
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

function mapFeaturedPreOwnedFromApi(row) {
  const img = resolveHomeServiceImageUrl(row.imageUrl) || row.imageUrl || ''
  return {
    id: row.id,
    image: img,
    title: row.title || 'Pre-Owned Device',
    price: formatInrPlain(row.priceInr),
    originalPrice: row.originalPriceInr != null ? formatInrPlain(row.originalPriceInr) : undefined,
    discount: row.discountPercent != null && row.discountPercent > 0 ? row.discountPercent : undefined,
    rating: row.rating != null && row.rating !== '' ? row.rating : undefined,
    tag: Array.isArray(row.tags) ? row.tags : [],
    brand: 'BASKARO',
    viewPath: row.viewPath || '',
  }
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

function CarouselSection({ title, viewAllText, products, loading = false, viewAllHref = '' }) {
  const scrollerRef = useRef(null)

  const scrollCarousel = (direction) => {
    const el = scrollerRef.current
    if (!el) return
    const delta = Math.min(el.clientWidth * 0.85, 520) * direction
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  const viewAllClass =
    'inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2 text-sm font-black text-white transition hover:bg-red-700'

  return (
    <section className="w-full border-y border-red-950/40 bg-gradient-to-b from-[#6f0006] via-[#230001] to-black py-9">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {title} <span className="text-red-500">.</span>
          </h2>
          {viewAllHref ? (
            <Link to={viewAllHref} className={viewAllClass}>
              {viewAllText}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <a href="#" className={viewAllClass}>
              {viewAllText}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            aria-label="Scroll products left"
            className="absolute left-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-md backdrop-blur-sm transition hover:bg-white/20 sm:flex"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            aria-label="Scroll products right"
            className="absolute right-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-md backdrop-blur-sm transition hover:bg-white/20 sm:flex"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-12"
          >
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`car-skel-${i}`}
                  className="h-[380px] w-[260px] shrink-0 animate-pulse rounded-[28px] bg-white/20"
                  aria-hidden
                />
              ))
            ) : (
              products.map((p) => (
                <ProductCard
                  key={p.id || p.title}
                  {...p}
                  className="rounded-[28px] border-slate-200 bg-[#f9fafb] shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
                />
              ))
            )}
          </div>
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
    <section className="w-full py-12">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            FAQs
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Quick answers about buying and selling pre-owned devices.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((item) => {
            const isOpen = item.id === openId
            const buttonId = `${item.id}-btn`
            const panelId = `${item.id}-panel`
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-extrabold text-slate-900 sm:text-base">
                    {item.q}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      {isOpen ? (
                        <path
                          d="M6 12h12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      ) : (
                        <>
                          <path
                            d="M12 6v12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M6 12h12"
                            stroke="currentColor"
                            strokeWidth="2"
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
                    'grid transition-all',
                    isOpen
                      ? 'max-h-40 opacity-100 pb-4'
                      : 'max-h-0 opacity-0 pb-0',
                  ].join(' ')}
                >
                  <div className="px-5 text-sm font-semibold text-slate-600 sm:text-base">
                    <div className="border-t border-slate-100 pt-3">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
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

export default function LandingPage() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [featuredPreOwned, setFeaturedPreOwned] = useState([])
  const [featuredPreOwnedLoading, setFeaturedPreOwnedLoading] = useState(true)
  const { brands: catalogBrands, loading: catalogBrandsLoading } = useCatalogBrands()

  const [moreOpen, setMoreOpen] = useState(false)
  const [navDropdownOpen, setNavDropdownOpen] = useState(null)

  const [heroSlides, setHeroSlides] = useState(HERO_CAROUSEL_FALLBACK)
  const [promoBanners, setPromoBanners] = useState(PROMO_BANNERS_FALLBACK)
  const [heroSlide, setHeroSlide] = useState(0)
  const heroSlideCount = heroSlides.length
  const servicesRailRef = useRef(null)
  const [storePincode, setStorePincode] = useState('')
  const [trustSlide, setTrustSlide] = useState(0)
  const trustCount = TRUST_TESTIMONIALS.length

  const scrollServicesRail = (direction) => {
    const el = servicesRailRef.current
    if (!el) return
    el.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  const sellDeviceRailCards = useMemo(() => {
    if (servicesLoading) return []
    return [...services.map((s) => ({ kind: 'link', id: s.id, title: s.label, img: s.imageUrl, path: s.path })), { kind: 'more', id: 'more', title: 'More' }]
  }, [services, servicesLoading])

  const popularCategories = useMemo(() => {
    if (Array.isArray(services) && services.length > 0) {
      return services
        .filter((s) => s?.label && s?.path)
        .map((s) => ({
          id: String(s.id || s.label),
          title: String(s.label),
          img: s.imageUrl || serviceThumbForLabel(s.label),
          path: String(s.path),
        }))
    }
    return POPULAR_CATEGORIES_FALLBACK.map((c) => ({ ...c, id: c.title }))
  }, [services])

  const buyPreOwnedCarouselProducts = useMemo(() => {
    if (featuredPreOwnedLoading) return []
    if (featuredPreOwned.length > 0) return featuredPreOwned
    return PRE_OWNED_DEVICES_CAROUSEL
  }, [featuredPreOwnedLoading, featuredPreOwned])

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
    setServicesLoading(true)
    getHomeServices()
      .then((list) => {
        if (cancelled) return
        const arr = Array.isArray(list) ? list : []
        const mapped = arr
          .map((s) => {
            const id = String(s._id ?? s.id ?? '').trim()
            const label = String(s.label || '').trim()
            const path = String(s.path || '').trim()
            const resolved = resolveHomeServiceImageUrl(s.imageUrl)
            const imageUrl = resolved || serviceThumbForLabel(label)
            return { id: id || `svc-${label}`, label, path, imageUrl }
          })
          .filter((s) => s.label && s.path)
        if (mapped.length) setServices(mapped)
        else setServices(buildFallbackHomeServiceRows())
      })
      .catch(() => {
        if (!cancelled) setServices(buildFallbackHomeServiceRows())
      })
      .finally(() => {
        if (!cancelled) setServicesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setFeaturedPreOwnedLoading(true)
    getFeaturedPreOwned({ limit: 12 })
      .then((list) => {
        if (cancelled) return
        const arr = Array.isArray(list) ? list : []
        setFeaturedPreOwned(arr.map(mapFeaturedPreOwnedFromApi).filter((p) => p.title && p.price && p.price !== '—'))
      })
      .catch(() => {
        if (!cancelled) setFeaturedPreOwned([])
      })
      .finally(() => {
        if (!cancelled) setFeaturedPreOwnedLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getBanners({ active: true })
      .then((list) => {
        if (cancelled) return
        const arr = Array.isArray(list) ? list : []
        const mappedHero = mapHeroBannersFromApi(arr)
        if (mappedHero.length) {
          setHeroSlides(mappedHero)
          setHeroSlide(0)
        }
        const mappedPromo = mapPromoBannersFromApi(arr)
        setPromoBanners(mappedPromo.length ? mappedPromo : PROMO_BANNERS_FALLBACK)
      })
      .catch(() => {
        if (!cancelled) setPromoBanners(PROMO_BANNERS_FALLBACK)
      })
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
                {heroSlides.map((slide) => (
                  <div
                    key={slide.id}
                    className={`box-border shrink-0 ${slide.bgClass}`}
                    style={{ width: `${100 / heroSlideCount}%` }}
                  >
                    <div className="relative h-[280px] w-full sm:h-[340px] md:h-[420px] lg:h-[500px]">
                      <img
                        src={slide.img}
                        alt={slide.heading || 'Featured banner'}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 md:left-3"
              aria-label="Previous slide"
              onClick={() =>
                setHeroSlide(
                  (i) => (i - 1 + heroSlideCount) % heroSlideCount,
                )
              }
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
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 md:right-3"
              aria-label="Next slide"
              onClick={() =>
                setHeroSlide((i) => (i + 1) % heroSlideCount)
              }
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
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div
              className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm"
              role="tablist"
              aria-label="Carousel pagination"
            >
              {heroSlides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={i === heroSlide}
                  aria-label={`Slide ${i + 1}: ${slide.heading}`}
                  className={[
                    'h-2 rounded-full transition-all duration-300',
                    i === heroSlide
                      ? 'w-6 bg-red-500'
                      : 'w-2 bg-white/50 hover:bg-white/80',
                  ].join(' ')}
                  onClick={() => setHeroSlide(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <FlashDealsSection />

      {/* Services — full-width band */}
      <section className="w-full border-y border-slate-100 bg-white py-7">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Our Services <span className="text-red-600">.</span>
            </h2>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollServicesRail('left')}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700"
                aria-label="Scroll services left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollServicesRail('right')}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-800"
                aria-label="Scroll services right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={servicesRailRef}
            className="overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex min-w-max gap-4 sm:gap-5">
              {servicesLoading
                ? Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={`svc-skel-${i}`}
                      className="flex w-[180px] shrink-0 flex-col items-center sm:w-[190px]"
                      aria-hidden
                    >
                      <div className="flex h-[178px] w-full animate-pulse items-center justify-center rounded-[30px] bg-[#f7dfe4]/80 px-4">
                        <div className="h-[112px] w-[148px] rounded-xl bg-white/50" />
                      </div>
                      <div className="mt-3 h-4 w-28 animate-pulse rounded bg-slate-200" />
                    </div>
                  ))
                : services.map((service) => (
                    <Link
                      key={service.id}
                      to={service.path}
                      className="group flex w-[180px] shrink-0 flex-col items-center sm:w-[190px]"
                    >
                      <div className="flex h-[178px] w-full items-center justify-center rounded-[30px] bg-[#f7dfe4] px-4 transition-transform duration-200 group-hover:-translate-y-0.5">
                        <img
                          src={service.imageUrl}
                          alt={service.label}
                          className="h-[112px] w-[148px] object-contain"
                          loading="lazy"
                        />
                      </div>
                      <span className="mt-3 text-center text-xs font-extrabold uppercase tracking-wide text-slate-600 sm:text-sm">
                        {service.label}
                      </span>
                    </Link>
                  ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top Selling Brands Section */}
      <section className="w-full py-10 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <TopSellingBrands brands={catalogBrands} loading={catalogBrandsLoading} />
        </div>
      </section>

      {/* ── New Branded Phones (replaces Best Selling Phones) ── */}
      <BrandedPhonesSection />

      {/* Sell Your Old Device Now */}
      <section id="sell-your-device" className="w-full scroll-mt-20 py-10">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Sell Your Old Device Now <span className="text-red-600">.</span>
              </h2>
              <p className="mt-2 text-sm font-extrabold uppercase tracking-[0.18em] text-slate-400">
                Pick what you want to sell. We'll calculate an estimate.
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => document.getElementById('sell-device-rail')?.scrollBy({ left: -320, behavior: 'smooth' })}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700"
                aria-label="Scroll sell cards left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('sell-device-rail')?.scrollBy({ left: 320, behavior: 'smooth' })}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-800"
                aria-label="Scroll sell cards right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <div
              id="sell-device-rail"
              className="overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex min-w-max gap-4 sm:gap-5">
                {servicesLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={`sell-skel-${i}`}
                        className="w-[180px] shrink-0 sm:w-[190px]"
                        aria-hidden
                      >
                        <div className="flex w-full flex-col items-center">
                          <div className="flex h-[168px] w-full animate-pulse items-center justify-center rounded-[30px] bg-[#f7dfe4]/80 px-4">
                            <div className="flex h-[72px] w-[110px] items-center justify-center rounded-2xl bg-[#e7f1f0]/80">
                              <div className="h-[48px] w-[72px] rounded-lg bg-slate-200/60" />
                            </div>
                          </div>
                          <div className="mt-3 h-4 w-24 animate-pulse rounded bg-slate-200" />
                        </div>
                      </div>
                    ))
                  : sellDeviceRailCards.map((card) => (
                      <div key={card.id} className="w-[180px] shrink-0 sm:w-[190px]">
                        {card.kind === 'more' ? (
                          <button
                            type="button"
                            className="group flex w-full flex-col items-center justify-start"
                            onClick={() => setMoreOpen(true)}
                          >
                            <div className="relative flex h-[168px] w-full items-center justify-center rounded-[30px] bg-[#f7dfe4] px-4 transition-all duration-200 group-hover:-translate-y-0.5">
                              <span className="flex items-center gap-1 text-xl text-slate-500">
                                <span>•</span>
                                <span>•</span>
                                <span>•</span>
                              </span>
                            </div>
                            <span className="mt-3 text-center text-xs font-extrabold uppercase tracking-wide text-slate-600 sm:text-sm">
                              {card.title}
                            </span>
                          </button>
                        ) : (
                          <Link
                            to={card.path}
                            className="group flex w-full flex-col items-center justify-start"
                          >
                            <div className="relative flex h-[168px] w-full items-center justify-center rounded-[30px] bg-[#f7dfe4] px-4 transition-all duration-200 group-hover:-translate-y-0.5">
                              <div className="flex h-[72px] w-[110px] items-center justify-center rounded-2xl bg-[#e7f1f0]">
                                {card.img ? (
                                  <img
                                    src={card.img}
                                    alt={card.title}
                                    className="h-[62px] w-[84px] object-contain"
                                    loading="lazy"
                                  />
                                ) : (
                                  <span className="text-xs font-black uppercase text-slate-400">
                                    {(card.title || '?').slice(0, 2)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="mt-3 text-center text-xs font-extrabold uppercase tracking-wide text-slate-600 sm:text-sm">
                              {card.title}
                            </span>
                          </Link>
                        )}
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right-side "More" drawer */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
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
                {popularCategories.map((c) => (
                  <button
                    key={c.id}
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

      {/* Buy Pre-Owned Devices */}
      <CarouselSection
        title="Buy Pre-Owned Devices"
        viewAllText="View All"
        viewAllHref="/buy-pre-owned"
        products={buyPreOwnedCarouselProducts}
        loading={featuredPreOwnedLoading}
      />

      {/* Trust & social proof — full-width band + edge-to-edge partner strip */}
      <section className="w-full bg-gradient-to-b from-[#6f0006] via-[#230001] to-black text-white">
        <div className="w-full px-4 py-12 sm:px-6 md:py-16 lg:px-10 xl:px-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
            <h2 className="max-w-2xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              Trusted by 176.02 Lac + Happy Users and Major Brands since 2015
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap lg:shrink-0">
              <div className="rounded-xl border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-950 px-5 py-4 sm:min-w-[168px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5">
                  <span className="text-lg font-semibold text-red-500">
                    ₹
                  </span>
                </div>
                <div className="mt-3 text-2xl font-bold tabular-nums text-red-500">
                  13201.65Cr.
                </div>
                <div className="mt-1 text-xs font-medium text-white/60">
                  Cash Given
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-950 px-5 py-4 sm:min-w-[168px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
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
                </div>
                <div className="mt-3 text-2xl font-bold tabular-nums text-red-500">
                  195.58Lac
                </div>
                <div className="mt-1 text-xs font-medium text-white/60">
                  Gadgets Encashed
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 hidden gap-5 lg:grid lg:grid-cols-4">
            {TRUST_TESTIMONIALS.map((t) => (
              <article
                key={t.id}
                className="flex flex-col rounded-xl bg-white p-5 text-slate-900 shadow-sm"
              >
                <span className="text-4xl font-serif leading-none text-red-500">
                  &ldquo;
                </span>
                <p className="mt-2 flex-1 text-sm leading-relaxed">{t.quote}</p>
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <img
                    src={t.avatar}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-500">{t.location}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="relative mt-10 lg:hidden">
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex flex-nowrap transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{
                  width: `${trustCount * 100}%`,
                  transform: `translateX(-${(trustSlide * 100) / trustCount}%)`,
                }}
              >
                {TRUST_TESTIMONIALS.map((t) => (
                  <div
                    key={t.id}
                    className="box-border shrink-0 px-1"
                    style={{ width: `${100 / trustCount}%` }}
                  >
                    <article className="flex h-full min-h-[220px] flex-col rounded-xl bg-white p-5 text-slate-900 shadow-sm">
                      <span className="text-4xl font-serif leading-none text-red-500">
                        &ldquo;
                      </span>
                      <p className="mt-2 flex-1 text-sm leading-relaxed">
                        {t.quote}
                      </p>
                      <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                        <img
                          src={t.avatar}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                          loading="lazy"
                        />
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {t.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {t.location}
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="absolute -right-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-md hover:bg-slate-50"
              aria-label="Next testimonial"
              onClick={() =>
                setTrustSlide((i) => (i + 1) % trustCount)
              }
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
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="mt-4 flex justify-center gap-2">
              {TRUST_TESTIMONIALS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={[
                    'h-2 rounded-full transition-all',
                    i === trustSlide
                      ? 'w-8 bg-red-500'
                      : 'w-2 bg-white/30 hover:bg-white/50',
                  ].join(' ')}
                  onClick={() => setTrustSlide(i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Edge-to-edge partner strip (full viewport width) */}
        <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 border-t border-white/10">
          <MajorBrandsMarquee fullBleed className="w-full" />
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="w-full py-6 sm:py-10">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:pb-0 sm:snap-none">
            {promoBanners.map((banner) => (
              <Link key={banner.id} to={banner.to} className="group relative aspect-[21/9] w-[85%] shrink-0 snap-center overflow-hidden rounded-xl bg-slate-50 transition-all sm:aspect-auto sm:h-[200px] sm:w-full md:h-[240px] lg:h-[280px]">
                <img
                  src={banner.img}
                  alt={banner.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular categories row (below promotional banners) */}
      <section className="w-full pb-8">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Popular categories <span className="text-red-600">.</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => document.getElementById('popular-cat-rail')?.scrollBy({ left: -320, behavior: 'smooth' })}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700"
                aria-label="Scroll popular categories left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('popular-cat-rail')?.scrollBy({ left: 320, behavior: 'smooth' })}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-800"
                aria-label="Scroll popular categories right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            id="popular-cat-rail"
            className="overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex min-w-max gap-6">
              {popularCategories.map((c) => (
                <button
                  key={`popular-${c.id}`}
                  type="button"
                  onClick={() => c.path && navigate(c.path)}
                  className="group flex w-[120px] shrink-0 flex-col items-center text-center"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 transition group-hover:bg-slate-200">
                    <img
                      src={c.img}
                      alt={c.title}
                      className="h-10 w-10 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span className="mt-3 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">
                    {c.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CarouselSection
        title="Trending Electronics"
        viewAllText="View All"
        products={buyPreOwnedCarouselProducts}
        loading={featuredPreOwnedLoading}
      />

      {/* Promotional Banners (after Trending Electronics) */}
      <section className="w-full py-6 sm:py-10">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:pb-0 sm:snap-none">
            {promoBanners.map((banner) => (
              <Link key={`${banner.id}-after-trending`} to={banner.to} className="group relative aspect-[21/9] w-[85%] shrink-0 snap-center overflow-hidden rounded-xl bg-slate-50 transition-all sm:aspect-auto sm:h-[200px] sm:w-full md:h-[240px] lg:h-[280px]">
                <img
                  src={banner.img}
                  alt={banner.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FaqsSection />

      <DownloadAppSection />
    </div>
  )
}

