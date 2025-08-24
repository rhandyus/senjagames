import { Icon } from '@iconify/react'
import { useState } from 'react'

const MinecraftFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    // Base parameters
    pmin: '',
    pmax: '',
    order_by: 'price_to_up',
    email_type: '',
    change_nickname: '',
    java: '',
    bedrock: '',
    dungeons: '',
    legends: '',
    ...initialFilters
  })

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleApplyFilters = e => {
    e.preventDefault()
    onFiltersChange?.(filters)
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      pmin: '',
      pmax: '',
      order_by: 'price_to_up',
      email_type: '',
      change_nickname: '',
      java: '',
      bedrock: '',
      dungeons: '',
      legends: ''
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6'>
      {/* Quick Minecraft Filters */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-green-400'>⚒️ Minecraft Quick Filters</h3>
          <button
            onClick={clearAllFilters}
            className='bg-red-700 hover:bg-red-600 text-red-100 hover:text-white px-3 py-1 rounded-lg text-sm transition-colors border border-red-600 hover:border-red-500'
          >
            Clear All Filters
          </button>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4'>
          {/* MFA Button */}
          <button
            onClick={() => handleFilterChange('email_type', 'autoreg')}
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
              filters.email_type === 'autoreg'
                ? 'bg-green-600 hover:bg-green-500 text-white border-green-500'
                : 'bg-gray-800 hover:bg-green-600 text-gray-300 hover:text-white border-gray-600 hover:border-green-500'
            }`}
          >
            <Icon icon='mdi:minecraft' className='text-lg' />
            <span>MFA</span>
          </button>

          {/* Java Edition */}
          <button
            onClick={() => handleFilterChange('java', filters.java === 'yes' ? '' : 'yes')}
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
              filters.java === 'yes'
                ? 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500'
                : 'bg-gray-800 hover:bg-orange-600 text-gray-300 hover:text-white border-gray-600 hover:border-orange-500'
            }`}
          >
            <Icon icon='mdi:coffee' className='text-lg' />
            <span>Java</span>
          </button>

          {/* Bedrock Edition */}
          <button
            onClick={() => handleFilterChange('bedrock', filters.bedrock === 'yes' ? '' : 'yes')}
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
              filters.bedrock === 'yes'
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
                : 'bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white border-gray-600 hover:border-blue-500'
            }`}
          >
            <Icon icon='mdi:cube-outline' className='text-lg' />
            <span>Bedrock</span>
          </button>

          {/* No Hypixel Ban */}
          <button
            onClick={() =>
              handleFilterChange('hypixel_ban', filters.hypixel_ban === 'no' ? '' : 'no')
            }
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
              filters.hypixel_ban === 'no'
                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500'
                : 'bg-gray-800 hover:bg-purple-600 text-gray-300 hover:text-white border-gray-600 hover:border-purple-500'
            }`}
          >
            <Icon icon='mdi:shield-check' className='text-lg' />
            <span>No Hypixel Ban</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleApplyFilters}>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Price Range */}
          <div className='space-y-3'>
            <label className='block text-sm font-medium text-gray-300'>Price Range</label>
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                placeholder='Min Price'
                value={filters.pmin}
                onChange={e => handleFilterChange('pmin', e.target.value)}
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
              />
              <input
                type='number'
                placeholder='Max Price'
                value={filters.pmax}
                onChange={e => handleFilterChange('pmax', e.target.value)}
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
              />
            </div>
          </div>

          {/* Mail Access */}
          <div className='space-y-3'>
            <label className='block text-sm font-medium text-gray-300'>Mail Access</label>
            <div className='flex space-x-2'>
              <button
                type='button'
                onClick={() => handleFilterChange('email_type', '')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.email_type === ''
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Any
              </button>
              <button
                type='button'
                onClick={() => handleFilterChange('email_type', 'autoreg')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.email_type === 'autoreg'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Yes
              </button>
              <button
                type='button'
                onClick={() => handleFilterChange('email_type', 'no')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.email_type === 'no'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Name Change */}
          <div className='space-y-3'>
            <label className='block text-sm font-medium text-gray-300'>Name Change</label>
            <div className='flex space-x-2'>
              <button
                type='button'
                onClick={() => handleFilterChange('change_nickname', '')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.change_nickname === ''
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Any
              </button>
              <button
                type='button'
                onClick={() => handleFilterChange('change_nickname', 'yes')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.change_nickname === 'yes'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Yes
              </button>
              <button
                type='button'
                onClick={() => handleFilterChange('change_nickname', 'no')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.change_nickname === 'no'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Java Edition */}
          <div className='space-y-3'>
            <label className='block text-sm font-medium text-gray-300'>Java Edition</label>
            <div className='flex space-x-2'>
              <button
                type='button'
                onClick={() => handleFilterChange('java', '')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.java === ''
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Any
              </button>
              <button
                type='button'
                onClick={() => handleFilterChange('java', 'yes')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.java === 'yes'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Yes
              </button>
              <button
                type='button'
                onClick={() => handleFilterChange('java', 'no')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.java === 'no'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Bedrock Edition */}
          <div className='space-y-3'>
            <label className='block text-sm font-medium text-gray-300'>Bedrock Edition</label>
            <div className='flex space-x-2'>
              <button
                type='button'
                onClick={() => handleFilterChange('bedrock', '')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.bedrock === ''
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Any
              </button>
              <button
                type='button'
                onClick={() => handleFilterChange('bedrock', 'yes')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.bedrock === 'yes'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Yes
              </button>
              <button
                type='button'
                onClick={() => handleFilterChange('bedrock', 'no')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.bedrock === 'no'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div className='space-y-3'>
            <label className='block text-sm font-medium text-gray-300'>Sort By</label>
            <select
              value={filters.order_by}
              onChange={e => handleFilterChange('order_by', e.target.value)}
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none w-full'
            >
              <option value='price_to_up'>Price: Low to High</option>
              <option value='price_to_down'>Price: High to Low</option>
              <option value='pdate_to_down'>Newest First</option>
              <option value='pdate_to_up'>Oldest First</option>
            </select>
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className='mt-6 flex space-x-4'>
          <button
            type='submit'
            className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2'
          >
            <Icon icon='mdi:filter' className='text-lg' />
            <span>Apply Filters</span>
          </button>
          <button
            type='button'
            onClick={clearAllFilters}
            className='bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2'
          >
            <Icon icon='mdi:refresh' className='text-lg' />
            <span>Reset</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default MinecraftFilters
