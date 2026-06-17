import { useCallback, useEffect, useState } from 'react'
import {
  deleteProduct,
  getProductById,
  getProducts,
  patchProduct,
  postProduct,
} from '../../../lib/api/baskaroApi.js'

function normalizeProductListResponse(payload) {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: {
        total: payload.length,
        page: 1,
        limit: payload.length || 1,
        totalPages: 1,
        hasMore: false,
      },
    }
  }

  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.items)) {
      return {
        items: payload.items,
        pagination: payload.pagination || {
          total: payload.items.length,
          page: 1,
          limit: payload.items.length || 1,
          totalPages: 1,
          hasMore: false,
        },
      }
    }
    if (Array.isArray(payload.data)) {
      return {
        items: payload.data,
        pagination: payload.pagination || {
          total: payload.data.length,
          page: 1,
          limit: payload.data.length || 1,
          totalPages: 1,
          hasMore: false,
        },
      }
    }
  }

  return {
    items: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      hasMore: false,
    },
  }
}

function getId(row) {
  return row?._id || row?.id || ''
}

/**
 * Product admin hook:
 * - Loads product list (`GET /api/products`) with paging/filter/search.
 * - Exposes CRUD helpers and per-product fetch.
 */
export function useProducts({
  page = 1,
  limit = 20,
  categoryId = '',
  q = '',
  includeInactive = true,
} = {}) {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    totalPages: 0,
    hasMore: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        page: String(page),
        limit: String(limit),
        includeInactive: includeInactive ? 'true' : 'false',
      }
      if (categoryId) params.categoryId = String(categoryId).trim()
      if (q) params.q = String(q).trim()

      const data = await getProducts(params)
      const normalized = normalizeProductListResponse(data)
      setProducts(normalized.items)
      setPagination(normalized.pagination)
      return normalized
    } catch (e) {
      setProducts([])
      setPagination({
        total: 0,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        totalPages: 0,
        hasMore: false,
      })
      setError(e)
      throw e
    } finally {
      setLoading(false)
    }
  }, [categoryId, includeInactive, limit, page, q])

  const getOneProduct = useCallback(async (id) => {
    setError(null)
    try {
      return await getProductById(id)
    } catch (e) {
      setError(e)
      throw e
    }
  }, [])

  const createProduct = useCallback(
    async (payload) => {
      setSaving(true)
      setError(null)
      const optimisticId = `tmp-product-${Date.now()}`
      const optimisticRow = { _id: optimisticId, ...payload }
      setProducts((prev) => [optimisticRow, ...prev])
      setPagination((prev) => ({ ...prev, total: (prev.total || 0) + 1 }))
      try {
        const created = await postProduct(payload || {})
        setProducts((prev) => prev.map((item) => (getId(item) === optimisticId ? created : item)))
        loadProducts().catch(() => {})
        return created
      } catch (e) {
        setProducts((prev) => prev.filter((item) => getId(item) !== optimisticId))
        setPagination((prev) => ({ ...prev, total: Math.max(0, (prev.total || 0) - 1) }))
        setError(e)
        throw e
      } finally {
        setSaving(false)
      }
    },
    [loadProducts],
  )

  const updateProduct = useCallback(
    async (id, payload) => {
      setSaving(true)
      setError(null)
      let previous = null
      setProducts((prev) =>
        prev.map((item) => {
          if (String(getId(item)) !== String(id)) return item
          previous = item
          return { ...item, ...payload }
        }),
      )
      try {
        const updated = await patchProduct(id, payload || {})
        setProducts((prev) =>
          prev.map((item) => (String(getId(item)) === String(id) ? updated : item)),
        )
        loadProducts().catch(() => {})
        return updated
      } catch (e) {
        if (previous) {
          setProducts((prev) =>
            prev.map((item) => (String(getId(item)) === String(id) ? previous : item)),
          )
        }
        setError(e)
        throw e
      } finally {
        setSaving(false)
      }
    },
    [loadProducts],
  )

  const removeProduct = useCallback(
    async (id) => {
      setSaving(true)
      setError(null)
      let removed = null
      setProducts((prev) => {
        removed = prev.find((item) => String(getId(item)) === String(id)) || null
        return prev.filter((item) => String(getId(item)) !== String(id))
      })
      setPagination((prev) => ({ ...prev, total: Math.max(0, (prev.total || 0) - 1) }))
      try {
        const result = await deleteProduct(id)
        loadProducts().catch(() => {})
        return result
      } catch (e) {
        if (removed) {
          setProducts((prev) => [removed, ...prev])
          setPagination((prev) => ({ ...prev, total: (prev.total || 0) + 1 }))
        }
        setError(e)
        throw e
      } finally {
        setSaving(false)
      }
    },
    [loadProducts],
  )

  useEffect(() => {
    loadProducts().catch(() => {})
  }, [loadProducts])

  return {
    products,
    pagination,
    loading,
    saving,
    error,
    refetch: loadProducts,
    getOneProduct,
    createProduct,
    updateProduct,
    removeProduct,
  }
}
