import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { convertToIDR, formatCurrency, formatUSD, getPriceValue } from '../utils/currency'

const FortniteAccountCard = ({ account }) => {
  // 🚨 DEBUG - Raw account data from LZT Market

  // Get formatted price in IDR
  const priceUSD = getPriceValue(account.price)
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

  // Get warning color class based on last seen - using REAL LZT Market API
  const getLastSeenWarning = () => {
    const lastActivity = account.fortnite_last_activity

    if (!lastActivity) {
      return 'warn-red' // No activity data = inactive
    }

    // Handle Unix timestamp from LZT Market API
    const lastSeen = new Date(lastActivity * 1000)
    const now = new Date()
    const daysDiff = (now - lastSeen) / (1000 * 60 * 60 * 24)

    if (daysDiff <= 1) return 'warn-green'
    if (daysDiff <= 7) return 'warn-yellow'
    if (daysDiff <= 30) return 'warn-orange'
    return 'warn-red'
  }

  // Format relative time for "Last seen"
  const formatRelativeTime = timestamp => {
    if (!timestamp) return 'Activity data unavailable'

    const dateObj = new Date(timestamp * 1000)
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

  // Format cosmetics count - using REAL LZT Market API counts
  const formatCosmeticsCount = () => {
    // Use the actual array lengths from LZT Market API (more accurate than count fields)
    const skinsCount = account.fortniteSkins?.length || 0
    const pickaxesCount = account.fortnitePickaxe?.length || 0
    const emotesCount = account.fortniteDance?.length || 0
    const glidersCount = account.fortniteGliders?.length || 0

    return skinsCount + pickaxesCount + emotesCount + glidersCount
  }

  // Get top cosmetics to display - using REAL LZT Market API structure
  const getTopCosmetics = () => {
    const cosmetics = []

    // Use the ACTUAL LZT Market API field names from the real response
    const skins = account.fortniteSkins || []
    const pickaxes = account.fortnitePickaxe || []
    const emotes = account.fortniteDance || []
    const gliders = account.fortniteGliders || []

    // Combine all cosmetics with proper priority (mix types for better display)
    const allCosmetics = []

    // Add all cosmetics with their actual data from API
    skins.forEach((skin, index) => {
      allCosmetics.push({
        name: skin.title || skin.name || 'Unknown Skin',
        type: 'Skin',
        rarity: skin.rarity || 'common',
        image: `https://fortnite-api.com/images/cosmetics/br/${skin.id}/smallicon.png`,
        from_shop: skin.from_shop,
        shop_price: skin.shop_price,
        cosmetic_id: skin.id,
        priority: 1 // Skins have highest priority
      })
    })

    pickaxes.forEach((pickaxe, index) => {
      allCosmetics.push({
        name: pickaxe.title || pickaxe.name || 'Unknown Pickaxe',
        type: 'Pickaxe',
        rarity: pickaxe.rarity || 'common',
        image: `https://fortnite-api.com/images/cosmetics/br/${pickaxe.id}/smallicon.png`,
        from_shop: pickaxe.from_shop,
        shop_price: pickaxe.shop_price,
        cosmetic_id: pickaxe.id,
        priority: 2
      })
    })

    emotes.forEach((emote, index) => {
      allCosmetics.push({
        name: emote.title || emote.name || 'Unknown Emote',
        type: 'Emote',
        rarity: emote.rarity || 'common',
        image: `https://fortnite-api.com/images/cosmetics/br/${emote.id}/smallicon.png`,
        from_shop: emote.from_shop,
        shop_price: emote.shop_price,
        cosmetic_id: emote.id,
        priority: 3
      })
    })

    gliders.forEach((glider, index) => {
      allCosmetics.push({
        name: glider.title || glider.name || 'Unknown Glider',
        type: 'Glider',
        rarity: glider.rarity || 'common',
        image: `https://fortnite-api.com/images/cosmetics/br/${glider.id}/smallicon.png`,
        from_shop: glider.from_shop,
        shop_price: glider.shop_price,
        cosmetic_id: glider.id,
        priority: 4
      })
    })

    // Sort by rarity priority then by type priority for better display
    const rarityOrder = { legendary: 1, epic: 2, rare: 3, uncommon: 4, common: 5 }
    allCosmetics.sort((a, b) => {
      const rarityA = rarityOrder[a.rarity.toLowerCase()] || 5
      const rarityB = rarityOrder[b.rarity.toLowerCase()] || 5
      if (rarityA !== rarityB) return rarityA - rarityB
      return a.priority - b.priority
    })

    // Take the top 4 cosmetics for display
    cosmetics.push(...allCosmetics.slice(0, 4))

    // If no cosmetics found, show defaults (this shouldn't happen with real API data)
    if (cosmetics.length === 0) {
      cosmetics.push({
        name: 'No Cosmetics',
        type: 'Default',
        rarity: 'Common',
        image: null
      })
    }

    return cosmetics.slice(0, 4)
  }

  const topCosmetics = getTopCosmetics()
  const totalCosmetics = formatCosmeticsCount()
  const lastSeenClass = getLastSeenWarning()

  // Debug each cosmetic to find the "00" source
  if (topCosmetics.length > 0) {
    topCosmetics.forEach((cosmetic, index) => {})
  }

  return (
    <Link
      to='/acc'
      state={{ account }}
      className='account bg-gray-900 border border-gray-700 hover:border-purple-500 transition-all duration-300 rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl flex flex-col min-h-[400px]'
    >
      {/* Header with Status and Price */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-700'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-purple-400 rounded-full'></div>
          <span className='text-sm text-gray-300 font-medium'>Fortnite Account</span>
        </div>
        <div className='price-badge'>
          <div className='text-right'>
            <div className='text-xl font-bold text-purple-400'>{formattedPrice}</div>
            <div className='text-xs text-gray-400 mt-0.5'>{formatUSD(priceUSD)}</div>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className='p-4 space-y-3 flex-1'>
        {/* Account Features */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            {/* Email Access */}
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

        {/* Last Seen */}
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg border ${
            lastSeenClass === 'warn-green'
              ? 'bg-green-900 bg-opacity-30 border-green-700'
              : lastSeenClass === 'warn-yellow'
                ? 'bg-yellow-900 bg-opacity-30 border-yellow-700'
                : lastSeenClass === 'warn-orange'
                  ? 'bg-orange-900 bg-opacity-30 border-orange-700'
                  : 'bg-red-900 bg-opacity-30 border-red-700'
          }`}
        >
          <Icon
            icon='mdi:clock-outline'
            className={`text-sm ${
              lastSeenClass === 'warn-green'
                ? 'text-green-400'
                : lastSeenClass === 'warn-yellow'
                  ? 'text-yellow-400'
                  : lastSeenClass === 'warn-orange'
                    ? 'text-orange-400'
                    : 'text-red-400'
            }`}
          />
          <span
            className={`text-xs font-medium ${
              lastSeenClass === 'warn-green'
                ? 'text-green-400'
                : lastSeenClass === 'warn-yellow'
                  ? 'text-yellow-400'
                  : lastSeenClass === 'warn-orange'
                    ? 'text-orange-400'
                    : 'text-red-400'
            }`}
          >
            {formatRelativeTime(account.fortnite_last_activity)}
          </span>
        </div>

        {/* Stats Grid - using REAL LZT Market API fields */}
        <div className='grid grid-cols-3 gap-2'>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-purple-400 font-bold text-sm'>{account.fortnite_level || 0}</div>
            <div className='text-gray-400 text-xs'>Level</div>
          </div>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-yellow-400 font-bold text-sm'>
              {(account.fortnite_balance || 0).toLocaleString()}
            </div>
            <div className='text-gray-400 text-xs'>V-Bucks</div>
          </div>
          <div className='bg-gray-800 p-2 rounded-lg border border-gray-600 text-center'>
            <div className='text-green-400 font-bold text-sm'>
              {account.fortnite_lifetime_wins || 0}
            </div>
            <div className='text-gray-400 text-xs'>Wins</div>
          </div>
        </div>

        {/* Cosmetics Section */}
        <div className='cosmetics-section'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-300 text-sm font-medium flex items-center space-x-1'>
              <Icon icon='mdi:tshirt-crew' className='text-purple-400' />
              <span>Cosmetics ({totalCosmetics})</span>
            </span>
          </div>

          <div className='space-y-2'>
            {topCosmetics.map((cosmetic, index) => {
              // Debug: Log cosmetic data to see what might be causing "00"
              if (cosmetic.name === 'Summer Sail Shark') {
              }

              return (
                <div
                  key={index}
                  className='flex items-center bg-gray-800 p-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors'
                >
                  <div className='w-6 h-6 rounded mr-3 flex-shrink-0 flex items-center justify-center bg-gray-700'>
                    {cosmetic.image ? (
                      <img
                        alt={cosmetic.name}
                        className='w-6 h-6 rounded object-cover'
                        src={cosmetic.image}
                        onError={e => {
                          // Fallback to emoji if Fortnite API image fails
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      className='w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-gray-400 text-sm font-bold'
                      style={{ display: cosmetic.image ? 'none' : 'flex' }}
                    >
                      {cosmetic.type === 'Skin'
                        ? '👤'
                        : cosmetic.type === 'Pickaxe'
                          ? '⚒️'
                          : cosmetic.type === 'Emote'
                            ? '💃'
                            : '🪂'}
                    </div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div
                      className='text-xs text-gray-300 hover:text-white cursor-help truncate font-medium'
                      title={`${cosmetic.name} (ID: ${cosmetic.cosmetic_id || 'N/A'})`}
                    >
                      {cosmetic.name}
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-xs text-gray-500'>{cosmetic.type}</span>
                      {cosmetic.rarity && (
                        <span
                          className={`text-xs px-1 py-0.5 rounded text-white ${
                            cosmetic.rarity.toLowerCase() === 'legendary'
                              ? 'bg-orange-600'
                              : cosmetic.rarity.toLowerCase() === 'epic'
                                ? 'bg-purple-600'
                                : cosmetic.rarity.toLowerCase() === 'rare'
                                  ? 'bg-blue-600'
                                  : cosmetic.rarity.toLowerCase() === 'uncommon'
                                    ? 'bg-green-600'
                                    : 'bg-gray-600'
                          }`}
                        >
                          {cosmetic.rarity.charAt(0).toUpperCase() +
                            cosmetic.rarity.slice(1).toLowerCase()}
                        </span>
                      )}
                      {cosmetic.from_shop === true && (
                        <span className='text-xs text-yellow-400'>Shop</span>
                      )}
                      {/* Temporarily disabled to debug "00" issue
                    {cosmetic.shop_price && parseInt(cosmetic.shop_price) > 0 && (
                      <span className="text-xs text-green-400">{cosmetic.shop_price}V</span>
                    )}
                    */}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {totalCosmetics > 4 && (
            <div className='mt-2 text-center'>
              <span
                className='inline-flex items-center space-x-1 text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-lg border border-gray-600 cursor-help hover:border-gray-500 transition-colors'
                title='Click to view all cosmetics'
              >
                <Icon icon='mdi:plus' className='text-xs' />
                <span>{totalCosmetics - 4} more cosmetics</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className='bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center justify-between text-xs mt-auto'>
        <div className='flex items-center space-x-2'>
          <Icon icon='simple-icons:epicgames' className='text-purple-400' />
          <span className='text-gray-400'>Fortnite</span>
        </div>
        <div className='flex items-center space-x-2 text-gray-400'>
          <time className='hover:text-gray-300'>
            {formatRelativeTime(
              account.published_date || account.created_at || account.upload_date
            )}
          </time>
        </div>
      </div>

      {/* Hover Effect */}
      <div className='absolute inset-0 bg-gradient-to-r from-transparent to-purple-900 opacity-0 hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-xl'></div>
    </Link>
  )
}

export default FortniteAccountCard
