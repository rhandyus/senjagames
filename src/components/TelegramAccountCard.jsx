import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { convertToIDR, formatCurrency, formatUSD } from '../utils/currency'

const TelegramAccountCard = ({ account }) => {
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

  // Get spam block status with color coding like Steam's last seen
  const getSpamBlockStatus = () => {
    const spamBlock = account.telegram_spam_block
    if (spamBlock === 1) {
      return {
        text: 'Spam Block',
        colorClass: 'warn-red',
        bgClass: 'bg-red-900 bg-opacity-30 border-red-700',
        textClass: 'text-red-400',
        icon: 'mdi:close-circle'
      }
    }
    if (spamBlock === 0) {
      return {
        text: 'No Spam Block',
        colorClass: 'warn-green',
        bgClass: 'bg-green-900 bg-opacity-30 border-green-700',
        textClass: 'text-green-400',
        icon: 'mdi:check-circle'
      }
    }
    return {
      text: 'Unknown Status',
      colorClass: 'warn-yellow',
      bgClass: 'bg-gray-900 bg-opacity-30 border-gray-700',
      textClass: 'text-gray-400',
      icon: 'mdi:help-circle'
    }
  }

  // Get last seen warning color like Steam
  const getLastSeenWarning = () => {
    if (!account.telegram_last_seen) return 'warn-red'

    const lastSeen = new Date(account.telegram_last_seen * 1000)
    const now = new Date()
    const daysDiff = (now - lastSeen) / (1000 * 60 * 60 * 24)

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

  // Get warranty info (same as Steam)
  const getWarrantyInfo = () => {
    if (account.extended_guarantee > 0) return 'Warranty'
    return '24 hours Warranty'
  }

  const spamStatus = getSpamBlockStatus()
  const lastSeenWarning = getLastSeenWarning()

  return (
    <Link
      to={`/acc/?id=${account.item_id}`}
      state={{ account: account }}
      className='account bg-gray-900 border border-gray-700 hover:border-purple-500 transition-all duration-300 rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl flex flex-col min-h-[400px]'
    >
      {/* Header with Price (same as Steam) */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-700'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-blue-400 rounded-full'></div>
          <span className='text-sm text-gray-300 font-medium'>Telegram Account</span>
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
            {/* Spam Block Status */}
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg border ${spamStatus.bgClass}`}
            >
              <Icon icon={spamStatus.icon} className={`${spamStatus.textClass} text-sm`} />
              <span className={`${spamStatus.textClass} text-xs font-medium`}>
                {spamStatus.text}
              </span>
            </div>

            {/* Warranty */}
            <div className='flex items-center space-x-1 bg-yellow-900 bg-opacity-50 px-2 py-1 rounded-lg border border-yellow-700'>
              <Icon icon='mdi:shield-check' className='text-yellow-400 text-sm' />
              <span className='text-yellow-400 text-xs font-medium'>{getWarrantyInfo()}</span>
            </div>
          </div>

          {/* Premium Status */}
          {account.telegram_premium === 1 && (
            <div className='flex items-center space-x-1 bg-yellow-900 bg-opacity-50 px-2 py-1 rounded-lg border border-yellow-700'>
              <Icon icon='mdi:crown' className='text-yellow-400 text-sm' />
              <span className='text-yellow-400 text-xs'>Premium</span>
            </div>
          )}
        </div>

        {/* Last Seen (same style as Steam) */}
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg border ${
            lastSeenWarning === 'warn-green'
              ? 'bg-green-900 bg-opacity-30 border-green-700'
              : lastSeenWarning === 'warn-yellow'
                ? 'bg-yellow-900 bg-opacity-30 border-yellow-700'
                : 'bg-red-900 bg-opacity-30 border-red-700'
          }`}
        >
          <Icon
            icon='mdi:clock-outline'
            className={`text-sm ${
              lastSeenWarning === 'warn-green'
                ? 'text-green-400'
                : lastSeenWarning === 'warn-yellow'
                  ? 'text-yellow-400'
                  : 'text-red-400'
            }`}
          />
          <span
            className={`text-xs font-medium ${
              lastSeenWarning === 'warn-green'
                ? 'text-green-400'
                : lastSeenWarning === 'warn-yellow'
                  ? 'text-yellow-400'
                  : 'text-red-400'
            }`}
          >
            Last seen {formatRelativeTime(account.telegram_last_seen)}
          </span>
        </div>

        {/* Telegram Stats (like Steam stats) */}
        <div className='grid grid-cols-2 gap-2'>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-blue-400 font-bold text-sm'>
              {account.telegram_country || 'Unknown'}
            </div>
            <div className='text-gray-400 text-xs'>Country</div>
          </div>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-purple-400 font-bold text-sm'>
              DC {account.telegram_dc_id || '?'}
            </div>
            <div className='text-gray-400 text-xs'>Data Center</div>
          </div>
        </div>

        {/* Games Container (Telegram stats in Steam-like format) */}
        <div className='games-section'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-300 text-sm font-medium flex items-center space-x-1'>
              <Icon icon='logos:telegram' className='text-blue-400' />
              <span>Telegram Stats</span>
            </span>
          </div>

          <div className='space-y-2'>
            {/* Chats */}
            <div className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600'>
              <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center bg-blue-600'>
                <Icon icon='mdi:chat' className='text-white text-sm' />
              </div>
              <div className='flex-1'>
                <div className='text-gray-200 text-sm font-medium'>
                  {account.telegram_chats_count || 0} chats
                </div>
              </div>
            </div>

            {/* Channels */}
            <div className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600'>
              <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center bg-purple-600'>
                <Icon icon='mdi:bullhorn' className='text-white text-sm' />
              </div>
              <div className='flex-1'>
                <div className='text-gray-200 text-sm font-medium'>
                  {account.telegram_channels_count || 0} channels
                </div>
              </div>
            </div>

            {/* Conversations */}
            <div className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600'>
              <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center bg-green-600'>
                <Icon icon='mdi:message-text' className='text-white text-sm' />
              </div>
              <div className='flex-1'>
                <div className='text-gray-200 text-sm font-medium'>
                  {account.telegram_conversations_count || 0} conversations
                </div>
              </div>
            </div>

            {/* Contacts */}
            <div className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600'>
              <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center bg-orange-600'>
                <Icon icon='mdi:contacts' className='text-white text-sm' />
              </div>
              <div className='flex-1'>
                <div className='text-gray-200 text-sm font-medium'>
                  {account.telegram_contacts_count || 0} contacts
                </div>
              </div>
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

export default TelegramAccountCard
