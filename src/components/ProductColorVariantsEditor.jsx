import React, { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Film, Loader2, Plus, Trash2, Upload } from 'lucide-react'
import { emptyColorVariantDraft, normalizeHexColor } from '../lib/colorVariants.js'
import {
  isCloudinaryUrl,
  isImageFile,
  isLocalMediaUrl,
  isVideoFile,
  normalizeImageFile,
  STORE_IMAGE_FOLDERS,
  uploadStoreImageFile,
  uploadStoreVideoFile,
} from '../lib/storeImageUpload.js'

export default function ProductColorVariantsEditor({
  variants = [],
  onChange,
  onError,
  onUploadingChange,
}) {
  const [uploadingKey, setUploadingKey] = useState(null)
  const [rowError, setRowError] = useState('')
  const [statusText, setStatusText] = useState('')
  const variantsRef = useRef(variants)
  const imageInputRefs = useRef({})
  const videoInputRefs = useRef({})
  const imageInputId = (idx) => `color-variant-images-${idx}`
  const videoInputId = (idx) => `color-variant-video-${idx}`

  useEffect(() => {
    variantsRef.current = variants
  }, [variants])

  useEffect(() => {
    onUploadingChange?.(Boolean(uploadingKey))
  }, [uploadingKey, onUploadingChange])

  const withVariants = useCallback(
    (updater) => {
      if (!onChange) {
        console.error('[ColorVariants] onChange is missing — cannot update color rows')
        return
      }
      onChange((prev) => {
        const base = Array.isArray(prev) ? prev : variantsRef.current
        const next = updater(Array.isArray(base) ? [...base] : [])
        variantsRef.current = next
        return next
      })
    },
    [onChange],
  )

  const patchRowImages = useCallback(
    (idx, nextUrls) => {
      const list = (nextUrls || []).filter(Boolean)
      withVariants((base) => {
        const next = base.map((r, i) =>
          i === idx ? { ...r, images: list, image: list[0] || '' } : r,
        )
        variantsRef.current = next
        return next
      })
    },
    [withVariants],
  )

  const updateRow = (idx, patch) => {
    withVariants((base) => base.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
  }

  const addRow = () => withVariants((base) => [...base, emptyColorVariantDraft()])

  const removeRow = (idx) => withVariants((base) => base.filter((_, i) => i !== idx))

  const rowImageUrls = (row) => {
    if (row?.images?.length) return [...row.images]
    return row?.image ? [row.image] : []
  }

  const stripPendingBlobs = (urls, pendingBlobs) => {
    const pending = new Set(pendingBlobs || [])
    return urls.filter((u) => {
      const url = String(u || '')
      if (!url) return false
      if (pending.has(url)) return false
      if (url.startsWith('blob:')) return false
      return true
    })
  }

  const addImages = async (idx, files) => {
    console.log('[ColorVariants] addImages called', { idx, count: files?.length ?? 0 })

    const raw = Array.from(files || [])
    if (!raw.length) {
      setRowError('No file selected.')
      return
    }

    setStatusText(`Checking ${raw.length} file(s)…`)
    const list = []
    for (const file of raw) {
      if (isImageFile(file)) {
        list.push(file)
        continue
      }
      try {
        const normalized = await normalizeImageFile(file)
        if (normalized) list.push(normalized)
      } catch (err) {
        console.warn('[ColorVariants] could not read file', file?.name, err)
      }
    }

    console.log('[ColorVariants] addImages accepted', {
      idx,
      picked: raw.length,
      accepted: list.length,
      files: raw.map((f) => ({ name: f.name, type: f.type || '(empty)', size: f.size })),
    })

    if (!list.length) {
      const msg = raw.length
        ? 'Selected file is not a supported image. Use JPG, PNG, or WEBP — if the file has no extension, rename it (e.g. work.jpg) and try again.'
        : 'No image file selected.'
      console.warn('[ColorVariants] rejected files:', msg)
      setRowError(msg)
      onError?.(msg)
      return
    }
    setRowError('')
    onError?.('')
    setStatusText(`Uploading ${list.length} image(s)…`)
    setUploadingKey(`${idx}-img`)

    const previews = list.map((file) => ({ file, blob: URL.createObjectURL(file) }))
    const pendingBlobs = previews.map((p) => p.blob)

    flushSync(() => {
      withVariants((base) => {
        const row = base[idx] || {}
        const merged = [...rowImageUrls(row), ...pendingBlobs]
        const next = base.map((r, i) =>
          i === idx ? { ...r, images: merged, image: merged[0] || '' } : r,
        )
        variantsRef.current = next
        return next
      })
    })

    try {
      for (const { file, blob } of previews) {
        const normalized = (await normalizeImageFile(file)) || file
        console.log('[ColorVariants] uploading to API…', normalized.name, normalized.type, normalized.size)
        const url = await uploadStoreImageFile(normalized, { folder: STORE_IMAGE_FOLDERS.models })
        console.log('[ColorVariants] upload OK', url)
        URL.revokeObjectURL(blob)

        flushSync(() => {
          withVariants((base) => {
            const row = base[idx] || {}
            const merged = stripPendingBlobs(
              rowImageUrls(row).map((u) => (u === blob ? url : u)),
              [blob],
            )
            const next = base.map((r, i) =>
              i === idx ? { ...r, images: merged, image: merged[0] || '' } : r,
            )
            variantsRef.current = next
            return next
          })
        })
      }
    } catch (err) {
      console.error('[ColorVariants] upload failed', err)
      previews.forEach((p) => URL.revokeObjectURL(p.blob))
      withVariants((base) => {
        const row = base[idx] || {}
        const merged = stripPendingBlobs(rowImageUrls(row), pendingBlobs)
        const next = base.map((r, i) =>
          i === idx ? { ...r, images: merged, image: merged[0] || '' } : r,
        )
        variantsRef.current = next
        return next
      })
      const msg = err?.message || 'Could not upload image.'
      setRowError(msg)
      onError?.(msg)
    } finally {
      setUploadingKey(null)
      setStatusText('')
    }
  }

  const openImagePicker = (idx) => {
    console.log('[ColorVariants] openImagePicker', idx)
    setRowError('')
    const input = imageInputRefs.current[idx]
    if (!input) {
      console.error('[ColorVariants] file input ref missing for row', idx)
      setRowError('Could not open file picker. Refresh the page and try again.')
      return
    }
    input.value = ''
    input.click()
  }

  const removeImage = (idx, imageIdx) => {
    const row = variantsRef.current[idx] || {}
    const next = rowImageUrls(row).filter((_, i) => i !== imageIdx)
    patchRowImages(idx, next)
  }

  const addVideo = async (idx, file) => {
    if (!file || !isVideoFile(file)) return
    setUploadingKey(`${idx}-video`)
    onError?.('')
    try {
      const url = await uploadStoreVideoFile(file, { folder: STORE_IMAGE_FOLDERS.videos })
      withVariants((base) =>
        base.map((r, i) =>
          i === idx ? { ...r, videoUrls: [...(r.videoUrls || []), url] } : r,
        ),
      )
    } catch (err) {
      onError?.(err?.message || 'Could not upload video.')
    } finally {
      setUploadingKey(null)
    }
  }

  const removeVideo = (idx, videoIdx) => {
    withVariants((base) =>
      base.map((r, i) =>
        i === idx ? { ...r, videoUrls: (r.videoUrls || []).filter((_, vi) => vi !== videoIdx) } : r,
      ),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
        <div className="min-w-0">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Color Variants</h4>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Each color can have multiple images and videos — customers switch colors on the product page.
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
        >
          <Plus size={14} />
          Add color
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-sm font-semibold text-slate-500">
          No color variants yet. Add colors with images and optional videos.
        </div>
      ) : (
        <div className="space-y-4">
          {variants.map((row, idx) => {
            const images = row.images?.length ? row.images : row.image ? [row.image] : []
            const videos = row.videoUrls || []
            const busy = String(uploadingKey || '').startsWith(`${idx}-`)

            return (
              <div key={row._localId || `color-${idx}-${row.name}`} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-[1fr_140px_auto] sm:items-end">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">Color name</label>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(idx, { name: e.target.value })}
                      placeholder="e.g. Space Black"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">Swatch</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={normalizeHexColor(row.hex)}
                        onChange={(e) => updateRow(idx, { hex: e.target.value })}
                        className="h-11 w-11 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                      />
                      <input
                        type="text"
                        value={row.hex}
                        onChange={(e) => updateRow(idx, { hex: e.target.value })}
                        placeholder="#1c1c1e"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-mono font-bold text-slate-700 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-100 px-4 text-xs font-black text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-700">Images ({images.length})</span>
                    <div className="flex items-center gap-2">
                      <input
                        id={imageInputId(idx)}
                        ref={(el) => {
                          imageInputRefs.current[idx] = el
                        }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                        multiple
                        className="hidden"
                        tabIndex={-1}
                        aria-hidden
                        onChange={(e) => {
                          const picked = e.target.files
                          console.log('[ColorVariants] file input change', idx, picked?.length ?? 0)
                          if (picked?.length) {
                            void addImages(idx, picked)
                          }
                          e.target.value = ''
                        }}
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => openImagePicker(idx)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 hover:border-blue-200 hover:bg-blue-50/30 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busy && uploadingKey?.includes('img') ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Upload size={14} />
                        )}
                        {busy && uploadingKey?.includes('img') ? 'Uploading…' : 'Add images'}
                      </button>
                    </div>
                  </div>

                  {statusText && busy ? (
                    <p className="mb-3 text-xs font-semibold text-blue-600">{statusText}</p>
                  ) : null}

                  {rowError ? (
                    <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                      {rowError}
                    </p>
                  ) : null}

                  {images.length === 0 ? (
                    <p className="text-xs font-semibold text-amber-600">Add at least one image for this color.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {images.map((url, imageIdx) => {
                        const pending = isLocalMediaUrl(url) || (url && !isCloudinaryUrl(url) && url.startsWith('blob:'))
                        return (
                          <div key={`${url}-${imageIdx}`} className="relative">
                            <img
                              src={url}
                              alt=""
                              className="h-20 w-20 rounded-xl border border-slate-200 bg-white object-contain p-1"
                            />
                            {imageIdx === 0 ? (
                              <span className="absolute left-1 top-1 rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                                Main
                              </span>
                            ) : null}
                            {pending ? (
                              <span className="absolute bottom-1 left-1 rounded bg-amber-500 px-1 text-[8px] font-bold text-white">
                                …
                              </span>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => removeImage(idx, imageIdx)}
                              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-700">Videos ({videos.length})</span>
                    <div className="flex items-center gap-2">
                      <input
                        id={videoInputId(idx)}
                        ref={(el) => {
                          videoInputRefs.current[idx] = el
                        }}
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
                        className="hidden"
                        tabIndex={-1}
                        aria-hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) void addVideo(idx, file)
                          e.target.value = ''
                        }}
                      />
                      <button
                        type="button"
                        disabled={busy && uploadingKey === `${idx}-video`}
                        onClick={() => videoInputRefs.current[idx]?.click()}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 hover:border-violet-200 hover:bg-violet-50/30 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Film size={14} />
                        {uploadingKey === `${idx}-video` ? 'Uploading…' : 'Add video'}
                      </button>
                    </div>
                  </div>

                  {videos.length > 0 ? (
                    <div className="space-y-2">
                      {videos.map((url, videoIdx) => (
                        <div
                          key={`${url}-${videoIdx}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <Film size={16} className="shrink-0 text-violet-600" />
                            <span className="truncate text-xs font-mono text-slate-600">{url.split('/').pop()}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVideo(idx, videoIdx)}
                            className="shrink-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-slate-400">Optional product video for this color.</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
