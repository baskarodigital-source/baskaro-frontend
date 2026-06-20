import React, { useState, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronRight, ChevronLeft, ShieldCheck, Heart, Share2, Info, Check, ShoppingCart, PlusCircle, Play, Film } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { resolveProductDetails, getOffers, getInventory } from '../lib/api/baskaroApi.js'
import { buildColorAwareMediaGallery, buildColorVariantMediaGallery } from '../lib/productMedia.js'
import ProductColorSwatches from '../components/ProductColorSwatches.jsx'
import { optimizeDeliveryUrl } from '../lib/optimizeImageUrl.js'
import { normalizeColorVariants } from '../lib/colorVariants.js'
import { formatCatalogInr, pickCatalogImage, pickCatalogVariant } from '../lib/mapCatalogProduct.js'
import { appAlert } from '../lib/appDialog.js'
import {
  buildProductHighlights,
  buildProductSpecLine,
  buildModelConditionGrades,
  conditionDisplayLabel,
  normalizeOffersList,
} from '../lib/productDetails.js'
import { normalizeModelConditionGrades } from '../lib/modelConditionGrades.js'

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

function formatCatalogAttributeValue(value) {
   if (value == null || value === '') return '—'
   if (Array.isArray(value)) {
      if (!value.length) return '—'
      if (typeof value[0] === 'object') {
         return `${value.length} file${value.length === 1 ? '' : 's'}`
      }
      return value.join(', ')
   }
   if (typeof value === 'boolean') return value ? 'Yes' : 'No'
   return String(value)
}

