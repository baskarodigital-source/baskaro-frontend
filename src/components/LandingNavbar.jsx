import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

/** Desktop category bar — each top item opens a dropdown panel */
const CATEGORY_BAR_MENUS = [
  {
    id: 'all',
    label: 'All',
    links: [
      { label: 'Browse everything', path: '/marketplace' },
      { label: 'Mobiles', path: '/marketplace?categoryId=mobiles' },
      { label: 'Electronics', path: '/marketplace?categoryId=electronics' },
      { label: 'TV, AC & appliances', path: '/marketplace?categoryId=tv' },
      { label: 'Kitchen & home', path: '/marketplace?categoryId=kitchen' },
      { label: 'Health & wellness', path: '/marketplace?categoryId=health' },
      { label: 'Fashion', path: '/marketplace?categoryId=fashion' },
      { label: 'Sports & fitness', path: '/marketplace?categoryId=sports' },
    ],
  },
  {
    id: 'sell-phones',
    label: 'Sell Phone',
    links: [
      { label: 'Sell your smartphone', path: '/sell-phone' },
      { label: 'Sell iPhone', path: '/sell-phone' },
      { label: 'Sell Android phone', path: '/sell-phone' },
      { label: 'Get instant estimate', path: '/sell-phone' },
      { label: 'Doorstep pickup', path: '/sell-phone' },
    ],
  },
  {
    id: 'sell-gadgets',
    label: 'Sell Gadgets',
    links: [
      { label: 'Sell tablet', path: '/sell-phone' },
      { label: 'Sell smartwatch', path: '/sell-phone' },
      { label: 'Sell earbuds / headphones', path: '/sell-phone' },
      { label: 'Sell laptop', path: '/sell-phone' },
      { label: 'Other gadgets', path: '/sell-phone' },
    ],
  },
  {
    id: 'pre-owned',
    label: 'Buy Refurbished Devices',
    links: [
      { label: 'Browse pre-owned hub', path: '/buy-pre-owned' },
      { label: 'Pre-owned marketplace', path: '/marketplace' },
      { label: 'Pre-owned mobiles', path: '/marketplace?categoryId=mobiles' },
      { label: 'Accessories', path: '/buy-accessories' },
      { label: 'Repair & warranty', path: '/repair-phone' },
    ],
  },
  {
    id: 'new-gadgets',
    label: 'Find New Gadget',
    links: [
      { label: 'Find new phone', path: '/find-new-phone' },
      { label: 'Latest launches', path: '/find-new-phone' },
      { label: 'New accessories', path: '/buy-accessories' },
      { label: 'Compare models', path: '/find-new-phone' },
    ],
  },
  {
    id: 'laptops',
    label: 'Buy Laptop',
    links: [
      { label: 'Shop all laptops', path: '/marketplace?categoryId=laptops' },
      { label: 'Thin & light', path: '/marketplace?categoryId=laptops' },
      { label: 'Gaming laptops', path: '/marketplace?categoryId=laptops' },
      { label: 'Business laptops', path: '/marketplace?categoryId=laptops' },
    ],
  },
  {
    id: 'store',
    label: 'Baskaro Store',
    links: [
      { label: 'Find nearby store', path: '/nearby-stores' },
      { label: 'Store locator', path: '/nearby-stores' },
      { label: 'Visit experience centre', path: '/nearby-stores' },
    ],
  },
  {
    id: 'more',
    label: 'More',
    links: [
      { label: 'About us', path: '/about' },
      { label: 'Warranty policy', path: '/warranty-policy' },
      { label: 'Refer & earn', path: '/refer-earn' },
      { label: 'Careers', path: '/careers' },
      { label: 'Press releases', path: '/press-releases' },
      { label: 'Repairs', path: '/repair-phone' },
    ],
  },
]

