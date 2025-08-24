import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { convertToIDR, formatCurrency, formatUSD, getPriceValue } from '../utils/currency'

const DiscordAccountCard = ({ account }) => {
  const priceUSD = getPriceValue(account)
  const priceIDR = convertToIDR(priceUSD)
  const formattedPrice = formatCurrency(priceIDR)

  const handleClick = () => {}

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

  const getLastSeenWarning = () => {
    const lastActivity = account.discord_register_date || account.lastSeen
    if (!lastActivity || lastActivity === 'Unknown') return 'warn-red'

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

    if (daysDiff > 365) return 'warn-green'
    if (daysDiff > 30) return 'warn-yellow'
    return 'warn-red'
  }

  const formatRelativeTime = timestamp => {
    if (!timestamp) return 'Unknown'

    let dateObj
    try {
      if (typeof timestamp === 'number') {
        dateObj = new Date(timestamp * 1000)
      } else if (typeof timestamp === 'string') {
        dateObj = new Date(timestamp)
      } else {
        return 'Activity data unavailable'
      }
    } catch {
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

  const getMainFeatures = () => {
    const features = []

    if (account.discord_verified) {
      features.push({
        icon: 'mdi:phone-check',
        title: 'Phone Verified',
        subtitle: 'Verified Account'
      })
    }

    if (account.discord_2fa) {
      features.push({
        icon: 'mdi:security',
        title: '2FA Enabled',
        subtitle: 'Security Active'
      })
    }

    if (account.discord_billing) {
      features.push({
        icon: 'mdi:credit-card-check',
        title: 'Billing Added',
        subtitle: 'Payment Ready'
      })
    }

    if (account.discord_nitro_type && account.discord_nitro_type !== 'none') {
      features.push({
        icon: 'mdi:crown',
        title: `Nitro ${account.discord_nitro_type}`,
        subtitle: 'Premium Active'
      })
    }

    return features.slice(0, 4)
  }

  const getAdditionalFeaturesCount = () => {
    let totalFeatures = 0
    if (account.discord_verified) totalFeatures++
    if (account.discord_2fa) totalFeatures++
    if (account.discord_billing) totalFeatures++
    if (account.discord_nitro_type && account.discord_nitro_type !== 'none') totalFeatures++
    if (account.discord_gifts > 0) totalFeatures++
    if (account.discord_available_boosts > 0) totalFeatures++

    return Math.max(0, totalFeatures - 4)
  }

  return (
    <Link
      to={`/acc/?id=${account.item_id || account.id}`}
      state={{ account: account }}
      onClick={handleClick}
      className='account bg-gray-900 border border-gray-700 hover:border-purple-500 transition-all duration-300 rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl flex flex-col min-h-[400px]'
    >
      <div className='bg-gradient-to-r from-purple-900 to-purple-800 px-4 py-3 flex justify-between items-center border-b border-purple-700'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-purple-400 rounded-full'></div>
          <span className='text-sm text-purple-100 font-medium'>Discord Account</span>
        </div>
        <div className='price-badge'>
          <div className='text-right'>
            <div className='text-xl font-bold text-purple-100'>{formattedPrice}</div>
            <div className='text-xs text-purple-200 mt-0.5'>${formatUSD(priceUSD)}</div>
          </div>
        </div>
      </div>

      <div className='p-4 space-y-3 flex-1'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='flex items-center space-x-1 bg-green-900 bg-opacity-50 px-2 py-1 rounded-lg border border-green-700'>
              <Icon icon='mdi:email-check' className='text-green-400 text-sm' />
              <span className='text-green-400 text-xs font-medium'>Mail Access</span>
            </div>

            <div className='flex items-center space-x-1 bg-yellow-900 bg-opacity-50 px-2 py-1 rounded-lg border border-yellow-700'>
              <Icon icon='mdi:shield-check' className='text-yellow-400 text-sm' />
              <span className='text-yellow-400 text-xs font-medium'>{getWarrantyInfo()}</span>
            </div>
          </div>

          <div className='flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-lg border border-gray-600'>
            <Icon icon='mdi:security' className='text-gray-400 text-sm' />
            <span className='text-gray-400 text-xs'>{account.discord_2fa ? '2FA' : 'No 2FA'}</span>
          </div>
        </div>

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
            Created {formatRelativeTime(account.discord_register_date || account.created_at)}
          </span>
        </div>

        <div className='grid grid-cols-3 gap-2'>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-purple-400 font-bold text-sm'>
              {account.discord_server_count || 0}
            </div>
            <div className='text-gray-400 text-xs'>Servers</div>
          </div>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-blue-400 font-bold text-sm'>
              {account.discord_friend_count || 0}
            </div>
            <div className='text-gray-400 text-xs'>Friends</div>
          </div>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div
              className={`font-bold text-sm ${account.discord_nitro_type && account.discord_nitro_type !== 'none' ? 'text-purple-400' : 'text-gray-400'}`}
            >
              {account.discord_nitro_type && account.discord_nitro_type !== 'none'
                ? 'Nitro'
                : 'None'}
            </div>
            <div className='text-gray-400 text-xs'>Nitro</div>
          </div>
        </div>

        <div className='features-section'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-300 text-sm font-medium flex items-center space-x-1'>
              <Icon icon='logos:discord-icon' className='text-purple-400' />
              <span>Features ({getMainFeatures().length})</span>
            </span>
          </div>

          <div className='space-y-2'>
            {getMainFeatures().length > 0 ? (
              getMainFeatures().map((feature, index) => (
                <div
                  key={index}
                  className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors'
                >
                  <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center'>
                    <Icon icon={feature.icon} className='text-purple-400 text-lg' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-xs text-gray-300 hover:text-white cursor-help truncate font-medium'>
                      {feature.title}
                    </div>
                    <div className='text-xs text-gray-500'>{feature.subtitle}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center text-gray-500 text-sm py-4 bg-gray-800 rounded-lg border border-gray-600'>
                <Icon icon='logos:discord-icon' className='text-2xl mb-1' />
                <div>Basic Discord account</div>
              </div>
            )}
          </div>

          {getAdditionalFeaturesCount() > 0 && (
            <div className='mt-2 text-center'>
              <span
                className='inline-flex items-center space-x-1 text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-lg border border-gray-600 cursor-help hover:border-gray-500 transition-colors'
                title='Click to view all features'
              >
                <Icon icon='mdi:plus' className='text-xs' />
                <span>{getAdditionalFeaturesCount()} more features</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className='bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center justify-between text-xs mt-auto'>
        <div className='flex items-center space-x-2'>
          <Icon icon='logos:discord-icon' className='text-purple-400' />
          <span className='text-gray-400'>Discord</span>
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

      <div className='absolute inset-0 bg-gradient-to-r from-transparent to-purple-900 opacity-0 hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-xl'></div>
    </Link>
  )
}

export default DiscordAccountCard
