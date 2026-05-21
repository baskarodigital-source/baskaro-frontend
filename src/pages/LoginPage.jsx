import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Phone, Mail, Shield,
  CheckCircle, RefreshCw, Eye, EyeOff, Copy,
} from 'lucide-react'
import { setSession, isAdminUser } from '../lib/auth.js'
import * as api from '../lib/api/baskaroApi.js'

// ─── OTP Input ─────────────────────────────────────────────────────────────
function OtpInput({ value, onChange, disabled }) {
  const inputs = useRef([])

  const handleChange = (idx, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...value]
    next[idx] = val
    onChange(next)
    if (val && idx < 5) inputs.current[idx + 1]?.focus()
  }
  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) inputs.current[idx - 1]?.focus()
  }
  const handlePaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!paste) return
    const next = [...value]
    paste.split('').forEach((ch, i) => { if (i < 6) next[i] = ch })
    onChange(next)
    inputs.current[Math.min(paste.length, 5)]?.focus()
  }

  return (
    <div className="flex justify-center gap-2.5">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={el => (inputs.current[idx] = el)}
          type="text" inputMode="numeric" maxLength={1}
          value={value[idx] || ''} disabled={disabled}
          onPaste={handlePaste}
          onChange={e => handleChange(idx, e)}
          onKeyDown={e => handleKeyDown(idx, e)}
          autoFocus={idx === 0}
          className={[
            'h-13 w-11 rounded-xl border-2 text-center text-xl font-black outline-none transition-all duration-200',
            value[idx]
              ? 'border-red-500 bg-red-50 text-red-600 shadow-sm'
              : 'border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

// ─── Shared sub-components ──────────────────────────────────────────────────
function FieldLabel({ children }) {
  return <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-slate-400">{children}</label>
}
function ErrorMsg({ msg }) {
  if (!msg) return null
  return (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="text-xs font-bold text-red-500 flex items-center gap-1"
    >
      ⚠ {msg}
    </motion.p>
  )
}
function SubmitBtn({ disabled, loading, children }) {
  return (
    <button type="submit" disabled={disabled || loading}
      className={[
        'group relative flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black uppercase tracking-widest transition-all',
        !disabled && !loading
          ? 'bg-red-600 text-white shadow-lg shadow-red-200 hover:bg-red-700'
          : 'cursor-not-allowed bg-slate-100 text-slate-400',
      ].join(' ')}
    >
      {loading ? <RefreshCw size={16} className="animate-spin" /> : children}
    </button>
  )
}

function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-100" />
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">or</span>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  )
}

function SignUpButton({ onClick, label = 'Sign Up' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-blue-200 bg-blue-50 py-3.5 text-sm font-black uppercase tracking-widest text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-100"
    >
      {label}
    </button>
  )
}

function SignInPrompt({ onClick }) {
  return (
    <p className="text-center text-xs font-semibold text-slate-400">
      Already have an account?{' '}
      <button type="button" onClick={onClick}
        className="font-black text-blue-600 hover:text-blue-700 transition-colors"
      >
        Sign In
      </button>
    </p>
  )
}

// ─── Method tabs ────────────────────────────────────────────────────────────
const METHODS = [
  { id: 'phone',  Icon: Phone,  label: 'Phone'  },
  { id: 'email',  Icon: Mail,   label: 'Email'  },
  { id: 'google', Icon: null,   label: 'Google' },
]

// ─── Main LoginPage ─────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.redirectTo
  const [method, setMethod] = useState('phone') // 'phone' | 'email' | 'google'
  const [emailMode, setEmailMode] = useState('login') // 'login' | 'register'

  function switchMethod(id, opts = {}) {
    setMethod(id)
    if (id === 'email' && opts.register) setEmailMode('register')
    if (id === 'email' && opts.login) setEmailMode('login')
  }

  function onSuccess(session) {
    setSession(session)
    const user = session.user
    const target = isAdminUser(user)
      ? '/admin'
      : redirectTo && redirectTo !== '/admin'
        ? redirectTo
        : '/dashboard'
    setTimeout(() => navigate(target, { replace: true }), 1600)
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 font-['Outfit']">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -right-32 h-[520px] w-[520px] rounded-full bg-blue-100 blur-[100px]" />
        <div className="absolute -bottom-40 -left-24 h-[400px] w-[400px] rounded-full bg-red-100 blur-[90px]" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.35]" aria-hidden="true">
          <defs>
            <pattern id="login-dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#CBD5E1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-dots)" />
        </svg>
      </div>

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
          <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
          Home
        </Link>
      </div>

      {/* Top gradient bar */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-red-500 to-blue-600" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-6 sm:py-10">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5 text-center sm:mb-6">
            <Link to="/">
              <img src="/logo.png" alt="BAS karo" className="mx-auto h-14 w-auto max-w-[230px] object-contain"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }} />
              <span style={{ display: 'none' }} className="text-2xl font-black tracking-tight text-slate-900">
                BAS<span className="text-red-600">karo</span>
              </span>
            </Link>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              India's Trusted Phone Marketplace
            </p>
          </motion.div>

          {/* Card */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
          >
            {/* Card top line */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-red-500 to-blue-500" />

            {/* Method selector tabs */}
            <div className="flex border-b border-slate-100">
              {METHODS.map(({ id, Icon, label }) => (
                <button key={id} type="button" onClick={() => switchMethod(id, { login: true })}
                  className={[
                    'flex flex-1 flex-col items-center gap-1 py-3.5 text-[11px] font-black uppercase tracking-wider transition-all',
                    method === id
                      ? 'border-b-2 border-red-500 text-red-600'
                      : 'text-slate-400 hover:text-slate-600',
                  ].join(' ')}
                >
                  {id === 'google'
                    ? <GoogleIcon size={18} active={method === id} />
                    : <Icon size={18} />
                  }
                  {label}
                </button>
              ))}
            </div>

            {/* Form content */}
            <div className="p-7">
              <AnimatePresence mode="wait">
                {method === 'phone'  && (
                  <PhoneFlow
                    key="phone"
                    onSuccess={onSuccess}
                  />
                )}
                {method === 'email'  && (
                  <EmailFlow
                    key={`email-${emailMode}`}
                    initialMode={emailMode}
                    onSuccess={onSuccess}
                  />
                )}
                {method === 'google' && (
                  <GoogleFlow
                    key="google"
                    onSignUpEmail={() => switchMethod('email', { register: true })}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Trust strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-5 flex justify-center gap-4 sm:mt-6 sm:gap-6"
          >
            {[['🔒','Secure Login'],['✅','1 Cr+ Users'],['⚡','Instant OTP']].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-base leading-none">{icon}</span>
                <span className="text-[11px] font-bold text-slate-400">{label}</span>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </div>
  )
}

// ─── Dev OTP hint: compact strip when API returns `otp` (local/demo). Does not block the form. ───
function DevOtpHint({ code, onAutofill }) {
  const [copied, setCopied] = useState(false)
  if (!code) return null
  function copy() {
    navigator.clipboard?.writeText(String(code)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Dev — code not sent by SMS
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xl font-black tracking-[0.2em] text-slate-900">{code}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100"
        >
          <Copy size={12} /> {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={onAutofill}
          className="text-[11px] font-black uppercase tracking-wide text-red-600 hover:text-red-700"
        >
          Autofill
        </button>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">Enter the code below, or use Autofill.</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PHONE FLOW  (2-step OTP)
// ─────────────────────────────────────────────────────────────────────────────
function PhoneFlow({ onSuccess }) {
  const [authMode, setAuthMode] = useState('login') // 'login' | 'register'
  const [step, setStep] = useState('phone') // 'phone' | 'otp' | 'success'
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(0)
  const [devOtpCode, setDevOtpCode] = useState('')
  const timerRef = useRef(null)

  function startSignUp() {
    setAuthMode('register')
    setStep('phone')
    setError('')
    setDevOtpCode('')
    setOtp(Array(6).fill(''))
  }

  function startSignIn() {
    setAuthMode('login')
    setStep('phone')
    setError('')
    setDevOtpCode('')
    setOtp(Array(6).fill(''))
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  function startTimer() {
    setTimer(30)
    timerRef.current = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0 } return t - 1 }), 1000)
  }

  function applyOtpCode(code) {
    const digits = String(code).replace(/\D/g, '').slice(0, 6).split('')
    const next = Array(6).fill('')
    digits.forEach((d, i) => { if (i < 6) next[i] = d })
    setOtp(next)
  }

  async function sendOtpRequest({ register = false } = {}) {
    const digits = phone.replace(/\D/g, '')
    const res = register
      ? await api.registerPhone({ name: name.trim(), phone: digits })
      : await api.requestOtp({ phone: digits })
    if (res.error) return { error: res.error }
    if (res.otp) setDevOtpCode(String(res.otp))
    return {}
  }

  async function sendOtp(e) {
    e.preventDefault(); setError('')
    if (authMode === 'register' && !name.trim()) { setError('Please enter your name.'); return }
    if (phone.replace(/\D/g, '').length !== 10) { setError('Enter a valid 10-digit number.'); return }
    setLoading(true)
    try {
      const err = (await sendOtpRequest({ register: authMode === 'register' })).error
      if (err) { setError(err); setLoading(false); return }
      setLoading(false); setStep('otp'); startTimer()
    } catch (err) {
      setError(err.message || 'Could not send OTP.')
      setLoading(false)
    }
  }

  async function resendOtp() {
    setError('')
    setLoading(true)
    try {
      const err = (await sendOtpRequest()).error
      if (err) { setError(err); setLoading(false); return }
      setLoading(false)
      setOtp(Array(6).fill(''))
      startTimer()
    } catch (err) {
      setError(err.message || 'Could not resend OTP.')
      setLoading(false)
    }
  }

  async function verifyOtp(e) {
    e.preventDefault(); setError('')
    const code = otp.join('')
    if (code.length !== 6) { setError('Enter the full 6-digit OTP.'); return }
    setLoading(true)
    try {
      const digits = phone.replace(/\D/g, '')
      const res = await api.verifyOtp({ phone: digits, otp: code })
      if (res.error) { setError(res.error); setLoading(false); return }
      setLoading(false)
      setStep('success')
      onSuccess({ token: res.token, user: res.user })
    } catch (err) {
      const detail = err.body?.error || err.message || 'Verification failed.'
      setError(typeof detail === 'string' ? detail : 'Verification failed.')
      setLoading(false)
    }
  }

  return (
    <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>

      {step === 'phone' && (
        <>
          <div className="mb-1 flex items-center gap-2">
            <Phone size={16} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
              {authMode === 'register' ? 'Sign up' : 'Sign in'} · Step 1 of 2
            </span>
          </div>
          <h1 className="mt-1.5 text-xl font-black text-slate-900">
            {authMode === 'register' ? 'Create your account' : 'Enter your mobile number'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {authMode === 'register'
              ? 'Register with your mobile — we’ll send a 6-digit OTP to verify you.'
              : 'We\'ll send a 6-digit OTP to verify you.'}
          </p>
          <form onSubmit={sendOtp} className="mt-6 space-y-4">
            {authMode === 'register' && (
              <div>
                <FieldLabel>Full Name</FieldLabel>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  autoFocus
                  onChange={e => { setName(e.target.value); setError('') }}
                  className="h-11 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            )}
            <div>
              <FieldLabel>Mobile Number</FieldLabel>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-sm">
                <span className="text-sm font-black text-slate-500">+91</span>
                <div className="h-5 w-px bg-slate-300" />
                <input type="tel" inputMode="numeric" maxLength={10} placeholder="9876543210"
                  value={phone}
                  autoFocus={authMode === 'login'}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError('') }}
                  className="flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
                />
                {phone.length === 10 && <CheckCircle size={15} className="text-green-500 shrink-0" />}
              </div>
            </div>
            <ErrorMsg msg={error} />
            <SubmitBtn
              disabled={phone.length < 10 || (authMode === 'register' && !name.trim())}
              loading={loading}
            >
              {authMode === 'register' ? (
                <>Sign Up &amp; Get OTP <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></>
              ) : (
                <>Get OTP <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></>
              )}
            </SubmitBtn>
          </form>

          {authMode === 'login' ? (
            <div className="mt-5 space-y-3">
              <AuthDivider />
              <SignUpButton onClick={startSignUp} label="Sign Up" />
            </div>
          ) : (
            <div className="mt-5">
              <SignInPrompt onClick={startSignIn} />
            </div>
          )}

          <p className="mt-5 text-center text-[11px] text-slate-400">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">Terms</a>
            {' '}&amp;{' '}
            <a href="#" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">Privacy Policy</a>.
          </p>
        </>
      )}

      {step === 'otp' && (
        <>
          <button onClick={() => { setStep('phone'); setOtp(Array(6).fill('')); setError(''); setDevOtpCode('') }}
            className="mb-4 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={13} /> Change number
          </button>
          <div className="mb-1 flex items-center gap-2">
            <Shield size={16} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Step 2 of 2</span>
          </div>
          <h2 className="mt-1.5 text-xl font-black text-slate-900">Verify OTP</h2>
          <p className="mt-1 text-sm text-slate-500">Sent to <span className="font-bold text-slate-800">+91 {phone}</span></p>
          {devOtpCode && (
            <div className="mt-4">
              <DevOtpHint code={devOtpCode} onAutofill={() => applyOtpCode(devOtpCode)} />
            </div>
          )}
          <form onSubmit={verifyOtp} className="mt-6 space-y-5">
            <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            <ErrorMsg msg={error} />
            <SubmitBtn disabled={otp.join('').length < 6} loading={loading}>
              {authMode === 'register' ? (
                <>Verify &amp; Create Account <ArrowRight size={14} /></>
              ) : (
                <>Verify &amp; Login <ArrowRight size={14} /></>
              )}
            </SubmitBtn>
            <div className="text-center">
              {timer > 0
                ? <p className="text-xs text-slate-400">Resend OTP in <span className="font-black text-slate-700">{timer}s</span></p>
                : <button type="button" disabled={loading} onClick={resendOtp}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                  >Didn&apos;t receive it? Resend OTP</button>
              }
            </div>
          </form>
        </>
      )}

      {step === 'success' && <SuccessState />}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL FLOW  (email + password, with forgot-pw)
// ─────────────────────────────────────────────────────────────────────────────
function EmailFlow({ onSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode) // 'login' | 'register' | 'forgot' | 'success'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault(); setError('')
    if (!email.includes('@')) { setError('Enter a valid email address.'); return }
    if (mode !== 'forgot' && password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (mode === 'register' && !name.trim()) { setError('Please enter your name.'); return }
    if (mode === 'register') {
      const digits = phone.replace(/\D/g, '')
      if (digits.length !== 10) { setError('Enter a valid 10-digit phone number.'); return }
    }
    if (mode === 'forgot') {
      setLoading(true)
      setTimeout(() => { setLoading(false); setMode('success') }, 600)
      return
    }
    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await api.registerEmail({ name, email, phone: phone.replace(/\D/g, ''), password })
        if (res.error) { setError(res.error); setLoading(false); return }
        setLoading(false)
        onSuccess({ token: res.token, user: res.user })
        return
      }
      const res = await api.loginEmail({ email, password })
      if (res.error) { setError(res.error); setLoading(false); return }
      setLoading(false)
      onSuccess({ token: res.token, user: res.user })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setLoading(false)
    }
  }

  if (mode === 'success') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-4 ring-blue-100">
          <Mail size={26} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-black text-slate-900">Reset link sent!</h3>
        <p className="mt-1.5 text-sm text-slate-500">Check <span className="font-bold">{email}</span> for a password reset link.</p>
        <button onClick={() => setMode('login')} className="mt-5 text-sm font-bold text-blue-600 hover:text-blue-700">Back to Login</button>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
      <div className="mb-1 flex items-center gap-2">
        <Mail size={16} className="text-blue-600" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
          {mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Reset password'}
        </span>
      </div>
      <h1 className="mt-1.5 text-xl font-black text-slate-900">
        {mode === 'login' ? 'Welcome back!' : mode === 'register' ? 'Create an account' : 'Forgot password?'}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {mode === 'forgot' ? "We'll email you a reset link." : 'Use your email to continue.'}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3.5">
        {mode === 'register' && (
          <div>
            <FieldLabel>Full Name</FieldLabel>
            <input type="text" placeholder="Your name" value={name} autoFocus
              onChange={e => { setName(e.target.value); setError('') }}
              className="h-11 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        )}
        {mode === 'register' && (
          <div>
            <FieldLabel>Phone Number</FieldLabel>
            <div className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
              <span className="text-sm font-black text-slate-500">+91</span>
              <div className="h-5 w-px bg-slate-300" />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError('') }}
                className="h-11 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300"
              />
            </div>
          </div>
        )}

        <div>
          <FieldLabel>Email Address</FieldLabel>
          <input type="email" placeholder="you@email.com" value={email}
            autoFocus={mode === 'login'}
            onChange={e => { setEmail(e.target.value); setError('') }}
            className="h-11 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {mode !== 'forgot' && (
          <div>
            <FieldLabel>Password</FieldLabel>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                className="h-11 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 pr-10 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <div className="flex justify-end">
            <button type="button" onClick={() => { setMode('forgot'); setError('') }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        )}

        <ErrorMsg msg={error} />

        <SubmitBtn disabled={!email} loading={loading}>
          {mode === 'login' ? <>Sign In <ArrowRight size={14} /></>
            : mode === 'register' ? <>Register <ArrowRight size={14} /></>
            : <>Send Reset Link <ArrowRight size={14} /></>
          }
        </SubmitBtn>
      </form>

      {mode === 'login' && (
        <div className="mt-5 space-y-3">
          <AuthDivider />
          <SignUpButton onClick={() => { setMode('register'); setError('') }} label="Sign Up" />
        </div>
      )}
      {mode === 'register' && (
        <div className="mt-5">
          <SignInPrompt onClick={() => { setMode('login'); setError('') }} />
        </div>
      )}
      {mode === 'forgot' && (
        <button type="button" onClick={() => { setMode('login'); setError('') }}
          className="mt-5 flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={13} /> Back to sign in
        </button>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE FLOW
// ─────────────────────────────────────────────────────────────────────────────
function GoogleFlow({ onSignUpEmail }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleGoogle(signUp = false) {
    setLoading(true)
    setError('')
    setTimeout(() => {
      setLoading(false)
      setError(
        signUp
          ? 'Google sign-up is not configured yet. Use Phone or Email to register.'
          : 'Google sign-in is not configured for this backend. Use phone or email.',
      )
    }, 400)
  }

  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
      <div className="flex flex-col items-center py-4">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 shadow-sm">
              <GoogleIcon size={36} active />
            </div>
            <h2 className="text-xl font-black text-slate-900">Continue with Google</h2>
            <p className="mt-1.5 text-center text-sm text-slate-500">
              Sign in or register instantly with your Google account. No password needed.
            </p>

            <button type="button" onClick={() => handleGoogle(false)} disabled={loading}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <RefreshCw size={16} className="animate-spin text-slate-500" />
                : <><GoogleIcon size={20} active /> Sign in with Google</>
              }
            </button>
            {error && <p className="mt-4 text-center text-xs font-bold text-red-500">{error}</p>}

            <div className="mt-5 w-full space-y-3">
              <AuthDivider />
              <SignUpButton onClick={() => handleGoogle(true)} label="Sign Up with Google" />
              <button
                type="button"
                onClick={onSignUpEmail}
                className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Or register with Email
              </button>
            </div>

            <div className="mt-6 flex w-full items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs font-bold text-slate-400">OR USE ANOTHER METHOD</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              Switch to the <span className="font-bold text-blue-600">Phone</span> or <span className="font-bold text-blue-600">Email</span> tab above.
            </p>
          </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Success state
// ─────────────────────────────────────────────────────────────────────────────
function SuccessState() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-5 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full bg-green-50 ring-4 ring-green-100"
      >
        <CheckCircle size={40} className="text-green-500" />
      </motion.div>
      <h2 className="text-xl font-black text-slate-900">Welcome back!</h2>
      <p className="mt-1.5 text-sm text-slate-500">Verified. Redirecting to your dashboard…</p>
      <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.6, ease: 'linear' }}
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-red-500"
        />
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Google SVG icon
// ─────────────────────────────────────────────────────────────────────────────
function GoogleIcon({ size = 20, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill={active ? '#4285F4' : '#94a3b8'} d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
      <path fill={active ? '#34A853' : '#94a3b8'} d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
      <path fill={active ? '#FBBC05' : '#94a3b8'} d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
      <path fill={active ? '#EA4335' : '#94a3b8'} d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
    </svg>
  )
}
