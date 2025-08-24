import { Icon } from '@iconify/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import WotAccountCard from './WotAccountCard'
import WotFilters from './WotFilters'

const InfiniteWotAccountsContainer = ({ filters: externalFilters = {} }) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [filters, setFilters] = useState({
    order_by: 'price_to_up',
    per_page: 20,
    ...externalFilters
  })

  // Use ref to store current filters for fetchAccounts
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const fetchAccounts = useCallback(async (pageNum = 1, isRefresh = false, useFilters = null) => {
    if (pageNum === 1) {
      setLoading(true)
      setError(null)
    } else {
      setLoadingMore(true)
    }

    try {
      const currentFilters = useFilters || filtersRef.current
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        ...currentFilters
      })

      // Remove empty filters
      for (const [key, value] of queryParams.entries()) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          queryParams.delete(key)
        }
      }

      console.log('🎮 Fetching WOT accounts from server:', `/api/lzt/wot?${queryParams}`)

      const response = await fetch(`/api/lzt/wot?${queryParams}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('🎯 WOT API Response:', data)

      if (data.items && Array.isArray(data.items)) {
        const newAccounts = data.items

        if (isRefresh || pageNum === 1) {
          setAccounts(newAccounts)
        } else {
          setAccounts(prev => [...prev, ...newAccounts])
        }

        setTotalItems(data.totalItems || data.total || newAccounts.length)
        setHasMore(
          data.hasNextPage || newAccounts.length === parseInt(currentFilters.per_page || 20)
        )
        setPage(pageNum)
      } else {
        setError(data.error || 'No accounts found or invalid response format')
      }
    } catch (err) {
      console.error('❌ Error fetching WOT accounts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // Use effect to trigger fetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAccounts(1, true)
    }, 100) // Small debounce to prevent rapid calls

    return () => clearTimeout(timeoutId)
  }, [filters]) // Remove fetchAccounts from dependencies

  const handleFiltersChange = useCallback(newFilters => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      per_page: 20
    }))
    setPage(1)
  }, [])

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchAccounts(page + 1, false)
    }
  }

  const handleRefresh = () => {
    fetchAccounts(1, true)
  }

  if (loading) {
    return (
      <div className='space-y-6'>
        {/* Filters Skeleton */}
        <div className='bg-gray-900 rounded-lg border border-gray-700 p-6'>
          <div className='animate-pulse'>
            <div className='h-6 bg-gray-700 rounded w-1/4 mb-4'></div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='h-12 bg-gray-700 rounded'></div>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className='bg-gray-900 rounded-lg border border-gray-700 p-6 animate-pulse'
            >
              <div className='flex justify-between items-start mb-4'>
                <div className='h-6 bg-gray-700 rounded w-1/3'></div>
                <div className='h-8 bg-gray-700 rounded w-1/4'></div>
              </div>
              <div className='space-y-3'>
                <div className='h-4 bg-gray-700 rounded w-full'></div>
                <div className='h-4 bg-gray-700 rounded w-3/4'></div>
                <div className='h-4 bg-gray-700 rounded w-1/2'></div>
              </div>
              <div className='mt-4 flex space-x-2'>
                <div className='h-10 bg-gray-700 rounded flex-1'></div>
                <div className='h-10 bg-gray-700 rounded flex-1'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='space-y-6'>
        <WotFilters onFiltersChange={handleFiltersChange} />

        <div className='bg-red-900 border border-red-700 text-red-100 px-6 py-4 rounded-lg'>
          <div className='flex items-center space-x-3'>
            <Icon icon='mdi:alert-circle' className='text-2xl' />
            <div>
              <p className='font-medium'>Error loading World of Tanks accounts:</p>
              <p className='text-sm mt-1'>{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className='mt-3 bg-red-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center space-x-2'
          >
            <Icon icon='mdi:refresh' />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <WotFilters onFiltersChange={handleFiltersChange} />

      {/* Header with Stats */}
      <div className='flex items-center justify-between bg-gray-900 rounded-lg border border-gray-700 p-4'>
        <div className='flex items-center space-x-3'>
          <Icon icon='mdi:tank' className='text-amber-500 text-2xl' />
          <div>
            <h2 className='text-xl font-bold text-white'>World of Tanks Accounts</h2>
            <p className='text-sm text-gray-400'>
              {totalItems > 0 ? (
                <>
                  Showing {accounts.length} of {totalItems.toLocaleString()} accounts
                </>
              ) : (
                'Premium World of Tanks accounts from LZT Market'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className='bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2'
        >
          <Icon icon='mdi:refresh' className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Accounts Grid */}
      {accounts.length > 0 ? (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {accounts.map(account => (
              <WotAccountCard
                key={account.item_id || account.wot_item_id}
                account={account}
                onViewDetails={account => {
                  console.log('View WOT account details:', account)
                  // Add navigation to detailed view if needed
                }}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className='text-center'>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className='bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-white px-8 py-3 rounded-lg font-medium transition-colors'
              >
                {loadingMore ? (
                  <span className='flex items-center space-x-2'>
                    <Icon icon='mdi:loading' className='animate-spin' />
                    <span>Loading More...</span>
                  </span>
                ) : (
                  `Load More Accounts`
                )}
              </button>
            </div>
          )}

          {/* End Message */}
          {!hasMore && accounts.length > 0 && (
            <div className='text-center py-8'>
              <div className='text-gray-400'>
                <Icon icon='mdi:check-circle' className='text-2xl mb-2 mx-auto' />
                <p>You've reached the end of the results</p>
                <p className='text-sm mt-1'>Total: {accounts.length} accounts</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className='text-center py-16'>
          <div className='text-6xl mb-4'>🎮</div>
          <h3 className='text-xl font-semibold text-gray-300 mb-2'>
            No World of Tanks Accounts Found
          </h3>
          <p className='text-gray-500 mb-4'>
            No accounts match your current filters. Try adjusting your search criteria.
          </p>
          <button
            onClick={handleRefresh}
            className='bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto'
          >
            <Icon icon='mdi:refresh' />
            <span>Refresh Results</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default InfiniteWotAccountsContainer
