import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud,
  Trash2,
  Play,
  ImageIcon,
  Film,
  GripVertical,
  RefreshCw,
  Star,
  X,
} from 'lucide-react'
import {
  STORE_IMAGE_FOLDERS,
  uploadStoreImageFiles,
  uploadStoreVideoFile,
  uploadStoreVideoFiles,
  MAX_VIDEO_FILE_BYTES,
  formatMegabytes,
  getCloudinaryStatus,
  isCloudinaryUrl,
  isLocalMediaUrl,
  isImageFile,
  isVideoFile,
} from '../lib/storeImageUpload.js'

const ACCEPT_ATTR =
  'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm,.jpg,.jpeg,.png,.webp,.mp4,.mov,.webm'

function uid() {
  return `media-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function collectVideoUrls(video, videos) {
  const list = []
  const seen = new Set()
  const push = (raw) => {
    const u = String(raw || '').trim()
    if (!u || seen.has(u)) return
    seen.add(u)
    list.push(u)
  }
  if (Array.isArray(videos)) videos.forEach(push)
  push(video)
  return list
}

function buildItems(image, images, video, videos) {
  const items = []
  const gallery = Array.isArray(images) ? images.filter(Boolean) : []
  const primaryUrl = String(image || '').trim()

  if (primaryUrl) {
    items.push({ id: `img-${primaryUrl}`, url: primaryUrl, kind: 'image', isPrimary: true })
  }

  for (const url of gallery) {
    const u = String(url || '').trim()
    if (!u || u === primaryUrl) continue
    items.push({ id: `img-${u}`, url: u, kind: 'image', isPrimary: false })
  }

  for (const videoUrl of collectVideoUrls(video, videos)) {
    items.push({ id: `vid-${videoUrl}`, url: videoUrl, kind: 'video' })
  }

  return items
}

function derivePayload(items) {
  const images = items.filter((i) => i.kind === 'image' && isCloudinaryUrl(i.url))
  const primary = images.find((i) => i.isPrimary) || images[0]
  const image = primary?.url || ''
  const gallery = images.filter((i) => i.url && i.url !== image).map((i) => i.url)
  const videos = items
    .filter((i) => i.kind === 'video' && isCloudinaryUrl(i.url))
    .map((i) => i.url)
  return { image, images: gallery, video: videos[0] || '', videos }
}

function MediaCard({
  item,
  index,
  dragIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onSetPrimary,
  onReplace,
  onDelete,
  onPlayVideo,
}) {
  const isDragging = dragIndex === index
  const isVideo = item.kind === 'video'
  const progress = item.uploadProgress

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      draggable={!item.uploading}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`group relative aspect-square overflow-hidden rounded-2xl border transition-all duration-300 ${
        isDragging
          ? 'z-20 scale-[1.03] border-blue-400/80 shadow-xl shadow-blue-200/40 ring-2 ring-blue-400/30'
          : 'border-white/60 bg-white/50 shadow-md shadow-slate-300/25 hover:border-blue-300/70 hover:shadow-lg hover:shadow-slate-300/35'
      } backdrop-blur-md`}
    >
      {item.isPrimary ? (
        <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-md">
          <Star size={10} fill="currentColor" />
          Primary
        </span>
      ) : null}

      <div className="absolute right-2 top-2 z-10 flex cursor-grab items-center justify-center rounded-lg bg-white/75 p-1 text-slate-500 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 active:cursor-grabbing">
        <GripVertical size={14} />
      </div>

      {isVideo ? (
        <>
          <video
            src={item.url}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
          <button
            type="button"
            onClick={() => onPlayVideo(item)}
            className="absolute inset-0 flex items-center justify-center bg-slate-900/25 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Play video"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-blue-600 shadow-lg backdrop-blur-sm transition-transform hover:scale-105">
              <Play size={22} fill="currentColor" className="ml-0.5" />
            </span>
          </button>
          <span className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded-md bg-slate-900/65 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            <Film size={10} />
            Video
          </span>
        </>
      ) : (
        <>
          <img src={item.url} alt="" className="h-full w-full object-cover" />
          <span className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded-md bg-slate-900/55 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/95 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
            <ImageIcon size={10} />
            Image
          </span>
        </>
      )}

      {item.uploading ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-slate-900/55 backdrop-blur-[2px]">
          <div className="h-1.5 w-[70%] overflow-hidden rounded-full bg-white/25">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
              initial={{ width: '0%' }}
              animate={{ width: progress != null ? `${Math.min(100, progress)}%` : '65%' }}
              transition={{ duration: 0.35 }}
            />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">
            {progress != null ? `${Math.round(progress)}%` : 'Uploading…'}
            {item.uploadPhase === 'cloudinary' ? ' · Cloudinary' : ''}
          </span>
        </div>
      ) : null}

      {!item.uploading ? (
        <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-full gap-1 p-2 transition-transform duration-300 group-hover:translate-y-0">
          {!item.isPrimary && item.kind === 'image' ? (
            <button
              type="button"
              onClick={() => onSetPrimary(item.id)}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/90 px-2 py-1.5 text-[10px] font-black text-amber-700 shadow-sm backdrop-blur-sm transition hover:bg-amber-50"
            >
              <Star size={11} />
              Primary
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onReplace(item)}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/90 px-2 py-1.5 text-[10px] font-black text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-blue-50 hover:text-blue-700"
          >
            <RefreshCw size={11} />
            Replace
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="flex items-center justify-center rounded-lg bg-white/90 p-1.5 text-red-600 shadow-sm backdrop-blur-sm transition hover:bg-red-50"
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ) : null}
    </motion.div>
  )
}

export default function ProductMediaManager({ image, images, video, videos, onChange, onError }) {
  const [items, setItems] = useState(() => buildItems(image, images, video, videos))
  const [dragIndex, setDragIndex] = useState(null)
  const [zoneActive, setZoneActive] = useState(false)
  const [batchProgress, setBatchProgress] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [videoModal, setVideoModal] = useState(null)
  const [cloudinaryReady, setCloudinaryReady] = useState(null)

  useEffect(() => {
    let cancelled = false
    getCloudinaryStatus()
      .then((s) => {
        if (!cancelled) {
          setCloudinaryReady(Boolean(s?.configured && s?.connected))
        }
      })
      .catch(() => {
        if (!cancelled) setCloudinaryReady(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const fileInputRef = useRef(null)
  const replaceRef = useRef(null)
  const replaceTargetRef = useRef(null)

  const syncOut = useCallback(
    (nextItems, { notifyParent = true } = {}) => {
      setItems(nextItems)
      const pending = nextItems.some((i) => i.uploading || isLocalMediaUrl(i.url))
      if (notifyParent && !pending) {
        const payload = derivePayload(nextItems)
        const hasStrayLocal = [payload.image, ...payload.images, payload.video, ...payload.videos].some(
          (u) => u && isLocalMediaUrl(u),
        )
        if (!hasStrayLocal) onChange?.(payload)
      }
    },
    [onChange],
  )

  const imageCount = useMemo(() => items.filter((i) => i.kind === 'image').length, [items])
  const videoCount = useMemo(() => items.filter((i) => i.kind === 'video').length, [items])
  const hasPrimary = useMemo(() => items.some((i) => i.kind === 'image' && i.isPrimary), [items])

  const emitError = (msg) => {
    if (msg) onError?.(msg)
  }

  const processFiles = async (fileList, { replaceId } = {}) => {
    const raw = Array.from(fileList || [])
    const imageFiles = raw.filter(isImageFile)
    const videoFiles = raw.filter(isVideoFile)
    const rejected = raw.length - imageFiles.length - videoFiles.length

    if (!imageFiles.length && !videoFiles.length) {
      if (rejected) emitError('Use JPG, PNG, WEBP, MP4, MOV, or WEBM files only.')
      return
    }
    if (rejected) emitError('Some files were skipped — only JPG, PNG, WEBP, MP4, MOV, and WEBM are allowed.')

    const videosToUpload = replaceId ? videoFiles.slice(0, 1) : videoFiles

    for (const vf of videosToUpload) {
      if (vf.size > MAX_VIDEO_FILE_BYTES) {
        emitError(
          `Video is too large (${formatMegabytes(vf.size)}). Maximum is ${formatMegabytes(MAX_VIDEO_FILE_BYTES)}.`,
        )
        return
      }
    }

    setUploading(true)
    emitError('')

    const tempItems = [...items]
    const tempIds = []

    const bumpVideoProgress = (pct, phase, onlyId) => {
      const value = Math.min(99, Math.max(0, Math.round(pct)))
      setBatchProgress({ done: value, total: 100, label: 'video' })
      setItems((prev) =>
        prev.map((i) => {
          if (i.kind !== 'video' || !i.uploading) return i
          if (onlyId && i.id !== onlyId) return i
          if (!onlyId && !tempIds.includes(i.id)) return i
          return { ...i, uploadProgress: value, uploadPhase: phase || 'send' }
        }),
      )
    }

    try {
      if (replaceId) {
        const target = items.find((i) => i.id === replaceId)
        if (!target) return
        const file = imageFiles[0] || videosToUpload[0]
        if (!file) return
        if (target.kind === 'image' && !isImageFile(file)) {
          emitError('Choose an image file to replace this photo.')
          return
        }
        if (target.kind === 'video' && !isVideoFile(file)) {
          emitError('Choose a video file to replace this clip.')
          return
        }

        const preview = URL.createObjectURL(file)
        syncOut(
          items.map((i) =>
            i.id === replaceId ? { ...i, url: preview, uploading: true, uploadProgress: 12 } : i,
          ),
          { notifyParent: false },
        )

        let url
        if (isVideoFile(file)) {
          url = await uploadStoreVideoFile(file, {
            folder: STORE_IMAGE_FOLDERS.videos,
            onProgress: (pct, phase) => bumpVideoProgress(pct, phase, replaceId),
          })
        } else {
          const [u] = await uploadStoreImageFiles([file], {
            folder: STORE_IMAGE_FOLDERS.models,
            concurrency: 1,
            onProgress: ({ done, total }) => {
              const pct = total ? Math.round((done / total) * 100) : 100
              setItems((prev) =>
                prev.map((i) => (i.id === replaceId ? { ...i, uploadProgress: pct } : i)),
              )
            },
          })
          url = u
        }
        URL.revokeObjectURL(preview)
        if (!url || (isVideoFile(file) && !isCloudinaryUrl(url)) || (!isVideoFile(file) && !isCloudinaryUrl(url))) {
          throw new Error('Upload did not complete on Cloudinary. Check backend .env and try again.')
        }
        setItems((prev) => {
          const next = prev.map((i) =>
            i.id === replaceId
              ? { ...i, url, uploading: false, uploadProgress: undefined }
              : i,
          )
          onChange?.(derivePayload(next))
          return next
        })
        return
      }

      for (const file of imageFiles) {
        const id = uid()
        tempIds.push(id)
        tempItems.push({
          id,
          url: URL.createObjectURL(file),
          kind: 'image',
          isPrimary: !tempItems.some((x) => x.kind === 'image' && x.isPrimary),
          uploading: true,
          uploadProgress: 8,
          uploadPhase: 'send',
        })
      }

      for (const file of videosToUpload) {
        const id = uid()
        tempIds.push(id)
        tempItems.push({
          id,
          url: URL.createObjectURL(file),
          kind: 'video',
          uploading: true,
          uploadProgress: 8,
          uploadPhase: 'send',
        })
      }

      syncOut(tempItems, { notifyParent: false })

      const imageUploadPromise = imageFiles.length
        ? uploadStoreImageFiles(imageFiles, {
            folder: STORE_IMAGE_FOLDERS.models,
            concurrency: 4,
            onProgress: ({ done, total }) => {
              setBatchProgress({ done, total, label: 'images' })
              const ratio = total ? done / total : 1
              setItems((prev) => {
                let imgIdx = 0
                return prev.map((i) => {
                  if (!tempIds.includes(i.id) || i.kind !== 'image') return i
                  const thisIdx = imgIdx
                  imgIdx += 1
                  const doneForThis = done >= thisIdx + 1
                  return {
                    ...i,
                    uploadProgress: doneForThis ? 100 : Math.round(ratio * 90),
                    uploading: !doneForThis,
                  }
                })
              })
            },
          })
        : Promise.resolve([])

      const videoTempIds = tempItems.filter((t) => t.kind === 'video').map((t) => t.id)

      const videoUploadPromise = videosToUpload.length
        ? uploadStoreVideoFiles(videosToUpload, {
            folder: STORE_IMAGE_FOLDERS.videos,
            concurrency: 2,
            onProgress: ({ fileIndex, percent, phase }) => {
              const targetId = videoTempIds[fileIndex]
              if (!targetId) return
              setBatchProgress({ done: fileIndex + 1, total: videosToUpload.length, label: 'videos' })
              setItems((prev) =>
                prev.map((i) =>
                  i.id === targetId
                    ? { ...i, uploadProgress: percent, uploadPhase: phase || 'send' }
                    : i,
                ),
              )
            },
          })
        : Promise.resolve([])

      if (imageFiles.length) setBatchProgress({ done: 0, total: imageFiles.length, label: 'images' })
      if (videosToUpload.length && !imageFiles.length) {
        setBatchProgress({ done: 0, total: videosToUpload.length, label: 'videos' })
      }

      const [uploaded, uploadedVideos] = await Promise.all([
        imageUploadPromise,
        videoUploadPromise,
      ])

      if (imageFiles.length && uploaded.length !== imageFiles.length) {
        throw new Error('One or more images failed to upload to Cloudinary.')
      }
      if (videosToUpload.length) {
        if (uploadedVideos.length !== videosToUpload.length) {
          throw new Error('One or more videos failed to upload to Cloudinary.')
        }
        if (uploadedVideos.some((u) => !u || !isCloudinaryUrl(u))) {
          throw new Error('Video upload did not return a Cloudinary URL.')
        }
      }

      setItems((prev) => {
        let imgIdx = 0
        let vidIdx = 0
        const next = prev
          .map((i) => {
            if (!tempIds.includes(i.id)) return i
            if (i.kind === 'image') {
              const url = uploaded[imgIdx]
              imgIdx += 1
              if (i.url?.startsWith('blob:')) URL.revokeObjectURL(i.url)
              if (!url || !isCloudinaryUrl(url)) return null
              return { ...i, url, uploading: false, uploadProgress: undefined }
            }
            if (i.kind === 'video') {
              const url = uploadedVideos[vidIdx]
              vidIdx += 1
              if (i.url?.startsWith('blob:')) URL.revokeObjectURL(i.url)
              if (!url || !isCloudinaryUrl(url)) return null
              return {
                ...i,
                url,
                uploading: false,
                uploadProgress: undefined,
                uploadPhase: undefined,
              }
            }
            return i
          })
          .filter(Boolean)

        const withPrimary = next.some((x) => x.kind === 'image' && x.isPrimary)
          ? next
          : next.map((x) =>
              x.kind === 'image'
                ? { ...x, isPrimary: x.id === next.find((y) => y.kind === 'image')?.id }
                : x,
            )
        onChange?.(derivePayload(withPrimary))
        return withPrimary
      })
    } catch (err) {
      emitError(err?.message || 'Upload failed.')
      setItems((prev) => {
        const cleaned = prev.filter((i) => !tempIds.includes(i.id))
        onChange?.(derivePayload(cleaned))
        return cleaned
      })
    } finally {
      setUploading(false)
      setBatchProgress(null)
    }
  }

  const handleZoneDrop = (e) => {
    e.preventDefault()
    setZoneActive(false)
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files)
  }

  const handleReorder = (from, to) => {
    if (from === to || from == null || to == null) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    syncOut(next)
  }

  const handleSetPrimary = (id) => {
    syncOut(
      items.map((i) => ({
        ...i,
        isPrimary: i.kind === 'image' && i.id === id,
      })),
    )
  }

  const handleDelete = (id) => {
    const target = items.find((i) => i.id === id)
    if (target?.url?.startsWith('blob:')) URL.revokeObjectURL(target.url)
    let next = items.filter((i) => i.id !== id)
    if (target?.isPrimary) {
      const firstImage = next.find((i) => i.kind === 'image')
      if (firstImage) {
        next = next.map((i) => ({
          ...i,
          isPrimary: i.kind === 'image' && i.id === firstImage.id,
        }))
      }
    }
    syncOut(next)
  }

  const handleReplace = (item) => {
    replaceTargetRef.current = item.id
    if (replaceRef.current) {
      replaceRef.current.accept = item.kind === 'video' ? 'video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm' : 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp'
      replaceRef.current.click()
    }
  }

  return (
    <section className="space-y-4">
      {cloudinaryReady === false ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm font-semibold text-amber-900 backdrop-blur-sm">
          Cloudinary is not connected. Add{' '}
          <code className="rounded bg-amber-100 px-1 text-xs">CLOUDINARY_CLOUD_NAME</code>,{' '}
          <code className="rounded bg-amber-100 px-1 text-xs">CLOUDINARY_API_KEY</code>, and{' '}
          <code className="rounded bg-amber-100 px-1 text-xs">CLOUDINARY_API_SECRET</code> to{' '}
          <code className="rounded bg-amber-100 px-1 text-xs">backend/.env</code>, then restart the API server.
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">
            Media Manager
          </h4>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Drag files here or reorder cards — first image can be set as primary for listings.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
            {imageCount} photo{imageCount === 1 ? '' : 's'}
          </span>
          {videoCount > 0 ? (
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-600">
              {videoCount} video{videoCount === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setZoneActive(true)
        }}
        onDragLeave={() => setZoneActive(false)}
        onDrop={handleZoneDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
          zoneActive
            ? 'border-blue-500 bg-blue-50/40 shadow-inner shadow-blue-200/30'
            : 'border-slate-300/80 bg-gradient-to-br from-slate-50/90 via-white/70 to-blue-50/40 hover:border-blue-400/70 hover:shadow-md'
        } backdrop-blur-xl`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) processFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <input
          ref={replaceRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const id = replaceTargetRef.current
            if (e.target.files?.length && id) processFiles(e.target.files, { replaceId: id })
            e.target.value = ''
            replaceTargetRef.current = null
          }}
        />

        <div className="pointer-events-none flex flex-col items-center px-6 py-8 text-center sm:py-10">
          <motion.div
            animate={{ scale: zoneActive ? 1.08 : 1 }}
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-blue-600 shadow-lg shadow-slate-200/60 backdrop-blur-md"
          >
            <UploadCloud size={28} strokeWidth={2.2} />
          </motion.div>
          <p className="text-sm font-black text-slate-800">
            Drop media here or click to upload
          </p>
          <p className="mt-2 max-w-md text-xs font-semibold leading-relaxed text-slate-500">
            JPG, PNG, WEBP · MP4, MOV, WEBM · Images are compressed before upload · Video max{' '}
            {formatMegabytes(MAX_VIDEO_FILE_BYTES)}
          </p>
          {!hasPrimary && imageCount > 0 ? (
            <p className="mt-2 text-xs font-bold text-amber-600">Set a primary image for the listing.</p>
          ) : null}
        </div>

        {(uploading || batchProgress) && (
          <div className="absolute inset-x-0 bottom-0 border-t border-white/50 bg-white/75 px-4 py-3 backdrop-blur-md">
            <div className="mb-1 flex justify-between text-[11px] font-bold text-slate-600">
              <span>
                {batchProgress?.label === 'videos' || batchProgress?.label === 'video'
                  ? `Uploading video${batchProgress?.total > 1 ? 's' : ''}…`
                  : batchProgress
                    ? `Uploading ${batchProgress.label} (${batchProgress.done}/${batchProgress.total})`
                    : 'Uploading…'}
              </span>
              <span>
                {batchProgress?.total
                  ? `${Math.round((batchProgress.done / batchProgress.total) * 100)}%`
                  : '—'}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                initial={false}
                animate={{
                  width: batchProgress?.total
                    ? `${(batchProgress.done / batchProgress.total) * 100}%`
                    : '40%',
                }}
                transition={{ duration: 0.25 }}
              />
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {items.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {items.map((item, index) => (
              <MediaCard
                key={item.id}
                item={item}
                index={index}
                dragIndex={dragIndex}
                onDragStart={(_, idx) => setDragIndex(idx)}
                onDragOver={(e, idx) => {
                  e.preventDefault()
                  if (dragIndex !== null && dragIndex !== idx) setDragIndex(idx)
                }}
                onDrop={(e, idx) => {
                  e.preventDefault()
                  handleReorder(dragIndex, idx)
                  setDragIndex(null)
                }}
                onDragEnd={() => setDragIndex(null)}
                onSetPrimary={handleSetPrimary}
                onReplace={handleReplace}
                onDelete={handleDelete}
                onPlayVideo={setVideoModal}
              />
            ))}
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-sm font-semibold text-slate-500"
          >
            No media yet — add at least one product image (primary) to publish.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {videoModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
            onClick={() => setVideoModal(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setVideoModal(null)}
                className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <video src={videoModal.url} controls autoPlay className="max-h-[70vh] w-full rounded-xl" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
