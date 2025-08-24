import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import useFortniteCosmeticItems from '../hooks/useFortniteCosmeticItems'
import SearchableCosmeticDropdown from './SearchableCosmeticDropdown'

const FortniteFilters = ({ onFiltersChange, initialFilters = {} }) => {
  // Fetch Fortnite cosmetic items from LZT Market API
  const {
    cosmeticItems,
    loading: cosmeticLoading,
    error: cosmeticError
  } = useFortniteCosmeticItems()

  const [filters, setFilters] = useState({
    // Base parameters
    pmin: '',
    pmax: '',
    title: '',
    order_by: 'price_to_up',
    show: 'active',
    tag_id: [],
    not_tag_id: [],
    origin: [],
    not_origin: [],
    user_id: '',
    nsb: false,
    sb: false,
    nsb_by_me: false,
    sb_by_me: false,
    eg: '',
    hide_viewed: false,
    currency: 'USD',
    email_login_data: false,
    item_domain: '',
    not_item_domain: '',
    email_provider: [],
    not_email_provider: [],
    email_type: '', // Ensure scalar value
    mail: '', // Add email provider field
    login: '',
    username: '',
    delete_reason: '',
    delete_username: '',
    published_after: '',
    published_before: '',

    // Fortnite specific parameters
    smin: '',
    smax: '',
    vbmin: '',
    vbmax: '',
    selectedSkins: [],
    selectedPickaxes: [],
    selectedEmotes: [],
    selectedGliders: [],
    skin: [],
    pickaxe: [],
    dance: [],
    glider: [],
    change_email: '',
    platform: '', // Ensure scalar value
    bp: '',
    lmin: '',
    lmax: '',
    bp_lmin: '',
    bp_lmax: '',
    rl_purchases: false,
    last_trans_date: '',
    last_trans_date_period: 'year',
    no_trans: false,
    xbox_linkable: '',
    psn_linkable: '',
    daybreak: '',
    temp_email: '',
    reg: '',
    reg_period: 'year',
    skins_shop_min: '',
    skins_shop_max: '',
    pickaxes_shop_min: '',
    pickaxes_shop_max: '',
    dances_shop_min: '',
    dances_shop_max: '',
    gliders_shop_min: '',
    gliders_shop_max: '',
    skins_shop_vbmin: '',
    skins_shop_vbmax: '',
    pickaxes_shop_vbmin: '',
    pickaxes_shop_vbmax: '',
    dances_shop_vbmin: '',
    dances_shop_vbmax: '',
    gliders_shop_vbmin: '',
    gliders_shop_vbmax: '',
    refund_credits_min: '',
    refund_credits_max: '',
    stw: '',
    warranty: '',
    ...initialFilters
  })

  const platformOptions = [
    { value: 'Epic', label: 'Epic Games' },
    { value: 'EpicAndroid', label: 'Epic Games (Android)' },
    { value: 'EpicIOS', label: 'Epic Games (iOS)' },
    { value: 'EpicPC', label: 'Epic Games (PC)' },
    { value: 'EpicPCKorea', label: 'Epic Games (PC Korea)' },
    { value: 'GooglePlay', label: 'Google Play' },
    { value: 'IOSAppStore', label: 'iOS App Store' },
    { value: 'Live', label: 'Xbox Live' },
    { value: 'Nintendo', label: 'Nintendo' },
    { value: 'OneStoreKorea', label: 'One Store Korea' },
    { value: 'PSN', label: 'PlayStation Network' },
    { value: 'Samsung', label: 'Samsung' }
  ]

  const warrantyOptions = [
    { value: '24', label: '24 hours' },
    { value: '168', label: '7 days' },
    { value: '720', label: '30 days' },
    { value: '2160', label: '3 months' },
    { value: '4320', label: '6 months' },
    { value: '8760', label: '1 year' }
  ]

  const timePeriodOptions = [
    { value: 'day', label: 'days' },
    { value: 'month', label: 'months' },
    { value: 'year', label: 'years' }
  ]

  const orderByOptions = [
    { value: 'price_to_up', label: 'Termurah' },
    { value: 'price_to_down', label: 'Termahal' },
    { value: 'pdate_to_down_upload', label: 'Terbaru' },
    { value: 'pdate_to_up_upload', label: 'Paling Lama' }
  ]

  const originOptions = [
    { value: 'brute', label: 'Brute' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'stealer', label: 'Stealer' },
    { value: 'personal', label: 'Personal' },
    { value: 'resale', label: 'Resale' },
    { value: 'autoreg', label: 'Auto Registration' },
    { value: 'self_registration', label: 'Self Registration' },
    { value: 'retrieve', label: 'Retrieve' },
    { value: 'retrieve_via_support', label: 'Retrieve via Support' },
    { value: 'dummy', label: 'Dummy' }
  ]

  const emailProviderOptions = [
    { value: 'other', label: 'Other' },
    { value: 'rambler', label: 'Rambler' },
    { value: 'outlook', label: 'Outlook' },
    { value: 'firstmail', label: 'FirstMail' },
    { value: 'notletters', label: 'NotLetters' },
    { value: 'mail_ru', label: 'Mail.ru' }
  ]

  const emailTypeOptions = [
    { value: 'autoreg', label: 'Auto Registration' },
    { value: 'native', label: 'Native' },
    { value: 'market', label: 'Market' },
    { value: 'no', label: 'No Email' }
  ]

  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...initialFilters }))
    }
  }, [JSON.stringify(initialFilters)]) // Use JSON.stringify to prevent infinite re-renders

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      if (onFiltersChange) {
        onFiltersChange(newFilters)
      }
      return newFilters
    })
  }

  const handleSortChange = sortValue => {
    setFilters(prev => {
      const newFilters = { ...prev, order_by: sortValue }
      if (onFiltersChange) {
        onFiltersChange(newFilters)
      }
      return newFilters
    })
  }

  const handleCosmeticItemChange = (type, selectedItems) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [`selected${type.charAt(0).toUpperCase() + type.slice(1)}`]: selectedItems,
        [type === 'emotes' ? 'dance' : type.slice(0, -1)]: selectedItems.map(item => item.value)
      }
      if (onFiltersChange) {
        onFiltersChange(newFilters)
      }
      return newFilters
    })
  }

  const handleRadioChange = (name, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value }
      if (onFiltersChange) {
        onFiltersChange(newFilters)
      }
      return newFilters
    })
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      platform: '', // Ensure scalar value
      daybreak: '',
      origin: [],
      not_origin: [],
      warranty: '', // Ensure scalar value
      change_email: '',
      xbox_linkable: '', // Ensure scalar value
      psn_linkable: '', // Ensure scalar value
      rl_purchases: false,
      selectedSkins: [],
      selectedPickaxes: [],
      selectedEmotes: [],
      selectedGliders: [],
      skin: [],
      pickaxe: [],
      dance: [],
      glider: [],
      smin: '',
      smax: '',
      vbmin: '',
      vbmax: '',
      lmin: '',
      lmax: '',
      skins_shop_min: '',
      skins_shop_max: '',
      pickaxes_shop_min: '',
      pickaxes_shop_max: '',
      dances_shop_min: '',
      dances_shop_max: '',
      gliders_shop_min: '',
      gliders_shop_max: '',
      skins_shop_vbmin: '',
      skins_shop_vbmax: '',
      pickaxes_shop_vbmin: '',
      pickaxes_shop_vbmax: '',
      dances_shop_vbmin: '',
      dances_shop_vbmax: '',
      gliders_shop_vbmin: '',
      gliders_shop_vbmax: '',
      bp: '',
      bp_lmin: '',
      bp_lmax: '',
      stw: '',
      reg: '',
      reg_period: 'year',
      last_trans_date: '',
      last_trans_date_period: 'year',
      no_trans: false,
      order_by: 'price_to_up',
      price_min: '',
      price_max: '',
      mail: '', // Add this for email provider
      email_type: '' // Ensure scalar value
    }
    setFilters(clearedFilters)
    if (onFiltersChange) {
      onFiltersChange(clearedFilters)
    }
  }

  const handleSubmit = e => {
    if (e) e.preventDefault()
    if (onFiltersChange) {
      onFiltersChange(filters)
    }
  }

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6'>
      {/* Quick Game Filters */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-green-400'>🎮 Fortnite Account Filters</h3>
          <button
            onClick={handleClearFilters}
            className='bg-red-700 hover:bg-red-600 text-red-100 hover:text-white px-3 py-1 rounded-lg text-sm transition-colors border border-red-600 hover:border-red-500'
          >
            Clear All Filters
          </button>
        </div>

        {/* Fortnite Cosmetic Items Loading/Error Status */}
        {cosmeticLoading && (
          <div className='flex items-center gap-2 text-blue-400 text-sm mb-2'>
            <Icon icon='eos-icons:loading' className='w-4 h-4 animate-spin' />
            Loading Fortnite cosmetic items from LZT Market...
          </div>
        )}

        {cosmeticError && (
          <div className='flex items-center gap-2 text-orange-400 text-sm mb-2'>
            <Icon icon='material-symbols:warning' className='w-4 h-4' />
            Using demo Fortnite cosmetic data (API: {cosmeticError})
          </div>
        )}
      </div>

      {/* Search Form */}
      <form className='searchBarContainer'>
        <div className='filterContainer'>
          {/* Three-column grid layout */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* First Column */}
            <div className='filterColumn space-y-4'>
              {/* Platform */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Platform</label>
                <select
                  value={Array.isArray(filters.platform) ? '' : filters.platform || ''}
                  onChange={e => handleFilterChange('platform', e.target.value)}
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                >
                  <option value=''>All Platforms</option>
                  {platformOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className='splitFilter'>
                <label className='text-gray-300 text-sm font-medium'>Price Range</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    value={filters.price_min || ''}
                    onChange={e => handleFilterChange('price_min', e.target.value)}
                    placeholder='Min Price'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                  <input
                    type='number'
                    value={filters.price_max || ''}
                    onChange={e => handleFilterChange('price_max', e.target.value)}
                    placeholder='Max Price'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>
              </div>

              {/* Level Range */}
              <div className='splitFilter'>
                <label className='text-gray-300 text-sm font-medium'>Account Level</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    value={filters.lmin}
                    onChange={e => handleFilterChange('lmin', e.target.value)}
                    placeholder='Min Level'
                    min='1'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                  <input
                    type='number'
                    value={filters.lmax}
                    onChange={e => handleFilterChange('lmax', e.target.value)}
                    placeholder='Max Level'
                    min='1'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>
              </div>

              {/* V-Bucks Range */}
              <div className='splitFilter'>
                <label className='text-gray-300 text-sm font-medium'>V-Bucks</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    value={filters.vbmin}
                    onChange={e => handleFilterChange('vbmin', e.target.value)}
                    placeholder='Min V-Bucks'
                    min='1'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                  <input
                    type='number'
                    value={filters.vbmax}
                    onChange={e => handleFilterChange('vbmax', e.target.value)}
                    placeholder='Max V-Bucks'
                    min='1'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>
              </div>

              {/* Skins Count */}
              <div className='splitFilter'>
                <label className='text-gray-300 text-sm font-medium'>Skins Count</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    value={filters.smin}
                    onChange={e => handleFilterChange('smin', e.target.value)}
                    placeholder='Min Skins'
                    min='1'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                  <input
                    type='number'
                    value={filters.smax}
                    onChange={e => handleFilterChange('smax', e.target.value)}
                    placeholder='Max Skins'
                    min='1'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>
              </div>
            </div>

            {/* Second Column */}
            <div className='filterColumn space-y-4'>
              {/* Skins */}
              <SearchableCosmeticDropdown
                selectedItems={filters.selectedSkins}
                onItemChange={items => handleCosmeticItemChange('skins', items)}
                itemsList={cosmeticItems.skins}
                placeholder='Search skins...'
                label='Skins'
                type='skins'
                disabled={cosmeticLoading}
              />

              {/* Pickaxes */}
              <SearchableCosmeticDropdown
                selectedItems={filters.selectedPickaxes}
                onItemChange={items => handleCosmeticItemChange('pickaxes', items)}
                itemsList={cosmeticItems.pickaxes}
                placeholder='Search pickaxes...'
                label='Pickaxes'
                type='pickaxes'
                disabled={cosmeticLoading}
              />

              {/* Emotes */}
              <SearchableCosmeticDropdown
                selectedItems={filters.selectedEmotes}
                onItemChange={items => handleCosmeticItemChange('emotes', items)}
                itemsList={cosmeticItems.emotes}
                placeholder='Search emotes...'
                label='Emotes'
                type='emotes'
                disabled={cosmeticLoading}
              />

              {/* Gliders */}
              <SearchableCosmeticDropdown
                selectedItems={filters.selectedGliders}
                onItemChange={items => handleCosmeticItemChange('gliders', items)}
                itemsList={cosmeticItems.gliders}
                placeholder='Search gliders...'
                label='Gliders'
                type='gliders'
                disabled={cosmeticLoading}
              />

              {/* Sort Buttons */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Urutkan</label>
                <div className='flex flex-wrap gap-2'>
                  <input type='hidden' id='sortInput' name='order_by' value={filters.order_by} />

                  <button
                    type='button'
                    className={`px-4 py-2 rounded-lg transition-colors button-sort ${filters.order_by === 'price_to_up' ? 'bg-purple-600 text-white selected' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    data-value='price_to_up'
                    onClick={() => handleSortChange('price_to_up')}
                  >
                    Termurah
                  </button>
                  <button
                    type='button'
                    className={`px-4 py-2 rounded-lg transition-colors button-sort ${filters.order_by === 'price_to_down' ? 'bg-purple-600 text-white selected' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    data-value='price_to_down'
                    onClick={() => handleSortChange('price_to_down')}
                  >
                    Termahal
                  </button>
                  <button
                    type='button'
                    className={`px-4 py-2 rounded-lg transition-colors button-sort ${filters.order_by === 'pdate_to_down_upload' ? 'bg-purple-600 text-white selected' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    data-value='pdate_to_down_upload'
                    onClick={() => handleSortChange('pdate_to_down_upload')}
                  >
                    Terbaru
                  </button>
                  <button
                    type='button'
                    className={`px-4 py-2 rounded-lg transition-colors button-sort ${filters.order_by === 'pdate_to_up_upload' ? 'bg-purple-600 text-white selected' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    data-value='pdate_to_up_upload'
                    onClick={() => handleSortChange('pdate_to_up_upload')}
                  >
                    Paling Lama
                  </button>
                </div>
              </div>

              {/* Email Provider */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Email Provider</label>
                <select
                  value={Array.isArray(filters.mail) ? '' : filters.mail || ''}
                  onChange={e => handleFilterChange('mail', e.target.value)}
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                >
                  <option value=''>Any Provider</option>
                  {emailProviderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email Type */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Email Type</label>
                <select
                  value={Array.isArray(filters.email_type) ? '' : filters.email_type || ''}
                  onChange={e => handleFilterChange('email_type', e.target.value)}
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                >
                  <option value=''>Any Type</option>
                  {emailTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Warranty Period */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Warranty</label>
                <select
                  value={Array.isArray(filters.warranty) ? '' : filters.warranty || ''}
                  onChange={e => handleFilterChange('warranty', e.target.value)}
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                >
                  <option value=''>Any Warranty</option>
                  {warrantyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Battle Pass */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Battle Pass</label>
                <div className='grid grid-cols-3 gap-1'>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='bp'
                      value=''
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.bp === ''}
                      onChange={() => handleRadioChange('bp', '')}
                    />
                    <span className='text-xs text-gray-300'>Any</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='bp'
                      value='yes'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.bp === 'yes'}
                      onChange={() => handleRadioChange('bp', 'yes')}
                    />
                    <span className='text-xs text-gray-300'>Yes</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='bp'
                      value='no'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.bp === 'no'}
                      onChange={() => handleRadioChange('bp', 'no')}
                    />
                    <span className='text-xs text-gray-300'>No</span>
                  </label>
                </div>
              </div>

              {/* Save the World */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Save the World</label>
                <div className='grid grid-cols-3 gap-1'>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='stw'
                      value=''
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.stw === ''}
                      onChange={() => handleRadioChange('stw', '')}
                    />
                    <span className='text-xs text-gray-300'>Any</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='stw'
                      value='yes'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.stw === 'yes'}
                      onChange={() => handleRadioChange('stw', 'yes')}
                    />
                    <span className='text-xs text-gray-300'>Yes</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='stw'
                      value='no'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.stw === 'no'}
                      onChange={() => handleRadioChange('stw', 'no')}
                    />
                    <span className='text-xs text-gray-300'>No</span>
                  </label>
                </div>
              </div>

              {/* Email Changeable */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Changeable Email</label>
                <div className='grid grid-cols-3 gap-1'>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='change_email'
                      value=''
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.change_email === ''}
                      onChange={() => handleRadioChange('change_email', '')}
                    />
                    <span className='text-xs text-gray-300'>Any</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='change_email'
                      value='yes'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.change_email === 'yes'}
                      onChange={() => handleRadioChange('change_email', 'yes')}
                    />
                    <span className='text-xs text-gray-300'>Yes</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='change_email'
                      value='no'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.change_email === 'no'}
                      onChange={() => handleRadioChange('change_email', 'no')}
                    />
                    <span className='text-xs text-gray-300'>No</span>
                  </label>
                </div>
              </div>

              {/* Warranty */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Warranty Duration</label>
                <select
                  value={Array.isArray(filters.warranty) ? '' : filters.warranty || ''}
                  onChange={e => handleFilterChange('warranty', e.target.value)}
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                >
                  <option value=''>Any Duration</option>
                  {warrantyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Features Checkboxes */}
              <div className='space-y-2'>
                <label className='flex items-center space-x-2 text-gray-300'>
                  <input
                    type='checkbox'
                    className='rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500'
                    checked={filters.rl_purchases}
                    onChange={e => handleFilterChange('rl_purchases', e.target.checked)}
                  />
                  <span className='text-sm'>Rocket League items</span>
                </label>

                <label className='flex items-center space-x-2 text-gray-300'>
                  <input
                    type='checkbox'
                    className='rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500'
                    checked={filters.no_trans}
                    onChange={e => handleFilterChange('no_trans', e.target.checked)}
                  />
                  <span className='text-sm'>No transactions</span>
                </label>
              </div>
            </div>

            {/* Third Column */}
            <div className='filterColumn space-y-4'>
              {/* Battle Pass Level */}
              <div className='splitFilter'>
                <label className='text-gray-300 text-sm font-medium'>Battle Pass Level</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    value={filters.bp_lmin}
                    onChange={e => handleFilterChange('bp_lmin', e.target.value)}
                    placeholder='Min BP Level'
                    min='1'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                  <input
                    type='number'
                    value={filters.bp_lmax}
                    onChange={e => handleFilterChange('bp_lmax', e.target.value)}
                    placeholder='Max BP Level'
                    min='1'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>
              </div>

              {/* Account Age */}
              <div className='splitFilter'>
                <label className='text-gray-300 text-sm font-medium'>Account Age</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    value={filters.reg}
                    onChange={e => handleFilterChange('reg', e.target.value)}
                    placeholder='Age...'
                    min='1'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                  <select
                    value={filters.reg_period}
                    onChange={e => handleFilterChange('reg_period', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  >
                    {timePeriodOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Last Transaction Date */}
              <div className='splitFilter'>
                <label className='text-gray-300 text-sm font-medium'>Last Transaction</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    value={filters.last_trans_date}
                    onChange={e => handleFilterChange('last_trans_date', e.target.value)}
                    placeholder='Days ago...'
                    min='1'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                  <select
                    value={filters.last_trans_date_period}
                    onChange={e => handleFilterChange('last_trans_date_period', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  >
                    {timePeriodOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Days Inactive */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Days Inactive</label>
                <input
                  type='number'
                  value={filters.daybreak}
                  onChange={e => handleFilterChange('daybreak', e.target.value)}
                  placeholder='Days Inactive'
                  min='0'
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                />
              </div>

              {/* Xbox & PSN Linkable Options */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Platform Linkable</label>
                <div className='grid grid-cols-2 gap-2'>
                  <select
                    value={Array.isArray(filters.xbox_linkable) ? '' : filters.xbox_linkable || ''}
                    onChange={e => handleFilterChange('xbox_linkable', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  >
                    <option value=''>Xbox Any</option>
                    <option value='yes'>Xbox Yes</option>
                    <option value='no'>Xbox No</option>
                  </select>
                  <select
                    value={Array.isArray(filters.psn_linkable) ? '' : filters.psn_linkable || ''}
                    onChange={e => handleFilterChange('psn_linkable', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  >
                    <option value=''>PSN Any</option>
                    <option value='yes'>PSN Yes</option>
                    <option value='no'>PSN No</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='mt-6'>
            <button
              type='button'
              onClick={handleSubmit}
              className='w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors font-medium'
            >
              Apply Filters
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default FortniteFilters
