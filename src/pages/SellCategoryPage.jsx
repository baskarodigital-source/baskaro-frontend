import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ServicePageLayout } from '../components/ServicePageLayout'
import { useCatalogBrands } from '../hooks/useCatalogBrands'
import { getServicePageContent } from '../lib/api/baskaroApi'
import {
  getSellCategoryConfig,
  PHONE_BRAND_FALLBACK,
  HOW_IT_WORKS_DEFAULT,
  WHY_US_DEFAULT,
  STORIES_DEFAULT,
  FAQS_DEFAULT,
} from '../config/sellCategoryConfig'

export default function SellCategoryPage() {
  const { category } = useParams()
  const navigate = useNavigate()
  const config = getSellCategoryConfig(category)
  const { brands: apiBrands, loading: brandsLoading } = useCatalogBrands()
  const [whyUsApi, setWhyUsApi] = useState(null)

  const brands = useMemo(() => {
    if (!config) return []
    if (config.useCatalogBrands) {
      if (brandsLoading) return []
      return apiBrands.length ? apiBrands : PHONE_BRAND_FALLBACK
    }
    return config.brandsStatic ?? []
  }, [config, brandsLoading, apiBrands])

  if (!config) {
    return <Navigate to="/sell/phone" replace />
  }

  useEffect(() => {
    let cancelled = false
    const pageKey = `sell-${category}`
    getServicePageContent(pageKey)
      .then((data) => {
        if (cancelled) return
        const raw = data?.whyUsItems ?? []
        const mapped = Array.isArray(raw)
          ? raw
              .map((r) => ({
                title: String(r?.title || '').trim(),
                description: String(r?.description || '').trim(),
                sortOrder: Number(r?.sortOrder) || 0,
              }))
              .filter((r) => r.title && r.description)
              .sort((a, b) => a.sortOrder - b.sortOrder)
          : []
        setWhyUsApi(mapped)
      })
      .catch(() => {
        if (!cancelled) setWhyUsApi([])
      })
    return () => {
      cancelled = true
    }
  }, [category])

  const whyUsLoading = whyUsApi == null
  const whyUs = whyUsLoading ? [] : whyUsApi.length ? whyUsApi : WHY_US_DEFAULT

  const onSellNow = (product) => {
    const itemLabel = product?.name ?? 'Selected device'
    const img = product?.img ?? ''
    const price = product?.price ?? ''
    navigate(
      `/sell/sub?item=${encodeURIComponent(itemLabel)}&cat=${encodeURIComponent(category)}&price=${encodeURIComponent(price)}&img=${encodeURIComponent(img)}`,
    )
  }

  return (
    <ServicePageLayout
      breadcrumb={config.breadcrumb}
      title={config.title}
      heroPills={config.heroPills}
      searchLabel={config.searchLabel}
      searchPlaceholder={config.searchPlaceholder}
      searchButtonText={config.searchButtonText}
      brands={brands}
      brandsLoading={config.useCatalogBrands ? brandsLoading : false}
      brandPickerSubtitle={config.brandPickerSubtitle ?? 'Or choose a brand'}
      howItWorksTitle="How Baskaro Works"
      howItWorks={HOW_IT_WORKS_DEFAULT}
      whyUs={whyUs}
      whyUsLoading={whyUsLoading}
      showHotDeals={config.showHotDeals ?? false}
      hotDealsTitle="Hot Deals"
      topBrands={brands}
      topBrandsLoading={config.useCatalogBrands ? brandsLoading : false}
      showTopSellingPhones={config.showTopSellingPhones ?? false}
      stories={STORIES_DEFAULT}
      faqs={FAQS_DEFAULT}
      downloadBannerSubtitle="Baskaro | Sell smarter"
      productButtonLabel="Sell Now"
      onProductClick={onSellNow}
      heroImageUrl={config.heroImageUrl}
      heroImageAlt={config.heroImageAlt ?? config.title}
    />
  )
}
