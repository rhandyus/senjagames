import { Icon } from '@iconify/react'
import { useState } from 'react'

const EscapeFromTarkovFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    // Base parameters
    pmin: '',
    pmax: '',
    order_by: 'price_to_up',

    // Game version/edition
    version: [],

    // Region
    region: '',

    // Level
    level_min: '',
    level_max: '',

    // Side
    side: '',

    // Currency amounts
    rubles_min: '',
    rubles_max: '',
    euros_min: '',
    euros_max: '',
    dollars_min: '',
    dollars_max: '',

    // Container
    container: [],

    // Email type
    email_type: '',

    // Origin
    origin: [],

    // PvE Access
    access_pve: '',

    // Activity
    last_activity: '',
    last_activity_period: 'day',

    ...initialFilters
  })

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleMultiSelectChange = (key, value) => {
    const currentValues = filters[key] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    handleFilterChange(key, newValues)
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
      version: [],
      region: '',
      level_min: '',
      level_max: '',
      side: '',
      rubles_min: '',
      rubles_max: '',
      euros_min: '',
      euros_max: '',
      dollars_min: '',
      dollars_max: '',
      container: [],
      email_type: '',
      origin: [],
      access_pve: '',
      last_activity: '',
      last_activity_period: 'day'
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  // Game editions
  const gameVersions = [
    { value: 'standard', label: 'Standard' },
    { value: 'left_behind', label: 'Left Behind' },
    { value: 'prepare_for_escape', label: 'Prepare for Escape' },
    { value: 'edge_of_darkness', label: 'Edge of Darkness' },
    { value: 'unheard_edition', label: 'The Unheard Edition' }
  ]

  // Regions
  const regions = [
    { value: 'af', label: 'Africa' },
    { value: 'as', label: 'Asia' },
    { value: 'eu', label: 'Europe' },
    { value: 'me', label: 'Middle East' },
    { value: 'oc', label: 'Oceania' },
    { value: 'cis', label: 'RU/CIS' },
    { value: 'us', label: 'US' }
  ]

  // Containers
  const containers = [
    { value: 'alpha_container', label: 'Alpha Container' },
    { value: 'beta_container', label: 'Beta Container' },
    { value: 'gamma_container', label: 'Gamma Container' },
    { value: 'epsilon_container', label: 'Epsilon Container' },
    { value: 'kappa_container', label: 'Kappa Container' }
  ]

  // Origins
  const origins = [
    { value: 'brute', label: 'Brute' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'stealer', label: 'Stealer' },
    { value: 'personal', label: 'Personal' },
    { value: 'resale', label: 'Resale' },
    { value: 'autoreg', label: 'Autoreg' },
    { value: 'dummy', label: 'Dummy' }
  ]

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6'>
      {/* Quick Filters */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-red-400'>🔫 Quick Tarkov Filters</h3>
          <button
            onClick={clearAllFilters}
            className='bg-red-700 hover:bg-red-600 text-red-100 hover:text-white px-3 py-1 rounded-lg text-sm transition-colors border border-red-600 hover:border-red-500'
          >
            Clear All Filters
          </button>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2'>
          {/* Edge of Darkness */}
          <button
            onClick={() => handleFilterChange('version', ['edge_of_darkness'])}
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
              filters.version.includes('edge_of_darkness')
                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500'
                : 'bg-gray-800 hover:bg-purple-600 text-gray-300 hover:text-white border-gray-600 hover:border-purple-500'
            }`}
          >
            <Icon icon='mdi:crown' className='text-lg' />
            <span className='font-medium text-xs'>Edge of Darkness</span>
          </button>

          {/* High Level */}
          <button
            onClick={() => {
              handleFilterChange('level_min', '40')
            }}
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
              filters.level_min >= '40'
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white border-yellow-500'
                : 'bg-gray-800 hover:bg-yellow-600 text-gray-300 hover:text-white border-gray-600 hover:border-yellow-500'
            }`}
          >
            <Icon icon='mdi:trending-up' className='text-lg' />
            <span className='font-medium text-xs'>High Level</span>
          </button>

          {/* Email Access */}
          <button
            onClick={() => handleFilterChange('email_type', 'autoreg')}
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
              filters.email_type === 'autoreg'
                ? 'bg-green-600 hover:bg-green-500 text-white border-green-500'
                : 'bg-gray-800 hover:bg-green-600 text-gray-300 hover:text-white border-gray-600 hover:border-green-500'
            }`}
          >
            <Icon icon='mdi:email-check' className='text-lg' />
            <span className='font-medium text-xs'>Mail Access</span>
          </button>

          {/* Europe Region */}
          <button
            onClick={() => handleFilterChange('region', 'eu')}
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
              filters.region === 'eu'
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
                : 'bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white border-gray-600 hover:border-blue-500'
            }`}
          >
            <Icon icon='mdi:earth' className='text-lg' />
            <span className='font-medium text-xs'>Europe</span>
          </button>

          {/* PvE Access */}
          <button
            onClick={() => handleFilterChange('access_pve', 'yes')}
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
              filters.access_pve === 'yes'
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500'
                : 'bg-gray-800 hover:bg-cyan-600 text-gray-300 hover:text-white border-gray-600 hover:border-cyan-500'
            }`}
          >
            <Icon icon='mdi:robot' className='text-lg' />
            <span className='font-medium text-xs'>PvE Access</span>
          </button>
        </div>
      </div>

      {/* Main Filters */}
      <form onSubmit={handleApplyFilters} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Price Range */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Price Range ($)</label>
            <div className='flex space-x-2'>
              <input
                type='number'
                placeholder='Min Price'
                value={filters.pmin}
                onChange={e => handleFilterChange('pmin', e.target.value)}
                className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
              <input
                type='number'
                placeholder='Max Price'
                value={filters.pmax}
                onChange={e => handleFilterChange('pmax', e.target.value)}
                className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Region */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Region</label>
            <select
              value={filters.region}
              onChange={e => handleFilterChange('region', e.target.value)}
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value=''>Any Region</option>
              {regions.map(region => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>

          {/* Level Range */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Level Range</label>
            <div className='flex space-x-2'>
              <input
                type='number'
                placeholder='Min Level'
                value={filters.level_min}
                onChange={e => handleFilterChange('level_min', e.target.value)}
                className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
              <input
                type='number'
                placeholder='Max Level'
                value={filters.level_max}
                onChange={e => handleFilterChange('level_max', e.target.value)}
                className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Side */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Side</label>
            <select
              value={filters.side}
              onChange={e => handleFilterChange('side', e.target.value)}
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value=''>Any Side</option>
              <option value='bear'>BEAR</option>
              <option value='usec'>USEC</option>
            </select>
          </div>

          {/* Email Type */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Email Access</label>
            <select
              value={filters.email_type}
              onChange={e => handleFilterChange('email_type', e.target.value)}
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value=''>Any</option>
              <option value='autoreg'>Yes</option>
              <option value='no'>No</option>
            </select>
          </div>

          {/* PvE Access */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>PvE Access</label>
            <select
              value={filters.access_pve}
              onChange={e => handleFilterChange('access_pve', e.target.value)}
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value=''>Any</option>
              <option value='yes'>Yes</option>
              <option value='no'>No</option>
            </select>
          </div>
        </div>

        {/* Game Versions */}
        <div className='space-y-3'>
          <h4 className='text-md font-semibold text-gray-200'>Game Editions</h4>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
            {gameVersions.map(version => (
              <label key={version.value} className='flex items-center space-x-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={filters.version.includes(version.value)}
                  onChange={() => handleMultiSelectChange('version', version.value)}
                  className='rounded border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900'
                />
                <span className='text-sm text-gray-300'>{version.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Containers */}
        <div className='space-y-3'>
          <h4 className='text-md font-semibold text-gray-200'>Secured Containers</h4>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
            {containers.map(container => (
              <label key={container.value} className='flex items-center space-x-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={filters.container.includes(container.value)}
                  onChange={() => handleMultiSelectChange('container', container.value)}
                  className='rounded border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900'
                />
                <span className='text-sm text-gray-300'>{container.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Origins */}
        <div className='space-y-3'>
          <h4 className='text-md font-semibold text-gray-200'>Account Origin</h4>
          <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3'>
            {origins.map(origin => (
              <label key={origin.value} className='flex items-center space-x-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={filters.origin.includes(origin.value)}
                  onChange={() => handleMultiSelectChange('origin', origin.value)}
                  className='rounded border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900'
                />
                <span className='text-sm text-gray-300'>{origin.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className='flex flex-wrap gap-2'>
          <h4 className='w-full text-md font-semibold text-gray-200 mb-2'>Sort By</h4>
          {[
            { value: 'price_to_up', label: 'Cheapest' },
            { value: 'price_to_down', label: 'Most Expensive' },
            { value: 'date_to_down', label: 'Newest' },
            { value: 'date_to_up', label: 'Oldest' }
          ].map(sort => (
            <button
              key={sort.value}
              type='button'
              onClick={() => handleFilterChange('order_by', sort.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.order_by === sort.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-purple-600 hover:text-white'
              }`}
            >
              {sort.label}
            </button>
          ))}
        </div>

        {/* Apply/Reset Buttons */}
        <div className='flex flex-wrap gap-3'>
          <button
            type='submit'
            className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
          >
            Apply Filters
          </button>
          <button
            type='button'
            onClick={clearAllFilters}
            className='bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors border border-gray-600 hover:border-gray-500'
          >
            Reset All
          </button>
        </div>
      </form>
    </div>
  )
}

export default EscapeFromTarkovFilters
