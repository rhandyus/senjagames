import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { convertToIDR, formatCurrency, formatUSD, getPriceValue } from '../utils/currency'

const TikTokAccountCard = ({ account }) => {
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
    const lastActivity = account.tiktok_create_time || account.published_date || account.lastSeen
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
    return 'warn-red' // Recent activity - higher risk
  }

  // Format relative time for TikTok accounts
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

  // Format numbers in K/M format
  const formatNumber = num => {
    if (!num || num === 0) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Get main TikTok features (equivalent to Steam games)
  const getMainFeatures = () => {
    const features = []

    if (account.tiktok_verified) {
      features.push({
        icon: 'mdi:check-decagram',
        title: 'Verified Account',
        subtitle: 'Blue Checkmark'
      })
    }

    if (account.tiktok_has_email) {
      features.push({
        icon: 'mdi:email-check',
        title: 'Email Access',
        subtitle: 'Full Control'
      })
    }

    if (account.tiktok_has_mobile) {
      features.push({
        icon: 'mdi:phone-check',
        title: 'Phone Number',
        subtitle: 'Added & Verified'
      })
    }

    if (account.tiktok_has_live_permission) {
      features.push({
        icon: 'mdi:video',
        title: 'Live Streaming',
        subtitle: 'Permission Enabled'
      })
    }

    if (account.tiktok_coins > 0) {
      features.push({
        icon: 'mdi:coin',
        title: `${formatNumber(account.tiktok_coins)} Coins`,
        subtitle: 'TikTok Currency'
      })
    }

    if (account.tiktok_cookie_login) {
      features.push({
        icon: 'mdi:cookie',
        title: 'Cookie Login',
        subtitle: 'Easy Access'
      })
    }

    return features.slice(0, 4) // Limit to 4 features like Steam games
  }

  // Get additional features count
  const getAdditionalFeaturesCount = () => {
    let totalFeatures = 0
    if (account.tiktok_verified) totalFeatures++
    if (account.tiktok_has_email) totalFeatures++
    if (account.tiktok_has_mobile) totalFeatures++
    if (account.tiktok_has_live_permission) totalFeatures++
    if (account.tiktok_coins > 0) totalFeatures++
    if (account.tiktok_cookie_login) totalFeatures++

    return Math.max(0, totalFeatures - 4)
  }

  return (
    <Link
      to={`/acc/?id=${account.item_id || account.id}`}
      state={{ account: account }} // Pass account data via navigation state
      onClick={handleClick}
      className='account bg-gray-900 border border-gray-700 hover:border-pink-500 transition-all duration-300 rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl flex flex-col min-h-[400px]'
    >
      {/* Header with Price */}
      <div className='bg-gradient-to-r from-pink-600 to-pink-700 px-4 py-3 flex justify-between items-center border-b border-pink-600'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-pink-200 rounded-full'></div>
          <span className='text-sm text-pink-100 font-medium'>TikTok Account</span>
        </div>
        <div className='price-badge'>
          <div className='text-right'>
            <div className='text-xl font-bold text-pink-100'>{formattedPrice}</div>
            <div className='text-xs text-pink-200 mt-0.5'>${formatUSD(priceUSD)}</div>
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

          {/* Verified Status */}
          <div className='flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-lg border border-gray-600'>
            <Icon icon='mdi:check-decagram' className='text-gray-400 text-sm' />
            <span className='text-gray-400 text-xs'>
              {account.tiktok_verified ? 'Verified' : 'Not Verified'}
            </span>
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
            Created {formatRelativeTime(account.tiktok_create_time || account.created_at)}
          </span>
        </div>

        {/* TikTok Stats */}
        <div className='grid grid-cols-3 gap-2'>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-pink-400 font-bold text-sm'>
              {formatNumber(account.tiktok_followers || 0)}
            </div>
            <div className='text-gray-400 text-xs'>Followers</div>
          </div>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-red-400 font-bold text-sm'>
              {formatNumber(account.tiktok_likes || 0)}
            </div>
            <div className='text-gray-400 text-xs'>Likes</div>
          </div>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-blue-400 font-bold text-sm'>{account.tiktok_videos || 0}</div>
            <div className='text-gray-400 text-xs'>Videos</div>
          </div>
        </div>

        {/* TikTok Features Section (equivalent to Steam Games) */}
        <div className='features-section'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-300 text-sm font-medium flex items-center space-x-1'>
              <Icon icon='logos:tiktok-icon' className='text-pink-400' />
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
                    <Icon icon={feature.icon} className='text-pink-400 text-lg' />
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
                <Icon icon='logos:tiktok-icon' className='text-2xl mb-1' />
                <div>Basic TikTok account</div>
              </div>
            )}
          </div>

          {/* Additional Features */}
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

      {/* Footer */}
      <div className='bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center justify-between text-xs mt-auto'>
        <div className='flex items-center space-x-2'>
          <Icon icon='logos:tiktok-icon' className='text-pink-400' />
          <span className='text-gray-400'>TikTok</span>
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
      <div className='absolute inset-0 bg-gradient-to-r from-transparent to-pink-900 opacity-0 hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-xl'></div>
    </Link>
  )
}

export default TikTokAccountCard
