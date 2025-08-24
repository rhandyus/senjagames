import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { convertToIDR, formatCurrency, formatUSD } from '../utils/currency'

const MiHoyoAccountCard = ({ account }) => {
  // Get formatted price in IDR from the price field
  const priceUSD = account.price || 0

  const priceIDR = convertToIDR(priceUSD)
  const formattedPrice = formatCurrency(priceIDR)

  // Get warranty info
  const getWarrantyInfo = () => {
    if (account.extended_guarantee) {
      // Map guarantee types to descriptions
      const guaranteeMap = {
        0: '24 hours Warranty',
        1: '3 days Warranty',
        2: '7 days Warranty',
        3: '14 days Warranty',
        4: '30 days Warranty'
      }
      return guaranteeMap[account.extended_guarantee] || '24 hours Warranty'
    }
    return '24 hours Warranty'
  }

  // Get warning color class based on last seen
  const getLastSeenWarning = () => {
    const lastActivity = account.mihoyo_last_activity
    if (!lastActivity) return 'warn-red'

    const lastSeen = new Date(lastActivity * 1000)
    const now = new Date()
    const daysDiff = (now - lastSeen) / (1000 * 60 * 60 * 24)

    if (daysDiff > 365) return 'warn-green' // More than a year - safe
    if (daysDiff > 30) return 'warn-yellow' // More than a month - medium risk
    return 'warn-red' // Recent activity - high risk
  }

  // Format date
  const formatDate = timestamp => {
    if (!timestamp) return 'Unknown'

    const dateObj = new Date(timestamp * 1000)

    // Validate the date
    if (isNaN(dateObj.getTime()) || dateObj.getTime() === 0) return 'Unknown'

    // Format the date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format relative time for "Last seen"
  const formatRelativeTime = timestamp => {
    if (!timestamp) return 'Activity data unavailable'

    const dateObj = new Date(timestamp * 1000)
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

  // Get game info based on what data is available
  const getGameInfo = () => {
    const games = []

    // Genshin Impact
    if (account.mihoyo_genshin_level > 0) {
      games.push({
        name: 'Genshin Impact',
        level: account.mihoyo_genshin_level,
        characters: account.mihoyo_genshin_character_count,
        legendary: account.mihoyo_genshin_legendary_characters_count,
        currency: account.mihoyo_genshin_currency,
        achievements: account.mihoyo_genshin_achievement_count,
        activityDays: account.mihoyo_genshin_activity_days,
        abyss: account.mihoyo_genshin_abyss_process,
        icon: 'game-icons:wind-slap'
      })
    }

    // Honkai Star Rail
    if (account.mihoyo_honkai_level > 0) {
      games.push({
        name: 'Honkai Star Rail',
        level: account.mihoyo_honkai_level,
        characters: account.mihoyo_honkai_character_count,
        legendary: account.mihoyo_honkai_legendary_characters_count,
        currency: account.mihoyo_honkai_currency || 0,
        achievements: account.mihoyo_honkai_achievement_count,
        activityDays: account.mihoyo_honkai_activity_days,
        abyss: account.mihoyo_honkai_abyss_process,
        icon: 'game-icons:railgun'
      })
    }

    // Zenless Zone Zero
    if (account.mihoyo_zenless_level > 0) {
      games.push({
        name: 'Zenless Zone Zero',
        level: account.mihoyo_zenless_level,
        characters: account.mihoyo_zenless_character_count || 0,
        legendary: account.mihoyo_zenless_legendary_characters_count || 0,
        currency: account.mihoyo_zenless_currency || 0,
        icon: 'game-icons:electric'
      })
    }

    return games
  }

  const gameInfo = getGameInfo()
  const mainGame = gameInfo[0] // Display the first game as main

  return (
    <Link
      to={`/acc/?id=${account.item_id}`}
      state={{ account: account }}
      target='_blank'
      className='account bg-gray-900 border border-gray-700 hover:border-purple-500 transition-all duration-300 rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl flex flex-col min-h-[400px]'
    >
      {/* Header with Price */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-700'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-yellow-400 rounded-full'></div>
          <span className='text-sm text-gray-300 font-medium'>MiHoYo Account</span>
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
            {account.mihoyo_email && (
              <div className='flex items-center space-x-1 bg-green-900 bg-opacity-50 px-2 py-1 rounded-lg border border-green-700'>
                <Icon icon='mdi:email-check' className='text-green-400 text-sm' />
                <span className='text-green-400 text-xs font-medium'>Mail Access</span>
              </div>
            )}

            {/* Warranty */}
            <div className='flex items-center space-x-1 bg-yellow-900 bg-opacity-50 px-2 py-1 rounded-lg border border-yellow-700'>
              <Icon icon='mdi:shield-check' className='text-yellow-400 text-sm' />
              <span className='text-yellow-400 text-xs font-medium'>{getWarrantyInfo()}</span>
            </div>
          </div>

          {/* Region */}
          {account.mihoyo_region && (
            <div className='flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-lg border border-gray-600'>
              <Icon icon='mdi:earth' className='text-gray-400 text-sm' />
              <span className='text-gray-400 text-xs uppercase'>{account.mihoyo_region}</span>
            </div>
          )}
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
            {formatRelativeTime(account.mihoyo_last_activity)}
          </span>
        </div>

        {/* Game Stats - Show main game stats */}
        {mainGame && (
          <div className='bg-gray-800 p-3 rounded-lg border border-gray-600'>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center space-x-2'>
                <Icon icon={mainGame.icon} className='text-purple-400 text-lg' />
                <span className='text-gray-300 text-sm font-medium'>{mainGame.name}</span>
              </div>
              <div className='text-right'>
                <div className='text-purple-400 font-bold text-sm'>AR {mainGame.level}</div>
                <div className='text-gray-400 text-xs'>Adventure Rank</div>
              </div>
            </div>

            <div className='grid grid-cols-3 gap-2'>
              <div className='bg-gray-700 p-2 rounded text-center'>
                <div className='text-blue-400 font-bold text-sm'>{mainGame.characters || 0}</div>
                <div className='text-gray-400 text-xs'>Characters</div>
              </div>
              <div className='bg-gray-700 p-2 rounded text-center'>
                <div className='text-yellow-400 font-bold text-sm'>{mainGame.legendary || 0}</div>
                <div className='text-gray-400 text-xs'>5-Star</div>
              </div>
              <div className='bg-gray-700 p-2 rounded text-center'>
                <div className='text-green-400 font-bold text-sm'>{mainGame.currency || 0}</div>
                <div className='text-gray-400 text-xs'>Currency</div>
              </div>
            </div>

            {/* Additional stats */}
            {(mainGame.achievements > 0 || mainGame.activityDays > 0) && (
              <div className='grid grid-cols-2 gap-2 mt-2'>
                {mainGame.achievements > 0 && (
                  <div className='bg-gray-700 p-2 rounded text-center'>
                    <div className='text-purple-400 font-bold text-sm'>{mainGame.achievements}</div>
                    <div className='text-gray-400 text-xs'>Achievements</div>
                  </div>
                )}
                {mainGame.activityDays > 0 && (
                  <div className='bg-gray-700 p-2 rounded text-center'>
                    <div className='text-orange-400 font-bold text-sm'>{mainGame.activityDays}</div>
                    <div className='text-gray-400 text-xs'>Active Days</div>
                  </div>
                )}
              </div>
            )}

            {/* Abyss Progress */}
            {mainGame.abyss && mainGame.abyss !== '-' && mainGame.abyss !== '' && (
              <div className='mt-2 p-2 bg-gray-700 rounded text-center'>
                <div className='text-red-400 font-bold text-sm'>{mainGame.abyss}</div>
                <div className='text-gray-400 text-xs'>Abyss Progress</div>
              </div>
            )}
          </div>
        )}

        {/* Multiple Games Indicator */}
        {gameInfo.length > 1 && (
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600'>
            <div className='flex items-center justify-center space-x-2'>
              <Icon icon='mdi:gamepad-variant' className='text-purple-400' />
              <span className='text-gray-300 text-sm font-medium'>
                +{gameInfo.length - 1} more game{gameInfo.length > 2 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* No Games Available */}
        {gameInfo.length === 0 && (
          <div className='text-center text-gray-500 text-sm py-4 bg-gray-800 rounded-lg border border-gray-600'>
            <Icon icon='mdi:gamepad-off' className='text-2xl mb-1' />
            <div>No game data available</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center justify-between text-xs mt-auto'>
        <div className='flex items-center space-x-2'>
          <Icon icon='simple-icons:mihoyo' className='text-yellow-400' />
          <span className='text-gray-400'>MiHoYo</span>
        </div>
        <div className='flex items-center space-x-2 text-gray-400'>
          <time className='hover:text-gray-300'>{formatRelativeTime(account.published_date)}</time>
        </div>
      </div>

      {/* Hover Effect */}
      <div className='absolute inset-0 bg-gradient-to-r from-transparent to-purple-900 opacity-0 hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-xl'></div>
    </Link>
  )
}

export default MiHoyoAccountCard
