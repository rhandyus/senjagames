import { useCallback, useEffect, useState } from 'react'

export const useInfiniteEscapeFromTarkovAccounts = (filters = {}) => {
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
      title: account.title || 'Escape From Tarkov Account',
      price: account.price || 0,
      currency: account.currency || 'USD',
      description: account.description || '',

      // Basic account info
      tarkov_username: account.tarkov_username || 'Unknown',
      tarkov_game_version: account.tarkov_game_version || 'standard',
      tarkov_level: account.tarkov_level || 0,
      tarkov_exp: account.tarkov_exp || 0,
      tarkov_side: account.tarkov_side || '',
      tarkov_region: account.tarkov_region || 'us',

      // Currency and items
      tarkov_rubles: account.tarkov_rubles || 0,
      tarkov_euros: account.tarkov_euros || 0,
      tarkov_dollars: account.tarkov_dollars || 0,
      tarkov_secured_container: account.tarkov_secured_container || '0',

      // Activity and dates
      tarkov_last_activity: account.tarkov_last_activity || 0,
      tarkov_register_date: account.tarkov_register_date || 0,
      tarkov_purchase_date: account.tarkov_purchase_date || 0,
      tarkov_register_wipe: account.tarkov_register_wipe || 0,
      tarkov_total_in_game: account.tarkov_total_in_game || 0,

      // PvE Access
      tarkov_access_pve: account.tarkov_access_pve || 0,

      // Email and security
      hasMailAccess: account.email_type === 'autoreg' || account.email_type === 'native',
      email_type: account.email_type,
      email_provider: account.email_provider,

      // Origin and guarantee
      item_origin: account.item_origin || 'unknown',
      extended_guarantee: account.extended_guarantee || 0,

      // Original data
      ...account
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

    // Game version (edition)
    if (filterParams.version && filterParams.version.length > 0) {
      filterParams.version.forEach(version => params.append('version[]', version))
    }

    // Region
    if (filterParams.region) params.append('region', filterParams.region)

    // Level range
    if (filterParams.level_min) params.append('level_min', filterParams.level_min)
    if (filterParams.level_max) params.append('level_max', filterParams.level_max)

    // Side (BEAR/USEC)
    if (filterParams.side) params.append('side', filterParams.side)

    // Currency filters
    if (filterParams.rubles_min) params.append('rubles_min', filterParams.rubles_min)
    if (filterParams.rubles_max) params.append('rubles_max', filterParams.rubles_max)
    if (filterParams.euros_min) params.append('euros_min', filterParams.euros_min)
    if (filterParams.euros_max) params.append('euros_max', filterParams.euros_max)
    if (filterParams.dollars_min) params.append('dollars_min', filterParams.dollars_min)
    if (filterParams.dollars_max) params.append('dollars_max', filterParams.dollars_max)

    // Container
    if (filterParams.container && filterParams.container.length > 0) {
      filterParams.container.forEach(container => params.append('container[]', container))
    }

    // Origin
    if (filterParams.origin && filterParams.origin.length > 0) {
      filterParams.origin.forEach(origin => params.append('origin[]', origin))
    }

    // Email type
    if (filterParams.email_type) params.append('email_type', filterParams.email_type)

    // PvE Access
    if (filterParams.access_pve) params.append('access_pve', filterParams.access_pve)

    // Activity filters
    if (filterParams.last_activity) params.append('last_activity', filterParams.last_activity)
    if (filterParams.last_activity_period)
      params.append('last_activity_period', filterParams.last_activity_period)

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
        const url = `/api/lzt/escapefromtarkov?${queryString}`

        console.log(`🔍 Fetching Escape From Tarkov accounts from: ${url}`)

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        console.log('✅ Escape From Tarkov API Response:', result)

        // Handle different response structures - some APIs return data.items, others return items directly
        const responseData = result.data || result
        if (!responseData.items) {
          throw new Error('Invalid API response format')
        }

        const { items, hasNextPage } = responseData

        // Transform accounts
        const transformedAccounts = items
          .map(transformAccountData)
          .filter(account => account !== null)

        console.log(
          `✅ Transformed ${transformedAccounts.length} Escape From Tarkov accounts for page ${pageNum}`
        )

        if (pageNum === 1) {
          setAccounts(transformedAccounts)
        } else {
          setAccounts(prev => [...prev, ...transformedAccounts])
        }

        setHasMore(hasNextPage === true)
        setCurrentPage(pageNum)
      } catch (err) {
        console.error('❌ Error fetching Escape From Tarkov accounts:', err)
        setError(err.message || 'Failed to fetch accounts')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [filters, buildQueryParams]
  )

  // Load more accounts
  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      fetchAccounts(currentPage + 1, true)
    }
  }, [loading, loadingMore, hasMore, currentPage, fetchAccounts])

  // Fetch accounts when filters change
  useEffect(() => {
    console.log('🔄 Escape From Tarkov filters changed, fetching accounts...', filters)
    fetchAccounts(1, false)
  }, [filters, fetchAccounts])

  return {
    accounts,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh: () => fetchAccounts(1, false)
  }
}
