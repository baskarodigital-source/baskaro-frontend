import React, { useEffect, useMemo, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { appAlert } from '../../../lib/appDialog.js'
import { STORE_IMAGE_FOLDERS, uploadStoreImageFile } from '../../../lib/storeImageUpload.js'
import FormField from '../components/FormField.jsx'
import SeoTab from './SeoTab.jsx'

const initialSeo = { title: '', description: '', keywords: '' }

const emptyForm = {
  name: '',
  slug: '',
  parent: '',
  icon: '',
  image: '',
  sortOrder: 0,
  isActive: true,
  seo: initialSeo,
}

export default function CategoryForm({
  mode = 'create',
  initialValue = null,
  allCategories = [],
  saving = false,
  onSubmit,
  onCancel,
}) {
  const [tab, setTab] = useState('general')
  const [errors, setErrors] = useState({})
  const [imageUploading, setImageUploading] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!initialValue) {
      setForm(emptyForm)
      setErrors({})
      setTab('general')
      return
    }
    setForm({
      name: initialValue.name || '',
      slug: initialValue.slug || '',
      parent: initialValue.parent || '',
      icon: initialValue.icon || '',
      image: initialValue.image || '',
      sortOrder: Number(initialValue.sortOrder) || 0,
      isActive: initialValue.isActive !== false,
      seo: {
        title: initialValue?.seo?.title || '',
        description: initialValue?.seo?.description || '',
        keywords: Array.isArray(initialValue?.seo?.keywords)
          ? initialValue.seo.keywords.join(', ')
          : '',
      },
    })
  }, [initialValue])

  const parentOptions = useMemo(() => {
    const flatten = []
    const walk = (items = [], prefix = '') => {
      items.forEach((item) => {
        const id = item?._id || item?.id
        flatten.push({ id, label: `${prefix}${item?.name || 'Untitled'}` })
        if (Array.isArray(item?.children) && item.children.length) {
          walk(item.children, `${prefix}- `)
        }
      })
    }
    walk(allCategories)
    return flatten
  }, [allCategories])

  const submit = (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (!String(form.name || '').trim()) nextErrors.name = 'Category name is required.'
    if (form.icon && !/^https?:\/\/|^data:|^\//i.test(String(form.icon).trim())) {
      nextErrors.icon = 'Icon should be a URL, data URL, or relative path.'
    }
    if (form.image && !/^https?:\/\/|^data:|^\//i.test(String(form.image).trim())) {
      nextErrors.image = 'Image should be a URL, data URL, or relative path.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setTab('general')
      return
    }

    setErrors({})
    const payload = {
      name: form.name,
      slug: form.slug,
      parent: form.parent || null,
      icon: form.icon || null,
      image: form.image || null,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: Boolean(form.isActive),
      seo: {
        title: form.seo.title || '',
        description: form.seo.description || '',
        keywords: String(form.seo.keywords || '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
      },
    }
    onSubmit?.(payload)
  }

  const onPickCategoryImage = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      appAlert('Please choose an image file.')
      return
    }
    setImageUploading(true)
    try {
      const url = await uploadStoreImageFile(file, { folder: STORE_IMAGE_FOLDERS.ribbon })
      setForm((p) => ({ ...p, image: url }))
      setErrors((p) => ({ ...p, image: '' }))
    } catch (err) {
      appAlert(err?.message || 'Image upload failed')
    } finally {
      setImageUploading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm">
        <button type="button" className={`rounded-md px-3 py-1 ${tab === 'general' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setTab('general')}>General</button>
        <button type="button" className={`rounded-md px-3 py-1 ${tab === 'seo' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setTab('seo')}>SEO</button>
      </div>

      {tab === 'general' ? (
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Category name" htmlFor="category-name" required error={errors.name}>
            <input
              id="category-name"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. Smartphones"
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }))
                setErrors((p) => ({ ...p, name: '' }))
              }}
              required
            />
          </FormField>
          <FormField label="Slug" htmlFor="category-slug" hint="Optional — auto-generated if empty">
            <input
              id="category-slug"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="smartphones"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            />
          </FormField>
          <FormField label="Parent category" htmlFor="category-parent">
            <select
              id="category-parent"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.parent}
              onChange={(e) => setForm((p) => ({ ...p, parent: e.target.value }))}
            >
              <option value="">No parent (root)</option>
              {parentOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Sort order" htmlFor="category-sort-order">
            <input
              id="category-sort-order"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              type="number"
              placeholder="0"
              value={form.sortOrder}
              onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
            />
          </FormField>
          <FormField label="Icon URL" htmlFor="category-icon" error={errors.icon} hint="Optional small icon URL">
            <input
              id="category-icon"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="https://..."
              value={form.icon}
              onChange={(e) => {
                setForm((p) => ({ ...p, icon: e.target.value }))
                setErrors((p) => ({ ...p, icon: '' }))
              }}
            />
          </FormField>
          <FormField label="Category image" htmlFor="category-image" error={errors.image} hint="Upload or paste URL">
            <div className="space-y-2">
              <div
                className="relative flex h-16 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
                onClick={() => document.getElementById('category-image-upload')?.click()}
              >
                <input
                  id="category-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={imageUploading || saving}
                  onChange={onPickCategoryImage}
                />
                {form.image ? (
                  <img src={form.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <>
                    <UploadCloud size={16} className="mb-0.5 text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-500">
                      {imageUploading ? 'Uploading...' : 'Click to upload image'}
                    </span>
                  </>
                )}
              </div>
              <input
                id="category-image"
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                placeholder="Or paste image URL"
                value={form.image}
                onChange={(e) => {
                  setForm((p) => ({ ...p, image: e.target.value }))
                  setErrors((p) => ({ ...p, image: '' }))
                }}
              />
              {form.image ? (
                <button
                  type="button"
                  className="text-[11px] font-medium text-red-600 hover:text-red-700"
                  onClick={() => setForm((p) => ({ ...p, image: '' }))}
                >
                  Remove image
                </button>
              ) : null}
            </div>
          </FormField>
          <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
            Active
          </label>
        </div>
      ) : (
        <SeoTab value={form.seo} onChange={(seo) => setForm((p) => ({ ...p, seo }))} />
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={saving || imageUploading} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {saving ? 'Saving...' : mode === 'edit' ? 'Update category' : 'Create category'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Cancel</button>
      </div>
    </form>
  )
}
