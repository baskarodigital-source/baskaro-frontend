import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { appAlert } from '../lib/appDialog.js'

function parsePrice(price) {
  return Number(String(price ?? '').replace(/,/g, '')) || 0
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart()
  const navigate = useNavigate()

  const fmt = (n) => new Intl.NumberFormat('en-IN').format(n)
  const gst = Math.round(cartTotal * 0.12)
  const totalWithTax = Math.round(cartTotal * 1.12)

  const handleCheckout = () => {
    appAlert('Online checkout is coming soon. For now, visit a nearby store or contact support to complete your order.', {
      title: 'Checkout coming soon',
      variant: 'info',
      confirmLabel: 'Got it',
    })
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
          to="/find-new-phone"
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
        {/* Header */}
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
          {/* Cart items */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-2">
            <AnimatePresence>
              {cart.map((item) => {
                const unitPrice = parsePrice(item.price)
                const lineTotal = unitPrice * item.quantity

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
                      <img
                        src={item.img}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 pr-6 sm:pr-0">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-900 sm:text-lg">
                            {item.name}
                          </h3>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:mt-1 sm:text-xs">
                            Condition: Grade A (Like New)
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-red-500 sm:static sm:p-1"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={16} className="sm:hidden" />
                          <Trash2 size={18} className="hidden sm:block" />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <div className="flex w-fit items-center rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white disabled:opacity-30"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-9 text-center text-sm font-black text-slate-900 sm:w-10">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-base font-black tracking-tight text-slate-900 sm:text-xl">
                            Rs {fmt(lineTotal)}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 sm:text-[11px]">
                            Rs {fmt(unitPrice)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            <Link
              to="/find-new-phone"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              <ArrowLeft size={14} /> Continue shopping
            </Link>
          </div>

          {/* Order summary — desktop sidebar */}
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
                  <span className="min-w-0">Pre-Owned Tax (GST)</span>
                  <span className="shrink-0 tabular-nums">Rs {fmt(gst)}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-slate-100 pt-3 text-base font-black text-slate-900 sm:pt-4 sm:text-xl">
                  <span className="min-w-0">Total Amount</span>
                  <span className="shrink-0 tabular-nums text-red-600 underline decoration-red-200 decoration-4 underline-offset-4">
                    Rs {fmt(totalWithTax)}
                  </span>
                </div>
              </div>

              <div className="mt-6 hidden space-y-4 sm:mt-8 lg:block">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 font-black text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-700 active:scale-95"
                >
                  Confirm Purchase <CreditCard size={20} />
                </button>
                <div className="flex items-center justify-center gap-2 px-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:text-[11px]">
                  <ShieldCheck size={14} className="shrink-0 text-green-500" />
                  Quality Verified &amp; Secured
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky checkout bar (above bottom nav) */}
      <div
        className="fixed inset-x-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md sm:px-4 lg:hidden"
        style={{ bottom: 'calc(5.375rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
            <p className="truncate text-lg font-black tabular-nums text-red-600">
              Rs {fmt(totalWithTax)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-500/25 transition hover:bg-red-700 active:scale-95"
          >
            Checkout
            <CreditCard size={18} />
          </button>
        </div>
        <p className="mx-auto mt-2 flex max-w-6xl items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <ShieldCheck size={12} className="text-green-500" />
          Quality Verified &amp; Secured
        </p>
      </div>
    </div>
  )
}
