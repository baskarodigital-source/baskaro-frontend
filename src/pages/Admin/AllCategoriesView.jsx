import React, { useState, useEffect } from 'react'
import { appAlert, appConfirm } from '../../lib/appDialog.js'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Smartphone, Monitor, Watch, Laptop, Plus, Edit2, Trash2, 
  ChevronRight, LayoutGrid, Tablet, MousePointer2, Tv,
  Headphones, Speaker, Cpu, Box, X, UploadCloud
} from 'lucide-react'
import * as api from '../../lib/api/baskaroApi.js'
import { STORE_IMAGE_FOLDERS, uploadStoreImageFile } from '../../lib/storeImageUpload.js'
import CategoryBrandsView from '../../components/CategoryBrandsView.jsx'
import BrandModelsView from '../../components/BrandModelsView.jsx'
import BrandDevicesView from '../../components/BrandDevicesView.jsx'

/** id = UI key; iconKey = RibbonCategory.iconKey (backend enum). */
export const RIBBON_ICON_OPTIONS = [
  { id: 'Smartphone', iconKey: 'smartphone', icon: Smartphone, color: 'text-blue-500' },
  { id: 'Monitor', iconKey: 'tv', icon: Monitor, color: 'text-purple-500' },
  { id: 'Watch', iconKey: 'watch', icon: Watch, color: 'text-orange-500' },
  { id: 'Laptop', iconKey: 'laptop', icon: Laptop, color: 'text-red-500' },
  { id: 'Tablet', iconKey: 'tablet', icon: Tablet, color: 'text-indigo-500' },
  { id: 'MousePointer2', iconKey: 'sparkles', icon: MousePointer2, color: 'text-emerald-500' },
  { id: 'Tv', iconKey: 'tv', icon: Tv, color: 'text-pink-500' },
  { id: 'Headphones', iconKey: 'headphones', icon: Headphones, color: 'text-amber-500' },
  { id: 'Speaker', iconKey: 'gift', icon: Speaker, color: 'text-cyan-500' },
  { id: 'Cpu', iconKey: 'cpu', icon: Cpu, color: 'text-slate-500' },
];

export default function AllCategoriesView() {
  const [view, setView] = useState('Categories'); // 'Categories' | 'Brands' | 'Devices' | 'Models'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [busyId, setBusyId] = useState(null);

  // For CategoryBrandsView 
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getRibbonCategoriesAdmin();
      const list = Array.isArray(res) ? res : [];
      const mapped = list.map((cat) => {
        const opt = RIBBON_ICON_OPTIONS.find((o) => o.iconKey === cat.iconKey);
        return {
          id: cat._id,
          name: cat.label || '',
          path: cat.path || '/marketplace',
          imageUrl: cat.imageUrl || '',
          iconKey: cat.iconKey,
          icon: opt?.icon || LayoutGrid,
          color: opt?.color || 'text-slate-500',
          iconType: opt?.id || 'Smartphone',
          itemsCount: cat.brandsCount || 0,
          active: cat.isActive !== false,
        };
      });
      setCategories(mapped);
      setErr('');
    } catch (e) {
      setErr(e.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadBrands = async (categoryId) => {
    setBrandsLoading(true);
    try {
      const res = await api.getMobileBrands({ ribbonCategoryId: categoryId, limit: 100 });
      const bItems = res?.items || (Array.isArray(res) ? res : []); 
      setBrands(bItems.map(b => ({
         id: b._id,
         name: b.name,
         logo: b.imageUrl || ''
      })));
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setBrandsLoading(false);
    }
  };

  const loadDevices = async (brandId) => {
    setDevicesLoading(true);
    try {
      const res = await api.getBrandDevices({ brandId, limit: 200, active: true });
      const items = res?.items || (Array.isArray(res) ? res : []);
      setDevices(items.map((d) => ({
        id: d._id ?? d.id,
        name: d.name ?? '',
        imageUrl: d.imageUrl ?? '',
      })).filter((d) => d.id && d.name));
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setDevicesLoading(false);
    }
  };

  const onAddCategory = async (catData) => {
    const opt = RIBBON_ICON_OPTIONS.find((o) => o.id === catData.iconType);
    const iconKey = opt?.iconKey || 'smartphone';
    const body = {
      label: (catData.title || '').trim(),
      iconKey,
      path: '/marketplace',
      sortOrder: categories.length,
      isActive: true,
    };
    if (catData.photo) body.imageUrl = catData.photo
    try {
      await api.postRibbonCategory(body);
      await loadCategories();
      setIsAddingCategory(false);
    } catch (e) {
      appAlert(e.message || 'Creation failed');
    }
  };

  const onEditCategory = async (catData) => {
    if (!editingCategory?.id) return;
    const body = {
      label: (catData.title || '').trim(),
    };
    if (catData.photo) body.imageUrl = catData.photo
    try {
      await api.patchRibbonCategory(editingCategory.id, body);
      await loadCategories();
      setEditingCategory(null);
    } catch (e) {
      appAlert(e.message || 'Update failed');
    }
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setView('Brands');
    loadBrands(cat.id);
  };

  const handleSelectBrand = (brand) => {
    setSelectedBrand(brand);
    setView('Devices');
    setSelectedDevice(null);
    loadDevices(brand.id);
  };

  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
    setView('Models');
  };

  const handleOnAddBrand = async (name, logo) => {
    if (!selectedCategory) return;
    try {
       await api.postMobileBrand({ name, imageUrl: logo || '', ribbonCategoryId: selectedCategory.id });
       await loadBrands(selectedCategory.id);
    } catch (err) {
       throw err;
    }
  };

  const handleOnEditBrand = async (brandId, name, logo) => {
    try {
       await api.patchMobileBrand(brandId, { name, imageUrl: logo || '' });
       await loadBrands(selectedCategory.id);
    } catch (err) {
       throw err;
    }
  };

  const handleOnDeleteBrand = async (brandId) => {
    if (!(await appConfirm('Are you sure you want to delete this brand and all its models?'))) return;
    try {
       await api.deleteMobileBrand(brandId);
       await loadBrands(selectedCategory.id);
    } catch (err) {
       throw err;
    }
  };

  const handleOnDeleteCategory = async (id) => {
    if (!(await appConfirm('Are you sure you want to delete this category? All its brands and models will be lost.'))) return;
    setBusyId(id);
    try {
      await api.deleteRibbonCategory(id);
      await loadCategories();
    } catch (e) {
      appAlert(e.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleOnAddDevice = async (name, imageUrl) => {
    if (!selectedBrand) return;
    await api.postBrandDevice({ brandId: selectedBrand.id, name, imageUrl: imageUrl || '' });
    await loadDevices(selectedBrand.id);
  };

  const handleOnEditDevice = async (deviceId, name, imageUrl) => {
    await api.patchBrandDevice(deviceId, { name, imageUrl: imageUrl || '' });
    await loadDevices(selectedBrand.id);
  };

  const handleOnDeleteDevice = async (deviceId) => {
    if (!(await appConfirm('Are you sure you want to delete this device?'))) return;
    await api.deleteBrandDevice(deviceId);
    await loadDevices(selectedBrand.id);
  };

  return (
    <div className="space-y-10">
      {err && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{err}</div>}

      <AnimatePresence mode="wait">
        {view === 'Categories' && (
           <motion.div key="cat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
              
              {/* Header Box */}
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:rounded-3xl sm:p-6">
                 <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100 sm:h-12 sm:w-12 sm:rounded-2xl">
                       <Box size={22} strokeWidth={2.5} className="sm:hidden" />
                       <Box size={24} strokeWidth={2.5} className="hidden sm:block" />
                    </div>
                    <div className="min-w-0">
                       <h2 className="truncate text-lg font-black leading-tight tracking-tight text-slate-800 sm:text-xl">Catalog Management</h2>
                       <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-slate-400 sm:text-[11px]">Configure categories & products</p>
                    </div>
                 </div>
                 <button type="button" onClick={() => setIsAddingCategory(true)} className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0a0a0a] px-5 py-3 text-xs font-black text-white transition-all hover:scale-[1.02] active:scale-95 sm:w-auto sm:rounded-2xl sm:px-6">
                    <Plus size={16} strokeWidth={3} /> Add Category
                 </button>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10 xl:grid-cols-4">
                 {loading && Array(4).fill(0).map((_, i) => (
                    <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-slate-100 animate-pulse"></div>
                 ))}
                 {!loading && categories.map(cat => (
                    <CategoryCard 
                      key={cat.id} 
                      category={cat} 
                      onClick={() => handleSelectCategory(cat)} 
                      onEdit={(e) => { e.stopPropagation(); setEditingCategory(cat); }}
                      onDelete={(e) => { e.stopPropagation(); handleOnDeleteCategory(cat.id); }}
                      busy={busyId === cat.id}
                    />
                 ))}
                 {!loading && (
                   <button onClick={() => setIsAddingCategory(true)} className="aspect-[4/5] group flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2.5rem] hover:bg-white hover:border-blue-400 transition-all hover:shadow-2xl hover:shadow-blue-50">
                     <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all mb-4 group-hover:scale-110">
                       <Plus size={32} />
                     </div>
                     <span className="text-xs font-black text-slate-400 group-hover:text-blue-600">Add New Category</span>
                   </button>
                 )}
              </div>
           </motion.div>
        )}

        {view === 'Brands' && (
           <CategoryBrandsView 
              category={selectedCategory} 
              brands={brands}
              brandsLoading={brandsLoading}
              onBack={() => setView('Categories')} 
              onAddBrand={handleOnAddBrand}
              onSelectBrand={handleSelectBrand}
              onEditBrand={handleOnEditBrand}
              onDeleteBrand={handleOnDeleteBrand}
           />
        )}

        {view === 'Devices' && (
          <BrandDevicesView
            category={selectedCategory}
            brand={selectedBrand}
            devices={devices}
            devicesLoading={devicesLoading}
            onBack={() => setView('Brands')}
            onAddDevice={handleOnAddDevice}
            onSelectDevice={handleSelectDevice}
            onEditDevice={handleOnEditDevice}
            onDeleteDevice={handleOnDeleteDevice}
          />
        )}

        {view === 'Models' && (
           <BrandModelsView 
             category={selectedCategory} 
             brand={selectedBrand} 
             device={selectedDevice}
             onBack={() => setView('Devices')} 
           />
        )}
      </AnimatePresence>

       {/* Modal Implementation for Add Category */}
       <AnimatePresence>
          {isAddingCategory && (
            <AddNewCategoryModal 
              onCancel={() => setIsAddingCategory(false)} 
              onSave={onAddCategory} 
            />
          )}
       </AnimatePresence>

       <AnimatePresence>
          {editingCategory && (
            <EditCategoryModal
              category={editingCategory}
              onCancel={() => setEditingCategory(null)}
              onSave={onEditCategory}
            />
          )}
       </AnimatePresence>
    </div>
  );
}

const FALLBACK_CARD_IMG =
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop';

function CategoryCard({ category, onClick, onEdit, onDelete, busy }) {
  const raw = category.imageUrl && String(category.imageUrl).trim();
  const img = raw ? raw : FALLBACK_CARD_IMG;

  return (
    <div 
      onClick={onClick}
      className="group relative bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
    >
       <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
          <img src={img} alt={category.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
       </div>
       <div className="p-8 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-4">
             <h3 className="font-black text-slate-800 text-xl tracking-tighter uppercase">{category.name}</h3>
             <span
               className={
                 category.active
                   ? 'bg-emerald-50 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest'
                   : 'bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest'
               }
             >
               {category.active ? 'Active' : 'Inactive'}
             </span>
          </div>
          <div className="flex items-center justify-between mt-auto">
             <span className="text-[10px] font-bold text-slate-300">{category.path || '/marketplace'}</span>
             <div className="flex items-center gap-1 text-blue-600 font-bold text-xs group-hover:translate-x-1 transition-transform">
                View Brands <ChevronRight size={14} strokeWidth={3} />
             </div>
          </div>
       </div>
       <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
         <button
           type="button"
           onClick={onEdit}
           className="h-9 w-9 rounded-xl bg-white/85 backdrop-blur shadow-md shadow-slate-200/60 text-slate-400 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-slate-900 transition-all"
           aria-label="Edit category"
           title="Edit"
         >
           <Edit2 size={16} />
         </button>
         <button
           type="button"
           disabled={busy}
           onClick={onDelete}
           className="h-9 w-9 rounded-xl bg-white/85 backdrop-blur shadow-md shadow-slate-200/60 text-slate-400 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-red-500 transition-all disabled:opacity-50"
           aria-label="Delete category"
           title="Delete"
         >
            <X size={16} />
         </button>
       </div>
    </div>
  );
}

function AddNewCategoryModal({ onCancel, onSave }) {
  const [formData, setFormData] = useState({ title: '', iconType: 'Smartphone', photo: null });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return appAlert('Enter a title');
    setBusy(true);
    try {
      await onSave(formData);
    } finally {
      setBusy(false);
    }
  };

  const onPickPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    setBusy(true);
    try {
      const url = await uploadStoreImageFile(file, { folder: STORE_IMAGE_FOLDERS.ribbon });
      setFormData((prev) => ({ ...prev, photo: url }));
    } catch (err) {
      appAlert(err?.message || 'Could not upload image.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
       {/* Overlay */}
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
       
       {/* Modal Body */}
       <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden shadow-slate-900/20">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Box size={22} className="text-blue-600" strokeWidth={2.5} />
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Add New Category</h3>
             </div>
             <button onClick={onCancel} className="text-slate-300 hover:text-slate-600 transition-colors">
                <X size={20} strokeWidth={3} />
             </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
             {/* Name Field */}
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Name</label>
                <input 
                   required
                   type="text" 
                   autoFocus
                   placeholder="e.g. Headphones"
                   className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                   value={formData.title}
                   onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
             </div>

             {/* Photo Field */}
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Photo</label>
                <div
                   className="w-full h-44 border-2 border-dashed border-blue-200 rounded-3xl bg-blue-50/20 flex flex-col items-center justify-center group cursor-pointer hover:bg-blue-50 transition-all overflow-hidden"
                   onClick={() => document.getElementById('cat-photo-upload').click()}
                >
                   <input type="file" id="cat-photo-upload" accept="image/*" className="hidden" onChange={onPickPhoto} />
                   {formData.photo ? (
                     <img src={formData.photo} alt="" className="h-full w-full object-cover" />
                   ) : (
                     <>
                       <UploadCloud size={32} className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                       <span className="text-[11px] font-black text-slate-500 tracking-widest uppercase">Click to upload</span>
                     </>
                   )}
                </div>
             </div>

             {/* Footer Buttons */}
             <div className="flex gap-4 pt-4">
                <button 
                   type="button" 
                   onClick={onCancel} 
                   className="flex-1 bg-white border border-slate-200 rounded-2xl py-4 text-sm font-black text-slate-700 hover:bg-slate-50 transition-all transform active:scale-95"
                >
                   Cancel
                </button>
                <button 
                   type="submit" 
                   disabled={busy}
                   className="flex-1 bg-[#101828] rounded-2xl py-4 text-sm font-black text-white shadow-xl shadow-slate-200 hover:bg-black transition-all transform active:scale-95"
                >
                   {busy ? 'Saving...' : 'Add Category'}
                </button>
             </div>
          </form>
       </motion.div>
    </div>
  );
}

function EditCategoryModal({ category, onCancel, onSave }) {
  const [formData, setFormData] = useState(() => ({
    title: category?.name || '',
    photo: null,
  }));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFormData({ title: category?.name || '', photo: null });
  }, [category?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return appAlert('Enter a title');
    setBusy(true);
    try {
      await onSave(formData);
    } finally {
      setBusy(false);
    }
  };

  const onPickPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    setBusy(true);
    try {
      const url = await uploadStoreImageFile(file, { folder: STORE_IMAGE_FOLDERS.ribbon });
      setFormData((prev) => ({ ...prev, photo: url }));
    } catch (err) {
      appAlert(err?.message || 'Could not upload image.');
    } finally {
      setBusy(false);
    }
  };

  const preview = formData.photo || category?.imageUrl || '';

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden shadow-slate-900/20"
      >
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Edit2 size={22} className="text-blue-600" strokeWidth={2.5} />
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Edit Category</h3>
          </div>
          <button onClick={onCancel} className="text-slate-300 hover:text-slate-600 transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Name</label>
            <input
              required
              type="text"
              autoFocus
              placeholder="e.g. Headphones"
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Photo</label>
            <div
              className="w-full h-44 border-2 border-dashed border-blue-200 rounded-3xl bg-blue-50/20 flex flex-col items-center justify-center group cursor-pointer hover:bg-blue-50 transition-all overflow-hidden"
              onClick={() => document.getElementById('cat-edit-photo-upload').click()}
            >
              <input type="file" id="cat-edit-photo-upload" accept="image/*" className="hidden" onChange={onPickPhoto} />
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <>
                  <UploadCloud size={32} className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-black text-slate-500 tracking-widest uppercase">Click to upload</span>
                </>
              )}
            </div>
            {!!category?.imageUrl && !formData.photo && (
              <div className="text-[10px] font-bold text-slate-400">
                Current image will be kept unless you upload a new one.
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-white border border-slate-200 rounded-2xl py-4 text-sm font-black text-slate-700 hover:bg-slate-50 transition-all transform active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 bg-[#101828] rounded-2xl py-4 text-sm font-black text-white shadow-xl shadow-slate-200 hover:bg-black transition-all transform active:scale-95"
            >
              {busy ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
