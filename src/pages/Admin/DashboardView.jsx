import React, { useState, useEffect } from 'react'
import { 
  Users, ShoppingCart, Truck, DollarSign, Download 
} from 'lucide-react'
import { 
  LineChart, Line, BarChart as ReBarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import * as api from '../../lib/api/baskaroApi.js'

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

export default function DashboardView() {
  const [stats, setStats] = useState(null)
  const [daily, setDaily] = useState([])
  const [monthly, setMonthly] = useState([])
  const [topPhones, setTopPhones] = useState([])
  const [loadErr, setLoadErr] = useState('')

  useEffect(() => {
    let c = false
    ;(async () => {
      try {
        const [s, d, m, t] = await Promise.all([
          api.dashboardStats(),
          api.dashboardDailySales(7),
          api.dashboardMonthlyRevenue(6),
          api.dashboardTopSellingPhones(8),
        ])
        if (!c) {
          setStats(s)
          setDaily(Array.isArray(d) ? d : [])
          setMonthly(Array.isArray(m) ? m : [])
          setTopPhones(Array.isArray(t) ? t : [])
          setLoadErr('')
        }
      } catch (e) {
        if (!c) setLoadErr(e.message || 'Failed to load dashboard')
      }
    })()
    return () => { c = true }
  }, [])

  const dailyChart = (daily.length ? daily : []).map((row, i) => ({
    name: row.date ? String(row.date).slice(5) : row.name || `D${i}`,
    sales: row.orders ?? row.sales ?? 0,
  }))

  const monthlyChart = (monthly.length ? monthly : []).map((row, i) => ({
    name: row.month ? String(row.month).slice(5) : row.name || `M${i}`,
    rev: row.revenue ?? row.rev ?? 0,
  }))

  const pieData = topPhones.length
    ? topPhones.map((p) => ({
        name: `${p.brand || ''} ${p.modelName || ''}`.trim() || 'Device',
        value: Math.max(1, Number(p.salesCount) || 1),
      }))
    : []

  const pieTotal = pieData.reduce((s, x) => s + x.value, 0)

  const kpis = stats
    ? [
        { label: 'Total Users', value: String(stats.totalUsers ?? 0), icon: Users, color: 'text-blue-600', iconBg: 'bg-blue-100', trend: '—', trendUp: true },
        { label: 'Total Orders', value: String(stats.totalOrders ?? 0), icon: ShoppingCart, color: 'text-orange-600', iconBg: 'bg-orange-100', trend: '—', trendUp: true },
        { label: 'Pending / Active', value: String(stats.pendingOrders ?? 0), icon: Truck, color: 'text-red-500', iconBg: 'bg-red-100', trend: '—', trendUp: false },
        { label: 'Total Revenue', value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-green-600', iconBg: 'bg-green-100', trend: '—', trendUp: true },
      ]
    : [
        { label: 'Total Users', value: '…', icon: Users, color: 'text-blue-600', iconBg: 'bg-blue-100', trend: '—', trendUp: true },
        { label: 'Total Orders', value: '…', icon: ShoppingCart, color: 'text-orange-600', iconBg: 'bg-orange-100', trend: '—', trendUp: true },
        { label: 'Pending / Active', value: '…', icon: Truck, color: 'text-red-500', iconBg: 'bg-red-100', trend: '—', trendUp: false },
        { label: 'Total Revenue', value: '…', icon: DollarSign, color: 'text-green-600', iconBg: 'bg-green-100', trend: '—', trendUp: true },
      ]

  return (
    <div className="space-y-8">
      {loadErr && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          {loadErr}
        </div>
      )}
      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-lg hover:border-slate-300">
            <div className="flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${kpi.iconBg} ${kpi.color}`}>
                <kpi.icon size={24} strokeWidth={2.5} />
              </div>
              <span className={`inline-flex items-center text-xs font-black px-2.5 py-1 rounded-full ${kpi.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {kpi.trend}
              </span>
            </div>
            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 sm:text-lg">Daily order volume</h3>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">From API (completed orders)</p>
            </div>
            <button type="button" className="flex w-fit items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100"><Download size={16}/> Export</button>
          </div>
          <div className="h-[220px] w-full min-w-0 sm:h-[300px]">
            {dailyChart.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">No order data for this period</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} dx={-10} />
                <Tooltip contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}}/>
                <Line type="monotone" dataKey="sales" name="Orders" stroke="#dc2626" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#fff', stroke: '#dc2626'}} activeDot={{r: 6, fill: '#dc2626', stroke: '#fff', strokeWidth: 3}} />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <div className="mb-2">
            <h3 className="text-lg font-black text-slate-900">Top devices</h3>
            <p className="text-sm font-medium text-slate-500">By completed orders</p>
          </div>
          <div className="flex-1 flex flex-col justify-center relative min-h-[250px]">
            {pieData.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center text-sm font-semibold text-slate-400">No device sales yet</div>
            ) : (
            <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-black text-slate-900">{pieTotal}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
            </div>
            </>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 mt-4 max-h-40 overflow-y-auto">
             {pieData.slice(0, 6).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                  <span className="text-sm font-bold text-slate-700 truncate">{item.name}</span>
                  <span className="text-sm font-black text-slate-900 ml-auto shrink-0">{item.value}</span>
                </div>
             ))}
          </div>
        </div>

        <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Monthly revenue</h3>
              <p className="text-sm font-medium text-slate-500">In Indian Rupees (₹)</p>
            </div>
          </div>
          <div className="h-[220px] w-full min-w-0 sm:h-[300px]">
            {monthlyChart.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">No revenue data yet</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={monthlyChart} margin={{ top: 5, right: 10, left: 10, bottom: 0 }} barSize={36}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}/>
                <Bar dataKey="rev" name="Revenue" fill="#2563eb" radius={[6, 6, 0, 0]}>
                   {monthlyChart.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={index === monthlyChart.length - 1 ? '#2563eb' : '#93c5fd'} />
                   ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
