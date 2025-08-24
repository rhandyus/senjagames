import { useCallback, useState } from 'react'

const RobloxFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    min_robux: '',
    max_robux: '',
    premium: '',
    has_pets: '',
    has_limiteds: '',
    email_type: '',
    order_by: 'price',
    order: 'asc',
    ...initialFilters
  })

  console.log('🎮 Roblox Filters rendered with:', filters)

  const updateFilters = useCallback(
    newFilters => {
      console.log('🎮 Roblox Filters updating:', newFilters)
      const updatedFilters = { ...filters, ...newFilters }
      setFilters(updatedFilters)

      // Clean up empty filters before sending
      const cleanFilters = Object.fromEntries(
        Object.entries(updatedFilters).filter(([_, value]) => value !== '' && value !== null)
      )

      onFiltersChange(cleanFilters)
    },
    [filters, onFiltersChange]
  )

  const resetFilters = () => {
    console.log('🎮 Roblox Filters reset')
    const emptyFilters = {
      min_price: '',
      max_price: '',
      min_robux: '',
      max_robux: '',
      premium: '',
      has_pets: '',
      has_limiteds: '',
      email_type: '',
      order_by: 'price',
      order: 'asc'
    }
    setFilters(emptyFilters)
    onFiltersChange({})
  }

  return (
    <div className='bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-3'>
          <div className='w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center'>
            <svg viewBox='0 0 24 24' className='w-5 h-5 text-white' fill='currentColor'>
              <path d='M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2M12 6.5L11.5 8.5L9.5 9L11.5 9.5L12 11.5L12.5 9.5L14.5 9L12.5 8.5L12 6.5Z' />
            </svg>
          </div>
          <h3 className='text-xl font-semibold text-white'>Filter Roblox Accounts</h3>
        </div>
        <button
          onClick={resetFilters}
          className='px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors'
        >
          Reset
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
        {/* Price Range */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Price Range (USD)</label>
          <div className='flex space-x-2'>
            <input
              type='number'
              placeholder='Min'
              value={filters.min_price}
              onChange={e => updateFilters({ min_price: e.target.value })}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'
            />
            <input
              type='number'
              placeholder='Max'
              value={filters.max_price}
              onChange={e => updateFilters({ max_price: e.target.value })}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'
            />
          </div>
        </div>

        {/* Robux Balance */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Robux Balance</label>
          <div className='flex space-x-2'>
            <input
              type='number'
              placeholder='Min R$'
              value={filters.min_robux}
              onChange={e => updateFilters({ min_robux: e.target.value })}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'
            />
            <input
              type='number'
              placeholder='Max R$'
              value={filters.max_robux}
              onChange={e => updateFilters({ max_robux: e.target.value })}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'
            />
          </div>
        </div>

        {/* Premium Status */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Premium Status</label>
          <select
            value={filters.premium}
            onChange={e => updateFilters({ premium: e.target.value })}
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'
          >
            <option value=''>Any</option>
            <option value='true'>Premium</option>
            <option value='false'>No Premium</option>
          </select>
        </div>

        {/* Email Type */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Email Type</label>
          <select
            value={filters.email_type}
            onChange={e => updateFilters({ email_type: e.target.value })}
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'
          >
            <option value=''>Any Email</option>
            <option value='gmail'>Gmail</option>
            <option value='outlook'>Outlook</option>
            <option value='yahoo'>Yahoo</option>
            <option value='temp'>Temp Mail</option>
          </select>
        </div>
      </div>

      {/* Additional Filters Row */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
        {/* Has Pets */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Pets</label>
          <select
            value={filters.has_pets}
            onChange={e => updateFilters({ has_pets: e.target.value })}
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'
          >
            <option value=''>Any</option>
            <option value='true'>Has Pets</option>
            <option value='false'>No Pets</option>
          </select>
        </div>

        {/* Has Limiteds */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Limited Items</label>
          <select
            value={filters.has_limiteds}
            onChange={e => updateFilters({ has_limiteds: e.target.value })}
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'
          >
            <option value=''>Any</option>
            <option value='true'>Has Limiteds</option>
            <option value='false'>No Limiteds</option>
          </select>
        </div>

        {/* Sort Options */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Sort By</label>
          <div className='flex space-x-2'>
            <select
              value={filters.order_by}
              onChange={e => updateFilters({ order_by: e.target.value })}
              className='w-2/3 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'
            >
              <option value='price'>Price</option>
              <option value='robux'>Robux</option>
              <option value='date'>Date Added</option>
            </select>
            <select
              value={filters.order}
              onChange={e => updateFilters({ order: e.target.value })}
              className='w-1/3 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'
            >
              <option value='asc'>↑</option>
              <option value='desc'>↓</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RobloxFilters
