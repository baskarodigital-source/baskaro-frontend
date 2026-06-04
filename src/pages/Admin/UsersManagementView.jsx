import React, { useState, useEffect } from 'react'
import { appAlert, appConfirm } from '../../lib/appDialog.js'
import { 
  Users, Search, Download, MoreVertical, Ban, Trash2, CheckCircle 
} from 'lucide-react'
import * as api from '../../lib/api/baskaroApi.js'

export default function UsersManagementView() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ items: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const load = async (p = page) => {
    setLoading(true)
    try {
      const res = await api.getUsers({ page: p, limit: 10, search: debouncedSearch, status: '' })
      setData(res || { items: [], pagination: {} })
      setErr('')
    } catch (e) {
      setErr(e.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(page)
  }, [page, debouncedSearch])

  const users = data.items || []
  const pagination = data.pagination || {}
  const total = pagination.total ?? 0
  const totalPages = pagination.totalPages ?? 1

  async function onBlockToggle(user) {
    const id = user._id || user.id
    setBusyId(id)
    try {
      if (user.status === 'BLOCKED') await api.unblockUser(id)
      else await api.blockUser(id)
      await load(page)
    } catch (e) {
      setErr(e.message || 'Action failed')
    } finally {
      setBusyId(null)
    }
  }

  async function onDelete(user) {
    const id = user._id || user.id
    if (!(await appConfirm('Delete this user?'))) return
    setBusyId(id)
    try {
      await api.deleteUser(id)
      await load(page)
    } catch (e) {
      setErr(e.message || 'Delete failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">User Management</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Data from <code className="text-xs">GET /api/users</code></p>
        </div>
        <button type="button" className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition">
          <Download size={18} /> Export CSV
        </button>
      </div>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{err}</div>}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="border-b border-slate-100 p-5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto text-sm text-slate-500 font-medium">
            {loading ? 'Loading…' : `${total} users`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">User Details</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Contact Information</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Total Orders</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const id = user._id || user.id
                const label = user.name || user.email || user.phone || 'User'
                const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
                const active = user.status !== 'BLOCKED'
                return (
                  <tr key={id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-600">
                          {String(label).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-base">{label}</div>
                          <div className="text-xs font-bold text-slate-400 mt-0.5">ID: {id} • Joined {joined}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{user.email || '—'}</div>
                      <div className="text-xs font-medium text-slate-500 mt-1">{user.phone ? `+91 ${user.phone}` : '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-blue-50 text-blue-700 font-black text-sm border border-blue-100">
                        {user.totalOrders ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-600' : 'bg-red-600'}`}></span>
                        {active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition" title="View Profile">
                          <MoreVertical size={18} />
                        </button>
                        {active ? (
                          <button type="button" disabled={busyId === id} onClick={() => onBlockToggle(user)} className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition" title="Block User">
                            <Ban size={18} />
                          </button>
                        ) : (
                          <button type="button" disabled={busyId === id} onClick={() => onBlockToggle(user)} className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition" title="Unblock User">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button type="button" disabled={busyId === id} onClick={() => onDelete(user)} className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition" title="Delete Account">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500 font-medium">
            <span>Page {pagination.page ?? page} of {totalPages} ({total} total)</span>
            <div className="flex gap-1">
              <button type="button" disabled={page <= 1 || loading} onClick={() => { const p = Math.max(1, page - 1); setPage(p); load(p); }} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50">Prev</button>
              <button type="button" disabled={page >= totalPages || loading} onClick={() => { const p = Math.min(totalPages, page + 1); setPage(p); load(p); }} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
