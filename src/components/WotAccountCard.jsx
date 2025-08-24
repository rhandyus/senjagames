import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const WotAccountCard = ({ account, onViewDetails }) => {
  const { addToCart } = useCart()
  const navigate = useNavigate()

  // Format numbers with commas
  const formatNumber = num => {
    if (!num) return '0'
    return parseInt(num).toLocaleString()
  }

  // Format date
  const formatDate = timestamp => {
    if (!timestamp) return 'Unknown'
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Calculate win rate
  const getWinRate = () => {
    if (account.wot_win_count_percents) {
      return `${account.wot_win_count_percents}%`
    }
    if (account.wot_win_count && account.wot_battle_count) {
      return `${Math.round((account.wot_win_count / account.wot_battle_count) * 100)}%`
    }
    return 'N/A'
  }

  // Get region display name
  const getRegionName = region => {
    const regions = {
      eu: 'Europe',
      na: 'North America',
      asia: 'Asia',
      ru: 'Russia'
    }
    return regions[region] || region?.toUpperCase() || 'Unknown'
  }

  // Get account origin color
  const getOriginColor = origin => {
    const colors = {
      brute: 'bg-red-500',
      phishing: 'bg-orange-500',
      stealer: 'bg-yellow-500',
      personal: 'bg-green-500',
      resale: 'bg-blue-500',
      autoreg: 'bg-purple-500',
      dummy: 'bg-gray-500'
    }
    return colors[origin] || 'bg-gray-500'
  }

  const handleAddToCart = () => {
    addToCart({
      id: account.item_id || account.wot_item_id,
      title: `World of Tanks Account #${account.item_id || account.wot_item_id}`,
      price: account.price,
      category: 'World of Tanks',
      image: '/icons8-world-of-tanks.svg',
      account: account
    })
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(account)
    } else {
      navigate(`/account/${account.item_id || account.wot_item_id}`)
    }
  }

  // Check if account has warnings
  const hasEmailWarning = !account.email_type || account.email_type === ''
  const hasPhoneWarning = account.wot_mobile === 1 || account.phone === 'yes'
  const isRecentlyActive =
    account.wot_last_activity && Date.now() / 1000 - account.wot_last_activity < 7 * 24 * 60 * 60 // 7 days

  return (
    <div className='bg-gray-900 rounded-lg border border-gray-700 hover:border-amber-500 transition-all duration-300 overflow-hidden group'>
      {/* Header with Price */}
      <div className='p-4 border-b border-gray-700'>
        <div className='flex justify-between items-start'>
          <div className='flex items-center space-x-2'>
            <Icon icon='mdi:tank' className='text-amber-500 text-xl' />
            <span className='text-sm text-gray-400'>
              WOT #{account.item_id || account.wot_item_id}
            </span>
          </div>
          <div className='text-right'>
            <div className='text-2xl font-bold text-white'>
              ${account.price?.toFixed(2) || '0.00'}
            </div>
            {account.priceWithSellerFeeLabel && (
              <div className='text-xs text-gray-400'>{account.priceWithSellerFeeLabel}</div>
            )}
          </div>
        </div>
      </div>

      {/* Warning Indicators */}
      {(hasEmailWarning || hasPhoneWarning || isRecentlyActive) && (
        <div className='p-3 bg-gray-800 border-b border-gray-700'>
          <div className='space-y-1'>
            {hasEmailWarning && (
              <div className='flex items-center text-red-400 text-xs'>
                <Icon icon='mdi:email-off' className='mr-1' />
                No Mail Access
              </div>
            )}
            {hasPhoneWarning && (
              <div className='flex items-center text-red-400 text-xs'>
                <Icon icon='mdi:phone-off' className='mr-1' />
                Phone Linked
              </div>
            )}
            {isRecentlyActive && (
              <div className='flex items-center text-yellow-400 text-xs'>
                <Icon icon='mdi:clock-alert' className='mr-1' />
                Recently Active ({formatDate(account.wot_last_activity)})
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className='p-4'>
        {/* Account Stats Grid */}
        <div className='grid grid-cols-2 gap-3 mb-4'>
          {/* Region & Server */}
          <div className='flex items-center space-x-2'>
            <Icon icon='mdi:earth' className='text-blue-400' />
            <div>
              <div className='text-sm font-medium text-white'>
                {getRegionName(account.wot_region)}
              </div>
              <div className='text-xs text-gray-400'>Region</div>
            </div>
          </div>

          {/* Battle Count */}
          <div className='flex items-center space-x-2'>
            <Icon icon='mdi:sword-cross' className='text-red-400' />
            <div>
              <div className='text-sm font-medium text-white'>
                {formatNumber(account.wot_battle_count)}
              </div>
              <div className='text-xs text-gray-400'>Battles</div>
            </div>
          </div>

          {/* Win Rate */}
          <div className='flex items-center space-x-2'>
            <Icon icon='mdi:trophy' className='text-yellow-400' />
            <div>
              <div className='text-sm font-medium text-white'>{getWinRate()}</div>
              <div className='text-xs text-gray-400'>Win Rate</div>
            </div>
          </div>

          {/* Premium Tanks */}
          <div className='flex items-center space-x-2'>
            <Icon icon='mdi:star' className='text-amber-400' />
            <div>
              <div className='text-sm font-medium text-white'>
                {formatNumber(account.wot_premium_tanks)}
              </div>
              <div className='text-xs text-gray-400'>Premium Tanks</div>
            </div>
          </div>
        </div>

        {/* Currency Information */}
        <div className='grid grid-cols-2 gap-3 mb-4'>
          {/* Gold */}
          <div className='flex items-center space-x-2'>
            <Icon icon='mdi:coin' className='text-yellow-500' />
            <div>
              <div className='text-sm font-medium text-white'>{formatNumber(account.wot_gold)}</div>
              <div className='text-xs text-gray-400'>Gold</div>
            </div>
          </div>

          {/* Credits */}
          <div className='flex items-center space-x-2'>
            <Icon icon='mdi:cash' className='text-green-400' />
            <div>
              <div className='text-sm font-medium text-white'>
                {formatNumber(account.wot_credits)}
              </div>
              <div className='text-xs text-gray-400'>Credits</div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className='grid grid-cols-2 gap-3 mb-4'>
          {/* Top Tanks */}
          <div className='flex items-center space-x-2'>
            <Icon icon='mdi:medal' className='text-purple-400' />
            <div>
              <div className='text-sm font-medium text-white'>
                {formatNumber(account.wot_top_tanks)}
              </div>
              <div className='text-xs text-gray-400'>Top Tanks</div>
            </div>
          </div>

          {/* Register Date */}
          <div className='flex items-center space-x-2'>
            <Icon icon='mdi:calendar' className='text-blue-400' />
            <div>
              <div className='text-sm font-medium text-white'>
                {formatDate(account.wot_register_date)}
              </div>
              <div className='text-xs text-gray-400'>Registered</div>
            </div>
          </div>
        </div>

        {/* Premium Status */}
        {account.wot_premium && account.wot_premium_expires && (
          <div className='mb-4 p-2 bg-amber-900 bg-opacity-20 border border-amber-700 rounded'>
            <div className='flex items-center text-amber-400 text-sm'>
              <Icon icon='mdi:crown' className='mr-2' />
              Premium until {formatDate(account.wot_premium_expires)}
            </div>
          </div>
        )}

        {/* Clan Information */}
        {account.wot_clan && account.wot_clan !== '[]' && (
          <div className='mb-4 p-2 bg-blue-900 bg-opacity-20 border border-blue-700 rounded'>
            <div className='flex items-center text-blue-400 text-sm'>
              <Icon icon='mdi:shield-account' className='mr-2' />
              In Clan {account.wot_clan_role && `(${account.wot_clan_role})`}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='p-4 bg-gray-800 border-t border-gray-700'>
        <div className='flex items-center justify-between mb-3'>
          {/* Account Origin */}
          <div className='flex items-center space-x-2'>
            <div
              className={`w-2 h-2 rounded-full ${getOriginColor(account.resale_item_origin || account.item_origin)}`}
            ></div>
            <span className='text-xs text-gray-400 capitalize'>
              {account.resale_item_origin || account.item_origin || 'Unknown'}
            </span>
          </div>

          {/* Published Date */}
          <span className='text-xs text-gray-400'>{formatDate(account.published_date)}</span>
        </div>

        {/* Action Buttons */}
        <div className='flex space-x-2'>
          <button
            onClick={handleViewDetails}
            className='flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium'
          >
            View Details
          </button>
          <button
            onClick={handleAddToCart}
            className='flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-1'
          >
            <Icon icon='mdi:cart-plus' />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className='absolute inset-0 bg-amber-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none'></div>
    </div>
  )
}

export default WotAccountCard
