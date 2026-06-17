// @ts-nocheck
// Helpers live in src/lib/productFormHelpers.js (do not duplicate them here).
import React, { useEffect, useMemo, useState } from 'react'
import { getAttributes, getBrandDevices, getMobileBrands } from '../../../lib/api/baskaroApi.js'
import { appAlert } from '../../../lib/appDialog.js'
import FormField from '../components/FormField.jsx'
import MediaUpload from './MediaUpload.jsx'
import SeoTab from './SeoTab.jsx'
import VariantBuilder from './VariantBuilder.jsx'
import AttributeMediaUpload from '../attributes/AttributeMediaUpload.jsx'
import {
  clearProductFormErrors,
  getBrandSelectPlaceholder,
  getDeviceSelectPlaceholder,
  patchProductForm,
  setProductFormField,
} from '../../../lib/productFormHelpers.js'

const initialSeo = { title: '', description: '', keywords: '' }

function createEmptyForm() {
  return {
    name: '',
    slug: '',
    sku: '',
    description: '',
    category: '',
    brandId: '',
    deviceId: '',
    tagsText: '',
    attributes: [],
    images: [],
    variants: [],
    seo: { ...initialSeo },
    isFeatured: false,
    isActive: true,
  }
}

function flattenCategories(categories = []) {
  const out = []
  const walk = (nodes = [], prefix = '') => {
    nodes.forEach((node) => {
      const id = node?._id || node?.id
      if (id) {
        out.push({
          id: String(id),
          label: `${prefix}${node?.name || 'Untitled'}`,
          ribbonCategoryId: node?.ribbonCategoryId
            ? String(node.ribbonCategoryId)
            : '',
        })
      }
      if (Array.isArray(node?.children)) walk(node.children, `${prefix}- `)
    })
  }
  walk(categories)
  return out
}

function refId(value) {
  if (!value) return ''
  if (typeof value === 'object') return String(value._id || value.id || '')
  return String(value)
}

// Helpers are imported from ../../../lib/productFormHelpers.js (do not duplicate here).

