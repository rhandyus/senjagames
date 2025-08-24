import { Icon } from '@iconify/react'
import { useState } from 'react'

const DiscordFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    search: '',
    email_access: false,
    phone_verified: false,
    nitro: false,
    min_price: '',
    max_price: '',
    min_servers: '',
    max_servers: '',
    min_friends: '',
    max_friends: '',
    ...initialFilters
  })

  const updateFilters = newFilters => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)

    // Only send non-empty filters to parent
    const cleanFilters = Object.entries(updatedFilters)
      .filter(([key, value]) => {
        if (typeof value === 'boolean') return value === true
        if (typeof value === 'string') return value.trim() !== ''
        return value !== null && value !== undefined
      })
      .reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {})

    onFiltersChange(cleanFilters)
  }

  const resetFilters = () => {
    const defaultFilters = {
      search: '',
      email_access: false,
      phone_verified: false,
      nitro: false,
      min_price: '',
      max_price: '',
      min_servers: '',
      max_servers: '',
      min_friends: '',
      max_friends: ''
    }
    updateFilters(defaultFilters)
  }

  const quickPriceFilters = [
    { label: 'Under $5', max: '5' },
    { label: '$5-$15', min: '5', max: '15' },
    { label: '$15-$30', min: '15', max: '30' },
    { label: 'Over $30', min: '30' }
  ]

  const applyQuickPrice = (min, max) => {
    updateFilters({
      min_price: min || '',
      max_price: max || ''
    })
  }

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-xl p-6 sticky top-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-white text-xl font-bold flex items-center space-x-2'>
          <Icon icon='logos:discord-icon' className='text-2xl' />
          <span>Discord Filters</span>
        </h3>
        <button
          onClick={resetFilters}
          className='text-gray-400 hover:text-white text-sm font-medium flex items-center space-x-1 transition-colors'
        >
          <Icon icon='mdi:refresh' className='text-lg' />
          <span>Reset</span>
        </button>
      </div>

      <div className='space-y-6'>
        {/* Search */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-2'>Search Accounts</label>
          <div className='relative'>
            <Icon
              icon='mdi:magnify'
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
            />
            <input
              type='text'
              value={filters.search}
              onChange={e => updateFilters({ search: e.target.value })}
              placeholder='Search Discord accounts...'
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Account Features */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-3'>Account Features</label>
          <div className='space-y-3'>
            <label className='flex items-center space-x-3 cursor-pointer'>
              <input
                type='checkbox'
                checked={filters.email_access}
                onChange={e => updateFilters({ email_access: e.target.checked })}
                className='w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2'
              />
              <span className='text-gray-300'>Email Access</span>
            </label>

            <label className='flex items-center space-x-3 cursor-pointer'>
              <input
                type='checkbox'
                checked={filters.phone_verified}
                onChange={e => updateFilters({ phone_verified: e.target.checked })}
                className='w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2'
              />
              <span className='text-gray-300'>Phone Verified</span>
            </label>

            <label className='flex items-center space-x-3 cursor-pointer'>
              <input
                type='checkbox'
                checked={filters.nitro}
                onChange={e => updateFilters({ nitro: e.target.checked })}
                className='w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2'
              />
              <span className='text-gray-300 flex items-center space-x-1'>
                <span>Discord Nitro</span>
                <Icon icon='simple-icons:discord' className='text-purple-400 text-sm' />
              </span>
            </label>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-3'>Price Range</label>
          <div className='grid grid-cols-2 gap-3 mb-3'>
            <input
              type='number'
              value={filters.min_price}
              onChange={e => updateFilters({ min_price: e.target.value })}
              placeholder='Min $'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
            <input
              type='number'
              value={filters.max_price}
              onChange={e => updateFilters({ max_price: e.target.value })}
              placeholder='Max $'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>

          {/* Quick Price Filters */}
          <div className='grid grid-cols-2 gap-2'>
            {quickPriceFilters.map((priceFilter, index) => (
              <button
                key={index}
                onClick={() => applyQuickPrice(priceFilter.min, priceFilter.max)}
                className='bg-gray-800 hover:bg-purple-600 border border-gray-600 hover:border-purple-500 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors'
              >
                {priceFilter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Server Count */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-3'>Server Count</label>
          <div className='grid grid-cols-2 gap-3'>
            <input
              type='number'
              value={filters.min_servers}
              onChange={e => updateFilters({ min_servers: e.target.value })}
              placeholder='Min servers'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
            <input
              type='number'
              value={filters.max_servers}
              onChange={e => updateFilters({ max_servers: e.target.value })}
              placeholder='Max servers'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Friend Count */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-3'>Friend Count</label>
          <div className='grid grid-cols-2 gap-3'>
            <input
              type='number'
              value={filters.min_friends}
              onChange={e => updateFilters({ min_friends: e.target.value })}
              placeholder='Min friends'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
            <input
              type='number'
              value={filters.max_friends}
              onChange={e => updateFilters({ max_friends: e.target.value })}
              placeholder='Max friends'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.values(filters).some(
          value =>
            (typeof value === 'boolean' && value === true) ||
            (typeof value === 'string' && value.trim() !== '')
        ) && (
          <div className='pt-4 border-t border-gray-700'>
            <div className='text-gray-300 text-sm font-medium mb-2'>Active Filters:</div>
            <div className='flex flex-wrap gap-2'>
              {Object.entries(filters).map(([key, value]) => {
                if (
                  (typeof value === 'boolean' && value === true) ||
                  (typeof value === 'string' && value.trim() !== '')
                ) {
                  return (
                    <div
                      key={key}
                      className='bg-purple-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1'
                    >
                      <span>
                        {key.replace(/_/g, ' ')}: {value.toString()}
                      </span>
                      <button
                        onClick={() =>
                          updateFilters({ [key]: typeof value === 'boolean' ? false : '' })
                        }
                        className='hover:bg-purple-700 rounded-full p-0.5'
                      >
                        <Icon icon='mdi:close' className='text-xs' />
                      </button>
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscordFilters
