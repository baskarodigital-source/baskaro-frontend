import React, { useCallback, useEffect, useState } from 'react'
import { Plus, Minus, Package, CheckCircle, RefreshCw } from 'lucide-react'
import * as api from '../../lib/api/baskaroApi.js'

const gradeOptions = [
  { value: 'EXCELLENT', label: 'Grade A (Excellent)' },
  { value: 'GOOD', label: 'Grade B (Good)' },
  { value: 'AVERAGE', label: 'Grade C (Average)' },
  { value: 'BROKEN', label: 'Grade D (Broken)' },
]

const gradeLabelMap = gradeOptions.reduce((acc, g) => {
  acc[g.value] = g.label
  return acc
}, {})

function getGradeLabel(grade) {
  const g = String(grade || '').trim()
  if (!g) return gradeOptions[0].label
  return gradeLabelMap[g] || g
}

function normalizeList(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.items)) return res.items
  if (Array.isArray(res.data)) return res.data
  return []
}

function getInventoryId(item) {
  return String(item?._id || item?.inventoryId || item?.id || '')
}

function getModelName(item) {
  if (item?.modelId && typeof item.modelId === 'object') {
    return String(item.modelId.modelName || item.modelId.name || item.model || '').trim()
  }
  return String(item?.modelName || item?.model || '').trim()
}

function getImageUrl(item) {
  const raw =
    item?.imageUrl ||
    item?.image ||
    (Array.isArray(item?.images) ? item.images[0] : '') ||
    (item?.photos && Array.isArray(item.photos) ? item.photos[0] : '')
  return String(raw || '').trim()
}

function mapInventoryItem(item) {
  return {
    ...item,
    id: getInventoryId(item),
    model: getModelName(item),
    grade: String(item?.conditionGrade || item?.grade || gradeOptions[0].value),
    price: Number(item?.price || 0),
    stock: Number(item?.stock || 0),
    imageUrl: getImageUrl(item),
  }
}

