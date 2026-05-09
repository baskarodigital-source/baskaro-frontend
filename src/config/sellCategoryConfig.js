/** Shared sell flows — category “home” pages use ServicePageLayout; keys match navbar slugs. */

export const PHONE_BRAND_FALLBACK = ['Apple', 'Xiaomi', 'Samsung', 'Vivo', 'OnePlus', 'OPPO', 'Realme', 'Motorola']

const HERO_IMG_PHONE =
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1200&auto=format&fit=crop'
const HERO_IMG_LAPTOP =
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop'
const HERO_IMG_GENERIC =
  'https://images.unsplash.com/photo-1550009158-9ebf69173e04?q=80&w=1200&auto=format&fit=crop'

export const HOW_IT_WORKS_DEFAULT = [
  {
    step: '1',
    title: 'Check Price',
    text: 'Select your device and current condition. Our pricing engine gives an instant estimate.',
  },
  {
    step: '2',
    title: 'Schedule Pickup',
    text: 'Book a free doorstep pickup at your preferred time slot.',
  },
  {
    step: '3',
    title: 'Get Paid',
    text: 'Receive instant payment right after pickup verification is completed.',
  },
]

export const WHY_US_DEFAULT = [
  { title: 'Best Prices', description: 'Objective AI-based pricing' },
  {
    title: 'Instant Payment',
    description: 'Instant Money Transfer in your preferred mode at time of pick up or store drop off',
  },
  { title: 'Simple & Convenient', description: 'Check price, schedule pickup & get paid' },
  {
    title: 'Free Doorstep Pickup',
    description: 'No fees for pickup across 1500 cities across India',
  },
  { title: 'Factory Grade Data Wipe', description: '100% Safe and Data Security Guaranteed' },
  { title: 'Valid Purchase Invoice', description: 'Genuine Bill of Sale' },
]

export const STORIES_DEFAULT = [
  'I loved that pickup was from my home and payment was instant. Super convenient.',
  'Local buyers were low-balling. Here I got a fair value in minutes.',
  'Great process, clear checks, fast payout, and professional team.',
]

export const FAQS_DEFAULT = [
  'How do I know the price of my old phone?',
  'What should I do if my old device is not turning on?',
  'Can I cancel my sale if I change my mind?',
  'Is doorstep pickup really free?',
]

/**
 * @typedef {Object} SellCategoryConfig
 * @property {string} breadcrumb
 * @property {string} title
 * @property {string[]} heroPills
 * @property {string} searchLabel
 * @property {string} searchPlaceholder
 * @property {string} searchButtonText
 * @property {string} [brandPickerSubtitle]
 * @property {boolean} [useCatalogBrands]
 * @property {string[]} [brandsStatic]
 * @property {string} heroImageUrl
 * @property {string} [heroImageAlt]
 * @property {boolean} [showHotDeals]
 * @property {boolean} [showTopSellingPhones]
 */

