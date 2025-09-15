import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'

const MinecraftFilters = ({ onFiltersChange, initialFilters = {} }) => {
  // Exchange rate from environment variable for USD to IDR conversion
  const USD_TO_IDR = parseFloat(import.meta.env.VITE_USD_TO_IDR_RATE) || 15500
  const IDR_TO_USD = 1 / USD_TO_IDR

  // Convert USD to IDR for display
  const usdToIdr = usdValue => {
    if (!usdValue || usdValue === '') return ''
    return Math.round(parseFloat(usdValue) * USD_TO_IDR).toString()
  }

  // Convert IDR to USD for API
  const idrToUsd = idrValue => {
    if (!idrValue || idrValue === '') return ''
    return (parseFloat(idrValue) * IDR_TO_USD).toFixed(2)
  }

  // Initialize display filters (in IDR) from API filters (in USD)
  const [displayFilters, setDisplayFilters] = useState({
    pmin: usdToIdr(initialFilters.pmin) || '', // Convert USD to IDR for display
    pmax: usdToIdr(initialFilters.pmax) || '',
    order_by: initialFilters.order_by || 'price_to_up',
    email_login_data: initialFilters.email_login_data || '', // Use correct LZT API parameter
    change_nickname: initialFilters.change_nickname || '',
    java: initialFilters.java || '',
    bedrock: initialFilters.bedrock || '',
    dungeons: initialFilters.dungeons || '',
    legends: initialFilters.legends || ''
  })

  // Convert display filters to API filters and send to parent
  const sendFiltersToParent = filters => {
    const apiFilters = {
      ...filters,
      pmin: idrToUsd(filters.pmin),
      pmax: idrToUsd(filters.pmax)
    }
    onFiltersChange?.(apiFilters)
  }

  // Call onFiltersChange with initial filters on mount
  useEffect(() => {
    // Send initial filters without minimum price constraint (USD-based)
    const initialApiFilters = {
      pmin: idrToUsd(displayFilters.pmin) || '', // Remove hardcoded minimum
      pmax: idrToUsd(displayFilters.pmax) || '',
      order_by: initialFilters.order_by || 'price_to_up',
      email_login_data: initialFilters.email_login_data || '', // Use correct LZT API parameter
      change_nickname: initialFilters.change_nickname || '',
      java: initialFilters.java || '',
      bedrock: initialFilters.bedrock || '',
      dungeons: initialFilters.dungeons || '',
      legends: initialFilters.legends || ''
    }
    console.log('🔧 MinecraftFilters sending initial filters (USD-based):', initialApiFilters)
    onFiltersChange?.(initialApiFilters)
  }, []) // Empty dependency array to run only on mount

  const handleFilterChange = (key, value) => {
    const newDisplayFilters = { ...displayFilters, [key]: value }
    setDisplayFilters(newDisplayFilters)
    sendFiltersToParent(newDisplayFilters)
  }

  const handleApplyFilters = e => {
    e.preventDefault()
    sendFiltersToParent(displayFilters)
  }

  const clearAllFilters = () => {
    const clearedDisplayFilters = {
      pmin: '',
      pmax: '',
      order_by: 'price_to_up',
      email_login_data: '', // Use correct LZT API parameter
      change_nickname: '',
      java: '',
      bedrock: '',
      dungeons: '',
      legends: ''
    }
    setDisplayFilters(clearedDisplayFilters)
    sendFiltersToParent(clearedDisplayFilters)
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
            onClick={() =>
              handleFilterChange(
                'email_login_data',
                displayFilters.email_login_data === 'true' ? '' : 'true'
              )
            }
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
              displayFilters.email_login_data === 'true'
                ? 'bg-green-600 hover:bg-green-500 text-white border-green-500'
                : 'bg-gray-800 hover:bg-green-600 text-gray-300 hover:text-white border-gray-600 hover:border-green-500'
            }`}
          >
            <Icon icon='mdi:email-check' className='text-lg' />
            <span>Email Access</span>
          </button>

          {/* Java Edition */}
          <button
            onClick={() => handleFilterChange('java', displayFilters.java === 'yes' ? '' : 'yes')}
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
              displayFilters.java === 'yes'
                ? 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500'
                : 'bg-gray-800 hover:bg-orange-600 text-gray-300 hover:text-white border-gray-600 hover:border-orange-500'
            }`}
          >
            <Icon icon='mdi:coffee' className='text-lg' />
            <span>Java</span>
          </button>

          {/* Bedrock Edition */}
          <button
            onClick={() =>
              handleFilterChange('bedrock', displayFilters.bedrock === 'yes' ? '' : 'yes')
            }
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
              displayFilters.bedrock === 'yes'
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
                : 'bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white border-gray-600 hover:border-blue-500'
            }`}
          >
            <Icon icon='mdi:cube-outline' className='text-lg' />
            <span>Bedrock</span>
          </button>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4'>
          {/* No Hypixel Ban */}
          <button
            onClick={() =>
              handleFilterChange('hypixel_ban', displayFilters.hypixel_ban === 'no' ? '' : 'no')
            }
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
              displayFilters.hypixel_ban === 'no'
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
          {/* Mail Access */}
          <div className='space-y-3'>
            <label className='block text-sm font-medium text-gray-300'>Mail Access</label>
            <div className='flex space-x-2'>
              <button
                type='button'
                onClick={() => handleFilterChange('email_login_data', '')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  displayFilters.email_login_data === ''
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Any
              </button>
              <button
                type='button'
                onClick={() => handleFilterChange('email_login_data', 'true')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  displayFilters.email_login_data === 'true'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Yes
              </button>
              <button
                type='button'
                onClick={() => handleFilterChange('email_login_data', 'false')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  displayFilters.email_login_data === 'false'
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
                  displayFilters.change_nickname === ''
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
                  displayFilters.change_nickname === 'yes'
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
                  displayFilters.change_nickname === 'no'
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
                  displayFilters.java === ''
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
                  displayFilters.java === 'yes'
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
                  displayFilters.java === 'no'
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
                  displayFilters.bedrock === ''
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
                  displayFilters.bedrock === 'yes'
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
                  displayFilters.bedrock === 'no'
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
              value={displayFilters.order_by}
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
            <span>Terapkan Filter</span>
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
