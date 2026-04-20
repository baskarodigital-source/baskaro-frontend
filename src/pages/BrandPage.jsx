import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { getCatalogModels, getCatalogPhoneBrands } from '../lib/api/baskaroApi.js'

// Import premium PNG assets
import s25Front from '../assets/products/s25_titanium.jpg'
import s25Back from '../assets/products/s25_back.png'
import s25Perspective from '../assets/products/s25_inner.png'
import iphone14Front from '../assets/products/iphone14_purple.jpg'
import iphone13Blue from '../assets/products/iphone13_blue.jpg'
import iphone13ProMax from '../assets/products/iphone13_promax.jpg'
import iphone13Pro from '../assets/products/iphone13_pro.jpg'
import iphone11Purple from '../assets/products/iphone11_purple.jpg'
import iphone12Red from '../assets/products/iphone12_red.jpg'
import iphone12ProMax from '../assets/products/iphone12_promax.jpg'
import iphone12Pro from '../assets/products/iphone12_pro.jpg'
import iphone14Pro from '../assets/products/iphone14_pro.jpg'
import iphone15Pro from '../assets/products/iphone15_pro.jpg'
import iphone15Pink from '../assets/products/iphone15_pink.jpg'
import iphone14Plus from '../assets/products/iphone14_plus.jpg'
import iphone11ProMax from '../assets/products/iphone11_promax.jpg'
import iphone11Pro from '../assets/products/iphone11_pro.jpg'

const BRAND_SERIES = {
  Apple: [
    { name: 'iPhone 16 Series', models: ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16'] },
    { name: 'iPhone 15 Series', models: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15'] },
    { name: 'iPhone 14 Series', models: ['iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14'] },
    { name: 'iPhone 13 Series', models: ['iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13 mini', 'iPhone 13'] },
    { name: 'iPhone 12 Series', models: ['iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12 mini', 'iPhone 12'] },
    { name: 'iPhone 11 Series', models: ['iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11'] },
  ],
  Samsung: [
    { name: 'S25 Series (New)', models: ['Galaxy S25 Edge', 'Galaxy S25 Ultra', 'Galaxy S25 Plus', 'Galaxy S25'] },
    { name: 'S24 Series', models: ['Galaxy S24 Ultra', 'Galaxy S24 Plus', 'Galaxy S24'] },
    { name: 'S23 Series', models: ['Galaxy S23 Ultra', 'Galaxy S23 Plus', 'Galaxy S23'] },
    { name: 'Fold/Flip Series', models: ['Galaxy Z Fold 5', 'Galaxy Z Flip 5', 'Galaxy Z Fold 4'] },
  ]
}

const DEVICE_IMAGES = {
  'iPhone 16 Pro Max': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg',
  'iPhone 16 Pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg',
  'iPhone 16 Plus': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-plus.jpg',
  'iPhone 16': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg',
  'iPhone 15 Pro Max': iphone15Pro,
  'iPhone 15 Pro': iphone15Pro,
  'iPhone 15 Plus': iphone15Pink,
  'iPhone 15': iphone15Pink,
  'iPhone 14 Pro Max': iphone14Pro,
  'iPhone 14 Pro': iphone14Pro,
  'iPhone 14 Plus': iphone14Plus,
  'iPhone 14': iphone14Front,
  'iPhone 13 Pro Max': iphone13ProMax,
  'iPhone 13 Pro': iphone13Pro,
  'iPhone 13 mini': iphone13Blue,
  'iPhone 13': iphone13Blue,
  'iPhone 12 Pro Max': iphone12ProMax,
  'iPhone 12 Pro': iphone12Pro,
  'iPhone 12 mini': iphone12Red,
  'iPhone 12': iphone12Red,
  'iPhone 11 Pro Max': iphone11ProMax,
  'iPhone 11 Pro': iphone11Pro,
  'iPhone 11': iphone11Purple,
  'Galaxy S25 Edge': s25Front,
  'Galaxy S25 Ultra': s25Perspective,
  'Galaxy S24 Ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra.jpg',
  'default_phone': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg'
}

const BrandPage = () => {
  const { brandName } = useParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [models, setModels] = useState([])

  const decodedBrand = useMemo(() => decodeURIComponent(String(brandName || '')).trim(), [brandName])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const brands = await getCatalogPhoneBrands()
        const b = Array.isArray(brands)
          ? brands.find((x) => String(x?.name || '').toLowerCase() === decodedBrand.toLowerCase())
          : null
        if (!b?._id) {
          if (!cancelled) setModels([])
          return
        }
        const list = await getCatalogModels({ brandId: b._id })
        const arr = Array.isArray(list) ? list : []
        const mapped = arr
          .map((m) => ({
            id: m._id || m.id,
            name: m.modelName || m.name || '',
            image: m.image || '',
          }))
          .filter((m) => m.id && m.name)
        if (!cancelled) setModels(mapped)
      } catch {
        if (!cancelled) setModels([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (decodedBrand) load()
    return () => {
      cancelled = true
    }
  }, [decodedBrand])

  const q = searchQuery.trim().toLowerCase()
  const filteredModels = useMemo(() => {
    if (!q) return models
    return models.filter((m) => m.name.toLowerCase().includes(q))
  }, [models, q])

  return (
    <div className="min-h-screen bg-slate-50 font-['Outfit'] pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="relative mb-10 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
             Official {brandName} Marketplace
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
            Sell Your <span className="text-rose-600">{brandName}</span>
          </h1>
          <p className="text-base text-slate-500 max-w-xl font-medium leading-relaxed italic opacity-80">
            Select your model to get an instant valuation. Fast, secure and the best price guaranteed.
          </p>
        </motion.div>

        {loading ? (
          <div className="py-20 flex items-center justify-center text-sm font-semibold text-slate-500">
            Loading models…
          </div>
        ) : filteredModels.length > 0 ? (
          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-4 mb-8">
                 <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase tracking-[0.2em]">{decodedBrand} models</h2>
                 <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredModels.map((m, midx) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: midx * 0.05 }}
                    whileHover={{ y: -8 }}
                    className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-[0_40px_80px_-20px_rgba(244,63,94,0.15)] transition-all duration-500 flex flex-col h-full items-center text-center relative overflow-hidden"
                  >
                    <div className="w-full h-48 relative mb-6 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                        <div className="absolute inset-0 bg-slate-50/50 rounded-full scale-90 blur-2xl group-hover:bg-rose-50/50 transition-colors" />
                        <img
                          src={m.image || DEVICE_IMAGES[m.name] || DEVICE_IMAGES['default_phone']}
                          className="h-44 w-44 object-contain relative z-10"
                          alt={m.name}
                        />
                    </div>
                    <div className="mt-auto w-full">
                      <h3 className="text-base font-black text-slate-900 mb-1 group-hover:text-rose-600 transition-colors">
                         {m.name}
                      </h3>
                      <button
                        onClick={() => navigate(`/sell/assessment/${brandName}/${m.name.replace(/ /g, '-')}`)}
                        className="w-full py-4 rounded-2xl bg-slate-900 group-hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 group-hover:shadow-rose-600/30"
                      >
                        SELL NOW
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
             <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6 font-black text-3xl">?</div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">No models found</h3>
             <p className="text-slate-400 font-bold">Try searching with a different model name.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default BrandPage
