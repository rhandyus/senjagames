import { useCallback, useEffect, useState } from 'react'

const useInfiniteSocialClubAccounts = (filters = {}) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Transform account data to match expected format
  const transformAccountData = account => {
    if (!account || !account.item_id) {
      return null
    }

    return {
      id: account.item_id,
      item_id: account.item_id,
      title: account.title || 'Social Club Account',
      price: account.price || 0,
      currency: account.currency || 'RUB',
      description: account.description || '',

      // Social Club specific fields
      socialclub_level: account.socialclub_level || 1,
      socialclub_cash: account.socialclub_cash || 0,
      socialclub_bank_cash: account.socialclub_bank_cash || 0,
      socialclub_games: account.socialclub_games || [],
      socialclub_username: account.socialclub_username || 'Unknown',
      socialclub_email: account.email || account.socialclub_email || '',
      socialclub_region: account.socialclub_region || 'Unknown',
      socialclub_platform: account.socialclub_platform || 'PC',
      socialclub_rank: account.socialclub_rank || 1,
      socialclub_rp: account.socialclub_rp || 0,
      socialclub_money: account.socialclub_money || 0,
      socialclub_characters: account.socialclub_characters || 1,
      socialclub_properties: account.socialclub_properties || [],
      socialclub_vehicles: account.socialclub_vehicles || [],
      socialclub_achievements: account.socialclub_achievements || 0,
      socialclub_playtime: account.socialclub_playtime || 0,

      // Email and security
      hasMailAccess: account.email_type === 'autoreg' || account.socialclub_email,
      email_type: account.email_type,
      can_change_details: account.can_change_details,

      // Standard marketplace fields
      seller: account.seller || {},
      created_at: account.created_at,
      updated_at: account.updated_at,
      views: account.views || 0,
      likes: account.likes || 0,
      dislikes: account.dislikes || 0,
      tags: account.tags || [],
      images: account.images || [],
      category: account.category || 'Social Club',
      item_origin: account.item_origin || 'Unknown',
      guarantee: account.guarantee || false,
      allow_ask_discount: account.allow_ask_discount || false
    }
  }

  // Build API query parameters
  const buildQueryParams = useCallback((pageNum, filterParams) => {
    const params = new URLSearchParams()

    // Always add page and order_by
    params.append('page', pageNum.toString())
    params.append('order_by', filterParams.order_by || 'price_to_up')

    // Price range
    if (filterParams.pmin) params.append('pmin', filterParams.pmin)
    if (filterParams.pmax) params.append('pmax', filterParams.pmax)

    // Level range
    if (filterParams.levelMin) params.append('level_min', filterParams.levelMin)
    if (filterParams.levelMax) params.append('level_max', filterParams.levelMax)

    // Cash range
    if (filterParams.cashMin) params.append('cash_min', filterParams.cashMin)
    if (filterParams.cashMax) params.append('cash_max', filterParams.cashMax)

    // Bank cash range
    if (filterParams.bankCashMin) params.append('bank_cash_min', filterParams.bankCashMin)
    if (filterParams.bankCashMax) params.append('bank_cash_max', filterParams.bankCashMax)

    // Games filter
    if (filterParams.games && filterParams.games.length > 0) {
      filterParams.games.forEach(game => params.append('games[]', game))
    }

    // Email and origin filters
    if (filterParams.emailProvider && filterParams.emailProvider !== 'all') {
      params.append('email_provider', filterParams.emailProvider)
    }
    if (filterParams.emailType && filterParams.emailType !== 'all') {
      params.append('email_type', filterParams.emailType)
    }
    if (filterParams.itemOrigin && filterParams.itemOrigin !== 'all') {
      params.append('item_origin', filterParams.itemOrigin)
    }

    // Boolean filters
    if (filterParams.guarantee) params.append('guarantee', '1')
    if (filterParams.allowDiscount) params.append('allow_discount', '1')

    return params.toString()
  }, [])

  // Fetch accounts from API
  const fetchAccounts = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (pageNum === 1) {
          setLoading(true)
          setError(null)
          if (!append) {
            setAccounts([])
          }
        } else {
          setLoadingMore(true)
        }

        const queryString = buildQueryParams(pageNum, filters)
        const url = `/api/socialclub?${queryString}`

        console.log(`🔍 Fetching Social Club accounts from: ${url}`)

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        console.log('✅ Social Club API Response:', result)

        if (result.items && Array.isArray(result.items)) {
          const newAccounts = result.items
            .map(transformAccountData)
            .filter(account => account !== null)

          if (pageNum === 1) {
            setAccounts(newAccounts)
          } else {
            setAccounts(prev => [...prev, ...newAccounts])
          }

          setCurrentPage(pageNum)
          setHasMore(result.hasNextPage || newAccounts.length >= 20)
        } else {
          console.warn('⚠️ Unexpected Social Club API response format:', result)
          if (pageNum === 1) {
            setAccounts([])
          }
          setHasMore(false)
        }
      } catch (error) {
        console.error('❌ Error fetching Social Club accounts:', error)
        setError(error.message)
        if (pageNum === 1) {
          setAccounts([])
        }
        setHasMore(false)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [filters, buildQueryParams]
  )

  // Load more accounts (next page)
  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      fetchAccounts(currentPage + 1, true)
    }
  }, [currentPage, hasMore, loading, loadingMore, fetchAccounts])

  // Refresh accounts (reset to page 1)
  const refresh = useCallback(() => {
    setCurrentPage(1)
    setHasMore(true)
    fetchAccounts(1, false)
  }, [fetchAccounts])

  // Load accounts when filters change
  useEffect(() => {
    setCurrentPage(1)
    setHasMore(true)
    fetchAccounts(1, false)
  }, [filters])

  return {
    accounts,
    hasMore,
    loading: loading || loadingMore,
    error,
    loadMore,
    refresh
  }
}

export default useInfiniteSocialClubAccounts
