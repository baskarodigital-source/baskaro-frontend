export function patchProductForm(setForm, patch) {
  setForm((prev) => Object.assign({}, prev, patch))
}

export function setProductFormField(setForm, field, value) {
  patchProductForm(setForm, { [field]: value })
}

export function clearProductFormErrors(setErrors, fields) {
  const keys = Array.isArray(fields) ? fields : [fields]
  setErrors((prev) => {
    const next = Object.assign({}, prev)
    keys.forEach((field) => {
      next[field] = ''
    })
    return next
  })
}

export function getBrandSelectPlaceholder({ category, ribbonCategoryId, brandsLoading }) {
  if (!category) return 'Select category first'
  if (!ribbonCategoryId) return 'Category not linked'
  if (brandsLoading) return 'Loading brands...'
  return '2. Select brand'
}

export function getDeviceSelectPlaceholder({ brandId, devicesLoading }) {
  if (!brandId) return 'Select brand first'
  if (devicesLoading) return 'Loading devices...'
  return '3. Select device'
}
