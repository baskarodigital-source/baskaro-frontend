import React, { useState, useEffect, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Smartphone, DollarSign, ShoppingCart,
  Truck, CreditCard, Package, Tag, ImageIcon, BarChart3,
  ShieldAlert, LogOut, Menu, X, ChevronRight, Bell, Search,
} from 'lucide-react'
import { getToken, isAdminUser, logout } from '../lib/auth.js'

import { PageSpinner } from '../components/PageSpinner.jsx'
import UsersManagementView from './Admin/UsersManagementView.jsx'
import AllCategoriesView from './Admin/AllCategoriesView.jsx'
import ConditionPricingView from './Admin/ConditionPricingView.jsx'
import OrdersManagementView from './Admin/OrdersManagementView.jsx'
import PickupsManagementView from './Admin/PickupsManagementView.jsx'
import PaymentsManagementView from './Admin/PaymentsManagementView.jsx'
import InventoryManagementView from './Admin/InventoryManagementView.jsx'
import OffersManagementView from './Admin/OffersManagementView.jsx'
import ServicesManagementView from './Admin/ServicesManagementView.jsx'
import CmsManagementView from './Admin/CmsManagementView.jsx'
import RolesManagementView from './Admin/RolesManagementView.jsx'

const DashboardView = lazy(() => import('./Admin/DashboardView.jsx'))
const AnalyticsManagementView = lazy(() => import('./Admin/AnalyticsManagementView.jsx'))

const navSections = [
  {
    title: null,
    items: [
      { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'Users', icon: Users, label: 'User Management' },
      { id: 'Catalog', icon: Smartphone, label: 'All Categories' },
      { id: 'Pricing', icon: DollarSign, label: 'Condition Pricing' },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { id: 'Orders', icon: ShoppingCart, label: 'Order Management' },
      { id: 'Pickups', icon: Truck, label: 'Pickup Management' },
      { id: 'Payments', icon: CreditCard, label: 'Payment Management' },
      { id: 'Inventory', icon: Package, label: 'Inventory' },
    ],
  },
  {
    title: 'MARKETING & TOOLS',
    items: [
      { id: 'Offers', icon: Tag, label: 'Offers' },
      { id: 'Services', icon: ChevronRight, label: 'Services' },
      { id: 'CMS', icon: ImageIcon, label: 'Banner & CMS' },
      { id: 'Analytics', icon: BarChart3, label: 'Reports & Analytics' },
      { id: 'Roles', icon: ShieldAlert, label: 'Roles & Permissions' },
    ],
  },
]

function SidebarNav({ tab, collapsed, onSelect, onLogout }) {
  return (
    <>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2 no-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && !collapsed && (
              <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {section.title}
              </div>
            )}
            {section.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                title={collapsed ? item.label : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  tab === item.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={collapsed ? 22 : 18} strokeWidth={2} className="shrink-0" />
                {!collapsed && <span className="text-left text-[13px] font-semibold">{item.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="shrink-0 border-t border-slate-100 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} strokeWidth={2} className="shrink-0" />
          {!collapsed && <span className="text-[13px] font-semibold">Logout</span>}
        </button>
      </div>
    </>
  )
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('Catalog')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken()
      if (!token || !isAdminUser()) {
        navigate('/login')
        return
      }
      setAuthLoading(false)
    }
    checkAuth()
  }, [navigate])

  useEffect(() => {
    if (!mobileSidebarOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileSidebarOpen])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const selectTab = (id) => {
    setTab(id)
    setMobileSidebarOpen(false)
    setMobileSearchOpen(false)
  }

  const heavyPanel = (node) => <Suspense fallback={<PageSpinner />}>{node}</Suspense>

  const renderContent = () => {
    switch (tab) {
      case 'Dashboard':
        return heavyPanel(<DashboardView />)
      case 'Users':
        return <UsersManagementView />
      case 'Catalog':
        return <AllCategoriesView />
      case 'Pricing':
        return <ConditionPricingView />
      case 'Orders':
        return <OrdersManagementView />
      case 'Pickups':
        return <PickupsManagementView />
      case 'Payments':
        return <PaymentsManagementView />
      case 'Inventory':
        return <InventoryManagementView />
      case 'Offers':
        return <OffersManagementView />
      case 'Services':
        return <ServicesManagementView />
      case 'CMS':
        return <CmsManagementView />
      case 'Analytics':
        return heavyPanel(<AnalyticsManagementView />)
      case 'Roles':
        return <RolesManagementView />
      default:
        return heavyPanel(<DashboardView />)
    }
  }

  const pageTitle = navSections.flatMap((s) => s.items).find((i) => i.id === tab)?.label || tab

  return (
    <div className="flex min-h-screen min-h-dvh bg-[#f8fafc] font-sans">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[45] bg-slate-900/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 left-0 z-[50] flex w-[min(100vw-3rem,18rem)] max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black tracking-tighter text-slate-800">BAS</span>
                  <span className="text-lg font-black tracking-tighter text-red-600">karo</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Close navigation"
                >
                  <X size={20} />
                </button>
              </div>
              <SidebarNav tab={tab} collapsed={false} onSelect={selectTab} onLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 hidden h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:flex ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between p-4 sm:p-6">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-1">
              <span className="text-xl font-black tracking-tighter text-slate-800">BAS</span>
              <span className="text-xl font-black tracking-tighter text-red-600">karo</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <X size={20} className="rotate-45" />}
          </button>
        </div>
        <SidebarNav tab={tab} collapsed={sidebarCollapsed} onSelect={selectTab} onLogout={handleLogout} />
      </aside>

      {/* Main */}
      <main
        className={`flex min-h-screen min-h-dvh min-w-0 flex-1 flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="shrink-0 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <h1 className="truncate text-base font-bold text-slate-800 sm:text-xl">{pageTitle}</h1>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setMobileSearchOpen((v) => !v)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
                aria-label="Toggle search"
              >
                <Search size={18} />
              </button>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="search"
                  placeholder="Search…"
                  className="w-48 rounded-full bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-blue-500/20 lg:w-72 xl:w-80"
                />
              </div>
              <button
                type="button"
                className="relative hidden shrink-0 text-slate-400 transition-colors hover:text-blue-600 sm:block"
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
              </button>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-black text-slate-600 shadow-sm sm:h-10 sm:w-10 sm:text-xs">
                AD
              </div>
            </div>
          </div>

          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-slate-100 px-4 pb-3 md:hidden"
              >
                <div className="relative pt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="search"
                    placeholder="Search orders, users, models…"
                    className="w-full rounded-xl bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-blue-500/20"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <div
          className="mx-auto w-full min-w-0 max-w-[1400px] flex-1 p-4 sm:p-6 lg:p-8 xl:p-10
            [&_.overflow-x-auto]:-mx-1 [&_.overflow-x-auto]:px-1 sm:[&_.overflow-x-auto]:mx-0 sm:[&_.overflow-x-auto]:px-0
            [&_table]:min-w-[560px] [&_th]:px-3 [&_th]:sm:px-6 [&_td]:px-3 [&_td]:sm:px-6
            [&_h2]:text-xl [&_h2]:sm:text-2xl"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="min-w-0"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
