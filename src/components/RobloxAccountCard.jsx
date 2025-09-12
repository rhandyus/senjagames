import { Link } from 'react-router-dom'

const RobloxAccountCard = ({ account }) => {
  // Filter out brute/resale information from display
  const cleanAccountData = (account) => {
    const cleaned = { ...account }
    
    // Remove or filter out brute/resale related fields from any text fields
    const cleanText = (text) => {
      if (!text) return text
      return text
        .replace(/\(brute\)/gi, '')
        .replace(/\(resale\)/gi, '')
        .replace(/resale/gi, '')
        .replace(/brute/gi, '')
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim()
    }
    
    // Clean various text fields
    if (cleaned.description) cleaned.description = cleanText(cleaned.description)
    if (cleaned.title) cleaned.title = cleanText(cleaned.title)
    if (cleaned.category) cleaned.category = cleanText(cleaned.category)
    if (cleaned.subcategory) cleaned.subcategory = cleanText(cleaned.subcategory)
    
    // Remove brute/resale from any tags or categories
    if (cleaned.tags) {
      cleaned.tags = cleaned.tags.filter(tag => 
        !tag.toLowerCase().includes('brute') && 
        !tag.toLowerCase().includes('resale')
      )
    }
    
    // Clean any other potential fields
    if (cleaned.type) cleaned.type = cleanText(cleaned.type)
    if (cleaned.subtype) cleaned.subtype = cleanText(cleaned.subtype)
    
    // Hide origin information (resale/brute indicators)
    delete cleaned.item_origin
    delete cleaned.resale_item_origin
    
    return cleaned
  }
  
  const cleanAccount = cleanAccountData(account)

  // Indonesian currency formatting
  const formatPrice = usdPrice => {
    const price = parseFloat(usdPrice || 0)
    const idrPrice = Math.max(1000, Math.round(price * 15500))

    return {
      idr: new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(idrPrice),
      usd: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price)
    }
  }

  const getRobloxIcon = () => {
    // Steam-like Roblox icon
    return (
      <svg viewBox='0 0 24 24' className='w-6 h-6 text-red-400' fill='currentColor'>
        <path d='M12 2L2 2v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V2h-8zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z' />
      </svg>
    )
  }

  const handleCardClick = () => {
    console.log('� Roblox Card clicked (view details):', account)
  }

  // Handle seller object properly
  const getSeller = () => {
    if (account.seller && typeof account.seller === 'object') {
      return account.seller.username || account.seller.display_name || 'Unknown Seller'
    }
    if (account.vendor && typeof account.vendor === 'object') {
      return account.vendor.username || account.vendor.display_name || 'Unknown Seller'
    }
    return account.seller || account.vendor || 'Unknown'
  }

  const price = cleanAccount.price || 0
  const formattedPrice = formatPrice(price)
  const seller = getSeller()
  const robux = cleanAccount.roblox_robux || cleanAccount.robux || cleanAccount.balance || 0

  return (
    <Link
      to={`/acc/?id=${account.item_id || account.id}`}
      state={{ account: account }}
      className='account bg-gray-900 border border-gray-700 hover:border-red-500/50 rounded-xl overflow-hidden relative shadow-lg transition-all duration-300 hover:shadow-red-500/10 flex flex-col min-h-[380px] group cursor-pointer transform hover:scale-[1.02]'
    >
      {/* Header - Steam-like design */}
      <div className='bg-gradient-to-r from-gray-800 to-red-900/20 px-4 py-3 border-b border-gray-700'>
        <div className='flex justify-between items-start'>
          <div className='flex items-center space-x-2'>
            <div className='w-2 h-2 bg-red-400 rounded-full animate-pulse'></div>
            {getRobloxIcon()}
            <span className='text-red-400 font-semibold text-sm tracking-wide'>ROBLOX</span>
          </div>
          <div className='text-xs text-gray-400'>#{account.item_id || 'N/A'}</div>
        </div>
      </div>

      {/* Content Area */}
      <div className='flex-1 p-4 flex flex-col justify-between'>
        {/* Account Info - No Title */}
        <div className='mb-3'>
          {/* Account Info Badges */}
          <div className='flex flex-wrap gap-2 mt-2'>
            {robux > 0 && (
              <span className='inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-800/30 text-green-400 border border-green-800/50'>
                💰 {robux.toLocaleString()} R$
              </span>
            )}
            {(cleanAccount.roblox_subscription || cleanAccount.premium) && (
              <span className='inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-800/30 text-yellow-400 border border-yellow-800/50'>
                ⭐ Premium
              </span>
            )}
            {cleanAccount.roblox_verified === 1 && (
              <span className='inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-800/30 text-blue-400 border border-blue-800/50'>
                ✓ Verified
              </span>
            )}
            {(cleanAccount.roblox_limited_price > 0 || cleanAccount.has_limiteds) && (
              <span className='inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-800/30 text-orange-400 border border-orange-800/50'>
                💎 Limiteds
              </span>
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className='space-y-3 text-sm mb-4'>
          {/* Email Status */}
          {(cleanAccount.email_type || cleanAccount.roblox_email_verified !== undefined) && (
            <div className='flex items-center justify-between p-2 bg-gray-800/40 rounded-lg border border-gray-700'>
              <div className='flex items-center space-x-2'>
                <div className={`w-3 h-3 rounded-full ${
                  cleanAccount.roblox_email_verified === 1 || cleanAccount.email_type?.toLowerCase().includes('confirmed') 
                    ? 'bg-green-400' : 'bg-yellow-400'
                } animate-pulse`}></div>
                <span className={`text-sm font-medium ${
                  cleanAccount.roblox_email_verified === 1 || cleanAccount.email_type?.toLowerCase().includes('confirmed') 
                    ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {cleanAccount.roblox_email_verified === 1 ? 'Verified Mail' : 
                   cleanAccount.email_type || 'Unconfirmed Mail'}
                </span>
              </div>
              <i className={`fas fa-thumbs-${
                cleanAccount.roblox_email_verified === 1 || cleanAccount.email_type?.toLowerCase().includes('confirmed') 
                  ? 'up text-green-400' : 'up text-yellow-400'
              }`}></i>
            </div>
          )}

          {/* Country */}
          {cleanAccount.roblox_country && (
            <div className='flex justify-center'>
              <div className='px-3 py-2 bg-gray-800/40 border border-gray-700 rounded-lg'>
                <span className='text-gray-300 font-bold text-lg'>{cleanAccount.roblox_country}</span>
              </div>
            </div>
          )}

          {/* Games Container - Inventory and Friends */}
          <div className='space-y-2'>
            {(cleanAccount.roblox_inventory_price > 0 || cleanAccount.roblox_limited_price > 0) && (
              <div className='px-3 py-2 bg-gray-800/30 border border-gray-700 rounded text-center'>
                <span className='text-gray-300 text-sm'>
                  Inventory value ~ {cleanAccount.roblox_inventory_price || cleanAccount.roblox_limited_price}
                </span>
              </div>
            )}
            {cleanAccount.roblox_friends !== undefined && cleanAccount.roblox_friends >= 0 && (
              <div className='px-3 py-2 bg-gray-800/30 border border-gray-700 rounded text-center'>
                <span className='text-gray-300 text-sm'>{cleanAccount.roblox_friends} Friends</span>
              </div>
            )}
          </div>

          {/* Additional Info */}
          {cleanAccount.roblox_register_date && (
            <div className='flex justify-between text-xs text-gray-400 pt-2 border-t border-gray-700'>
              <span>Created:</span>
              <span>{new Date(cleanAccount.roblox_register_date * 1000).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className='mt-auto'>
          <div className='bg-gray-800/50 rounded-lg p-3 border border-gray-700'>
            <div className='text-red-400 text-lg font-bold'>{formattedPrice.idr}</div>
            <div className='text-gray-400 text-xs'>≈ {formattedPrice.usd}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='px-4 py-3 bg-gray-800/30 border-t border-gray-700'>
        <div className='flex justify-between items-center text-xs text-gray-400'>
          <div className='flex items-center space-x-2'>
            <img src='/data/assets/category/31.svg' alt='Roblox' className='w-4 h-4 opacity-70'/>
            {cleanAccount.published_date && (
              <time className='text-gray-400'>
                {new Date(cleanAccount.published_date * 1000).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            )}
          </div>
          <div className='text-red-400 font-medium'>View Details</div>
        </div>
      </div>
    </Link>
  )
}

export default RobloxAccountCard
