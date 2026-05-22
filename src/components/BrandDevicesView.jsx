import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Plus, Edit2, Trash2, Package, UploadCloud, ListChecks } from 'lucide-react'
import DeviceSpecificationsModal from './DeviceSpecificationsModal.jsx'
import { STORE_IMAGE_FOLDERS, uploadStoreImageFile } from '../lib/storeImageUpload.js'

export default function BrandDevicesView({
  category,
  brand,
  devices,
  devicesLoading = false,
  onBack,
  onAddDevice,
  onSelectDevice,
  onEditDevice,
  onDeleteDevice,
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [specsForDevice, setSpecsForDevice] = useState(null)

  const openEdit = (d, e) => {
    e.stopPropagation()
    setEditingId(d.id)
    setName(d.name)
    setImagePreview(d.imageUrl || null)
    setIsAdding(true)
  }

  const handleImageChange = async (file) => {
    if (!file?.type?.startsWith('image/')) return
    setImageUploading(true)
    try {
      const url = await uploadStoreImageFile(file, { folder: STORE_IMAGE_FOLDERS.devices })
      setImagePreview(url)
    } catch (err) {
      window.alert(err?.message || 'Could not upload image.')
    } finally {
      setImageUploading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl font-black text-slate-900">{brand.name}</h2>
          <span className="text-sm font-bold text-slate-400">/ Devices ({category.name})</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Manage Devices</h3>
            <p className="text-sm font-bold text-slate-400">Create device types under {brand.name} (e.g. Watch, Bluetooth)</p>
          </div>
          <button type="button" onClick={() => setIsAdding(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 sm:w-auto sm:px-6">
            <Plus size={16} /> Add Device
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:gap-6 sm:p-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {devicesLoading && (
            <div className="col-span-full py-12 text-center text-sm font-bold text-slate-500">
              Loading devices…
            </div>
          )}

          {!devicesLoading && devices.map((d) => (
            <div key={d.id} onClick={() => onSelectDevice(d)} className="relative group flex flex-col items-center gap-3 p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer">
              <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSpecsForDevice(d); }}
                  className="h-7 w-7 rounded-lg bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-800 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all transform hover:scale-110"
                  title="Specifications"
                >
                  <ListChecks size={12} />
                </button>
                <button onClick={(e) => openEdit(d, e)} className="h-7 w-7 rounded-lg bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-800 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50/30 transition-all transform hover:scale-110">
                  <Edit2 size={12} />
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation()
                    try {
                      await onDeleteDevice(d.id)
                    } catch (err) {
                      window.alert(err.message || 'Could not delete device')
                    }
                  }}
                  className="h-7 w-7 rounded-lg bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-800 hover:text-red-600 hover:border-red-200 hover:bg-red-50/30 transition-all transform hover:scale-110"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="h-16 w-16 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center p-3 group-hover:scale-110 transition-transform text-slate-400 overflow-hidden">
                {d.imageUrl ? (
                  <img src={d.imageUrl} alt={d.name} className="max-w-full max-h-full object-contain" />
                ) : (
                  <Package size={28} strokeWidth={1.5} />
                )}
              </div>
              <span className="text-sm font-black text-slate-700 group-hover:text-blue-600">{d.name}</span>
            </div>
          ))}

          {!devicesLoading && (
            <button type="button" onClick={() => setIsAdding(true)} className="aspect-square flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-blue-300 transition-all group text-slate-400 gap-2">
              <Plus size={24} className="group-hover:text-blue-500 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-slate-600">New Device</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">{editingId ? 'Edit Device' : `Add Device to ${brand.name}`}</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Device Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="e.g. Watch" className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Device Image</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden h-24" onClick={() => document.getElementById('device-image-upload').click()}>
                    <input
                      id="device-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) handleImageChange(e.target.files[0])
                      }}
                    />
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white text-xs font-bold">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <UploadCloud size={20} className="mb-1 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Click to upload image</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" disabled={saving} onClick={() => { setIsAdding(false); setEditingId(null); setName(''); setImagePreview(null); }} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50">Cancel</button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={async () => {
                      const n = name.trim()
                      if (!n) {
                        window.alert('Please enter a device name')
                        return
                      }
                      setSaving(true)
                      try {
                        if (editingId) {
                          await onEditDevice(editingId, n, imagePreview ?? '')
                        } else {
                          await onAddDevice(n, imagePreview || '')
                        }
                        setIsAdding(false)
                        setEditingId(null)
                        setName('')
                        setImagePreview(null)
                      } catch (err) {
                        window.alert(err.message || 'Could not save device')
                      } finally {
                        setSaving(false)
                      }
                    }}
                    className="px-8 py-3 rounded-xl text-sm font-black bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Device'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DeviceSpecificationsModal
        open={!!specsForDevice}
        device={specsForDevice}
        onClose={() => setSpecsForDevice(null)}
      />
    </motion.div>
  )
}

