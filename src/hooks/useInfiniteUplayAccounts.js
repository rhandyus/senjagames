import { useCallback, useEffect, useRef, useState } from 'react'

const useInfiniteUplayAccounts = (filters = {}) => {
  const [accounts, setAccounts] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const abortControllerRef = useRef(null)

  const loadAccounts = async (pageNum = 1, reset = false) => {
    if (loading || loadingMore) return

    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      const params = new URLSearchParams({
        page: pageNum.toString(),
        per_page: '20',
        ...filters
      })

      const response = await fetch(`/api/uplay?${params}`, {
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.items && Array.isArray(result.items)) {
        const newAccounts = result.items

        if (reset) {
          setAccounts(newAccounts)
        } else {
          setAccounts(prev => [...prev, ...newAccounts])
        }

        // Check if there are more pages
        setHasMore(result.hasNextPage || newAccounts.length >= 20)
        setCurrentPage(pageNum)
      } else {
        console.error('Unexpected Uplay API response format:', result)
        throw new Error('Invalid response format')
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error loading Uplay accounts:', err)
        setError(err.message)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreAccounts = useCallback(() => {
    if (!loadingMore && !loading && hasMore) {
      loadAccounts(currentPage + 1, false)
    }
  }, [currentPage, hasMore, loading, loadingMore])

  const refresh = useCallback(() => {
    setCurrentPage(1)
    setHasMore(true)
    loadAccounts(1, true)
  }, [])

  // Load initial data when filters change
  useEffect(() => {
    setCurrentPage(1)
    setHasMore(true)
    loadAccounts(1, true)
  }, [JSON.stringify(filters)])

  return {
    accounts,
    loading,
    loadingMore,
    error,
    hasMore,
    currentPage,
    loadMoreAccounts,
    refresh
  }
}

export default useInfiniteUplayAccounts
