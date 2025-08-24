import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { convertToIDR, formatCurrency, formatUSD, getPriceValue } from '../utils/currency'

const EpicAccountCard = ({ account }) => {
  // Get formatted price in IDR
  const priceUSD = getPriceValue(account)
  const priceIDR = convertToIDR(priceUSD)
  const formattedPrice = formatCurrency(priceIDR)

  // Add a click handler to log what's being passed to detail page
  const handleClick = () => {}

  // Get warranty info
  const getWarrantyInfo = () => {
    if (account.hasWarranty) return `${account.warranty} Warranty`
    if (account.guarantee?.durationPhrase) return `${account.guarantee.durationPhrase} Warranty`
    if (account.eg !== undefined) {
      // Map guarantee types to descriptions
      const guaranteeMap = {
        '-1': '12 hours Warranty',
        0: '24 hours Warranty',
        1: '3 days Warranty'
      }
      return guaranteeMap[account.eg] || '24 hours Warranty'
    }
    return '24 hours Warranty'
  }

  // Get warning color class based on last seen
  const getLastSeenWarning = () => {
    const lastActivity = account.eg_last_seen || account.lastSeen
    if (!lastActivity || lastActivity === 'Unknown') return 'warn-red'

    // Handle different date formats
    let lastSeen
    if (typeof lastActivity === 'number') {
      lastSeen = new Date(lastActivity * 1000)
    } else if (typeof lastActivity === 'string') {
      lastSeen = new Date(lastActivity)
    } else {
      return 'warn-red'
    }

    const now = new Date()
    const daysDiff = (now - lastSeen) / (1000 * 60 * 60 * 24)

    if (daysDiff > 365) return 'warn-green' // More than a year - safe
    if (daysDiff > 30) return 'warn-yellow' // More than a month - medium risk
    return 'warn-red' // Recent activity - high risk
  }

  // Format date like in the original
  const formatDate = timestamp => {
    if (!timestamp || timestamp === 'Unknown') return 'N/A'

    let dateObj
    if (typeof timestamp === 'number') {
      // Handle Unix timestamp (seconds) - convert to milliseconds
      dateObj = new Date(timestamp * 1000)
    } else if (typeof timestamp === 'string') {
      // Handle string dates
      const parsed = parseInt(timestamp)
      if (!isNaN(parsed) && parsed > 0) {
        // If it's a valid number string, treat as Unix timestamp
        dateObj = new Date(parsed * 1000)
      } else {
        // Otherwise try to parse as date string
        dateObj = new Date(timestamp)
      }
    } else {
      return 'N/A'
    }

    // Validate the date
    if (isNaN(dateObj.getTime()) || dateObj.getTime() === 0) return 'N/A'

    // Format the date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format relative time for "Last seen"
  const formatRelativeTime = timestamp => {
    if (!timestamp || timestamp === 'Unknown') return 'Activity data unavailable'

    let dateObj
    if (typeof timestamp === 'number') {
      dateObj = new Date(timestamp * 1000)
    } else if (typeof timestamp === 'string') {
      const parsed = parseInt(timestamp)
      if (!isNaN(parsed) && parsed > 0) {
        dateObj = new Date(parsed * 1000)
      } else {
        dateObj = new Date(timestamp)
      }
    } else {
      return 'Activity data unavailable'
    }

    if (isNaN(dateObj.getTime()) || dateObj.getTime() === 0) return 'Activity data unavailable'

    const now = new Date()
    const diffMs = now - dateObj
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`
  }

  // Get main games from Epic data
  const getMainGames = () => {
    // Check Epic games data structure from LZT Market API
    // Handle case where eg_games might be an empty string, null, or empty object
    if (
      account.eg_games &&
      typeof account.eg_games === 'object' &&
      !Array.isArray(account.eg_games) &&
      Object.keys(account.eg_games).length > 0
    ) {
      const games = Object.values(account.eg_games)
      return games.slice(0, 4) // Show first 4 games
    }

    // Check if eg_games is empty, null, or a string
    if (
      !account.eg_games ||
      account.eg_games === '' ||
      account.eg_games === null ||
      (typeof account.eg_games === 'object' && Object.keys(account.eg_games).length === 0)
    ) {
      console.log('- eg_games is empty, null, or invalid format')
    }

    // Fallback to games array if eg_games doesn't exist
    if (account.games && Array.isArray(account.games)) {
      console.log('- Using fallback games array:', account.games.length)
      return account.games.slice(0, 4).map(game => ({
        title: game,
        app_id: Math.random().toString(), // Temporary ID for rendering
        hours_played: 0
      }))
    }

    console.log('- No games data found, returning empty array')
    return []
  }

  // Get additional games count
  const getAdditionalGamesCount = () => {
    // Handle case where eg_games might be an empty string, null, or empty object
    if (
      account.eg_games &&
      typeof account.eg_games === 'object' &&
      !Array.isArray(account.eg_games) &&
      Object.keys(account.eg_games).length > 0
    ) {
      const totalGames = Object.keys(account.eg_games).length
      return Math.max(0, totalGames - 4)
    }

    if (account.games && Array.isArray(account.games)) {
      return Math.max(0, account.games.length - 4)
    }

    return 0
  }

  // Format hours
  const formatHours = hours => {
    if (!hours) return '0.0 hrs.'
    return `${parseFloat(hours).toFixed(1)} hrs.`
  }

  // Get email change status
  const getEmailChangeStatus = () => {
    if (account.email_type === 'autoreg') {
      return 'Mail Access'
    }

    // Check if there's a change email date restriction
    if (account.eg_cant_change_email_until) {
      const restrictionDate = new Date(account.eg_cant_change_email_until * 1000)
      const now = new Date()

      if (restrictionDate > now) {
        return 'Limited Mail'
      }
    }

    return 'Mail Access'
  }

  return (
    <Link
      to={`/acc/?id=${account.item_id || account.id}`}
      state={{ account }}
      onClick={handleClick}
      className='account bg-gray-900 border border-gray-700 hover:border-purple-500 transition-all duration-300 rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl flex flex-col min-h-[400px]'
    >
      {/* Header with Price */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-700'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-green-400 rounded-full'></div>
          <span className='text-sm text-gray-300 font-medium'>Epic Games Account</span>
        </div>
        <div className='price-badge'>
          <div className='text-right'>
            <div className='text-xl font-bold text-purple-400'>{formattedPrice}</div>
            <div className='text-xs text-gray-400 mt-0.5'>${formatUSD(priceUSD)}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='p-4 space-y-3 flex-1'>
        {/* Status Row */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            {/* Mail Status */}
            <div className='flex items-center space-x-1 bg-green-900 bg-opacity-50 px-2 py-1 rounded-lg border border-green-700'>
              <Icon icon='mdi:email-check' className='text-green-400 text-sm' />
              <span className='text-green-400 text-xs font-medium'>{getEmailChangeStatus()}</span>
            </div>

            {/* Warranty */}
            <div className='flex items-center space-x-1 bg-yellow-900 bg-opacity-50 px-2 py-1 rounded-lg border border-yellow-700'>
              <Icon icon='mdi:shield-check' className='text-yellow-400 text-sm' />
              <span className='text-yellow-400 text-xs font-medium'>{getWarrantyInfo()}</span>
            </div>
          </div>

          {/* Country/Region Status */}
          <div className='flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-lg border border-gray-600'>
            <Icon icon='mdi:flag' className='text-gray-400 text-sm' />
            <span className='text-gray-400 text-xs'>{account.eg_country || 'Unknown'}</span>
          </div>
        </div>

        {/* Last Seen */}
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg border ${
            getLastSeenWarning() === 'warn-green'
              ? 'bg-green-900 bg-opacity-30 border-green-700'
              : getLastSeenWarning() === 'warn-yellow'
                ? 'bg-yellow-900 bg-opacity-30 border-yellow-700'
                : 'bg-red-900 bg-opacity-30 border-red-700'
          }`}
        >
          <Icon
            icon='mdi:clock-outline'
            className={`text-sm ${
              getLastSeenWarning() === 'warn-green'
                ? 'text-green-400'
                : getLastSeenWarning() === 'warn-yellow'
                  ? 'text-yellow-400'
                  : 'text-red-400'
            }`}
          />
          <span
            className={`text-xs font-medium ${
              getLastSeenWarning() === 'warn-green'
                ? 'text-green-400'
                : getLastSeenWarning() === 'warn-yellow'
                  ? 'text-yellow-400'
                  : 'text-red-400'
            }`}
          >
            {formatRelativeTime(account.eg_last_seen || account.lastSeen)}
          </span>
        </div>

        {/* Epic Stats */}
        {(account.eg_country || account.eg_rl_purchases) && (
          <div className='grid grid-cols-3 gap-2'>
            {account.eg_country && (
              <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
                <div className='text-purple-400 font-bold text-sm'>{account.eg_country}</div>
                <div className='text-gray-400 text-xs'>Region</div>
              </div>
            )}
            {account.eg_rl_purchases && (
              <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
                <div className='text-green-400 font-bold text-sm'>✓</div>
                <div className='text-gray-400 text-xs'>RL Purchases</div>
              </div>
            )}
          </div>
        )}

        {/* Games Section */}
        <div className='games-section'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-300 text-sm font-medium flex items-center space-x-1'>
              <Icon icon='mdi:gamepad-variant' className='text-purple-400' />
              <span>
                Games (
                {(() => {
                  if (
                    account.eg_games &&
                    typeof account.eg_games === 'object' &&
                    !Array.isArray(account.eg_games)
                  ) {
                    return Object.keys(account.eg_games).length
                  }
                  return getMainGames().length
                })()}
                )
              </span>
            </span>
          </div>

          <div className='space-y-2'>
            {getMainGames().length > 0 ? (
              getMainGames().map((game, index) => (
                <div
                  key={index}
                  className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors'
                >
                  <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center'>
                    {game.img ? (
                      <img
                        src={game.img}
                        alt={game.title}
                        className='w-6 h-6 rounded'
                        onError={e => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      className='w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-gray-400 text-sm font-bold'
                      style={{
                        display: game.img ? 'none' : 'flex'
                      }}
                    >
                      ?
                    </div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div
                      className='text-xs text-gray-300 hover:text-white cursor-help truncate font-medium'
                      title={
                        game.hours_played
                          ? `${game.title} - ${formatHours(game.hours_played)}`
                          : game.title
                      }
                    >
                      {game.title}
                    </div>
                    {game.hours_played > 0 && (
                      <div className='text-xs text-gray-500'>{formatHours(game.hours_played)}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center text-gray-500 text-sm py-4 bg-gray-800 rounded-lg border border-gray-600'>
                <Icon icon='mdi:gamepad-off' className='text-2xl mb-1' />
                <div>No games data available</div>
              </div>
            )}
          </div>

          {/* Additional Games */}
          {getAdditionalGamesCount() > 0 && (
            <div className='mt-2 text-center'>
              <span
                className='inline-flex items-center space-x-1 text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-lg border border-gray-600 cursor-help hover:border-gray-500 transition-colors'
                title='Click to view all games'
              >
                <Icon icon='mdi:plus' className='text-xs' />
                <span>{getAdditionalGamesCount()} more games</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className='bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center justify-between text-xs mt-auto'>
        <div className='flex items-center space-x-2'>
          <Icon icon='simple-icons:epicgames' className='text-blue-400' />
          <span className='text-gray-400'>Epic Games</span>
        </div>
        <div className='flex items-center space-x-2 text-gray-400'>
          <time className='hover:text-gray-300'>
            {formatRelativeTime(
              account.published_date ||
                account.created_at ||
                account.upload_date ||
                account.createdAt
            )}
          </time>
        </div>
      </div>

      {/* Hover Effect */}
      <div className='absolute inset-0 bg-gradient-to-r from-transparent to-purple-900 opacity-0 hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-xl'></div>
    </Link>
  )
}

export default EpicAccountCard
