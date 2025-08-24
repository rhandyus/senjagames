import { Icon } from '@iconify/react'
import { useState } from 'react'

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

// DC ID options
const dcIdOptions = [
  { value: '1', label: 'DC 1' },
  { value: '2', label: 'DC 2' },
  { value: '3', label: 'DC 3' },
  { value: '4', label: 'DC 4' },
  { value: '5', label: 'DC 5' }
]

// Countries list (comprehensive list from telegram-filter.html)
const countries = [
  { value: 'AFG', label: 'Afghanistan' },
  { value: 'ALB', label: 'Albania' },
  { value: 'DZA', label: 'Algeria' },
  { value: 'AND', label: 'Andorra' },
  { value: 'AGO', label: 'Angola' },
  { value: 'ATG', label: 'Antigua and Barbuda' },
  { value: 'ARG', label: 'Argentina' },
  { value: 'ARM', label: 'Armenia' },
  { value: 'AUS', label: 'Australia' },
  { value: 'AUT', label: 'Austria' },
  { value: 'AZE', label: 'Azerbaijan' },
  { value: 'BHS', label: 'Bahamas' },
  { value: 'BHR', label: 'Bahrain' },
  { value: 'BGD', label: 'Bangladesh' },
  { value: 'BRB', label: 'Barbados' },
  { value: 'BLR', label: 'Belarus' },
  { value: 'BEL', label: 'Belgium' },
  { value: 'BLZ', label: 'Belize' },
  { value: 'BEN', label: 'Benin' },
  { value: 'BTN', label: 'Bhutan' },
  { value: 'BOL', label: 'Bolivia' },
  { value: 'BIH', label: 'Bosnia and Herzegovina' },
  { value: 'BWA', label: 'Botswana' },
  { value: 'BRA', label: 'Brazil' },
  { value: 'BRN', label: 'Brunei' },
  { value: 'BGR', label: 'Bulgaria' },
  { value: 'BFA', label: 'Burkina Faso' },
  { value: 'BDI', label: 'Burundi' },
  { value: 'CPV', label: 'Cabo Verde' },
  { value: 'KHM', label: 'Cambodia' },
  { value: 'CMR', label: 'Cameroon' },
  { value: 'CAN', label: 'Canada' },
  { value: 'CAF', label: 'Central African Republic' },
  { value: 'TCD', label: 'Chad' },
  { value: 'CHL', label: 'Chile' },
  { value: 'CHN', label: 'China' },
  { value: 'COL', label: 'Colombia' },
  { value: 'COM', label: 'Comoros' },
  { value: 'COD', label: 'Congo (Congo-Kinshasa)' },
  { value: 'COG', label: 'Congo (Congo-Brazzaville)' },
  { value: 'CRI', label: 'Costa Rica' },
  { value: 'CIV', label: "Côte d'Ivoire" },
  { value: 'HRV', label: 'Croatia' },
  { value: 'CUB', label: 'Cuba' },
  { value: 'CYP', label: 'Cyprus' },
  { value: 'CZE', label: 'Czech Republic (Czechia)' },
  { value: 'DNK', label: 'Denmark' },
  { value: 'DJI', label: 'Djibouti' },
  { value: 'DMA', label: 'Dominica' },
  { value: 'DOM', label: 'Dominican Republic' },
  { value: 'TLS', label: 'East Timor (Timor-Leste)' },
  { value: 'ECU', label: 'Ecuador' },
  { value: 'EGY', label: 'Egypt' },
  { value: 'SLV', label: 'El Salvador' },
  { value: 'GNQ', label: 'Equatorial Guinea' },
  { value: 'ERI', label: 'Eritrea' },
  { value: 'EST', label: 'Estonia' },
  { value: 'SWZ', label: 'Eswatini (fmr. "Swaziland")' },
  { value: 'ETH', label: 'Ethiopia' },
  { value: 'FJI', label: 'Fiji' },
  { value: 'FIN', label: 'Finland' },
  { value: 'FRA', label: 'France' },
  { value: 'GAB', label: 'Gabon' },
  { value: 'GMB', label: 'Gambia' },
  { value: 'GEO', label: 'Georgia' },
  { value: 'DEU', label: 'Germany' },
  { value: 'GHA', label: 'Ghana' },
  { value: 'GRC', label: 'Greece' },
  { value: 'GRD', label: 'Grenada' },
  { value: 'GTM', label: 'Guatemala' },
  { value: 'GIN', label: 'Guinea' },
  { value: 'GNB', label: 'Guinea-Bissau' },
  { value: 'GUY', label: 'Guyana' },
  { value: 'HTI', label: 'Haiti' },
  { value: 'HND', label: 'Honduras' },
  { value: 'HUN', label: 'Hungary' },
  { value: 'ISL', label: 'Iceland' },
  { value: 'IND', label: 'India' },
  { value: 'IDN', label: 'Indonesia' },
  { value: 'IRN', label: 'Iran' },
  { value: 'IRQ', label: 'Iraq' },
  { value: 'IRL', label: 'Ireland' },
  { value: 'ISR', label: 'Israel' },
  { value: 'ITA', label: 'Italy' },
  { value: 'JAM', label: 'Jamaica' },
  { value: 'JPN', label: 'Japan' },
  { value: 'JOR', label: 'Jordan' },
  { value: 'KAZ', label: 'Kazakhstan' },
  { value: 'KEN', label: 'Kenya' },
  { value: 'KIR', label: 'Kiribati' },
  { value: 'PRK', label: 'Korea, North' },
  { value: 'KOR', label: 'Korea, South' },
  { value: 'KWT', label: 'Kuwait' },
  { value: 'KGZ', label: 'Kyrgyzstan' },
  { value: 'LAO', label: 'Laos' },
  { value: 'LVA', label: 'Latvia' },
  { value: 'LBN', label: 'Lebanon' },
  { value: 'LSO', label: 'Lesotho' },
  { value: 'LBR', label: 'Liberia' },
  { value: 'LBY', label: 'Libya' },
  { value: 'LIE', label: 'Liechtenstein' },
  { value: 'LTU', label: 'Lithuania' },
  { value: 'LUX', label: 'Luxembourg' },
  { value: 'MDG', label: 'Madagascar' },
  { value: 'MWI', label: 'Malawi' },
  { value: 'MYS', label: 'Malaysia' },
  { value: 'MDV', label: 'Maldives' },
  { value: 'MLI', label: 'Mali' },
  { value: 'MLT', label: 'Malta' },
  { value: 'MHL', label: 'Marshall Islands' },
  { value: 'MRT', label: 'Mauritania' },
  { value: 'MUS', label: 'Mauritius' },
  { value: 'MEX', label: 'Mexico' },
  { value: 'FSM', label: 'Micronesia' },
  { value: 'MDA', label: 'Moldova' },
  { value: 'MCO', label: 'Monaco' },
  { value: 'MNG', label: 'Mongolia' },
  { value: 'MNE', label: 'Montenegro' },
  { value: 'MAR', label: 'Morocco' },
  { value: 'MOZ', label: 'Mozambique' },
  { value: 'MMR', label: 'Myanmar (formerly Burma)' },
  { value: 'NAM', label: 'Namibia' },
  { value: 'NRU', label: 'Nauru' },
  { value: 'NPL', label: 'Nepal' },
  { value: 'NLD', label: 'Netherlands' },
  { value: 'NZL', label: 'New Zealand' },
  { value: 'NIC', label: 'Nicaragua' },
  { value: 'NER', label: 'Niger' },
  { value: 'NGA', label: 'Nigeria' },
  { value: 'MKD', label: 'North Macedonia' },
  { value: 'NOR', label: 'Norway' },
  { value: 'OMN', label: 'Oman' },
  { value: 'PAK', label: 'Pakistan' },
  { value: 'PLW', label: 'Palau' },
  { value: 'PSE', label: 'Palestine State' },
  { value: 'PAN', label: 'Panama' },
  { value: 'PNG', label: 'Papua New Guinea' },
  { value: 'PRY', label: 'Paraguay' },
  { value: 'PER', label: 'Peru' },
  { value: 'PHL', label: 'Philippines' },
  { value: 'POL', label: 'Poland' },
  { value: 'PRT', label: 'Portugal' },
  { value: 'QAT', label: 'Qatar' },
  { value: 'ROU', label: 'Romania' },
  { value: 'RUS', label: 'Russia' },
  { value: 'RWA', label: 'Rwanda' },
  { value: 'KNA', label: 'Saint Kitts and Nevis' },
  { value: 'LCA', label: 'Saint Lucia' },
  { value: 'VCT', label: 'Saint Vincent and the Grenadines' },
  { value: 'WSM', label: 'Samoa' },
  { value: 'SMR', label: 'San Marino' },
  { value: 'STP', label: 'Sao Tome and Principe' },
  { value: 'SAU', label: 'Saudi Arabia' },
  { value: 'SEN', label: 'Senegal' },
  { value: 'SRB', label: 'Serbia' },
  { value: 'SYC', label: 'Seychelles' },
  { value: 'SLE', label: 'Sierra Leone' },
  { value: 'SGP', label: 'Singapore' },
  { value: 'SVK', label: 'Slovakia' },
  { value: 'SVN', label: 'Slovenia' },
  { value: 'SLB', label: 'Solomon Islands' },
  { value: 'SOM', label: 'Somalia' },
  { value: 'ZAF', label: 'South Africa' },
  { value: 'SSD', label: 'South Sudan' },
  { value: 'ESP', label: 'Spain' },
  { value: 'LKA', label: 'Sri Lanka' },
  { value: 'SDN', label: 'Sudan' },
  { value: 'SUR', label: 'Suriname' },
  { value: 'SWE', label: 'Sweden' },
  { value: 'CHE', label: 'Switzerland' },
  { value: 'SYR', label: 'Syria' },
  { value: 'TWN', label: 'Taiwan' },
  { value: 'TJK', label: 'Tajikistan' },
  { value: 'TZA', label: 'Tanzania' },
  { value: 'THA', label: 'Thailand' },
  { value: 'TGO', label: 'Togo' },
  { value: 'TON', label: 'Tonga' },
  { value: 'TTO', label: 'Trinidad and Tobago' },
  { value: 'TUN', label: 'Tunisia' },
  { value: 'TUR', label: 'Turkey' },
  { value: 'TKM', label: 'Turkmenistan' },
  { value: 'TUV', label: 'Tuvalu' },
  { value: 'UGA', label: 'Uganda' },
  { value: 'UKR', label: 'Ukraine' },
  { value: 'ARE', label: 'United Arab Emirates' },
  { value: 'GBR', label: 'United Kingdom' },
  { value: 'USA', label: 'United States' },
  { value: 'URY', label: 'Uruguay' },
  { value: 'UZB', label: 'Uzbekistan' },
  { value: 'VUT', label: 'Vanuatu' },
  { value: 'VAT', label: 'Vatican City (Holy See)' },
  { value: 'VEN', label: 'Venezuela' },
  { value: 'VNM', label: 'Vietnam' },
  { value: 'YEM', label: 'Yemen' },
  { value: 'ZMB', label: 'Zambia' },
  { value: 'ZWE', label: 'Zimbabwe' }
]

