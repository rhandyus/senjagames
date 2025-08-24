import { useInfiniteVPNAccounts } from '../hooks/useInfiniteVPNAccounts'
import VPNAccountCard from './VPNAccountCard'

// Skeleton component for loading state
const VPNAccountSkeleton = () => (
  <div className='account bg-gray-900 border border-gray-700 rounded-xl overflow-hidden relative shadow-lg flex flex-col min-h-[400px] animate-pulse'>
    {/* Header skeleton */}
    <div className='bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 border-b border-gray-700'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-gray-600 rounded-full'></div>
          <div className='h-4 w-16 bg-gray-600 rounded'></div>
        </div>
        <div className='text-right'>
          <div className='h-6 w-20 bg-gray-600 rounded mb-1'></div>
          <div className='h-3 w-16 bg-gray-600 rounded'></div>
        </div>
      </div>
    </div>

    {/* Content skeleton */}
    <div className='p-4 space-y-3 flex-1'>
      {/* Status badges */}
      <div className='flex items-center space-x-3'>
        <div className='h-6 w-20 bg-gray-700 rounded-lg'></div>
        <div className='h-6 w-24 bg-gray-700 rounded-lg'></div>
      </div>

      {/* VPN service section */}
      <div className='h-16 w-full bg-gray-700 rounded-lg'></div>

      {/* Account details section */}
      <div className='space-y-2'>
        <div className='h-6 w-32 bg-gray-700 rounded'></div>
        <div className='space-y-2'>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600'
            >
              <div className='w-4 h-4 bg-gray-600 rounded mr-3'></div>
              <div className='flex-1'>
                <div className='h-3 w-16 bg-gray-600 rounded mb-1'></div>
                <div className='h-4 w-24 bg-gray-600 rounded'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Footer skeleton */}
    <div className='bg-gray-800 px-4 py-3 border-t border-gray-700'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center space-x-2'>
          <div className='w-4 h-4 bg-gray-600 rounded'></div>
          <div className='h-3 w-16 bg-gray-600 rounded'></div>
        </div>
        <div className='h-3 w-20 bg-gray-600 rounded'></div>
      </div>
      <div className='h-10 w-full bg-gray-600 rounded-lg'></div>
    </div>
  </div>
)

const InfiniteVPNAccountsContainer = ({ filters = {} }) => {
  const { accounts, loading, error, hasNextPage, totalItems, loadMore, refresh } =
    useInfiniteVPNAccounts(filters)

  console.log('🔍 VPN Container Debug:', {
    accounts: accounts?.length,
    loading,
    error,
    hasNextPage,
    totalItems
  })

  // Loading state
  if (loading && accounts.length === 0) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(12)].map((_, i) => (
            <VPNAccountSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error && accounts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 space-y-4'>
        <div className='text-6xl'>😔</div>
        <h3 className='text-xl font-semibold text-gray-200'>Something went wrong</h3>
        <p className='text-gray-400 text-center max-w-md'>
          We couldn't load the VPN accounts. Please check your connection and try again.
        </p>
        <p className='text-sm text-red-400 font-mono bg-red-900/20 px-3 py-1 rounded'>
          Error: {error || 'Unknown error'}
        </p>
        <button
          onClick={() => refresh()}
          className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
        >
          Try Again
        </button>
      </div>
    )
  }

  // No results state
  if (accounts.length === 0 && !loading && !error) {
    return (
      <div className='flex flex-col items-center justify-center py-20 space-y-4'>
        <div className='text-6xl'>🌐</div>
        <h3 className='text-xl font-semibold text-gray-200'>No VPN accounts found</h3>
        <p className='text-gray-400 text-center max-w-md'>
          Try adjusting your filters or check back later for new accounts.
        </p>
        <button
          onClick={() => refresh()}
          className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
        >
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Account Grid - Max 3 cards per row */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {accounts.map((account, index) => (
          <VPNAccountCard key={`${account.item_id || account.id}-${index}`} account={account} />
        ))}
      </div>

      {/* Loading more indicator */}
      {loading && accounts.length > 0 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(6)].map((_, i) => (
            <VPNAccountSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {/* Load more button or end message */}
      <div className='flex justify-center py-8'>
        {hasNextPage ? (
          <button
            onClick={() => loadMore()}
            disabled={loading}
            className='px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
          >
            {loading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                <span>Loading...</span>
              </>
            ) : (
              <span>Load More VPN Accounts</span>
            )}
          </button>
        ) : accounts.length > 0 ? (
          <div className='text-center text-gray-400'>
            <p className='text-sm'>You've seen all available VPN accounts</p>
            <p className='text-xs mt-1'>Total: {accounts.length} accounts</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default InfiniteVPNAccountsContainer
