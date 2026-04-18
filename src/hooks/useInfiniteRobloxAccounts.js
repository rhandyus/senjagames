import { useCallback, useEffect, useState } from 'react'

const useInfiniteRobloxAccounts = filters => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(0)

  const fetchAccounts = useCallback(
    async (pageNum = 1, isNewSearch = false) => {
      if (loading) return

      setLoading(true)
      setError(null)

      try {
        console.log('Fetching Roblox accounts for page:', pageNum, 'with filters:', filters)

        const queryParams = new URLSearchParams()
        queryParams.append('name', 'roblox')
        queryParams.append('page', pageNum.toString())
        
        // Add filters, mapping min_price/max_price to pmin/pmax for LZT
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            if (key === 'min_price') queryParams.append('pmin', value)
            else if (key === 'max_price') queryParams.append('pmax', value)
            else queryParams.append(key, value)
          }
        })

        const response = await fetch(`/api/unify?${queryParams.toString()}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Roblox API Response:', data)

        // Try to find items in different possible response locations
        const newAccounts = data.items || data.data?.items || (Array.isArray(data) ? data : [])
        const total = data.totalItems || data.total_items || data.data?.totalItems || newAccounts.length

        if (Array.isArray(newAccounts)) {
          console.log(`🎮 Roblox accounts fetched:`, {
            page: pageNum,
            newCount: newAccounts.length,
            totalItems: total,
            isNewSearch
          })

          if (isNewSearch || pageNum === 1) {
            setAccounts(newAccounts)
          } else {
            setAccounts(prev => [...prev, ...newAccounts])
          }

          setTotalPages(Math.ceil(total / 20) || 1)
          // LZT often uses 40 per page, but we'll be flexible
          setHasMore(newAccounts.length > 0 && accounts.length + newAccounts.length < total)
        } else {
          console.warn('🎮 Unexpected Roblox API response format:', data)
          if (pageNum === 1) setAccounts([])
          setHasMore(false)
        }
      } catch (err) {
        console.error('Error fetching Roblox accounts:', err)
        setError(err.message)
        if (pageNum === 1) {
          setAccounts([])
        }
      } finally {
        setLoading(false)
      }
    },
    [filters, loading]
  )

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchAccounts(nextPage, false)
    }
  }, [hasMore, loading, page, fetchAccounts])

  const resetAndFetch = useCallback(() => {
    setPage(1)
    setAccounts([])
    setHasMore(true)
    setError(null)
    fetchAccounts(1, true)
  }, [fetchAccounts])

  useEffect(() => {
    resetAndFetch()
  }, [filters])

  return {
    accounts,
    loading,
    hasMore,
    loadMore,
    error,
    totalPages,
    currentPage: page,
    refetch: resetAndFetch
  }
}

export default useInfiniteRobloxAccounts
