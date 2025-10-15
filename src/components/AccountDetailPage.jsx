import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { convertToIDR, formatCurrency } from '../utils/currency'
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
  const [showAllGames, setShowAllGames] = useState(false)

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

    // Create cart item with ID as title instead of account name
    const cartItem = {
      ...account,
      title: `ID: ${account.item_id || account.id || 'Unknown'}`
    }

    const success = addToCart(cartItem)
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

    // Apply Steam multiplier before sending to PaymentModal
    const priceUSD = account.price || 0

    // Detect if it's a Steam account and apply 1.75x multiplier
    const isSteamAccount =
      account.steam_level !== undefined ||
      account.steam_country ||
      account.steam_game_count !== undefined ||
      account.steam_mfa !== undefined ||
      account.category?.category_name === 'steam' ||
      account.category?.category_url === 'steam'

    const adjustedPriceUSD = isSteamAccount ? priceUSD * 1.75 : priceUSD

    // Create item with adjusted price and ID title for PaymentModal
    const paymentItem = {
      ...account,
      price: adjustedPriceUSD,
      title: `ID: ${account.item_id || account.id || 'Unknown'}`
    }

    setPaymentModal({ isOpen: true, item: paymentItem })
  }

  useEffect(() => {
    const fetchAccountDetails = async () => {
      setLoading(true)
      setError(null)

      try {
        // Always fetch from unify API if we have an account ID for better data accuracy
        if (accountId) {
          console.log(`🔍 Fetching account details for ID: ${accountId}`)

          const response = await fetch(`/api/unify?name=search&id=${accountId}`)

          if (!response.ok) {
            throw new Error(
              `Failed to fetch account details: ${response.status} ${response.statusText}`
            )
          }

          const accountData = await response.json()
          console.log('✅ Account data fetched:', accountData)

          if (accountData && accountData.item) {
            // LZT Market API returns account data in 'item' property
            console.log('📊 Social Club data check:', {
              category_id: accountData.item.category_id,
              socialclub_level: accountData.item.socialclub_level,
              socialclub_cash: accountData.item.socialclub_cash,
              socialclub_bank_cash: accountData.item.socialclub_bank_cash,
              socialclub_last_activity: accountData.item.socialclub_last_activity,
              socialclubGames: accountData.item.socialclubGames,
              socialclub_games: accountData.item.socialclub_games
            })
            setAccount(accountData.item)

            // Set appropriate default tab - Social Club accounts don't use tabs, show overview directly
            if (accountData.item.category_id === 7) {
              // Social Club accounts show overview section directly (no tabs)
              console.log('🎮 Social Club account detected - showing overview')
            } else if (
              accountData.item.category_id === 9 ||
              accountData.item.fortnite_level !== undefined
            ) {
              setActiveTab('cosmetics')
            } else if (accountData.item.category_id === 12 || accountData.item.eg_games) {
              setActiveTab('games') // Epic Games accounts should show games tab
            } else if (accountData.item.category_id === 31 || accountData.item.roblox_id) {
              setActiveTab('overview') // Roblox accounts should show overview tab
            } else if (accountData.item.category_id === 4 || accountData.item.minecraft_username) {
              setActiveTab('overview') // Minecraft accounts should show overview tab
            }
          } else if (accountData) {
            // Fallback if data structure is different
            setAccount(accountData)
          } else {
            setError(
              'Akun tidak ditemukan - silakan coba akun lain atau periksa apakah ID sudah benar'
            )
          }
        }
        // Fallback to state data if no ID but we have account data from state
        else if (accountFromState) {
          console.log('📦 Using account data from state as fallback')
          setAccount(accountFromState)

          // Set appropriate default tab based on account type
          if (accountFromState.category_id === 9 || accountFromState.fortnite_level !== undefined) {
            setActiveTab('cosmetics')
          } else if (
            accountFromState.category_id === 7 ||
            accountFromState.socialclub_level !== undefined
          ) {
            setActiveTab('games') // Social Club accounts should show games tab
          } else if (accountFromState.category_id === 12 || accountFromState.eg_games) {
            setActiveTab('games') // Epic Games accounts should show games tab
          } else if (accountFromState.category_id === 31 || accountFromState.roblox_id) {
            setActiveTab('overview') // Roblox accounts should show overview tab
          } else if (accountFromState.category_id === 4 || accountFromState.minecraft_username) {
            setActiveTab('overview') // Minecraft accounts should show overview tab
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

    // Check for Social Club account indicators
    if (
      account.category_id === 7 ||
      account.socialclub_level !== undefined ||
      account.socialclub_cash !== undefined ||
      account.socialclub_bank_cash !== undefined ||
      account.socialclub_last_activity !== undefined ||
      account.socialclub_games ||
      account.socialclubGames
    ) {
      return 'Social Club'
    }

    // Check for Epic Games account indicators
    if (account.eg_games || account.category_id === 12 || account.eg_country || account.epic_data) {
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

    // Check for Minecraft account indicators
    if (
      account.category_id === 4 ||
      account.minecraft_username ||
      account.hypixel_level !== undefined ||
      account.hypixel_achievements !== undefined ||
      account.java_edition !== undefined ||
      account.bedrock_edition !== undefined ||
      account.minecraft_java ||
      account.minecraft_bedrock ||
      account.hypixel_rank
    ) {
      return 'Minecraft'
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

    // Check for Roblox account indicators
    if (
      account.category_id === 31 ||
      account.roblox_id ||
      account.roblox_username ||
      account.roblox_robux !== undefined ||
      account.roblox_country
    ) {
      return 'Roblox'
    }

    // Check for Riot Games account indicators
    if (
      account.category_id === 13 ||
      account.riot_id ||
      account.riot_username ||
      account.riot_valorant_level ||
      account.riot_lol_level ||
      account.valorantInventory
    ) {
      return 'Riot'
    }

    // Check for Telegram account indicators
    if (
      account.category_id === 24 ||
      account.telegram_item_id ||
      account.telegram_dc_id ||
      account.telegram_country ||
      account.telegram_last_seen !== undefined ||
      account.telegram_premium !== undefined
    ) {
      return 'Telegram'
    }

    // Check for Uplay/Ubisoft account indicators
    if (
      account.category_id === 5 ||
      account.uplay_country ||
      account.uplay_games ||
      account.uplay_created_date ||
      account.uplay_last_activity
    ) {
      return 'Uplay'
    }

    // Check for Battle.net account indicators
    if (
      account.category_id === 11 ||
      account.battlenet_country ||
      account.battlenet_balance ||
      account.battlenet_last_activity ||
      account.battlenetGames
    ) {
      return 'Battle.net'
    }

    // Check for Origin/EA account indicators
    if (
      account.category_id === 8 ||
      account.ea_country ||
      account.ea_games ||
      account.ea_id ||
      account.ea_username ||
      account.ea_item_id ||
      account.platform === 'origin'
    ) {
      return 'Origin'
    }

    // Default fallback
    return 'Gaming Account'
  }

  // Get the correct category URL to navigate back to
  const getCategoryUrl = () => {
    const platform = getAccountPlatform()
    switch (platform) {
      case 'Steam':
        return '/?category=Steam'
      case 'Epic Games':
        return '/?category=Epic%20Games'
      case 'Fortnite':
        return '/?category=Fortnite'
      case 'Gifts':
        return '/?category=Gifts'
      case 'Minecraft':
        return '/?category=Minecraft'
      case 'Roblox':
        return '/?category=Roblox'
      case 'Uplay':
        return '/?category=Uplay'
      case 'Battle.net':
        return '/?category=Battle.net'
      case 'Origin':
        return '/?category=Origin'
      case 'Riot':
        return '/?category=Riot'
      case 'Telegram':
        return '/?category=Telegram'
      default:
        return '/' // Default to homepage for unknown platforms
    }
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
      case 'Minecraft':
        return 'game-icons:grass-block'
      case 'Steam':
        return 'simple-icons:steam'
      case 'Roblox':
        return 'simple-icons:roblox'
      case 'Uplay':
        return 'simple-icons:ubisoft'
      case 'Battle.net':
        return 'simple-icons:battlenet'
      case 'Origin':
        return 'simple-icons:origin'
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
      case 'Minecraft':
        return 'bg-green-600'
      case 'Steam':
        return 'bg-blue-600'
      case 'Roblox':
        return 'bg-red-600'
      case 'Uplay':
        return 'bg-blue-500'
      case 'Battle.net':
        return 'bg-blue-800'
      case 'Origin':
        return 'bg-orange-600'
      default:
        return 'bg-gray-600'
    }
  }
  const formatPrice = account => {
    if (!account) return 'N/A'

    // Convert USD to IDR like the account cards do
    const priceUSD = account.price || 0

    // Detect if it's a Steam account from the account data itself
    const isSteamAccount =
      account.steam_level !== undefined ||
      account.steam_country ||
      account.steam_game_count !== undefined ||
      account.steam_mfa !== undefined ||
      account.category?.category_name === 'steam' ||
      account.category?.category_url === 'steam'

    // Apply 1.75x multiplier for Steam accounts
    const adjustedPriceUSD = isSteamAccount ? priceUSD * 1.75 : priceUSD

    const priceIDR = convertToIDR(adjustedPriceUSD)
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
  const isEpicAccount = account && (account.category_id === 12 || account.eg_games)

  // Check if this is a Social Club account
  const isSocialClubAccount =
    account && (account.category_id === 7 || account.socialclub_level !== undefined)

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
            onClick={() => navigate(getCategoryUrl())}
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
              onClick={() => navigate(getCategoryUrl())}
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
              onClick={() => navigate(getCategoryUrl())}
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
                onClick={() => navigate(getCategoryUrl())}
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
              {!isSocialClubAccount && !isEpicAccount && (
                <div className='border-b border-gray-700'>
                  <nav className='flex space-x-8 px-6'>
                    {(isFortniteAccount ? ['overview', 'cosmetics'] : ['overview']).map(tab => (
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
              )}

              {/* Tab Content */}
              <div className='p-6'>
                {(isSocialClubAccount || isEpicAccount || activeTab === 'overview') && (
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
                          {account.eg_username && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Username</div>
                              <div className='text-white font-medium'>{account.eg_username}</div>
                            </div>
                          )}
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
                          {(account.eg_balance !== undefined || account.egBalance) && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Balance</div>
                              <div className='text-green-400 font-medium'>
                                {account.egBalance || `$${account.eg_balance}`}
                              </div>
                            </div>
                          )}
                          {account.eg_change_email !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Email Status</div>
                              <div
                                className={`font-medium text-sm ${
                                  account.eg_change_email === 1
                                    ? 'text-green-400'
                                    : 'text-yellow-400'
                                }`}
                              >
                                {account.eg_change_email === 1 ? 'Changeable' : 'Fixed'}
                              </div>
                            </div>
                          )}
                          {account.epic_data?.email_changeable !== undefined &&
                            account.eg_change_email === undefined && (
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
                          {account.eg_can_update_display_name !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Display Name</div>
                              <div
                                className={`font-medium text-sm ${
                                  account.eg_can_update_display_name === 1
                                    ? 'text-green-400'
                                    : 'text-yellow-400'
                                }`}
                              >
                                {account.eg_can_update_display_name === 1 ? 'Changeable' : 'Fixed'}
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
                          {(account.eg_last_activity ||
                            account.eg_last_seen ||
                            account.epic_data?.last_seen) && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Last Activity</div>
                              <div className='text-white font-medium'>
                                {account.eg_last_activity
                                  ? new Date(account.eg_last_activity * 1000).toLocaleDateString()
                                  : account.eg_last_seen || account.epic_data?.last_seen}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Code Redemption History */}
                        {account.eg_code_redemption_history &&
                          account.eg_code_redemption_history.length > 0 && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <h4 className='text-white font-medium mb-3'>
                                Code Redemption History
                              </h4>
                              <div className='space-y-2'>
                                {account.eg_code_redemption_history.map((code, index) => (
                                  <div
                                    key={index}
                                    className='flex justify-between items-center bg-gray-700 p-2 rounded'
                                  >
                                    <span className='text-white text-sm'>{code.title}</span>
                                    <span className='text-gray-400 text-xs'>{code.date}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Purchase/Transaction History */}
                        {account.egTransactions && account.egTransactions.length > 0 && (
                          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                            <h4 className='text-white font-medium mb-3'>Transaction History</h4>
                            <div className='space-y-2'>
                              {account.egTransactions.map((transaction, index) => (
                                <div
                                  key={index}
                                  className='flex justify-between items-center bg-gray-700 p-3 rounded'
                                >
                                  <div>
                                    <div className='text-white text-sm font-medium'>
                                      {transaction.title}
                                    </div>
                                    <div className='text-gray-400 text-xs'>
                                      {new Date(transaction.date * 1000).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className='text-right'>
                                    <div className='text-green-400 text-sm font-medium'>
                                      {transaction.presentmentTotal}
                                    </div>
                                    <div className='text-gray-400 text-xs'>
                                      {transaction.orderType}
                                    </div>
                                  </div>
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
                    ) : getAccountPlatform() === 'Roblox' ? (
                      // Roblox-specific stats
                      <>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                          {account.roblox_username && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Username</div>
                              <div className='text-white font-medium'>
                                {account.roblox_username}
                              </div>
                            </div>
                          )}
                          {account.roblox_country && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Country</div>
                              <div className='text-white font-medium'>{account.roblox_country}</div>
                            </div>
                          )}
                          {account.roblox_friends !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Friends</div>
                              <div className='text-red-400 font-bold text-lg'>
                                {account.roblox_friends}
                              </div>
                            </div>
                          )}
                          {account.roblox_followers !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Followers</div>
                              <div className='text-red-400 font-bold text-lg'>
                                {account.roblox_followers}
                              </div>
                            </div>
                          )}
                        </div>

                        {(account.roblox_robux > 0 ||
                          account.roblox_inventory_price > 0 ||
                          account.roblox_limited_price > 0) && (
                          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                            {account.roblox_robux > 0 && (
                              <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                                <div className='text-gray-400 text-sm'>Robux Balance</div>
                                <div className='text-green-400 font-medium text-lg'>
                                  {account.roblox_robux.toLocaleString()} R$
                                </div>
                              </div>
                            )}
                            {(account.roblox_inventory_price > 0 ||
                              account.roblox_limited_price > 0) && (
                              <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                                <div className='text-gray-400 text-sm'>Inventory Value</div>
                                <div className='text-green-400 font-medium text-lg'>
                                  ~{account.roblox_inventory_price || account.roblox_limited_price}
                                </div>
                              </div>
                            )}
                            {account.roblox_credit_balance > 0 && (
                              <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                                <div className='text-gray-400 text-sm'>Credit Balance</div>
                                <div className='text-yellow-400 font-medium text-lg'>
                                  {account.roblox_credit_balance}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Account Status */}
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                          {account.roblox_email_verified !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Email Status</div>
                              <div
                                className={`font-medium ${account.roblox_email_verified === 1 ? 'text-green-400' : 'text-yellow-400'}`}
                              >
                                {account.roblox_email_verified === 1 ? 'Verified' : 'Unverified'}
                              </div>
                            </div>
                          )}
                          {account.roblox_verified !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Account Status</div>
                              <div
                                className={`font-medium ${account.roblox_verified === 1 ? 'text-blue-400' : 'text-gray-400'}`}
                              >
                                {account.roblox_verified === 1 ? 'Verified' : 'Not Verified'}
                              </div>
                            </div>
                          )}
                          {account.roblox_subscription && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Premium</div>
                              <div className='text-yellow-400 font-medium'>
                                {account.roblox_subscription}
                              </div>
                            </div>
                          )}
                          {account.roblox_age_verified !== undefined && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Age Verified</div>
                              <div
                                className={`font-medium ${account.roblox_age_verified === 1 ? 'text-green-400' : 'text-gray-400'}`}
                              >
                                {account.roblox_age_verified === 1 ? 'Yes' : 'No'}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Account Dates */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          {account.roblox_register_date && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Account Created</div>
                              <div className='text-white font-medium'>
                                {new Date(account.roblox_register_date * 1000).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                          {account.published_date && (
                            <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                              <div className='text-gray-400 text-sm'>Listed Date</div>
                              <div className='text-white font-medium'>
                                {new Date(account.published_date * 1000).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : getAccountPlatform() === 'Minecraft' ? (
                      // Minecraft-specific stats matching the detailed HTML structure
                      <>
                        {/* Basic Account Information Section */}
                        <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                            {/* Register Date */}
                            <div className='text-center'>
                              <div
                                className='text-white font-medium text-lg mb-1'
                                title={formatDate(account.minecraft_created_at)}
                              >
                                {account.minecraft_created_at
                                  ? new Date(
                                      account.minecraft_created_at * 1000
                                    ).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Register date</div>
                            </div>

                            {/* Country */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.minecraft_country || 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Country</div>
                            </div>

                            {/* Java Username */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.minecraft_nickname || 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Java Username</div>
                            </div>

                            {/* Username Change */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.minecraft_can_change_nickname ? 'text-green-400' : 'text-red-400'}`}
                              >
                                {account.minecraft_can_change_nickname !== undefined
                                  ? account.minecraft_can_change_nickname
                                    ? 'Yes'
                                    : 'No'
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Username Change</div>
                            </div>

                            {/* Minecraft Java */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.minecraft_java ? 'text-green-400' : 'text-red-400'}`}
                              >
                                {account.minecraft_java !== undefined
                                  ? account.minecraft_java
                                    ? 'Yes'
                                    : 'No'
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Minecraft Java</div>
                            </div>

                            {/* Minecraft Bedrock */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.minecraft_bedrock ? 'text-green-400' : 'text-red-400'}`}
                              >
                                {account.minecraft_bedrock !== undefined
                                  ? account.minecraft_bedrock
                                    ? 'Yes'
                                    : 'No'
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Minecraft Bedrock</div>
                            </div>

                            {/* Minecraft Dungeons */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.minecraft_dungeons ? 'text-green-400' : 'text-red-400'}`}
                              >
                                {account.minecraft_dungeons !== undefined
                                  ? account.minecraft_dungeons
                                    ? 'Yes'
                                    : 'No'
                                  : 'No'}
                              </div>
                              <div className='text-gray-400 text-sm'>Minecraft Dungeons</div>
                            </div>

                            {/* Minecraft Legends */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.minecraft_legends ? 'text-green-400' : 'text-red-400'}`}
                              >
                                {account.minecraft_legends !== undefined
                                  ? account.minecraft_legends
                                    ? 'Yes'
                                    : 'No'
                                  : 'No'}
                              </div>
                              <div className='text-gray-400 text-sm'>Minecraft Legends</div>
                            </div>
                          </div>
                        </div>

                        {/* Hypixel Stats Section */}
                        <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                          <h4 className='text-white font-medium text-xl text-center mb-6'>
                            Hypixel Stats
                          </h4>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                            {/* Hypixel Rank */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.minecraft_hypixel_rank || 'None'}
                              </div>
                              <div className='text-gray-400 text-sm'>Hypixel Rank</div>
                            </div>

                            {/* Hypixel Level */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.minecraft_hypixel_level !== undefined
                                  ? account.minecraft_hypixel_level
                                  : '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>Hypixel Level</div>
                            </div>

                            {/* Hypixel Achievements */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.minecraft_hypixel_achievement !== undefined
                                  ? account.minecraft_hypixel_achievement
                                  : '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>Hypixel Achievements</div>
                            </div>

                            {/* Hypixel Last Login */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.minecraft_hypixel_last_login ? 'text-yellow-300' : 'text-gray-400'}`}
                              >
                                {account.minecraft_hypixel_last_login ? (
                                  <time
                                    className='text-yellow-300'
                                    dateTime={new Date(
                                      account.minecraft_hypixel_last_login * 1000
                                    ).toISOString()}
                                    title={formatDate(account.minecraft_hypixel_last_login)}
                                  >
                                    {(() => {
                                      const date = new Date(
                                        account.minecraft_hypixel_last_login * 1000
                                      )
                                      const now = new Date()
                                      const diffInHours = (now - date) / (1000 * 60 * 60)
                                      if (diffInHours < 24) return 'Today'
                                      const diffInDays = Math.floor(diffInHours / 24)
                                      if (diffInDays === 1) return 'Yesterday'
                                      if (diffInDays < 7) return `${diffInDays} days ago`
                                      return date.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })
                                    })()}
                                  </time>
                                ) : (
                                  'Unknown'
                                )}
                              </div>
                              <div className='text-gray-400 text-sm'>Hypixel Last Login</div>
                            </div>

                            {/* Skyblock Level */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.minecraft_hypixel_skyblock_level !== undefined
                                  ? account.minecraft_hypixel_skyblock_level
                                  : '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>Skyblock Level</div>
                            </div>

                            {/* Skyblock Net Worth */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.minecraft_hypixel_skyblock_net_worth !== undefined
                                  ? account.minecraft_hypixel_skyblock_net_worth.toLocaleString()
                                  : '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>Skyblock Net Worth</div>
                            </div>

                            {/* Hypixel API */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.minecraft_hypixel_skyblock_api_enabled ? 'text-green-400' : 'text-red-400'}`}
                              >
                                {account.minecraft_hypixel_skyblock_api_enabled !== undefined
                                  ? account.minecraft_hypixel_skyblock_api_enabled
                                    ? 'Yes'
                                    : 'No'
                                  : 'Yes'}
                              </div>
                              <div className='text-gray-400 text-sm'>Hypixel API</div>
                            </div>
                          </div>
                        </div>

                        {/* Skin Section */}
                        <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                          <h4 className='text-white font-medium text-xl text-center mb-6'>Skin</h4>
                          <div className='flex justify-center'>
                            <div className='text-center'>
                              {account.minecraft_skin ? (
                                <img
                                  src={`data:image/png;base64,${account.minecraft_skin}`}
                                  alt='Minecraft Skin'
                                  className='w-32 h-64 pixelated border border-gray-600 rounded mx-auto'
                                  style={{
                                    imageRendering: 'pixelated',
                                    width: '50%',
                                    maxWidth: '128px'
                                  }}
                                  title='Skin of the user'
                                  onError={e => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <div className='w-32 h-64 bg-gray-700 border border-gray-600 rounded mx-auto flex items-center justify-center'>
                                  <Icon
                                    icon='mdi:account-outline'
                                    className='text-gray-400 text-4xl'
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Capes Section */}
                        {account.minecraft_capes && account.minecraft_capes.length > 0 && (
                          <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                            <h4 className='text-white font-medium text-xl text-center mb-6'>
                              {account.minecraft_capes.length} Cape
                              {account.minecraft_capes.length !== 1 ? 's' : ''}
                            </h4>
                            <div className='grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4'>
                              {account.minecraft_capes.map((cape, index) => (
                                <div key={index} className='text-center'>
                                  <img
                                    src={`data:image/png;base64,${cape.rendered}`}
                                    alt={cape.name}
                                    className='w-full aspect-[2/3] object-cover pixelated border border-gray-600 rounded'
                                    style={{ imageRendering: 'pixelated' }}
                                    title={cape.name}
                                    onError={e => {
                                      e.target.style.display = 'none'
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* External Links Section */}
                        {account.minecraft_nickname && (
                          <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                            <div className='space-y-4'>
                              {/* NameMC Link */}
                              <div className='flex items-center justify-between bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors'>
                                <span className='text-white font-medium'>
                                  NameMC: {account.minecraft_nickname}
                                </span>
                                <a
                                  href={`https://namemc.com/search?q=${account.minecraft_nickname}`}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-blue-400 hover:text-blue-300 transition-colors'
                                  title='View NameMC Profile'
                                >
                                  <Icon icon='mdi:external-link' className='text-xl' />
                                </a>
                              </div>

                              {/* Hypixel SkyBlock Stats Link */}
                              <div className='flex items-center justify-between bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors'>
                                <span className='text-white font-medium'>
                                  Hypixel SkyBlock Stats: {account.minecraft_nickname}
                                </span>
                                <a
                                  href={`https://sky.shiiyu.moe/stats/${account.minecraft_nickname}`}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-blue-400 hover:text-blue-300 transition-colors'
                                  title='View SkyBlock Stats'
                                >
                                  <Icon icon='mdi:external-link' className='text-xl' />
                                </a>
                              </div>

                              {/* Plancke Link */}
                              <div className='flex items-center justify-between bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors'>
                                <span className='text-white font-medium'>
                                  Plancke: {account.minecraft_nickname}
                                </span>
                                <a
                                  href={`https://plancke.io/hypixel/player/stats/${account.minecraft_nickname}`}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-blue-400 hover:text-blue-300 transition-colors'
                                  title='View Plancke Stats'
                                >
                                  <Icon icon='mdi:external-link' className='text-xl' />
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : getAccountPlatform() === 'Uplay' ? (
                      // Uplay/Ubisoft-specific stats matching the detailed HTML structure and real API data
                      <>
                        {/* Basic Account Information Section */}
                        <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                            {/* Last Activity */}
                            <div className='text-center'>
                              <div
                                className='text-white font-medium text-lg mb-1'
                                title={formatDate(account.uplay_last_activity)}
                              >
                                {account.uplay_last_activity
                                  ? new Date(account.uplay_last_activity * 1000).toLocaleDateString(
                                      'en-US',
                                      { year: 'numeric', month: 'short', day: 'numeric' }
                                    )
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Last activity</div>
                            </div>

                            {/* Register Date */}
                            <div className='text-center'>
                              <div
                                className='text-white font-medium text-lg mb-1'
                                title={formatDate(account.uplay_created_date)}
                              >
                                {account.uplay_created_date
                                  ? new Date(account.uplay_created_date * 1000).toLocaleDateString(
                                      'en-US',
                                      { year: 'numeric', month: 'short', day: 'numeric' }
                                    )
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Register date</div>
                            </div>

                            {/* Country */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.uplay_country || 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Country</div>
                            </div>

                            {/* Games Count */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.uplay_game_count !== undefined
                                  ? account.uplay_game_count
                                  : Object.keys(account.uplay_games || {}).length || '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>Games</div>
                            </div>

                            {/* Xbox Linked */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.uplay_xbox_connected ? 'text-red-400' : 'text-gray-400'}`}
                              >
                                {account.uplay_xbox_connected !== undefined
                                  ? account.uplay_xbox_connected
                                    ? 'Yes'
                                    : 'No'
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Xbox Linked</div>
                            </div>

                            {/* PSN Linked */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.uplay_psn_connected ? 'text-red-400' : 'text-gray-400'}`}
                              >
                                {account.uplay_psn_connected !== undefined
                                  ? account.uplay_psn_connected
                                    ? 'Yes'
                                    : 'No'
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>PSN Linked</div>
                            </div>

                            {/* Balance */}
                            {account.uplay_balance && (
                              <div className='text-center'>
                                <div className='text-green-400 font-medium text-lg mb-1'>
                                  {account.uplay_balance}
                                </div>
                                <div className='text-gray-400 text-sm'>Balance</div>
                              </div>
                            )}

                            {/* Subscription */}
                            {account.uplay_subscription && (
                              <div className='text-center'>
                                <div className='text-yellow-400 font-medium text-lg mb-1'>
                                  {account.uplay_subscription}
                                </div>
                                <div className='text-gray-400 text-sm'>Subscription</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Rainbow Six Siege Stats Section */}
                        {(account.uplay_r6_level ||
                          account.uplay_r6_operators_count ||
                          account.uplay_r6_skins_count ||
                          account.uplay_r6_rank) && (
                          <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                            <h4 className='text-white font-medium text-xl text-center mb-6'>
                              R6 Stats
                            </h4>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                              {/* R6 Level */}
                              <div className='text-center'>
                                <div className='text-white font-medium text-lg mb-1'>
                                  {account.uplay_r6_level !== undefined
                                    ? account.uplay_r6_level
                                    : '0'}
                                </div>
                                <div className='text-gray-400 text-sm'>R6 Level</div>
                              </div>

                              {/* R6 Ban */}
                              <div className='text-center'>
                                <div
                                  className={`font-medium text-lg mb-1 ${account.uplay_r6_ban ? 'text-red-400' : 'text-green-400'}`}
                                >
                                  {account.uplay_r6_ban !== undefined
                                    ? account.uplay_r6_ban
                                      ? 'Yes'
                                      : 'No'
                                    : 'No'}
                                </div>
                                <div className='text-gray-400 text-sm'>R6 Ban</div>
                              </div>

                              {/* Operators */}
                              <div className='text-center'>
                                <div className='text-white font-medium text-lg mb-1'>
                                  {account.uplay_r6_operators_count !== undefined
                                    ? account.uplay_r6_operators_count
                                    : '0'}
                                </div>
                                <div className='text-gray-400 text-sm'>Operators</div>
                              </div>

                              {/* Skins */}
                              <div className='text-center'>
                                <div className='text-white font-medium text-lg mb-1'>
                                  {account.uplay_r6_skins_count !== undefined
                                    ? account.uplay_r6_skins_count
                                    : '0'}
                                </div>
                                <div className='text-gray-400 text-sm'>Skins</div>
                              </div>

                              {/* Rank */}
                              {account.uplay_r6_rank && (
                                <div className='text-center'>
                                  <div className='text-white font-medium text-lg mb-1'>
                                    {account.uplay_r6_rank}
                                  </div>
                                  <div className='text-gray-400 text-sm'>Rank</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Games Library Section */}
                        {account.uplay_games && Object.keys(account.uplay_games).length > 0 && (
                          <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                            <h4 className='text-white font-medium text-xl text-center mb-6'>
                              {Object.keys(account.uplay_games).length} Game
                              {Object.keys(account.uplay_games).length !== 1 ? 's' : ''}
                            </h4>
                            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                              {Object.values(account.uplay_games).map((game, index) => (
                                <div
                                  key={index}
                                  className='text-center bg-gray-700 p-4 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors'
                                >
                                  <img
                                    src={game.img}
                                    alt={game.title}
                                    className='w-full aspect-square object-cover rounded mb-2'
                                    onError={e => {
                                      e.target.style.display = 'none'
                                    }}
                                  />
                                  <div
                                    className='text-white text-sm font-medium truncate'
                                    title={game.title}
                                  >
                                    {game.abbr || game.title}
                                  </div>
                                  {game.pvpTimePlayed !== undefined && (
                                    <div className='text-gray-400 text-xs mt-1'>
                                      PvP: {Math.round(game.pvpTimePlayed / 3600)}h
                                    </div>
                                  )}
                                  {game.pveTimePlayed !== undefined && (
                                    <div className='text-gray-400 text-xs'>
                                      PvE: {Math.round(game.pveTimePlayed / 3600)}h
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Transaction History */}
                        {account.uplay_transactions && (
                          <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                            <h4 className='text-white font-medium text-xl text-center mb-6'>
                              Transaction History
                            </h4>
                            <div className='space-y-3 max-h-60 overflow-y-auto'>
                              {(() => {
                                try {
                                  const transactions = JSON.parse(account.uplay_transactions)
                                  return transactions.map((transaction, index) => (
                                    <div
                                      key={index}
                                      className='bg-gray-700 p-4 rounded-lg border border-gray-600'
                                    >
                                      <div className='flex justify-between items-start mb-2'>
                                        <div className='text-white font-medium text-sm truncate flex-1 mr-2'>
                                          {transaction.product}
                                        </div>
                                        <div className='text-green-400 font-medium text-sm whitespace-nowrap'>
                                          {transaction.amount}
                                        </div>
                                      </div>
                                      <div className='flex justify-between text-xs text-gray-400'>
                                        <span>{transaction.type}</span>
                                        <span>
                                          {new Date(transaction.date * 1000).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  ))
                                } catch (e) {
                                  return (
                                    <div className='text-gray-400 text-center'>
                                      No transaction data available
                                    </div>
                                  )
                                }
                              })()}
                            </div>
                          </div>
                        )}
                      </>
                    ) : getAccountPlatform() === 'Battle.net' ? (
                      // Battle.net-specific stats matching the detailed HTML structure and real API data
                      <>
                        {/* Basic Account Information Section */}
                        <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                            {/* Last Activity */}
                            <div className='text-center'>
                              <div
                                className='text-white font-medium text-lg mb-1'
                                title={formatDate(account.battlenet_last_activity)}
                              >
                                {account.battlenet_last_activity
                                  ? new Date(
                                      account.battlenet_last_activity * 1000
                                    ).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Last activity</div>
                            </div>

                            {/* Country */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.battlenet_country || 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Country</div>
                            </div>

                            {/* Balance */}
                            <div className='text-center'>
                              <div className='text-green-400 font-medium text-lg mb-1'>
                                {account.battlenet_balance || '$0.00'}
                              </div>
                              <div className='text-gray-400 text-sm'>Balance</div>
                            </div>

                            {/* BattleTag Change */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.battlenet_can_change_tag ? 'text-green-400' : 'text-red-400'}`}
                              >
                                {account.battlenet_can_change_tag !== undefined
                                  ? account.battlenet_can_change_tag
                                    ? 'Yes'
                                    : 'No'
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>BattleTag Change</div>
                            </div>

                            {/* Real ID Enabled */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.battlenet_real_id_enabled ? 'text-red-400' : 'text-green-400'}`}
                              >
                                {account.battlenet_real_id_enabled !== undefined
                                  ? account.battlenet_real_id_enabled
                                    ? 'Yes'
                                    : 'No'
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Real ID Enabled</div>
                            </div>

                            {/* Parental Control */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.battlenet_parent_control ? 'text-red-400' : 'text-green-400'}`}
                              >
                                {account.battlenet_parent_control !== undefined
                                  ? account.battlenet_parent_control
                                    ? 'Yes'
                                    : 'No'
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Parental Control</div>
                            </div>

                            {/* Phone Linked */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.battlenet_mobile ? 'text-yellow-400' : 'text-gray-400'}`}
                              >
                                {account.battlenet_mobile !== undefined
                                  ? account.battlenet_mobile
                                    ? 'Yes'
                                    : 'No'
                                  : 'No'}
                              </div>
                              <div className='text-gray-400 text-sm'>Phone Linked</div>
                            </div>

                            {/* Change Full Name */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.battlenet_change_full_name ? 'text-green-400' : 'text-red-400'}`}
                              >
                                {account.battlenet_change_full_name !== undefined
                                  ? account.battlenet_change_full_name
                                    ? 'Yes'
                                    : 'No'
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Change Full Name</div>
                            </div>
                          </div>
                        </div>

                        {/* Games Library Section */}
                        {account.battlenetGames &&
                          Object.keys(account.battlenetGames).length > 0 && (
                            <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                              <h4 className='text-white font-medium text-xl text-center mb-6'>
                                {Object.keys(account.battlenetGames).length} Game
                                {Object.keys(account.battlenetGames).length !== 1 ? 's' : ''}
                              </h4>
                              <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                                {Object.values(account.battlenetGames).map((game, index) => (
                                  <div
                                    key={index}
                                    className='text-center bg-gray-700 p-4 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors relative overflow-hidden'
                                  >
                                    {/* Background Image */}
                                    <div
                                      className='absolute inset-0 bg-cover bg-center opacity-20'
                                      style={{
                                        backgroundImage: `url(https://account.blizzard.com/static/game-icons/${game.img})`
                                      }}
                                    />

                                    {/* Game Icon */}
                                    <div className='relative z-10'>
                                      <img
                                        src={`https://account.blizzard.com/static/game-icons/${game.img}`}
                                        alt={game.title}
                                        className='w-16 h-16 mx-auto mb-2 rounded'
                                        onError={e => {
                                          e.target.src =
                                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+'
                                        }}
                                      />
                                      <div
                                        className='text-white text-sm font-medium truncate'
                                        title={game.title}
                                      >
                                        {game.abbr || game.title}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Overwatch Wallets Section */}
                        {account.battlenetWallets && account.battlenetWallets.length > 0 && (
                          <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                            <h4 className='text-white font-medium text-xl text-center mb-6'>
                              Game Currencies
                            </h4>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                              {account.battlenetWallets.map((wallet, index) => (
                                <div
                                  key={index}
                                  className='bg-gray-700 p-4 rounded-lg border border-gray-600'
                                >
                                  <div className='text-white font-medium text-lg mb-1'>
                                    {wallet.amount} {wallet.code}
                                  </div>
                                  <div className='text-gray-400 text-sm'>{wallet.title}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Transaction History */}
                        {account.battlenetTransactions &&
                          account.battlenetTransactions.length > 0 && (
                            <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                              <h4 className='text-white font-medium text-xl text-center mb-6'>
                                Purchase History
                              </h4>
                              <div className='space-y-3 max-h-60 overflow-y-auto'>
                                {account.battlenetTransactions.map((transaction, index) => (
                                  <div
                                    key={index}
                                    className='bg-gray-700 p-4 rounded-lg border border-gray-600'
                                  >
                                    <div className='flex justify-between items-start mb-2'>
                                      <div className='text-white font-medium text-sm truncate flex-1 mr-2'>
                                        {transaction.productTitle}
                                      </div>
                                      <div className='text-green-400 font-medium text-sm whitespace-nowrap'>
                                        {transaction.formattedTotal}
                                      </div>
                                    </div>
                                    <div className='text-xs text-gray-400'>
                                      {new Date(transaction.date * 1000).toLocaleDateString()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Gift History */}
                        {account.battlenetGiftHistory &&
                          account.battlenetGiftHistory.length > 0 && (
                            <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                              <h4 className='text-white font-medium text-xl text-center mb-6'>
                                Gift History
                              </h4>
                              <div className='space-y-3 max-h-60 overflow-y-auto'>
                                {account.battlenetGiftHistory.map((gift, index) => (
                                  <div
                                    key={index}
                                    className='bg-gray-700 p-4 rounded-lg border border-gray-600'
                                  >
                                    <div className='text-white font-medium text-sm'>
                                      {gift.productTitle || 'Gift Item'}
                                    </div>
                                    <div className='text-xs text-gray-400 mt-1'>
                                      {gift.date
                                        ? new Date(gift.date * 1000).toLocaleDateString()
                                        : 'Unknown Date'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Bans Information */}
                        {account.battlenet_bans && account.battlenet_bans.trim() && (
                          <div className='bg-red-900 p-6 rounded-lg border border-red-600'>
                            <h4 className='text-red-400 font-medium text-xl text-center mb-4'>
                              Account Warnings
                            </h4>
                            <div className='text-red-300 text-center'>{account.battlenet_bans}</div>
                          </div>
                        )}
                      </>
                    ) : getAccountPlatform() === 'Origin' ? (
                      // Origin/EA-specific stats based on eaorigin-detail.html and eaorigin-raw.json
                      <>
                        {/* Basic Account Information Section */}
                        <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                            {/* Country */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.ea_country || 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Country</div>
                            </div>

                            {/* Xbox Linked */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.ea_xbox_connected ? 'text-green-400' : 'text-gray-400'}`}
                              >
                                {account.ea_xbox_connected ? 'Yes' : 'No'}
                              </div>
                              <div className='text-gray-400 text-sm'>Xbox Linked</div>
                            </div>

                            {/* Steam Linked */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.ea_steam_connected ? 'text-red-400' : 'text-gray-400'}`}
                              >
                                {account.ea_steam_connected ? 'Yes' : 'No'}
                              </div>
                              <div className='text-gray-400 text-sm'>Steam Linked</div>
                            </div>

                            {/* PSN Linked */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.ea_psn_connected ? 'text-green-400' : 'text-gray-400'}`}
                              >
                                {account.ea_psn_connected ? 'Yes' : 'No'}
                              </div>
                              <div className='text-gray-400 text-sm'>PSN Linked</div>
                            </div>
                          </div>
                        </div>

                        {/* Games Library Section */}
                        {account.ea_games && Object.keys(account.ea_games).length > 0 && (
                          <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                            <h4 className='text-white font-medium text-xl text-center mb-6'>
                              {Object.keys(account.ea_games).length} Game
                              {Object.keys(account.ea_games).length !== 1 ? 's' : ''}
                            </h4>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                              {Object.values(account.ea_games).map((game, index) => (
                                <div
                                  key={index}
                                  className='bg-gray-700 p-4 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors'
                                >
                                  {/* Game Image */}
                                  {game.img && (
                                    <div className='w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-800'>
                                      <img
                                        src={game.img}
                                        alt={game.title}
                                        className='w-full h-full object-cover'
                                        onError={e => {
                                          e.target.src =
                                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+'
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Game Title */}
                                  <div
                                    className='text-white font-medium text-lg mb-2 truncate'
                                    title={game.title}
                                  >
                                    {game.title}
                                  </div>

                                  {/* Hours Played */}
                                  {game.total_played !== undefined && (
                                    <div className='flex items-center text-orange-400 text-sm'>
                                      <svg
                                        className='w-4 h-4 mr-1'
                                        fill='currentColor'
                                        viewBox='0 0 20 20'
                                      >
                                        <path
                                          fillRule='evenodd'
                                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                                          clipRule='evenodd'
                                        />
                                      </svg>
                                      {game.total_played} hrs
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Apex Legends Statistics (if available) */}
                        {account.ea_al_level > 0 && (
                          <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                            <h4 className='text-white font-medium text-xl text-center mb-6'>
                              Apex Legends Statistics
                            </h4>
                            <div className='grid grid-cols-2 gap-4'>
                              <div className='text-center'>
                                <div className='text-purple-400 font-medium text-lg mb-1'>
                                  {account.ea_al_level}
                                </div>
                                <div className='text-gray-400 text-sm'>Level</div>
                              </div>
                              <div className='text-center'>
                                <div className='text-yellow-400 font-medium text-lg mb-1'>
                                  {account.ea_al_rank_score > 0
                                    ? account.ea_al_rank_score
                                    : 'Unknown'}
                                </div>
                                <div className='text-gray-400 text-sm'>Rank</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Account Links */}
                        {account.accountLinks && account.accountLinks.length > 0 && (
                          <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                            <h4 className='text-white font-medium text-xl text-center mb-6'>
                              External Links
                            </h4>
                            <div className='space-y-3'>
                              {account.accountLinks.map((link, index) => (
                                <div
                                  key={index}
                                  className='flex items-center justify-between bg-gray-700 p-3 rounded-lg'
                                >
                                  <span className='text-gray-300'>{link.text}</span>
                                  <a
                                    href={link.link}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-orange-400 hover:text-orange-300 transition-colors'
                                  >
                                    <svg
                                      className='w-5 h-5'
                                      fill='currentColor'
                                      viewBox='0 0 20 20'
                                    >
                                      <path d='M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z' />
                                      <path d='M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z' />
                                    </svg>
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : getAccountPlatform() === 'Riot' ? (
                      // Riot-specific stats matching the detailed HTML structure and real API data
                      <>
                        {/* Basic Account Information Section */}
                        <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                          <h3 className='text-white font-bold text-xl mb-4 text-center'>
                            Account Information
                          </h3>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                            {/* Last Activity */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.riot_last_activity || 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Last activity</div>
                            </div>

                            {/* Country */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.riot_country || 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Country</div>
                            </div>

                            {/* Phone Verified */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.riot_phone_verified ? 'text-green-400' : 'text-red-400'}`}
                              >
                                {account.riot_phone_verified !== undefined
                                  ? account.riot_phone_verified
                                    ? 'Yes'
                                    : 'No'
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Phone Verified</div>
                            </div>

                            {/* Email Access */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.riot_email_access ? 'text-green-400' : 'text-red-400'}`}
                              >
                                {account.riot_email_access !== undefined
                                  ? account.riot_email_access
                                    ? 'Yes'
                                    : 'No'
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Email Access</div>
                            </div>
                          </div>
                        </div>

                        {/* Valorant Information */}
                        <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                          <h3 className='text-white font-bold text-xl mb-4 text-center'>
                            Valorant Information
                          </h3>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                            {/* Level */}
                            <div className='text-center'>
                              <div className='text-blue-400 font-medium text-lg mb-1'>
                                {account.riot_valorant_level || 'N/A'}
                              </div>
                              <div className='text-gray-400 text-sm'>Level</div>
                            </div>

                            {/* Rank */}
                            <div className='text-center'>
                              <div className='text-yellow-400 font-medium text-lg mb-1'>
                                {account.riot_valorant_rank || 'N/A'}
                              </div>
                              <div className='text-gray-400 text-sm'>Rank</div>
                            </div>

                            {/* VP */}
                            <div className='text-center'>
                              <div className='text-green-400 font-medium text-lg mb-1'>
                                {account.riot_valorant_vp || '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>VP</div>
                            </div>

                            {/* Radianite Points */}
                            <div className='text-center'>
                              <div className='text-purple-400 font-medium text-lg mb-1'>
                                {account.riot_valorant_rp || '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>Radianite Points</div>
                            </div>

                            {/* Kingdom Credits */}
                            <div className='text-center'>
                              <div className='text-yellow-400 font-medium text-lg mb-1'>
                                {account.riot_valorant_kc || '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>Kingdom Credits</div>
                            </div>

                            {/* RR */}
                            <div className='text-center'>
                              <div className='text-orange-400 font-medium text-lg mb-1'>
                                {account.riot_valorant_rr || 'N/A'}
                              </div>
                              <div className='text-gray-400 text-sm'>RR</div>
                            </div>

                            {/* Region */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.riot_region || 'N/A'}
                              </div>
                              <div className='text-gray-400 text-sm'>Region</div>
                            </div>

                            {/* Inventory Value */}
                            <div className='text-center'>
                              <div className='text-green-400 font-medium text-lg mb-1'>
                                ${account.riot_valorant_inventory_value || '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>Inventory Value</div>
                            </div>
                          </div>
                        </div>

                        {/* League of Legends Information */}
                        {(account.riot_lol_level ||
                          account.riot_lol_rank ||
                          account.riot_lol_be ||
                          account.riot_lol_rp) && (
                          <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                            <h3 className='text-white font-bold text-xl mb-4 text-center'>
                              League of Legends Information
                            </h3>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                              {/* Level */}
                              <div className='text-center'>
                                <div className='text-blue-400 font-medium text-lg mb-1'>
                                  {account.riot_lol_level || 'N/A'}
                                </div>
                                <div className='text-gray-400 text-sm'>Level</div>
                              </div>

                              {/* Rank */}
                              <div className='text-center'>
                                <div className='text-yellow-400 font-medium text-lg mb-1'>
                                  {account.riot_lol_rank || 'N/A'}
                                </div>
                                <div className='text-gray-400 text-sm'>Rank</div>
                              </div>

                              {/* Blue Essence */}
                              <div className='text-center'>
                                <div className='text-blue-400 font-medium text-lg mb-1'>
                                  {account.riot_lol_be || '0'}
                                </div>
                                <div className='text-gray-400 text-sm'>Blue Essence</div>
                              </div>

                              {/* Riot Points */}
                              <div className='text-center'>
                                <div className='text-yellow-400 font-medium text-lg mb-1'>
                                  {account.riot_lol_rp || '0'}
                                </div>
                                <div className='text-gray-400 text-sm'>Riot Points</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Weapon Skins Section */}
                        {account.valorantInventory?.WeaponSkins &&
                          account.valorantInventory.WeaponSkins.length > 0 && (
                            <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                              <h3 className='text-white font-bold text-xl mb-4 text-center'>
                                Weapon Skins ({account.valorantInventory.WeaponSkins.length})
                              </h3>

                              {/* Try download URL first, then direct URL, then fallback to items */}
                              {account.imagePreviewLinks?.download?.weapons ||
                              account.imagePreviewLinks?.direct?.weapons ? (
                                <div className='text-center'>
                                  <img
                                    src={
                                      account.imagePreviewLinks?.download?.weapons ||
                                      account.imagePreviewLinks?.direct?.weapons
                                    }
                                    alt='Weapon Skins Preview'
                                    className='mx-auto rounded-lg border border-gray-600 max-w-full h-auto max-h-96'
                                    onError={e => {
                                      // Try the alternative URL
                                      const altUrl =
                                        account.imagePreviewLinks?.direct?.weapons ||
                                        account.imagePreviewLinks?.download?.weapons
                                      if (e.target.src !== altUrl && altUrl) {
                                        e.target.src = altUrl
                                      } else {
                                        e.target.style.display = 'none'
                                        // Show the item grid instead
                                        e.target.parentElement.innerHTML = `
                                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                          ${account.valorantInventory.WeaponSkins.map(
                                            (skinId, index) => `
                                            <div class="bg-gray-700 rounded-lg p-3 border border-gray-600 hover:border-orange-400 transition-colors">
                                              <div class="text-white text-sm font-medium mb-1 truncate" title="Weapon Skin ${index + 1}">
                                                Skin ${index + 1}
                                              </div>
                                            </div>
                                          `
                                          ).join('')}
                                        </div>
                                      `
                                      }
                                    }}
                                  />
                                  <p className='text-gray-400 text-sm mt-2'>Weapon Skins Preview</p>
                                </div>
                              ) : (
                                <>
                                  <p className='text-yellow-400 text-center mb-4'>
                                    No preview image available - showing item list
                                  </p>
                                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
                                    {account.valorantInventory.WeaponSkins.map((skinId, index) => (
                                      <div
                                        key={index}
                                        className='bg-gray-700 rounded-lg p-3 border border-gray-600 hover:border-orange-400 transition-colors'
                                      >
                                        <div
                                          className='text-white text-sm font-medium mb-1 truncate'
                                          title={`Weapon Skin ${index + 1}`}
                                        >
                                          Skin {index + 1}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                        {/* Agents Section */}
                        {account.valorantInventory?.Agent &&
                          account.valorantInventory.Agent.length > 0 && (
                            <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                              <h3 className='text-white font-bold text-xl mb-4 text-center'>
                                Agents ({account.valorantInventory.Agent.length})
                              </h3>

                              {account.imagePreviewLinks?.download?.agents ||
                              account.imagePreviewLinks?.direct?.agents ? (
                                <div className='text-center'>
                                  <img
                                    src={
                                      account.imagePreviewLinks?.download?.agents ||
                                      account.imagePreviewLinks?.direct?.agents
                                    }
                                    alt='Agents Preview'
                                    className='mx-auto rounded-lg border border-gray-600 max-w-full h-auto max-h-96'
                                    onError={e => {
                                      const altUrl =
                                        account.imagePreviewLinks?.direct?.agents ||
                                        account.imagePreviewLinks?.download?.agents
                                      if (e.target.src !== altUrl && altUrl) {
                                        e.target.src = altUrl
                                      } else {
                                        e.target.style.display = 'none'
                                        e.target.parentElement.innerHTML = `
                                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                          ${account.valorantInventory.Agent.map(
                                            (agentId, index) => `
                                            <div class="bg-gray-700 rounded-lg p-3 border border-gray-600 hover:border-purple-400 transition-colors">
                                              <div class="text-white text-sm font-medium truncate" title="Agent ${index + 1}">
                                                Agent ${index + 1}
                                              </div>
                                            </div>
                                          `
                                          ).join('')}
                                        </div>
                                      `
                                      }
                                    }}
                                  />
                                  <p className='text-gray-400 text-sm mt-2'>Agents Preview</p>
                                </div>
                              ) : (
                                <>
                                  <p className='text-yellow-400 text-center mb-4'>
                                    No preview image available - showing item list
                                  </p>
                                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
                                    {account.valorantInventory.Agent.map((agentId, index) => (
                                      <div
                                        key={index}
                                        className='bg-gray-700 rounded-lg p-3 border border-gray-600 hover:border-purple-400 transition-colors'
                                      >
                                        <div
                                          className='text-white text-sm font-medium truncate'
                                          title={`Agent ${index + 1}`}
                                        >
                                          Agent {index + 1}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                        {/* Gun Buddies Section */}
                        {account.valorantInventory?.Buddy &&
                          account.valorantInventory.Buddy.length > 0 && (
                            <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                              <h3 className='text-white font-bold text-xl mb-4 text-center'>
                                Gun Buddies ({account.valorantInventory.Buddy.length})
                              </h3>

                              {account.imagePreviewLinks?.download?.buddies ||
                              account.imagePreviewLinks?.direct?.buddies ? (
                                <div className='text-center'>
                                  <img
                                    src={
                                      account.imagePreviewLinks?.download?.buddies ||
                                      account.imagePreviewLinks?.direct?.buddies
                                    }
                                    alt='Gun Buddies Preview'
                                    className='mx-auto rounded-lg border border-gray-600 max-w-full h-auto max-h-96'
                                    onError={e => {
                                      const altUrl =
                                        account.imagePreviewLinks?.direct?.buddies ||
                                        account.imagePreviewLinks?.download?.buddies
                                      if (e.target.src !== altUrl && altUrl) {
                                        e.target.src = altUrl
                                      } else {
                                        e.target.style.display = 'none'
                                        e.target.parentElement.innerHTML = `
                                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                          ${account.valorantInventory.Buddy.map(
                                            (buddyId, index) => `
                                            <div class="bg-gray-700 rounded-lg p-3 border border-gray-600 hover:border-green-400 transition-colors">
                                              <div class="text-white text-sm font-medium truncate" title="Gun Buddy ${index + 1}">
                                                Buddy ${index + 1}
                                              </div>
                                            </div>
                                          `
                                          ).join('')}
                                        </div>
                                      `
                                      }
                                    }}
                                  />
                                  <p className='text-gray-400 text-sm mt-2'>Gun Buddies Preview</p>
                                </div>
                              ) : (
                                <>
                                  <p className='text-yellow-400 text-center mb-4'>
                                    No preview image available - showing item list
                                  </p>
                                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
                                    {account.valorantInventory.Buddy.map((buddyId, index) => (
                                      <div
                                        key={index}
                                        className='bg-gray-700 rounded-lg p-3 border border-gray-600 hover:border-green-400 transition-colors'
                                      >
                                        <div
                                          className='text-white text-sm font-medium truncate'
                                          title={`Gun Buddy ${index + 1}`}
                                        >
                                          Buddy {index + 1}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                        {/* External Links Section */}
                        {account.accountLinks && account.accountLinks.length > 0 && (
                          <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                            <h3 className='text-white font-bold text-xl mb-4 text-center'>
                              External Links
                            </h3>
                            <div className='space-y-3'>
                              {account.accountLinks.map((link, index) => (
                                <div
                                  key={index}
                                  className='flex justify-between items-center p-3 bg-gray-700 rounded-lg border border-gray-600'
                                >
                                  <span className='text-gray-400'>{link.platform}:</span>
                                  <span className='text-white'>{link.username}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : getAccountPlatform() === 'Telegram' ? (
                      // Telegram-specific stats matching the detailed HTML structure and real API data
                      <>
                        {/* Basic Account Information Section */}
                        <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                          <h3 className='text-white font-bold text-xl mb-4 text-center'>
                            Telegram Account Information
                          </h3>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                            {/* Country */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.telegram_country || 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Country</div>
                            </div>

                            {/* Spam Block */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${
                                  account.telegram_spam_block === 1
                                    ? 'text-red-400'
                                    : account.telegram_spam_block === 0
                                      ? 'text-green-400'
                                      : 'text-gray-400'
                                }`}
                              >
                                {account.telegram_spam_block === 1
                                  ? 'Yes'
                                  : account.telegram_spam_block === 0
                                    ? 'No'
                                    : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Spam Block</div>
                            </div>

                            {/* Last Activity */}
                            <div className='text-center'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {account.telegram_last_seen
                                  ? new Date(account.telegram_last_seen * 1000).toLocaleDateString(
                                      'en-US',
                                      {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      }
                                    )
                                  : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Last Activity</div>
                            </div>

                            {/* Telegram Premium */}
                            <div className='text-center'>
                              <div
                                className={`font-medium text-lg mb-1 ${account.telegram_premium ? 'text-yellow-400' : 'text-gray-400'}`}
                              >
                                {account.telegram_premium ? 'Yes' : 'No'}
                              </div>
                              <div className='text-gray-400 text-sm'>Telegram Premium</div>
                            </div>

                            {/* ID Digit Count */}
                            <div className='text-center'>
                              <div className='text-blue-400 font-medium text-lg mb-1'>
                                {account.telegram_id_count || '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>ID Digit Count</div>
                            </div>

                            {/* Chats */}
                            <div className='text-center'>
                              <div className='text-purple-400 font-medium text-lg mb-1'>
                                {account.telegram_chats_count || '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>Chats</div>
                            </div>

                            {/* Subscribed Channels */}
                            <div className='text-center'>
                              <div className='text-cyan-400 font-medium text-lg mb-1'>
                                {account.telegram_channels_count || '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>Subscribed Channels</div>
                            </div>

                            {/* Conversations */}
                            <div className='text-center'>
                              <div className='text-green-400 font-medium text-lg mb-1'>
                                {account.telegram_conversations_count || '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>Conversations</div>
                            </div>

                            {/* Contacts */}
                            <div className='text-center'>
                              <div className='text-orange-400 font-medium text-lg mb-1'>
                                {account.telegram_contacts_count || '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>Contacts</div>
                            </div>

                            {/* Telegram Stars */}
                            <div className='text-center'>
                              <div className='text-yellow-400 font-medium text-lg mb-1'>
                                {account.telegram_stars_count || '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>Telegram Stars</div>
                            </div>

                            {/* Admin Count */}
                            <div className='text-center'>
                              <div className='text-red-400 font-medium text-lg mb-1'>
                                {account.telegram_admin_count || '0'}
                              </div>
                              <div className='text-gray-400 text-sm'>Admin Channels</div>
                            </div>

                            {/* Age Verification */}
                            <div className='text-center'>
                              <div className='text-gray-400 font-medium text-lg mb-1'>
                                {account.telegram_birthday ? 'Verified' : 'Unknown'}
                              </div>
                              <div className='text-gray-400 text-sm'>Specified Age of Owner</div>
                            </div>
                          </div>
                        </div>

                        {/* Additional Information */}
                        {(account.telegram_premium_expires ||
                          account.telegram_gifts_count > 0 ||
                          account.telegram_dc_id) && (
                          <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                            <h3 className='text-white font-bold text-xl mb-4 text-center'>
                              Additional Details
                            </h3>
                            <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
                              {/* Data Center */}
                              {account.telegram_dc_id && (
                                <div className='text-center'>
                                  <div className='text-blue-400 font-medium text-lg mb-1'>
                                    DC {account.telegram_dc_id}
                                  </div>
                                  <div className='text-gray-400 text-sm'>Data Center</div>
                                </div>
                              )}

                              {/* Premium Expires */}
                              {account.telegram_premium_expires &&
                                account.telegram_premium_expires > 0 && (
                                  <div className='text-center'>
                                    <div className='text-yellow-400 font-medium text-lg mb-1'>
                                      {new Date(
                                        account.telegram_premium_expires * 1000
                                      ).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </div>
                                    <div className='text-gray-400 text-sm'>Premium Expires</div>
                                  </div>
                                )}

                              {/* Gifts Count */}
                              {account.telegram_gifts_count > 0 && (
                                <div className='text-center'>
                                  <div className='text-pink-400 font-medium text-lg mb-1'>
                                    {account.telegram_gifts_count}
                                  </div>
                                  <div className='text-gray-400 text-sm'>Gifts Received</div>
                                </div>
                              )}

                              {/* NFT Gifts */}
                              {account.telegram_gifts_nft_count > 0 && (
                                <div className='text-center'>
                                  <div className='text-purple-400 font-medium text-lg mb-1'>
                                    {account.telegram_gifts_nft_count}
                                  </div>
                                  <div className='text-gray-400 text-sm'>NFT Gifts</div>
                                </div>
                              )}

                              {/* Gift Stars */}
                              {account.telegram_gifts_stars > 0 && (
                                <div className='text-center'>
                                  <div className='text-yellow-400 font-medium text-lg mb-1'>
                                    {account.telegram_gifts_stars}
                                  </div>
                                  <div className='text-gray-400 text-sm'>Gift Stars</div>
                                </div>
                              )}

                              {/* Password Protected */}
                              {account.telegram_password !== undefined && (
                                <div className='text-center'>
                                  <div
                                    className={`font-medium text-lg mb-1 ${account.telegram_password ? 'text-green-400' : 'text-gray-400'}`}
                                  >
                                    {account.telegram_password ? 'Yes' : 'No'}
                                  </div>
                                  <div className='text-gray-400 text-sm'>Password Protected</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Gifts Section */}
                        {account.telegram_gifts && account.telegram_gifts !== '[]' && (
                          <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                            <h3 className='text-white font-bold text-xl mb-4 text-center'>
                              Telegram Gifts
                            </h3>
                            <div className='text-center'>
                              <div className='text-gray-400'>
                                {(() => {
                                  try {
                                    const gifts = JSON.parse(account.telegram_gifts)
                                    if (gifts.length === 0) {
                                      return 'No gifts received'
                                    }
                                    return `${gifts.length} gift(s) received`
                                  } catch (e) {
                                    return 'Gift data available'
                                  }
                                })()}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : getAccountPlatform() === 'Social Club' ? (
                      // Social Club specific stats
                      <>
                        <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                          <div className='flex items-center justify-between mb-4'>
                            <h3 className='text-lg font-semibold text-white flex items-center'>
                              <Icon
                                icon='simple-icons:rockstargames'
                                className='mr-2 text-orange-400'
                              />
                              Social Club Account
                            </h3>
                            <div className='text-sm text-gray-400'>
                              Level {account.socialclub_level || 'N/A'}
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
                            <div className='bg-gray-700 p-3 rounded-lg text-center'>
                              <div className='text-white font-bold text-lg'>
                                {account.socialclub_level || 'N/A'}
                              </div>
                              <div className='text-gray-400 text-xs'>GTA Online Level</div>
                            </div>
                            <div className='bg-gray-700 p-3 rounded-lg text-center'>
                              <div className='text-green-400 font-bold text-lg'>
                                ${account.socialclub_cash?.toLocaleString() || '0'}
                              </div>
                              <div className='text-gray-400 text-xs'>GTA Online Cash</div>
                            </div>
                            <div className='bg-gray-700 p-3 rounded-lg text-center'>
                              <div className='text-blue-400 font-bold text-lg'>
                                ${account.socialclub_bank_cash?.toLocaleString() || '0'}
                              </div>
                              <div className='text-gray-400 text-xs'>GTA Online Bank Cash</div>
                            </div>
                            <div className='bg-gray-700 p-3 rounded-lg text-center'>
                              <div className='text-purple-400 font-bold text-lg'>
                                {account.socialclub_last_activity
                                  ? new Date(
                                      account.socialclub_last_activity * 1000
                                    ).toLocaleDateString()
                                  : 'N/A'}
                              </div>
                              <div className='text-gray-400 text-xs'>Last Activity</div>
                            </div>
                          </div>
                        </div>

                        {/* Games Section */}
                        {account.socialclubGames && account.socialclubGames.length > 0 && (
                          <div className='bg-gray-800 p-6 rounded-lg border border-gray-600'>
                            <div className='flex items-center justify-between mb-4'>
                              <h3 className='text-lg font-semibold text-white flex items-center'>
                                <Icon icon='mdi:gamepad-variant' className='mr-2 text-orange-400' />
                                Games Library
                              </h3>
                              <div className='text-sm text-gray-400'>
                                {account.socialclubGames.length} games
                              </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                              {account.socialclubGames.map((game, index) => (
                                <div
                                  key={index}
                                  className='bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-orange-500 transition-all duration-300'
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
                                      className={`w-12 h-12 bg-gray-600 rounded flex items-center justify-center ${game.img ? 'hidden' : ''}`}
                                    >
                                      <Icon
                                        icon='mdi:gamepad-variant'
                                        className='text-gray-400 text-xl'
                                      />
                                    </div>
                                    <div className='flex-1'>
                                      <h4 className='text-white font-medium text-sm'>
                                        {game.title}
                                      </h4>
                                      <div className='text-xs text-gray-400 mt-1'>
                                        {game.abbr || 'Rockstar Game'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
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

                      {/* Games Grid Gallery - Compact View */}
                      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
                        {Object.values(account.steam_full_games.list)
                          .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
                          .slice(0, showAllGames ? undefined : 12)
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
                                  <div className='absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full backdrop-blur-sm'>
                                    {formatPlaytime(game.playtime_forever)}
                                  </div>
                                )}
                              </div>
                              <div className='p-2'>
                                <h4 className='text-white font-medium text-xs leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors'>
                                  {game.title}
                                </h4>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* View More Games Button */}
                      {Object.keys(account.steam_full_games.list).length > 12 && (
                        <div className='text-center pt-2'>
                          <button
                            onClick={() => setShowAllGames(!showAllGames)}
                            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto text-sm'
                          >
                            <svg
                              className={`w-4 h-4 transition-transform ${showAllGames ? 'rotate-180' : ''}`}
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
                            {showAllGames
                              ? `Show Less`
                              : `Show All ${Object.keys(account.steam_full_games.list).length} Games`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                {/* Steam Transactions Section */}
                {getAccountPlatform() === 'Steam' &&
                  account.steamTransactions &&
                  account.steamTransactions.length > 0 && (
                    <div className='space-y-4'>
                      <h3 className='text-xl font-bold text-white flex items-center gap-3'>
                        <svg
                          className='w-6 h-6 text-green-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path d='M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z' />
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z'
                            clipRule='evenodd'
                          />
                        </svg>
                        Transactions
                      </h3>

                      {/* Transaction Summary Stats */}
                      <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
                        <div className='grid grid-cols-3 gap-4'>
                          <div className='text-center'>
                            <div className='text-gray-400 text-sm mb-1'>Total Spent</div>
                            <div className='text-green-400 font-bold text-lg'>
                              {(() => {
                                const total = account.steamTransactions.reduce((sum, t) => {
                                  const amount = t.amount.replace(/[^\d.,]/g, '').replace(',', '.')
                                  const num = parseFloat(amount) || 0
                                  return sum + num
                                }, 0)
                                return `$${total.toFixed(2)}`
                              })()}
                            </div>
                          </div>
                          <div className='text-center'>
                            <div className='text-gray-400 text-sm mb-1'>Refunds</div>
                            <div className='text-yellow-400 font-bold text-lg'>$0.00</div>
                          </div>
                          <div className='text-center'>
                            <div className='text-gray-400 text-sm mb-1'>In-Game Purchases</div>
                            <div className='text-blue-400 font-bold text-lg'>
                              {(() => {
                                const inGameTotal = account.steamTransactions
                                  .filter(t => t.type.includes('In-Game'))
                                  .reduce((sum, t) => {
                                    const amount = t.amount
                                      .replace(/[^\d.,]/g, '')
                                      .replace(',', '.')
                                    const num = parseFloat(amount) || 0
                                    return sum + num
                                  }, 0)
                                return `$${inGameTotal.toFixed(2)}`
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Info Message */}
                      <div className='bg-orange-500/10 border border-orange-500/30 rounded-lg p-3'>
                        <p className='text-orange-400 text-sm text-center'>
                          💡 You can look in the transactions if you are looking for a DLC
                        </p>
                      </div>

                      {/* Transactions Table */}
                      <div className='bg-gray-800 rounded-lg border border-gray-600 overflow-hidden'>
                        <div className='max-h-[400px] overflow-y-auto'>
                          <table className='w-full'>
                            <thead className='bg-gray-900 sticky top-0 z-10'>
                              <tr>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                  Title
                                </th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                  Total
                                </th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                  Date
                                </th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                  Type
                                </th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                  Source
                                </th>
                              </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-700'>
                              {account.steamTransactions.map((transaction, index) => (
                                <tr key={index} className='hover:bg-gray-700/50 transition-colors'>
                                  <td className='px-4 py-3 text-sm text-white max-w-xs'>
                                    <div className='line-clamp-2'>{transaction.product}</div>
                                  </td>
                                  <td className='px-4 py-3 text-sm text-green-400 font-medium whitespace-nowrap'>
                                    {transaction.amount}
                                  </td>
                                  <td className='px-4 py-3 text-sm text-gray-400 whitespace-nowrap'>
                                    {(() => {
                                      const timestamp = parseInt(transaction.date)
                                      const date = new Date(timestamp * 1000)
                                      return date.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })
                                    })()}
                                  </td>
                                  <td className='px-4 py-3 text-sm text-gray-300'>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        transaction.type.includes('Purchase')
                                          ? 'bg-blue-500/20 text-blue-400'
                                          : transaction.type.includes('Market')
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : transaction.type.includes('In-Game')
                                              ? 'bg-yellow-500/20 text-yellow-400'
                                              : transaction.type.includes('Conversion')
                                                ? 'bg-gray-500/20 text-gray-400'
                                                : 'bg-green-500/20 text-green-400'
                                      }`}
                                    >
                                      {transaction.type}
                                    </span>
                                  </td>
                                  <td className='px-4 py-3 text-sm text-gray-400 max-w-xs'>
                                    <div className='line-clamp-1'>{transaction.source}</div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
                <a
                  href='https://t.me/mgissella'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center'
                >
                  <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.820 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
                  </svg>
                  Contact Senja Games
                </a>
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
