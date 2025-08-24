import { Icon } from '@iconify/react'
import { useState } from 'react'

const TikTokFilters = ({ onFiltersChange, className = '' }) => {
  const [filters, setFilters] = useState({
    search: '',
    min_price: '',
    max_price: '',
    email_type: 'any',
    min_followers: '',
    max_followers: '',
    min_likes: '',
    max_likes: '',
    min_videos: '',
    max_videos: '',
    min_coins: '',
    max_coins: '',
    verified: 'any',
    has_email: 'any',
    has_mobile: 'any',
    private_account: 'any',
    has_live_permission: 'any',
    cookie_login: 'any',
    item_origin: ''
  })

  const updateFilters = newFilters => {
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleInputChange = (field, value) => {
    const newFilters = { ...filters, [field]: value }
    updateFilters(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters = {
      search: '',
      min_price: '',
      max_price: '',
      email_type: 'any',
      min_followers: '',
      max_followers: '',
      min_likes: '',
      max_likes: '',
      min_videos: '',
      max_videos: '',
      min_coins: '',
      max_coins: '',
      verified: 'any',
      has_email: 'any',
      has_mobile: 'any',
      private_account: 'any',
      has_live_permission: 'any',
      cookie_login: 'any',
      item_origin: ''
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
    <div className={`bg-gray-900 border border-gray-700 rounded-xl p-6 sticky top-6 ${className}`}>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-white text-xl font-bold flex items-center space-x-2'>
          <Icon icon='logos:tiktok-icon' className='text-2xl' />
          <span>TikTok Filters</span>
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
              placeholder='Search TikTok accounts...'
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Quick Price Filters */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-3'>
            Quick Price Filters
          </label>
          <div className='grid grid-cols-2 gap-2'>
            {quickPriceFilters.map(filter => (
              <button
                key={filter.label}
                onClick={() => applyQuickPrice(filter.min, filter.max)}
                className='px-3 py-2 text-xs bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:bg-pink-600 hover:border-pink-500 hover:text-white transition-colors'
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-2'>Price Range (USD)</label>
          <div className='grid grid-cols-2 gap-2'>
            <input
              type='number'
              value={filters.min_price}
              onChange={e => handleInputChange('min_price', e.target.value)}
              placeholder='Min'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
              min='0'
              step='0.01'
            />
            <input
              type='number'
              value={filters.max_price}
              onChange={e => handleInputChange('max_price', e.target.value)}
              placeholder='Max'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
              min='0'
              step='0.01'
            />
          </div>
        </div>

        {/* Email Access */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-2'>Email Access</label>
          <div className='grid grid-cols-3 gap-2'>
            {['any', 'yes', 'no'].map(option => (
              <button
                key={option}
                onClick={() => handleInputChange('has_email', option)}
                className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                  filters.has_email === option
                    ? 'bg-pink-600 text-white border border-pink-500'
                    : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-2'>Phone Number</label>
          <div className='grid grid-cols-3 gap-2'>
            {['any', 'yes', 'no'].map(option => (
              <button
                key={option}
                onClick={() => handleInputChange('has_mobile', option)}
                className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                  filters.has_mobile === option
                    ? 'bg-pink-600 text-white border border-pink-500'
                    : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Verified Status */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-2'>
            Verification Status
          </label>
          <div className='grid grid-cols-3 gap-2'>
            {['any', 'yes', 'no'].map(option => (
              <button
                key={option}
                onClick={() => handleInputChange('verified', option)}
                className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                  filters.verified === option
                    ? 'bg-pink-600 text-white border border-pink-500'
                    : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700'
                }`}
              >
                {option === 'yes' ? 'Verified' : option === 'no' ? 'Not Verified' : 'Any'}
              </button>
            ))}
          </div>
        </div>

        {/* Followers Range */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-2'>Followers Range</label>
          <div className='grid grid-cols-2 gap-2'>
            <input
              type='number'
              value={filters.min_followers}
              onChange={e => handleInputChange('min_followers', e.target.value)}
              placeholder='Min followers'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
              min='0'
            />
            <input
              type='number'
              value={filters.max_followers}
              onChange={e => handleInputChange('max_followers', e.target.value)}
              placeholder='Max followers'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
              min='0'
            />
          </div>
        </div>

        {/* Likes Range */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-2'>Total Likes Range</label>
          <div className='grid grid-cols-2 gap-2'>
            <input
              type='number'
              value={filters.min_likes}
              onChange={e => handleInputChange('min_likes', e.target.value)}
              placeholder='Min likes'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
              min='0'
            />
            <input
              type='number'
              value={filters.max_likes}
              onChange={e => handleInputChange('max_likes', e.target.value)}
              placeholder='Max likes'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
              min='0'
            />
          </div>
        </div>

        {/* Videos Range */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-2'>Video Count Range</label>
          <div className='grid grid-cols-2 gap-2'>
            <input
              type='number'
              value={filters.min_videos}
              onChange={e => handleInputChange('min_videos', e.target.value)}
              placeholder='Min videos'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
              min='0'
            />
            <input
              type='number'
              value={filters.max_videos}
              onChange={e => handleInputChange('max_videos', e.target.value)}
              placeholder='Max videos'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
              min='0'
            />
          </div>
        </div>

        {/* Coins Range */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-2'>TikTok Coins Range</label>
          <div className='grid grid-cols-2 gap-2'>
            <input
              type='number'
              value={filters.min_coins}
              onChange={e => handleInputChange('min_coins', e.target.value)}
              placeholder='Min coins'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
              min='0'
            />
            <input
              type='number'
              value={filters.max_coins}
              onChange={e => handleInputChange('max_coins', e.target.value)}
              placeholder='Max coins'
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
              min='0'
            />
          </div>
        </div>

        {/* Live Permission */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-2'>
            Live Stream Permission
          </label>
          <div className='grid grid-cols-3 gap-2'>
            {['any', 'yes', 'no'].map(option => (
              <button
                key={option}
                onClick={() => handleInputChange('has_live_permission', option)}
                className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                  filters.has_live_permission === option
                    ? 'bg-pink-600 text-white border border-pink-500'
                    : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Private Account */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-2'>Account Privacy</label>
          <div className='grid grid-cols-3 gap-2'>
            {['any', 'yes', 'no'].map(option => (
              <button
                key={option}
                onClick={() => handleInputChange('private_account', option)}
                className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                  filters.private_account === option
                    ? 'bg-pink-600 text-white border border-pink-500'
                    : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700'
                }`}
              >
                {option === 'yes' ? 'Private' : option === 'no' ? 'Public' : 'Any'}
              </button>
            ))}
          </div>
        </div>

        {/* Cookie Login */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-2'>
            Cookie Login Available
          </label>
          <div className='grid grid-cols-3 gap-2'>
            {['any', 'yes', 'no'].map(option => (
              <button
                key={option}
                onClick={() => handleInputChange('cookie_login', option)}
                className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                  filters.cookie_login === option
                    ? 'bg-pink-600 text-white border border-pink-500'
                    : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Account Origin */}
        <div>
          <label className='block text-gray-300 text-sm font-medium mb-2'>Account Origin</label>
          <select
            value={filters.item_origin}
            onChange={e => handleInputChange('item_origin', e.target.value)}
            className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
          >
            <option value=''>Any Origin</option>
            <option value='autoreg'>Auto Registration</option>
            <option value='stealer'>Stealer</option>
            <option value='personal'>Personal</option>
            <option value='received'>Received</option>
            <option value='purchased'>Purchased</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default TikTokFilters
