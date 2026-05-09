import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LandingNavbar } from './LandingNavbar'
import { CategoryRibbon } from './CategoryRibbon'
import { WhatsAppWidget } from './WhatsAppWidget'

/**
 * Wraps page content; add header/footer/sidebar here as the app grows.
 */
export function MainLayout({ children }) {
  const { pathname } = useLocation()
  const path = pathname.replace(/\/$/, '') || '/'
  const slimLayout = path === '/login' || path === '/dashboard' || path === '/profile'

  useEffect(() => {
    const root = document.documentElement
    if (slimLayout) root.classList.add('scrollbar-hide')
    else root.classList.remove('scrollbar-hide')
    return () => root.classList.remove('scrollbar-hide')
  }, [slimLayout])

  /* Login + user dashboard: one screen tall — navbar + scrollable main — avoids min-h-screen stacking past 100vh */
  if (slimLayout) {
    return (
      <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
        <LandingNavbar />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        <WhatsAppWidget />
      </div>
    )
  }

  return (
    <>
      <LandingNavbar />
      <CategoryRibbon variant="bar" />
      {children}
      <WhatsAppWidget />
      <footer className="border-t border-red-950/40 bg-gradient-to-b from-[#6f0006] via-[#260001] to-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.45fr_1fr_1fr_1fr]">
            <div>
              <img
                src="/logo.png"
                alt="BAS karo"
                className="h-12 w-auto max-w-[185px] object-contain object-left"
              />
              <p className="mt-4 max-w-md text-base font-semibold leading-relaxed text-white/80">
                India's most trusted platform to buy and sell pre-owned devices. Fast, secure, and transparent.
              </p>

              <h4 className="mt-8 text-[11px] font-black uppercase tracking-[0.22em] text-red-300">
                Stay Updated
              </h4>
              <p className="mt-2 text-sm font-medium text-white/65">
                Subscribe to get the best deals on pre-owned flagships.
              </p>

              <div className="mt-4 flex max-w-md items-center gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="h-11 flex-1 rounded-full border border-white/15 bg-black/30 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-red-500"
                />
                <button
                  type="button"
                  className="h-11 rounded-full bg-red-600 px-7 text-sm font-black text-white transition hover:bg-red-700"
                >
                  Join
                </button>
              </div>

              <div className="mt-8 flex items-center gap-3">
                {['f', 't', 'ig', 'in'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-bold text-white/75 transition hover:border-white/35 hover:text-white"
                    aria-label={`Open ${item} social link`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white">Services</h3>
              <div className="mt-5 space-y-4 text-sm font-semibold text-white/80">
                <Link className="block transition-colors hover:text-white" to="/sell/phone">Sell Phone</Link>
                <Link className="block transition-colors hover:text-white" to="/find-new-phone">Find New Phone</Link>
                <Link className="block transition-colors hover:text-white" to="/buy-accessories">Buy Accessories</Link>
                <Link className="block transition-colors hover:text-white" to="/repair-phone">Repair Phone</Link>
                <Link className="block transition-colors hover:text-white" to="/nearby-stores">Nearby Stores</Link>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white">Company</h3>
              <div className="mt-5 space-y-4 text-sm font-semibold text-white/80">
                <Link className="block transition-colors hover:text-white" to="/about">About Us</Link>
                <Link className="block transition-colors hover:text-white" to="/careers">Careers</Link>
                <Link className="block transition-colors hover:text-white" to="/warranty-policy">Privacy Policy</Link>
                <Link className="block transition-colors hover:text-white" to="/warranty-policy">Terms of Use</Link>
                <Link className="block transition-colors hover:text-white" to="/warranty-policy">Warranty</Link>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white">Support</h3>
              <div className="mt-5 space-y-4 text-sm font-semibold text-white/80">
                <Link className="block transition-colors hover:text-white" to="/about">FAQ</Link>
                <Link className="block transition-colors hover:text-white" to="/about">Contact Us</Link>
                <Link className="block transition-colors hover:text-white" to="/warranty-policy">Refund Policy</Link>
                <Link className="block transition-colors hover:text-white" to="/warranty-policy">Shipping</Link>
                <Link className="block transition-colors hover:text-white" to="/about">Sitemap</Link>
              </div>
              <div className="mt-8">
                <Link
                  to="/login"
                  state={{ redirectTo: '/admin' }}
                  className="inline-flex rounded-xl bg-red-950/70 px-4 py-2 text-sm font-black text-red-300 ring-1 ring-red-800/80 transition hover:bg-red-900/80 hover:text-red-200"
                >
                  Admin Portal
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs font-semibold text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} BAS karo. All rights reserved. Made in India with ❤️</p>
            <div className="flex items-center gap-6 uppercase tracking-[0.14em]">
              <Link className="transition hover:text-white/80" to="/warranty-policy">Privacy</Link>
              <Link className="transition hover:text-white/80" to="/warranty-policy">Terms</Link>
              <Link className="transition hover:text-white/80" to="/warranty-policy">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
