import { Icon } from '@iconify/react'
import React, { useCallback, useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import AccountDetailPage from './components/AccountDetailPage'
import BattleNetFilters from './components/BattleNetFilters'
import CartModal from './components/CartModal'
// Commented out - not in 12 chosen categories
// import ChatGPTFilters from './components/ChatGPTFilters'
import Dashboard from './components/Dashboard'
// Commented out - not in 12 chosen categories
// import DiscordFilters from './components/DiscordFilters'
// import DiscordPage from './components/DiscordPage'
import EpicFilters from './components/EpicFilters'
// Commented out - not in 12 chosen categories
// import EscapeFromTarkovFilters from './components/EscapeFromTarkovFilters'
// import EscapeFromTarkovPage from './components/EscapeFromTarkovPage'
import FortniteFilters from './components/FortniteFilters'
// Commented out - not in 12 chosen categories
// import GiftsFilters from './components/GiftsFilters'
import InfiniteBattleNetAccountsContainer from './components/InfiniteBattleNetAccountsContainer'
// Commented out - not in 12 chosen categories
// import InfiniteChatGPTAccountsContainer from './components/InfiniteChatGPTAccountsContainer'
// import InfiniteDiscordAccountsContainer from './components/InfiniteDiscordAccountsContainer'
import InfiniteEpicAccountsContainer from './components/InfiniteEpicAccountsContainer'
// Commented out - not in 12 chosen categories
// import InfiniteEscapeFromTarkovAccountsContainer from './components/InfiniteEscapeFromTarkovAccountsContainer'
import InfiniteFortniteAccountsContainer from './components/InfiniteFortniteAccountsContainer'
// Commented out - not in 12 chosen categories
// import InfiniteGiftsAccountsContainer from './components/InfiniteGiftsAccountsContainer'
// import InfiniteInstagramAccountsContainer from './components/InfiniteInstagramAccountsContainer'
import InfiniteMiHoyoAccountsContainer from './components/InfiniteMiHoyoAccountsContainer'
import InfiniteMinecraftAccountsContainer from './components/InfiniteMinecraftAccountsContainer'
import InfiniteRiotAccountsContainer from './components/InfiniteRiotAccountsContainer'
import InfiniteRobloxAccountsContainer from './components/InfiniteRobloxAccountsContainer'
import InfiniteSocialClubAccountsContainer from './components/InfiniteSocialClubAccountsContainer'
import InfiniteSteamAccountsContainer from './components/InfiniteSteamAccountsContainer'
// Commented out - not in 12 chosen categories
// import InfiniteTikTokAccountsContainer from './components/InfiniteTikTokAccountsContainer'
import InfiniteUplayAccountsContainer from './components/InfiniteUplayAccountsContainer'
// Commented out - not in 12 chosen categories
// import InfiniteVPNAccountsContainer from './components/InfiniteVPNAccountsContainer'
// import InfiniteWotAccountsContainer from './components/InfiniteWotAccountsContainer'
// import InstagramFilters from './components/InstagramFilters'
import Login from './components/Login'
import MiHoyoFilters from './components/MiHoyoFilters'
import MinecraftFilters from './components/MinecraftFilters'
import MinecraftPage from './components/MinecraftPage'
import OriginPage from './components/OriginPage'
import PaymentModal from './components/PaymentModal'
import ProtectedRoute from './components/ProtectedRoute'
import RiotFilters from './components/RiotFilters'
import RobloxFilters from './components/RobloxFilters'
import Signup from './components/Signup'
import SocialClubFilters from './components/SocialClubFilters'
import SteamFilters from './components/SteamFilters'
import SupercellPage from './components/SupercellPage'
import TelegramPage from './components/TelegramPage'
// Commented out - not in 12 chosen categories
// import TikTokFilters from './components/TikTokFilters'
import UplayFilters from './components/UplayFilters'
import UplayPage from './components/UplayPage'
// Commented out - not in 12 chosen categories
// import VPNFilters from './components/VPNFilters'
import { useAuth } from './context/AuthContext'
import { useCart } from './context/CartContext'

import { CartProvider } from './context/CartContext'

// Import local SVG icons
import miHoYoIcon from './assets/68258c779c36b-miHoYo.svg'
import battleNetIcon from './assets/icons8-battle-net.svg'
import epicGamesIcon from './assets/icons8-epic-games.svg'
import fortniteIcon from './assets/icons8-fortnite.svg'
import instagramIcon from './assets/icons8-instagram.svg'
import steamIcon from './assets/icons8-steam.svg'
import supercellIcon from './assets/icons8-supercell.svg'
import worldOfTanksBlitzIcon from './assets/icons8-world-of-tanks-blitz.svg'
import worldOfTanksIcon from './assets/icons8-world-of-tanks.svg'

function MainPage() {
  // Remove lztCategories state - using static categories only
  const [steamFilters, setSteamFilters] = useState({}) // State for Steam filters
  const [fortniteFilters, setFortniteFilters] = useState({}) // State for Fortnite filters
  const [mihoyoFilters, setMihoyoFilters] = useState({}) // State for MiHoYo filters
  const [epicFilters, setEpicFilters] = useState({}) // State for Epic Games filters
  // Commented out - not in 12 chosen categories
  // const [escapeFromTarkovFilters, setEscapeFromTarkovFilters] = useState({}) // State for Escape from Tarkov filters
  // const [giftsFilters, setGiftsFilters] = useState({}) // State for Gifts filters
  const [minecraftFilters, setMinecraftFilters] = useState({}) // State for Minecraft filters
  const [riotFilters, setRiotFilters] = useState({}) // State for Riot filters
  const [socialClubFilters, setSocialClubFilters] = useState({}) // State for Social Club filters
  const [uplayFilters, setUplayFilters] = useState({}) // State for Uplay filters
  // Commented out - not in 12 chosen categories
  // const [discordFilters, setDiscordFilters] = useState({}) // State for Discord filters
  // const [tiktokFilters, setTiktokFilters] = useState({}) // State for TikTok filters
  // const [instagramFilters, setInstagramFilters] = useState({}) // State for Instagram filters
  // const [chatgptFilters, setChatgptFilters] = useState({}) // State for ChatGPT filters
  const [battlenetFilters, setBattlenetFilters] = useState({}) // State for Battle.net filters
  // Commented out - not in 12 chosen categories
  // const [vpnFilters, setVpnFilters] = useState({}) // State for VPN filters
  const [robloxFilters, setRobloxFilters] = useState({}) // State for Roblox filters
  const [currentGameType, setCurrentGameType] = useState('Steam') // Track current game type
  const [cartModalOpen, setCartModalOpen] = useState(false)
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, item: null })
  const [nameUpdate, setNameUpdate] = useState({ show: false, value: '' })
  const { user, signOut, updateUserProfile } = useAuth()
  const { totalItems, addToCart } = useCart()

  // Local state for categories and accounts (removed useZelenkaAccounts)
  const [selectedCategory, setSelectedCategory] = useState('Steam')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [filteredAccounts, setFilteredAccounts] = useState([])

  // Helper functions for category management
  const changeCategory = category => {
    setSelectedCategory(category)
    setCurrentGameType(category)
  }

  const updateSteamFilters = newFilters => {
    setSteamFilters(newFilters)
  }

  const updateEpicFilters = newFilters => {
    setEpicFilters(newFilters)
  }

  // Commented out - not in 12 chosen categories
  // const updateGiftsFilters = newFilters => {
  //   setGiftsFilters(newFilters)
  // }

  const updateUplayFilters = newFilters => {
    setUplayFilters(newFilters)
  }

  // Commented out - not in 12 chosen categories
  // const updateDiscordFilters = newFilters => {
  //   setDiscordFilters(newFilters)
  // }

  // const updateTiktokFilters = newFilters => {
  //   setTiktokFilters(newFilters)
  // }

  // const updateInstagramFilters = useCallback(newFilters => {
  //   setInstagramFilters(newFilters)
  // }, [])

  // const updateChatgptFilters = useCallback(newFilters => {
  //   setChatgptFilters(newFilters)
  // }, [])

  const updateBattlenetFilters = useCallback(newFilters => {
    setBattlenetFilters(newFilters)
  }, [])

  // Commented out - not in 12 chosen categories
  // const updateVpnFilters = useCallback(newFilters => {
  //   setVpnFilters(newFilters)
  // }, [])

  const updateRobloxFilters = useCallback(newFilters => {
    setRobloxFilters(newFilters)
  }, [])

  // Static categories only - no need to load from LZT API

  // Force Steam as default category only on initial load (not on category changes)
  useEffect(() => {
    if (selectedCategory !== 'Steam' && !loading && selectedCategory === '') {
      changeCategory('Steam')
      setCurrentGameType('Steam')
    }
  }, [loading, changeCategory]) // Removed selectedCategory from dependencies

  // Clear accounts when switching to custom categories that have their own components
  useEffect(() => {
    if (
      selectedCategory === 'Steam' ||
      selectedCategory === 'Epic Games' ||
      // selectedCategory === 'Gifts' ||  // Commented out - not in 12 chosen categories
      selectedCategory === 'Fortnite' ||
      isEpicGamesCategory(selectedCategory) ||
      isMiHoyoCategory(selectedCategory) ||
      isRiotCategory(selectedCategory) ||
      isTelegramCategory(selectedCategory) ||
      isSupercellCategory(selectedCategory) ||
      isOriginCategory(selectedCategory) ||
      // isDiscordCategory(selectedCategory) ||  // Commented out - not in 12 chosen categories
      // isInstagramCategory(selectedCategory) ||  // Commented out - not in 12 chosen categories
      // isChatGPTCategory(selectedCategory) ||  // Commented out - not in 12 chosen categories
      isMinecraftCategory(selectedCategory) ||
      // isEscapeFromTarkovCategory(selectedCategory) ||  // Commented out - not in 12 chosen categories
      isSocialClubCategory(selectedCategory) ||
      // isTikTokCategory(selectedCategory) ||  // Commented out - not in 12 chosen categories
      isRobloxCategory(selectedCategory) ||
      isBattleNetCategory(selectedCategory) ||
      // isVPNCategory(selectedCategory) ||  // Commented out - not in 12 chosen categories
      isWotCategory(selectedCategory)
    ) {
      // Clear the general accounts state for custom categories
      setAccounts([])
      setFilteredAccounts([])
      setError(null)
    }
  }, [selectedCategory])

  // Handle name update
  const handleNameUpdate = async () => {
    if (!nameUpdate.value.trim()) return

    try {
      await updateUserProfile(nameUpdate.value.trim())
      setNameUpdate({ show: false, value: '' })
    } catch (error) {
      console.error('Error updating name:', error)
      alert('Gagal mengupdate nama. Silakan coba lagi.')
    }
  }

  // Map LZT category names to icons (with fallbacks to your existing icons)
  const getCategoryIcon = (categoryName, categoryTitle) => {
    const iconMap = {
      // Gaming platforms
      steam: steamIcon,
      fortnite: fortniteIcon,
      epicgames: epicGamesIcon,
      eg: epicGamesIcon,
      mihoyo: miHoYoIcon,
      riot: 'simple-icons:riotgames',
      ea: 'simple-icons:ea',
      battlenet: battleNetIcon,
      uplay: 'simple-icons:ubisoft',
      socialclub: 'simple-icons:rockstargames',

      // Game titles
      minecraft: 'vscode-icons:file-type-minecraft',
      tarkov: 'twemoji:crossed-swords',
      wot: worldOfTanksIcon,
      supercell: supercellIcon,
      wf: 'material-symbols:sports-esports',

      // Social & Communication
      telegram: 'logos:telegram',
      discord: 'logos:discord-icon',
      tiktok: 'logos:tiktok-icon',
      instagram: instagramIcon,

      // Services & Others
      gifts: 'mdi:gift',
      chatgpt: 'simple-icons:openai',
      vpn: 'material-symbols:vpn-lock',
      roblox: 'simple-icons:roblox'
    }

    return iconMap[categoryName] || 'mdi:gamepad-variant'
  }

  // Check if icon is local (SVG import) or external (iconify)
  const isLocalIcon = icon => {
    return (
      typeof icon === 'string' &&
      (icon.includes('.svg') ||
        icon === steamIcon ||
        icon === fortniteIcon ||
        icon === epicGamesIcon ||
        icon === miHoYoIcon ||
        icon === supercellIcon ||
        icon === worldOfTanksIcon ||
        icon === worldOfTanksBlitzIcon ||
        icon === instagramIcon ||
        icon === battleNetIcon)
    )
  }

  // Get category color based on category name
  const getCategoryColor = categoryName => {
    const colorMap = {
      steam: '#1B2838',
      fortnite: '#313131',
      mihoyo: '#FFB800',
      riot: '#FF4654',
      telegram: '#0088CC',
      supercell: '#FFD700',
      ea: '#FF6C37',
      wot: '#CD853F',
      eg: '#313131',
      gifts: '#FF69B4',
      minecraft: '#62B47A',
      tarkov: '#708090',
      socialclub: '#F2B807',
      uplay: '#0082FB',
      wt: '#DC143C',
      discord: '#5865F2',
      tiktok: '#FF0050',
      instagram: '#E4405F',
      battlenet: '#00AEFF',
      chatgpt: '#412991',
      vpn: '#00CED1',
      roblox: '#E13838',
      wf: '#FF6600'
    }
    return colorMap[categoryName] || '#8B5CF6'
  }

  // Create a stable, static categories array that never changes
  // Updated to show only the 12 chosen categories to align with Vercel function limit
  const categories = React.useMemo(() => {
    const staticCategories = [
      // Core 12 gaming categories
      { name: 'Steam', icon: steamIcon, color: '#1B2838', isLocal: true },
      { name: 'Epic Games', icon: epicGamesIcon, color: '#313131', isLocal: true },
      {
        name: 'Social Club Rockstar',
        displayName: 'Rockstar',
        icon: 'simple-icons:rockstargames',
        color: '#F2B807',
        isLocal: false
      },
      { name: 'Roblox', icon: 'simple-icons:roblox', color: '#E13838', isLocal: false },
      { name: 'miHoYo', icon: miHoYoIcon, color: '#FFB800', isLocal: true },
      {
        name: 'Minecraft',
        icon: 'vscode-icons:file-type-minecraft',
        color: '#62B47A',
        isLocal: false
      },
      {
        name: 'Uplay',
        displayName: 'Ubisoft',
        icon: 'simple-icons:ubisoft',
        color: '#0082FB',
        isLocal: false
      },
      {
        name: 'Battle.net',
        displayName: 'Battlenet',
        icon: battleNetIcon,
        color: '#00AEFF',
        isLocal: true
      },
      {
        name: 'Origin',
        displayName: 'EA',
        icon: 'simple-icons:ea',
        color: '#FF6C37',
        isLocal: false
      },
      { name: 'Riot', icon: 'simple-icons:riotgames', color: '#FF4654', isLocal: false },
      { name: 'Fortnite', icon: fortniteIcon, color: '#313131', isLocal: true },
      { name: 'Telegram', icon: 'logos:telegram', color: '#0088CC', isLocal: false }
    ]
    return staticCategories
  }, []) // Empty dependency array - never re-calculate

  // Helper function to check if category is MiHoYo-related
  const isMiHoyoCategory = categoryName => {
    return (
      categoryName === 'miHoYo' ||
      categoryName === 'mihoyo' ||
      (categoryName && categoryName.toLowerCase().includes('mihoyo'))
    )
  }

  // Helper function to check if category is Epic Games-related
  const isEpicGamesCategory = categoryName => {
    return (
      categoryName === 'Epic Games' ||
      categoryName === 'epic games' ||
      categoryName === 'epicgames' ||
      categoryName === 'eg' ||
      (categoryName && categoryName.toLowerCase().includes('epic'))
    )
  }

  // Helper function to check if category is Riot-related
  const isRiotCategory = categoryName => {
    return (
      categoryName === 'Riot' ||
      categoryName === 'riot' ||
      categoryName === 'Valorant' ||
      categoryName === 'valorant' ||
      (categoryName && categoryName.toLowerCase().includes('riot'))
    )
  }

  // Helper function to check if category is Telegram-related
  const isTelegramCategory = categoryName => {
    return (
      categoryName === 'Telegram' ||
      categoryName === 'telegram' ||
      (categoryName && categoryName.toLowerCase().includes('telegram'))
    )
  }

  // Helper function to check if category is Supercell-related
  const isSupercellCategory = categoryName => {
    return (
      categoryName === 'Supercell' ||
      categoryName === 'supercell' ||
      categoryName === 'Clash Royale' ||
      categoryName === 'clash royale' ||
      categoryName === 'Clash of Clans' ||
      categoryName === 'clash of clans' ||
      categoryName === 'Brawl Stars' ||
      categoryName === 'brawl stars' ||
      categoryName === 'Boom Beach' ||
      categoryName === 'boom beach' ||
      (categoryName && categoryName.toLowerCase().includes('supercell'))
    )
  }

  // Helper function to check if category is Origin/EA-related
  const isOriginCategory = categoryName => {
    if (!categoryName) return false
    const lowerName = categoryName.toLowerCase()

    return (
      categoryName === 'Origin' ||
      categoryName === 'EA' ||
      lowerName === 'origin' ||
      lowerName === 'ea' ||
      lowerName === 'electronic arts' ||
      lowerName.includes('ea (origin)') ||
      (lowerName.includes('origin') &&
        !lowerName.includes('steam') &&
        !lowerName.includes('fortnite')) ||
      (lowerName.includes('ea') &&
        !lowerName.includes('steam') &&
        !lowerName.includes('team') &&
        lowerName !== 'steam')
    )
  }

  // Helper function to check if category is Discord-related
  const isDiscordCategory = categoryName => {
    return (
      categoryName === 'Discord' ||
      categoryName === 'discord' ||
      (categoryName && categoryName.toLowerCase().includes('discord'))
    )
  }

  // Helper function to check if category is Instagram-related
  const isInstagramCategory = categoryName => {
    return (
      categoryName === 'Instagram' ||
      categoryName === 'instagram' ||
      (categoryName && categoryName.toLowerCase().includes('instagram'))
    )
  }

  // Helper function to check if category is ChatGPT-related
  const isChatGPTCategory = categoryName => {
    const result =
      categoryName === 'ChatGPT' ||
      categoryName === 'chatgpt' ||
      (categoryName && categoryName.toLowerCase().includes('chatgpt'))
    return result
  }

  // Helper function to check if category is Minecraft-related
  const isMinecraftCategory = categoryName => {
    return (
      categoryName === 'Minecraft' ||
      categoryName === 'minecraft' ||
      (categoryName && categoryName.toLowerCase().includes('minecraft'))
    )
  }

  // Helper function to check if category is Escape From Tarkov-related
  const isEscapeFromTarkovCategory = categoryName => {
    return (
      categoryName === 'Escape from Tarkov' ||
      categoryName === 'escapefromtarkov' ||
      categoryName === 'tarkov' ||
      (categoryName && categoryName.toLowerCase().includes('tarkov'))
    )
  }

  // Helper function to check if category is Social Club-related
  const isSocialClubCategory = categoryName => {
    return (
      categoryName === 'Social Club' ||
      categoryName === 'Social Club Rockstar' ||
      categoryName === 'socialclub' ||
      categoryName === 'rockstar' ||
      (categoryName && categoryName.toLowerCase().includes('social')) ||
      (categoryName && categoryName.toLowerCase().includes('club'))
    )
  }

  // Helper function to check if category is TikTok-related
  const isTikTokCategory = categoryName => {
    return (
      categoryName === 'TikTok' ||
      categoryName === 'tiktok' ||
      (categoryName && categoryName.toLowerCase().includes('tiktok'))
    )
  }

  // Helper function to check if category is Roblox-related
  const isRobloxCategory = categoryName => {
    return (
      categoryName === 'Roblox' ||
      categoryName === 'roblox' ||
      (categoryName && categoryName.toLowerCase().includes('roblox'))
    )
  }

  // Helper function to check if category is Battle.net-related
  const isBattleNetCategory = categoryName => {
    return (
      categoryName === 'Battle.net' ||
      categoryName === 'BattleNet' ||
      categoryName === 'battlenet' ||
      categoryName === 'battle.net'
    )
  }

  // Helper function to check if category is VPN-related
  const isVPNCategory = categoryName => {
    return (
      categoryName === 'VPN' ||
      categoryName === 'vpn' ||
      (categoryName && categoryName.toLowerCase().includes('vpn'))
    )
  }

  // Helper function to check if category is World of Tanks-related
  const isWotCategory = categoryName => {
    return (
      categoryName === 'World of Tanks' ||
      categoryName === 'WorldofTanks' ||
      categoryName === 'wot' ||
      categoryName === 'WOT' ||
      categoryName === 'World of Tanks Lesta Games' ||
      (categoryName && categoryName.toLowerCase().includes('world of tanks')) ||
      (categoryName && categoryName.toLowerCase().includes('wot'))
    )
  }

  // Custom category change handler to handle special pages
  const handleCategoryClick = categoryName => {
    if (categoryName === 'Steam') {
      // Stay on main page but set Steam mode
      setCurrentGameType('Steam')
      changeCategory('Steam') // This will set the filters and context
    } else if (categoryName === 'Fortnite') {
      // Stay on main page but set Fortnite mode
      setCurrentGameType('Fortnite')
      changeCategory('Fortnite') // This will set the filters and context
    } else if (isEpicGamesCategory(categoryName)) {
      // Stay on main page but set Epic Games mode
      setCurrentGameType('Epic Games')
      changeCategory('Epic Games') // This will set the filters and context
    } else if (isMiHoyoCategory(categoryName)) {
      // Stay on main page but set MiHoYo mode
      setCurrentGameType('miHoYo')
      changeCategory('miHoYo') // This will set the filters and context
    } else if (isRiotCategory(categoryName)) {
      // Stay on main page but set Riot mode
      setCurrentGameType('Riot')
      changeCategory('Riot') // This will set the filters and context
    } else if (isTelegramCategory(categoryName)) {
      // Stay on main page but set Telegram mode
      setCurrentGameType('Telegram')
      changeCategory('Telegram') // This will set the filters and context
    } else if (isSupercellCategory(categoryName)) {
      // Stay on main page but set Supercell mode
      setCurrentGameType('Supercell')
      changeCategory('Supercell') // This will set the filters and context
    } else if (isOriginCategory(categoryName)) {
      // Stay on main page but set EA mode (display as Origin)
      setCurrentGameType('Origin')
      changeCategory('EA') // Use EA internally for API compatibility
    } else if (isDiscordCategory(categoryName)) {
      // Stay on main page but set Discord mode
      setCurrentGameType('Discord')
      changeCategory('Discord') // This will set the filters and context
    } else if (isInstagramCategory(categoryName)) {
      // Stay on main page but set Instagram mode
      setCurrentGameType('Instagram')
      changeCategory('Instagram') // This will set the filters and context
    } else if (isChatGPTCategory(categoryName)) {
      // Stay on main page but set ChatGPT mode
      setCurrentGameType('ChatGPT')
      changeCategory('ChatGPT') // This will set the filters and context
    } else if (isMinecraftCategory(categoryName)) {
      // Stay on main page but set Minecraft mode
      setCurrentGameType('Minecraft')
      changeCategory('Minecraft') // This will set the filters and context
    } else if (isEscapeFromTarkovCategory(categoryName)) {
      // Stay on main page but set Escape From Tarkov mode
      setCurrentGameType('Escape from Tarkov')
      changeCategory('Escape from Tarkov') // This will set the filters and context
    } else if (isSocialClubCategory(categoryName)) {
      // Stay on main page but set Social Club mode
      setCurrentGameType('Social Club')
      changeCategory('Social Club Rockstar') // This will set the filters and context
    } else if (categoryName === 'Uplay') {
      // Stay on main page but set Uplay mode
      setCurrentGameType('Uplay')
      changeCategory('Uplay') // This will set the filters and context
    } else if (isDiscordCategory(categoryName)) {
      // Stay on main page but set Discord mode
      setCurrentGameType('Discord')
      changeCategory('Discord') // This will set the filters and context
    } else if (isTikTokCategory(categoryName)) {
      // Stay on main page but set TikTok mode
      setCurrentGameType('TikTok')
      changeCategory('TikTok') // This will set the filters and context
    } else if (isRobloxCategory(categoryName)) {
      // Stay on main page but set Roblox mode
      setCurrentGameType('Roblox')
      changeCategory('Roblox') // This will set the filters and context
    } else if (isBattleNetCategory(categoryName)) {
      // Stay on main page but set Battle.net mode
      setCurrentGameType('Battle.net')
      changeCategory('Battle.net') // This will set the filters and context
    } else if (isVPNCategory(categoryName)) {
      // Stay on main page but set VPN mode
      setCurrentGameType('VPN')
      changeCategory('VPN') // This will set the filters and context
    } else if (isWotCategory(categoryName)) {
      // Stay on main page but set World of Tanks mode
      setCurrentGameType('World of Tanks')
      changeCategory('World of Tanks') // This will set the filters and context
    } else if (categoryName === 'ChatGPT') {
      // Handle ChatGPT specifically
      setCurrentGameType('ChatGPT')
      changeCategory('ChatGPT')
    } else {
      // For other categories, use the original changeCategory function
      setCurrentGameType('Other')
      changeCategory(categoryName)
    }
  }

  // Function to refresh accounts for non-custom categories
  const refreshAccounts = async () => {
    if (
      selectedCategory === 'Steam' ||
      selectedCategory === 'Fortnite' ||
      selectedCategory === 'Epic Games' ||
      isEpicGamesCategory(selectedCategory) ||
      isMiHoyoCategory(selectedCategory) ||
      isRiotCategory(selectedCategory) ||
      isTelegramCategory(selectedCategory) ||
      isSupercellCategory(selectedCategory) ||
      isOriginCategory(selectedCategory) ||
      isDiscordCategory(selectedCategory) ||
      isInstagramCategory(selectedCategory) ||
      isChatGPTCategory(selectedCategory) ||
      isMinecraftCategory(selectedCategory) ||
      isEscapeFromTarkovCategory(selectedCategory) ||
      isSocialClubCategory(selectedCategory) ||
      selectedCategory === 'Uplay' ||
      isTikTokCategory(selectedCategory) ||
      isRobloxCategory(selectedCategory) ||
      isBattleNetCategory(selectedCategory) ||
      isVPNCategory(selectedCategory) ||
      isWotCategory(selectedCategory)
    ) {
      // These categories are handled by their specific components
      return
    }

    setLoading(true)
    setError(null)

    try {
      // For other categories, fetch from LZT general endpoint
      const response = await fetch(`/api/lzt/accounts?category=${selectedCategory}&per_page=20`)
      const data = await response.json()

      if (data.success && data.items) {
        setAccounts(data.items)
        setFilteredAccounts(data.items)
      } else {
        setError(data.error || 'Failed to fetch accounts')
      }
    } catch (err) {
      console.error('Error fetching accounts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-r from-black via-gray-900 to-black overflow-x-hidden w-full'>
      {/* Header */}
      <header className='bg-gray-900/80 backdrop-blur-md border-b border-gray-800 shadow-xl'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            {/* Logo */}
            <div className='flex items-center'>
              <h1 className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
                SenjaGames.id
              </h1>
            </div>

            {/* Navigation */}
            <div className='flex items-center'>
              {user ? (
                <div className='flex items-center space-x-2 sm:space-x-4'>
                  {/* Welcome message - hidden on mobile */}
                  <div className='hidden lg:block'>
                    {!user.fullName && !nameUpdate.show ? (
                      <div className='flex items-center space-x-2'>
                        <span className='text-gray-300 text-sm'>
                          Selamat datang,{' '}
                          <span className='text-purple-400 font-medium'>
                            {user.email.split('@')[0]}
                          </span>
                        </span>
                        <button
                          onClick={() => setNameUpdate({ show: true, value: '' })}
                          className='text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors'
                        >
                          Set Nama
                        </button>
                      </div>
                    ) : nameUpdate.show ? (
                      <div className='flex items-center space-x-2'>
                        <span className='text-gray-300 text-sm'>Nama:</span>
                        <input
                          type='text'
                          value={nameUpdate.value}
                          onChange={e =>
                            setNameUpdate(prev => ({ ...prev, value: e.target.value }))
                          }
                          className='bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:border-purple-500 outline-none'
                          placeholder='Masukkan nama lengkap'
                          onKeyPress={e => e.key === 'Enter' && handleNameUpdate()}
                        />
                        <button
                          onClick={handleNameUpdate}
                          className='text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors'
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setNameUpdate({ show: false, value: '' })}
                          className='text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors'
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className='text-gray-300 text-sm'>
                        Selamat datang,{' '}
                        <span className='text-purple-400 font-medium'>{user.fullName}</span>
                      </span>
                    )}
                  </div>

                  {/* User avatar for mobile */}
                  <div className='lg:hidden flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full'>
                    <span className='text-white text-sm font-bold'>
                      {(user.fullName || user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Cart Icon */}
                  <button
                    onClick={() => setCartModalOpen(true)}
                    className='relative bg-gradient-to-r from-gray-700 to-gray-800 text-white p-2 sm:px-3 sm:py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg'
                  >
                    <Icon icon='mdi:shopping-cart' className='text-lg sm:text-xl' />
                    {totalItems > 0 && (
                      <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 font-bold animate-pulse'>
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </button>

                  {/* Action buttons */}
                  <Link
                    to='/dashboard'
                    className='bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-purple-500/25'
                  >
                    <span className='hidden sm:inline'>Dashboard</span>
                    <Icon icon='mdi:view-dashboard' className='sm:hidden text-lg' />
                  </Link>
                  <a
                    href='https://t.me/mgissella'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-blue-500/25 flex items-center justify-center'
                    title='Contact via Telegram'
                  >
                    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
                    </svg>
                  </a>
                  <button
                    onClick={() => signOut()}
                    className='bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-red-500/25'
                  >
                    <span className='hidden sm:inline'>Keluar</span>
                    <Icon icon='mdi:logout' className='sm:hidden text-lg' />
                  </button>
                </div>
              ) : (
                <div className='flex items-center space-x-2 sm:space-x-4'>
                  <Link
                    to='/login'
                    className='bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-purple-500/25'
                  >
                    <span className='hidden sm:inline'>Masuk</span>
                    <Icon icon='mdi:login' className='sm:hidden text-lg' />
                  </Link>
                  <Link
                    to='/signup'
                    className='bg-gradient-to-r from-pink-600 to-purple-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-pink-500/25'
                  >
                    <span className='hidden sm:inline'>Daftar</span>
                    <Icon icon='mdi:account-plus' className='sm:hidden text-lg' />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Categories */}
      <section className='py-8 relative' style={{ overflow: 'visible' }}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' style={{ overflow: 'visible' }}>
          <div
            className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4'
            style={{ overflow: 'visible' }}
          >
            {categories.map((category, index) => {
              return (
                <button
                  key={`${category.categoryName || category.name}-${index}`}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`relative group flex items-center justify-center p-4 rounded-lg transition-all duration-300 hover:scale-105 ${
                    selectedCategory === category.name
                      ? 'bg-gray-800 border border-purple-500'
                      : 'bg-gray-900 border border-gray-700 hover:border-purple-400'
                  }`}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  {category.isLocal ? (
                    <img src={category.icon} alt={category.name} className='w-8 h-8' />
                  ) : (
                    <Icon
                      icon={category.icon}
                      className='text-3xl'
                      style={{ color: category.color }}
                    />
                  )}

                  {/* Styled Tooltip */}
                  <div
                    className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-800 text-purple-300 text-xs font-medium rounded-lg border border-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-300 pointer-events-none whitespace-nowrap shadow-xl'
                    style={{
                      zIndex: 9999,
                      minWidth: 'max-content',
                      position: 'absolute',
                      top: 'auto',
                      bottom: '100%'
                    }}
                  >
                    {category.displayName || category.name}
                    <div
                      className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800'
                      style={{ zIndex: 9999 }}
                    ></div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Accounts Grid */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full overflow-x-hidden'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-3xl font-bold text-purple-400'>
            {currentGameType === 'Steam'
              ? 'Steam'
              : currentGameType === 'Epic Games'
                ? 'Epic Games'
                : currentGameType === 'Fortnite'
                  ? 'Fortnite'
                  : currentGameType === 'miHoYo'
                    ? 'miHoYo'
                    : currentGameType === 'Riot'
                      ? 'Riot'
                      : currentGameType === 'Telegram'
                        ? 'Telegram'
                        : currentGameType === 'Supercell'
                          ? 'Supercell'
                          : currentGameType === 'Origin'
                            ? 'Origin'
                            : selectedCategory}{' '}
            Accounts
          </h3>
          {/* Only show account count and refresh for non-Steam, non-Epic Games, non-Gifts, non-Fortnite, non-MiHoYo, and non-Riot categories */}
          {selectedCategory !== 'Steam' &&
            selectedCategory !== 'Epic Games' &&
            selectedCategory !== 'Gifts' &&
            !isEpicGamesCategory(selectedCategory) &&
            selectedCategory !== 'Fortnite' &&
            !isMiHoyoCategory(selectedCategory) &&
            !isRiotCategory(selectedCategory) && (
              <div className='flex items-center space-x-4'>
                <p className='text-gray-400'>{filteredAccounts.length} accounts found</p>
                <button
                  onClick={refreshAccounts}
                  className='bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors'
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            )}
        </div>

        {/* Steam Filters - Show only when Steam category is selected and NOT in special categories */}
        {selectedCategory === 'Steam' &&
          !isTelegramCategory(selectedCategory) &&
          !isSupercellCategory(selectedCategory) &&
          !isOriginCategory(selectedCategory) && (
            <SteamFilters
              onFilterChange={filters => {
                // Update local state for infinite scroll component
                setSteamFilters(filters)
              }}
              loading={loading}
            />
          )}

        {/* Epic Games Filters - Show only when Epic Games category is selected */}
        {(selectedCategory === 'Epic Games' || isEpicGamesCategory(selectedCategory)) && (
          <EpicFilters
            onFiltersChange={filters => {
              // Update local state for infinite scroll component
              setEpicFilters(filters)
            }}
            loading={loading}
          />
        )}

        {/* Gifts Filters - Show only when Gifts category is selected */}
        {selectedCategory === 'Gifts' && (
          <GiftsFilters
            onFiltersChange={filters => {
              // Update local state for infinite scroll component
              setGiftsFilters(filters)
            }}
            isLoading={loading}
          />
        )}

        {/* Fortnite Filters - Show only when Fortnite category is selected and NOT in special categories */}
        {selectedCategory === 'Fortnite' &&
          !isTelegramCategory(selectedCategory) &&
          !isSupercellCategory(selectedCategory) &&
          !isOriginCategory(selectedCategory) && (
            <FortniteFilters
              onFiltersChange={filters => {
                // Update local state for Fortnite accounts filtering
                setFortniteFilters(filters)
              }}
              loading={loading}
            />
          )}

        {/* MiHoYo Filters - Show only when miHoYo category is selected and NOT in special categories */}
        {isMiHoyoCategory(selectedCategory) &&
          !isTelegramCategory(selectedCategory) &&
          !isSupercellCategory(selectedCategory) &&
          !isOriginCategory(selectedCategory) && (
            <MiHoyoFilters
              onFilterChange={filters => {
                // Update local state for MiHoYo accounts filtering
                setMihoyoFilters(filters)
              }}
              loading={loading}
            />
          )}

        {/* Riot Filters - Show only when Riot category is selected and NOT in special categories */}
        {isRiotCategory(selectedCategory) &&
          !isTelegramCategory(selectedCategory) &&
          !isSupercellCategory(selectedCategory) &&
          !isOriginCategory(selectedCategory) && (
            <RiotFilters
              filters={riotFilters}
              setFilters={setRiotFilters}
              onApplyFilters={filters => {
                // Update local state for Riot accounts filtering
                setRiotFilters(filters)
              }}
              loading={loading}
            />
          )}

        {/* Minecraft Filters - Show only when Minecraft category is selected and NOT in special categories */}
        {isMinecraftCategory(selectedCategory) &&
          !isTelegramCategory(selectedCategory) &&
          !isSupercellCategory(selectedCategory) &&
          !isOriginCategory(selectedCategory) && (
            <MinecraftFilters
              onFiltersChange={filters => {
                // Update local state for Minecraft accounts filtering
                setMinecraftFilters(filters)
              }}
              initialFilters={minecraftFilters}
            />
          )}

        {/* Escape from Tarkov Filters - Show only when EFT category is selected and NOT in special categories */}
        {isEscapeFromTarkovCategory(selectedCategory) &&
          !isTelegramCategory(selectedCategory) &&
          !isSupercellCategory(selectedCategory) &&
          !isOriginCategory(selectedCategory) && (
            <EscapeFromTarkovFilters
              onFiltersChange={filters => {
                // Update local state for EFT accounts filtering
                setEscapeFromTarkovFilters(filters)
              }}
              initialFilters={escapeFromTarkovFilters}
            />
          )}

        {/* Social Club Filters - Show only when Social Club category is selected and NOT in special categories */}
        {isSocialClubCategory(selectedCategory) &&
          !isTelegramCategory(selectedCategory) &&
          !isSupercellCategory(selectedCategory) &&
          !isOriginCategory(selectedCategory) && (
            <SocialClubFilters
              onFiltersChange={filters => {
                // Update local state for Social Club accounts filtering
                setSocialClubFilters(filters)
              }}
              initialFilters={socialClubFilters}
            />
          )}

        {/* Uplay Filters - Show only when Uplay category is selected */}
        {selectedCategory === 'Uplay' && (
          <UplayFilters
            onFiltersChange={filters => {
              // Update local state for Uplay accounts filtering
              setUplayFilters(filters)
            }}
            initialFilters={uplayFilters}
          />
        )}

        {/* Discord Filters - Show only when Discord category is selected */}
        {isDiscordCategory(selectedCategory) && (
          <DiscordFilters
            onFiltersChange={filters => {
              // Update local state for Discord accounts filtering
              setDiscordFilters(filters)
            }}
            initialFilters={discordFilters}
          />
        )}

        {/* Instagram Filters - Show only when Instagram category is selected */}
        {isInstagramCategory(selectedCategory) && (
          <InstagramFilters
            onFiltersChange={updateInstagramFilters}
            initialFilters={instagramFilters}
          />
        )}

        {/* ChatGPT Filters - Show only when ChatGPT category is selected */}
        {isChatGPTCategory(selectedCategory) && (
          <ChatGPTFilters onFiltersChange={updateChatgptFilters} initialFilters={chatgptFilters} />
        )}

        {/* Battle.net Filters - Show only when Battle.net category is selected */}
        {isBattleNetCategory(selectedCategory) && (
          <BattleNetFilters
            onFiltersChange={updateBattlenetFilters}
            initialFilters={battlenetFilters}
          />
        )}

        {/* VPN Filters - Show only when VPN category is selected */}
        {isVPNCategory(selectedCategory) && (
          <VPNFilters onFiltersChange={updateVpnFilters} initialFilters={vpnFilters} />
        )}

        {/* Roblox Filters - Show only when Roblox category is selected */}
        {isRobloxCategory(selectedCategory) && (
          <RobloxFilters onFiltersChange={updateRobloxFilters} initialFilters={robloxFilters} />
        )}

        {/* TikTok Filters - Show only when TikTok category is selected */}
        {isTikTokCategory(selectedCategory) && (
          <TikTokFilters
            onFiltersChange={filters => {
              // Update local state for TikTok accounts filtering
              setTiktokFilters(filters)
            }}
            initialFilters={tiktokFilters}
          />
        )}

        {/* Telegram Page - Show only when Telegram category is selected */}
        {isTelegramCategory(selectedCategory) && <TelegramPage />}

        {/* Supercell Page - Show only when Supercell category is selected */}
        {isSupercellCategory(selectedCategory) && <SupercellPage />}

        {/* Origin Page - Show only when Origin or EA category is selected */}
        {(selectedCategory === 'EA' || isOriginCategory(selectedCategory)) && <OriginPage />}

        {/* Discord Page - Show only when Discord category is selected */}
        {isDiscordCategory(selectedCategory) && <InfiniteDiscordAccountsContainer />}

        {/* Instagram Page - Show only when Instagram category is selected */}
        {isInstagramCategory(selectedCategory) && (
          <InfiniteInstagramAccountsContainer filters={instagramFilters} />
        )}

        {/* ChatGPT Page - Show only when ChatGPT category is selected */}
        {isChatGPTCategory(selectedCategory) && (
          <InfiniteChatGPTAccountsContainer filters={chatgptFilters} />
        )}

        {/* TikTok Page - Show only when TikTok category is selected */}
        {isTikTokCategory(selectedCategory) && (
          <InfiniteTikTokAccountsContainer filters={tiktokFilters} />
        )}

        {/* Roblox Page - Show only when Roblox category is selected */}
        {isRobloxCategory(selectedCategory) && (
          <InfiniteRobloxAccountsContainer filters={robloxFilters} />
        )}

        {/* Battle.net Page - Show only when Battle.net category is selected */}
        {isBattleNetCategory(selectedCategory) && (
          <InfiniteBattleNetAccountsContainer filters={battlenetFilters} />
        )}

        {/* VPN Page - Show only when VPN category is selected */}
        {isVPNCategory(selectedCategory) && <InfiniteVPNAccountsContainer filters={vpnFilters} />}

        {/* VPN Page - Show only when VPN category is selected */}
        {isVPNCategory(selectedCategory) && <InfiniteVPNAccountsContainer filters={vpnFilters} />}

        {/* World of Tanks Page - Show only when World of Tanks category is selected */}
        {isWotCategory(selectedCategory) && <InfiniteWotAccountsContainer />}

        {/* Error State - Only for non-Steam, non-Epic Games, non-Gifts, non-Fortnite, non-MiHoYo, non-Riot, non-Telegram, non-Supercell, non-Origin, non-Discord, non-Instagram, non-Minecraft, non-TikTok, non-Roblox, non-Battle.net, and non-WOT categories */}
        {selectedCategory !== 'Steam' &&
          selectedCategory !== 'Epic Games' &&
          selectedCategory !== 'Gifts' &&
          !isEpicGamesCategory(selectedCategory) &&
          selectedCategory !== 'Fortnite' &&
          !isMiHoyoCategory(selectedCategory) &&
          !isRiotCategory(selectedCategory) &&
          !isTelegramCategory(selectedCategory) &&
          !isSupercellCategory(selectedCategory) &&
          !isOriginCategory(selectedCategory) &&
          !isDiscordCategory(selectedCategory) &&
          !isInstagramCategory(selectedCategory) &&
          !isChatGPTCategory(selectedCategory) &&
          !isTikTokCategory(selectedCategory) &&
          !isRobloxCategory(selectedCategory) &&
          !isBattleNetCategory(selectedCategory) &&
          !isVPNCategory(selectedCategory) &&
          !isWotCategory(selectedCategory) &&
          error && (
            <div className='bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6'>
              <p className='font-medium'>Error loading accounts:</p>
              <p className='text-sm mt-1'>{error}</p>
              <button
                onClick={refreshAccounts}
                className='mt-2 bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors'
              >
                Try Again
              </button>
            </div>
          )}

        {/* Loading State - Only for non-Steam, non-Epic Games, non-Gifts, non-Fortnite, non-MiHoYo, non-Riot, non-Telegram, non-Supercell, non-Origin, non-Discord, non-Instagram, non-Minecraft, non-TikTok, non-Roblox, non-Battle.net, and non-WOT categories */}
        {selectedCategory !== 'Steam' &&
          selectedCategory !== 'Epic Games' &&
          selectedCategory !== 'Gifts' &&
          !isEpicGamesCategory(selectedCategory) &&
          selectedCategory !== 'Fortnite' &&
          !isMiHoyoCategory(selectedCategory) &&
          !isRiotCategory(selectedCategory) &&
          !isTelegramCategory(selectedCategory) &&
          !isSupercellCategory(selectedCategory) &&
          !isOriginCategory(selectedCategory) &&
          !isDiscordCategory(selectedCategory) &&
          !isInstagramCategory(selectedCategory) &&
          !isChatGPTCategory(selectedCategory) &&
          !isTikTokCategory(selectedCategory) &&
          !isRobloxCategory(selectedCategory) &&
          !isBattleNetCategory(selectedCategory) &&
          !isVPNCategory(selectedCategory) &&
          !isWotCategory(selectedCategory) &&
          loading && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className='bg-gray-900 rounded-lg shadow-lg border border-gray-700 p-6 animate-pulse'
                >
                  <div className='flex justify-between items-start mb-4'>
                    <div className='h-8 bg-gray-700 rounded w-20'></div>
                    <div className='h-6 bg-gray-700 rounded w-16'></div>
                  </div>
                  <div className='space-y-3 mb-4'>
                    <div className='h-4 bg-gray-700 rounded w-full'></div>
                    <div className='h-4 bg-gray-700 rounded w-3/4'></div>
                    <div className='h-4 bg-gray-700 rounded w-1/2'></div>
                  </div>
                  <div className='h-10 bg-gray-700 rounded w-full'></div>
                </div>
              ))}
            </div>
          )}

        {/* Accounts Display */}
        {selectedCategory === 'Steam' ? (
          <InfiniteSteamAccountsContainer filters={steamFilters} />
        ) : selectedCategory === 'Epic Games' || isEpicGamesCategory(selectedCategory) ? (
          <InfiniteEpicAccountsContainer filters={epicFilters} />
        ) : selectedCategory === 'Gifts' ? (
          <InfiniteGiftsAccountsContainer filters={giftsFilters} />
        ) : selectedCategory === 'Fortnite' ? (
          <InfiniteFortniteAccountsContainer filters={fortniteFilters} />
        ) : isMiHoyoCategory(selectedCategory) ? (
          <InfiniteMiHoyoAccountsContainer filters={mihoyoFilters} />
        ) : isRiotCategory(selectedCategory) ? (
          <InfiniteRiotAccountsContainer filters={riotFilters} />
        ) : isMinecraftCategory(selectedCategory) ? (
          <InfiniteMinecraftAccountsContainer filters={minecraftFilters} />
        ) : isEscapeFromTarkovCategory(selectedCategory) ? (
          <InfiniteEscapeFromTarkovAccountsContainer filters={escapeFromTarkovFilters} />
        ) : isSocialClubCategory(selectedCategory) ? (
          <InfiniteSocialClubAccountsContainer filters={socialClubFilters} />
        ) : selectedCategory === 'Uplay' ? (
          <InfiniteUplayAccountsContainer filters={uplayFilters} />
        ) : isDiscordCategory(selectedCategory) ? (
          <InfiniteDiscordAccountsContainer filters={discordFilters} />
        ) : isTelegramCategory(selectedCategory) ? null : isSupercellCategory(
            // Telegram accounts are handled by TelegramPage component above
            selectedCategory
          ) ? null : isInstagramCategory(selectedCategory) ? null : isChatGPTCategory(
            selectedCategory
          ) ? null : isTikTokCategory(selectedCategory) ? null : isRobloxCategory(
            selectedCategory
          ) ? null : isBattleNetCategory(selectedCategory) ? null : isVPNCategory(
            selectedCategory
          ) ? null : isWotCategory(selectedCategory) ? null : ( // Supercell accounts are handled by SupercellPage component above // Origin accounts are handled by OriginPage component above // Discord accounts are handled by InfiniteDiscordAccountsContainer component above // Instagram accounts are handled by InfiniteInstagramAccountsContainer component above // Minecraft accounts are handled by InfiniteMinecraftAccountsContainer component above // TikTok accounts are handled by InfiniteTikTokAccountsContainer component above // Roblox accounts are handled by InfiniteRobloxAccountsContainer component above // Battle.net accounts are handled by InfiniteBattleNetAccountsContainer component above // World of Tanks accounts are handled by InfiniteWotAccountsContainer component above
          // Only show LZT accounts for categories that are NOT our custom platforms
          !loading &&
          !error &&
          !isTelegramCategory(selectedCategory) &&
          !isSupercellCategory(selectedCategory) &&
          !isOriginCategory(selectedCategory) &&
          !isDiscordCategory(selectedCategory) &&
          !isInstagramCategory(selectedCategory) &&
          !isChatGPTCategory(selectedCategory) &&
          !isTikTokCategory(selectedCategory) &&
          !isRobloxCategory(selectedCategory) &&
          !isBattleNetCategory(selectedCategory) &&
          !isVPNCategory(selectedCategory) &&
          !isWotCategory(selectedCategory) &&
          selectedCategory !== 'Steam' &&
          selectedCategory !== 'Fortnite' &&
          !isMiHoyoCategory(selectedCategory) &&
          !isRiotCategory(selectedCategory) && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredAccounts.map(account => (
                <div
                  key={account.id}
                  className='bg-gray-900 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 p-6'
                >
                  <div className='flex justify-between items-start mb-4'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-3xl font-bold text-purple-400'>
                        {account.priceWithSellerFeeLabel || `$${account.price}`}
                      </span>
                      {account.hasWarranty && (
                        <span className='bg-green-600 text-white text-xs px-3 py-1 rounded-full'>
                          {account.warranty} warranty
                        </span>
                      )}
                      {account.guarantee?.durationPhrase && (
                        <span className='bg-green-600 text-white text-xs px-3 py-1 rounded-full'>
                          {account.guarantee.durationPhrase} guarantee
                        </span>
                      )}
                    </div>
                    <span className='bg-purple-600 text-white text-sm px-3 py-1 rounded-lg font-medium'>
                      {account.type}
                    </span>
                  </div>

                  <div className='space-y-3 mb-4'>
                    {(account.item_state || account.status) && (
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-400'>Status:</span>
                        <span className='text-gray-200 font-medium'>
                          {account.item_state || account.status}
                        </span>
                      </div>
                    )}
                    {(account.account_last_activity || account.lastSeen) && (
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-400'>Last seen:</span>
                        <span className='text-gray-200 font-medium'>
                          {account.account_last_activity
                            ? new Date(account.account_last_activity * 1000).toLocaleDateString()
                            : account.lastSeen}
                        </span>
                      </div>
                    )}
                    {(account.steam_country || account.country) && (
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-400'>Country:</span>
                        <span className='text-gray-200 font-medium'>
                          {account.steam_country || account.country}
                        </span>
                      </div>
                    )}
                    {account.item_origin && (
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-400'>Origin:</span>
                        <span className='text-gray-200 font-medium capitalize'>
                          {account.item_origin}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Telegram/Discord Stats */}
                  {account.chats !== undefined && (
                    <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
                      <div className='text-center p-2 bg-gray-800 rounded-lg border border-gray-600'>
                        <div className='font-bold text-purple-400 text-lg'>{account.chats}</div>
                        <div className='text-gray-400'>Chats</div>
                      </div>
                      <div className='text-center p-2 bg-gray-800 rounded-lg border border-gray-600'>
                        <div className='font-bold text-purple-400 text-lg'>{account.channels}</div>
                        <div className='text-gray-400'>Channels</div>
                      </div>
                    </div>
                  )}

                  {/* Instagram/TikTok Stats */}
                  {account.followers !== undefined && (
                    <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
                      <div className='text-center p-2 bg-gray-800 rounded-lg border border-gray-600'>
                        <div className='font-bold text-purple-400 text-lg'>{account.followers}</div>
                        <div className='text-gray-400'>Followers</div>
                      </div>
                      <div className='text-center p-2 bg-gray-800 rounded-lg border border-gray-600'>
                        <div className='font-bold text-purple-400 text-lg'>{account.following}</div>
                        <div className='text-gray-400'>Following</div>
                      </div>
                    </div>
                  )}

                  {/* Fortnite Stats */}
                  {account.level !== undefined && (
                    <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
                      <div className='text-center p-2 bg-gray-800 rounded-lg border border-gray-600'>
                        <div className='font-bold text-purple-400 text-lg'>{account.level}</div>
                        <div className='text-gray-400'>Level</div>
                      </div>
                      <div className='text-center p-2 bg-gray-800 rounded-lg border border-gray-600'>
                        <div className='font-bold text-purple-400 text-lg'>{account.skins}</div>
                        <div className='text-gray-400'>Skins</div>
                      </div>
                    </div>
                  )}

                  {/* miHoYo Stats */}
                  {account.characters !== undefined && (
                    <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
                      <div className='text-center p-2 bg-gray-800 rounded-lg border border-gray-600'>
                        <div className='font-bold text-purple-400 text-lg'>
                          {account.characters}
                        </div>
                        <div className='text-gray-400'>Characters</div>
                      </div>
                      <div className='text-center p-2 bg-gray-800 rounded-lg border border-gray-600'>
                        <div className='font-bold text-purple-400 text-lg'>{account.primogems}</div>
                        <div className='text-gray-400'>Primogems</div>
                      </div>
                    </div>
                  )}

                  {/* Valorant Stats */}
                  {account.rank !== undefined && (
                    <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
                      <div className='text-center p-2 bg-gray-800 rounded-lg border border-gray-600'>
                        <div className='font-bold text-purple-400 text-lg'>{account.rank}</div>
                        <div className='text-gray-400'>Rank</div>
                      </div>
                      <div className='text-center p-2 bg-gray-800 rounded-lg border border-gray-600'>
                        <div className='font-bold text-purple-400 text-lg'>{account.agents}</div>
                        <div className='text-gray-400'>Agents</div>
                      </div>
                    </div>
                  )}

                  {/* Roblox Stats */}
                  {account.robux !== undefined && (
                    <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
                      <div className='text-center p-2 bg-gray-800 rounded-lg border border-gray-600'>
                        <div className='font-bold text-purple-400 text-lg'>{account.robux}</div>
                        <div className='text-gray-400'>Robux</div>
                      </div>
                      <div className='text-center p-2 bg-gray-800 rounded-lg border border-gray-600'>
                        <div className='font-bold text-purple-400 text-lg'>{account.games}</div>
                        <div className='text-gray-400'>Games</div>
                      </div>
                    </div>
                  )}

                  {/* Minecraft Stats */}
                  {account.version !== undefined && (
                    <div className='mb-4'>
                      <p className='text-sm text-gray-400 mb-2'>Version:</p>
                      <span className='bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600'>
                        {account.version}
                      </span>
                    </div>
                  )}

                  <div className='space-y-3'>
                    <a
                      href={`/acc/?id=${account.id}`}
                      className='block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium text-center shadow-lg hover:shadow-blue-500/25'
                    >
                      <Icon icon='mdi:eye' className='inline mr-2' />
                      View Details
                    </a>

                    <div className='flex space-x-2'>
                      <button
                        onClick={() => addToCart(account)}
                        className='flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium text-center shadow-lg hover:shadow-green-500/25'
                      >
                        <Icon icon='mdi:cart-plus' className='inline mr-2' />
                        <span className='hidden sm:inline'>Add to Cart</span>
                        <span className='sm:hidden'>Cart</span>
                      </button>

                      <button
                        onClick={() => setPaymentModal({ isOpen: true, item: account })}
                        className='flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium text-center shadow-lg hover:shadow-purple-500/25'
                      >
                        <Icon icon='mdi:credit-card' className='inline mr-2' />
                        <span className='hidden sm:inline'>Buy Now</span>
                        <span className='sm:hidden'>Buy</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Empty State - Show only for non-Steam, non-Fortnite, non-MiHoYo, non-Riot, non-Telegram, non-Supercell, and non-Origin categories */}
        {selectedCategory !== 'Steam' &&
          selectedCategory !== 'Fortnite' &&
          !isMiHoyoCategory(selectedCategory) &&
          !isRiotCategory(selectedCategory) &&
          !isTelegramCategory(selectedCategory) &&
          !isSupercellCategory(selectedCategory) &&
          !isOriginCategory(selectedCategory) &&
          !loading &&
          !error &&
          filteredAccounts.length === 0 && (
            <div className='text-center py-12'>
              <p className='text-gray-400 text-lg'>No accounts found for {selectedCategory}</p>
              <button
                onClick={refreshAccounts}
                className='mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors'
              >
                Refresh
              </button>
            </div>
          )}
      </main>

      {/* Footer */}
      <footer className='bg-gray-900/90 backdrop-blur-sm border-t border-gray-700 text-white py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Main Content */}
          <div className='text-center mb-8'>
            <h2 className='text-3xl font-bold bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent mb-4'>
              Senjagames.id
            </h2>
            <p className='text-lg text-gray-300 max-w-3xl mx-auto'>
              Marketplace Akun Terlengkap dan Berkualitas dengan Harga Termurah, Pembelian Instant
              dan Transaksi yang Aman!
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            {/* Information */}
            <div className='bg-gray-800/50 rounded-xl p-6 border border-gray-700'>
              <h4 className='text-lg font-semibold mb-4 text-purple-400 flex items-center'>
                <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  />
                </svg>
                Informasi
              </h4>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <a href='#' className='hover:text-purple-400 transition-colors flex items-center'>
                    📋 Terms and Conditions
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-purple-400 transition-colors flex items-center'>
                    📖 Panduan Pembelian Akun
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-purple-400 transition-colors flex items-center'>
                    🔧 Technical Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media & Ecommerce */}
            <div className='bg-gray-800/50 rounded-xl p-6 border border-gray-700'>
              <h4 className='text-lg font-semibold mb-4 text-red-400 flex items-center'>
                <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z'
                    clipRule='evenodd'
                  />
                </svg>
                Social Media & Ecommerce
              </h4>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <a
                    href='https://instagram.com/senjagames'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:text-red-400 transition-colors flex items-center'
                  >
                    <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                    </svg>
                    Instagram.com/senjagames
                  </a>
                </li>
                <li>
                  <a
                    href='https://tiktok.com/senjagamesofficial'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:text-red-400 transition-colors flex items-center'
                  >
                    <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z' />
                    </svg>
                    tiktok.com/senjagamesofficial
                  </a>
                </li>
                <li>
                  <a
                    href='https://shopee.co.id/senjagamesofficialstore'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:text-red-400 transition-colors flex items-center'
                  >
                    <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
                    </svg>
                    Shopee Official Store
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Support */}
            <div className='bg-gray-800/50 rounded-xl p-6 border border-gray-700'>
              <h4 className='text-lg font-semibold mb-4 text-green-400 flex items-center'>
                <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z'
                    clipRule='evenodd'
                  />
                </svg>
                Contact Support
              </h4>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <a
                    href='https://wa.me/0811865658'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:text-green-400 transition-colors flex items-center'
                  >
                    <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.109' />
                    </svg>
                    WhatsApp (0811865658)
                  </a>
                </li>
                <li>
                  <a
                    href='https://t.me/mgissella'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:text-green-400 transition-colors flex items-center'
                  >
                    <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
                    </svg>
                    Telegram (mgissella)
                  </a>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div className='bg-gray-800/50 rounded-xl p-6 border border-gray-700'>
              <h4 className='text-lg font-semibold mb-4 text-blue-400 flex items-center'>
                <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
                </svg>
                Community
              </h4>
              <div className='text-gray-400'>
                <a
                  href='https://t.me/addlist/cCjGFpggJHNlY2Q1'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-blue-400 transition-colors flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600'
                >
                  <svg className='w-5 h-5 mr-3' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
                  </svg>
                  <div>
                    <div className='font-semibold'>Join Telegram Community</div>
                    <div className='text-xs text-gray-500'>Get updates & support</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className='border-t border-gray-700 mt-8 pt-8 text-center'>
            <p className='text-gray-400'>
              &copy; 2025 <span className='text-purple-400 font-semibold'>Senjagames.id</span>. All
              rights reserved.
            </p>
            <p className='text-sm text-gray-500 mt-2'>
              Marketplace Akun Gaming Terpercaya di Indonesia
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Modal */}
      <CartModal isOpen={cartModalOpen} onClose={() => setCartModalOpen(false)} />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, item: null })}
        item={paymentModal.item}
        quantity={1}
      />
    </div>
  )
}

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/acc' element={<AccountDetailPage />} />
        <Route path='/minecraft' element={<MinecraftPage />} />
        {/* Commented out - not in 12 chosen categories */}
        {/* <Route path='/escapefromtarkov' element={<EscapeFromTarkovPage />} /> */}
        <Route path='/uplay' element={<UplayPage />} />
        {/* Commented out - not in 12 chosen categories */}
        {/* <Route path='/discord' element={<DiscordPage />} /> */}
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </CartProvider>
  )
}

export default App
