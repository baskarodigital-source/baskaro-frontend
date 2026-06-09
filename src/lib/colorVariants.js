/** Stable string id for color variant matching (API / Mongo subdocs). */
export function colorVariantId(row, idx = 0) {
  return String(row?._id || row?.id || idx + 1)
}

/** Normalize hex for swatch backgrounds. */
export function normalizeHexColor(hex) {
  const h = String(hex || '').trim()
  if (/^#[0-9A-Fa-f]{6}$/.test(h)) return h
  if (/^#[0-9A-Fa-f]{3}$/.test(h)) return h
  if (/^[0-9A-Fa-f]{6}$/.test(h)) return `#${h}`
  return '#cccccc'
}

/** Collect unique image URLs for a color row (legacy \`image\` + \`images[]\`). */
export function colorVariantImageUrls(row) {
  const list = []
  const seen = new Set()
  const push = (raw) => {
    const u = String(raw || '').trim()
    if (!u || seen.has(u)) return
    seen.add(u)
    list.push(u)
  }
  push(row?.image)
  if (Array.isArray(row?.images)) row.images.forEach(push)
  return list
}

/** Collect video URLs for a color row. */
export function colorVariantVideoUrls(row) {
  const list = []
  const seen = new Set()
  const push = (raw) => {
    const u = String(raw || '').trim()
    if (!u || seen.has(u)) return
    seen.add(u)
    list.push(u)
  }
  if (Array.isArray(row?.videoUrls)) row.videoUrls.forEach(push)
  push(row?.videoUrl)
  return list
}

/** API / model document → PDP + admin list. */
export function normalizeColorVariants(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .map((row, idx) => {
      const images = colorVariantImageUrls(row)
      const videoUrls = colorVariantVideoUrls(row)
      return {
        id: colorVariantId(row, idx),
        name: String(row?.name || '').trim(),
        hex: normalizeHexColor(row?.hex),
        image: images[0] || '',
        images,
        videoUrls,
      }
    })
    .filter((c) => c.name && c.images.length)
}

export function emptyColorVariantDraft() {
  return {
    _localId: `color-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    hex: '#1c1c1e',
    image: '',
    images: [],
    videoUrls: [],
  }
}

/** Admin edit form — load all API rows (do not use PDP `normalizeColorVariants` filter). */
export function loadColorVariantDraftsFromModel(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map((row, idx) =>
    toColorVariantDraft({
      _localId: row?._id ? `color-${row._id}` : row?.id ? `color-${row.id}` : undefined,
      id: row?._id || row?.id || idx,
      name: row?.name,
      hex: row?.hex,
      image: row?.image,
      images: colorVariantImageUrls(row),
      videoUrls: colorVariantVideoUrls(row),
    }),
  )
}

/** Admin draft row — always keeps `image` + `images[]` in sync. */
export function toColorVariantDraft(row) {
  const images = row?.images?.length
    ? [...row.images].filter(Boolean)
    : row?.image
      ? [String(row.image).trim()].filter(Boolean)
      : []
  return {
    _localId: row?._localId || `color-${row?.id || row?._id || Date.now()}`,
    name: String(row?.name || '').trim(),
    hex: normalizeHexColor(row?.hex),
    image: images[0] || '',
    images,
    videoUrls: [...(row?.videoUrls || [])],
  }
}
