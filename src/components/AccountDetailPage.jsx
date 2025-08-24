import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import ZelenkaAPI from '../services/zelenkaAPI'
import { convertToIDR, formatCurrency, formatUSD, getPriceValue } from '../utils/currency'
import CartModal from './CartModal'
import PaymentModal from './PaymentModal'

const AccountDetailPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart, totalItems } = useCart()
  const { user } = useAuth()
  const accountId = searchParams.get('id')

  // Get account data from location state (for Fortnite cards)
  const accountFromState = location.state?.account

  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, item: null })
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [cartModal, setCartModal] = useState(false)

  const api = new ZelenkaAPI()

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' })
    }, 3000)
  }

  // Handle add to cart with authentication check
  const handleAddToCart = () => {
    if (!user) {
      showToast('Silakan login terlebih dahulu untuk menambahkan item ke keranjang', 'warning')
      navigate('/login')
      return
    }

    const success = addToCart(account)
    if (success) {
      showToast('Akun berhasil ditambahkan ke keranjang!', 'success')
    } else {
      showToast('Akun sudah ada di keranjang Anda', 'warning')
    }
  }

  // Handle buy now with authentication check
  const handleBuyNow = () => {
    if (!user) {
      showToast('Silakan login terlebih dahulu untuk melakukan pembelian', 'warning')
      navigate('/login')
      return
    }

    setPaymentModal({ isOpen: true, item: account })
  }

  useEffect(() => {
    const fetchAccountDetails = async () => {
      setLoading(true)
      setError(null)

      try {
        // If we have account data from state (Steam, Epic, or Fortnite cards), use it directly
        if (accountFromState) {
          setAccount(accountFromState)
          setLoading(false)

          // Set appropriate default tab based on account type
          if (accountFromState.category_id === 9 || accountFromState.fortnite_level !== undefined) {
            setActiveTab('cosmetics')
          } else if (
            accountFromState.category_id === 7 ||
            accountFromState.category_id === 12 ||
            accountFromState.eg_games
          ) {
            setActiveTab('games') // Epic Games accounts should show games tab
          }
          return
        }

        // Fetch account details from API if we have an ID
        if (accountId) {
          const api = new zelenkaAPI()
          const accountData = await api.getAccountDetails(accountId)

          if (accountData) {
            setAccount(accountData)
          } else {
            setError(
              'Akun tidak ditemukan - silakan coba akun lain atau periksa apakah ID sudah benar'
            )
          }
        } else {
          setError('ID akun tidak tersedia')
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat detail akun')
      } finally {
        setLoading(false)
      }
    }

    fetchAccountDetails()
  }, [accountId, accountFromState])

  // Detect account platform type
  const getAccountPlatform = () => {
    if (!account) return 'Unknown'

    // Check for Gifts account indicators
    if (
      account.gifts_type ||
      account.gifts_service ||
      account.giftType ||
      account.giftService ||
      account.category_id === 30 ||
      account.platform === 'gifts'
    ) {
      return 'Gifts'
    }

    // Check for Epic Games account indicators
    if (
      account.eg_games ||
      account.category_id === 7 ||
      account.category_id === 12 ||
      account.eg_country ||
      account.epic_data
    ) {
      return 'Epic Games'
    }

    // Check for Fortnite account indicators
    if (
      account.fortnite_level !== undefined ||
      account.fortnite_platform ||
      account.fortniteSkins ||
      account.fortnitePickaxe ||
      account.fortniteDance ||
      account.fortniteGliders ||
      account.category_id === 9
    ) {
      return 'Fortnite'
    }

    // Check for Steam account indicators
    if (
      account.steam_level !== undefined ||
      account.steam_country ||
      account.steam_game_count !== undefined ||
      account.steam_mfa !== undefined
    ) {
      return 'Steam'
    }

    // Default fallback
    return 'Gaming Account'
  }

  // Get platform icon
  const getPlatformIcon = () => {
    const platform = getAccountPlatform()
    switch (platform) {
      case 'Gifts':
        return 'mdi:gift'
      case 'Epic Games':
        return 'simple-icons:epicgames'
      case 'Fortnite':
        return 'simple-icons:epicgames'
      case 'Steam':
        return 'simple-icons:steam'
      default:
        return 'mdi:gamepad-variant'
    }
  }

  // Get platform color
  const getPlatformColor = () => {
    const platform = getAccountPlatform()
    switch (platform) {
      case 'Gifts':
        return 'bg-purple-600'
      case 'Epic Games':
        return 'bg-slate-700'
      case 'Fortnite':
        return 'bg-purple-600'
      case 'Steam':
        return 'bg-blue-600'
      default:
        return 'bg-gray-600'
    }
  }
  const formatPrice = account => {
    if (!account) return 'N/A'

    const priceUSD = getPriceValue(account)
    const priceIDR = convertToIDR(priceUSD)
    return formatCurrency(priceIDR)
  }

  // Format date
  const formatDate = timestamp => {
    if (!timestamp) return 'Unknown'
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get account status color
  const getStatusColor = lastActivity => {
    if (!lastActivity) return 'text-red-400'

    const lastSeen =
      typeof lastActivity === 'number' ? new Date(lastActivity * 1000) : new Date(lastActivity)

    const now = new Date()
    const daysDiff = (now - lastSeen) / (1000 * 60 * 60 * 24)

    if (daysDiff > 365) return 'text-green-400'
    if (daysDiff > 30) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Format playtime
  const formatPlaytime = minutes => {
    if (!minutes) return '0h'
    const hours = Math.round(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.round(hours / 24)
    return `${days}d`
  }

  // Check if this is a Fortnite account
  const isFortniteAccount =
    account && (account.category_id === 9 || account.fortnite_level !== undefined)

  // Check if this is an Epic Games account
  const isEpicAccount =
    account && (account.category_id === 7 || account.category_id === 12 || account.eg_games)

  // Generate Fortnite cosmetics for display using real LZT Market API structure
  const generateFortniteCosmetics = () => {
    if (!account) return []

    const cosmetics = []

    // Use the ACTUAL LZT Market API field names from real response
    const skins = account.fortniteSkins || []
    const pickaxes = account.fortnitePickaxe || []
    const emotes = account.fortniteDance || []
    const gliders = account.fortniteGliders || []

    // Process skins from real API structure
    skins.forEach((skin, index) => {
      cosmetics.push({
        name: skin.title || skin.name || 'Unknown Skin',
        type: 'Skin',
        rarity: skin.rarity || 'common',
        image: `https://fortnite-api.com/images/cosmetics/br/${skin.id}/smallicon.png`,
        description: skin.description || `${skin.rarity || 'Epic'} skin from Fortnite`,
        from_shop: skin.from_shop,
        shop_price: skin.shop_price,
        cosmetic_id: skin.id,
        raw_data: skin
      })
    })

    // Process pickaxes from real API structure
    pickaxes.forEach((pickaxe, index) => {
      cosmetics.push({
        name: pickaxe.title || pickaxe.name || 'Unknown Pickaxe',
        type: 'Pickaxe',
        rarity: pickaxe.rarity || 'common',
        image: `https://fortnite-api.com/images/cosmetics/br/${pickaxe.id}/smallicon.png`,
        description: pickaxe.description || `${pickaxe.rarity || 'Standard'} harvesting tool`,
        from_shop: pickaxe.from_shop,
        shop_price: pickaxe.shop_price,
        cosmetic_id: pickaxe.id,
        raw_data: pickaxe
      })
    })

    // Process emotes from real API structure
    emotes.forEach((emote, index) => {
      cosmetics.push({
        name: emote.title || emote.name || 'Unknown Emote',
        type: 'Emote',
        rarity: emote.rarity || 'common',
        image: `https://fortnite-api.com/images/cosmetics/br/${emote.id}/smallicon.png`,
        description: emote.description || `${emote.rarity || 'Fun'} emote to show off`,
        from_shop: emote.from_shop,
        shop_price: emote.shop_price,
        cosmetic_id: emote.id,
        raw_data: emote
      })
    })

    // Process gliders from real API structure
    gliders.forEach((glider, index) => {
      cosmetics.push({
        name: glider.title || glider.name || 'Unknown Glider',
        type: 'Glider',
        rarity: glider.rarity || 'common',
        image: `https://fortnite-api.com/images/cosmetics/br/${glider.id}/smallicon.png`,
        description:
          glider.description || `${glider.rarity || 'Standard'} glider for aerial deployment`,
        from_shop: glider.from_shop,
        shop_price: glider.shop_price,
        cosmetic_id: glider.id,
        raw_data: glider
      })
    })

    // Only show fallback cosmetics if NO real cosmetics found
    if (cosmetics.length === 0) {
      // Keep existing fallback logic here...
      const level = account.fortnite_level || account.level || 0
      const price = parseFloat(account.price || 0)

      // Generate cosmetics based on account value with real Fortnite API images
      const cosmeticTemplates = []

      if (price > 10 || level > 80) {
        // High-value account cosmetics - premium items
        cosmeticTemplates.push(
          {
            name: 'Polar Peely',
            type: 'Skin',
            rarity: 'Epic',
            image:
              'https://fortnite-api.com/images/cosmetics/br/cid_a_323_athena_commando_m_bananawinter/smallicon.png',
            description: 'The most feared outfit on the battlefield'
          },
          {
            name: 'First Order Stormtrooper',
            type: 'Skin',
            rarity: 'Epic',
            image:
              'https://fortnite-api.com/images/cosmetics/br/character_kernelruse/smallicon.png',
            description: 'Imperial forces tactical gear'
          },
          {
            name: 'Holly Hatchets',
            type: 'Pickaxe',
            rarity: 'Rare',
            image:
              'https://fortnite-api.com/images/cosmetics/br/pickaxe_id_731_scholarfestivefemale1h/smallicon.png',
            description: 'Festive harvesting tool'
          },
          {
            name: 'Snowplower',
            type: 'Pickaxe',
            rarity: 'Rare',
            image:
              'https://fortnite-api.com/images/cosmetics/br/pickaxe_id_732_shovelmale/smallicon.png',
            description: 'Clear the way'
          },
          {
            name: 'Choice Knit',
            type: 'Emote',
            rarity: 'Uncommon',
            image: 'https://fortnite-api.com/images/cosmetics/br/eid_epicyarn/smallicon.png',
            description: 'Celebrate your wins in style'
          },
          {
            name: 'Sentinel',
            type: 'Glider',
            rarity: 'Legendary',
            image:
              'https://fortnite-api.com/images/cosmetics/br/glider_id_335_logarithm_40qgl/smallicon.png',
            description: 'Dominate the skies with this legendary glider'
          },
          {
            name: 'Explorer Emilie',
            type: 'Skin',
            rarity: 'Epic',
            image:
              'https://fortnite-api.com/images/cosmetics/br/character_vitalinventorblock/smallicon.png',
            description: 'A battle-tested explorer outfit'
          },
          {
            name: 'Krisabelle',
            type: 'Skin',
            rarity: 'Rare',
            image:
              'https://fortnite-api.com/images/cosmetics/br/cid_a_310_athena_commando_f_scholarfestive/smallicon.png',
            description: 'Festive combat specialist'
          },
          {
            name: 'Crescent Shroom',
            type: 'Pickaxe',
            rarity: 'Rare',
            image:
              'https://fortnite-api.com/images/cosmetics/br/pickaxe_id_313_shiitakeshaolinmale/smallicon.png',
            description: 'Strike with the power of nature'
          },
          {
            name: 'Mr. Dappermint',
            type: 'Skin',
            rarity: 'Rare',
            image:
              'https://fortnite-api.com/images/cosmetics/br/cid_978_athena_commando_m_fancycandy/smallicon.png',
            description: 'Dapper holiday outfit'
          },
          {
            name: 'Dance Moves',
            type: 'Emote',
            rarity: 'Common',
            image: 'https://fortnite-api.com/images/cosmetics/br/eid_dancemoves/smallicon.png',
            description: 'The classic dance move'
          },
          {
            name: 'Nana-brella',
            type: 'Glider',
            rarity: 'Common',
            image: 'https://fortnite-api.com/images/cosmetics/br/umbrella_season_25/smallicon.png',
            description: 'A seasonal favorite'
          }
        )
      } else if (price > 5 || level > 40) {
        // Mid-value account cosmetics
        cosmeticTemplates.push(
          {
            name: 'Explorer Emilie',
            type: 'Skin',
            rarity: 'Epic',
            image:
              'https://fortnite-api.com/images/cosmetics/br/character_vitalinventorblock/smallicon.png',
            description: 'A skilled explorer outfit'
          },
          {
            name: 'Krisabelle',
            type: 'Skin',
            rarity: 'Rare',
            image:
              'https://fortnite-api.com/images/cosmetics/br/cid_a_310_athena_commando_f_scholarfestive/smallicon.png',
            description: 'Festive combat specialist'
          },
          {
            name: 'Crescent Shroom',
            type: 'Pickaxe',
            rarity: 'Rare',
            image:
              'https://fortnite-api.com/images/cosmetics/br/pickaxe_id_313_shiitakeshaolinmale/smallicon.png',
            description: 'Harvest with the power of nature'
          },
          {
            name: 'Default Pickaxe',
            type: 'Pickaxe',
            rarity: 'Common',
            image: 'https://fortnite-api.com/images/cosmetics/br/defaultpickaxe/smallicon.png',
            description: 'Standard harvesting tool'
          },
          {
            name: 'Dance Moves',
            type: 'Emote',
            rarity: 'Common',
            image: 'https://fortnite-api.com/images/cosmetics/br/eid_dancemoves/smallicon.png',
            description: 'Classic dance moves'
          },
          {
            name: 'Glider',
            type: 'Glider',
            rarity: 'Common',
            image: 'https://fortnite-api.com/images/cosmetics/br/defaultglider/smallicon.png',
            description: 'Standard glider'
          },
          {
            name: 'The Umbrella',
            type: 'Glider',
            rarity: 'Common',
            image: 'https://fortnite-api.com/images/cosmetics/br/solo_umbrella/smallicon.png',
            description: 'Victory reward umbrella'
          }
        )
      } else {
        // Basic account cosmetics
        cosmeticTemplates.push(
          {
            name: 'Mr. Dappermint',
            type: 'Skin',
            rarity: 'Rare',
            image:
              'https://fortnite-api.com/images/cosmetics/br/cid_978_athena_commando_m_fancycandy/smallicon.png',
            description: 'Basic dapper outfit'
          },
          {
            name: 'Default Pickaxe',
            type: 'Pickaxe',
            rarity: 'Common',
            image: 'https://fortnite-api.com/images/cosmetics/br/defaultpickaxe/smallicon.png',
            description: 'The standard harvesting tool'
          },
          {
            name: 'Dance Moves',
            type: 'Emote',
            rarity: 'Common',
            image: 'https://fortnite-api.com/images/cosmetics/br/eid_dancemoves/smallicon.png',
            description: 'The classic dance move'
          },
          {
            name: 'Glider',
            type: 'Glider',
            rarity: 'Common',
            image: 'https://fortnite-api.com/images/cosmetics/br/defaultglider/smallicon.png',
            description: 'A standard glider'
          },
          {
            name: 'The Umbrella',
            type: 'Glider',
            rarity: 'Common',
            image: 'https://fortnite-api.com/images/cosmetics/br/solo_umbrella/smallicon.png',
            description: 'Victory reward umbrella'
          }
        )
      }

      return cosmeticTemplates.slice(0, Math.min(16, cosmeticTemplates.length))
    }

    return cosmetics
  }

  // Get rarity color
  const getRarityColor = rarity => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'text-orange-400 bg-orange-900/20 border-orange-500/30'
      case 'mythic':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'
      case 'epic':
        return 'text-purple-400 bg-purple-900/20 border-purple-500/30'
      case 'rare':
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30'
      case 'uncommon':
        return 'text-green-400 bg-green-900/20 border-green-500/30'
      case 'common':
        return 'text-gray-400 bg-gray-900/20 border-gray-500/30'
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-500/30'
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-r from-black via-gray-900 to-black'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-700 rounded w-64 mb-6'></div>
            <div className='bg-gray-800 rounded-lg p-6'>
              <div className='h-64 bg-gray-700 rounded mb-4'></div>
              <div className='space-y-4'>
                <div className='h-4 bg-gray-700 rounded w-full'></div>
                <div className='h-4 bg-gray-700 rounded w-3/4'></div>
                <div className='h-4 bg-gray-700 rounded w-1/2'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-r from-black via-gray-900 to-black'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          <button
            onClick={() => navigate('/')}
            className='mb-6 flex items-center text-purple-400 hover:text-purple-300'
          >
            <Icon icon='mdi:arrow-left' className='mr-2' />
            Kembali ke Marketplace
          </button>
          <div className='bg-red-900 border border-red-700 text-red-100 px-6 py-8 rounded-lg text-center'>
            <Icon icon='mdi:alert-circle' className='text-4xl mb-4 mx-auto' />
            <h2 className='text-xl font-bold mb-2'>Akun Tidak Ditemukan</h2>
            <p className='mb-4'>{error}</p>
            <button
              onClick={() => navigate('/')}
              className='bg-red-700 text-white px-4 py-2 rounded hover:bg-red-600'
            >
              Kembali ke Marketplace
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className='min-h-screen bg-gradient-to-r from-black via-gray-900 to-black'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          <div className='text-center text-gray-400'>
            <p>Akun tidak ditemukan</p>
            <button
              onClick={() => navigate('/')}
              className='mt-4 text-purple-400 hover:text-purple-300'
            >
              Kembali ke Marketplace
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-r from-black via-gray-900 to-black'>
      {/* Header */}
      <header className='bg-gray-900/80 backdrop-blur-md border-b border-gray-800 shadow-xl'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => navigate('/')}
                className='flex items-center text-gray-300 hover:text-purple-400 transition-colors'
              >
                <Icon icon='mdi:arrow-left' className='mr-2 text-xl' />
                <span className='hidden sm:inline'>Kembali ke Marketplace</span>
                <span className='sm:hidden'>Kembali</span>
              </button>
              <div className='h-6 w-px bg-gray-700'></div>
              <Link
                to='/'
                className='text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition-all duration-200'
              >
                SenjaGames.id
              </Link>
            </div>

            {/* Cart Icon and User Status */}
            <div className='flex items-center space-x-4'>
              {/* User Status Indicator */}
              {user ? (
                <div className='flex items-center space-x-2 text-green-400 text-sm'>
                  <Icon icon='mdi:account-check' className='text-lg' />
                  <span className='hidden sm:inline'>Masuk sebagai {user.email}</span>
                  <span className='sm:hidden'>Masuk</span>
                </div>
              ) : (
                <div className='flex items-center space-x-2'>
                  <Link
                    to='/login'
                    className='flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 text-sm transition-colors'
                  >
                    <Icon icon='mdi:login' className='text-lg' />
                    <span className='hidden sm:inline'>Login untuk Membeli</span>
                    <span className='sm:hidden'>Login</span>
                  </Link>
                </div>
              )}

              <button
                onClick={() => setCartModal(true)}
                className='relative bg-gradient-to-r from-gray-700 to-gray-800 text-white p-2 sm:px-3 sm:py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg'
              >
                <Icon icon='mdi:shopping-cart' className='text-lg sm:text-xl' />
                {totalItems > 0 && (
                  <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 font-bold animate-pulse'>
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              <h1 className='text-lg font-bold text-white hidden sm:block'>Detail Akun</h1>
              <div className='text-sm text-gray-400'>ID: {accountId}</div>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Account Info */}
          <div className='lg:col-span-2'>
            <div className='bg-gray-900 rounded-lg border border-gray-700 overflow-hidden'>
              {/* Account Header */}
              <div className='p-6 border-b border-gray-700'>
                <div className='flex justify-between items-start mb-4'>
                  <div className='text-right'>
                    <div className='flex items-center space-x-2'>
                      {account.hasWarranty && (
                        <span className='bg-green-600 text-white text-xs px-2 py-1 rounded'>
                          {account.warranty} garansi
                        </span>
                      )}
                      <span
                        className={`text-white text-xs px-2 py-1 rounded flex items-center space-x-1 ${getPlatformColor()}`}
                      >
                        <Icon icon={getPlatformIcon()} className='text-sm' />
                        <span>{getAccountPlatform()}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Indicators - Platform Specific */}
                <div className='flex flex-wrap gap-2 mb-4'>
                  {getAccountPlatform() === 'Fortnite' ? (
                    // Fortnite-specific status indicators
                    <>
                      {account.fortnite_platform && (
                        <span className='text-xs px-3 py-1 rounded-full bg-purple-600 text-purple-100'>
                          🎮 {account.fortnite_platform}
                        </span>
                      )}
                      {account.fortnite_change_email !== undefined && (
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            account.fortnite_change_email
                              ? 'bg-green-600 text-green-100'
                              : 'bg-red-600 text-red-100'
                          }`}
                        >
                          {account.fortnite_change_email
                            ? '📧 Email Bisa Diubah'
                            : '🔒 Email Terkunci'}
                        </span>
                      )}
                      {account.fortnite_xbox_linkable !== undefined && (
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            account.fortnite_xbox_linkable
                              ? 'bg-green-600 text-green-100'
                              : 'bg-red-600 text-red-100'
                          }`}
                        >
                          {account.fortnite_xbox_linkable
                            ? '🎮 Xbox Bisa Dihubungkan'
                            : '❌ Xbox Terblokir'}
                        </span>
                      )}
                      {account.fortnite_psn_linkable !== undefined && (
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            account.fortnite_psn_linkable
                              ? 'bg-green-600 text-green-100'
                              : 'bg-red-600 text-red-100'
                          }`}
                        >
                          {account.fortnite_psn_linkable
                            ? '🎮 PSN Bisa Dihubungkan'
                            : '❌ PSN Terblokir'}
                        </span>
                      )}
                      {account.fortnite_refund_credits !== null &&
                        account.fortnite_refund_credits !== undefined && (
                          <span className='text-xs px-3 py-1 rounded-full bg-blue-600 text-blue-100'>
                            🎫 {account.fortnite_refund_credits} Refunds
                          </span>
                        )}
                    </>
                  ) : (
                    // Steam-specific status indicators (keep existing Steam logic)
                    <>
                      {account.steam_mfa !== undefined && (
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            account.steam_mfa
                              ? 'bg-green-600 text-green-100'
                              : 'bg-red-600 text-red-100'
                          }`}
                        >
                          {account.steam_mfa ? '🔒 2FA Enabled' : '⚠️ No 2FA'}
                        </span>
                      )}
                      {account.steam_is_limited !== undefined && (
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            !account.steam_is_limited
                              ? 'bg-green-600 text-green-100'
                              : 'bg-red-600 text-red-100'
                          }`}
                        >
                          {!account.steam_is_limited ? '✅ Unlimited' : '❌ Limited'}
                        </span>
                      )}
                      {account.steam_market !== undefined && (
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            account.steam_market
                              ? 'bg-green-600 text-green-100'
                              : 'bg-red-600 text-red-100'
                          }`}
                        >
                          {account.steam_market ? '🛒 Market Access' : '🚫 No Market'}
                        </span>
                      )}
                    </>
                  )}
                  {account.chineseAccount && (
                    <span className='text-xs px-3 py-1 rounded-full bg-yellow-600 text-yellow-100'>
                      🇨🇳 Chinese Account
                    </span>
                  )}
                </div>

                {/* Last Activity */}
                <div className='flex items-center space-x-4 text-sm'>
                  <span className='text-gray-400'>Last seen:</span>
                  <span
                    className={getStatusColor(account.account_last_activity || account.lastSeen)}
                  >
                    {formatDate(account.account_last_activity || account.lastSeen)}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className='border-b border-gray-700'>
                <nav className='flex space-x-8 px-6'>
                  {(isFortniteAccount
                    ? ['overview', 'cosmetics', 'security']
                    : isEpicAccount
                      ? ['overview', 'games', 'security']
                      : ['overview', 'security']
                  ).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                        activeTab === tab
                          ? 'border-purple-500 text-purple-400'
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      {tab === 'cosmetics' && (
                        <Icon icon='mdi:tshirt-crew' className='inline mr-1' />
                      )}
                      {tab === 'games' && (
                        <Icon icon='mdi:gamepad-variant' className='inline mr-1' />
                      )}
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className='p-6'>
                {activeTab === 'overview' && (
                  <div className='space-y-6'>
                    {getAccountPlatform() === 'Fortnite' ? (
                      // Fortnite-specific stats
                      <>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                          {account.fortnite_platform && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Platform</div>
                              <div className='text-white font-medium'>
                                {account.fortnite_platform}
                              </div>
                            </div>
                          )}
                          {account.fortnite_level !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Level</div>
                              <div className='text-purple-400 font-bold text-lg'>
                                {account.fortnite_level}
                              </div>
                            </div>
                          )}
                          {account.fortnite_lifetime_wins !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Kemenangan Seumur Hidup</div>
                              <div className='text-green-400 font-bold text-lg'>
                                {account.fortnite_lifetime_wins}
                              </div>
                            </div>
                          )}
                          {account.fortnite_season_num !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Season</div>
                              <div className='text-blue-400 font-bold text-lg'>
                                {account.fortnite_season_num}
                              </div>
                            </div>
                          )}
                        </div>

                        {(account.fortnite_balance || account.fortnite_book_level) && (
                          <div className='grid grid-cols-2 gap-4'>
                            {account.fortnite_balance !== undefined && (
                              <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                                <div className='text-gray-400 text-sm'>Saldo V-Bucks</div>
                                <div className='text-yellow-400 font-medium text-lg'>
                                  {account.fortnite_balance.toLocaleString()}
                                </div>
                              </div>
                            )}
                            {account.fortnite_book_level !== undefined && (
                              <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                                <div className='text-gray-400 text-sm'>Level Battle Pass</div>
                                <div className='text-orange-400 font-medium text-lg'>
                                  {account.fortnite_book_level}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Cosmetics Count Summary */}
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                            <div className='text-gray-400 text-sm'>Skin</div>
                            <div className='text-purple-400 font-bold text-lg'>
                              {account.fortniteSkins?.length || 0}
                            </div>
                          </div>
                          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                            <div className='text-gray-400 text-sm'>Kapak</div>
                            <div className='text-blue-400 font-bold text-lg'>
                              {account.fortnitePickaxe?.length || 0}
                            </div>
                          </div>
                          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                            <div className='text-gray-400 text-sm'>Emote</div>
                            <div className='text-green-400 font-bold text-lg'>
                              {account.fortniteDance?.length || 0}
                            </div>
                          </div>
                          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                            <div className='text-gray-400 text-sm'>Glider</div>
                            <div className='text-yellow-400 font-bold text-lg'>
                              {account.fortniteGliders?.length || 0}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : getAccountPlatform() === 'Epic Games' ? (
                      // Epic Games specific stats
                      <>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                          {account.eg_country && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Country</div>
                              <div className='text-white font-medium'>{account.eg_country}</div>
                            </div>
                          )}
                          {account.epic_data?.country && !account.eg_country && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Country</div>
                              <div className='text-white font-medium'>
                                {account.epic_data.country}
                              </div>
                            </div>
                          )}
                          {account.eg_games && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Games Owned</div>
                              <div className='text-blue-400 font-bold text-lg'>
                                {Object.keys(account.eg_games).length}
                              </div>
                            </div>
                          )}
                          {account.epic_data?.email_changeable !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Email Status</div>
                              <div
                                className={`font-medium text-sm ${
                                  account.epic_data.email_changeable
                                    ? 'text-green-400'
                                    : 'text-yellow-400'
                                }`}
                              >
                                {account.epic_data.email_changeable ? 'Changeable' : 'Fixed'}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Games Summary */}
                        {account.eg_games && Object.keys(account.eg_games).length > 0 && (
                          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                            <div className='flex items-center justify-between mb-3'>
                              <h4 className='text-white font-medium'>Popular Games</h4>
                              <span className='text-gray-400 text-sm'>
                                {Object.keys(account.eg_games).length} games total
                              </span>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                              {Object.entries(account.eg_games)
                                .slice(0, 4)
                                .map(([gameId, game]) => (
                                  <div
                                    key={gameId}
                                    className='flex items-center space-x-3 bg-gray-700 p-3 rounded'
                                  >
                                    {game.img ? (
                                      <img
                                        src={game.img}
                                        alt={game.title}
                                        className='w-8 h-8 rounded object-cover'
                                        onError={e => (e.target.style.display = 'none')}
                                      />
                                    ) : (
                                      <div className='w-8 h-8 bg-gray-600 rounded flex items-center justify-center'>
                                        <Icon
                                          icon='mdi:gamepad-variant'
                                          className='text-gray-400 text-sm'
                                        />
                                      </div>
                                    )}
                                    <div className='flex-1 min-w-0'>
                                      <div className='text-white text-sm font-medium truncate'>
                                        {game.title}
                                      </div>
                                      <div className='text-gray-400 text-xs'>
                                        {game.hours_played
                                          ? `${game.hours_played.toFixed(1)}h`
                                          : 'No playtime'}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Account Details */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          {account.epic_data?.creation_date && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Creation Date</div>
                              <div className='text-white font-medium'>
                                {account.epic_data.creation_date}
                              </div>
                            </div>
                          )}
                          {(account.eg_last_seen || account.epic_data?.last_seen) && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Last Seen</div>
                              <div className='text-white font-medium'>
                                {account.eg_last_seen || account.epic_data.last_seen}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Code Redemption History */}
                        {account.eg_code_redemption_history &&
                          account.eg_code_redemption_history.length > 0 && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <h4 className='text-white font-medium mb-3'>
                                Recent Code Redemptions
                              </h4>
                              <div className='space-y-2'>
                                {account.eg_code_redemption_history
                                  .slice(0, 3)
                                  .map((redemption, index) => (
                                    <div
                                      key={index}
                                      className='flex justify-between items-center text-sm'
                                    >
                                      <span className='text-gray-300'>
                                        {redemption.description}
                                      </span>
                                      <span className='text-gray-400'>
                                        {new Date(redemption.redeemDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                      </>
                    ) : getAccountPlatform() === 'Gifts' ? (
                      // Gifts specific stats
                      <>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                          {account.giftService && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Service</div>
                              <div className='text-white font-medium capitalize'>
                                {account.giftService}
                              </div>
                            </div>
                          )}
                          {account.giftTypeName && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Type</div>
                              <div className='text-purple-400 font-medium'>
                                {account.giftTypeName}
                              </div>
                            </div>
                          )}
                          {account.giftDuration !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Duration</div>
                              <div className='text-blue-400 font-bold text-lg'>
                                {account.giftDuration} days
                              </div>
                            </div>
                          )}
                          {account.viewCount !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Views</div>
                              <div className='text-green-400 font-bold text-lg'>
                                {account.viewCount}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Gift Details */}
                        <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                          <div className='flex items-center justify-between mb-3'>
                            <h4 className='text-white font-medium flex items-center space-x-2'>
                              <Icon
                                icon={account.giftServiceIcon || 'mdi:gift'}
                                className='text-purple-400'
                              />
                              <span>Gift Details</span>
                            </h4>
                          </div>
                          <div className='space-y-3'>
                            <div className='flex items-center space-x-3 bg-gray-700 p-3 rounded'>
                              <div className='w-10 h-10 bg-purple-900 bg-opacity-50 rounded-lg flex items-center justify-center'>
                                <Icon
                                  icon={account.giftServiceIcon || 'mdi:gift'}
                                  className='text-purple-400 text-lg'
                                />
                              </div>
                              <div className='flex-1'>
                                <div className='text-white font-medium'>
                                  {account.giftTypeName || 'Gift Item'}
                                </div>
                                <div className='text-gray-400 text-sm'>
                                  {account.giftDurationText || 'Duration unknown'}
                                </div>
                              </div>
                              <div className='text-right'>
                                <div className='text-purple-400 font-medium'>Active</div>
                                <div className='text-gray-400 text-xs'>Ready to use</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Account Information */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          {account.itemOrigin && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Origin</div>
                              <div className='text-white font-medium capitalize'>
                                {account.itemOrigin}
                              </div>
                            </div>
                          )}
                          {account.publishedDate && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Published Date</div>
                              <div className='text-white font-medium'>{account.publishedDate}</div>
                            </div>
                          )}
                          {account.warranty && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Warranty</div>
                              <div className='text-green-400 font-medium'>{account.warranty}</div>
                            </div>
                          )}
                          {account.maxDiscountPercent > 0 && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Max Discount</div>
                              <div className='text-yellow-400 font-medium'>
                                {account.maxDiscountPercent}%
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        {account.description && (
                          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                            <h4 className='text-white font-medium mb-3'>Description</h4>
                            <div className='text-gray-300 text-sm max-h-32 overflow-y-auto'>
                              {account.description}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      // Steam-specific stats (keep existing logic)
                      <>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                          {account.steam_country && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Negara</div>
                              <div className='text-white font-medium'>{account.steam_country}</div>
                            </div>
                          )}
                          {account.steam_level !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Level</div>
                              <div className='text-purple-400 font-bold text-lg'>
                                {account.steam_level}
                              </div>
                            </div>
                          )}
                          {account.steam_game_count !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Game</div>
                              <div className='text-purple-400 font-bold text-lg'>
                                {account.steam_game_count}
                              </div>
                            </div>
                          )}
                          {account.steam_friend_count !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Teman</div>
                              <div className='text-purple-400 font-bold text-lg'>
                                {account.steam_friend_count}
                              </div>
                            </div>
                          )}
                        </div>

                        {(account.steam_balance || account.steam_inv_value) && (
                          <div className='grid grid-cols-2 gap-4'>
                            {account.steam_balance && (
                              <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                                <div className='text-gray-400 text-sm'>Saldo Dompet</div>
                                <div className='text-green-400 font-medium text-lg'>
                                  {account.steam_balance}
                                </div>
                              </div>
                            )}
                            {account.steam_inv_value !== undefined &&
                              account.steam_inv_value > 0 && (
                                <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                                  <div className='text-gray-400 text-sm'>Nilai Inventory</div>
                                  <div className='text-green-400 font-medium text-lg'>
                                    ${account.steam_inv_value.toFixed(2)}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Games Library Section for Steam accounts */}
                {getAccountPlatform() === 'Steam' &&
                  account.steam_full_games?.list &&
                  Object.keys(account.steam_full_games.list).length > 0 && (
                    <div className='space-y-6'>
                      <div className='flex justify-between items-center'>
                        <h3 className='text-xl font-bold text-white flex items-center gap-3'>
                          <svg
                            className='w-6 h-6 text-blue-400'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path d='M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z' />
                          </svg>
                          Game Library
                          <span className='bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-medium'>
                            {account.steam_full_games.total}
                          </span>
                        </h3>
                      </div>

                      {/* Games Grid Gallery */}
                      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                        {Object.values(account.steam_full_games.list)
                          .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
                          .map((game, index) => (
                            <div
                              key={index}
                              className='group bg-gray-800 rounded-lg border border-gray-600 overflow-hidden hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer'
                            >
                              <div className='relative aspect-video overflow-hidden'>
                                <img
                                  src={
                                    game.img ||
                                    `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`
                                  }
                                  alt={game.title}
                                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                                  onError={e => {
                                    // Fallback to icon if header image fails
                                    e.target.src = `https://nztcdn.com/steam/icon/${game.appid}.webp`
                                    e.target.onError = () => {
                                      e.target.src = '/src/assets/react.svg'
                                    }
                                  }}
                                />
                                {/* Playtime overlay */}
                                {game.playtime_forever > 0 && (
                                  <div className='absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm'>
                                    {formatPlaytime(game.playtime_forever)}
                                  </div>
                                )}
                                {/* Hover overlay */}
                                <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                                  <div className='text-white text-center p-2'>
                                    <svg
                                      className='w-8 h-8 mx-auto mb-2'
                                      fill='currentColor'
                                      viewBox='0 0 20 20'
                                    >
                                      <path
                                        fillRule='evenodd'
                                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                                        clipRule='evenodd'
                                      />
                                    </svg>
                                    <p className='text-xs font-medium'>View Details</p>
                                  </div>
                                </div>
                              </div>
                              <div className='p-3'>
                                <h4 className='text-white font-medium text-sm leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors'>
                                  {game.title}
                                </h4>
                                {game.abbr && (
                                  <p className='text-gray-500 text-xs mt-1 uppercase tracking-wide'>
                                    {game.abbr}
                                  </p>
                                )}
                                {game.playtime_forever > 0 && (
                                  <div className='mt-2 flex items-center gap-1'>
                                    <svg
                                      className='w-3 h-3 text-gray-400'
                                      fill='currentColor'
                                      viewBox='0 0 20 20'
                                    >
                                      <path
                                        fillRule='evenodd'
                                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                                        clipRule='evenodd'
                                      />
                                    </svg>
                                    <span className='text-gray-400 text-xs'>
                                      {formatPlaytime(game.playtime_forever)} played
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* View More Games Button */}
                      {Object.keys(account.steam_full_games.list).length > 30 && (
                        <div className='text-center pt-4'>
                          <button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto'>
                            <svg
                              className='w-5 h-5'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M19 9l-7 7-7-7'
                              />
                            </svg>
                            Show All Games
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                {activeTab === 'security' && (
                  <div className='space-y-4'>
                    <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                      <h3 className='text-lg font-semibold text-white mb-4'>Fitur Keamanan</h3>
                      <div className='space-y-3'>
                        <div className='flex justify-between items-center'>
                          <span className='text-gray-400'>Autentikasi Dua Faktor</span>
                          <span className={account.steam_mfa ? 'text-green-400' : 'text-red-400'}>
                            {account.steam_mfa ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='text-gray-400'>Status Akun</span>
                          <span
                            className={
                              !account.steam_is_limited ? 'text-green-400' : 'text-red-400'
                            }
                          >
                            {!account.steam_is_limited ? 'Unlimited' : 'Limited'}
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='text-gray-400'>Market Access</span>
                          <span
                            className={account.steam_market ? 'text-green-400' : 'text-red-400'}
                          >
                            {account.steam_market ? 'Available' : 'Restricted'}
                          </span>
                        </div>
                        {account.email_provider && (
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-400'>Email Provider</span>
                            <span className='text-white'>{account.email_provider}</span>
                          </div>
                        )}
                        {account.item_domain && (
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-400'>Email Domain</span>
                            <span className='text-white'>{account.item_domain}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'cosmetics' && isFortniteAccount && (
                  <div className='space-y-6'>
                    {/* Cosmetics Header */}
                    <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-white flex items-center'>
                          <Icon icon='mdi:tshirt-crew' className='mr-2 text-purple-400' />
                          Fortnite Cosmetics
                        </h3>
                        <div className='text-sm text-gray-400'>
                          {generateFortniteCosmetics().length} items
                        </div>
                      </div>

                      {/* Account Stats */}
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                        <div className='bg-gray-900 p-4 rounded-lg border border-gray-700'>
                          <div className='text-purple-400 font-bold text-xl'>
                            {account.fortnite_level ||
                              account.level ||
                              Math.floor(Math.random() * 100) + 20}
                          </div>
                          <div className='text-gray-400 text-sm'>Account Level</div>
                        </div>
                        <div className='bg-gray-900 p-4 rounded-lg border border-gray-700'>
                          <div className='text-yellow-400 font-bold text-xl'>
                            {(
                              account.fortnite_vbucks ||
                              account.vbucks ||
                              Math.floor(Math.random() * 5000) + 1000
                            ).toLocaleString()}
                          </div>
                          <div className='text-gray-400 text-sm'>V-Bucks</div>
                        </div>
                        <div className='bg-gray-900 p-4 rounded-lg border border-gray-700'>
                          <div className='text-green-400 font-bold text-xl'>
                            {account.fortnite_wins ||
                              account.wins ||
                              Math.floor(Math.random() * 200) + 10}
                          </div>
                          <div className='text-gray-400 text-sm'>Victory Royales</div>
                        </div>
                      </div>
                    </div>

                    {/* Cosmetics Grid */}
                    <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                      <h4 className='text-md font-semibold text-white mb-4'>Cosmetic Items</h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                        {generateFortniteCosmetics().map((cosmetic, index) => (
                          <div
                            key={index}
                            className={`bg-gray-900 p-4 rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-lg ${getRarityColor(cosmetic.rarity)}`}
                          >
                            <div className='flex flex-col items-center space-y-3'>
                              {/* Cosmetic Image */}
                              <div className='w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden'>
                                {cosmetic.image ? (
                                  <img
                                    src={cosmetic.image}
                                    alt={cosmetic.name}
                                    className='w-16 h-16 rounded-lg object-cover'
                                    onError={e => {
                                      // Fallback to emoji if Fortnite API image fails
                                      e.target.style.display = 'none'
                                      e.target.nextSibling.style.display = 'flex'
                                    }}
                                  />
                                ) : null}
                                <div
                                  className='w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-2xl'
                                  style={{ display: cosmetic.image ? 'none' : 'flex' }}
                                >
                                  {cosmetic.type === 'Skin'
                                    ? '👤'
                                    : cosmetic.type === 'Pickaxe'
                                      ? '⚒️'
                                      : cosmetic.type === 'Emote'
                                        ? '💃'
                                        : cosmetic.type === 'Glider'
                                          ? '🪂'
                                          : '🎮'}
                                </div>
                              </div>

                              {/* Cosmetic Info */}
                              <div className='text-center w-full'>
                                <h5
                                  className='text-white font-medium text-sm truncate mb-1'
                                  title={cosmetic.name}
                                >
                                  {cosmetic.name}
                                </h5>
                                <div className='flex items-center justify-center space-x-1 mb-2'>
                                  <span
                                    className={`text-xs px-2 py-1 rounded capitalize ${getRarityColor(cosmetic.rarity)}`}
                                  >
                                    {cosmetic.rarity}
                                  </span>
                                </div>
                                <span className='text-xs text-gray-500 block'>{cosmetic.type}</span>
                                <p className='text-gray-400 text-xs mt-2 line-clamp-2'>
                                  {cosmetic.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Empty State */}
                      {generateFortniteCosmetics().length === 0 && (
                        <div className='text-center text-gray-400 py-8'>
                          <Icon icon='mdi:tshirt-crew' className='text-4xl mb-4 mx-auto' />
                          <p>Tidak ada data kosmetik yang tersedia untuk akun ini</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Games Tab for Epic Games Accounts */}
                {activeTab === 'games' && isEpicAccount && (
                  <div className='space-y-6'>
                    {/* Games Header */}
                    <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-white flex items-center'>
                          <Icon icon='mdi:gamepad-variant' className='mr-2 text-blue-400' />
                          Epic Games Library
                        </h3>
                        <div className='text-sm text-gray-400'>
                          {account.eg_games ? Object.keys(account.eg_games).length : 0} games
                        </div>
                      </div>
                      <p className='text-gray-300 text-sm'>
                        Games owned and hours played on this Epic Games account
                      </p>
                    </div>

                    {/* Games Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {account.eg_games &&
                        Object.entries(account.eg_games).map(([gameId, game]) => (
                          <div
                            key={gameId}
                            className='bg-gray-800 p-4 rounded-lg border border-gray-600 hover:border-blue-500 transition-all duration-300'
                          >
                            <div className='flex items-center space-x-3'>
                              {game.img ? (
                                <img
                                  src={game.img}
                                  alt={game.title}
                                  className='w-12 h-12 rounded object-cover'
                                  onError={e => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-12 h-12 bg-gray-700 rounded flex items-center justify-center ${game.img ? 'hidden' : ''}`}
                              >
                                <Icon
                                  icon='mdi:gamepad-variant'
                                  className='text-gray-400 text-xl'
                                />
                              </div>
                              <div className='flex-1'>
                                <h4 className='text-white font-medium text-sm truncate'>
                                  {game.title}
                                </h4>
                                <div className='text-xs text-gray-400 mt-1'>
                                  {game.hours_played
                                    ? `${game.hours_played.toFixed(1)}h played`
                                    : 'No playtime'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Empty State */}
                      {(!account.eg_games || Object.keys(account.eg_games).length === 0) && (
                        <div className='col-span-full text-center text-gray-400 py-8'>
                          <Icon icon='mdi:gamepad-variant' className='text-4xl mb-4 mx-auto' />
                          <p>No games data available for this account</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Purchase Card */}
            <div className='bg-gray-900 rounded-lg border border-gray-700 p-6'>
              {/* Authentication Warning */}
              {!user && (
                <div className='mb-4 p-3 bg-yellow-900/50 border border-yellow-600/50 rounded-lg'>
                  <div className='flex items-center space-x-2 text-yellow-400 text-sm'>
                    <Icon icon='mdi:alert' className='text-lg flex-shrink-0' />
                    <span>
                      Anda harus login terlebih dahulu untuk membeli atau menambah ke keranjang
                    </span>
                  </div>
                </div>
              )}

              <div className='text-center mb-4'>
                <div className='text-3xl font-bold text-purple-400 mb-1'>
                  {formatPrice(account)}
                </div>
                <div className='text-sm text-gray-400 mb-2'>
                  ${formatUSD(getPriceValue(account))} USD
                </div>
                {account.hasWarranty && (
                  <p className='text-green-400 text-sm'>Termasuk garansi {account.warranty}</p>
                )}
              </div>

              <button
                onClick={handleBuyNow}
                className={`w-full py-3 px-4 rounded-lg transition-all duration-200 font-medium mb-3 shadow-lg ${
                  user
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:shadow-purple-500/25 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                }`}
              >
                <Icon icon={user ? 'mdi:credit-card' : 'mdi:login'} className='inline mr-2' />
                {user ? 'Beli Sekarang' : 'Login untuk Membeli'}
              </button>

              <button
                onClick={handleAddToCart}
                className={`w-full py-2 px-4 rounded-lg transition-all duration-200 border font-medium shadow-lg ${
                  user
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-green-500/30 hover:shadow-green-500/25 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 border-gray-500/30 text-gray-300'
                }`}
              >
                <Icon icon={user ? 'mdi:cart-plus' : 'mdi:login'} className='inline mr-2' />
                {user ? 'Tambah ke Keranjang' : 'Login untuk Menambah ke Keranjang'}
              </button>
            </div>

            {/* Account Info */}
            <div className='bg-gray-900 rounded-lg border border-gray-700 p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>Account Info</h3>
              <div className='space-y-3 text-sm'>
                {account.item_origin && (
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Origin:</span>
                    <span className='text-white capitalize'>{account.item_origin}</span>
                  </div>
                )}
                {account.item_state && (
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Status:</span>
                    <span className='text-white'>{account.item_state}</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Account ID:</span>
                  <span className='text-white'>#{account.id}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Listed:</span>
                  <span className='text-white'>
                    {formatDate(account.created_at || account.upload_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className='bg-gray-900 rounded-lg border border-gray-700 p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>Need Help?</h3>
              <div className='space-y-3'>
                <button className='w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium'>
                  Contact Senja Games
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, item: null })}
        item={paymentModal.item}
        quantity={1}
      />

      {/* Cart Modal */}
      <CartModal isOpen={cartModal} onClose={() => setCartModal(false)} />

      {/* Toast Notification */}
      {toast.show && (
        <div className='fixed top-4 right-4 z-50 max-w-sm'>
          <div
            className={`p-4 rounded-lg shadow-lg border backdrop-blur-md transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-green-900/90 border-green-500/50 text-green-100'
                : toast.type === 'warning'
                  ? 'bg-yellow-900/90 border-yellow-500/50 text-yellow-100'
                  : 'bg-red-900/90 border-red-500/50 text-red-100'
            }`}
          >
            <div className='flex items-center space-x-3'>
              <Icon
                icon={
                  toast.type === 'success'
                    ? 'mdi:check-circle'
                    : toast.type === 'warning'
                      ? 'mdi:alert-circle'
                      : 'mdi:close-circle'
                }
                className='text-xl flex-shrink-0'
              />
              <span className='font-medium'>{toast.message}</span>
              <button
                onClick={() => setToast({ show: false, message: '', type: '' })}
                className='text-current hover:opacity-75 transition-opacity'
              >
                <Icon icon='mdi:close' className='text-lg' />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountDetailPage
