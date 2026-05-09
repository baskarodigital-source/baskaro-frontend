import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Smartphone, Bike, Banknote } from 'lucide-react'
import { SellSubShowcaseCarousels } from '../components/SellSubShowcaseCarousels.jsx'

const WHY_SELL_ON_BASKARO = [
  {
    title: 'Safe & Secure',
    text: "Select your device and we'll help you unlock the best selling price based on the present conditions of your gadget and the current market price.",
    Icon: Smartphone,
  },
  {
    title: 'Instant Payment',
    text: "On accepting the price offered for your device, we'll arrange a free pick up.",
    Icon: Bike,
  },
  {
    title: 'Best Price',
    text: 'Instant cash will be handed over to you at time of pickup or through payment mode of your choice.',
    Icon: Banknote,
  },
]

const PHONE_IMGS = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1574944981039-fa734261f3c1?w=400&auto=format&fit=crop',
]

const MID_CRUMB = {
  phone: { label: 'Sell Old Mobile Phone', to: '/sell/phone' },
  laptops: { label: 'Sell Laptop', to: '/sell/laptops' },
  'smart-speaker': { label: 'Sell Smart Speaker', to: '/sell/smart-speaker' },
  tablet: { label: 'Sell Tablet', to: '/sell/tablet' },
  'gaming-consoles': { label: 'Sell Gaming Console', to: '/sell/gaming-consoles' },
  smartwatch: { label: 'Sell Smartwatch', to: '/sell/smartwatch' },
  tv: { label: 'Sell TV', to: '/sell/tv' },
  earbuds: { label: 'Sell Earbuds', to: '/sell/earbuds' },
  'dslr-camera': { label: 'Sell DSLR Camera', to: '/sell/dslr-camera' },
  ac: { label: 'Sell AC', to: '/sell/ac' },
  imac: { label: 'Sell iMac', to: '/sell/imac' },
}

const TAIL_WORD = {
  phone: 'Mobile Phone',
  laptops: 'Laptop',
  'smart-speaker': 'Smart Speaker',
  tablet: 'Tablet',
  'gaming-consoles': 'Gaming Console',
  smartwatch: 'Smartwatch',
  tv: 'TV',
  earbuds: 'Earbuds',
  'dslr-camera': 'Camera',
  ac: 'Air Conditioner',
  imac: 'iMac',
}

const XIAOMI_SERIES = [
  'Mi Series',
  'Redmi Note Series',
  'Redmi Series',
  '11 Series',
  '12 Series',
  '13 Series',
  'POCO Series',
  'A Series',
  'C Series',
  'X Series',
  'Note Series',
  '10 Series',
  '9 Series',
  '8 Series',
  '7 Series',
  '6 Series',
  '5 Series',
  'Mix Series',
  'Pad Series',
  'Black Shark Series',
]

const APPLE_SERIES = [
  'iPhone 17 Series',
  'iPhone 16 Series',
  'iPhone 15 Series',
  'iPhone 14 Series',
  'iPhone 13 Series',
  'iPhone 12 Series',
  'iPhone 11 Series',
  'iPhone SE Series',
  'iPhone X Series',
  'Pro Series',
  'Plus Series',
  'Mini Series',
  'Max Series',
  'Ultra Series',
  'Air Series',
  'Classic Series',
  'Lite Series',
  'Note Series',
  'Edge Series',
  'Neo Series',
]

function normalizeKey(s) {
  return (s || '').trim().toLowerCase()
}

function isGenericMore(item) {
  return /^more\b/i.test(item || '')
}

function buildPageTitle(item, cat) {
  const i = (item || 'Your device').trim()
  const c = cat || 'phone'
  if (!i || isGenericMore(i)) return 'Sell your device'
  const words = i.split(/\s+/).filter(Boolean)
  const hasSeries = /series/i.test(i)
  if (words.length >= 3 || hasSeries) {
    return i.toLowerCase().startsWith('sell old') ? i : `Sell Old ${i}`
  }
  const tail = TAIL_WORD[c] || 'Device'
  return `Sell Old ${i} ${tail}`
}

