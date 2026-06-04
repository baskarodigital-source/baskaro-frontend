import { apiRequest, unwrap } from './client.js'
import { optimizeDeliveryUrl } from '../optimizeImageUrl.js'

// --- Health ---
export async function getHealth() {
  return apiRequest('/health')
}

export async function getApiHealth() {
  return apiRequest('/api/health')
}

// --- Catalog ---
export async function getCatalogBrands() {
  return unwrap(await apiRequest('/api/catalog/brands'))
}

/** Brands that actually have active phone models (used for Sell Phone + homepage brands). */
export async function getCatalogPhoneBrands() {
  return unwrap(await apiRequest('/api/catalog/phone-brands'))
}

export async function getCatalogModels(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/catalog/models?${q}`))
}

export async function getCatalogVariants(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/catalog/variants?${q}`))
}

export async function getCatalogStructure() {
  return unwrap(await apiRequest('/api/catalog/structure'))
}

// --- Homepage category ribbon (public list; admin CRUD requires auth) ---
export async function getRibbonCategories() {
  return unwrap(await apiRequest('/api/ribbon-categories'))
}

export async function getRibbonCategoriesAdmin() {
  return unwrap(await apiRequest('/api/ribbon-categories/all', { auth: true }))
}

export async function postRibbonCategory(body) {
  return unwrap(await apiRequest('/api/ribbon-categories', { method: 'POST', body, auth: true }))
}

export async function patchRibbonCategory(id, body) {
  return unwrap(await apiRequest(`/api/ribbon-categories/${encodeURIComponent(id)}`, { method: 'PATCH', body, auth: true }))
}

export async function deleteRibbonCategory(id) {
  return unwrap(await apiRequest(`/api/ribbon-categories/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true }))
}

// --- Auth ---
export async function requestOtp(body) {
  return apiRequest('/api/auth/otp/request', { method: 'POST', body })
}

export async function registerPhone(body) {
  return apiRequest('/api/auth/otp/register', { method: 'POST', body })
}

export async function verifyOtp(body) {
  return apiRequest('/api/auth/otp/verify', { method: 'POST', body })
}

export async function registerEmail(body) {
  return apiRequest('/api/auth/email/register', { method: 'POST', body })
}

export async function loginEmail(body) {
  return apiRequest('/api/auth/email/login', { method: 'POST', body })
}

export async function getMe() {
  return apiRequest('/api/auth/me', { auth: true })
}

/** Returns backend JSON (e.g. `{ ok: true, user }` or `{ error }`). */
export async function patchMe(body) {
  return apiRequest('/api/auth/me', { method: 'PATCH', body, auth: true })
}

// --- Pricing ---
export async function postPricingEstimate(body) {
  return apiRequest('/api/pricing/estimate', { method: 'POST', body })
}

// --- Legacy orders ---
export async function postOrder(body) {
  return unwrap(await apiRequest('/api/orders', { method: 'POST', body, auth: true }))
}

export async function getMyOrders() {
  return unwrap(await apiRequest('/api/orders', { auth: true }))
}

export async function patchOrderPayment(orderId, body) {
  return unwrap(await apiRequest(`/api/orders/${orderId}/payment`, { method: 'PATCH', body, auth: true }))
}

// --- Addresses (raw JSON, not successResponse wrapper) ---
export async function getAddresses() {
  return apiRequest('/api/addresses', { auth: true })
}

export async function postAddress(body) {
  return apiRequest('/api/addresses', { method: 'POST', body, auth: true })
}

export async function deleteAddress(addressId) {
  return apiRequest(`/api/addresses/${addressId}`, { method: 'DELETE', auth: true })
}

// --- Admin (legacy orders & catalog) ---
export async function adminGetOrders(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/admin/orders?${q}`, { auth: true }))
}

export async function adminPatchOrder(orderId, body) {
  return unwrap(await apiRequest(`/api/admin/orders/${orderId}`, { method: 'PATCH', body, auth: true }))
}

export async function adminDeleteOrder(orderId) {
  return unwrap(await apiRequest(`/api/admin/orders/${orderId}`, { method: 'DELETE', auth: true }))
}

