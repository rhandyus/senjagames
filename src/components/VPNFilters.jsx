import { useCallback, useState } from 'react'

const VPNFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    vpn_service: '',
    vpn_renewable: '',
    min_price: '',
    max_price: '',
    vpn_expire_date: '',
    ...initialFilters
  })

  console.log('🌐 VPN Filters rendered with:', filters)

  const updateFilters = useCallback(
    newFilters => {
      console.log('🌐 VPN Filters updating:', newFilters)
      const updatedFilters = { ...filters, ...newFilters }
      setFilters(updatedFilters)

      // Clean up empty filters before sending
      const cleanFilters = Object.fromEntries(
        Object.entries(updatedFilters).filter(([_, value]) => value !== '' && value !== null)
      )

      onFiltersChange(cleanFilters)
    },
    [filters, onFiltersChange]
  )

  const resetFilters = () => {
    console.log('🌐 VPN Filters reset')
    const emptyFilters = {
      vpn_service: '',
      vpn_renewable: '',
      min_price: '',
      max_price: '',
      vpn_expire_date: ''
    }
    setFilters(emptyFilters)
    onFiltersChange({})
  }

  return (
    <div className='bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-3'>
          <div className='w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center'>
            <svg viewBox='0 0 24 24' className='w-5 h-5 text-white' fill='currentColor'>
              <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
            </svg>
          </div>
          <h3 className='text-lg font-semibold text-white'>VPN Filters</h3>
        </div>
        <button
          onClick={resetFilters}
          className='px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors'
        >
          Clear All
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {/* VPN Service */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>VPN Service</label>
          <select
            value={filters.vpn_service}
            onChange={e => updateFilters({ vpn_service: e.target.value })}
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none'
          >
            <option value=''>All Services</option>
            <option value='AdguardVPN'>AdGuard VPN</option>
            <option value='PIAVPN'>Private Internet Access</option>
            <option value='cyberghostVPN'>CyberGhost VPN</option>
            <option value='hotspotShieldVPN'>Hotspot Shield VPN</option>
            <option value='mullvadVPN'>Mullvad VPN</option>
            <option value='planetVPN'>Planet VPN</option>
            <option value='pureVPN'>PureVPN</option>
            <option value='tunnelbearVPN'>TunnelBear VPN</option>
            <option value='ultraVPN'>Ultra VPN</option>
            <option value='vanishVPN'>Vanish VPN</option>
            <option value='vyprVPN'>VyprVPN</option>
            <option value='windscribeVPN'>Windscribe VPN</option>
          </select>
        </div>

        {/* Renewable */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Renewable</label>
          <select
            value={filters.vpn_renewable}
            onChange={e => updateFilters({ vpn_renewable: e.target.value })}
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none'
          >
            <option value=''>Any</option>
            <option value='1'>Renewable</option>
            <option value='0'>Non-Renewable</option>
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Min Price ($)</label>
          <input
            type='number'
            value={filters.min_price}
            onChange={e => updateFilters({ min_price: e.target.value })}
            placeholder='0'
            min='0'
            step='0.01'
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none'
          />
        </div>

        {/* Max Price */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Max Price ($)</label>
          <input
            type='number'
            value={filters.max_price}
            onChange={e => updateFilters({ max_price: e.target.value })}
            placeholder='1000'
            min='0'
            step='0.01'
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none'
          />
        </div>

        {/* Expiration Date */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Expires After</label>
          <select
            value={filters.vpn_expire_date}
            onChange={e => updateFilters({ vpn_expire_date: e.target.value })}
            className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none'
          >
            <option value=''>Any Time</option>
            <option value='1_month'>1 Month+</option>
            <option value='3_months'>3 Months+</option>
            <option value='6_months'>6 Months+</option>
            <option value='1_year'>1 Year+</option>
            <option value='2_years'>2 Years+</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.values(filters).some(value => value !== '' && value !== null) && (
        <div className='mt-4 pt-4 border-t border-gray-700'>
          <div className='flex flex-wrap gap-2'>
            {Object.entries(filters)
              .filter(([_, value]) => value !== '' && value !== null)
              .map(([key, value]) => (
                <div
                  key={key}
                  className='flex items-center space-x-2 px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-lg text-green-300 text-sm'
                >
                  <span>
                    {key === 'vpn_service' && 'Service: '}
                    {key === 'vpn_renewable' && 'Renewable: '}
                    {key === 'min_price' && 'Min: $'}
                    {key === 'max_price' && 'Max: $'}
                    {key === 'vpn_expire_date' && 'Expires: '}
                    {value === '1' && key === 'vpn_renewable'
                      ? 'Yes'
                      : value === '0' && key === 'vpn_renewable'
                        ? 'No'
                        : value}
                  </span>
                  <button
                    onClick={() => updateFilters({ [key]: '' })}
                    className='text-green-300 hover:text-white transition-colors'
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VPNFilters
