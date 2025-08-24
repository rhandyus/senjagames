import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { convertToIDR, formatCurrency, formatUSD, getPriceValue } from '../utils/currency'

const UplayAccountCard = ({ account }) => {
  // Get formatted price in IDR
  const priceUSD = getPriceValue(account)
  const priceIDR = convertToIDR(priceUSD)
  const formattedPrice = formatCurrency(priceIDR)

  // Get warranty info
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

  // Get warning color class based on last seen
  const getLastSeenWarning = () => {
    const lastActivity = account.uplay_last_activity || account.account_last_activity
    if (!lastActivity) return 'warn-red'

    const lastSeen = new Date(lastActivity * 1000)
    const now = new Date()
    const daysDiff = (now - lastSeen) / (1000 * 60 * 60 * 24)

    if (daysDiff > 365) return 'warn-green' // More than a year - safe
    if (daysDiff > 30) return 'warn-yellow' // More than a month - medium risk
    return 'warn-red' // Recent activity - high risk
  }

  // Format relative time for "Last seen"
  const formatRelativeTime = timestamp => {
    if (!timestamp) return 'Activity data unavailable'

    const dateObj = new Date(timestamp * 1000)
    if (isNaN(dateObj.getTime())) return 'Activity data unavailable'

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

  // Format hours from playtime
  const formatHours = minutes => {
    if (!minutes) return '0.0 hrs.'
    const hours = minutes / 60
    return `${hours.toFixed(1)} hrs.`
  }

  // Get main games from Uplay data
  const getMainGames = () => {
    if (!account.uplay_games || typeof account.uplay_games !== 'object') return []

    const games = Object.values(account.uplay_games)
    return games
      .sort(
        (a, b) =>
          (b.pvpTimePlayed || b.pveTimePlayed || 0) - (a.pvpTimePlayed || a.pveTimePlayed || 0)
      )
      .slice(0, 4)
  }

  // Get additional games count
  const getAdditionalGamesCount = () => {
    if (!account.uplay_games || typeof account.uplay_games !== 'object') return 0
    const totalGames = Object.keys(account.uplay_games).length
    return Math.max(0, totalGames - 4)
  }

  // Format account creation date
  const formatAccountAge = timestamp => {
    if (!timestamp) return 'Unknown'

    const createdDate = new Date(timestamp * 1000)
    const now = new Date()
    const diffYears = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24 * 365))

    if (diffYears >= 1) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} old`
    }

    const diffMonths = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24 * 30))
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} old`
  }

  const mainGames = getMainGames()
  const additionalGamesCount = getAdditionalGamesCount()

  return (
    <Link
      to={`/acc/?id=${account.item_id || account.id}`}
      state={{ account: account }}
      className='account bg-gray-900 border border-gray-700 hover:border-blue-500 transition-all duration-300 rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl flex flex-col min-h-[400px]'
    >
      {/* Header with Price */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-700'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-blue-400 rounded-full'></div>
          <span className='text-sm text-gray-300 font-medium'>Uplay Account</span>
        </div>
        <div className='price-badge'>
          <div className='text-right'>
            <div className='text-xl font-bold text-blue-400'>{formattedPrice}</div>
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

          {/* Country Status */}
          <div className='flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-lg border border-gray-600'>
            <Icon icon='mdi:earth' className='text-gray-400 text-sm' />
            <span className='text-gray-400 text-xs'>{account.uplay_country || 'Unknown'}</span>
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
            {formatRelativeTime(account.uplay_last_activity || account.account_last_activity)}
          </span>
        </div>

        {/* Uplay Stats - Grid Layout like Steam */}
        <div className='grid grid-cols-3 gap-2'>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-blue-400 font-bold text-sm'>
              {Object.keys(account.uplay_games || {}).length}
            </div>
            <div className='text-gray-400 text-xs'>Games</div>
          </div>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-orange-400 font-bold text-sm'>
              {account.uplay_country || 'Unknown'}
            </div>
            <div className='text-gray-400 text-xs'>Region</div>
          </div>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-green-400 font-bold text-sm'>
              {formatAccountAge(account.uplay_created_date)}
            </div>
            <div className='text-gray-400 text-xs'>Account Age</div>
          </div>
        </div>

        {/* Games Section - Like Steam */}
        <div className='games-section'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-300 text-sm font-medium flex items-center space-x-1'>
              <Icon icon='mdi:gamepad-variant' className='text-blue-400' />
              <span>Games ({Object.keys(account.uplay_games || {}).length})</span>
            </span>
          </div>

          <div className='space-y-2'>
            {mainGames.length > 0 ? (
              mainGames.map((game, index) => (
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
                      className='w-6 h-6 bg-blue-900 bg-opacity-50 rounded flex items-center justify-center text-blue-400 text-sm font-bold border border-blue-700'
                      style={{
                        display: game.img ? 'none' : 'flex'
                      }}
                    >
                      {game.title?.charAt(0) || '?'}
                    </div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div
                      className='text-xs text-gray-300 hover:text-white cursor-help truncate font-medium'
                      title={`${game.title} - ${formatHours((game.pvpTimePlayed || 0) + (game.pveTimePlayed || 0))}`}
                    >
                      {game.title}
                    </div>
                    {(game.pvpTimePlayed || 0) + (game.pveTimePlayed || 0) > 0 && (
                      <div className='text-xs text-gray-500'>
                        {formatHours((game.pvpTimePlayed || 0) + (game.pveTimePlayed || 0))}
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
          {additionalGamesCount > 0 && (
            <div className='mt-2 text-center'>
              <span className='inline-flex items-center space-x-1 text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-lg border border-gray-600 cursor-help hover:border-gray-500 transition-colors'>
                <Icon icon='mdi:plus' className='text-xs' />
                <span>{additionalGamesCount} more games</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className='bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center justify-between text-xs mt-auto'>
        <div className='flex items-center space-x-2'>
          <Icon icon='simple-icons:ubisoft' className='text-blue-400' />
          <span className='text-gray-400'>Uplay</span>
        </div>
        <div className='flex items-center space-x-2 text-gray-400'>
          <time className='hover:text-gray-300'>
            {formatRelativeTime(account.published_date || account.created_at)}
          </time>
        </div>
      </div>

      {/* Hover Effect */}
      <div className='absolute inset-0 bg-gradient-to-r from-transparent to-blue-900 opacity-0 hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-xl'></div>
    </Link>
  )
}

export default UplayAccountCard
