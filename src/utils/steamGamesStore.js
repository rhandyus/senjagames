// Shared Steam games data store to prevent multiple simultaneous API calls
import steamGamesData from '../assets/steam-game.json'
import { rateLimitedFetch } from './apiRateLimit'

class SteamGamesStore {
  constructor() {
    this.games = [] // Initialize with empty array instead of null
    this.loading = false
    this.error = null
    this.listeners = new Set()
    this.lastFetch = 0
    this.CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  }

  // Subscribe to changes
  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // Notify all listeners
  notify() {
    this.listeners.forEach(callback => callback({
      games: this.games,
      loading: this.loading,
      error: this.error
    }))
  }

  // Get current state
  getState() {
    return {
      games: this.games,
      loading: this.loading,
      error: this.error
    }
  }

  // Load games with deduplication
  async loadGames(forceRefresh = false) {
    // If we have fresh data and not forcing refresh, return it
    if (!forceRefresh && this.games && this.games.length > 0 && (Date.now() - this.lastFetch < this.CACHE_DURATION)) {
      return this.games
    }

    // If already loading, wait for it to complete
    if (this.loading) {
      return new Promise((resolve) => {
        const unsubscribe = this.subscribe((state) => {
          if (!state.loading) {
            unsubscribe()
            resolve(state.games)
          }
        })
      })
    }

    // Start loading
    this.loading = true
    this.error = null
    this.notify()

    try {
      console.log('🎮 Loading Steam games from API...')
      const response = await rateLimitedFetch('/api/lzt/steam/games')

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const gamesData = await response.json()

      // Handle rate-limited responses
      if (gamesData.error === 'rate_limited') {
        throw new Error('API rate limited')
      }

      // Transform API response to expected format
      const gamesArray = Object.entries(gamesData)
        .filter(([id, game]) => game && typeof game === 'object')
        .map(([id, game]) => ({
          id: parseInt(id),
          value: id,
          label: game.name || game.title || `Game ${id}`,
          name: game.name || game.title || `Game ${id}`,
          title: game.name || game.title || `Game ${id}`
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      this.games = gamesArray
      this.lastFetch = Date.now()
      this.loading = false
      this.error = null

      console.log(`✅ Steam games loaded: ${gamesArray.length} games`)
      this.notify()

      return this.games

    } catch (error) {
      console.warn('⚠️ Failed to load Steam games from API, using fallback:', error.message)

      // Use local fallback data
      const fallbackGames = steamGamesData.games.map(game => ({
        id: parseInt(game.app_id),
        value: game.app_id.toString(),
        label: game.title,
        name: game.title,
        title: game.title
      }))

      this.games = fallbackGames
      this.lastFetch = Date.now()
      this.loading = false
      this.error = error.message

      console.log(`📁 Using local Steam games fallback: ${fallbackGames.length} games`)
      this.notify()

      return this.games
    }
  }

  // Clear cache
  clearCache() {
    this.games = null
    this.lastFetch = 0
    this.error = null
    console.log('🧹 Steam games cache cleared')
  }
}

// Export singleton instance
export const steamGamesStore = new SteamGamesStore()

// React hook to use the store
import { useEffect, useState } from 'react'

export function useSteamGames(autoLoad = true) {
  const [state, setState] = useState(steamGamesStore.getState())

  useEffect(() => {
    // Subscribe to store changes
    const unsubscribe = steamGamesStore.subscribe(setState)

    // Auto-load games if requested
    if (autoLoad && (!state.games || state.games.length === 0) && !state.loading) {
      steamGamesStore.loadGames()
    }

    return unsubscribe
  }, [autoLoad, state.games, state.loading])

  return {
    ...state,
    refresh: () => steamGamesStore.loadGames(true),
    clearCache: () => steamGamesStore.clearCache()
  }
}

export default steamGamesStore
