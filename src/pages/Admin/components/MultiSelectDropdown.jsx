import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'

export default function MultiSelectDropdown({
  id,
  options = [],
  value = [],
  onChange,
  placeholder = 'Select options',
  searchPlaceholder = 'Search...',
  disabled = false,
  emptyText = 'No options available',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)

  const selectedSet = useMemo(() => new Set((value || []).map(String)), [value])
  const optionMap = useMemo(() => {
    const map = new Map()
    options.forEach((opt) => map.set(String(opt.id), opt.label))
    return map
  }, [options])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => String(opt.label || '').toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const toggle = (optionId) => {
    const idStr = String(optionId)
    const next = new Set(selectedSet)
    if (next.has(idStr)) next.delete(idStr)
    else next.add(idStr)
    onChange?.(Array.from(next))
  }

  const removeOne = (optionId) => {
    onChange?.((value || []).map(String).filter((id) => id !== String(optionId)))
  }

  const summary =
    selectedSet.size === 0
      ? placeholder
      : `${selectedSet.size} selected`

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
          disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
            : open
              ? 'border-slate-400 bg-white ring-2 ring-slate-900/10'
              : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selectedSet.size === 0 ? 'text-slate-400' : 'text-slate-800'}>{summary}</span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {selectedSet.size > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Array.from(selectedSet).map((optionId) => (
            <span
              key={optionId}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
            >
              {optionMap.get(optionId) || 'Category'}
              <button
                type="button"
                className="rounded-full text-slate-500 hover:text-slate-800"
                onClick={() => removeOne(optionId)}
                disabled={disabled}
                aria-label={`Remove ${optionMap.get(optionId) || optionId}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {open && !disabled ? (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {options.length > 6 ? (
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-md border border-slate-200 py-1.5 pl-8 pr-2 text-sm outline-none focus:border-slate-400"
                />
              </div>
            </div>
          ) : null}

          <ul className="max-h-56 overflow-y-auto py-1" role="listbox" aria-multiselectable="true">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">{emptyText}</li>
            ) : (
              filtered.map((opt) => {
                const optionId = String(opt.id)
                const checked = selectedSet.has(optionId)
                return (
                  <li key={optionId}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={checked}
                      onClick={() => toggle(optionId)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                        checked ? 'bg-slate-50 font-medium text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          checked ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {checked ? <Check size={12} strokeWidth={3} /> : null}
                      </span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