function seriesForBrand(item, cat) {
  const key = normalizeKey(item)
  if (isGenericMore(item)) {
    return Array.from({ length: 20 }, (_, i) => `Series ${i + 1}`)
  }
  if (key.includes('xiaomi') || key === 'poco') return [...XIAOMI_SERIES]
  if (key === 'apple') return [...APPLE_SERIES]
  if (cat === 'laptops') {
    return [
      'Pavilion Series',
      'Vostro Series',
      'Inspiron Series',
      'ThinkPad Series',
      'IdeaPad Series',
      'MacBook Series',
      'Galaxy Book Series',
      'Envy Series',
      'Spectre Series',
      'ProBook Series',
      'EliteBook Series',
      'Legion Series',
      'Yoga Series',
      'Aspire Series',
      'Swift Series',
      'ZenBook Series',
      'R Series',
      'M Series',
      'X Series',
      'Ultra Series',
    ]
  }
  return Array.from({ length: 20 }, (_, i) => `${item} ${i + 1} Series`)
}

/** Reference-style Xiaomi model cards (+ extras for a full grid). */
const XIAOMI_MODEL_NAMES = [
  'Xiaomi Redmi Note 6 Pro',
  'Xiaomi Mi A2',
  'Xiaomi Redmi 6',
  'Xiaomi Redmi 6 pro',
  'Xiaomi Redmi 6A',
  'Xiaomi Redmi Y2',
  'Xiaomi Redmi 5',
  'Xiaomi Redmi Note 5 Pro',
  'Xiaomi Redmi Note 5',
  'Xiaomi Redmi 5A',
  'Xiaomi Redmi Y1',
  'Redmi Y1 Lite',
  'Mi Mix 2',
  'Xiaomi Mi Max 2',
  'Xiaomi Redmi Note 7',
  'Xiaomi Redmi Note 7 Pro',
  'Xiaomi Redmi Go',
  'Xiaomi Redmi 7',
  'Xiaomi Redmi 8',
  'Xiaomi Redmi Note 8',
  'Xiaomi Redmi Note 8 Pro',
  'Xiaomi Redmi 9',
  'Xiaomi Mi 9',
  'Xiaomi Mi 10',
  'Xiaomi Redmi Note 10',
  'Xiaomi Redmi Note 10 Pro',
  'Xiaomi POCO X3',
  'Xiaomi POCO M3',
  'Xiaomi Redmi Note 11',
  'Xiaomi 11 Lite',
]

const APPLE_IPHONE_MODEL_NAMES = [
  'Apple iPhone 15 Pro Max',
  'Apple iPhone 15 Pro',
  'Apple iPhone 15',
  'Apple iPhone 14 Pro Max',
  'Apple iPhone 14 Pro',
  'Apple iPhone 14',
  'Apple iPhone 13 Pro',
  'Apple iPhone 13',
  'Apple iPhone 12 Pro',
  'Apple iPhone 12',
  'Apple iPhone 11 Pro Max',
  'Apple iPhone 11 Pro',
  'Apple iPhone 11',
  'Apple iPhone SE (3rd gen)',
  'Apple iPhone XS Max',
  'Apple iPhone XR',
  'Apple iPhone X',
  'Apple iPhone 8 Plus',
  'Apple iPhone 8',
  'Apple iPhone 7 Plus',
  'Apple iPhone 7',
  'Apple iPhone 6s Plus',
  'Apple iPhone 6s',
  'Apple iPhone 6',
]

