import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { convertToIDR, formatCurrency, formatUSD } from '../utils/currency'

const SupercellAccountCard = ({ account }) => {
  // Get formatted price in IDR (same as Steam)
  const priceUSD = account.price || 0
  const priceIDR = convertToIDR(priceUSD)
  const formattedPrice = formatCurrency(priceIDR)

  // Format date/time like Steam
  const formatRelativeTime = timestamp => {
    if (!timestamp) return 'Activity data unavailable'

    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diffMs = now - date
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffMinutes < 1) return '1 minute ago'
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`
  }

  // Get email status with color coding
  const getEmailStatus = () => {
    const emailType = account.email_type
    if (emailType === 'native') {
      return {
        text: 'Mail',
        colorClass: 'warn-green',
        bgClass: 'bg-green-900 bg-opacity-30 border-green-700',
        textClass: 'text-green-400',
        icon: 'mdi:email'
      }
    }
    return {
      text: 'No Mail',
      colorClass: 'warn-red',
      bgClass: 'bg-red-900 bg-opacity-30 border-red-700',
      textClass: 'text-red-400',
      icon: 'mdi:email-off'
    }
  }

  // Get phone status
  const getPhoneStatus = () => {
    const hasPhone = account.supercell_phone === 1
    if (hasPhone) {
      return {
        text: 'Phone',
        colorClass: 'warn-red',
        bgClass: 'bg-red-900 bg-opacity-30 border-red-700',
        textClass: 'text-red-400',
        icon: 'mdi:phone'
      }
    }
    return {
      text: 'No phone',
      colorClass: 'warn-green',
      bgClass: 'bg-green-900 bg-opacity-30 border-green-700',
      textClass: 'text-green-400',
      icon: 'mdi:phone-off'
    }
  }

  // Get last activity warning color
  const getLastActivityWarning = () => {
    if (!account.supercell_last_activity) return 'warn-red'

    const lastActivity = new Date(account.supercell_last_activity * 1000)
    const now = new Date()
    const daysDiff = (now - lastActivity) / (1000 * 60 * 60 * 24)

    if (daysDiff > 365) return 'warn-green' // More than a year - safe
    if (daysDiff > 30) return 'warn-yellow' // More than a month - medium risk
    return 'warn-red' // Recent activity - high risk
  }

  // Get origin display
  const getOriginDisplay = origin => {
    const originMap = {
      brute: 'Brute',
      phishing: 'Phishing',
      stealer: 'Stealer',
      personal: 'Personal',
      resale: 'Resale',
      autoreg: 'Autoreg',
      dummy: 'Dummy'
    }
    return originMap[origin] || origin || 'Unknown'
  }

  // Format upload date
  const formatDate = timestamp => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get warranty info
  const getWarrantyInfo = () => {
    if (account.extended_guarantee > 0) return 'Warranty'
    return '24 hours Warranty'
  }

  // Get primary game info
  const getPrimaryGameInfo = () => {
    // Check which Supercell game has the highest level/activity
    const games = []

    if (account.supercell_scroll_level > 0) {
      games.push({
        name: 'Clash Royale',
        icon: 'simple-icons:clashroyale',
        level: account.supercell_scroll_level,
        trophies: account.supercell_scroll_trophies,
        wins: account.supercell_scroll_victories,
        iconColor: 'text-blue-400'
      })
    }

    if (account.supercell_town_hall_level > 0) {
      games.push({
        name: 'Clash of Clans',
        icon: 'simple-icons:clashofclans',
        level: account.supercell_town_hall_level, // Using town hall as level
        trophies: account.supercell_cup_count,
        heroLevel: account.supercell_hero_level,
        iconColor: 'text-yellow-400'
      })
    }

    if (account.supercell_brawler_count > 0) {
      games.push({
        name: 'Brawl Stars',
        icon: 'simple-icons:brawlstars',
        level: account.supercell_laser_level,
        trophies: account.supercell_laser_trophies,
        brawlers: account.supercell_brawler_count,
        legendary: account.supercell_legendary_brawler_count,
        iconColor: 'text-yellow-400'
      })
    }

    return (
      games[0] || {
        name: 'Supercell Account',
        icon: 'simple-icons:supercell',
        level: 0,
        trophies: 0,
        iconColor: 'text-orange-400'
      }
    )
  }

  const emailStatus = getEmailStatus()
  const phoneStatus = getPhoneStatus()
  const lastActivityWarning = getLastActivityWarning()
  const primaryGame = getPrimaryGameInfo()

  return (
    <Link
      to={`/acc/?id=${account.item_id}`}
      state={{ account: account }}
      className='account bg-gray-900 border border-gray-700 hover:border-purple-500 transition-all duration-300 rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl flex flex-col min-h-[400px]'
    >
      {/* Header with Price (same as Steam) */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-700'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-orange-400 rounded-full'></div>
          <span className='text-sm text-gray-300 font-medium'>Supercell Account</span>
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
        {/* Status Row (like Steam) */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            {/* Email Status */}
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg border ${emailStatus.bgClass}`}
            >
              <Icon icon={emailStatus.icon} className={`${emailStatus.textClass} text-sm`} />
              <span className={`${emailStatus.textClass} text-xs font-medium`}>
                {emailStatus.text}
              </span>
            </div>

            {/* Phone Status */}
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg border ${phoneStatus.bgClass}`}
            >
              <Icon icon={phoneStatus.icon} className={`${phoneStatus.textClass} text-sm`} />
              <span className={`${phoneStatus.textClass} text-xs font-medium`}>
                {phoneStatus.text}
              </span>
            </div>

            {/* Warranty */}
            <div className='flex items-center space-x-1 bg-yellow-900 bg-opacity-50 px-2 py-1 rounded-lg border border-yellow-700'>
              <Icon icon='mdi:shield-check' className='text-yellow-400 text-sm' />
              <span className='text-yellow-400 text-xs font-medium'>{getWarrantyInfo()}</span>
            </div>
          </div>
        </div>

        {/* Last Activity (same style as Steam) */}
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg border ${
            lastActivityWarning === 'warn-green'
              ? 'bg-green-900 bg-opacity-30 border-green-700'
              : lastActivityWarning === 'warn-yellow'
                ? 'bg-yellow-900 bg-opacity-30 border-yellow-700'
                : 'bg-red-900 bg-opacity-30 border-red-700'
          }`}
        >
          <Icon
            icon='mdi:clock-outline'
            className={`text-sm ${
              lastActivityWarning === 'warn-green'
                ? 'text-green-400'
                : lastActivityWarning === 'warn-yellow'
                  ? 'text-yellow-400'
                  : 'text-red-400'
            }`}
          />
          <span
            className={`text-xs font-medium ${
              lastActivityWarning === 'warn-green'
                ? 'text-green-400'
                : lastActivityWarning === 'warn-yellow'
                  ? 'text-yellow-400'
                  : 'text-red-400'
            }`}
          >
            Last activity {formatRelativeTime(account.supercell_last_activity)}
          </span>
        </div>

        {/* Games Container (Primary Game in Steam-like format) */}
        <div className='games-section'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-300 text-sm font-medium flex items-center space-x-1'>
              <Icon icon={primaryGame.icon} className={primaryGame.iconColor} />
              <span>{primaryGame.name}</span>
            </span>
          </div>

          {/* Supercell Stats (like Steam stats) */}
          <div className='grid grid-cols-2 gap-2'>
            <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
              <div className='text-orange-400 font-bold text-sm'>{primaryGame.level || 0}</div>
              <div className='text-gray-400 text-xs'>Level</div>
            </div>
            <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
              <div className='text-purple-400 font-bold text-sm'>{primaryGame.trophies || 0}</div>
              <div className='text-gray-400 text-xs'>Trophies</div>
            </div>
          </div>

          {/* Games Container (Supercell games in Steam-like format) */}
          <div className='games-section'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-gray-300 text-sm font-medium flex items-center space-x-1'>
                <Icon icon='simple-icons:supercell' className='text-orange-400' />
                <span>Supercell Games</span>
              </span>
            </div>

            <div className='space-y-2'>
              {/* Primary Game */}
              <div className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600'>
                <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center bg-orange-600'>
                  <Icon icon={primaryGame.icon} className='text-white text-sm' />
                </div>
                <div className='flex-1'>
                  <div className='text-gray-200 text-sm font-medium'>{primaryGame.name}</div>
                  <div className='text-gray-400 text-xs'>
                    {primaryGame.name === 'Clash Royale' &&
                      account.supercell_arena &&
                      `Arena: ${account.supercell_arena}`}
                    {primaryGame.name === 'Clash of Clans' &&
                      account.supercell_town_hall_level &&
                      `Town Hall ${account.supercell_town_hall_level}`}
                    {primaryGame.name === 'Brawl Stars' &&
                      primaryGame.brawlers &&
                      `${primaryGame.brawlers} Brawlers`}
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-purple-400 text-xs'>
                    {primaryGame.name === 'Clash Royale' && `${primaryGame.wins || 0} Wins`}
                    {primaryGame.name === 'Clash of Clans' &&
                      `Hero Lv.${primaryGame.heroLevel || 0}`}
                    {primaryGame.name === 'Brawl Stars' &&
                      `${primaryGame.legendary || 0} Legendary`}
                  </div>
                </div>
              </div>

              {/* Additional Games if available */}
              {account.supercell_scroll_level > 0 && account.supercell_town_hall_level > 0 && (
                <div className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600'>
                  <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center bg-yellow-600'>
                    <Icon icon='simple-icons:clashofclans' className='text-white text-sm' />
                  </div>
                  <div className='flex-1'>
                    <div className='text-gray-200 text-sm font-medium'>Clash of Clans</div>
                    <div className='text-gray-400 text-xs'>
                      Town Hall {account.supercell_town_hall_level}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-purple-400 text-xs'>
                      Hero Lv.{account.supercell_hero_level || 0}
                    </div>
                  </div>
                </div>
              )}

              {account.supercell_brawler_count > 0 && primaryGame.name !== 'Brawl Stars' && (
                <div className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600'>
                  <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center bg-yellow-600'>
                    <Icon icon='simple-icons:brawlstars' className='text-white text-sm' />
                  </div>
                  <div className='flex-1'>
                    <div className='text-gray-200 text-sm font-medium'>Brawl Stars</div>
                    <div className='text-gray-400 text-xs'>
                      {account.supercell_brawler_count} Brawlers
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-purple-400 text-xs'>
                      {account.supercell_legendary_brawler_count || 0} Legendary
                    </div>
                  </div>
                </div>
              )}

              {/* Show additional features */}
              {account.supercell_scroll_battle_pass > 0 && (
                <div className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600'>
                  <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center bg-green-600'>
                    <Icon icon='mdi:ticket' className='text-white text-sm' />
                  </div>
                  <div className='flex-1'>
                    <div className='text-gray-200 text-sm font-medium'>Battle Pass</div>
                    <div className='text-gray-400 text-xs'>Clash Royale</div>
                  </div>
                  <div className='text-right'>
                    <div className='text-green-400 text-xs'>Active</div>
                  </div>
                </div>
              )}

              {account.supercell_builder_hall_level > 0 && (
                <div className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600'>
                  <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center bg-orange-600'>
                    <Icon icon='mdi:hammer' className='text-white text-sm' />
                  </div>
                  <div className='flex-1'>
                    <div className='text-gray-200 text-sm font-medium'>
                      Builder Hall {account.supercell_builder_hall_level}
                    </div>
                    <div className='text-gray-400 text-xs'>Clash of Clans</div>
                  </div>
                  <div className='text-right'>
                    <div className='text-orange-400 text-xs'>
                      {account.supercell_builder_hall_cup_count || 0} Cups
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer (same as Steam) */}
      <div className='account-footer bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <img
            src={`/data/assets/category/${account.category_id}.svg`}
            alt='Category Icon'
            className='w-4 h-4'
            onError={e => {
              e.target.style.display = 'none'
            }}
          />
          <span className='text-xs text-gray-400 capitalize'>
            {getOriginDisplay(account.item_origin)}
          </span>
        </div>
        <div className='text-xs text-gray-400'>{formatDate(account.published_date)}</div>
      </div>
    </Link>
  )
}

export default SupercellAccountCard
