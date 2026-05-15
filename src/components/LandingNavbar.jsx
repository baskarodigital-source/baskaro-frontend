import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ChevronRight,
  ChevronDown,
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

/** Category “home” = /sell/:slug; dropdown sub-rows = /sell/sub (placeholder). */
const SELL_HUB = '/sell/phone'

const sellSubLink = (label, categorySlug) => ({
  label,
  to: `/sell/sub?item=${encodeURIComponent(label)}&cat=${encodeURIComponent(categorySlug)}`,
})

const SELL_PHONE_NAV_GROUPS = [
  {
    title: 'Phone',
    slug: 'phone',
    brands: [
      sellSubLink('Apple', 'phone'),
      sellSubLink('Xiaomi', 'phone'),
      sellSubLink('Samsung', 'phone'),
      sellSubLink('OnePlus', 'phone'),
      sellSubLink('Nokia', 'phone'),
      sellSubLink('Poco', 'phone'),
      sellSubLink('More brands', 'phone'),
    ],
    selling: [
      sellSubLink('Apple iPhone 11', 'phone'),
      sellSubLink('Samsung Galaxy Note 20', 'phone'),
      sellSubLink('OnePlus 9 Pro', 'phone'),
      sellSubLink('Xiaomi Redmi Note 4', 'phone'),
    ],
  },
  {
    title: 'Laptops',
    slug: 'laptops',
    brands: [
      sellSubLink('Apple', 'laptops'),
      sellSubLink('HP', 'laptops'),
      sellSubLink('Samsung', 'laptops'),
      sellSubLink('Lenovo', 'laptops'),
      sellSubLink('Dell', 'laptops'),
      sellSubLink('Honor', 'laptops'),
      sellSubLink('More laptops', 'laptops'),
    ],
    selling: [
      sellSubLink('Pavilion series', 'laptops'),
      sellSubLink('Vostro series', 'laptops'),
      sellSubLink('Inspiron series', 'laptops'),
    ],
  },
  {
    title: 'Smart speaker',
    slug: 'smart-speaker',
    brands: [
      sellSubLink('Apple', 'smart-speaker'),
      sellSubLink('Lenovo', 'smart-speaker'),
      sellSubLink('Xiaomi', 'smart-speaker'),
      sellSubLink('Asus', 'smart-speaker'),
      sellSubLink('More', 'smart-speaker'),
    ],
    selling: [],
  },
  {
    title: 'Tablet',
    slug: 'tablet',
    brands: [
      sellSubLink('Apple', 'tablet'),
      sellSubLink('Lenovo', 'tablet'),
      sellSubLink('Samsung', 'tablet'),
      sellSubLink('Honor', 'tablet'),
      sellSubLink('More', 'tablet'),
    ],
    selling: [],
  },
  {
    title: 'Gaming consoles',
    slug: 'gaming-consoles',
    brands: [
      sellSubLink('Sony', 'gaming-consoles'),
      sellSubLink('Microsoft', 'gaming-consoles'),
      sellSubLink('More', 'gaming-consoles'),
    ],
    selling: [],
  },
  { title: 'iMac', solo: true, slug: 'imac' },
  {
    title: 'Smartwatch',
    slug: 'smartwatch',
    brands: [
      sellSubLink('Apple', 'smartwatch'),
      sellSubLink('Xiaomi', 'smartwatch'),
      sellSubLink('Samsung', 'smartwatch'),
      sellSubLink('OnePlus', 'smartwatch'),
      sellSubLink('More', 'smartwatch'),
    ],
    selling: [],
  },
  {
    title: 'TV',
    slug: 'tv',
    brands: [
      sellSubLink('Motorola', 'tv'),
      sellSubLink('Xiaomi', 'tv'),
      sellSubLink('Samsung', 'tv'),
      sellSubLink('OnePlus', 'tv'),
      sellSubLink('More', 'tv'),
    ],
    selling: [],
  },
  {
    title: 'Earbuds',
    slug: 'earbuds',
    brands: [
      sellSubLink('Google', 'earbuds'),
      sellSubLink('Samsung', 'earbuds'),
      sellSubLink('Sony', 'earbuds'),
      sellSubLink('More', 'earbuds'),
    ],
    selling: [],
  },
  {
    title: 'DSLR camera',
    slug: 'dslr-camera',
    brands: [
      sellSubLink('Sony', 'dslr-camera'),
      sellSubLink('Nikon', 'dslr-camera'),
      sellSubLink('Canon', 'dslr-camera'),
      sellSubLink('More', 'dslr-camera'),
    ],
    selling: [],
  },
  { title: 'AC', solo: true, slug: 'ac' },
]

