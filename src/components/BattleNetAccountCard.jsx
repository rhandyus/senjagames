import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { convertToIDR, formatCurrency, formatUSD, getPriceValue } from '../utils/currency'

const BattleNetAccountCard = ({ account }) => {
  const { addToCart } = useCart()

  // Get formatted price in IDR
  const priceUSD = getPriceValue(account)
  const priceIDR = convertToIDR(priceUSD)
  const formattedPrice = formatCurrency(priceIDR)

  // Add a click handler to log what's being passed to detail page
  const handleClick = () => {}

  const handleAddToCart = () => {
    addToCart({
      id: account.id,
      title: account.title,
      price: account.price,
      type: 'Battle.net Account',
      details: {
        game_type: account.game_type,
        email: account.email_type,
        region: account.region,
        warranty: account.warranty
      }
    })
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

  // Get games from title or description
  const getGames = () => {
    const games = []
    const title = account.title?.toLowerCase() || ''
    const desc = account.description?.toLowerCase() || ''

    if (title.includes('cod') || title.includes('call of duty') || desc.includes('cod'))
      games.push('Call of Duty')
    if (title.includes('overwatch') || desc.includes('overwatch')) games.push('Overwatch')
    if (title.includes('diablo') || desc.includes('diablo')) games.push('Diablo')
    if (title.includes('wow') || title.includes('warcraft') || desc.includes('warcraft'))
      games.push('World of Warcraft')
    if (title.includes('hearthstone') || desc.includes('hearthstone')) games.push('Hearthstone')
    if (title.includes('starcraft') || desc.includes('starcraft')) games.push('StarCraft')
    if (title.includes('heroes') || desc.includes('heroes')) games.push('Heroes of the Storm')

    return games
  }

  // Get account features from title/description
  const getAccountFeatures = () => {
    const features = []
    const title = account.title?.toLowerCase() || ''
    const desc = account.description?.toLowerCase() || ''

    if (title.includes('full access') || desc.includes('full access')) features.push('Full Access')
    if (title.includes('email') || desc.includes('email')) features.push('Email Included')
    if (title.includes('sms') || desc.includes('sms')) features.push('SMS Protected')
    if (title.includes('rare') || desc.includes('rare')) features.push('Rare Items')
    if (title.includes('ranked') || desc.includes('ranked')) features.push('Ranked Ready')
    if (title.includes('premium') || desc.includes('premium')) features.push('Premium Content')

    return features
  }

  const games = getGames()
  const features = getAccountFeatures()

  return (
    <Link
      to={`/acc/?id=${account.item_id || account.id}`}
      state={{ account: account }}
      onClick={handleClick}
      className='account bg-gray-900 border border-gray-700 hover:border-blue-500 transition-all duration-300 rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl flex flex-col min-h-[400px]'
    >
      {/* Header with Price */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-700'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-blue-400 rounded-full'></div>
          <span className='text-sm text-gray-300 font-medium'>Battle.net</span>
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
        </div>

        {/* Games Section */}
        {games.length > 0 && (
          <div className='flex items-center space-x-2 p-2 rounded-lg border bg-gray-800 border-gray-600'>
            <Icon icon='simple-icons:battlenet' className='text-blue-400 text-sm' />
            <span className='text-blue-400 text-xs font-medium'>
              {games.slice(0, 2).join(', ')}
              {games.length > 2 && ` +${games.length - 2} more`}
            </span>
          </div>
        )}

        {/* Account Details Section */}
        <div className='account-details-section'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-300 text-sm font-medium flex items-center space-x-1'>
              <Icon icon='mdi:account-details' className='text-blue-400' />
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
                  Email: {account.email_type || account.item_origin || 'Included'}
                </div>
                <div className='text-xs text-gray-500'>Full access included</div>
              </div>
            </div>

            {account.published_date && account.published_date > 0 && (
              <div className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors'>
                <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center'>
                  <Icon icon='mdi:calendar' className='text-green-400' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='text-xs text-gray-300 hover:text-white cursor-help truncate font-medium'>
                    Published: {formatDate(account.published_date)}
                  </div>
                </div>
              </div>
            )}

            {account.view_count && account.view_count > 0 && (
              <div className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors'>
                <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center'>
                  <Icon icon='mdi:eye' className='text-purple-400' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='text-xs text-gray-300 hover:text-white cursor-help truncate font-medium'>
                    Views: {account.view_count.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            {features.length > 0 &&
              features.slice(0, 3).map((feature, index) => (
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
          {features.length > 3 && (
            <div className='mt-2 text-center'>
              <span
                className='inline-flex items-center space-x-1 text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-lg border border-gray-600 cursor-help hover:border-gray-500 transition-colors'
                title='Click to view all features'
              >
                <Icon icon='mdi:plus' className='text-xs' />
                <span>{features.length - 3} more features</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className='bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center justify-between text-xs mt-auto'>
        <div className='flex items-center space-x-2'>
          <Icon icon='simple-icons:battlenet' className='text-blue-400' />
          <span className='text-gray-400'>Battle.net</span>
          {account.is_sticky && <span className='text-yellow-400'>• Featured</span>}
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
      <div className='absolute inset-0 bg-gradient-to-r from-transparent to-blue-900 opacity-0 hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-xl'></div>
    </Link>
  )
}

export default BattleNetAccountCard
