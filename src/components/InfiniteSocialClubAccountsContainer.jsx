import { useCart } from '../context/CartContext'
import useInfiniteSocialClubAccounts from '../hooks/useInfiniteSocialClubAccounts'
import SocialClubAccountCard from './SocialClubAccountCard'

const InfiniteSocialClubAccountsContainer = ({ filters = {} }) => {
  const { accounts, hasMore, loading, error, loadMore } = useInfiniteSocialClubAccounts(filters)
  const { addToCart } = useCart()

  const handleAddToCart = account => {
    addToCart({
      id: account.id,
      title: account.title,
      price: account.priceWithFee || account.price,
      currency: account.currency,
      platform: 'Social Club',
      type: 'account',
      details: {
        level: account.level || account.socialClubLevel,
        cash: account.cash || account.socialClubCash,
        bankCash: account.bankCash || account.socialClubBankCash,
        games: account.games || account.socialClubGames,
        emailProvider: account.emailProvider,
        itemOrigin: account.itemOrigin
      }
    })
  }

  const handleViewDetails = account => {
    console.log('📋 Social Club Account Details:', account)
    // You can implement a modal or navigate to a details page here
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <div className='text-red-600 mb-4'>
          <svg
            className='w-12 h-12 mx-auto mb-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <p className='text-lg font-semibold'>Error loading Social Club accounts</p>
          <p className='text-sm'>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className='bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg'
        >
          Retry
        </button>
      </div>
    )
  }

  if (accounts.length === 0 && !loading) {
    return (
      <div className='text-center py-12'>
        <div className='text-gray-400 mb-4'>
          <svg
            className='w-16 h-16 mx-auto mb-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V9a2 2 0 012 2v2m0 0v2a2 2 0 01-2 2h-2m0 0H9a2 2 0 01-2-2v-2m0 0V9a2 2 0 012-2h2'
            />
          </svg>
          <h3 className='text-xl font-semibold text-gray-600 mb-2'>
            No Social Club accounts found
          </h3>
          <p className='text-gray-500'>Try adjusting your filters or check back later</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Accounts Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
        {accounts.map(account => (
          <SocialClubAccountCard
            key={account.id}
            account={account}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {/* Load More Section */}
      {hasMore && (
        <div className='text-center py-8'>
          <button
            onClick={loadMore}
            disabled={loading}
            className='bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed'
          >
            {loading ? (
              <span className='flex items-center space-x-2'>
                <svg className='animate-spin h-5 w-5' fill='none' viewBox='0 0 24 24'>
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
                <span>Loading Social Club accounts...</span>
              </span>
            ) : (
              'Load More Accounts'
            )}
          </button>
        </div>
      )}

      {/* Loading Initial Content */}
      {loading && accounts.length === 0 && (
        <div className='text-center py-12'>
          <div className='flex flex-col items-center space-y-4'>
            <svg className='animate-spin h-12 w-12 text-orange-600' fill='none' viewBox='0 0 24 24'>
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
            <p className='text-lg font-medium text-gray-600'>Loading Social Club accounts...</p>
            <p className='text-sm text-gray-500'>Please wait while we fetch the latest accounts</p>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {accounts.length > 0 && (
        <div className='text-center text-sm text-gray-500 border-t pt-4'>
          Showing {accounts.length} Social Club accounts
          {hasMore && ' • Load more to see additional results'}
        </div>
      )}
    </div>
  )
}

export default InfiniteSocialClubAccountsContainer