export default function InventoryManagementView() {
  const [inventory, setInventory] = useState([])
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddingStock, setIsAddingStock] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeActionId, setActiveActionId] = useState('')
  const [newStock, setNewStock] = useState({
    modelId: '',
    grade: gradeOptions[0].value,
    price: '',
    stock: 1,
  })

  const loadInventory = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [invRes, modelsRes] = await Promise.all([
        api.getInventory({ page: 1, limit: 200 }),
        api.getMobileModels({ page: 1, limit: 500 }),
      ])
      const inventoryRows = normalizeList(invRes).map(mapInventoryItem)
      const modelRows = normalizeList(modelsRes)
      setInventory(inventoryRows)
      setModels(modelRows)
      setNewStock((prev) => ({
        ...prev,
        modelId: prev.modelId || String(modelRows[0]?._id || modelRows[0]?.id || ''),
      }))
    } catch (e) {
      setError(e?.message || 'Could not load inventory')
      setInventory([])
      setModels([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  const updateLocalItem = useCallback((updated) => {
    const mapped = mapInventoryItem(updated)
    setInventory((prev) => prev.map((item) => (item.id === mapped.id ? { ...item, ...mapped } : item)))
  }, [])

  const handleUpdateStock = async (id, newStockValue) => {
    const nextStock = Math.max(0, Number(newStockValue) || 0)
    setActiveActionId(id)
    try {
      const updated = await api.patchInventoryStock(id, { stock: nextStock })
      updateLocalItem(updated)
    } catch (e) {
      alert(e?.message || 'Stock update failed')
    } finally {
      setActiveActionId('')
    }
  }

  const handleMarkSold = async (id) => {
    setActiveActionId(id)
    try {
      const updated = await api.patchInventoryMarkSold(id)
      updateLocalItem(updated)
    } catch (e) {
      alert(e?.message || 'Could not mark as sold')
    } finally {
      setActiveActionId('')
    }
  }

  const handleAddStock = async (e) => {
    e.preventDefault()
    if (!newStock.modelId) {
      alert('Please select a phone model')
      return
    }
    setSaving(true)
    try {
      const body = {
        modelId: newStock.modelId,
        conditionGrade: newStock.grade,
        price: Number(newStock.price),
        stock: Number(newStock.stock),
      }
      const created = await api.postInventory(body)
      setInventory((prev) => [mapInventoryItem(created), ...prev])
      setIsAddingStock(false)
      setNewStock({
        modelId: String(models[0]?._id || models[0]?.id || ''),
        grade: gradeOptions[0].value,
        price: '',
        stock: 1,
      })
    } catch (err) {
      alert(err?.message || 'Could not add stock')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Inventory</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage stock levels and prices.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadInventory()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={() => setIsAddingStock(true)} className="flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl px-5 py-2.5 text-sm font-black hover:bg-black shadow-md shadow-slate-200 transition">
            <Plus size={16} strokeWidth={3} /> Add Stock
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
      ) : null}

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest h-14">
                <th className="px-6 font-bold">Item ID</th>
                <th className="px-6 font-bold w-[35%]">Phone Model & Grade</th>
                <th className="px-6 font-bold">Sale Price</th>
                <th className="px-6 font-bold text-center">Available Stock</th>
                <th className="px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    Loading inventory...
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    No inventory items yet.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-black text-slate-900 text-sm">{item.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="h-10 w-10 rounded-lg border border-slate-200 object-cover bg-slate-100" />
                      ) : null}
                      <div className="font-bold text-slate-800 text-sm">{item.model || 'Unknown model'}</div>
                    </div>
                    <div className="font-black text-slate-400 text-[10px] uppercase tracking-wider mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100">{getGradeLabel(item.grade)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-black text-slate-900 text-sm">₹{item.price.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-max mx-auto shadow-sm">
                       <button disabled={activeActionId === item.id} onClick={() => handleUpdateStock(item.id, item.stock - 1)} className="text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-md p-1 transition disabled:opacity-40"><Minus size={14} strokeWidth={3}/></button>
                       <span className={`font-black text-sm w-4 text-center ${item.stock === 0 ? 'text-red-500' : 'text-slate-900'}`}>{item.stock}</span>
                       <button disabled={activeActionId === item.id} onClick={() => handleUpdateStock(item.id, item.stock + 1)} className="text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-md p-1 transition disabled:opacity-40"><Plus size={14} strokeWidth={3}/></button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button 
                      onClick={() => handleMarkSold(item.id)}
                      disabled={item.stock === 0 || activeActionId === item.id}
                      className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-sm ${item.stock > 0 ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-900' : 'bg-slate-100 text-slate-400 cursor-not-allowed border outline-none'}`}
                    >
                      {item.stock > 0 ? 'Mark Sold' : 'Out of Stock'}
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddingStock && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Package size={18} className="text-blue-600"/> Add New Device</h3>
               <button onClick={() => setIsAddingStock(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><Plus size={24} className="rotate-45"/></button>
            </div>
            <form onSubmit={handleAddStock} className="p-6 space-y-4">
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Phone Model</label>
                 <select
                   required
                   value={newStock.modelId}
                   onChange={(e) => setNewStock({ ...newStock, modelId: e.target.value })}
                   className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700 bg-white cursor-pointer transition-all"
                 >
                   <option value="">Select model</option>
                   {models.map((m) => {
                     const modelId = String(m._id || m.id || '')
                     return (
                       <option key={modelId} value={modelId}>
                         {m.modelName || m.name || modelId}
                       </option>
                     )
                   })}
                 </select>
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Condition Grade</label>
                 <select required value={newStock.grade} onChange={e=>setNewStock({...newStock, grade: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700 bg-white cursor-pointer transition-all">
                    {gradeOptions.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                 </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Sale Price (₹)</label>
                   <input required type="number" min="0" placeholder="0.00" value={newStock.price} onChange={e=>setNewStock({...newStock, price: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700 transition-all" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Initial Quantity</label>
                   <input required type="number" min="1" value={newStock.stock} onChange={e=>setNewStock({...newStock, stock: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700 bg-white transition-all" />
                 </div>
               </div>
               <div className="pt-4 flex justify-end gap-3 mt-2">
                 <button type="button" onClick={() => setIsAddingStock(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                 <button disabled={saving} type="submit" className="px-5 py-2.5 rounded-xl text-sm font-black bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition flex items-center gap-1.5 disabled:opacity-60"><CheckCircle size={16}/> {saving ? 'Saving...' : 'Save to Inventory'}</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
