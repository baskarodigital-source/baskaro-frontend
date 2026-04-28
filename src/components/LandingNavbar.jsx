import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ChevronRight,
  MapPin,
  Menu,
  X,
  Bell,
  LogIn,
  UserCircle,
  Heart,
  ShoppingCart,
  LogOut,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { getToken, getUser, logout } from '../lib/auth.js'

export function LandingNavbar() {
  const navigate = useNavigate()
  const { wishlistCount } = useWishlist()
  const { cartCount } = useCart()
  const [location] = useState('Gurgaon')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sellDesktopOpen, setSellDesktopOpen] = useState(false)
  const [preOwnedDropdownOpen, setPreOwnedDropdownOpen] = useState(false)
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileSellOpen, setMobileSellOpen] = useState(false)
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const token = getToken()
  const user = getUser()
  const loggedIn = Boolean(token && user)
  const accountAriaLabel = loggedIn ? 'Account menu' : 'Log in or register'

  useEffect(() => {
    if (
      !moreDropdownOpen &&
      !sellDesktopOpen &&
      !mobileMenuOpen &&
      !mobileSellOpen &&
      !mobileMoreOpen &&
      !profileMenuOpen
    )
      return

    const isMobileModalOpen = mobileMenuOpen || mobileSellOpen || mobileMoreOpen

    let prevBodyOverflow = ''
    let prevHtmlOverflow = ''

    if (isMobileModalOpen) {
      prevBodyOverflow = document.body.style.overflow
      prevHtmlOverflow = document.documentElement.style.overflow
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMoreDropdownOpen(false)
        setMobileMenuOpen(false)
        setMobileSellOpen(false)
        setMobileMoreOpen(false)
        setSellDesktopOpen(false)
        setPreOwnedDropdownOpen(false)
        setProfileMenuOpen(false)
      }
    }

    const onPointerDown = (e) => {
      if (!(e.target instanceof Element)) return
      if (e.target.closest('[data-topnav-dropdown="true"]')) return
      setMoreDropdownOpen(false)
      setSellDesktopOpen(false)
      setPreOwnedDropdownOpen(false)
      setProfileMenuOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
      if (isMobileModalOpen) {
        document.body.style.overflow = prevBodyOverflow
        document.documentElement.style.overflow = prevHtmlOverflow
      }
    }
  }, [moreDropdownOpen, sellDesktopOpen, preOwnedDropdownOpen, mobileMenuOpen, mobileSellOpen, mobileMoreOpen, profileMenuOpen])

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/90">
      <div className="flex h-16 w-full items-center gap-4 px-4 sm:px-6 md:h-20 lg:px-12">
        {/* Logo & Search Area */}
        <div className="flex items-center gap-8 flex-1">
          <Link
            to="/"
            className="flex shrink-0 items-center transition-transform hover:scale-105"
            aria-label="BASkaro home"
          >
            <img
              src="/logo.png"
              alt="BAS karo"
              className="h-8 w-auto object-contain sm:h-10 md:h-12"
            />
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden flex-1 md:block max-w-xl">
            <div className="relative group">
              <input
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 pr-12 text-sm transition-all focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none placeholder:text-slate-400 font-medium"
                placeholder="Search for TV, Mobiles, Headphones & more"
                type="search"
              />
              <button className="absolute right-0 top-0 h-full px-4 text-slate-400 hover:text-rose-600 transition-colors">
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Actions (Restored) */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors md:hidden"
            aria-label="Toggle search"
          >
            <Search size={19} />
          </button>

          <div className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[12px] font-bold text-slate-700 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer group sm:flex">
            <MapPin size={13} className="text-rose-600 group-hover:scale-110 transition-transform" />
            <span>{location}</span>
          </div>

          <Link
            to="/cart"
            className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 sm:p-2.5"
            aria-label="Open cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 min-w-[16px] rounded-full bg-slate-900 px-1 text-center text-[9px] font-black leading-[16px] text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          <Link
            to="/wishlist"
            className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 sm:p-2.5"
            aria-label="Open wishlist"
          >
            <Heart size={18} />
            {wishlistCount > 0 ? (
              <span className="absolute -right-1 -top-1 min-w-[16px] rounded-full bg-rose-600 px-1 text-center text-[9px] font-black leading-[16px] text-white">
                {wishlistCount}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            className="hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 sm:p-2.5 lg:block"
          >
            <Bell size={18} />
          </button>

          {loggedIn ? (
            <div className="relative" data-topnav-dropdown="true">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 sm:p-2.5"
                aria-label={accountAriaLabel}
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
              >
                <UserCircle size={22} strokeWidth={2} aria-hidden />
              </button>
              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full z-[120] mt-2 w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl"
                  >
                    <Link
                      role="menuitem"
                      to="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-[13px] font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <UserCircle size={17} strokeWidth={2} aria-hidden />
                      Profile
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        logout()
                        navigate('/')
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-[13px] font-bold text-slate-700 hover:bg-rose-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut size={17} strokeWidth={2} aria-hidden />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-slate-900 px-3 py-2 text-[12px] font-black text-white shadow-lg shadow-slate-900/10 hover:bg-rose-600 hover:shadow-rose-600/20 transition-all active:scale-95 sm:px-5 sm:text-sm"
            >
              Login/sign up
            </Link>
          )}

          <button
            type="button"
            className="md:hidden rounded-xl bg-slate-100 p-2 text-slate-900 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Full-width Category Bar */}
      <nav className="hidden border-t border-slate-100 bg-white md:block">
        <div className="flex w-full items-center gap-8 px-4 py-3 sm:px-6 lg:px-12">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-slate-600 hover:text-rose-600 transition-colors"
          >
            <Menu size={22} />
          </button>

          <div className="flex flex-1 items-center gap-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { label: 'Mobiles', path: '/marketplace?categoryId=mobiles' },
              { label: 'Electronics', path: '/marketplace?categoryId=electronics' },
              { label: 'TV, AC & Appliances', path: '/marketplace?categoryId=tv' },
              { label: 'Kitchen & Home', path: '/marketplace?categoryId=kitchen' },
              { label: 'Health & Wellness', path: '/marketplace?categoryId=health' },
              { label: 'Fashion', path: '/marketplace?categoryId=fashion' },
              { label: 'Baby & Kids', path: '/marketplace?categoryId=baby' },
              { label: 'Sports & Fitness', path: '/marketplace?categoryId=sports' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="whitespace-nowrap text-[13px] font-bold text-slate-600 hover:text-rose-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>



      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] flex flex-col bg-white md:hidden"
          >
            <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
              <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <img src="/logo.png" alt="BAS karo" className="h-8 w-auto object-contain" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl bg-slate-100 p-2 text-slate-900 hover:text-rose-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 custom-scrollbar">
              <nav className="flex flex-col gap-2">
                {[
                  { label: 'Home', path: '/' },
                  { label: 'Sell Phone', path: '/sell-phone' },
                  { label: 'Buy Pre-Owned', path: '/marketplace' },
                  { label: `Wishlist${wishlistCount ? ` (${wishlistCount})` : ''}`, path: '/wishlist' },
                  { label: `Cart${cartCount ? ` (${cartCount})` : ''}`, path: '/cart' },
                  { label: 'Find New Phone', path: '/find-new-phone' },
                  { label: 'Repairs', path: '/repair-phone' },
                  { label: 'Store Locator', path: '/nearby-stores' },
                  { label: 'About Us', path: '/about' },
                  { label: 'Warranty Policy', path: '/warranty-policy' },
                  { label: 'Refer & Earn', path: '/refer-earn' },
                  { label: 'Careers', path: '/careers' },
                  { label: 'Press Releases', path: '/press-releases' },
                ].map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-4 text-sm font-black text-slate-900 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
                  >
                    <span>{link.label}</span>
                    <ChevronRight size={18} className="opacity-50" />
                  </Link>
                ))}
              </nav>

              <div className="mt-12 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Partner Programs</h4>
                <div className="grid grid-cols-2 gap-4">
                  {['Warranty', 'Insurance', 'Referral', 'Corporate'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="flex flex-col gap-1 text-left p-3 rounded-xl bg-white border border-slate-100 shadow-sm"
                    >
                      <span className="text-[12px] font-black text-slate-900">{item}</span>
                      <span className="text-[10px] font-bold text-slate-400">Learn More</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t bg-slate-50/50 p-6">
              {loggedIn ? (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-sm font-black text-white shadow-xl hover:bg-rose-600 transition-all active:scale-95"
                    aria-label="Open profile"
                  >
                    <UserCircle size={20} strokeWidth={2} aria-hidden />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      logout()
                      navigate('/')
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white py-4 text-sm font-black text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                  >
                    <LogOut size={18} aria-hidden />
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-sm font-black text-white shadow-xl hover:bg-rose-600 transition-all active:scale-95"
                  aria-label="Log in or register"
                >
                  <LogIn size={18} aria-hidden />
                  Login / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
