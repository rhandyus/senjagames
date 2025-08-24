import { useInfiniteEscapeFromTarkovAccounts } from '../hooks/useInfiniteEscapeFromTarkovAccounts'
import EscapeFromTarkovAccountCard from './EscapeFromTarkovAccountCard'

const InfiniteEscapeFromTarkovAccountsContainer = ({ filters = {} }) => {
  const { accounts, loading, loadingMore, error, hasMore, loadMore } =
    useInfiniteEscapeFromTarkovAccounts(filters)

  // Load more accounts when user scrolls near bottom
  const handleScroll = e => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 1000

    if (isNearBottom && hasMore && !loading && !loadingMore) {
      console.log('📜 Loading more Escape From Tarkov accounts...')
      loadMore()
    }
  }

  if (error) {
    return (
      <div className='bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6'>
        <p className='font-medium'>Error loading Escape From Tarkov accounts:</p>
        <p className='text-sm mt-1'>{error}</p>
        <button
          className='mt-2 bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-sm'
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    )
  }

  if (loading && accounts.length === 0) {
    return (
      <div className='account-container grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
        {[...Array(12)].map((_, index) => (
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
            <div className='h-10 bg-gray-700 rounded w-full'></div>
          </div>
        ))}
      </div>
    )
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-400 text-lg'>No Escape From Tarkov accounts found</p>
        <p className='text-gray-500 text-sm mt-2'>Try adjusting your filters or check back later</p>
      </div>
    )
  }

  return (
    <div className='space-y-6' onScroll={handleScroll}>
      {/* Accounts Stats */}
      <div className='text-sm text-gray-400'>
        <p>{accounts.length} Escape From Tarkov accounts loaded</p>
      </div>

      {/* Accounts Grid */}
      <div className='account-container grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
        {accounts.map(account => (
          <EscapeFromTarkovAccountCard
            key={`tarkov-${account.id}-${account.item_id}`}
            account={account}
          />
        ))}
      </div>

      {/* Load More Section */}
      {hasMore && (
        <div className='text-center py-8'>
          {loadingMore ? (
            <div className='flex items-center justify-center space-x-2'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600'></div>
              <span className='text-gray-400'>Loading more accounts...</span>
            </div>
          ) : (
            <button
              className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200'
              onClick={loadMore}
            >
              Load More Accounts
            </button>
          )}
        </div>
      )}

      {/* End of Results */}
      {!hasMore && accounts.length > 0 && (
        <div className='text-center py-8'>
          <p className='text-gray-500'>You've reached the end of Escape From Tarkov accounts</p>
        </div>
      )}
    </div>
  )
}

export default InfiniteEscapeFromTarkovAccountsContainer
