import { useCallback, useEffect, useState } from 'react'
import useInfiniteInstagramAccounts from '../hooks/useInfiniteInstagramAccounts'
import InstagramAccountCard from './InstagramAccountCard'

const InfiniteInstagramAccountsContainer = ({ filters = {} }) => {
  const { accounts, loading, error, hasNextPage, totalItems, loadMore } =
    useInfiniteInstagramAccounts(filters)
  const [isScrollLoading, setIsScrollLoading] = useState(false)

  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    if (loading || isScrollLoading || !hasNextPage) return

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight

    // Load more when user is 200px from bottom
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      setIsScrollLoading(true)
      loadMore()
    }
  }, [loading, isScrollLoading, hasNextPage, loadMore])

  // Reset scroll loading state when loading changes
  useEffect(() => {
    if (!loading) {
      setIsScrollLoading(false)
    }
  }, [loading])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Loading skeleton component matching Steam style
  const LoadingSkeleton = () => (
    <div className='bg-gray-900 border border-gray-700 rounded-xl shadow-lg overflow-hidden animate-pulse'>
      {/* Header Skeleton */}
      <div className='h-16 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <div className='w-2 h-2 bg-gray-600 rounded-full'></div>
            <div className='h-4 bg-gray-700 rounded w-24'></div>
          </div>
          <div className='text-right'>
            <div className='h-6 bg-gray-700 rounded w-16 mb-1'></div>
            <div className='h-3 bg-gray-700 rounded w-8'></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className='p-4 space-y-4'>
        {/* Status row skeleton */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='h-6 bg-gray-700 rounded-lg w-20'></div>
            <div className='h-6 bg-gray-700 rounded-lg w-24'></div>
          </div>
          <div className='h-6 bg-gray-700 rounded-lg w-16'></div>
        </div>

        {/* Username skeleton */}
        <div className='bg-gray-800 p-2 rounded-lg border border-gray-600'>
          <div className='h-4 bg-gray-700 rounded w-32'></div>
        </div>

        {/* Stats skeleton */}
        <div className='grid grid-cols-3 gap-2'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
              <div className='h-4 bg-gray-700 rounded w-8 mx-auto mb-1'></div>
              <div className='h-3 bg-gray-700 rounded w-12 mx-auto'></div>
            </div>
          ))}
        </div>

        {/* Details skeleton */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between mb-2'>
            <div className='h-4 bg-gray-700 rounded w-24'></div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600'
            >
              <div className='w-6 h-6 bg-gray-700 rounded mr-3 flex-shrink-0'></div>
              <div className='flex-1'>
                <div className='h-3 bg-gray-700 rounded w-20 mb-1'></div>
                <div className='h-3 bg-gray-700 rounded w-16'></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer skeleton */}
      <div className='bg-gray-800 px-4 py-3 border-t border-gray-700'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <div className='w-4 h-4 bg-gray-700 rounded'></div>
            <div className='h-3 bg-gray-700 rounded w-16'></div>
          </div>
          <div className='h-3 bg-gray-700 rounded w-12'></div>
        </div>
      </div>
    </div>
  )

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center py-12 px-4'>
        <div className='text-center max-w-md'>
          <div className='text-red-500 text-6xl mb-4'>⚠️</div>
          <h3 className='text-xl font-semibold text-gray-300 mb-2'>
            Error Loading Instagram Accounts
          </h3>
          <p className='text-gray-400 mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full'>
      {/* Results Header */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-bold text-gray-300'>Instagram Accounts</h2>
          {totalItems !== undefined && (
            <span className='text-sm text-gray-400'>
              {totalItems.toLocaleString()} total accounts
            </span>
          )}
        </div>
      </div>

      {/* Instagram Accounts Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6'>
        {accounts.map((account, index) => (
          <InstagramAccountCard
            key={`${account.id || account.item_id}-${index}`}
            account={account}
          />
        ))}

        {/* Loading Skeletons */}
        {loading && [...Array(8)].map((_, index) => <LoadingSkeleton key={`skeleton-${index}`} />)}
      </div>

      {/* Load More Indicator */}
      {isScrollLoading && (
        <div className='text-center py-8'>
          <div className='inline-flex items-center space-x-2 text-gray-400'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400'></div>
            <span>Loading more accounts...</span>
          </div>
        </div>
      )}

      {/* No More Results */}
      {!hasNextPage && accounts.length > 0 && (
        <div className='text-center py-8'>
          <p className='text-gray-400'>No more accounts to load</p>
        </div>
      )}

      {/* No Results */}
      {!loading && accounts.length === 0 && (
        <div className='text-center py-12'>
          <div className='text-gray-500 text-6xl mb-4'>🔍</div>
          <h3 className='text-xl font-semibold text-gray-300 mb-2'>No Instagram Accounts Found</h3>
          <p className='text-gray-400'>Try adjusting your search filters</p>
        </div>
      )}
    </div>
  )
}

export default InfiniteInstagramAccountsContainer
