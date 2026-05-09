import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react'

const ANNOUNCEMENT = "India's largest refurbished store"

const SLIDES = [
  {
    lineBefore: "Can't find the",
    highlight: 'right phone',
    lineAfter: 'in the budget you have?',
    accent: 'Let us help you',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&auto=format&fit=crop',
    imageClass: 'object-contain drop-shadow-2xl',
  },
  {
    lineBefore: 'Certified pre-owned',
    highlight: 'flagships',
    lineAfter: 'with warranty you can trust.',
    accent: 'Shop smarter',
    image:
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900&auto=format&fit=crop',
    imageClass: 'object-contain drop-shadow-2xl',
  },
  {
    lineBefore: 'Compare models, grades, and',
    highlight: 'real photos',
    lineAfter: 'before you checkout.',
    accent: 'Transparent pricing',
    image:
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=900&auto=format&fit=crop',
    imageClass: 'object-contain drop-shadow-2xl',
  },
]

function scrollToMain() {
  document.getElementById('buy-preowned-main')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * Promo strip + hero carousel (Baskaro red/black).
 */
export function BuyPreOwnedLead() {
  const [index, setIndex] = useState(0)
  const slide = SLIDES[index]

  const go = useCallback((dir) => {
    setIndex((i) => {
      const n = SLIDES.length
      return dir === 'next' ? (i + 1) % n : (i - 1 + n) % n
    })
  }, [])

  useEffect(() => {
    const t = setInterval(() => go('next'), 7000)
    return () => clearInterval(t)
  }, [go])

  return (
    <>
      <div className="bg-gradient-to-r from-red-100 via-rose-50 to-red-50/90">
        <p className="mx-auto max-w-7xl px-4 py-2.5 text-center text-xs font-extrabold tracking-wide text-slate-900 sm:text-sm sm:py-3">
          {ANNOUNCEMENT}
        </p>
      </div>

      <section
        className="relative overflow-hidden bg-gradient-to-br from-red-950 via-neutral-950 to-black"
        aria-roledescription="carousel"
        aria-label="Buy pre-owned highlights"
      >
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-red-600/15 blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-red-700/10 blur-3xl" aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(to_top,rgba(0,0,0,0.45),transparent)] opacity-80"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-14">
          <div className="relative z-[1] max-w-xl">
            <p className="text-2xl font-semibold leading-snug text-white sm:text-4xl sm:leading-tight">
              {slide.lineBefore}{' '}
              <span className="font-extrabold text-red-400">{slide.highlight}</span> {slide.lineAfter}
            </p>
            <p className="mt-4 font-serif text-xl italic text-amber-200 sm:text-2xl">{slide.accent}</p>
            <button
              type="button"
              onClick={scrollToMain}
              className="mt-8 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-slate-900 shadow-lg transition hover:bg-red-50 active:scale-[0.98]"
            >
              Click Here to Start
            </button>
          </div>

          <div className="relative z-[1] flex min-h-[220px] items-center justify-center lg:min-h-[280px]">
            <Zap className="absolute left-[8%] top-[12%] h-6 w-6 text-amber-300/90 sm:h-8 sm:w-8" aria-hidden />
            <Zap className="absolute right-[12%] top-[20%] h-5 w-5 text-amber-400/80 sm:h-7 sm:w-7" aria-hidden />
            <Zap className="absolute bottom-[18%] left-[20%] h-5 w-5 text-amber-300/70 sm:h-6 sm:w-6" aria-hidden />
            <img
              key={slide.image}
              src={slide.image}
              alt=""
              className={`relative z-[1] max-h-[260px] w-full max-w-[280px] sm:max-h-[320px] sm:max-w-[320px] ${slide.imageClass}`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => go('prev')}
          className="absolute left-2 top-1/2 z-[2] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-white/20 bg-white/90 text-slate-900 shadow-md transition hover:bg-white sm:flex lg:left-4"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          onClick={() => go('next')}
          className="absolute right-2 top-1/2 z-[2] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-white/20 bg-white/90 text-slate-900 shadow-md transition hover:bg-white sm:flex lg:right-4"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
        </button>

        <div className="relative z-[2] flex justify-center gap-2 pb-6 pt-2" role="tablist" aria-label="Carousel slides">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={[
                'h-2 w-2 rounded-full transition sm:h-2.5 sm:w-2.5',
                i === index ? 'bg-white' : 'bg-white/35 hover:bg-white/55',
              ].join(' ')}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>
    </>
  )
}
