import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { gBrandLogo } from '../constants/googleImages'

const TOP_SELLING_BRANDS = [
  { name: 'Apple', domain: 'apple.com' },
  { name: 'Xiaomi', domain: 'mi.com' },
  { name: 'Samsung', domain: 'samsung.com' },
  { name: 'Vivo', domain: 'vivo.com' },
  { name: 'OnePlus', domain: 'oneplus.com' },
  { name: 'OPPO', domain: 'oppo.com' },
].map((b) => ({ ...b, logoUrl: gBrandLogo(b.domain) }))

const PHONE_IMGS = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1574944981039-fa734261f3c1?w=400&auto=format&fit=crop',
]

const TOP_SELLING_MODELS = [
  'Xiaomi Redmi Note 5 Pro',
  'Redmi Note 5 Pro',
  'Xiaomi Redmi 5A',
  'Redmi 5A',
  'Xiaomi Redmi Note 5',
  'Xiaomi Redmi 6 pro',
].map((name, idx) => ({
  name,
  img: PHONE_IMGS[idx % PHONE_IMGS.length],
}))

function sellSubPath(item, cat) {
  return `/sell/sub?item=${encodeURIComponent(item)}&cat=${encodeURIComponent(cat)}`
}

function useCarouselScroll() {
  const scrollerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      setCanScrollLeft(el.scrollLeft > 2)
      setCanScrollRight(el.scrollLeft < max - 2)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  const scrollPrev = () => scrollerRef.current?.scrollBy({ left: -300, behavior: 'smooth' })
  const scrollNext = () => scrollerRef.current?.scrollBy({ left: 300, behavior: 'smooth' })

  return { scrollerRef, canScrollLeft, canScrollRight, scrollPrev, scrollNext }
}

function CarouselHeader({ title, headingId, canScrollLeft, canScrollRight, scrollPrev, scrollNext }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 id={headingId} className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
        {title}
      </h2>
      <div className="hidden items-center gap-2 sm:flex">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollLeft}
          aria-label="Scroll back"
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition',
            canScrollLeft
              ? 'border-slate-300 text-slate-600 hover:border-slate-400'
              : 'cursor-not-allowed border-slate-200 text-slate-300 opacity-70',
          ].join(' ')}
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.2} aria-hidden />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          disabled={!canScrollRight}
          aria-label="Scroll forward"
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition',
            canScrollRight
              ? 'border-slate-300 text-slate-600 hover:border-slate-400'
              : 'cursor-not-allowed border-slate-200 text-slate-300 opacity-70',
          ].join(' ')}
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.2} aria-hidden />
        </button>
      </div>
    </div>
  )
}

function SideNavButton({ dir, disabled, onClick, label }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={[
        'hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition lg:inline-flex',
        disabled
          ? 'cursor-not-allowed border-slate-200 text-slate-300 opacity-70'
          : 'border-slate-300 text-slate-700 hover:border-slate-400',
      ].join(' ')}
    >
      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
    </button>
  )
}

/**
 * Reference-style horizontal rows for Sell sub-flow: square cards, logo + label / image + model name.
 */
export function SellSubShowcaseCarousels({ categorySlug = 'phone' }) {
  const brandsScroll = useCarouselScroll()
  const modelsScroll = useCarouselScroll()

  return (
    <div className="mt-14 space-y-12 sm:mt-16 sm:space-y-14">
      <section aria-labelledby="sell-sub-top-brands-heading">
        <CarouselHeader
          title="Top Selling Brands"
          headingId="sell-sub-top-brands-heading"
          canScrollLeft={brandsScroll.canScrollLeft}
          canScrollRight={brandsScroll.canScrollRight}
          scrollPrev={brandsScroll.scrollPrev}
          scrollNext={brandsScroll.scrollNext}
        />
        <div className="mt-6 flex items-center gap-3">
          <SideNavButton
            dir="prev"
            disabled={!brandsScroll.canScrollLeft}
            onClick={brandsScroll.scrollPrev}
            label="Scroll brands back"
          />
          <div
            ref={brandsScroll.scrollerRef}
            className="flex flex-1 gap-4 overflow-x-auto pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TOP_SELLING_BRANDS.map((brand) => (
              <Link
                key={brand.name}
                to={sellSubPath(brand.name, categorySlug)}
                className="group flex min-w-[124px] max-w-[124px] shrink-0 flex-col items-center rounded-xl border border-slate-200/90 bg-white px-3 py-4 text-center shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition hover:border-red-200 hover:shadow-[0_4px_12px_rgba(185,28,28,0.1)] sm:min-w-[132px] sm:max-w-[132px]"
              >
                <div className="flex h-14 w-full items-center justify-center">
                  <img
                    src={brand.logoUrl}
                    alt=""
                    loading="lazy"
                    className="max-h-11 max-w-[72px] object-contain"
                  />
                </div>
                <p className="mt-3 text-xs font-bold text-slate-800 group-hover:text-red-700 sm:text-sm">{brand.name}</p>
              </Link>
            ))}
          </div>
          <SideNavButton
            dir="next"
            disabled={!brandsScroll.canScrollRight}
            onClick={brandsScroll.scrollNext}
            label="Scroll brands forward"
          />
        </div>
      </section>

      <section aria-labelledby="sell-sub-top-models-heading">
        <CarouselHeader
          title="Top Selling Models"
          headingId="sell-sub-top-models-heading"
          canScrollLeft={modelsScroll.canScrollLeft}
          canScrollRight={modelsScroll.canScrollRight}
          scrollPrev={modelsScroll.scrollPrev}
          scrollNext={modelsScroll.scrollNext}
        />
        <div className="mt-6 flex items-center gap-3">
          <SideNavButton
            dir="prev"
            disabled={!modelsScroll.canScrollLeft}
            onClick={modelsScroll.scrollPrev}
            label="Scroll models back"
          />
          <div
            ref={modelsScroll.scrollerRef}
            className="flex flex-1 gap-4 overflow-x-auto pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TOP_SELLING_MODELS.map((m) => (
              <Link
                key={m.name}
                to={sellSubPath(m.name, categorySlug)}
                className="group flex min-w-[124px] max-w-[124px] shrink-0 flex-col items-center overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition hover:border-red-200 hover:shadow-[0_4px_12px_rgba(185,28,28,0.1)] sm:min-w-[132px] sm:max-w-[132px]"
              >
                <div className="flex h-[108px] w-full items-center justify-center bg-slate-50/80 px-2 pt-3">
                  <img src={m.img} alt="" className="max-h-[92px] max-w-full object-contain" loading="lazy" />
                </div>
                <p className="px-2 py-3 text-center text-[11px] font-semibold leading-tight text-slate-800 group-hover:text-red-700 sm:text-xs">
                  <span className="line-clamp-2">{m.name}</span>
                </p>
              </Link>
            ))}
          </div>
          <SideNavButton
            dir="next"
            disabled={!modelsScroll.canScrollRight}
            onClick={modelsScroll.scrollNext}
            label="Scroll models forward"
          />
        </div>
      </section>
    </div>
  )
}
