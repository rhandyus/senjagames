import { useCallback, useEffect, useState } from 'react'

const useInfiniteInstagramAccounts = (filters = {}) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const fetchAccounts = useCallback(
    async (pageNumber = 1, reset = false) => {
      if (loading) return

      try {
        setLoading(true)
        setError(null)

        // Build query parameters for Instagram-specific filters
        const queryParams = new URLSearchParams({
          page: pageNumber.toString(),
          limit: '20',
          ...filters
        })

        const response = await fetch(`/api/instagram?${queryParams}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.items && Array.isArray(data.items)) {
          // Transform Instagram data to match component expectations
          const transformedAccounts = data.items.map(account => ({
            id: account.item_id || account.instagram_item_id,
            title: account.title || account.title_en || 'Instagram Account',
            price: account.price || account.priceWithSellerFee || 0,
            description: account.description || account.description_en || '',

            // Instagram-specific data
            instagram_username: account.instagram_username || 'N/A',
            instagram_follower_count: account.instagram_follower_count || 0,
            instagram_follow_count: account.instagram_follow_count || 0,
            instagram_post_count: account.instagram_post_count || 0,
            instagram_id: account.instagram_id || account.instagram_item_id,
            instagram_mobile: account.instagram_mobile || 0,
            instagram_has_cookies: account.instagram_has_cookies || 0,
            instagram_country: account.instagram_country || '',
            instagram_register_date: account.instagram_register_date || 0,

            // Email data
            email_type: account.email_type || 'N/A',
            email_provider: account.email_provider || 'N/A',
            item_domain: account.item_domain || 'N/A',

            // Additional account data
            category_id: account.category_id,
            item_state: account.item_state || 'active',
            published_date: account.published_date || 0,
            view_count: account.view_count || 0,
            feedback_data: account.feedback_data || '{}',
            max_discount_percent: account.max_discount_percent || 0,
            allow_ask_discount: account.allow_ask_discount || 0,
            guarantee: account.guarantee || null,
            nsb: account.nsb || 0,

            // Features array for Instagram-specific features
            features: [
              account.instagram_has_cookies ? 'Has Cookies' : null,
              account.instagram_mobile ? 'Mobile Verified' : null,
              account.email_type === 'native' ? 'Native Email' : null,
              account.allow_ask_discount ? 'Discount Available' : null,
              account.nsb ? 'No Strike Back' : null,
              account.guarantee ? 'Extended Guarantee' : null
            ].filter(Boolean)
          }))

          if (reset) {
            setAccounts(transformedAccounts)
          } else {
            setAccounts(prev => [...prev, ...transformedAccounts])
          }

          setTotalItems(data.totalItems || data.items.length)
          setHasNextPage(transformedAccounts.length === 20) // Assuming 20 per page
        } else {
          console.warn('Invalid data structure received:', data)
          if (reset) {
            setAccounts([])
          }
          setTotalItems(0)
          setHasNextPage(false)
        }
      } catch (err) {
        console.error('Error fetching Instagram accounts:', err)
        setError(err.message)
        if (reset) {
          setAccounts([])
          setTotalItems(0)
        }
        setHasNextPage(false)
      } finally {
        setLoading(false)
      }
    },
    [filters, loading]
  )

  // Load more accounts (for infinite scroll)
  const loadMore = useCallback(() => {
    if (!loading && hasNextPage) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchAccounts(nextPage, false)
    }
  }, [loading, hasNextPage, page, fetchAccounts])

  // Reset and reload (when filters change)
  const reload = useCallback(() => {
    setPage(1)
    setAccounts([])
    setHasNextPage(true)
    setError(null)
    fetchAccounts(1, true)
  }, [fetchAccounts])

  // Initial load and reload when filters change
  useEffect(() => {
    reload()
  }, [filters])

  return {
    accounts,
    loading,
    error,
    hasNextPage,
    totalItems,
    loadMore,
    reload
  }
}

export default useInfiniteInstagramAccounts
