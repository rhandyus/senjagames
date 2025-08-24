import { useCallback, useEffect, useState } from 'react'

export const useInfiniteVPNAccounts = (filters = {}) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  console.log('🌐 VPN Hook initialized with filters:', filters)

  const fetchAccounts = useCallback(
    async (page = 1, isRefresh = false) => {
      if (loading) return

      setLoading(true)
      if (isRefresh || page === 1) {
        setError(null)
      }

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          per_page: '20',
          ...filters
        })

        const endpoint = `/api/vpn?${queryParams}`
        console.log('🌐 Fetching VPN accounts from:', endpoint)

        const response = await fetch(endpoint)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('🌐 VPN API Response:', data)

        if (data && (data.items || data.data?.items)) {
          const newAccounts = data.items || data.data?.items || []
          const total = data.totalItems || data.data?.totalItems || newAccounts.length

          console.log(`🌐 VPN accounts fetched:`, {
            page,
            newCount: newAccounts.length,
            totalItems: total,
            isRefresh
          })

          if (isRefresh || page === 1) {
            setAccounts(newAccounts)
          } else {
            setAccounts(prev => [...prev, ...newAccounts])
          }

          setTotalItems(total)
          setCurrentPage(page)
          setHasNextPage(newAccounts.length === 20 && accounts.length + newAccounts.length < total)
        } else {
          console.warn('🌐 Unexpected VPN API response format:', data)
          if (page === 1) {
            setAccounts([])
          }
          setHasNextPage(false)
        }
      } catch (err) {
        console.error('❌ VPN API Error:', err)
        setError(err.message || 'Failed to fetch VPN accounts')
        if (page === 1) {
          setAccounts([])
        }
      } finally {
        setLoading(false)
      }
    },
    [filters, loading, accounts.length]
  )

  const loadMore = useCallback(() => {
    if (hasNextPage && !loading) {
      fetchAccounts(currentPage + 1, false)
    }
  }, [hasNextPage, loading, currentPage, fetchAccounts])

  const refresh = useCallback(() => {
    setCurrentPage(1)
    setHasNextPage(true)
    fetchAccounts(1, true)
  }, [fetchAccounts])

  // Fetch accounts when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      refresh()
    }, 300) // Debounce API calls

    return () => clearTimeout(timer)
  }, [filters])

  return {
    accounts,
    loading,
    error,
    hasNextPage,
    totalItems,
    loadMore,
    refresh
  }
}
