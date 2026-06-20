import React, { useEffect, useMemo, useState } from 'react'
import { ListChecks, Plus, Trash2 } from 'lucide-react'
import DeviceSpecificationsModal from '../../../components/DeviceSpecificationsModal.jsx'
import ProductColorVariantsEditor from '../../../components/ProductColorVariantsEditor.jsx'
import {
  getOffersAdmin,
} from '../../../lib/api/baskaroApi.js'
import { loadMergedProductSpecs } from '../../../lib/loadMergedProductSpecs.js'
import {
  DEFAULT_MODEL_CONDITION_GRADES,
  MODEL_CONDITION_GRADES,
  normalizeModelConditionGrades,
} from '../../../lib/modelConditionGrades.js'

function renderSpecField(spec, value, onChange) {
  const label = (
    <label className="mb-1 block text-xs font-medium text-slate-600">
      {spec.name} {spec.required ? <span className="text-red-500">*</span> : null}
    </label>
  )

  if (spec.type === 'dropdown') {
    const opts = (spec.options || []).map((o) => (typeof o === 'string' ? o : o?.value)).filter(Boolean)
    return (
      <div key={spec.key}>
        {label}
        <select
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select</option>
          {opts.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (spec.type === 'number') {
    return (
      <div key={spec.key}>
        {label}
        <input
          type="number"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }

  if (spec.type === 'boolean') {
    return (
      <label key={spec.key} className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
        {spec.name}
        {spec.required ? <span className="text-red-500">*</span> : null}
      </label>
    )
  }

  return (
    <div key={spec.key}>
      {label}
      <input
        type="text"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export default function ProductExtrasTab({
  categoryId = '',
  ribbonCategoryId = '',
  deviceId = '',
  deviceName = '',
  productId = '',
  specifications = {},
  conditionGrades = DEFAULT_MODEL_CONDITION_GRADES,
  colorVariants = [],
  offersDraft = [],
  onSpecificationsChange,
  onConditionGradesChange,
  onColorVariantsChange,
  onOffersDraftChange,
  disabled = false,
}) {
  const [specs, setSpecs] = useState([])
  const [specsLoading, setSpecsLoading] = useState(false)
  const [offersLoading, setOffersLoading] = useState(false)
  const [specsModalDevice, setSpecsModalDevice] = useState(null)
  const [specReloadKey, setSpecReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    if (!categoryId && !ribbonCategoryId && !deviceId) {
      setSpecs([])
      return undefined
    }

    ;(async () => {
      setSpecsLoading(true)
      try {
        const merged = await loadMergedProductSpecs({ categoryId, ribbonCategoryId, deviceId })
        if (!cancelled) {
          setSpecs(merged)
          if (onSpecificationsChange) {
            onSpecificationsChange((prev) => {
              const next = { ...(prev || {}) }
              for (const sp of merged) {
                if (!(sp.key in next)) next[sp.key] = sp.type === 'boolean' ? false : ''
              }
              return next
            })
          }
        }
      } catch {
        if (!cancelled) setSpecs([])
      } finally {
        if (!cancelled) setSpecsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [categoryId, ribbonCategoryId, deviceId, specReloadKey])

  useEffect(() => {
    let cancelled = false
    if (!productId) return undefined

    ;(async () => {
      setOffersLoading(true)
      try {
        const res = await getOffersAdmin({ page: 1, limit: 200, productId })
        const items = res?.items ?? res?.data?.items ?? []
        if (!cancelled) {
          onOffersDraftChange?.(
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
        if (!cancelled) onOffersDraftChange?.([])
      } finally {
        if (!cancelled) setOffersLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [productId])

  const conditionList = useMemo(
    () => normalizeModelConditionGrades(conditionGrades),
    [conditionGrades],
  )

  const updateSpecValue = (key, value) => {
    onSpecificationsChange?.((prev) => ({ ...(prev || {}), [key]: value }))
  }

  const toggleCondition = (grade) => {
    onConditionGradesChange?.((prev) => {
      const list = normalizeModelConditionGrades(prev)
      const selected = list.includes(grade)
      const next = selected ? list.filter((g) => g !== grade) : [...list, grade]
      return normalizeModelConditionGrades(next)
    })
  }

  const addOffer = () => {
    onOffersDraftChange?.((prev) => {
      const active = (prev || []).filter((x) => !x?._deleted)
      const maxSort = active.reduce((m, x) => Math.max(m, Number(x?.sortOrder) || 0), -1)
      return [
        ...(prev || []),
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

  const updateOffer = (idx, patch) => {
    onOffersDraftChange?.((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
  }

  const removeOffer = (idx) => {
    onOffersDraftChange?.((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, _deleted: true } : row)),
    )
  }

  return (
    <div className="space-y-6">
      {deviceId ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Device specification fields</p>
            <p className="text-xs text-slate-500">
              Manage master spec fields for <span className="font-medium">{deviceName || 'selected device'}</span>.
            </p>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setSpecsModalDevice({ id: deviceId, name: deviceName || 'Device' })}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <ListChecks size={14} />
            Device Specifications
          </button>
        </div>
      ) : null}

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Technical Specifications</h3>
          <p className="text-xs text-slate-500">
            Values shown on the product page. Fields come from device specs, category templates, and catalog attributes.
          </p>
        </div>
        {!categoryId ? (
          <p className="text-xs text-slate-500">Select a category on the General tab first.</p>
        ) : specsLoading ? (
          <p className="text-xs text-slate-500">Loading specifications…</p>
        ) : specs.length === 0 ? (
          <p className="text-xs text-slate-500">
            No spec fields yet. Add device specifications, category attributes, or sync from All Categories.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {specs.map((spec) =>
              renderSpecField(spec, specifications?.[spec.key], (value) => updateSpecValue(spec.key, value)),
            )}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Available Conditions</h3>
          <p className="text-xs text-slate-500">Choose which conditions appear on the product page.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {MODEL_CONDITION_GRADES.map((grade) => {
            const selected = conditionList.includes(grade)
            return (
              <button
                key={grade}
                type="button"
                disabled={disabled}
                onClick={() => toggleCondition(grade)}
                className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${
                  selected
                    ? 'border-green-600 bg-green-50 text-green-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {grade}
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Color Variants</h3>
        <ProductColorVariantsEditor
          variants={colorVariants}
          onChange={onColorVariantsChange}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Offers (per product)</h3>
            <p className="text-xs text-slate-500">Marketing offers shown on the product details page.</p>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={addOffer}
            className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black disabled:opacity-50"
          >
            <Plus size={14} />
            Add offer
          </button>
        </div>

        {offersLoading ? (
          <p className="text-xs text-slate-500">Loading offers…</p>
        ) : (offersDraft || []).filter((o) => !o?._deleted).length === 0 ? (
          <p className="text-xs text-slate-500">No offers added for this product yet.</p>
        ) : (
          <div className="space-y-3">
            {(offersDraft || []).map((offer, idx) => {
              if (offer?._deleted) return null
              return (
                <div key={offer?._id || idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Title</label>
                      <input
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={offer.title}
                        disabled={disabled}
                        onChange={(e) => updateOffer(idx, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Code</label>
                      <input
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
                        value={offer.code}
                        disabled={disabled}
                        onChange={(e) => updateOffer(idx, { code: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
                    <input
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      value={offer.desc}
                      disabled={disabled}
                      onChange={(e) => updateOffer(idx, { desc: e.target.value })}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={offer.isActive !== false}
                        disabled={disabled}
                        onChange={(e) => updateOffer(idx, { isActive: e.target.checked })}
                      />
                      Active
                    </label>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => removeOffer(idx)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <DeviceSpecificationsModal
        open={Boolean(specsModalDevice)}
        device={specsModalDevice}
        onClose={() => {
          setSpecsModalDevice(null)
          setSpecReloadKey((k) => k + 1)
        }}
      />
    </div>
  )
}
