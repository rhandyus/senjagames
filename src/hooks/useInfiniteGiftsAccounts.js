import { useCallback, useEffect, useRef, useState } from 'react'

export const useInfiniteGiftsAccounts = (filters = {}) => {
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
    const giftsData = accountData.gifts_data || accountData
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
      } catch (error) {
        return 'Unknown'
      }
    }

    // Get warranty based on guarantee type
    const getWarranty = eg => {
      const guaranteeMap = {
        '-1': '12 hours',
        0: '24 hours',
        1: '3 days'
      }
      return guaranteeMap[eg] || '24 hours'
    }

    // Get gift type display name
    const getGiftTypeName = type => {
      const typeMap = {
        discord_nitro: 'Discord Nitro',
        discord_nitro_basic: 'Discord Nitro Basic',
        discord_nitro_trial: 'Discord Nitro Trial',
        telegram_premium: 'Telegram Premium'
      }
      return typeMap[type] || type
    }

    // Get gift service icon
    const getServiceIcon = service => {
      const iconMap = {
        discord: 'mdi:discord',
        telegram: 'mdi:telegram'
      }
      return iconMap[service] || 'mdi:gift'
    }

    const originalPrice = parseFloat(apiAccount.price) || 0

    return {
      // Core identification
      id: apiAccount.item_id || apiAccount.id,
      itemId: apiAccount.item_id || apiAccount.id,

      // Gift specific data
      giftType: apiAccount.gifts_type,
      giftTypeName: getGiftTypeName(apiAccount.gifts_type),
      giftService: apiAccount.gifts_service,
      giftServiceIcon: getServiceIcon(apiAccount.gifts_service),
      giftDuration: apiAccount.gifts_duration,
      giftDurationText: apiAccount.gifts_duration
        ? `${apiAccount.gifts_duration} days`
        : 'Permanent',

      // Pricing
      price: originalPrice,
      priceUSD: originalPrice,
      priceWithSellerFeeLabel: `$${originalPrice}`,

      // Account details
      title: apiAccount.title || 'Gift Item',
      description: apiAccount.description || '',

      // Status and metadata
      itemState: apiAccount.item_state || 'active',
      publishedDate: formatLastSeen(apiAccount.published_date),
      refreshedDate: formatLastSeen(apiAccount.refreshed_date),
      viewCount: apiAccount.view_count || 0,

      // Seller info
      sellerId: sellerData.user_id || sellerData.id,
      sellerName: sellerData.username || 'Unknown',
      sellerRating: sellerData.rating || 0,

      // Guarantee and warranty
      eg: apiAccount.eg || 0,
      warranty: getWarranty(apiAccount.eg),
      hasWarranty: true,
      extendedGuarantee: apiAccount.extended_guarantee || 0,

      // Additional metadata
      categoryId: apiAccount.category_id,
      isSticky: apiAccount.is_sticky === 1,
      itemOrigin: apiAccount.item_origin || 'unknown',
      allowAskDiscount: apiAccount.allow_ask_discount === 1,
      maxDiscountPercent: apiAccount.max_discount_percent || 0,

      // Platform specific
      platform: 'gifts',
      accountType: 'gifts'
    }
  }

  const fetchAccounts = useCallback(
    async (page = 1, isLoadMore = false) => {
      if (loading || loadingMore) return

      if (isLoadMore && !hasMore) {
        return
      }

      const setLoadingState = isLoadMore ? setLoadingMore : setLoading
      setLoadingState(true)
      setError(null)

      try {
        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()

        // Build API params
        const apiParams = new URLSearchParams({
          page: page.toString(),
          limit: '12',
          ...filters
        })

        const response = await fetch(`/api/gifts?${apiParams}`, {
          signal: abortControllerRef.current.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        const newAccounts = result?.data?.items || result?.items || []
        const transformedAccounts = newAccounts.map(transformAccountData)

        if (isLoadMore) {
          setAccounts(prev => [...prev, ...transformedAccounts])
        } else {
          setAccounts(transformedAccounts)
        }

        // Update pagination
        const totalItems = result?.data?.totalItems || result?.totalItems || 0
        const currentItemCount = (page - 1) * 12 + newAccounts.length
        setHasMore(currentItemCount < totalItems && newAccounts.length === 12)
        setCurrentPage(page)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError(error.message)
          console.error('Error fetching gifts accounts:', error)
        }
      } finally {
        setLoadingState(false)
      }
    },
    [filters, loading, loadingMore, hasMore]
  )

  // Load more function
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchAccounts(currentPage + 1, true)
    }
  }, [fetchAccounts, currentPage, loadingMore, hasMore])

  // Reset and refetch
  const refetch = useCallback(() => {
    setCurrentPage(1)
    setHasMore(true)
    fetchAccounts(1, false)
  }, [fetchAccounts])

  // Initial load and filter changes
  useEffect(() => {
    refetch()
  }, [filters])

  // Cleanup
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
    loadMore,
    refetch
  }
}

export default useInfiniteGiftsAccounts
