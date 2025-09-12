import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const MinecraftAccountCard = ({ account }) => {
  const { addToCart } = useCart()

  const handleAddToCart = e => {
    e.preventDefault()
    e.stopPropagation()

    // Convert price from RUB to IDR (API always returns RUB)
    const RUB_TO_IDR = parseFloat(import.meta.env.VITE_RUB_TO_IDR_RATE) || 195
    const convertedPrice = (parseFloat(account.price) || 0) * RUB_TO_IDR

    addToCart({
      id: account.item_id || account.id,
      title: `Minecraft Account - ${account.title || account.minecraft_nickname || 'Unknown'}`,
      price: Math.round(convertedPrice),
      currency: 'IDR',
      type: 'minecraft',
      account: account
    })
  }

  const handleClick = () => {
    // Add any click tracking here if needed
  }

  // Format price - Convert RUB to IDR for display
  const price = parseFloat(account.price) || 0
  const RUB_TO_IDR = parseFloat(import.meta.env.VITE_RUB_TO_IDR_RATE) || 195 // 1 RUB = 195 IDR

  // Convert price from RUB to IDR (API always returns RUB)
  const displayPrice = price * RUB_TO_IDR

  const formattedPrice =
    displayPrice > 0 ? `Rp ${Math.round(displayPrice).toLocaleString('id-ID')}` : 'Free'

  // Convert to USD (approximate)
  const exchangeRate = 0.000066 // 1 IDR ≈ 0.000066 USD
  const priceUSD = displayPrice * exchangeRate
  const formatUSD = amount => amount.toFixed(2)

  // Get warranty info (standard for Minecraft accounts)
  const getWarrantyInfo = () => {
    return '24h Warranty'
  }

  // Format Minecraft editions text
  const getMinecraftEditions = () => {
    const editions = []
    if (account.minecraft_java) editions.push('Java')
    if (account.minecraft_bedrock) editions.push('Bedrock')
    if (account.minecraft_dungeons) editions.push('Dungeons')
    if (account.minecraft_legends) editions.push('Legends')

    if (editions.length === 0) return 'Edition Unknown'
    return editions.join(' & ')
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
          <div className='w-2 h-2 bg-green-400 rounded-full'></div>
          <span className='text-sm text-gray-300 font-medium'>Minecraft Account</span>
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
          <div className='flex items-center space-x-1 bg-yellow-900 bg-opacity-50 px-2 py-1 rounded-lg border border-yellow-700'>
            <Icon icon='mdi:shield-check' className='text-yellow-400 text-sm' />
            <span className='text-yellow-400 text-xs font-medium'>{getWarrantyInfo()}</span>
          </div>
        </div>

        {/* Account Title/Nickname */}
        <div className='space-y-2'>
          <div className='text-lg font-semibold text-white flex items-center'>
            <Icon icon='mdi:minecraft' className='text-green-500 mr-2' />
            {account.minecraft_nickname || account.title || 'Minecraft Account'}
            {account.minecraft_can_change_nickname && (
              <Icon
                icon='mdi:pencil'
                className='text-gray-400 ml-2 text-sm'
                title='Nickname can be changed'
              />
            )}
          </div>
        </div>

        {/* Minecraft Details */}
        <div className='space-y-2'>
          {/* Editions */}
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-400'>Editions:</span>
            <span className='text-green-400 font-medium'>{getMinecraftEditions()}</span>
          </div>

          {/* Premium Status */}
          {account.minecraft_premium !== undefined && (
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-400'>Premium:</span>
              <span
                className={`font-medium ${account.minecraft_premium ? 'text-green-400' : 'text-red-400'}`}
              >
                {account.minecraft_premium ? 'Yes' : 'No'}
              </span>
            </div>
          )}

          {/* Capes */}
          {account.minecraft_capes_count > 0 && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-400'>Capes:</span>
                <span className='text-purple-400 font-medium'>{account.minecraft_capes_count}</span>
              </div>

              {/* Cape Images */}
              {account.minecraft_capes && account.minecraft_capes.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                  {account.minecraft_capes.slice(0, 4).map((cape, index) => (
                    <img
                      key={index}
                      src={`/data/capes/${cape}.png`}
                      alt={cape}
                      title={`${cape} Cape`}
                      className='h-6 w-6 rounded border border-gray-600 object-cover'
                      onError={e => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ))}
                  {account.minecraft_capes.length > 4 && (
                    <span className='text-xs text-gray-400 flex items-center'>
                      +{account.minecraft_capes.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Gamepass */}
          {account.hasGamepass && account.minecraft_subscription_expiry && (
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-400'>Gamepass:</span>
              <span className='text-blue-400 font-medium'>
                Until {account.minecraft_subscription_expiry}
              </span>
            </div>
          )}

          {/* Security Status */}
          {account.can_change_details !== undefined && (
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-400'>Security:</span>
              <span
                className={`font-medium ${account.can_change_details ? 'text-green-400' : 'text-red-400'}`}
              >
                {account.can_change_details ? 'Changeable' : 'Protected'}
              </span>
            </div>
          )}

          {/* Last Activity */}
          {account.minecraft_last_activity && (
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-400'>Last Activity:</span>
              <span className='text-gray-300'>{account.minecraft_last_activity}</span>
            </div>
          )}
        </div>

        {/* Hypixel Stats */}
        {(account.hypixel_level ||
          account.hypixel_achievements ||
          account.hypixel_last_login ||
          account.hypixel_ban === false) && (
          <div className='space-y-2'>
            <div className='text-xs text-gray-400 font-medium'>Hypixel Stats:</div>

            {/* Hypixel Ban Status */}
            {account.hypixel_ban === false && (
              <div className='flex items-center space-x-1 bg-green-900 bg-opacity-50 px-2 py-1 rounded-lg border border-green-700'>
                <Icon icon='mdi:shield-check' className='text-green-400 text-xs' />
                <span className='text-green-400 text-xs font-medium'>No Hypixel Ban</span>
              </div>
            )}

            {/* Hypixel Level */}
            {account.hypixel_level && (
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-400'>Level:</span>
                <span className='text-blue-400 font-medium'>{account.hypixel_level}</span>
              </div>
            )}

            {/* Hypixel Achievements */}
            {account.hypixel_achievements && (
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-400'>Achievements:</span>
                <span className='text-yellow-400 font-medium'>{account.hypixel_achievements}</span>
              </div>
            )}

            {/* Hypixel Last Login */}
            {account.hypixel_last_login && (
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-400'>Last Login:</span>
                <span className='text-gray-300'>{account.hypixel_last_login}</span>
              </div>
            )}
          </div>
        )}

        {/* Security Warning */}
        {account.security_change_date && (
          <div className='bg-red-900 bg-opacity-50 border border-red-700 p-2 rounded-lg'>
            <div className='flex items-center space-x-1 text-red-400 text-xs font-medium'>
              <Icon icon='mdi:alert-circle' className='text-sm' />
              <span>Security Change Pending</span>
            </div>
            <div className='text-red-300 text-xs mt-1'>On {account.security_change_date}</div>
          </div>
        )}

        {/* Account Origin */}
        {account.origin && (
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-400'>Origin:</span>
            <span className='text-gray-300 capitalize'>{account.origin}</span>
          </div>
        )}

        {/* Seller Info */}
        {account.seller_last_seen && (
          <div className='flex items-center text-xs text-gray-500'>
            <Icon icon='mdi:account-clock' className='mr-1' />
            Seller last seen: {account.seller_last_seen}
          </div>
        )}
      </div>

      {/* Footer with Add to Cart */}
      <div className='p-4 pt-2 mt-auto border-t border-gray-700'>
        <button
          onClick={handleAddToCart}
          className='w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2'
        >
          <Icon icon='mdi:cart-plus' className='text-lg' />
          <span>Tambah ke Keranjang</span>
        </button>
      </div>
    </Link>
  )
}

export default MinecraftAccountCard
