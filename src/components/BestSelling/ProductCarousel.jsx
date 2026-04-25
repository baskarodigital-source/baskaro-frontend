import React from 'react'
import { ProductCard, ProductCardSkeleton } from './ProductCard'

/**
 * @param {{
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
 *   scrollerRef: React.RefObject<HTMLDivElement>
 * }} props
 */
export function ProductCarousel({
  products,
  isLoading = false,
  skeletonCount = 6,
  scrollerRef,
}) {
  return (
    <div
      ref={scrollerRef}
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2 scrollbar-hide sm:gap-6"
    >
      {isLoading
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <ProductCardSkeleton key={`best-selling-skeleton-${i}`} />
          ))
        : products.map((product, index) => {
            const key = product.id ?? `${product.name}-${index}`
            const card = (
              <ProductCard
                image={product.image}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                discount={product.discount}
              />
            )

            if (product.href) {
              return (
                <a key={key} href={product.href} className="shrink-0">
                  {card}
                </a>
              )
            }

            if (product.onClick) {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={product.onClick}
                  className="shrink-0 text-left"
                >
                  {card}
                </button>
              )
            }

            return (
              <div key={key} className="shrink-0">
                {card}
              </div>
            )
          })}
    </div>
  )
}

