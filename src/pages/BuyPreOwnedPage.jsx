import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ServicePageLayout } from '../components/ServicePageLayout'
import { BuyPreOwnedLead } from '../components/BuyPreOwnedLead'
import { useCatalogBrands } from '../hooks/useCatalogBrands'
import { useCart } from '../context/CartContext'
import { getFeaturedPreOwned } from '../lib/api/baskaroApi.js'
import { appAlert } from '../lib/appDialog.js'
import { isLoggedIn } from '../lib/auth.js'
import { isMongoObjectId } from '../lib/objectId.js'
import { mapFeaturedPreOwnedRow } from '../lib/mapPreOwnedProduct.js'

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

function mapServiceLayoutItem(row) {
  const mapped = mapFeaturedPreOwnedRow(row)
  if (!mapped) return null
  const numeric = Number(String(mapped.price).replace(/[^\d]/g, '')) || Number(row.priceInr) || 0
  return {
    id: mapped.id,
    inventoryId: mapped.inventoryId,
    name: mapped.title,
    price: numeric > 0 ? numeric.toLocaleString('en-IN') : mapped.price.replace(/^₹/, ''),
    img: mapped.image,
    viewPath: mapped.viewPath,
  }
}

export default function BuyPreOwnedPage() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { brands: apiBrands, loading: brandsLoading } = useCatalogBrands()
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)

  const brands = useMemo(() => {
    if (brandsLoading) return []
    return apiBrands.length ? apiBrands : BRANDS_FALLBACK
  }, [brandsLoading, apiBrands])

  useEffect(() => {
    let cancelled = false
    setProductsLoading(true)
    getFeaturedPreOwned({ limit: 12 })
      .then((list) => {
        if (cancelled) return
        const items = (Array.isArray(list) ? list : [])
          .map(mapServiceLayoutItem)
          .filter(Boolean)
        setProducts(items)
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleAddToCart = useCallback(
    async (phone) => {
      const inventoryId = phone.inventoryId || phone.id
      if (!isMongoObjectId(inventoryId)) {
        appAlert('This listing is not linked to live inventory yet. Use a device from the in-stock section.', {
          title: 'Not available',
          variant: 'error',
        })
        return
      }

      if (!isLoggedIn()) {
        appAlert('Please log in to reserve and add pre-owned devices to your cart.', {
          title: 'Login required',
          variant: 'info',
        })
        navigate('/login', { state: { from: '/buy-pre-owned' } })
        return
      }

      const result = await addToCart({
        id: inventoryId,
        inventoryId,
        name: phone.name,
        price: phone.price,
        img: phone.img,
      })

      if (result?.error) {
        appAlert(result.error, { title: 'Could not add to cart', variant: 'error' })
        return
      }

      appAlert('Added to cart — reserved for 30 minutes.', { title: 'In your cart', variant: 'success' })
    },
    [addToCart, navigate],
  )

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
          productsSection={
            products.length > 0
              ? {
                  title: 'In-stock pre-owned devices',
                  priceLabel: 'Price',
                  items: products,
                  viewAllHref: '/buy-pre-owned/category/phones',
                }
              : productsLoading
                ? {
                    title: 'In-stock pre-owned devices',
                    priceLabel: 'Price',
                    items: [],
                    viewAllHref: '/buy-pre-owned/category/phones',
                  }
                : null
          }
          stories={STORIES}
          faqs={FAQS}
          downloadBannerSubtitle="Buy pre-owned | Compare models | Add to cart"
          productButtonLabel="Add to Cart"
          onProductClick={(p) => handleAddToCart(p)}
        />
        {!productsLoading && products.length === 0 ? (
          <div className="mx-auto max-w-7xl px-4 pb-12 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No pre-owned units in stock right now. Add inventory in Admin or run{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">npm run seed:test-inventory</code> in{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">backend/</code>.
            </p>
          </div>
        ) : null}
      </div>
    </>
  )
}
