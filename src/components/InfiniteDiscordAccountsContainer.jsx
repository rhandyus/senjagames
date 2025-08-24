import { useCallback, useEffect } from 'react'
import useInfiniteDiscordAccounts from '../hooks/useInfiniteDiscordAccounts'
import DiscordAccountCard from './DiscordAccountCard'

const InfiniteDiscordAccountsContainer = ({ filters }) => {
  const { accounts, loading, loadingMore, error, hasMore, loadMore, refresh } =
    useInfiniteDiscordAccounts(filters)

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 &&
      hasMore &&
      !loadingMore
    ) {
      loadMore()
    }
  }, [hasMore, loadingMore, loadMore])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className='bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse'
          >
            <div className='h-4 bg-gray-700 rounded mb-2'></div>
            <div className='h-3 bg-gray-700 rounded mb-4 w-3/4'></div>
            <div className='space-y-2'>
              <div className='h-2 bg-gray-700 rounded w-1/2'></div>
              <div className='h-2 bg-gray-700 rounded w-2/3'></div>
              <div className='h-2 bg-gray-700 rounded w-1/3'></div>
            </div>
            <div className='mt-4 h-8 bg-gray-700 rounded'></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-400 mb-4'>Error loading Discord accounts: {error}</p>
        <button
          onClick={refresh}
          className='px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors'
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!accounts.length) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-400'>No Discord accounts found matching your filters.</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {accounts.map(account => (
          <DiscordAccountCard key={account.item_id} account={account} />
        ))}
      </div>

      {loadingMore && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(3)].map((_, index) => (
            <div
              key={`loading-${index}`}
              className='bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse'
            >
              <div className='h-4 bg-gray-700 rounded mb-2'></div>
              <div className='h-3 bg-gray-700 rounded mb-4 w-3/4'></div>
              <div className='space-y-2'>
                <div className='h-2 bg-gray-700 rounded w-1/2'></div>
                <div className='h-2 bg-gray-700 rounded w-2/3'></div>
                <div className='h-2 bg-gray-700 rounded w-1/3'></div>
              </div>
              <div className='mt-4 h-8 bg-gray-700 rounded'></div>
            </div>
          ))}
        </div>
      )}

      {!hasMore && accounts.length > 0 && (
        <div className='text-center py-4'>
          <p className='text-gray-400'>No more Discord accounts to load.</p>
        </div>
      )}
    </div>
  )
}

export default InfiniteDiscordAccountsContainer
