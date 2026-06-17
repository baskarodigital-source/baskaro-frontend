import React, { useEffect, useMemo, useState } from 'react'
import FormField from '../components/FormField.jsx'
import MultiSelectDropdown from '../components/MultiSelectDropdown.jsx'

const TYPE_OPTIONS = [
  { value: 'text', label: 'text - custom value per product' },
  { value: 'number', label: 'number - custom number per product' },
  { value: 'boolean', label: 'boolean - yes/no per product' },
  { value: 'media', label: 'media - upload images and videos (multi-upload)' },
  { value: 'select', label: 'select - same predefined options for all products' },
  { value: 'multiselect', label: 'multiselect - predefined multi-select' },
]

function toValueRows(values) {
  if (!Array.isArray(values)) return [{ label: '', value: '' }]
  if (!values.length) return [{ label: '', value: '' }]
  return values.map((v) => ({ label: v?.label || '', value: v?.value || '' }))
}

export default function AttributeForm({
  mode = 'create',
  initialValue = null,
  categories = [],
  saving = false,
  onSubmit,
  onCancel,
}) {
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: '',
    code: '',
    type: 'text',
    categories: [],
    values: [{ label: '', value: '' }],
    isRequired: false,
    isVariantAxis: false,
    useInFilter: true,
    showOnProduct: true,
    sortOrder: 0,
    isActive: true,
  })

  useEffect(() => {
    if (!initialValue) return
    setForm({
      name: initialValue.name || '',
      code: initialValue.code || '',
      type: initialValue.type || 'select',
      categories: Array.isArray(initialValue.categories) ? initialValue.categories.map((c) => String(c)) : [],
      values: toValueRows(initialValue.values),
      isRequired: Boolean(initialValue.isRequired),
      isVariantAxis: Boolean(initialValue.isVariantAxis),
      useInFilter: initialValue.useInFilter !== false,
      showOnProduct: initialValue.showOnProduct !== false,
      sortOrder: Number(initialValue.sortOrder) || 0,
      isActive: initialValue.isActive !== false,
    })
  }, [initialValue])

  const categoryOptions = useMemo(() => {
    const out = []
    const walk = (list = [], prefix = '') => {
      list.forEach((item) => {
        const id = item?._id || item?.id
        if (id) out.push({ id: String(id), label: `${prefix}${item?.name || 'Untitled'}` })
        if (Array.isArray(item?.children)) walk(item.children, `${prefix}- `)
      })
    }
    walk(categories)
    return out
  }, [categories])

  const submit = (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (!String(form.name || '').trim()) nextErrors.name = 'Attribute name is required.'
    if (!Array.isArray(form.categories) || form.categories.length === 0) {
      nextErrors.categories = 'Select at least one category.'
    }
    const values = (form.values || [])
      .map((row) => ({ label: String(row.label || '').trim(), value: String(row.value || '').trim() }))
      .filter((row) => row.label && row.value)
    if ((form.type === 'select' || form.type === 'multiselect') && values.length === 0) {
      nextErrors.values = 'Add at least one option value.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    const payload = {
      ...form,
      sortOrder: Number(form.sortOrder) || 0,
      values,
    }
    onSubmit?.(payload)
  }

  const usesPredefinedValues = form.type === 'select' || form.type === 'multiselect'

  const addValueRow = () => {
    setForm((prev) => ({ ...prev, values: [...prev.values, { label: '', value: '' }] }))
  }

  const updateValueRow = (idx, field, nextValue) => {
    setForm((prev) => {
      const next = [...prev.values]
      next[idx] = { ...next[idx], [field]: nextValue }
      return { ...prev, values: next }
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <FormField label="Attribute name" htmlFor="attribute-name" required error={errors.name}>
          <input
            id="attribute-name"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. Storage"
            value={form.name}
            onChange={(e) => {
              setForm((p) => ({ ...p, name: e.target.value }))
              setErrors((p) => ({ ...p, name: '' }))
            }}
            required
          />
        </FormField>
        <FormField label="Attribute code" htmlFor="attribute-code">
          <input
            id="attribute-code"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="storage"
            value={form.code}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
          />
        </FormField>

        <FormField label="Type" htmlFor="attribute-type">
          <select
            id="attribute-type"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
          >
            {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </FormField>

        <FormField label="Sort order" htmlFor="attribute-sort-order">
          <input
            id="attribute-sort-order"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            type="number"
            placeholder="0"
            value={form.sortOrder}
            onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
          />
        </FormField>

        <FormField
          label="Categories"
          htmlFor="attribute-categories"
          className="md:col-span-2"
          required
          error={errors.categories}
          hint="Click to open dropdown — select one or more categories"
        >
          <MultiSelectDropdown
            id="attribute-categories"
            options={categoryOptions}
            value={form.categories}
            placeholder="Select categories"
            searchPlaceholder="Search categories..."
            emptyText="No categories found"
            disabled={saving}
            onChange={(selected) => {
              setForm((p) => ({ ...p, categories: selected }))
              setErrors((p) => ({ ...p, categories: '' }))
            }}
          />
        </FormField>
      </div>

      {!usesPredefinedValues && form.type !== 'media' && (
        <p className="text-xs text-emerald-700">
          No predefined values needed — you will fill this on each product in the Products tab.
        </p>
      )}

      {form.type === 'media' && (
        <p className="text-xs text-emerald-700">
          No predefined values needed — admins can multi-upload images and videos on each product.
        </p>
      )}

      {usesPredefinedValues && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Predefined options (same for all products)</p>
          {form.values.map((row, idx) => (
            <div key={idx} className="grid gap-2 md:grid-cols-2">
              <FormField label="Label" htmlFor={`attribute-value-label-${idx}`}>
                <input
                  id={`attribute-value-label-${idx}`}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="128 GB"
                  value={row.label}
                  onChange={(e) => updateValueRow(idx, 'label', e.target.value)}
                />
              </FormField>
              <FormField label="Value" htmlFor={`attribute-value-code-${idx}`}>
                <input
                  id={`attribute-value-code-${idx}`}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="128gb"
                  value={row.value}
                  onChange={(e) => updateValueRow(idx, 'value', e.target.value)}
                />
              </FormField>
            </div>
          ))}
          <button
            type="button"
            className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700"
            onClick={addValueRow}
          >
            Add value
          </button>
          {errors.values && <p className="text-xs text-red-600">{errors.values}</p>}
        </div>
      )}

      <div className="grid gap-2 md:grid-cols-3">
        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.isRequired} onChange={(e) => setForm((p) => ({ ...p, isRequired: e.target.checked }))} />Required</label>
        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.isVariantAxis} onChange={(e) => setForm((p) => ({ ...p, isVariantAxis: e.target.checked }))} />Variant axis</label>
        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.useInFilter} onChange={(e) => setForm((p) => ({ ...p, useInFilter: e.target.checked }))} />Use in filter</label>
        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.showOnProduct} onChange={(e) => setForm((p) => ({ ...p, showOnProduct: e.target.checked }))} />Show on product</label>
        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />Active</label>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving...' : mode === 'edit' ? 'Update attribute' : 'Create attribute'}</button>
        <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Cancel</button>
      </div>
    </form>
  )
}
