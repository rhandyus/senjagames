import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'

// WOT region options
const regionOptions = [
  { value: 'eu', label: 'Europe' },
  { value: 'na', label: 'North America' },
  { value: 'asia', label: 'Asia' },
  { value: 'ru', label: 'Russia' }
]

// Account origin options
const originOptions = [
  { value: 'brute', label: 'Brute' },
  { value: 'phishing', label: 'Phishing' },
  { value: 'stealer', label: 'Stealer' },
  { value: 'personal', label: 'Personal' },
  { value: 'resale', label: 'Resale' },
  { value: 'autoreg', label: 'Autoreg' },
  { value: 'dummy', label: 'Dummy' }
]

// Clan role options
const clanRoleOptions = [
  { value: 'private', label: 'Fighter' },
  { value: 'recruitment_officer', label: 'Personnel Officer' }
]

// Premium period options
const premiumPeriodOptions = [
  { value: 'day', label: 'Days' },
  { value: 'month', label: 'Months' },
  { value: 'year', label: 'Years' }
]

const WotFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    // Phone linked (matches HTML name="phone")
    phone: '',

    // Days inactive (matches HTML name="daybreak")
    daybreak: '',

    // Region filters (matches HTML name="region[]" and name="not_region[]")
    'region[]': [],
    'not_region[]': [],

    // Origin filters (matches HTML name="origin[]" and name="not_origin[]")
    'origin[]': [],
    'not_origin[]': [],

    // Tank filters (matches HTML name="tank[]")
    'tank[]': [],

    // Premium filters (matches HTML name="premium")
    premium: '',
    premium_expiration: '',
    premium_expiration_period: '',

    // Tank count filters (matches HTML names)
    top_min: '',
    top_max: '',
    prem_min: '',
    prem_max: '',
    top_prem_min: '',
    top_prem_max: '',

    // Battle statistics (matches HTML name="battles_min")
    battles_min: '',
    battles_max: '',

    // Win percentage
    win_pmin: '',
    win_pmax: '',

    // Currency filters
    gold_min: '',
    gold_max: '',
    silver_min: '',
    silver_max: '',

    // Clan filters
    clan: '',
    clan_role: [],

    // Price and sorting
    pmin: '',
    pmax: '',
    order_by: 'price_to_up',

    ...initialFilters
  })

  const [isInitialMount, setIsInitialMount] = useState(true)

  // Update parent component when filters change (but not on initial mount)
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false)
      return
    }

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => {
        if (Array.isArray(value)) return value.length > 0
        return value !== '' && value !== null && value !== undefined
      })
    )
    onFiltersChange(cleanFilters)
  }, [filters]) // Remove onFiltersChange from dependencies

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const updateArrayFilter = (key, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked ? [...prev[key], value] : prev[key].filter(item => item !== value)
    }))
  }

  const clearFilters = () => {
    setFilters({
      phone: '',
      daybreak: '',
      'region[]': [],
      'not_region[]': [],
      'origin[]': [],
      'not_origin[]': [],
      'tank[]': [],
      premium: '',
      premium_expiration: '',
      premium_expiration_period: '',
      top_min: '',
      top_max: '',
      prem_min: '',
      prem_max: '',
      top_prem_min: '',
      top_prem_max: '',
      battles_min: '',
      battles_max: '',
      gold_min: '',
      gold_max: '',
      silver_min: '',
      silver_max: '',
      win_pmin: '',
      win_pmax: '',
      clan: '',
      clan_role: [],
      pmin: '',
      pmax: '',
      order_by: 'price_to_up'
    })
  }

  return (
    <div className='bg-gray-900 rounded-lg border border-gray-700 overflow-hidden'>
      {/* Header */}
      <div className='p-4 border-b border-gray-700'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Icon icon='mdi:tank' className='text-amber-500 text-xl' />
            <h3 className='text-lg font-semibold text-white'>World of Tanks Filters</h3>
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={clearFilters}
              className='text-sm text-gray-400 hover:text-white transition-colors'
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className='p-4 border-b border-gray-700'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Price Range */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Price Range</label>
            <div className='flex space-x-2'>
              <input
                type='number'
                placeholder='Min $'
                value={filters.pmin}
                onChange={e => updateFilter('pmin', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
              />
              <input
                type='number'
                placeholder='Max $'
                value={filters.pmax}
                onChange={e => updateFilter('pmax', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
              />
            </div>
          </div>

          {/* Region */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Region</label>
            <select
              value={filters['region[]'][0] || ''}
              onChange={e => updateFilter('region[]', e.target.value ? [e.target.value] : [])}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none'
            >
              <option value=''>Any Region</option>
              {regionOptions.map(region => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Linked */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Phone Linked</label>
            <select
              value={filters.phone}
              onChange={e => updateFilter('phone', e.target.value)}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none'
            >
              <option value=''>Any</option>
              <option value='yes'>Yes</option>
              <option value='no'>No</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Sort By</label>
            <select
              value={filters.order_by}
              onChange={e => updateFilter('order_by', e.target.value)}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none'
            >
              <option value='price_to_up'>Price: Low to High</option>
              <option value='price_to_down'>Price: High to Low</option>
              <option value='pubdate_to_down'>Newest First</option>
              <option value='pubdate_to_up'>Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className='p-4'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Left Column */}
          <div className='space-y-4'>
            {/* Account Properties */}
            <div>
              <h4 className='text-lg font-medium text-white mb-3'>Account Properties</h4>

              {/* Days Inactive */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Days Inactive
                </label>
                <input
                  type='number'
                  placeholder='Max days inactive'
                  value={filters.daybreak}
                  onChange={e => updateFilter('daybreak', e.target.value)}
                  className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                />
              </div>

              {/* Account Origin */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Account Origin
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  {originOptions.map(origin => (
                    <label key={origin.value} className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={filters['origin[]'].includes(origin.value)}
                        onChange={e =>
                          updateArrayFilter('origin[]', origin.value, e.target.checked)
                        }
                        className='form-checkbox text-amber-500 bg-gray-800 border-gray-600 rounded focus:ring-amber-500'
                      />
                      <span className='text-sm text-gray-300'>{origin.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Exclude Regions */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Exclude Regions
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  {regionOptions.map(region => (
                    <label key={region.value} className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={filters['not_region[]'].includes(region.value)}
                        onChange={e =>
                          updateArrayFilter('not_region[]', region.value, e.target.checked)
                        }
                        className='form-checkbox text-amber-500 bg-gray-800 border-gray-600 rounded focus:ring-amber-500'
                      />
                      <span className='text-sm text-gray-300'>{region.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Premium & Currency */}
            <div>
              <h4 className='text-lg font-medium text-white mb-3'>Premium & Currency</h4>

              {/* Premium Status */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Premium Status
                </label>
                <div className='flex space-x-4'>
                  <label className='flex items-center space-x-2'>
                    <input
                      type='radio'
                      name='premium'
                      value=''
                      checked={filters.premium === ''}
                      onChange={e => updateFilter('premium', e.target.value)}
                      className='form-radio text-amber-500 bg-gray-800 border-gray-600 focus:ring-amber-500'
                    />
                    <span className='text-sm text-gray-300'>Any</span>
                  </label>
                  <label className='flex items-center space-x-2'>
                    <input
                      type='radio'
                      name='premium'
                      value='yes'
                      checked={filters.premium === 'yes'}
                      onChange={e => updateFilter('premium', e.target.value)}
                      className='form-radio text-amber-500 bg-gray-800 border-gray-600 focus:ring-amber-500'
                    />
                    <span className='text-sm text-gray-300'>Yes</span>
                  </label>
                  <label className='flex items-center space-x-2'>
                    <input
                      type='radio'
                      name='premium'
                      value='no'
                      checked={filters.premium === 'no'}
                      onChange={e => updateFilter('premium', e.target.value)}
                      className='form-radio text-amber-500 bg-gray-800 border-gray-600 focus:ring-amber-500'
                    />
                    <span className='text-sm text-gray-300'>No</span>
                  </label>
                </div>
              </div>

              {/* Premium Duration */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Premium Duration
                </label>
                <div className='flex space-x-2'>
                  <input
                    type='number'
                    placeholder='Min'
                    value={filters.premium_expiration}
                    onChange={e => updateFilter('premium_expiration', e.target.value)}
                    className='flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                  <select
                    value={filters.premium_expiration_period}
                    onChange={e => updateFilter('premium_expiration_period', e.target.value)}
                    className='px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none'
                  >
                    <option value=''>Select Period</option>
                    {premiumPeriodOptions.map(period => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gold */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Gold</label>
                <div className='flex space-x-2'>
                  <input
                    type='number'
                    placeholder='Min Gold'
                    value={filters.gold_min}
                    onChange={e => updateFilter('gold_min', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    placeholder='Max Gold'
                    value={filters.gold_max}
                    onChange={e => updateFilter('gold_max', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                </div>
              </div>

              {/* Credits (Silver) */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Credits</label>
                <div className='flex space-x-2'>
                  <input
                    type='number'
                    placeholder='Min Credits'
                    value={filters.silver_min}
                    onChange={e => updateFilter('silver_min', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    placeholder='Max Credits'
                    value={filters.silver_max}
                    onChange={e => updateFilter('silver_max', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className='space-y-4'>
            {/* Battle Statistics */}
            <div>
              <h4 className='text-lg font-medium text-white mb-3'>Battle Statistics</h4>

              {/* Battle Count */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Battle Count</label>
                <div className='flex space-x-2'>
                  <input
                    type='number'
                    placeholder='Min Battles'
                    value={filters.battles_min}
                    onChange={e => updateFilter('battles_min', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    placeholder='Max Battles'
                    value={filters.battles_max}
                    onChange={e => updateFilter('battles_max', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                </div>
              </div>

              {/* Win Percentage */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Win Rate (%)</label>
                <div className='flex space-x-2'>
                  <input
                    type='number'
                    placeholder='Min %'
                    min='0'
                    max='100'
                    value={filters.win_pmin}
                    onChange={e => updateFilter('win_pmin', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    placeholder='Max %'
                    min='0'
                    max='100'
                    value={filters.win_pmax}
                    onChange={e => updateFilter('win_pmax', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                </div>
              </div>
            </div>

            {/* Tank Information */}
            <div>
              <h4 className='text-lg font-medium text-white mb-3'>Tank Information</h4>

              {/* Total Tanks */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Total Tanks</label>
                <div className='flex space-x-2'>
                  <input
                    type='number'
                    placeholder='Min Tanks'
                    value={filters.top_min}
                    onChange={e => updateFilter('top_min', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    placeholder='Max Tanks'
                    value={filters.top_max}
                    onChange={e => updateFilter('top_max', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                </div>
              </div>

              {/* Premium Tanks */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Premium Tanks
                </label>
                <div className='flex space-x-2'>
                  <input
                    type='number'
                    placeholder='Min Premium Tanks'
                    value={filters.prem_min}
                    onChange={e => updateFilter('prem_min', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    placeholder='Max Premium Tanks'
                    value={filters.prem_max}
                    onChange={e => updateFilter('prem_max', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                </div>
              </div>

              {/* Top Premium Tanks */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Top Premium Tanks
                </label>
                <div className='flex space-x-2'>
                  <input
                    type='number'
                    placeholder='Min Top Premium'
                    value={filters.top_prem_min}
                    onChange={e => updateFilter('top_prem_min', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    placeholder='Max Top Premium'
                    value={filters.top_prem_max}
                    onChange={e => updateFilter('top_prem_max', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none'
                  />
                </div>
              </div>
            </div>

            {/* Clan Information */}
            <div>
              <h4 className='text-lg font-medium text-white mb-3'>Clan Information</h4>

              {/* Clan Membership */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Clan Membership
                </label>
                <select
                  value={filters.clan}
                  onChange={e => updateFilter('clan', e.target.value)}
                  className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none'
                >
                  <option value=''>Any</option>
                  <option value='yes'>In Clan</option>
                  <option value='no'>No Clan</option>
                </select>
              </div>

              {/* Clan Role */}
              {filters.clan === 'yes' && (
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>Clan Role</label>
                  <div className='space-y-2'>
                    {clanRoleOptions.map(role => (
                      <label key={role.value} className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          checked={filters.clan_role.includes(role.value)}
                          onChange={e =>
                            updateArrayFilter('clan_role', role.value, e.target.checked)
                          }
                          className='form-checkbox text-amber-500 bg-gray-800 border-gray-600 rounded focus:ring-amber-500'
                        />
                        <span className='text-sm text-gray-300'>{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WotFilters
