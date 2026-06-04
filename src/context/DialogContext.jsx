import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, HelpCircle, Info, X } from 'lucide-react'
import { registerAppDialog } from '../lib/appDialog.js'

const DialogContext = createContext(null)

const VARIANT_META = {
  info: { Icon: Info, iconClass: 'text-blue-600 bg-blue-50' },
  success: { Icon: CheckCircle2, iconClass: 'text-emerald-600 bg-emerald-50' },
  warning: { Icon: AlertCircle, iconClass: 'text-amber-600 bg-amber-50' },
  error: { Icon: AlertCircle, iconClass: 'text-red-600 bg-red-50' },
}

function AppDialogModal({ dialog, onClose }) {
  if (!dialog) return null

  const isConfirm = dialog.type === 'confirm'
  const variant = dialog.variant || (isConfirm ? 'warning' : 'info')
  const meta = VARIANT_META[variant] || VARIANT_META.info
  const Icon = isConfirm ? HelpCircle : meta.Icon

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="dialog-backdrop"
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-['Outfit']"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="presentation"
      >
        <button
          type="button"
          className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
          aria-label="Close dialog"
          onClick={() => (isConfirm ? onClose(false) : onClose(true))}
        />
        <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="app-dialog-title"
          aria-describedby="app-dialog-message"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4 p-6 pb-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.iconClass}`}
            >
              <Icon size={24} strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 id="app-dialog-title" className="text-lg font-black text-slate-900">
                {dialog.title || (isConfirm ? 'Please confirm' : 'Notice')}
              </h2>
              <p id="app-dialog-message" className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                {dialog.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => (isConfirm ? onClose(false) : onClose(true))}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:flex-row sm:justify-end">
            {isConfirm ? (
              <>
                <button
                  type="button"
                  onClick={() => onClose(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {dialog.cancelLabel || 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => onClose(true)}
                  className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] ${
                    dialog.destructive
                      ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                      : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                  }`}
                >
                  {dialog.confirmLabel || 'Confirm'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onClose(true)}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-bold text-white shadow-sm shadow-red-500/20 transition hover:bg-red-700 active:scale-[0.98] sm:w-auto"
              >
                {dialog.confirmLabel || 'OK'}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  const resolverRef = useRef(null)

  const settle = useCallback((result) => {
    const resolve = resolverRef.current
    resolverRef.current = null
    setDialog(null)
    if (resolve) resolve(result)
  }, [])

  const alert = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setDialog({
        type: 'alert',
        message,
        title: options.title,
        variant: options.variant || 'info',
        confirmLabel: options.confirmLabel,
      })
    })
  }, [])

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setDialog({
        type: 'confirm',
        message,
        title: options.title,
        variant: options.variant || 'warning',
        confirmLabel: options.confirmLabel,
        cancelLabel: options.cancelLabel,
        destructive: options.destructive ?? false,
      })
    })
  }, [])

  useEffect(() => {
    registerAppDialog({ alert, confirm })
    return () => registerAppDialog(null)
  }, [alert, confirm])

  useEffect(() => {
    if (!dialog) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        settle(dialog.type === 'confirm' ? false : true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dialog, settle])

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      <AppDialogModal
        dialog={dialog}
        onClose={(result) => settle(dialog?.type === 'confirm' ? result : true)}
      />
    </DialogContext.Provider>
  )
}

export function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialog must be used within DialogProvider')
  return ctx
}