const SAMSUNG_MODEL_NAMES = [
  'Samsung Galaxy S24 Ultra',
  'Samsung Galaxy S24+',
  'Samsung Galaxy S24',
  'Samsung Galaxy S23 Ultra',
  'Samsung Galaxy S23',
  'Samsung Galaxy S22 Ultra',
  'Samsung Galaxy S22',
  'Samsung Galaxy Note 20 Ultra',
  'Samsung Galaxy Note 20',
  'Samsung Galaxy Z Fold 5',
  'Samsung Galaxy Z Flip 5',
  'Samsung Galaxy A54',
  'Samsung Galaxy A34',
  'Samsung Galaxy A24',
  'Samsung Galaxy M54',
  'Samsung Galaxy M34',
  'Samsung Galaxy F54',
  'Samsung Galaxy S21 FE',
  'Samsung Galaxy S21 Ultra',
  'Samsung Galaxy S21+',
  'Samsung Galaxy S21',
  'Samsung Galaxy Note 10+',
  'Samsung Galaxy Note 10',
  'Samsung Galaxy S10+',
  'Samsung Galaxy S10',
  'Samsung Galaxy A73',
  'Samsung Galaxy A53',
  'Samsung Galaxy A33',
  'Samsung Galaxy A23',
  'Samsung Galaxy A13',
]

const ONEPLUS_MODEL_NAMES = [
  'OnePlus 12',
  'OnePlus 12R',
  'OnePlus Open',
  'OnePlus 11',
  'OnePlus 11R',
  'OnePlus Nord 3',
  'OnePlus Nord CE 3',
  'OnePlus 10 Pro',
  'OnePlus 10T',
  'OnePlus 10R',
  'OnePlus Nord 2T',
  'OnePlus 9 Pro',
  'OnePlus 9',
  'OnePlus 9R',
  'OnePlus Nord CE 2',
  'OnePlus 8 Pro',
  'OnePlus 8',
  'OnePlus 8T',
  'OnePlus Nord',
  'OnePlus 7 Pro',
  'OnePlus 7',
  'OnePlus 7T',
  'OnePlus 6T',
  'OnePlus 6',
  'OnePlus 5T',
  'OnePlus 5',
  'OnePlus 3T',
  'OnePlus 3',
  'OnePlus X',
  'OnePlus One',
]

function namesToCards(names, seriesKey) {
  return names.map((name, idx) => ({
    id: `${seriesKey}-${idx}-${name.slice(0, 12)}`,
    name,
    img: PHONE_IMGS[idx % PHONE_IMGS.length],
  }))
}

function filterXiaomiModelsBySeries(names, series) {
  const s = (series || '').toLowerCase()
  if (!s) return names
  if (s.includes('redmi note')) return names.filter((n) => /redmi note/i.test(n))
  if (s.includes('poco')) return names.filter((n) => /poco/i.test(n))
  if (s.includes('mix') || s.includes('pad')) return names.filter((n) => /mix|pad/i.test(n))
  if (s.includes('black shark')) return names.filter((n) => /shark/i.test(n))
  const numSeries = series.match(/^(\d+)\s*series$/i)
  if (numSeries) {
    const num = numSeries[1]
    const hit = names.filter((n) => n.includes(num))
    return hit.length ? hit : names
  }
  if (s.includes('redmi') && !s.includes('note')) {
    return names.filter((n) => /redmi/i.test(n) && !/redmi note/i.test(n))
  }
  if (s.startsWith('mi ') || s === 'mi series') {
    return names.filter((n) => {
      if (/redmi|poco/i.test(n)) return false
      return /\bmi\b|mix|max/i.test(n)
    })
  }
  return names
}

function curatedPhoneModels(brand, series) {
  const key = normalizeKey(brand)
  if (key.includes('xiaomi') || key === 'poco') {
    const list = filterXiaomiModelsBySeries([...XIAOMI_MODEL_NAMES], series)
    return namesToCards(list.length ? list : XIAOMI_MODEL_NAMES, series)
  }
  if (key === 'apple') return namesToCards(APPLE_IPHONE_MODEL_NAMES, series)
  if (key.includes('samsung')) return namesToCards(SAMSUNG_MODEL_NAMES, series)
  if (key.includes('oneplus')) return namesToCards(ONEPLUS_MODEL_NAMES, series)
  return null
}

