import React, { useEffect, useMemo, useState } from 'react'
import { appAlert, appConfirm } from '../../lib/appDialog.js'
import { postImportCategoriesFromRibbon, getProductById } from '../../lib/api/baskaroApi.js'
import CategoryForm from './categories/CategoryForm.jsx'
import CategoryTree from './categories/CategoryTree.jsx'
import { useCategories } from './categories/useCategories.js'
import AttributeForm from './attributes/AttributeForm.jsx'
import AttributeList from './attributes/AttributeList.jsx'
import { useAttributes } from './attributes/useAttributes.js'
import ProductForm from './products/ProductForm.jsx'
import { useProducts } from './products/useProducts.js'

function normalizeId(row) {
  return row?._id || row?.id || ''
}

function productBrandLabel(p) {
  if (p?.brandId && typeof p.brandId === 'object') return p.brandId.name || p.brand || '-'
  return p?.brand || '-'
}

function productDeviceLabel(p) {
  if (p?.deviceId && typeof p.deviceId === 'object') return p.deviceId.name || '-'
  return '-'
}

function ProductList({ products = [], onEdit, onDelete }) {
  if (!products.length) {
    return <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No products found.</div>
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Name</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Brand</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Device</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Variants</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Status</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const id = normalizeId(p)
            return (
              <tr key={id} className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-800">{p?.name || '-'}</td>
                <td className="px-3 py-2 text-slate-600">{productBrandLabel(p)}</td>
                <td className="px-3 py-2 text-slate-600">{productDeviceLabel(p)}</td>
                <td className="px-3 py-2 text-slate-600">{Array.isArray(p?.variants) ? p.variants.length : 0}</td>
                <td className="px-3 py-2 text-slate-600">{p?.isActive === false ? 'Inactive' : 'Active'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => onEdit?.(p)} className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700">Edit</button>
                    <button type="button" onClick={() => onDelete?.(id)} className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-600">Delete</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function LoadingSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-8 animate-pulse rounded bg-slate-100" />
      ))}
    </div>
  )
}

