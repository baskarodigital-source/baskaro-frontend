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
      <footer className="border-t border-red-900/50 bg-gradient-to-b from-red-950 via-zinc-950 to-black text-red-100">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <img
                src="/logo.png"
                alt="BAS karo"
                className="ml-2 h-10 w-auto max-w-[180px] object-contain object-left drop-shadow-sm"
              />
              <p className="mt-2 text-sm font-semibold text-red-200/90">
                Buy and sell pre-owned mobiles with confidence.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-white">Services</h3>
              <div className="mt-3 space-y-2 text-sm font-semibold text-red-200/95">
                <a className="block transition-colors hover:text-white" href="/sell-phone">
                  Sell Phone
                </a>
                <a className="block transition-colors hover:text-white" href="/find-new-phone">
                  Find New Phone
                </a>
                <a className="block transition-colors hover:text-white" href="/buy-accessories">
                  Buy Accessories
                </a>
                <a className="block transition-colors hover:text-white" href="/repair-phone">
                  Repair Phone
                </a>
                <a className="block transition-colors hover:text-white" href="/nearby-stores">
                  Nearby Stores
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-white">Company</h3>
              <div className="mt-3 space-y-2 text-sm font-semibold text-red-200/95">
                <a className="block transition-colors hover:text-white" href="#">
                  About Us
                </a>
                <a className="block transition-colors hover:text-white" href="#">
                  Careers
                </a>
                <a className="block transition-colors hover:text-white" href="#">
                  Privacy Policy
                </a>
                <a className="block transition-colors hover:text-white" href="#">
                  Terms of Use
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-white">Help & Support</h3>
              <div className="mt-3 space-y-2 text-sm font-semibold text-red-200/95">
                <a className="block transition-colors hover:text-white" href="#">
                  FAQ
                </a>
                <a className="block transition-colors hover:text-white" href="#">
                  Contact Us
                </a>
                <a className="block transition-colors hover:text-white" href="#">
                  Warranty
                </a>
                <a className="block transition-colors hover:text-white" href="#">
                  Refund Policy
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-white">Portal</h3>
              <div className="mt-3 space-y-2 text-sm font-semibold text-red-200/95">
                <Link className="block transition-colors hover:text-white" to="/login" state={{ redirectTo: '/admin' }}>
                  Admin Login
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-red-900/30 pt-6 text-center text-xs font-semibold text-red-300/80 sm:text-left">
            Copyright &copy; {new Date().getFullYear()} BAS karo. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  )
}
