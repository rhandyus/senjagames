import { Icon } from '@iconify/react'
import { useCallback, useMemo, useState } from 'react'
import ChatGPTFilters from './ChatGPTFilters'
import InfiniteChatGPTAccountsContainer from './InfiniteChatGPTAccountsContainer'

const ChatGPTPage = () => {
  const [filters, setFilters] = useState({
    subscription_type: 'all',
    account_type: 'all',
    email_type: 'all',
    country: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'price_asc',
    search: ''
  })

  const [showFilters, setShowFilters] = useState(false)

  // Memoized filter handler to prevent infinite re-renders
  const handleFiltersChange = useCallback(newFilters => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }))
  }, [])

  // Memoized filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [filters])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      subscription_type: 'all',
      account_type: 'all',
      email_type: 'all',
      country: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: 'price_asc',
      search: ''
    })
  }, [])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.subscription_type !== 'all') count++
    if (filters.account_type !== 'all') count++
    if (filters.email_type !== 'all') count++
    if (filters.country !== 'all') count++
    if (filters.minPrice) count++
    if (filters.maxPrice) count++
    if (filters.search) count++
    if (filters.sortBy !== 'price_asc') count++
    return count
  }, [filters])

  return (
    <div className='min-h-screen bg-gray-900'>
      {/* Header */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='py-8'>
            <div className='flex items-center space-x-3 mb-4'>
              <Icon icon='simple-icons:openai' className='text-4xl text-green-400' />
              <div>
                <h1 className='text-3xl font-bold text-white'>ChatGPT Accounts</h1>
                <p className='text-gray-300'>Premium AI assistant accounts with various features</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6'>
              <div className='bg-gray-800 rounded-lg p-3 border border-gray-700'>
                <div className='text-green-400 font-semibold'>ChatGPT Plus</div>
                <div className='text-gray-300 text-sm'>Premium subscriptions</div>
              </div>
              <div className='bg-gray-800 rounded-lg p-3 border border-gray-700'>
                <div className='text-blue-400 font-semibold'>API Access</div>
                <div className='text-gray-300 text-sm'>Developer accounts</div>
              </div>
              <div className='bg-gray-800 rounded-lg p-3 border border-gray-700'>
                <div className='text-purple-400 font-semibold'>GPT-4 Ready</div>
                <div className='text-gray-300 text-sm'>Latest model access</div>
              </div>
              <div className='bg-gray-800 rounded-lg p-3 border border-gray-700'>
                <div className='text-yellow-400 font-semibold'>Instant Delivery</div>
                <div className='text-gray-300 text-sm'>Ready to use</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Filter Controls */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0'>
          {/* Filter Toggle Button */}
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg hover:border-purple-500 hover:text-white transition-all duration-200'
            >
              <Icon icon='mdi:filter-variant' className='text-lg' />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className='bg-purple-600 text-white text-xs px-2 py-1 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center'>
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Clear Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className='flex items-center space-x-2 px-3 py-2 bg-red-900 bg-opacity-50 border border-red-700 text-red-400 rounded-lg hover:bg-red-900 hover:bg-opacity-70 transition-all duration-200'
              >
                <Icon icon='mdi:filter-off' className='text-sm' />
                <span className='text-sm'>Clear</span>
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className='relative max-w-md w-full sm:w-auto'>
            <Icon
              icon='mdi:search'
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
            />
            <input
              type='text'
              placeholder='Search ChatGPT accounts...'
              value={filters.search}
              onChange={e => handleFiltersChange({ search: e.target.value })}
              className='w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors'
            />
            {filters.search && (
              <button
                onClick={() => handleFiltersChange({ search: '' })}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
              >
                <Icon icon='mdi:close' />
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className='mb-8'>
            <ChatGPTFilters filters={memoizedFilters} onFiltersChange={handleFiltersChange} />
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className='mb-6'>
            <div className='flex items-center space-x-2 text-sm text-gray-300 mb-3'>
              <Icon icon='mdi:filter' />
              <span>Active filters ({activeFiltersCount})</span>
            </div>
            <div className='flex flex-wrap gap-2'>
              {filters.subscription_type !== 'all' && (
                <span className='inline-flex items-center space-x-1 bg-purple-900 bg-opacity-50 border border-purple-700 text-purple-300 px-3 py-1 rounded-full text-sm'>
                  <span>Type: {filters.subscription_type}</span>
                  <button
                    onClick={() => handleFiltersChange({ subscription_type: 'all' })}
                    className='text-purple-400 hover:text-white ml-1'
                  >
                    <Icon icon='mdi:close' className='text-xs' />
                  </button>
                </span>
              )}
              {filters.account_type !== 'all' && (
                <span className='inline-flex items-center space-x-1 bg-blue-900 bg-opacity-50 border border-blue-700 text-blue-300 px-3 py-1 rounded-full text-sm'>
                  <span>Account: {filters.account_type}</span>
                  <button
                    onClick={() => handleFiltersChange({ account_type: 'all' })}
                    className='text-blue-400 hover:text-white ml-1'
                  >
                    <Icon icon='mdi:close' className='text-xs' />
                  </button>
                </span>
              )}
              {filters.email_type !== 'all' && (
                <span className='inline-flex items-center space-x-1 bg-green-900 bg-opacity-50 border border-green-700 text-green-300 px-3 py-1 rounded-full text-sm'>
                  <span>Email: {filters.email_type}</span>
                  <button
                    onClick={() => handleFiltersChange({ email_type: 'all' })}
                    className='text-green-400 hover:text-white ml-1'
                  >
                    <Icon icon='mdi:close' className='text-xs' />
                  </button>
                </span>
              )}
              {filters.country !== 'all' && (
                <span className='inline-flex items-center space-x-1 bg-yellow-900 bg-opacity-50 border border-yellow-700 text-yellow-300 px-3 py-1 rounded-full text-sm'>
                  <span>Country: {filters.country}</span>
                  <button
                    onClick={() => handleFiltersChange({ country: 'all' })}
                    className='text-yellow-400 hover:text-white ml-1'
                  >
                    <Icon icon='mdi:close' className='text-xs' />
                  </button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className='inline-flex items-center space-x-1 bg-orange-900 bg-opacity-50 border border-orange-700 text-orange-300 px-3 py-1 rounded-full text-sm'>
                  <span>
                    Price: ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                  </span>
                  <button
                    onClick={() => handleFiltersChange({ minPrice: '', maxPrice: '' })}
                    className='text-orange-400 hover:text-white ml-1'
                  >
                    <Icon icon='mdi:close' className='text-xs' />
                  </button>
                </span>
              )}
              {filters.search && (
                <span className='inline-flex items-center space-x-1 bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1 rounded-full text-sm'>
                  <span>Search: "{filters.search}"</span>
                  <button
                    onClick={() => handleFiltersChange({ search: '' })}
                    className='text-gray-400 hover:text-white ml-1'
                  >
                    <Icon icon='mdi:close' className='text-xs' />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Account Container */}
        <InfiniteChatGPTAccountsContainer filters={memoizedFilters} />
      </div>
    </div>
  )
}

export default ChatGPTPage