/** Cashify-style mobile drawer: Sell group + primary links + Baskaro Store */
const MOBILE_PRIMARY_NAV_STRUCTURE = [
  {
    kind: 'sellGroup',
    title: 'Sell',
    children: [
      { label: 'Phone', path: '/sell-phone' },
      { label: 'Laptop', path: '/sell-phone' },
      { label: 'Smartwatch', path: '/sell-phone' },
      { label: 'Tablet', path: '/sell-phone' },
      { label: 'More', path: '/sell-phone' },
    ],
  },
  { kind: 'link', label: 'Repair', path: '/repair-phone' },
  { kind: 'link', label: 'Sell Gadgets', path: '/sell-phone' },
  { kind: 'link', label: 'Buy Gadgets', path: '/marketplace' },
  { kind: 'link', label: 'Recycle', path: '/sell-phone' },
  { kind: 'link', label: 'Find New Phone', path: '/find-new-phone' },
  { kind: 'link', label: 'Baskaro Store', path: '/nearby-stores' },
]

const DESKTOP_MENU_CARD_CLASS =
  'w-[430px] max-w-[calc(100vw-3rem)] max-h-[72vh] overflow-y-auto rounded-2xl border border-slate-200 bg-[#f7f7f8] p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]'

export function LandingNavbar() {
  const navigate = useNavigate()
  const { wishlistCount } = useWishlist()
  const { cartCount } = useCart()
  const [location] = useState('Gurgaon')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoryBarOpenId, setCategoryBarOpenId] = useState(null)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const token = getToken()
  const user = getUser()
  const loggedIn = Boolean(token && user)
  const accountAriaLabel = loggedIn ? 'Account menu' : 'Log in or register'

  useEffect(() => {
    if (!mobileMenuOpen && !profileMenuOpen && categoryBarOpenId == null) return

    const isMobileModalOpen = mobileMenuOpen

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
        setCategoryBarOpenId(null)
        setMobileMenuOpen(false)
        setProfileMenuOpen(false)
      }
    }

    const onPointerDown = (e) => {
      if (!(e.target instanceof Element)) return
      if (e.target.closest('[data-category-bar="true"]')) return
      if (e.target.closest('[data-topnav-dropdown="true"]')) return
      setCategoryBarOpenId(null)
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
  }, [mobileMenuOpen, profileMenuOpen, categoryBarOpenId])

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-slate-200/80 bg-white/95 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/90">
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
          <div className="hidden max-w-xl flex-1 md:block">
            <div className="relative group">
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 pr-12 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
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

      {/* Full-width Category Bar — each label opens a dropdown panel */}
      <nav data-category-bar="true" className="relative hidden border-t border-slate-100 bg-white md:block">
        <div className="mx-3 mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:mx-4 lg:mx-6">
          <button
            type="button"
            onClick={() => {
              setCategoryBarOpenId(null)
              setMobileMenuOpen(true)
            }}
            className="shrink-0 rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-between gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORY_BAR_MENUS.map((item) => {
              const open = categoryBarOpenId === item.id
              return (
                <div key={item.id} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setCategoryBarOpenId(open ? null : item.id)}
                    className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-[15px] font-bold transition-all ${
                      open
                        ? 'bg-rose-50 text-rose-600 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.15)]'
                        : 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                    aria-expanded={open}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <ChevronDown
                      size={13}
                      strokeWidth={2.25}
                      className={`transition-transform ${open ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {categoryBarOpenId ? (
            <motion.div
              key={categoryBarOpenId}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="mx-3 border border-slate-200 border-t-0 bg-white shadow-[0_16px_30px_-18px_rgba(15,23,42,0.28)] sm:mx-4 lg:mx-6"
            >
              <div className="flex px-3 py-4 sm:px-5 lg:px-7">
                {(() => {
                  const menu = CATEGORY_BAR_MENUS.find((m) => m.id === categoryBarOpenId)
                  if (!menu) return null

                  if (menu.id === 'all') {
                    const sellGroup = MOBILE_PRIMARY_NAV_STRUCTURE.find((x) => x.kind === 'sellGroup')
                    const primaryLinks = MOBILE_PRIMARY_NAV_STRUCTURE.filter((x) => x.kind === 'link')
                    return (
                      <div className={DESKTOP_MENU_CARD_CLASS}>
                        {sellGroup ? (
                          <>
                            <p className="mb-5 text-[16px] font-black text-slate-900">{sellGroup.title}</p>
                            <div className="mb-5 flex flex-col">
                              {sellGroup.children.map((link) => (
                                <Link
                                  key={`desktop-all-sell-${link.label}`}
                                  to={link.path}
                                  onClick={() => setCategoryBarOpenId(null)}
                                  className="flex items-center justify-between rounded-md px-2 py-3 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-white hover:text-rose-600"
                                >
                                  <span>{link.label}</span>
                                  <ChevronRight size={18} className="text-slate-500" strokeWidth={2.3} />
                                </Link>
                              ))}
                            </div>
                          </>
                        ) : null}
                        <div className="flex flex-col">
                          {primaryLinks.map((entry) => (
                            <Link
                              key={`desktop-all-primary-${entry.label}`}
                              to={entry.path}
                              onClick={() => setCategoryBarOpenId(null)}
                              className="flex items-center justify-between rounded-md px-2 py-3 text-[16px] font-black text-slate-900 transition-colors hover:bg-white hover:text-rose-600"
                            >
                              <span>{entry.label}</span>
                              <ChevronRight size={19} className="text-slate-500" strokeWidth={2.4} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  if (menu.id === 'sell-phones') {
                    const topBrands = [
                      'Apple',
                      'Xiaomi',
                      'Samsung',
                      'Oneplus',
                      'Nokia',
                      'Poco',
                      'More Phone Brands',
                    ]
                    const topSellingPhones = [
                      'Apple iPhone 12',
                      'Samsung Galaxy Note 20',
                      'Apple iPhone 11',
                      'One Plus 9 Pro',
                      'Xiaomi Redmi Note 4',
                      'Apple iPhone 6',
                    ]
                    return (
                      <div className={DESKTOP_MENU_CARD_CLASS}>
                        <p className="mb-4 text-[16px] font-black text-slate-900">Top Brands</p>
                        <div className="mb-6 flex flex-col">
                          {topBrands.map((label) => (
                            <Link
                              key={`sell-phone-top-brand-${label}`}
                              to="/sell-phone"
                              onClick={() => setCategoryBarOpenId(null)}
                              className="rounded-md px-2 py-2.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-white hover:text-rose-600"
                            >
                              {label}
                            </Link>
                          ))}
                        </div>

                        <p className="mb-4 text-[16px] font-black text-slate-900">Top Selling Phones</p>
                        <div className="flex flex-col">
                          {topSellingPhones.map((label) => (
                            <Link
                              key={`sell-phone-top-model-${label}`}
                              to="/sell-phone"
                              onClick={() => setCategoryBarOpenId(null)}
                              className="rounded-md px-2 py-2.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-white hover:text-rose-600"
                            >
                              {label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  if (menu.id === 'sell-gadgets') {
                    const gadgetCategories = [
                      'Phone',
                      'Laptop',
                      'Smart Speaker',
                      'Tablet',
                      'Gaming Consoles',
                      'iMac',
                      'Smartwatch',
                      'TV',
                      'Earbuds',
                      'DSLR Camera',
                      'AC',
                    ]
                    return (
                      <div className={DESKTOP_MENU_CARD_CLASS}>
                        <div className="flex flex-col">
                          {gadgetCategories.map((label) => (
                            <Link
                              key={`sell-gadgets-cat-${label}`}
                              to="/sell-phone"
                              onClick={() => setCategoryBarOpenId(null)}
                              className="flex items-center justify-between rounded-md px-2 py-3 text-[16px] font-black text-slate-900 transition-colors hover:bg-white hover:text-rose-600"
                            >
                              <span>{label}</span>
                              <ChevronRight size={19} className="text-slate-500" strokeWidth={2.4} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  if (menu.id === 'pre-owned') {
                    const refurbishedCategories = [
                      'Refurbished Phones',
                      'Refurbished Laptops',
                      'Refurbished Smart Watches',
                      'Refurbished Tablets',
                      'Refurbished Gaming Consoles',
                      'Refurbished Cameras',
                      'Audio Devices',
                      'Amazon Devices',
                    ]
                    const topBrands = [
                      'Apple',
                      'Xiaomi',
                      'Samsung',
                      'Oneplus',
                      'Google',
                      'Oppo',
                      'Vivo',
                      'All Brands',
                    ]
                    return (
                      <div className={DESKTOP_MENU_CARD_CLASS}>
                        <div className="flex flex-col">
                          {refurbishedCategories.map((label) => (
                            <Link
                              key={`pre-owned-category-${label}`}
                              to="/buy-pre-owned"
                              onClick={() => setCategoryBarOpenId(null)}
                              className="rounded-md px-2 py-2.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-white hover:text-rose-600"
                            >
                              {label}
                            </Link>
                          ))}
                        </div>

                        <p className="mb-4 mt-3 px-2 text-[16px] font-black text-slate-900">Top Brands</p>
                        <div className="flex flex-col">
                          {topBrands.map((label) => (
                            <Link
                              key={`pre-owned-brand-${label}`}
                              to="/buy-pre-owned"
                              onClick={() => setCategoryBarOpenId(null)}
                              className="rounded-md px-2 py-2.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-white hover:text-rose-600"
                            >
                              {label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  if (menu.id === 'new-gadgets') {
                    const findNewItems = [
                      'Find New Phone',
                      'Find New Laptop',
                      'Find New Smartwatch',
                      'Find New Tablet',
                    ]
                    const exploreItems = [
                      'Videos',
                      'News',
                      'Reviews',
                      'Articles',
                      'QnA',
                      'Tips and Tricks',
                      'Tech News',
                    ]
                    return (
                      <div className={DESKTOP_MENU_CARD_CLASS}>
                        <div className="mb-3 flex flex-col">
                          {findNewItems.map((label) => (
                            <Link
                              key={`new-gadget-find-${label}`}
                              to="/find-new-phone"
                              onClick={() => setCategoryBarOpenId(null)}
                              className="flex items-center justify-between rounded-md px-2 py-3 text-[16px] font-black text-slate-900 transition-colors hover:bg-white hover:text-rose-600"
                            >
                              <span>{label}</span>
                              <ChevronRight size={19} className="text-slate-500" strokeWidth={2.4} />
                            </Link>
                          ))}
                        </div>

                        <p className="mb-3 mt-2 px-2 text-[16px] font-black text-slate-900">Explore</p>
                        <div className="flex flex-col">
                          {exploreItems.map((label) => (
                            <Link
                              key={`new-gadget-explore-${label}`}
                              to="/find-new-phone"
                              onClick={() => setCategoryBarOpenId(null)}
                              className="rounded-md px-2 py-2.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-white hover:text-rose-600"
                            >
                              {label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  if (menu.id === 'laptops') {
                    const topBrands = ['Apple', 'Dell', 'Lenovo', 'HP', 'Acer', 'Asus']
                    const bestSellingLaptops = [
                      'Apple MacBook Air Mid 2017 Refurbished',
                      'Apple MacBook Air Early 2015 Refurbished',
                      'Apple MacBook Air 2020 Refurbished',
                    ]
                    return (
                      <div className={DESKTOP_MENU_CARD_CLASS}>
                        <p className="mb-4 text-[16px] font-black text-slate-900">Top Brands</p>
                        <div className="mb-6 flex flex-col">
                          {topBrands.map((label) => (
                            <Link
                              key={`buy-laptop-brand-${label}`}
                              to="/marketplace?categoryId=laptops"
                              onClick={() => setCategoryBarOpenId(null)}
                              className="rounded-md px-2 py-2.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-white hover:text-rose-600"
                            >
                              {label}
                            </Link>
                          ))}
                        </div>

                        <p className="mb-4 text-[16px] font-black text-slate-900">Best Selling Laptops</p>
                        <div className="flex flex-col">
                          {bestSellingLaptops.map((label) => (
                            <Link
                              key={`buy-laptop-model-${label}`}
                              to="/marketplace?categoryId=laptops"
                              onClick={() => setCategoryBarOpenId(null)}
                              className="rounded-md px-2 py-2.5 text-[15px] font-semibold leading-8 text-slate-900 transition-colors hover:bg-white hover:text-rose-600"
                            >
                              {label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  if (menu.id === 'store') {
                    const storeCities = [
                      'Delhi',
                      'Gurgaon',
                      'Noida',
                      'Bengaluru',
                      'Chennai',
                      'Pune',
                      'Agra',
                      'Patna',
                      'Ghaziabad',
                      'Meerut',
                      'Mohali',
                      'Thane',
                      'More',
                    ]
                    return (
                      <div className={DESKTOP_MENU_CARD_CLASS}>
                        <p className="mb-4 text-[16px] font-black text-slate-900">More in Baskaro Stores</p>
                        <div className="flex flex-col">
                          {storeCities.map((label) => (
                            <Link
                              key={`store-city-${label}`}
                              to="/nearby-stores"
                              onClick={() => setCategoryBarOpenId(null)}
                              className="rounded-md px-2 py-2.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-white hover:text-rose-600"
                            >
                              {label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  if (menu.id === 'more') {
                    const moreTopLinks = [
                      { label: 'New Offers', path: '/marketplace' },
                      { label: 'Partner with Us', path: '/about' },
                      { label: 'Contact Us', path: '/about' },
                      { label: 'Warranty Policy', path: '/warranty-policy' },
                      { label: 'Refer & Earn', path: '/refer-earn' },
                    ]
                    const companyLinks = [
                      { label: 'About Us', path: '/about' },
                      { label: 'Careers', path: '/careers' },
                      { label: 'Articles', path: '/press-releases' },
                      { label: 'Become Supersale Partner', path: '/about' },
                      { label: 'Press Releases', path: '/press-releases' },
                      { label: 'Terms & Conditions', path: '/warranty-policy' },
                    ]
                    return (
                      <div className={DESKTOP_MENU_CARD_CLASS}>
                        <div className="mb-4 flex flex-col">
                          {moreTopLinks.map((item) => (
                            <Link
                              key={`more-top-${item.label}`}
                              to={item.path}
                              onClick={() => setCategoryBarOpenId(null)}
                              className="rounded-md px-2 py-2.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-white hover:text-rose-600"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>

                        <p className="mb-3 mt-2 px-2 text-[16px] font-black text-slate-900">Company</p>
                        <div className="flex flex-col">
                          {companyLinks.map((item) => (
                            <Link
                              key={`more-company-${item.label}`}
                              to={item.path}
                              onClick={() => setCategoryBarOpenId(null)}
                              className="rounded-md px-2 py-2.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-white hover:text-rose-600"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div className="grid grid-cols-2 gap-x-10 gap-y-1 sm:grid-cols-3 md:grid-cols-4">
                      {menu.links.map((link) => (
                        <Link
                          key={`${menu.id}-${link.path}-${link.label}`}
                          to={link.path}
                          onClick={() => setCategoryBarOpenId(null)}
                          className="rounded-lg px-2 py-2.5 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </motion.div>
          ) : null}
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
              <nav className="flex flex-col gap-1">
                {MOBILE_PRIMARY_NAV_STRUCTURE.map((entry, idx) => {
                  if (entry.kind === 'sellGroup') {
                    return (
                      <div key={`sell-${idx}`} className="pb-2 pt-1">
                        <p className="px-4 pb-3 text-[13px] font-black tracking-wide text-slate-900">{entry.title}</p>
                        <div className="flex flex-col">
                          {entry.children.map((link) => (
                            <Link
                              key={link.label}
                              to={link.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center justify-between rounded-xl py-3 pl-8 pr-4 text-[13px] font-bold text-slate-900 hover:bg-rose-50 hover:text-rose-600 transition-all"
                            >
                              <span>{link.label}</span>
                              <ChevronRight size={16} className="shrink-0 text-slate-400" strokeWidth={2} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return (
                    <Link
                      key={entry.label}
                      to={entry.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[13px] font-black text-slate-900 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
                    >
                      <span>{entry.label}</span>
                      <ChevronRight size={16} className="shrink-0 text-slate-400" strokeWidth={2} />
                    </Link>
                  )
                })}
              </nav>

              <div className="my-8 h-px bg-slate-100" aria-hidden />

              <p className="mb-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Shopping</p>
              <nav className="flex flex-col gap-1">
                {[
                  { label: 'Home', path: '/' },
                  {
                    label: `Wishlist${wishlistCount ? ` (${wishlistCount})` : ''}`,
                    path: '/wishlist',
                  },
                  { label: `Cart${cartCount ? ` (${cartCount})` : ''}`, path: '/cart' },
                  { label: 'Buy Pre-Owned', path: '/buy-pre-owned' },
                ].map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    <span>{link.label}</span>
                    <ChevronRight size={16} className="shrink-0 text-slate-300" strokeWidth={2} />
                  </Link>
                ))}
              </nav>

              <p className="mb-3 mt-8 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Company</p>
              <nav className="flex flex-col gap-1">
                {[
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
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    <span>{link.label}</span>
                    <ChevronRight size={16} className="shrink-0 text-slate-300" strokeWidth={2} />
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
