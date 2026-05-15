import { useEffect, useMemo, useState } from 'react'
import { ServicePageLayout } from '../components/ServicePageLayout'
import { useCatalogBrands } from '../hooks/useCatalogBrands'
import { getServicePageContent } from '../lib/api/baskaroApi.js'

const BRANDS_FALLBACK = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'OPPO', 'Realme', 'Motorola']

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Describe issue',
    text: 'Tell us the problem — display, battery, charging port, or software — and your model.',
  },
  {
    step: '2',
    title: 'Get quote',
    text: 'Receive a transparent repair estimate with genuine or compatible parts options.',
  },
  {
    step: '3',
    title: 'Fix & return',
    text: 'Drop off or schedule pickup; we repair, test, and hand your phone back with warranty.',
  },
]

const WHY_US_FALLBACK = [
  'Trained technicians',
  'Genuine parts option',
  'Warranty on repair',
  'Pickup available',
  'Same-day on select jobs',
  'Data-safe handling',
]

const STORIES = [
  'Screen was fixed same day — looks brand new and touch works perfectly.',
  'Battery swap gave my old phone another year. Fair price.',
  'They explained the issue clearly before starting work. No surprises.',
]

const FAQS = [
  'How long does a typical repair take?',
  'Do you use original parts?',
  'Is my data safe during repair?',
  'What warranty do you offer on repairs?',
]

export default function RepairPhonePage() {
  const { brands: apiBrands, loading: brandsLoading } = useCatalogBrands()
  const [whyUsApi, setWhyUsApi] = useState(null)

  const brands = useMemo(() => {
    if (brandsLoading) return []
    return apiBrands.length ? apiBrands : BRANDS_FALLBACK
  }, [brandsLoading, apiBrands])

  const topBrandsForStrip = useMemo(() => {
    if (brandsLoading) return []
    if (apiBrands.length) return apiBrands
    return BRANDS_FALLBACK.map((name) => ({ name, logo: '', logoUrl: '', slug: '', id: name }))
  }, [brandsLoading, apiBrands])

  useEffect(() => {
    let cancelled = false
    getServicePageContent('repair-phone')
      .then((data) => {
        if (cancelled) return
        const raw = data?.whyUsItems ?? data?.whyUs ?? []
        const list = Array.isArray(raw) ? raw : []
        const mapped = list
          .map((row) => ({
            title: String(row.title || '').trim(),
            description: String(row.description || '').trim(),
            sortOrder: Number(row.sortOrder) || 0,
          }))
          .filter((r) => r.title && r.description)
          .sort((a, b) => a.sortOrder - b.sortOrder)
        setWhyUsApi(mapped)
      })
      .catch(() => {
        if (!cancelled) setWhyUsApi([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const whyUsLoading = whyUsApi === null
  const whyUs = whyUsLoading ? [] : whyUsApi.length > 0 ? whyUsApi : WHY_US_FALLBACK

  return (
    <ServicePageLayout
      breadcrumb="Home / Repair Phone"
      title="Phone Repair — Screen, Battery & More"
      heroPills={['Expert techs', 'Clear pricing', 'Repair warranty']}
      searchLabel="Find repair for your phone"
      searchPlaceholder="Search model or issue..."
      searchButtonText="Get quote"
      brands={brands}
      brandsLoading={brandsLoading}
      howItWorksTitle="How repair works"
      howItWorks={HOW_IT_WORKS}
      whyUs={whyUs}
      whyUsLoading={whyUsLoading}
      showHotDeals={false}
      hotDealsTitle="Repair offers"
      topBrands={topBrandsForStrip}
      topBrandsLoading={brandsLoading}
      stories={STORIES}
      faqs={FAQS}
      downloadBannerSubtitle="Book repair | Sell old phone | Shop accessories"
      productButtonLabel="Book now"
    />
  )
}
