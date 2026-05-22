import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, CheckCircle, Smartphone, Trash2, Pencil, RefreshCw, Upload, Tag } from 'lucide-react'
import * as api from '../../lib/api/baskaroApi.js'
import { STORE_IMAGE_FOLDERS, ensureStoredImageUrl, uploadStoreImageFile } from '../../lib/storeImageUpload.js'

function saleFromMrpDiscount(mrpRaw, discountPctRaw) {
  const mrp = Number(mrpRaw)
  const d = Number(discountPctRaw)
  if (!Number.isFinite(mrp) || mrp < 0) return ''
  if (!Number.isFinite(d) || d < 0 || d > 100) return ''
  return String(Math.max(0, Math.round(mrp * (1 - d / 100))))
}

function discountPercentFromPrices(mrpRaw, saleRaw) {
  const mrp = Number(mrpRaw)
  const sale = Number(saleRaw)
  if (!Number.isFinite(mrp) || mrp <= 0 || !Number.isFinite(sale) || sale < 0 || sale > mrp) return ''
  return String(Math.round(((mrp - sale) / mrp) * 100))
}

export default function OffersManagementView() {
  const [sectionTitle, setSectionTitle] = useState('Hurry Up! Get Up to 40% Off')
  const [sectionSaving, setSectionSaving] = useState(false)
  const [flashDeals, setFlashDeals] = useState([])
  const [flashLoading, setFlashLoading] = useState(true)
  const [flashError, setFlashError] = useState('')
  const [flashModal, setFlashModal] = useState(null)
  const [flashSaving, setFlashSaving] = useState(false)
  const [flashImageUploading, setFlashImageUploading] = useState(false)
  const flashImageInputRef = useRef(null)

  const [offers, setOffers] = useState([])
  const [offersLoading, setOffersLoading] = useState(true)
  const [offersError, setOffersError] = useState('')
  const [offerModal, setOfferModal] = useState(null)
  const [offerSaving, setOfferSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .getFlashDealSection()
      .then((s) => {
        if (cancelled) return
        if (s?.title) setSectionTitle(String(s.title))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const loadFlashDeals = useCallback(async () => {
    setFlashLoading(true)
    setFlashError('')
    try {
      const res = await api.getFlashDealsAdmin({ page: 1, limit: 100 })
      const items = res?.items ?? (Array.isArray(res) ? res : [])
      setFlashDeals(Array.isArray(items) ? items : [])
    } catch (e) {
      setFlashError(e?.message || 'Could not load flash deals')
      setFlashDeals([])
    } finally {
      setFlashLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFlashDeals()
  }, [loadFlashDeals])

  const loadOffers = useCallback(async () => {
    setOffersLoading(true)
    setOffersError('')
    try {
      const res = await api.getOffersAdmin({ page: 1, limit: 200 })
      const items = res?.items ?? res?.data?.items ?? (Array.isArray(res) ? res : [])
      setOffers(Array.isArray(items) ? items : [])
    } catch (e) {
      setOffersError(e?.message || 'Could not load offers')
      setOffers([])
    } finally {
      setOffersLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOffers()
  }, [loadOffers])

  async function saveFlashDeal(e) {
    e.preventDefault()
    if (!flashModal) return
    const { title, imageUrl, mrpInr, discountPercent, sortOrder, isActive, linkUrl } = flashModal
    if (!title.trim() || !String(imageUrl).trim()) {
      alert('Title and an image (URL or upload) are required.')
      return
    }
    const mrpNum = Number(mrpInr)
    const discNum = Number(discountPercent)
    if (!Number.isFinite(mrpNum) || mrpNum < 0) {
      alert('Enter a valid MRP.')
      return
    }
    if (!Number.isFinite(discNum) || discNum < 0 || discNum > 100) {
      alert('Discount must be between 0 and 100%.')
      return
    }
    const saleComputed = Math.max(0, Math.round(mrpNum * (1 - discNum / 100)))
    setFlashSaving(true)
    try {
      const storedImage = await ensureStoredImageUrl(String(imageUrl).trim(), {
        folder: STORE_IMAGE_FOLDERS.flashDeals,
      })
      const body = {
        title: title.trim(),
        imageUrl: storedImage,
        mrpInr: mrpNum,
        salePriceInr: saleComputed,
        sortOrder: Number(sortOrder) || 0,
        isActive: Boolean(isActive),
        linkUrl: String(linkUrl || '').trim(),
      }
      if (flashModal._id) {
        await api.patchFlashDeal(flashModal._id, body)
      } else {
        await api.postFlashDeal(body)
      }
      setFlashModal(null)
      await loadFlashDeals()
    } catch (err) {
      alert(err?.message || 'Save failed')
    } finally {
      setFlashSaving(false)
    }
  }

  async function removeFlashDeal(id) {
    if (!confirm('Remove this homepage deal?')) return
    try {
      await api.deleteFlashDeal(id)
      await loadFlashDeals()
    } catch (e) {
      alert(e?.message || 'Delete failed')
    }
  }

  async function saveOffer(e) {
    e.preventDefault()
    if (!offerModal) return
    const title = String(offerModal.title || '').trim()
    const desc = String(offerModal.desc || '').trim()
    if (!title || !desc) {
      alert('Title and description are required.')
      return
    }

    setOfferSaving(true)
    try {
      const body = {
        title,
        desc,
        code: String(offerModal.code || '').trim(),
        modelId: String(offerModal.modelId || '').trim() || null,
        sortOrder: Number(offerModal.sortOrder) || 0,
        isActive: Boolean(offerModal.isActive),
      }
      if (offerModal._id) await api.patchOffer(offerModal._id, body)
      else await api.postOffer(body)
      setOfferModal(null)
      await loadOffers()
    } catch (err) {
      alert(err?.message || 'Save failed')
    } finally {
      setOfferSaving(false)
    }
  }

  async function removeOffer(id) {
    if (!confirm('Remove this offer?')) return
    try {
      await api.deleteOffer(id)
      await loadOffers()
    } catch (e) {
      alert(e?.message || 'Delete failed')
    }
  }

  const flashSalePreview = flashModal
    ? saleFromMrpDiscount(flashModal.mrpInr, flashModal.discountPercent)
    : ''

  return (
    <div>
      {/* Homepage flash deals — drives “Hurry Up” carousel on landing page */}
      <div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
              <Smartphone size={24} className="text-rose-600" />
              Homepage flash deals
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Products shown in “Hurry Up! Get Up to 40% Off” on the home page. Enter MRP and discount % — sale
              price is calculated automatically.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadFlashDeals()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw size={16} className={flashLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() =>
                setFlashModal({
                  _id: null,
                  title: '',
                  imageUrl: '',
                  mrpInr: '',
                  discountPercent: '',
                  sortOrder: 0,
                  isActive: true,
                  linkUrl: '',
                })
              }
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-black text-white shadow-md hover:bg-rose-700"
            >
              <Plus size={16} strokeWidth={3} /> Add deal
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Homepage section title
              </label>
              <input
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                placeholder="Hurry Up! Get Up to 40% Off"
              />
            </div>
            <button
              type="button"
              disabled={sectionSaving}
              onClick={async () => {
                setSectionSaving(true)
                try {
                  await api.patchFlashDealSection({ title: sectionTitle })
                } catch (e) {
                  alert(e?.message || 'Could not save title')
                } finally {
                  setSectionSaving(false)
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white shadow-md hover:bg-black disabled:opacity-60"
            >
              {sectionSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle size={16} />}
              Save title
            </button>
          </div>
        </div>

        {flashError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {flashError}
          </p>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {flashLoading ? (
            <div className="p-12 text-center text-sm font-semibold text-slate-500">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="h-12 border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Sale / MRP</th>
                    <th className="px-4 py-3">Sort</th>
                    <th className="px-4 py-3 text-center">Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flashDeals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                        No flash deals yet. Add one to populate the home page carousel.
                      </td>
                    </tr>
                  ) : (
                    flashDeals.map((d) => (
                      <tr key={d._id} className="hover:bg-slate-50/80">
                        <td className="max-w-[220px] px-4 py-3">
                          <div className="font-bold text-slate-900">{d.title}</div>
                          <div className="truncate text-xs text-slate-400">{d.imageUrl?.slice(0, 48)}…</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-700">
                          ₹{Number(d.salePriceInr).toLocaleString('en-IN')} /{' '}
                          <span className="text-slate-400 line-through">₹{Number(d.mrpInr).toLocaleString('en-IN')}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">{d.sortOrder ?? 0}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${
                              d.isActive
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-slate-100 text-slate-500'
                            }`}
                          >
                            {d.isActive ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setFlashModal({
                                _id: d._id,
                                title: d.title || '',
                                imageUrl: d.imageUrl || '',
                                mrpInr: d.mrpInr ?? '',
                                discountPercent:
                                  discountPercentFromPrices(d.mrpInr, d.salePriceInr) || '0',
                                sortOrder: d.sortOrder ?? 0,
                                isActive: d.isActive !== false,
                                linkUrl: d.linkUrl || '',
                              })
                            }
                            className="mr-2 inline-flex rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                            aria-label="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFlashDeal(d._id)}
                            className="inline-flex rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
                            aria-label="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Product page offers — drives “Available Offers” block on product details page */}
      <div className="mt-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
              <Tag size={22} className="text-blue-600" />
              Product page offers
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Offers shown in “Available Offers” on product details. Keep <span className="font-bold">modelId</span> empty for global offers.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadOffers()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw size={16} className={offersLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() =>
                setOfferModal({
                  _id: null,
                  title: '',
                  desc: '',
                  code: '',
                  modelId: '',
                  sortOrder: offers.reduce((m, o) => Math.max(m, Number(o?.sortOrder) || 0), -1) + 1,
                  isActive: true,
                })
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-md hover:bg-blue-700"
            >
              <Plus size={16} strokeWidth={3} /> Add offer
            </button>
          </div>
        </div>

        {offersError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {offersError}
          </p>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {offersLoading ? (
            <div className="p-12 text-center text-sm font-semibold text-slate-500">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="h-12 border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">ModelId</th>
                    <th className="px-4 py-3">Sort</th>
                    <th className="px-4 py-3 text-center">Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {offers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                        No offers yet. Add one to show on product pages.
                      </td>
                    </tr>
                  ) : (
                    offers.map((o) => (
                      <tr key={o._id} className="hover:bg-slate-50/80">
                        <td className="max-w-[200px] px-4 py-3">
                          <div className="font-bold text-slate-900">{o.title}</div>
                        </td>
                        <td className="max-w-[320px] px-4 py-3 text-sm font-semibold text-slate-700">
                          <div className="line-clamp-2">{o.desc}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs font-black text-slate-500 font-mono tracking-widest uppercase">
                          {o.code || '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-500 font-mono">
                          {o.modelId || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">{o.sortOrder ?? 0}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${
                              o.isActive
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-slate-100 text-slate-500'
                            }`}
                          >
                            {o.isActive ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setOfferModal({
                                _id: o._id,
                                title: o.title || '',
                                desc: o.desc || '',
                                code: o.code || '',
                                modelId: o.modelId || '',
                                sortOrder: o.sortOrder ?? 0,
                                isActive: o.isActive !== false,
                              })
                            }
                            className="mr-2 inline-flex rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                            aria-label="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeOffer(o._id)}
                            className="inline-flex rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
                            aria-label="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {flashModal ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h3 className="flex items-center gap-2 text-lg font-black text-slate-900">
                <Smartphone size={18} className="text-rose-600" />
                {flashModal._id ? 'Edit flash deal' : 'New flash deal'}
              </h3>
              <button
                type="button"
                onClick={() => setFlashModal(null)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={saveFlashDeal} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Title</label>
                <input
                  required
                  value={flashModal.title}
                  onChange={(e) => setFlashModal({ ...flashModal, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  placeholder="e.g. Samsung Galaxy S25 5G 12GB 256GB"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Image
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <input
                    required
                    value={flashModal.imageUrl}
                    onChange={(e) => setFlashModal({ ...flashModal, imageUrl: e.target.value })}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-mono text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    placeholder="https://... or upload a file below"
                  />
                  <input
                    ref={flashImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ''
                      if (!file || !file.type.startsWith('image/')) return
                      setFlashImageUploading(true)
                      try {
                        const url = await uploadStoreImageFile(file, {
                          folder: STORE_IMAGE_FOLDERS.flashDeals,
                        })
                        setFlashModal((m) => (m ? { ...m, imageUrl: url } : m))
                      } catch (err) {
                        alert(err?.message || 'Could not upload image.')
                      } finally {
                        setFlashImageUploading(false)
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => flashImageInputRef.current?.click()}
                    disabled={flashImageUploading}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-700 transition hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
                  >
                    <Upload size={16} strokeWidth={2.5} className={flashImageUploading ? 'animate-pulse' : ''} aria-hidden />
                    {flashImageUploading ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                  JPG, PNG, or WebP — stored on Cloudinary when configured.
                </p>
                {flashModal.imageUrl ? (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                    <img
                      src={api.resolveHomeServiceImageUrl(flashModal.imageUrl)}
                      alt=""
                      className="mx-auto max-h-40 w-auto max-w-full object-contain"
                    />
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">MRP (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={flashModal.mrpInr}
                    onChange={(e) =>
                      setFlashModal((m) => (m ? { ...m, mrpInr: e.target.value } : m))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Discount (%)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={flashModal.discountPercent}
                    onChange={(e) =>
                      setFlashModal((m) => (m ? { ...m, discountPercent: e.target.value } : m))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-rose-500"
                    placeholder="e.g. 12"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Sale price (₹){' '}
                  <span className="font-medium normal-case text-slate-400">— auto from MRP − discount</span>
                </label>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-sm font-black text-emerald-800">
                  {flashSalePreview !== ''
                    ? `₹${Number(flashSalePreview).toLocaleString('en-IN')}`
                    : '—'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Sort order</label>
                  <input
                    type="number"
                    value={flashModal.sortOrder}
                    onChange={(e) => setFlashModal({ ...flashModal, sortOrder: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={flashModal.isActive}
                      onChange={(e) => setFlashModal({ ...flashModal, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-rose-600"
                    />
                    Active on homepage
                  </label>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Link (optional)
                </label>
                <input
                  value={flashModal.linkUrl}
                  onChange={(e) => setFlashModal({ ...flashModal, linkUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-500"
                  placeholder="/product/xyz or https://..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFlashModal(null)}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={flashSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-black text-white shadow-md hover:bg-rose-700 disabled:opacity-60"
                >
                  {flashSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle size={16} />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {offerModal ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h3 className="flex items-center gap-2 text-lg font-black text-slate-900">
                <Tag size={18} className="text-blue-600" />
                {offerModal._id ? 'Edit offer' : 'New offer'}
              </h3>
              <button
                type="button"
                onClick={() => setOfferModal(null)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={saveOffer} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Title</label>
                <input
                  required
                  value={offerModal.title}
                  onChange={(e) => setOfferModal({ ...offerModal, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. Bank Offer"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                <textarea
                  required
                  value={offerModal.desc}
                  onChange={(e) => setOfferModal({ ...offerModal, desc: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  rows={3}
                  placeholder="e.g. Flat ₹2000 Off on ICICI Bank Cards"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Code (optional)</label>
                  <input
                    value={offerModal.code}
                    onChange={(e) => setOfferModal({ ...offerModal, code: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 font-mono text-xs outline-none focus:border-blue-500"
                    placeholder="ICICI2000"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Sort order</label>
                  <input
                    type="number"
                    value={offerModal.sortOrder}
                    onChange={(e) => setOfferModal({ ...offerModal, sortOrder: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  modelId (optional)
                </label>
                <input
                  value={offerModal.modelId}
                  onChange={(e) => setOfferModal({ ...offerModal, modelId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 font-mono text-xs outline-none focus:border-blue-500"
                  placeholder="PhoneModel _id (leave empty for global)"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={offerModal.isActive}
                    onChange={(e) => setOfferModal({ ...offerModal, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOfferModal(null)}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={offerSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-md hover:bg-blue-700 disabled:opacity-60"
                >
                  {offerSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle size={16} />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
