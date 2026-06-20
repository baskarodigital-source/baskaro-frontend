import * as api from './api/baskaroApi.js'

function mapCatalogAttribute(attr) {
  const code = String(attr?.code || attr?.name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  const type = attr?.type === 'select' || attr?.type === 'multiselect' ? 'dropdown' : attr?.type || 'text'
  return {
    key: code,
    name: attr?.name || code,
    type,
    required: Boolean(attr?.isRequired),
    options: (Array.isArray(attr?.values) ? attr.values : [])
      .map((opt) => opt?.label || opt?.value)
      .filter(Boolean),
    source: 'catalog',
  }
}

function mapDeviceSpec(s) {
  return {
    key: s.key || '',
    name: s.name || s.label || '',
    type: s.type || 'text',
    required: !!s.required,
    options: Array.isArray(s.options) ? s.options : [],
    source: 'device',
  }
}

function mapTemplateSpec(s) {
  return {
    key: s.key || s.id || '',
    name: s.name || s.label || '',
    type: s.type || 'text',
    required: !!s.required,
    options: Array.isArray(s.options) ? s.options : [],
    source: 'template',
  }
}

function mergeSpecs(lists) {
  const merged = []
  const seen = new Set()
  for (const list of lists) {
    for (const row of list) {
      const key = String(row?.key || '').trim()
      if (!key || seen.has(key)) continue
      seen.add(key)
      merged.push(row)
    }
  }
  return merged
}

/** Load merged spec field definitions for a catalog product (device + template + attributes). */
export async function loadMergedProductSpecs({
  categoryId = '',
  ribbonCategoryId = '',
  deviceId = '',
} = {}) {
  const [deviceRes, catalogAttrs, templateRes] = await Promise.all([
    deviceId ? api.getDeviceSpecifications(deviceId).catch(() => []) : Promise.resolve([]),
    categoryId
      ? api.getAttributes({ categoryId, includeInactive: 'false' }).catch(() => [])
      : Promise.resolve([]),
    ribbonCategoryId ? api.getSpecifications(ribbonCategoryId).catch(() => []) : Promise.resolve([]),
  ])

  const deviceList = (Array.isArray(deviceRes) ? deviceRes : Array.isArray(deviceRes?.data) ? deviceRes.data : [])
    .map(mapDeviceSpec)
    .filter((s) => s.key && s.name)

  const catalogList = (Array.isArray(catalogAttrs) ? catalogAttrs : [])
    .filter((a) => !a?.isVariantAxis && a?.showOnProduct !== false)
    .map(mapCatalogAttribute)
    .filter((s) => s.key && s.name)

  const templateList = (Array.isArray(templateRes) ? templateRes : Array.isArray(templateRes?.data) ? templateRes.data : [])
    .map(mapTemplateSpec)
    .filter((s) => s.key && s.name)

  return mergeSpecs([deviceList, templateList, catalogList])
}
