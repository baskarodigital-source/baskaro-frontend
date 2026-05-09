import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const WishlistContext = createContext()
const STORAGE_KEY = 'baskaro_wishlist'

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist))
  }, [wishlist])

  const addToWishlist = (product) => {
    if (product?.id == null || product.id === '') return
    const normalized = {
      ...product,
      id: String(product.id),
      name: product.name ?? product.title ?? 'Product',
      img: product.img ?? product.image ?? '',
      price: product.price != null ? String(product.price) : '',
    }
    setWishlist((prev) => {
      const exists = prev.some((item) => String(item.id) === normalized.id)
      if (exists) return prev
      return [...prev, normalized]
    })
  }

  const removeFromWishlist = (productId) => {
    const key = String(productId)
    setWishlist((prev) => prev.filter((item) => String(item.id) !== key))
  }

  const isWishlisted = (productId) =>
    wishlist.some((item) => String(item.id) === String(productId))

  const toggleWishlist = (product) => {
    if (product?.id == null || product.id === '') return
    const normalized = {
      ...product,
      id: String(product.id),
      name: product.name ?? product.title ?? 'Product',
      img: product.img ?? product.image ?? '',
      price: product.price != null ? String(product.price) : '',
    }
    setWishlist((prev) => {
      const exists = prev.some((item) => String(item.id) === normalized.id)
      if (exists) return prev.filter((item) => String(item.id) !== normalized.id)
      return [...prev, normalized]
    })
  }

  const clearWishlist = () => setWishlist([])

  const value = useMemo(
    () => ({
      wishlist,
      wishlistCount: wishlist.length,
      addToWishlist,
      removeFromWishlist,
      isWishlisted,
      toggleWishlist,
      clearWishlist,
    }),
    [wishlist],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
