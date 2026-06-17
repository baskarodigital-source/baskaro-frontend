import React from 'react'
import FormField from '../components/FormField.jsx'
import AttributeMediaUpload from '../attributes/AttributeMediaUpload.jsx'

function getAttrId(attr) {
  return String(attr?._id || attr?.id || '')
}

function readVariantAttrValue(variant, attribute) {
  const attrId = getAttrId(attribute)
  const list = Array.isArray(variant?.attributes) ? variant.attributes : []
  const found = list.find((row) => String(row?.attributeId || '') === attrId)
  return found?.value ?? ''
}

function writeVariantAttrValue(variant, attribute, value) {
  const attrId = getAttrId(attribute)
  const list = Array.isArray(variant?.attributes) ? [...variant.attributes] : []
  const idx = list.findIndex((row) => String(row?.attributeId || '') === attrId)
  const row = {
    attributeId: attrId,
    code: attribute?.code || '',
    name: attribute?.name || '',
    value,
  }
  if (idx >= 0) list[idx] = row
  else list.push(row)
  return { ...variant, attributes: list }
}

function displayNumber(value) {
  if (value === '' || value === null || value === undefined) return ''
  return String(value)
}

function parseNumberField(raw) {
  const text = String(raw ?? '').trim()
  if (text === '') return ''
  const n = Number(text)
  return Number.isFinite(n) ? n : ''
}

export default function VariantBuilder({ variants = [], variantAttributes = [], onChange }) {
  const updateRow = (index, patch) => {
    const next = [...variants]
    next[index] = { ...next[index], ...patch }
    onChange?.(next)
  }

  const addVariant = () => {
    onChange?.([
      ...variants,
      {
        sku: '',
        title: '',
        condition: '',
        attributes: [],
        price: '',
        compareAtPrice: '',
        stock: '',
        images: [],
        isDefault: variants.length === 0,
        isActive: true,
      },
    ])
  }

  const removeVariant = (index) => {
    const next = variants.filter((_, i) => i !== index)
    onChange?.(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Variants</p>
        <button type="button" className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700" onClick={addVariant}>Add variant</button>
      </div>

      {variants.map((variant, idx) => (
        <div key={idx} className="space-y-2 rounded-lg border border-slate-200 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Variant {idx + 1}</p>
          <div className="grid gap-2 md:grid-cols-3">
            <FormField label="SKU" htmlFor={`variant-sku-${idx}`}>
              <input
                id={`variant-sku-${idx}`}
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                placeholder="SKU-001"
                value={variant.sku || ''}
                onChange={(e) => updateRow(idx, { sku: e.target.value })}
              />
            </FormField>
            <FormField label="Title" htmlFor={`variant-title-${idx}`}>
              <input
                id={`variant-title-${idx}`}
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                placeholder="128 GB Black"
                value={variant.title || ''}
                onChange={(e) => updateRow(idx, { title: e.target.value })}
              />
            </FormField>
            <FormField label="Condition" htmlFor={`variant-condition-${idx}`}>
              <input
                id={`variant-condition-${idx}`}
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                placeholder="New / Superb"
                value={variant.condition || ''}
                onChange={(e) => updateRow(idx, { condition: e.target.value })}
              />
            </FormField>
            <FormField label="Price (₹)" htmlFor={`variant-price-${idx}`}>
              <input
                id={`variant-price-${idx}`}
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter price"
                value={displayNumber(variant.price)}
                onChange={(e) => updateRow(idx, { price: parseNumberField(e.target.value) })}
              />
            </FormField>
            <FormField label="Compare-at price (₹)" htmlFor={`variant-compare-price-${idx}`}>
              <input
                id={`variant-compare-price-${idx}`}
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                type="number"
                min="0"
                step="0.01"
                placeholder="Optional"
                value={displayNumber(variant.compareAtPrice)}
                onChange={(e) => updateRow(idx, { compareAtPrice: parseNumberField(e.target.value) })}
              />
            </FormField>
            <FormField label="Stock" htmlFor={`variant-stock-${idx}`}>
              <input
                id={`variant-stock-${idx}`}
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={displayNumber(variant.stock)}
                onChange={(e) => updateRow(idx, { stock: parseNumberField(e.target.value) })}
              />
            </FormField>
            <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={Boolean(variant.isDefault)} onChange={(e) => updateRow(idx, { isDefault: e.target.checked })} />Default</label>
            <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={variant.isActive !== false} onChange={(e) => updateRow(idx, { isActive: e.target.checked })} />Active</label>
            <button type="button" className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-600" onClick={() => removeVariant(idx)}>Remove</button>
          </div>

          {variantAttributes.length > 0 && (
            <div className="grid gap-2 md:grid-cols-2">
              {variantAttributes.map((attr) => {
                const attrId = getAttrId(attr)
                const current = readVariantAttrValue(variant, attr)
                const label = attr?.name || 'Attribute'
                const options = Array.isArray(attr?.values) ? attr.values : []
                const usesPredefined = attr?.type === 'select' || attr?.type === 'multiselect'

                if (attr?.type === 'media') {
                  return (
                    <div key={attrId} className="md:col-span-2">
                      <AttributeMediaUpload
                        inputId={`variant-attr-media-${attrId}-${idx}`}
                        label={label}
                        value={current}
                        onChange={(next) => {
                          const nextVariants = [...variants]
                          nextVariants[idx] = writeVariantAttrValue(nextVariants[idx], attr, next)
                          onChange?.(nextVariants)
                        }}
                      />
                    </div>
                  )
                }

                if (usesPredefined) {
                  return (
                    <div key={attrId}>
                      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
                      <select
                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                        value={current}
                        onChange={(e) => {
                          const next = [...variants]
                          next[idx] = writeVariantAttrValue(next[idx], attr, e.target.value)
                          onChange?.(next)
                        }}
                      >
                        <option value="">Select {label}</option>
                        {options.map((opt, optIdx) => (
                          <option key={`${attrId}-${optIdx}`} value={opt?.value || ''}>
                            {opt?.label || opt?.value || 'Option'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                }

                return (
                  <div key={attrId}>
                    <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      type={attr?.type === 'number' ? 'number' : 'text'}
                      placeholder={`${label} for this variant`}
                      value={current}
                      onChange={(e) => {
                        const next = [...variants]
                        next[idx] = writeVariantAttrValue(next[idx], attr, e.target.value)
                        onChange?.(next)
                      }}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}

      {!variants.length && <div className="rounded border border-dashed border-slate-300 p-3 text-sm text-slate-500">No variants yet. Add at least one variant.</div>}
    </div>
  )
}