const TelegramFilters = ({ onFilterChange, loading }) => {
  const [filters, setFilters] = useState({
    // Pagination
    page: 1,

    // Price filters
    pmin: '',
    pmax: '',

    // General filters
    title: '',
    order_by: 'price_to_up',

    // Telegram specific filters
    min_channels: '',
    max_channels: '',
    min_chats: '',
    max_chats: '',
    min_conversations: '',
    max_conversations: '',
    min_admin: '',
    max_admin: '',
    min_admin_sub: '',
    max_admin_sub: '',
    min_contacts: '',
    max_contacts: '',
    min_gifts: '',
    max_gifts: '',
    min_nft_gifts: '',
    max_nft_gifts: '',
    min_gifts_stars: '',
    max_gifts_stars: '',
    min_gifts_convert_stars: '',
    max_gifts_convert_stars: '',
    dig_min: '',
    dig_max: '',
    daybreak: '',

    // Multiple select filters
    origin: [],
    not_origin: [],
    country: [],
    not_country: [],
    dc_id: [],
    not_dc_id: [],

    // Radio button filters
    spam: 'all', // all, yes, no
    premium: 'all' // all, yes, no
  })

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value, page: 1 }
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    if (onFilterChange) {
      onFilterChange(filters)
    }
  }

  const handleSortChange = sortValue => {
    handleFilterChange('order_by', sortValue)
    const sortInput = document.getElementById('sortInput')
    if (sortInput) {
      sortInput.value = sortValue
    }

    // Update active sort button
    document.querySelectorAll('.button-sort').forEach(btn => btn.classList.remove('selected'))
    const selectedButton = document.querySelector(`[data-value="${sortValue}"]`)
    if (selectedButton) {
      selectedButton.classList.add('selected')
    }
  }

  const clearAllFilters = () => {
    setFilters({
      page: 1,
      pmin: '',
      pmax: '',
      title: '',
      order_by: 'price_to_up',
      min_channels: '',
      max_channels: '',
      min_chats: '',
      max_chats: '',
      min_conversations: '',
      max_conversations: '',
      min_admin: '',
      max_admin: '',
      min_admin_sub: '',
      max_admin_sub: '',
      min_contacts: '',
      max_contacts: '',
      min_gifts: '',
      max_gifts: '',
      min_nft_gifts: '',
      max_nft_gifts: '',
      min_gifts_stars: '',
      max_gifts_stars: '',
      min_gifts_convert_stars: '',
      max_gifts_convert_stars: '',
      dig_min: '',
      dig_max: '',
      daybreak: '',
      origin: [],
      not_origin: [],
      country: [],
      not_country: [],
      dc_id: [],
      not_dc_id: [],
      spam: 'all',
      premium: 'all'
    })

    // Auto-apply to show all accounts
    setTimeout(() => handleApplyFilters(), 100)
  }

  // MultiSelect component for dropdown filters
  const MultiSelect = ({ field, options, placeholder, value }) => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleOption = optionValue => {
      const currentValues = value || []
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue]

      handleFilterChange(field, newValues)
    }

    const selectedLabels = (value || [])
      .map(val => options.find(opt => opt.value === val)?.label || val)
      .join(', ')

    return (
      <div className='relative'>
        <button
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          className='w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-left text-gray-300 hover:border-gray-500 focus:border-blue-500 focus:outline-none'
        >
          <span className={selectedLabels ? 'text-white' : 'text-gray-400'}>
            {selectedLabels || placeholder}
          </span>
          <Icon
            icon={isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'}
            className='float-right mt-1'
          />
        </button>

        {isOpen && (
          <div className='absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
            {options.map(option => (
              <label
                key={option.value}
                className='flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer'
              >
                <input
                  type='checkbox'
                  checked={(value || []).includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className='mr-2 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500'
                />
                <span className='text-gray-200'>{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6'>
      {/* Search Form */}
      <form className='searchBarContainer'>
        <div className='filterContainer'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* First Column */}
            <div className='filterColumn space-y-4'>
              {/* Price Filters */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Price Range</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    step='0.01'
                    min='0'
                    placeholder='Min price'
                    value={filters.pmin}
                    onChange={e => handleFilterChange('pmin', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    step='0.01'
                    min='0'
                    placeholder='Max price'
                    value={filters.pmax}
                    onChange={e => handleFilterChange('pmax', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                </div>
              </div>

              {/* Title/Search */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Search Title</label>
                <input
                  type='text'
                  placeholder='Search accounts...'
                  value={filters.title}
                  onChange={e => handleFilterChange('title', e.target.value)}
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                />
              </div>

              {/* Channels */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Count of Channels
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    min='0'
                    placeholder='Channels from'
                    value={filters.min_channels}
                    onChange={e => handleFilterChange('min_channels', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    min='0'
                    placeholder='up to'
                    value={filters.max_channels}
                    onChange={e => handleFilterChange('max_channels', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                </div>
              </div>

              {/* Chats */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Count of Chats
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    min='0'
                    placeholder='Chats from'
                    value={filters.min_chats}
                    onChange={e => handleFilterChange('min_chats', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    min='0'
                    placeholder='up to'
                    value={filters.max_chats}
                    onChange={e => handleFilterChange('max_chats', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                </div>
              </div>

              {/* Conversations */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Count of Conversations
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    min='0'
                    placeholder='Conversations from'
                    value={filters.min_conversations}
                    onChange={e => handleFilterChange('min_conversations', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    min='0'
                    placeholder='up to'
                    value={filters.max_conversations}
                    onChange={e => handleFilterChange('max_conversations', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                </div>
              </div>
            </div>

            {/* Second Column */}
            <div className='filterColumn space-y-4'>
              {/* Admin Chats */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Admin Chats</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    min='0'
                    placeholder='Admin chats from'
                    value={filters.min_admin}
                    onChange={e => handleFilterChange('min_admin', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    min='0'
                    placeholder='up to'
                    value={filters.max_admin}
                    onChange={e => handleFilterChange('max_admin', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                </div>
              </div>

              {/* Admin Subscribers */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Count of subscribers in admin chats
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    min='0'
                    placeholder='From'
                    value={filters.min_admin_sub}
                    onChange={e => handleFilterChange('min_admin_sub', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    min='0'
                    placeholder='up to'
                    value={filters.max_admin_sub}
                    onChange={e => handleFilterChange('max_admin_sub', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                </div>
              </div>

              {/* Contacts */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Number of contacts
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    min='0'
                    placeholder='From'
                    value={filters.min_contacts}
                    onChange={e => handleFilterChange('min_contacts', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    min='0'
                    placeholder='up to'
                    value={filters.max_contacts}
                    onChange={e => handleFilterChange('max_contacts', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                </div>
              </div>

              {/* ID Digit Count */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  ID digit count
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    min='1'
                    placeholder='From'
                    value={filters.dig_min}
                    onChange={e => handleFilterChange('dig_min', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    min='1'
                    placeholder='up to'
                    value={filters.dig_max}
                    onChange={e => handleFilterChange('dig_max', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                </div>
              </div>

              {/* Days Inactive */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Days Inactive
                </label>
                <input
                  type='number'
                  min='0'
                  placeholder='Days Inactive'
                  value={filters.daybreak}
                  onChange={e => handleFilterChange('daybreak', e.target.value)}
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                />
              </div>

              {/* Account Origin */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Account Origin
                </label>
                <MultiSelect
                  field='origin'
                  options={originOptions}
                  placeholder='Account origin'
                  value={filters.origin}
                />
              </div>

              {/* Exclude Account Origin */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Exclude Account Origin
                </label>
                <MultiSelect
                  field='not_origin'
                  options={originOptions}
                  placeholder='Exclude Account origin'
                  value={filters.not_origin}
                />
              </div>
            </div>

            {/* Third Column */}
            <div className='filterColumn space-y-4'>
              {/* Country */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Country</label>
                <MultiSelect
                  field='country'
                  options={countries}
                  placeholder='Country'
                  value={filters.country}
                />
              </div>

              {/* Exclude Country */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Exclude Country
                </label>
                <MultiSelect
                  field='not_country'
                  options={countries}
                  placeholder='Exclude Country'
                  value={filters.not_country}
                />
              </div>

              {/* DC ID */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>DC ID</label>
                <MultiSelect
                  field='dc_id'
                  options={dcIdOptions}
                  placeholder='DC ID'
                  value={filters.dc_id}
                />
              </div>

              {/* Exclude DC ID */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Exclude DC ID
                </label>
                <MultiSelect
                  field='not_dc_id'
                  options={dcIdOptions}
                  placeholder='Exclude DC ID'
                  value={filters.not_dc_id}
                />
              </div>

              {/* Spam Block */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Spam Block</label>
                <div className='space-y-2'>
                  {[
                    { value: 'all', label: 'Any' },
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' }
                  ].map(option => (
                    <label key={option.value} className='flex items-center'>
                      <input
                        type='radio'
                        name='spam'
                        value={option.value}
                        checked={filters.spam === option.value}
                        onChange={e => handleFilterChange('spam', e.target.value)}
                        className='mr-2 text-blue-500 bg-gray-700 border-gray-600'
                      />
                      <span className='text-gray-300'>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Telegram Premium */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Telegram Premium
                </label>
                <div className='space-y-2'>
                  {[
                    { value: 'all', label: 'Any' },
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' }
                  ].map(option => (
                    <label key={option.value} className='flex items-center'>
                      <input
                        type='radio'
                        name='premium'
                        value={option.value}
                        checked={filters.premium === option.value}
                        onChange={e => handleFilterChange('premium', e.target.value)}
                        className='mr-2 text-blue-500 bg-gray-700 border-gray-600'
                      />
                      <span className='text-gray-300'>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gifts */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Gifts</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    min='0'
                    placeholder='From'
                    value={filters.min_gifts}
                    onChange={e => handleFilterChange('min_gifts', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                  <input
                    type='number'
                    min='0'
                    placeholder='up to'
                    value={filters.max_gifts}
                    onChange={e => handleFilterChange('max_gifts', e.target.value)}
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sort Buttons */}
        <div className='mt-6 flex flex-wrap gap-2'>
          <input type='hidden' id='sortInput' name='order_by' value={filters.order_by} />
          {[
            { value: 'price_to_up', label: 'Cheapest' },
            { value: 'price_to_down', label: 'Expensive' },
            { value: 'pdate_to_down_upload', label: 'Newest' },
            { value: 'pdate_to_up_upload', label: 'Oldest' }
          ].map(sort => (
            <button
              key={sort.value}
              type='button'
              onClick={() => handleSortChange(sort.value)}
              data-value={sort.value}
              className={`button-sort px-4 py-2 rounded-lg text-sm transition-colors ${
                filters.order_by === sort.value
                  ? 'bg-blue-600 text-white selected'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {sort.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className='mt-6 flex gap-4'>
          <button
            type='button'
            onClick={handleApplyFilters}
            disabled={loading}
            className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2 rounded-lg transition-colors'
          >
            {loading ? (
              <>
                <Icon icon='mdi:loading' className='animate-spin mr-2' />
                Loading...
              </>
            ) : (
              'Update Results'
            )}
          </button>

          <button
            type='button'
            onClick={clearAllFilters}
            className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors'
          >
            Clear All Filters
          </button>
        </div>
      </form>
    </div>
  )
}

export default TelegramFilters
