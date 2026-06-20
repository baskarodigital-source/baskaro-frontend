import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight, ShieldCheck, CreditCard, Loader2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { appAlert } from '../lib/appDialog.js'
import { isLoggedIn, getUser } from '../lib/auth.js'
import {
  createBuyOrder,
  createRazorpayOrder,
  getAddresses,
  mockCompletePayment,
  verifyRazorpayPayment,
} from '../lib/api/baskaroApi.js'
import { openRazorpayCheckout } from '../lib/razorpayCheckout.js'

function parsePrice(price) {
  return Number(String(price ?? '').replace(/,/g, '')) || 0
}

const EMPTY_ADDRESS = { label: 'Home', line1: '', city: '', state: '', pincode: '' }

export default function CartPage() {
  const { cart, removeFromCart, cartTotal, cartCount, refreshFromServer } = useCart()
  const navigate = useNavigate()
  const [checkingOut, setCheckingOut] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [address, setAddress] = useState(EMPTY_ADDRESS)
  const [savedAddresses, setSavedAddresses] = useState([])

  const fmt = (n) => new Intl.NumberFormat('en-IN').format(n)
  const gst = Math.round(cartTotal * 0.12)
  const totalWithTax = Math.round(cartTotal * 1.12)

  useEffect(() => {
    if (!isLoggedIn()) return
    getAddresses()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || res?.addresses || []
        setSavedAddresses(list)
        if (list[0]) {
          setAddress({
            label: list[0].label || 'Home',
            line1: list[0].line1 || '',
            city: list[0].city || '',
            state: list[0].state || '',
            pincode: list[0].pincode || '',
          })
        }
      })
      .catch(() => {})
  }, [])

  const startCheckout = () => {
    if (!isLoggedIn()) {
      appAlert('Please log in to complete your purchase.', { title: 'Login required', variant: 'info' })
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    setShowAddressForm(true)
  }

  const runPayment = async () => {
    if (!address.line1?.trim() || !address.city?.trim() || !address.pincode?.trim()) {
      appAlert('Please fill in delivery address (street, city, pincode).', { variant: 'error' })
      return
    }

    setCheckingOut(true)
    try {
      const order = await createBuyOrder({ address })
      const paymentSession = await createRazorpayOrder({ purchaseOrderId: order._id })

      if (paymentSession.mockMode) {
        await mockCompletePayment({ purchaseOrderId: order._id })
        await refreshFromServer()
        appAlert(`Order ${order.orderNumber} confirmed! Payment received (dev mode).`, {
          title: 'Order placed',
          variant: 'success',
        })
        navigate('/dashboard')
        return
      }

      const user = getUser()
      const razorpayRes = await openRazorpayCheckout({
        keyId: paymentSession.keyId,
        razorpayOrderId: paymentSession.razorpayOrderId,
        amountPaise: paymentSession.amountPaise,
        orderNumber: paymentSession.orderNumber,
        customer: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
      })

      await verifyRazorpayPayment({
        razorpay_order_id: razorpayRes.razorpay_order_id,
        razorpay_payment_id: razorpayRes.razorpay_payment_id,
        razorpay_signature: razorpayRes.razorpay_signature,
      })

      await refreshFromServer()
      appAlert(`Order ${order.orderNumber} confirmed!`, { title: 'Payment successful', variant: 'success' })
      navigate('/dashboard')
    } catch (err) {
      appAlert(err?.message || 'Checkout failed. Please try again.', {
        title: 'Checkout error',
        variant: 'error',
      })
    } finally {
      setCheckingOut(false)
      setShowAddressForm(false)
    }
  }

  if (cartCount === 0) {
    return (
      <div className="flex min-h-[min(70vh,52rem)] flex-col items-center justify-center px-4 py-12 pb-28 text-center font-['Outfit'] sm:min-h-[70vh] sm:pb-12">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 sm:mb-6 sm:h-20 sm:w-20">
          <ShoppingBag size={32} className="sm:hidden" />
          <ShoppingBag size={40} className="hidden sm:block" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Your cart is empty</h1>
        <p className="mt-2 max-w-xs text-sm font-medium text-slate-500 sm:text-base">
          Looks like you haven&apos;t added any pre-owned devices yet.
        </p>
        <Link
          to="/buy-pre-owned"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-700 sm:mt-8 sm:px-8 sm:py-3"
        >
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-['Outfit'] sm:pb-10">
      <div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
        <div className="mb-5 flex items-start gap-2 sm:mb-8 sm:items-center sm:gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-0.5 shrink-0 rounded-lg border border-transparent p-2 transition-colors hover:border-slate-200 hover:bg-white sm:mt-0"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
              Shopping Cart
              <span className="mt-0.5 block text-base font-medium text-slate-400 sm:ml-2 sm:mt-0 sm:inline sm:text-3xl">
                ({cartCount} {cartCount === 1 ? 'item' : 'items'})
              </span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-3 sm:space-y-4 lg:col-span-2">
            <AnimatePresence>
              {cart.map((item) => {
                const unitPrice = parsePrice(item.unitPriceInr ?? item.price)
                const lineTotal = unitPrice * (item.quantity || 1)
                const imageSrc = String(item.img || item.imageUrl || '').trim()

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:gap-6 sm:rounded-3xl sm:p-5"
                  >
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 p-1.5 sm:h-28 sm:w-28 sm:rounded-2xl sm:p-2">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item.name || item.title || 'Product'}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <ShoppingBag size={28} className="text-slate-400" aria-hidden />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 pr-6 sm:pr-0">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-900 sm:text-lg">
                            {item.name || item.title}
                          </h3>
                          {item.conditionGrade ? (
                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:mt-1 sm:text-xs">
                              Condition: {item.conditionGrade}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-red-500 sm:static sm:p-1"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="mt-3 sm:mt-6 sm:text-right">
                        <p className="text-base font-black tracking-tight text-slate-900 sm:text-xl">
                          Rs {fmt(lineTotal)}
                        </p>
                        <p className="text-[10px] font-bold text-amber-600 sm:text-[11px]">
                          Reserved for 30 min while in cart
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            <Link
              to="/buy-pre-owned"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              <ArrowLeft size={14} /> Continue shopping
            </Link>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:rounded-3xl sm:p-8 lg:sticky lg:top-24">
              <h3 className="text-lg font-black text-slate-900 sm:text-xl">Order Summary</h3>

              <div className="mt-4 space-y-3 text-sm font-bold sm:mt-6 sm:space-y-4">
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Subtotal</span>
                  <span className="shrink-0 tabular-nums">Rs {fmt(cartTotal)}</span>
                </div>
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Shipping</span>
                  <span className="shrink-0 text-green-600">FREE</span>
                </div>
                <div className="flex justify-between gap-4 text-slate-600">
                  <span className="min-w-0">GST (12%)</span>
                  <span className="shrink-0 tabular-nums">Rs {fmt(gst)}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-slate-100 pt-3 text-base font-black text-slate-900 sm:pt-4 sm:text-xl">
                  <span className="min-w-0">Total Amount</span>
                  <span className="shrink-0 tabular-nums text-red-600">Rs {fmt(totalWithTax)}</span>
                </div>
              </div>

              {showAddressForm ? (
                <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                  <p className="text-sm font-bold text-slate-800">Delivery address</p>
                  {savedAddresses.length > 0 ? (
                    <select
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                      onChange={(e) => {
                        const a = savedAddresses.find((x) => String(x._id) === e.target.value)
                        if (a) {
                          setAddress({
                            label: a.label || 'Home',
                            line1: a.line1 || '',
                            city: a.city || '',
                            state: a.state || '',
                            pincode: a.pincode || '',
                          })
                        }
                      }}
                    >
                      {savedAddresses.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.label}: {a.line1}, {a.city}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    placeholder="Street address"
                    value={address.line1}
                    onChange={(e) => setAddress((p) => ({ ...p, line1: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                      placeholder="City"
                      value={address.city}
                      onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                    />
                    <input
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                      placeholder="Pincode"
                      value={address.pincode}
                      onChange={(e) => setAddress((p) => ({ ...p, pincode: e.target.value }))}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={checkingOut}
                    onClick={runPayment}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 font-black text-white shadow-lg shadow-red-500/25 transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {checkingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard size={20} />}
                    {checkingOut ? 'Processing…' : 'Pay now'}
                  </button>
                </div>
              ) : (
                <div className="mt-6 hidden space-y-4 sm:mt-8 lg:block">
                  <button
                    type="button"
                    onClick={startCheckout}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 font-black text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-700 active:scale-95"
                  >
                    Proceed to checkout <CreditCard size={20} />
                  </button>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 px-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:text-[11px]">
                <ShieldCheck size={14} className="shrink-0 text-green-500" />
                Secured checkout
              </div>
            </div>
          </div>
        </div>
      </div>

      {!showAddressForm ? (
        <div
          className="fixed inset-x-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md sm:px-4 lg:hidden"
          style={{ bottom: 'calc(5.375rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
              <p className="truncate text-lg font-black tabular-nums text-red-600">Rs {fmt(totalWithTax)}</p>
            </div>
            <button
              type="button"
              onClick={startCheckout}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-500/25 transition hover:bg-red-700"
            >
              Checkout
              <CreditCard size={18} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
