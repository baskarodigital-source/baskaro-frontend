import { useCallback, useEffect, useRef, useState } from 'react'
import { deleteCategory, getCategories, patchCategory, postCategory } from '../../../lib/api/baskaroApi.js'

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

function removeFromTree(nodes = [], id) {
  const out = []
  for (const node of nodes) {
    if (String(getId(node)) === String(id)) continue
    const children = Array.isArray(node.children) ? removeFromTree(node.children, id) : []
    out.push({ ...node, children })
  }
  return out
}

function updateInTree(nodes = [], id, patch = {}) {
  return nodes.map((node) => {
    if (String(getId(node)) === String(id)) return { ...node, ...patch }
    if (!Array.isArray(node.children) || node.children.length === 0) return node
    return { ...node, children: updateInTree(node.children, id, patch) }
  })
}

function insertIntoTree(nodes = [], parentId, item) {
  if (!parentId) return [item, ...nodes]
  return nodes.map((node) => {
    if (String(getId(node)) === String(parentId)) {
      return {
        ...node,
        children: [item, ...(Array.isArray(node.children) ? node.children : [])],
      }
    }
    if (!Array.isArray(node.children) || node.children.length === 0) return node
    return { ...node, children: insertIntoTree(node.children, parentId, item) }
  })
}

/**
 * Category admin hook:
 * - Loads full tree (`GET /api/categories?tree=true`)
 * - Exposes CRUD helpers with automatic refetch
 */
export function useCategories({ includeInactive = true } = {}) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const loadSeqRef = useRef(0)

  const loadCategories = useCallback(async () => {
    const seq = ++loadSeqRef.current
    setLoading(true)
    setError(null)
    try {
      const data = await getCategories({
        tree: 'true',
        includeInactive: includeInactive ? 'true' : 'false',
      })
      const list = asArray(data)
      if (seq !== loadSeqRef.current) return list
      setCategories(list)
      return list
    } catch (e) {
      if (seq === loadSeqRef.current) {
        setCategories([])
        setError(e)
      }
      throw e
    } finally {
      if (seq === loadSeqRef.current) setLoading(false)
    }
  }, [includeInactive])

  const createCategory = useCallback(
    async (payload) => {
      setSaving(true)
      setError(null)
      const optimisticId = `tmp-cat-${Date.now()}`
      const optimisticRow = {
        _id: optimisticId,
        name: payload?.name || 'Untitled',
        slug: payload?.slug || '',
        parent: payload?.parent || null,
        children: [],
        isActive: payload?.isActive !== false,
      }
      setCategories((prev) => insertIntoTree(prev, optimisticRow.parent, optimisticRow))
      try {
        const created = await postCategory(payload || {})
        setCategories((prev) => {
          const withoutTemp = removeFromTree(prev, optimisticId)
          return insertIntoTree(withoutTemp, created?.parent || null, {
            ...created,
            children: created?.children || [],
          })
        })
        await loadCategories()
        return created
      } catch (e) {
        setCategories((prev) => removeFromTree(prev, optimisticId))
        setError(e)
        throw e
      } finally {
        setSaving(false)
      }
    },
    [loadCategories],
  )

  const updateCategory = useCallback(
    async (id, payload) => {
      setSaving(true)
      setError(null)
      let previous = null
      setCategories((prev) => {
        const walk = (nodes = []) =>
          nodes.map((node) => {
            if (String(getId(node)) === String(id)) {
              previous = node
              return { ...node, ...payload }
            }
            if (!Array.isArray(node.children) || node.children.length === 0) return node
            return { ...node, children: walk(node.children) }
          })
        return walk(prev)
      })
      try {
        const updated = await patchCategory(id, payload || {})
        setCategories((prev) => updateInTree(prev, id, updated))
        await loadCategories()
        return updated
      } catch (e) {
        if (previous) setCategories((prev) => updateInTree(prev, id, previous))
        setError(e)
        throw e
      } finally {
        setSaving(false)
      }
    },
    [loadCategories],
  )

  const removeCategory = useCallback(
    async (id) => {
      setSaving(true)
      setError(null)
      const previousTree = categories
      setCategories((prev) => removeFromTree(prev, id))
      try {
        const result = await deleteCategory(id)
        await loadCategories()
        return result
      } catch (e) {
        setCategories(previousTree)
        setError(e)
        throw e
      } finally {
        setSaving(false)
      }
    },
    [categories, loadCategories],
  )

  useEffect(() => {
    loadCategories().catch(() => {})
  }, [loadCategories])

  return {
    categories,
    loading,
    saving,
    error,
    refetch: loadCategories,
    createCategory,
    updateCategory,
    removeCategory,
  }
}
