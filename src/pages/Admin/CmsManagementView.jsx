import React, { useEffect, useRef, useState } from 'react'
import { appAlert, appConfirm } from '../../lib/appDialog.js'
import { 
  UploadCloud, Trash2, Image as ImageIcon, Plus 
} from 'lucide-react'
import {
  deleteBanner,
  getBanners,
  patchBannerToggleStatus,
  postBanner,
} from '../../lib/api/baskaroApi.js'
import { STORE_IMAGE_FOLDERS, uploadStoreImageFile } from '../../lib/storeImageUpload.js'

const POSITION_OPTIONS = [
  { label: 'Homepage', value: 'HOME_HERO' },
  { label: 'promoBanners', value: 'HOME_TOP' },
]

const POSITION_LABEL_BY_VALUE = Object.fromEntries(POSITION_OPTIONS.map((p) => [p.value, p.label]))

function resolveBannerImageUrl(raw) {
  const t = String(raw ?? '').trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t) || t.startsWith('data:')) return t
  const base = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
  if (t.startsWith('/')) return base ? `${base}${t}` : t
  return base ? `${base}/${t.replace(/^\//, '')}` : t
}

function toUiBanner(b) {
  const id = b?._id != null ? String(b._id) : String(b?.id ?? '')
  const title = String(b?.title ?? '').trim()
  const position = String(b?.position ?? 'HOME_HERO').trim() || 'HOME_HERO'
  const imgUrl = resolveBannerImageUrl(b?.imageUrl ?? b?.imgUrl ?? '')
  return {
    id,
    title,
    position,
    imgUrl,
    isActive: Boolean(b?.isActive),
  }
}

export default function CmsManagementView() {
  const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024
  const [banners, setBanners] = useState([])
  
  const [isUploading, setIsUploading] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: '', position: 'HOME_HERO', imgUrl: '' });
  const [uploadError, setUploadError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false
    setIsBusy(true)
    getBanners({ active: 'all' })
      .then((list) => {
        if (cancelled) return
        const arr = Array.isArray(list) ? list : []
        setBanners(arr.map(toUiBanner).filter((b) => b.id && b.title && b.imgUrl))
      })
      .catch((err) => {
        if (cancelled) return
        appAlert(err?.message || 'Failed to load banners')
      })
      .finally(() => {
        if (!cancelled) setIsBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleToggleStatus = async (id) => {
    const current = banners.find((b) => b.id === id)
    if (!current) return
    try {
      const updated = await patchBannerToggleStatus(id, { isActive: !current.isActive })
      const next = toUiBanner(updated)
      setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: next.isActive } : b)))
    } catch (err) {
      appAlert(err?.message || 'Failed to update banner status')
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBanner(id)
      setBanners((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      appAlert(err?.message || 'Failed to delete banner')
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newBanner.imgUrl) {
      appAlert('Please upload an image first.');
      return;
    }
    try {
      const created = await postBanner({
        title: newBanner.title.trim(),
        imageUrl: newBanner.imgUrl,
        position: newBanner.position,
        isActive: true,
      })
      const next = toUiBanner(created)
      setBanners((prev) => [next, ...prev])
      setIsUploading(false);
      setUploadError('');
      setNewBanner({ title: '', position: 'HOME_HERO', imgUrl: '' });
    } catch (err) {
      appAlert(err?.message || 'Failed to create banner')
    }
  };

  const handleImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a valid image file.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError('Image must be 2MB or smaller.');
      return;
    }
    setImageUploading(true);
    setUploadError('');
    try {
      const url = await uploadStoreImageFile(file, { folder: STORE_IMAGE_FOLDERS.banners });
      setNewBanner((prev) => ({ ...prev, imgUrl: url }));
    } catch (err) {
      setUploadError(err?.message || 'Could not upload image to Cloudinary.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleImageFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    handleImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">CMS & Banners</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage graphical assets spanning the homepage, app, and promotional blocks.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsUploading(true)} className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-black hover:bg-blue-700 shadow-md shadow-blue-200 transition">
            <UploadCloud size={16} strokeWidth={3} /> Upload New Banner
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {isBusy ? (
           <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
             Loading banners...
           </div>
         ) : null}
         {banners.map(banner => (
            <div key={banner.id} className={`bg-white border rounded-3xl overflow-hidden shadow-sm transition-all group ${banner.isActive ? 'border-slate-200 hover:shadow-lg' : 'border-slate-100 opacity-60 grayscale-[30%] hover:grayscale-0'}`}>
               <div className="h-40 w-full overflow-hidden relative bg-slate-100">
                  <img src={banner.imgUrl} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 flex gap-2">
                     <span className="bg-white/90 backdrop-blur text-slate-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">{POSITION_LABEL_BY_VALUE[banner.position] || banner.position}</span>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                     <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur shadow-sm flex items-center gap-1.5 ${banner.isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-800/80 text-white'}`}>
                        {banner.isActive ? 'Live' : 'Hidden'}
                     </div>
                  </div>
               </div>
               <div className="p-5">
                  <h3 className="font-black text-slate-900 text-lg mb-1 leading-tight">{banner.title}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{banner.id}</p>
                  
                  <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                     <button onClick={() => handleDelete(banner.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={16} strokeWidth={2.5} />
                     </button>
                     <button onClick={() => handleToggleStatus(banner.id)} className={`flex-1 h-10 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm ${banner.isActive ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-black'}`}>
                        {banner.isActive ? 'Hide Banner' : 'Publish Banner'}
                     </button>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><ImageIcon size={18} className="text-blue-600"/> Upload New Banner</h3>
               <button onClick={() => setIsUploading(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><Plus size={24} className="rotate-45"/></button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
               
               <div>
                 <input
                   ref={fileInputRef}
                   type="file"
                   accept="image/*"
                   className="hidden"
                   onChange={handleFileInputChange}
                 />
                 <div
                   role="button"
                   tabIndex={0}
                   onClick={() => fileInputRef.current?.click()}
                   onDrop={handleDrop}
                   onDragOver={handleDragOver}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                   }}
                   className="w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 hover:border-blue-300 transition-colors cursor-pointer group"
                 >
                    <UploadCloud size={24} className="mb-2 group-hover:text-blue-500 transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-wider">Drag & Drop Image</span>
                    <span className="text-[10px] font-medium text-slate-400 mt-1">1920x1080px (Max 2MB)</span>
                 </div>
                 {uploadError ? (
                   <p className="mt-2 text-xs font-semibold text-red-500">{uploadError}</p>
                 ) : null}
                 {newBanner.imgUrl ? (
                   <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                     <img
                       src={newBanner.imgUrl}
                       alt="Banner preview"
                       className="mx-auto max-h-40 w-auto max-w-full object-contain"
                     />
                   </div>
                 ) : null}
               </div>

               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Banner Title</label>
                 <input required type="text" placeholder="e.g. Mega Summer Promo" value={newBanner.title} onChange={e=>setNewBanner({...newBanner, title: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-black text-slate-800 transition-all placeholder:font-medium" />
               </div>

               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Display Target</label>
                 <select required value={newBanner.position} onChange={e=>setNewBanner({...newBanner, position: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-black text-slate-700 bg-white cursor-pointer transition-all">
                    {POSITION_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                 </select>
               </div>
               <div className="pt-4 flex justify-end gap-3 mt-2">
                 <button type="button" onClick={() => setIsUploading(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                 <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-black bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition flex items-center gap-1.5">Upload Asset</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
