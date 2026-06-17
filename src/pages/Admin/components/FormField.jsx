import React from 'react'

export default function FormField({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  className = '',
  children,
}) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-slate-700">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      {hint && !error ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}
