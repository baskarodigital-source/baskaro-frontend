import { resolveHomeServiceImageUrl } from './api/baskaroApi.js'

/** Map `GET /api/pre-owned/featured` row for storefront cards. */
export function mapFeaturedPreOwnedRow(row) {
  if (!row?.id) return null
  return {
    id: row.id,
    inventoryId: row.id,
    image: row.imageUrl || '',
    title: row.title || 'Pre-Owned Device',
    name: row.title || 'Pre-Owned Device',
    price: formatInrPlain(row.priceInr),
    originalPrice: row.originalPriceInr != null ? formatInrPlain(row.originalPriceInr) : undefined,
    discount: row.discountPercent > 0 ? row.discountPercent : undefined,
    rating: row.rating != null && row.rating !== '' ? row.rating : undefined,
    tag: Array.isArray(row.tags) ? row.tags : [],
    brand: 'BASKARO',
    viewPath: row.viewPath || '',
  }
}

/** Map `GET /api/inventory` item for explore / service layouts. */
export function mapInventoryListingRow(row) {
  if (!row?._id) return null

  const model = row.modelId && typeof row.modelId === 'object' ? row.modelId : null
  const brand = row.brandId && typeof row.brandId === 'object' ? row.brandId : null
  const brandName = String(brand?.name || '').trim()
  const modelName = String(model?.modelName || '').trim()
  const slug = String(model?.slug || '').trim()
  const id = String(row._id)
  const price = Math.max(0, Math.round(Number(row.price) || 0))
  const mrp = Math.max(price + 1, Math.round(price * 1.12))

  const invImgs = Array.isArray(row.images) ? row.images.map((x) => String(x || '').trim()).filter(Boolean) : []
  const rawImg = invImgs[0] || String(model?.image || '').trim()
  const img = resolveHomeServiceImageUrl(rawImg) || rawImg

  const title = `${brandName} ${modelName}`.trim() || 'Pre-Owned Device'
  const viewPath =
    slug && id
      ? `/buy-pre-owned/product/phone/${encodeURIComponent(slug)}/${encodeURIComponent(id)}${
          model?._id ? `?modelId=${encodeURIComponent(String(model._id))}` : ''
        }`
      : ''

  return {
    id,
    inventoryId: id,
    name: `${title} - Refurbished`,
    title: `${title} - Refurbished`,
    img,
    image: img,
    brandSlug: String(brand?.slug || '').toLowerCase(),
    brandName: brandName.toLowerCase(),
    rating: 4.8,
    price,
    mrp,
    memberPrice: Math.max(0, price - 500),
    emi: Math.max(500, Math.round(price / 20)),
    stockLeft: Number(row.stock) || 0,
    lowestPrice: true,
    offAmount: Math.max(0, mrp - price),
    viewPath,
  }
}

function formatInrPlain(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return '—'
  return `₹${n.toLocaleString('en-IN')}`
}
