import { useEffect, useRef } from 'react'
import { useCart } from '../context/CartContext'
import useInfiniteUplayAccounts from '../hooks/useInfiniteUplayAccounts'
import UplayAccountCard from './UplayAccountCard'

const InfiniteUplayAccountsContainer = ({ filters = {} }) => {
  const { accounts, hasMore, loading, loadingMore, error, loadMoreAccounts } =
    useInfiniteUplayAccounts(filters)
  const { addToCart } = useCart()
  const hasTriggeredLoadRef = useRef(false)

  const handleAddToCart = account => {
    addToCart({
      id: account.item_id || account.id,
      title: account.title || 'Uplay Account',
      price: account.price,
      currency: account.currency || 'usd',
      type: 'uplay'
    })
  }

  const handleViewDetails = account => {
    console.log('View details for account:', account)
  }

  // Window scroll handler for infinite scroll (like Steam)
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 &&
        hasMore &&
        !loadingMore &&
        !hasTriggeredLoadRef.current
      ) {
        hasTriggeredLoadRef.current = true
        loadMoreAccounts()
      }
    }

    // Reset the flag when accounts change
    hasTriggeredLoadRef.current = false

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [accounts.length, loadingMore, hasMore, loadMoreAccounts])

  // Loading skeleton component (like Steam)
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
  if (loading && accounts.length === 0) {
    return (
      <div className='account-container grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
        <LoadingSkeleton count={6} />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-6 text-center max-w-md'>
          <div className='text-red-400 text-lg font-semibold mb-2'>Error Loading Accounts</div>
          <div className='text-red-300 text-sm'>{error}</div>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors'
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='account-container grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
      {accounts.map((account, index) => (
        <UplayAccountCard
          key={account.item_id || account.id || index}
          account={account}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
        />
      ))}

      {/* Loading More Accounts */}
      {loadingMore && <LoadingSkeleton count={3} />}
    </div>
  )
}

export default InfiniteUplayAccountsContainer
