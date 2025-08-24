import { useCallback, useEffect, useRef } from 'react'
import { useInfiniteEpicAccounts } from '../hooks/useInfiniteEpicAccounts'
import EpicAccountCard from './EpicAccountCard'

const InfiniteEpicAccountsContainer = ({ filters = {} }) => {
  const { accounts, loading, loadingMore, error, hasMore, loadMoreAccounts, refresh } =
    useInfiniteEpicAccounts(filters)

  const accountsContainerRef = useRef(null)
  const hasTriggeredLoadRef = useRef(false)

  // Scroll-based trigger for 50% loading
  useEffect(() => {
    const handleScroll = () => {
      if (!accountsContainerRef.current || loadingMore || !hasMore) return

      const container = accountsContainerRef.current
      const containerRect = container.getBoundingClientRect()
      const containerHeight = container.offsetHeight
      const windowHeight = window.innerHeight

      // Calculate how much of the container has been scrolled past
      const scrolledPastContainer = Math.max(0, -containerRect.top)
      const visibleContainerHeight = Math.min(
        containerHeight,
        containerHeight - scrolledPastContainer
      )

      // Calculate scroll percentage through the accounts container
      const scrollPercentage = scrolledPastContainer / containerHeight

      // Trigger load more when 50% of the container has been scrolled through
      if (scrollPercentage >= 0.5 && !hasTriggeredLoadRef.current) {
        hasTriggeredLoadRef.current = true
        loadMoreAccounts()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMoreAccounts, loadingMore, hasMore])

  // Reset trigger when new items are loaded
  useEffect(() => {
    if (!loadingMore) {
      hasTriggeredLoadRef.current = false
    }
  }, [loadingMore])

  // Force refresh when component mounts or filters change significantly
  const refreshAccounts = useCallback(() => {
    hasTriggeredLoadRef.current = false
    refresh()
  }, [refresh])

  // Error handling
  if (error) {
    return (
      <div className='min-h-screen bg-gray-900 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center py-12'>
            <div className='text-red-400 text-xl mb-4'>⚠️ Error Loading Epic Games Accounts</div>
            <div className='text-gray-300 mb-6'>{error}</div>
            <button
              onClick={refreshAccounts}
              className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors'
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading && accounts.length === 0) {
    return (
      <div className='min-h-screen bg-gray-900 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4'></div>
            <div className='text-purple-300 text-xl'>Loading Epic Games Accounts...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-900 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header Stats */}
        <div className='mb-6'>
          <div className='text-purple-300 text-lg'>
            {accounts.length > 0 && (
              <span>
                Showing {accounts.length} Epic Games accounts
                {hasMore && ' (scroll to load more)'}
              </span>
            )}
          </div>
        </div>

        {/* Accounts Grid */}
        <div
          ref={accountsContainerRef}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'
        >
          {accounts.map(account => (
            <EpicAccountCard key={account.item_id} account={account} />
          ))}
        </div>

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2'></div>
            <div className='text-purple-300'>Loading more accounts...</div>
          </div>
        )}

        {/* No More Results */}
        {!hasMore && accounts.length > 0 && (
          <div className='text-center py-8'>
            <div className='text-gray-400'>All available accounts loaded</div>
          </div>
        )}

        {/* No Results */}
        {!loading && accounts.length === 0 && (
          <div className='text-center py-12'>
            <div className='text-gray-400 text-xl mb-4'>No Epic Games accounts found</div>
            <div className='text-gray-500 mb-6'>Try adjusting your filters or check back later</div>
            <button
              onClick={refreshAccounts}
              className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors'
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default InfiniteEpicAccountsContainer
