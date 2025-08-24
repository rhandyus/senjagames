import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { convertToIDR, formatCurrency, formatUSD, getPriceValue } from '../utils/currency'

const GiftsAccountCard = ({ account }) => {
  // Get formatted price in IDR
  const priceUSD = getPriceValue(account)
  const priceIDR = convertToIDR(priceUSD)
  const formattedPrice = formatCurrency(priceIDR)

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
  const getWarningColorClass = () => {
    return 'bg-red-900 bg-opacity-30 border-red-700 text-red-400'
  }

  // Get service color based on gift service
  const getServiceColor = () => {
    const colorMap = {
      discord: 'text-indigo-400',
      telegram: 'text-blue-400'
    }
    return colorMap[account.giftService] || 'text-purple-400'
  }

  // Get service background color
  const getServiceBgColor = () => {
    const colorMap = {
      discord: 'bg-indigo-900',
      telegram: 'bg-blue-900'
    }
    return colorMap[account.giftService] || 'bg-purple-900'
  }

  return (
    <Link
      to={`/gifts-account/${account.id}`}
      state={{ account }}
      className='account bg-gray-900 border border-gray-700 hover:border-purple-500 transition-all duration-300 rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl flex flex-col min-h-[400px]'
    >
      {/* Header with status and price */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-700'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-green-400 rounded-full'></div>
          <span className='text-sm text-gray-300 font-medium'>Gift Item</span>
        </div>
        <div className='price-badge'>
          <div className='text-right'>
            <div className='text-xl font-bold text-purple-400'>{formattedPrice}</div>
            <div className='text-xs text-gray-400 mt-0.5'>{formatUSD(priceUSD)}</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='p-4 space-y-3 flex-1'>
        {/* Status badges */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            {/* Mail access badge */}
            <div className='flex items-center space-x-1 bg-green-900 bg-opacity-50 px-2 py-1 rounded-lg border border-green-700'>
              <Icon icon='mdi:email-check' className='text-green-400 text-sm' />
              <span className='text-green-400 text-xs font-medium'>Gift Link</span>
            </div>

            {/* Warranty badge */}
            <div className='flex items-center space-x-1 bg-yellow-900 bg-opacity-50 px-2 py-1 rounded-lg border border-yellow-700'>
              <Icon icon='mdi:shield-check' className='text-yellow-400 text-sm' />
              <span className='text-yellow-400 text-xs font-medium'>{getWarrantyInfo()}</span>
            </div>
          </div>

          {/* Origin badge */}
          <div className='flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-lg border border-gray-600'>
            <Icon icon='mdi:flag' className='text-gray-400 text-sm' />
            <span className='text-gray-400 text-xs'>
              {account.itemOrigin?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
        </div>

        {/* Activity status warning */}
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg border ${getWarningColorClass()}`}
        >
          <Icon icon='mdi:clock-alert' className='text-sm text-red-400' />
          <span className='text-xs font-medium text-red-400'>Activity data unavailable</span>
        </div>

        {/* Gift details grid */}
        <div className='grid grid-cols-3 gap-2'>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-purple-400 font-bold text-sm'>
              {account.giftService?.toUpperCase() || 'GIFT'}
            </div>
            <div className='text-gray-400 text-xs'>Service</div>
          </div>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-purple-400 font-bold text-sm'>{account.giftDuration || 'N/A'}</div>
            <div className='text-gray-400 text-xs'>Duration (days)</div>
          </div>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-purple-400 font-bold text-sm'>{account.viewCount || 0}</div>
            <div className='text-gray-400 text-xs'>Views</div>
          </div>
        </div>

        {/* Gift details section */}
        <div className='gift-details-section'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-300 text-sm font-medium flex items-center space-x-1'>
              <Icon
                icon={account.giftServiceIcon || 'mdi:gift'}
                className={`${getServiceColor()}`}
              />
              <span>{account.giftTypeName || 'Gift Item'}</span>
            </span>
          </div>

          {/* Gift details */}
          <div className='space-y-2'>
            <div
              className={`flex items-center ${getServiceBgColor()} bg-opacity-50 p-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors`}
            >
              <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center'>
                <Icon
                  icon={account.giftServiceIcon || 'mdi:gift'}
                  className={`w-6 h-6 ${getServiceColor()}`}
                />
              </div>
              <div className='flex-1 min-w-0'>
                <div
                  className='text-xs text-gray-300 hover:text-white cursor-help truncate font-medium'
                  title={account.title}
                >
                  {account.giftTypeName || 'Gift Item'}
                </div>
                <div className='text-xs text-gray-500'>
                  {account.giftDurationText || 'Duration unknown'}
                </div>
              </div>
            </div>

            {/* Additional gift info if available */}
            {account.description && (
              <div className='text-xs text-gray-400 bg-gray-800 p-2 rounded border border-gray-600 max-h-16 overflow-hidden'>
                {account.description.substring(0, 100)}
                {account.description.length > 100 && '...'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center justify-between text-xs mt-auto'>
        <div className='flex items-center space-x-2'>
          <Icon icon='mdi:gift-outline' className='text-purple-400' />
          <span className='text-gray-400'>Gifts</span>
        </div>
        <div className='flex items-center space-x-2 text-gray-400'>
          <time className='hover:text-gray-300'>{account.publishedDate}</time>
        </div>
      </div>

      {/* Hover effect */}
      <div className='absolute inset-0 bg-gradient-to-r from-transparent to-purple-900 opacity-0 hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-xl'></div>
    </Link>
  )
}

export default GiftsAccountCard
