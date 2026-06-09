import { normalizeModelConditionGrades } from './modelConditionGrades.js'

function formatSpecValue(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v.trim()
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) {
    const items = v.map((x) => (typeof x === 'string' ? x.trim() : String(x))).filter(Boolean)
    return items.length ? items.join(', ') : ''
  }
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

function formatSpecLabel(key) {
  return String(key || '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

const HIGHLIGHT_KEYS = [
  ['display', 'Display'],
  ['camera', 'Camera'],
  ['processor', 'Processor'],
  ['battery', 'Battery'],
  ['ram', 'RAM'],
  ['storage', 'Storage'],
]

/** Up to 4 highlight cards from model specifications. */
export function buildProductHighlights(specifications) {
  const spec = specifications && typeof specifications === 'object' ? specifications : {}
  const highlights = []
  const used = new Set()

  for (const [key, label] of HIGHLIGHT_KEYS) {
    const value = formatSpecValue(spec[key])
    if (!value) continue
    highlights.push({ label, value })
    used.add(key)
  }

  for (const [key, raw] of Object.entries(spec)) {
    if (highlights.length >= 4) break
    if (used.has(key)) continue
    const value = formatSpecValue(raw)
    if (!value) continue
    highlights.push({ label: formatSpecLabel(key), value })
    used.add(key)
  }

  return highlights.slice(0, 4)
}

/** Short spec line under the title (display, processor, etc.). */
export function buildProductSpecLine(specifications) {
  const spec = specifications && typeof specifications === 'object' ? specifications : {}
  const display = formatSpecValue(spec.display)
  if (display) return display
  const parts = ['processor', 'camera', 'battery']
    .map((k) => formatSpecValue(spec[k]))
    .filter(Boolean)
  return parts[0] || '—'
}

/** Normalize public offers API payload to an array. */
export function normalizeOffersList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const CONDITION_LABELS = {
  EXCELLENT: 'Superb',
  GOOD: 'Good',
  AVERAGE: 'Fair',
  BROKEN: 'Fair',
}

const CONDITION_DESC = {
  EXCELLENT: 'Like new condition',
  GOOD: 'Minor signs of use',
  AVERAGE: 'Noticeable signs of use',
}

const MODEL_GRADE_META = {
  Superb: { id: 'EXCELLENT', desc: CONDITION_DESC.EXCELLENT },
  Good: { id: 'GOOD', desc: CONDITION_DESC.GOOD },
  Fair: { id: 'AVERAGE', desc: CONDITION_DESC.AVERAGE },
}

function inventoryItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  return []
}

/**
 * Build condition picker from model.conditionGrades + optional inventory prices.
 * @returns {{ grades: { id, label, desc, apiType, price? }[], defaultId: string, pricesByGrade: Record<string, number> }}
 */
export function buildModelConditionGrades(model, inventoryPayload) {
  const selected = normalizeModelConditionGrades(model?.conditionGrades)

  const pricesByGrade = {}
  for (const row of inventoryItems(inventoryPayload)) {
    if (row?.isSold || !(Number(row?.stock) > 0)) continue
    const g = String(row.conditionGrade || '').toUpperCase()
    const p = Number(row.price) || 0
    if (!g || p <= 0) continue
    if (pricesByGrade[g] == null || p < pricesByGrade[g]) pricesByGrade[g] = p
  }

  let grades = selected.map((label) => {
    const meta = MODEL_GRADE_META[label] || { id: label, desc: '' }
    const price = pricesByGrade[meta.id]
    return {
      id: meta.id,
      apiType: meta.id,
      label,
      desc: meta.desc,
      ...(price != null ? { price } : {}),
    }
  })

  return {
    grades,
    pricesByGrade,
    defaultId: grades[0]?.id || 'EXCELLENT',
  }
}

export function conditionDisplayLabel(conditionId, grades) {
  const row = (grades || []).find((g) => g.id === conditionId)
  return row?.label || CONDITION_LABELS[String(conditionId || '').toUpperCase()] || conditionId || '—'
}
