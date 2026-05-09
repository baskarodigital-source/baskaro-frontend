import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, Heart, Star } from 'lucide-react'
import { gPhoto } from '../constants/googleImages'
import { useWishlist } from '../context/WishlistContext'

const CATEGORY_TITLES = {
  phones: 'Refurbished phones',
  laptops: 'Refurbished laptops',
  'smart-watch': 'Refurbished smart watch',
  tablets: 'Refurbished tablets',
  'gaming-consoles': 'Refurbished gaming consoles',
  cameras: 'Refurbished cameras',
  'audio-devices': 'Audio devices',
  'amazon-devices': 'Amazon devices',
}

const BRAND_TITLES = {
  apple: 'Apple',
  xiaomi: 'Xiaomi',
  samsung: 'Samsung',
  oneplus: 'OnePlus',
  google: 'Google',
  oppo: 'OPPO',
  vivo: 'Vivo',
  more: 'More',
}

function humanize(s) {
  if (!s) return 'Pre-owned'
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
]

/** Starter catalog rows — swap for API later */
function getListingProducts(kind, slug) {
  const img = [gPhoto(0), gPhoto(1), gPhoto(2), gPhoto(3)]
  if (kind === 'brand' && slug === 'google') {
    return [
      {
        id: '1',
        name: 'Google Pixel 9 Pro - Refurbished',
        img: img[0],
        rating: 5.0,
        price: 79399,
        mrp: 110099,
        memberPrice: 77223,
        emi: 3970,
        stockLeft: 1,
        lowestPrice: true,
        offAmount: 12000,
      },
      {
        id: '2',
        name: 'Google Pixel 8 - Refurbished',
        img: img[1],
        rating: 4.9,
        price: 42999,
        mrp: 58999,
        memberPrice: 41599,
        emi: 2150,
        stockLeft: 2,
        lowestPrice: false,
        offAmount: 8000,
      },
      {
        id: '3',
        name: 'Google Pixel 8a - Refurbished',
        img: img[2],
        rating: 4.8,
        price: 35999,
        mrp: 47999,
        memberPrice: 34899,
        emi: 1800,
        stockLeft: 4,
        lowestPrice: true,
        offAmount: 5000,
      },
    ]
  }
  if (kind === 'brand' && slug === 'apple') {
    return [
      {
        id: 'a1',
        name: 'Apple iPhone 15 Pro - Refurbished',
        img: img[0],
        rating: 5.0,
        price: 89999,
        mrp: 124900,
        memberPrice: 87200,
        emi: 4500,
        stockLeft: 2,
        lowestPrice: true,
        offAmount: 15000,
      },
      {
        id: 'a2',
        name: 'Apple iPhone 14 - Refurbished',
        img: img[1],
        rating: 4.9,
        price: 52999,
        mrp: 69900,
        memberPrice: 51299,
        emi: 2650,
        stockLeft: 5,
        lowestPrice: false,
        offAmount: 9000,
      },
    ]
  }
  const label = kind === 'category' ? CATEGORY_TITLES[slug] ?? humanize(slug) : BRAND_TITLES[slug] ?? humanize(slug)
  return [
    {
      id: 'g1',
      name: `${label} · Model A - Refurbished`,
      img: img[0],
      rating: 4.9,
      price: 24999,
      mrp: 34999,
      memberPrice: 24299,
      emi: 1250,
      stockLeft: 3,
      lowestPrice: true,
      offAmount: 4000,
    },
    {
      id: 'g2',
      name: `${label} · Model B - Refurbished`,
      img: img[1],
      rating: 4.7,
      price: 31999,
      mrp: 42999,
      memberPrice: 30999,
      emi: 1600,
      stockLeft: 1,
      lowestPrice: false,
      offAmount: 6000,
    },
  ]
}

function formatRupee(n) {
  return n.toLocaleString('en-IN')
}

function FilterSection({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-slate-200 py-3 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left text-sm font-bold text-slate-900"
      >
        {title}
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  )
}

function CheckboxRow({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
      />
      <span>{label}</span>
    </label>
  )
}

