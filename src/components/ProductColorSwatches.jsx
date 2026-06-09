import React from 'react'

/**
 * Color switcher swatches for product detail pages.
 * Click swatch → parent updates selected color + product image.
 */
export default function ProductColorSwatches({ colors = [], selectedId, onSelect, className = '' }) {
  if (!colors.length) return null

  const activeId = selectedId != null ? String(selectedId) : String(colors[0]?.id ?? '')

  return (
    <div className={className}>
      <p className="text-[15px] font-black uppercase tracking-tight text-slate-900">
        Color:{' '}
        <span className="font-extrabold normal-case text-slate-700">
          {colors.find((c) => String(c.id) === activeId)?.name || colors[0]?.name}
        </span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {colors.map((color) => {
          const isActive = String(color.id) === activeId
          return (
            <button
              key={color.id}
              type="button"
              title={color.name}
              aria-label={color.name}
              aria-pressed={isActive}
              onClick={() => onSelect?.(color)}
              style={{ backgroundColor: color.hex }}
              className={[
                'h-8 w-8 min-h-[32px] min-w-[32px] rounded-full border-2 cursor-pointer transition-all duration-200',
                isActive
                  ? 'border-[#e94560] scale-110 shadow-sm ring-2 ring-[#e94560]/30'
                  : 'border-transparent hover:scale-105 hover:border-slate-300',
              ].join(' ')}
            />
          )
        })}
      </div>
    </div>
  )
}
