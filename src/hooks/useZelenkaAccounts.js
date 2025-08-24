import { useState, useEffect } from 'react'
import ZelenkaAPI from '../services/zelenkaAPI'

export const useZelenkaAccounts = () => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('Steam')
  const [connectionTested, setConnectionTested] = useState(false)
  const [steamFilters, setSteamFilters] = useState({}) // Add Steam filters state

  const api = new ZelenkaAPI()

  // Test API connection on first load
  const testConnection = async () => {
    if (connectionTested) return

    setConnectionTested(true)
    try {
      const result = await api.testConnection()
      // Connection test completed silently
    } catch (error) {
      // Connection test failed silently
    }
  }

  // Transform API data to match our current account structure
  const transformAccountData = apiAccount => {
    // Handle different API response structures
    const accountData = apiAccount.account || apiAccount

    // Extract nested data safely
    const steamData = accountData.steam_data || accountData
    const sellerData = accountData.seller || {}

    // Format last seen date
    const formatLastSeen = timestamp => {
      if (!timestamp) return 'Unknown'
      try {
        const date = new Date(timestamp * 1000) // Convert Unix timestamp
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch {
        return 'Unknown'
      }
    }

    // Format account status
    const getAccountStatus = status => {
      if (!status) return 'Unknown'
      switch (status) {
        case 'online':
          return 'Online'
        case 'offline':
          return 'Offline'
        case 'away':
          return 'Away'
        case 'busy':
          return 'Busy'
        case 'snooze':
          return 'Snooze'
        case 'looking_to_trade':
          return 'Looking to Trade'
        case 'looking_to_play':
          return 'Looking to Play'
        default:
          return status.charAt(0).toUpperCase() + status.slice(1)
      }
    }

    // Extract country information
    const getCountryInfo = data => {
      return (
        data.country ||
        data.location_country ||
        steamData.country ||
        steamData.location_country ||
        'Unknown'
      )
    }

    // Create base account object
    const baseAccount = {
      id: accountData.item_id || accountData.id || Math.random().toString(36),
      item_id: accountData.item_id || accountData.id,
      price:
        typeof accountData.price === 'number'
          ? accountData.price
          : parseFloat(accountData.price) || 0,
      priceWithSellerFeeLabel:
        accountData.priceWithSellerFeeLabel || `$${accountData.price || '0.00'}`,
      type: selectedCategory,
      title:
        accountData.title ||
        accountData.title_en ||
        getAccountStatus(steamData.status || steamData.account_status) ||
        'Account',
      title_en: accountData.title_en || accountData.title,
      item_state: accountData.item_state || 'active',
      lastSeen:
        formatLastSeen(steamData.last_seen || steamData.last_online || steamData.last_logoff) ||
        accountData.last_seen ||
        'Unknown',
      country: getCountryInfo(accountData),
      description: accountData.description || '',
      hasWarranty: (accountData.warranty_days || 0) > 0,
      warranty: accountData.warranty_days ? `${accountData.warranty_days} days` : null,
      guarantee: accountData.guarantee || { durationPhrase: '24 hours' },
      seller: {
        username: sellerData.username || sellerData.name || accountData.seller || 'Unknown',
        sold_items_count: sellerData.sold_items_count || sellerData.sales_count || 0,
        restore_percents: sellerData.restore_percents || sellerData.rating || 95
      }
    }

    // Add Steam-specific fields if this is a Steam account
    if (selectedCategory === 'Steam') {
      return {
        ...baseAccount,
        // Steam-specific timestamps
        account_last_activity:
          accountData.account_last_activity || steamData.last_seen || steamData.last_online,
        steam_last_activity:
          accountData.account_last_activity || steamData.last_seen || steamData.last_online,

        // Steam account details
        steam_country: accountData.steam_country || steamData.country || accountData.country,
        steam_level: accountData.steam_level || steamData.level || 0,
        steam_game_count: accountData.steam_game_count || steamData.games_count || 0,
        steam_friend_count: accountData.steam_friend_count || steamData.friends_count || 0,
        steam_balance: accountData.steam_balance || steamData.balance || '$0.00',
        steam_inv_value: accountData.steam_inv_value || steamData.inventory_value || 0,
        steam_mfa: accountData.steam_mfa !== undefined ? accountData.steam_mfa : true,
        steam_is_limited:
          accountData.steam_is_limited !== undefined ? accountData.steam_is_limited : false,
        steam_market: accountData.steam_market !== undefined ? accountData.steam_market : true,
        steam_community_ban:
          accountData.steam_community_ban !== undefined ? accountData.steam_community_ban : false,
        steam_bans: accountData.steam_bans || steamData.bans || 'None',

        // Email and security info
        email_provider: accountData.email_provider || 'unknown',
        item_domain: accountData.item_domain || 'unknown.com',
        item_origin: accountData.item_origin || 'unknown',

        // Games data - this is crucial for displaying games
        steam_full_games: accountData.steam_full_games || {
          list: {},
          total: 0
        },

        // Additional Steam fields for compatibility
        steamId: steamData.steam_id || steamData.steamid,
        level: accountData.steam_level || steamData.level || 0,
        games: steamData.games || steamData.owned_games || [],
        gamesCount:
          accountData.steam_game_count || steamData.games_count || (steamData.games || []).length,
        inventoryValue:
          accountData.steam_inv_value ||
          steamData.inventory_value ||
          steamData.inventory_worth ||
          0,
        marketValue: steamData.market_value || steamData.market_worth || 0,
        hasEmail: accountData.with_email || accountData.email_access || false,
        hasEmailChanges: steamData.email_changes || false,
        vacBanned: steamData.vac_banned || accountData.steam_bans === 'VAC',
        communityBanned: steamData.community_banned || accountData.steam_community_ban,
        tradeBanned: steamData.trade_banned || false,
        accountAge: steamData.account_age || steamData.created,
        totalHours: steamData.total_hours || steamData.hours_played || 0,
        views: accountData.views || 0
      }
    }

    // For non-Steam accounts, add category-specific data
    return {
      ...baseAccount,
      ...transformCategorySpecificData(apiAccount, selectedCategory)
    }
  }

  // Transform category-specific data
  const transformCategorySpecificData = (apiAccount, category) => {
    switch (category) {
      case 'Steam':
        return {
          games: apiAccount.games || [],
          level: apiAccount.level || 0
        }
      case 'Fortnite':
        return {
          level: apiAccount.level || 0,
          skins: apiAccount.skins_count || 0,
          vbucks: apiAccount.vbucks || 0
        }
      case 'Discord':
        return {
          chats: apiAccount.chats_count || 0,
          channels: apiAccount.channels_count || 0,
          conversations: apiAccount.conversations_count || 0,
          contacts: apiAccount.contacts_count || 0
        }
      case 'Instagram':
        return {
          followers: apiAccount.followers_count || 0,
          following: apiAccount.following_count || 0,
          posts: apiAccount.posts_count || 0
        }
      case 'Telegram':
        return {
          chats: apiAccount.chats_count || 0,
          channels: apiAccount.channels_count || 0,
          conversations: apiAccount.conversations_count || 0,
          contacts: apiAccount.contacts_count || 0
        }
      default:
        return {}
    }
  }

  // Fetch accounts for selected category
  const fetchAccounts = async (category, filters = {}) => {
    setLoading(true)
    setError(null)

    try {
      let response

      // Use appropriate API method based on category
      switch (category) {
        case 'Steam':
          // Set default Steam filters for initial load to ensure we get accounts with games
          const defaultSteamFilters = {
            'game[]': [578080], // PUBG - popular game to ensure accounts have games
            order_by: 'price_to_up', // Show cheapest first
            page: 1
          }

          // Merge default parameters with filters for Steam
          // If no specific filters provided (initial load), use default PUBG filter
          const steamParams =
            Object.keys(filters).length === 0 && Object.keys(steamFilters).length === 0
              ? defaultSteamFilters
              : { ...filters, ...steamFilters }

          // Try multi-page fetch for Steam to get more results
          try {
            response = await api.getSteamAccountsMultiplePages(steamParams, 3) // Fetch up to 3 pages
          } catch (multiPageError) {
            response = await api.getSteamAccounts(steamParams)
          }
          break
        case 'Fortnite':
          response = await api.searchFortniteAccounts(filters)
          break
        case 'Discord':
          response = await api.searchDiscordAccounts(filters)
          break
        case 'Instagram':
          response = await api.searchInstagramAccounts(filters)
          break
        case 'Telegram':
          response = await api.searchTelegramAccounts(filters)
          break
        default:
          // For other categories, try generic search or fallback to latest accounts
          response = await api.getLatestAccounts()
          break
      }

      // Transform the API response to match our structure
      if (response && response.items) {
        const transformedAccounts = response.items.map(transformAccountData)

        // Filter accounts that have games for Steam category
        if (category === 'Steam') {
          const accountsWithGames = transformedAccounts.filter(account => {
            const hasGames =
              account.steam_full_games?.list &&
              Object.keys(account.steam_full_games.list).length > 0
            return hasGames
          })

          setAccounts(accountsWithGames)
        } else {
          setAccounts(transformedAccounts)
        }
      } else if (response && Array.isArray(response)) {
        const transformedAccounts = response.map(transformAccountData)
        setAccounts(transformedAccounts)
      } else {
        setAccounts([])
      }
    } catch (err) {
      setError(err.message)
      setAccounts([]) // Show empty state on error, no mock data fallback
    } finally {
      setLoading(false)
    }
  }

  // Effect to test connection and fetch accounts when category changes
  useEffect(() => {
    const initializeAndFetch = async () => {
      await testConnection()
      if (selectedCategory) {
        fetchAccounts(selectedCategory)
      }
    }

    initializeAndFetch()
  }, [selectedCategory])

  // Function to change category and fetch new data
  const changeCategory = category => {
    setSelectedCategory(category)
  }

  // Function to update Steam filters and re-fetch data
  const updateSteamFilters = filters => {
    setSteamFilters(filters)
    if (selectedCategory === 'Steam') {
      fetchAccounts('Steam', filters)
    }
  }

  // Function to manually refresh accounts
  const refreshAccounts = () => {
    if (selectedCategory) {
      fetchAccounts(selectedCategory, selectedCategory === 'Steam' ? steamFilters : {})
    }
  }

  return {
    accounts,
    loading,
    error,
    selectedCategory,
    changeCategory,
    refreshAccounts,
    updateSteamFilters // Add the new function to the return
  }
}