export async function adminGetCatalog() {
  return unwrap(await apiRequest('/api/admin/catalog', { auth: true }))
}

export async function adminPatchVariant(variantId, body) {
  return unwrap(await apiRequest(`/api/admin/catalog/variants/${variantId}`, { method: 'PATCH', body, auth: true }))
}

// --- Dashboard ---
export async function dashboardStats() {
  return unwrap(await apiRequest('/api/dashboard/stats', { auth: true }))
}

export async function dashboardDailySales(days = 30) {
  return unwrap(await apiRequest(`/api/dashboard/daily-sales?days=${days}`, { auth: true }))
}

export async function dashboardMonthlyRevenue(months = 12) {
  return unwrap(await apiRequest(`/api/dashboard/monthly-revenue?months=${months}`, { auth: true }))
}

export async function dashboardTopSellingPhones(limit = 10) {
  return unwrap(await apiRequest(`/api/dashboard/top-selling-phones?limit=${limit}`, { auth: true }))
}

export async function dashboardOrderStatusDistribution() {
  return unwrap(await apiRequest('/api/dashboard/order-status-distribution', { auth: true }))
}

export async function dashboardRecentActivities(limit = 10) {
  return unwrap(await apiRequest(`/api/dashboard/recent-activities?limit=${limit}`, { auth: true }))
}

// --- Users ---
export async function getUsers(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/users?${q}`, { auth: true }))
}

export async function getUserById(userId) {
  return unwrap(await apiRequest(`/api/users/${userId}`, { auth: true }))
}

export async function blockUser(userId) {
  return unwrap(await apiRequest(`/api/users/${userId}/block`, { method: 'PATCH', auth: true }))
}

export async function unblockUser(userId) {
  return unwrap(await apiRequest(`/api/users/${userId}/unblock`, { method: 'PATCH', auth: true }))
}

export async function patchUserRole(userId, body) {
  return unwrap(await apiRequest(`/api/users/${userId}/role`, { method: 'PATCH', body, auth: true }))
}

export async function deleteUser(userId) {
  return unwrap(await apiRequest(`/api/users/${userId}`, { method: 'DELETE', auth: true }))
}

// --- Mobile (brands & models) ---
export async function getMobileBrands(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/mobile/brands?${q}`))
}

export async function getMobileBrand(brandId) {
  return unwrap(await apiRequest(`/api/mobile/brands/${brandId}`))
}

export async function postMobileBrand(body) {
  return unwrap(await apiRequest('/api/mobile/brands', { method: 'POST', body, auth: true }))
}

export async function patchMobileBrand(brandId, body) {
  return unwrap(await apiRequest(`/api/mobile/brands/${brandId}`, { method: 'PATCH', body, auth: true }))
}

export async function deleteMobileBrand(brandId) {
  return unwrap(await apiRequest(`/api/mobile/brands/${brandId}`, { method: 'DELETE', auth: true }))
}

export async function getMobileModels(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/mobile/models?${q}`))
}

export async function getBrandDevices(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/mobile/devices?${q}`))
}

// --- Device specifications (by deviceId) ---
export async function getDeviceSpecifications(deviceId) {
  return unwrap(await apiRequest(`/api/device-specifications/${encodeURIComponent(deviceId)}`))
}

export async function postDeviceSpecification(body) {
  return unwrap(await apiRequest('/api/device-specifications', { method: 'POST', body, auth: true }))
}

export async function postDeviceSpecificationOption(body) {
  return unwrap(await apiRequest('/api/device-specifications/options', { method: 'POST', body, auth: true }))
}

export async function patchDeviceSpecification(specId, body) {
  return unwrap(await apiRequest(`/api/device-specifications/${encodeURIComponent(specId)}`, { method: 'PATCH', body, auth: true }))
}

export async function deleteDeviceSpecification(specId) {
  return unwrap(await apiRequest(`/api/device-specifications/${encodeURIComponent(specId)}`, { method: 'DELETE', auth: true }))
}

