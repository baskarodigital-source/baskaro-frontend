import React from 'react'

function CategoryNode({ node, level = 0, onEdit, onDelete, focusCategoryId = '' }) {
  const id = node?._id || node?.id
  const children = Array.isArray(node?.children) ? node.children : []
  const isLinked = Boolean(node?.ribbonCategoryId)
  const isFocused = focusCategoryId && String(id) === String(focusCategoryId)

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center justify-between rounded-lg border bg-white px-3 py-2 ${
          isFocused ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
        }`}
        style={{ marginLeft: `${level * 16}px` }}
      >
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-800">{node?.name || 'Untitled category'}</p>
            {isLinked ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Linked
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500">slug: {node?.slug || '-'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onEdit?.(node)} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700">Edit</button>
          <button type="button" onClick={() => onDelete?.(id)} className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-600">Delete</button>
        </div>
      </div>

      {children.length > 0 && (
        <div className="space-y-2">
          {children.map((child) => (
            <CategoryNode
              key={child?._id || child?.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              focusCategoryId={focusCategoryId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategoryTree({
  categories = [],
  onEdit,
  onDelete,
  onImportRibbon,
  importing = false,
  onOpenAllCategories,
  focusCategoryId = '',
}) {
  if (!categories.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-800">No catalog categories yet</p>
        <p className="mt-2 text-slate-500">
          Sync categories from <span className="font-medium">All Categories</span> to connect both systems.
          After linking, brands/devices stay in All Categories; attributes and products live here.
        </p>
        {onImportRibbon ? (
          <button
            type="button"
            disabled={importing}
            onClick={onImportRibbon}
            className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            {importing ? 'Syncing...' : 'Sync with All Categories'}
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {onOpenAllCategories ? (
        <button
          type="button"
          onClick={onOpenAllCategories}
          className="mb-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          ← Back to All Categories
        </button>
      ) : null}
      {categories.map((category) => (
        <CategoryNode
          key={category?._id || category?.id}
          node={category}
          onEdit={onEdit}
          onDelete={onDelete}
          focusCategoryId={focusCategoryId}
        />
      ))}
    </div>
  )
}
