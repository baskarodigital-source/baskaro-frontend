import React from 'react'
import { appAlert, appConfirm } from '../../lib/appDialog.js'
import { Plus, Trash2, Pencil, RefreshCw, Upload } from 'lucide-react'
import * as api from '../../lib/api/baskaroApi.js'
import { STORE_IMAGE_FOLDERS, ensureStoredImageUrl, uploadStoreImageFile } from '../../lib/storeImageUpload.js'

function pathFromLabel(labelRaw, fallback = '/') {
  const label = String(labelRaw || '').trim().toLowerCase()
  const map = new Map([
    ['sell phone', '/sell-phone'],
    ['buy phone', '/marketplace'],
    ['repair phone', '/repair-phone'],
    ['find new phone', '/find-new-phone'],
    ['nearby stores', '/nearby-stores'],
    ['new accessories', '/buy-accessories'],
    ['buy smartwatches', '/buy-accessories'],
  ])
  if (map.has(label)) return map.get(label)
  return fallback
}

function normalizeItems(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.items)) return res.items
  return []
}

export default function ServicesManagementView() {
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [err, setErr] = React.useState('')
  const [modal, setModal] = React.useState(null) // { _id?, label, path, sortOrder, isActive }
  const [saving, setSaving] = React.useState(false)
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const imageInputRef = React.useRef(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const res = await api.getHomeServicesAdmin({ page: 1, limit: 200 })
      setItems(normalizeItems(res))
    } catch (e) {
      setErr(e?.message || 'Could not load services')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  async function save(e) {
    e.preventDefault()
    if (!modal) return
    const label = String(modal.label || '').trim()
    if (!label) return appAlert('Label is required')
    const path = pathFromLabel(label, modal.path || '/')
    setSaving(true)
    try {
      const rawImage = String(modal.imageUrl || '').trim()
      const imageUrl = rawImage
        ? await ensureStoredImageUrl(rawImage, { folder: STORE_IMAGE_FOLDERS.homeServices })
        : ''
      const body = {
        label,
        path,
        imageUrl,
        sortOrder: Number(modal.sortOrder) || 0,
        isActive: modal.isActive !== false,
      }
      if (modal._id) await api.patchHomeService(modal._id, body)
      else await api.postHomeService(body)
      setModal(null)
      await load()
    } catch (e2) {
      appAlert(e2?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    if (!(await appConfirm('Delete this service?'))) return
    try {
      await api.deleteHomeService(id)
      await load()
    } catch (e) {
      appAlert(e?.message || 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Homepage services</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            These items appear in the “Our Services” row on the landing page.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() =>
              setModal({ _id: null, label: '', path: '/', imageUrl: '', sortOrder: 0, isActive: true })
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white shadow-md hover:bg-black"
          >
            <Plus size={16} strokeWidth={3} /> Add service
          </button>
        </div>
      </div>

      {err ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {err}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm font-semibold text-slate-500">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="h-12 border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Sort</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                      No services yet.
                    </td>
                  </tr>
                ) : (
                  items.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-bold text-slate-900">{s.label}</td>
                      <td className="px-4 py-3 text-sm">{s.sortOrder ?? 0}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${
                            s.isActive
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-slate-100 text-slate-500'
                          }`}
                        >
                          {s.isActive ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setModal({
                              _id: s._id,
                              label: s.label || '',
                              path: s.path || '',
                              imageUrl: s.imageUrl || '',
                              sortOrder: s.sortOrder ?? 0,
                              isActive: s.isActive !== false,
                            })
                          }
                          className="mr-2 inline-flex rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(s._id)}
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

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h3 className="text-lg font-black text-slate-900">{modal._id ? 'Edit service' : 'New service'}</h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={save} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Label</label>
                <input
                  value={modal.label}
                  onChange={(e) =>
                    setModal((m) =>
                      m
                        ? {
                            ...m,
                            label: e.target.value,
                            path: pathFromLabel(e.target.value, m.path || '/'),
                          }
                        : m,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-slate-900"
                  placeholder="Sell Phone"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Image</label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <input
                    value={modal.imageUrl || ''}
                    onChange={(e) => setModal({ ...modal, imageUrl: e.target.value })}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-mono text-xs outline-none focus:border-slate-900"
                    placeholder="https://... or upload"
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ''
                      if (!file || !file.type.startsWith('image/')) return
                      setUploadingImage(true)
                      try {
                        const url = await uploadStoreImageFile(file, {
                          folder: STORE_IMAGE_FOLDERS.homeServices,
                        })
                        setModal((m) => (m ? { ...m, imageUrl: url } : m))
                      } catch (err) {
                        appAlert(err?.message || 'Could not upload image.')
                      } finally {
                        setUploadingImage(false)
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                  >
                    <Upload size={16} strokeWidth={2.5} className={uploadingImage ? 'animate-pulse' : ''} aria-hidden />
                    {uploadingImage ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
                {modal.imageUrl ? (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                    <img src={api.resolveHomeServiceImageUrl(modal.imageUrl)} alt="" className="mx-auto max-h-28 w-auto max-w-full object-contain" />
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Sort</label>
                  <input
                    type="number"
                    value={modal.sortOrder}
                    onChange={(e) => setModal({ ...modal, sortOrder: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={modal.isActive !== false}
                      onChange={(e) => setModal({ ...modal, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900"
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white shadow-md hover:bg-black disabled:opacity-60"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
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

