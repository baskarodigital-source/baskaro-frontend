import { useEffect, useRef, useState } from 'react'

/** Fires once when the element enters the viewport (good for deferring below-fold API work). */
export function useInViewOnce({ rootMargin = '200px' } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (inView) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { rootMargin },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [inView, rootMargin])

  return { ref, inView }
}
