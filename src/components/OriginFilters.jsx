import { Icon } from '@iconify/react'
import { useState } from 'react'

const OriginFilters = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({
    game: [],
    gamesCount: { min: '', max: '' },
    origin: [],
    notOrigin: [],
    priceMin: '',
    priceMax: '',
    country: '',
    lastActivity: '',
    totalPlayed: { min: '', max: '' }
  })

  // Origin options
  const originOptions = [
    { value: 'brute', label: 'Brute' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'stealer', label: 'Stealer' },
    { value: 'personal', label: 'Personal' },
    { value: 'resale', label: 'Resale' },
    { value: 'autoreg', label: 'Autoreg' },
    { value: 'dummy', label: 'Dummy' }
  ]

  // Popular EA games options
  const gameOptions = [
    { value: 'battlefield-2042', label: 'Battlefield 2042' },
    { value: 'fifa-24', label: 'FIFA 24' },
    { value: 'apex-legends', label: 'Apex Legends' },
    { value: 'the-sims-4', label: 'The Sims 4' },
    { value: 'star-wars-galaxy-of-heroes', label: 'STAR WARS: Galaxy of Heroes' },
    { value: 'need-for-speed-heat', label: 'Need for Speed Heat' },
    { value: 'plants-vs-zombies-garden-warfare-2', label: 'Plants vs. Zombies: Garden Warfare 2' },
    { value: 'titanfall-2', label: 'Titanfall 2' },
    { value: 'mass-effect-legendary-edition', label: 'Mass Effect Legendary Edition' },
    { value: 'dragon-age-inquisition', label: 'Dragon Age: Inquisition' },
    { value: 'santiago-public-beta', label: 'Battlefield 6 Open Beta' },
    { value: 'madden-nfl-24', label: 'Madden NFL 24' }
  ]

  // MultiSelect component for dropdowns
  const MultiSelect = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleToggle = optionValue => {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue]
      onChange(newValue)
    }

    return (
      <div className='relative'>
        <div
          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 cursor-pointer flex items-center justify-between min-h-[42px]'
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className='flex-1'>
            {value.length === 0 ? (
              <span className='text-gray-400 text-sm'>{placeholder}</span>
            ) : (
              <div className='flex flex-wrap gap-1'>
                {value.map(val => {
                  const option = options.find(opt => opt.value === val)
                  return (
                    <span
                      key={val}
                      className='bg-orange-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1'
                    >
                      <span>{option?.label}</span>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleToggle(val)
                        }}
                        className='hover:bg-orange-700 rounded'
                      >
                        <Icon icon='mdi:close' className='text-xs' />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
          <Icon
            icon={isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'}
            className='text-gray-400 ml-2'
          />
        </div>

        {isOpen && (
          <div className='absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg mt-1 z-10 max-h-48 overflow-y-auto'>
            {options.map(option => (
              <div
                key={option.value}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-700 flex items-center space-x-2 ${
                  value.includes(option.value) ? 'bg-orange-900 bg-opacity-50' : ''
                }`}
                onClick={() => handleToggle(option.value)}
              >
                <input
                  type='checkbox'
                  checked={value.includes(option.value)}
                  onChange={() => {}}
                  className='rounded'
                />
                <span className='text-gray-200 text-sm'>{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleRangeFilterChange = (category, type, value) => {
    const newFilters = {
      ...filters,
      [category]: { ...filters[category], [type]: value }
    }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      game: [],
      gamesCount: { min: '', max: '' },
      origin: [],
      notOrigin: [],
      priceMin: '',
      priceMax: '',
      country: '',
      lastActivity: '',
      totalPlayed: { min: '', max: '' }
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  return (
    <div className='filters-container bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-gray-200 flex items-center space-x-2'>
          <Icon icon='simple-icons:ea' className='text-orange-400' />
          <span>Origin / EA Filters</span>
        </h3>
        <button
          onClick={clearFilters}
          className='text-sm text-gray-400 hover:text-red-400 transition-colors'
        >
          Clear All
        </button>
      </div>

      {/* Filter Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* First Column */}
        <div className='space-y-4'>
          {/* Games Filter */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Games</label>
            <MultiSelect
              options={gameOptions}
              value={filters.game}
              onChange={value => handleFilterChange('game', value)}
              placeholder='Select a game'
            />
          </div>

          {/* Games Count Range */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Games Count</label>
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                min='1'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500'
                placeholder='Games from'
                value={filters.gamesCount.min}
                onChange={e => handleRangeFilterChange('gamesCount', 'min', e.target.value)}
              />
              <input
                type='number'
                min='1'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500'
                placeholder='up to'
                value={filters.gamesCount.max}
                onChange={e => handleRangeFilterChange('gamesCount', 'max', e.target.value)}
              />
            </div>
          </div>

          {/* Account Origin */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Account Origin</label>
            <MultiSelect
              options={originOptions}
              value={filters.origin}
              onChange={value => handleFilterChange('origin', value)}
              placeholder='Account origin'
            />
          </div>

          {/* Exclude Origin */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Exclude Origin</label>
            <MultiSelect
              options={originOptions}
              value={filters.notOrigin}
              onChange={value => handleFilterChange('notOrigin', value)}
              placeholder='Exclude origin'
            />
          </div>
        </div>

        {/* Second Column */}
        <div className='space-y-4'>
          {/* Price Range */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Price Range</label>
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                step='0.01'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500'
                placeholder='Min Price'
                value={filters.priceMin}
                onChange={e => handleFilterChange('priceMin', e.target.value)}
              />
              <input
                type='number'
                step='0.01'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500'
                placeholder='Max Price'
                value={filters.priceMax}
                onChange={e => handleFilterChange('priceMax', e.target.value)}
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Country</label>
            <input
              type='text'
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500'
              placeholder='Country code (e.g., US, UK, ZA)'
              value={filters.country}
              onChange={e => handleFilterChange('country', e.target.value)}
            />
          </div>

          {/* Last Activity */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Last Activity (days ago)
            </label>
            <input
              type='number'
              min='0'
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500'
              placeholder='Days since last activity'
              value={filters.lastActivity}
              onChange={e => handleFilterChange('lastActivity', e.target.value)}
            />
          </div>

          {/* Total Played Hours Range */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Total Played Hours
            </label>
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                min='0'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500'
                placeholder='Hours from'
                value={filters.totalPlayed.min}
                onChange={e => handleRangeFilterChange('totalPlayed', 'min', e.target.value)}
              />
              <input
                type='number'
                min='0'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500'
                placeholder='up to'
                value={filters.totalPlayed.max}
                onChange={e => handleRangeFilterChange('totalPlayed', 'max', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Third Column */}
        <div className='space-y-4'>
          <h4 className='text-md font-medium text-orange-400 flex items-center space-x-2'>
            <Icon icon='mdi:information' className='text-orange-400' />
            <span>Filter Tips</span>
          </h4>

          <div className='bg-gray-800 p-3 rounded-lg border border-gray-600'>
            <h5 className='text-sm font-medium text-gray-300 mb-2'>Popular Games</h5>
            <div className='space-y-1 text-xs text-gray-400'>
              <div>• Battlefield 2042</div>
              <div>• FIFA 24</div>
              <div>• Apex Legends</div>
              <div>• The Sims 4</div>
              <div>• Need for Speed Heat</div>
            </div>
          </div>

          <div className='bg-gray-800 p-3 rounded-lg border border-gray-600'>
            <h5 className='text-sm font-medium text-gray-300 mb-2'>Filter Guidelines</h5>
            <div className='space-y-1 text-xs text-gray-400'>
              <div>• Country affects account region</div>
              <div>• More games = better value</div>
              <div>• Recent activity = higher risk</div>
              <div>• Check total played hours</div>
            </div>
          </div>

          <div className='bg-gray-800 p-3 rounded-lg border border-gray-600'>
            <h5 className='text-sm font-medium text-gray-300 mb-2'>Account Origins</h5>
            <div className='space-y-1 text-xs text-gray-400'>
              <div>
                • <span className='text-green-400'>Personal</span>: Safest option
              </div>
              <div>
                • <span className='text-yellow-400'>Resale</span>: Medium risk
              </div>
              <div>
                • <span className='text-red-400'>Stealer</span>: High risk
              </div>
              <div>
                • <span className='text-blue-400'>Autoreg</span>: Generated accounts
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OriginFilters
