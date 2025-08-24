import { useEffect, useRef, useCallback } from 'react'
import { Icon } from '@iconify/react'
import FortniteAccountCard from './FortniteAccountCard'
import { useInfiniteFortniteAccounts } from '../hooks/useInfiniteFortniteAccounts'

const InfiniteFortniteAccountsContainer = ({ filters = {} }) => {
  const { accounts, loading, loadingMore, error, hasMore, loadMoreAccounts } =
    useInfiniteFortniteAccounts(filters)

  const observer = useRef()
  const lastAccountElementRef = useCallback(
    node => {
      if (loading || loadingMore) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreAccounts()
        }
      })
      if (node) {
        observer.current.observe(node)
      }
    },
    [loading, loadingMore, hasMore, loadMoreAccounts]
  )

  const handleAddToCart = account => {
    // Add to cart logic here
  }

  const handleWishlist = (account, isWishlisted) => {
    // Wishlist logic here
  }

  if (loading && accounts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 space-y-4'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500'></div>
        <div className='text-gray-400 text-lg'>Loading Fortnite accounts...</div>
        <div className='text-gray-500 text-sm'>Searching for the best deals</div>
      </div>
    )
  }

  if (error && accounts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 space-y-4'>
        <Icon icon='mdi:alert-circle' className='text-red-500 text-6xl' />
        <div className='text-red-400 text-lg font-medium'>Error loading accounts</div>
        <div className='text-gray-400 text-sm text-center max-w-md'>{error}</div>
        <button
          onClick={() => window.location.reload()}
          className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2'
        >
          <Icon icon='mdi:refresh' />
          <span>Retry</span>
        </button>
      </div>
    )
  }

  if (!loading && accounts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 space-y-4'>
        <Icon icon='game-icons:chest-armor' className='text-purple-500 text-6xl' />
        <div className='text-gray-400 text-lg font-medium'>No Fortnite accounts found</div>
        <div className='text-gray-500 text-sm text-center max-w-md'>
          Try adjusting your filters to see more results, or check back later for new listings.
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Results Header */}
      <div className='flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700'>
        <div className='flex items-center space-x-3'>
          <Icon icon='game-icons:chest-armor' className='text-purple-400 text-2xl' />
          <div>
            <h2 className='text-lg font-semibold text-white'>Fortnite Accounts</h2>
            <p className='text-sm text-gray-400'>
              {accounts.length} account{accounts.length !== 1 ? 's' : ''} found
              {hasMore && ' (loading more...)'}
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-2 text-sm text-gray-400'>
          <Icon icon='mdi:filter' />
          <span>Filtered results</span>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
        {accounts.map((account, index) => {
          const isLast = index === accounts.length - 1
          return (
            <div
              key={`${account.id}-${account.item_id}`}
              ref={isLast ? lastAccountElementRef : null}
              className='transform transition-all duration-300 hover:scale-105'
            >
              <FortniteAccountCard
                account={account}
                onAddToCart={handleAddToCart}
                onWishlist={handleWishlist}
              />
            </div>
          )
        })}
      </div>

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className='flex items-center justify-center py-8 space-x-3'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500'></div>
          <span className='text-gray-400'>Loading more accounts...</span>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && accounts.length > 0 && (
        <div className='text-center py-8'>
          <div className='inline-flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700'>
            <Icon icon='mdi:check-circle' className='text-green-400' />
            <span className='text-gray-400'>You've seen all available accounts</span>
          </div>
        </div>
      )}

      {/* Error state for more loading */}
      {error && accounts.length > 0 && (
        <div className='text-center py-4'>
          <div className='inline-flex items-center space-x-2 bg-red-900 bg-opacity-50 px-4 py-2 rounded-lg border border-red-700'>
            <Icon icon='mdi:alert-circle' className='text-red-400' />
            <span className='text-red-300 text-sm'>Error loading more accounts</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfiniteFortniteAccountsContainer
