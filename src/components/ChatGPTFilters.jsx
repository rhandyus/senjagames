import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'

const ChatGPTFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    subscription_type: 'all',
    account_type: 'all',
    email_type: 'all',
    country: '',
    sort_by: 'newest',
    has_warranty: 'all',
    ...initialFilters
  })

  useEffect(() => {
    const cleanFilters = Object.entries(filters)
      .filter(([_, value]) => value !== '' && value !== 'all')
      .reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {})

    onFiltersChange(cleanFilters)
  }, [filters]) // Remove onFiltersChange from dependency array since it's now stable

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  const handleReset = () => {
    const resetFilters = {
      min_price: '',
      max_price: '',
      subscription_type: 'all',
      account_type: 'all',
      email_type: 'all',
      country: '',
      sort_by: 'newest',
      has_warranty: 'all'
    }
    setFilters(resetFilters)
  }

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-purple-900 bg-opacity-50 rounded-lg border border-purple-700'>
            <Icon icon='simple-icons:openai' className='w-5 h-5 text-purple-400' />
          </div>
          <div>
            <h2 className='text-lg font-bold text-gray-300'>ChatGPT Account Filters</h2>
            <p className='text-sm text-gray-400'>Refine your search for ChatGPT accounts</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className='px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg border border-gray-600 transition-colors flex items-center space-x-2'
        >
          <Icon icon='mdi:refresh' className='w-4 h-4' />
          <span>Reset</span>
        </button>
      </div>

      {/* Filters Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Price Range */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Price Range (USD)</label>
          <div className='flex space-x-2'>
            <input
              type='number'
              placeholder='Min'
              value={filters.min_price}
              onChange={e => handleFilterChange('min_price', e.target.value)}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500'
            />
            <input
              type='number'
              placeholder='Max'
              value={filters.max_price}
              onChange={e => handleFilterChange('max_price', e.target.value)}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500'
            />
          </div>
        </div>

        {/* Subscription Type */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Subscription Type</label>
          <select
            value={filters.subscription_type}
            onChange={e => handleFilterChange('subscription_type', e.target.value)}
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-purple-500'
          >
            <option value='all'>All Types</option>
            <option value='plus'>ChatGPT Plus</option>
            <option value='team'>ChatGPT Team</option>
            <option value='enterprise'>ChatGPT Enterprise</option>
            <option value='free'>Free Account</option>
          </select>
        </div>

        {/* Account Type */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Account Type</label>
          <select
            value={filters.account_type}
            onChange={e => handleFilterChange('account_type', e.target.value)}
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-purple-500'
          >
            <option value='all'>All Types</option>
            <option value='personal'>Personal</option>
            <option value='business'>Business</option>
            <option value='shared'>Shared</option>
          </select>
        </div>

        {/* Email Type */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Email Type</label>
          <select
            value={filters.email_type}
            onChange={e => handleFilterChange('email_type', e.target.value)}
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-purple-500'
          >
            <option value='all'>All Email Types</option>
            <option value='native'>Native Email</option>
            <option value='autoreg'>Auto-reg Email</option>
            <option value='custom'>Custom Email</option>
          </select>
        </div>

        {/* Country */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Country</label>
          <select
            value={filters.country}
            onChange={e => handleFilterChange('country', e.target.value)}
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-purple-500'
          >
            <option value=''>All Countries</option>
            <option value='US'>United States</option>
            <option value='CA'>Canada</option>
            <option value='GB'>United Kingdom</option>
            <option value='DE'>Germany</option>
            <option value='FR'>France</option>
            <option value='AU'>Australia</option>
            <option value='JP'>Japan</option>
            <option value='KR'>South Korea</option>
            <option value='RU'>Russia</option>
            <option value='UA'>Ukraine</option>
          </select>
        </div>

        {/* Sort By */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Sort By</label>
          <select
            value={filters.sort_by}
            onChange={e => handleFilterChange('sort_by', e.target.value)}
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-purple-500'
          >
            <option value='newest'>Newest First</option>
            <option value='oldest'>Oldest First</option>
            <option value='price_low'>Price: Low to High</option>
            <option value='price_high'>Price: High to Low</option>
            <option value='most_viewed'>Most Viewed</option>
          </select>
        </div>

        {/* Has Warranty */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Warranty</label>
          <select
            value={filters.has_warranty}
            onChange={e => handleFilterChange('has_warranty', e.target.value)}
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-purple-500'
          >
            <option value='all'>All Accounts</option>
            <option value='true'>With Warranty</option>
            <option value='false'>No Warranty</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className='mt-4'>
        <div className='flex flex-wrap gap-2'>
          {Object.entries(filters)
            .filter(([_, value]) => value !== '' && value !== 'all' && value !== 'newest')
            .map(([key, value]) => (
              <span
                key={key}
                className='inline-flex items-center space-x-1 px-3 py-1 bg-purple-900 bg-opacity-50 text-purple-400 text-xs rounded-full border border-purple-700'
              >
                <span>
                  {key.replace(/_/g, ' ')}: {value}
                </span>
                <button
                  onClick={() => handleFilterChange(key, key === 'sort_by' ? 'newest' : 'all')}
                  className='hover:text-purple-300'
                >
                  <Icon icon='mdi:close' className='w-3 h-3' />
                </button>
              </span>
            ))}
        </div>
      </div>
    </div>
  )
}

export default ChatGPTFilters
