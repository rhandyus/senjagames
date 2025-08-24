import { Icon } from '@iconify/react'
import { useState } from 'react'

const UplayFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    pmin: initialFilters.pmin || '',
    pmax: initialFilters.pmax || '',
    title: initialFilters.title || '',
    country: initialFilters.country || '',
    has_email: initialFilters.has_email || '',
    order_by: initialFilters.order_by || 'updated_at',
    order_dir: initialFilters.order_dir || 'desc',
    ...initialFilters
  })

  const updateFilters = newFilters => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      pmin: '',
      pmax: '',
      title: '',
      country: '',
      has_email: '',
      order_by: 'updated_at',
      order_dir: 'desc'
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  // Quick filter buttons
  const quickFilters = [
    { label: 'Under $10', action: () => updateFilters({ pmin: '', pmax: '10' }) },
    { label: '$10-$25', action: () => updateFilters({ pmin: '10', pmax: '25' }) },
    { label: '$25-$50', action: () => updateFilters({ pmin: '25', pmax: '50' }) },
    { label: 'Over $50', action: () => updateFilters({ pmin: '50', pmax: '' }) }
  ]

  const countries = [
    { value: '', label: 'Any Country' },
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'IT', label: 'Italy' },
    { value: 'ES', label: 'Spain' },
    { value: 'RU', label: 'Russia' },
    { value: 'AU', label: 'Australia' },
    { value: 'BR', label: 'Brazil' },
    { value: 'JP', label: 'Japan' },
    { value: 'KR', label: 'South Korea' },
    { value: 'CN', label: 'China' }
  ]

  const sortOptions = [
    { value: 'updated_at', label: 'Recently Updated' },
    { value: 'published_date', label: 'Recently Published' },
    { value: 'price', label: 'Price' },
    { value: 'view_count', label: 'Most Viewed' },
    { value: 'uplay_last_activity', label: 'Last Activity' }
  ]

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <Icon icon='simple-icons:ubisoft' className='text-blue-400 text-xl' />
          <h3 className='text-lg font-semibold text-white'>Uplay Filters</h3>
        </div>
        <button
          onClick={clearFilters}
          className='text-gray-400 hover:text-white text-sm flex items-center space-x-1 transition-colors'
        >
          <Icon icon='mdi:refresh' />
          <span>Clear All</span>
        </button>
      </div>

      {/* Quick Filters */}
      <div className='space-y-3'>
        <label className='block text-sm font-medium text-gray-300'>Quick Price Filters</label>
        <div className='flex flex-wrap gap-2'>
          {quickFilters.map((filter, index) => (
            <button
              key={index}
              onClick={filter.action}
              className='px-3 py-2 text-xs font-medium bg-gray-800 hover:bg-blue-800 text-gray-300 hover:text-white border border-gray-600 hover:border-blue-500 rounded-lg transition-all duration-200'
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Min Price ($)</label>
          <input
            type='number'
            placeholder='0'
            value={filters.pmin}
            onChange={e => updateFilters({ pmin: e.target.value })}
            className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Max Price ($)</label>
          <input
            type='number'
            placeholder='999'
            value={filters.pmax}
            onChange={e => updateFilters({ pmax: e.target.value })}
            className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
      </div>

      {/* Search */}
      <div>
        <label className='block text-sm font-medium text-gray-300 mb-2'>Search Accounts</label>
        <div className='relative'>
          <Icon
            icon='mdi:magnify'
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
          />
          <input
            type='text'
            placeholder='Search by title, games, or description...'
            value={filters.title}
            onChange={e => updateFilters({ title: e.target.value })}
            className='w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
      </div>

      {/* Country Filter */}
      <div>
        <label className='block text-sm font-medium text-gray-300 mb-2'>Country/Region</label>
        <select
          value={filters.country}
          onChange={e => updateFilters({ country: e.target.value })}
          className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        >
          {countries.map(country => (
            <option key={country.value} value={country.value} className='bg-gray-800'>
              {country.label}
            </option>
          ))}
        </select>
      </div>

      {/* Email Access */}
      <div>
        <label className='block text-sm font-medium text-gray-300 mb-2'>Email Access</label>
        <select
          value={filters.has_email}
          onChange={e => updateFilters({ has_email: e.target.value })}
          className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        >
          <option value='' className='bg-gray-800'>
            Any
          </option>
          <option value='1' className='bg-gray-800'>
            With Email Access
          </option>
          <option value='0' className='bg-gray-800'>
            No Email Access
          </option>
        </select>
      </div>

      {/* Sort Options */}
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Sort By</label>
          <select
            value={filters.order_by}
            onChange={e => updateFilters({ order_by: e.target.value })}
            className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value} className='bg-gray-800'>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Order</label>
          <select
            value={filters.order_dir}
            onChange={e => updateFilters({ order_dir: e.target.value })}
            className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value='desc' className='bg-gray-800'>
              Descending
            </option>
            <option value='asc' className='bg-gray-800'>
              Ascending
            </option>
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.pmin || filters.pmax || filters.title || filters.country || filters.has_email) && (
        <div className='border-t border-gray-700 pt-4'>
          <div className='text-sm font-medium text-gray-300 mb-2'>Active Filters:</div>
          <div className='flex flex-wrap gap-2'>
            {filters.pmin && (
              <span className='inline-flex items-center space-x-1 bg-blue-900 bg-opacity-50 text-blue-300 px-2 py-1 rounded-lg text-xs border border-blue-700'>
                <span>Min: ${filters.pmin}</span>
                <button onClick={() => updateFilters({ pmin: '' })}>
                  <Icon icon='mdi:close' className='text-xs hover:text-blue-200' />
                </button>
              </span>
            )}
            {filters.pmax && (
              <span className='inline-flex items-center space-x-1 bg-blue-900 bg-opacity-50 text-blue-300 px-2 py-1 rounded-lg text-xs border border-blue-700'>
                <span>Max: ${filters.pmax}</span>
                <button onClick={() => updateFilters({ pmax: '' })}>
                  <Icon icon='mdi:close' className='text-xs hover:text-blue-200' />
                </button>
              </span>
            )}
            {filters.title && (
              <span className='inline-flex items-center space-x-1 bg-blue-900 bg-opacity-50 text-blue-300 px-2 py-1 rounded-lg text-xs border border-blue-700'>
                <span>Search: {filters.title}</span>
                <button onClick={() => updateFilters({ title: '' })}>
                  <Icon icon='mdi:close' className='text-xs hover:text-blue-200' />
                </button>
              </span>
            )}
            {filters.country && (
              <span className='inline-flex items-center space-x-1 bg-blue-900 bg-opacity-50 text-blue-300 px-2 py-1 rounded-lg text-xs border border-blue-700'>
                <span>Country: {countries.find(c => c.value === filters.country)?.label}</span>
                <button onClick={() => updateFilters({ country: '' })}>
                  <Icon icon='mdi:close' className='text-xs hover:text-blue-200' />
                </button>
              </span>
            )}
            {filters.has_email && (
              <span className='inline-flex items-center space-x-1 bg-blue-900 bg-opacity-50 text-blue-300 px-2 py-1 rounded-lg text-xs border border-blue-700'>
                <span>Email: {filters.has_email === '1' ? 'Required' : 'Not Required'}</span>
                <button onClick={() => updateFilters({ has_email: '' })}>
                  <Icon icon='mdi:close' className='text-xs hover:text-blue-200' />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default UplayFilters
