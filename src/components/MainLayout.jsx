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
      <footer className="relative border-t border-red-500/40 bg-[#010101] text-white pt-24 pb-12 overflow-hidden">
        {/* Advanced Animated Mesh Gradient Layers */}
        <div className="absolute -bottom-48 -right-48 w-[800px] h-[800px] pointer-events-none">
          <div 
            className="w-full h-full bg-red-600/25 blur-[160px] rounded-full animate-float-glow" 
            style={{ willChange: 'transform' }}
          />
        </div>
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] pointer-events-none">
          <div 
            className="w-full h-full bg-red-500/20 blur-[140px] rounded-full animate-float-glow [animation-delay:-2s]" 
            style={{ willChange: 'transform' }}
          />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none">
          <div 
            className="w-full h-full bg-red-600/15 blur-[120px] rounded-full animate-float-glow [animation-delay:-4s]" 
            style={{ willChange: 'transform' }}
          />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-red-900/30 to-transparent pointer-events-none" />

        {/* Futuristic Glowing Top Edge (Enhanced) */}
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.5)]" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-12 lg:gap-x-12">
            {/* Brand & Newsletter Section */}
            <div className="lg:col-span-5">
              <Link to="/" className="inline-block transition-transform hover:scale-105">
                <img src="/logo.png" alt="BAS karo" className="h-12 w-auto brightness-110" />
              </Link>
              <p className="mt-6 max-w-sm text-base font-medium text-zinc-400/90 leading-relaxed">
                India's most trusted platform to buy and sell pre-owned devices. <span className="text-zinc-100">Fast, secure, and transparent.</span>
              </p>
              
              <div className="mt-10">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">Stay Updated</h3>
                <p className="mt-2 text-sm text-zinc-500">Subscribe to get the best deals on pre-owned flagships.</p>
                <form className="mt-4 flex max-w-md gap-x-2" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    required
                    className="min-w-0 flex-auto rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm ring-1 ring-inset ring-white/10 transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="Enter your email"
                  />
                  <button
                    type="submit"
                    className="flex-none rounded-full bg-gradient-to-r from-red-600 to-rose-500 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-red-600/20 hover:from-red-500 hover:to-rose-400 transition-all active:scale-95"
                  >
                    Join
                  </button>
                </form>
              </div>

              <div className="mt-10 flex gap-5">
                {[
                  { icon: FacebookIcon, href: '#', label: 'Facebook' },
                  { icon: TwitterIcon, href: '#', label: 'Twitter' },
                  { icon: InstagramIcon, href: '#', label: 'Instagram' },
                  { icon: LinkedinIcon, href: '#', label: 'LinkedIn' }
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
                    aria-label={social.label}
                  >
                    <social.icon size={18} className="transition-transform group-hover:scale-110" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Services</h3>
                <ul className="mt-6 space-y-4">
                  {[
                    { label: 'Sell Phone', href: '/sell-phone' },
                    { label: 'Find New Phone', href: '/find-new-phone' },
                    { label: 'Buy Accessories', href: '/buy-accessories' },
                    { label: 'Repair Phone', href: '/repair-phone' },
                    { label: 'Nearby Stores', href: '/nearby-stores' }
                  ].map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-sm font-bold text-zinc-400 transition-colors hover:text-red-500">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Company</h3>
                <ul className="mt-6 space-y-4">
                  {['About Us', 'Careers', 'Privacy Policy', 'Terms of Use', 'Warranty'].map((label) => (
                    <li key={label}>
                      <a href="#" className="text-sm font-bold text-zinc-400 transition-colors hover:text-red-500">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Support</h3>
                <ul className="mt-6 space-y-4">
                  {['FAQ', 'Contact Us', 'Refund Policy', 'Shipping', 'Sitemap'].map((label) => (
                    <li key={label}>
                      <a href="#" className="text-sm font-bold text-zinc-400 transition-colors hover:text-red-500">
                        {label}
                      </a>
                    </li>
                  ))}
                  <li className="pt-4">
                    <Link 
                      to="/login" 
                      state={{ redirectTo: '/admin' }}
                      className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-black text-red-500 ring-1 ring-red-500/20 hover:bg-red-500/10 transition-all"
                    >
                      Admin Portal
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-20 border-t border-white/5 pt-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-xs font-bold text-zinc-500">
              &copy; {new Date().getFullYear()} BAS karo. All rights reserved. Made in India with ❤️
            </p>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
              <a href="#" className="hover:text-red-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-red-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-red-500 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
