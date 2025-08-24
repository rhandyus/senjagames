import { Icon } from '@iconify/react'
import { useCallback, useMemo, useState } from 'react'

const BattleNetFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    game_type: 'all',
    account_type: 'all',
    email_type: 'all',
    region: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'price_asc',
    ...initialFilters
  })

  // Memoize the filter change handler to prevent infinite loops
  const handleFilterChange = useCallback(
    newFilters => {
      const updatedFilters = { ...filters, ...newFilters }
      setFilters(updatedFilters)
      onFiltersChange(updatedFilters)
    },
    [filters, onFiltersChange]
  )

  // Memoized filter options
  const gameTypes = useMemo(
    () => [
      { value: 'all', label: 'All Games' },
      { value: 'cod', label: 'Call of Duty' },
      { value: 'overwatch', label: 'Overwatch' },
      { value: 'diablo', label: 'Diablo' },
      { value: 'wow', label: 'World of Warcraft' },
      { value: 'hearthstone', label: 'Hearthstone' },
      { value: 'starcraft', label: 'StarCraft' },
      { value: 'heroes', label: 'Heroes of the Storm' }
    ],
    []
  )

  const accountTypes = useMemo(
    () => [
      { value: 'all', label: 'All Types' },
      { value: 'full_access', label: 'Full Access' },
      { value: 'game_only', label: 'Game Only' },
      { value: 'shared', label: 'Shared Account' },
      { value: 'rental', label: 'Rental Account' }
    ],
    []
  )

  const emailTypes = useMemo(
    () => [
      { value: 'all', label: 'All Email Types' },
      { value: 'included', label: 'Email Included' },
      { value: 'changeable', label: 'Email Changeable' },
      { value: 'native', label: 'Native Email' },
      { value: 'autoreg', label: 'Auto-registered' }
    ],
    []
  )

  const regions = useMemo(
    () => [
      { value: 'all', label: 'All Regions' },
      { value: 'na', label: 'North America' },
      { value: 'eu', label: 'Europe' },
      { value: 'asia', label: 'Asia' },
      { value: 'kr', label: 'Korea' },
      { value: 'cn', label: 'China' }
    ],
    []
  )

  const sortOptions = useMemo(
    () => [
      { value: 'price_asc', label: 'Price: Low to High' },
      { value: 'price_desc', label: 'Price: High to Low' },
      { value: 'date_desc', label: 'Newest First' },
      { value: 'date_asc', label: 'Oldest First' },
      { value: 'popularity', label: 'Most Popular' }
    ],
    []
  )

  return (
    <div className='bg-gray-900 rounded-lg p-6 mb-6 border border-gray-700 shadow-lg'>
      {/* Header */}
      <div className='flex items-center space-x-3 mb-6'>
        <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
          <Icon icon='simple-icons:battlenet' className='text-white text-lg' />
        </div>
        <h3 className='text-lg font-semibold text-white'>Filter Battle.net Accounts</h3>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Game Type Filter */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Game Type</label>
          <select
            value={filters.game_type}
            onChange={e => handleFilterChange({ game_type: e.target.value })}
            className='w-full bg-gray-800 border border-gray-600 text-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
          >
            {gameTypes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Account Type Filter */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Account Type</label>
          <select
            value={filters.account_type}
            onChange={e => handleFilterChange({ account_type: e.target.value })}
            className='w-full bg-gray-800 border border-gray-600 text-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
          >
            {accountTypes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Email Type Filter */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Email Access</label>
          <select
            value={filters.email_type}
            onChange={e => handleFilterChange({ email_type: e.target.value })}
            className='w-full bg-gray-800 border border-gray-600 text-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
          >
            {emailTypes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Region</label>
          <select
            value={filters.region}
            onChange={e => handleFilterChange({ region: e.target.value })}
            className='w-full bg-gray-800 border border-gray-600 text-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
          >
            {regions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
        {/* Price Range */}
        <div className='md:col-span-2'>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Price Range (USD)</label>
          <div className='flex space-x-3'>
            <input
              type='number'
              placeholder='Min price'
              value={filters.minPrice}
              onChange={e => handleFilterChange({ minPrice: e.target.value })}
              className='flex-1 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
            />
            <span className='text-gray-400 self-center'>to</span>
            <input
              type='number'
              placeholder='Max price'
              value={filters.maxPrice}
              onChange={e => handleFilterChange({ maxPrice: e.target.value })}
              className='flex-1 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
            />
          </div>
        </div>

        {/* Sort By */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Sort By</label>
          <select
            value={filters.sortBy}
            onChange={e => handleFilterChange({ sortBy: e.target.value })}
            className='w-full bg-gray-800 border border-gray-600 text-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Filters */}
      <div className='mt-6 pt-6 border-t border-gray-700'>
        <div className='flex flex-wrap gap-2'>
          <span className='text-sm text-gray-400 self-center mr-2'>Quick Filters:</span>
          {[
            { label: 'COD Only', filter: { game_type: 'cod' } },
            { label: 'Overwatch 2', filter: { game_type: 'overwatch' } },
            { label: 'Full Access', filter: { account_type: 'full_access' } },
            { label: 'Under $20', filter: { maxPrice: '20' } },
            { label: 'Email Included', filter: { email_type: 'included' } }
          ].map((quickFilter, index) => (
            <button
              key={index}
              onClick={() => handleFilterChange(quickFilter.filter)}
              className='px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-xs hover:bg-blue-600 hover:text-white transition-colors border border-gray-600 hover:border-blue-500'
            >
              {quickFilter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BattleNetFilters
