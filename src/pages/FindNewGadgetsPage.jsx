import { useMemo } from 'react'
import { ServicePageLayout } from '../components/ServicePageLayout'
import { useCatalogBrands } from '../hooks/useCatalogBrands'
import { gPhoto } from '../constants/googleImages'
import { useCart } from '../context/CartContext'

import iphone15Front from '../assets/products/iphone15_pink.jpg'
import s25Front from '../assets/products/s25_titanium.jpg'

const BRANDS_FALLBACK = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'OPPO', 'Realme', 'Motorola']

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Choose your gadget',
    text: 'Browse newly launched phones, laptops, smartwatches, and tablets in one place.',
  },
  {
    step: '2',
    title: 'Compare specs and reviews',
    text: 'Evaluate performance, features, and expert/user opinions before purchasing.',
  },
  {
    step: '3',
    title: 'Buy with confidence',
    text: 'Get trusted pricing, secure checkout, and support from Baskaro.',
  },
]

const WHY_US = [
  'Latest gadget launches',
  'Trusted brand catalog',
  'Clear price comparisons',
  'Expert-led recommendations',
  'Secure checkout experience',
  'Fast delivery support',
]

const NEW_GADGETS = [
  { id: 'ng-iphone-15', name: 'Apple iPhone 15 (New)', price: '72,900', img: iphone15Front },
  { id: 'ng-s25', name: 'Samsung Galaxy S25 (New)', price: '79,999', img: s25Front },
  { id: 'ng-macbook-air', name: 'Apple MacBook Air M3 (New)', price: '1,14,900', img: gPhoto(1) },
  { id: 'ng-watch-ultra', name: 'Smartwatch Ultra Series (New)', price: '24,999', img: gPhoto(2) },
  { id: 'ng-tablet-pro', name: 'Tablet Pro 11 (New)', price: '49,999', img: gPhoto(3) },
  { id: 'ng-gaming-laptop', name: 'Gaming Laptop X (New)', price: '1,09,999', img: gPhoto(4) },
]

const STORIES = [
  'I quickly compared phones and laptops without jumping across multiple sites.',
  'The explore section helped me pick a smartwatch with confidence.',
  'Great layout for checking launches, prices, and reviews in one flow.',
]

const FAQS = [
  'Can I compare gadgets by category and brand?',
  'Do you list newly launched products?',
  'Are reviews and videos available in the Explore section?',
  'Do you offer EMI on new gadgets?',
]

export default function FindNewGadgetsPage() {
  const { addToCart } = useCart()
  const { brands: apiBrands, loading: brandsLoading } = useCatalogBrands()
  const brands = useMemo(() => {
    if (brandsLoading) return []
    return apiBrands.length ? apiBrands : BRANDS_FALLBACK
  }, [brandsLoading, apiBrands])

  return (
    <div id="find-new-gadgets-main" className="scroll-mt-28">
      <ServicePageLayout
        breadcrumb="Home / Find New Gadgets"
        title="Find New Gadgets"
        heroPills={['Latest launches', 'Detailed reviews', 'Best prices']}
        searchLabel="Search new gadgets"
        searchPlaceholder="e.g. iPhone 16, Galaxy Book, Apple Watch..."
        searchButtonText="Search"
        brands={brands}
        brandsLoading={brandsLoading}
        brandPickerSubtitle="Explore by brand"
        howItWorksTitle="How finding new gadgets works"
        howItWorks={HOW_IT_WORKS}
        whyUs={WHY_US}
        hotDealsTitle="Trending gadget picks"
        productsSection={{
          title: 'Popular new gadgets',
          priceLabel: 'Starts at',
          items: NEW_GADGETS,
          viewAllHref: '/find-new-gadgets',
        }}
        stories={STORIES}
        faqs={FAQS}
        downloadBannerSubtitle="Find new gadgets | Compare options | Save favorites"
        productButtonLabel="Add to Cart"
        onProductClick={(p) => addToCart(p)}
      />
    </div>
  )
}