function generatedModelsForSeries(brand, series, cat) {
  const b = (brand || 'Device').trim()
  const s = (series || 'Standard').replace(/\s*Series\s*$/i, '').trim()
  const prefix = cat === 'laptops' ? `${b} ${s}` : `${b} ${s}`.replace(/\s+/g, ' ')
  const samples = [
    'Pro',
    'Pro Max',
    'Lite',
    'Ultra',
    'Plus',
    '5G',
    'Neo',
    'Prime',
    'Youth',
    'X',
    'A',
    'C',
    'Note',
    'Mini',
    'Max',
    'SE',
    'FE',
    'Edge',
    'Razor',
    'Air',
  ]
  return samples.map((suffix, idx) => ({
    id: `${series}-${idx}`,
    name: `${prefix} ${suffix}`.replace(/\s+/g, ' ').trim(),
    img: PHONE_IMGS[idx % PHONE_IMGS.length],
  }))
}

function modelsForSeries(brand, series, cat) {
  if (cat === 'phone') {
    const curated = curatedPhoneModels(brand, series)
    if (curated) return curated
  }
  return generatedModelsForSeries(brand, series, cat)
}

export default function SellSubPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const item = searchParams.get('item')?.trim() || ''
  const cat = searchParams.get('cat')?.trim() || 'phone'
  const selectedPrice = searchParams.get('price')?.trim() || ''
  const selectedImg = searchParams.get('img')?.trim() || ''
  const exactProductMode = Boolean(selectedPrice || selectedImg)

  const [seriesQuery, setSeriesQuery] = useState('')
  const [modelQuery, setModelQuery] = useState('')
  const [selectedSeries, setSelectedSeries] = useState('')

  const mid = MID_CRUMB[cat] ?? MID_CRUMB.phone

  const seriesList = useMemo(() => seriesForBrand(item, cat), [item, cat])

  useEffect(() => {
    if (seriesList.length && !selectedSeries) {
      setSelectedSeries(seriesList[0])
    }
  }, [seriesList, selectedSeries])

  useEffect(() => {
    setSelectedSeries('')
  }, [item, cat])

  const filteredSeries = useMemo(() => {
    const q = seriesQuery.trim().toLowerCase()
    if (!q) return seriesList
    return seriesList.filter((s) => s.toLowerCase().includes(q))
  }, [seriesList, seriesQuery])

  const models = useMemo(() => {
    if (!selectedSeries) return []
    return modelsForSeries(item, selectedSeries, cat)
  }, [item, selectedSeries, cat])

  const filteredModels = useMemo(() => {
    const q = modelQuery.trim().toLowerCase()
    if (!q) return models
    return models.filter((m) => m.name.toLowerCase().includes(q))
  }, [models, modelQuery])

  const pageTitle = buildPageTitle(item, cat)
  const lastCrumb = item && !isGenericMore(item) ? `Sell Old ${item}` : 'Select device'

  if (!item) {
    return (
      <div className="min-h-[60vh] bg-white px-4 py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-600">Open the Sell Phone menu and choose a brand or model to continue.</p>
          <Link
            to="/sell/phone"
            className="mt-6 inline-flex rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
          >
            Sell phone home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-black via-red-900 to-black" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">{pageTitle}</h1>
            <nav className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-500">
              <Link to="/" className="transition hover:text-red-600">
                Home
              </Link>
              <span className="text-slate-300" aria-hidden>
                &gt;
              </span>
              <Link to={mid.to} className="transition hover:text-red-600">
                {mid.label}
              </Link>
              <span className="text-slate-300" aria-hidden>
                &gt;
              </span>
              <span className="text-slate-800">{lastCrumb}</span>
            </nav>
          </div>
          <div className="w-full shrink-0 lg:max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                type="search"
                value={modelQuery}
                onChange={(e) => setModelQuery(e.target.value)}
                placeholder="Select Model"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>
        </div>

        {exactProductMode && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[220px_1fr] md:items-center">
              <div className="mx-auto flex h-[230px] w-[180px] items-center justify-center rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <img
                  src={selectedImg || PHONE_IMGS[0]}
                  alt={item}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{item}</h2>
                <p className="mt-4 text-lg font-semibold text-slate-700">Get Upto</p>
                <p className="mt-1 text-4xl font-extrabold text-rose-500 sm:text-5xl">₹{selectedPrice || '24,120'}</p>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/sell/device-check?item=${encodeURIComponent(item)}&cat=${encodeURIComponent(cat)}&price=${encodeURIComponent(selectedPrice || '24,120')}&img=${encodeURIComponent(selectedImg || '')}`,
                    )
                  }
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-teal-400 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-teal-500"
                >
                  Get Exact Value <span className="ml-2">→</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {!exactProductMode && (
          <>
            <section className="mt-10">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">Select Series</h2>
                <input
                  type="search"
                  value={seriesQuery}
                  onChange={(e) => setSeriesQuery(e.target.value)}
                  placeholder="Filter series..."
                  className="h-10 max-w-xs rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredSeries.map((s) => {
                  const active = s === selectedSeries
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSeries(s)}
                      className={[
                        'rounded-xl border px-3 py-2.5 text-center text-xs font-bold transition sm:text-sm',
                        active
                          ? 'border-red-600 bg-red-50 text-red-800 shadow-sm ring-2 ring-red-200'
                          : 'border-slate-200 bg-slate-100 text-slate-800 hover:border-red-200 hover:bg-red-50/50',
                      ].join(' ')}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="mb-4 text-lg font-extrabold text-slate-900 sm:text-xl">Select Model</h2>
              {!selectedSeries ? (
                <p className="text-sm text-slate-500">Choose a series above to see models.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-4 lg:grid-cols-6 lg:gap-3">
                  {filteredModels.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      title={`Sell Old ${m.name}`}
                      onClick={() =>
                        navigate(
                          `/sell/model-detail?item=${encodeURIComponent(m.name)}&cat=${encodeURIComponent(cat)}&img=${encodeURIComponent(m.img)}&sold=${encodeURIComponent('19450+')}&price=${encodeURIComponent('19450')}`,
                        )
                      }
                      className="flex h-[156px] w-full flex-col overflow-hidden rounded-lg border border-slate-200/90 bg-white p-2 text-center shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition hover:border-red-300 hover:shadow-[0_4px_12px_rgba(185,28,28,0.12)] sm:h-[168px] sm:p-2.5 md:h-[174px]"
                    >
                      <div className="flex h-[88px] shrink-0 items-center justify-center sm:h-[94px] md:h-[96px]">
                        <img
                          src={m.img}
                          alt=""
                          className="max-h-full max-w-[88%] object-contain"
                          loading="lazy"
                        />
                      </div>
                      <p className="mt-auto flex min-h-[2.5rem] items-start justify-center px-0.5 pt-1 text-center text-[10px] font-semibold leading-tight text-slate-900 sm:min-h-[2.75rem] sm:text-[11px]">
                        <span className="line-clamp-2">{m.name}</span>
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {cat === 'phone' && <SellSubShowcaseCarousels categorySlug={cat} />}

        <section className="mt-16 border-t border-slate-100 bg-white pt-12 sm:mt-20 sm:pt-14">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Why Sell On Baskaro?</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
            {WHY_SELL_ON_BASKARO.map(({ title, text, Icon }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100/80 sm:h-20 sm:w-20">
                  <Icon className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.6} aria-hidden />
                </div>
                <h3 className="mt-5 text-base font-bold text-slate-900 sm:text-lg">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-16 h-1 w-full bg-gradient-to-r from-black via-red-900 to-black" aria-hidden />
    </div>
  )
}
