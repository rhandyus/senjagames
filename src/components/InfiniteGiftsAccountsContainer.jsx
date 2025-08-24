import { Icon } from '@iconify/react'
import { useCallback, useEffect, useRef } from 'react'
import useInfiniteGiftsAccounts from '../hooks/useInfiniteGiftsAccounts'
import GiftsAccountCard from './GiftsAccountCard'

const InfiniteGiftsAccountsContainer = ({ filters = {} }) => {
  const observerRef = useRef()

  const { accounts, loading, loadingMore, error, hasMore, loadMore, refetch } =
    useInfiniteGiftsAccounts(filters)

  // Intersection observer for infinite scroll
  const lastAccountElementRef = useCallback(
    node => {
      if (loading || loadingMore) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [loading, loadingMore, hasMore, loadMore]
  )

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Show loading state for initial load
  if (loading && accounts.length === 0) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {[...Array(12)].map((_, index) => (
          <div
            key={index}
            className='bg-gray-800 border border-gray-700 rounded-xl overflow-hidden animate-pulse'
          >
            <div className='h-4 bg-gray-700 mx-4 mt-4 rounded'></div>
            <div className='p-4 space-y-3'>
              <div className='h-16 bg-gray-700 rounded-lg'></div>
              <div className='h-4 bg-gray-700 rounded'></div>
              <div className='h-4 bg-gray-700 rounded w-3/4'></div>
            </div>
            <div className='h-12 bg-gray-700 mt-auto'></div>
          </div>
        ))}
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className='bg-red-900 bg-opacity-20 border border-red-700 rounded-xl p-8 text-center'>
        <Icon icon='mdi:alert-circle' className='text-red-400 text-4xl mx-auto mb-4' />
        <h3 className='text-xl font-semibold text-red-300 mb-2'>Failed to load gifts</h3>
        <p className='text-red-400 mb-4'>{error}</p>
        <button
          onClick={refetch}
          className='bg-red-700 hover:bg-red-600 px-6 py-2 rounded-lg text-white transition-colors'
        >
          Try Again
        </button>
      </div>
    )
  }

  // Show empty state
  if (!loading && accounts.length === 0) {
    return (
      <div className='text-center py-12'>
        <Icon icon='mdi:gift-off' className='text-gray-500 text-6xl mx-auto mb-4' />
        <h3 className='text-xl font-semibold text-gray-300 mb-2'>No gifts found</h3>
        <p className='text-gray-500 mb-4'>Try adjusting your filters or check back later</p>
        <button
          onClick={refetch}
          className='bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white transition-colors'
        >
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Accounts Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
        {accounts.map((account, index) => (
          <div key={account.id} ref={index === accounts.length - 1 ? lastAccountElementRef : null}>
            <GiftsAccountCard account={account} />
          </div>
        ))}
      </div>

      {/* Load More Indicator */}
      {loadingMore && (
        <div className='flex items-center justify-center py-8'>
          <div className='flex items-center space-x-2 text-purple-400'>
            <Icon icon='mdi:loading' className='animate-spin' />
            <span>Loading more gifts...</span>
          </div>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && accounts.length > 0 && (
        <div className='text-center py-8'>
          <Icon icon='mdi:check-circle' className='text-green-400 text-2xl mx-auto mb-2' />
          <p className='text-gray-400'>You've reached the end of available gifts</p>
        </div>
      )}
    </div>
  )
}

export default InfiniteGiftsAccountsContainer
