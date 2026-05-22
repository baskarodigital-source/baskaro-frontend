import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, Plus, Edit2, Trash2, CheckCircle 
} from 'lucide-react'
import AddNewModelForm from './AddNewModelForm.jsx'
import * as api from '../lib/api/baskaroApi.js'

export default function BrandModelsView({ category, brand, device, onBack }) {
  const [activeTab, setActiveTab] = useState('Models'); // 'Models' | 'Add'
  const [editingModel, setEditingModel] = useState(null);
  
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadModels = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getMobileModels({ brandId: brand.id, deviceId: device?.id || '', limit: 100 });
      const mItems = res?.items || (Array.isArray(res) ? res : []); 
      setModels(mItems);
    } catch (err) {
      console.error('Failed to load models:', err);
    } finally {
      setLoading(false);
    }
  }, [brand.id, device?.id]);

  React.useEffect(() => {
    loadModels();
  }, [loadModels]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
       try {
         await api.deleteMobileModel(id);
         loadModels();
       } catch (err) {
         alert(err.message || 'Delete failed');
       }
    }
  };

  const handleEdit = (model) => {
     setEditingModel(model);
     setActiveTab('Add');
  };

  const handleSave = async (data) => {
    try {
      const { offersDraft, ...modelBody } = data || {}
      if (editingModel) {
        const modelId = editingModel.id || editingModel._id
        const updated = await api.patchMobileModel(modelId, modelBody)
        const id = updated?._id || updated?.id || modelId

        if (Array.isArray(offersDraft)) {
          await Promise.all(
            offersDraft.map(async (o) => {
              const title = String(o?.title || '').trim()
              const desc = String(o?.desc || '').trim()
              const code = String(o?.code || '').trim()
              const sortOrder = Number(o?.sortOrder) || 0
              const isActive = o?.isActive !== false

              if (o?._deleted) {
                if (o?._id) await api.deleteOffer(o._id)
                return
              }
              if (!title || !desc) return

              const body = { title, desc, code, sortOrder, isActive, modelId: id }
              if (o?._id) await api.patchOffer(o._id, body)
              else await api.postOffer(body)
            }),
          )
        }
      } else {
        const created = await api.postMobileModel(modelBody)
        const id = created?._id || created?.id
        if (id && Array.isArray(offersDraft)) {
          await Promise.all(
            offersDraft.map(async (o) => {
              const title = String(o?.title || '').trim()
              const desc = String(o?.desc || '').trim()
              const code = String(o?.code || '').trim()
              const sortOrder = Number(o?.sortOrder) || 0
              const isActive = o?.isActive !== false
              if (!title || !desc) return
              await api.postOffer({ title, desc, code, sortOrder, isActive, modelId: id })
            }),
          )
        }
      }
      loadModels();
      setActiveTab('Models');
      setEditingModel(null);
    } catch (err) {
      alert(err.message || 'Save failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
       <div className="flex items-start gap-3 sm:items-center sm:gap-4">
          <button type="button" onClick={onBack} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-blue-200 hover:text-blue-600">
             <ChevronLeft size={20} />
          </button>
          <div className="min-w-0">
             <h2 className="truncate text-lg font-black text-slate-900 sm:text-2xl">{device?.name || brand.name}</h2>
             <p className="truncate text-xs font-bold text-slate-400 sm:text-sm">{brand.name} • {category.name} Models</p>
          </div>
       </div>

       {activeTab === 'Add' ? (
          <AddNewModelForm 
            onCancel={() => { setActiveTab('Models'); setEditingModel(null); }} 
            category={category}
            brand={brand}
            device={device}
            editingModel={editingModel}
            onSave={handleSave}
          />
       ) : (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
             <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
                <div>
                   <h3 className="text-lg font-black text-slate-900">Registered Models</h3>
                   <p className="text-sm font-bold text-slate-400">Manage pricing and variants for {brand.name}</p>
                </div>
                <button type="button" onClick={() => setActiveTab('Add')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-black sm:w-auto sm:px-6">
                   <Plus size={16} /> Add New {category.name === 'Smartphones' ? 'Mobile' : 'Product'}
                </button>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-slate-200/60 bg-slate-50/50">
                         <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Model Name & Preview</th>
                         <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                         <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                       {loading && (
                        <tr>
                           <td colSpan={3} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading catalog…</td>
                        </tr>
                      )}
                      {!loading && models.map(model => (
                         <tr key={model.id || model._id} className="group border-b border-slate-100 hover:bg-slate-50/40 transition-all">
                            <td className="px-8 py-5">
                               <div className="flex items-center gap-5">
                                  <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex-shrink-0 p-2 overflow-hidden group-hover:border-blue-200 group-hover:scale-105 transition-all">
                                     <img src={model.image || '/placeholder-phone.png'} alt={model.name} className="h-full w-full object-contain" />
                                  </div>
                                  <div>
                                     <span className="block text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{model.name}</span>
                                     <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Product ID: BSK-MDL-{String(model.id || model._id).slice(-6).toUpperCase()}</span>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-5 text-center">
                               <div className="flex justify-center">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm shadow-green-100">
                                     <CheckCircle size={10} /> Active
                                  </span>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                               <div className="flex justify-end gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEdit(model)} className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-600 flex items-center gap-2 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/20 transition-all shadow-sm">
                                     <Edit2 size={14} /> Edit Details
                                  </button>
                                  <button onClick={() => handleDelete(model.id || model._id)} className="h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:text-red-600 hover:border-red-100 hover:bg-red-50/20 transition-all shadow-sm">
                                     <Trash2 size={16} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                      ))}
                      {!loading && models.length === 0 && (
                        <tr>
                           <td colSpan={3} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No models found for this brand</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
       )}
    </motion.div>
  );
}
