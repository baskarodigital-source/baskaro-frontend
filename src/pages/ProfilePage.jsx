import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { getToken, getUser, isAdminUser } from '../lib/auth.js'
import { ProfileUserDetails } from '../lib/profileDisplay'

export default function ProfilePage() {
  const navigate = useNavigate()
  const token = getToken()
  const user = getUser()

  useEffect(() => {
    if (!token || !user) {
      navigate('/login', { replace: true, state: { redirectTo: '/profile' } })
    }
  }, [token, user, navigate])

  if (!token || !user) {
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-rose-600 border-t-transparent" aria-hidden />
      </div>
    )
  }

  const backHref = isAdminUser(user) ? '/admin' : '/dashboard'

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto w-full py-8 sm:py-12 scrollbar-hide">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
        <Link
          to={backHref}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-rose-600"
        >
          <ChevronLeft size={18} aria-hidden />
          {isAdminUser(user) ? 'Back to admin' : 'Back to account'}
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-br from-rose-50/90 to-white px-6 py-6 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-xl font-black text-white">
                {(user.name || user.phone || user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Profile</h1>
                <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                  {user.name || 'User'}
                  {user.phone || user.email ? ` · ${user.phone || user.email}` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Your information</p>
            <ProfileUserDetails user={user} />
          </div>
        </div>
      </div>
    </section>
  )
}
