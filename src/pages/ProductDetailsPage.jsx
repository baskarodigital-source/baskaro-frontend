import React, { useState, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronRight, ChevronLeft, ShieldCheck, Heart, Share2, Info, Check, ShoppingCart, PlusCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { getMobileModel, getOffers } from '../lib/api/baskaroApi.js'

const CONDITION_GRADES = [
   { id: 'Fair', label: 'Fair', desc: 'Noticeable signs of use' },
   { id: 'Good', label: 'Good', desc: 'Minor signs of use' },
   { id: 'Superb', label: 'Superb', desc: 'Like new condition' },
]

function specGroupsFromModel(model) {
   const spec = model?.specifications
   if (!spec || typeof spec !== 'object') return []

   const toLabel = (key) =>
      String(key || '')
         .replace(/[_-]+/g, ' ')
         .replace(/([a-z])([A-Z])/g, '$1 $2')
         .trim()
         .replace(/^./, (c) => c.toUpperCase())

   const formatValue = (v) => {
      if (v === null || v === undefined) return ''
      if (typeof v === 'string') return v.trim()
      if (typeof v === 'number' || typeof v === 'boolean') return String(v)
      if (Array.isArray(v)) {
         const items = v
            .map((x) => (typeof x === 'string' ? x.trim() : typeof x === 'number' ? String(x) : ''))
            .filter(Boolean)
         return items.length ? items.join(', ') : JSON.stringify(v)
      }
      // object
      try { return JSON.stringify(v) } catch { return String(v) }
   }

   const pairs = Object.entries(spec)
      .map(([k, v]) => ({ k: toLabel(k), v: formatValue(v) }))
      .filter((x) => x.k && x.v)

   if (!pairs.length) return []
   return [{ label: 'Specifications', specs: pairs }]
}

export default function ProductDetailsPage() {
   const { id } = useParams()
   const [model, setModel] = useState(null)
   const [loadErr, setLoadErr] = useState('')
   const [loading, setLoading] = useState(true)
   const [offers, setOffers] = useState([])
   const [selectedImg, setSelectedImg] = useState(0)
   const [condition, setCondition] = useState('Superb')
   const [extendedWarranty, setExtendedWarranty] = useState(false)
   const [showAllSpecs, setShowAllSpecs] = useState(false)
   const [isAdding, setIsAdding] = useState(false)
   const { addToCart } = useCart()
   const { isWishlisted, toggleWishlist } = useWishlist()
   const navigate = useNavigate()

   useEffect(() => {
      let cancelled = false
      setLoading(true)
      setLoadErr('')
      setOffers([])
      ;(async () => {
         try {
            const m = await getMobileModel(id)
            if (!cancelled) setModel(m)
            try {
               const o = await getOffers({ modelId: id })
               const list = Array.isArray(o?.data) ? o.data : Array.isArray(o) ? o : []
               if (!cancelled) setOffers(Array.isArray(list) ? list : [])
            } catch {
               if (!cancelled) setOffers([])
            }
         } catch (e) {
            if (!cancelled) setLoadErr(e.message || 'Product not found')
         } finally {
            if (!cancelled) setLoading(false)
         }
      })()
      return () => { cancelled = true }
   }, [id])

   const product = useMemo(() => {
      if (!model) return null
      const brandName = model.brandId?.name || '—'
      const v0 = model.storageVariants?.[0]
      const images = model.image ? [model.image] : ['/logo.png']
      const price = Number(model.basePrice) || 0
      return {
         title: `${brandName} ${model.modelName} - Pre-Owned`,
         brand: brandName,
         model: model.modelName,
         specs: model.specifications?.display || '—',
         ram: v0?.ram || '—',
         storage: v0?.label || '—',
         rating: 0,
         reviews: 0,
         price,
         originalPrice: 0,
         discount: 0,
         emi: price > 0 ? Math.max(1, Math.round(price / 24)) : 0,
         images,
         conditionGrades: CONDITION_GRADES,
         specGroups: specGroupsFromModel(model),
      }
   }, [model])

   if (loading) {
      return (
         <div className="min-h-screen bg-white flex items-center justify-center font-['Inter']">
            <p className="text-slate-600 font-semibold">Loading product…</p>
         </div>
      )
   }
   if (loadErr || !product) {
      return (
         <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 font-['Inter'] px-4">
            <p className="text-slate-800 font-bold text-center">{loadErr || 'Product not found'}</p>
            <Link to="/buy-pre-owned" className="text-red-600 font-bold hover:underline">Back to Buy Pre-Owned</Link>
         </div>
      )
   }

   const handleAddToCart = () => {
      setIsAdding(true)
      addToCart({
         id: id,
         name: product.title,
         price: product.price.toLocaleString('en-IN'),
         img: product.images[0]
      })
      setTimeout(() => setIsAdding(false), 1500)
   }

   const showThumbScroll = product.images?.length > 5

   const formatPrice = (p) => new Intl.NumberFormat('en-IN').format(p)

   return (
      <div className="min-h-screen bg-white font-['Inter'] pb-12">
         <div className="mx-auto max-w-7xl px-4 py-0 sm:px-6 lg:px-8">

            {/* Breadcrumbs */}
            <nav className="mb-2 flex items-center gap-2 text-[12px] font-medium text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
               <Link to="/" className="hover:text-red-600">Home</Link>
               <ChevronRight size={14} className="shrink-0" />
               <Link to="/buy-pre-owned" className="hover:text-red-600">Buy Pre-Owned Mobile Phone</Link>
               <ChevronRight size={14} className="shrink-0" />
               <Link to="#" className="hover:text-red-600">Buy Pre-Owned {product.brand}</Link>
               <ChevronRight size={14} className="shrink-0" />
               <span className="text-slate-900 truncate">{product.title}</span>
            </nav>

            <div className="grid gap-6 lg:grid-cols-[480px_1fr] lg:items-start">

               {/* Left: Image Gallery — align start so column height follows media, not the tall right column */}
               <div className="flex w-full flex-col gap-4 lg:max-w-[480px]">
                  <div className="flex w-full flex-col md:flex-row md:items-start gap-2">
                     {/* Thumbnails Sidebar */}
                     <div className="order-2 md:order-1 flex md:flex-col gap-2">
                        <div
                           className={[
                              'flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0',
                              showThumbScroll ? 'md:overflow-y-auto md:max-h-[280px] md:pr-1' : 'md:overflow-visible'
                           ].join(' ')}
                        >
                           {product.images.map((img, i) => (
                              <button
                                 key={i}
                                 onClick={() => setSelectedImg(i)}
                                 className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all p-0.5 ${selectedImg === i ? 'border-red-600 shadow-sm' : 'border-slate-100'
                                    }`}
                              >
                                 <img src={img} alt="" className="h-full w-full object-contain" />
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Main Stage (Spotlight Gradient) — self-start + aspect: no extra vertical stretch beside long right column */}
                     <div className="order-1 md:order-2 relative w-full min-w-0 md:flex-1 md:max-w-none self-start rounded-3xl border border-slate-100 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_var(--tw-gradient-via)_45%,_var(--tw-gradient-to)_100%)] from-rose-50/50 via-white to-slate-50/80 overflow-hidden flex flex-col group aspect-[3/4] max-md:min-h-[320px] transition-all duration-700">
                        <div className="absolute top-4 left-4 z-10">
                           <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                              <div className="h-6 w-6 rounded-full bg-slate-900 flex items-center justify-center">
                                 <span className="text-[10px] font-bold text-white uppercase leading-none">B</span>
                              </div>
                              <span className="text-[11px] font-bold text-slate-900 tracking-tight">BASKARO <span className="text-red-600 uppercase">Assured</span></span>
                           </div>
                        </div>

                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
                           <button
                              type="button"
                              onClick={() =>
                                 toggleWishlist({
                                    id,
                                    name: product.title,
                                    price: formatPrice(product.price),
                                    img: product.images[0],
                                 })
                              }
                              className={`flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm transition-colors active:scale-95 ${
                                 isWishlisted(id) ? 'text-red-600' : 'text-slate-400 hover:text-red-600'
                              }`}
                              aria-label={isWishlisted(id) ? 'Remove from wishlist' : 'Add to wishlist'}
                           >
                              <Heart size={20} className={isWishlisted(id) ? 'fill-red-600' : ''} />
                           </button>
                           <button className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm hover:text-blue-600 transition-colors border border-slate-100 active:scale-95">
                              <Share2 size={20} />
                           </button>
                        </div>

                        {/* Image sits in the upper part of the aspect box; no flex-1 gap above CTAs */}
                        <div className="relative flex min-h-0 flex-1 items-center justify-center p-2 pb-4">
                           <AnimatePresence mode="wait">
                              <motion.img
                                 key={selectedImg}
                                 initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                 animate={{ opacity: 1, scale: 1, y: 0 }}
                                 exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                 transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                 src={product.images[selectedImg]}
                                 alt={product.title}
                                 className="h-full w-full max-h-full object-contain mix-blend-multiply drop-shadow-2xl"
                              />
                           </AnimatePresence>
                        </div>

                        <div className="grid shrink-0 grid-cols-2 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                           <button 
                              type="button" 
                              onClick={handleAddToCart}
                              disabled={isAdding}
                              className={`flex flex-col items-center justify-center py-3 border-r transition-all group active:scale-95 outline-none ${isAdding ? 'bg-green-50 border-green-100' : 'border-rose-100 bg-rose-50/50 hover:bg-rose-100/50'}`}
                           >
                              {isAdding ? (
                                 <>
                                    <Check className="text-green-600" size={18} />
                                    <span className="text-[10px] font-bold text-green-600 mt-0.5 uppercase tracking-widest leading-none">Added!</span>
                                 </>
                              ) : (
                                 <>
                                    <ShoppingCart className="text-rose-600 mb-0.5" size={18} />
                                    <span className="text-[13px] font-black text-slate-900 leading-none">Add to Cart</span>
                                 </>
                              )}
                           </button>
                           <button 
                              type="button" 
                              onClick={() => {
                                 handleAddToCart();
                                 navigate('/cart');
                              }}
                              className="py-3 bg-slate-900 text-white font-black text-[14px] uppercase tracking-[0.1em] hover:bg-black active:scale-95 transition-all outline-none"
                           >
                              Buy Now
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Technical Specifications (Toggleable) */}
                  <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                     <button
                        onClick={() => setShowAllSpecs(!showAllSpecs)}
                        className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-slate-50 transition-colors group cursor-pointer"
                     >
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                              <Info size={18} />
                           </div>
                           <div className="text-left">
                              <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                                 Technical Specifications
                              </h2>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                 Model, Performance, Display & More
                              </p>
                           </div>
                        </div>
                        <div
                           className={`h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 transition-all ${showAllSpecs
                                 ? 'rotate-180 bg-slate-900 border-slate-900 text-white'
                                 : ''
                              }`}
                        >
                           <ChevronLeft className="-rotate-90" size={20} />
                        </div>
                     </button>

                     <AnimatePresence>
                        {showAllSpecs && (
                           <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.4, ease: 'easeInOut' }}
                              className="overflow-hidden bg-slate-50/30"
                           >
                              <div className="p-6 md:p-8 border-t border-slate-100">
                                 <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
                                    {(product.specGroups?.length ? product.specGroups : [{ label: 'Specifications', specs: [{ k: 'Model', v: product.model }] }]).map((group, i) => (
                                       <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                          <div className="flex items-center gap-2 mb-3">
                                             <div className="h-1 w-6 bg-red-600 rounded-full" />
                                             <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">{group.label}</h4>
                                          </div>
                                          <div
                                             className={[
                                                'space-y-3 pr-2',
                                                group.specs?.length > 5 ? 'max-h-72 overflow-y-auto' : '',
                                             ].join(' ')}
                                          >
                                             {group.specs.map((s, j) => (
                                                <div key={j} className="flex flex-col gap-1 border-b border-slate-200/50 pb-2 last:border-b-0">
                                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.k}</span>
                                                   <span className="text-[13px] font-extrabold text-slate-800">{s.v}</span>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    ))}
                                 </div>

                                 <div className="mt-8 flex items-center justify-center p-5 border-2 border-dashed border-slate-200 rounded-3xl bg-white group hover:border-red-200 transition-colors cursor-pointer">
                                    <div className="flex flex-col items-center">
                                       <PlusCircle size={26} className="text-slate-300 mb-2 group-hover:text-red-500 transition-colors group-hover:rotate-90 transition-transform" />
                                       <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest">
                                          Compare with similar devices
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </section>
               </div>

               {/* Right: Info Panels */}
               <div className="flex flex-col gap-4">
                  {/* Title & Ratings (Stable Gradient Text) */}
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                     <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-[1.1] mb-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-rose-600 to-slate-800">
                        {product.title}
                     </h1>
                     <p className="text-[15px] font-semibold text-slate-500 mb-4 flex items-center flex-wrap gap-2">
                        BASKARO Warranty, {condition}, {product.ram} / {product.storage}, {product.specs}
                     </p>

                     {(product.rating > 0 || product.reviews > 0) && (
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 bg-green-600 text-white px-2.5 py-1 rounded text-sm font-bold shadow-sm">
                           {product.rating} <Star size={14} fill="currentColor" />
                        </div>
                        <button type="button" className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                           {product.reviews} reviews
                        </button>
                     </div>
                     )}
                  </div>

                  {/* Pricing Row */}
                  <div className="border-y border-slate-100 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                     <div className="flex items-end gap-3 mb-2 flex-wrap">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{formatPrice(product.price)}</span>
                        {product.originalPrice > 0 && product.discount > 0 && (
                           <>
                              <span className="text-[17px] font-bold text-slate-400 line-through mb-1">₹{formatPrice(product.originalPrice)}</span>
                              <span className="text-2xl font-black text-rose-600 mb-0.5">-{product.discount}%</span>
                           </>
                        )}
                     </div>

                     <div className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
                        <span className="text-slate-900 font-extrabold">₹{formatPrice(product.emi)}/month <span className="text-slate-500 font-bold">EMI available.</span></span>
                        <button className="text-blue-600 hover:text-blue-700 font-black ml-1 transition-colors">View Plans</button>
                     </div>
                     <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Bajaj, Snapmint, Instacred EMI available</p>
                  </div>

                  {/* Condition Selection */}
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-slate-900">
                           <h3 className="text-[15px] font-black uppercase tracking-tight">Condition</h3>
                           <button className="text-blue-600 text-[13px] font-bold hover:underline transition-colors">Learn More</button>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 cursor-pointer group">
                           <div className="w-4 h-4 rounded border-2 border-green-600 flex items-center justify-center bg-green-600">
                              <Check size={12} className="text-white" />
                           </div>
                           <span className="text-[12px] font-bold group-hover:text-slate-900 transition-colors">Show deals only</span>
                        </div>
                     </div>

                     <div className="flex gap-4">
                        {product.conditionGrades.map((grade) => (
                           <button
                              key={grade.id}
                              onClick={() => setCondition(grade.id)}
                              className={`flex-1 flex flex-col items-center justify-center py-3.5 px-4 rounded-2xl border-2 transition-all group overflow-hidden relative ${condition === grade.id
                                    ? 'border-green-600 bg-white shadow-lg shadow-green-600/5 translate-y-[-2px]'
                                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                                 }`}
                           >
                              <span className={`text-[15px] font-black z-10 ${condition === grade.id ? 'text-green-700' : 'text-slate-700 font-bold'}`}>
                                 {grade.label}
                              </span>
                              {condition === grade.id && (
                                 <motion.div layoutId="condition-bg" className="absolute inset-0 bg-green-50 z-0" />
                              )}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Warranty Section */}
                  <div className="rounded-2xl overflow-hidden border-2 border-green-100 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-450 fill-mode-both">
                     <div className="bg-green-600 p-3 flex items-center justify-center gap-2">
                        <ShieldCheck className="text-white" size={17} />
                        <span className="text-[11px] font-black text-white uppercase tracking-tight">Default 6 Months warranty included out of the box</span>
                     </div>
                     <div className="p-5 bg-white flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center ring-2 ring-slate-100 shrink-0">
                              <ShieldCheck className="text-slate-900" size={22} />
                           </div>
                           <div className="min-w-0">
                              <p className="text-[13px] font-black text-slate-900 leading-tight">Add 6 Months extended warranty at ₹2,999</p>
                              <button className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest hover:text-slate-800 transition-colors">T&C Apply</button>
                           </div>
                        </div>
                        <button
                           onClick={() => setExtendedWarranty(!extendedWarranty)}
                           className={`px-6 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest whitespace-nowrap ${extendedWarranty
                                 ? 'bg-slate-100 text-slate-400 cursor-not-allowed scale-95 shadow-inner'
                                 : 'bg-slate-900 text-white hover:bg-black active:scale-95 shadow-md hover:shadow-lg'
                              }`}
                        >
                           {extendedWarranty ? 'Added' : 'Add'}
                        </button>
                     </div>
                  </div>

                  {/* Storage row (as extra) */}
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
                     <h3 className="text-[15px] font-black uppercase tracking-tight mb-4">Storage</h3>
                     <div className="flex gap-4">
                        <button className="flex-1 py-1 px-4 rounded-xl border-2 border-slate-900 bg-white shadow-sm font-black text-slate-900 text-[13px]">
                           256 GB
                        </button>
                     </div>
                  </div>
                  {/* Available Offers */}
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600 fill-mode-both">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[15px] font-black uppercase tracking-tight">Available Offers</h3>
                        <button className="text-blue-600 text-[13px] font-bold hover:underline">View All</button>
                     </div>
                     <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {(offers.length ? offers : []).map((offer, i) => (
                           <div key={offer?._id || i} className="min-w-[240px] p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/20 flex flex-col gap-2 relative overflow-hidden group hover:border-red-100 transition-colors">
                              <div className="flex items-center gap-2">
                                 <div className="h-2 w-2 rounded-full bg-red-600" />
                                 <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{offer.title}</span>
                              </div>
                              <p className="text-[13px] font-bold text-slate-600 leading-snug">{offer.desc}</p>
                              <div className="mt-2 flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                                 <span className="text-[12px] font-black text-slate-400 font-mono tracking-widest uppercase">{offer.code || '—'}</span>
                                 <button className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:text-red-700">Apply</button>
                              </div>
                           </div>
                        ))}
                        {offers.length === 0 ? (
                           <div className="min-w-[240px] p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/20 text-[13px] font-bold text-slate-500">
                              No offers right now.
                           </div>
                        ) : null}
                     </div>
                  </div>

                  {/* Key Highlights (Specs) */}
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700 fill-mode-both pt-4">
                     <h3 className="text-[15px] font-black uppercase tracking-tight mb-4">Product Highlights</h3>
                     <div className="grid grid-cols-2 gap-4">
                        {[
                           { label: 'Display', value: '17.27 cm (6.8 Inch) Dynamic AMOLED' },
                           { label: 'Camera', value: '200MP + 12MP + 10MP + 50MP' },
                           { label: 'Processor', value: 'Snapdragon 8 Gen 4 (For Galaxy)' },
                           { label: 'Battery', value: '5000 mAh with 45W Charging' }
                        ].map((spec, i) => (
                           <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{spec.label}</p>
                              <p className="text-[12px] font-extrabold text-slate-800 leading-tight">{spec.value}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* --- Post Hero Content (Full Width) --- */}
            <div className="mt-16 space-y-20 pb-12">
               {/* Technical Specifications (Toggleable) */}
               <section className="hidden bg-white rounded-3xl border border-slate-100 overflow-hidden">
                  <button
                     onClick={() => setShowAllSpecs(!showAllSpecs)}
                     className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                           <Info size={20} />
                        </div>
                        <div className="text-left">
                           <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Technical Specifications</h2>
                           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Model, Performance, Display & More</p>
                        </div>
                     </div>
                     <div className={`h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 transition-all ${showAllSpecs ? 'rotate-180 bg-slate-900 border-slate-900 text-white' : ''}`}>
                        <ChevronLeft className="-rotate-90" size={20} />
                     </div>
                  </button>

                  <AnimatePresence>
                     {showAllSpecs && (
                        <motion.div
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: 'auto', opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           transition={{ duration: 0.4, ease: "easeInOut" }}
                           className="overflow-hidden bg-slate-50/30"
                        >
                           <div className="p-8 md:p-12 border-t border-slate-100">
                              <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
                                 {[
                                    { label: 'General', specs: [{ k: 'Model', v: 'Samsung Galaxy S25 Edge' }, { k: 'Launched', v: 'Jan 2025' }, { k: 'OS', v: 'Android 15' }] },
                                    { label: 'Performance', specs: [{ k: 'Processor', v: 'Snapdragon 8 Gen 4' }, { k: 'RAM', v: '12 GB' }, { k: 'Graphics', v: 'Adreno 850' }] },
                                    { label: 'Display', specs: [{ k: 'Size', v: '6.8 inch' }, { k: 'Type', v: 'Dynamic AMOLED' }, { k: 'Refresh Rate', v: '120 Hz' }] },
                                    { label: 'Camera', specs: [{ k: 'Main', v: '200 MP Quad' }, { k: 'Selfie', v: '32 MP' }, { k: 'Video', v: '8K @ 30fps' }] }
                                 ].map((group, i) => (
                                    <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                       <div className="flex items-center gap-2 mb-6">
                                          <div className="h-1 w-8 bg-red-600 rounded-full" />
                                          <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em]">{group.label}</h4>
                                       </div>
                                       <div className="space-y-4">
                                          {group.specs.map((s, j) => (
                                             <div key={j} className="flex flex-col gap-1 border-b border-slate-200/50 pb-3 group/row">
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{s.k}</span>
                                                <span className="text-[15px] font-extrabold text-slate-800 transition-colors group-hover/row:text-red-600">{s.v}</span>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 ))}
                              </div>

                              <div className="mt-12 flex items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-white group hover:border-red-200 transition-colors cursor-pointer">
                                 <div className="flex flex-col items-center">
                                    <PlusCircle size={32} className="text-slate-300 mb-3 group-hover:text-red-500 transition-colors group-hover:rotate-90 transition-transform" />
                                    <p className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Compare with similar devices</p>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </section>

               {/* Ratings & Reviews */}
               <section className="bg-slate-50 rounded-[3rem] p-8 md:p-12">
                  <div className="grid gap-12 lg:grid-cols-3">
                     <div className="lg:col-span-1">
                        <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Ratings & Reviews</h2>
                        <div className="flex items-center gap-4 mb-4">
                           <span className="text-5xl font-black text-slate-900">4.8</span>
                           <div className="flex flex-col">
                              <div className="flex text-amber-500">
                                 {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                              </div>
                              <span className="text-sm font-bold text-slate-400 mt-1">Based on 642 ratings</span>
                           </div>
                        </div>
                        <div className="space-y-2 mt-8">
                           {[5, 4, 3, 2, 1].map((r) => (
                              <div key={r} className="flex items-center gap-3">
                                 <span className="text-xs font-black text-slate-600 w-4">{r}</span>
                                 <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${r === 5 ? 85 : r === 4 ? 12 : 3}%` }} />
                                 </div>
                                 <span className="text-[10px] font-bold text-slate-400 w-8">{r === 5 ? '85%' : r === 4 ? '12%' : '3%'}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="lg:col-span-2 space-y-8">
                        {[
                           { u: 'Amit Kumar', r: 5, t: 'Excellent condition!', d: 'The phone looks brand new. Not a single scratch. Very happy with the purchase.', date: 'Oct 12, 2025' },
                           { u: 'Sneha Sharma', r: 5, t: 'Amazing processing speed', d: 'Fast delivery and the packaging was premium. Everything works perfectly.', date: 'Oct 05, 2025' }
                        ].map((rev, i) => (
                           <div key={i} className="pb-8 border-b border-slate-200 last:border-0">
                              <div className="flex items-center justify-between mb-4">
                                 <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center font-black text-slate-400 ring-2 ring-slate-100">
                                       {rev.u[0]}
                                    </div>
                                    <div>
                                       <p className="text-sm font-black text-slate-900 leading-none">{rev.u}</p>
                                       <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{rev.date}</p>
                                    </div>
                                 </div>
                                 <div className="flex text-amber-500 bg-white px-2 py-1 rounded-lg ring-1 ring-slate-200">
                                    {[...Array(rev.r)].map((_, j) => <Star key={j} size={10} fill="currentColor" />)}
                                 </div>
                              </div>
                              <h4 className="text-[15px] font-black text-slate-900 mb-2">{rev.t}</h4>
                              <p className="text-[14px] font-medium text-slate-500 leading-relaxed">{rev.d}</p>
                           </div>
                        ))}
                        <button className="w-full py-4 rounded-2xl border-2 border-slate-200 bg-white font-black text-slate-900 text-[13px] uppercase tracking-widest hover:bg-slate-50 transition-colors">
                           Read all 6 reviews
                        </button>
                     </div>
                  </div>
               </section>
            </div>
         </div>
      </div>
   )
}
