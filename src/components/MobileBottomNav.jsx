import { useLocation, Link } from 'react-router-dom'
import { Heart, Home, HandCoins, ShoppingCart, Store } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

function isActive(pathname, key) {
  switch (key) {
    case 'home':
      return pathname === '/' || pathname === '/home'
    case 'sell':
      return pathname.startsWith('/sell/')
    case 'marketplace':
      return pathname === '/marketplace' || pathname.startsWith('/marketplace')
    case 'wishlist':
      return pathname.startsWith('/wishlist')
    case 'cart':
      return pathname.startsWith('/cart')
    default:
      return false
  }
}

export function MobileBottomNav() {
  const { pathname } = useLocation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  const items = [
    { key: 'home', label: 'Home', to: '/', Icon: Home },
    { key: 'sell', label: 'Sell', to: '/sell/phone', Icon: HandCoins },
    { key: 'marketplace', label: 'Market', to: '/marketplace', Icon: Store },
    { key: 'wishlist', label: 'Wishlist', to: '/wishlist', Icon: Heart, count: wishlistCount },
    { key: 'cart', label: 'Cart', to: '/cart', Icon: ShoppingCart, count: cartCount },
  ]

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-[40] border-t border-slate-200 bg-white/85 backdrop-blur-md sm:hidden">
      <nav className="flex h-[86px] items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = isActive(pathname, item.key)
          const Icon = item.Icon
          const count = item.count ?? 0

          return (
            <Link
              key={item.key}
              to={item.to}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-[48px] w-[72px] flex-col items-center justify-center gap-1 rounded-2xl outline-none transition ${
                active ? 'text-rose-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="relative flex h-[26px] w-[26px] items-center justify-center">
                <Icon strokeWidth={active ? 2.4 : 2.2} className="h-[24px] w-[24px]" />
                {count > 0 ? (
                  <span className="absolute -right-2 -top-3 min-w-[16px] rounded-full bg-slate-900 px-1 py-0.5 text-[9px] font-black leading-[1] text-white ring-2 ring-white">
                    {count > 99 ? '99+' : count}
                  </span>
                ) : null}
              </span>
              <span className="text-[11px] font-extrabold tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

