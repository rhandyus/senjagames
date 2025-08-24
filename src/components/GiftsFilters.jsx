import { Icon } from '@iconify/react'
import { useCallback, useState } from 'react'

const GiftsFilters = ({ onFiltersChange, isLoading }) => {
  const [filters, setFilters] = useState({
    subscription: '',
    origin: [],
    pmin: '',
    pmax: '',
    title: '',
    sortBy: 'published_date',
    sortOrder: 'desc'
  })

  const handleFilterChange = useCallback(
    (key, value) => {
      const newFilters = { ...filters, [key]: value }
      setFilters(newFilters)

      // Convert filters for API
      const apiFilters = { ...newFilters }

      // Handle array filters
      if (key === 'origin' && Array.isArray(value)) {
        apiFilters['origin[]'] = value
        delete apiFilters.origin
      }

      // Remove empty filters
      Object.keys(apiFilters).forEach(k => {
        if (apiFilters[k] === '' || (Array.isArray(apiFilters[k]) && apiFilters[k].length === 0)) {
          delete apiFilters[k]
        }
      })

      onFiltersChange(apiFilters)
    },
    [filters, onFiltersChange]
  )

  const clearFilters = () => {
    const clearedFilters = {
      subscription: '',
      origin: [],
      pmin: '',
      pmax: '',
      title: '',
      sortBy: 'published_date',
      sortOrder: 'desc'
    }
    setFilters(clearedFilters)
    onFiltersChange({})
  }

  const giftTypes = [
    { value: 'discord_nitro_trial', label: 'Discord Nitro Trial' },
    { value: 'discord_nitro_basic', label: 'Discord Nitro (Basic)' },
    { value: 'discord_nitro', label: 'Discord Nitro' },
    { value: 'telegram_premium', label: 'Telegram Premium' }
  ]

  const originOptions = [
    { value: 'brute', label: 'Brute' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'stealer', label: 'Stealer' },
    { value: 'personal', label: 'Personal' }
  ]

  const sortOptions = [
    { value: 'published_date', label: 'Date Published' },
    { value: 'price', label: 'Price' },
    { value: 'title', label: 'Title' },
    { value: 'view_count', label: 'Views' }
  ]

  return (
    <div className='bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-white flex items-center space-x-2'>
          <Icon icon='mdi:filter' className='text-purple-400' />
          <span>Gift Filters</span>
        </h3>
        <button
          onClick={clearFilters}
          className='text-sm text-gray-400 hover:text-white transition-colors flex items-center space-x-1'
          disabled={isLoading}
        >
          <Icon icon='mdi:refresh' className='text-sm' />
          <span>Clear All</span>
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Gift Type Filter */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-300'>Gift Type</label>
          <select
            value={filters.subscription}
            onChange={e => handleFilterChange('subscription', e.target.value)}
            className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none'
            disabled={isLoading}
          >
            <option value=''>All Gift Types</option>
            {giftTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Origin Filter */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-300'>Origin</label>
          <select
            multiple
            value={filters.origin}
            onChange={e => {
              const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
              handleFilterChange('origin', selectedOptions)
            }}
            className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none'
            disabled={isLoading}
            size='4'
          >
            {originOptions.map(origin => (
              <option key={origin.value} value={origin.value}>
                {origin.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-300'>Price Range (USD)</label>
          <div className='flex space-x-2'>
            <input
              type='number'
              placeholder='Min'
              value={filters.pmin}
              onChange={e => handleFilterChange('pmin', e.target.value)}
              className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none'
              disabled={isLoading}
            />
            <input
              type='number'
              placeholder='Max'
              value={filters.pmax}
              onChange={e => handleFilterChange('pmax', e.target.value)}
              className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none'
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Search and Sort */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-300'>Search & Sort</label>
          <div className='space-y-2'>
            <input
              type='text'
              placeholder='Search title...'
              value={filters.title}
              onChange={e => handleFilterChange('title', e.target.value)}
              className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none'
              disabled={isLoading}
            />
            <div className='flex space-x-1'>
              <select
                value={filters.sortBy}
                onChange={e => handleFilterChange('sortBy', e.target.value)}
                className='flex-1 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none'
                disabled={isLoading}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.sortOrder}
                onChange={e => handleFilterChange('sortOrder', e.target.value)}
                className='bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none'
                disabled={isLoading}
              >
                <option value='desc'>↓</option>
                <option value='asc'>↑</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active filters display */}
      {(filters.subscription ||
        filters.origin.length > 0 ||
        filters.pmin ||
        filters.pmax ||
        filters.title) && (
        <div className='mt-4 pt-4 border-t border-gray-700'>
          <div className='flex flex-wrap gap-2'>
            {filters.subscription && (
              <span className='inline-flex items-center space-x-1 bg-purple-900 bg-opacity-50 text-purple-300 px-2 py-1 rounded-lg text-xs border border-purple-700'>
                <span>Type: {giftTypes.find(g => g.value === filters.subscription)?.label}</span>
                <button
                  onClick={() => handleFilterChange('subscription', '')}
                  className='text-purple-400 hover:text-purple-200'
                >
                  <Icon icon='mdi:close' className='text-xs' />
                </button>
              </span>
            )}
            {filters.origin.map(origin => (
              <span
                key={origin}
                className='inline-flex items-center space-x-1 bg-blue-900 bg-opacity-50 text-blue-300 px-2 py-1 rounded-lg text-xs border border-blue-700'
              >
                <span>{originOptions.find(o => o.value === origin)?.label}</span>
                <button
                  onClick={() =>
                    handleFilterChange(
                      'origin',
                      filters.origin.filter(o => o !== origin)
                    )
                  }
                  className='text-blue-400 hover:text-blue-200'
                >
                  <Icon icon='mdi:close' className='text-xs' />
                </button>
              </span>
            ))}
            {(filters.pmin || filters.pmax) && (
              <span className='inline-flex items-center space-x-1 bg-green-900 bg-opacity-50 text-green-300 px-2 py-1 rounded-lg text-xs border border-green-700'>
                <span>
                  Price: ${filters.pmin || '0'} - ${filters.pmax || '∞'}
                </span>
                <button
                  onClick={() => {
                    handleFilterChange('pmin', '')
                    handleFilterChange('pmax', '')
                  }}
                  className='text-green-400 hover:text-green-200'
                >
                  <Icon icon='mdi:close' className='text-xs' />
                </button>
              </span>
            )}
            {filters.title && (
              <span className='inline-flex items-center space-x-1 bg-yellow-900 bg-opacity-50 text-yellow-300 px-2 py-1 rounded-lg text-xs border border-yellow-700'>
                <span>Search: "{filters.title}"</span>
                <button
                  onClick={() => handleFilterChange('title', '')}
                  className='text-yellow-400 hover:text-yellow-200'
                >
                  <Icon icon='mdi:close' className='text-xs' />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default GiftsFilters
