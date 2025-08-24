import useInfiniteRobloxAccounts from '../hooks/useInfiniteRobloxAccounts'
import RobloxAccountCard from './RobloxAccountCard'

const InfiniteRobloxAccountsContainer = ({ filters = {} }) => {
  const { accounts, loading, hasMore, loadMore, error } = useInfiniteRobloxAccounts(filters)

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMore()
    }
  }

  if (loading && accounts.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='text-center'>
          <div className='inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-red-600 hover:bg-red-500 transition ease-in-out duration-150 cursor-not-allowed'>
            <svg
              className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
            Loading Roblox accounts...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg'>
        <p className='font-medium'>Error loading Roblox accounts:</p>
        <p className='text-sm mt-1'>{error}</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='text-center'>
        <h2 className='text-3xl font-bold text-white mb-2'>Roblox Accounts</h2>
        <p className='text-gray-400'>Premium Roblox accounts from LZT Market</p>
        {accounts.length > 0 && (
          <p className='text-sm text-gray-500 mt-2'>Showing {accounts.length} accounts</p>
        )}
      </div>

      {/* Accounts Grid - Max 3 cards */}
      {accounts.length > 0 ? (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {accounts.map((account, index) => (
              <RobloxAccountCard key={account.item_id || index} account={account} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className='text-center'>
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className='bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-6 py-3 rounded-lg font-medium transition-colors'
              >
                {loading ? (
                  <span className='flex items-center'>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Loading More...
                  </span>
                ) : (
                  'Load More Roblox Accounts'
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className='text-center py-12'>
          <div className='text-6xl mb-4'>🎮</div>
          <h3 className='text-xl font-semibold text-gray-300 mb-2'>No Roblox Accounts Found</h3>
          <p className='text-gray-500'>No Roblox accounts are currently available.</p>
        </div>
      )}
    </div>
  )
}

export default InfiniteRobloxAccountsContainer
