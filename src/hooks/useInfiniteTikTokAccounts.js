import { useCallback, useEffect, useRef, useState } from 'react'

const useInfiniteTikTokAccounts = (filters = {}) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const abortControllerRef = useRef(null)

  const buildQueryParams = useCallback((filters, page) => {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('order_by', 'price_to_up')

    if (filters.search) params.append('search', filters.search)
    if (filters.min_price) params.append('pmin', filters.min_price)
    if (filters.max_price) params.append('pmax', filters.max_price)
    if (filters.email_type && filters.email_type !== 'any')
      params.append('email_type', filters.email_type)
    if (filters.min_followers) params.append('tiktok_followers_min', filters.min_followers)
    if (filters.max_followers) params.append('tiktok_followers_max', filters.max_followers)
    if (filters.min_likes) params.append('tiktok_likes_min', filters.min_likes)
    if (filters.max_likes) params.append('tiktok_likes_max', filters.max_likes)
    if (filters.min_videos) params.append('tiktok_videos_min', filters.min_videos)
    if (filters.max_videos) params.append('tiktok_videos_max', filters.max_videos)
    if (filters.min_coins) params.append('tiktok_coins_min', filters.min_coins)
    if (filters.max_coins) params.append('tiktok_coins_max', filters.max_coins)
    if (filters.verified === 'yes') params.append('tiktok_verified', '1')
    if (filters.verified === 'no') params.append('tiktok_verified', '0')
    if (filters.has_email === 'yes') params.append('tiktok_has_email', '1')
    if (filters.has_email === 'no') params.append('tiktok_has_email', '0')
    if (filters.has_mobile === 'yes') params.append('tiktok_has_mobile', '1')
    if (filters.has_mobile === 'no') params.append('tiktok_has_mobile', '0')
    if (filters.private_account === 'yes') params.append('tiktok_private_account', '1')
    if (filters.private_account === 'no') params.append('tiktok_private_account', '0')
    if (filters.has_live_permission === 'yes') params.append('tiktok_has_live_permission', '1')
    if (filters.has_live_permission === 'no') params.append('tiktok_has_live_permission', '0')
    if (filters.cookie_login === 'yes') params.append('tiktok_cookie_login', '1')
    if (filters.cookie_login === 'no') params.append('tiktok_cookie_login', '0')
    if (filters.item_origin) params.append('item_origin[]', filters.item_origin)

    return params.toString()
  }, [])

  const transformAccountData = useCallback(account => {
    try {
      return {
        item_id: account.item_id,
        title: account.title_en || account.title,
        price: account.price,
        currency: account.price_currency || 'usd',
        tiktok_unique_id: account.tiktok_unique_id,
        tiktok_screen_name: account.tiktok_screen_name,
        tiktok_followers: account.tiktok_followers || 0,
        tiktok_following: account.tiktok_following || 0,
        tiktok_likes: account.tiktok_likes || 0,
        tiktok_videos: account.tiktok_videos || 0,
        tiktok_coins: account.tiktok_coins || 0,
        tiktok_verified: account.tiktok_verified === 1,
        tiktok_has_email: account.tiktok_has_email === 1,
        tiktok_has_mobile: account.tiktok_has_mobile === 1,
        tiktok_private_account: account.tiktok_private_account === 1,
        tiktok_has_live_permission: account.tiktok_has_live_permission === 1,
        tiktok_cookie_login: account.tiktok_cookie_login === 1,
        tiktok_create_time: account.tiktok_create_time,
        email_type: account.email_type,
        email_provider: account.email_provider,
        item_origin: account.item_origin,
        extended_guarantee: account.extended_guarantee === 1,
        published_date: account.published_date,
        created_at: account.created_at,
        description: account.description_en || account.description,
        ...account
      }
    } catch (error) {
      console.error('Error transforming TikTok account:', error, account)
      return null
    }
  }, [])

  const fetchAccounts = useCallback(
    async (pageNum, append = true) => {
      try {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()

        if (pageNum === 1) {
          setLoading(true)
          setError(null)
          if (!append) {
            setAccounts([])
          }
        } else {
          setLoadingMore(true)
        }

        const queryString = buildQueryParams(filters, pageNum)
        const url = `/api/tiktok?${queryString}`

        console.log('🔍 Fetching TikTok accounts from:', url)

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        console.log('✅ TikTok API Response:', result)

        if (!result.items || !Array.isArray(result.items)) {
          console.warn('⚠️ Unexpected TikTok API response format:', result)
          throw new Error('Invalid response format')
        }

        const newAccounts = result.items
          .map(transformAccountData)
          .filter(account => account !== null)

        console.log(`✅ Transformed ${newAccounts.length} TikTok accounts for page ${pageNum}`)

        if (pageNum === 1) {
          setAccounts(newAccounts)
        } else if (append) {
          setAccounts(prev => [...prev, ...newAccounts])
        }

        setHasMore(result.hasNextPage || newAccounts.length >= 20)
        setPage(pageNum)
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('🚫 TikTok fetch aborted')
          return
        }

        console.error('❌ Error fetching TikTok accounts:', error)
        setError(error.message)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [filters, buildQueryParams, transformAccountData]
  )

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchAccounts(page + 1, true)
    }
  }, [fetchAccounts, page, loadingMore, hasMore])

  useEffect(() => {
    fetchAccounts(1, false)
  }, [fetchAccounts])

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

export default useInfiniteTikTokAccounts
