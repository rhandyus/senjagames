import { Icon } from '@iconify/react'
import { useCallback, useRef, useState } from 'react'
import useInfiniteGiftsAccounts from '../hooks/useInfiniteGiftsAccounts'
import GiftsAccountCard from './GiftsAccountCard'
import GiftsFilters from './GiftsFilters'

const GiftsPage = () => {
  const [filters, setFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)
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

  const handleFiltersChange = useCallback(newFilters => {
    setFilters(newFilters)
  }, [])

  return (
    <div className='min-h-screen bg-gray-900 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='flex items-center justify-center space-x-3 mb-4'>
            <Icon icon='mdi:gift' className='text-4xl text-purple-400' />
            <h1 className='text-4xl font-bold text-white'>Gift Items</h1>
          </div>
          <p className='text-gray-400 max-w-2xl mx-auto'>
            Browse premium gift subscriptions and digital items. Get Discord Nitro, Telegram
            Premium, and more at great prices.
          </p>
        </div>

        {/* Controls */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors'
            >
              <Icon icon='mdi:filter' className='text-purple-400' />
              <span className='text-white'>Filters</span>
              <Icon
                icon={showFilters ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                className='text-gray-400'
              />
            </button>

            <div className='text-sm text-gray-400'>
              {loading ? (
                <div className='flex items-center space-x-2'>
                  <Icon icon='mdi:loading' className='animate-spin text-purple-400' />
                  <span>Loading gifts...</span>
                </div>
              ) : (
                <span>{accounts.length} gift items loaded</span>
              )}
            </div>
          </div>

          <button
            onClick={refetch}
            disabled={loading}
            className='flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors'
          >
            <Icon icon='mdi:refresh' className={loading ? 'animate-spin' : ''} />
            <span className='text-white'>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && <GiftsFilters onFiltersChange={handleFiltersChange} isLoading={loading} />}

        {/* Error State */}
        {error && (
          <div className='bg-red-900 bg-opacity-20 border border-red-700 rounded-xl p-4 mb-6'>
            <div className='flex items-center space-x-2 text-red-400'>
              <Icon icon='mdi:alert-circle' />
              <span className='font-medium'>Error loading gifts</span>
            </div>
            <p className='text-red-300 mt-1 text-sm'>{error}</p>
            <button
              onClick={refetch}
              className='mt-3 bg-red-700 hover:bg-red-600 px-4 py-2 rounded-lg text-white text-sm transition-colors'
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && accounts.length === 0 ? (
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
        ) : (
          /* Accounts Grid */
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {accounts.map((account, index) => (
              <div
                key={account.id}
                ref={index === accounts.length - 1 ? lastAccountElementRef : null}
              >
                <GiftsAccountCard account={account} />
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {loadingMore && (
          <div className='flex items-center justify-center py-8'>
            <div className='flex items-center space-x-2 text-purple-400'>
              <Icon icon='mdi:loading' className='animate-spin' />
              <span>Loading more gifts...</span>
            </div>
          </div>
        )}

        {/* No More Items */}
        {!hasMore && accounts.length > 0 && (
          <div className='text-center py-8'>
            <Icon icon='mdi:check-circle' className='text-green-400 text-2xl mx-auto mb-2' />
            <p className='text-gray-400'>You've reached the end of available gifts</p>
          </div>
        )}

        {/* No Results */}
        {!loading && accounts.length === 0 && !error && (
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
        )}
      </div>
    </div>
  )
}

export default GiftsPage
