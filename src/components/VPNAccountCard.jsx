const VPNAccountCard = ({ account }) => {
  console.log('🌐 VPN Account Card rendering:', account?.item_id)

  if (!account) {
    console.warn('🌐 VPN Account Card: No account data provided')
    return null
  }

  // Helper functions for currency - Indonesian support
  const formatPrice = price => {
    const priceIDR = Math.round((price || 0) * 15500) // Convert USD to IDR
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.max(priceIDR, 1000)) // Minimum 1000 IDR
  }

  const formatUSDPrice = price => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price || 0)
  }

  const formatDate = timestamp => {
    if (!timestamp) return 'Unknown'
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getVPNServiceName = service => {
    const serviceNames = {
      AdguardVPN: 'AdGuard VPN',
      PIAVPN: 'Private Internet Access',
      cyberghostVPN: 'CyberGhost VPN',
      hotspotShieldVPN: 'Hotspot Shield VPN',
      mullvadVPN: 'Mullvad VPN',
      planetVPN: 'Planet VPN',
      pureVPN: 'PureVPN',
      tunnelbearVPN: 'TunnelBear VPN',
      ultraVPN: 'Ultra VPN',
      vanishVPN: 'Vanish VPN',
      vyprVPN: 'VyprVPN',
      windscribeVPN: 'Windscribe VPN'
    }
    return serviceNames[service] || service || 'Unknown VPN'
  }

  // Get warranty info like Steam cards
  const getWarrantyInfo = () => {
    if (account.hasWarranty) return `${account.warranty} Warranty`
    if (account.guarantee?.durationPhrase) return `${account.guarantee.durationPhrase} Warranty`
    if (account.eg !== undefined) {
      const guaranteeMap = {
        '-1': '12 hours Warranty',
        0: '24 hours Warranty',
        1: '3 days Warranty'
      }
      return guaranteeMap[account.eg] || '24 hours Warranty'
    }
    return '24 hours Warranty'
  }

  const getVPNIcon = service => {
    // Steam-like VPN shield icon
    return (
      <svg viewBox='0 0 24 24' className='w-6 h-6 text-blue-400' fill='currentColor'>
        <path d='M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,11V14H16V22H8V14H9.2V11C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,11V14H13.6V11C13.6,8.7 12.8,8.2 12,8.2Z' />
      </svg>
    )
  }

  const handleCardClick = () => {
    console.log('🌐 VPN Card clicked (view details):', account)
    // Steam-like behavior - could show details modal or navigate to details page
  }

  const price = account.price || 0
  const formattedPrice = formatPrice(price)
  const title = account.title || `${getVPNServiceName(account.vpn_service)} Account`
  const expirationDate = formatDate(account.vpn_expire_date)
  const isRenewable = account.vpn_renewable === 1

  return (
    <div
      className='account bg-gray-900 border border-gray-700 hover:border-blue-500/50 rounded-xl overflow-hidden relative shadow-lg transition-all duration-300 hover:shadow-blue-500/10 flex flex-col min-h-[380px] group cursor-pointer transform hover:scale-[1.02]'
      onClick={handleCardClick}
    >
      {/* Header - Steam-like design */}
      <div className='bg-gradient-to-r from-gray-800 to-blue-900/20 px-4 py-3 border-b border-gray-700'>
        <div className='flex justify-between items-start'>
          <div className='flex items-center space-x-2'>
            <div className='w-2 h-2 bg-blue-400 rounded-full animate-pulse'></div>
            <span className='text-xs text-blue-400 font-medium'>VPN SERVICE</span>
          </div>
          <div className='text-right'>
            <div className='text-lg font-bold text-white'>{formattedPrice}</div>
            <div className='text-xs text-gray-400'>{formatUSDPrice(price)}</div>
          </div>
        </div>
        <div className='mt-2'>
          <h3 className='text-white font-semibold text-sm leading-tight'>{title}</h3>
        </div>
      </div>

      {/* Content - Steam-like design */}
      <div className='p-4 space-y-3 flex-1'>
        {/* Status Badges - Steam-like */}
        <div className='flex items-center space-x-2 mb-3 flex-wrap'>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              account.item_state === 'active'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {account.item_state === 'active' ? '✓ Active' : '✗ Inactive'}
          </span>

          {isRenewable && (
            <span className='px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-medium'>
              🔄 Auto-Renewable
            </span>
          )}

          {/* Warranty like Steam */}
          <span className='px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-xs font-medium'>
            🛡️ {getWarrantyInfo()}
          </span>
        </div>

        {/* VPN Service - Featured like Steam game */}
        <div className='space-y-2'>
          <div className='flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-900/30 to-gray-800/50 rounded-lg border border-blue-500/30'>
            {getVPNIcon(account.vpn_service)}
            <div className='flex-1'>
              <div className='text-white font-semibold'>
                {getVPNServiceName(account.vpn_service)}
              </div>
              <div className='text-xs text-blue-300'>Premium VPN Service</div>
            </div>
            <div className='text-blue-400'>
              <svg viewBox='0 0 24 24' className='w-5 h-5' fill='currentColor'>
                <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
              </svg>
            </div>
          </div>
        </div>

        {/* Account Details - Steam-like info panels */}
        <div className='space-y-2'>
          <div className='text-sm font-medium text-gray-300'>Account Information</div>
          <div className='space-y-2'>
            {/* Expiration Date */}
            <div className='flex items-center justify-between bg-gray-800/40 p-2 rounded-lg border border-gray-600'>
              <div className='flex items-center space-x-2'>
                <svg viewBox='0 0 24 24' className='w-4 h-4 text-blue-400' fill='currentColor'>
                  <path d='M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z' />
                </svg>
                <span className='text-xs text-gray-400'>Expires</span>
              </div>
              <span className='text-sm text-white font-medium'>{expirationDate}</span>
            </div>

            {/* Item ID */}
            <div className='flex items-center justify-between bg-gray-800/40 p-2 rounded-lg border border-gray-600'>
              <div className='flex items-center space-x-2'>
                <svg viewBox='0 0 24 24' className='w-4 h-4 text-gray-400' fill='currentColor'>
                  <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
                </svg>
                <span className='text-xs text-gray-400'>ID</span>
              </div>
              <span className='text-sm text-white font-mono'>#{account.item_id}</span>
            </div>

            {account.view_count !== undefined && (
              <div className='flex items-center justify-between bg-gray-800/40 p-2 rounded-lg border border-gray-600'>
                <div className='flex items-center space-x-2'>
                  <svg viewBox='0 0 24 24' className='w-4 h-4 text-gray-400' fill='currentColor'>
                    <path d='M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z' />
                  </svg>
                  <span className='text-xs text-gray-400'>Views</span>
                </div>
                <span className='text-sm text-white'>{account.view_count}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Steam-like info only (no buttons) */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 border-t border-gray-700'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <svg viewBox='0 0 24 24' className='w-4 h-4 text-blue-400' fill='currentColor'>
              <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <span className='text-xs text-gray-300'>
              {account.item_origin || 'Verified Seller'}
            </span>
          </div>
          <div className='text-xs text-gray-400'>
            Updated {formatDate(account.refreshed_date || account.update_stat_date)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VPNAccountCard
