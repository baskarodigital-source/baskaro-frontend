import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { isLoggedIn } from '../lib/auth.js'
import {
  addCartItem as apiAddCartItem,
  getServerCart,
  removeCartItem as apiRemoveCartItem,
} from '../lib/api/baskaroApi.js'

const CartContext = createContext()

function mapServerItems(items) {
  return (items || []).map((item) => ({
    id: item.inventoryId || item.id,
    inventoryId: item.inventoryId || item.id,
    name: item.title || item.name,
    title: item.title || item.name,
    price: String(item.unitPriceInr ?? item.price ?? ''),
    unitPriceInr: item.unitPriceInr,
    img: item.imageUrl || item.img,
    imageUrl: item.imageUrl || item.img,
    conditionGrade: item.conditionGrade,
    quantity: item.quantity || 1,
    reservedUntil: item.reservedUntil,
  }))
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [syncing, setSyncing] = useState(false)

  const refreshFromServer = useCallback(async () => {
    if (!isLoggedIn()) {
      setCart([])
      return
    }
    setSyncing(true)
    try {
      const data = await getServerCart()
      setCart(mapServerItems(data?.items))
    } catch {
      /* keep current cart on transient errors */
    } finally {
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    refreshFromServer()
  }, [refreshFromServer])

  const addToCart = useCallback(async (product) => {
    const inventoryId = product.inventoryId || product.id
    if (!inventoryId) return { error: 'Missing inventory id' }

    if (!isLoggedIn()) {
      return { error: 'LOGIN_REQUIRED' }
    }

    try {
      const data = await apiAddCartItem(inventoryId)
      setCart(mapServerItems(data?.items))
      return { ok: true }
    } catch (err) {
      return { error: err?.message || 'Could not add to cart' }
    }
  }, [])

  const removeFromCart = useCallback(async (productId) => {
    if (!isLoggedIn()) {
      setCart((prev) => prev.filter((item) => item.id !== productId))
      return
    }

    try {
      const data = await apiRemoveCartItem(productId)
      setCart(mapServerItems(data?.items))
    } catch {
      setCart((prev) => prev.filter((item) => item.id !== productId))
    }
  }, [])

  const updateQuantity = useCallback((_productId, _quantity) => {
    /* Pre-owned units are unique — quantity is always 1 */
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const cartTotal = cart.reduce(
    (sum, item) => sum + (Number(item.unitPriceInr ?? String(item.price).replace(/,/g, '')) || 0) * (item.quantity || 1),
    0,
  )
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshFromServer,
        syncing,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
