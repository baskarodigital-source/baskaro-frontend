/** Build query string for sell wizard steps (preserves evaluation state in the URL). */
export function buildSellFlowSearch(params) {
  const sp = new URLSearchParams()
  const entries = [
    ['item', params.item],
    ['cat', params.cat || 'phone'],
    ['price', params.price],
    ['img', params.img],
    ['calls', params.calls],
    ['touch', params.touch],
    ['screen', params.screen],
    ['defects', params.defects],
    ['functional', params.functional],
    ['accessories', params.accessories],
    ['modelId', params.modelId],
  ]
  for (const [key, value] of entries) {
    const v = String(value ?? '').trim()
    if (v) sp.set(key, v)
  }
  const q = sp.toString()
  return q ? `?${q}` : ''
}

export function readSellFlowParams(searchParams) {
  return {
    item: searchParams.get('item')?.trim() || 'Selected device',
    cat: searchParams.get('cat')?.trim() || 'phone',
    price: searchParams.get('price')?.trim() || '0',
    img: searchParams.get('img')?.trim() || '',
    calls: searchParams.get('calls')?.trim() || '',
    touch: searchParams.get('touch')?.trim() || '',
    screen: searchParams.get('screen')?.trim() || '',
    defects: searchParams.get('defects')?.trim() || '',
    functional: searchParams.get('functional')?.trim() || '',
    accessories: searchParams.get('accessories')?.trim() || '',
    modelId: searchParams.get('modelId')?.trim() || '',
  }
}

export function parsePriceNumber(raw) {
  const n = Number(String(raw || '').replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function formatInr(n) {
  return parsePriceNumber(n).toLocaleString('en-IN')
}

/** Client-side estimate from wizard answers (inspection may adjust later). */
export function computeSellQuotePrice(basePrice, answers) {
  let price = parsePriceNumber(basePrice)
  if (!price) return 0

  if (answers.calls === 'no') price = Math.round(price * 0.65)
  if (answers.touch === 'no') price = Math.round(price * 0.92)
  if (answers.screen === 'no') price = Math.round(price * 0.9)

  const defectCount = answers.defects ? answers.defects.split(',').filter(Boolean).length : 0
  const functionalCount = answers.functional ? answers.functional.split(',').filter(Boolean).length : 0

  price -= defectCount * Math.min(3500, Math.round(price * 0.04))
  price -= functionalCount * Math.min(4500, Math.round(price * 0.05))

  const hasBox = answers.accessories?.split(',').includes('box-imei')
  if (hasBox) price += Math.round(price * 0.02)

  return Math.max(500, Math.round(price))
}
