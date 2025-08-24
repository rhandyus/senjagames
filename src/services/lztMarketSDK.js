// Official LZT Market SDK service
// Official LZT Market SDK service
import lztMarket from '../../.api/apis/lzt-market/index.js'

class LZTMarketSDK {
  constructor() {
    // Get token from environment
    this.token = import.meta.env.VITE_ZELENKA_TOKEN

    // Initialize SDK
    this.sdk = lztMarket

    // Configure authentication
    if (this.token) {
      this.sdk.auth(this.token)
    }

    // Configure server
    this.sdk.server('https://prod-api.lzt.market')
  }

  /**
   * Get Steam games list using official SDK
   * @returns {Promise<Array>} Array of games with {value, label} format
   */
  async getSteamGames() {
    try {
      const response = await this.sdk.categoryGames({
        categoryName: 'steam'
      })

      // Extract games from response
      if (response && response.data && response.data.games) {
        // Convert object to array format
        const gamesObject = response.data.games
        const gamesArray = Object.entries(gamesObject).map(([gameId, gameName]) => ({
          value: gameId.toString(),
          label: gameName
        }))

        return gamesArray
      } else {
        console.warn('Unexpected response format from LZT Market API:', response)
        throw new Error('Invalid response format from LZT Market API')
      }
    } catch (error) {
      console.error('Error fetching Steam games from LZT Market API:', error)
      throw error
    }
  }

  /**
   * Get games for any category
   * @param {string} categoryName - Category name (e.g., 'steam', 'epic-games', etc.)
   * @returns {Promise<Array>} Array of games with {value, label} format
   */
  async getCategoryGames(categoryName) {
    try {
      const response = await this.sdk.categoryGames({
        categoryName: categoryName
      })

      // Extract games from response
      if (response && response.data && response.data.games) {
        const gamesObject = response.data.games
        const gamesArray = Object.entries(gamesObject).map(([gameId, gameName]) => ({
          value: gameId.toString(),
          label: gameName
        }))

        return gamesArray
      } else {
        console.warn(
          `Unexpected response format from LZT Market API for ${categoryName}:`,
          response
        )
        throw new Error(`Invalid response format from LZT Market API for ${categoryName}`)
      }
    } catch (error) {
      console.error(`Error fetching ${categoryName} games from LZT Market API:`, error)
      throw error
    }
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} True if API is working
   */
  async testConnection() {
    try {
      const response = await this.sdk.categoryGames({
        categoryName: 'steam'
      })
      return !!(response && response.data)
    } catch (error) {
      console.error('LZT Market API connection test failed:', error)
      return false
    }
  }
}

export default LZTMarketSDK
