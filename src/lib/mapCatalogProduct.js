export function formatCatalogInr(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return '—'
  return `₹${n.toLocaleString('en-IN')}`
}

export function pickCatalogVariant(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : []
  const active = variants.filter((v) => v?.isActive !== false)
  return active.find((v) => v?.isDefault) || active[0] || variants[0] || null
}

export function pickCatalogImage(product, variant) {
  const variantImg = Array.isArray(variant?.images) ? variant.images.find((i) => i?.url)?.url : ''
  if (variantImg) return String(variantImg).trim()
  const productImg = Array.isArray(product?.images) ? product.images.find((i) => i?.url)?.url : ''
  if (productImg) return String(productImg).trim()
  return ''
}

export function mapCatalogProductToCard(product) {
  const id = product?._id || product?.id
  if (!id) return null

  const variant = pickCatalogVariant(product)
  if (!variant) return null

  const price = Number(variant.price)
  if (!Number.isFinite(price) || price < 0) return null

  const compareAt = Number(variant.compareAtPrice)
  const hasCompare = Number.isFinite(compareAt) && compareAt > price
  const discount = hasCompare ? Math.round(((compareAt - price) / compareAt) * 100) : undefined

  const image = pickCatalogImage(product, variant)
  const title = [product?.name, variant?.title].filter(Boolean).join(' — ') || product?.name || 'Product'
  const brandName =
    (product?.brandId && typeof product.brandId === 'object' ? product.brandId.name : '') ||
    product?.brand ||
    'BASKARO'

  return {
    id: String(id),
    productId: String(id),
    itemType: 'catalog',
    image: image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop',
    title,
    price: formatCatalogInr(price),
    originalPrice: hasCompare ? formatCatalogInr(compareAt) : undefined,
    discount,
    brand: brandName,
    tag: Array.isArray(product?.tags) ? product.tags : [],
    stock: Number(variant.stock) || 0,
  }
}

export function normalizeCatalogProductList(payload) {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object' && Array.isArray(payload.items)) return payload.items
  return []
}