export default function BuyPreOwnedExplorePage() {
  const { kind, slug } = useParams()
  const navigate = useNavigate()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [introExpanded, setIntroExpanded] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [sortBy, setSortBy] = useState('featured')

  const [filterProductType, setFilterProductType] = useState(true)
  const [filterInStock, setFilterInStock] = useState(true)
  const [filterBrandMatch, setFilterBrandMatch] = useState(true)
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(150000)
  const [ram8, setRam8] = useState(false)
  const [ram12, setRam12] = useState(false)
  const [ram16, setRam16] = useState(false)

  const [openProductType, setOpenProductType] = useState(true)
  const [openAvailability, setOpenAvailability] = useState(true)
  const [openBrand, setOpenBrand] = useState(true)
  const [openPrice, setOpenPrice] = useState(true)
  const [openRam, setOpenRam] = useState(true)

  const categoryLabel = CATEGORY_TITLES[slug] ?? humanize(slug)
  const brandLabel = BRAND_TITLES[slug] ?? humanize(slug)

  const pageTitle = useMemo(() => {
    if (kind === 'brand') {
      if (slug === 'google') return 'Buy Refurbished Google Pixel Mobile Phone'
      if (slug === 'apple') return 'Buy Refurbished Apple iPhone'
      return `Buy Refurbished ${brandLabel} Mobile Phone`
    }
    if (slug === 'phones') return 'Buy Refurbished Mobile Phone'
    return `Buy ${categoryLabel}`
  }, [kind, slug, brandLabel, categoryLabel])

  const breadcrumbMid = 'Buy Refurbished Mobile Phone'
  const breadcrumbLast =
    kind === 'brand' ? `Buy Refurbished ${brandLabel}` : categoryLabel

  const introShort =
    kind === 'brand' && slug === 'google'
      ? "Google's Pixel lineup brings clean Android, excellent cameras, and years of updates — now more accessible with certified refurbished units checked for quality."
      : kind === 'brand'
        ? `${brandLabel} devices combine performance and value. Explore warranty-backed refurbished units with transparent grading and easy returns.`
        : `Shop ${categoryLabel.toLowerCase()} with warranty-backed quality checks, clear condition grades, and competitive pricing across top models.`

  const introMore =
    ' Every unit is inspected, data-wiped, and backed by Baskaro support so you can buy with confidence.'

  const products = useMemo(() => {
    if (kind !== 'category' && kind !== 'brand') return []
    return getListingProducts(kind, slug)
  }, [kind, slug])

  const sortedProducts = useMemo(() => {
    const list = [...products]
    if (sortBy === 'price-low') list.sort((a, b) => a.price - b.price)
    if (sortBy === 'price-high') list.sort((a, b) => b.price - a.price)
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating)
    return list
  }, [products, sortBy])

  const clearFilters = () => {
    setFilterProductType(true)
    setFilterInStock(true)
    setFilterBrandMatch(true)
    setPriceMin(0)
    setPriceMax(150000)
    setRam8(false)
    setRam12(false)
    setRam16(false)
  }

  const filterBrandName = kind === 'brand' ? brandLabel : 'All'

  if (kind !== 'category' && kind !== 'brand') {
    return <Navigate to="/buy-pre-owned" replace />
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">{pageTitle}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {introShort}
            {!introExpanded && (
              <button
                type="button"
                onClick={() => setIntroExpanded(true)}
                className="ml-1 font-bold text-red-600 hover:text-red-700"
              >
                Read More
              </button>
            )}
            {introExpanded && <span>{introMore}</span>}
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500 sm:text-sm">
              <Link to="/" className="transition hover:text-red-600">
                Home
              </Link>
              <span className="text-slate-300">&gt;</span>
              <span className="text-slate-600">{breadcrumbMid}</span>
              <span className="text-slate-300">&gt;</span>
              <span className="text-slate-900">{breadcrumbLast}</span>
            </nav>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-800 shadow-sm sm:text-sm"
              >
                Sort by
                <ChevronDown className={`h-4 w-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value)
                        setSortOpen(false)
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-sm font-semibold transition hover:bg-red-50 ${
                        sortBy === opt.value ? 'text-red-700' : 'text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:flex lg:gap-8 lg:px-8 lg:py-10">
        <aside className="mb-8 w-full shrink-0 lg:mb-0 lg:w-64 xl:w-72">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Filters</h2>
              <button type="button" onClick={clearFilters} className="text-xs font-bold text-red-600 hover:text-red-700">
                Clear Filters
              </button>
            </div>

            <FilterSection title="Product Type" open={openProductType} onToggle={() => setOpenProductType((v) => !v)}>
              <CheckboxRow
                label="Mobile Phone"
                checked={filterProductType}
                onChange={setFilterProductType}
              />
            </FilterSection>

            <FilterSection title="Availability" open={openAvailability} onToggle={() => setOpenAvailability((v) => !v)}>
              <CheckboxRow label="In Stock" checked={filterInStock} onChange={setFilterInStock} />
            </FilterSection>

            <FilterSection title="Brand" open={openBrand} onToggle={() => setOpenBrand((v) => !v)}>
              <CheckboxRow label={filterBrandName} checked={filterBrandMatch} onChange={setFilterBrandMatch} />
            </FilterSection>

            <FilterSection title="Price Range" open={openPrice} onToggle={() => setOpenPrice((v) => !v)}>
              <div className="flex flex-col gap-3">
                <input
                  type="range"
                  min={0}
                  max={150000}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer accent-red-600"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Min</label>
                    <input
                      type="number"
                      value={priceMin}
                      min={0}
                      onChange={(e) => setPriceMin(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-semibold"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Max</label>
                    <input
                      type="number"
                      value={priceMax}
                      min={0}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>
            </FilterSection>

            <FilterSection title="RAM" open={openRam} onToggle={() => setOpenRam((v) => !v)}>
              <CheckboxRow label="8 GB RAM" checked={ram8} onChange={setRam8} />
              <CheckboxRow label="12 GB RAM" checked={ram12} onChange={setRam12} />
              <CheckboxRow label="16 GB RAM" checked={ram16} onChange={setRam16} />
            </FilterSection>
          </div>

          <Link
            to="/buy-pre-owned"
            className="mt-4 inline-flex text-sm font-bold text-slate-600 transition hover:text-red-600"
          >
            ← Back to Buy Pre-Owned
          </Link>
        </aside>

        <main className="min-w-0 flex-1 space-y-4">
          {sortedProducts.map((p) => {
            const offPct = Math.round(((p.mrp - p.price) / p.mrp) * 100)
            const wishlistId = `preowned-${kind}-${slug}-${p.id}`
            const wishlisted = isWishlisted(wishlistId)
            return (
              <article
                key={p.id}
                onClick={() =>
                  navigate(
                    `/buy-pre-owned/product/${kind}/${slug}/${p.id}?name=${encodeURIComponent(p.name)}&img=${encodeURIComponent(p.img)}&rating=${encodeURIComponent(String(p.rating))}&price=${encodeURIComponent(String(p.price))}&mrp=${encodeURIComponent(String(p.mrp))}`,
                  )
                }
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:gap-6 sm:p-5"
              >
                <div className="relative mx-auto w-full max-w-[200px] shrink-0 sm:mx-0 sm:w-48">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleWishlist({
                        id: wishlistId,
                        name: p.name,
                        price: String(p.price),
                        img: p.img,
                      })
                    }}
                    className={`absolute right-2 top-2 z-10 rounded-full p-2 shadow-md ring-1 transition ${
                      wishlisted ? 'bg-red-50 text-red-600 ring-red-200' : 'bg-white/95 text-slate-500 ring-slate-200 hover:text-red-600'
                    }`}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-600 text-red-600' : ''}`} strokeWidth={2} />
                  </button>
                  <div className="absolute left-2 top-2 rounded bg-slate-900 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                    Baskaro Assured
                  </div>
                  {p.stockLeft <= 2 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {p.stockLeft} left
                    </div>
                  )}
                  <div className="flex aspect-square items-center justify-center rounded-xl bg-slate-50 p-4">
                    <img src={p.img} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start gap-2">
                    {p.lowestPrice && (
                      <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">Lowest Price</span>
                    )}
                    {p.offAmount > 0 && (
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        ₹{formatRupee(p.offAmount)} OFF
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg font-extrabold text-slate-900 sm:text-xl">{p.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm font-bold text-amber-600">
                    {p.rating.toFixed(1)} <Star className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden />
                  </p>

                  <div className="mt-4 flex flex-wrap items-end gap-3">
                    <span className="text-2xl font-black text-slate-900">₹{formatRupee(p.price)}</span>
                    <span className="text-sm font-bold text-red-600">-{offPct}%</span>
                    <span className="text-sm font-semibold text-slate-400 line-through">₹{formatRupee(p.mrp)}</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5">
                    <span className="text-xs font-black uppercase tracking-wide text-amber-800">Gold</span>
                    <span className="text-sm font-extrabold text-slate-900">₹{formatRupee(p.memberPrice)}</span>
                    <span className="text-xs font-semibold text-slate-600">member price</span>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    ₹{formatRupee(p.emi)}/month · No Cost EMI
                  </p>
                </div>
              </article>
            )
          })}
        </main>
      </div>
    </div>
  )
}
