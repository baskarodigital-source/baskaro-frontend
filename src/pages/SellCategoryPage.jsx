import { useMemo } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ServicePageLayout } from '../components/ServicePageLayout'
import { useCatalogBrands } from '../hooks/useCatalogBrands'
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
      whyUs={WHY_US_DEFAULT}
      showHotDeals={config.showHotDeals ?? false}
      hotDealsTitle="Hot Deals"
      topBrands={null}
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