export async function deleteDeviceSpecificationOption(optionId) {
  return unwrap(await apiRequest(`/api/device-specifications/options/${encodeURIComponent(optionId)}`, { method: 'DELETE', auth: true }))
}

export async function postBrandDevice(body) {
  return unwrap(await apiRequest('/api/mobile/devices', { method: 'POST', body, auth: true }))
}

export async function patchBrandDevice(deviceId, body) {
  return unwrap(await apiRequest(`/api/mobile/devices/${deviceId}`, { method: 'PATCH', body, auth: true }))
}

export async function deleteBrandDevice(deviceId) {
  return unwrap(await apiRequest(`/api/mobile/devices/${deviceId}`, { method: 'DELETE', auth: true }))
}

export async function getMobileModel(modelId) {
  return unwrap(await apiRequest(`/api/mobile/models/${modelId}`))
}

export async function postMobileModel(body) {
  return unwrap(await apiRequest('/api/mobile/models', { method: 'POST', body, auth: true }))
}

export async function patchMobileModel(modelId, body) {
  const id = encodeURIComponent(String(modelId || '').trim())
  return unwrap(await apiRequest(`/api/mobile/models/${id}`, { method: 'PATCH', body, auth: true }))
}

export async function deleteMobileModel(modelId) {
  return unwrap(await apiRequest(`/api/mobile/models/${modelId}`, { method: 'DELETE', auth: true }))
}

// --- Specifications (dynamic model form) ---
export async function getSpecifications(categoryId) {
  return unwrap(await apiRequest(`/api/specifications/${encodeURIComponent(categoryId)}`))
}

// --- Device condition ---
export async function postDeviceConditionCalculate(body) {
  return unwrap(await apiRequest('/api/device-condition/calculate', { method: 'POST', body }))
}

export async function getDeviceConditionByType(conditionType) {
  return unwrap(await apiRequest(`/api/device-condition/${encodeURIComponent(conditionType)}`))
}

export async function getDeviceConditions() {
  return unwrap(await apiRequest('/api/device-condition/', { auth: true }))
}

export async function postDeviceCondition(body) {
  return unwrap(await apiRequest('/api/device-condition/', { method: 'POST', body, auth: true }))
}

export async function patchDeviceCondition(conditionId, body) {
  return unwrap(await apiRequest(`/api/device-condition/${conditionId}`, { method: 'PATCH', body, auth: true }))
}

export async function deleteDeviceCondition(conditionId) {
  return unwrap(await apiRequest(`/api/device-condition/${conditionId}`, { method: 'DELETE', auth: true }))
}

// --- Order management ---
export async function postOrderManagement(body) {
  return unwrap(await apiRequest('/api/order-management', { method: 'POST', body, auth: true }))
}

export async function getOrderManagementList(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/order-management?${q}`, { auth: true }))
}

export async function getOrderManagementById(orderId) {
  return unwrap(await apiRequest(`/api/order-management/${orderId}`, { auth: true }))
}

export async function patchOrderManagementStatus(orderId, body) {
  return unwrap(await apiRequest(`/api/order-management/${orderId}/status`, { method: 'PATCH', body, auth: true }))
}

export async function patchOrderManagementCancel(orderId, body) {
  return unwrap(await apiRequest(`/api/order-management/${orderId}/cancel`, { method: 'PATCH', body, auth: true }))
}

export async function postOrderManagementApplyCoupon(orderId, body) {
  return unwrap(await apiRequest(`/api/order-management/${orderId}/apply-coupon`, { method: 'POST', body, auth: true }))
}

// --- Pickup ---
export async function postPickup(body) {
  return unwrap(await apiRequest('/api/pickup', { method: 'POST', body, auth: true }))
}

export async function getPickupByOrderId(orderId) {
  return unwrap(await apiRequest(`/api/pickup/order/${orderId}`, { auth: true }))
}

export async function patchPickupStatus(pickupId, body) {
  return unwrap(await apiRequest(`/api/pickup/${pickupId}/status`, { method: 'PATCH', body, auth: true }))
}

export async function patchPickupAssignAgent(pickupId, body) {
  return unwrap(await apiRequest(`/api/pickup/${pickupId}/assign-agent`, { method: 'PATCH', body, auth: true }))
}

// --- Payments ---
export async function getPayments(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/payments?${q}`, { auth: true }))
}

