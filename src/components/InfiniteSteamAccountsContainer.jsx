import { useEffect, useRef, useCallback } from 'react'
import SteamAccountCard from './SteamAccountCard'
import { useInfiniteSteamAccounts } from '../hooks/useInfiniteSteamAccounts'

const InfiniteSteamAccountsContainer = ({ filters = {} }) => {
  const { accounts, loading, loadingMore, error, hasMore, loadMoreAccounts, refresh } =
    useInfiniteSteamAccounts(filters)

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

      // Trigger loading when 50% through the accounts container
      if (scrollPercentage >= 0.5 && !hasTriggeredLoadRef.current) {
        hasTriggeredLoadRef.current = true
        loadMoreAccounts()
      }
    }

    // Reset trigger when accounts change (new page loaded)
    hasTriggeredLoadRef.current = false

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [accounts.length, loadingMore, hasMore, loadMoreAccounts])

  // Loading skeleton component
  const LoadingSkeleton = ({ count = 6 }) => (
    <>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className='account bg-gray-900 rounded-lg border border-gray-700 p-6 animate-pulse'
        >
          <div className='flex justify-between items-start mb-4'>
            <div className='h-8 bg-gray-700 rounded w-20'></div>
            <div className='h-6 bg-gray-700 rounded w-16'></div>
          </div>
          <div className='space-y-3 mb-4'>
            <div className='h-4 bg-gray-700 rounded w-full'></div>
            <div className='h-4 bg-gray-700 rounded w-3/4'></div>
            <div className='h-4 bg-gray-700 rounded w-1/2'></div>
          </div>
          <div className='space-y-2 mb-4'>
            <div className='h-3 bg-gray-700 rounded w-full'></div>
            <div className='h-3 bg-gray-700 rounded w-full'></div>
            <div className='h-3 bg-gray-700 rounded w-3/4'></div>
          </div>
          <div className='h-10 bg-gray-700 rounded w-full'></div>
        </div>
      ))}
    </>
  )

  // Initial loading state
  if (loading) {
    return (
      <div className='account-container grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
        <LoadingSkeleton count={6} />
      </div>
    )
  }

  // Error state
  if (error && accounts.length === 0) {
    return (
      <div className='bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6'>
        <p className='font-medium'>Error loading Steam accounts:</p>
        <p className='text-sm mt-1'>{error}</p>
        <button
          onClick={refresh}
          className='mt-2 bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors'
        >
          Try Again
        </button>
      </div>
    )
  }

  // Empty state
  if (!accounts || accounts.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-400 text-lg'>No Steam accounts found</p>
        <p className='text-gray-500 text-sm mt-2'>Try adjusting your filters or check back later</p>
        <button
          onClick={refresh}
          className='mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors'
        >
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Accounts Grid */}
      <div
        ref={accountsContainerRef}
        className='account-container grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full overflow-hidden'
      >
        {accounts.map((account, index) => (
          <SteamAccountCard key={`${account.item_id || account.id}-${index}`} account={account} />
        ))}

        {/* Loading more skeleton cards */}
        {loadingMore && <LoadingSkeleton count={3} />}
      </div>

      {/* Loading indicator at the bottom */}
      {loadingMore && (
        <div className='flex justify-center py-4'>
          <div className='flex items-center space-x-2 text-purple-400'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400'></div>
            <span className='text-sm'>Loading more accounts...</span>
          </div>
        </div>
      )}

      {/* End message */}
      {!hasMore && accounts.length > 0 && (
        <div className='text-center py-8'>
          <p className='text-gray-400'>You've reached the end of the results</p>
          <p className='text-gray-500 text-sm mt-1'>{accounts.length} accounts loaded</p>
        </div>
      )}

      {/* Error state for loading more */}
      {error && accounts.length > 0 && (
        <div className='bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg'>
          <p className='font-medium'>Error loading more accounts:</p>
          <p className='text-sm mt-1'>{error}</p>
          <button
            onClick={loadMoreAccounts}
            className='mt-2 bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors'
          >
            Try Loading More
          </button>
        </div>
      )}
    </div>
  )
}

export default InfiniteSteamAccountsContainer
