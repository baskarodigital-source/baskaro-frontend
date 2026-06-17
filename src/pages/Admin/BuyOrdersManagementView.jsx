import React, { useCallback, useEffect, useState } from 'react'
import { ChevronRight, Package, RefreshCw } from 'lucide-react'
import * as api from '../../lib/api/baskaroApi.js'

const FULFILLMENT_PIPELINE = ['PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

const STATUS_LABELS = {
  PLACED: 'Placed',
  PAYMENT_PENDING: 'Payment pending',
  PAID: 'Paid',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

function statusLabel(status) {
  return STATUS_LABELS[status] || status
}

function customerName(user) {
  if (!user) return '—'
  if (typeof user === 'object') {
    return user.name || user.phone || user.email || '—'
  }
  return String(user)
}

function lineSummary(lineItems) {
  if (!Array.isArray(lineItems) || !lineItems.length) return '—'
  if (lineItems.length === 1) return lineItems[0].title || '1 device'
  return `${lineItems[0].title || 'Device'} +${lineItems.length - 1} more`
}

function nextFulfillmentStatus(current) {
  if (current === 'PLACED' || current === 'PAYMENT_PENDING') return 'PAID'
  const i = FULFILLMENT_PIPELINE.indexOf(current)
  if (i >= 0 && i < FULFILLMENT_PIPELINE.length - 1) return FULFILLMENT_PIPELINE[i + 1]
  return null
}

function advanceButtonLabel(current) {
  const next = nextFulfillmentStatus(current)
  if (!next) return 'Advance'
  if (current === 'PLACED' || current === 'PAYMENT_PENDING') return 'Mark paid'
  if (next === 'SHIPPED') return 'Mark shipped'
  if (next === 'DELIVERED') return 'Mark delivered'
  return `Mark ${statusLabel(next).toLowerCase()}`
}

function pipelineIndex(status) {
  if (status === 'PLACED' || status === 'PAYMENT_PENDING') return -1
  return FULFILLMENT_PIPELINE.indexOf(status)
}

function notificationLabel(notification) {
  if (!notification) return 'Not attempted'
  const e = notification?.email?.status || 'SKIPPED'
  const s = notification?.sms?.status || 'SKIPPED'
  return `Email: ${e} / SMS: ${s}`
}

function notificationTone(notification) {
  if (!notification) return 'bg-slate-100 text-slate-600'
  const statuses = [notification?.email?.status, notification?.sms?.status]
  if (statuses.includes('FAILED')) return 'bg-red-100 text-red-700'
  if (statuses.includes('SENT')) return 'bg-emerald-100 text-emerald-700'
  return 'bg-amber-100 text-amber-700'
}

export default function BuyOrdersManagementView() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: 1, limit: 50 }
      if (statusFilter) params.status = statusFilter
      const res = await api.getAdminBuyOrders(params)
      const items = res?.items || []
      setOrders(
        items.map((o) => ({
          id: o._id,
          orderNumber: o.orderNumber || o._id,
          customer: customerName(o.userId),
          items: lineSummary(o.lineItems),
          total: o.totalInr ?? 0,
          status: statusLabel(o.status),
          apiStatus: o.status,
          paymentStatus: o.payment?.status || 'PENDING',
          notification: o.payment?.notification || null,
          city: o.address?.city || '—',
          date: o.createdAt
            ? new Date(o.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '—',
        })),
      )
      setErr('')
    } catch (e) {
      setErr(e.message || 'Failed to load buy orders')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (row, status, notes = '') => {
    setBusyId(row.id)
    try {
      await api.patchAdminBuyOrderStatus(row.id, { status, notes })
      await load()
    } catch (e) {
      setErr(e.message || 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  const advance = (row) => {
    const next = nextFulfillmentStatus(row.apiStatus)
    if (!next) return
    updateStatus(row, next)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Buy Orders</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Pre-owned checkout orders — list, ship, and mark delivered.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => load()}
            className="flex items-center justify-center gap-2 border border-slate-200 bg-white rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {err}
        </div>
      )}
      {loading && <div className="text-sm font-semibold text-slate-500">Loading buy orders…</div>}

      {!loading && orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">
          No buy orders yet. Completed checkouts will appear here.
        </div>
      ) : null}

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest h-14">
                <th className="px-6 font-bold">Order & customer</th>
                <th className="px-6 font-bold">Items</th>
                <th className="px-6 font-bold">Total</th>
                <th className="px-6 font-bold">Payment / notify</th>
                <th className="px-6 font-bold">Ship to</th>
                <th className="px-6 font-bold min-w-[200px]">Fulfillment</th>
                <th className="px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const pIdx = pipelineIndex(order.apiStatus)
                const canAdvance = Boolean(nextFulfillmentStatus(order.apiStatus))

                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-black text-slate-900 text-sm">{order.orderNumber}</div>
                      <div className="font-semibold text-slate-600 text-xs mt-1">{order.customer}</div>
                      <div className="font-semibold text-slate-400 text-[10px] mt-0.5">{order.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-2 max-w-[220px]">
                        <Package size={14} className="text-slate-400 shrink-0" />
                        <span className="line-clamp-2">{order.items}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-black text-slate-900 text-sm">₹{order.total.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                        {order.paymentStatus}
                      </div>
                      <div
                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${notificationTone(order.notification)}`}
                        title={notificationLabel(order.notification)}
                      >
                        {notificationLabel(order.notification)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600">
                      {order.city}
                    </td>
                    <td className="px-6 py-3 w-48 align-top">
                      <div className="mb-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                            order.apiStatus === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.apiStatus === 'CANCELLED'
                                ? 'bg-slate-200 text-slate-600'
                                : order.apiStatus === 'SHIPPED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      {order.apiStatus !== 'CANCELLED' && order.apiStatus !== 'DELIVERED' ? (
                        <div className="flex flex-col py-1">
                          {FULFILLMENT_PIPELINE.map((step, idx) => {
                            const isComplete = pIdx >= idx
                            const isCurrent = order.apiStatus === step
                            const isLast = idx === FULFILLMENT_PIPELINE.length - 1
                            const stepColors = ['bg-emerald-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500']
                            const dotColor = isComplete ? stepColors[idx] : 'bg-slate-200'
                            const lineColor = idx < pIdx ? stepColors[idx] : 'bg-slate-100'
                            const textColor = isComplete
                              ? isCurrent
                                ? 'text-slate-900 font-black'
                                : 'text-slate-500 font-bold'
                              : 'text-slate-300 font-semibold'

                            return (
                              <div key={step} className="flex gap-3 relative">
                                {!isLast && (
                                  <div
                                    className={`absolute left-[5px] top-[14px] bottom-[-6px] w-[2px] rounded-full ${lineColor}`}
                                  />
                                )}
                                <div
                                  className={`relative z-10 w-3 h-3 mt-[5px] rounded-full border-2 border-white shadow-sm ${dotColor} ${isCurrent ? 'ring-2 ring-offset-1 ring-slate-300 scale-110' : ''}`}
                                />
                                <div className={`text-[10px] pb-[10px] uppercase tracking-wider ${textColor}`}>
                                  {statusLabel(step)}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {order.apiStatus === 'CANCELLED' || order.apiStatus === 'DELIVERED' ? (
                        <span className="text-xs font-semibold text-slate-400">—</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {canAdvance ? (
                            <button
                              type="button"
                              disabled={busyId === order.id}
                              onClick={() => advance(order)}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              {advanceButtonLabel(order.apiStatus)}
                              <ChevronRight size={14} />
                            </button>
                          ) : null}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