const BUY_PREOWNED_CATEGORIES = [
  { label: 'Refurbished phones', to: '/buy-pre-owned/category/phones' },
  { label: 'Refurbished laptops', to: '/buy-pre-owned/category/laptops' },
  { label: 'Refurbished smart watch', to: '/buy-pre-owned/category/smart-watch' },
  { label: 'Refurbished tablets', to: '/buy-pre-owned/category/tablets' },
  { label: 'Refurbished gaming consoles', to: '/buy-pre-owned/category/gaming-consoles' },
  { label: 'Refurbished cameras', to: '/buy-pre-owned/category/cameras' },
  { label: 'Audio devices', to: '/buy-pre-owned/category/audio-devices' },
  { label: 'Amazon devices', to: '/buy-pre-owned/category/amazon-devices' },
]

const BUY_PREOWNED_TOP_BRANDS = [
  { label: 'Apple', to: '/buy-pre-owned/brand/apple' },
  { label: 'Xiaomi', to: '/buy-pre-owned/brand/xiaomi' },
  { label: 'Samsung', to: '/buy-pre-owned/brand/samsung' },
  { label: 'OnePlus', to: '/buy-pre-owned/brand/oneplus' },
  { label: 'Google', to: '/buy-pre-owned/brand/google' },
  { label: 'OPPO', to: '/buy-pre-owned/brand/oppo' },
  { label: 'Vivo', to: '/buy-pre-owned/brand/vivo' },
  { label: 'More', to: '/buy-pre-owned/brand/more' },
]

const FIND_NEW_GADGETS_PRIMARY = [
  { label: 'Find new phones', to: '/find-new-gadgets/phones' },
  { label: 'Find new laptops', to: '/find-new-gadgets/laptops' },
  { label: 'Find new smartwatch', to: '/find-new-gadgets/smartwatch' },
  { label: 'Find new tablet', to: '/find-new-gadgets/tablet' },
]

const FIND_NEW_GADGETS_EXPLORE = [
  { label: 'Videos', to: '/find-new-gadgets/explore/videos' },
  { label: 'Reviews', to: '/find-new-gadgets/explore/reviews' },
  { label: 'News', to: '/find-new-gadgets/explore/news' },
  { label: 'Articles', to: '/find-new-gadgets/explore/articles' },
  { label: 'QnA', to: '/find-new-gadgets/explore/qna' },
  { label: 'Tips and tricks', to: '/find-new-gadgets/explore/tips-and-tricks' },
  { label: 'Tech news', to: '/find-new-gadgets/explore/tech-news' },
]

