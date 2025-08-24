import { useCallback, useEffect, useRef, useState } from 'react'

export const useInfiniteFortniteAccounts = (filters = {}) => {
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
    const fortniteData = accountData.fortnite_data || accountData
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
    const originalPrice =
      typeof apiAccount.price === 'number' ? apiAccount.price : parseFloat(apiAccount.price) || 0

    return {
      // ✅ RAW API DATA (unmodified from LZT Market)
      id: apiAccount.item_id || apiAccount.id,
      item_id: apiAccount.item_id,
      title: apiAccount.title,
      price: originalPrice,
      currency:
        apiAccount.price_currency?.toLowerCase() === 'usd' ? '$' : apiAccount.price_currency || '$',
      item_state: apiAccount.item_state,

      // LZT Market Fortnite-specific fields (exactly as they come from API)
      fortnite_platform: apiAccount.fortnite_platform,
      fortnite_register_date: apiAccount.fortnite_register_date,
      fortnite_last_activity: apiAccount.fortnite_last_activity,
      fortnite_book_level: apiAccount.fortnite_book_level,
      fortnite_lifetime_wins: apiAccount.fortnite_lifetime_wins,
      fortnite_level: apiAccount.fortnite_level,
      fortnite_season_num: apiAccount.fortnite_season_num,
      fortnite_books_purchased: apiAccount.fortnite_books_purchased,
      fortnite_balance: apiAccount.fortnite_balance,
      fortnite_skin_count: apiAccount.fortnite_skin_count,
      fortnite_change_email: apiAccount.fortnite_change_email,
      fortnite_rl_purchases: apiAccount.fortnite_rl_purchases,
      fortnite_xbox_linkable: apiAccount.fortnite_xbox_linkable,
      fortnite_psn_linkable: apiAccount.fortnite_psn_linkable,
      fortnite_refund_credits: apiAccount.fortnite_refund_credits,

      // Shop cosmetic counts from API
      fortnite_shop_skins_count: apiAccount.fortnite_shop_skins_count,
      fortnite_shop_pickaxes_count: apiAccount.fortnite_shop_pickaxes_count,
      fortnite_shop_dances_count: apiAccount.fortnite_shop_dances_count,
      fortnite_shop_gliders_count: apiAccount.fortnite_shop_gliders_count,

      // Individual cosmetic counts from API
      fortnite_pickaxe_count: apiAccount.fortnite_pickaxe_count,
      fortnite_dance_count: apiAccount.fortnite_dance_count,
      fortnite_glider_count: apiAccount.fortnite_glider_count,

      // Actual cosmetic arrays from LZT Market API
      fortniteSkins: apiAccount.fortniteSkins || [],
      fortnitePickaxe: apiAccount.fortnitePickaxe || [],
      fortniteDance: apiAccount.fortniteDance || [],
      fortniteGliders: apiAccount.fortniteGliders || [],

      // ⚠️ PROCESSED DATA (added by our code for compatibility)
      priceWithSellerFeeLabel:
        apiAccount.priceWithSellerFeeLabel ||
        (apiAccount.price_currency
          ? `${apiAccount.price_currency.toLowerCase() === 'usd' ? '$' : apiAccount.price_currency}${originalPrice}`
          : `$${originalPrice}`),
      lastSeen: formatLastSeen(apiAccount.fortnite_last_activity),
      pickaxesCount: Array.isArray(fortniteData.fortnite_pickaxes || fortniteData.pickaxes)
        ? (fortniteData.fortnite_pickaxes || fortniteData.pickaxes).length
        : 0,
      emotesCount: Array.isArray(fortniteData.fortnite_emotes || fortniteData.emotes)
        ? (fortniteData.fortnite_emotes || fortniteData.emotes).length
        : 0,
      glidersCount: Array.isArray(fortniteData.fortnite_gliders || fortniteData.gliders)
        ? (fortniteData.fortnite_gliders || fortniteData.gliders).length
        : 0,

      // Additional fields
      item_origin: apiAccount.item_origin,
      warranty: apiAccount.warranty,
      hasWarranty: !!apiAccount.warranty,
      guarantee: apiAccount.guarantee,

      // Seller information
      seller: {
        username: sellerData.username || 'Unknown',
        rating: sellerData.rating || 0,
        sold_count: sellerData.sold_count || 0
      },

      // Helper properties
      totalCosmetics:
        (Array.isArray(fortniteData.fortnite_skins || fortniteData.skins)
          ? (fortniteData.fortnite_skins || fortniteData.skins).length
          : 0) +
        (Array.isArray(fortniteData.fortnite_pickaxes || fortniteData.pickaxes)
          ? (fortniteData.fortnite_pickaxes || fortniteData.pickaxes).length
          : 0) +
        (Array.isArray(fortniteData.fortnite_emotes || fortniteData.emotes)
          ? (fortniteData.fortnite_emotes || fortniteData.emotes).length
          : 0) +
        (Array.isArray(fortniteData.fortnite_gliders || fortniteData.gliders)
          ? (fortniteData.fortnite_gliders || fortniteData.gliders).length
          : 0),

      type: 'Fortnite Account'
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

      // Set default Fortnite filters for initial load - minimal filtering to get real accounts
      const defaultFortniteFilters = {
        order_by: 'price_to_up', // Show cheapest first
        page: 1,
        per_page: 25 // Use standard 25 items per page
        // Remove any restrictive filters to get real accounts
      }

      // Transform UI filters to API format
      const transformedFilters = transformFiltersForAPI(filters)

      // Merge filters with defaults
      const fortniteParams =
        Object.keys(transformedFilters).length === 0
          ? defaultFortniteFilters
          : { ...defaultFortniteFilters, ...transformedFilters, page: 1 }

      // Use server endpoint instead of ZelenkaAPI
      const params = new URLSearchParams(fortniteParams)
      const response = await fetch(`/api/fortnite?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Transform server response format
      const responseData = data.data || data
      const apiResponse = {
        items: responseData.items || [],
        total: responseData.totalItems || 0,
        perPage: responseData.perPage || 20,
        currentPage: responseData.page || 1
      }

      // 🚨 RAW LZT MARKET API DEBUG - Unprocessed response

      if (apiResponse && apiResponse.items) {
        const transformedAccounts = apiResponse.items.map(transformAccountData)

        setAccounts(transformedAccounts)

        // Check if there are more pages using actual API data
        const actualTotal = apiResponse.total || 0
        const actualPerPage = apiResponse.perPage || fortniteParams.per_page || 25
        const totalPages = Math.ceil(actualTotal / actualPerPage)
        const hasMorePages = totalPages > 1 && apiResponse.items.length >= actualPerPage

        setHasMore(hasMorePages)
      } else {
        setAccounts([])
        setHasMore(false)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error loading initial Fortnite accounts:', err)
        setError(err.message || 'Failed to load Fortnite accounts')

        // Don't use demo data fallback - show real error
        setAccounts([])
        setHasMore(false)
      }
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Load more accounts (for infinite scroll)
  const loadMoreAccounts = useCallback(async () => {
    if (loadingMore || !hasMore) {
      return
    }

    try {
      setLoadingMore(true)
      setError(null)

      const nextPage = currentPage + 1

      // Set default Fortnite filters
      const defaultFortniteFilters = {
        order_by: 'price_to_up',
        page: nextPage,
        per_page: 25 // Use standard 25 items per page to match API
      }

      // Transform UI filters to API format
      const transformedFilters = transformFiltersForAPI(filters)

      // Merge filters with defaults
      const fortniteParams =
        Object.keys(transformedFilters).length === 0
          ? defaultFortniteFilters
          : { ...defaultFortniteFilters, ...transformedFilters, page: nextPage }

      // Use server endpoint instead of ZelenkaAPI
      const params = new URLSearchParams(fortniteParams)
      const response = await fetch(`/api/fortnite?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Transform server response format
      const responseData = data.data || data
      const apiResponse = {
        items: responseData.items || [],
        total: responseData.totalItems || 0,
        perPage: responseData.perPage || 20,
        currentPage: responseData.page || nextPage
      }

      if (apiResponse && apiResponse.items && apiResponse.items.length > 0) {
        const transformedAccounts = apiResponse.items.map(transformAccountData)

        // Don't filter out accounts - show all accounts from API
        // The API should already return relevant Fortnite accounts

        // Append new accounts to existing ones
        setAccounts(prev => [...prev, ...transformedAccounts])
        setCurrentPage(nextPage)

        // Check if there are more pages using actual API data
        const actualTotal = apiResponse.total || 0
        const actualPerPage = apiResponse.perPage || fortniteParams.per_page || 25
        const totalPages = Math.ceil(actualTotal / actualPerPage)
        const hasMorePages = nextPage < totalPages && apiResponse.items.length >= actualPerPage

        setHasMore(hasMorePages)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Error loading more Fortnite accounts:', err)
      setError(err.message || 'Failed to load more accounts')
    } finally {
      setLoadingMore(false)
    }
  }, [filters, currentPage, loadingMore, hasMore])

  // Reload accounts when filters change
  useEffect(() => {
    loadInitialAccounts()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadInitialAccounts])

  return {
    accounts,
    loading,
    loadingMore,
    error,
    hasMore,
    currentPage,
    loadMoreAccounts,
    refresh: loadInitialAccounts
  }
}

