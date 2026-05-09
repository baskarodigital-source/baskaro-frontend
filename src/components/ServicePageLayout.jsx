import { useRef, useState } from 'react'
import {
  Smartphone,
  Bike,
  WalletCards,
  ChevronRight,
  Tag,
  Banknote,
  MousePointerClick,
  Truck,
  ShieldCheck,
  Receipt,
  Quote,
} from 'lucide-react'
import { Button } from './Button'
import { DownloadAppBanner } from './DownloadAppBanner'
import { TopSellingBrands, PHONE_BRAND_PORTALS } from './TopBrandPortals'

/** Placeholder row until pages pass real `topBrands` from the API */
const DUMMY_TOP_SELLING_BRANDS = ['Apple', 'Xiaomi', 'Samsung', 'Vivo', 'OnePlus', 'OPPO'].map((name) => {
  const hit = PHONE_BRAND_PORTALS.find((b) => b.name === name)
  return hit ?? { name, logoUrl: '' }
})

const PHONE_THUMB =
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=200&auto=format&fit=crop'

/** Dummy trade-in list until API wiring */
const DUMMY_TOP_SELLING_PHONES = [
  { name: 'Apple iPhone 13 (4 GB/128 GB)', price: '23,710', img: PHONE_THUMB },
  { name: 'Apple iPhone 11 (4 GB/64 GB)', price: '13,380', img: PHONE_THUMB },
  { name: 'Apple iPhone 14 Pro (6 GB/128 GB)', price: '42,450', img: PHONE_THUMB },
  { name: 'Apple iPhone 11 (4 GB/128 GB)', price: '14,110', img: PHONE_THUMB },
  { name: 'Apple iPhone 12 (4 GB/128 GB)', price: '17,740', img: PHONE_THUMB },
  { name: 'Apple iPhone 14 (6 GB/128 GB)', price: '26,240', img: PHONE_THUMB },
  { name: 'Apple iPhone 15 (6 GB/128 GB)', price: '37,090', img: PHONE_THUMB },
]

const WHY_US_ICONS = [Tag, Banknote, MousePointerClick, Truck, ShieldCheck, Receipt]

const STORY_PLACEHOLDER_PEOPLE = [
  { name: 'Rahul Sharma', location: 'Mumbai' },
  { name: 'Priya Menon', location: 'Bengaluru' },
  { name: 'Arjun Patel', location: 'Ahmedabad' },
  { name: 'Neha Kapoor', location: 'Delhi NCR' },
  { name: 'Vikram Singh', location: 'Hyderabad' },
  { name: 'Ananya Iyer', location: 'Chennai' },
]

function normalizeCustomerStory(story, idx) {
  if (story && typeof story === 'object' && !Array.isArray(story)) {
    const quote = story.quote ?? story.text ?? ''
    const fallback = STORY_PLACEHOLDER_PEOPLE[idx % STORY_PLACEHOLDER_PEOPLE.length]
    return {
      quote,
      name: story.name ?? fallback.name,
      location: story.location ?? fallback.location,
      avatarUrl: story.avatarUrl ?? story.avatar ?? null,
    }
  }
  const quote = typeof story === 'string' ? story : ''
  const meta = STORY_PLACEHOLDER_PEOPLE[idx % STORY_PLACEHOLDER_PEOPLE.length]
  return { quote, name: meta.name, location: meta.location, avatarUrl: null }
}

/**
 * Shared marketing/service page shell — same structure as the original Sell Phone page.
 */
