import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { convertToIDR, formatCurrency, formatUSD, getPriceValue } from '../utils/currency'

const RiotAccountCard = ({ account }) => {
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
    if (account.extended_guarantee !== undefined) {
      // Map guarantee types to descriptions
      const guaranteeMap = {
        '-1': '12 hours Warranty',
        0: '24 hours Warranty',
        1: '3 days Warranty'
      }
      return guaranteeMap[account.extended_guarantee] || '24 hours Warranty'
    }
    return '24 hours Warranty'
  }

  // Get warning color class based on last seen
  const getLastSeenWarning = () => {
    const lastActivity =
      account.riot_last_activity || account.account_last_activity || account.lastSeen
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
    if (!timestamp || timestamp === 'Unknown') return 'Unknown'

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
      return 'Unknown'
    }

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

  // Get main Riot games info
  const getRiotGames = () => {
    const games = []

    // Add Valorant if data exists
    if (
      account.riot_valorant_level ||
      account.riot_valorant_skin_count ||
      account.riot_valorant_agent_count
    ) {
      games.push({
        name: 'Valorant',
        icon: 'simple-icons:valorant',
        level: account.riot_valorant_level,
        rank: account.riot_valorant_rank || account.valorantRankTitle || 'Unrated',
        region: account.riot_valorant_region || account.valorantRegionPhrase,
        skinCount: account.riot_valorant_skin_count,
        agentCount: account.riot_valorant_agent_count,
        inventoryValue: account.riot_valorant_inventory_value,
        hasKnife: account.riot_valorant_knife === 1,
        walletVP: account.riot_valorant_wallet_vp,
        walletRP: account.riot_valorant_wallet_rp
      })
    }

    // Add League of Legends if data exists
    if (account.riot_lol_level || account.riot_lol_skin_count || account.riot_lol_champion_count) {
      games.push({
        name: 'League of Legends',
        icon: 'simple-icons:leagueoflegends',
        level: account.riot_lol_level,
        rank: account.riot_lol_rank || 'Unranked',
        region: account.riot_lol_region,
        skinCount: account.riot_lol_skin_count,
        championCount: account.riot_lol_champion_count,
        winRate: account.riot_lol_rank_win_rate,
        walletBlue: account.riot_lol_wallet_blue,
        walletOrange: account.riot_lol_wallet_orange,
        walletMythic: account.riot_lol_wallet_mythic,
        walletRiot: account.riot_lol_wallet_riot
      })
    }

    return games
  }

  // Get email verification status
  const getEmailStatus = () => {
    if (account.riot_email_verified === 1) return { verified: true, text: 'Email Verified' }
    if (account.email_type === 'autoreg') return { verified: false, text: 'Auto-reg Email' }
    return { verified: false, text: 'Email Access' }
  }

  // Get phone verification status
  const getPhoneStatus = () => {
    return account.riot_phone_verified === 1
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
          <div className='w-2 h-2 bg-red-400 rounded-full'></div>
          <span className='text-sm text-gray-300 font-medium'>Riot Account</span>
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
            {/* Email Status */}
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg border ${
                getEmailStatus().verified
                  ? 'bg-green-900 bg-opacity-50 border-green-700'
                  : 'bg-yellow-900 bg-opacity-50 border-yellow-700'
              }`}
            >
              <Icon
                icon={getEmailStatus().verified ? 'mdi:email-check' : 'mdi:email'}
                className={`text-sm ${getEmailStatus().verified ? 'text-green-400' : 'text-yellow-400'}`}
              />
              <span
                className={`text-xs font-medium ${getEmailStatus().verified ? 'text-green-400' : 'text-yellow-400'}`}
              >
                {getEmailStatus().text}
              </span>
            </div>

            {/* Phone Status */}
            {getPhoneStatus() && (
              <div className='flex items-center space-x-1 bg-green-900 bg-opacity-50 px-2 py-1 rounded-lg border border-green-700'>
                <Icon icon='mdi:phone-check' className='text-green-400 text-sm' />
                <span className='text-green-400 text-xs font-medium'>Phone Verified</span>
              </div>
            )}

            {/* Warranty */}
            <div className='flex items-center space-x-1 bg-yellow-900 bg-opacity-50 px-2 py-1 rounded-lg border border-yellow-700'>
              <Icon icon='mdi:shield-check' className='text-yellow-400 text-sm' />
              <span className='text-yellow-400 text-xs font-medium'>{getWarrantyInfo()}</span>
            </div>
          </div>

          {/* Country */}
          {account.riot_country && (
            <div className='flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-lg border border-gray-600'>
              <Icon icon='mdi:flag' className='text-gray-400 text-sm' />
              <span className='text-gray-400 text-xs'>{account.riot_country}</span>
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
            {formatRelativeTime(
              account.riot_last_activity || account.account_last_activity || account.lastSeen
            )}
          </span>
        </div>

        {/* Riot Username */}
        {account.riot_username && (
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-purple-400 font-bold text-sm'>{account.riot_username}</div>
            <div className='text-gray-400 text-xs'>Riot ID</div>
          </div>
        )}

        {/* Games Section */}
        <div className='games-section'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-300 text-sm font-medium flex items-center space-x-1'>
              <Icon icon='mdi:gamepad-variant' className='text-purple-400' />
              <span>Games ({getRiotGames().length})</span>
            </span>
          </div>

          <div className='space-y-2'>
            {getRiotGames().length > 0 ? (
              getRiotGames().map((game, index) => (
                <div
                  key={index}
                  className='flex items-center bg-gray-800 p-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors'
                >
                  <div className='w-8 h-8 rounded mr-3 flex-shrink-0 flex items-center justify-center bg-gray-700'>
                    <Icon icon={game.icon} className='text-purple-400 text-lg' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between mb-1'>
                      <div className='text-xs text-gray-300 font-medium'>{game.name}</div>
                      <div className='text-xs text-gray-400'>Level {game.level || 'N/A'}</div>
                    </div>
                    <div className='flex items-center space-x-2 text-xs text-gray-500'>
                      <span>{game.rank}</span>
                      {game.region && (
                        <>
                          <span>•</span>
                          <span>{game.region}</span>
                        </>
                      )}
                      {game.skinCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{game.skinCount} skins</span>
                        </>
                      )}
                    </div>
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
        </div>
      </div>

      {/* Footer */}
      <div className='bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center justify-between text-xs mt-auto'>
        <div className='flex items-center space-x-2'>
          <Icon icon='simple-icons:riotgames' className='text-red-400' />
          <span className='text-gray-400'>Riot</span>
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

export default RiotAccountCard
