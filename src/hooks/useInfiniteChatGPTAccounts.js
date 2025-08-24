import { useCallback, useEffect, useState } from 'react'

const useInfiniteChatGPTAccounts = (filters = {}) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const loadAccounts = useCallback(
    async (page = 1, reset = false) => {
      try {
        setLoading(true)
        setError(null)

        // Build query parameters
        const params = new URLSearchParams({
          page: page.toString(),
          ...filters
        })

        const response = await fetch(`/api/chatgpt?${params}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('✅ ChatGPT API Response:', data)

        // Extract items from the nested data structure
        const items = data?.data?.items || data?.items || []
        const totalItems = data?.data?.totalItems || data?.totalItems || items.length

        console.log('📊 ChatGPT Items extracted:', items.length, 'items')

        if (reset) {
          setAccounts(items)
        } else {
          setAccounts(prev => [...prev, ...items])
        }

        setHasNextPage(items.length > 0 && items.length >= 20) // Assuming 20 items per page
        setTotalItems(totalItems)
        setCurrentPage(page)
      } catch (err) {
        console.error('Error loading ChatGPT accounts:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [filters]
  )

  const loadMore = useCallback(() => {
    if (!loading && hasNextPage) {
      loadAccounts(currentPage + 1, false)
    }
  }, [loading, hasNextPage, currentPage, loadAccounts])

  // Load initial data when component mounts or filters change
  useEffect(() => {
    console.log('🚀 ChatGPT Hook: Loading initial data with filters:', filters)
    setAccounts([])
    setCurrentPage(1)
    setHasNextPage(true)
    loadAccounts(1, true)
  }, [loadAccounts])

  return {
    accounts,
    loading,
    error,
    hasNextPage,
    totalItems,
    loadMore,
    refresh: () => {
      setAccounts([])
      setCurrentPage(1)
      setHasNextPage(true)
      loadAccounts(1, true)
    }
  }
}

export { useInfiniteChatGPTAccounts }
