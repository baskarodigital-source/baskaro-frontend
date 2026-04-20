import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Users, Smartphone, DollarSign, ShoppingCart, 
  Truck, CreditCard, Package, Tag, ImageIcon, BarChart3, 
  ShieldAlert, LogOut, Menu, X, ChevronRight, Bell, Search, 
  User
} from 'lucide-react'
import { getToken, isAdminUser, logout } from '../lib/auth.js'

// Import Refactored Components
import DashboardView from './Admin/DashboardView.jsx'
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
import AnalyticsManagementView from './Admin/AnalyticsManagementView.jsx'
import RolesManagementView from './Admin/RolesManagementView.jsx'

const navSections = [
  {
    title: null,
    items: [
      { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'Users', icon: Users, label: 'User Management' },
      { id: 'Catalog', icon: Smartphone, label: 'All Categories' },
      { id: 'Pricing', icon: DollarSign, label: 'Condition Pricing' },
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { id: 'Orders', icon: ShoppingCart, label: 'Order Management' },
      { id: 'Pickups', icon: Truck, label: 'Pickup Management' },
      { id: 'Payments', icon: CreditCard, label: 'Payment Management' },
      { id: 'Inventory', icon: Package, label: 'Inventory' },
    ]
  },
  {
    title: 'MARKETING & TOOLS',
    items: [
      { id: 'Offers', icon: Tag, label: 'Offers' },
      { id: 'Services', icon: ChevronRight, label: 'Services' },
      { id: 'CMS', icon: ImageIcon, label: 'Banner & CMS' },
      { id: 'Analytics', icon: BarChart3, label: 'Reports & Analytics' },
      { id: 'Roles', icon: ShieldAlert, label: 'Roles & Permissions' },
    ]
  }
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('Catalog') // Default to Catalog to show off the new UI
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [adminData, setAdminData] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken()
      if (!token || !isAdminUser()) {
        navigate('/login')
        return
      }
      setAdminData({ name: 'Admin', email: 'admin@gmail.com', role: 'admin' })
      setAuthLoading(false)
    }
    checkAuth()
  }, [navigate])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const renderContent = () => {
    switch(tab) {
      case 'Dashboard': return <DashboardView />
      case 'Users': return <UsersManagementView />
      case 'Catalog': return <AllCategoriesView />
      case 'Pricing': return <ConditionPricingView />
      case 'Orders': return <OrdersManagementView />
      case 'Pickups': return <PickupsManagementView />
      case 'Payments': return <PaymentsManagementView />
      case 'Inventory': return <InventoryManagementView />
      case 'Offers': return <OffersManagementView />
      case 'Services': return <ServicesManagementView />
      case 'CMS': return <CmsManagementView />
      case 'Analytics': return <AnalyticsManagementView />
      case 'Roles': return <RolesManagementView />
      default: return <DashboardView />
    }
  }

  const PageTitle = navSections.flatMap(s => s.items).find(i => i.id === tab)?.label || tab

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      
      {/* Desktop Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 z-[40] transition-all duration-300 hidden lg:flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-6 flex items-center justify-between">
           {!sidebarCollapsed && (
             <div className="flex items-center gap-2">
                <div className="flex flex-col leading-none">
                   <div className="flex items-center gap-1">
                      <span className="text-xl font-black text-slate-800 tracking-tighter">BAS</span>
                      <span className="text-xl font-black text-red-600 tracking-tighter">karo</span>
                   </div>
                </div>
             </div>
           )}
           <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-slate-400 hover:text-slate-900 transition-colors">
              {sidebarCollapsed ? <ChevronRight size={20} /> : <X size={20} className="rotate-45" />}
           </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto no-scrollbar">
           {navSections.map((section, idx) => (
             <div key={idx} className="space-y-1">
                {section.title && !sidebarCollapsed && (
                  <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{section.title}</div>
                )}
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${tab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <item.icon size={sidebarCollapsed ? 24 : 18} strokeWidth={2} />
                    {!sidebarCollapsed && <span className="text-[13px] font-semibold">{item.label}</span>}
                  </button>
                ))}
             </div>
           ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
               <LogOut size={18} strokeWidth={2} />
               {!sidebarCollapsed && <span className="text-[13px] font-semibold">Logout</span>}
            </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 sm:px-10 border-b border-slate-200 bg-white/50 backdrop-blur-md sticky top-0 z-[30]">
           <div className="flex items-center gap-4">
              <button disabled className="lg:hidden text-slate-600"><Menu size={20}/></button>
              <h1 className="text-xl font-bold text-slate-800">{PageTitle}</h1>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative hidden md:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input type="text" placeholder="Search orders, users, models..." className="bg-slate-50 border-none rounded-full pl-10 pr-4 py-2 text-sm w-80 outline-none ring-1 ring-slate-200 focus:ring-blue-500/20 focus:bg-white transition-all" />
              </div>
              
              <div className="flex items-center gap-4">
                 <button className="text-slate-400 hover:text-blue-600 relative transition-colors">
                    <Bell size={20}/>
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                 </button>
                 <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-600 shadow-sm">
                    AD
                 </div>
              </div>
           </div>
        </header>

        <div className="p-8 lg:p-10 max-w-[1400px] mx-auto">
           <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
