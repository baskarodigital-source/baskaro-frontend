import React from 'react'

/**
 * @param {{ discount?: number | string }} props
 */
export function DiscountBadge({ discount }) {
  if (discount == null || discount === '') return null

  const label =
    typeof discount === 'number'
      ? `${discount}% OFF`
      : String(discount).includes('%')
        ? String(discount)
        : `${discount} OFF`

  return (
    <div className="absolute left-0 top-0 z-10">
      <span className="bg-red-600 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white">
        {label}
      </span>
    </div>
  )
}

