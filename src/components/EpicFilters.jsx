import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import SearchableEpicGameDropdown from './SearchableEpicGameDropdown'

// Account origin options (from epic-filter.html)
const originOptions = [
  { value: 'brute', label: 'Brute' },
  { value: 'phishing', label: 'Phishing' },
  { value: 'stealer', label: 'Stealer' },
  { value: 'personal', label: 'Personal' },
  { value: 'resale', label: 'Resale' },
  { value: 'autoreg', label: 'Autoreg' },
  { value: 'dummy', label: 'Dummy' }
]

// Popular Epic Games for quick filters
const quickEpicGames = [
  { value: '909dd1fd19bf41f99b23edf2ce461927', label: 'Fortnite' },
  { value: '530145df28a24424923f5828cc9031a1', label: 'Rocket League' },
  { value: '38ec4849ea4f4de6aa7b6fb0f2d278e1', label: 'Fall Guys' },
  { value: '6e563a2c0f5f46e3b4e88b5f4ed50cca', label: 'GTA V' }
]

// Countries list
const countries = [
  { value: 'US', label: 'United States' },
  { value: 'RU', label: 'Russia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'BR', label: 'Brazil' },
  { value: 'CN', label: 'China' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' }
]

const EpicFilters = ({ onFiltersChange = () => {}, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    // Pagination
    page: 1,

    // Price filters
    pmin: '',
    pmax: '',

    // General filters
    title: '',
    order_by: 'price_to_up',

    // Epic specific filters
    change_email: '',
    rl_purchases: false,
    'origin[]': [],
    'not_origin[]': [],

    // Location
    country: [],

    // Games
    games: [],

    ...initialFilters
  })

  const [expandedSections, setExpandedSections] = useState({
    advanced: true // Always expanded like requested
  })

  // Apply filters whenever they change
  useEffect(() => {
    if (Object.keys(filters).length > 1) {
      // Don't trigger on initial empty state
      onFiltersChange(filters)
    }
  }, [filters, onFiltersChange])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleArrayFilterChange = (key, value, checked) => {
    setFilters(prev => {
      const currentArray = prev[key] || []
      if (checked) {
        return {
          ...prev,
          [key]: [...currentArray, value]
        }
      } else {
        return {
          ...prev,
          [key]: currentArray.filter(item => item !== value)
        }
      }
    })
  }

  const handleQuickGameFilter = (gameValue, gameName) => {
    // Toggle the game filter - if already selected, remove it; if not, add it
    const currentGames = filters.games || []
    const newGames = currentGames.includes(gameValue)
      ? currentGames.filter(g => g !== gameValue) // Remove if already selected
      : [...currentGames, gameValue] // Add if not selected

    // Set the game filter
    handleFilterChange('games', newGames)
  }

  const clearAllFilters = () => {
    setFilters({
      page: 1,
      pmin: '',
      pmax: '',
      title: '',
      order_by: 'price_to_up',
      change_email: '',
      rl_purchases: false,
      'origin[]': [],
      'not_origin[]': [],
      country: [],
      games: []
    })
  }

  const toggleSection = section => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6'>
      {/* Quick Game Filters */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-purple-400'>🎮 Quick Epic Game Filters</h3>
          <button
            onClick={clearAllFilters}
            className='bg-red-700 hover:bg-red-600 text-red-100 hover:text-white px-3 py-1 rounded-lg text-sm transition-colors border border-red-600 hover:border-red-500'
          >
            Clear All Filters
          </button>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2'>
          {quickEpicGames.map(game => (
            <button
              key={game.value}
              onClick={() => handleQuickGameFilter(game.value, game.label)}
              className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
                filters.games && filters.games.includes(game.value)
                  ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500'
                  : 'bg-gray-800 hover:bg-purple-600 text-gray-300 hover:text-white border-gray-600 hover:border-purple-500'
              }`}
              title={`Filter accounts with ${game.label}`}
            >
              <Icon icon='simple-icons:epicgames' className='w-5 h-5 text-purple-400' />
              <span className='font-medium text-xs'>{game.label}</span>
            </button>
          ))}
        </div>
        {filters.games && filters.games.length > 0 && (
          <div className='mt-3 p-3 bg-purple-900 border border-purple-600 rounded-lg'>
            <p className='text-purple-200 text-sm'>
              <Icon icon='material-symbols:filter-alt' className='inline w-4 h-4 mr-1' />
              Filtering accounts with:{' '}
              <strong>
                {quickEpicGames.find(g => g.value === filters.games[0])?.label || 'Selected Game'}
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* Advanced Filters - Always Expanded */}
      <div className='border-t border-gray-700 pt-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-200'>
            <Icon icon='solar:settings-bold' className='inline mr-2 text-purple-400' />
            Advanced Filters
          </h3>
          <div className='text-sm text-gray-400'>Always shown</div>
        </div>

        <div className='space-y-6'>
          {/* Price Range */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>Min Price ($)</label>
              <input
                type='number'
                placeholder='0'
                value={filters.pmin}
                onChange={e => handleFilterChange('pmin', e.target.value)}
                className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>Max Price ($)</label>
              <input
                type='number'
                placeholder='999'
                value={filters.pmax}
                onChange={e => handleFilterChange('pmax', e.target.value)}
                className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Email Changeable */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Email Changeable</label>
            <select
              value={filters.change_email}
              onChange={e => handleFilterChange('change_email', e.target.value)}
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value=''>Any</option>
              <option value='yes'>Yes</option>
              <option value='no'>No</option>
            </select>
          </div>

          {/* Searchable Epic Games Dropdown */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              <Icon icon='simple-icons:epicgames' className='inline w-4 h-4 mr-1 text-purple-400' />
              Epic Games Filter (Advanced)
            </label>
            <SearchableEpicGameDropdown
              selectedGames={filters.games || []}
              onGamesChange={newGames => handleFilterChange('games', newGames)}
              placeholder='Search and select Epic Games...'
            />
            {filters.games && filters.games.length > 0 && (
              <div className='mt-2 text-sm text-purple-300'>
                <Icon icon='material-symbols:info-outline' className='inline w-4 h-4 mr-1' />
                {filters.games.length} game{filters.games.length !== 1 ? 's' : ''} selected for
                filtering
              </div>
            )}
          </div>

          {/* Rocket League Purchases */}
          <div>
            <label className='flex items-center space-x-2'>
              <input
                type='checkbox'
                checked={filters.rl_purchases}
                onChange={e => handleFilterChange('rl_purchases', e.target.checked)}
                className='rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500'
              />
              <span className='text-sm text-gray-300'>Has Rocket League Purchases</span>
            </label>
          </div>

          {/* Account Origin */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-3'>Account Origin</label>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
              {originOptions.map(option => (
                <label key={option.value} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    checked={filters['origin[]'].includes(option.value)}
                    onChange={e =>
                      handleArrayFilterChange('origin[]', option.value, e.target.checked)
                    }
                    className='rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500'
                  />
                  <span className='text-sm text-gray-300'>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Country</label>
            <select
              value={filters.country[0] || ''}
              onChange={e => handleFilterChange('country', e.target.value ? [e.target.value] : [])}
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value=''>Any Country</option>
              {countries.map(country => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Sort by</label>
            <select
              value={filters.order_by}
              onChange={e => handleFilterChange('order_by', e.target.value)}
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value='price_to_up'>Price: Low to High</option>
              <option value='price_to_down'>Price: High to Low</option>
              <option value='pdate_to_up_upload'>Newest First</option>
              <option value='pdate_to_down_upload'>Oldest First</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EpicFilters
