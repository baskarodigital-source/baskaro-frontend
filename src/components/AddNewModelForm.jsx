import React, { useEffect, useMemo, useState } from 'react'
import { 
  UploadCloud, Trash2, Plus 
} from 'lucide-react'
import * as api from '../lib/api/baskaroApi.js'
import { STORE_IMAGE_FOLDERS, uploadStoreImageFile } from '../lib/storeImageUpload.js'

export default function AddNewModelForm({ onCancel, category, brand, device, editingModel, onSave }) {
  const [imagePreview, setImagePreview] = useState(editingModel?.image || null);
  const [imageUploading, setImageUploading] = useState(false);
  const [specs, setSpecs] = useState([])
  const [specValues, setSpecValues] = useState(() => (editingModel?.specifications && typeof editingModel.specifications === 'object'
    ? { ...editingModel.specifications }
    : {}))
  const [offersDraft, setOffersDraft] = useState([])
  const [offersLoading, setOffersLoading] = useState(false)

  const [specsLoading, setSpecsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState(() => ({
    categoryId: category?.id || editingModel?.categoryId || '',
    brandId: brand?.id || editingModel?.brandId?._id || editingModel?.brandId || '',
    deviceId: device?.id || editingModel?.deviceId?._id || editingModel?.deviceId || '',
    modelName: editingModel?.modelName || editingModel?.name || '',
    basePrice: editingModel?.basePrice ?? '',
  }))

  useEffect(() => {
    // Flow requirement: category/brand come from navigation (Category → Brand → Model).
    setFormData((p) => ({
      ...p,
      categoryId: category?.id || p.categoryId,
      brandId: brand?.id || p.brandId,
      deviceId: device?.id || p.deviceId,
    }))
  }, [category?.id, brand?.id, device?.id])

  useEffect(() => {
    let cancelled = false
    async function loadSpecs() {
      const deviceId = device?.id || formData.deviceId
      setSpecs([])
      setFormError('')
      setSuccessMsg('')
      if (!deviceId) return

      setSpecsLoading(true)
      try {
        const sRes = await api.getDeviceSpecifications(deviceId)
        const list = Array.isArray(sRes) ? sRes : (Array.isArray(sRes?.data) ? sRes.data : [])
        const normalized = list
          .map((s) => ({
            key: s.key || '',
            name: s.name || s.label || '',
            type: s.type || 'text',
            required: !!s.required,
            options: Array.isArray(s.options) ? s.options : [],
          }))
          .filter((s) => s.key && s.name)
        if (!cancelled) {
          setSpecs(normalized)
          setSpecValues((prev) => {
            const next = { ...prev }
            for (const sp of normalized) {
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
  }, [device?.id])

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

    setSaving(true)
    Promise.resolve(
      onSave({
        brandId: formData.brandId,
        deviceId: formData.deviceId,
        modelName,
        basePrice,
        image: imagePreview || '',
        specifications: specValues,
        offersDraft,
      }),
    )
      .then(() => {
        setSuccessMsg(editingModel ? 'Model updated successfully.' : 'Model created successfully.')
      })
      .catch((err) => {
        setFormError(err?.message || 'Failed to save model')
      })
      .finally(() => setSaving(false))
  };
  
  const handleImageChange = async (file) => {
    if (!file?.type?.startsWith('image/')) return
    setImageUploading(true)
    try {
      const url = await uploadStoreImageFile(file, { folder: STORE_IMAGE_FOLDERS.models })
      setImagePreview(url)
    } catch (err) {
      setFormError(err?.message || 'Could not upload image.')
    } finally {
      setImageUploading(false)
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
       <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-8 sm:py-6">
          <h3 className="text-base font-black text-slate-900 sm:text-lg">Create New Product Listing</h3>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Fill in the specifications to list a new item on the marketplace.</p>
       </div>

       <div className="grid gap-8 p-4 sm:gap-10 sm:p-6 lg:p-8 xl:grid-cols-3">
          {/* Left Column - Image Upload */}
          <div className="xl:col-span-1 space-y-4">
             <label className="text-sm font-black uppercase text-slate-800 tracking-wider">Product Primary Image <span className="text-red-500">*</span></label>
             
             <div 
               className="relative flex h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 transition-colors group hover:border-blue-400 hover:bg-slate-50 sm:h-72"
               onDragOver={(e) => e.preventDefault()}
               onDrop={(e) => {
                 e.preventDefault();
                 if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                   handleImageChange(e.dataTransfer.files[0]);
                 }
               }}
               onClick={() => document.getElementById('product-image-upload').click()}
             >
               <input 
                 id="product-image-upload" 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 onChange={(e) => {
                   if (e.target.files && e.target.files[0]) {
                     handleImageChange(e.target.files[0]);
                   }
                 }} 
               />
               
               {imagePreview ? (
                 <>
                   <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-4" />
                   <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setImagePreview(null);
                         document.getElementById('product-image-upload').value = '';
                       }}
                       className="bg-red-600 text-white p-3 px-4 rounded-xl hover:bg-red-700 transition shadow-lg flex items-center gap-2 text-sm font-bold"
                     >
                       <Trash2 size={16} /> Remove Image
                     </button>
                   </div>
                 </>
               ) : (
                 <div className="p-10 flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-blue-500 group-hover:scale-110 transition-transform">
                       <UploadCloud size={28} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Click or drag image to upload</p>
                    <p className="text-xs font-semibold text-slate-400 mt-2">PNG, JPG or WEBP (max. 5MB)<br/>Transparent background preferred</p>
                 </div>
               )}
             </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="xl:col-span-2 space-y-8">
             
             {/* Section 1 */}
             <div className="space-y-4">
                <h4 className="text-sm font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Basic Details</h4>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-700">
                      {category?.name || '—'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Brand</label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-700">
                      {brand?.name || '—'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Device</label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-700">
                      {device?.name || '—'}
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
                     <label className="block text-sm font-bold text-slate-700 mb-1.5">Base Price (₹) <span className="text-red-500">*</span></label>
                     <span className="absolute left-4 top-[38px] text-slate-400 font-bold">₹</span>
                     <input
                       type="number"
                       min="0"
                       step="1"
                       placeholder="e.g. 45000"
                       value={formData.basePrice}
                       onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm font-black text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                     />
                   </div>
                </div>
             </div>

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
                    Loading specifications…
                  </div>
                ) : specs.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
                    No specifications configured for this category.
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
                    Loading offers…
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
                              placeholder="Flat ₹2000 Off on ICICI Bank Cards"
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
            {saving ? 'Saving…' : editingModel ? 'Update Product Details' : 'Publish Product Listing'}
          </button>
       </div>
    </div>
  )
}
