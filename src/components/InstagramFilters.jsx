import { useEffect, useState } from 'react'

const InstagramFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    minFollowers: '',
    maxFollowers: '',
    minFollowing: '',
    maxFollowing: '',
    minPosts: '',
    maxPosts: '',
    emailType: '',
    hasCookies: '',
    mobileVerified: '',
    country: '',
    minPrice: '',
    maxPrice: '',
    allowDiscount: '',
    hasGuarantee: '',
    ...initialFilters
  })

  const [isExpanded, setIsExpanded] = useState(false)

  // Update filters when they change
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

  const clearFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = ''
      return acc
    }, {})
    setFilters(clearedFilters)
  }

  const emailTypeOptions = [
    { value: '', label: 'Any Email Type' },
    { value: 'native', label: 'Native Email' },
    { value: 'autoreg', label: 'Auto-registered' },
    { value: 'custom', label: 'Custom Domain' }
  ]

  const booleanOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: 'Yes' },
    { value: '0', label: 'No' }
  ]

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-purple-400 flex items-center space-x-2'>
            <span className='text-2xl'>📷</span>
            <span>Instagram Filters</span>
          </h3>
          <button
            onClick={clearFilters}
            className='bg-red-700 hover:bg-red-600 text-red-100 hover:text-white px-3 py-1 rounded-lg text-sm transition-colors border border-red-600 hover:border-red-500'
          >
            Clear All Filters
          </button>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='w-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors border border-gray-600 hover:border-gray-500 flex items-center justify-between'
        >
          <span>Filter Instagram accounts by your preferences</span>
          <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
          </svg>
        </button>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className='space-y-6'>
          {/* Followers Range */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Followers Range</label>
            <div className='grid grid-cols-2 gap-3'>
              <input
                type='number'
                placeholder='Min followers'
                value={filters.minFollowers}
                onChange={e => handleFilterChange('minFollowers', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
              />
              <input
                type='number'
                placeholder='Max followers'
                value={filters.maxFollowers}
                onChange={e => handleFilterChange('maxFollowers', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
              />
            </div>
          </div>

          {/* Following Range */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Following Range</label>
            <div className='grid grid-cols-2 gap-3'>
              <input
                type='number'
                placeholder='Min following'
                value={filters.minFollowing}
                onChange={e => handleFilterChange('minFollowing', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
              />
              <input
                type='number'
                placeholder='Max following'
                value={filters.maxFollowing}
                onChange={e => handleFilterChange('maxFollowing', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
              />
            </div>
          </div>

          {/* Posts Range */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Posts Count Range</label>
            <div className='grid grid-cols-2 gap-3'>
              <input
                type='number'
                placeholder='Min posts'
                value={filters.minPosts}
                onChange={e => handleFilterChange('minPosts', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
              />
              <input
                type='number'
                placeholder='Max posts'
                value={filters.maxPosts}
                onChange={e => handleFilterChange('maxPosts', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
              />
            </div>
          </div>

          {/* Price Range */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Price Range ($)</label>
            <div className='grid grid-cols-2 gap-3'>
              <input
                type='number'
                step='0.01'
                placeholder='Min price'
                value={filters.minPrice}
                onChange={e => handleFilterChange('minPrice', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
              />
              <input
                type='number'
                step='0.01'
                placeholder='Max price'
                value={filters.maxPrice}
                onChange={e => handleFilterChange('maxPrice', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
              />
            </div>
          </div>

          {/* Email Type */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Email Type</label>
            <select
              value={filters.emailType}
              onChange={e => handleFilterChange('emailType', e.target.value)}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
            >
              {emailTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Country</label>
            <input
              type='text'
              placeholder='Enter country (e.g., US, UK, RU)'
              value={filters.country}
              onChange={e => handleFilterChange('country', e.target.value)}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
            />
          </div>

          {/* Boolean Filters */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-300'>Has Cookies</label>
              <select
                value={filters.hasCookies}
                onChange={e => handleFilterChange('hasCookies', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
              >
                {booleanOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-300'>Mobile Verified</label>
              <select
                value={filters.mobileVerified}
                onChange={e => handleFilterChange('mobileVerified', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
              >
                {booleanOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-300'>Allow Discount</label>
              <select
                value={filters.allowDiscount}
                onChange={e => handleFilterChange('allowDiscount', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
              >
                {booleanOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-300'>Has Guarantee</label>
              <select
                value={filters.hasGuarantee}
                onChange={e => handleFilterChange('hasGuarantee', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
              >
                {booleanOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InstagramFilters
