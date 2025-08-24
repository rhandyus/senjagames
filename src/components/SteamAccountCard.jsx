import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { convertToIDR, formatCurrency, formatUSD, getPriceValue } from '../utils/currency'

const SteamAccountCard = ({ account }) => {
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
    const lastActivity =
      account.steam_last_activity || account.account_last_activity || account.lastSeen
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

  // Get main games from Steam data
  const getMainGames = () => {
    // Check multiple possible game data structures
    if (account.steam_full_games?.list) {
      const games = Object.values(account.steam_full_games.list)
      return games.sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0)).slice(0, 4)
    }

    // Fallback to games array if steam_full_games doesn't exist
    if (account.games && Array.isArray(account.games)) {
      return account.games.slice(0, 4).map(game => ({
        title: game,
        appid: Math.random().toString(), // Temporary ID for rendering
        playtime_forever: 0
      }))
    }

    return []
  }

  // Get additional games count
  const getAdditionalGamesCount = () => {
    if (account.steam_full_games?.list) {
      const totalGames = Object.keys(account.steam_full_games.list).length
      return Math.max(0, totalGames - 4)
    }

    if (account.games && Array.isArray(account.games)) {
      return Math.max(0, account.games.length - 4)
    }

    return 0
  }

  // Format hours
  const formatHours = minutes => {
    if (!minutes) return '0.0 hrs.'
    const hours = minutes / 60
    return `${hours.toFixed(1)} hrs.`
  }

  return (
    <Link
      to={`/acc/?id=${account.item_id || account.id}`}
      state={{ account: account }} // Pass account data via navigation state
      onClick={handleClick}
      className='account bg-gray-900 border border-gray-700 hover:border-purple-500 transition-all duration-300 rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl flex flex-col min-h-[400px]'
    >
      {/* Header with Price */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-700'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-green-400 rounded-full'></div>
          <span className='text-sm text-gray-300 font-medium'>Steam Account</span>
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
              <span className='text-green-400 text-xs font-medium'>Mail Access</span>
            </div>

            {/* Warranty */}
            <div className='flex items-center space-x-1 bg-yellow-900 bg-opacity-50 px-2 py-1 rounded-lg border border-yellow-700'>
              <Icon icon='mdi:shield-check' className='text-yellow-400 text-sm' />
              <span className='text-yellow-400 text-xs font-medium'>{getWarrantyInfo()}</span>
            </div>
          </div>

          {/* SDA Status */}
          <div className='flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-lg border border-gray-600'>
            <Icon icon='mdi:security' className='text-gray-400 text-sm' />
            <span className='text-gray-400 text-xs'>SDA</span>
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
            {formatRelativeTime(
              account.steam_last_activity || account.account_last_activity || account.lastSeen
            )}
          </span>
        </div>

        {/* Steam Stats */}
        {(account.steam_level || account.steam_friend_count || account.steam_balance) && (
          <div className='grid grid-cols-3 gap-2'>
            {account.steam_level !== undefined && account.steam_level > 0 && (
              <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
                <div className='text-purple-400 font-bold text-sm'>{account.steam_level}</div>
                <div className='text-gray-400 text-xs'>Level</div>
              </div>
            )}
            {account.steam_friend_count !== undefined && (
              <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
                <div className='text-blue-400 font-bold text-sm'>{account.steam_friend_count}</div>
                <div className='text-gray-400 text-xs'>Friends</div>
              </div>
            )}
            {account.steam_balance &&
              account.steam_balance !== '¥ 0.00' &&
              account.steam_balance !== '$0.00' && (
                <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
                  <div className='text-green-400 font-bold text-sm'>{account.steam_balance}</div>
                  <div className='text-gray-400 text-xs'>Balance</div>
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
                Games ({account.steam_game_count || account.gameCount || getMainGames().length || 0}
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
                    {game.appid && game.appid !== 'random' && !isNaN(Number(game.appid)) ? (
                      <img
                        src={`https://nztcdn.com/steam/icon/${game.appid}.webp`}
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
                        display:
                          game.appid && game.appid !== 'random' && !isNaN(Number(game.appid))
                            ? 'none'
                            : 'flex'
                      }}
                    >
                      ?
                    </div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div
                      className='text-xs text-gray-300 hover:text-white cursor-help truncate font-medium'
                      title={
                        game.playtime_forever
                          ? `${game.title} - ${formatHours(game.playtime_forever)}`
                          : game.title
                      }
                    >
                      {game.title}
                    </div>
                    {game.playtime_forever > 0 && (
                      <div className='text-xs text-gray-500'>
                        {formatHours(game.playtime_forever)}
                      </div>
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
          <Icon icon='mdi:steam' className='text-blue-400' />
          <span className='text-gray-400'>Steam</span>
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

export default SteamAccountCard
