import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import * as api from '../lib/api/baskaroApi.js'
import ProductMediaManager from './ProductMediaManager.jsx'
import ProductColorVariantsEditor from './ProductColorVariantsEditor.jsx'
import { loadColorVariantDraftsFromModel } from '../lib/colorVariants.js'
import { isCloudinaryUrl, isLocalMediaUrl } from '../lib/storeImageUpload.js'
import {
  DEFAULT_MODEL_CONDITION_GRADES,
  MODEL_CONDITION_GRADES,
  normalizeModelConditionGrades,
} from '../lib/modelConditionGrades.js'

export default function AddNewModelForm({ onCancel, category, brand, device, editingModel, onSave }) {
  const [imagePreview, setImagePreview] = useState(editingModel?.image || editingModel?.imageUrl || null);
  const [galleryImages, setGalleryImages] = useState(() =>
    Array.isArray(editingModel?.images) ? editingModel.images.filter(Boolean) : [],
  )
  const [videoUrls, setVideoUrls] = useState(() => {
    if (Array.isArray(editingModel?.videoUrls) && editingModel.videoUrls.length) {
      return editingModel.videoUrls.filter(Boolean)
    }
    const single = editingModel?.video || editingModel?.videoUrl || ''
    return single ? [single] : []
  })
  const [specs, setSpecs] = useState([])
  const [specValues, setSpecValues] = useState(() => (editingModel?.specifications && typeof editingModel.specifications === 'object'
    ? { ...editingModel.specifications }
    : {}))
  const [colorVariantsDraft, setColorVariantsDraft] = useState(() =>
    loadColorVariantDraftsFromModel(editingModel?.colorVariants),
  )
  const [colorVariantsUploading, setColorVariantsUploading] = useState(false)
  const [conditionGradesDraft, setConditionGradesDraft] = useState(() =>
    normalizeModelConditionGrades(editingModel?.conditionGrades ?? DEFAULT_MODEL_CONDITION_GRADES),
  )

  const handleColorVariantsChange = useCallback((updater) => {
    setColorVariantsDraft((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (import.meta.env.DEV) {
        console.log(
          '[AddNewModelForm] colorVariants',
          Array.isArray(next) ? next.map((r) => ({ name: r.name, images: r.images?.length ?? 0 })) : next,
        )
      }
      return next
    })
  }, [])
  const [offersDraft, setOffersDraft] = useState([])
  const [offersLoading, setOffersLoading] = useState(false)

  const [specsLoading, setSpecsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [formError, setFormError] = useState('')
  const [mediaUploading, setMediaUploading] = useState(false)
  const mediaPayloadRef = useRef({
    image: editingModel?.image || editingModel?.imageUrl || '',
    images: Array.isArray(editingModel?.images) ? editingModel.images.filter(Boolean) : [],
    video: editingModel?.video || editingModel?.videoUrl || '',
    videos:
      Array.isArray(editingModel?.videoUrls) && editingModel.videoUrls.length
        ? editingModel.videoUrls.filter(Boolean)
        : editingModel?.video || editingModel?.videoUrl
          ? [editingModel.video || editingModel.videoUrl]
          : [],
  })

  const [formData, setFormData] = useState(() => ({
    categoryId: category?.id || editingModel?.categoryId || '',
    brandId: brand?.id || editingModel?.brandId?._id || editingModel?.brandId || '',
    deviceId: device?.id || editingModel?.deviceId?._id || editingModel?.deviceId || '',
    modelName: editingModel?.modelName || editingModel?.name || '',
    basePrice: editingModel?.basePrice ?? '',
  }))

  useEffect(() => {
    setFormData((p) => ({
      ...p,
      categoryId: category?.id || p.categoryId,
      brandId: brand?.id || p.brandId,
      deviceId: device?.id || p.deviceId,
    }))
  }, [category?.id, brand?.id, device?.id])

  useEffect(() => {
    if (!editingModel) return
    const modelId = editingModel._id || editingModel.id
    setFormData({
      categoryId: category?.id || editingModel?.categoryId || '',
      brandId: String(brand?.id || editingModel.brandId?._id || editingModel.brandId || ''),
      deviceId: String(device?.id || editingModel.deviceId?._id || editingModel.deviceId || ''),
      modelName: editingModel.modelName || editingModel.name || '',
      basePrice: editingModel.basePrice ?? '',
    })
    setImagePreview((prev) => {
      if (prev && isCloudinaryUrl(prev)) return prev
      return editingModel.image || editingModel.imageUrl || null
    })
    setGalleryImages((prev) => {
      const fromServer = Array.isArray(editingModel.images) ? editingModel.images.filter(Boolean) : []
      if (prev?.length && prev.some(isCloudinaryUrl)) return prev
      return fromServer
    })
    const vids =
      Array.isArray(editingModel.videoUrls) && editingModel.videoUrls.length
        ? editingModel.videoUrls.filter(Boolean)
        : editingModel.video || editingModel.videoUrl
          ? [editingModel.video || editingModel.videoUrl]
          : []
    setVideoUrls((prev) => {
      if (prev?.length && prev.some(isCloudinaryUrl)) return prev
      return vids
    })
    mediaPayloadRef.current = {
      image: editingModel.image || editingModel.imageUrl || mediaPayloadRef.current.image || '',
      images: Array.isArray(editingModel.images)
        ? editingModel.images.filter(Boolean)
        : mediaPayloadRef.current.images || [],
      video: vids[0] || mediaPayloadRef.current.video || '',
      videos: vids.length ? vids : mediaPayloadRef.current.videos || [],
    }
    if (editingModel.specifications && typeof editingModel.specifications === 'object') {
      setSpecValues({ ...editingModel.specifications })
    }
    setConditionGradesDraft(
      normalizeModelConditionGrades(editingModel.conditionGrades ?? DEFAULT_MODEL_CONDITION_GRADES),
    )
  }, [editingModel?._id, editingModel?.id, category?.id, brand?.id, device?.id])

  // Load color variants only when switching models â€” not when category/brand/device resolve
  useEffect(() => {
    if (!editingModel) {
      setColorVariantsDraft([])
      return
    }
    setColorVariantsDraft(loadColorVariantDraftsFromModel(editingModel.colorVariants))
  }, [editingModel?._id, editingModel?.id])

  useEffect(() => {
    let cancelled = false

    function mapCatalogAttribute(attr) {
      const code = String(attr?.code || attr?.name || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
      const type = attr?.type === 'select' || attr?.type === 'multiselect' ? 'dropdown' : (attr?.type || 'text')
      return {
        key: code,
        name: attr?.name || code,
        type,
        required: Boolean(attr?.isRequired),
        options: (Array.isArray(attr?.values) ? attr.values : [])
          .map((opt) => opt?.label || opt?.value)
          .filter(Boolean),
        source: 'catalog',
      }
    }

    async function resolveCatalogCategoryId() {
      if (category?.catalogCategoryId) return String(category.catalogCategoryId)
      const ribbonId = category?.id || formData.categoryId
      if (!ribbonId) return ''
      try {
        const all = await api.getRibbonCategoriesAdmin()
        const list = Array.isArray(all) ? all : []
        const found = list.find((row) => String(row?._id || row?.id) === String(ribbonId))
        return found?.catalogCategoryId ? String(found.catalogCategoryId) : ''
      } catch {
        return ''
      }
    }

    async function loadSpecs() {
      const deviceId = device?.id || formData.deviceId
      setFormError('')
      setSuccessMsg('')
      if (!deviceId && !category?.id && !formData.categoryId) return

      setSpecsLoading(true)
      try {
        const catalogCategoryId = await resolveCatalogCategoryId()
        const ribbonCategoryId = category?.id || formData.categoryId
        const [deviceRes, catalogAttrs, templateRes] = await Promise.all([
          deviceId ? api.getDeviceSpecifications(deviceId).catch(() => []) : Promise.resolve([]),
          catalogCategoryId
            ? api.getAttributes({ categoryId: catalogCategoryId, includeInactive: 'false' }).catch(() => [])
            : Promise.resolve([]),
          ribbonCategoryId ? api.getSpecifications(ribbonCategoryId).catch(() => []) : Promise.resolve([]),
        ])

        const deviceList = (Array.isArray(deviceRes) ? deviceRes : (Array.isArray(deviceRes?.data) ? deviceRes.data : []))
          .map((s) => ({
            key: s.key || '',
            name: s.name || s.label || '',
            type: s.type || 'text',
            required: !!s.required,
            options: Array.isArray(s.options) ? s.options : [],
            source: 'device',
          }))
          .filter((s) => s.key && s.name)

        const catalogList = (Array.isArray(catalogAttrs) ? catalogAttrs : [])
          .filter((attr) => !attr?.isVariantAxis && attr?.showOnProduct !== false)
          .map(mapCatalogAttribute)
          .filter((s) => s.key && s.name)

        const templateList = (Array.isArray(templateRes) ? templateRes : [])
          .map((s) => ({
            key: s.key || '',
            name: s.name || s.label || '',
            type: s.type || 'text',
            required: !!s.required,
            options: Array.isArray(s.options) ? s.options : [],
            source: 'template',
          }))
          .filter((s) => s.key && s.name)

        const merged = [...deviceList]
        for (const row of [...templateList, ...catalogList]) {
          const idx = merged.findIndex((item) => item.key === row.key)
          if (idx >= 0) merged[idx] = row
          else merged.push(row)
        }

        if (!cancelled) {
          setSpecs(merged)
          setSpecValues((prev) => {
            const next = { ...prev }
            for (const sp of merged) {
              if (!(sp.key in next)) next[sp.key] = sp.type === 'boolean' ? false : ''
            }
            return next
          })
        }
      } catch (e) {
        if (!cancelled) setFormError(e?.message || 'Failed to load specifications')
      } finally {
        if (!cancelled) setSpecsLoading(false)
      }
    }
    loadSpecs()
    return () => { cancelled = true }
  }, [device?.id, category?.id, category?.catalogCategoryId, formData.categoryId, formData.deviceId])

  useEffect(() => {
    let cancelled = false
    async function loadOffersForModel() {
      const modelId = editingModel?.id || editingModel?._id
      setOffersDraft([])
      if (!modelId) return
      setOffersLoading(true)
      try {
        const res = await api.getOffersAdmin({ page: 1, limit: 200, modelId })
        const items = res?.items ?? res?.data?.items ?? []
        if (!cancelled) {
          setOffersDraft(
            (Array.isArray(items) ? items : []).map((o) => ({
              _id: o._id,
              title: o.title || '',
              desc: o.desc || '',
              code: o.code || '',
              sortOrder: o.sortOrder ?? 0,
              isActive: o.isActive !== false,
              _deleted: false,
            })),
          )
        }
      } catch {
        if (!cancelled) setOffersDraft([])
      } finally {
        if (!cancelled) setOffersLoading(false)
      }
    }
    loadOffersForModel()
    return () => {
      cancelled = true
    }
  }, [editingModel?.id, editingModel?._id])

  const requiredSpecKeys = useMemo(() => specs.filter((s) => s.required).map((s) => s.key), [specs])

  const handleMediaChange = useCallback(({ image, images, video, videos }) => {
    const nextVideos =
      Array.isArray(videos) && videos.length ? videos : video ? [video] : []
    mediaPayloadRef.current = {
      image: image || '',
      images: Array.isArray(images) ? images : [],
      video: nextVideos[0] || '',
      videos: nextVideos,
    }
    setImagePreview(image || null)
    setGalleryImages(Array.isArray(images) ? images : [])
    setVideoUrls(nextVideos)
  }, [])

  const handleMediaError = useCallback((msg) => {
    setFormError(msg ?? '')
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    setSuccessMsg('')

    const modelName = String(formData.modelName || '').trim()
    const basePrice = Number(formData.basePrice)
    if (!formData.categoryId) return setFormError('Category is missing. Go back and select a category.')
    if (!formData.brandId) return setFormError('Brand is missing. Go back and select a brand.')
    if (!formData.deviceId) return setFormError('Device is missing. Go back and select a device.')
    if (!modelName) return setFormError('Please enter a model name.')
    if (!Number.isFinite(basePrice) || basePrice <= 0) return setFormError('Base price must be a positive number.')

    for (const k of requiredSpecKeys) {
      const v = specValues[k]
      const empty =
        v === null ||
        v === undefined ||
        (typeof v === 'string' && v.trim() === '')
      if (empty) return setFormError('Please fill all required specifications.')
    }

    if (mediaUploading || colorVariantsUploading) {
      return setFormError('Media is still uploading. Wait until uploads finish, then save.')
    }

    const latestMedia = mediaPayloadRef.current
    const primaryImage = String(latestMedia.image || imagePreview || '').trim()
    const gallery = Array.isArray(latestMedia.images) ? latestMedia.images : galleryImages
    const videos = Array.isArray(latestMedia.videos)?.length
      ? latestMedia.videos
      : latestMedia.video
        ? [latestMedia.video]
        : videoUrls

    const mediaUrls = [primaryImage, ...(gallery || []), ...(videos || [])].filter(Boolean)
    if (mediaUrls.some(isLocalMediaUrl)) {
      return setFormError('Media is still uploading locally. Wait until uploads finish (Cloudinary URLs).')
    }

    if (!editingModel && !primaryImage) {
      return setFormError('Add at least one product image (primary) before publishing.')
    }
    if (primaryImage && !isCloudinaryUrl(primaryImage)) {
      return setFormError('Primary image must be uploaded to Cloudinary before saving.')
    }
    if ((videos || []).some((v) => v && !isCloudinaryUrl(v))) {
      return setFormError('All videos must be uploaded to Cloudinary before saving.')
    }

    const colorRows = (colorVariantsDraft || [])
      .map((row) => {
        const images = (Array.isArray(row?.images) && row.images.length
          ? row.images
          : row?.image
            ? [row.image]
            : []
        )
          .map((u) => String(u || '').trim())
          .filter(Boolean)
        const uniqueImages = [...new Set(images)]
        const videoUrls = (Array.isArray(row?.videoUrls) ? row.videoUrls : [])
          .map((u) => String(u || '').trim())
          .filter(Boolean)
        return {
          name: String(row?.name || '').trim(),
          hex: String(row?.hex || '').trim(),
          image: uniqueImages[0] || '',
          images: uniqueImages,
          videoUrls,
        }
      })
      .filter((row) => row.name || row.images.length || row.hex)

    for (const row of colorRows) {
      if (!row.name) return setFormError('Each color variant needs a name.')
      if (!row.images.length) return setFormError(`Add at least one image for color "${row.name}".`)
      for (const img of row.images) {
        if (!isCloudinaryUrl(img)) {
          return setFormError(`Images for "${row.name}" must finish uploading to Cloudinary before saving.`)
        }
      }
      for (const vid of row.videoUrls) {
        if (!isCloudinaryUrl(vid)) {
          return setFormError(`Videos for "${row.name}" must finish uploading to Cloudinary before saving.`)
        }
      }
    }

    const conditionGrades = normalizeModelConditionGrades(conditionGradesDraft)
    if (!conditionGrades.length) {
      return setFormError('Select at least one condition (Superb, Good, or Fair).')
    }

    const modelBody = {
      brandId: formData.brandId,
      deviceId: formData.deviceId,
      modelName,
      basePrice,
      specifications: specValues,
      conditionGrades,
    }

    if (primaryImage) modelBody.image = primaryImage
    if (Array.isArray(gallery) && gallery.length) modelBody.images = gallery
    if (videos?.length) {
      modelBody.videoUrls = videos
      modelBody.videoUrl = videos[0]
    }
    if (colorRows.length) {
      modelBody.colorVariants = colorRows
      modelBody.image = colorRows[0].images[0]
      modelBody.images = colorRows.flatMap((r) => r.images)
      modelBody.videoUrls = []
      modelBody.videoUrl = ''
    } else {
      modelBody.colorVariants = []
    }

    setSaving(true)
    onSave({
      ...modelBody,
      offersDraft,
    })
      .then(() => {
        setSuccessMsg(editingModel ? 'Model updated successfully.' : 'Model created successfully.')
        setFormError('')
      })
      .catch((err) => {
        setSuccessMsg('')
        setFormError(err?.message || 'Failed to save model')
      })
      .finally(() => setSaving(false))
  };
  
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
       <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-8 sm:py-6">
          <h3 className="text-base font-black text-slate-900 sm:text-lg">
            {editingModel ? 'Edit Product Listing' : 'Create New Product Listing'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            {editingModel
              ? 'Update details below, then click Update Product Details.'
              : 'Fill in the specifications to list a new item on the marketplace.'}
          </p>
       </div>

       <div className="space-y-8 p-4 sm:gap-10 sm:p-6 lg:p-8">
          <ProductMediaManager
            key={editingModel?.id || editingModel?._id || 'new-model'}
            image={imagePreview}
            images={galleryImages}
            video={videoUrls[0] || ''}
            videos={videoUrls}
            onChange={handleMediaChange}
            onUploadingChange={setMediaUploading}
            onError={handleMediaError}
          />

          <div className="space-y-8 border-t border-slate-100 pt-8">
             
             {/* Section 1 */}
             <div className="space-y-4">
                <h4 className="text-sm font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Basic Details</h4>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-700">
                      {category?.name || 'â€”'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Brand</label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-700">
                      {brand?.name || 'â€”'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Device</label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-700">
                      {device?.name || 'â€”'}
                    </div>
                  </div>
                  <div />
                </div>
                <div className="grid grid-cols-2 gap-5">
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1.5">Model Name <span className="text-red-500">*</span></label>
                     <input 
                        type="text" 
                        placeholder="e.g. iPhone 15 Pro Max" 
                        value={formData.modelName}
                        onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" 
                     />
                   </div>
                   <div className="relative">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Base Price (INR) <span className="text-red-500">*</span></label>
                    <span className="absolute left-4 top-[38px] text-slate-400 font-bold">Rs</span>
                     <input
                       type="number"
                       min="0"
                       step="1"
                       placeholder="e.g. 45000"
                       value={formData.basePrice}
                       onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-black text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                     />
                   </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Available Conditions <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs font-semibold text-slate-500 mb-3">
                      Choose which conditions appear on the product page for this listing.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {MODEL_CONDITION_GRADES.map((grade) => {
                      const selected = conditionGradesDraft.includes(grade)
                      return (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => {
                            setConditionGradesDraft((prev) => {
                              const next = selected
                                ? prev.filter((g) => g !== grade)
                                : [...prev, grade]
                              return normalizeModelConditionGrades(next)
                            })
                          }}
                          className={`min-w-[100px] rounded-xl border-2 px-5 py-3 text-sm font-black transition-all ${
                            selected
                              ? 'border-green-600 bg-green-50 text-green-800 shadow-sm'
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {grade}
                        </button>
                      )
                    })}
                  </div>
                  {!conditionGradesDraft.length ? (
                    <p className="text-xs font-bold text-red-500">Select at least one condition.</p>
                  ) : null}
                </div>
             </div>

             <ProductColorVariantsEditor
               variants={colorVariantsDraft}
               onChange={handleColorVariantsChange}
               onError={setFormError}
               onUploadingChange={setColorVariantsUploading}
             />

             {/* Section 2 */}
             <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-black uppercase text-slate-400 tracking-widest">Base Value & Configurations</h4>
                  <div className="text-xs font-bold text-slate-400">Dynamic specs are loaded by category</div>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="text-sm font-semibold text-slate-600">
                    Pricing is set by <span className="font-black text-slate-900">Base Price</span>. Category-based specifications are shown below.
                  </div>
                </div>
             </div>

             {/* Section 3 */}
             <div className="space-y-4">
                <h4 className="text-sm font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Technical Specifications</h4>
                {!formData.categoryId ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
                    Category is missing. Go back and select a category.
                  </div>
                ) : specsLoading ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500 animate-pulse">
                    Loading specificationsâ€¦
                  </div>
                ) : specs.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
                    No specifications yet. Add attributes in <span className="font-bold text-slate-700">Catalog Builder â†’ Attributes</span> for this category (e.g. Storage, RAM as text fields).
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-5">
                    {specs.map((s) => {
                      const v = specValues[s.key]
                      const label = (
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          {s.name} {s.required ? <span className="text-red-500">*</span> : null}
                        </label>
                      )
                      if (s.type === 'dropdown') {
                        const opts = (s.options || []).map((o) => (typeof o === 'string' ? o : o?.value)).filter(Boolean)
                        return (
                          <div key={s.key}>
                            {label}
                            <select
                              value={v ?? ''}
                              onChange={(e) => setSpecValues((p) => ({ ...p, [s.key]: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Select</option>
                              {opts.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        )
                      }
                      if (s.type === 'number') {
                        return (
                          <div key={s.key}>
                            {label}
                            <input
                              type="number"
                              value={v ?? ''}
                              onChange={(e) => setSpecValues((p) => ({ ...p, [s.key]: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                          </div>
                        )
                      }
                      if (s.type === 'boolean') {
                        return (
                          <div key={s.key} className="flex items-center gap-3 mt-7">
                            <input
                              type="checkbox"
                              checked={!!v}
                              onChange={(e) => setSpecValues((p) => ({ ...p, [s.key]: e.target.checked }))}
                              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-bold text-slate-700">{s.name}{s.required ? ' *' : ''}</span>
                          </div>
                        )
                      }
                      return (
                        <div key={s.key}>
                          {label}
                          <input
                            type="text"
                            value={v ?? ''}
                            onChange={(e) => setSpecValues((p) => ({ ...p, [s.key]: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
             </div>

             {/* Section 4 */}
             <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-black uppercase text-slate-400 tracking-widest">Offers (per model)</h4>
                  <button
                    type="button"
                    onClick={() =>
                      setOffersDraft((p) => {
                        const active = p.filter((x) => !x?._deleted)
                        const maxSort = active.reduce((m, x) => Math.max(m, Number(x?.sortOrder) || 0), -1)
                        return [
                          ...p,
                          {
                            _id: null,
                            title: '',
                            desc: '',
                            code: '',
                            sortOrder: maxSort + 1,
                            isActive: true,
                            _deleted: false,
                          },
                        ]
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-black transition"
                  >
                    <Plus size={14} /> Add offer
                  </button>
                </div>

                {offersLoading ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500 animate-pulse">
                    Loading offersâ€¦
                  </div>
                ) : (
                  <div className="space-y-3">
                    {offersDraft.filter((o) => !o?._deleted).length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
                        No offers added for this model.
                      </div>
                    ) : null}

                    {offersDraft.map((o, idx) => {
                      if (o?._deleted) return null
                      return (
                        <div key={o?._id || idx} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1.5">Title</label>
                              <input
                                value={o.title}
                                onChange={(e) =>
                                  setOffersDraft((p) =>
                                    p.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)),
                                  )
                                }
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                                placeholder="Bank Offer"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1.5">Code (optional)</label>
                              <input
                                value={o.code}
                                onChange={(e) =>
                                  setOffersDraft((p) =>
                                    p.map((x, i) => (i === idx ? { ...x, code: e.target.value } : x)),
                                  )
                                }
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                                placeholder="ICICI2000"
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                            <input
                              value={o.desc}
                              onChange={(e) =>
                                setOffersDraft((p) =>
                                  p.map((x, i) => (i === idx ? { ...x, desc: e.target.value } : x)),
                                )
                              }
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                              placeholder="Flat Rs 2000 Off on ICICI Bank Cards"
                            />
                          </div>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-5">
                              <div className="w-32">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                  Sort
                                </label>
                                <input
                                  type="number"
                                  value={o.sortOrder}
                                  onChange={(e) =>
                                    setOffersDraft((p) =>
                                      p.map((x, i) => (i === idx ? { ...x, sortOrder: e.target.value } : x)),
                                    )
                                  }
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                                />
                              </div>

                              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-700 mt-5 sm:mt-6">
                                <input
                                  type="checkbox"
                                  checked={o.isActive !== false}
                                  onChange={(e) =>
                                    setOffersDraft((p) =>
                                      p.map((x, i) => (i === idx ? { ...x, isActive: e.target.checked } : x)),
                                    )
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                />
                                Active
                              </label>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setOffersDraft((p) =>
                                  p
                                    .map((x, i) => (i === idx ? (x._id ? { ...x, _deleted: true } : null) : x))
                                    .filter(Boolean),
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-2.5 text-xs font-black text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
             </div>

          </div>
       </div>

       {/* Footer Actions */}
       <div className="border-t border-slate-200 bg-slate-50 p-6 flex items-center justify-end gap-4">
          {formError && (
            <div className="mr-auto text-sm font-bold text-red-600">
              {formError}
            </div>
          )}
          {successMsg && (
            <div className="mr-auto text-sm font-bold text-emerald-600">
              {successMsg}
            </div>
          )}
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-100 transition">Cancel</button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-blue-600 text-white text-sm font-black shadow-md shadow-blue-200 hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? 'Savingâ€¦' : editingModel ? 'Update Product Details' : 'Publish Product Listing'}
          </button>
       </div>
    </div>
  )
}