export function LandingNavbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { wishlistCount } = useWishlist()
  const { cartCount } = useCart()
  const [location] = useState('Gurgaon')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sellDesktopOpen, setSellDesktopOpen] = useState(false)
  const [preOwnedDropdownOpen, setPreOwnedDropdownOpen] = useState(false)
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [sellNavMobileExpanded, setSellNavMobileExpanded] = useState(false)
  const [preOwnedMobileExpanded, setPreOwnedMobileExpanded] = useState(false)
  const [gadgetsDropdownOpen, setGadgetsDropdownOpen] = useState(false)
  const [gadgetsMobileExpanded, setGadgetsMobileExpanded] = useState(false)
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const token = getToken()
  const user = getUser()
  const loggedIn = Boolean(token && user)
  const accountAriaLabel = loggedIn ? 'Account menu' : 'Log in or register'
  const navBaseClass =
    'flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-[15px] font-bold transition-all'
  const navDesktopClass = (active) =>
    `${navBaseClass} ${
      active
        ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
        : 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'
    }`

  const isHomeActive = pathname === '/' || pathname === '/home'
  const isSellActive = pathname === '/sell-phone' || pathname.startsWith('/sell/')
  const isPreOwnedActive = pathname.startsWith('/buy-pre-owned')
  const isWishlistActive = pathname.startsWith('/wishlist')
  const isGadgetsActive = pathname.startsWith('/find-new-gadgets') || pathname.startsWith('/find-new-phone')
  const isRepairsActive = pathname.startsWith('/repair-phone')
  const isMoreActive = [
    '/new-offers',
    '/partner',
    '/contact',
    '/contact-us',
    '/warranty-policy',
    '/refer-earn',
    '/about',
    '/careers',
    '/articles',
    '/become-partner',
    '/press-releases',
    '/terms-and-conditions',
  ].some((route) => pathname.startsWith(route))

  useEffect(() => {
    if (
      !moreDropdownOpen &&
      !sellDesktopOpen &&
      !preOwnedDropdownOpen &&
      !gadgetsDropdownOpen &&
      !mobileMenuOpen &&
      !mobileMoreOpen &&
      !profileMenuOpen
    )
      return

    const isMobileModalOpen = mobileMenuOpen || mobileMoreOpen

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
        setMobileMoreOpen(false)
        setSellDesktopOpen(false)
        setPreOwnedDropdownOpen(false)
        setGadgetsDropdownOpen(false)
        setProfileMenuOpen(false)
        setSellNavMobileExpanded(false)
        setPreOwnedMobileExpanded(false)
        setGadgetsMobileExpanded(false)
      }
    }

    const onPointerDown = (e) => {
      if (!(e.target instanceof Element)) return
      if (e.target.closest('[data-topnav-dropdown="true"]')) return
      setMoreDropdownOpen(false)
      setSellDesktopOpen(false)
      setPreOwnedDropdownOpen(false)
      setGadgetsDropdownOpen(false)
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
  }, [moreDropdownOpen, sellDesktopOpen, preOwnedDropdownOpen, gadgetsDropdownOpen, mobileMenuOpen, mobileMoreOpen, profileMenuOpen])

  return (
    <header className="sticky top-0 z-[100] w-full max-w-[100vw] overflow-x-hidden border-b border-slate-200 bg-white">
      <div className="flex h-14 w-full max-w-full items-center gap-2 px-3 sm:h-[78px] sm:gap-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex min-w-0 shrink items-center">
          <Link
            to="/"
            className="flex min-w-0 items-center group transition-transform hover:scale-[1.02] active:scale-[0.98]"
            aria-label="BASkaro home"
          >
            <img
              src="/logo.png"
              alt="BAS karo"
              className="h-9 w-auto max-w-[108px] object-contain object-left sm:h-12 sm:max-w-[150px] md:h-14 md:max-w-[190px] lg:h-16"
            />
          </Link>
        </div>

        <div className="relative hidden max-w-[620px] flex-1 lg:block">
          <input
            className="h-[46px] w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-5 pr-12 text-[15px] font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
            placeholder="Search for TV, Mobiles, Headphones & more"
            type="search"
          />
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={19} />
          </div>
        </div>

        <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-1 sm:gap-2.5 lg:gap-3">
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Toggle search"
          >
            <Search size={19} />
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-10 items-center gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50/70 px-3 text-[12px] font-bold text-slate-700 transition-colors cursor-pointer hover:border-rose-300 hover:bg-rose-100/70 group">
              <MapPin size={13} className="text-rose-600 transition-transform group-hover:scale-110" />
              <span>{location}</span>
            </div>
          </div>

          <Link
            to="/cart"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200/80 bg-rose-50/65 text-rose-700 transition hover:border-rose-300 hover:bg-rose-100/70 hover:text-rose-800"
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
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200/80 bg-rose-50/70 text-rose-700 transition hover:border-rose-300 hover:bg-rose-100/70 hover:text-rose-800"
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
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-rose-200/80 bg-rose-50/70 text-rose-700 transition hover:border-rose-300 hover:bg-rose-100/70 hover:text-rose-800 lg:flex"
          >
            <Bell size={18} />
          </button>

          {loggedIn ? (
            <div className="relative" data-topnav-dropdown="true">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="rounded-xl border border-rose-200/80 bg-rose-50/70 p-2 text-rose-700 transition hover:border-rose-300 hover:bg-rose-100/70 hover:text-rose-800"
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
              aria-label="Log in or sign up"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200/80 bg-slate-900 text-white transition hover:border-rose-300 hover:bg-rose-600 sm:inline-flex sm:h-11 sm:w-auto sm:gap-1.5 sm:px-5 sm:text-sm sm:font-black sm:shadow-lg sm:shadow-slate-900/10"
            >
              <LogIn size={18} strokeWidth={2.25} className="sm:hidden" aria-hidden />
              <span className="hidden sm:inline">Login / Sign up</span>
            </Link>
          )}

          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900 transition-colors hover:bg-rose-50 hover:text-rose-600 md:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-x-0 top-full z-[110] border-b border-slate-100 bg-white p-4 shadow-xl xl:hidden"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                autoFocus
                type="search"
                placeholder="Search phones..."
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-rose-500 focus:bg-white transition-all"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="relative hidden w-full border-t border-slate-100 bg-white md:block">
        <div className="mx-3 mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:mx-4 lg:mx-6">
          <button
            type="button"
            className="shrink-0 rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={19} />
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-between gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              to="/"
              className={navDesktopClass(isHomeActive)}
            >
              <span>Home</span>
              <ChevronDown size={13} className="text-slate-500" />
            </Link>

            <div className="relative shrink-0" data-topnav-dropdown="true">
              <button
                type="button"
                onClick={() => {
                  setSellDesktopOpen((v) => !v)
                  setMoreDropdownOpen(false)
                  setPreOwnedDropdownOpen(false)
                  setGadgetsDropdownOpen(false)
                }}
                className={navDesktopClass(isSellActive)}
                aria-expanded={sellDesktopOpen}
                aria-haspopup="true"
              >
                <span>Sell Phone</span>
                <ChevronDown size={13} className={`text-slate-500 transition-transform ${sellDesktopOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="relative shrink-0" data-topnav-dropdown="true">
              <button
                type="button"
                onClick={() => {
                  setPreOwnedDropdownOpen((v) => !v)
                  setSellDesktopOpen(false)
                  setMoreDropdownOpen(false)
                  setGadgetsDropdownOpen(false)
                }}
                className={navDesktopClass(isPreOwnedActive)}
                aria-expanded={preOwnedDropdownOpen}
                aria-haspopup="true"
              >
                <span>Buy Pre-Owned</span>
                <ChevronDown
                  size={13}
                  className={`text-slate-500 transition-transform ${preOwnedDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {[
              { label: `Wishlist${wishlistCount ? ` (${wishlistCount})` : ''}`, path: '/wishlist' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={navDesktopClass(isWishlistActive)}
              >
                <span>{item.label}</span>
                <ChevronDown size={13} className="text-slate-500" />
              </Link>
            ))}

            <div className="relative shrink-0" data-topnav-dropdown="true">
              <button
                type="button"
                onClick={() => {
                  setGadgetsDropdownOpen((v) => !v)
                  setSellDesktopOpen(false)
                  setPreOwnedDropdownOpen(false)
                  setMoreDropdownOpen(false)
                }}
                className={navDesktopClass(isGadgetsActive)}
                aria-expanded={gadgetsDropdownOpen}
                aria-haspopup="true"
              >
                <span>Find New Gadgets</span>
                <ChevronDown
                  size={13}
                  className={`text-slate-500 transition-transform ${gadgetsDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            <Link to="/repair-phone" className={navDesktopClass(isRepairsActive)}>
              <span>Repairs</span>
              <ChevronDown size={13} className="text-slate-500" />
            </Link>

            <div className="relative" data-topnav-dropdown="true">
              <button
                type="button"
                onClick={() => {
                  setMoreDropdownOpen(!moreDropdownOpen)
                  setSellDesktopOpen(false)
                  setPreOwnedDropdownOpen(false)
                  setGadgetsDropdownOpen(false)
                }}
                className={navDesktopClass(isMoreActive)}
              >
                <span>MORE</span>
                <ChevronDown size={13} className={`text-slate-500 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

              <AnimatePresence>
                {moreDropdownOpen && (
                  <motion.div
              initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute right-3 top-full z-[120] mt-2 w-72 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl sm:right-4 lg:right-6"
              data-topnav-dropdown="true"
            >
              {[
                { label: 'New Offers', path: '/new-offers' },
                { label: 'Partner', path: '/partner' },
                { label: 'Contact', path: '/contact' },
                { label: 'Contact Us', path: '/contact-us' },
                { label: 'Warranty Policy', path: '/warranty-policy' },
                { label: 'Refer and Earn', path: '/refer-earn' },
              ].map((sub) => (
                <Link
                  key={sub.label}
                  to={sub.path}
                  onClick={() => setMoreDropdownOpen(false)}
                  className="block w-full rounded-xl px-4 py-2.5 text-left text-[13px] font-bold text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  {sub.label}
                </Link>
              ))}
              <div className="mx-2 my-1 h-px bg-slate-100" />
              <p className="px-4 pb-1 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Company</p>
                    {[
                      { label: 'About Us', path: '/about' },
                      { label: 'Careers', path: '/careers' },
                { label: 'Articles', path: '/articles' },
                { label: 'Become Partner', path: '/become-partner' },
                      { label: 'Press Releases', path: '/press-releases' },
                { label: 'Terms & Conditions', path: '/terms-and-conditions' },
                    ].map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.path}
                  onClick={() => setMoreDropdownOpen(false)}
                  className="block w-full rounded-xl px-4 py-2.5 text-left text-[13px] font-bold text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

        <AnimatePresence>
          {sellDesktopOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-0 top-full z-[115] flex justify-center px-3 pb-3 pt-1 sm:px-4 lg:px-6"
              data-topnav-dropdown="true"
            >
              <div className="max-h-[min(32rem,80vh)] w-full max-w-7xl overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-5 shadow-2xl sm:px-6 sm:py-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {SELL_PHONE_NAV_GROUPS.map((group) =>
                    group.solo ? (
                      <Link
                        key={group.title}
                        to={`/sell/${group.slug}`}
                        onClick={() => setSellDesktopOpen(false)}
                        className="flex min-h-[3rem] items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 text-center text-sm font-bold text-white transition hover:border-red-600/60 hover:bg-red-950/40 hover:text-red-400"
                      >
                        {group.title}
                      </Link>
                    ) : (
                      <div
                        key={group.title}
                        className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-inner"
                      >
                        <h3 className="border-b border-zinc-800 pb-2 text-xs font-black uppercase tracking-wider text-red-500">
                          <Link
                            to={`/sell/${group.slug}`}
                            onClick={() => setSellDesktopOpen(false)}
                            className="transition hover:text-red-400"
                          >
                            {group.title}
                          </Link>
                        </h3>
                        <div
                          className={
                            group.selling?.length
                              ? 'mt-3 grid grid-cols-2 gap-3'
                              : 'mt-3'
                          }
                        >
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">Top brands</p>
                            <ul className="mt-1.5 space-y-0.5">
                              {group.brands.map((item) => (
                                <li key={item.label}>
                                  <Link
                                    to={item.to}
                                    onClick={() => setSellDesktopOpen(false)}
                                    className="block rounded-md py-1 text-[13px] font-semibold text-zinc-200 transition hover:text-red-400"
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {group.selling?.length ? (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">Top selling</p>
                              <ul className="mt-1.5 space-y-0.5">
                                {group.selling.map((item) => (
                                  <li key={item.label}>
                                    <Link
                                      to={item.to}
                                      onClick={() => setSellDesktopOpen(false)}
                                      className="block rounded-md py-1 text-[13px] font-semibold text-zinc-200 transition hover:text-red-400"
                                    >
                                      {item.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ),
                  )}
                </div>
                <div className="mt-4 flex justify-center border-t border-zinc-800 pt-4">
                  <Link
                    to="/sell/phone"
                    onClick={() => setSellDesktopOpen(false)}
                    className="text-sm font-bold text-red-500 hover:text-red-400"
                  >
                    View all sell options →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {preOwnedDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-0 top-full z-[115] flex justify-center px-3 pb-3 pt-1 sm:px-4 lg:px-6"
              data-topnav-dropdown="true"
            >
              <div className="w-full max-w-7xl overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-5 shadow-2xl sm:px-6 sm:py-6">
                <div className="grid gap-6 md:grid-cols-2 md:gap-10">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Shop by category</p>
                    <ul className="mt-3 space-y-0.5">
                      {BUY_PREOWNED_CATEGORIES.map((item) => (
                        <li key={item.label}>
                          <Link
                            to={item.to}
                            onClick={() => setPreOwnedDropdownOpen(false)}
                            className="block rounded-lg py-2 text-[13px] font-semibold text-zinc-200 transition hover:bg-zinc-900 hover:text-red-400"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Top brands</p>
                    <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-0.5 sm:grid-cols-3">
                      {BUY_PREOWNED_TOP_BRANDS.map((item) => (
                        <li key={item.label}>
                          <Link
                            to={item.to}
                            onClick={() => setPreOwnedDropdownOpen(false)}
                            className="block rounded-lg py-2 text-[13px] font-semibold text-zinc-200 transition hover:bg-zinc-900 hover:text-red-400"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 flex justify-center border-t border-zinc-800 pt-4">
                  <Link
                    to="/buy-pre-owned"
                    onClick={() => setPreOwnedDropdownOpen(false)}
                    className="text-sm font-bold text-red-500 hover:text-red-400"
                  >
                    View Buy Pre-Owned hub →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {gadgetsDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-0 top-full z-[115] flex justify-center px-3 pb-3 pt-1 sm:px-4 lg:px-6"
              data-topnav-dropdown="true"
            >
              <div className="w-full max-w-7xl overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-5 shadow-2xl sm:px-6 sm:py-6">
                <div className="grid gap-6 md:grid-cols-2 md:gap-10">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Find new gadgets</p>
                    <ul className="mt-3 space-y-0.5">
                      {FIND_NEW_GADGETS_PRIMARY.map((item) => (
                        <li key={item.label}>
                          <Link
                            to={item.to}
                            onClick={() => setGadgetsDropdownOpen(false)}
                            className="block rounded-lg py-2 text-[13px] font-semibold text-zinc-200 transition hover:bg-zinc-900 hover:text-red-400"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Explore</p>
                    <ul className="mt-3 grid grid-cols-1 gap-0.5 sm:grid-cols-2">
                      {FIND_NEW_GADGETS_EXPLORE.map((item) => (
                        <li key={item.label}>
                          <Link
                            to={item.to}
                            onClick={() => setGadgetsDropdownOpen(false)}
                            className="block rounded-lg py-2 text-[13px] font-semibold text-zinc-200 transition hover:bg-zinc-900 hover:text-red-400"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
            </div>
          </div>
                <div className="mt-4 flex justify-center border-t border-zinc-800 pt-4">
                  <Link
                    to="/find-new-gadgets"
                    onClick={() => setGadgetsDropdownOpen(false)}
                    className="text-sm font-bold text-red-500 hover:text-red-400"
                  >
                    Find new gadgets hub →
                  </Link>
                </div>
        </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                <img src="/logo.png" alt="BAS karo" className="h-11 w-auto max-w-[180px] object-contain object-left" />
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
                <Link
                  to="/"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setSellNavMobileExpanded(false)
                    setPreOwnedMobileExpanded(false)
                    setGadgetsMobileExpanded(false)
                  }}
                  className="flex items-center justify-between rounded-xl border border-transparent px-4 py-4 text-sm font-black text-slate-900 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
                >
                  <span>Home</span>
                  <ChevronRight size={18} className="opacity-50" />
                </Link>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      setSellNavMobileExpanded((v) => !v)
                      setPreOwnedMobileExpanded(false)
                      setGadgetsMobileExpanded(false)
                    }}
                    className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-black text-slate-900 transition-colors hover:bg-zinc-950 hover:text-white"
                    aria-expanded={sellNavMobileExpanded}
                  >
                    <span>Sell Phone</span>
                    <ChevronDown size={18} className={`shrink-0 opacity-70 transition-transform ${sellNavMobileExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {sellNavMobileExpanded && (
                    <div className="max-h-[55vh] overflow-y-auto border-t border-slate-200 bg-zinc-950 px-3 py-3">
                      <Link
                        to={SELL_HUB}
                        onClick={() => {
                          setMobileMenuOpen(false)
                          setSellNavMobileExpanded(false)
                        }}
                        className="mb-3 block rounded-lg bg-red-600 px-3 py-2.5 text-center text-xs font-black text-white"
                      >
                        Sell hub — all categories
                      </Link>
                      <div className="space-y-4">
                        {SELL_PHONE_NAV_GROUPS.map((group) => (
                          <div key={group.title} className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
                            {group.solo ? (
                              <Link
                                to={`/sell/${group.slug}`}
                                onClick={() => {
                                  setMobileMenuOpen(false)
                                  setSellNavMobileExpanded(false)
                                }}
                                className="block text-sm font-bold text-red-400"
                              >
                                {group.title}
                              </Link>
                            ) : (
                              <>
                                <Link
                                  to={`/sell/${group.slug}`}
                                  onClick={() => {
                                    setMobileMenuOpen(false)
                                    setSellNavMobileExpanded(false)
                                  }}
                                  className="block text-[11px] font-black uppercase tracking-wider text-red-500"
                                >
                                  {group.title}
                                </Link>
                                <p className="mt-2 text-[10px] font-bold text-zinc-500">Top brands</p>
                                <ul className="mt-1 space-y-0.5">
                                  {group.brands.map((item) => (
                                    <li key={item.label}>
                                      <Link
                                        to={item.to}
                                        onClick={() => {
                                          setMobileMenuOpen(false)
                                          setSellNavMobileExpanded(false)
                                        }}
                                        className="block py-1 text-[13px] font-semibold text-zinc-200"
                                      >
                                        {item.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                                {group.selling?.length ? (
                                  <>
                                    <p className="mt-2 text-[10px] font-bold text-zinc-500">Top selling</p>
                                    <ul className="mt-1 space-y-0.5">
                                      {group.selling.map((item) => (
                                        <li key={item.label}>
                                          <Link
                                            to={item.to}
                                            onClick={() => {
                                              setMobileMenuOpen(false)
                                              setSellNavMobileExpanded(false)
                                            }}
                                            className="block py-1 text-[13px] font-semibold text-zinc-200"
                                          >
                                            {item.label}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                ) : null}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      setPreOwnedMobileExpanded((v) => !v)
                      setSellNavMobileExpanded(false)
                      setGadgetsMobileExpanded(false)
                    }}
                    className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-black text-slate-900 transition-colors hover:bg-zinc-950 hover:text-white"
                    aria-expanded={preOwnedMobileExpanded}
                  >
                    <span>Buy Pre-Owned</span>
                    <ChevronDown size={18} className={`shrink-0 opacity-70 transition-transform ${preOwnedMobileExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {preOwnedMobileExpanded && (
                    <div className="max-h-[55vh] overflow-y-auto border-t border-slate-200 bg-zinc-950 px-3 py-3">
                      <Link
                        to="/buy-pre-owned"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          setPreOwnedMobileExpanded(false)
                        }}
                        className="mb-3 block rounded-lg bg-red-600 px-3 py-2.5 text-center text-xs font-black text-white"
                      >
                        Buy Pre-Owned hub
                      </Link>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Shop by category</p>
                      <ul className="mt-1.5 space-y-0.5">
                        {BUY_PREOWNED_CATEGORIES.map((item) => (
                          <li key={item.label}>
                            <Link
                              to={item.to}
                              onClick={() => {
                                setMobileMenuOpen(false)
                                setPreOwnedMobileExpanded(false)
                              }}
                              className="block rounded-md py-1.5 text-[13px] font-semibold text-zinc-200"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Top brands</p>
                      <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5">
                        {BUY_PREOWNED_TOP_BRANDS.map((item) => (
                          <li key={item.label}>
                            <Link
                              to={item.to}
                              onClick={() => {
                                setMobileMenuOpen(false)
                                setPreOwnedMobileExpanded(false)
                              }}
                              className="block rounded-md py-1.5 text-[13px] font-semibold text-zinc-200"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      setGadgetsMobileExpanded((v) => !v)
                      setSellNavMobileExpanded(false)
                      setPreOwnedMobileExpanded(false)
                    }}
                    className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-black text-slate-900 transition-colors hover:bg-zinc-950 hover:text-white"
                    aria-expanded={gadgetsMobileExpanded}
                  >
                    <span>Find New Gadgets</span>
                    <ChevronDown size={18} className={`shrink-0 opacity-70 transition-transform ${gadgetsMobileExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {gadgetsMobileExpanded && (
                    <div className="max-h-[55vh] overflow-y-auto border-t border-slate-200 bg-zinc-950 px-3 py-3">
                      <Link
                        to="/find-new-gadgets"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          setGadgetsMobileExpanded(false)
                        }}
                        className="mb-3 block rounded-lg bg-red-600 px-3 py-2.5 text-center text-xs font-black text-white"
                      >
                        Find new gadgets hub
                      </Link>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Categories</p>
                      <ul className="mt-1.5 space-y-0.5">
                        {FIND_NEW_GADGETS_PRIMARY.map((item) => (
                          <li key={item.label}>
                            <Link
                              to={item.to}
                              onClick={() => {
                                setMobileMenuOpen(false)
                                setGadgetsMobileExpanded(false)
                              }}
                              className="block rounded-md py-1.5 text-[13px] font-semibold text-zinc-200"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Explore</p>
                      <ul className="mt-1.5 grid grid-cols-1 gap-0.5 sm:grid-cols-2">
                        {FIND_NEW_GADGETS_EXPLORE.map((item) => (
                          <li key={item.label}>
                            <Link
                              to={item.to}
                              onClick={() => {
                                setMobileMenuOpen(false)
                                setGadgetsMobileExpanded(false)
                              }}
                              className="block rounded-md py-1.5 text-[13px] font-semibold text-zinc-200"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {[
                  { label: `Wishlist${wishlistCount ? ` (${wishlistCount})` : ''}`, path: '/wishlist' },
                  { label: `Cart${cartCount ? ` (${cartCount})` : ''}`, path: '/cart' },
                  { label: 'Repairs', path: '/repair-phone' },
                  { label: 'About Us', path: '/about' },
                  { label: 'Warranty Policy', path: '/warranty-policy' },
                  { label: 'Refer & Earn', path: '/refer-earn' },
                  { label: 'Careers', path: '/careers' },
                  { label: 'Press Releases', path: '/press-releases' },
                ].map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setSellNavMobileExpanded(false)
                      setPreOwnedMobileExpanded(false)
                      setGadgetsMobileExpanded(false)
                    }}
                    className="flex items-center justify-between rounded-xl border border-transparent px-4 py-4 text-sm font-black text-slate-900 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
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
