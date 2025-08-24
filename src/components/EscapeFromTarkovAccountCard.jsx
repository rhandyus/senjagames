import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const EscapeFromTarkovAccountCard = ({ account }) => {
  const { addToCart } = useCart()

  const handleAddToCart = e => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: account.item_id || account.id,
      title: `Escape From Tarkov - ${account.tarkov_username || 'Unknown'}`,
      price: account.price,
      currency: account.currency || 'USD',
      type: 'escapefromtarkov',
      account: account
    })
  }

  const handleClick = () => {
    // Add any click tracking here if needed
  }

  // Format price
  const price = parseFloat(account.price) || 0
  const formattedPrice = price > 0 ? `$${price.toFixed(2)}` : 'Free'

  // Get game version display name
  const getVersionDisplay = () => {
    const versionMap = {
      standard: 'Standard',
      left_behind: 'Left Behind',
      prepare_for_escape: 'Prepare for Escape',
      edge_of_darkness: 'Edge of Darkness',
      unheard_edition: 'The Unheard Edition'
    }
    return versionMap[account.tarkov_game_version] || 'Standard'
  }

  // Get region display name
  const getRegionDisplay = () => {
    const regionMap = {
      af: 'Africa',
      as: 'Asia',
      eu: 'Europe',
      me: 'Middle East',
      oc: 'Oceania',
      cis: 'RU/CIS',
      us: 'US'
    }
    return regionMap[account.tarkov_region] || 'Unknown'
  }

  // Get side display name
  const getSideDisplay = () => {
    if (account.tarkov_side === 'bear') return 'BEAR'
    if (account.tarkov_side === 'usec') return 'USEC'
    return 'Unknown'
  }

  // Format currency amounts
  const formatCurrency = (amount, symbol) => {
    if (!amount || amount === 0) return null
    return `${amount.toLocaleString()}${symbol}`
  }

  // Get warranty info
  const getWarrantyInfo = () => {
    return account.extended_guarantee ? 'Extended Warranty' : '24h Warranty'
  }

  return (
    <Link
      to={`/acc/?id=${account.item_id || account.id}`}
      state={{ account: account }}
      onClick={handleClick}
      className='account bg-gray-900 border border-gray-700 hover:border-purple-500 transition-all duration-300 rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl flex flex-col min-h-[400px]'
    >
      {/* Header with Price */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-700'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-red-400 rounded-full'></div>
          <span className='text-sm text-gray-300 font-medium'>Escape From Tarkov</span>
        </div>
        <div className='price-badge'>
          <div className='text-right'>
            <div className='text-xl font-bold text-purple-400'>{formattedPrice}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='p-4 space-y-3 flex-1'>
        {/* Status Row */}
        <div className='flex items-center justify-between flex-wrap gap-2'>
          {/* Email Access */}
          <div
            className={`flex items-center space-x-1 ${account.hasMailAccess ? 'bg-green-900 bg-opacity-50 border-green-700' : 'bg-yellow-900 bg-opacity-50 border-yellow-700'} px-2 py-1 rounded-lg border`}
          >
            <Icon
              icon={account.hasMailAccess ? 'mdi:email-check' : 'mdi:email-alert'}
              className={`text-sm ${account.hasMailAccess ? 'text-green-400' : 'text-yellow-400'}`}
            />
            <span
              className={`text-xs font-medium ${account.hasMailAccess ? 'text-green-400' : 'text-yellow-400'}`}
            >
              {account.hasMailAccess ? 'Mail Access' : 'No Mail'}
            </span>
          </div>

          {/* Warranty */}
          <div
            className={`flex items-center space-x-1 ${account.extended_guarantee ? 'bg-blue-900 bg-opacity-50 border-blue-700' : 'bg-yellow-900 bg-opacity-50 border-yellow-700'} px-2 py-1 rounded-lg border`}
          >
            <Icon
              icon='mdi:shield-check'
              className={`text-sm ${account.extended_guarantee ? 'text-blue-400' : 'text-yellow-400'}`}
            />
            <span
              className={`text-xs font-medium ${account.extended_guarantee ? 'text-blue-400' : 'text-yellow-400'}`}
            >
              {getWarrantyInfo()}
            </span>
          </div>
        </div>

        {/* Account Title/Username */}
        <div className='space-y-2'>
          <div className='text-lg font-semibold text-white flex items-center'>
            <Icon icon='mdi:skull' className='text-red-500 mr-2' />
            {account.tarkov_username || 'Tarkov Account'}
          </div>
        </div>

        {/* Tarkov Details */}
        <div className='space-y-2'>
          {/* Edition and Region */}
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-400'>Edition:</span>
            <span className='text-green-400 font-medium'>{getVersionDisplay()}</span>
          </div>

          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-400'>Region:</span>
            <span className='text-blue-400 font-medium'>{getRegionDisplay()}</span>
          </div>

          {/* Level */}
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-400'>Level:</span>
            <span className='text-purple-400 font-medium'>{account.tarkov_level || 0}</span>
          </div>

          {/* Side */}
          {account.tarkov_side && (
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-400'>Side:</span>
              <span className='text-orange-400 font-medium'>{getSideDisplay()}</span>
            </div>
          )}

          {/* PvE Access */}
          {account.tarkov_access_pve && (
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-400'>PvE Access:</span>
              <span className='text-green-400 font-medium'>Yes</span>
            </div>
          )}

          {/* Container */}
          {account.tarkov_secured_container && account.tarkov_secured_container !== '0' && (
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-400'>Container:</span>
              <span className='text-cyan-400 font-medium'>{account.tarkov_secured_container}</span>
            </div>
          )}
        </div>

        {/* Currency Section */}
        <div className='bg-gray-800 p-3 rounded-lg'>
          <div className='grid grid-cols-3 gap-2 text-xs'>
            {formatCurrency(account.tarkov_rubles, '₽') && (
              <div className='text-center'>
                <div className='text-gray-400'>Rubles</div>
                <div className='text-yellow-400 font-medium'>
                  {formatCurrency(account.tarkov_rubles, '₽')}
                </div>
              </div>
            )}
            {formatCurrency(account.tarkov_euros, '€') && (
              <div className='text-center'>
                <div className='text-gray-400'>Euros</div>
                <div className='text-blue-400 font-medium'>
                  {formatCurrency(account.tarkov_euros, '€')}
                </div>
              </div>
            )}
            {formatCurrency(account.tarkov_dollars, '$') && (
              <div className='text-center'>
                <div className='text-gray-400'>Dollars</div>
                <div className='text-green-400 font-medium'>
                  {formatCurrency(account.tarkov_dollars, '$')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Origin */}
        <div className='flex items-center text-xs text-gray-500'>
          <Icon icon='mdi:source-branch' className='mr-1' />
          Origin: {account.item_origin || 'Unknown'}
        </div>
      </div>

      {/* Footer with Add to Cart */}
      <div className='p-4 pt-2 mt-auto border-t border-gray-700'>
        <button
          onClick={handleAddToCart}
          className='w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2'
        >
          <Icon icon='mdi:cart-plus' className='text-lg' />
          <span>Add to Cart</span>
        </button>
      </div>
    </Link>
  )
}

export default EscapeFromTarkovAccountCard
