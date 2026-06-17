import React from 'react'
import { uploadStoreImageFile, STORE_IMAGE_FOLDERS } from '../../../lib/storeImageUpload.js'
import { appAlert } from '../../../lib/appDialog.js'

function parseUrls(raw) {
  return String(raw || '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((url, idx) => ({ url, isPrimary: idx === 0, sortOrder: idx }))
}

function normalizeImageObjects(items = []) {
  return items
    .map((img, idx) => ({ url: String(img?.url || '').trim(), isPrimary: idx === 0, sortOrder: idx }))
    .filter((img) => img.url)
}

export default function MediaUpload({
  images = [],
  onChange,
  uploadFolder = STORE_IMAGE_FOLDERS.inventory,
  disabled = false,
}) {
  const text = (images || []).map((img) => img?.url || '').filter(Boolean).join('\n')

  const onFilesPicked = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return

    try {
      const uploaded = []
      for (const file of files) {
        const url = await uploadStoreImageFile(file, { folder: uploadFolder })
        uploaded.push(url)
      }
      const next = normalizeImageObjects([
        ...(Array.isArray(images) ? images : []),
        ...uploaded.map((url) => ({ url })),
      ])
      onChange?.(next)
    } catch (err) {
      appAlert(err?.message || 'Image upload failed')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Media</p>
        <label className="cursor-pointer rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
          Upload images
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFilesPicked} disabled={disabled} />
        </label>
      </div>
      <textarea
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        rows={4}
        placeholder="Paste image URLs, one per line"
        value={text}
        onChange={(e) => onChange?.(normalizeImageObjects(parseUrls(e.target.value)))}
        disabled={disabled}
      />
      <p className="text-xs text-slate-500">Upload files or paste URLs. First image becomes primary automatically.</p>
    </div>
  )
}