export async function postPaymentInitiate(body) {
  return unwrap(await apiRequest('/api/payments/initiate', { method: 'POST', body, auth: true }))
}

export async function getPaymentsByOrder(orderId) {
  return unwrap(await apiRequest(`/api/payments/order/${orderId}`, { auth: true }))
}

export async function patchPaymentStatus(paymentId, body) {
  return unwrap(await apiRequest(`/api/payments/${paymentId}/status`, { method: 'PATCH', body, auth: true }))
}

// --- Inventory ---
export async function getInventory(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/inventory?${q}`))
}

export async function getInventoryById(inventoryId) {
  return unwrap(await apiRequest(`/api/inventory/${inventoryId}`))
}

export async function postInventory(body) {
  return unwrap(await apiRequest('/api/inventory', { method: 'POST', body, auth: true }))
}

export async function patchInventoryStock(inventoryId, body) {
  return unwrap(await apiRequest(`/api/inventory/${inventoryId}/stock`, { method: 'PATCH', body, auth: true }))
}

export async function patchInventoryPrice(inventoryId, body) {
  return unwrap(await apiRequest(`/api/inventory/${inventoryId}/price`, { method: 'PATCH', body, auth: true }))
}

export async function patchInventoryMarkSold(inventoryId) {
  return unwrap(await apiRequest(`/api/inventory/${inventoryId}/mark-sold`, { method: 'PATCH', auth: true }))
}

// --- Coupons ---
export async function getCouponByCode(code) {
  return unwrap(await apiRequest(`/api/coupons/code/${encodeURIComponent(code)}`))
}

export async function getCoupons(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/coupons?${q}`, { auth: true }))
}

export async function getCouponById(couponId) {
  return unwrap(await apiRequest(`/api/coupons/${couponId}`, { auth: true }))
}

export async function postCoupon(body) {
  return unwrap(await apiRequest('/api/coupons', { method: 'POST', body, auth: true }))
}

export async function patchCoupon(couponId, body) {
  return unwrap(await apiRequest(`/api/coupons/${couponId}`, { method: 'PATCH', body, auth: true }))
}

export async function patchCouponDisable(couponId) {
  return unwrap(await apiRequest(`/api/coupons/${couponId}/disable`, { method: 'PATCH', auth: true }))
}

export async function deleteCoupon(couponId) {
  return unwrap(await apiRequest(`/api/coupons/${couponId}`, { method: 'DELETE', auth: true }))
}

// --- Banners ---
export async function getBanners(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/banners?${q}`))
}

export async function getBanner(bannerId) {
  return unwrap(await apiRequest(`/api/banners/${bannerId}`))
}

export async function postBanner(body) {
  return unwrap(await apiRequest('/api/banners', { method: 'POST', body, auth: true }))
}

export async function patchBanner(bannerId, body) {
  return unwrap(await apiRequest(`/api/banners/${bannerId}`, { method: 'PATCH', body, auth: true }))
}

export async function deleteBanner(bannerId) {
  return unwrap(await apiRequest(`/api/banners/${bannerId}`, { method: 'DELETE', auth: true }))
}

export async function patchBannerToggleStatus(bannerId, body) {
  return unwrap(await apiRequest(`/api/banners/${bannerId}/toggle-status`, { method: 'PATCH', body, auth: true }))
}

// --- Product offers (public list + admin CRUD) ---
export async function getOffers(params = {}) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(q ? `/api/offers?${q}` : '/api/offers'))
}

export async function getOffersAdmin(params = {}) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/offers/admin/all?${q}`, { auth: true }))
}

export async function postOffer(body) {
  return unwrap(await apiRequest('/api/offers/admin', { method: 'POST', body, auth: true }))
}

export async function patchOffer(id, body) {
  return unwrap(await apiRequest(`/api/offers/admin/${encodeURIComponent(id)}`, { method: 'PATCH', body, auth: true }))
}

export async function deleteOffer(id) {
  return unwrap(await apiRequest(`/api/offers/admin/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true }))
}

// --- Homepage flash deals (public list + admin CRUD) ---
export async function getFlashDeals() {
  return unwrap(await apiRequest('/api/flash-deals'))
}

export async function getFlashDealsAdmin(params = {}) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/flash-deals/admin/all?${q}`, { auth: true }))
}

export async function postFlashDeal(body) {
  return unwrap(await apiRequest('/api/flash-deals/admin', { method: 'POST', body, auth: true }))
}

export async function patchFlashDeal(id, body) {
  return unwrap(await apiRequest(`/api/flash-deals/admin/${encodeURIComponent(id)}`, { method: 'PATCH', body, auth: true }))
}

export async function deleteFlashDeal(id) {
  return unwrap(await apiRequest(`/api/flash-deals/admin/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true }))
}

export async function getFlashDealSection() {
  return unwrap(await apiRequest('/api/flash-deals/section'))
}

export async function patchFlashDealSection(body) {
  return unwrap(await apiRequest('/api/flash-deals/admin/section', { method: 'PATCH', body, auth: true }))
}

// --- Cloudinary uploads (admin) ---
export async function getCloudinaryUploadStatus() {
  return apiRequest('/api/uploads/status')
}

export async function uploadImageToCloudinary(body) {
  return apiRequest('/api/uploads/image', { method: 'POST', body, auth: true })
}

// --- Homepage services (public list + admin CRUD) ---
/** Resolves image URLs: Cloudinary HTTPS, data URLs, or relative paths via `VITE_API_URL`. */
export function resolveHomeServiceImageUrl(raw, opts) {
  const t = String(raw ?? '').trim()
  if (!t) return ''
  let url = t
  if (/^https?:\/\//i.test(t) || t.startsWith('data:')) {
    url = t
  } else if (t.startsWith('/')) {
    const base = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
    url = base ? `${base}${t}` : t
  } else {
    const base = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
    url = base ? `${base}/${t.replace(/^\//, '')}` : t
  }
  return optimizeDeliveryUrl(url, opts)
}

export async function getFeaturedPreOwned(params = {}) {
  const q = new URLSearchParams()
  if (params.limit != null) q.set('limit', String(params.limit))
  const s = q.toString()
  return unwrap(await apiRequest(`/api/pre-owned/featured${s ? `?${s}` : ''}`))
}

export async function getHomeServices() {
  return unwrap(await apiRequest('/api/home-services'))
}

export async function getHomeServicesAdmin(params = {}) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/home-services/admin/all?${q}`, { auth: true }))
}

export async function postHomeService(body) {
  return unwrap(await apiRequest('/api/home-services/admin', { method: 'POST', body, auth: true }))
}

export async function patchHomeService(id, body) {
  return unwrap(await apiRequest(`/api/home-services/admin/${encodeURIComponent(id)}`, { method: 'PATCH', body, auth: true }))
}

export async function deleteHomeService(id) {
  return unwrap(await apiRequest(`/api/home-services/admin/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true }))
}

/** Public CMS blocks for service marketing pages (`repair-phone`, etc.). */
export async function getServicePageContent(pageKey) {
  const k = encodeURIComponent(String(pageKey || '').trim())
  return unwrap(await apiRequest(`/api/service-page/${k}`))
}

// --- Reports ---
export async function getReportSales(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/reports/sales?${q}`, { auth: true }))
}

export async function getReportMonthlyRevenue(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/reports/monthly-revenue?${q}`, { auth: true }))
}

export async function getReportMostSoldDevices(limit = 10) {
  return unwrap(await apiRequest(`/api/reports/most-sold-devices?limit=${limit}`, { auth: true }))
}

export async function getReportCustomerAnalytics() {
  return unwrap(await apiRequest('/api/reports/customer-analytics', { auth: true }))
}

export async function getReportPaymentAnalytics(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/reports/payment-analytics?${q}`, { auth: true }))
}

export async function getReportExport(params) {
  const q = new URLSearchParams(params).toString()
  return unwrap(await apiRequest(`/api/reports/export?${q}`, { auth: true }))
}
