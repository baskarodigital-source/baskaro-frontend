import React, { useEffect, useRef, useState } from 'react'
import { ProductCarousel } from './ProductCarousel'
import { SectionHeader } from './SectionHeader'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function useCarouselButtons(scrollerRef) {
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth
      setCanPrev(el.scrollLeft > 2)
      setCanNext(el.scrollLeft < maxScroll - 2)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [scrollerRef])

  return { canPrev, canNext }
}

/**
 * @param {{
 *   title?: string
 *   products: Array<{
 *     id?: string
 *     image: string
 *     name: string
 *     price: string
 *     originalPrice?: string
 *     discount?: number | string
 *     href?: string
 *     onClick?: () => void
 *   }>
 *   isLoading?: boolean
 *   skeletonCount?: number
 *   className?: string
 *   viewAllHref?: string
 * }} props
 */
export function BestSellingSection({
  title = 'Best Selling Phones',
  products,
  isLoading = false,
  skeletonCount = 6,
  className = '',
  viewAllHref,
}) {
  const scrollerRef = useRef(null)
  const { canPrev, canNext } = useCarouselButtons(scrollerRef)

  const scrollByViewport = (direction) => {
    const el = scrollerRef.current
    if (!el) return
    const delta = clamp(el.clientWidth * 0.9, 280, 980) * direction
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className={['relative w-full overflow-hidden bg-[#feeceb] pt-6 pb-4', className].join(' ')}>
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="mb-8 relative z-10">
          <SectionHeader
            title={title}
            canPrev={canPrev}
            canNext={canNext}
            onPrev={() => scrollByViewport(-1)}
            onNext={() => scrollByViewport(1)}
            viewAllHref={viewAllHref}
          />
        </div>

        <div className="mt-4 sm:mt-5">
          <ProductCarousel
            products={Array.isArray(products) ? products : []}
            isLoading={isLoading}
            skeletonCount={skeletonCount}
            scrollerRef={scrollerRef}
          />
        </div>
      </div>
    </section>
  )
}

