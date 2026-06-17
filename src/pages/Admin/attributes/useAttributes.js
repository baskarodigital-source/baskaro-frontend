import { useCallback, useEffect, useState } from 'react'
import {
  deleteAttribute,
  getAttributes,
  patchAttribute,
  postAttribute,
} from '../../../lib/api/baskaroApi.js'

function asArray(payload) {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.items)) return payload.items
    if (Array.isArray(payload.data)) return payload.data
  }
  return []
}

function getId(row) {
  return row?._id || row?.id || ''
}

/**
 * Attribute admin hook:
 * - Loads attributes (`GET /api/attributes`)
 * - Optional filter by `categoryId`
 * - Exposes CRUD helpers with automatic refetch
 */
export function useAttributes({ includeInactive = true, categoryId = '' } = {}) {
  const [attributes, setAttributes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const loadAttributes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        includeInactive: includeInactive ? 'true' : 'false',
      }
      if (categoryId) params.categoryId = String(categoryId).trim()

      const data = await getAttributes(params)
      const list = asArray(data)
      setAttributes(list)
      return list
    } catch (e) {
      setAttributes([])
      setError(e)
      throw e
    } finally {
      setLoading(false)
    }
  }, [categoryId, includeInactive])

  const createAttribute = useCallback(
    async (payload) => {
      setSaving(true)
      setError(null)
      const optimisticId = `tmp-attr-${Date.now()}`
      const optimisticRow = {
        _id: optimisticId,
        ...payload,
      }
      setAttributes((prev) => [optimisticRow, ...prev])
      try {
        const created = await postAttribute(payload || {})
        setAttributes((prev) => prev.map((item) => (getId(item) === optimisticId ? created : item)))
        loadAttributes().catch(() => {})
        return created
      } catch (e) {
        setAttributes((prev) => prev.filter((item) => getId(item) !== optimisticId))
        setError(e)
        throw e
      } finally {
        setSaving(false)
      }
    },
    [loadAttributes],
  )

  const updateAttribute = useCallback(
    async (id, payload) => {
      setSaving(true)
      setError(null)
      let previous = null
      setAttributes((prev) =>
        prev.map((item) => {
          if (String(getId(item)) !== String(id)) return item
          previous = item
          return { ...item, ...payload }
        }),
      )
      try {
        const updated = await patchAttribute(id, payload || {})
        setAttributes((prev) =>
          prev.map((item) => (String(getId(item)) === String(id) ? updated : item)),
        )
        loadAttributes().catch(() => {})
        return updated
      } catch (e) {
        if (previous) {
          setAttributes((prev) =>
            prev.map((item) => (String(getId(item)) === String(id) ? previous : item)),
          )
        }
        setError(e)
        throw e
      } finally {
        setSaving(false)
      }
    },
    [loadAttributes],
  )

  const removeAttribute = useCallback(
    async (id) => {
      setSaving(true)
      setError(null)
      let removed = null
      setAttributes((prev) => {
        removed = prev.find((item) => String(getId(item)) === String(id)) || null
        return prev.filter((item) => String(getId(item)) !== String(id))
      })
      try {
        const result = await deleteAttribute(id)
        loadAttributes().catch(() => {})
        return result
      } catch (e) {
        if (removed) setAttributes((prev) => [removed, ...prev])
        setError(e)
        throw e
      } finally {
        setSaving(false)
      }
    },
    [loadAttributes],
  )

  useEffect(() => {
    loadAttributes().catch(() => {})
  }, [loadAttributes])

  return {
    attributes,
    loading,
    saving,
    error,
    refetch: loadAttributes,
    createAttribute,
    updateAttribute,
    removeAttribute,
  }
}
