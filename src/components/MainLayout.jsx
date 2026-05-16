import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { LandingNavbar } from './LandingNavbar'
import { CategoryRibbon } from './CategoryRibbon'
import { WhatsAppWidget } from './WhatsAppWidget'
import { MobileBottomNav } from './MobileBottomNav'
import { SiteFooter } from './SiteFooter'

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
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <LandingNavbar />
      <div className="mt-3 bg-white sm:mt-4">
        <CategoryRibbon variant="bar" />
      </div>
      <div className="pb-[120px] sm:pb-0">
        {children}
        <SiteFooter />
      </div>

      <MobileBottomNav />
      <WhatsAppWidget />
    </div>
  )
}
