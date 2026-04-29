import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LandingNavbar } from './LandingNavbar'
import { CategoryRibbon } from './CategoryRibbon'
import { WhatsAppWidget } from './WhatsAppWidget'

// Custom Social Icons since Lucide removed them in recent versions
const FacebookIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
)
const TwitterIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
)
const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
)
const LinkedinIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
)

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
          <div className="grid gap-8 grid-cols-2 md:grid-cols-5">
            <div>
              <img
                src="/logo.png"
                alt="BAS karo"
                className="ml-2 h-10 w-auto max-w-[180px] object-contain object-left drop-shadow-sm"
              />
              <p className="mt-2 text-sm font-semibold text-red-200/90">
                Buy and sell pre-owned mobiles with confidence.
              </p>
              <div className="mt-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-red-400">Follow us on</h3>
                <div className="mt-3 flex gap-4">
                  <a href="#" className="text-red-200/60 hover:text-white transition-colors">
                    <FacebookIcon size={20} />
                  </a>
                  <a href="#" className="text-red-200/60 hover:text-white transition-colors">
                    <TwitterIcon size={20} />
                  </a>
                  <a href="#" className="text-red-200/60 hover:text-white transition-colors">
                    <InstagramIcon size={20} />
                  </a>
                  <a href="#" className="text-red-200/60 hover:text-white transition-colors">
                    <LinkedinIcon size={20} />
                  </a>
                </div>
              </div>
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