export function ServicePageLayout({
  breadcrumb,
  title,
  heroPills,
  searchLabel,
  searchPlaceholder,
  searchButtonText,
  brands = [],
  /** When true, show placeholder pills until `brands` are ready */
  brandsLoading = false,
  brandPickerSubtitle = 'Or choose a brand',
  howItWorksTitle = 'How it works',
  howItWorks,
  whyUs,
  showHotDeals = true,
  hotDealsTitle = 'Hot Deals',
  topBrands,
  topBrandsTitle = 'Top Selling Brands',
  /** When true, show the trade-in price table (dummy rows unless `topSellingPhones` is set) */
  showTopSellingPhones = false,
  topSellingPhones,
  topSellingPhonesTitle = 'Top Selling Mobile Phones',
  productsSection,
  stories,
  faqs,
  downloadBannerSubtitle,
  productButtonLabel = 'Sell Now',
  onProductClick,
  heroImageUrl = '',
  heroImageAlt = '',
}) {
  const effectiveTopBrands = topBrands?.length ? topBrands : DUMMY_TOP_SELLING_BRANDS
  const effectiveTopSellingPhones =
    showTopSellingPhones && (topSellingPhones?.length ? topSellingPhones : DUMMY_TOP_SELLING_PHONES)
  const [openFaq, setOpenFaq] = useState(0)
  const hotDealsRef = useRef(null)

  const scrollHotDeals = (dir) => {
    const el = hotDealsRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -420 : 420, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <section className="w-full border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <p className="text-sm font-semibold text-slate-500">{breadcrumb}</p>

          <div className="mt-4 grid gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1.45fr_1fr] lg:items-stretch lg:p-6">
            <div className="flex h-full flex-col">
              <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-5xl">{title}</h1>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-slate-800 sm:text-[28px]">
                {heroPills.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <span className="text-red-600">✓</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>

              <div className="mt-6">
                <p className="mb-3 text-xs font-bold text-slate-800 sm:text-sm">{searchLabel}</p>
                <div className="flex flex-row gap-2 sm:gap-3">
                  <input
                    type="search"
                    placeholder={searchPlaceholder}
                    className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                  />
                  <Button variant="primary" className="h-11 px-5 text-sm">
                    {searchButtonText}
                  </Button>
                </div>
              </div>

              {(brands.length > 0 || brandsLoading) && (
                <>
                  <div className="mt-6 flex items-center gap-3 text-slate-500">
                    <span className="h-px flex-1 bg-slate-300/70" />
                    <p className="text-sm font-semibold text-slate-700">{brandPickerSubtitle}</p>
                    <span className="h-px flex-1 bg-slate-300/70" />
                  </div>
                  <div className="mt-5 flex items-start gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {brandsLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={`brand-skel-${i}`}
                            className="h-16 min-w-[4.5rem] animate-pulse rounded-xl bg-slate-200"
                            aria-hidden
                          />
                        ))
                      : brands.slice(0, 4).map((brand) => {
                          const name = typeof brand === 'string' ? brand : brand.name
                          const logo = typeof brand === 'object' ? brand.logo : null
                          return (
                            <button
                              key={name}
                              type="button"
                              className="group flex h-16 min-w-[4.5rem] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 transition hover:border-slate-300 hover:shadow-sm"
                            >
                              {logo ? (
                                <img src={logo} alt={name} className="h-7 w-10 object-contain mix-blend-multiply" />
                              ) : (
                                <span className="text-sm font-bold text-slate-700">{name}</span>
                              )}
                            </button>
                          )
                        })}

                    {!brandsLoading && brands.length > 4 ? (
                      <button
                        type="button"
                        className="inline-flex h-16 min-w-fit items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                      >
                        More Brands <span aria-hidden>›</span>
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </div>

            <div className="h-full">
              <div className="relative mx-auto aspect-square h-full max-h-[420px] w-full overflow-hidden rounded-3xl bg-slate-100">
                {heroImageUrl ? (
                  <img
                    src={heroImageUrl}
                    alt={heroImageAlt || title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                    Hero image
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-slate-100 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{howItWorksTitle}</h2>
          <div
            className="mt-8 flex gap-5 overflow-x-auto pb-3 scroll-smooth [-ms-overflow-style:auto] [scrollbar-width:thin] [scrollbar-color:rgb(185_28_28)_rgb(226_232_240)] sm:gap-6 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible md:pb-0 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-red-600 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-200"
            role="list"
            aria-label={howItWorksTitle}
          >
            {howItWorks.map((item, idx) => {
              const Icon = idx === 0 ? Smartphone : idx === 1 ? Bike : WalletCards
              return (
                <article
                  key={item.step}
                  role="listitem"
                  className="w-[min(100%,19.5rem)] shrink-0 rounded-2xl bg-transparent p-4 md:w-auto md:shrink md:min-w-0"
                >
                  <div className="mb-5 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm ring-1 ring-slate-200">
                      <Icon className="h-10 w-10" strokeWidth={1.8} aria-hidden />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-base font-black text-white">
                      {item.step}
                    </span>
                    <h3 className="text-2xl font-extrabold text-slate-900 sm:text-[32px]">{item.title}</h3>
                  </div>
                  <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">{item.text}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {showHotDeals && (
        <section className="w-full bg-slate-100 px-4 pb-10 sm:pb-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{hotDealsTitle}</h2>
              <div className="hidden items-center gap-2 md:flex">
                <button
                  type="button"
                  onClick={() => scrollHotDeals('left')}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                  aria-label="Scroll hot deals left"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollHotDeals('right')}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                  aria-label="Scroll hot deals right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div
              ref={hotDealsRef}
              className="mt-6 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {[
                {
                  title: 'Exchange Offers',
                  image:
                    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=640&auto=format&fit=crop',
                  bg: 'from-teal-100 to-emerald-100',
                },
                {
                  title: 'Refurbished Device Offers',
                  image:
                    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=640&auto=format&fit=crop',
                  bg: 'from-violet-100 to-indigo-100',
                },
                {
                  title: 'Best Deal on Pre-Owned Phones',
                  image:
                    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=640&auto=format&fit=crop',
                  bg: 'from-cyan-100 to-sky-100',
                },
                {
                  title: 'Get Pre-Owned Samsung Deals',
                  image:
                    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=640&auto=format&fit=crop',
                  bg: 'from-blue-100 to-indigo-100',
                },
              ].map((deal) => (
                <article
                  key={deal.title}
                  className={`flex min-h-[190px] min-w-[360px] items-stretch gap-4 overflow-hidden rounded-2xl bg-gradient-to-r ${deal.bg} p-6 md:min-w-[380px]`}
                >
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <h3 className="text-2xl font-black leading-tight text-slate-900 sm:text-3xl">{deal.title}</h3>
                    <button
                      type="button"
                      className="mt-6 inline-flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-full bg-white/90 text-slate-500 shadow-sm"
                      aria-label={`Open ${deal.title}`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex w-[38%] max-w-[200px] shrink-0 flex-col justify-end self-stretch">
                    <img
                      src={deal.image}
                      alt=""
                      className="mx-auto max-h-[170px] w-full object-contain object-bottom"
                      loading="lazy"
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="w-full bg-black px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">Why Us</h2>
          <div
            className="mx-auto mt-3 h-1 w-14 rounded-full bg-red-600 sm:mt-4 sm:w-16"
            aria-hidden
          />
          <div
            className="mt-8 flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth [-ms-overflow-style:auto] [scrollbar-width:thin] [scrollbar-color:rgb(185_28_28)_rgb(38_38_38)] sm:gap-5 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-red-700 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-zinc-800"
            role="list"
            aria-label="Why choose us"
          >
            {whyUs.map((item, idx) => {
              const title = typeof item === 'string' ? item : item.title
              const description =
                typeof item === 'string'
                  ? `${item} with transparent and trusted experience.`
                  : item.description
              const Icon = WHY_US_ICONS[idx % WHY_US_ICONS.length]
              return (
                <div
                  key={`${title}-${idx}`}
                  role="listitem"
                  className="flex w-[min(100%,19.5rem)] shrink-0 gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:w-80 sm:gap-5 sm:p-5"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100 sm:h-14 sm:w-14"
                    aria-hidden
                  >
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.65} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="w-full px-4 pb-8 sm:pb-12">
        <div className="mx-auto max-w-7xl">
          <TopSellingBrands brands={effectiveTopBrands} title={topBrandsTitle} />
        </div>
      </section>

      {productsSection && productsSection.items?.length > 0 && (
        <section className="w-full px-4 pb-8 sm:pb-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{productsSection.title}</h2>
              {productsSection.viewAllHref && (
                <Button as="a" href={productsSection.viewAllHref} variant="secondary" className="px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm">
                  View All
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3">
              {productsSection.items.map((phone) => (
                <article
                  key={phone.name}
                  className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl sm:p-4"
                >
                  <div className="flex h-24 items-center justify-center rounded-lg bg-white p-2 sm:h-36 sm:rounded-xl sm:p-3">
                    <img
                      src={phone.img}
                      alt={phone.name}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-xs font-bold text-slate-900 sm:mt-3 sm:text-base">{phone.name}</h3>
                  <p className="mt-1 text-[10px] font-semibold text-slate-600 sm:mt-2 sm:text-sm">{productsSection.priceLabel ?? 'Get Upto'}</p>
                  <p className="text-lg font-extrabold text-blue-700 sm:text-2xl">
                    {productsSection.omitCurrency ? phone.price : `Rs ${phone.price}`}
                  </p>
                  <Button 
                    variant="danger" 
                    className="mt-2 h-8 w-full text-[10px] transition-transform active:scale-95 sm:mt-3 sm:h-10 sm:text-sm"
                    onClick={() => onProductClick?.(phone)}
                  >
                    {productButtonLabel}
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {effectiveTopSellingPhones && effectiveTopSellingPhones.length > 0 && (
        <section className="w-full px-4 pb-8 sm:pb-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {topSellingPhonesTitle}
            </h2>
            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
              <div
                className="max-h-[min(28rem,60vh)] overflow-auto overscroll-contain [scrollbar-gutter:stable]"
                role="region"
                aria-label={`Scrollable list: ${topSellingPhonesTitle}`}
              >
                <table className="w-full min-w-[36rem] border-collapse text-left">
                  <thead className="sticky top-0 z-10 shadow-[0_1px_0_0_rgb(203_213_225)]">
                    <tr className="border-b border-slate-300/90 bg-slate-200">
                      <th className="px-4 py-3.5 text-sm font-bold text-slate-900">
                        {topSellingPhonesTitle}
                      </th>
                      <th className="w-40 px-4 py-3.5 text-center text-sm font-bold text-slate-900">Price</th>
                      <th className="w-36 px-4 py-3.5" aria-hidden />
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {effectiveTopSellingPhones.map((row, idx) => (
                      <tr
                        key={`${row.name}-${idx}`}
                        className="border-b border-slate-200 last:border-b-0 [&:nth-child(even)]:bg-slate-50/80"
                      >
                        <td className="px-4 py-3 align-middle">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white shadow-sm">
                              <img
                                src={row.img}
                                alt=""
                                className="max-h-[58px] max-w-[58px] object-contain"
                                loading="lazy"
                              />
                            </div>
                            <p className="min-w-0 text-sm font-semibold leading-snug text-slate-900 sm:text-[15px]">
                              {row.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle text-center">
                          <p className="text-xs font-medium text-slate-500">Get Upto</p>
                          <p className="text-lg font-extrabold leading-tight text-[#e85d2a] sm:text-xl">
                            ₹{row.price}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-middle text-right">
                          <button
                            type="button"
                            onClick={() => onProductClick?.(row)}
                            className="inline-flex min-w-[6.5rem] justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:bg-red-800"
                          >
                            {productButtonLabel}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="w-full bg-black px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">
            Customer Stories
          </h2>
          <div
            className="mx-auto mt-3 h-1 w-14 rounded-full bg-red-600 sm:w-16"
            aria-hidden
          />
          <div
            className="mt-10 flex gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth [-ms-overflow-style:auto] [scrollbar-width:thin] [scrollbar-color:rgb(185_28_28)_rgb(38_38_38)] sm:gap-6 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-red-700 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-zinc-800"
            role="list"
            aria-label="Customer testimonials"
          >
            {stories.map((story, idx) => {
              const { quote, name, location, avatarUrl } = normalizeCustomerStory(story, idx)
              const initials = name
                .split(/\s+/)
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
              return (
                <article
                  key={idx}
                  role="listitem"
                  className="flex w-[min(100%,19rem)] shrink-0 flex-col rounded-2xl bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:w-80 sm:p-6"
                >
                  <Quote
                    className="h-9 w-9 shrink-0 text-red-500 sm:h-10 sm:w-10"
                    strokeWidth={1.35}
                    aria-hidden
                  />
                  <p className="mt-4 flex-1 text-left text-sm leading-relaxed text-slate-900 sm:text-[15px]">
                    {quote}
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-red-100"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-700 ring-2 ring-red-100/90"
                        aria-hidden
                      >
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-bold text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500">{location}</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">FAQs</h2>
          <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
            {faqs.map((q, idx) => (
              <article key={q} className="rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left transition hover:bg-slate-50 sm:px-4 sm:py-3"
                  onClick={() => setOpenFaq((prev) => (prev === idx ? -1 : idx))}
                >
                  <span className="text-xs font-bold text-slate-900 sm:text-sm md:text-base">{q}</span>
                  <span className="text-slate-500">{openFaq === idx ? '-' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <p className="border-t px-3 py-2 text-[10px] text-slate-600 sm:px-4 sm:py-3 sm:text-sm">
                    You can complete this process online, schedule pickup, and receive instant payment.
                  </p>
                )}
              </article>
            ))}
          </div>
          <Button variant="secondary" className="mt-4 h-9 px-4 text-xs sm:h-11 sm:px-6 sm:text-sm">
            Load More FAQs
          </Button>
        </div>
      </section>

      <DownloadAppBanner subtitle={downloadBannerSubtitle} />
    </div>
  )
}
