const RobloxAccountCard = ({ account }) => {
  // Indonesian currency formatting
  const formatPrice = usdPrice => {
    const price = parseFloat(usdPrice || 0)
    const idrPrice = Math.max(1000, Math.round(price * 15500))

    return {
      idr: new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(idrPrice),
      usd: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price)
    }
  }

  const getRobloxIcon = () => {
    // Steam-like Roblox icon
    return (
      <svg viewBox='0 0 24 24' className='w-6 h-6 text-red-400' fill='currentColor'>
        <path d='M12 2L2 2v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V2h-8zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z' />
      </svg>
    )
  }

  const handleCardClick = () => {
    console.log('� Roblox Card clicked (view details):', account)
  }

  // Handle seller object properly
  const getSeller = () => {
    if (account.seller && typeof account.seller === 'object') {
      return account.seller.username || account.seller.display_name || 'Unknown Seller'
    }
    if (account.vendor && typeof account.vendor === 'object') {
      return account.vendor.username || account.vendor.display_name || 'Unknown Seller'
    }
    return account.seller || account.vendor || 'Unknown'
  }

  const price = account.price || 0
  const formattedPrice = formatPrice(price)
  const title = account.title || 'Roblox Account'
  const seller = getSeller()
  const robux = account.robux || account.balance || 0

  return (
    <div
      className='account bg-gray-900 border border-gray-700 hover:border-red-500/50 rounded-xl overflow-hidden relative shadow-lg transition-all duration-300 hover:shadow-red-500/10 flex flex-col min-h-[380px] group cursor-pointer transform hover:scale-[1.02]'
      onClick={handleCardClick}
    >
      {/* Header - Steam-like design */}
      <div className='bg-gradient-to-r from-gray-800 to-red-900/20 px-4 py-3 border-b border-gray-700'>
        <div className='flex justify-between items-start'>
          <div className='flex items-center space-x-2'>
            <div className='w-2 h-2 bg-red-400 rounded-full animate-pulse'></div>
            {getRobloxIcon()}
            <span className='text-red-400 font-semibold text-sm tracking-wide'>ROBLOX</span>
          </div>
          <div className='text-xs text-gray-400'>#{account.item_id || 'N/A'}</div>
        </div>
      </div>

      {/* Content Area */}
      <div className='flex-1 p-4 flex flex-col justify-between'>
        {/* Title */}
        <div className='mb-3'>
          <h3 className='text-white font-medium text-base leading-tight mb-1 group-hover:text-red-300 transition-colors'>
            {title}
          </h3>

          {/* Account Info */}
          <div className='flex flex-wrap gap-2 mt-2'>
            {robux > 0 && (
              <span className='inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-800/30 text-green-400 border border-green-800/50'>
                💰 {robux.toLocaleString()} R$
              </span>
            )}
            {account.premium && (
              <span className='inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-800/30 text-yellow-400 border border-yellow-800/50'>
                ⭐ Premium
              </span>
            )}
            {account.has_pets && (
              <span className='inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-800/30 text-purple-400 border border-purple-800/50'>
                🐾 Pets
              </span>
            )}
            {account.has_limiteds && (
              <span className='inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-800/30 text-orange-400 border border-orange-800/50'>
                💎 Limiteds
              </span>
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className='space-y-2 text-sm text-gray-400 mb-4'>
          {account.email_type && (
            <div className='flex justify-between'>
              <span>Email:</span>
              <span className='text-gray-300'>{account.email_type}</span>
            </div>
          )}
          {account.creation_date && (
            <div className='flex justify-between'>
              <span>Created:</span>
              <span className='text-gray-300'>{account.creation_date}</span>
            </div>
          )}
          <div className='flex justify-between'>
            <span>Seller:</span>
            <span className='text-gray-300'>{seller}</span>
          </div>
        </div>

        {/* Price */}
        <div className='mt-auto'>
          <div className='bg-gray-800/50 rounded-lg p-3 border border-gray-700'>
            <div className='text-red-400 text-lg font-bold'>{formattedPrice.idr}</div>
            <div className='text-gray-400 text-xs'>≈ {formattedPrice.usd}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='px-4 py-3 bg-gray-800/30 border-t border-gray-700'>
        <div className='flex justify-between items-center text-xs text-gray-400'>
          <span>
            {account.warranty && '🛡️ Warranty'}
            {account.updated_at && `Updated ${new Date(account.updated_at).toLocaleDateString()}`}
          </span>
          <div className='text-red-400 font-medium'>View Details</div>
        </div>
      </div>
    </div>
  )
}

export default RobloxAccountCard
