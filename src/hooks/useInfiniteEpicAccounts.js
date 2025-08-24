import { useCallback, useEffect, useRef, useState } from 'react'

export const useInfiniteEpicAccounts = (filters = {}) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const abortControllerRef = useRef(null)

  // Transform API data to match our current account structure
  const transformAccountData = apiAccount => {
    // Handle different API response structures
    const accountData = apiAccount.account || apiAccount

    // Extract nested data safely
    const epicData = accountData.epic_data || accountData
    const sellerData = accountData.seller || {}

    // Format last seen date
    const formatLastSeen = timestamp => {
      if (!timestamp) return 'Unknown'
      try {
        const date = new Date(timestamp * 1000) // Convert Unix timestamp
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch {
        return 'Unknown'
      }
    }

    // Use the original price from API as-is (no conversion needed)
    const originalPrice = apiAccount.price || 0

    return {
      id: apiAccount.item_id || apiAccount.id,
      item_id: apiAccount.item_id,
      title: apiAccount.title || `Epic Games Account #${apiAccount.item_id}`,
      price: originalPrice,
      priceWithSellerFeeLabel: `$${originalPrice}`,
      currency: '$',

      // Epic Games specific data
      epic_data: {
        email: epicData.email || 'Email Hidden',
        email_changeable: epicData.email_changeable || false,
        account_id: epicData.account_id || '',
        creation_date: epicData.creation_date || '',
        country: epicData.country || '',
        last_seen: formatLastSeen(epicData.last_seen),
        purchases: epicData.purchases || [],
        library: epicData.library || [],
        rocket_league_items: epicData.rocket_league_items || []
      },

      // Epic Games data - pass through the eg_games data from API
      eg_games: apiAccount.eg_games || null,

      // Epic Games specific fields from API
      eg_country: apiAccount.eg_country || null,
      eg_last_seen: apiAccount.eg_last_seen || null,
      eg_code_redemption_history: apiAccount.eg_code_redemption_history || [],
      eg_coupons: apiAccount.eg_coupons || [],

      // Seller information
      seller: {
        username: sellerData.username || 'Unknown',
        rating: sellerData.rating || 0,
        rating_percentage: sellerData.rating_percentage || 0,
        is_online: sellerData.is_online || false,
        last_seen: formatLastSeen(sellerData.last_seen)
      },

      // Item metadata
      item_id: apiAccount.item_id,
      item_state: apiAccount.item_state || 'active',
      published_date: apiAccount.published_date,
      account_title: apiAccount.title || `Epic Games Account #${apiAccount.item_id}`,
      description: apiAccount.description || '',

      // Warranty and guarantees
      warranty: apiAccount.warranty || null,
      warranty_days: apiAccount.warranty_days || 0,

      // Category and type
      category_id: apiAccount.category_id || 7, // Epic Games category
      type: 'Epic Games Account'
    }
  }

  // Load initial page
  const loadInitialAccounts = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)
      setCurrentPage(1)
      setHasMore(true)

      // Set default Epic Games filters for initial load
      const defaultEpicFilters = {
        order_by: 'price_to_up', // Show cheapest first
        page: 1
        // No per_page parameter - LZT Market automatically returns 40 items
      }

      // Merge filters with defaults
      const epicParams =
        Object.keys(filters).length === 0
          ? defaultEpicFilters
          : { ...defaultEpicFilters, ...filters, page: 1 }

      // Use server endpoint instead of ZelenkaAPI - Handle array parameters properly
      const params = new URLSearchParams()

      // Add all parameters, handling arrays specially
      Object.entries(epicParams).forEach(([key, value]) => {
        if (key === 'games' && Array.isArray(value) && value.length > 0) {
          // Transform 'games' parameter to 'game[]' format expected by LZT Market SDK
          value.forEach(item => {
            params.append('game[]', item)
          })
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            // For other arrays, add each value as a separate parameter
            value.forEach(item => {
              params.append(`${key}[]`, item)
            })
          }
        } else if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value)
        }
      })

      const response = await fetch(`/api/epic?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Transform server response format
      const responseData = data.data || data
      const apiResponse = {
        items: responseData.items || [],
        total: responseData.totalItems || 0,
        perPage: responseData.perPage || 40, // LZT Market default is 40
        currentPage: responseData.page || 1
      }

      if (apiResponse && apiResponse.items) {
        const transformedAccounts = apiResponse.items.map(transformAccountData)

        setAccounts(transformedAccounts)

        // Use the server response's hasNextPage field for more accurate pagination
        const serverHasMore = data.data?.hasNextPage || data.hasNextPage || false
        const totalItems = data.data?.totalItems || data.totalItems || 0
        const perPage = data.data?.perPage || data.perPage || 40 // LZT Market default is 40

        // Check if there are more pages using server data
        const calculatedHasMore = totalItems > 1 * perPage
        setHasMore(serverHasMore || calculatedHasMore)
      } else {
        throw new Error('No data received from API')
      }
    } catch (error) {
      console.error('Epic accounts loading error:', error)
      setError(error.message)
      setAccounts([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Load more accounts for infinite scroll
  const loadMoreAccounts = useCallback(async () => {
    if (loadingMore || !hasMore) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      setLoadingMore(true)
      setError(null)

      const nextPage = currentPage + 1
      const epicParams = {
        ...filters,
        page: nextPage
        // No per_page parameter - LZT Market automatically returns 40 items
      }

      // Handle array parameters properly for pagination
      const params = new URLSearchParams()

      Object.entries(epicParams).forEach(([key, value]) => {
        if (key === 'games' && Array.isArray(value) && value.length > 0) {
          // Transform 'games' parameter to 'game[]' format expected by LZT Market SDK
          value.forEach(item => {
            params.append('game[]', item)
          })
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            value.forEach(item => {
              params.append(`${key}[]`, item)
            })
          }
        } else if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value)
        }
      })
      const response = await fetch(`/api/epic?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const responseData = data.data || data
      const apiResponse = {
        items: responseData.items || [],
        total: responseData.totalItems || 0,
        perPage: responseData.perPage || 40, // LZT Market default is 40
        currentPage: responseData.page || nextPage
      }

      if (apiResponse && apiResponse.items) {
        const transformedAccounts = apiResponse.items.map(transformAccountData)

        setAccounts(prev => [...prev, ...transformedAccounts])
        setCurrentPage(nextPage)

        // Check if there are more pages
        const serverHasMore = data.data?.hasNextPage || data.hasNextPage || false
        const totalItems = data.data?.totalItems || data.totalItems || 0
        const perPage = data.data?.perPage || data.perPage || 40 // LZT Market default is 40

        const calculatedHasMore = totalItems > nextPage * perPage
        setHasMore(serverHasMore || calculatedHasMore)
      }
    } catch (error) {
      console.error('Epic accounts load more error:', error)
      setError(error.message)
    } finally {
      setLoadingMore(false)
    }
  }, [filters, currentPage, loadingMore, hasMore])

  // Refresh function to reload accounts
  const refresh = useCallback(() => {
    loadInitialAccounts()
  }, [loadInitialAccounts])

  // Load accounts when filters change
  useEffect(() => {
    loadInitialAccounts()
  }, [loadInitialAccounts])

  // Cleanup function
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    accounts,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMoreAccounts,
    refresh
  }
}