export default function ProductDetailsPage() {
   const { id } = useParams()
   const location = useLocation()
   const productKindHint = location.state?.itemType === 'catalog'
      ? 'catalog'
      : location.state?.itemType === 'model' || location.state?.modelId
         ? 'model'
         : 'auto'
   const [model, setModel] = useState(null)
   const [catalogProduct, setCatalogProduct] = useState(null)
   const [loadErr, setLoadErr] = useState('')
   const [loading, setLoading] = useState(true)
   const [offers, setOffers] = useState([])
   const [conditionGrades, setConditionGrades] = useState([])
   const [conditionPrices, setConditionPrices] = useState({})
   const [selectedMedia, setSelectedMedia] = useState(0)
   const [selectedColorId, setSelectedColorId] = useState(null)
   const [condition, setCondition] = useState('')
   const [extendedWarranty, setExtendedWarranty] = useState(false)
   const [showAllOffers, setShowAllOffers] = useState(false)
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
      setConditionGrades([])
      setConditionPrices({})
      setCondition('')
      setCatalogProduct(null)
      ;(async () => {
         try {
            const resolved = await resolveProductDetails(id, { kind: productKindHint })
            if (cancelled) return

            if (resolved.kind === 'catalog') {
               const catalog = resolved.data
               setCatalogProduct(catalog)
               setModel(null)
               setLoadErr('')
               try {
                  const o = await getOffers({ productId: catalog?._id || catalog?.id || id })
                  if (!cancelled) setOffers(normalizeOffersList(o))
               } catch {
                  if (!cancelled) setOffers([])
               }
               const grades = normalizeModelConditionGrades(catalog?.conditionGrades)
               setConditionGrades(
                  grades.map((label) => ({
                     id: label,
                     label,
                     apiType: label,
                  })),
               )
               setCondition(grades[0] || '')
               return
            }

            const m = resolved.data
            setModel(m)
            setCatalogProduct(null)
            const modelId = m?._id || m?.id || id
            try {
               const o = await getOffers({ modelId })
               if (!cancelled) setOffers(normalizeOffersList(o))
            } catch {
               if (!cancelled) setOffers([])
            }
            try {
               const inventory = await getInventory({ modelId, limit: 100 }).catch(() => null)
               if (!cancelled) {
                  const built = buildModelConditionGrades(m, inventory)
                  setConditionGrades(built.grades)
                  setConditionPrices(built.pricesByGrade)
                  setCondition(built.defaultId)
               }
            } catch {
               if (!cancelled) {
                  const built = buildModelConditionGrades(m, null)
                  setConditionGrades(built.grades)
                  setCondition(built.defaultId)
               }
            }
         } catch (e) {
            if (!cancelled) setLoadErr(e.message || 'Product not found')
         } finally {
            if (!cancelled) setLoading(false)
         }
      })()
      return () => { cancelled = true }
   }, [id, productKindHint])

   const product = useMemo(() => {
      if (!model) return null
      const brandName = model.brandId?.name || '—'
      const { media, images, videos, colorVariants } = buildColorAwareMediaGallery(model)
      const basePrice = Number(model.basePrice) || 0
      const highlights = buildProductHighlights(model.specifications)
      return {
         title: `${brandName} ${model.modelName}`.trim(),
         brand: brandName,
         model: model.modelName,
         device: model.deviceId?.name || '',
         specs: buildProductSpecLine(model.specifications),
         rating: Number(model.rating) || 0,
         reviews: Number(model.reviewCount) || 0,
         basePrice,
         originalPrice: Number(model.originalPrice) || 0,
         discount: Number(model.discount) || 0,
         images,
         videos,
         media,
         specGroups: specGroupsFromModel(model),
         colorVariants,
         highlights,
      }
   }, [model])

   const catalogView = useMemo(() => {
      if (!catalogProduct) return null
      const variant = pickCatalogVariant(catalogProduct)
      const image = pickCatalogImage(catalogProduct, variant)
      const price = Number(variant?.price)
      const compareAt = Number(variant?.compareAtPrice)
      const hasCompare = Number.isFinite(compareAt) && compareAt > price
      const brandName =
         (catalogProduct?.brandId && typeof catalogProduct.brandId === 'object'
            ? catalogProduct.brandId.name
            : '') ||
         catalogProduct?.brand ||
         ''
      const deviceName =
         catalogProduct?.deviceId && typeof catalogProduct.deviceId === 'object'
            ? catalogProduct.deviceId.name
            : ''
      return {
         title: catalogProduct.name || 'Product',
         subtitle: [brandName, deviceName].filter(Boolean).join(' · '),
         variantTitle: variant?.title || '',
         image:
            image ||
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
         price,
         compareAt: hasCompare ? compareAt : null,
         condition: variant?.condition || '',
         stock: Number(variant?.stock) || 0,
         description: catalogProduct?.description || catalogProduct?.shortDescription || '',
         attributes: Array.isArray(catalogProduct?.attributes) ? catalogProduct.attributes : [],
         specifications:
            catalogProduct?.specifications && typeof catalogProduct.specifications === 'object'
               ? catalogProduct.specifications
               : {},
         specGroups: specGroupsFromModel({ specifications: catalogProduct?.specifications }),
         highlights: buildProductHighlights(catalogProduct?.specifications),
         colorVariants: normalizeColorVariants(catalogProduct?.colorVariants),
         conditionGrades: normalizeModelConditionGrades(catalogProduct?.conditionGrades),
         productId: String(catalogProduct?._id || catalogProduct?.id || id),
         variantId: String(variant?._id || variant?.id || ''),
      }
   }, [catalogProduct, id])

   const conditionPrice = conditionPrices[condition]
   const displayPrice = conditionPrice ?? product?.basePrice ?? 0
   const displayCondition = conditionDisplayLabel(condition, conditionGrades)

   const colorVariants = useMemo(
      () => normalizeColorVariants(model?.colorVariants),
      [model],
   )

   const activeColor = useMemo(() => {
      if (!colorVariants.length) return null
      if (selectedColorId != null) {
         return colorVariants.find((c) => String(c.id) === String(selectedColorId)) || colorVariants[0]
      }
      return colorVariants[0]
   }, [colorVariants, selectedColorId])

   const activeColorMedia = useMemo(
      () => (activeColor ? buildColorVariantMediaGallery(activeColor) : []),
      [activeColor],
   )

   useEffect(() => {
      setSelectedColorId(null)
      setSelectedMedia(0)
      setShowAllOffers(false)
   }, [id])

   useEffect(() => {
      setSelectedMedia(0)
   }, [activeColor?.id])

   useEffect(() => {
      colorVariants.forEach((c) => {
         ;(c.images || []).forEach((url) => {
            const img = new Image()
            img.src = optimizeDeliveryUrl(url, { width: 960 })
         })
      })
   }, [colorVariants])

   if (loading) {
      return (
         <div className="min-h-screen bg-white flex items-center justify-center font-['Inter']">
            <p className="text-slate-600 font-semibold">Loading product…</p>
         </div>
      )
   }
   if (loadErr || (!product && !catalogView)) {
      return (
         <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 font-['Inter'] px-4">
            <p className="text-slate-800 font-bold text-center">{loadErr || 'Product not found'}</p>
            <Link to="/marketplace" className="text-red-600 font-bold hover:underline">Back to Marketplace</Link>
         </div>
      )
   }

   const handleAddToCart = async (redirectToCart = false) => {
      setIsAdding(true)
      try {
         if (catalogView) {
            const result = await addToCart({
               productId: catalogView.productId,
               variantId: catalogView.variantId || undefined,
               itemType: 'catalog',
               name: catalogView.title,
               price: formatCatalogInr(catalogView.price),
               img: catalogView.image,
            })
            if (result?.error === 'LOGIN_REQUIRED') {
               appAlert('Please log in to add products to your cart.', {
                  title: 'Login required',
                  variant: 'info',
               })
               navigate('/login', { state: { from: `/product/${id}` } })
               return
            }
            if (result?.error) {
               appAlert(result.error, { title: 'Could not add to cart', variant: 'error' })
               return
            }
            if (redirectToCart) navigate('/cart')
            return
         }

         addToCart({
            id: `${id}-${condition || 'default'}`,
            name: `${product.title}${displayCondition ? ` — ${displayCondition}` : ''}`,
            price: displayPrice.toLocaleString('en-IN'),
            img: displayImageUrl || product.images[0],
         })
         if (redirectToCart) navigate('/cart')
      } finally {
         setTimeout(() => setIsAdding(false), 1500)
      }
   }

   if (catalogView) {
      const catalogColors = catalogView.colorVariants || []
      const catalogActiveColor =
         catalogColors.find((c) => String(c.id) === String(selectedColorId)) || catalogColors[0] || null
      const catalogImage = catalogActiveColor?.image || catalogView.image
      const catalogOffers = showAllOffers ? offers : offers.slice(0, 3)

      return (
         <div className="min-h-screen bg-white font-['Inter'] pb-12">
            <div className="mx-auto max-w-7xl px-4 py-0 sm:px-6 lg:px-8">
               <nav className="mb-2 flex items-center gap-2 text-[12px] font-medium text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
                  <Link to="/" className="hover:text-red-600">Home</Link>
                  <ChevronRight size={14} className="shrink-0" />
                  <Link to="/marketplace" className="hover:text-red-600">Marketplace</Link>
                  <ChevronRight size={14} className="shrink-0" />
                  <span className="text-slate-900 truncate">{catalogView.title}</span>
               </nav>

               <div className="grid gap-6 lg:grid-cols-[480px_1fr] lg:items-start">
                  <div className="flex w-full flex-col gap-4 lg:max-w-[480px]">
                     <div className="relative w-full self-start overflow-hidden rounded-3xl border border-slate-100 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_var(--tw-gradient-via)_45%,_var(--tw-gradient-to)_100%)] from-rose-50/50 via-white to-slate-50/80">
                        <div className="flex min-h-[320px] items-center justify-center p-6">
                           <img
                              src={catalogImage}
                              alt={catalogView.title}
                              className="max-h-[420px] w-full object-contain mix-blend-multiply drop-shadow-2xl"
                           />
                        </div>
                        <div className="grid shrink-0 grid-cols-2 border-t border-slate-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                           <button
                              type="button"
                              onClick={() => handleAddToCart(false)}
                              disabled={isAdding || catalogView.stock <= 0}
                              className={`flex flex-col items-center justify-center border-r py-3 transition-all outline-none active:scale-95 ${
                                 isAdding ? 'border-green-100 bg-green-50' : 'border-rose-100 bg-rose-50/50 hover:bg-rose-100/50'
                              }`}
                           >
                              {isAdding ? (
                                 <>
                                    <Check className="text-green-600" size={18} />
                                    <span className="mt-0.5 text-[10px] font-bold uppercase leading-none tracking-widest text-green-600">Added!</span>
                                 </>
                              ) : (
                                 <>
                                    <ShoppingCart className="mb-0.5 text-rose-600" size={18} />
                                    <span className="text-[13px] font-black leading-none text-slate-900">Add to Cart</span>
                                 </>
                              )}
                           </button>
                           <button
                              type="button"
                              onClick={() => handleAddToCart(true)}
                              disabled={isAdding || catalogView.stock <= 0}
                              className="bg-slate-900 py-3 text-[14px] font-black uppercase tracking-[0.1em] text-white outline-none transition-all hover:bg-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              Buy Now
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col gap-4">
                     {catalogView.subtitle ? (
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{catalogView.subtitle}</p>
                     ) : null}
                     <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">{catalogView.title}</h1>
                     {catalogView.variantTitle ? (
                        <p className="text-sm font-medium text-slate-600">{catalogView.variantTitle}</p>
                     ) : null}

                     <div className="flex flex-wrap items-baseline gap-3 border-y border-slate-100 py-6">
                        <span className="text-4xl font-black tracking-tighter text-slate-900">
                           {formatCatalogInr(catalogView.price)}
                        </span>
                        {catalogView.compareAt != null ? (
                           <span className="text-lg font-medium text-slate-400 line-through">
                              {formatCatalogInr(catalogView.compareAt)}
                           </span>
                        ) : null}
                     </div>

                     <div className="flex flex-wrap gap-3 text-sm">
                        {catalogView.condition ? (
                           <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                              {catalogView.condition}
                           </span>
                        ) : null}
                        <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                           {catalogView.stock > 0 ? `${catalogView.stock} in stock` : 'Out of stock'}
                        </span>
                     </div>

                     {catalogView.conditionGrades?.length > 0 ? (
                        <div>
                           <h3 className="mb-3 text-sm font-black uppercase tracking-tight text-slate-900">Condition</h3>
                           <div className="flex flex-wrap gap-3">
                              {catalogView.conditionGrades.map((grade) => (
                                 <button
                                    key={grade}
                                    type="button"
                                    onClick={() => setCondition(grade)}
                                    className={`min-w-[100px] rounded-2xl border-2 px-4 py-3 text-sm font-black transition ${
                                       condition === grade
                                          ? 'border-green-600 bg-green-50 text-green-800'
                                          : 'border-slate-100 bg-slate-50 text-slate-600'
                                    }`}
                                 >
                                    {grade}
                                 </button>
                              ))}
                           </div>
                        </div>
                     ) : null}

                     {catalogColors.length > 0 ? (
                        <ProductColorSwatches
                           colors={catalogColors}
                           selectedId={catalogActiveColor?.id}
                           onSelect={(color) => setSelectedColorId(color?.id)}
                        />
                     ) : null}

                     {catalogView.attributes.length > 0 ? (
                        <div className="rounded-2xl border border-slate-100 bg-white p-4">
                           <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Details</h2>
                           <dl className="mt-3 space-y-2">
                              {catalogView.attributes.map((row, idx) => (
                                 <div key={`${row?.attributeId || idx}`} className="flex justify-between gap-4 text-sm">
                                    <dt className="font-medium text-slate-500">{row?.name || row?.code || 'Attribute'}</dt>
                                    <dd className="text-right font-semibold text-slate-800">
                                       {formatCatalogAttributeValue(row?.value)}
                                    </dd>
                                 </div>
                              ))}
                           </dl>
                        </div>
                     ) : null}

                     {catalogView.specGroups?.[0]?.specs?.length > 0 ? (
                        <div className="rounded-2xl border border-slate-100 bg-white p-4">
                           <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Technical Specifications</h2>
                           <dl className="mt-3 space-y-2">
                              {catalogView.specGroups[0].specs.map((row, idx) => (
                                 <div key={`${row.k}-${idx}`} className="flex justify-between gap-4 text-sm">
                                    <dt className="font-medium text-slate-500">{row.k}</dt>
                                    <dd className="text-right font-semibold text-slate-800">{row.v}</dd>
                                 </div>
                              ))}
                           </dl>
                        </div>
                     ) : null}

                     {offers.length > 0 ? (
                        <div>
                           <div className="mb-3 flex items-center justify-between">
                              <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Available Offers</h3>
                              {offers.length > 3 ? (
                                 <button
                                    type="button"
                                    onClick={() => setShowAllOffers((v) => !v)}
                                    className="text-xs font-bold text-blue-600 hover:underline"
                                 >
                                    {showAllOffers ? 'Show less' : 'View All'}
                                 </button>
                              ) : null}
                           </div>
                           <div className="flex gap-4 overflow-x-auto pb-2">
                              {catalogOffers.map((offer, i) => (
                                 <div key={offer?._id || i} className="min-w-[220px] rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-900">{offer.title}</p>
                                    <p className="mt-2 text-sm font-semibold text-slate-600">{offer.desc}</p>
                                    {offer.code ? (
                                       <p className="mt-2 font-mono text-xs font-bold text-slate-400">{offer.code}</p>
                                    ) : null}
                                 </div>
                              ))}
                           </div>
                        </div>
                     ) : null}

                     {catalogView.description ? (
                        <div className="rounded-2xl border border-slate-100 bg-white p-4">
                           <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Description</h2>
                           <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                              {catalogView.description}
                           </p>
                        </div>
                     ) : null}

                     <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-600">
                        <ShieldCheck size={18} className="text-emerald-600" />
                        Quality-checked product listed from Baskaro Catalog Builder
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )
   }

   const hasColors = colorVariants.length > 0
   const galleryMedia = hasColors ? activeColorMedia : product.media
   const activeItem = galleryMedia[selectedMedia] || galleryMedia[0] || product.media[0]
   const showThumbScroll = galleryMedia.length > 5

   const displayImageUrl =
      activeItem?.type === 'image'
         ? activeItem.url
         : activeColor?.image
           ? optimizeDeliveryUrl(activeColor.image, { width: 960 })
           : product.images[0]

   const selectColor = (color) => {
      if (!color) return
      setSelectedColorId(color.id)
      setSelectedMedia(0)
   }

   const selectMedia = (index) => {
      setSelectedMedia(index)
      const item = galleryMedia[index]
      if (item?.colorId) setSelectedColorId(item.colorId)
   }

   const formatPrice = (p) => new Intl.NumberFormat('en-IN').format(p)

   const visibleOffers = showAllOffers ? offers : offers.slice(0, 3)

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
                     {/* Thumbnails — per-color images + videos when colors exist */}
                     {galleryMedia.length > 1 ? (
                        <div className="order-2 md:order-1 flex md:flex-col gap-2">
                           <div
                              className={[
                                 'flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0',
                                 showThumbScroll ? 'md:overflow-y-auto md:max-h-[280px] md:pr-1' : 'md:overflow-visible'
                              ].join(' ')}
                           >
                              {galleryMedia.map((item, i) => (
                                 <button
                                    key={`${item.type}-${item.url}-${i}`}
                                    type="button"
                                    onClick={() => selectMedia(i)}
                                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all p-0.5 ${selectedMedia === i ? 'border-red-600 shadow-sm' : 'border-slate-100'
                                       }`}
                                    aria-label={
                                       item.type === 'video'
                                          ? `View ${item.colorName || 'product'} video`
                                          : `View ${item.colorName || 'product'} image`
                                    }
                                 >
                                    <img
                                      src={item.type === 'video' ? item.poster || displayImageUrl : item.url}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                    {item.type === 'video' ? (
                                      <span className="absolute inset-0 flex items-center justify-center bg-slate-900/35">
                                        <Play size={14} className="text-white" fill="currentColor" />
                                      </span>
                                    ) : null}
                                 </button>
                              ))}
                           </div>
                        </div>
                     ) : null}

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
                                    price: formatPrice(displayPrice),
                                    img: displayImageUrl || product.images[0],
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
                              {activeItem?.type === 'video' ? (
                                <motion.div
                                  key={`video-${activeItem.url}`}
                                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                  className="h-full w-full flex items-center justify-center"
                                >
                                  <video
                                    src={activeItem.url}
                                    controls
                                    playsInline
                                    preload="metadata"
                                    poster={activeItem.poster || undefined}
                                    className="max-h-full w-full rounded-xl bg-black object-contain shadow-2xl"
                                  />
                                </motion.div>
                              ) : (
                                <motion.img
                                  key={`img-${displayImageUrl}-${activeColor?.id || selectedMedia}`}
                                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                  src={displayImageUrl}
                                  alt={activeColor ? `${product.title} — ${activeColor.name}` : product.title}
                                  className="h-full w-full max-h-full object-contain mix-blend-multiply drop-shadow-2xl"
                                />
                              )}
                           </AnimatePresence>
                           {product.videos?.length > 0 ? (
                             <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-slate-900/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                               <Film size={12} />
                               {product.videos.length} video{product.videos.length === 1 ? '' : 's'}
                             </span>
                           ) : null}
                        </div>

                        <div className="grid shrink-0 grid-cols-2 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                           <button 
                              type="button" 
                              onClick={() => handleAddToCart(false)}
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
                              onClick={() => handleAddToCart(true)}
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
                        BASKARO Warranty, {displayCondition}{activeColor ? `, ${activeColor.name}` : ''}{product.specs !== '—' ? `, ${product.specs}` : ''}
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
                        <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{formatPrice(displayPrice)}</span>
                        {product.originalPrice > 0 && product.discount > 0 && (
                           <>
                              <span className="text-[17px] font-bold text-slate-400 line-through mb-1">₹{formatPrice(product.originalPrice)}</span>
                              <span className="text-2xl font-black text-rose-600 mb-0.5">-{product.discount}%</span>
                           </>
                        )}
                     </div>
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

                     <div className="flex flex-wrap gap-4">
                        {conditionGrades.map((grade) => (
                           <button
                              key={grade.id}
                              type="button"
                              onClick={() => setCondition(grade.id)}
                              className={`min-w-[100px] flex-1 flex flex-col items-center justify-center py-3.5 px-4 rounded-2xl border-2 transition-all group overflow-hidden relative ${condition === grade.id
                                    ? 'border-green-600 bg-white shadow-lg shadow-green-600/5 translate-y-[-2px]'
                                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                                 }`}
                           >
                              <span className={`text-[15px] font-black z-10 ${condition === grade.id ? 'text-green-700' : 'text-slate-700 font-bold'}`}>
                                 {grade.label}
                              </span>
                              {grade.price ? (
                                 <span className="relative z-10 mt-1 text-[11px] font-bold text-slate-500">
                                    ₹{formatPrice(grade.price)}
                                 </span>
                              ) : grade.desc ? (
                                 <span className="relative z-10 mt-1 text-[10px] font-semibold text-slate-400 text-center leading-tight px-1">
                                    {grade.desc}
                                 </span>
                              ) : null}
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

                  {hasColors ? (
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
                        <ProductColorSwatches
                           colors={colorVariants}
                           selectedId={activeColor?.id}
                           onSelect={selectColor}
                        />
                     </div>
                  ) : null}

                  {/* Available Offers */}
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600 fill-mode-both">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[15px] font-black uppercase tracking-tight">Available Offers</h3>
                        {offers.length > 3 ? (
                           <button
                              type="button"
                              onClick={() => setShowAllOffers((v) => !v)}
                              className="text-blue-600 text-[13px] font-bold hover:underline"
                           >
                              {showAllOffers ? 'Show less' : 'View All'}
                           </button>
                        ) : null}
                     </div>
                     <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {visibleOffers.map((offer, i) => (
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
                  {product.highlights?.length > 0 ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700 fill-mode-both pt-4">
                     <h3 className="text-[15px] font-black uppercase tracking-tight mb-4">Product Highlights</h3>
                     <div className="grid grid-cols-2 gap-4">
                        {product.highlights.map((spec, i) => (
                           <div key={`${spec.label}-${i}`} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{spec.label}</p>
                              <p className="text-[12px] font-extrabold text-slate-800 leading-tight">{spec.value}</p>
                           </div>
                        ))}
                     </div>
                  </div>
                  ) : null}
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

               {/* Ratings & Reviews — only when product has review data */}
               {(product.rating > 0 || product.reviews > 0) ? (
               <section className="bg-slate-50 rounded-[3rem] p-8 md:p-12">
                  <div className="grid gap-12 lg:grid-cols-3">
                     <div className="lg:col-span-1">
                        <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Ratings & Reviews</h2>
                        <div className="flex items-center gap-4 mb-4">
                           <span className="text-5xl font-black text-slate-900">{product.rating || '—'}</span>
                           <div className="flex flex-col">
                              <div className="flex text-amber-500">
                                 {[...Array(5)].map((_, i) => (
                                   <Star key={i} size={20} fill={i < Math.round(product.rating) ? 'currentColor' : 'none'} />
                                 ))}
                              </div>
                              <span className="text-sm font-bold text-slate-400 mt-1">
                                 Based on {product.reviews} rating{product.reviews === 1 ? '' : 's'}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>
               ) : null}
            </div>
         </div>
      </div>
   )
}
