const SocialClubAccountCard = ({ account, onAddToCart, onViewDetails }) => {
  // Helper function to format price
  const formatPrice = (price, currency = 'usd') => {
    if (currency === 'rub') {
      return `₽${price}`
    }
    return `$${price.toFixed(2)}`
  }

  // Helper function to format cash amounts
  const formatCash = amount => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount}`
  }

  // Helper function to format dates
  const formatDate = timestamp => {
    if (!timestamp) return 'Unknown'
    try {
      const date = new Date(timestamp * 1000)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  // Helper function to get game display names
  const getGameNames = games => {
    if (!games || !Array.isArray(games)) return []

    const gameMap = {
      gta5: 'GTA V',
      gta_online: 'GTA Online',
      rdr2: 'Red Dead Redemption 2',
      rdr_online: 'Red Dead Online',
      la_noire: 'L.A. Noire',
      max_payne_3: 'Max Payne 3'
    }

    return games.map(game => gameMap[game] || game.toUpperCase())
  }

  const games = getGameNames(account.socialclub_games || [])
  const totalCash = (account.socialclub_cash || 0) + (account.socialclub_bank_cash || 0)

  return (
    <div className='bg-gray-900 border border-gray-700 hover:border-orange-500 transition-all duration-300 rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl flex flex-col min-h-[400px]'>
      {/* Header with Price */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-700'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-orange-400 rounded-full'></div>
          <span className='text-sm text-gray-300 font-medium'>Social Club Account</span>
        </div>
        <div className='text-right'>
          <div className='text-xl font-bold text-orange-400'>
            {formatPrice(account.price, account.currency)}
          </div>
          <div className='text-xs text-gray-400 mt-0.5'>
            {account.guarantee ? '🛡️ Guaranteed' : '⚡ No Warranty'}
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className='p-4 flex-1'>
        {/* Username and Level */}
        <div className='mb-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-300 text-sm'>Username:</span>
            <span className='text-white font-medium'>
              {account.socialclub_username || 'Unknown'}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-gray-300 text-sm'>Level:</span>
            <span className='text-orange-400 font-bold'>{account.socialclub_level || 1}</span>
          </div>
        </div>

        {/* Cash Information */}
        <div className='mb-4 space-y-2'>
          <div className='bg-gray-800 p-3 rounded-lg border border-gray-600'>
            <div className='flex items-center justify-between mb-1'>
              <span className='text-gray-300 text-sm'>Cash:</span>
              <span className='text-green-400 font-bold'>
                {formatCash(account.socialclub_cash || 0)}
              </span>
            </div>
            <div className='flex items-center justify-between mb-1'>
              <span className='text-gray-300 text-sm'>Bank Cash:</span>
              <span className='text-blue-400 font-bold'>
                {formatCash(account.socialclub_bank_cash || 0)}
              </span>
            </div>
            <div className='flex items-center justify-between border-t border-gray-600 pt-1'>
              <span className='text-gray-300 text-sm font-medium'>Total:</span>
              <span className='text-orange-400 font-bold'>{formatCash(totalCash)}</span>
            </div>
          </div>
        </div>

        {/* Games */}
        <div className='mb-4'>
          <div className='text-gray-300 text-sm mb-2'>Games:</div>
          {games.length > 0 ? (
            <div className='flex flex-wrap gap-1'>
              {games.slice(0, 3).map((game, index) => (
                <span
                  key={index}
                  className='inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-orange-900 bg-opacity-50 text-orange-300 border border-orange-700'
                >
                  {game}
                </span>
              ))}
              {games.length > 3 && (
                <span className='inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-800 text-gray-400 border border-gray-600'>
                  +{games.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <div className='text-center text-gray-500 text-sm py-2 bg-gray-800 rounded-lg border border-gray-600'>
              No games data
            </div>
          )}
        </div>

        {/* Account Details */}
        <div className='space-y-2 text-sm'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-400'>Region:</span>
            <span className='text-gray-200'>{account.socialclub_region || 'Unknown'}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-gray-400'>Platform:</span>
            <span className='text-gray-200'>{account.socialclub_platform || 'PC'}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-gray-400'>Characters:</span>
            <span className='text-gray-200'>{account.socialclub_characters || 1}</span>
          </div>
          {account.email_type && (
            <div className='flex items-center justify-between'>
              <span className='text-gray-400'>Email Type:</span>
              <span className='text-gray-200 capitalize'>{account.email_type}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className='bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center justify-between text-xs mt-auto'>
        <div className='flex items-center space-x-3'>
          <span className='text-gray-400'>👁️ {account.views || 0} views</span>
          <span className='text-gray-400'>📅 {formatDate(account.created_at)}</span>
        </div>
        <div className='flex items-center space-x-2'>
          {account.guarantee && (
            <span className='bg-green-900 bg-opacity-50 text-green-300 px-2 py-1 rounded-lg border border-green-700'>
              🛡️ Guaranteed
            </span>
          )}
          {account.allow_ask_discount && (
            <span className='bg-blue-900 bg-opacity-50 text-blue-300 px-2 py-1 rounded-lg border border-blue-700'>
              💰 Discount OK
            </span>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className='absolute inset-0 bg-gradient-to-r from-transparent to-orange-900 opacity-0 hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-xl'></div>
    </div>
  )
}

export default SocialClubAccountCard
