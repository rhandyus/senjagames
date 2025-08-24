import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/currency'

const GenericAccountCard = ({ account, category, platform }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const handleViewDetails = () => {
    navigate(`/account?id=${account.item_id}&category=${category}`, {
      state: { account }
    })
  }

  const handleAddToCart = e => {
    e.stopPropagation()
    addToCart(account)
  }

  const getPlatformIcon = () => {
    const platformIcons = {
      Discord: 'logos:discord-icon',
      Telegram: 'logos:telegram',
      Instagram: 'skill-icons:instagram',
      TikTok: 'logos:tiktok-icon',
      Minecraft: 'vscode-icons:file-type-minecraft',
      Roblox: 'simple-icons:roblox',
      'Battle.Net': 'simple-icons:battlenet',
      ChatGPT: 'simple-icons:openai',
      VPN: 'mdi:vpn',
      'War Thunder': 'mdi:airplane',
      Uplay: 'simple-icons:ubisoft',
      'Social Club': 'simple-icons:rockstargames',
      'Escape From Tarkov': 'mdi:gun',
      'Epic Games': 'simple-icons:epicgames',
      Gifts: 'mdi:gift',
      'World of Tanks': 'mdi:tank',
      'World of Tanks Blitz': 'mdi:tank',
      Supercell: 'simple-icons:supercell'
    }
    return platformIcons[platform] || 'mdi:account-circle'
  }

  const getPlatformColor = () => {
    const platformColors = {
      Discord: '#5865F2',
      Telegram: '#0088CC',
      Instagram: '#E4405F',
      TikTok: '#000000',
      Minecraft: '#62B47A',
      Roblox: '#00A2FF',
      'Battle.Net': '#00AEFF',
      ChatGPT: '#10A37F',
      VPN: '#4CAF50',
      'War Thunder': '#FF6B35',
      Uplay: '#0084FF',
      'Social Club': '#F4B942',
      'Escape From Tarkov': '#C1936A',
      'Epic Games': '#313131',
      Gifts: '#FF6B6B',
      'World of Tanks': '#CD7F32',
      'World of Tanks Blitz': '#FFD700',
      Supercell: '#FFD700'
    }
    return platformColors[platform] || '#6B46C1'
  }

  const getAccountTitle = () => {
    if (account.title) return account.title
    if (account.description) return account.description
    return `${platform} Account`
  }

  const getAccountDetails = () => {
    const details = []

    if (account.email) details.push(`Email: ${account.email}`)
    if (account.username) details.push(`Username: ${account.username}`)
    if (account.level) details.push(`Level: ${account.level}`)
    if (account.followers) details.push(`Followers: ${account.followers}`)
    if (account.subscribers) details.push(`Subscribers: ${account.subscribers}`)
    if (account.games && Array.isArray(account.games)) {
      details.push(`Games: ${account.games.length}`)
    }

    return details.slice(0, 3) // Show max 3 details
  }

  return (
    <div
      className='bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group overflow-hidden'
      onClick={handleViewDetails}
    >
      {/* Header */}
      <div
        className='p-4 bg-gradient-to-r from-gray-800 to-gray-700'
        style={{
          background: `linear-gradient(135deg, ${getPlatformColor()}20, ${getPlatformColor()}10)`
        }}
      >
        <div className='flex items-center justify-between mb-3'>
          <div
            className='p-2 rounded-lg flex items-center justify-center'
            style={{ backgroundColor: `${getPlatformColor()}20` }}
          >
            <Icon
              icon={getPlatformIcon()}
              className='w-6 h-6'
              style={{ color: getPlatformColor() }}
            />
          </div>
          <div className='text-right'>
            <div className='text-2xl font-bold text-white'>
              {formatCurrency(account.price || 0)}
            </div>
            <div className='text-xs text-gray-400'>USD</div>
          </div>
        </div>

        <h3 className='text-lg font-semibold text-white mb-1 line-clamp-2'>{getAccountTitle()}</h3>
        <div className='text-sm text-gray-300'>{platform}</div>
      </div>

      {/* Content */}
      <div className='p-4'>
        {/* Account Details */}
        <div className='space-y-2 mb-4'>
          {getAccountDetails().map((detail, index) => (
            <div key={index} className='text-sm text-gray-300 flex items-center'>
              <Icon icon='mdi:check-circle' className='w-4 h-4 text-green-400 mr-2' />
              {detail}
            </div>
          ))}
        </div>

        {/* Security Features */}
        <div className='flex flex-wrap gap-2 mb-4'>
          {account.email_changeable && (
            <span className='px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full border border-green-500/30'>
              Email Changeable
            </span>
          )}
          {account.warranty && (
            <span className='px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full border border-blue-500/30'>
              Warranty
            </span>
          )}
          {account.guarantee && (
            <span className='px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded-full border border-purple-500/30'>
              Guarantee
            </span>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleAddToCart}
          className='w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center group-hover:bg-purple-500'
        >
          <Icon icon='mdi:cart-plus' className='w-5 h-5 mr-2' />
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default GenericAccountCard