export default function CatalogBuilderView({
  focusCategoryId = '',
  initialSection = 'categories',
  onOpenAllCategories,
}) {
  const [section, setSection] = useState(initialSection)
  const [categoryDraft, setCategoryDraft] = useState(null)
  const [categoryFormKey, setCategoryFormKey] = useState(0)
  const [attributeDraft, setAttributeDraft] = useState(null)
  const [productDraft, setProductDraft] = useState(null)
  const [productSearch, setProductSearch] = useState('')
  const [productPage, setProductPage] = useState(1)
  const [importingRibbon, setImportingRibbon] = useState(false)

  const categoriesHook = useCategories({ includeInactive: true })
  const attributesHook = useAttributes({ includeInactive: true })
  const productsHook = useProducts({ includeInactive: true, q: productSearch, page: productPage, limit: 20 })
  const [ready, setReady] = useState({
    categories: false,
    attributes: false,
    products: false,
  })

  useEffect(() => {
    if (!categoriesHook.loading && !ready.categories) {
      setReady((prev) => ({ ...prev, categories: true }))
    }
  }, [categoriesHook.loading, ready.categories])

  useEffect(() => {
    if (!attributesHook.loading && !ready.attributes) {
      setReady((prev) => ({ ...prev, attributes: true }))
    }
  }, [attributesHook.loading, ready.attributes])

  useEffect(() => {
    if (!productsHook.loading && !ready.products) {
      setReady((prev) => ({ ...prev, products: true }))
    }
  }, [productsHook.loading, ready.products])

  const readyBySection = {
    categories: ready.categories,
    attributes: ready.attributes,
    products: ready.products,
  }

  const sectionHookById = {
    categories: categoriesHook,
    attributes: attributesHook,
    products: productsHook,
  }

  const activeHook = sectionHookById[section]
  const activeReady = readyBySection[section]

  const isSyncing = activeReady
    ? activeHook.saving || activeHook.loading
    : false

  const categoryTree = categoriesHook.categories || []

  const categoriesForProduct = useMemo(() => categoryTree, [categoryTree])

  useEffect(() => {
    if (initialSection) setSection(initialSection)
  }, [initialSection])

  useEffect(() => {
    if (!focusCategoryId) return
    if (section === 'products') {
      setProductDraft((prev) => (prev ? prev : { category: focusCategoryId }))
    }
  }, [focusCategoryId, section])

  const importRibbonCategories = async () => {
    setImportingRibbon(true)
    try {
      const result = await postImportCategoriesFromRibbon()
      await categoriesHook.refetch()
      const created = result?.created ?? 0
      const linked = result?.linked ?? 0
      const skipped = result?.skipped ?? 0
      const ribbonCreated = result?.ribbonCreated ?? 0
      const ribbonLinked = result?.ribbonLinked ?? 0
      if (created === 0 && linked === 0 && skipped > 0 && ribbonCreated === 0 && ribbonLinked === 0) {
        appAlert('Could not sync categories with All Categories.')
      } else {
        const catalogPart = `${created} catalog created, ${linked} catalog linked`
        const ribbonPart =
          ribbonCreated || ribbonLinked
            ? `; ${ribbonCreated} added to All Categories, ${ribbonLinked} All Categories updated`
            : ''
        appAlert(`Synced: ${catalogPart}${ribbonPart}${skipped ? `, ${skipped} skipped` : ''}.`)
      }
    } catch (e) {
      appAlert(e?.message || 'Import failed')
    } finally {
      setImportingRibbon(false)
    }
  }

  const saveCategory = async (payload) => {
    try {
      if (categoryDraft?._id || categoryDraft?.id) {
        await categoriesHook.updateCategory(normalizeId(categoryDraft), payload)
      } else {
        await categoriesHook.createCategory(payload)
      }
      setCategoryDraft(null)
      setCategoryFormKey((k) => k + 1)
    } catch (e) {
      appAlert(e?.message || 'Category save failed')
    }
  }

  const saveAttribute = async (payload) => {
    try {
      if (attributeDraft?._id || attributeDraft?.id) {
        await attributesHook.updateAttribute(normalizeId(attributeDraft), payload)
      } else {
        await attributesHook.createAttribute(payload)
      }
      setAttributeDraft(null)
    } catch (e) {
      appAlert(e?.message || 'Attribute save failed')
    }
  }

  const saveProduct = async (payload) => {
    try {
      if (productDraft?._id || productDraft?.id) {
        await productsHook.updateProduct(normalizeId(productDraft), payload)
      } else {
        await productsHook.createProduct(payload)
      }
      setProductDraft(null)
    } catch (e) {
      appAlert(e?.message || 'Product save failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Catalog Builder</h2>
            <p className="mt-1 text-sm text-slate-500">
              Linked with <span className="font-medium">All Categories</span> — products follow
              Category → Brand → Device → Product. Manage brands and devices in All Categories;
              use Catalog Builder for attributes, variants, and shop listings.
            </p>
            {onOpenAllCategories ? (
              <button
                type="button"
                onClick={onOpenAllCategories}
                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Open All Categories →
              </button>
            ) : null}
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
              isSyncing ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isSyncing ? 'animate-pulse bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            {isSyncing ? 'Syncing changes...' : 'All changes synced'}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'categories', label: 'Categories' },
          { id: 'attributes', label: 'Attributes' },
          { id: 'products', label: 'Products' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${section === item.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === 'categories' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <CategoryForm
            key={categoryDraft ? normalizeId(categoryDraft) : `create-${categoryFormKey}`}
            mode={categoryDraft ? 'edit' : 'create'}
            initialValue={categoryDraft}
            allCategories={categoryTree}
            saving={categoriesHook.saving}
            onSubmit={saveCategory}
            onCancel={() => setCategoryDraft(null)}
          />
          <div className="space-y-3">
            {categoriesHook.loading ? (
              <LoadingSkeleton rows={7} />
            ) : (
              <CategoryTree
                categories={categoryTree}
                onImportRibbon={importRibbonCategories}
                importing={importingRibbon}
                onOpenAllCategories={onOpenAllCategories}
                focusCategoryId={focusCategoryId}
                onEdit={(row) => setCategoryDraft(row)}
                onDelete={async (id) => {
                  if (!id) return
                  if (!(await appConfirm('Delete this category?'))) return
                  try {
                    await categoriesHook.removeCategory(id)
                    if (normalizeId(categoryDraft) === id) setCategoryDraft(null)
                  } catch (e) {
                    appAlert(e?.message || 'Category delete failed')
                  }
                }}
              />
            )}
          </div>
        </div>
      )}

      {section === 'attributes' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <AttributeForm
            mode={attributeDraft ? 'edit' : 'create'}
            initialValue={attributeDraft}
            categories={categoryTree}
            saving={attributesHook.saving}
            onSubmit={saveAttribute}
            onCancel={() => setAttributeDraft(null)}
          />
          <div className="space-y-3">
            {attributesHook.loading ? (
              <LoadingSkeleton rows={7} />
            ) : (
              <AttributeList
                attributes={attributesHook.attributes}
                onEdit={(row) => setAttributeDraft(row)}
                onDelete={async (id) => {
                  if (!id) return
                  if (!(await appConfirm('Delete this attribute?'))) return
                  try {
                    await attributesHook.removeAttribute(id)
                    if (normalizeId(attributeDraft) === id) setAttributeDraft(null)
                  } catch (e) {
                    appAlert(e?.message || 'Attribute delete failed')
                  }
                }}
              />
            )}
          </div>
        </div>
      )}

      {section === 'products' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Search products by name/brand..."
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value)
                setProductPage(1)
              }}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ProductForm
              mode={productDraft ? 'edit' : 'create'}
              initialValue={productDraft}
              categories={categoriesForProduct}
              saving={productsHook.saving}
              onSubmit={saveProduct}
              onCancel={() => setProductDraft(null)}
            />
            <div className="space-y-3">
              {productsHook.loading ? (
                <LoadingSkeleton rows={8} />
              ) : (
                <div className="space-y-3">
                  <ProductList
                    products={productsHook.products}
                    onEdit={async (row) => {
                      const id = normalizeId(row)
                      if (!id) return
                      try {
                        const full = await getProductById(id)
                        setProductDraft(full || row)
                      } catch {
                        setProductDraft(row)
                      }
                    }}
                    onDelete={async (id) => {
                      if (!id) return
                      if (!(await appConfirm('Delete this product?'))) return
                      try {
                        await productsHook.removeProduct(id)
                        if (normalizeId(productDraft) === id) setProductDraft(null)
                      } catch (e) {
                        appAlert(e?.message || 'Product delete failed')
                      }
                    }}
                  />
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                    <div className="text-slate-600">
                      Total: <span className="font-semibold">{productsHook.pagination?.total ?? 0}</span> |
                      Page <span className="font-semibold">{productsHook.pagination?.page ?? 1}</span> of{' '}
                      <span className="font-semibold">{productsHook.pagination?.totalPages ?? 1}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={(productsHook.pagination?.page ?? 1) <= 1}
                        onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                        className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={!productsHook.pagination?.hasMore}
                        onClick={() => setProductPage((p) => p + 1)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
