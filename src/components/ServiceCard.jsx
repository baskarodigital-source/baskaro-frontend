import React from 'react'
import { useNavigate } from 'react-router-dom'

export function ServiceCard({ label, path, thumbUrl }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(path)}
      className="group flex flex-col items-center justify-start transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[2.5rem] bg-red-100 shadow-sm ring-1 ring-red-200 transition-all duration-300 group-hover:bg-red-600 group-hover:shadow-lg group-hover:ring-red-600">
        <img
          src={thumbUrl}
          alt={label}
          aria-hidden="true"
          loading="lazy"
          className="h-2/3 w-2/3 object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <span className="mt-3 text-center text-xs font-bold uppercase tracking-tight text-slate-600 transition-colors duration-300 group-hover:text-red-600 sm:text-[13px]">
        {label}
      </span>
    </button>
  )
}
