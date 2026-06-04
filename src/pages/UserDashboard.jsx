import React, { useState, useMemo, useEffect } from 'react'
import { appAlert, appConfirm } from '../lib/appDialog.js'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Smartphone, User, MapPin, Package, LogOut, ChevronRight, ChevronDown,
  CheckCircle, Calendar, Clock, Plus, Trash2, Home,
  ArrowLeft, ArrowRight, RefreshCw, Phone, CreditCard,
  Truck, ShieldCheck, BadgeCheck, AlertCircle, Copy, X
} from 'lucide-react'
import * as api from '../lib/api/baskaroApi.js'
import {
  getUser,
  logout as performLogout,
  updateSessionUser,
} from '../lib/auth.js'
import {
  apiOrderStatusToLabel,
  mapConditionGrade,
  pickupSlotToApi,
} from '../lib/orderHelpers.js'

// ─── Constants ────────────────────────────────────────────────────────────────
const SCREEN_OPTIONS  = ['Excellent', 'Good', 'Fair', 'Bad / Cracked']
const BODY_OPTIONS    = ['Excellent', 'Good', 'Fair', 'Bad / Scratched']
const BATTERY_OPTIONS = ['90% - 100%', '80% - 89%', '60% - 79%', 'Below 60%']
const ACC_OPTIONS     = ['Original box + all accessories', 'Original charger only', 'No charger / no box', 'No accessories']

const ORDER_STATUSES = [
  { key: 'Request Submitted', Icon: AlertCircle,  color: 'text-slate-500',  bg: 'bg-slate-100',   fill: 'bg-slate-500'   },
  { key: 'Pickup Scheduled',  Icon: Truck,        color: 'text-rose-600',   bg: 'bg-rose-100',    fill: 'bg-rose-600'    },
  { key: 'Device Received',   Icon: ShieldCheck,  color: 'text-orange-600', bg: 'bg-orange-100',  fill: 'bg-orange-500'  },
  { key: 'Payment Completed', Icon: BadgeCheck,   color: 'text-green-600',  bg: 'bg-green-100',   fill: 'bg-green-500'   },
]

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
}
function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return '' }
}

// ─── Reusable form primitives ─────────────────────────────────────────────────
function Label({ children }) {
  return <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-slate-400">{children}</label>
}
function DSelect({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}
function DInput({ value, onChange, placeholder, type = 'text', ...rest }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
      {...rest}
    />
  )
}

// ─── Protected shell ──────────────────────────────────────────────────────────
export default function UserDashboard() {
  const navigate = useNavigate()
  const user = getUser()
  useEffect(() => { if (!user) navigate('/login', { replace: true }) }, [])
  if (!user) return null
  return <DashboardShell user={user} navigate={navigate} />
}

