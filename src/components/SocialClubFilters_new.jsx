import { useState } from 'react'

const SocialClubFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    levelMin: '',
    levelMax: '',
    cashMin: '',
    cashMax: '',
    bankCashMin: '',
    bankCashMax: '',
    games: [],
    emailProvider: 'all',
    emailType: 'all',
    itemOrigin: 'all',
    guarantee: false,
    allowDiscount: false,
    sortBy: 'published_date_desc',
    // Quick filters
    highLevel: false,
    richAccount: false,
    hasGtaV: false,
    hasRdr2: false,
    ...initialFilters
  })

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleQuickFilterToggle = quickFilter => {
    const newFilters = {
      ...filters,
      [quickFilter]: !filters[quickFilter]
    }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleGameToggle = game => {
    const newFilters = {
      ...filters,
      games: filters.games.includes(game)
        ? filters.games.filter(g => g !== game)
        : [...filters.games, game]
    }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters = {
      priceMin: '',
      priceMax: '',
      levelMin: '',
      levelMax: '',
      cashMin: '',
      cashMax: '',
      bankCashMin: '',
      bankCashMax: '',
      games: [],
      emailProvider: 'all',
      emailType: 'all',
      itemOrigin: 'all',
      guarantee: false,
      allowDiscount: false,
      sortBy: 'published_date_desc',
      highLevel: false,
      richAccount: false,
      hasGtaV: false,
      hasRdr2: false
    }
    setFilters(defaultFilters)
    onFiltersChange?.(defaultFilters)
  }

  // Social Club games
  const socialClubGames = [
    { id: 'gta_v', name: 'Grand Theft Auto V' },
    { id: 'gta_online', name: 'GTA Online' },
    { id: 'rdr2', name: 'Red Dead Redemption 2' },
    { id: 'rdr_online', name: 'Red Dead Online' },
    { id: 'max_payne_3', name: 'Max Payne 3' },
    { id: 'la_noire', name: 'L.A. Noire' }
  ]

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold text-green-400 flex items-center space-x-2'>
          <svg className='w-8 h-8 text-orange-600' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
          </svg>
          <span>Social Club Filters</span>
        </h2>
        <button
          onClick={resetFilters}
          className='bg-red-700 hover:bg-red-600 text-red-100 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 border border-red-600 hover:border-red-500'
        >
          Reset Filters
        </button>
      </div>

      {/* Quick Game Filters */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-green-400'>🎮 Quick Game Filters</h3>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2'>
          {socialClubGames.map(game => (
            <button
              key={game.id}
              onClick={() => handleGameToggle(game.id)}
              className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
                filters.games.includes(game.id)
                  ? 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500'
                  : 'bg-gray-800 hover:bg-orange-600 text-gray-300 hover:text-white border-gray-600 hover:border-orange-500'
              }`}
              title={`Filter accounts with ${game.name}`}
            >
              <span className='font-medium text-xs'>{game.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Price Range */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Price Range ($)</label>
          <div className='flex space-x-2'>
            <input
              type='number'
              placeholder='Min'
              value={filters.priceMin}
              onChange={e => handleFilterChange('priceMin', e.target.value)}
              className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
            <input
              type='number'
              placeholder='Max'
              value={filters.priceMax}
              onChange={e => handleFilterChange('priceMax', e.target.value)}
              className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Level Range */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Level Range</label>
          <div className='flex space-x-2'>
            <input
              type='number'
              placeholder='Min Level'
              value={filters.levelMin}
              onChange={e => handleFilterChange('levelMin', e.target.value)}
              className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
            <input
              type='number'
              placeholder='Max Level'
              value={filters.levelMax}
              onChange={e => handleFilterChange('levelMax', e.target.value)}
              className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Cash Range */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Cash Range ($)</label>
          <div className='flex space-x-2'>
            <input
              type='number'
              placeholder='Min Cash'
              value={filters.cashMin}
              onChange={e => handleFilterChange('cashMin', e.target.value)}
              className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
            <input
              type='number'
              placeholder='Max Cash'
              value={filters.cashMax}
              onChange={e => handleFilterChange('cashMax', e.target.value)}
              className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Bank Cash Range */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Bank Cash Range ($)</label>
          <div className='flex space-x-2'>
            <input
              type='number'
              placeholder='Min Bank Cash'
              value={filters.bankCashMin}
              onChange={e => handleFilterChange('bankCashMin', e.target.value)}
              className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
            <input
              type='number'
              placeholder='Max Bank Cash'
              value={filters.bankCashMax}
              onChange={e => handleFilterChange('bankCashMax', e.target.value)}
              className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Email Provider */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Email Provider</label>
          <select
            value={filters.emailProvider}
            onChange={e => handleFilterChange('emailProvider', e.target.value)}
            className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          >
            <option value='all'>All Providers</option>
            <option value='gmail'>Gmail</option>
            <option value='yahoo'>Yahoo</option>
            <option value='outlook'>Outlook</option>
            <option value='hotmail'>Hotmail</option>
            <option value='yandex'>Yandex</option>
            <option value='rambler'>Rambler</option>
            <option value='mail.ru'>Mail.ru</option>
            <option value='other'>Other</option>
          </select>
        </div>

        {/* Email Type */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Email Type</label>
          <select
            value={filters.emailType}
            onChange={e => handleFilterChange('emailType', e.target.value)}
            className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          >
            <option value='all'>All Types</option>
            <option value='autoreg'>Auto Registration</option>
            <option value='manual'>Manual Registration</option>
            <option value='native'>Native Email</option>
          </select>
        </div>

        {/* Item Origin */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Account Origin</label>
          <select
            value={filters.itemOrigin}
            onChange={e => handleFilterChange('itemOrigin', e.target.value)}
            className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          >
            <option value='all'>All Origins</option>
            <option value='personal'>Personal</option>
            <option value='received'>Received</option>
            <option value='purchased'>Purchased</option>
            <option value='brute'>Brute</option>
            <option value='stealed'>Stealed</option>
          </select>
        </div>

        {/* Sort By */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-300'>Sort By</label>
          <select
            value={filters.sortBy}
            onChange={e => handleFilterChange('sortBy', e.target.value)}
            className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          >
            <option value='published_date_desc'>Newest First</option>
            <option value='published_date_asc'>Oldest First</option>
            <option value='price_to_up'>Price: Low to High</option>
            <option value='price_to_down'>Price: High to Low</option>
            <option value='level_desc'>Level: High to Low</option>
            <option value='level_asc'>Level: Low to High</option>
          </select>
        </div>
      </div>

      {/* Boolean Filters */}
      <div className='mt-6 grid grid-cols-2 md:grid-cols-4 gap-4'>
        <label className='flex items-center space-x-2 cursor-pointer'>
          <input
            type='checkbox'
            checked={filters.guarantee}
            onChange={e => handleFilterChange('guarantee', e.target.checked)}
            className='rounded border-gray-600 bg-gray-800 text-orange-600 focus:ring-purple-500 focus:ring-2'
          />
          <span className='text-gray-300 text-sm'>Has Guarantee</span>
        </label>

        <label className='flex items-center space-x-2 cursor-pointer'>
          <input
            type='checkbox'
            checked={filters.allowDiscount}
            onChange={e => handleFilterChange('allowDiscount', e.target.checked)}
            className='rounded border-gray-600 bg-gray-800 text-orange-600 focus:ring-purple-500 focus:ring-2'
          />
          <span className='text-gray-300 text-sm'>Allow Discount</span>
        </label>

        <label className='flex items-center space-x-2 cursor-pointer'>
          <input
            type='checkbox'
            checked={filters.highLevel}
            onChange={e => handleQuickFilterToggle('highLevel')}
            className='rounded border-gray-600 bg-gray-800 text-orange-600 focus:ring-purple-500 focus:ring-2'
          />
          <span className='text-gray-300 text-sm'>High Level (50+)</span>
        </label>

        <label className='flex items-center space-x-2 cursor-pointer'>
          <input
            type='checkbox'
            checked={filters.richAccount}
            onChange={e => handleQuickFilterToggle('richAccount')}
            className='rounded border-gray-600 bg-gray-800 text-orange-600 focus:ring-purple-500 focus:ring-2'
          />
          <span className='text-gray-300 text-sm'>Rich Account ($1M+)</span>
        </label>
      </div>

      {/* Quick Filter Buttons */}
      <div className='mt-6'>
        <h3 className='text-lg font-semibold text-green-400 mb-4'>⚡ Quick Filters</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          <button
            onClick={() => handleQuickFilterToggle('hasGtaV')}
            className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
              filters.hasGtaV
                ? 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500'
                : 'bg-gray-800 hover:bg-orange-600 text-gray-300 hover:text-white border-gray-600 hover:border-orange-500'
            }`}
          >
            🚗 Has GTA V
          </button>

          <button
            onClick={() => handleQuickFilterToggle('hasRdr2')}
            className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
              filters.hasRdr2
                ? 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500'
                : 'bg-gray-800 hover:bg-orange-600 text-gray-300 hover:text-white border-gray-600 hover:border-orange-500'
            }`}
          >
            🤠 Has RDR2
          </button>

          <button
            onClick={() => {
              handleFilterChange('levelMin', '50')
              handleQuickFilterToggle('highLevel')
            }}
            className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
              filters.highLevel || filters.levelMin === '50'
                ? 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500'
                : 'bg-gray-800 hover:bg-orange-600 text-gray-300 hover:text-white border-gray-600 hover:border-orange-500'
            }`}
          >
            🏆 High Level
          </button>

          <button
            onClick={() => {
              handleFilterChange('cashMin', '1000000')
              handleQuickFilterToggle('richAccount')
            }}
            className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
              filters.richAccount || filters.cashMin === '1000000'
                ? 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500'
                : 'bg-gray-800 hover:bg-orange-600 text-gray-300 hover:text-white border-gray-600 hover:border-orange-500'
            }`}
          >
            💰 Rich Account
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className='mt-6'>
        <h3 className='text-lg font-semibold text-green-400 mb-4'>🔍 Advanced Filters</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Price Range */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Price Range ($)</label>
            <div className='flex space-x-2'>
              <input
                type='number'
                placeholder='Min'
                value={filters.priceMin}
                onChange={e => handleFilterChange('priceMin', e.target.value)}
                className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
              <input
                type='number'
                placeholder='Max'
                value={filters.priceMax}
                onChange={e => handleFilterChange('priceMax', e.target.value)}
                className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Level Range */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Level Range</label>
            <div className='flex space-x-2'>
              <input
                type='number'
                placeholder='Min Level'
                value={filters.levelMin}
                onChange={e => handleFilterChange('levelMin', e.target.value)}
                className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
              <input
                type='number'
                placeholder='Max Level'
                value={filters.levelMax}
                onChange={e => handleFilterChange('levelMax', e.target.value)}
                className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Cash Range */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Cash Range ($)</label>
            <div className='flex space-x-2'>
              <input
                type='number'
                placeholder='Min Cash'
                value={filters.cashMin}
                onChange={e => handleFilterChange('cashMin', e.target.value)}
                className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
              <input
                type='number'
                placeholder='Max Cash'
                value={filters.cashMax}
                onChange={e => handleFilterChange('cashMax', e.target.value)}
                className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Bank Cash Range */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Bank Cash Range ($)</label>
            <div className='flex space-x-2'>
              <input
                type='number'
                placeholder='Min Bank Cash'
                value={filters.bankCashMin}
                onChange={e => handleFilterChange('bankCashMin', e.target.value)}
                className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
              <input
                type='number'
                placeholder='Max Bank Cash'
                value={filters.bankCashMax}
                onChange={e => handleFilterChange('bankCashMax', e.target.value)}
                className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Email Provider */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Email Provider</label>
            <select
              value={filters.emailProvider}
              onChange={e => handleFilterChange('emailProvider', e.target.value)}
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value='all'>All Providers</option>
              <option value='gmail'>Gmail</option>
              <option value='yahoo'>Yahoo</option>
              <option value='outlook'>Outlook</option>
              <option value='hotmail'>Hotmail</option>
              <option value='yandex'>Yandex</option>
              <option value='rambler'>Rambler</option>
              <option value='mail.ru'>Mail.ru</option>
              <option value='other'>Other</option>
            </select>
          </div>

          {/* Email Type */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Email Type</label>
            <select
              value={filters.emailType}
              onChange={e => handleFilterChange('emailType', e.target.value)}
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value='all'>All Types</option>
              <option value='autoreg'>Auto Registration</option>
              <option value='manual'>Manual Registration</option>
              <option value='native'>Native Email</option>
            </select>
          </div>

          {/* Account Origin */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Account Origin</label>
            <select
              value={filters.itemOrigin}
              onChange={e => handleFilterChange('itemOrigin', e.target.value)}
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value='all'>All Origins</option>
              <option value='personal'>Personal</option>
              <option value='received'>Received</option>
              <option value='purchased'>Purchased</option>
              <option value='brute'>Brute</option>
              <option value='stealed'>Stealed</option>
            </select>
          </div>

          {/* Sort By */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={e => handleFilterChange('sortBy', e.target.value)}
              className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value='published_date_desc'>Newest First</option>
              <option value='published_date_asc'>Oldest First</option>
              <option value='price_to_up'>Price: Low to High</option>
              <option value='price_to_down'>Price: High to Low</option>
              <option value='level_desc'>Level: High to Low</option>
              <option value='level_asc'>Level: Low to High</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SocialClubFilters