/** @type {Record<string, SellCategoryConfig>} */
export const SELL_CATEGORY_CONFIG = {
  phone: {
    breadcrumb: 'Home / Sell Old Mobile Phone',
    title: 'Sell Old Mobile Phone for Instant Cash',
    heroPills: ['Maximum Value', 'Safe & Hassle-free', 'Free Doorstep Pickup'],
    searchLabel: 'Search your Mobile Phone to sell',
    searchPlaceholder: 'Search model name...',
    searchButtonText: 'Check Price',
    brandPickerSubtitle: 'Or choose a brand',
    useCatalogBrands: true,
    heroImageUrl: HERO_IMG_PHONE,
    heroImageAlt: 'Sell old phone',
    showHotDeals: true,
    showTopSellingPhones: true,
  },
  laptops: {
    breadcrumb: 'Home / Sell Laptop',
    title: 'Sell Your Laptop for Instant Cash',
    heroPills: ['Fair valuation', 'Free pickup', 'Quick payment'],
    searchLabel: 'Search your laptop to sell',
    searchPlaceholder: 'e.g. MacBook Air, ThinkPad, Pavilion...',
    searchButtonText: 'Check Price',
    brandPickerSubtitle: 'Or choose a brand',
    useCatalogBrands: false,
    brandsStatic: ['Apple', 'HP', 'Dell', 'Lenovo', 'Samsung', 'More Brands'],
    heroImageUrl: HERO_IMG_LAPTOP,
    heroImageAlt: 'Sell laptop',
    showHotDeals: false,
    showTopSellingPhones: false,
  },
  'smart-speaker': {
    breadcrumb: 'Home / Sell Smart Speaker',
    title: 'Sell Your Smart Speaker',
    heroPills: ['Best offers', 'Easy pickup', 'Instant quote'],
    searchLabel: 'Search your smart speaker',
    searchPlaceholder: 'Search model name...',
    searchButtonText: 'Check Price',
    brandPickerSubtitle: 'Or choose a brand',
    useCatalogBrands: false,
    brandsStatic: ['Apple', 'Lenovo', 'Xiaomi', 'Asus', 'More Brands'],
    heroImageUrl: HERO_IMG_GENERIC,
    heroImageAlt: 'Smart speaker',
    showHotDeals: false,
    showTopSellingPhones: false,
  },
  tablet: {
    breadcrumb: 'Home / Sell Tablet',
    title: 'Sell Your Tablet for Instant Cash',
    heroPills: ['Trusted pricing', 'Doorstep pickup', 'Fast payout'],
    searchLabel: 'Search your tablet to sell',
    searchPlaceholder: 'Search model name...',
    searchButtonText: 'Check Price',
    brandPickerSubtitle: 'Or choose a brand',
    useCatalogBrands: false,
    brandsStatic: ['Apple', 'Lenovo', 'Samsung', 'Honor', 'More Brands'],
    heroImageUrl: HERO_IMG_GENERIC,
    heroImageAlt: 'Tablet',
    showHotDeals: false,
    showTopSellingPhones: false,
  },
  'gaming-consoles': {
    breadcrumb: 'Home / Sell Gaming Console',
    title: 'Sell Your Gaming Console',
    heroPills: ['Fair price', 'Safe sale', 'Quick process'],
    searchLabel: 'Search your console',
    searchPlaceholder: 'e.g. PlayStation, Xbox...',
    searchButtonText: 'Check Price',
    brandPickerSubtitle: 'Or choose a brand',
    useCatalogBrands: false,
    brandsStatic: ['Sony', 'Microsoft', 'More Brands'],
    heroImageUrl: HERO_IMG_GENERIC,
    heroImageAlt: 'Gaming console',
    showHotDeals: false,
    showTopSellingPhones: false,
  },
  imac: {
    breadcrumb: 'Home / Sell iMac',
    title: 'Sell Your iMac',
    heroPills: ['Expert valuation', 'Free pickup', 'Secure payment'],
    searchLabel: 'Search your iMac to sell',
    searchPlaceholder: 'e.g. iMac 24-inch...',
    searchButtonText: 'Check Price',
    brandPickerSubtitle: 'Or choose a brand',
    useCatalogBrands: false,
    brandsStatic: ['Apple', 'More Brands'],
    heroImageUrl: HERO_IMG_LAPTOP,
    heroImageAlt: 'iMac',
    showHotDeals: false,
    showTopSellingPhones: false,
  },
  smartwatch: {
    breadcrumb: 'Home / Sell Smartwatch',
    title: 'Sell Your Smartwatch',
    heroPills: ['Best value', 'Hassle-free', 'Fast cash'],
    searchLabel: 'Search your smartwatch',
    searchPlaceholder: 'Search model name...',
    searchButtonText: 'Check Price',
    brandPickerSubtitle: 'Or choose a brand',
    useCatalogBrands: false,
    brandsStatic: ['Apple', 'Xiaomi', 'Samsung', 'OnePlus', 'More Brands'],
    heroImageUrl: HERO_IMG_GENERIC,
    heroImageAlt: 'Smartwatch',
    showHotDeals: false,
    showTopSellingPhones: false,
  },
  tv: {
    breadcrumb: 'Home / Sell TV',
    title: 'Sell Your TV for Instant Cash',
    heroPills: ['Fair quotes', 'Pickup included', 'Quick payment'],
    searchLabel: 'Search your TV to sell',
    searchPlaceholder: 'Search model or size...',
    searchButtonText: 'Check Price',
    brandPickerSubtitle: 'Or choose a brand',
    useCatalogBrands: false,
    brandsStatic: ['Motorola', 'Xiaomi', 'Samsung', 'OnePlus', 'More Brands'],
    heroImageUrl: HERO_IMG_GENERIC,
    heroImageAlt: 'Television',
    showHotDeals: false,
    showTopSellingPhones: false,
  },
  earbuds: {
    breadcrumb: 'Home / Sell Earbuds',
    title: 'Sell Your Earbuds',
    heroPills: ['Instant estimate', 'Easy pickup', 'On-spot pay'],
    searchLabel: 'Search your earbuds',
    searchPlaceholder: 'Search model name...',
    searchButtonText: 'Check Price',
    brandPickerSubtitle: 'Or choose a brand',
    useCatalogBrands: false,
    brandsStatic: ['Google', 'Samsung', 'Sony', 'More Brands'],
    heroImageUrl: HERO_IMG_GENERIC,
    heroImageAlt: 'Earbuds',
    showHotDeals: false,
    showTopSellingPhones: false,
  },
  'dslr-camera': {
    breadcrumb: 'Home / Sell DSLR Camera',
    title: 'Sell Your DSLR Camera',
    heroPills: ['Pro valuation', 'Safe handover', 'Fast payout'],
    searchLabel: 'Search your camera',
    searchPlaceholder: 'e.g. Canon EOS, Nikon...',
    searchButtonText: 'Check Price',
    brandPickerSubtitle: 'Or choose a brand',
    useCatalogBrands: false,
    brandsStatic: ['Sony', 'Nikon', 'Canon', 'More Brands'],
    heroImageUrl: HERO_IMG_GENERIC,
    heroImageAlt: 'DSLR camera',
    showHotDeals: false,
    showTopSellingPhones: false,
  },
  ac: {
    breadcrumb: 'Home / Sell AC',
    title: 'Sell Your Air Conditioner',
    heroPills: ['Fair pricing', 'Pickup available', 'Quick payment'],
    searchLabel: 'Search your AC to sell',
    searchPlaceholder: 'Search brand or tonnage...',
    searchButtonText: 'Check Price',
    brandPickerSubtitle: 'Or choose a brand',
    useCatalogBrands: false,
    brandsStatic: ['LG', 'Samsung', 'Daikin', 'Voltas', 'More Brands'],
    heroImageUrl: HERO_IMG_GENERIC,
    heroImageAlt: 'Air conditioner',
    showHotDeals: false,
    showTopSellingPhones: false,
  },
}

export function getSellCategoryConfig(slug) {
  if (!slug || !SELL_CATEGORY_CONFIG[slug]) return null
  return SELL_CATEGORY_CONFIG[slug]
}

export function isValidSellCategorySlug(slug) {
  return Boolean(slug && SELL_CATEGORY_CONFIG[slug])
}