export default function ProductForm({
  mode = 'create',
  initialValue = null,
  categories = [],
  saving = false,
  onSubmit,
  onCancel,
}) {
  const [tab, setTab] = useState('general')
  const [errors, setErrors] = useState({})
  const [categoryAttributes, setCategoryAttributes] = useState([])
  const [attributesLoading, setAttributesLoading] = useState(false)
  const [brands, setBrands] = useState([])
  const [brandsLoading, setBrandsLoading] = useState(false)
  const [devices, setDevices] = useState([])
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [form, setForm] = useState(() => createEmptyForm())

  useEffect(() => {
    if (!initialValue) {
      setForm(createEmptyForm())
      setErrors({})
      setTab('general')
      return
    }
    const categoryId = refId(initialValue.category)
    setForm({
      name: initialValue.name || '',
      slug: initialValue.slug || '',
      sku: initialValue.sku || '',
      description: initialValue.description || initialValue.shortDescription || '',
      category: categoryId,
      brandId: refId(initialValue.brandId),
      deviceId: refId(initialValue.deviceId),
      tagsText: Array.isArray(initialValue.tags) ? initialValue.tags.join(', ') : '',
      attributes: Array.isArray(initialValue.attributes) ? initialValue.attributes : [],
      images: Array.isArray(initialValue.images) ? initialValue.images : [],
      variants: Array.isArray(initialValue.variants) ? initialValue.variants : [],
      seo: {
        title: initialValue?.seo?.title || '',
        description: initialValue?.seo?.description || '',
        keywords: Array.isArray(initialValue?.seo?.keywords) ? initialValue.seo.keywords.join(', ') : '',
      },
      isFeatured: Boolean(initialValue.isFeatured),
      isActive: initialValue.isActive !== false,
    })
  }, [initialValue])

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories])

  const selectedCategoryOption = useMemo(
    () => categoryOptions.find((opt) => opt.id === String(form.category || '')) || null,
    [categoryOptions, form.category],
  )

  const ribbonCategoryId = selectedCategoryOption?.ribbonCategoryId || ''

  useEffect(() => {
    const categoryId = String(form.category || '').trim()
    if (!categoryId) {
      setCategoryAttributes([])
      return
    }

    let active = true
    ;(async () => {
      setAttributesLoading(true)
      try {
        const list = await getAttributes({
          includeInactive: 'false',
          categoryId,
        })
        if (!active) return
        setCategoryAttributes(Array.isArray(list) ? list : [])
      } catch (e) {
        if (active) {
          setCategoryAttributes([])
          appAlert(e?.message || 'Could not load attributes for this category')
        }
      } finally {
        if (active) setAttributesLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [form.category])

  useEffect(() => {
    if (!ribbonCategoryId) {
      setBrands([])
      return
    }

    let active = true
    ;(async () => {
      setBrandsLoading(true)
      try {
        const res = await getMobileBrands({ ribbonCategoryId, limit: 200, active: true })
        const items = res?.items || (Array.isArray(res) ? res : [])
        if (!active) return
        setBrands(
          items
            .map((b) => ({
              id: String(b?._id || b?.id || ''),
              name: b?.name || '',
            }))
            .filter((b) => b.id && b.name),
        )
      } catch (e) {
        if (active) {
          setBrands([])
          appAlert(e?.message || 'Could not load brands for this category')
        }
      } finally {
        if (active) setBrandsLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [ribbonCategoryId])

  useEffect(() => {
    const brandId = String(form.brandId || '').trim()
    if (!brandId) {
      setDevices([])
      return
    }

    let active = true
    ;(async () => {
      setDevicesLoading(true)
      try {
        const res = await getBrandDevices({ brandId, limit: 200, active: true })
        const items = res?.items || (Array.isArray(res) ? res : [])
        if (!active) return
        setDevices(
          items
            .map((d) => ({
              id: String(d?._id || d?.id || ''),
              name: d?.name || '',
            }))
            .filter((d) => d.id && d.name),
        )
      } catch (e) {
        if (active) {
          setDevices([])
          appAlert(e?.message || 'Could not load devices for this brand')
        }
      } finally {
        if (active) setDevicesLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [form.brandId])

  const productAttributes = useMemo(
    () =>
      categoryAttributes.filter((attr) => !attr?.isVariantAxis && attr?.showOnProduct !== false),
    [categoryAttributes],
  )
  const variantAttributes = useMemo(
    () => categoryAttributes.filter((attr) => Boolean(attr?.isVariantAxis)),
    [categoryAttributes],
  )

  const updateProductAttributeValue = (attribute, value) => {
    const attrId = String(attribute?._id || attribute?.id || '')
    setForm((prev) => {
      const current = Array.isArray(prev.attributes) ? [...prev.attributes] : []
      const idx = current.findIndex((row) => String(row?.attributeId || '') === attrId)
      const nextRow = {
        attributeId: attrId,
        code: attribute?.code || '',
        name: attribute?.name || '',
        value,
      }
      if (idx >= 0) current[idx] = nextRow
      else current.push(nextRow)
      return { ...prev, attributes: current }
    })
  }

  const renderAttributeField = (attr, value, onChange) => {
    const attrId = String(attr?._id || attr?.id || '')
    const label = attr?.name || 'Attribute'

    if (attr?.type === 'boolean') {
      return (
        <label key={attrId} className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={value === true || value === 'true'}
            onChange={(e) => onChange(e.target.checked)}
          />
          {label}
        </label>
      )
    }

    if (attr?.type === 'select' || attr?.type === 'multiselect') {
      const options = Array.isArray(attr?.values) ? attr.values : []
      return (
        <div key={attrId}>
          <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select {label}</option>
            {options.map((opt, idx) => (
              <option key={`${attrId}-${idx}`} value={opt?.value || ''}>
                {opt?.label || opt?.value || 'Option'}
              </option>
            ))}
          </select>
        </div>
      )
    }

    if (attr?.type === 'media') {
      return (
        <AttributeMediaUpload
          key={attrId}
          inputId={`product-attr-media-${attrId}`}
          label={label}
          value={value}
          onChange={onChange}
          disabled={saving}
        />
      )
    }

    return (
      <div key={attrId}>
        <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          type={attr?.type === 'number' ? 'number' : 'text'}
          placeholder={`Enter ${label.toLowerCase()} for this product`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }

  const submit = (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (!String(form.category || '').trim()) nextErrors.category = 'Category is required.'
    if (!String(form.brandId || '').trim()) nextErrors.brandId = 'Brand is required.'
    if (!String(form.deviceId || '').trim()) nextErrors.deviceId = 'Device is required.'
    if (!String(form.name || '').trim()) nextErrors.name = 'Product name is required.'
    if (form.category && !ribbonCategoryId) {
      nextErrors.category =
        'This category is not linked to All Categories. Sync categories first, then pick a linked category.'
    }
    const variantRows = Array.isArray(form.variants) ? form.variants : []
    const validVariants = variantRows.filter((v) => {
      if (v?.price === '' || v?.price === null || v?.price === undefined) return false
      const price = Number(v.price)
      return Number.isFinite(price) && price >= 0
    })
    if (validVariants.length === 0) nextErrors.variants = 'At least one variant with a valid price is required.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      if (nextErrors.variants) setTab('variants')
      else setTab('general')
      return
    }

    setErrors({})
    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      sku: form.sku || undefined,
      description: form.description,
      shortDescription: form.description,
      category: form.category,
      brandId: form.brandId,
      deviceId: form.deviceId,
      tags: String(form.tagsText || '').split(',').map((x) => x.trim()).filter(Boolean),
      attributes: Array.isArray(form.attributes) ? form.attributes : [],
      images: Array.isArray(form.images) ? form.images : [],
      variants: variantRows.map((v) => ({
        ...v,
        price: Number(v.price),
        compareAtPrice:
          v.compareAtPrice === '' || v.compareAtPrice == null ? undefined : Number(v.compareAtPrice),
        stock: v.stock === '' || v.stock == null ? 0 : Number(v.stock),
      })),
      seo: {
        title: form.seo.title || '',
        description: form.seo.description || '',
        keywords: String(form.seo.keywords || '').split(',').map((x) => x.trim()).filter(Boolean),
      },
      isFeatured: Boolean(form.isFeatured),
      isActive: Boolean(form.isActive),
    }
    onSubmit?.(payload)
  }

  const renderCategoryAttributesSection = () => {
    if (!form.category) return null

    let body = null
    if (attributesLoading) {
      body = <p className="text-xs text-slate-500">Loading attributes...</p>
    } else if (productAttributes.length === 0) {
      body = (
        <p className="text-xs text-slate-500">
          No product-level attributes for this category yet. Add text, number, or media fields in
          the Attributes tab and link them to this category.
        </p>
      )
    } else {
      body = (
        <div className="grid gap-3 md:grid-cols-2">
          {productAttributes.map((attr) => {
            const attrId = String(attr?._id || attr?.id || '')
            const existing = (form.attributes || []).find(
              (row) => String(row?.attributeId || '') === attrId,
            )
            const value =
              attr?.type === 'media' ? (existing?.value ?? []) : (existing?.value ?? '')

            return renderAttributeField(attr, value, (nextValue) =>
              updateProductAttributeValue(attr, nextValue),
            )
          })}
        </div>
      )
    }

    return (
      <div className="md:col-span-2 space-y-2">
        <p className="text-sm font-semibold text-slate-700">Category attributes</p>
        {body}
      </div>
    )
  }

  const submitLabel = (() => {
    if (saving) return 'Saving...'
    if (mode === 'edit') return 'Update product'
    return 'Create product'
  })()

  const renderActiveTab = () => {
    if (tab === 'general') {
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Category" htmlFor="product-category" className="md:col-span-2" required error={errors.category}>
            <select
              id="product-category"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => {
                patchProductForm(setForm, { category: e.target.value, brandId: '', deviceId: '' })
                clearProductFormErrors(setErrors, ['category', 'brandId', 'deviceId'])
              }}
              required
            >
              <option value="">1. Select category</option>
              {categoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            {form.category && !ribbonCategoryId ? (
              <p className="mt-1 text-xs text-amber-700">
                Not linked to All Categories - use Sync on the Categories tab or create the category from All Categories first.
              </p>
            ) : null}
          </FormField>

          <FormField label="Brand" htmlFor="product-brand" required error={errors.brandId}>
            <select
              id="product-brand"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.brandId}
              disabled={!ribbonCategoryId || brandsLoading}
              onChange={(e) => {
                patchProductForm(setForm, { brandId: e.target.value, deviceId: '' })
                clearProductFormErrors(setErrors, ['brandId', 'deviceId'])
              }}
              required
            >
              <option value="">
                {getBrandSelectPlaceholder({
                  category: form.category,
                  ribbonCategoryId,
                  brandsLoading,
                })}
              </option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Device" htmlFor="product-device" required error={errors.deviceId}>
            <select
              id="product-device"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.deviceId}
              disabled={!form.brandId || devicesLoading}
              onChange={(e) => {
                setProductFormField(setForm, 'deviceId', e.target.value)
                clearProductFormErrors(setErrors, 'deviceId')
              }}
              required
            >
              <option value="">
                {getDeviceSelectPlaceholder({
                  brandId: form.brandId,
                  devicesLoading,
                })}
              </option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Product name" htmlFor="product-name" className="md:col-span-2" required error={errors.name}>
            <input
              id="product-name"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. iPhone 15 Pro"
              value={form.name}
              onChange={(e) => {
                setProductFormField(setForm, 'name', e.target.value)
                clearProductFormErrors(setErrors, 'name')
              }}
              required
            />
          </FormField>

          <FormField label="Slug" htmlFor="product-slug" hint="Optional - auto-generated if empty">
            <input
              id="product-slug"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="iphone-15-pro"
              value={form.slug}
              onChange={(e) => setProductFormField(setForm, 'slug', e.target.value)}
            />
          </FormField>
          <FormField label="SKU" htmlFor="product-sku">
            <input
              id="product-sku"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Base product SKU"
              value={form.sku}
              onChange={(e) => setProductFormField(setForm, 'sku', e.target.value)}
            />
          </FormField>

          {renderCategoryAttributesSection()}
          <FormField label="Tags" htmlFor="product-tags" className="md:col-span-2" hint="Comma separated">
            <input
              id="product-tags"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="iphone, apple, flagship"
              value={form.tagsText}
              onChange={(e) => setProductFormField(setForm, 'tagsText', e.target.value)}
            />
          </FormField>
          <FormField label="Description" htmlFor="product-description" className="md:col-span-2">
            <textarea
              id="product-description"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={4}
              placeholder="Full product details"
              value={form.description}
              onChange={(e) => setProductFormField(setForm, 'description', e.target.value)}
            />
          </FormField>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setProductFormField(setForm, 'isFeatured', e.target.checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setProductFormField(setForm, 'isActive', e.target.checked)}
            />
            Active
          </label>
        </div>
      )
    }

    if (tab === 'media') {
      return (
        <MediaUpload
          images={form.images}
          onChange={(images) => setProductFormField(setForm, 'images', images)}
          disabled={saving}
        />
      )
    }

    if (tab === 'variants') {
      return (
        <div className="space-y-2">
          <VariantBuilder
            variants={form.variants}
            onChange={(variants) => {
              setProductFormField(setForm, 'variants', variants)
              clearProductFormErrors(setErrors, 'variants')
            }}
            variantAttributes={variantAttributes}
          />
          {errors.variants ? <p className="text-xs text-red-600">{errors.variants}</p> : null}
        </div>
      )
    }

    if (tab === 'seo') {
      return (
        <SeoTab
          value={form.seo}
          onChange={(seo) => setProductFormField(setForm, 'seo', seo)}
        />
      )
    }

    return null
  }

  const renderFormFooter = () => (
    <div className="flex gap-2">
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
      >
        Cancel
      </button>
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm">
        {['general', 'media', 'variants', 'seo'].map((name) => (
          <button
            key={name}
            type="button"
            className={`rounded-md px-3 py-1 capitalize ${tab === name ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {renderActiveTab()}
      {renderFormFooter()}
    </form>
  )
}
