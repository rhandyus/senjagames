import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { convertToIDR, formatCurrency, formatUSD, getPriceValue } from '../utils/currency'

const InstagramAccountCard = ({ account }) => {
  const { addToCart } = useCart()

  // Get formatted price in IDR
  const priceUSD = getPriceValue(account)
  const priceIDR = convertToIDR(priceUSD)
  const formattedPrice = formatCurrency(priceIDR)

  const handleAddToCart = () => {
    addToCart({
      id: account.id,
      title: account.title,
      price: account.price,
      type: 'Instagram Account',
      details: {
        username: account.instagram_username,
        followers: account.instagram_follower_count,
        posts: account.instagram_post_count,
        email: account.email_type
      }
    })
  }

  const formatNumber = num => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num?.toString() || '0'
  }

  const formatDate = timestamp => {
    if (!timestamp || timestamp === 0) return 'Unknown'
    try {
      return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Unknown'
    }
  }

  // Get warranty info
  const getWarrantyInfo = () => {
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

  // Add a click handler to log what's being passed to detail page
  const handleClick = () => {}

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
          <div className='w-2 h-2 bg-purple-400 rounded-full'></div>
          <span className='text-sm text-gray-300 font-medium'>Instagram Account</span>
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

          {/* Cookies Status */}
          {account.instagram_has_cookies && (
            <div className='flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-lg border border-gray-600'>
              <Icon icon='mdi:cookie' className='text-gray-400 text-sm' />
              <span className='text-gray-400 text-xs'>Cookies</span>
            </div>
          )}
        </div>

        {/* Username Display */}
        <div className='flex items-center space-x-2 p-2 rounded-lg border bg-gray-800 border-gray-600'>
          <Icon icon='mdi:instagram' className='text-pink-400 text-sm' />
          <span className='text-pink-400 text-xs font-medium'>@{account.instagram_username}</span>
        </div>

        {/* Instagram Stats */}
        {(account.instagram_follower_count ||
          account.instagram_follow_count ||
          account.instagram_post_count) && (
          <div className='grid grid-cols-3 gap-2'>
            {account.instagram_follower_count !== undefined && (
              <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
                <div className='text-purple-400 font-bold text-sm'>
                  {formatNumber(account.instagram_follower_count)}
                </div>
                <div className='text-gray-400 text-xs'>Followers</div>
              </div>
            )}
            {account.instagram_follow_count !== undefined && (
              <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
                <div className='text-blue-400 font-bold text-sm'>
                  {formatNumber(account.instagram_follow_count)}
                </div>
                <div className='text-gray-400 text-xs'>Following</div>
              </div>
            )}
            {account.instagram_post_count !== undefined && (
              <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
                <div className='text-green-400 font-bold text-sm'>
                  {formatNumber(account.instagram_post_count)}
                </div>
                <div className='text-gray-400 text-xs'>Posts</div>
              </div>
            )}
          </div>
        )}

        {/* Account Details Section */}
        <div className='account-details-section'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-300 text-sm font-medium flex items-center space-x-1'>
              <Icon icon='mdi:account-details' className='text-purple-400' />
              <span>Account Details</span>
            </span>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors'>
              <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center'>
                <Icon icon='mdi:email' className='text-blue-400' />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='text-xs text-gray-300 hover:text-white cursor-help truncate font-medium'>
                  Email: {account.email_type}
                </div>
                <div className='text-xs text-gray-500'>{account.email_provider}</div>
              </div>
            </div>

            {account.instagram_register_date && account.instagram_register_date > 0 && (
              <div className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors'>
                <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center'>
                  <Icon icon='mdi:calendar' className='text-green-400' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='text-xs text-gray-300 hover:text-white cursor-help truncate font-medium'>
                    Registered: {formatDate(account.instagram_register_date)}
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            {account.features &&
              account.features.length > 0 &&
              account.features.slice(0, 3).map((feature, index) => (
                <div
                  key={index}
                  className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors'
                >
                  <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center'>
                    <Icon icon='mdi:star' className='text-yellow-400' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-xs text-gray-300 hover:text-white cursor-help truncate font-medium'>
                      {feature}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Additional Features */}
          {account.features && account.features.length > 3 && (
            <div className='mt-2 text-center'>
              <span
                className='inline-flex items-center space-x-1 text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-lg border border-gray-600 cursor-help hover:border-gray-500 transition-colors'
                title='Click to view all features'
              >
                <Icon icon='mdi:plus' className='text-xs' />
                <span>{account.features.length - 3} more features</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className='bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center justify-between text-xs mt-auto'>
        <div className='flex items-center space-x-2'>
          <Icon icon='mdi:instagram' className='text-pink-400' />
          <span className='text-gray-400'>Instagram</span>
          {account.instagram_mobile && <span className='text-blue-400'>• Mobile Verified</span>}
          {account.allow_ask_discount && (
            <span className='text-orange-400'>• Discount Available</span>
          )}
        </div>
        <div className='flex items-center space-x-2 text-gray-400'>
          <time className='hover:text-gray-300'>
            {formatDate(
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

export default InstagramAccountCard
