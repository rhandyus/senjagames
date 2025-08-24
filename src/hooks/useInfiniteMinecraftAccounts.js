import { useCallback, useEffect, useState } from 'react'

export const useInfiniteMinecraftAccounts = (filters = {}) => {
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
      title: account.title || 'Minecraft Account',
      price: account.price || 0,
      currency: account.currency || 'RUB',
      description: account.description || '',

      // Basic account info
      minecraft_nickname: account.minecraft_nickname || 'Unknown',
      minecraft_premium: account.minecraft_premium,
      minecraft_java: account.minecraft_java,
      minecraft_bedrock: account.minecraft_bedrock,
      minecraft_dungeons: account.minecraft_dungeons,
      minecraft_legends: account.minecraft_legends,

      // Email and security
      hasMailAccess: account.email_type === 'autoreg' || account.minecraft_email,
      minecraft_email: account.minecraft_email,
      can_change_details: account.can_change_details,
      minecraft_can_change_nickname: account.minecraft_can_change_nickname,

      // Gamepass
      hasGamepass: account.minecraft_subscription || account.subscription,
      minecraft_subscription_expiry: account.minecraft_subscription_expiry,
      minecraft_autorenewal: account.minecraft_autorenewal,

      // Capes
      minecraft_capes: account.minecraft_capes || [],
      minecraft_capes_count:
        account.minecraft_capes_count ||
        (account.minecraft_capes ? account.minecraft_capes.length : 0),

      // Activity
      minecraft_last_activity: account.minecraft_last_activity,

      // Seller info
      seller_last_seen: account.seller_last_seen,

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

    // Email access
    if (filterParams.email_type) params.append('email_type', filterParams.email_type)

    // Name change
    if (filterParams.change_nickname) params.append('change_nickname', filterParams.change_nickname)

    // Minecraft editions
    if (filterParams.java) params.append('java', filterParams.java)
    if (filterParams.bedrock) params.append('bedrock', filterParams.bedrock)
    if (filterParams.dungeons) params.append('dungeons', filterParams.dungeons)
    if (filterParams.legends) params.append('legends', filterParams.legends)

    // Gamepass
    if (filterParams.subscription) params.append('subscription', filterParams.subscription)
    if (filterParams.subscription_length)
      params.append('subscription_length', filterParams.subscription_length)
    if (filterParams.subscription_period)
      params.append('subscription_period', filterParams.subscription_period)
    if (filterParams.autorenewal) params.append('autorenewal', filterParams.autorenewal)

    // Origin
    if (filterParams.origin && filterParams.origin.length > 0) {
      filterParams.origin.forEach(origin => params.append('origin[]', origin))
    }

    // Capes
    if (filterParams.capes_min) params.append('capes_min', filterParams.capes_min)
    if (filterParams.capes_max) params.append('capes_max', filterParams.capes_max)
    if (filterParams.capes && filterParams.capes.length > 0) {
      filterParams.capes.forEach(cape => params.append('capes[]', cape))
    }

    // Country filters
    if (filterParams.country && filterParams.country.length > 0) {
      filterParams.country.forEach(country => params.append('country[]', country))
    }
    if (filterParams.not_country && filterParams.not_country.length > 0) {
      filterParams.not_country.forEach(country => params.append('not_country[]', country))
    }

    // Hypixel filters
    if (filterParams.rank_hypixel && filterParams.rank_hypixel.length > 0) {
      filterParams.rank_hypixel.forEach(rank => params.append('rank_hypixel[]', rank))
    }
    if (filterParams.hypixel_ban) params.append('hypixel_ban', filterParams.hypixel_ban)
    if (filterParams.last_login_hypixel)
      params.append('last_login_hypixel', filterParams.last_login_hypixel)
    if (filterParams.last_login_hypixel_period)
      params.append('last_login_hypixel_period', filterParams.last_login_hypixel_period)
    if (filterParams.level_hypixel_min)
      params.append('level_hypixel_min', filterParams.level_hypixel_min)
    if (filterParams.level_hypixel_max)
      params.append('level_hypixel_max', filterParams.level_hypixel_max)

    // Security
    if (filterParams.can_change_details)
      params.append('can_change_details', filterParams.can_change_details)

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
        const url = `/api/minecraft?${queryString}`

        console.log(`🔍 Fetching Minecraft accounts from: ${url}`)

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        console.log('✅ Minecraft API Response:', result)

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
          `✅ Transformed ${transformedAccounts.length} Minecraft accounts for page ${pageNum}`
        )

        if (pageNum === 1) {
          setAccounts(transformedAccounts)
        } else {
          setAccounts(prev => [...prev, ...transformedAccounts])
        }

        setHasMore(hasNextPage === true)
        setCurrentPage(pageNum)
      } catch (err) {
        console.error('❌ Error fetching Minecraft accounts:', err)
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
    console.log('🔄 Minecraft filters changed, fetching accounts...', filters)
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
