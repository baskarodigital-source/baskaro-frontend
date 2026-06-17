import React, { useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { appAlert } from '../../../lib/appDialog.js'
import {
  isVideoFile,
  isImageFile,
  normalizeImageFile,
  STORE_IMAGE_FOLDERS,
  uploadStoreImageFile,
  uploadStoreVideoFile,
} from '../../../lib/storeImageUpload.js'

function guessMediaType(url = '') {
  const t = String(url).toLowerCase()
  if (/\.(mp4|mov|webm)(\?|$)/i.test(t) || /\/video\/upload\//i.test(t)) return 'video'
  return 'image'
}

export function normalizeMediaAttributeValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === 'object') {
          const url = String(item.url || item.src || '').trim()
          if (!url) return null
          return {
            url,
            mediaType: item.mediaType === 'video' || item.type === 'video' ? 'video' : 'image',
          }
        }
        const url = String(item || '').trim()
        if (!url) return null
        return { url, mediaType: guessMediaType(url) }
      })
      .filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return normalizeMediaAttributeValue(parsed)
    } catch {
      /* single URL string */
    }
    return [{ url: value.trim(), mediaType: guessMediaType(value) }]
  }
  return []
}

export default function AttributeMediaUpload({
  label = 'Media',
  inputId = 'attr-media-upload',
  value,
  onChange,
  disabled = false,
  uploadFolder = STORE_IMAGE_FOLDERS.cms,
}) {
  const [uploading, setUploading] = useState(false)
  const items = normalizeMediaAttributeValue(value)

  const setItems = (next) => onChange?.(next)

  const onFilesPicked = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length || disabled) return

    setUploading(true)
    const uploaded = []
    try {
      for (const file of files) {
        if (isVideoFile(file)) {
          const url = await uploadStoreVideoFile(file, { folder: STORE_IMAGE_FOLDERS.videos })
          uploaded.push({ url, mediaType: 'video' })
          continue
        }
        const normalized = (await normalizeImageFile(file)) || file
        if (!isImageFile(normalized)) {
          appAlert(`Skipped "${file.name}" — use images (JPG, PNG, WEBP) or videos (MP4, MOV, WEBM).`)
          continue
        }
        const url = await uploadStoreImageFile(normalized, { folder: uploadFolder })
        uploaded.push({ url, mediaType: 'image' })
      }
      if (uploaded.length) setItems([...items, ...uploaded])
    } catch (err) {
      appAlert(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeAt = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <div
        className={`relative flex min-h-[4.5rem] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 hover:border-slate-400 hover:bg-slate-100 ${disabled || uploading ? 'pointer-events-none opacity-60' : ''}`}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        <input
          id={inputId}
          type="file"
          accept="image/*,video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
          multiple
          className="hidden"
          disabled={disabled || uploading}
          onChange={onFilesPicked}
        />
        <UploadCloud size={18} className="mb-1 text-slate-400" />
        <span className="text-center text-[11px] font-semibold text-slate-500">
          {uploading ? 'Uploading...' : 'Click to upload images or videos (multi-select allowed)'}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((item, idx) => (
            <div key={`${item.url}-${idx}`} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white">
              {item.mediaType === 'video' ? (
                <video src={item.url} className="aspect-square w-full object-cover" muted playsInline />
              ) : (
                <img src={item.url} alt="" className="aspect-square w-full object-cover" />
              )}
              <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                {item.mediaType}
              </span>
              <button
                type="button"
                className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-red-600 shadow hover:bg-white"
                onClick={() => removeAt(idx)}
                disabled={disabled || uploading}
                aria-label="Remove"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-slate-500">No files uploaded yet.</p>
      )}
    </div>
  )
}