// ─── Shell ────────────────────────────────────────────────────────────────────
function DashboardShell({ user, navigate }) {
  const [tab, setTab] = useState('overview')

  function logout() { performLogout(); navigate('/') }

  const tabs = [
    { id: 'overview', Icon: Home,       label: 'Overview'   },
    { id: 'sell',    Icon: Smartphone, label: 'Sell Phone' },
    { id: 'orders',  Icon: Package,    label: 'My Orders'  },
    { id: 'profile', Icon: User,       label: 'Profile'    },
    { id: 'address', Icon: MapPin,     label: 'Addresses'  },
  ]

  return (
    <div className="flex h-full min-h-0 flex-1 items-stretch bg-slate-50 font-['Outfit']">
      {/* Sidebar: full height of dashboard row; main scrolls independently */}
      <aside className="hidden min-h-0 w-64 shrink-0 border-r border-slate-200 bg-white shadow-sm md:flex md:h-full md:flex-col md:overflow-hidden">
        <div className="flex h-16 shrink-0 items-center border-b border-slate-100 px-6">
          <Link to="/">
            <img src="/logo.png" alt="BAS karo" className="h-11 w-auto max-w-[180px] object-contain object-left"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
            <span style={{display:'none'}} className="text-xl font-black text-slate-900">BAS<span className="text-red-600">karo</span></span>
          </Link>
        </div>
        <div className="mx-4 mt-5 shrink-0 rounded-2xl bg-rose-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-600 text-sm font-black text-white">
              {(user.name || user.phone || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-slate-900">{user.name || 'User'}</div>
              <div className="truncate text-[11px] font-semibold text-slate-500">{user.phone || user.email || ''}</div>
            </div>
          </div>
        </div>
        <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto px-3 scrollbar-hide">
          {tabs.map(({ id, Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={['flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all',
                tab === id ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'text-slate-600 hover:bg-slate-100'].join(' ')}
            >
              <Icon size={17} />{label}
              {tab === id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </nav>
        <div className="shrink-0 border-t border-slate-100 p-4">
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {tab === 'overview' && <OverviewTab user={user} setTab={setTab} />}
              {tab === 'sell'    && <SellTab onViewOrders={() => setTab('orders')} />}
              {tab === 'orders'  && <OrdersTab />}
              {tab === 'profile' && <ProfileTab user={user} />}
              {tab === 'address' && <AddressTab />}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="flex border-t border-slate-200 bg-white md:hidden">
          {tabs.map(({ id, Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={['flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition-colors',
                tab === id ? 'text-red-600' : 'text-slate-400'].join(' ')}
            >
              <Icon size={20} />{label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab({ user, setTab }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([])
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.getOrderManagementList({ page: 1, limit: 30 })
        if (!cancelled) setOrders(res.items || [])
      } catch {
        if (!cancelled) setOrders([])
      }
    })()
    return () => { cancelled = true }
  }, [])
  const activeOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')

  const totalEarned = orders
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + (o.finalPrice || 0), 0)
    
  return (
    <div className="max-w-5xl space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-rose-950 to-red-900 p-8 sm:p-10 shadow-xl shadow-rose-900/20 text-white">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-rose-200 font-medium text-sm sm:text-base max-w-md">
              Your hyper-premium portal for managing device valuations, tracking pickups, and exploring exclusive pre-owned deals.
            </p>
          </div>
          {totalEarned > 0 && (
            <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
              <p className="text-xs font-black uppercase tracking-widest text-rose-200 mb-1">Total Earned</p>
              <p className="text-3xl font-black text-white">₹{fmt(totalEarned)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-black text-slate-900 mb-4 px-1">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => setTab('sell')} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-rose-400 hover:shadow-lg hover:-translate-y-1 text-left">
            <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Smartphone size={100} className="translate-x-4 -translate-y-4" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-4 group-hover:scale-110 transition-transform">
              <Smartphone size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Sell a Device</h3>
            <p className="text-xs font-semibold text-slate-500">Get an instant, AI-driven valuation for your old phone.</p>
          </button>
          
          <button onClick={() => navigate('/buy-pre-owned')} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-800 hover:shadow-lg hover:-translate-y-1 text-left">
            <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <BadgeCheck size={100} className="translate-x-4 -translate-y-4" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mb-4 group-hover:scale-110 transition-transform">
              <BadgeCheck size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Buy Pre-Owned</h3>
            <p className="text-xs font-semibold text-slate-500">Explore our certified, high-fidelity marketplace.</p>
          </button>
          
          <button onClick={() => setTab('orders')} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-orange-400 hover:shadow-lg hover:-translate-y-1 text-left">
            <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Package size={100} className="translate-x-4 -translate-y-4" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 mb-4 group-hover:scale-110 transition-transform">
              <Package size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Track Orders</h3>
            <p className="text-xs font-semibold text-slate-500">Monitor pickup schedules and payment statuses.</p>
          </button>
        </div>
      </div>

      {/* Active Sell Request Preview */}
      {activeOrders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-black text-slate-900 mb-4 px-1">Active Sell Requests</h2>
          <div className="space-y-4">
            {activeOrders.slice(0, 3).map(o => {
              const label = apiOrderStatusToLabel(o.status)
              const statusCfg = ORDER_STATUSES.find(s => s.key === label) || ORDER_STATUSES[0]
              const oid = o._id || o.id
              return (
                <button key={oid} onClick={() => setTab('orders')} className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition hover:shadow-md hover:border-rose-300 group">
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 font-black text-slate-700 text-2xl group-hover:bg-rose-50 transition-colors">
                      {o.brand?.[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg group-hover:text-rose-600 transition-colors">{o.brand} {o.modelName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ID: {String(oid).slice(-8)}</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-black ${statusCfg.bg} ${statusCfg.color}`}>
                          <span className={`h-1 w-1 rounded-full ${statusCfg.fill}`} />
                          {label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-xl font-black text-slate-900">₹{fmt(o.finalPrice || 0)}</p>
                      {o.pickupDate && <p className="text-xs font-bold text-slate-500 mt-1 flex items-center justify-end gap-1"><Calendar size={12}/> {o.pickupDate}</p>}
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-rose-600 transition-colors" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SELL PHONE TAB
// ─────────────────────────────────────────────────────────────────────────────
function SellTab({ onViewOrders }) {
  const [step, setStep] = useState(1)
  const [brandsList, setBrandsList] = useState([])
  const [modelsList, setModelsList] = useState([])
  const [brandId, setBrandId] = useState('')
  const [brand, setBrand] = useState('')
  const [modelQuery, setModelQuery] = useState('')
  const [modelId, setModelId] = useState('')
  const [model, setModel] = useState('')
  const [modelDoc, setModelDoc] = useState(null)
  const [ram, setRam] = useState('')
  const [storage, setStorage] = useState('')
  const [screen, setScreen] = useState('Good')
  const [body, setBody] = useState('Good')
  const [battery, setBattery] = useState('80% - 89%')
  const [accessories, setAccessories] = useState('Original charger only')
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [selectedAddr, setSelectedAddr] = useState(null)
  const [payMethod, setPayMethod] = useState('UPI')
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const [estimate, setEstimate] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let c = false
    ;(async () => {
      try {
        const res = await api.getMobileBrands({ page: 1, limit: 200, active: true })
        if (!c) setBrandsList(res.items || [])
      } catch {
        if (!c) setBrandsList([])
      }
    })()
    return () => { c = true }
  }, [])

  useEffect(() => {
    if (step !== 6) return
    let c = false
    ;(async () => {
      try {
        const list = await api.getAddresses()
        if (!c && Array.isArray(list)) setAddresses(list)
      } catch {
        if (!c) setAddresses([])
      }
    })()
    return () => { c = true }
  }, [step])

  useEffect(() => {
    if (!brand || !model || !ram || !storage) {
      setEstimate(null)
      return
    }
    let c = false
    ;(async () => {
      try {
        const res = await api.postPricingEstimate({
          brand,
          model,
          ram,
          storage,
          screenCondition: screen,
          bodyCondition: body,
          batteryHealth: battery,
          accessories,
        })
        if (!c) setEstimate(res?.finalPrice ? res : null)
      } catch {
        if (!c) setEstimate(null)
      }
    })()
    return () => { c = true }
  }, [brand, model, ram, storage, screen, body, battery, accessories])

  const models = useMemo(() => {
    const all = modelsList.map((m) => m.modelName)
    const uniq = [...new Set(all)]
    return modelQuery.trim()
      ? uniq.filter((m) => m.toLowerCase().includes(modelQuery.toLowerCase()))
      : uniq
  }, [modelsList, modelQuery])

  const variants = useMemo(() => modelDoc?.storageVariants ?? [], [modelDoc])
  const ramOptions = useMemo(() => [...new Set(variants.map((v) => v.ram))], [variants])
  const storageOptions = useMemo(
    () => [...new Set(variants.filter((v) => v.ram === ram).map((v) => v.label))],
    [variants, ram],
  )

  const timeSlots = ['9:00 AM – 12:00 PM', '12:00 PM – 3:00 PM', '3:00 PM – 6:00 PM']
  const stepLabels = ['', 'Select Brand', 'Select Model', 'Select Variant', 'Rate Condition', 'Price Estimate', 'Schedule Pickup', 'Confirmed']

  async function selectBrand(b) {
    setBrandId(b._id)
    setBrand(b.name)
    setModel('')
    setModelId('')
    setModelDoc(null)
    setModelQuery('')
    setRam('')
    setStorage('')
    try {
      const res = await api.getMobileModels({ brandId: b._id, page: 1, limit: 500, active: true })
      setModelsList(res.items || [])
    } catch {
      setModelsList([])
    }
    setStep(2)
  }

  async function selectModel(modelName) {
    const row = modelsList.find((x) => x.modelName === modelName)
    if (!row) return
    setModelId(row._id)
    setModel(row.modelName)
    try {
      const detail = await api.getMobileModel(row._id)
      setModelDoc(detail)
      const first = detail.storageVariants?.[0]
      setRam(first?.ram || '')
      setStorage(first?.label || '')
    } catch {
      setModelDoc(null)
    }
    setStep(3)
  }

  function reset() {
    setBrandId('')
    setBrand('')
    setModelId('')
    setModel('')
    setModelDoc(null)
    setModelsList([])
    setRam('')
    setStorage('')
    setModelQuery('')
    setScreen('Good')
    setBody('Good')
    setBattery('80% - 89%')
    setAccessories('Original charger only')
    setPickupDate('')
    setPickupTime('')
    setSelectedAddr(null)
    setConfirmedOrder(null)
    setStep(1)
  }

  async function submitOrder() {
    if (!brandId || !modelId || !selectedAddr || estimate == null || estimate.finalPrice == null) return
    setSubmitting(true)
    try {
      const created = await api.postOrderManagement({
        brandId,
        modelId,
        brand,
        modelName: model,
        storage,
        ram,
        condition: mapConditionGrade(screen, body),
        screenCondition: screen,
        bodyCondition: body,
        batteryHealth: battery,
        accessories,
        basePrice: estimate?.breakdown?.basePrice ?? estimate?.finalPrice ?? 0,
        calculatedPrice: estimate?.finalPrice ?? 0,
        finalPrice: estimate?.finalPrice ?? 0,
        deductions: { screen: 0, battery: 0, camera: 0, faceId: 0 },
        pickupDate,
        pickupTime: pickupSlotToApi(pickupTime),
        address: {
          label: selectedAddr.label || 'Home',
          line1: selectedAddr.line1,
          city: selectedAddr.city,
          state: selectedAddr.state || '',
          pincode: selectedAddr.pincode,
        },
        payMethod: payMethod === 'Bank Transfer' ? 'BANK' : 'UPI',
      })
      const st = apiOrderStatusToLabel(created.status)
      const order = {
        id: created._id,
        brand,
        model,
        ram,
        storage,
        estimate: created.finalPrice,
        screen,
        body,
        battery,
        accessories,
        pickupDate,
        pickupTime,
        address: selectedAddr,
        payMethod,
        status: st,
        statusHistory: (created.statusHistory || []).map((h) => ({
          status: apiOrderStatusToLabel(h.status),
          at: typeof h.at === 'string' ? h.at : new Date(h.at).toISOString(),
        })),
        createdAt: created.createdAt || new Date().toISOString(),
        paymentDetails: null,
      }
      setConfirmedOrder(order)
      setStep(7)
    } catch (e) {
      appAlert(e.message || 'Could not create order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        {step > 1 && step < 7 && (
          <button onClick={() => setStep(s => Math.max(1, s - 1))}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 text-slate-500 hover:border-rose-400 hover:text-rose-600 transition-all"
          ><ArrowLeft size={16} /></button>
        )}
        <div>
          <h1 className="text-2xl font-black text-slate-900">Sell your Phone</h1>
          <p className="text-sm font-semibold text-slate-400">Step {Math.min(step, 6)} of 6 — {stepLabels[step]}</p>
        </div>
      </div>

      {step < 7 && (
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-500"
            style={{ width: `${Math.round(((step - 1) / 6) * 100)}%` }} />
        </div>
      )}

      {/* Step 1: Brand */}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {brandsList.map((b) => (
            <button key={b._id} type="button" onClick={() => selectBrand(b)}
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-100 bg-white p-4 transition-all hover:-translate-y-1 hover:border-red-300 hover:shadow-lg hover:shadow-red-100"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 text-2xl font-black text-slate-700 group-hover:bg-red-50 group-hover:text-red-600 transition-all">{String(b.name || '?')[0]}</div>
              <span className="text-sm font-black text-slate-800 group-hover:text-red-700">{b.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Model */}
      {step === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4"><Label>Search model</Label><DInput value={modelQuery} onChange={setModelQuery} placeholder={`Search ${brand} models…`} autoFocus /></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {models.map(m => (
              <button key={m} onClick={() => selectModel(m)}
                className="rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-center text-sm font-bold text-slate-800 transition-all hover:border-red-400 hover:bg-red-50 hover:text-red-700"
              >{m}</button>
            ))}
            {models.length === 0 && <p className="col-span-3 py-8 text-center text-sm text-slate-400">No models found</p>}
          </div>
        </div>
      )}

      {/* Step 3: Variant */}
      {step === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold text-slate-500">{brand} {model}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>RAM</Label><DSelect value={ram} onChange={v => { setRam(v); setStorage(variants.find(x => x.ram === v)?.label || '') }} options={ramOptions} placeholder="Select RAM" /></div>
            <div><Label>Storage</Label><DSelect value={storage} onChange={setStorage} options={storageOptions} placeholder="Select Storage" /></div>
          </div>
          <button disabled={!ram || !storage} onClick={() => setStep(4)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-black text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >Continue <ArrowRight size={15} /></button>
        </div>
      )}

      {/* Step 4: Condition */}
      {step === 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-5 text-sm font-bold text-slate-500">{brand} {model} · {ram} / {storage}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Screen Condition</Label><DSelect value={screen} onChange={setScreen} options={SCREEN_OPTIONS} /></div>
            <div><Label>Body Condition</Label><DSelect value={body} onChange={setBody} options={BODY_OPTIONS} /></div>
            <div><Label>Battery Health</Label><DSelect value={battery} onChange={setBattery} options={BATTERY_OPTIONS} /></div>
            <div><Label>Accessories</Label><DSelect value={accessories} onChange={setAccessories} options={ACC_OPTIONS} /></div>
          </div>
          <div className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            💡 Be honest — our agent verifies condition at pickup. Better condition = higher payout.
          </div>
          <button onClick={() => setStep(5)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-black text-white shadow-md shadow-rose-200 hover:bg-rose-700 transition-all">
            Get Price Estimate <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Step 5: Estimate */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-900 to-rose-600 p-8 sm:p-10 text-white shadow-2xl shadow-rose-900/40 border border-rose-500/30">
            <motion.div initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} transition={{ delay: 0.3, duration: 1 }} className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />
            <motion.div initial={{ opacity: 0, rotate: 45 }} animate={{ opacity: 1, rotate: 0 }} transition={{ delay: 0.4, duration: 1 }} className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-200 border border-rose-500/30 mb-4 shadow-inner shadow-rose-500/20">
                  <BadgeCheck size={12} className="text-rose-300" /> Awesome Value Unlocked!
                </span>
                <p className="text-sm font-semibold text-rose-200">Estimated Offer Price</p>
              </motion.div>
              
              <motion.div initial={{ scale: 0.5, opacity: 0, filter: "blur(10px)" }} animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }} transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }} className="mt-3 text-6xl sm:text-7xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(225,29,72,0.5)]">
                 ₹<AnimatedCounter value={estimate ? estimate.finalPrice : 0} />
              </motion.div>
              
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="w-full">
                <p className="mt-4 text-[11px] font-semibold text-rose-200/80 uppercase tracking-widest">
                  Base: ₹{estimate ? fmt(estimate.breakdown?.basePrice ?? 0) : 0} <span className="mx-2 opacity-30">|</span> -{estimate ? Math.round((estimate.breakdown?.totalDeductionPct ?? 0) * 100) : 0}% deduction
                </p>
              </motion.div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-black text-slate-900">Condition Breakdown</h3>
            <div className="space-y-2 text-sm">
              {[['Screen', screen], ['Body', body], ['Battery', battery], ['Accessories', accessories]].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                  <span className="font-semibold text-slate-500">{l}</span>
                  <span className="font-bold text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setStep(4)} className="rounded-xl border-2 border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Change Condition</button>
            <button onClick={() => setStep(6)} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-black text-white shadow-md shadow-red-200 hover:bg-red-700 transition-all">
              Schedule Pickup <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 6: Pickup & Payment */}
      {step === 6 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
            <span className="text-sm font-semibold text-green-700">{brand} {model} · {ram}/{storage}</span>
            <span className="text-lg font-black text-green-700">₹{estimate ? fmt(estimate.finalPrice) : 0}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
            <div>
              <Label>Pickup Date</Label>
              <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition"
              />
            </div>
            <div>
              <Label>Pickup Time Slot</Label>
              <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {timeSlots.map(t => (
                  <button key={t} onClick={() => setPickupTime(t)}
                    className={['flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-xs font-bold transition-all',
                      pickupTime === t ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50'].join(' ')}
                  ><Clock size={13} /> {t}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Pickup Address</Label>
              {addresses.length === 0 ? (
                // Inline quick-add when no address is saved
                <InlineAddressForm onSaved={a => { setSelectedAddr(a); setAddresses((prev) => [...prev, a]) }} />
              ) : (
                <div className="mt-1 space-y-2">
                  {addresses.map((a, i) => (
                    <button key={a._id || i} type="button" onClick={() => setSelectedAddr(a)}
                      className={['w-full rounded-xl border-2 px-4 py-3 text-left text-sm transition-all',
                        (selectedAddr?._id && a._id ? selectedAddr._id === a._id : selectedAddr === a) ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-rose-300'].join(' ')}
                    >
                      <div className="font-black text-slate-900">{a.label}</div>
                      <div className="mt-0.5 font-semibold text-slate-500">{a.line1}, {a.city} – {a.pincode}</div>
                    </button>
                  ))}
                  {/* Allow adding another address inline too */}
                  {!selectedAddr && addresses.length > 0 && (
                    <p className="text-xs font-semibold text-slate-400 px-1">👆 Select an address above to continue.</p>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label>Payment Method (after verification)</Label>
              <div className="mt-1 grid grid-cols-2 gap-3">
                {['UPI', 'Bank Transfer'].map(m => (
                  <button key={m} onClick={() => setPayMethod(m)}
                    className={['rounded-xl border-2 py-2.5 text-sm font-bold transition-all',
                      payMethod === m ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-600 hover:border-red-300'].join(' ')}
                  >{m}</button>
                ))}
              </div>
              <p className="mt-2 text-[11px] font-semibold text-slate-400">Payment is released only after device condition is verified at pickup.</p>
            </div>
          </div>
          <button type="button" disabled={!pickupDate || !pickupTime || !selectedAddr || submitting} onClick={submitOrder}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-black text-white shadow-md shadow-red-200 transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          ><CheckCircle size={16} /> {submitting ? 'Submitting…' : 'Confirm Sell Request'}</button>
        </div>
      )}

      {/* Step 7: Confirmation */}
      {step === 7 && confirmedOrder && (
        <OrderConfirmation order={confirmedOrder} onSellAnother={reset} onViewOrders={onViewOrders} />
      )}
    </div>
  )
}


// ─── Inline Address Form (used in step 6 when no address saved) ───────────────
function InlineAddressForm({ onSaved }) {
  const [line1, setLine1] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [label, setLabel] = useState('Home')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!line1 || !city || !pincode) return
    setSaving(true)
    try {
      const res = await api.postAddress({ label, line1, city, state: '', pincode })
      if (res.error) {
        appAlert(res.error)
        return
      }
      const addr = res.address || { label, line1, city, state: '', pincode }
      setSaved(true)
      onSaved(addr)
    } catch (e) {
      appAlert(e.message || 'Could not save address')
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="mt-1 flex items-center gap-2 rounded-xl border-2 border-green-400 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
        <CheckCircle size={15} /> Address saved — ready to confirm!
      </div>
    )
  }

  return (
    <div className="mt-1 rounded-xl border-2 border-rose-200 bg-rose-50 p-4 space-y-3">
      <p className="text-xs font-black uppercase tracking-wider text-rose-700">Add Pickup Address</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Label</Label>
          <select value={label} onChange={e => setLabel(e.target.value)}
            className="h-11 w-full rounded-xl border-2 border-rose-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500"
          >
            {['Home', 'Work', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label>Street / House No.</Label>
          <input value={line1} onChange={e => setLine1(e.target.value)} placeholder="123, Main Street"
            className="h-11 w-full rounded-xl border-2 border-rose-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-300 focus:border-rose-500"
          />
        </div>
        <div>
          <Label>City</Label>
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="Delhi"
            className="h-11 w-full rounded-xl border-2 border-rose-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-300 focus:border-rose-500"
          />
        </div>
        <div>
          <Label>Pincode</Label>
          <input value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="110001" inputMode="numeric" maxLength={6}
            className="h-11 w-full rounded-xl border-2 border-rose-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-300 focus:border-rose-500"
          />
        </div>
      </div>
      <button type="button" onClick={save} disabled={!line1 || !city || !pincode || saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-sm font-black text-white shadow-md hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <CheckCircle size={14} /> {saving ? 'Saving…' : 'Save & Use This Address'}
      </button>
    </div>
  )
}

// ─── Order Confirmation screen ────────────────────────────────────────────────

function OrderConfirmation({ order, onSellAnother, onViewOrders }) {
  const [copied, setCopied] = useState(false)
  function copyId() {
    navigator.clipboard?.writeText(order.id)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
      {/* Success banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-xl shadow-green-200">
        <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-white/10" />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20"
        ><CheckCircle size={32} className="text-white" /></motion.div>
        <h2 className="text-2xl font-black">Request Confirmed! 🎉</h2>
        <p className="mt-1 text-sm text-green-100">Your sell request has been received. We'll contact you before pickup.</p>
      </div>

      {/* Order ID card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Order ID</p>
            <p className="mt-1 text-xl font-black text-rose-600">{order.id}</p>
          </div>
          <button onClick={copyId}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:border-rose-300 hover:text-rose-600 transition-all"
          ><Copy size={13} />{copied ? 'Copied!' : 'Copy'}</button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><p className="font-semibold text-slate-400">Device</p><p className="font-black text-slate-900">{order.brand} {order.model}</p></div>
          <div><p className="font-semibold text-slate-400">Variant</p><p className="font-black text-slate-900">{order.ram} / {order.storage}</p></div>
          <div><p className="font-semibold text-slate-400">Pickup Date</p><p className="font-black text-slate-900">{order.pickupDate}</p></div>
          <div><p className="font-semibold text-slate-400">Time Slot</p><p className="font-black text-slate-900">{order.pickupTime}</p></div>
          <div><p className="font-semibold text-slate-400">Payment</p><p className="font-black text-slate-900">{order.payMethod}</p></div>
          <div><p className="font-semibold text-slate-400">Offer Price</p><p className="text-lg font-black text-green-600">₹{fmt(order.estimate)}</p></div>
        </div>
      </div>

      {/* Status pipeline preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-4 text-sm font-black text-slate-900">Track your order progress</p>
        <StatusTimeline currentStatus="Request Submitted" history={order.statusHistory} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={onSellAnother} className="rounded-xl border-2 border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Sell Another</button>
        <button onClick={onViewOrders} className="rounded-xl bg-rose-600 py-3 text-sm font-black text-white shadow-md hover:bg-rose-700">View My Orders</button>
      </div>
    </motion.div>
  )
}

// ─── Status Timeline ──────────────────────────────────────────────────────────
function StatusTimeline({ currentStatus, history = [] }) {
  const currentIdx = ORDER_STATUSES.findIndex(s => s.key === currentStatus)
  return (
    <div className="relative">
      {ORDER_STATUSES.map((s, i) => {
        const done = i <= currentIdx
        const active = i === currentIdx
        const histEntry = history?.find(h => h.status === s.key)
        return (
          <div key={s.key} className="flex gap-4">
            {/* Line + dot column */}
            <div className="flex flex-col items-center">
              <div className={['flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all',
                done ? (active ? `${s.bg} ring-2 ring-offset-2 ring-${s.fill?.replace('bg-', '')}` : s.bg) : 'bg-slate-100'].join(' ')}
              >
                <s.Icon size={15} className={done ? s.color : 'text-slate-300'} />
              </div>
              {i < ORDER_STATUSES.length - 1 && (
                <div className={['w-0.5 flex-1 my-1 rounded-full transition-all', i < currentIdx ? s.fill : 'bg-slate-200'].join(' ')} style={{ minHeight: '24px' }} />
              )}
            </div>
            {/* Text */}
            <div className="pb-5 pt-1">
              <p className={['text-sm font-black transition-colors', done ? 'text-slate-900' : 'text-slate-400'].join(' ')}>{s.key}</p>
              {histEntry && <p className="text-[11px] font-semibold text-slate-400">{fmtDate(histEntry.at)}</p>}
              {active && <span className="mt-1 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-700">Current</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MY ORDERS TAB
// ─────────────────────────────────────────────────────────────────────────────
function mapApiOrderToCard(o) {
  const st = apiOrderStatusToLabel(o.status)
  const progressIdx =
    { PLACED: 0, PICKUP_SCHEDULED: 1, VERIFIED: 2, PRICE_FINALIZED: 2, COMPLETED: 3, CANCELLED: 0 }[o.status] ?? 0
  return {
    id: o._id,
    apiStatus: o.status,
    progressIdx,
    brand: o.brand,
    model: o.modelName,
    ram: o.ram,
    storage: o.storage,
    estimate: o.finalPrice,
    pickupDate: o.pickupDate,
    pickupTime: o.pickupTime,
    payMethod: o.payMethod === 'BANK' ? 'Bank Transfer' : 'UPI',
    address: o.address,
    screen: o.screenCondition,
    body: o.bodyCondition,
    battery: o.batteryHealth,
    accessories: o.accessories,
    createdAt: o.createdAt,
    statusHistory: (o.statusHistory || []).map((h) => ({
      status: apiOrderStatusToLabel(h.status),
      at: typeof h.at === 'string' ? h.at : new Date(h.at).toISOString(),
    })),
    status: st,
    paymentDetails: o.paymentDetails,
  }
}

function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [payingId, setPayingId] = useState(null)

  async function refreshOrders() {
    setLoading(true)
    try {
      const res = await api.getOrderManagementList({ page: 1, limit: 50 })
      setOrders((res.items || []).map(mapApiOrderToCard))
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshOrders()
  }, [])

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-sm font-semibold text-slate-500">
        Loading orders…
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-4xl">📦</div>
        <h2 className="text-xl font-black text-slate-800">No orders yet</h2>
        <p className="mt-1 text-sm font-semibold text-slate-400">Sell your first phone to track orders here.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">My Sell Orders</h1>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-4">
        {orders.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            expanded={expandedId === o.id}
            onToggle={() => setExpandedId(expandedId === o.id ? null : o.id)}
            onRefresh={refreshOrders}
            payingId={payingId}
            setPayingId={setPayingId}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Single Order Card ────────────────────────────────────────────────────────
function OrderCard({ order, expanded, onToggle, onRefresh, payingId, setPayingId }) {
  const statusCfg = ORDER_STATUSES.find(s => s.key === order.status) || ORDER_STATUSES[0]
  const currentIdx = typeof order.progressIdx === 'number' ? order.progressIdx : ORDER_STATUSES.findIndex(s => s.key === order.status)
  const isPaying = payingId === order.id
  const [upiId, setUpiId] = useState('')
  const [bankAcc, setBankAcc] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [payLoading, setPayLoading] = useState(false)
  const [payDone, setPayDone] = useState(false)

  async function initiatePayment(e) {
    e.preventDefault()
    if (order.payMethod === 'UPI' && !upiId) return
    if (order.payMethod === 'Bank Transfer' && (!bankAcc || !ifsc)) return
    setPayLoading(true)
    try {
      await api.postPaymentInitiate({
        orderId: order.id,
        method: order.payMethod === 'Bank Transfer' ? 'BANK' : 'UPI',
      })
      setPayDone(true)
      setTimeout(() => {
        setPayingId(null)
        setPayDone(false)
        onRefresh?.()
      }, 1500)
    } catch (err) {
      appAlert(err.message || 'Could not initiate payment')
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Card header */}
      <button onClick={onToggle} className="w-full p-5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-black text-slate-900">{order.brand} {order.model}</p>
              <span className="text-xs font-semibold text-slate-400">{order.ram}/{order.storage}</span>
            </div>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">Order {String(order.id).slice(-8)} · {fmtDate(order.createdAt)}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${statusCfg.bg} ${statusCfg.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.fill}`} />
              {order.status}
            </span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-green-500 transition-all duration-700"
            style={{ width: `${((currentIdx) / (ORDER_STATUSES.length - 1)) * 100}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-300">
          {ORDER_STATUSES.map(s => <span key={s.key}>{s.key.split(' ')[0]}</span>)}
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-5">
              {/* Full status timeline */}
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">Order Status Timeline</p>
                <StatusTimeline currentStatus={order.status} history={order.statusHistory} />
              </div>

              {/* Order details */}
              <div className="rounded-xl bg-slate-50 p-4 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs font-semibold text-slate-400">Pickup Date</p><p className="font-black text-slate-900 flex items-center gap-1"><Calendar size={12}/> {order.pickupDate}</p></div>
                <div><p className="text-xs font-semibold text-slate-400">Time Slot</p><p className="font-black text-slate-900 flex items-center gap-1"><Clock size={12}/> {order.pickupTime}</p></div>
                <div><p className="text-xs font-semibold text-slate-400">Payment Method</p><p className="font-black text-slate-900">{order.payMethod}</p></div>
                <div><p className="text-xs font-semibold text-slate-400">Estimated Payout</p><p className="text-base font-black text-green-600">₹{fmt(order.estimate || 0)}</p></div>
                {order.address && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-400">Pickup Address</p>
                    <p className="font-bold text-slate-800">{order.address.label}: {order.address.line1}, {order.address.city} – {order.address.pincode}</p>
                  </div>
                )}
              </div>

              {/* Condition summary */}
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Device Condition</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[['Screen', order.screen], ['Body', order.body], ['Battery', order.battery], ['Accessories', order.accessories]].map(([l, v]) => (
                    <div key={l} className="rounded-lg border border-slate-100 px-3 py-2">
                      <span className="font-semibold text-slate-400">{l}: </span>
                      <span className="font-black text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Payment Section (when price finalized — backend allows initiate) ── */}
              {order.apiStatus === 'PRICE_FINALIZED' && !order.paymentDetails && (
                <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <CreditCard size={16} className="text-orange-600" />
                    <p className="text-sm font-black text-orange-800">Device verified! Initiate your payout</p>
                  </div>
                  <p className="mb-4 text-xs font-semibold text-orange-700">Our agent has received and verified yer device. Enter your {order.payMethod} details to receive ₹{fmt(order.estimate)}.</p>

                  {!isPaying ? (
                    <button onClick={() => setPayingId(order.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-black text-white shadow-md shadow-orange-200 hover:bg-orange-600 transition-all"
                    ><CreditCard size={15} /> Enter Payment Details</button>
                  ) : (
                    <form onSubmit={initiatePayment} className="space-y-3">
                      {payDone ? (
                        <div className="flex items-center justify-center gap-2 py-3 text-green-700 font-black"><CheckCircle size={18}/> Payment initiated!</div>
                      ) : (
                        <>
                          {order.payMethod === 'UPI' ? (
                            <div>
                              <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-orange-700">UPI ID</label>
                              <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi"
                                className="h-11 w-full rounded-xl border-2 border-orange-200 bg-white px-3 text-sm font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                              />
                            </div>
                          ) : (
                            <>
                              <div>
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-orange-700">Account Number</label>
                                <input value={bankAcc} onChange={e => setBankAcc(e.target.value)} placeholder="Enter account number"
                                  className="h-11 w-full rounded-xl border-2 border-orange-200 bg-white px-3 text-sm font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                />
                              </div>
                              <div>
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-orange-700">IFSC Code</label>
                                <input value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} placeholder="SBIN0001234"
                                  className="h-11 w-full rounded-xl border-2 border-orange-200 bg-white px-3 text-sm font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                />
                              </div>
                            </>
                          )}
                          <div className="flex gap-3">
                            <button type="button" onClick={() => setPayingId(null)} className="flex-1 rounded-xl border-2 border-slate-200 py-2 text-sm font-bold text-slate-600 hover:bg-white">Cancel</button>
                            <button type="submit" disabled={payLoading}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-2 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-60"
                            >
                              {payLoading ? <RefreshCw size={14} className="animate-spin" /> : <><CheckCircle size={14}/> Confirm</>}
                            </button>
                          </div>
                        </>
                      )}
                    </form>
                  )}
                </div>
              )}

              {/* Payment complete receipt */}
              {order.apiStatus === 'COMPLETED' && order.paymentDetails && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 mb-2"><BadgeCheck size={16} className="text-green-600"/><p className="text-sm font-black text-green-800">Payment Completed!</p></div>
                  <div className="text-xs font-semibold text-green-700 space-y-1">
                    {order.paymentDetails.upiId && <p>UPI: {order.paymentDetails.upiId}</p>}
                    {order.paymentDetails.accountNo && <><p>Account: ••••{order.paymentDetails.accountNo.slice(-4)}</p><p>IFSC: {order.paymentDetails.ifsc}</p></>}
                    <p className="text-base font-black text-green-700 pt-1">₹{fmt(order.estimate)} transferred ✓</p>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE TAB
// ─────────────────────────────────────────────────────────────────────────────
function ProfileTab({ user }) {
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [saved, setSaved] = useState(false)
  async function save(e) {
    e.preventDefault()
    try {
      const res = await api.patchMe({ name, email, phone })
      if (res.error) {
        appAlert(res.error)
        return
      }
      if (res.user) updateSessionUser(res.user)
      else updateSessionUser({ name, email, phone })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      appAlert(err.message || 'Could not save profile')
    }
  }
  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-black text-slate-900">My Profile</h1>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-2xl font-black text-white">
          {(name || phone || 'U')[0].toUpperCase()}
        </div>
        <div>
          <p className="text-base font-black text-slate-900">{name || 'Your Name'}</p>
          <p className="text-sm font-semibold text-slate-400">{phone || email || 'No contact info'}</p>
        </div>
      </div>
      <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div><Label>Full Name</Label><DInput value={name} onChange={setName} placeholder="Enter your name" /></div>
        <div><Label>Email Address</Label><DInput value={email} onChange={setEmail} placeholder="you@email.com" type="email" /></div>
        <div>
          <Label>Mobile Number</Label>
          <div className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-3 focus-within:border-rose-500 transition">
            <span className="text-sm font-black text-slate-400">+91</span>
            <div className="h-5 w-px bg-slate-200" />
            <input type="tel" inputMode="numeric" maxLength={10}
              value={phone.replace('+91', '').trim()} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              className="h-11 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-300"
            />
          </div>
        </div>
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-black text-white shadow-md shadow-rose-200 hover:bg-rose-700 transition-all">
          {saved ? <><CheckCircle size={15} /> Saved!</> : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ADDRESSES TAB
// ─────────────────────────────────────────────────────────────────────────────
function AddressTab() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ label: 'Home', line1: '', city: '', state: '', pincode: '' })

  async function loadAddresses() {
    setLoading(true)
    try {
      const list = await api.getAddresses()
      setAddresses(Array.isArray(list) ? list : [])
    } catch {
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAddresses()
  }, [])

  async function save() {
    if (!form.line1 || !form.city || !form.pincode) return
    try {
      const res = await api.postAddress(form)
      if (res.error) {
        appAlert(res.error)
        return
      }
      setAdding(false)
      setForm({ label: 'Home', line1: '', city: '', state: '', pincode: '' })
      await loadAddresses()
    } catch (e) {
      appAlert(e.message || 'Could not save')
    }
  }

  async function remove(addr) {
    const id = addr._id || addr.id
    if (!id) return
    try {
      await api.deleteAddress(id)
      await loadAddresses()
    } catch (e) {
      appAlert(e.message || 'Could not delete')
    }
  }
  return (
    <div className="max-w-lg">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Pickup Addresses</h1>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-black text-white shadow-md shadow-rose-200 hover:bg-rose-700 transition-all">
          <Plus size={15} /> Add New
        </button>
      </div>
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mb-4 rounded-2xl border-2 border-rose-200 bg-rose-50 p-5 space-y-3"
          >
            <h3 className="text-sm font-black text-rose-800">New Address</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>Label</Label><DSelect value={form.label} onChange={v => setForm(f => ({ ...f, label: v }))} options={['Home', 'Work', 'Other']} /></div>
              <div className="sm:col-span-2"><Label>Street / House No.</Label><DInput value={form.line1} onChange={v => setForm(f => ({ ...f, line1: v }))} placeholder="123, Main Street" /></div>
              <div><Label>City</Label><DInput value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="Delhi" /></div>
              <div><Label>State</Label><DInput value={form.state} onChange={v => setForm(f => ({ ...f, state: v }))} placeholder="Delhi" /></div>
              <div><Label>Pincode</Label><DInput value={form.pincode} onChange={v => setForm(f => ({ ...f, pincode: v.replace(/\D/, '').slice(0, 6) }))} placeholder="110001" inputMode="numeric" maxLength={6} /></div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setAdding(false)} className="flex-1 rounded-xl border-2 border-slate-200 py-2 text-sm font-bold text-slate-600 hover:bg-white">Cancel</button>
              <button onClick={save} className="flex-1 rounded-xl bg-rose-600 py-2 text-sm font-black text-white shadow-md hover:bg-rose-700">Save Address</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {loading ? (
        <p className="text-sm font-semibold text-slate-500">Loading addresses…</p>
      ) : addresses.length === 0 && !adding ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-14 text-center">
          <MapPin size={36} className="mb-3 text-slate-300" />
          <p className="text-sm font-black text-slate-500">No addresses saved</p>
          <p className="text-xs font-semibold text-slate-400">Add an address so we can pick up your device</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a._id || a.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Home size={18} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900">{a.label}</p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{a.line1}, {a.city} {a.state && `(${a.state})`} – {a.pincode}</p>
              </div>
              <button type="button" onClick={() => remove(a)} className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Utilities ─────────────────────────────────────────────────────────────
function AnimatedCounter({ value }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const duration = 1800; // 1.8 seconds for drama
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo for that satisfying snap at the end
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(easeProgress * value));
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplayValue(value);
      }
    }
    requestAnimationFrame(update);
  }, [value]);
  
  return <>{Number(displayValue).toLocaleString('en-IN')}</>;
}
