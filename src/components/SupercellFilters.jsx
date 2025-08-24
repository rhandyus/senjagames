import { Icon } from '@iconify/react'
import { useState } from 'react'

const SupercellFilters = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({
    tel: '',
    daybreak: '',
    origin: [],
    notOrigin: [],
    priceMin: '',
    priceMax: '',
    royaleLevel: { min: '', max: '' },
    royaleCup: { min: '', max: '' },
    royaleWins: { min: '', max: '' },
    royaleLegendary: { min: '', max: '' },
    cocLevel: { min: '', max: '' },
    cocCup: { min: '', max: '' },
    cocTownHall: { min: '', max: '' },
    cocHeroLevel: { min: '', max: '' },
    brawlLevel: { min: '', max: '' },
    brawlCup: { min: '', max: '' },
    brawlBrawlers: { min: '', max: '' },
    brawlLegendary: { min: '', max: '' },
    brawlMythic: { min: '', max: '' },
    boomLevel: { min: '', max: '' },
    boomCup: { min: '', max: '' }
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
                      className='bg-purple-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1'
                    >
                      <span>{option?.label}</span>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleToggle(val)
                        }}
                        className='hover:bg-purple-700 rounded'
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
                  value.includes(option.value) ? 'bg-purple-900 bg-opacity-50' : ''
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
      tel: '',
      daybreak: '',
      origin: [],
      notOrigin: [],
      priceMin: '',
      priceMax: '',
      royaleLevel: { min: '', max: '' },
      royaleCup: { min: '', max: '' },
      royaleWins: { min: '', max: '' },
      royaleLegendary: { min: '', max: '' },
      cocLevel: { min: '', max: '' },
      cocCup: { min: '', max: '' },
      cocTownHall: { min: '', max: '' },
      cocHeroLevel: { min: '', max: '' },
      brawlLevel: { min: '', max: '' },
      brawlCup: { min: '', max: '' },
      brawlBrawlers: { min: '', max: '' },
      brawlLegendary: { min: '', max: '' },
      brawlMythic: { min: '', max: '' },
      boomLevel: { min: '', max: '' },
      boomCup: { min: '', max: '' }
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  return (
    <div className='filters-container bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-gray-200 flex items-center space-x-2'>
          <Icon icon='simple-icons:supercell' className='text-orange-400' />
          <span>Supercell Filters</span>
        </h3>
        <button
          onClick={clearFilters}
          className='text-sm text-gray-400 hover:text-red-400 transition-colors'
        >
          Clear All
        </button>
      </div>

      {/* First Column */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='space-y-4'>
          {/* Phone Linked */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Phone Linked</label>
            <div className='flex space-x-2'>
              <button
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.tel === ''
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => handleFilterChange('tel', '')}
              >
                Any
              </button>
              <button
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.tel === 'yes'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => handleFilterChange('tel', 'yes')}
              >
                Yes
              </button>
              <button
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.tel === 'no'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => handleFilterChange('tel', 'no')}
              >
                No
              </button>
            </div>
          </div>

          {/* Days Inactive */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Days Inactive</label>
            <input
              type='number'
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
              placeholder='Days Inactive'
              value={filters.daybreak}
              onChange={e => handleFilterChange('daybreak', e.target.value)}
            />
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

          {/* Not Origin */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Exclude Origin</label>
            <MultiSelect
              options={originOptions}
              value={filters.notOrigin}
              onChange={value => handleFilterChange('notOrigin', value)}
              placeholder='Exclude origin'
            />
          </div>

          {/* Price Range */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Price Range</label>
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='Min Price'
                value={filters.priceMin}
                onChange={e => handleFilterChange('priceMin', e.target.value)}
              />
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='Max Price'
                value={filters.priceMax}
                onChange={e => handleFilterChange('priceMax', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Second Column - Clash Royale */}
        <div className='space-y-4'>
          <h4 className='text-md font-medium text-purple-400 flex items-center space-x-2'>
            <Icon icon='simple-icons:clashroyale' className='text-blue-400' />
            <span>Clash Royale</span>
          </h4>

          {/* Royale Level */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Level Range</label>
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='Level from'
                value={filters.royaleLevel.min}
                onChange={e => handleRangeFilterChange('royaleLevel', 'min', e.target.value)}
              />
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='up to'
                value={filters.royaleLevel.max}
                onChange={e => handleRangeFilterChange('royaleLevel', 'max', e.target.value)}
              />
            </div>
          </div>

          {/* Royale Trophies */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Trophies Range</label>
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='Trophies from'
                value={filters.royaleCup.min}
                onChange={e => handleRangeFilterChange('royaleCup', 'min', e.target.value)}
              />
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='up to'
                value={filters.royaleCup.max}
                onChange={e => handleRangeFilterChange('royaleCup', 'max', e.target.value)}
              />
            </div>
          </div>

          {/* Royale Wins */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Wins Range</label>
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='Wins from'
                value={filters.royaleWins.min}
                onChange={e => handleRangeFilterChange('royaleWins', 'min', e.target.value)}
              />
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='up to'
                value={filters.royaleWins.max}
                onChange={e => handleRangeFilterChange('royaleWins', 'max', e.target.value)}
              />
            </div>
          </div>

          {/* Royale Legendary */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Legendary Cards</label>
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='Legendary from'
                value={filters.royaleLegendary.min}
                onChange={e => handleRangeFilterChange('royaleLegendary', 'min', e.target.value)}
              />
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='up to'
                value={filters.royaleLegendary.max}
                onChange={e => handleRangeFilterChange('royaleLegendary', 'max', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Third Column - Clash of Clans */}
        <div className='space-y-4'>
          <h4 className='text-md font-medium text-purple-400 flex items-center space-x-2'>
            <Icon icon='simple-icons:clashofclans' className='text-yellow-400' />
            <span>Clash of Clans</span>
          </h4>

          {/* COC Level */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Level Range</label>
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='Level from'
                value={filters.cocLevel.min}
                onChange={e => handleRangeFilterChange('cocLevel', 'min', e.target.value)}
              />
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='up to'
                value={filters.cocLevel.max}
                onChange={e => handleRangeFilterChange('cocLevel', 'max', e.target.value)}
              />
            </div>
          </div>

          {/* COC Trophies */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Trophies Range</label>
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='Trophies from'
                value={filters.cocCup.min}
                onChange={e => handleRangeFilterChange('cocCup', 'min', e.target.value)}
              />
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='up to'
                value={filters.cocCup.max}
                onChange={e => handleRangeFilterChange('cocCup', 'max', e.target.value)}
              />
            </div>
          </div>

          {/* COC Town Hall */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Town Hall Range</label>
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='TH from'
                value={filters.cocTownHall.min}
                onChange={e => handleRangeFilterChange('cocTownHall', 'min', e.target.value)}
              />
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='up to'
                value={filters.cocTownHall.max}
                onChange={e => handleRangeFilterChange('cocTownHall', 'max', e.target.value)}
              />
            </div>
          </div>

          {/* COC Hero Level */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Hero Level Range</label>
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='Hero from'
                value={filters.cocHeroLevel.min}
                onChange={e => handleRangeFilterChange('cocHeroLevel', 'min', e.target.value)}
              />
              <input
                type='number'
                className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                placeholder='up to'
                value={filters.cocHeroLevel.max}
                onChange={e => handleRangeFilterChange('cocHeroLevel', 'max', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Filters Row */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700'>
        {/* Brawl Stars */}
        <div className='space-y-4'>
          <h4 className='text-md font-medium text-purple-400 flex items-center space-x-2'>
            <Icon icon='simple-icons:brawlstars' className='text-yellow-400' />
            <span>Brawl Stars</span>
          </h4>

          <div className='grid grid-cols-2 gap-4'>
            {/* Brawl Level */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>Level Range</label>
              <div className='space-y-2'>
                <input
                  type='number'
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                  placeholder='Level from'
                  value={filters.brawlLevel.min}
                  onChange={e => handleRangeFilterChange('brawlLevel', 'min', e.target.value)}
                />
                <input
                  type='number'
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                  placeholder='up to'
                  value={filters.brawlLevel.max}
                  onChange={e => handleRangeFilterChange('brawlLevel', 'max', e.target.value)}
                />
              </div>
            </div>

            {/* Brawl Trophies */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>Trophies Range</label>
              <div className='space-y-2'>
                <input
                  type='number'
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                  placeholder='Trophies from'
                  value={filters.brawlCup.min}
                  onChange={e => handleRangeFilterChange('brawlCup', 'min', e.target.value)}
                />
                <input
                  type='number'
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                  placeholder='up to'
                  value={filters.brawlCup.max}
                  onChange={e => handleRangeFilterChange('brawlCup', 'max', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Boom Beach */}
        <div className='space-y-4'>
          <h4 className='text-md font-medium text-purple-400 flex items-center space-x-2'>
            <Icon icon='mdi:beach' className='text-blue-400' />
            <span>Boom Beach</span>
          </h4>

          <div className='grid grid-cols-2 gap-4'>
            {/* Boom Level */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>Level Range</label>
              <div className='space-y-2'>
                <input
                  type='number'
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                  placeholder='Level from'
                  value={filters.boomLevel.min}
                  onChange={e => handleRangeFilterChange('boomLevel', 'min', e.target.value)}
                />
                <input
                  type='number'
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                  placeholder='up to'
                  value={filters.boomLevel.max}
                  onChange={e => handleRangeFilterChange('boomLevel', 'max', e.target.value)}
                />
              </div>
            </div>

            {/* Boom Trophies */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>Trophies Range</label>
              <div className='space-y-2'>
                <input
                  type='number'
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                  placeholder='Trophies from'
                  value={filters.boomCup.min}
                  onChange={e => handleRangeFilterChange('boomCup', 'min', e.target.value)}
                />
                <input
                  type='number'
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
                  placeholder='up to'
                  value={filters.boomCup.max}
                  onChange={e => handleRangeFilterChange('boomCup', 'max', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupercellFilters
