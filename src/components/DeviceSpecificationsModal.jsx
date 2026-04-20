import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Edit2, Trash2 } from 'lucide-react'
import * as api from '../lib/api/baskaroApi.js'

const FIELD_TYPES = [
  { id: 'text', label: 'Text' },
  { id: 'number', label: 'Number' },
  { id: 'dropdown', label: 'Dropdown' },
  { id: 'boolean', label: 'Boolean' },
]

export default function DeviceSpecificationsModal({ open, onClose, device }) {
  const [specs, setSpecs] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [err, setErr] = React.useState('')
  const [ok, setOk] = React.useState('')
  const [editingId, setEditingId] = React.useState('')

  const [draft, setDraft] = React.useState({ name: '', type: 'text', isRequired: false, options: [''] })

  const canShowOptions = draft.type === 'dropdown'

  const load = React.useCallback(async () => {
    if (!device?.id) return
    setLoading(true)
    setErr('')
    setOk('')
    try {
      const res = await api.getDeviceSpecifications(device.id)
      setSpecs(Array.isArray(res) ? res : [])
    } catch (e) {
      setErr(e?.message || 'Failed to load specifications')
    } finally {
      setLoading(false)
    }
  }, [device?.id])

  React.useEffect(() => {
    if (!open) return
    load()
  }, [open, load])

  const onAddOptionRow = () => setDraft((p) => ({ ...p, options: [...p.options, ''] }))
  const onRemoveOptionRow = (idx) => setDraft((p) => ({ ...p, options: p.options.filter((_, i) => i !== idx) }))

  const startEdit = (s) => {
    setEditingId(s.id)
    setDraft({ name: s.name || '', type: s.type || 'text', isRequired: !!s.required, options: [''] })
  }
  const cancelEdit = () => {
    setEditingId('')
    setDraft({ name: '', type: 'text', isRequired: false, options: [''] })
  }

  const onDeleteSpec = async (specId) => {
    if (!window.confirm('Delete this specification?')) return
    setErr('')
    setOk('')
    try {
      await api.deleteDeviceSpecification(specId)
      await load()
      setOk('Specification deleted.')
      if (editingId === specId) cancelEdit()
    } catch (e) {
      setErr(e?.message || 'Failed to delete specification')
    }
  }

  const onDeleteOption = async (optionId) => {
    if (!window.confirm('Delete this option?')) return
    setErr('')
    setOk('')
    try {
      await api.deleteDeviceSpecificationOption(optionId)
      await load()
      setOk('Option deleted.')
    } catch (e) {
      setErr(e?.message || 'Failed to delete option')
    }
  }

  const onSave = async () => {
    setErr('')
    setOk('')
    if (!device?.id) return setErr('Device missing')
    const name = draft.name.trim()
    if (!name) return setErr('Specification name is required')

    const options = canShowOptions ? draft.options.map((o) => o.trim()).filter(Boolean) : []
    if (canShowOptions && options.length === 0) return setErr('Add at least one dropdown option')

    setSaving(true)
    try {
      const spec = editingId
        ? await api.patchDeviceSpecification(editingId, { name, type: draft.type, isRequired: !!draft.isRequired })
        : await api.postDeviceSpecification({ deviceId: device.id, name, type: draft.type, isRequired: !!draft.isRequired })

      if (canShowOptions) {
        for (const v of options) {
          // eslint-disable-next-line no-await-in-loop
          await api.postDeviceSpecificationOption({ specId: spec.id || editingId, value: v })
        }
      }

      cancelEdit()
      await load()
      setOk(editingId ? 'Specification updated.' : 'Specification created.')
    } catch (e) {
      setErr(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-lg font-black text-slate-900">Device Specifications</div>
                <div className="text-sm font-bold text-slate-400 mt-0.5">{device?.name || '—'}</div>
              </div>
              <button onClick={onClose} className="text-slate-300 hover:text-slate-600 transition-colors">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {(err || ok) && (
              <div className={`mx-6 mt-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${err ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                {err || ok}
              </div>
            )}

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="text-sm font-black text-slate-900">{editingId ? 'Edit Spec' : 'Create Spec'}</div>
                  {editingId && (
                    <button onClick={cancelEdit} className="text-xs font-black text-slate-600 hover:text-slate-900">Cancel</button>
                  )}
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Name</label>
                    <input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="e.g. Battery" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
                      <select value={draft.type} onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value, options: [''] }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer">
                        {FIELD_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={draft.isRequired} onChange={(e) => setDraft((p) => ({ ...p, isRequired: e.target.checked }))} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-black text-slate-700">Required</span>
                      </label>
                    </div>
                  </div>

                  {canShowOptions && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Options</div>
                        <button type="button" onClick={onAddOptionRow} className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition">+ Add</button>
                      </div>
                      <div className="space-y-2">
                        {draft.options.map((v, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input value={v} onChange={(e) => setDraft((p) => ({ ...p, options: p.options.map((o, i) => (i === idx ? e.target.value : o)) }))} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="e.g. 8GB" />
                            {draft.options.length > 1 && (
                              <button type="button" onClick={() => onRemoveOptionRow(idx)} className="h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:text-red-600 hover:border-red-100 hover:bg-red-50/20 transition-all shadow-sm" title="Remove">
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button type="button" disabled={saving} onClick={onSave} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-lg hover:bg-black transition disabled:opacity-60">
                    <Plus size={16} /> {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Spec'}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="text-sm font-black text-slate-900">Current Specs</div>
                  <button type="button" onClick={load} className="text-xs font-black text-slate-600 hover:text-slate-900">Refresh</button>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="text-sm font-semibold text-slate-500 animate-pulse">Loading…</div>
                  ) : specs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">
                      No specifications yet for this device.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {specs.map((s) => (
                        <div key={s.id} className="rounded-2xl border border-slate-100 bg-white p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-black text-slate-900 truncate">{s.name}</div>
                              <div className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {s.type} • {s.required ? 'Required' : 'Optional'} • key: {s.key}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => startEdit(s)} className="h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/20 transition-all shadow-sm" title="Edit">
                                <Edit2 size={14} />
                              </button>
                              <button type="button" onClick={() => onDeleteSpec(s.id)} className="h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:text-red-600 hover:border-red-100 hover:bg-red-50/20 transition-all shadow-sm" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          {s.type === 'dropdown' && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {(s.options || []).map((o) => {
                                const value = typeof o === 'string' ? o : o?.value
                                const id = typeof o === 'string' ? '' : o?.id
                                return (
                                  <span key={id || value} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-600">
                                    {value}
                                    {id && (
                                      <button type="button" onClick={() => onDeleteOption(id)} className="ml-1 h-5 w-5 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:border-red-100 transition flex items-center justify-center" title="Delete option">
                                        <X size={12} />
                                      </button>
                                    )}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

