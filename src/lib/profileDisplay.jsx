import React from 'react'

const PROFILE_KEY_LABELS = {
  id: 'User ID',
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  role: 'Role',
  accountType: 'Account type',
}

const SKIP_PROFILE_KEYS = new Set(['token', 'password', 'passwordHash'])

export function formatProfileValue(value) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  const s = String(value).trim()
  return s || '—'
}

export function getProfileEntries(user) {
  if (!user || typeof user !== 'object') return []
  const preferred = ['id', 'name', 'email', 'phone', 'role', 'accountType']
  const seen = new Set()
  const out = []
  for (const k of preferred) {
    if (Object.prototype.hasOwnProperty.call(user, k) && !SKIP_PROFILE_KEYS.has(k)) {
      out.push([k, user[k]])
      seen.add(k)
    }
  }
  for (const k of Object.keys(user).sort()) {
    if (seen.has(k) || SKIP_PROFILE_KEYS.has(k)) continue
    out.push([k, user[k]])
  }
  return out
}

function labelForKey(key) {
  if (PROFILE_KEY_LABELS[key]) return PROFILE_KEY_LABELS[key]
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

/** Full read-only list of session user fields (for the Profile page). */
export function ProfileUserDetails({ user, className = '' }) {
  const entries = getProfileEntries(user)
  return (
    <dl className={`space-y-3 text-left ${className}`}>
      {entries.map(([key, value]) => (
        <div key={key} className="grid gap-x-3 gap-y-0.5 sm:grid-cols-[6.5rem_1fr] sm:items-baseline">
          <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{labelForKey(key)}</dt>
          <dd className="min-w-0 break-words text-[13px] font-semibold text-slate-800">{formatProfileValue(value)}</dd>
        </div>
      ))}
    </dl>
  )
}