// Helper function to transform UI filters to API format
const transformFiltersForAPI = filters => {
  const apiFilters = { ...filters }

  // Transform selected cosmetic items to API format
  if (filters.selectedSkins && Array.isArray(filters.selectedSkins)) {
    apiFilters.skins = filters.selectedSkins.map(item => item.value)
    delete apiFilters.selectedSkins
  }

  if (filters.selectedPickaxes && Array.isArray(filters.selectedPickaxes)) {
    apiFilters.pickaxes = filters.selectedPickaxes.map(item => item.value)
    delete apiFilters.selectedPickaxes
  }

  if (filters.selectedEmotes && Array.isArray(filters.selectedEmotes)) {
    apiFilters.emotes = filters.selectedEmotes.map(item => item.value)
    delete apiFilters.selectedEmotes
  }

  if (filters.selectedGliders && Array.isArray(filters.selectedGliders)) {
    apiFilters.gliders = filters.selectedGliders.map(item => item.value)
    delete apiFilters.selectedGliders
  }

  // Clean up any undefined or null values
  Object.keys(apiFilters).forEach(key => {
    if (apiFilters[key] === undefined || apiFilters[key] === null || apiFilters[key] === '') {
      delete apiFilters[key]
    }
  })

  return apiFilters
}

// Generate demo Fortnite accounts for development
const generateDemoFortniteAccounts = () => {
  const demoAccounts = []

  for (let i = 1; i <= 12; i++) {
    const account = {
      id: `demo-fortnite-${i}`,
      item_id: `demo-fortnite-${i}`,
      title: `Fortnite Account #${i}`,
      price: Math.floor(Math.random() * 150) + 25, // $25-$175
      priceWithSellerFeeLabel: `$${Math.floor(Math.random() * 150) + 25}`,
      currency: '$',
      item_state: 'active',
      lastSeen: 'Today',

      // Fortnite-specific data
      fortnite_level: Math.floor(Math.random() * 200) + 50, // Level 50-250
      fortnite_vbucks: Math.floor(Math.random() * 8000) + 1000, // 1000-9000 V-Bucks
      fortnite_wins: Math.floor(Math.random() * 500) + 10, // 10-510 wins
      fortnite_kills: Math.floor(Math.random() * 5000) + 100, // 100-5100 kills
      fortnite_country: ['US', 'EU', 'UK', 'CA', 'AU'][Math.floor(Math.random() * 5)],

      // Cosmetic counts
      skinsCount: Math.floor(Math.random() * 80) + 15, // 15-95 skins
      pickaxesCount: Math.floor(Math.random() * 30) + 5, // 5-35 pickaxes
      emotesCount: Math.floor(Math.random() * 50) + 10, // 10-60 emotes
      glidersCount: Math.floor(Math.random() * 25) + 5, // 5-30 gliders

      // Additional fields
      hasWarranty: Math.random() > 0.3, // 70% have warranty
      warranty: ['7 days', '14 days', '30 days'][Math.floor(Math.random() * 3)],

      // Seller info
      seller: {
        username: `seller${i}`,
        rating: Math.floor(Math.random() * 5) + 1, // 1-5 stars
        sold_count: Math.floor(Math.random() * 500) + 10 // 10-510 sales
      },

      type: 'Fortnite Account'
    }

    // Calculate total cosmetics
    account.totalCosmetics =
      account.skinsCount + account.pickaxesCount + account.emotesCount + account.glidersCount

    demoAccounts.push(account)
  }

  return demoAccounts
}
