import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import MiHoyoAccountCard from './MiHoyoAccountCard'

const InfiniteMiHoyoAccountsContainer = ({ filters }) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  // Fetch MiHoYo accounts from server endpoint
  const fetchAccounts = async (pageNum = 1, currentFilters = {}) => {
    setLoading(true)
    setError(null)

    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pageNum,
        per_page: 20,
        ...currentFilters
      })

      const response = await fetch(`/api/lzt/mihoyo?${queryParams}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ MiHoYo accounts received:', data)

      if (data.items && Array.isArray(data.items)) {
        if (pageNum === 1) {
          setAccounts(data.items)
        } else {
          setAccounts(prev => [...prev, ...data.items])
        }

        setHasMore(data.items.length >= 20)
        setPage(pageNum)
      } else {
        setError('No accounts found')
        setHasMore(false)
      }
    } catch (err) {
      console.error('❌ Error fetching MiHoYo accounts:', err)
      setError(err.message || 'Failed to fetch MiHoYo accounts')
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  // Load more accounts
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchAccounts(page + 1, filters)
    }
  }

  // Initial load and when filters change
  useEffect(() => {
    fetchAccounts(1, filters)
  }, [filters])

  // Handle add to cart
  const handleAddToCart = account => {
    // Add to cart logic here
  }

  // Handle wishlist
  const handleWishlist = (account, isWishlisted) => {
    // Wishlist logic here
  }

  if (loading && accounts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 space-y-4'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500'></div>
        <div className='text-gray-400 text-lg'>Loading MiHoYo accounts...</div>
        <div className='text-gray-500 text-sm'>Searching for the best deals</div>
      </div>
    )
  }

  if (error && accounts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 space-y-4'>
        <div className='bg-red-900 border border-red-700 text-red-100 px-6 py-4 rounded-lg'>
          <div className='flex items-center space-x-2'>
            <Icon icon='mdi:alert-circle' className='text-red-400' />
            <div>
              <p className='font-medium'>Error loading MiHoYo accounts</p>
              <p className='text-sm mt-1'>{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchAccounts(1, filters)}
            className='mt-3 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Accounts Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
        {accounts.map((account, index) => (
          <MiHoyoAccountCard
            key={account.id || index}
            account={account}
            onAddToCart={handleAddToCart}
            onWishlist={handleWishlist}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && accounts.length > 0 && (
        <div className='flex justify-center'>
          <button
            onClick={loadMore}
            disabled={loading}
            className='bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition-colors'
          >
            {loading ? (
              <div className='flex items-center space-x-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                <span>Loading...</span>
              </div>
            ) : (
              'Load More Accounts'
            )}
          </button>
        </div>
      )}

      {/* No More Results */}
      {!hasMore && accounts.length > 0 && (
        <div className='text-center py-8'>
          <div className='text-gray-400 text-lg'>You've reached the end!</div>
          <div className='text-gray-500 text-sm'>No more MiHoYo accounts to load</div>
        </div>
      )}
    </div>
  )
}

export default InfiniteMiHoyoAccountsContainer
