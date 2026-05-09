import { useMemo } from 'react'
import { ServicePageLayout } from '../components/ServicePageLayout'
import { BuyPreOwnedLead } from '../components/BuyPreOwnedLead'
import { useCatalogBrands } from '../hooks/useCatalogBrands'
import { gPhoto } from '../constants/googleImages'
import { useCart } from '../context/CartContext'

import s25Front from '../assets/products/s25_titanium.jpg'
import iphone14Front from '../assets/products/iphone14_purple.jpg'

const BRANDS_FALLBACK = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'OPPO', 'Realme', 'Motorola']

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Browse certified devices',
    text: 'Explore quality-checked pre-owned phones with clear grades and real photos.',
  },
  {
    step: '2',
    title: 'Compare value',
    text: 'Check price, condition, and features side-by-side to choose confidently.',
  },
  {
    step: '3',
    title: 'Buy with protection',
    text: 'Get warranty-backed devices with easy return and support options.',
  },
]

const WHY_US = [
  'Certified quality checks',
  'Warranty on devices',
  'Best-value pricing',
  'Easy exchange options',
  'Secure checkout',
  'Fast doorstep delivery',
]

const PRE_OWNED_PHONES = [
  { id: 'po-iphone-14', name: 'Apple iPhone 14 (128GB) - Pre-Owned', price: '42,990', img: iphone14Front },
  { id: 'po-s25-edge', name: 'Samsung Galaxy S25 Edge - Pre-Owned', price: '48,499', img: s25Front },
  { id: 'po-oneplus', name: 'OnePlus Flagship - Pre-Owned', price: '35,999', img: gPhoto(2) },
  { id: 'po-vivo-v', name: 'Vivo V Series - Pre-Owned', price: '28,999', img: gPhoto(3) },
  { id: 'po-xiaomi', name: 'Xiaomi Premium Series - Pre-Owned', price: '31,499', img: gPhoto(4) },
  { id: 'po-samsung-s', name: 'Samsung S Series - Pre-Owned', price: '39,999', img: gPhoto(5) },
]

const STORIES = [
  'I got a like-new phone at a much better price than retail.',
  'Device condition matched the listing exactly, and delivery was quick.',
  'Warranty support was smooth and gave me peace of mind.',
]

const FAQS = [
  'How do device grades work?',
  'What warranty is included?',
  'Can I return the product if I change my mind?',
  'Is EMI available on pre-owned phones?',
]

export default function BuyPreOwnedPage() {
  const { addToCart } = useCart()
  const { brands: apiBrands, loading: brandsLoading } = useCatalogBrands()
  const brands = useMemo(() => {
    if (brandsLoading) return []
    return apiBrands.length ? apiBrands : BRANDS_FALLBACK
  }, [brandsLoading, apiBrands])

  return (
    <>
      <BuyPreOwnedLead />
      <div id="buy-preowned-main" className="scroll-mt-28">
        <ServicePageLayout
          breadcrumb="Home / Buy Pre-Owned"
          title="Buy Pre-Owned Devices"
          heroPills={['Certified devices', 'Warranty included', 'Best value']}
          searchLabel="Search pre-owned devices"
          searchPlaceholder="e.g. iPhone 14, Samsung S23..."
          searchButtonText="Search"
          brands={brands}
          brandsLoading={brandsLoading}
          brandPickerSubtitle="Browse by brand"
          howItWorksTitle="How buying pre-owned works"
          howItWorks={HOW_IT_WORKS}
          whyUs={WHY_US}
          hotDealsTitle="Top pre-owned deals"
          productsSection={{
            title: 'Popular pre-owned devices',
            priceLabel: 'From',
            items: PRE_OWNED_PHONES,
            viewAllHref: '#',
          }}
          stories={STORIES}
          faqs={FAQS}
          downloadBannerSubtitle="Buy pre-owned | Compare models | Add to cart"
          productButtonLabel="Add to Cart"
          onProductClick={(p) => addToCart(p)}
        />
      </div>
    </>
  )
}

